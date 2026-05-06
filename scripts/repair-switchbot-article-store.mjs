import fs from "fs/promises";
import { list, put } from "@vercel/blob";

await loadEnvFile(".env.local");

const legacyPath = "cms/articles.json";
const switchbotPath = "cms/switchbot/articles.json";
const articles = await readBlobArticles(legacyPath);
const switchbotArticles = articles.filter(isSwitchBotArticle);

await put(switchbotPath, JSON.stringify(switchbotArticles, null, 2), {
  access: "public",
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: "application/json; charset=utf-8",
});

await put(legacyPath, JSON.stringify(switchbotArticles, null, 2), {
  access: "public",
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: "application/json; charset=utf-8",
});

console.log(JSON.stringify({
  beforeCount: articles.length,
  afterCount: switchbotArticles.length,
  removed: articles
    .filter((article) => !isSwitchBotArticle(article))
    .map((article) => ({ slug: article.slug, title: article.title, keyword: article.keyword })),
  writtenPaths: [switchbotPath, legacyPath],
}, null, 2));

async function readBlobArticles(pathname) {
  const result = await list({ prefix: pathname, limit: 1 });
  const blob = result.blobs.find((entry) => entry.pathname === pathname);
  if (!blob) return [];

  const response = await fetch(`${blob.url}?ts=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to read ${pathname}: ${response.status}`);

  const value = await response.json();
  return Array.isArray(value) ? value : [];
}

function isSwitchBotArticle(article) {
  const haystack = [article.title, article.keyword, article.excerpt, article.product]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes("switchbot");
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
