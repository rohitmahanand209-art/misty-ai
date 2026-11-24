"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Download,
  FileText,
  ImageDown,
  Info,
  Lock,
  MonitorPlay,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { VideoThumb } from "@/components/video-thumb";
import { getVideo } from "@/lib/demo-store";
import { MODE_LABELS, type DemoVideo } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const QUALITIES = [
  { id: "720p", label: "720p HD", note: "Free plan · smallest file", locked: false },
  { id: "1080p", label: "1080p Full HD", note: "Creator plan · recommended", locked: false },
  { id: "4k", label: "4K Ultra HD", note: "Studio plan · coming soon", locked: true },
];

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.split(/\s+/);
  let line = "";
  let lines = 0;
  for (let i = 0; i < words.length; i += 1) {
    const test = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y + lines * lineHeight);
      line = words[i];
      lines += 1;
      if (lines >= maxLines) return;
    } else {
      line = test;
    }
  }
  if (line && lines < maxLines) {
    ctx.fillText(line, x, y + lines * lineHeight);
  }
}

export default function DownloadPage() {
  const params = useParams<{ id: string }>();
  const [video, setVideo] = useState<DemoVideo | null>(null);
  const [ready, setReady] = useState(false);
  const [quality, setQuality] = useState("1080p");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setVideo(getVideo(params.id) ?? null);
    setReady(true);
  }, [params.id]);

  if (!ready) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-xl font-semibold text-white">Video not found</h1>
        <p className="mt-2 text-sm text-white/45">
          The demo project you tried to download is no longer available.
        </p>
        <Button asChild className="mt-5 rounded-xl brand-gradient text-white">
          <Link href="/my-videos">Back to My Videos</Link>
        </Button>
      </div>
    );
  }

  const activeVideo = video;

  function downloadPoster() {
    const aspect = activeVideo.aspect;
    const width = aspect === "9:16" ? 720 : aspect === "1:1" ? 900 : 1280;
    const height = aspect === "9:16" ? 1280 : aspect === "1:1" ? 900 : 720;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      toast.error("Could not create the poster in this browser.");
      return;
    }

    const colors = activeVideo.gradient.match(/#[0-9a-fA-F]{3,8}/g) ?? [
      "#7c3aed",
      "#4f46e5",
      "#0ea5e9",
    ];
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    colors.forEach((color, index) => {
      gradient.addColorStop(index / Math.max(1, colors.length - 1), color);
    });
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(0,0,0,0.32)";
    ctx.fillRect(0, height * 0.55, width, height * 0.45);

    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = `600 ${Math.round(width * 0.018)}px system-ui, sans-serif`;
    ctx.fillText("MISTY AI · DEMO PREVIEW", width * 0.06, height * 0.1);

    ctx.fillStyle = "#ffffff";
    ctx.font = `700 ${Math.round(width * 0.055)}px system-ui, sans-serif`;
    wrapText(
      ctx,
      activeVideo.title,
      width * 0.06,
      height * 0.68,
      width * 0.88,
      width * 0.062,
      2,
    );

    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.font = `400 ${Math.round(width * 0.021)}px system-ui, sans-serif`;
    wrapText(
      ctx,
      activeVideo.prompt,
      width * 0.06,
      height * 0.82,
      width * 0.88,
      width * 0.028,
      3,
    );

    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = `500 ${Math.round(width * 0.018)}px system-ui, sans-serif`;
    ctx.fillText(
      `${activeVideo.style} · ${activeVideo.aspect} · ${activeVideo.duration}s · ${MODE_LABELS[activeVideo.mode]}`,
      width * 0.06,
      height * 0.95,
    );

    canvas.toBlob((blob) => {
      if (!blob) {
        toast.error("Could not export the poster.");
        return;
      }
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${activeVideo.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-poster.png`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Demo poster downloaded.");
    }, "image/png");
  }

  function downloadProject() {
    const lines = [
      "MISTY AI — DEMO PROJECT EXPORT",
      "==================================",
      "",
      `Title: ${activeVideo.title}`,
      `Tool: ${MODE_LABELS[activeVideo.mode]}`,
      `Style: ${activeVideo.style}`,
      `Aspect ratio: ${activeVideo.aspect}`,
      `Duration: ${activeVideo.duration} seconds`,
      `Voice over: ${activeVideo.voice}`,
      `Resolution: ${activeVideo.resolution}`,
      `Selected quality: ${quality}`,
      `Created: ${new Date(activeVideo.createdAt).toLocaleString("en-IN")}`,
      "",
      "PROMPT",
      "------",
      activeVideo.prompt,
      "",
      "NOTE",
      "----",
      "This is a design preview. No real AI video was generated and no",
      "paid API, payment gateway or subscription is connected.",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${activeVideo.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-details.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Project details downloaded.");
  }

  async function copyLink() {
    const link = `${window.location.origin}/videos/${activeVideo.id}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Preview link copied.");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy the link.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-6 pt-6 sm:px-6 sm:pt-9 lg:px-8">
      <Link
        href={`/videos/${activeVideo.id}`}
        className="inline-flex items-center gap-1.5 text-xs text-white/45 hover:text-white"
      >
        <ArrowLeft className="size-3.5" />
        Back to video
      </Link>

      <div className="mt-4">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Download your video
        </h1>
        <p className="mt-1.5 text-sm text-white/50">
          Choose an export option for{" "}
          <span className="text-white/75">{activeVideo.title}</span>.
        </p>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <div className="ring-gradient overflow-hidden rounded-3xl bg-black/40 p-2.5">
            <VideoThumb video={activeVideo} interactive={false} />
          </div>
          <div className="mt-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3.5">
            <p className="text-[11px] uppercase tracking-wider text-white/35">
              Project
            </p>
            <p className="mt-1 text-sm font-medium text-white">
              {activeVideo.title}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-white/45">
              <span className="rounded-full bg-white/5 px-2 py-0.5">
                {MODE_LABELS[activeVideo.mode]}
              </span>
              <span className="rounded-full bg-white/5 px-2 py-0.5">
                {activeVideo.aspect}
              </span>
              <span className="rounded-full bg-white/5 px-2 py-0.5">
                {activeVideo.duration}s
              </span>
              <span className="rounded-full bg-white/5 px-2 py-0.5">
                {activeVideo.resolution}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">
              Quality
            </p>
            <div className="mt-2 space-y-1.5">
              {QUALITIES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={item.locked}
                  onClick={() => setQuality(item.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition",
                    item.locked
                      ? "cursor-not-allowed border-white/5 bg-white/[0.01] opacity-60"
                      : quality === item.id
                        ? "border-violet-400/60 bg-violet-500/15"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20",
                  )}
                >
                  <span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-white">
                      <MonitorPlay className="size-3.5 text-violet-300" />
                      {item.label}
                      {item.locked && <Lock className="size-3 text-white/35" />}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-white/40">
                      {item.note}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "grid size-4 place-items-center rounded-full border",
                      quality === item.id && !item.locked
                        ? "border-violet-300 bg-violet-400"
                        : "border-white/20",
                    )}
                  >
                    {quality === item.id && !item.locked && (
                      <Check className="size-2.5 text-white" />
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">
              Export options
            </p>

            <div className="mt-2 space-y-2">
              <button
                type="button"
                onClick={downloadPoster}
                className="flex w-full items-center gap-3 rounded-xl border border-violet-400/30 bg-violet-500/10 p-3 text-left transition hover:bg-violet-500/20"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg brand-gradient text-white">
                  <ImageDown className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-medium text-white">
                    Download demo poster (PNG)
                  </span>
                  <span className="block text-[10px] text-white/45">
                    Real image export · {activeVideo.aspect} ratio
                  </span>
                </span>
                <Download className="size-4 text-violet-200" />
              </button>

              <button
                type="button"
                onClick={downloadProject}
                className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-left transition hover:border-white/20 hover:bg-white/[0.05]"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/80">
                  <FileText className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-medium text-white">
                    Download project details (TXT)
                  </span>
                  <span className="block text-[10px] text-white/45">
                    Prompt, settings and metadata
                  </span>
                </span>
                <Download className="size-4 text-white/50" />
              </button>

              <button
                type="button"
                disabled
                className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl border border-white/5 bg-white/[0.01] p-3 text-left opacity-60"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/50">
                  <Lock className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-medium text-white/80">
                    Video file (MP4)
                  </span>
                  <span className="block text-[10px] text-white/40">
                    Available when the AI render engine launches
                  </span>
                </span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] uppercase tracking-wide text-white/50">
                  Soon
                </span>
              </button>
            </div>

            <div className="mt-3 flex gap-2">
              <Button
                onClick={copyLink}
                variant="outline"
                className="h-9 flex-1 rounded-lg border-white/10 bg-white/[0.03] text-[11px] text-white/75 hover:bg-white/10 hover:text-white"
              >
                {copied ? (
                  <Check className="size-3.5" />
                ) : (
                  <Share2 className="size-3.5" />
                )}
                {copied ? "Link copied" : "Copy preview link"}
              </Button>
              <Button
                asChild
                className="h-9 rounded-lg brand-gradient px-3 text-[11px] text-white"
              >
                <Link href="/my-videos">My Videos</Link>
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-3.5 text-[11px] leading-relaxed text-amber-100/75">
            <Info className="mt-0.5 size-4 shrink-0 text-amber-300" />
            <p>
              This is a demo download. Poster and project files are generated in
              your browser; no real video is rendered and no paid API is used.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
