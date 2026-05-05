import fs from "fs/promises";
import path from "path";
import { readArticles } from "../lib/articles-store.js";
import { absoluteUrl } from "../lib/site-config.js";

await loadEnvFile(".env.local");

const programId = process.env.A8_PROGRAM_ID || "s00000022845001";
const outputPath = path.join(process.cwd(), "exports", "a8_placement_urls.csv");
const articles = await readArticles();
const urls = unique([
  absoluteUrl("/"),
  ...articles.map((article) => absoluteUrl(`/articles/${article.slug}`)),
]);

const csv = urls.map((url) => `${programId},${url}`).join("\r\n") + "\r\n";

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, csv, "utf8");

console.log(JSON.stringify({
  outputPath,
  programId,
  urlCount: urls.length,
  firstUrl: urls[0],
  lastUrl: urls.at(-1),
}, null, 2));

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

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
