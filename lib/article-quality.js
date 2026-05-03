import { nicheConfig } from "./niche-config.js";

export function scoreArticleQuality(article) {
  const checks = buildQualityChecklist(article);
  const passed = checks.filter((check) => check.passed).length;

  return {
    score: Math.round((passed / checks.length) * 100),
    checks,
  };
}

export function buildQualityChecklist(article) {
  return [
    {
      key: "search-intent",
      label: "検索意図に合うカテゴリ・製品・悩みが設定されている",
      passed: Boolean(article.category && article.product && article.intent),
    },
    {
      key: "buyer-verdict",
      label: "購入判断につながる結論がある",
      passed: Boolean(article.verdict && article.verdict.length >= 24),
    },
    {
      key: "reader-fit",
      label: "向いている人・向いていない人が分かる",
      passed: Boolean(article.buyingGuide?.bestFor?.length && article.buyingGuide?.cautions?.length),
    },
    {
      key: "decision-points",
      label: "買う前の確認ポイントが3つ以上ある",
      passed: Number(article.buyingGuide?.checkPoints?.length || 0) >= 3,
    },
    {
      key: "body-depth",
      label: "本文ブロックが3つ以上ある",
      passed: Number(article.blocks?.length || 0) >= 3,
    },
    {
      key: "cta",
      label: "CTA文言が記事内容に合わせて設定されている",
      passed: Boolean(article.affiliateCta?.headline && article.affiliateCta?.buttonText),
    },
    {
      key: "official-sources",
      label: `${nicheConfig.generation.sourceName}の参照情報が紐づいている`,
      passed: Number(article.officialSources?.length || 0) > 0,
    },
  ];
}
