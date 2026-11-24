import Link from "next/link";
import { ArrowRight, ImageIcon, Info, Layers, ScanFace } from "lucide-react";
import { ImageStudio } from "@/components/image-studio";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Image to Video",
  description:
    "Upload a photo and add cinematic motion, zoom and light with Misty AI's image to video studio.",
};

const TIPS = [
  {
    icon: ImageIcon,
    title: "Use a clear subject",
    desc: "Portraits, products and landscapes with a strong focal point animate best.",
  },
  {
    icon: Layers,
    title: "Add depth",
    desc: "Describe foreground and background so the parallax motion feels real.",
  },
  {
    icon: ScanFace,
    title: "Keep faces centred",
    desc: "Leave a little space around faces so slow zooms don't crop them.",
  },
];

export default function ImageToVideoPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-6 pt-8 sm:px-6 sm:pt-12 lg:px-8">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-500/10 px-3 py-1.5 text-[11px] font-medium text-blue-200">
          <ImageIcon className="size-3.5" />
          Image to Video
        </div>
        <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
          Give your photos{" "}
          <span className="text-gradient">gentle motion.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/55 sm:text-base">
          Upload a product shot, portrait or landscape. Add a camera move and
          Misty AI previews how it would come alive — no editing skills needed.
        </p>
      </div>

      <div className="mt-7">
        <ImageStudio />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {TIPS.map((tip) => {
          const Icon = tip.icon;
          return (
            <div
              key={tip.title}
              className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
            >
              <span className="grid size-9 place-items-center rounded-xl border border-blue-400/25 bg-blue-500/10 text-blue-200">
                <Icon className="size-4" />
              </span>
              <p className="mt-3 text-sm font-semibold text-white">
                {tip.title}
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-white/50">
                {tip.desc}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-[12px] leading-relaxed text-white/45">
        <Info className="mt-0.5 size-4 shrink-0 text-violet-300" />
        <p>
          Images are processed locally in your browser for this demo and are
          never uploaded to a server. Real AI animation will be enabled when the
          render engine launches.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-gradient-to-r from-blue-600/15 to-cyan-500/10 p-5">
        <div>
          <p className="text-sm font-semibold text-white">
            Prefer to start from words?
          </p>
          <p className="mt-1 text-xs text-white/50">
            Use the text to video studio for fully generated scenes.
          </p>
        </div>
        <Button asChild className="rounded-xl brand-gradient text-white">
          <Link href="/text-to-video">
            Text to Video
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
