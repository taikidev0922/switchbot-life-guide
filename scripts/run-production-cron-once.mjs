import fs from "fs";

loadEnvFile(".vercel/.env.production.local");

const response = await fetch("https://switchbot-life-guide.vercel.app/api/cron/publish-dummy", {
  headers: {
    authorization: `Bearer ${process.env.CRON_SECRET}`,
  },
  cache: "no-store",
});

const text = await response.text();
console.log(JSON.stringify({
  status: response.status,
  body: text.slice(0, 1200),
}, null, 2));

function loadEnvFile(path) {
  const raw = fs.readFileSync(path, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim().replace(/^"|"$/g, "");
    process.env[key] ||= value;
  }
}
