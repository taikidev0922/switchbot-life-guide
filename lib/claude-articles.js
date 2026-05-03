import { getPipelineConfig } from "./pipeline-mode.js";
import { nicheConfig } from "./niche-config.js";

export async function generateArticleWithClaude(keywordCandidate, existingArticles, officialContext = null) {
  const pipeline = getPipelineConfig();

  if (!pipeline.claudeLive) return null;
  if (!process.env.ANTHROPIC_API_KEY) return null;

  const prompt = buildPrompt(keywordCandidate, existingArticles, officialContext);
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: pipeline.anthropicModel,
      max_tokens: pipeline.claudeMaxTokens,
      temperature: 0.35,
      messages: [{ role: "user", content: prompt }],
    }),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    return {
      source: "claude-error",
      error: payload?.error?.message || `Claude API failed with status ${response.status}`,
    };
  }

  const text = payload?.content?.find((part) => part.type === "text")?.text;
  const article = parseArticleJson(text);
  if (!article) {
    return {
      source: "claude-error",
      error: "Claude did not return valid article JSON.",
    };
  }

  return {
    source: "claude",
    title: cleanString(article.title, `${keywordCandidate.keyword}を購入前に確認するポイント`),
    excerpt: cleanString(
      article.excerpt,
      `${nicheConfig.generation.fallbackProductName}を購入前に確認したいポイントを実用目線で整理します。`,
      160
    ),
    verdict: cleanString(article.verdict, "", 240),
    buyingGuide: normalizeBuyingGuide(article.buyingGuide),
    affiliateCta: normalizeAffiliateCta(article.affiliateCta),
    blocks: normalizeBlocks(article.blocks),
  };
}

function buildPrompt(keywordCandidate, existingArticles, officialContext) {
  const recentTitles = existingArticles.slice(0, 5).map((article) => `- ${article.title}`).join("\n") || "- なし";
  const officialSourceText = buildOfficialSourceText(officialContext);

  return [
    nicheConfig.generation.editorRole,
    nicheConfig.generation.articleGoal,
    "出力は必ずJSONオブジェクトのみ。Markdown、説明文、コードフェンスは出力しないでください。",
    "",
    "対象キーワード:",
    keywordCandidate.keyword,
    "",
    `カテゴリ: ${keywordCandidate.category || "未分類"}`,
    `製品カテゴリ: ${keywordCandidate.product || "未分類"}`,
    `検索意図: ${keywordCandidate.intent || "未分類"}`,
    "",
    "公式情報から確認できた事実:",
    officialSourceText,
    "",
    "直近の記事タイトル:",
    recentTitles,
    "",
    "記事品質ルール:",
    "- 誇大表現を避ける",
    "- 公式情報にない細かい仕様、価格、発売日、対応規格は断定しない",
    "- 不明な点は「公式サイトで最新情報を確認してください」と書く",
    "- 購入前に確認すべき条件、向いている人、注意点を具体的にする",
    `- アフィリエイトCTAは自然に${nicheConfig.affiliate.storeName}確認へつなげる`,
    "- タイトルに「テスト記事」「ダミー」「自動生成」を入れない",
    "- 本文は日本語として自然にし、文字化けした語句を使わない",
    "",
    "JSON schema:",
    JSON.stringify({
      title: "記事タイトル。32から48文字程度",
      excerpt: "120文字以内の要約",
      verdict: "購入判断につながる結論。100から180文字程度",
      buyingGuide: {
        bestFor: ["向いている人1", "向いている人2", "向いている人3"],
        checkPoints: ["購入前チェック1", "購入前チェック2", "購入前チェック3", "購入前チェック4"],
        cautions: ["注意点1", "注意点2", "注意点3"],
      },
      affiliateCta: {
        headline: "公式サイト確認へ自然につなぐ見出し",
        body: "セール、在庫、保証、最新仕様を公式サイトで確認する理由",
        buttonText: nicheConfig.affiliate.buttonText,
      },
      blocks: [
        { heading: "見出し1", paragraphs: ["本文段落1", "本文段落2"] },
        { heading: "見出し2", paragraphs: ["本文段落1", "本文段落2"] },
        { heading: "見出し3", paragraphs: ["本文段落1", "本文段落2"] },
        { heading: "見出し4", paragraphs: ["本文段落1", "本文段落2"] },
      ],
    }),
  ].join("\n");
}

function buildOfficialSourceText(officialContext) {
  const sources = officialContext?.sources || [];
  if (!sources.length) {
    return `このキーワードに完全一致する公式情報は見つかりませんでした。仕様や価格は断定せず、${nicheConfig.affiliate.storeName}確認を促してください。`;
  }

  return sources
    .slice(0, 3)
    .map((source) => {
      const facts = (source.facts || []).slice(0, 3).join(" ");
      return `- ${source.title}\n  URL: ${source.url}\n  確認できた内容: ${facts || source.excerpt || "詳細不明"}`;
    })
    .join("\n");
}

function parseArticleJson(text) {
  if (!text) return null;
  const stripped = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  const candidates = [stripped];
  const match = stripped.match(/\{[\s\S]*\}/);
  if (match) candidates.push(match[0]);

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // Try the next candidate.
    }
  }

  return null;
}

function normalizeBuyingGuide(guide) {
  return {
    bestFor: normalizeList(guide?.bestFor, 3, 90),
    checkPoints: normalizeList(guide?.checkPoints, 4, 100),
    cautions: normalizeList(guide?.cautions, 3, 110),
  };
}

function normalizeAffiliateCta(cta) {
  return {
    headline: cleanString(cta?.headline, `${nicheConfig.affiliate.storeName}で最新情報を確認する`, 90),
    body: cleanString(
      cta?.body,
      `価格、在庫、セール、保証条件は変わることがあります。購入前に${nicheConfig.affiliate.storeName}で最新情報を確認しておくと安心です。`,
      190
    ),
    buttonText: cleanString(cta?.buttonText, nicheConfig.affiliate.buttonText, 40),
  };
}

function normalizeList(value, limit, maxLength) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(Boolean)
    .slice(0, limit)
    .map((item) => cleanString(item, "", maxLength))
    .filter(Boolean);
}

function normalizeBlocks(blocks) {
  if (!Array.isArray(blocks)) return [];
  return blocks
    .filter((block) => block?.heading && Array.isArray(block.paragraphs))
    .slice(0, 4)
    .map((block) => ({
      heading: cleanString(block.heading, "確認ポイント", 80),
      paragraphs: normalizeList(block.paragraphs, 3, 760),
    }))
    .filter((block) => block.paragraphs.length);
}

function cleanString(value, fallback, maxLength = 220) {
  if (typeof value !== "string") return fallback;
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned ? cleaned.slice(0, maxLength) : fallback;
}
