import Link from "next/link";
import { Film, Play } from "lucide-react";
import type { DemoVideo } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const ASPECT_CLASS: Record<DemoVideo["aspect"], string> = {
  "16:9": "aspect-video",
  "9:16": "aspect-[9/16]",
  "1:1": "aspect-square",
};

export function VideoThumb({
  video,
  className,
  aspect,
  gradient,
  interactive = true,
}: {
  video?: Pick<DemoVideo, "title" | "aspect" | "duration" | "gradient">;
  className?: string;
  aspect?: DemoVideo["aspect"];
  gradient?: string;
  interactive?: boolean;
}) {
  const resolvedAspect = aspect ?? video?.aspect ?? "16:9";
  const background =
    gradient ??
    video?.gradient ??
    "linear-gradient(135deg,#7c3aed 0%,#4f46e5 50%,#0ea5e9 100%)";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl",
        ASPECT_CLASS[resolvedAspect],
        className,
      )}
      style={{ backgroundImage: background }}
    >
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.18)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <div className="absolute inset-0 grid place-items-center">
        <span
          className={cn(
            "grid size-12 place-items-center rounded-full border border-white/30 bg-white/15 backdrop-blur-sm transition",
            interactive && "group-hover:scale-110 group-hover:bg-white/25",
          )}
        >
          <Play className="ml-0.5 size-5 fill-white text-white" />
        </span>
      </div>
      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/35 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-white/85 backdrop-blur-sm">
        <Film className="size-3" />
        Demo preview
      </div>
      <div className="absolute bottom-3 right-3 rounded-md bg-black/50 px-1.5 py-0.5 text-[11px] font-medium text-white/90">
        0:{(video?.duration ?? 8).toString().padStart(2, "0")}
      </div>
    </div>
  );
}

export function VideoCard({ video }: { video: DemoVideo }) {
  return (
    <Link
      href={`/videos/${video.id}`}
      className="group flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3 transition hover:-translate-y-0.5 hover:border-violet-400/30 hover:bg-white/[0.05]"
    >
      <VideoThumb video={video} />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white">{video.title}</p>
        <p className="mt-1 line-clamp-1 text-xs text-white/45">{video.prompt}</p>
      </div>
      <div className="flex items-center justify-between text-[11px] text-white/45">
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
          {video.style}
        </span>
        <span>
          {new Date(video.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>
    </Link>
  );
}
