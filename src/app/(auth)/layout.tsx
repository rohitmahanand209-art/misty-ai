import Link from "next/link";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { Brand } from "@/components/brand";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden border-r border-white/5 bg-[#0a0817] p-10 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-20 -top-20 size-80 rounded-full bg-violet-600/25 blur-3xl animate-aurora" />
        <div className="pointer-events-none absolute -bottom-24 right-0 size-80 rounded-full bg-blue-600/20 blur-3xl animate-aurora" />
        <div className="pointer-events-none absolute inset-0 grid-bg" />

        <div className="relative">
          <Brand />
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white">
            Create Amazing
            <br />
            <span className="text-gradient">Videos with AI.</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            Turn a sentence or a photo into a polished clip, with cinematic
            styles and natural Hindi or English narration.
          </p>
          <ul className="mt-6 space-y-2.5">
            {[
              "Text to video, image to video and cartoon tools",
              "Hindi + English AI voice over",
              "Reels, Shorts and square formats",
              "Free to start, no card required",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-white/65"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <p className="text-[13px] leading-relaxed text-white/65">
            “I made a Hindi product teaser for my store in ten minutes. The
            studio feels premium but is so easy on mobile.”
          </p>
          <p className="mt-3 text-[11px] text-white/40">
            Karan M. · Small business owner, Jaipur
          </p>
        </div>
      </div>

      <div className="relative flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:hidden">
          <Brand />
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-white"
          >
            <ArrowLeft className="size-3.5" />
            Home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-6 sm:px-8">
          <div className="w-full max-w-md">
            <div className="ring-gradient rounded-3xl bg-white/[0.035] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
              <div className="mb-5 hidden items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-violet-300/80 lg:flex">
                <Sparkles className="size-3.5" />
                Misty AI Studio
              </div>
              {children}
            </div>
            <p className="mt-4 text-center text-[11px] text-white/30">
              Demo experience · no real authentication service connected
            </p>
          </div>
        </div>

        <div className="hidden px-6 py-4 lg:block">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white"
          >
            <ArrowLeft className="size-3.5" />
            Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}
