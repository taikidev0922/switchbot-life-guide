import { siteConfig } from "../../lib/site-config";

export const metadata = {
  title: "アフィリエイト開示",
  description: `${siteConfig.name}の広告・アフィリエイト開示です。`,
  alternates: {
    canonical: "/affiliate-disclosure",
  },
};

export default function AffiliateDisclosurePage() {
  return (
    <main className="single-page">
      <article className="article-card">
        <p className="eyebrow">Disclosure</p>
        <h1>アフィリエイト開示</h1>
        <p>
          {siteConfig.name}は、A8.netなどのアフィリエイトプログラムを利用しています。記事内のリンクやボタンには広告リンクが含まれる場合があります。
        </p>
        <p>
          広告リンクを経由して商品を購入した場合、当サイトが報酬を受け取ることがあります。読者の購入価格が追加で高くなることはありません。
        </p>
        <p>
          記事では公式情報、公開情報、実用上の観点をもとに紹介しますが、最終的な購入判断は公式サイトの最新情報を確認したうえで行ってください。
        </p>
      </article>
    </main>
  );
}
