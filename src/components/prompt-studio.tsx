"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Download,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  Wand2,
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
import { useAuth } from "@/components/providers/auth-provider";
import {
  PROMPT_IDEAS,
  STYLES,
  VIDEO_SECONDS,
  VOICES,
  countVideosInQuota,
  getPlanLimit,
  quotaLabel,
  type DemoVideo,
  type VideoMode,
} from "@/lib/demo-data";
import { getVideos, subscribeStore } from "@/lib/demo-store";
import { VideoThumb } from "@/components/video-thumb";
import { cn } from "@/lib/utils";

const ASPECTS: { value: DemoVideo["aspect"]; label: string; hint: string }[] = [
  { value: "16:9", label: "16:9", hint: "YouTube" },
  { value: "9:16", label: "9:16", hint: "Reels" },
];

export function PromptStudio({
  mode = "text",
  defaultStyle = "Cinematic",
  compact = false,
  heading,
  subheading,
  styleOptions = STYLES,
  placeholder,
  buttonLabel,
  ideas = PROMPT_IDEAS,
}: {
  mode?: VideoMode;
  defaultStyle?: string;
  compact?: boolean;
  heading?: string;
  subheading?: string;
  styleOptions?: string[];
  placeholder?: string;
  buttonLabel?: string;
  ideas?: string[];
}) {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState(defaultStyle);
  const [aspect, setAspect] = useState<DemoVideo["aspect"]>("16:9");
  const duration = VIDEO_SECONDS;
  const [voice, setVoice] = useState("en-female");
  const { user } = useAuth();
  const [library, setLibrary] = useState<DemoVideo[]>([]);

  useEffect(() => {
    const sync = () => setLibrary(getVideos());
    sync();
    return subscribeStore(sync);
  }, []);

  const plan = user?.plan ?? "Free";
  const planLimit = getPlanLimit(plan);
  const videosUsed = countVideosInQuota(library, plan);
  const limitReached = videosUsed >= planLimit.videos;
  const canLive = user?.role === "admin";
  const [liveMode, setLiveMode] = useState(false);
  const provider = canLive && liveMode ? "procedural" : "demo";
  const {
    status,
    progress,
    stepLabel,
    steps,
    result,
    error,
    retryAfter,
    canFallback,
    usedSceneImage,
    start,
    reset,
    renderFallback,
  } = useDemoGeneration(provider);

  const working = status === "working";
  const done = status === "done" && result;
  const voiceLabel = VOICES.find((item) => item.id === voice)?.label ?? "No voice over";

  const [countdown, setCountdown] = useState(0);
  useEffect(() => {
    setCountdown(retryAfter);
  }, [retryAfter]);
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);
  const retryReady = retryAfter > 0 && countdown <= 0;

  function handleGenerate() {
    if (working) return;
    if (prompt.trim().length < 8) {
      toast.error("Add a little more detail to your prompt (8+ characters).");
      return;
    }
    if (limitReached) {
      toast.error(
        `${plan} plan limit reached (${videosUsed}/${planLimit.videos} videos this ${planLimit.period}). Upgrade for more.`,
      );
      return;
    }
    start({
      prompt: prompt.trim(),
      mode,
      style,
      aspect,
      duration,
      voice: voiceLabel,
    });
  }

  return (
    <section
      className={cn(
        "ring-gradient relative min-w-0 overflow-hidden rounded-3xl bg-white/[0.04] p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-6",
        compact ? "" : "sm:p-7",
      )}
    >
      <div className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-violet-600/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 size-52 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-violet-300/90">
            <Wand2 className="size-3.5" />
            AI Video Studio
          </div>
          <h2 className="mt-1 text-lg font-semibold text-white sm:text-xl">
            {heading ?? "Describe your video"}
          </h2>
          {!compact && (
            <p className="mt-1 max-w-md text-sm text-white/50">
              {subheading ??
                "Write what you want to see. Misty AI handles the camera, mood and motion."}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {canLive && (
            <button
              type="button"
              onClick={() => setLiveMode((value) => !value)}
              disabled={working}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition disabled:opacity-60",
                liveMode
                  ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                  : "border-white/15 bg-white/5 text-white/55 hover:text-white",
              )}
              title="Admin only: render a real video file locally in your browser"
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  liveMode ? "bg-emerald-300" : "bg-white/30",
                )}
              />
              Live render {liveMode ? "on" : "off"}
            </button>
          )}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
              provider === "procedural"
                ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200/90"
                : "border-amber-400/25 bg-amber-400/10 text-amber-200/90",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                provider === "procedural" ? "bg-emerald-300" : "bg-amber-300",
              )}
            />
            {provider === "procedural" ? "AI scene render" : "Demo mode"}
          </span>
        </div>
      </div>

      <div className="relative mt-4">
        <Textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder={
            placeholder ??
            "A misty Himalayan valley at sunrise, cinematic drone shot, soft golden light, fog rolling over pine trees…"
          }
          disabled={working}
          rows={compact ? 4 : 5}
          className="min-h-28 resize-none rounded-2xl border-white/10 bg-[#0d0a1d]/70 p-4 text-[15px] leading-relaxed text-white placeholder:text-white/30 focus-visible:border-violet-400/60 focus-visible:ring-violet-500/25 sm:min-h-32 sm:text-base"
          aria-label="Video prompt"
        />
        <div className="mt-2 flex items-center justify-between text-[11px] text-white/35">
          <span>{prompt.trim().length} characters</span>
          <span className="hidden sm:inline">
            Tip: mention camera, lighting and mood
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {ideas.slice(0, 3).map((idea) => (
          <button
            key={idea}
            type="button"
            onClick={() => setPrompt(idea)}
            disabled={working}
            className="max-w-full truncate rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-white/60 transition hover:border-violet-400/40 hover:text-white disabled:opacity-50"
          >
            {idea}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium uppercase tracking-wider text-white/40">
            Style
          </label>
          <Select value={style} onValueChange={setStyle} disabled={working}>
            <SelectTrigger className="h-10 w-full rounded-xl border-white/10 bg-white/[0.04] text-sm text-white">
              <SelectValue placeholder="Pick a style" />
            </SelectTrigger>
            <SelectContent>
              {styleOptions.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-medium uppercase tracking-wider text-white/40">
            Voice over
          </label>
          <Select value={voice} onValueChange={setVoice} disabled={working}>
            <SelectTrigger className="h-10 w-full rounded-xl border-white/10 bg-white/[0.04] text-sm text-white">
              <SelectValue placeholder="Pick a voice" />
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
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium uppercase tracking-wider text-white/40">
            Aspect ratio
          </label>
          <div className="flex gap-1.5">
            {ASPECTS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setAspect(item.value)}
                disabled={working}
                className={cn(
                  "flex flex-1 flex-col items-center rounded-xl border px-2 py-2 text-xs transition",
                  aspect === item.value
                    ? "border-violet-400/60 bg-violet-500/15 text-white"
                    : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:text-white",
                )}
              >
                <span className="font-medium">{item.label}</span>
                <span className="text-[10px] text-white/40">{item.hint}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-medium uppercase tracking-wider text-white/40">
            Duration
          </label>
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
            <span className="text-xs font-medium text-white">
              {VIDEO_SECONDS} seconds
            </span>
            <span className="text-[10px] text-white/40">
              Fixed on every plan
            </span>
          </div>
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={working}
        size="lg"
        className="mt-5 h-12 w-full rounded-xl brand-gradient text-[15px] font-semibold text-white shadow-xl shadow-violet-900/40 transition hover:opacity-95 disabled:opacity-70"
      >
        {working ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            Generating… {Math.round(progress)}%
          </>
        ) : (
          <>
            <Sparkles className="size-5" />
            {buttonLabel ?? "Generate Video"}
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>

      <p
        className={cn(
          "mt-2.5 text-center text-[11px] leading-relaxed",
          limitReached ? "text-amber-200/80" : "text-white/35",
        )}
      >
        {plan} plan · {videosUsed} of {planLimit.videos} videos used this{" "}
        {planLimit.period} ({quotaLabel(plan)})
        {limitReached ? " — limit reached, upgrade to keep creating." : ""}
      </p>

      <p className="mt-1 text-center text-[11px] leading-relaxed text-white/35">
        {provider === "procedural"
          ? "Scene image from the free Pollinations service (no API key). The 10s video is animated and encoded locally in your browser — nothing is uploaded, and the file stays on this device."
          : "Demo interface only — no real AI render or paid API is called. Your settings are saved locally for preview."}
      </p>

      {working && (
        <div className="mt-4 animate-fade-up rounded-2xl border border-white/10 bg-[#0d0a1d]/60 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-white/75">
              <Loader2 className="size-3.5 animate-spin text-violet-300" />
              {stepLabel}
            </span>
            <span className="text-white/40">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="mt-2 h-1.5 bg-white/10" />
          <div className="mt-3 grid grid-cols-1 gap-1.5 text-[11px] text-white/35 sm:grid-cols-2">
            {steps.map((item, index) => (
              <span key={item} className="flex items-center gap-1.5">
                {index < steps.indexOf(stepLabel) ? (
                  <Check className="size-3 text-emerald-400" />
                ) : (
                  <span className="size-1.5 rounded-full bg-white/20" />
                )}
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/[0.08] p-3">
          <p className="text-[11px] leading-relaxed text-amber-100/90">
            {error}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {canFallback && (
              <button
                type="button"
                onClick={renderFallback}
                className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Render abstract clip instead
              </button>
            )}
            {retryAfter > 0 && !retryReady && (
              <span className="rounded-lg border border-white/10 px-2.5 py-1 text-[11px] text-white/45">
                Free limit resets in {countdown}s
              </span>
            )}
            {retryReady && (
              <button
                type="button"
                onClick={handleGenerate}
                className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-200 transition hover:bg-emerald-400/15"
              >
                Retry now
              </button>
            )}
          </div>
        </div>
      )}

      {done && (
        <div className="mt-4 animate-fade-up rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-3 sm:p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="w-full sm:w-48 sm:shrink-0">
              <VideoThumb video={result} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-emerald-300">
                <Check className="size-3.5" />{" "}
                {provider === "procedural"
                  ? usedSceneImage
                    ? "AI still + simulated motion ready"
                    : "Abstract clip ready"
                  : "Demo clip ready"}
              </p>
              <h3 className="mt-1 truncate text-sm font-semibold text-white">
                {result.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs text-white/50">
                {result.prompt}
              </p>
              {provider === "procedural" && usedSceneImage && (
                <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-amber-200/80">
                  <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 font-medium">
                    Simulated motion
                  </span>
                  The still image is real; the movement is generated by this
                  app (camera move, parallax, particles) — not by an AI video
                  model.
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-white/50">
                <span className="rounded-full bg-white/5 px-2 py-0.5">
                  {result.style}
                </span>
                <span className="rounded-full bg-white/5 px-2 py-0.5">
                  {result.aspect}
                </span>
                <span className="rounded-full bg-white/5 px-2 py-0.5">
                  {result.duration}s
                </span>
                <span className="rounded-full bg-white/5 px-2 py-0.5">
                  {result.voice}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  asChild
                  size="sm"
                  className="rounded-lg brand-gradient text-white"
                >
                  <Link href={`/videos/${result.id}`}>
                    <Play className="size-3.5" />
                    Open preview
                  </Link>
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
    </section>
  );
}
