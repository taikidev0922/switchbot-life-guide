import fs from "fs/promises";
import { readArticles } from "../lib/articles-store.js";

await loadEnvFile(".env.local");

const articles = await readArticles();
console.log(JSON.stringify(articles.map((article) => ({
  slug: article.slug,
  title: article.title,
  keyword: article.keyword,
  category: article.category,
  product: article.product,
  publishedAt: article.publishedAt,
})), null, 2));

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
