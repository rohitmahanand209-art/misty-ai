"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { getVideos } from "@/lib/demo-store";
import type { DemoVideo } from "@/lib/demo-data";
import { VideoCard } from "@/components/video-thumb";

export function RecentShowcase() {
  const [videos, setVideos] = useState<DemoVideo[]>([]);

  useEffect(() => {
    setVideos(getVideos().slice(0, 4));
  }, []);

  if (videos.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300/90">
            Made with Misty
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Sample clips from the studio
          </h2>
          <p className="mt-2 max-w-xl text-sm text-white/50">
            Demo previews that ship with your workspace so you can explore the
            experience before the AI render engine goes live.
          </p>
        </div>
        <Link
          href="/my-videos"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
        >
          View all videos
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </section>
  );
}
