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
) {
  const t = Math.min(1, elapsed / Math.max(0.001, duration));
  const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;

  ctx.fillStyle = "#05030c";
  ctx.fillRect(0, 0, width, height);

  const zoom = 1.06 + eased * 0.16;
  const dirX = seed % 2 === 0 ? 1 : -1;
  const dirY = seed % 3 === 0 ? -1 : 1;
  const panX = (eased - 0.5) * width * 0.07 * dirX;
  const panY = (eased - 0.5) * height * 0.06 * dirY;

  const scale = Math.max(width / image.width, height / image.height) * zoom;
  const drawW = image.width * scale;
  const drawH = image.height * scale;
  const dx = (width - drawW) / 2 + panX;
  const dy = (height - drawH) / 2 + panY;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, dx, dy, drawW, drawH);

  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  const sweepX = ((elapsed / Math.max(1, duration)) * 1.6 - 0.3) * width;
  const light = ctx.createLinearGradient(sweepX - width * 0.4, 0, sweepX + width * 0.4, height);
  light.addColorStop(0, "rgba(255,255,255,0)");
  light.addColorStop(0.5, "rgba(255,255,255,0.14)");
  light.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

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

  const drawFrame = (elapsed: number) => {
    if (sceneImage) {
      drawImageScene(ctx, width, height, elapsed, duration, sceneImage, seed);
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
