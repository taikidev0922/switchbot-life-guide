import "./globals.css";
import Script from "next/script";
import { siteConfig } from "../lib/site-config";
import { nicheConfig } from "../lib/niche-config";

export const metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: {
    default: `${siteConfig.name} | ${siteConfig.metaTitle}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | ${siteConfig.metaTitle}`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | ${siteConfig.metaTitle}`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const navItems = nicheConfig.navItems;
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-CLR2162CBK";

export default function RootLayout({ children }) {
  return (
    <html lang={siteConfig.language || "ja"}>
      <body>
        <GoogleAnalytics measurementId={gaMeasurementId} />
        <header className="site-header">
          <a className="site-logo" href="/" aria-label={`${siteConfig.name} トップへ`}>
            <span>{siteConfig.name}</span>
            <small>{siteConfig.logoSubtitle}</small>
          </a>
          <nav className="global-nav" aria-label="グローバルナビ">
            {navItems.map(([label, href]) => (
              <a href={href} key={href}>
                {label}
              </a>
            ))}
          </nav>
        </header>

        {children}

        <footer className="site-footer">
          <nav aria-label="フッターナビ">
            <a href="/privacy">プライバシーポリシー</a>
            <a href="/affiliate-disclosure">アフィリエイト開示</a>
            <a href="/contact">お問い合わせ</a>
            <a href="/sitemap.xml">サイトマップ</a>
          </nav>
          <p>
            {nicheConfig.disclosure}
          </p>
        </footer>
      </body>
    </html>
  );
}

function GoogleAnalytics({ measurementId }) {
  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
