import { scoreArticleQuality } from "./article-quality.js";
import { nicheConfig } from "./niche-config.js";

export const keywordPlan = nicheConfig.keywordPlans;

export const labels = {
  product: nicheConfig.productLabels,
  category: nicheConfig.categoryLabels,
};

const imageByProduct = {
  hub: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1400&q=82",
  lock: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1400&q=82",
  curtain: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1400&q=82",
  sensor: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1400&q=82",
  camera: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=1400&q=82",
  plug: "https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&w=1400&q=82",
};

export function buildDummyArticle(existingArticles, keywordCandidate = null, officialContext = null) {
  const fallbackPlan = keywordPlan[existingArticles.length % keywordPlan.length];
  const keywordPlanItem = keywordCandidate?.keyword ? buildPlanFromKeyword(keywordCandidate.keyword, fallbackPlan) : fallbackPlan;
  const serial = existingArticles.length + 1;
  const now = new Date();
  const productName = labels.product[keywordPlanItem.product] || nicheConfig.generation.fallbackProductName;
  const categoryName = labels.category[keywordPlanItem.category] || nicheConfig.generation.defaultCategory;
  const title = buildTitle(keywordPlanItem, serial);
  const buyingGuide = buildBuyingGuide(keywordPlanItem, productName);

  const article = {
    id: `article-${now.getTime()}`,
    slug: `${keywordPlanItem.slugBase}-${serial}`,
    title,
    excerpt: buildExcerpt(keywordPlanItem, productName),
    keyword: keywordPlanItem.keyword,
    category: keywordPlanItem.category,
    product: keywordPlanItem.product,
    intent: keywordPlanItem.intent,
    keywordSource: keywordCandidate?.source || "fallback",
    keywordMetrics: keywordCandidate?.metrics || null,
    officialSourceSite: officialContext?.sourceSite || null,
    officialSourceFetchedAt: officialContext?.fetchedAt || null,
    officialSources: officialContext?.sources || [],
    imagePrompt: `${nicheConfig.generation.imagePrompt} Article keyword: ${keywordPlanItem.keyword}.`,
    imageUrl: imageByProduct[keywordPlanItem.product] || imageByProduct.hub,
    publishedAt: now.toISOString(),
    readingMinutes: 6,
    verdict: buildVerdict(keywordPlanItem, productName),
    buyingGuide,
    affiliateCta: buildAffiliateCta(keywordPlanItem, productName),
    blocks: buildArticleBlocks(keywordPlanItem, productName, categoryName, buyingGuide, officialContext),
  };

  return attachQuality(article);
}

export function applyGeneratedArticleContent(article, generatedContent) {
  if (!generatedContent || generatedContent.source !== "claude") {
    return attachQuality(article);
  }

  return attachQuality({
    ...article,
    title: generatedContent.title || article.title,
    excerpt: generatedContent.excerpt || article.excerpt,
    verdict: generatedContent.verdict || article.verdict,
    buyingGuide: generatedContent.buyingGuide || article.buyingGuide,
    affiliateCta: generatedContent.affiliateCta
      ? { ...article.affiliateCta, ...generatedContent.affiliateCta, url: article.affiliateCta?.url || generatedContent.affiliateCta.url }
      : article.affiliateCta,
    blocks: generatedContent.blocks?.length ? generatedContent.blocks : article.blocks,
    articleSource: "claude",
  });
}

function buildTitle(item, serial) {
  const suffix = `テスト記事 ${serial}`;
  if (item.category === "review") return `${item.keyword}｜買う前に確認したいメリット・注意点 ${suffix}`;
  if (item.category === "compare") return `${item.keyword}｜どちらを選ぶべきか結論から整理 ${suffix}`;
  if (item.category === "trouble") return `${item.keyword}時の確認手順と買い替え判断 ${suffix}`;
  if (item.category === "recommend") return `${item.keyword}｜目的別に選ぶならどれか ${suffix}`;
  return `${item.keyword}の設定方法｜つまずきやすい点まで整理 ${suffix}`;
}

function buildExcerpt(item, productName) {
  if (item.category === "trouble") {
    return `${item.keyword}で困っている人向けに、まず試す確認手順と、改善しない場合に検討したい${productName}まわりの選択肢を整理します。`;
  }
  if (item.category === "compare") {
    return `${item.keyword}で迷っている人向けに、価格だけでなく使い方・拡張性・連携のしやすさから選び方を整理します。`;
  }
  return `${productName}を検討している人向けに、買う前の判断材料、注意点、公式ストアで確認すべきポイントを短く整理します。`;
}

function buildVerdict(item, productName) {
  if (item.category === "trouble") {
    return `まず設定と通信環境を確認し、それでも改善しない場合は${productName}の設置場所や上位機種への見直しを検討するのが現実的です。`;
  }
  if (item.category === "compare") {
    return `迷ったら、今後ほかの${nicheConfig.brandName}製品も増やす予定があるかで選ぶと失敗しにくいです。拡張性を重視する人は上位構成を優先してください。`;
  }
  if (item.category === "howto") {
    return `${productName}は初期設定でつまずくと評価が下がりやすい製品です。購入前に連携先と設置環境を確認しておくと満足度が上がります。`;
  }
  return `${productName}は便利さが分かりやすい一方で、設置環境との相性が満足度を左右します。買う前に用途と連携先を決めておくのがおすすめです。`;
}

function buildBuyingGuide(item, productName) {
  return {
    bestFor: [
      `家の操作をスマホや音声操作にまとめたい人`,
      `${productName}を中心に${nicheConfig.brandName}製品を増やしたい人`,
      `設定後の手間を減らして毎日の操作を自動化したい人`,
    ],
    checkPoints: [
      "設置場所の通信環境に無理がないか",
      "Alexa、Googleホーム、Siriなど使いたい連携先に対応しているか",
      "公式ストアのセット割やセール対象になっているか",
      `今後追加したい${nicheConfig.brandName}製品と組み合わせやすいか`,
    ],
    cautions: [
      "賃貸では取り付け方法と原状回復のしやすさを確認する",
      "トラブル解決目的だけで買い替える前に、電池・距離・Wi-Fi設定を確認する",
    ],
  };
}

function buildAffiliateCta(item, productName) {
  return {
    headline: `${productName}の価格とセット割を公式ストアで確認`,
    body: `${item.keyword}を検討しているなら、購入前に公式ストアのセール、セット割、在庫、保証条件を確認しておくと判断しやすくなります。`,
    buttonText: nicheConfig.affiliate.buttonText,
    url: process.env[nicheConfig.affiliate.fallbackUrlEnv] || nicheConfig.affiliate.fallbackUrl,
  };
}

function buildArticleBlocks(item, productName, categoryName, buyingGuide, officialContext) {
  const sourceBlock = buildOfficialSourceBlock(officialContext);

  return [
    {
      heading: `結論：${item.keyword}はどんな人に向くか`,
      paragraphs: [
        `${categoryName}記事で最初に見るべきなのは、細かな機能よりも「自分の家で使ったときに便利になるか」です。${productName}は設置場所、連携先、今後増やしたい製品によって満足度が変わります。`,
        `この記事では、買う前に確認したいポイントを先に整理し、興味が高まったタイミングで公式ストアへ移動できる導線を置いています。`,
      ],
    },
    {
      heading: "買う前に確認したいポイント",
      paragraphs: [
        buyingGuide.checkPoints.map((point) => `・${point}`).join("\n"),
        `特に${productName}は、単体で使うよりもハブや音声アシスタント、ほかの${nicheConfig.brandName}製品と組み合わせたときに価値が出やすいです。今の悩みだけでなく、半年後に増やしたい自動化まで想像して選ぶと失敗しにくくなります。`,
      ],
    },
    sourceBlock,
    {
      heading: "注意点：購入後に後悔しやすいところ",
      paragraphs: [
        buyingGuide.cautions.map((point) => `・${point}`).join("\n"),
        `トラブル解決系のキーワードで来た場合は、すぐに買い替えへ進むより、まず設定・電源・通信距離を確認するのが先です。そのうえで改善しないなら、上位機種やセット購入を検討する流れが自然です。`,
      ],
    },
    {
      heading: "次に読むべき記事",
      paragraphs: [
        `この記事だけで決めきれない場合は、同じ${productName}カテゴリの記事、比較記事、設定方法の記事を続けて読むと判断しやすくなります。`,
        "レビュー記事で購入意欲を高め、比較記事で迷いを減らし、使い方記事で購入後の不安を消す流れを作ることで、サイト全体の成約率を高めます。",
      ],
    },
  ].filter(Boolean);
}

function buildOfficialSourceBlock(officialContext) {
  const sources = officialContext?.sources || [];
  if (!sources.length) {
    return {
      heading: "公式情報の確認状況",
      paragraphs: [
        nicheConfig.generation.noSourceMessage,
      ],
    };
  }

  return {
    heading: `${nicheConfig.generation.sourceName}で確認できた情報`,
    paragraphs: [
      sources
        .slice(0, 3)
        .map((source) => `・${source.title}\n${source.facts.slice(0, 2).join(" ")}`)
        .join("\n"),
      "上記の公式情報を前提に、本文では製品仕様を断定しすぎず、購入前に公式ストアの最新情報も確認する流れにしています。",
    ],
  };
}

function attachQuality(article) {
  const quality = scoreArticleQuality(article);
  return {
    ...article,
    quality,
  };
}

function buildPlanFromKeyword(keyword, fallbackPlan) {
  const category = inferCategory(keyword, fallbackPlan.category);
  const product = inferProduct(keyword, fallbackPlan.product);
  const intent = inferIntent(keyword, fallbackPlan.intent);
  return { keyword, category, product, intent, slugBase: toAsciiSlug(keyword, fallbackPlan.slugBase) };
}

function inferCategory(keyword, fallback) {
  if (hasAny(keyword, ["比較", "違い", "どっち"])) return "compare";
  if (hasAny(keyword, ["設定", "使い方", "連携", "登録"])) return "howto";
  if (hasAny(keyword, ["できない", "反応しない", "トラブル", "つながらない"])) return "trouble";
  if (keyword.includes("おすすめ")) return "recommend";
  if (hasAny(keyword, ["レビュー", "口コミ", "評判"])) return "review";
  return fallback;
}

function inferProduct(keyword, fallback) {
  if (hasAny(keyword, ["ロック", "スマートロック"])) return "lock";
  if (keyword.includes("カーテン")) return "curtain";
  if (hasAny(keyword, ["温湿度", "センサー"])) return "sensor";
  if (keyword.includes("カメラ")) return "camera";
  if (keyword.includes("プラグ")) return "plug";
  if (hasAny(keyword, ["ハブ", "Hub", "hub"])) return "hub";
  return fallback;
}

function inferIntent(keyword, fallback) {
  if (hasAny(keyword, ["接続できない", "つながらない"])) return "connection";
  if (hasAny(keyword, ["Alexa", "アレクサ"])) return "alexa";
  if (keyword.includes("Google")) return "google-home";
  if (keyword.includes("反応しない")) return "no-response";
  if (keyword.includes("設定")) return "setup";
  if (hasAny(keyword, ["比較", "違い", "どっち"])) return "comparison";
  if (hasAny(keyword, ["レビュー", "おすすめ", "口コミ"])) return "purchase";
  return fallback;
}

function toAsciiSlug(keyword, fallback) {
  const normalized = keyword.toLowerCase();
  const tokens = [nicheConfig.id];
  if (hasAny(normalized, ["ハブ2", "hub2"])) tokens.push("hub2");
  else if (hasAny(normalized, ["ハブ", "hub"])) tokens.push("hub");
  if (hasAny(normalized, ["ミニ", "mini"])) tokens.push("mini");
  if (hasAny(normalized, ["ロック", "lock"])) tokens.push("lock");
  if (hasAny(normalized, ["カーテン", "curtain"])) tokens.push("curtain");
  if (hasAny(normalized, ["温湿度", "sensor"])) tokens.push("sensor");
  if (hasAny(normalized, ["カメラ", "camera"])) tokens.push("camera");
  if (hasAny(normalized, ["プラグ", "plug"])) tokens.push("plug");
  if (hasAny(normalized, ["レビュー", "review"])) tokens.push("review");
  if (hasAny(normalized, ["比較", "違い", "compare"])) tokens.push("comparison");
  if (hasAny(normalized, ["設定", "使い方", "setup"])) tokens.push("setup");
  if (hasAny(normalized, ["接続できない", "つながらない"])) tokens.push("connection-trouble");
  if (normalized.includes("反応しない")) tokens.push("no-response");
  if (normalized.includes("おすすめ")) tokens.push("recommend");
  return [...new Set(tokens)].join("-") || fallback;
}

function hasAny(value, needles) {
  return needles.some((needle) => value.includes(needle));
}
