import { keywordPlan } from "./article-generator.js";
import { getPipelineConfig } from "./pipeline-mode.js";
import { fetchRakkoKeywordCandidates } from "./rakko-keywords.js";
import { getSupabaseAdmin, getSupabaseProjectKey, isSupabaseConfigured } from "./supabase-admin.js";

const DEFAULT_RAKKO_REFRESH_DAYS = 14;

export async function selectKeywordForArticle(existingArticles) {
  if (!isSupabaseConfigured()) {
    return selectFallbackKeyword(existingArticles, "supabase-not-configured");
  }

  const supabase = getSupabaseAdmin();
  await ensureSeedKeywords(supabase);

  const refreshDecision = await maybeRefreshRakkoKeywords(supabase, existingArticles);
  const candidate = await pickLeastUsedKeyword(supabase, existingArticles);

  if (!candidate) {
    return selectFallbackKeyword(existingArticles, "supabase-empty");
  }

  return {
    source: candidate.source || "supabase",
    keyword: candidate.keyword,
    metrics: candidate.metrics || {},
    category: candidate.category,
    product: candidate.product,
    intent: candidate.intent,
    consumedCredit: refreshDecision.consumedCredit || 0,
    refreshStatus: refreshDecision.status,
    refreshWarning: refreshDecision.error || null,
  };
}

export async function markKeywordUsedForArticle(keywordCandidate, article) {
  if (!isSupabaseConfigured() || !keywordCandidate?.keyword) {
    return;
  }

  const supabase = getSupabaseAdmin();
  const projectKey = getSupabaseProjectKey();
  const now = new Date().toISOString();

  await supabase
    .from("keyword_candidates")
    .upsert(
      {
        project_key: projectKey,
        keyword: keywordCandidate.keyword,
        source: keywordCandidate.source || "unknown",
        category: keywordCandidate.category || article.category,
        product: keywordCandidate.product || article.product,
        intent: keywordCandidate.intent || article.intent,
        metrics: keywordCandidate.metrics || {},
        last_used_at: now,
      },
      { onConflict: "project_key,keyword" },
    );

  await supabase.rpc("increment_keyword_usage", { target_project_key: projectKey, target_keyword: keywordCandidate.keyword }).then(async ({ error }) => {
    if (!error) return;
    await incrementUsageFallback(supabase, keywordCandidate.keyword, now, projectKey);
  });

  await supabase.from("keyword_usage_events").insert({
    project_key: projectKey,
    keyword: keywordCandidate.keyword,
    article_slug: article.slug,
    article_title: article.title,
    source: keywordCandidate.source || "unknown",
    used_at: now,
  });
}

async function ensureSeedKeywords(supabase) {
  const projectKey = getSupabaseProjectKey();
  const rows = keywordPlan.map((item) => ({
    project_key: projectKey,
    keyword: item.keyword,
    source: "seed",
    category: item.category,
    product: item.product,
    intent: item.intent,
    metrics: {},
  }));

  await supabase.from("keyword_candidates").upsert(rows, { onConflict: "project_key,keyword", ignoreDuplicates: true });
}

async function maybeRefreshRakkoKeywords(supabase, existingArticles) {
  const pipeline = getPipelineConfig();

  if (!pipeline.rakkoLive) {
    return { status: `skipped-${pipeline.mode}-mode`, consumedCredit: 0 };
  }

  const intervalDays = Number(process.env.RAKKO_REFRESH_INTERVAL_DAYS || DEFAULT_RAKKO_REFRESH_DAYS);
  const { data: lastRun } = await supabase
    .from("keyword_refresh_runs")
    .select("created_at")
    .eq("project_key", getSupabaseProjectKey())
    .eq("provider", "rakko")
    .eq("status", "success")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastRun?.created_at) {
    const ageMs = Date.now() - new Date(lastRun.created_at).getTime();
    if (ageMs < intervalDays * 24 * 60 * 60 * 1000) {
      return { status: "skipped-too-soon", consumedCredit: 0 };
    }
  }

  const result = await fetchRakkoKeywordCandidates(existingArticles);

  if (result.candidates.length) {
    await supabase.from("keyword_candidates").upsert(
      result.candidates.map((candidate) => ({
        project_key: getSupabaseProjectKey(),
        keyword: candidate.keyword,
        source: "rakko",
        metrics: candidate.metrics || {},
      })),
      { onConflict: "project_key,keyword", ignoreDuplicates: true },
    );
  }

  await supabase.from("keyword_refresh_runs").insert({
    project_key: getSupabaseProjectKey(),
    provider: "rakko",
    seed_keyword: result.seedKeyword || null,
    status: result.source === "rakko" ? "success" : "skipped_or_failed",
    fetched_count: result.candidates.length,
    consumed_credit: result.consumedCredit || 0,
    error: result.error || null,
  });

  return {
    status: result.source,
    consumedCredit: result.consumedCredit || 0,
    error: result.error || null,
  };
}

async function pickLeastUsedKeyword(supabase, existingArticles) {
  const usedKeywords = existingArticles.map((article) => article.keyword);
  let query = supabase
    .from("keyword_candidates")
    .select("*")
    .eq("project_key", getSupabaseProjectKey())
    .order("usage_count", { ascending: true })
    .order("last_used_at", { ascending: true, nullsFirst: true })
    .order("discovered_at", { ascending: false })
    .limit(1);

  if (usedKeywords.length) {
    query = query.not("keyword", "in", `(${usedKeywords.map(escapePostgrestListValue).join(",")})`);
  }

  const { data, error } = await query.maybeSingle();
  if (error) return null;
  return data;
}

function selectFallbackKeyword(existingArticles, reason) {
  const item = keywordPlan[existingArticles.length % keywordPlan.length];
  return {
    source: reason,
    keyword: item.keyword,
    category: item.category,
    product: item.product,
    intent: item.intent,
    metrics: {},
    consumedCredit: 0,
    refreshStatus: "fallback",
  };
}

async function incrementUsageFallback(supabase, keyword, now, projectKey) {
  const { data } = await supabase
    .from("keyword_candidates")
    .select("usage_count")
    .eq("project_key", projectKey)
    .eq("keyword", keyword)
    .maybeSingle();

  await supabase
    .from("keyword_candidates")
    .update({
      usage_count: Number(data?.usage_count || 0) + 1,
      last_used_at: now,
    })
    .eq("project_key", projectKey)
    .eq("keyword", keyword);
}

function escapePostgrestListValue(value) {
  return `"${String(value).replaceAll('"', '\\"')}"`;
}
