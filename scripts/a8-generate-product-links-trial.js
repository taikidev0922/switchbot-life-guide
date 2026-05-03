(() => {
  const queue = [
  {
    "title": "SwitchBot ハブ3",
    "handle": "switchbot-hub3",
    "productUrl": "https://www.switchbot.jp/products/switchbot-hub3",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0522/2458/9999/files/Hub_3_JP_1600x1600_02_1x_f13df486-6ca8-4398-8f4f-7e9636bfc49f.webp?v=1760694016",
    "imageAlt": "SwitchBot ハブ3",
    "category": "hub",
    "vendor": "SwitchBot公式サイト",
    "linkText": "SwitchBot ハブ3を公式サイトで確認する"
  },
  {
    "title": "SwitchBot AIハブ",
    "handle": "switchbot-aihub",
    "productUrl": "https://www.switchbot.jp/products/switchbot-aihub",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0522/2458/9999/files/AI_Hub_Global_Amazon_Images_1600X1600_01_1.5x_1.webp?v=1765539052",
    "imageAlt": "SwitchBot AIハブ",
    "category": "hub",
    "vendor": "SwitchBot公式サイト",
    "linkText": "SwitchBot AIハブを公式サイトで確認する"
  }
];
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
})();