import { readArticles } from "../lib/articles-store";
import { absoluteUrl } from "../lib/site-config";

export default async function sitemap() {
  const articles = await readArticles();

  return [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...articles.map((article) => ({
      url: absoluteUrl(`/articles/${article.slug}`),
      lastModified: article.updatedAt ? new Date(article.updatedAt) : new Date(article.publishedAt),
      changeFrequency: "monthly",
      priority: 0.8,
    })),
  ];
}
