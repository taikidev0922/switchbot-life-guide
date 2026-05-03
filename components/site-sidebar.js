import Link from "next/link";
import { AffiliateMaterialLink } from "./affiliate-material-link";
import { findAffiliateMaterial } from "../lib/affiliate-materials";
import { nicheConfig } from "../lib/niche-config";

const productLinks = nicheConfig.productLinks;
const troubleLinks = nicheConfig.troubleLinks;

export function SiteSidebar({ popularArticles = [] }) {
  const banner = findAffiliateMaterial({ product: "general", category: "review", placement: "sidebar", type: "banner" });
  const text = findAffiliateMaterial({ product: "general", category: "review", placement: "sidebar", type: "text" });

  return (
    <aside className="sidebar" aria-label="サイドバー">
      <section className="sidebar-block affiliate-panel">
        <p className="sidebar-kicker">{nicheConfig.affiliate.sidebarKicker}</p>
        <h2>{nicheConfig.affiliate.sidebarHeading}</h2>
        {banner ? (
          <AffiliateMaterialLink className="sidebar-banner" material={banner} />
        ) : (
          <AffiliateMaterialLink className="sidebar-cta" material={text}>
            {text?.linkText || `${nicheConfig.affiliate.storeName}へ`}
          </AffiliateMaterialLink>
        )}
      </section>

      <section className="sidebar-block">
        <h2>製品カテゴリ</h2>
        <nav className="side-link-list" aria-label="製品カテゴリ">
          {productLinks.map(([label, href]) => (
            <Link href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>
      </section>

      <section className="sidebar-block">
        <h2>人気記事</h2>
        <ol className="popular-list">
          {popularArticles.length ? (
            popularArticles.slice(0, 3).map((article) => (
              <li key={article.slug}>
                <Link href={`/articles/${article.slug}`}>{article.title}</Link>
              </li>
            ))
          ) : (
            <li>
              <span>記事公開後に自動で表示されます</span>
            </li>
          )}
        </ol>

        <h2 className="sidebar-subtitle">困りごと別</h2>
        <nav className="side-link-list trouble-links" aria-label="困りごと別リンク">
          {troubleLinks.map(([label, href]) => (
            <Link href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>
      </section>
    </aside>
  );
}
