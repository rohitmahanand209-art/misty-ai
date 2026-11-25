import { NextResponse } from "next/server";

const UPSTREAM = "https://image.pollinations.ai/prompt";
const CACHE_TTL_MS = 30 * 60 * 1000;
const CACHE_LIMIT = 24;
// Anonymous upstream limit: one image per 45 seconds per IP.
const ANON_WINDOW_MS = 45_000;

type Entry = {
  buffer: Buffer;
  mime: string;
  model: string;
  at: number;
};

const cache = new Map<string, Entry>();
// Timestamp of the last successful upstream fetch per IP.
// NOTE: in-memory only — resets on server restart and is per-instance.
const lastUpstreamAt = new Map<string, number>();

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function trimCache() {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now - entry.at > CACHE_TTL_MS) cache.delete(key);
  }
  while (cache.size > CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (!oldest) break;
    cache.delete(oldest);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const prompt = (searchParams.get("prompt") ?? "").trim();
  const aspect = searchParams.get("aspect") === "9:16" ? "9:16" : "16:9";

  if (prompt.length < 8 || prompt.length > 400) {
    return NextResponse.json(
      { error: "Prompt must be between 8 and 400 characters." },
      { status: 400 },
    );
  }

  const key = `${aspect}|${prompt}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return new NextResponse(new Uint8Array(cached.buffer), {
      headers: {
        "Content-Type": cached.mime,
        "Cache-Control": "private, max-age=600",
        "X-Scene-Model": cached.model,
        "X-Scene-Cache": "hit",
      },
    });
  }

  const ip = clientIp(request);
  const previous = lastUpstreamAt.get(ip) ?? 0;
  const elapsed = Date.now() - previous;
  if (previous && elapsed < ANON_WINDOW_MS) {
    const retryAfter = Math.max(1, Math.ceil((ANON_WINDOW_MS - elapsed) / 1000));
    return NextResponse.json(
      {
        code: "rate_limited",
        error: `The free image service allows one image every 45 seconds. Try again in ${retryAfter}s.`,
        retryAfter,
      },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  const width = aspect === "9:16" ? 576 : 1024;
  const height = aspect === "9:16" ? 1024 : 576;
  const seed = Math.abs(
    Array.from(prompt).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 7),
  ) % 1_000_000;
  const url = `${UPSTREAM}/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true&safe=true`;

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      headers: { Accept: "image/jpeg,image/png,image/webp,*/*" },
      cache: "no-store",
      signal: AbortSignal.timeout(45_000),
    });
  } catch {
    return NextResponse.json(
      {
        code: "unavailable",
        error: "The free image service could not be reached. Please try again.",
      },
      { status: 503 },
    );
  }

  if (upstream.status === 402 || upstream.status === 429) {
    const header = upstream.headers.get("retry-after");
    const parsed = header ? Number.parseInt(header, 10) : NaN;
    const retryAfter = Number.isFinite(parsed) ? Math.max(1, parsed) : 45;
    return NextResponse.json(
      {
        code: "rate_limited",
        error: `The free image service allows one image every 45 seconds. Try again in ${retryAfter}s.`,
        retryAfter,
      },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  if (!upstream.ok) {
    return NextResponse.json(
      {
        code: "unavailable",
        error: `The free image service is unavailable right now (HTTP ${upstream.status}).`,
      },
      { status: 502 },
    );
  }

  const mime = upstream.headers.get("content-type") ?? "image/jpeg";
  if (!mime.startsWith("image/")) {
    return NextResponse.json(
      {
        code: "unavailable",
        error: "The free image service returned an unexpected response.",
      },
      { status: 502 },
    );
  }

  const buffer = Buffer.from(await upstream.arrayBuffer());
  if (buffer.byteLength < 1024) {
    return NextResponse.json(
      {
        code: "unavailable",
        error: "The free image service returned an empty image.",
      },
      { status: 502 },
    );
  }

  const model = upstream.headers.get("x-model-used") ?? "sana";
  lastUpstreamAt.set(ip, Date.now());
  cache.set(key, { buffer, mime, model, at: Date.now() });
  trimCache();

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": mime,
      "Cache-Control": "private, max-age=600",
      "X-Scene-Model": model,
      "X-Scene-Cache": "miss",
    },
  });
}
