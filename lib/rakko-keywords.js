import { nicheConfig } from "./niche-config.js";

const RAKKO_API_BASE_URL = "https://api.rakkokeyword.com";
const seedKeywords = nicheConfig.rakkoSeedKeywords;

export async function fetchRakkoKeywordCandidates(existingArticles) {
  if (process.env.RAKKO_KEYWORD_LIVE !== "true") {
    return { source: "rakko-disabled", candidates: [], consumedCredit: 0 };
  }

  const apiKey = process.env.RAKKO_KEYWORD_API_KEY;
  if (!apiKey) {
    return { source: "rakko-missing-key", candidates: [], consumedCredit: 0 };
  }

  const seed = seedKeywords[existingArticles.length % seedKeywords.length];
  const response = await fetch(`${RAKKO_API_BASE_URL}/v1/suggest-keywords`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({
      keyword: seed,
      modes: ["google"],
      increaseKeyword: false,
      sortBy: "searchVolume",
      orderBy: "desc",
      limit: Number(process.env.RAKKO_KEYWORD_FETCH_LIMIT || 5),
    }),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.result) {
    return {
      source: "rakko-error",
      candidates: [],
      consumedCredit: payload?.meta?.consumedCredit || 0,
      error: payload?.errors?.join(", ") || `Rakko API failed with status ${response.status}`,
    };
  }

  const items = Array.isArray(payload.data?.items) ? payload.data.items : [];

  return {
    source: "rakko",
    seedKeyword: seed,
    consumedCredit: payload.meta?.consumedCredit || 0,
    candidates: items
      .filter((item) => item?.keyword)
      .map((item) => ({
        keyword: item.keyword,
        source: "rakko",
        metrics: item.metrics || {},
      })),
  };
}
