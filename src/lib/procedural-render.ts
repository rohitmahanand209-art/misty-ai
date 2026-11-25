"use client";

export type ProceduralAspect = "16:9" | "9:16";

export type ProceduralRenderInput = {
  prompt: string;
  aspect: ProceduralAspect;
  duration: number;
  style: string;
  image?: Blob | null;
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
};

const MIME_CANDIDATES = [
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm",
  "video/mp4",
];

function readVint(
  bytes: Uint8Array,
  pos: number,
): { length: number; value: number; unknown: boolean } | null {
  const first = bytes[pos];
  if (first === undefined || first === 0) return null;
  let length = 1;
  for (let mask = 0x80; mask > 0 && (first & mask) === 0; mask >>= 1) length += 1;
  if (length > 8 || pos + length > bytes.length) return null;
  let value = first & (0xff >> length);
  let allOnes = value === (0xff >> length);
  for (let i = 1; i < length; i += 1) {
    const byte = bytes[pos + i];
    value = value * 256 + byte;
    if (byte !== 0xff) allOnes = false;
  }
  return { length, value, unknown: allOnes };
}

function encodeVintSize(value: number, minLength = 1): Uint8Array {
  let length = minLength;
  while (length < 8 && value >= 2 ** (7 * length) - 1) length += 1;
  const out = new Uint8Array(length);
  let remaining = value;
  for (let i = length - 1; i >= 0; i -= 1) {
    out[i] = remaining % 256;
    remaining = Math.floor(remaining / 256);
  }
  out[0] |= 1 << (8 - length);
  return out;
}

const EBML_HEADER_ID = 0x1a45dfa3;
const SEGMENT_ID = 0x18538067;
const INFO_ID = 0x1549a966;
const DURATION_ID = 0x4489;

function readId(bytes: Uint8Array, pos: number): { id: number; length: number } | null {
  const first = bytes[pos];
  if (first === undefined || first === 0) return null;
  let length = 1;
  for (let mask = 0x80; mask > 0 && (first & mask) === 0; mask >>= 1) length += 1;
  if (length > 4 || pos + length > bytes.length) return null;
  let id = 0;
  for (let i = 0; i < length; i += 1) id = id * 256 + bytes[pos + i];
  return { id, length };
}

export async function applyWebmDuration(
  blob: Blob,
  durationMs: number,
): Promise<Blob> {
  try {
    const bytes = new Uint8Array(await blob.arrayBuffer());

    const header = readId(bytes, 0);
    if (!header || header.id !== EBML_HEADER_ID) return blob;
    const headerSize = readVint(bytes, header.length);
    if (!headerSize || headerSize.unknown) return blob;
    let pos = header.length + headerSize.length + headerSize.value;

    const segment = readId(bytes, pos);
    if (!segment || segment.id !== SEGMENT_ID) return blob;
    const segmentSize = readVint(bytes, pos + segment.length);
    if (!segmentSize) return blob;
    pos += segment.length + segmentSize.length;

    const info = readId(bytes, pos);
    if (!info || info.id !== INFO_ID) return blob;
    const infoSize = readVint(bytes, pos + info.length);
    if (!infoSize || infoSize.unknown) return blob;

    const sizePos = pos + info.length;
    const payloadStart = sizePos + infoSize.length;
    const payloadEnd = payloadStart + infoSize.value;
    if (payloadEnd > bytes.length) return blob;

    let cursor = payloadStart;
    while (cursor < payloadEnd) {
      const element = readId(bytes, cursor);
      if (!element) break;
      const elementSize = readVint(bytes, cursor + element.length);
      if (!elementSize || elementSize.unknown) break;
      if (element.id === DURATION_ID) {
        const valuePos = cursor + element.length + elementSize.length;
        if (valuePos + elementSize.value <= payloadEnd && elementSize.value === 8) {
          const patched = bytes.slice();
          new DataView(patched.buffer).setFloat64(valuePos, durationMs, false);
          return new Blob([patched], { type: blob.type });
        }
        return blob;
      }
      cursor = valuePosOf(element.length, elementSize.length, elementSize.value, cursor);
    }

    const duration = new Uint8Array(11);
    duration[0] = 0x44;
    duration[1] = 0x89;
    duration[2] = 0x88;
    new DataView(duration.buffer).setFloat64(3, durationMs, false);

    const newPayloadSize = infoSize.value + duration.length;
    const newSize = encodeVintSize(newPayloadSize, infoSize.length);

    const out = new Uint8Array(
      bytes.length + duration.length + (newSize.length - infoSize.length),
    );
    let offset = 0;
    out.set(bytes.subarray(0, sizePos), offset);
    offset += sizePos;
    out.set(newSize, offset);
    offset += newSize.length;
    out.set(bytes.subarray(payloadStart, payloadEnd), offset);
    offset += infoSize.value;
    out.set(duration, offset);
    offset += duration.length;
    out.set(bytes.subarray(payloadEnd), offset);

    return new Blob([out], { type: blob.type });
  } catch {
    return blob;
  }
}

function valuePosOf(
  idLength: number,
  sizeLength: number,
  valueLength: number,
  start: number,
): number {
  return start + idLength + sizeLength + valueLength;
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pickMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

export function canRenderProcedurally(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof MediaRecorder === "undefined") return false;
  return typeof HTMLCanvasElement !== "undefined" &&
    typeof HTMLCanvasElement.prototype.captureStream === "function";
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number,
  duration: number,
  seed: number,
) {
  const progress = Math.min(1, elapsed / duration);
  const hue = seed % 360;
  const hue2 = (hue + 55 + (seed % 70)) % 360;
  const hue3 = (hue + 190) % 360;

  const angle = (seed % 360) * (Math.PI / 180) + progress * 0.7;
  const base = ctx.createLinearGradient(
    width / 2 - Math.cos(angle) * width,
    height / 2 - Math.sin(angle) * height,
    width / 2 + Math.cos(angle) * width,
    height / 2 + Math.sin(angle) * height,
  );
  base.addColorStop(0, `hsl(${hue} 72% 24%)`);
  base.addColorStop(0.5, `hsl(${hue2} 74% 38%)`);
  base.addColorStop(1, `hsl(${hue3} 68% 22%)`);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);

  ctx.globalCompositeOperation = "lighter";
  const blobs = 4;
  for (let i = 0; i < blobs; i += 1) {
    const phase = i * 1.7 + (seed % 13);
    const cx = width * (0.5 + 0.42 * Math.sin(elapsed * 0.45 + phase));
    const cy = height * (0.5 + 0.38 * Math.cos(elapsed * 0.37 + phase * 1.3));
    const radius = width * (0.34 + 0.08 * Math.sin(elapsed * 0.6 + i));
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    const blobHue = [hue, hue2, hue3, (hue + 300) % 360][i % 4];
    glow.addColorStop(0, `hsla(${blobHue} 90% 62% / 0.5)`);
    glow.addColorStop(0.55, `hsla(${blobHue} 90% 55% / 0.16)`);
    glow.addColorStop(1, "hsla(0 0% 0% / 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.globalCompositeOperation = "source-over";

  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 1;
  const spacing = Math.max(28, Math.round(width / 20));
  const drift = (elapsed * 14) % spacing;
  for (let x = -spacing; x < width + spacing; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x + drift, 0);
    ctx.lineTo(x + drift, height);
    ctx.stroke();
  }
  for (let y = -spacing; y < height + spacing; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y + drift * 0.6);
    ctx.lineTo(width, y + drift * 0.6);
    ctx.stroke();
  }
  ctx.restore();

  const vignette = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.25,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.72,
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.62)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  const fade = Math.min(1, elapsed / 0.6, (duration - elapsed) / 0.6);
  if (fade < 1) {
    ctx.fillStyle = `rgba(0,0,0,${Math.max(0, 1 - Math.max(0, fade))})`;
    ctx.fillRect(0, 0, width, height);
  }
}

type SceneSource = CanvasImageSource & { width: number; height: number };

type SceneAnalysis = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

type Particle = {
  kind: "glow" | "leaf" | "butterfly";
  depth: number;
  x: number;
  y: number;
  driftX: number;
  driftY: number;
  size: number;
  phase: number;
  spin: number;
  hue: number;
  alpha: number;
  speed: number;
};

function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Cheap saliency heuristic: saturation plus local edge contrast, biased toward
 * the centre of the frame. Used only to aim the simulated micro-motion at the
 * most "subject-like" region — it is NOT object detection or segmentation.
 */
function analyzeScene(image: SceneSource): SceneAnalysis {
  const fallback: SceneAnalysis = { cx: 0.5, cy: 0.55, rx: 0.3, ry: 0.34 };
  try {
    const w = 64;
    const h = Math.max(24, Math.round((64 * image.height) / image.width));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return fallback;
    ctx.drawImage(image, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;

    const lum = new Float32Array(w * h);
    for (let i = 0; i < w * h; i += 1) {
      lum[i] = (data[i * 4] * 0.299 + data[i * 4 + 1] * 0.587 + data[i * 4 + 2] * 0.114) / 255;
    }

    let totalWeight = 0;
    let sumX = 0;
    let sumY = 0;
    let sumXX = 0;
    let sumYY = 0;

    for (let y = 1; y < h - 1; y += 1) {
      for (let x = 1; x < w - 1; x += 1) {
        const idx = y * w + x;
        const r = data[idx * 4] / 255;
        const g = data[idx * 4 + 1] / 255;
        const b = data[idx * 4 + 2] / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : (max - min) / max;
        const edge =
          Math.abs(lum[idx] - lum[idx - 1]) +
          Math.abs(lum[idx] - lum[idx + 1]) +
          Math.abs(lum[idx] - lum[idx - w]) +
          Math.abs(lum[idx] - lum[idx + w]);

        const nx = x / w;
        const ny = y / h;
        const centreBias =
          1 - Math.min(1, Math.hypot((nx - 0.5) / 0.62, (ny - 0.56) / 0.66)) * 0.85;
        const weight = (saturation * 0.9 + Math.min(1, edge * 2.4)) * Math.max(0.05, centreBias);

        totalWeight += weight;
        sumX += nx * weight;
        sumY += ny * weight;
        sumXX += nx * nx * weight;
        sumYY += ny * ny * weight;
      }
    }

    if (totalWeight < 0.001) return fallback;
    const cx = sumX / totalWeight;
    const cy = sumY / totalWeight;
    const varX = Math.max(0, sumXX / totalWeight - cx * cx);
    const varY = Math.max(0, sumYY / totalWeight - cy * cy);

    return {
      cx: clamp01(cx),
      cy: clamp01(cy),
      rx: Math.min(0.42, Math.max(0.18, Math.sqrt(varX) * 2.1)),
      ry: Math.min(0.46, Math.max(0.18, Math.sqrt(varY) * 2.1)),
    };
  } catch {
    return fallback;
  }
}

function createParticles(seed: number, aspect: ProceduralAspect): Particle[] {
  const rng = makeRng(seed ^ 0x9e3779b9);
  const particles: Particle[] = [];
  const count = aspect === "9:16" ? 34 : 40;

  for (let i = 0; i < count; i += 1) {
    const roll = rng();
    const kind: Particle["kind"] = roll < 0.58 ? "glow" : roll < 0.85 ? "leaf" : "butterfly";
    const depth = 0.08 + rng() * 0.92;
    particles.push({
      kind,
      depth,
      x: rng(),
      y: 0.15 + rng() * 0.8,
      driftX: (rng() - 0.5) * 0.055,
      driftY: -0.012 - rng() * 0.03,
      size:
        kind === "glow"
          ? 0.012 + rng() * 0.022
          : kind === "leaf"
            ? 0.026 + rng() * 0.024
            : 0.03 + rng() * 0.024,
      phase: rng() * Math.PI * 2,
      spin: (rng() - 0.5) * 1.5,
      hue: kind === "leaf" ? 78 + rng() * 55 : kind === "butterfly" ? 265 + rng() * 80 : 190 + rng() * 120,
      alpha:
        kind === "glow"
          ? 0.55 + rng() * 0.4
          : kind === "leaf"
            ? 0.66 + rng() * 0.3
            : 0.62 + rng() * 0.3,
      speed: 0.5 + rng() * 0.9,
    });
  }
  return particles;
}

// Particles are drawn from pre-rendered sprite canvases instead of building
// gradients, beziers and CSS blurs on every frame. Per-frame gradient/blur
// work was expensive enough to starve the encoder and freeze the recording
// after a few seconds on mobile. Sprites are cached per kind + hue bucket.
const SPRITE_SIZE = 128;
const SPRITE_EXTENT = 56;
const spriteCache = new Map<string, HTMLCanvasElement>();

function paintGlowSprite(ctx: CanvasRenderingContext2D, hue: number) {
  const r = SPRITE_SIZE / 2;
  const gradient = ctx.createRadialGradient(r, r, 0, r, r, r);
  gradient.addColorStop(0, `hsla(${hue} 95% 78% / 0.95)`);
  gradient.addColorStop(0.45, `hsla(${hue} 95% 68% / 0.33)`);
  gradient.addColorStop(1, `hsla(${hue} 95% 60% / 0)`);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(r, r, r, 0, Math.PI * 2);
  ctx.fill();
}

function paintLeafSprite(ctx: CanvasRenderingContext2D, hue: number) {
  const size = SPRITE_EXTENT;
  ctx.save();
  ctx.translate(SPRITE_SIZE / 2, SPRITE_SIZE / 2);
  const gradient = ctx.createLinearGradient(-size, -size * 0.4, size, size * 0.4);
  gradient.addColorStop(0, `hsla(${hue} 46% 34% / 0.92)`);
  gradient.addColorStop(0.55, `hsla(${hue + 14} 54% 44% / 0.9)`);
  gradient.addColorStop(1, `hsla(${hue + 26} 58% 52% / 0.82)`);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(-size, 0);
  ctx.quadraticCurveTo(-size * 0.15, -size * 0.52, size, 0);
  ctx.quadraticCurveTo(-size * 0.15, size * 0.52, -size, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `hsla(${hue} 38% 22% / 0.4)`;
  ctx.lineWidth = Math.max(0.5, size * 0.045);
  ctx.beginPath();
  ctx.moveTo(-size * 0.92, 0);
  ctx.lineTo(size * 0.92, 0);
  ctx.stroke();
  ctx.restore();
}

function paintButterflySprite(ctx: CanvasRenderingContext2D, hue: number) {
  const wingW = SPRITE_EXTENT;
  const wingH = SPRITE_EXTENT * 0.62;
  ctx.save();
  ctx.translate(SPRITE_SIZE / 2, SPRITE_SIZE / 2);
  const wingFill = ctx.createLinearGradient(-wingW, -wingH, wingW, wingH);
  wingFill.addColorStop(0, `hsla(${hue} 62% 62% / 0.85)`);
  wingFill.addColorStop(0.5, `hsla(${hue + 26} 68% 70% / 0.8)`);
  wingFill.addColorStop(1, `hsla(${hue} 58% 58% / 0.85)`);
  ctx.fillStyle = wingFill;

  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      side * wingW * 0.55, -wingH * 1.05,
      side * wingW * 1.05, -wingH * 0.6,
      side * wingW * 0.72, -wingH * 0.05,
    );
    ctx.bezierCurveTo(
      side * wingW * 0.6, wingH * 0.16,
      side * wingW * 0.2, wingH * 0.1,
      0, 0,
    );
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      side * wingW * 0.5, wingH * 0.12,
      side * wingW * 0.68, wingH * 0.55,
      side * wingW * 0.34, wingH * 0.6,
    );
    ctx.bezierCurveTo(
      side * wingW * 0.16, wingH * 0.5,
      side * wingW * 0.05, wingH * 0.25,
      0, 0,
    );
    ctx.closePath();
    ctx.fill();
  }

  ctx.strokeStyle = `hsla(${hue} 30% 20% / 0.35)`;
  ctx.lineWidth = Math.max(0.4, wingW * 0.035);
  ctx.beginPath();
  ctx.moveTo(0, -wingH * 0.42);
  ctx.lineTo(0, wingH * 0.5);
  ctx.stroke();
  ctx.restore();
}

function getParticleSprite(
  kind: Particle["kind"],
  hue: number,
  blurred: boolean,
): HTMLCanvasElement | null {
  const bucket = Math.round(hue / 12) * 12;
  const key = `${kind}:${bucket}:${blurred ? "b" : "s"}`;
  const cached = spriteCache.get(key);
  if (cached) return cached;

  const base = document.createElement("canvas");
  base.width = SPRITE_SIZE;
  base.height = SPRITE_SIZE;
  const baseCtx = base.getContext("2d");
  if (!baseCtx) return null;

  if (kind === "glow") paintGlowSprite(baseCtx, bucket);
  else if (kind === "leaf") paintLeafSprite(baseCtx, bucket);
  else paintButterflySprite(baseCtx, bucket);

  let sprite = base;
  if (blurred) {
    const soft = document.createElement("canvas");
    soft.width = SPRITE_SIZE;
    soft.height = SPRITE_SIZE;
    const softCtx = soft.getContext("2d");
    if (softCtx) {
      try {
        softCtx.filter = "blur(3px)";
      } catch {
        // filter unsupported — fall back to the sharp sprite
      }
      softCtx.drawImage(base, 0, 0);
      softCtx.filter = "none";
      sprite = soft;
    }
  }

  spriteCache.set(key, sprite);
  return sprite;
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  elapsed: number,
  width: number,
  height: number,
  camX: number,
  camY: number,
  subject: { cx: number; cy: number; rx: number; ry: number },
) {
  const sorted = [...particles].sort((a, b) => a.depth - b.depth);
  for (const particle of sorted) {
    const parallax = 0.25 + particle.depth * 1.5;
    const wanderX = Math.sin(elapsed * 0.55 * particle.speed + particle.phase) * 0.014;
    const wanderY = Math.cos(elapsed * 0.42 * particle.speed + particle.phase * 1.4) * 0.01;
    const nx =
      ((particle.x + particle.driftX * elapsed + wanderX) % 1.2 + 1.2) % 1.2 - 0.1;
    const ny =
      ((particle.y + particle.driftY * elapsed + wanderY) % 1.2 + 1.2) % 1.2 - 0.1;

    const x = nx * width + camX * parallax;
    const y = ny * height + camY * parallax;
    const unit = Math.min(width, height);
    const size = particle.size * unit * (0.55 + particle.depth * 0.9);

    const twinkle = 0.72 + 0.28 * Math.sin(elapsed * 1.7 * particle.speed + particle.phase);

    // Fade foreground particles that drift across the subject, so nothing
    // obscures the main subject's face/body. Smooth, so no popping.
    const inSubject = Math.hypot(
      (x - subject.cx) / Math.max(1, subject.rx),
      (y - subject.cy) / Math.max(1, subject.ry),
    );
    const avoid = particle.depth > 0.55 ? clamp01((inSubject - 0.85) / 0.5) : 1;

    const alpha = particle.alpha * twinkle * (0.62 + particle.depth * 0.38) * avoid;
    if (alpha < 0.02) continue;

    const sprite = getParticleSprite(particle.kind, particle.hue, particle.depth > 0.55);
    if (!sprite) continue;

    let rotation = 0;
    let squash = 1;
    let halfExtent = size;
    if (particle.kind === "glow") {
      halfExtent = size * 2.6 * (SPRITE_EXTENT / (SPRITE_SIZE / 2));
    } else if (particle.kind === "leaf") {
      rotation =
        particle.spin * elapsed * 0.9 +
        Math.sin(elapsed * 1.1 * particle.speed + particle.phase) * 0.7;
    } else {
      const flap = elapsed * 11 * particle.speed + particle.phase;
      squash = 0.18 + Math.abs(Math.cos(flap)) * 0.82;
      rotation =
        Math.sin(elapsed * 1.3 * particle.speed + particle.phase) * 0.5 + particle.spin * 0.2;
      halfExtent = size * 0.95;
    }

    const scale = halfExtent / SPRITE_EXTENT;
    const drawW = SPRITE_SIZE * scale * squash;
    const drawH = SPRITE_SIZE * scale;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    if (rotation) ctx.rotate(rotation);
    ctx.drawImage(sprite, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }
}

function drawImageLayer(
  ctx: CanvasRenderingContext2D,
  image: SceneSource,
  width: number,
  height: number,
  zoom: number,
  panX: number,
  panY: number,
) {
  const scale = Math.max(width / image.width, height / image.height) * zoom;
  const drawW = image.width * scale;
  const drawH = image.height * scale;
  const dx = (width - drawW) / 2 + panX;
  const dy = (height - drawH) / 2 + panY;
  ctx.drawImage(image, dx, dy, drawW, drawH);
  return { dx, dy, drawW, drawH };
}

async function loadSceneBitmap(blob: Blob): Promise<SceneSource | null> {
  try {
    if (typeof createImageBitmap === "function") {
      return await createImageBitmap(blob);
    }
  } catch {
    // fall through to <img> decoding
  }
  try {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.decoding = "sync";
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("decode failed"));
      image.src = url;
    });
    return image;
  } catch {
    return null;
  }
}

function drawImageScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number,
  duration: number,
  image: SceneSource,
  seed: number,
  analysis: SceneAnalysis,
  particles: Particle[],
) {
  const t = clamp01(elapsed / Math.max(0.001, duration));
  const smooth = t * t * (3 - 2 * t);
  const breathe = Math.sin(elapsed * 1.05) * 0.5 + 0.5;

  ctx.fillStyle = "#05030c";
  ctx.fillRect(0, 0, width, height);

  // Smooth dolly + drifting handheld-style camera (no abrupt start/stop).
  const zoom = 1.035 + smooth * 0.115 + breathe * 0.004;
  const driftX = Math.sin(elapsed * 0.62) * width * 0.017;
  const driftY = Math.cos(elapsed * 0.47) * height * 0.013;
  const camX = (smooth - 0.5) * width * 0.05 + driftX;
  const camY = (smooth - 0.5) * height * 0.038 + driftY;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Far plane: background moves less than the camera (parallax).
  const bg = drawImageLayer(ctx, image, width, height, zoom, camX * 0.62, camY * 0.62);

  // Mid plane: a feathered ellipse around the most salient region drifts a
  // little more than the background, creating depth separation.
  const subjectZoom = zoom * 1.014;
  const subjectPanX = camX * 1.24 + Math.sin(elapsed * 1.45) * width * 0.0022;
  const subjectPanY = camY * 1.24 + Math.cos(elapsed * 1.2) * height * 0.0018;
  const subjectScale = Math.max(width / image.width, height / image.height) * subjectZoom;
  const subjectW = image.width * subjectScale;
  const subjectH = image.height * subjectScale;
  const subjectDx = (width - subjectW) / 2 + subjectPanX;
  const subjectDy = (height - subjectH) / 2 + subjectPanY;

  const centreX = bg.dx + analysis.cx * bg.drawW;
  const centreY = bg.dy + analysis.cy * bg.drawH;
  const radiusX = analysis.rx * bg.drawW;
  const radiusY = analysis.ry * bg.drawH;

  ctx.save();
  const feather = [
    { grow: 1.26, alpha: 0.14 },
    { grow: 1.13, alpha: 0.3 },
    { grow: 1.0, alpha: 1 },
  ];
  for (const layer of feather) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(centreX, centreY, radiusX * layer.grow, radiusY * layer.grow, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.globalAlpha = layer.alpha;
    ctx.drawImage(image, subjectDx, subjectDy, subjectW, subjectH);
    ctx.restore();
  }
  ctx.restore();

  // Light sweep, softened.
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  const sweepX = (t * 1.6 - 0.3) * width;
  const light = ctx.createLinearGradient(sweepX - width * 0.45, 0, sweepX + width * 0.45, height);
  light.addColorStop(0, "rgba(255,255,255,0)");
  light.addColorStop(0.5, "rgba(255,255,255,0.1)");
  light.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // Foreground particles: butterflies, leaves and glowing motes.
  drawParticles(ctx, particles, elapsed, width, height, camX, camY, {
    cx: centreX,
    cy: centreY,
    rx: radiusX * 1.05,
    ry: radiusY * 1.05,
  });

  const vignette = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.32,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.78,
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  const fade = Math.min(1, elapsed / 0.5, (duration - elapsed) / 0.5);
  if (fade < 1) {
    ctx.fillStyle = `rgba(0,0,0,${Math.max(0, 1 - Math.max(0, fade))})`;
    ctx.fillRect(0, 0, width, height);
  }
}

export async function renderProceduralVideo(
  input: ProceduralRenderInput,
): Promise<Blob | null> {
  if (!canRenderProcedurally()) {
    throw new Error(
      "This browser cannot record canvas video. Try Chrome on Android or desktop.",
    );
  }

  const mimeType = pickMimeType();
  if (!mimeType) {
    throw new Error("No supported video encoder found in this browser.");
  }

  const duration = Math.min(15, Math.max(3, Math.round(input.duration || 8)));
  const aspect: ProceduralAspect = input.aspect === "9:16" ? "9:16" : "16:9";
  const width = aspect === "9:16" ? 540 : 960;
  const height = aspect === "9:16" ? 960 : 540;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create a drawing surface.");

  const seed = hashString(`${input.prompt}|${input.style}|${aspect}`);
  const sceneImage = input.image ? await loadSceneBitmap(input.image) : null;
  const analysis = sceneImage ? analyzeScene(sceneImage) : null;
  const particles = sceneImage ? createParticles(seed, aspect) : [];

  const drawFrame = (elapsed: number) => {
    if (sceneImage && analysis) {
      drawImageScene(
        ctx,
        width,
        height,
        elapsed,
        duration,
        sceneImage,
        seed,
        analysis,
        particles,
      );
    } else {
      drawScene(ctx, width, height, elapsed, duration, seed);
    }
  };

  drawFrame(0);

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 3_000_000,
  });
  const chunks: BlobPart[] = [];

  return new Promise<Blob | null>((resolve, reject) => {
    let settled = false;
    const finish = (value: Blob | null) => {
      if (settled) return;
      settled = true;
      stream.getTracks().forEach((track) => track.stop());
      resolve(value);
    };

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) chunks.push(event.data);
    };
    recorder.onerror = () => {
      if (settled) return;
      settled = true;
      stream.getTracks().forEach((track) => track.stop());
      reject(new Error("The video encoder stopped unexpectedly."));
    };
    recorder.onstop = () => {
      if (input.signal?.aborted) {
        finish(null);
        return;
      }
      const type = mimeType.split(";")[0] || "video/webm";
      const raw = new Blob(chunks, { type });
      if (type === "video/webm") {
        applyWebmDuration(raw, duration * 1000)
          .then((fixed) => finish(fixed))
          .catch(() => finish(raw));
      } else {
        finish(raw);
      }
    };

    if (input.signal?.aborted) {
      finish(null);
      return;
    }

    const start = performance.now();
    let frame = 0;

    const tick = () => {
      if (input.signal?.aborted) {
        if (recorder.state !== "inactive") recorder.stop();
        else finish(null);
        return;
      }
      const elapsed = (performance.now() - start) / 1000;
      if (elapsed >= duration) {
        drawFrame(duration);
        input.onProgress?.(100);
        if (recorder.state !== "inactive") recorder.stop();
        return;
      }
      drawFrame(elapsed);
      input.onProgress?.(Math.min(99, Math.round((elapsed / duration) * 100)));
      frame = requestAnimationFrame(tick);
    };

    recorder.start(250);
    frame = requestAnimationFrame(tick);

    input.signal?.addEventListener("abort", () => {
      cancelAnimationFrame(frame);
      if (recorder.state !== "inactive") recorder.stop();
    });
  });
}
