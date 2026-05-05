import { siteConfig } from "../../lib/site-config";

export const metadata = {
  title: "プライバシーポリシー",
  description: `${siteConfig.name}のプライバシーポリシーです。`,
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="single-page">
      <article className="article-card">
        <p className="eyebrow">Policy</p>
        <h1>プライバシーポリシー</h1>
        <p>
          {siteConfig.name}では、サイト改善、アクセス解析、広告配信、問い合わせ対応のために必要な範囲で情報を扱います。
        </p>
        <h2>アクセス解析とCookie</h2>
        <p>
          当サイトでは、閲覧状況の把握や利便性向上のためCookieを利用する場合があります。ブラウザ設定によりCookieを無効にできます。
        </p>
        <h2>広告について</h2>
        <p>
          当サイトはアフィリエイトプログラムを利用しています。広告リンクを経由して商品やサービスを購入した場合、当サイトが報酬を受け取ることがあります。
        </p>
        <h2>免責事項</h2>
        <p>
          掲載情報は正確性に配慮していますが、商品の仕様、価格、キャンペーン内容は変更される場合があります。購入前に公式サイトの最新情報をご確認ください。
        </p>
      </article>
    </main>
  );
}
