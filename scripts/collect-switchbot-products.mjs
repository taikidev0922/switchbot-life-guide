import fs from "node:fs/promises";

const endpoint = "https://www.switchbot.jp/products.json?limit=250";
const response = await fetch(endpoint);

if (!response.ok) {
  throw new Error(`Failed to fetch SwitchBot products: ${response.status}`);
}

const { products = [] } = await response.json();

const denyWords = [
  "Olight",
  "Ostation",
  "Oclip",
  "Olantern",
  "Seeker",
  "Warrior",
  "Baton",
  "Arkfeld",
  "Perun",
  "Marauder",
  "i3T",
  "i5T",
];

const categoryHints = [
  ["hub", ["hub", "ハブ", "matter"]],
  ["lock", ["lock", "ロック", "鍵", "pad", "指紋", "顔認証"]],
  ["curtain", ["curtain", "カーテン", "blind", "ブラインド"]],
  ["sensor", ["meter", "温湿度", "sensor", "センサー"]],
  ["camera", ["camera", "カメラ", "見守り"]],
  ["plug", ["plug", "プラグ"]],
  ["vacuum", ["vacuum", "掃除機", "クリーナー", "k10", "k11", "s10", "s20", "k20"]],
  ["lighting", ["ライト", "light", "テープ", "neon", "rgbic", "電球"]],
  ["bot", ["bot", "ボット"]],
];

function guessCategory(product) {
  const haystack = `${product.title} ${product.handle}`.toLowerCase();
  return categoryHints.find(([, words]) => words.some((word) => haystack.includes(word.toLowerCase())))?.[0] ?? "general";
}

function isSwitchBotProduct(product) {
  const haystack = `${product.title} ${product.handle}`.toLowerCase();
  if (denyWords.some((word) => haystack.includes(word.toLowerCase()))) return false;
  return haystack.includes("switchbot") || /ハブ|ロック|ボット|温湿度|カーテン|プラグ|センサー|掃除機|カメラ|見守り/.test(product.title);
}

const candidates = products
  .filter(isSwitchBotProduct)
  .map((product) => {
    const image = product.images?.[0];
    return {
      title: product.title,
      handle: product.handle,
      productUrl: `https://www.switchbot.jp/products/${product.handle}`,
      imageUrl: image?.src ?? null,
      imageAlt: image?.alt ?? product.title,
      category: guessCategory(product),
      vendor: product.vendor ?? null,
    };
  })
  .filter((product) => product.imageUrl)
  .sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title, "ja"));

await fs.mkdir("data", { recursive: true });
await fs.writeFile("data/switchbot-product-candidates.json", `${JSON.stringify(candidates, null, 2)}\n`, "utf8");

console.log(`Collected ${candidates.length} SwitchBot product candidates.`);
console.log(candidates.slice(0, 20).map((item) => `${item.category}: ${item.title} -> ${item.productUrl}`).join("\n"));
