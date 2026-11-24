"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Clock,
  Download,
  Film,
  Plus,
  Search,
  Trash2,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VideoThumb } from "@/components/video-thumb";
import {
  deleteVideo,
  getVideos,
  subscribeStore,
} from "@/lib/demo-store";
import {
  MODE_LABELS,
  type DemoVideo,
  type VideoMode,
} from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const FILTERS: { id: VideoMode | "all"; label: string }[] = [
  { id: "all", label: "All videos" },
  { id: "text", label: "Text" },
  { id: "image", label: "Image" },
  { id: "cartoon", label: "Cartoon" },
  { id: "voice", label: "Voice" },
];

export default function MyVideosPage() {
  const [videos, setVideos] = useState<DemoVideo[]>([]);
  const [filter, setFilter] = useState<VideoMode | "all">("all");
  const [query, setQuery] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setVideos(getVideos());
    sync();
    return subscribeStore(sync);
  }, []);

  const filtered = useMemo(() => {
    return videos.filter((video) => {
      const matchesMode = filter === "all" || video.mode === filter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        video.title.toLowerCase().includes(q) ||
        video.prompt.toLowerCase().includes(q) ||
        video.style.toLowerCase().includes(q);
      return matchesMode && matchesQuery;
    });
  }, [videos, filter, query]);

  const totalSeconds = videos.reduce((sum, video) => sum + video.duration, 0);

  function handleDelete(id: string) {
    deleteVideo(id);
    setConfirmId(null);
    toast.success("Video removed from your library.");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-violet-300/80">
            Library
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            My Videos
          </h1>
          <p className="mt-1.5 text-sm text-white/50">
            Every demo project you&apos;ve created, ready to preview or download.
          </p>
        </div>
        <Button asChild className="rounded-xl brand-gradient text-white">
          <Link href="/text-to-video">
            <Plus className="size-4" />
            Create video
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Total videos", value: videos.length, icon: Video },
          {
            label: "Total length",
            value: `${totalSeconds}s`,
            icon: Clock,
          },
          {
            label: "Showing",
            value: filtered.length,
            icon: Film,
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4"
            >
              <span className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-violet-200">
                <Icon className="size-4" />
              </span>
              <div>
                <p className="text-lg font-semibold leading-none text-white">
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] text-white/40">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
                filter === item.id
                  ? "border-violet-400/50 bg-violet-500/20 text-white"
                  : "border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20 hover:text-white",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, prompt or style…"
            className="h-10 rounded-xl border-white/10 bg-white/[0.04] pl-9 text-sm text-white placeholder:text-white/25"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.02] p-10 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/5 text-violet-200">
            <Film className="size-6" />
          </span>
          <h2 className="mt-3 text-sm font-semibold text-white">
            {videos.length === 0 ? "No videos yet" : "No matching videos"}
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-white/40">
            {videos.length === 0
              ? "Generate your first demo clip and it will appear here automatically."
              : "Try a different filter or clear your search to see more projects."}
          </p>
          <Button
            asChild
            size="sm"
            className="mt-4 rounded-lg brand-gradient text-white"
          >
            <Link href="/text-to-video">
              <Plus className="size-3.5" />
              Create a video
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((video) => (
            <div
              key={video.id}
              className="group rounded-2xl border border-white/8 bg-white/[0.03] p-3 transition hover:border-violet-400/25"
            >
              <Link href={`/videos/${video.id}`} className="block">
                <VideoThumb video={video} />
              </Link>
              <div className="mt-2.5 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    href={`/videos/${video.id}`}
                    className="block truncate text-sm font-medium text-white hover:text-violet-200"
                  >
                    {video.title}
                  </Link>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-white/40">
                    {video.prompt}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/50">
                  {MODE_LABELS[video.mode]}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-white/35">
                <span>
                  {video.style} · {video.aspect} · {video.duration}s
                </span>
                <span>
                  {new Date(video.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5">
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="h-8 flex-1 rounded-lg border-white/10 bg-white/[0.03] text-[11px] text-white/75 hover:bg-white/10 hover:text-white"
                >
                  <Link href={`/videos/${video.id}/download`}>
                    <Download className="size-3.5" />
                    Download
                  </Link>
                </Button>
                {confirmId === video.id ? (
                  <Button
                    size="sm"
                    onClick={() => handleDelete(video.id)}
                    onBlur={() => setConfirmId(null)}
                    className="h-8 rounded-lg bg-rose-500/90 px-2.5 text-[11px] text-white hover:bg-rose-500"
                  >
                    Confirm
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmId(video.id)}
                    className="h-8 rounded-lg px-2.5 text-white/40 hover:bg-rose-500/10 hover:text-rose-300"
                    aria-label={`Delete ${video.title}`}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
