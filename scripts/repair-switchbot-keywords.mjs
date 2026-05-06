import fs from "fs/promises";
import { keywordPlan } from "../lib/article-generator.js";
import { getSupabaseAdmin, getSupabaseProjectKey } from "../lib/supabase-admin.js";

await loadEnvFile(".env.local");

const supabase = getSupabaseAdmin();
const projectKey = getSupabaseProjectKey();

if (!supabase) throw new Error("Supabase is not configured.");

const { data: candidates, error: readError } = await supabase
  .from("keyword_candidates")
  .select("keyword, project_key")
  .eq("project_key", projectKey);

if (readError) throw readError;

const nonSwitchBotKeywords = (candidates || [])
  .map((row) => row.keyword)
  .filter((keyword) => !String(keyword).toLowerCase().includes("switchbot"));

for (const keyword of nonSwitchBotKeywords) {
  await supabase.from("keyword_usage_events").delete().eq("project_key", projectKey).eq("keyword", keyword);
  await supabase.from("keyword_candidates").delete().eq("project_key", projectKey).eq("keyword", keyword);
}

const seedRows = keywordPlan.map((item) => ({
  project_key: projectKey,
  keyword: item.keyword,
  source: "seed",
  category: item.category,
  product: item.product,
  intent: item.intent,
  metrics: {},
}));

const { error: seedError } = await supabase
  .from("keyword_candidates")
  .upsert(seedRows, { onConflict: "project_key,keyword", ignoreDuplicates: true });

if (seedError) throw seedError;

console.log(JSON.stringify({
  projectKey,
  removedKeywords: nonSwitchBotKeywords,
  seedCount: seedRows.length,
}, null, 2));

async function loadEnvFile(filePath) {
  const raw = await fs.readFile(filePath, "utf8").catch(() => "");
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim().replace(/^"|"$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}
