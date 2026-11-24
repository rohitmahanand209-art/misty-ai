import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Clapperboard,
  Clock,
  Languages,
  Lightbulb,
  Sparkles,
  Wand2,
} from "lucide-react";
import { PromptStudio } from "@/components/prompt-studio";
import { Button } from "@/components/ui/button";
import { RecentShowcase } from "@/components/recent-showcase";

const EXAMPLES = [
  {
    title: "Travel reel",
    prompt:
      "A misty Himalayan valley at sunrise, cinematic drone shot, fog rolling over pine forests, warm golden light.",
  },
  {
    title: "Product ad",
    prompt:
      "A luxury perfume bottle rotating on flowing silk, purple and blue studio lighting, floating petals, premium commercial.",
  },
  {
    title: "Kids story",
    prompt:
      "A cute cartoon baby elephant dancing in a magical forest, fireflies, bright colors, smooth looping animation.",
  },
  {
    title: "Motivational",
    prompt:
      "A lone climber reaching a mountain summit at dawn, epic wide shot, dramatic clouds, triumphant mood.",
  },
  {
    title: "Food promo",
    prompt:
      "Steaming masala chai poured into a glass cup, slow motion splash, warm rustic kitchen, shallow depth of field.",
  },
  {
    title: "Sci-fi short",
    prompt:
      "An astronaut floating through glowing purple clouds toward a ringed planet, dreamy atmosphere, slow orbit.",
  },
];

const TIPS = [
  {
    icon: Camera,
    title: "Direct the camera",
    desc: "Add phrases like “drone shot”, “slow pan” or “close-up” to control motion.",
  },
  {
    icon: Lightbulb,
    title: "Set the lighting",
    desc: "Mention golden hour, neon night or soft studio light for a clear mood.",
  },
  {
    icon: Clock,
    title: "Keep it short",
    desc: "One clear scene per clip works best. 5–10 seconds is ideal for reels.",
  },
  {
    icon: Languages,
    title: "Pick a voice",
    desc: "Add Hindi or English narration in the same step — no extra editor needed.",
  },
];

export const metadata = {
  title: "Text to Video",
  description:
    "Turn a written prompt into a cinematic AI video demo with Misty AI's text to video studio.",
};

export default function TextToVideoPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-6 pt-8 sm:px-6 sm:pt-12 lg:px-8">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1.5 text-[11px] font-medium text-violet-200">
          <Sparkles className="size-3.5" />
          Text to Video
        </div>
        <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
          Type an idea. Get a{" "}
          <span className="text-gradient">cinematic video.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/55 sm:text-base">
          Describe the scene, choose a style and let Misty AI build the demo
          clip. Add Hindi or English narration without leaving the page.
        </p>
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <PromptStudio mode="text" />

        <aside className="space-y-4">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Wand2 className="size-4 text-violet-300" />
              Prompt tips
            </h2>
            <div className="mt-3 space-y-3">
              {TIPS.map((tip) => {
                const Icon = tip.icon;
                return (
                  <div key={tip.title} className="flex gap-2.5">
                    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-violet-200">
                      <Icon className="size-3.5" />
                    </span>
                    <div>
                      <p className="text-xs font-medium text-white">
                        {tip.title}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-white/45">
                        {tip.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <h2 className="text-sm font-semibold text-white">Need inspiration?</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-white/45">
              Browse prompt examples below, then paste your favourite into the
              studio.
            </p>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="mt-3 w-full rounded-lg border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              <Link href="/cartoon-video">
                <Clapperboard className="size-3.5" />
                Try cartoon mode
              </Link>
            </Button>
          </div>
        </aside>
      </div>

      <section className="mt-12">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Prompt examples that work well
          </h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EXAMPLES.map((example) => (
            <div
              key={example.title}
              className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:border-violet-400/25"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-300/80">
                {example.title}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-white/60">
                “{example.prompt}”
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-4">
        <RecentShowcase />
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-gradient-to-r from-violet-600/15 to-blue-600/15 p-5">
        <div>
          <p className="text-sm font-semibold text-white">
            Want to animate a photo instead?
          </p>
          <p className="mt-1 text-xs text-white/50">
            Upload any image and add motion, zoom and narration.
          </p>
        </div>
        <Button
          asChild
          className="rounded-xl brand-gradient text-white"
        >
          <Link href="/image-to-video">
            Image to Video
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
