import fs from "fs/promises";
import { createClient } from "@supabase/supabase-js";

await loadEnvFile(".env.local");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const candidate = await supabase
  .from("keyword_candidates")
  .select("keyword,usage_count,last_used_at")
  .eq("keyword", "SwitchBot ハブ2 レビュー")
  .single();

const events = await supabase
  .from("keyword_usage_events")
  .select("keyword,article_slug,source")
  .order("used_at", { ascending: false })
  .limit(1);

console.log(JSON.stringify({ candidate: candidate.data, event: events.data?.[0] }, null, 2));

async function loadEnvFile(path) {
  const raw = await fs.readFile(path, "utf8").catch(() => "");
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim().replace(/^"|"$/g, "");
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
