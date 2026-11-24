"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Clock,
  Download,
  ImageIcon,
  Mic,
  Palette,
  Sparkles,
  TrendingUp,
  Video,
  Wand2,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { VideoCard } from "@/components/video-thumb";
import { Button } from "@/components/ui/button";
import { getVideos, subscribeStore } from "@/lib/demo-store";
import { MODE_LABELS, type DemoVideo } from "@/lib/demo-data";

const QUICK = [
  {
    href: "/text-to-video",
    icon: Sparkles,
    label: "Text to Video",
    desc: "Start from a sentence",
    tint: "from-violet-500/20 to-indigo-500/5",
  },
  {
    href: "/image-to-video",
    icon: ImageIcon,
    label: "Image to Video",
    desc: "Animate a photo",
    tint: "from-blue-500/20 to-cyan-500/5",
  },
  {
    href: "/cartoon-video",
    icon: Palette,
    label: "Cartoon Maker",
    desc: "Anime & 3D styles",
    tint: "from-fuchsia-500/20 to-purple-500/5",
  },
  {
    href: "/voice",
    icon: Mic,
    label: "AI Voice",
    desc: "Hindi + English",
    tint: "from-indigo-500/20 to-sky-500/5",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<DemoVideo[]>([]);

  useEffect(() => {
    const sync = () => setVideos(getVideos());
    sync();
    return subscribeStore(sync);
  }, []);

  const stats = useMemo(() => {
    const totalSeconds = videos.reduce((sum, video) => sum + video.duration, 0);
    return [
      {
        label: "Videos created",
        value: videos.length.toString(),
        icon: Video,
        hint: "All demo projects",
      },
      {
        label: "Credits left",
        value: (user?.credits ?? 0).toString(),
        icon: Wand2,
        hint: `${user?.plan ?? "Free"} plan`,
      },
      {
        label: "Total length",
        value: `${totalSeconds}s`,
        icon: Clock,
        hint: "Across your library",
      },
      {
        label: "Ready to export",
        value: videos.filter((video) => video.status === "ready").length.toString(),
        icon: Download,
        hint: "Demo posters available",
      },
    ];
  }, [videos, user]);

  const recent = videos.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-violet-300/80">
            Dashboard
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Namaste, {user?.name.split(" ")[0]}
          </h1>
          <p className="mt-1.5 text-sm text-white/50">
            Here&apos;s what&apos;s happening in your Misty AI studio today.
          </p>
        </div>
        <Button asChild className="rounded-xl brand-gradient text-white">
          <Link href="/text-to-video">
            <Sparkles className="size-4" />
            New video
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                  {stat.label}
                </span>
                <span className="grid size-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-violet-200">
                  <Icon className="size-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-white">
                {stat.value}
              </p>
              <p className="mt-0.5 text-[11px] text-white/35">{stat.hint}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Quick create</h2>
            <span className="text-[11px] text-white/35">Pick a tool</span>
          </div>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {QUICK.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl border border-white/8 bg-gradient-to-br ${item.tint} p-3 transition hover:border-violet-400/30`}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/15 bg-white/10 text-white">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-medium text-white">
                      {item.label}
                    </span>
                    <span className="block truncate text-[11px] text-white/45">
                      {item.desc}
                    </span>
                  </span>
                  <ArrowRight className="size-4 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-300" />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-600/15 to-blue-600/10 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">
              {user?.plan} plan usage
            </h2>
            <TrendingUp className="size-4 text-violet-300" />
          </div>
          <div className="mt-3 flex items-end gap-1.5">
            <span className="text-3xl font-semibold text-white">
              {user?.credits}
            </span>
            <span className="pb-1 text-xs text-white/45">credits left</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full brand-gradient"
              style={{
                width: `${Math.min(100, ((user?.credits ?? 0) / (user?.role === "admin" ? 5000 : 300)) * 100)}%`,
              }}
            />
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-white/45">
            Credits are demo values. No billing is connected in this preview.
          </p>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="mt-3 w-full rounded-lg border-white/15 bg-white/5 text-white hover:bg-white/10"
          >
            <Link href="/pricing">View plans</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Recent videos</h2>
          <Link
            href="/my-videos"
            className="inline-flex items-center gap-1 text-[11px] text-violet-300 hover:text-violet-200"
          >
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-white/12 p-8 text-center">
            <p className="text-sm text-white/60">No videos yet</p>
            <p className="mt-1 text-xs text-white/35">
              Generate your first demo clip to see it here.
            </p>
            <Button
              asChild
              size="sm"
              className="mt-3 rounded-lg brand-gradient text-white"
            >
              <Link href="/text-to-video">Create a video</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((video) => (
              <div key={video.id} className="space-y-1.5">
                <VideoCard video={video} />
                <p className="px-1 text-[10px] text-white/30">
                  {MODE_LABELS[video.mode]}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-[12px] leading-relaxed text-white/40">
        <p className="font-medium text-white/60">Demo workspace</p>
        <p className="mt-1">
          Projects are stored in this browser only. No AI model, payment gateway
          or subscription service is connected — everything here is a working
          interface for review.
        </p>
      </div>
    </div>
  );
}
