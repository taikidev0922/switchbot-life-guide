import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { applyGeneratedArticleContent, buildDummyArticle } from "../../../../lib/article-generator";
import { appendArticle, readArticles } from "../../../../lib/articles-store";
import { generateArticleWithClaude } from "../../../../lib/claude-articles";
import { markKeywordUsedForArticle, selectKeywordForArticle } from "../../../../lib/keyword-store";
import { generateImageWithOpenAI } from "../../../../lib/openai-images";
import { getPipelineConfig } from "../../../../lib/pipeline-mode";
import { fetchOfficialProductContext } from "../../../../lib/official-sources";
import { fetchRelatedXPosts } from "../../../../lib/x-posts";

export async function GET(request) {
  return publishDummyArticle(request);
}

export async function POST(request) {
  return publishDummyArticle(request);
}

async function publishDummyArticle(request) {
  const expectedSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pipeline = getPipelineConfig();
    const existingArticles = await readArticles();
    const targetArticleCount = Number(process.env.BOOTSTRAP_TARGET_ARTICLE_COUNT || 0);

    if (targetArticleCount > 0 && existingArticles.length >= targetArticleCount) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: "target-article-count-reached",
        mode: pipeline.mode,
        totalArticles: existingArticles.length,
        targetArticleCount,
        nextStep: "Set BOOTSTRAP_TARGET_ARTICLE_COUNT to 0 and change the cron schedule for daily production publishing.",
      });
    }

    const keywordCandidate = await selectKeywordForArticle(existingArticles);
    const officialContext = await fetchOfficialProductContext(keywordCandidate);
    const xPostContext = await fetchRelatedXPosts(keywordCandidate, pipeline);
    const baseArticle = buildDummyArticle(existingArticles, keywordCandidate, officialContext);
    const generatedContent = await generateArticleWithClaude(keywordCandidate, existingArticles, officialContext);
    let article = applyGeneratedArticleContent({
      ...baseArticle,
      xPosts: xPostContext.posts || [],
      xPostSearchStatus: xPostContext.status,
      xPostConsumedReads: xPostContext.consumedReads || 0,
    }, generatedContent);
    const generatedImage = await generateImageWithOpenAI(article);
    const qualityScore = article.quality?.score || 0;
    const minimumQualityScore = Number(process.env.MIN_ARTICLE_QUALITY_SCORE || 70);

    if (pipeline.mode === "production" && qualityScore < minimumQualityScore) {
      return NextResponse.json({
        ok: false,
        skipped: true,
        reason: "article-quality-too-low",
        qualityScore,
        minimumQualityScore,
        qualityChecks: article.quality?.checks || [],
      }, { status: 422 });
    }

    if (generatedImage?.imageUrl) {
      article = {
        ...article,
        imageUrl: generatedImage.imageUrl,
        imageSource: generatedImage.source,
        imageModel: generatedImage.model,
      };
    }

    const result = await appendArticle(article);
    await markKeywordUsedForArticle(keywordCandidate, article);

    revalidatePath("/");
    revalidatePath(`/articles/${article.slug}`);

    return NextResponse.json({
      ok: true,
      mode: pipeline.mode,
      created: article,
      totalArticles: result.articles.length,
      keywordSource: keywordCandidate?.source || "fallback",
      consumedCredit: keywordCandidate?.consumedCredit || 0,
      keywordRefreshStatus: keywordCandidate?.refreshStatus || null,
      articleSource: generatedContent?.source || "fallback",
      imageSource: generatedImage?.source || "fallback",
      officialSourceCount: officialContext.sources?.length || 0,
      officialSourceCache: officialContext.cache || null,
      xPostSearchStatus: xPostContext.status,
      xPostCount: xPostContext.posts?.length || 0,
      xPostConsumedReads: xPostContext.consumedReads || 0,
      qualityScore,
      qualityChecks: article.quality?.checks || [],
      warning: keywordCandidate?.refreshWarning || generatedContent?.error || generatedImage?.error || null,
      providerConfig: {
        rakkoLive: pipeline.rakkoLive,
        claudeLive: pipeline.claudeLive,
        openaiImageLive: pipeline.openaiImageLive,
        xPostSearchLive: pipeline.xPostSearchLive,
        anthropicModel: pipeline.claudeLive ? pipeline.anthropicModel : null,
        openaiImageModel: pipeline.openaiImageLive ? pipeline.openaiImageModel : null,
      },
      nextStep: "Switch ARTICLE_PIPELINE_MODE from test to production when ready for full production behavior.",
    });
  } catch (error) {
    const status = error.code === "STORAGE_NOT_CONFIGURED" ? 503 : 500;
    return NextResponse.json({ ok: false, error: error.message }, { status });
  }
}
