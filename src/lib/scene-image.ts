"use client";

export type SceneImage = {
  blob: Blob;
  url: string;
  prompt: string;
  model: string;
  provider: "pollinations";
};

export class SceneImageError extends Error {
  code: "rate_limited" | "unavailable" | "blocked";
  retryAfterSeconds?: number;

  constructor(
    message: string,
    code: SceneImageError["code"],
    retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "SceneImageError";
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const CACHE_LIMIT = 12;
const cache = new Map<string, SceneImage>();

const STYLE_HINTS: Record<string, string> = {
  Cinematic: "cinematic still, anamorphic lens, dramatic lighting, film grain",
  Realistic: "photorealistic, natural lighting, high detail, 35mm photo",
  Anime: "anime key visual, cel shaded, vibrant colors, detailed background",
  "3D Render": "3d render, octane render, soft global illumination, high detail",
  Cartoon: "cartoon illustration, clean lines, flat colors, playful",
  Cyberpunk: "cyberpunk, neon lights, rain-slick streets, moody atmosphere",
  Fantasy: "fantasy concept art, epic scale, magical atmosphere, painterly",
};

export function buildScenePrompt(prompt: string, style: string): string {
  const hint = STYLE_HINTS[style] ?? "";
  const base = prompt.trim().replace(/\s+/g, " ").slice(0, 340);
  return hint ? `${base}, ${hint}` : base;
}

export async function generateSceneImage(input: {
  prompt: string;
  style: string;
  aspect: "16:9" | "9:16";
  signal?: AbortSignal;
}): Promise<SceneImage> {
  const scenePrompt = buildScenePrompt(input.prompt, input.style);
  const cacheKey = `${input.aspect}|${scenePrompt}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    prompt: scenePrompt,
    aspect: input.aspect,
  });

  let response: Response;
  try {
    response = await fetch(`/api/scene-image?${params.toString()}`, {
      method: "GET",
      signal: input.signal,
    });
  } catch {
    if (input.signal?.aborted) throw new SceneImageError("Cancelled.", "blocked");
    throw new SceneImageError(
      "Could not reach the image service. Check your connection and try again.",
      "unavailable",
    );
  }

  if (!response.ok) {
    let message = "The free scene image could not be generated.";
    let retryAfter = 0;
    try {
      const payload = (await response.json()) as {
        error?: string;
        retryAfter?: number;
      };
      if (payload.error) message = payload.error;
      if (typeof payload.retryAfter === "number") retryAfter = payload.retryAfter;
    } catch {
      // keep the generic message
    }
    const header = response.headers.get("retry-after");
    if (!retryAfter && header) {
      const parsed = Number.parseInt(header, 10);
      if (Number.isFinite(parsed)) retryAfter = parsed;
    }
    throw new SceneImageError(
      message,
      response.status === 429 ? "rate_limited" : "unavailable",
      retryAfter || undefined,
    );
  }

  const blob = await response.blob();
  if (blob.size < 1024) {
    throw new SceneImageError(
      "The free image service returned an empty image. Please try again.",
      "unavailable",
    );
  }

  const image: SceneImage = {
    blob,
    url: URL.createObjectURL(blob),
    prompt: scenePrompt,
    model: response.headers.get("x-scene-model") ?? "sana",
    provider: "pollinations",
  };

  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(cacheKey, image);
  return image;
}
