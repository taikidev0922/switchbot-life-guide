import fs from "node:fs/promises";

const queue = JSON.parse(await fs.readFile("data/a8-product-link-queue.json", "utf8")).slice(0, 2);

const script = `(() => {
  const queue = ${JSON.stringify(queue, null, 2)};
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function getBannerForm() {
    const forms = [...document.forms].filter((form) => form.name === "asLinkForm");
    return forms.find((form) => form.querySelector('[name="bannerItemUrl"]') && form.querySelector('[name="bannerImageUrl"]'));
  }

  function extractCode(html) {
    const documentResult = new DOMParser().parseFromString(html, "text/html");
    const textarea = documentResult.querySelector("textarea#code0, textarea[name='code']");
    return textarea?.value?.trim() || "";
  }

  async function generateOne(item) {
    const form = getBannerForm();
    if (!form) throw new Error("A8 banner form was not found.");

    const formData = new FormData(form);
    formData.set("goodsLinkDesc", "1");
    formData.set("insId", "s00000022845001");
    formData.set("javaScriptFlg", "true");
    formData.set("bannerItemUrl", item.productUrl);
    formData.set("bannerImageUrl", item.imageUrl);
    formData.set("bannerWebsiteId", "001");

    const response = await fetch(form.action, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const html = await response.text();
    const code = extractCode(html);
    return {
      ...item,
      ok: response.ok && Boolean(code),
      status: response.status,
      code,
      error: code ? "" : "Generated code was empty.",
    };
  }

  (async () => {
    const results = [];
    for (const item of queue) {
      console.log("Generating A8 product link:", item.title);
      try {
        results.push(await generateOne(item));
      } catch (error) {
        results.push({ ...item, ok: false, code: "", error: String(error?.message || error) });
      }
      await sleep(1200);
    }

    const text = JSON.stringify(results, null, 2);
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
    document.body.innerHTML = '<pre style="white-space:pre-wrap;font:12px/1.5 monospace;padding:20px;">' + text.replace(/[&<>]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[char])) + '</pre>';
    console.log("A8 generated product links:", results);
  })();
})();`;

await fs.writeFile("scripts/a8-generate-product-links-trial.js", script, "utf8");
console.log("Wrote scripts/a8-generate-product-links-trial.js");
