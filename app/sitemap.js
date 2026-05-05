import { readArticles } from "../lib/articles-store";
import { absoluteUrl } from "../lib/site-config";

export default async function sitemap() {
  const articles = await readArticles();
  const latestArticleDate = articles.reduce((latest, article) => {
    const articleDate = new Date(article.updatedAt || article.publishedAt);
    return articleDate > latest ? articleDate : latest;
  }, new Date("2026-05-01T00:00:00.000Z"));
  const staticPages = ["/privacy", "/affiliate-disclosure", "/contact"];

  return [
    {
      url: absoluteUrl("/"),
      lastModified: latestArticleDate,
      changeFrequency: "daily",
      priority: 1,
    },
    ...staticPages.map((path) => ({
      url: absoluteUrl(path),
      lastModified: latestArticleDate,
      changeFrequency: "yearly",
      priority: 0.4,
    })),
    ...articles.map((article) => ({
      url: absoluteUrl(`/articles/${article.slug}`),
      lastModified: article.updatedAt ? new Date(article.updatedAt) : new Date(article.publishedAt),
      changeFrequency: "monthly",
      priority: 0.8,
    })),
  ];
}
