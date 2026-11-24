import Link from "next/link";
import { ArrowRight, Check, Languages, Mic, Volume2 } from "lucide-react";
import { VoiceStudio } from "@/components/voice-studio";
import { VoiceSamples } from "@/components/voice-samples";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Hindi & English AI Voice",
  description:
    "Preview natural Hindi and English AI voice over for your videos with Misty AI.",
};

const FEATURES = [
  "Male and female voices in Hindi and English",
  "Adjustable speaking speed for reels and ads",
  "Instant preview before you commit",
  "Save scripts as voice projects in My Videos",
];

export default function VoicePage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-6 pt-8 sm:px-6 sm:pt-12 lg:px-8">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/25 bg-indigo-500/10 px-3 py-1.5 text-[11px] font-medium text-indigo-200">
          <Mic className="size-3.5" />
          Hindi & English AI Voice
        </div>
        <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
          Narration that feels{" "}
          <span className="text-gradient">natural and human.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/55 sm:text-base">
          Write your script, choose a voice and listen instantly. Misty AI
          supports both Hindi and English so your message lands with every
          viewer.
        </p>
      </div>

      <div className="mt-7">
        <VoiceStudio />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Languages className="size-4 text-violet-300" />
            What you get
          </h2>
          <ul className="mt-3 space-y-2">
            {FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 text-[13px] text-white/60"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                {feature}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11px] leading-relaxed text-white/35">
            The voice samples here use your device&apos;s built-in speech engine
            for preview. Premium studio voices will be connected at launch — no
            paid API is used in this demo.
          </p>
        </div>

        <div className="ring-gradient rounded-2xl bg-white/[0.03] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Volume2 className="size-4 text-violet-300" />
              Quick voice samples
            </h2>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/50">
              Tap to listen
            </span>
          </div>
          <VoiceSamples />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-gradient-to-r from-indigo-600/15 to-blue-600/10 p-5">
        <div>
          <p className="text-sm font-semibold text-white">
            Put your voice over on a video
          </p>
          <p className="mt-1 text-xs text-white/50">
            Choose a voice directly inside the text to video studio.
          </p>
        </div>
        <Button asChild className="rounded-xl brand-gradient text-white">
          <Link href="/text-to-video">
            Create a video
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
