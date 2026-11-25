"use client";

export type ProceduralAspect = "16:9" | "9:16";

export type ProceduralRenderInput = {
  prompt: string;
  aspect: ProceduralAspect;
  duration: number;
  style: string;
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
};

const MIME_CANDIDATES = [
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm",
  "video/mp4",
];

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
  const width = aspect === "9:16" ? 360 : 640;
  const height = aspect === "9:16" ? 640 : 360;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create a drawing surface.");

  const seed = hashString(`${input.prompt}|${input.style}|${aspect}`);
  drawScene(ctx, width, height, 0, duration, seed);

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 2_200_000,
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
      finish(new Blob(chunks, { type: mimeType.split(";")[0] || "video/webm" }));
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
        drawScene(ctx, width, height, duration, duration, seed);
        input.onProgress?.(100);
        if (recorder.state !== "inactive") recorder.stop();
        return;
      }
      drawScene(ctx, width, height, elapsed, duration, seed);
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
