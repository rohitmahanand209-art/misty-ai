"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Download,
  ImagePlus,
  Loader2,
  RotateCcw,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDemoGeneration } from "@/hooks/use-demo-generation";
import { STYLES, VOICES, type DemoVideo } from "@/lib/demo-data";
import { VideoThumb } from "@/components/video-thumb";
import { cn } from "@/lib/utils";

const MOTIONS = [
  { id: "zoom-in", label: "Slow zoom in" },
  { id: "pan-right", label: "Pan right" },
  { id: "orbit", label: "Gentle orbit" },
  { id: "parallax", label: "Parallax drift" },
];

const DEMO_IMAGES = [
  {
    id: "misty",
    label: "Misty valley",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c3aed"/><stop offset="1" stop-color="#0ea5e9"/></linearGradient></defs><rect width="640" height="360" fill="url(#g)"/><circle cx="500" cy="90" r="52" fill="#fff" opacity="0.35"/><path d="M0 300 L160 180 L300 270 L430 160 L640 290 L640 360 L0 360 Z" fill="#1e1b4b" opacity="0.55"/></svg>`,
  },
  {
    id: "city",
    label: "Neon city",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#db2777"/><stop offset="1" stop-color="#4f46e5"/></linearGradient></defs><rect width="640" height="360" fill="url(#g)"/><g fill="#0f172a" opacity="0.7"><rect x="40" y="150" width="70" height="210"/><rect x="130" y="90" width="60" height="270"/><rect x="210" y="180" width="80" height="180"/><rect x="320" y="60" width="70" height="300"/><rect x="410" y="140" width="90" height="220"/><rect x="520" y="100" width="70" height="260"/></g><g fill="#fde68a" opacity="0.8"><rect x="140" y="110" width="12" height="12"/><rect x="166" y="140" width="12" height="12"/><rect x="336" y="90" width="12" height="12"/><rect x="360" y="130" width="12" height="12"/></g></svg>`,
  },
  {
    id: "product",
    label: "Studio product",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#312e81"/><stop offset="1" stop-color="#06b6d4"/></linearGradient></defs><rect width="640" height="360" fill="url(#g)"/><ellipse cx="320" cy="300" rx="190" ry="26" fill="#000" opacity="0.35"/><rect x="280" y="120" width="80" height="150" rx="18" fill="#e9d5ff" opacity="0.9"/><rect x="300" y="92" width="40" height="34" rx="8" fill="#c4b5fd"/><circle cx="320" cy="190" r="18" fill="#7c3aed" opacity="0.8"/></svg>`,
  },
];

function toDataUrl(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function ImageStudio() {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [motion, setMotion] = useState(MOTIONS[0].id);
  const [style, setStyle] = useState("Realistic");
  const [aspect, setAspect] = useState<DemoVideo["aspect"]>("16:9");
  const [duration, setDuration] = useState(8);
  const [voice, setVoice] = useState("none");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { status, progress, stepLabel, result, start, reset } =
    useDemoGeneration();

  const working = status === "working";
  const done = status === "done" && result;
  const motionLabel = MOTIONS.find((item) => item.id === motion)?.label ?? "";
  const voiceLabel =
    VOICES.find((item) => item.id === voice)?.label ?? "No voice over";

  function handleFile(file?: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (JPG, PNG or WebP).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image is too large. Please use one under 8 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(String(reader.result));
      setFileName(file.name);
      toast.success("Image added — describe the motion you want.");
    };
    reader.readAsDataURL(file);
  }

  function handleGenerate() {
    if (working) return;
    if (!image) {
      toast.error("Add an image first, or pick one of the demo images.");
      return;
    }
    if (prompt.trim().length < 6) {
      toast.error("Describe the motion you want (6+ characters).");
      return;
    }
    start({
      prompt: `${prompt.trim()} — ${motionLabel}`,
      mode: "image",
      style,
      aspect,
      duration,
      voice: voiceLabel,
    });
  }

  return (
    <div className="ring-gradient relative overflow-hidden rounded-3xl bg-white/[0.04] p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-6">
      <div className="pointer-events-none absolute -right-20 -top-20 size-52 rounded-full bg-blue-600/25 blur-3xl" />

      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-white">
          Bring a still photo to life
        </h2>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-200/90">
          <span className="size-1.5 rounded-full bg-amber-300" />
          Demo mode
        </span>
      </div>

      <div className="relative mt-4 grid gap-4 lg:grid-cols-[1fr_1.05fr]">
        <div>
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              handleFile(event.dataTransfer.files?.[0]);
            }}
            className={cn(
              "relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-4 text-center transition",
              dragging
                ? "border-violet-400 bg-violet-500/10"
                : "border-white/15 bg-[#0d0a1d]/60",
            )}
          >
            {image ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt="Uploaded preview"
                  className="max-h-64 w-full rounded-xl object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setFileName("");
                  }}
                  className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-black/60 text-white/80 hover:bg-black/80"
                  aria-label="Remove image"
                >
                  <X className="size-4" />
                </button>
              </>
            ) : (
              <>
                <span className="grid size-12 place-items-center rounded-2xl border border-white/15 bg-white/5 text-violet-200">
                  <ImagePlus className="size-6" />
                </span>
                <p className="mt-3 text-sm font-medium text-white">
                  Drop an image here
                </p>
                <p className="mt-1 text-xs text-white/45">
                  JPG, PNG or WebP · up to 8 MB
                </p>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => inputRef.current?.click()}
                  className="mt-3 rounded-lg brand-gradient text-white"
                >
                  <Upload className="size-3.5" />
                  Choose image
                </Button>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
          </div>

          {fileName && (
            <p className="mt-2 truncate text-[11px] text-white/40">{fileName}</p>
          )}

          <div className="mt-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">
              Or try a demo image
            </p>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {DEMO_IMAGES.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => {
                    setImage(toDataUrl(demo.svg));
                    setFileName("");
                  }}
                  className={cn(
                    "overflow-hidden rounded-lg border transition",
                    image === toDataUrl(demo.svg)
                      ? "border-violet-400"
                      : "border-white/10 hover:border-white/25",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={toDataUrl(demo.svg)}
                    alt={demo.label}
                    className="h-14 w-full object-cover"
                  />
                  <span className="block bg-black/40 py-1 text-[10px] text-white/70">
                    {demo.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <Textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            disabled={working}
            rows={3}
            placeholder="Add gentle camera motion: the clouds drift slowly and warm sunlight sweeps across the valley…"
            className="min-h-24 resize-none rounded-2xl border-white/10 bg-[#0d0a1d]/70 p-4 text-[15px] leading-relaxed text-white placeholder:text-white/30 focus-visible:border-violet-400/60 focus-visible:ring-violet-500/25"
            aria-label="Motion prompt"
          />

          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                Motion
              </label>
              <Select value={motion} onValueChange={setMotion} disabled={working}>
                <SelectTrigger className="h-10 w-full rounded-xl border-white/10 bg-white/[0.04] text-sm text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOTIONS.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                Look
              </label>
              <Select value={style} onValueChange={setStyle} disabled={working}>
                <SelectTrigger className="h-10 w-full rounded-xl border-white/10 bg-white/[0.04] text-sm text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                Aspect
              </label>
              <div className="flex gap-1.5">
                {(["16:9", "9:16", "1:1"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setAspect(item)}
                    disabled={working}
                    className={cn(
                      "flex-1 rounded-xl border py-2.5 text-xs font-medium transition",
                      aspect === item
                        ? "border-violet-400/60 bg-violet-500/15 text-white"
                        : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20",
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                Duration
              </label>
              <div className="flex gap-1.5">
                {[5, 8, 10].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setDuration(item)}
                    disabled={working}
                    className={cn(
                      "flex-1 rounded-xl border py-2.5 text-xs font-medium transition",
                      duration === item
                        ? "border-violet-400/60 bg-violet-500/15 text-white"
                        : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20",
                    )}
                  >
                    {item}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-2.5 space-y-1.5">
            <label className="text-[11px] font-medium uppercase tracking-wider text-white/40">
              Voice over
            </label>
            <Select value={voice} onValueChange={setVoice} disabled={working}>
              <SelectTrigger className="h-10 w-full rounded-xl border-white/10 bg-white/[0.04] text-sm text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VOICES.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={working}
            size="lg"
            className="mt-4 h-12 w-full rounded-xl brand-gradient text-[15px] font-semibold text-white shadow-xl shadow-blue-900/40 disabled:opacity-70"
          >
            {working ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Animating… {Math.round(progress)}%
              </>
            ) : (
              <>
                <Sparkles className="size-5" />
                Generate Video
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
          <p className="mt-2 text-center text-[11px] text-white/35">
            Demo only. Your image never leaves this browser.
          </p>
        </div>
      </div>

      {working && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-[#0d0a1d]/60 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-white/75">
              <Loader2 className="size-3.5 animate-spin text-violet-300" />
              {stepLabel}
            </span>
            <span className="text-white/40">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="mt-2 h-1.5 bg-white/10" />
        </div>
      )}

      {done && (
        <div className="mt-4 animate-fade-up rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-3 sm:p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="w-full sm:w-48 sm:shrink-0">
              {image ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt="Animated demo"
                    className="size-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                    {motionLabel}
                  </span>
                </div>
              ) : (
                <VideoThumb video={result} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-emerald-300">
                <Check className="size-3.5" /> Demo clip ready
              </p>
              <h3 className="mt-1 truncate text-sm font-semibold text-white">
                {result.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs text-white/50">
                {result.prompt}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  asChild
                  size="sm"
                  className="rounded-lg brand-gradient text-white"
                >
                  <Link href={`/videos/${result.id}`}>Open preview</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="rounded-lg border-white/15 bg-white/5 text-white"
                >
                  <Link href={`/videos/${result.id}/download`}>
                    <Download className="size-3.5" />
                    Download
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={reset}
                  className="rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
                >
                  <RotateCcw className="size-3.5" />
                  New
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
