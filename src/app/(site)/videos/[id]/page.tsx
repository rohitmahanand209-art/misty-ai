"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Check,
  Copy,
  Download,
  Film,
  Info,
  Layers,
  MonitorPlay,
  Palette,
  Sparkles,
  Trash2,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { VideoThumb, VideoCard } from "@/components/video-thumb";
import {
  deleteVideo,
  getVideos,
  subscribeStore,
} from "@/lib/demo-store";
import { MODE_LABELS, type DemoVideo } from "@/lib/demo-data";
import { detectCharacterAction } from "@/lib/motion-intent";

const MODE_ROUTES: Record<DemoVideo["mode"], string> = {
  text: "/text-to-video",
  image: "/image-to-video",
  cartoon: "/cartoon-video",
  voice: "/voice",
};

export default function VideoDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [videos, setVideos] = useState<DemoVideo[]>([]);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const sync = () => {
      setVideos(getVideos());
      setReady(true);
    };
    sync();
    return subscribeStore(sync);
  }, []);

  const video = videos.find((item) => item.id === params.id);

  if (!ready) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-16 text-center sm:px-6">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/5 text-violet-200">
          <Film className="size-6" />
        </span>
        <h1 className="mt-4 text-xl font-semibold text-white">
          Video not found
        </h1>
        <p className="mt-2 text-sm text-white/45">
          This demo project may have been deleted, or it lives in another
          browser.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button asChild className="rounded-xl brand-gradient text-white">
            <Link href="/my-videos">Back to My Videos</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-xl border-white/15 bg-white/5 text-white"
          >
            <Link href="/text-to-video">Create new</Link>
          </Button>
        </div>
      </div>
    );
  }

  const related = videos
    .filter((item) => item.id !== video.id && item.mode === video.mode)
    .slice(0, 3);
  const fallbackRelated = videos
    .filter((item) => item.id !== video.id)
    .slice(0, 3);
  const suggestions = related.length ? related : fallbackRelated;

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(video!.prompt);
      setCopied(true);
      toast.success("Prompt copied.");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy — please select the text manually.");
    }
  }

  function handleDelete() {
    deleteVideo(video!.id);
    toast.success("Video deleted.");
    router.push("/my-videos");
  }

  const meta = [
    { icon: Palette, label: "Style", value: video.style },
    { icon: MonitorPlay, label: "Resolution", value: video.resolution },
    { icon: Layers, label: "Aspect", value: video.aspect },
    { icon: Volume2, label: "Voice", value: video.voice },
    {
      icon: Calendar,
      label: "Created",
      value: new Date(video.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-6 pt-6 sm:px-6 sm:pt-9 lg:px-8">
      <Link
        href="/my-videos"
        className="inline-flex items-center gap-1.5 text-xs text-white/45 hover:text-white"
      >
        <ArrowLeft className="size-3.5" />
        Back to My Videos
      </Link>

      <div className="mt-4 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div>
          <div className="ring-gradient relative overflow-hidden rounded-3xl bg-black/40 p-2.5">
            <VideoThumb
              video={video}
              className="rounded-2xl"
              interactive={false}
              controls
            />
            <div className="pointer-events-none absolute left-5 top-5 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white/80 backdrop-blur">
              {video.source === "procedural"
                ? "AI still · simulated motion"
                : "Simulated preview"}
            </div>
          </div>
          {video.source === "procedural" && video.motion === "simulated" && (
            <p className="mt-2 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-3 py-2 text-[11px] leading-relaxed text-amber-100/75">
              <span className="font-medium text-amber-200">Simulated motion:</span>{" "}
              the scene image is real and AI-generated, but the movement is
              created by Misty AI in your browser (camera dolly, parallax,
              drifting particles). No AI video model animated the subject, so
              it does not perform actions from the prompt.
              {detectCharacterAction(video.prompt) && (
                <>
                  {" "}
                  Your prompt asks the subject to{" "}
                  <span className="font-medium text-amber-200">
                    {detectCharacterAction(video.prompt)}
                  </span>
                  ; its legs, body and head stay still.
                </>
              )}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/55">
              {MODE_LABELS[video.mode]}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/55">
              {video.duration}s
            </span>
            <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[11px] text-emerald-300">
              Ready
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/55">
              {video.sizeLabel}
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {video.title}
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-white/50">
            {video.prompt}
          </p>

          <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] p-3.5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                Prompt
              </p>
              <button
                onClick={copyPrompt}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-violet-300 hover:bg-white/5 hover:text-violet-200"
              >
                {copied ? (
                  <Check className="size-3" />
                ) : (
                  <Copy className="size-3" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-white/60">
              {video.prompt}
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {meta.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-xl border border-white/8 bg-white/[0.02] p-2.5"
                >
                  <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/35">
                    <Icon className="size-3" />
                    {item.label}
                  </p>
                  <p className="mt-1 truncate text-[11px] font-medium text-white/75">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button
              asChild
              className="h-11 flex-1 rounded-xl brand-gradient text-white"
            >
              <Link href={`/videos/${video.id}/download`}>
                <Download className="size-4" />
                Download
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 flex-1 rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              <Link href={MODE_ROUTES[video.mode]}>
                <Sparkles className="size-4" />
                Create similar
              </Link>
            </Button>
          </div>

          {confirming ? (
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-rose-400/25 bg-rose-500/10 p-2.5">
              <p className="flex-1 text-[11px] text-rose-200">
                Delete this demo video?
              </p>
              <Button
                size="sm"
                onClick={handleDelete}
                className="h-7 rounded-md bg-rose-500 text-[11px] text-white"
              >
                Delete
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirming(false)}
                className="h-7 rounded-md text-[11px] text-white/60"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="mt-2 inline-flex items-center gap-1 text-[11px] text-white/35 hover:text-rose-300"
            >
              <Trash2 className="size-3" />
              Delete video
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-[12px] leading-relaxed text-white/40">
        <Info className="mt-0.5 size-4 shrink-0 text-violet-300" />
        <p>
          This preview is a design placeholder — Misty AI is not generating real
          video yet. The download page lets you export a demo poster and project
          details so you can test the full flow.
        </p>
      </div>

      {suggestions.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-white">More from your studio</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((item) => (
              <VideoCard key={item.id} video={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
