import { put } from "@vercel/blob";
import { getPipelineConfig } from "./pipeline-mode.js";
import { nicheConfig } from "./niche-config.js";

export async function generateImageWithOpenAI(article) {
  const pipeline = getPipelineConfig();

  if (!pipeline.openaiImageLive) {
    return null;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const model = pipeline.openaiImageModel;
  const prompt = buildImagePrompt(article);

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      size: pipeline.openaiImageSize,
      quality: pipeline.openaiImageQuality,
    }),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      source: "openai-image-error",
      error: payload?.error?.message || `OpenAI image API failed with status ${response.status}`,
    };
  }

  const imageBase64 = payload?.data?.[0]?.b64_json;
  if (!imageBase64) {
    return {
      source: "openai-image-error",
      error: "OpenAI image API did not return b64_json.",
    };
  }

  const buffer = Buffer.from(imageBase64, "base64");
  const blob = await put(`images/${article.slug}.png`, buffer, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "image/png",
  });

  return {
    source: "openai-image",
    imageUrl: blob.url,
    model,
  };
}

function buildImagePrompt(article) {
  return [
    nicheConfig.generation.imagePrompt,
    `Article title: ${article.title}`,
    `Main keyword: ${article.keyword}`,
  ].join(" ");
}
