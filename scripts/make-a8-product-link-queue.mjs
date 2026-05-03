import fs from "node:fs/promises";

const candidates = JSON.parse(await fs.readFile("data/switchbot-product-candidates.json", "utf8"));

const priorityHandles = [
  "switchbot-hub3",
  "switchbot-aihub",
  "switchbot-hub2",
  "switchbot-hub-mini-matter",
  "switchbot-hub-mini",
  "switchbot-lock-ultra-vision-pro-combo",
  "switchbot-lock-ultra-touch-combo",
  "switchbot-lock-pro",
  "switchbot-lock-lite",
  "switchbot-lock",
  "switchbot-curtain3",
  "switchbot-curtain",
  "switchbot-blind-tilt",
  "switchbot-meter-pro",
  "switchbot-meter-pro-co2",
  "switchbot-meter",
  "switchbot-indoor-outdoor-thermo-hygrometer",
  "switchbot-bot",
  "switchbot-robot-vacuum-cleaner-k11",
  "robot-vacuum-cleaner-k10-pro-combo",
  "switchbot-robot-vacuum-cleaner-k20-pro",
  "switchbot-robot-vacuum-cleaner-s20",
  "switchbot-smart-video-doorbell",
  "switchbot-pan-tilt-cam-plus-5mp",
  "switchbot-plug-mini",
];

const byHandle = new Map(candidates.map((item) => [item.handle, item]));
const queue = priorityHandles
  .map((handle) => byHandle.get(handle))
  .filter(Boolean)
  .map((item) => ({
    ...item,
    linkText: `${item.title}を公式サイトで確認する`,
  }));

await fs.writeFile("data/a8-product-link-queue.json", `${JSON.stringify(queue, null, 2)}\n`, "utf8");

console.log(`Wrote ${queue.length} priority products to data/a8-product-link-queue.json`);
for (const item of queue) {
  console.log(`${item.title}\t${item.productUrl}`);
}
