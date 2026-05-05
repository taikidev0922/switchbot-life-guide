import { siteConfig } from "../../lib/site-config";

export const metadata = {
  title: "お問い合わせ",
  description: `${siteConfig.name}へのお問い合わせ案内です。`,
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="single-page">
      <article className="article-card">
        <p className="eyebrow">Contact</p>
        <h1>お問い合わせ</h1>
        <p>
          掲載内容の確認、広告掲載、記事に関するご連絡は、運営者の公開連絡先または管理している連絡窓口からお願いします。
        </p>
        <p>
          商品の仕様、在庫、注文、保証に関する問い合わせは、各メーカー公式サイトへ直接ご確認ください。
        </p>
      </article>
    </main>
  );
}
