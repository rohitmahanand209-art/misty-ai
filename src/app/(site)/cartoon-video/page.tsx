import Link from "next/link";
import { ArrowRight, Baby, Clapperboard, Palette, Sparkles } from "lucide-react";
import { PromptStudio } from "@/components/prompt-studio";
import { Button } from "@/components/ui/button";
import { CARTOON_STYLES } from "@/lib/demo-data";

export const metadata = {
  title: "AI Cartoon Video Maker",
  description:
    "Create anime, 3D Pixar, storybook and comic style cartoon videos with Misty AI.",
};

const STYLE_NAMES = CARTOON_STYLES.map((style) => style.name);

const CARTOON_IDEAS = [
  "A baby elephant dancing in a magical forest with glowing fireflies",
  "A brave little girl riding a paper boat down a rainbow river",
  "A cheeky monkey selling mangoes in a colourful village market",
];

const USE_CASES = [
  {
    icon: Baby,
    title: "Kids channels",
    desc: "Friendly characters, bright palettes and gentle motion for nursery rhymes and stories.",
  },
  {
    icon: Clapperboard,
    title: "Explainers",
    desc: "Turn a script into a simple animated explainer that holds attention on mobile.",
  },
  {
    icon: Sparkles,
    title: "Social hooks",
    desc: "Cartoon intros and reaction clips that stop the scroll in the first second.",
  },
];

export default function CartoonVideoPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-6 pt-8 sm:px-6 sm:pt-12 lg:px-8">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/25 bg-fuchsia-500/10 px-3 py-1.5 text-[11px] font-medium text-fuchsia-200">
          <Palette className="size-3.5" />
          AI Cartoon Video Maker
        </div>
        <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
          Turn stories into{" "}
          <span className="text-gradient">cartoon videos.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/55 sm:text-base">
          Pick a cartoon look, describe your characters and scene, then preview
          the demo. Perfect for kids content, explainers and playful brand
          clips.
        </p>
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <PromptStudio
          mode="cartoon"
          defaultStyle="Anime"
          styleOptions={STYLE_NAMES}
          ideas={CARTOON_IDEAS}
          heading="Describe your cartoon scene"
          subheading="Mention characters, setting and the action you want them to do."
          placeholder="A cheerful baby elephant with a tiny red scarf dancing in a magical forest, glowing fireflies, bright pastel colours, smooth loop…"
          buttonLabel="Generate Cartoon"
        />

        <aside className="space-y-4">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <h2 className="text-sm font-semibold text-white">Cartoon looks</h2>
            <div className="mt-3 grid gap-2">
              {CARTOON_STYLES.map((style) => (
                <div
                  key={style.id}
                  className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-2.5"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/5 text-base">
                    <span aria-hidden>{style.emoji}</span>
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white">
                      {style.name}
                    </p>
                    <p className="truncate text-[11px] text-white/45">
                      {style.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-white/35">
              Choose the matching style in the dropdown before generating.
            </p>
          </div>
        </aside>
      </div>

      <section className="mt-10 grid gap-3 sm:grid-cols-3">
        {USE_CASES.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-2xl border border-white/8 bg-gradient-to-br from-fuchsia-600/10 to-purple-600/5 p-4"
            >
              <span className="grid size-9 place-items-center rounded-xl border border-fuchsia-400/25 bg-fuchsia-500/10 text-fuchsia-200">
                <Icon className="size-4" />
              </span>
              <p className="mt-3 text-sm font-semibold text-white">
                {item.title}
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-white/50">
                {item.desc}
              </p>
            </div>
          );
        })}
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-gradient-to-r from-fuchsia-600/15 to-violet-600/10 p-5">
        <div>
          <p className="text-sm font-semibold text-white">
            Add a Hindi or English narrator
          </p>
          <p className="mt-1 text-xs text-white/50">
            Give your cartoon a friendly voice in the voice studio.
          </p>
        </div>
        <Button asChild className="rounded-xl brand-gradient text-white">
          <Link href="/voice">
            Open voice studio
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
