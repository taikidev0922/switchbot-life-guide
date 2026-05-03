export const nicheConfig = {
  id: "switchbot",
  brandName: "SwitchBot",
  siteName: "Home IoT Guide",
  shortName: "Home IoT Guide",
  siteUrl: "https://www.home-iot-guide.com",
  locale: "ja_JP",
  language: "ja-JP",
  siteDescription:
    "SwitchBotのレビュー、比較、使い方、トラブル解決を購入判断につながる形で整理するスマートホーム専門サイトです。",
  metaTitle: "SwitchBotのレビューと使い方",
  logoSubtitle: "SwitchBot専門ガイド",
  hero: {
    eyebrow: "SwitchBot専門の購入ガイド",
    title: "レビュー、比較、設定方法からあなたに合うSwitchBotを選ぶ",
    body:
      "公式情報を確認しながら、購入前の迷い、設定の不安、トラブル時の判断を整理します。記事内では関連レビューと公式ストアへの導線を自然につなげます。",
    primaryAction: "記事を探す",
    secondaryAction: "困りごとから探す",
    secondaryHref: "/?category=trouble#articles",
  },
  disclosure:
    "当サイトはA8.net等のアフィリエイト広告を利用しています。記事内のリンクから商品を購入すると、運営者に報酬が発生する場合があります。",
  navItems: [
    ["レビュー", "/?category=review#articles"],
    ["使い方", "/?category=howto#articles"],
    ["比較", "/?category=compare#articles"],
    ["トラブル解決", "/?category=trouble#articles"],
    ["おすすめ", "/?category=recommend#articles"],
  ],
  intentCards: [
    ["レビュー", "購入直前の不安を減らす", "/?category=review#articles"],
    ["比較", "どちらを買うべきか決める", "/?category=compare#articles"],
    ["使い方", "設定と連携の不安をなくす", "/?category=howto#articles"],
    ["トラブル解決", "接続や反応の問題を切り分ける", "/?category=trouble#articles"],
    ["おすすめ", "目的別に製品を選ぶ", "/?category=recommend#articles"],
  ],
  categoryLabels: {
    review: "レビュー",
    compare: "比較",
    howto: "使い方",
    trouble: "トラブル解決",
    recommend: "おすすめ",
  },
  productLabels: {
    hub: "ハブ",
    lock: "スマートロック",
    curtain: "カーテン",
    sensor: "温湿度センサー",
    camera: "カメラ",
    plug: "プラグ",
  },
  productLinks: [
    ["ハブ", "/?product=hub#articles"],
    ["スマートロック", "/?product=lock#articles"],
    ["カーテン", "/?product=curtain#articles"],
    ["温湿度センサー", "/?product=sensor#articles"],
    ["カメラ", "/?product=camera#articles"],
    ["プラグ", "/?product=plug#articles"],
  ],
  troubleLinks: [
    ["接続できない", "/?intent=connection#articles"],
    ["アレクサ連携", "/?intent=alexa#articles"],
    ["Googleホーム設定", "/?intent=google-home#articles"],
    ["反応しない", "/?intent=no-response#articles"],
  ],
  keywordPlans: [
    plan("SwitchBot ハブ2 レビュー", "switchbot-hub2-review", "review", "hub", "purchase"),
    plan("SwitchBot ハブ2 ハブミニ 比較", "switchbot-hub2-hub-mini-comparison", "compare", "hub", "comparison"),
    plan("SwitchBot Alexa 連携", "switchbot-alexa-setup", "howto", "hub", "alexa"),
    plan("SwitchBot 接続できない", "switchbot-connection-trouble", "trouble", "hub", "connection"),
    plan("SwitchBot スマートロック 賃貸", "switchbot-smart-lock-rental", "review", "lock", "purchase"),
    plan("SwitchBot カーテン 設定", "switchbot-curtain-setup", "howto", "curtain", "setup"),
    plan("SwitchBot 温湿度計 使い方", "switchbot-thermo-hygrometer-howto", "howto", "sensor", "automation"),
    plan("SwitchBot カメラ おすすめ", "switchbot-camera-recommend", "recommend", "camera", "purchase"),
    plan("SwitchBot プラグ 反応しない", "switchbot-plug-no-response", "trouble", "plug", "no-response"),
    plan("SwitchBot Googleホーム 設定", "switchbot-google-home-setup", "howto", "hub", "google-home"),
  ],
  rakkoSeedKeywords: [
    "SwitchBot",
    "SwitchBot ハブ2",
    "SwitchBot スマートロック",
    "SwitchBot カーテン",
    "SwitchBot 接続できない",
  ],
  affiliate: {
    storeName: "SwitchBot公式ストア",
    sidebarKicker: "公式ストア",
    sidebarHeading: "セール、セット割、在庫を確認",
    buttonText: "SwitchBot公式ストアで確認する",
    fallbackUrlEnv: "SWITCHBOT_AFFILIATE_URL",
    fallbackUrl: "#",
    inlineText:
      "購入前に、公式ストアで最新価格、セール、セット割を確認しておくと判断しやすくなります。",
    troubleInlineText:
      "改善しない場合は、公式ストアで対応製品やセット構成も確認しておくと判断しやすくなります。",
  },
  generation: {
    editorRole: "あなたはSwitchBot専門の日本語アフィリエイトメディア編集者です。",
    articleGoal: "検索ユーザーが購入判断しやすい、事実ベースの記事本文を作ってください。",
    fallbackProductName: "SwitchBot製品",
    defaultCategory: "レビュー",
    imagePrompt:
      "Create a realistic editorial hero image for a Japanese smart home blog article. Show a clean modern apartment interior with smart home devices in use. No visible logos, no readable text, no UI mockups, no people posing to camera. Natural daylight, practical product-review mood, high detail, landscape composition.",
    sourceName: "SwitchBot公式ブログ",
    noSourceMessage:
      "この記事生成時点では、SwitchBot公式ブログからこのキーワードに完全一致する情報を取得できませんでした。そのため、具体的な仕様を断定せず、購入前に公式ストアとサポート情報を確認する前提で整理しています。",
  },
  officialSources: {
    enabled: true,
    sourceSite: "SwitchBot Magazine",
    apiBase: "https://blog.switchbot.jp/wp-json/wp/v2/posts",
    cachePrefix: "cms/official-sources",
    userAgent: "SwitchBotLifeGuideBot/0.1 (+https://switchbot-life-guide.vercel.app)",
    cacheHoursEnv: "OFFICIAL_SOURCE_CACHE_HOURS",
  },
};

function plan(keyword, slugBase, category, product, intent) {
  return { keyword, slugBase, category, product, intent };
}
