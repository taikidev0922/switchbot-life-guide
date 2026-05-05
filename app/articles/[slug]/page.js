import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import { ArticleBadge } from "../../../components/article-badge";
import { AffiliateMaterialLink } from "../../../components/affiliate-material-link";
import { SiteSidebar } from "../../../components/site-sidebar";
import { XPostCarousel } from "../../../components/x-post-carousel";
import { findAffiliateMaterial } from "../../../lib/affiliate-materials";
import { articleHref, resolveRelatedArticles } from "../../../lib/links";
import { readArticles } from "../../../lib/articles-store";
import { fetchXPostEmbeds } from "../../../lib/x-posts";
import { absoluteUrl, siteConfig } from "../../../lib/site-config";
import { nicheConfig } from "../../../lib/niche-config";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const articles = await readArticles();
  const article = articles.find((entry) => entry.slug === decodedSlug || entry.slug === slug);

  if (!article) return { title: "記事が見つかりません" };

  return {
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical: `/articles/${article.slug}`,
    },
    openGraph: {
      type: "article",
      locale: siteConfig.locale,
      url: absoluteUrl(`/articles/${article.slug}`),
      siteName: siteConfig.name,
      title: article.title,
      description: article.excerpt,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt || article.publishedAt,
      images: article.imageUrl ? [{ url: article.imageUrl, width: 1400, height: 744, alt: article.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: article.imageUrl ? [article.imageUrl] : [],
    },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const articles = await readArticles();
  const article = articles.find((entry) => entry.slug === decodedSlug || entry.slug === slug);

  if (!article) notFound();

  const relatedArticles = resolveRelatedArticles(article, articles);
  const xEmbeds = await fetchXPostEmbeds(article.xPosts || []);
  const affiliateMaterial = findAffiliateMaterial({
    product: article.product,
    category: article.category,
    placement: "article-cta",
    type: "text",
  });

  return (
    <div className="page-shell article-page-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([buildArticleJsonLd(article), buildBreadcrumbJsonLd(article)]) }}
      />
      <main className="main-content">
        <article className="article-card">
          <div className="article-meta-row">
            <ArticleBadge category={article.category} />
            <span className="category-badge badge-neutral">{article.keyword}</span>
          </div>

          <h1>{article.title}</h1>
          <p className="post-meta">
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            <span>読了目安 {article.readingMinutes}分</span>
          </p>

          <figure className="hero-image">
            <Image src={article.imageUrl} alt={article.title} width={1400} height={744} priority />
          </figure>

          <section className="article-body">
            {article.verdict ? (
              <div className="verdict-box">
                <p className="eyebrow">結論</p>
                <p>{article.verdict}</p>
              </div>
            ) : null}

            <BuyingGuide article={article} />
            <OfficialSources article={article} />
            <SocialReactions embeds={xEmbeds} />

            {article.blocks.slice(0, 1).map((block) => (
              <ArticleBlock block={block} key={block.heading} />
            ))}

            <InlineAffiliateLink article={article} material={affiliateMaterial} />

            {article.blocks.slice(1, 2).map((block) => (
              <ArticleBlock block={block} key={block.heading} />
            ))}

            <AffiliateCta article={article} label="購入前の確認" material={affiliateMaterial} />

            {article.blocks.slice(2).map((block) => (
              <ArticleBlock block={block} key={block.heading} />
            ))}

            <div className="internal-link-box">
              <h2>次に読む記事</h2>
              <Link href={`/?product=${article.product}#articles`}>同じ製品カテゴリの記事を見る</Link>
              <Link href={`/?category=${article.category}#articles`}>同じ目的の記事を見る</Link>
              <Link href={`/?intent=${article.intent}#articles`}>同じ悩みの記事を見る</Link>
            </div>

            <AffiliateCta article={article} label="読み終えた人向け" material={affiliateMaterial} />
          </section>

          <section className="related-section" aria-labelledby="related-title">
            <h2 id="related-title">関連記事</h2>
            {relatedArticles.length ? (
              <div className="related-grid">
                {relatedArticles.map((related) => (
                  <Link className="related-card" href={articleHref(related.slug)} key={related.slug}>
                    <ArticleBadge category={related.category} />
                    <strong>{related.title}</strong>
                  </Link>
                ))}
              </div>
            ) : (
              <p>関連記事は、記事が増えると自動で表示されます。</p>
            )}
          </section>
        </article>
      </main>

      <SiteSidebar popularArticles={articles} />
      {xEmbeds.some((embed) => embed.html) ? <Script src="https://platform.twitter.com/widgets.js" strategy="afterInteractive" /> : null}
    </div>
  );
}

function buildArticleJsonLd(article) {
  const articleUrl = absoluteUrl(`/articles/${article.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    headline: article.title,
    description: article.excerpt,
    image: article.imageUrl ? [article.imageUrl] : undefined,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    inLanguage: "ja-JP",
    author: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    articleSection: article.category,
    keywords: [article.keyword, article.product, article.intent].filter(Boolean).join(", "),
  };
}

function buildBreadcrumbJsonLd(article) {
  const articleUrl = absoluteUrl(`/articles/${article.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: siteConfig.name,
        item: siteConfig.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: article.title,
        item: articleUrl,
      },
    ],
  };
}

function ArticleBlock({ block }) {
  return (
    <>
      <h2>{block.heading}</h2>
      {block.paragraphs.map((paragraph) => (
        <p className={paragraph.includes("\n") ? "preserve-lines" : undefined} key={paragraph}>
          {paragraph}
        </p>
      ))}
    </>
  );
}

function BuyingGuide({ article }) {
  const guide = article.buyingGuide;
  if (!guide) return null;

  return (
    <section className="buying-guide" aria-label="購入判断ガイド">
      <div>
        <h2>向いている人</h2>
        <ul>
          {guide.bestFor?.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2>買う前の確認</h2>
        <ul>
          {guide.checkPoints?.slice(0, 4).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2>注意点</h2>
        <ul>
          {guide.cautions?.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function OfficialSources({ article }) {
  const sources = article.officialSources || [];
  if (!sources.length) return null;

  return (
    <section className="official-sources" aria-label="参照した公式情報">
      <p className="eyebrow">公式情報</p>
      <h2>{nicheConfig.generation.sourceName}の情報を確認しています</h2>
      <ul>
        {sources.slice(0, 3).map((source) => (
          <li key={source.url}>
            <a href={source.url} rel="noopener noreferrer" target="_blank">
              {source.title}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SocialReactions({ embeds }) {
  if (!embeds.length) return null;

  return (
    <section className="social-reactions" aria-label="Xで見られる反応">
      <p className="eyebrow">SNSの反応</p>
      <h2>Xの投稿は利用シーンを知る参考情報として扱います</h2>
      <p>投稿内容は公式情報ではないため、仕様や対応状況の根拠にはせず、使い方のイメージを補う情報として掲載します。</p>
      <XPostCarousel embeds={embeds} />
    </section>
  );
}

function InlineAffiliateLink({ article, material }) {
  if (!material?.href) return null;

  const text = article.category === "trouble" ? nicheConfig.affiliate.troubleInlineText : nicheConfig.affiliate.inlineText;

  return (
    <p className="inline-affiliate-note">
      {text}{" "}
      <AffiliateMaterialLink className="inline-affiliate-link" material={material}>
        {material.linkText || `${nicheConfig.affiliate.storeName}を確認する`}
      </AffiliateMaterialLink>
    </p>
  );
}

function AffiliateCta({ article, label, material }) {
  const cta = article.affiliateCta || {};
  const href = material?.href || cta.url || "#";
  const buttonText = material?.linkText || cta.buttonText || nicheConfig.affiliate.buttonText;

  return (
    <div className="cta-box">
      <p className="cta-label">{label}</p>
      <h2>{cta.headline || `${nicheConfig.generation.fallbackProductName}の最新情報を確認`}</h2>
      <p>{cta.body || `セール、セット割、在庫状況は変わります。購入前に${nicheConfig.affiliate.storeName}の最新条件を確認しておくと安心です。`}</p>
      <AffiliateMaterialLink className="cta-button" material={{ ...material, href }}>
        {buttonText}
      </AffiliateMaterialLink>
    </div>
  );
}

function formatDate(value) {
  return new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "long", day: "numeric" }).format(new Date(value));
}
