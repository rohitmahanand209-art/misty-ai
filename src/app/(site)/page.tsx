import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clapperboard,
  Download,
  Globe2,
  ImageIcon,
  Languages,
  LayoutDashboard,
  Mic,
  Palette,
  Play,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Wand2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromptStudio } from "@/components/prompt-studio";
import { RecentShowcase } from "@/components/recent-showcase";
import { VoiceSamples } from "@/components/voice-samples";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PLANS } from "@/lib/demo-data";

const TOOLS = [
  {
    href: "/text-to-video",
    icon: Sparkles,
    title: "Text to Video",
    desc: "Describe a scene and watch it become a cinematic clip.",
    tint: "from-violet-500/25 to-indigo-500/10",
  },
  {
    href: "/image-to-video",
    icon: ImageIcon,
    title: "Image to Video",
    desc: "Upload a photo and add gentle motion, zoom and light.",
    tint: "from-blue-500/25 to-cyan-400/10",
  },
  {
    href: "/cartoon-video",
    icon: Palette,
    title: "Cartoon Maker",
    desc: "Turn stories into anime, 3D or storybook cartoons.",
    tint: "from-fuchsia-500/25 to-purple-500/10",
  },
  {
    href: "/voice",
    icon: Mic,
    title: "Hindi + English Voice",
    desc: "Natural narration for reels, ads and explainers.",
    tint: "from-indigo-500/25 to-sky-400/10",
  },
];

const FEATURES = [
  {
    icon: Smartphone,
    title: "Android-first design",
    desc: "Large tap targets, sticky actions and one-hand layouts that feel native on mobile.",
  },
  {
    icon: Languages,
    title: "Hindi + English voices",
    desc: "Switch narration language per project with natural pacing and clear pronunciation.",
  },
  {
    icon: Zap,
    title: "Fast demo flow",
    desc: "Prompt, preview and export in a single screen — no complex timeline editing.",
  },
  {
    icon: Globe2,
    title: "Made for Indian creators",
    desc: "Reels, YouTube Shorts and square ads with the aspect ratios you actually post.",
  },
  {
    icon: Download,
    title: "One-tap downloads",
    desc: "Grab a demo poster or export package from any clip in your library.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    desc: "Demo projects live in your browser. No paid APIs, no hidden uploads.",
  },
];

const STEPS = [
  {
    icon: Wand2,
    title: "Write your prompt",
    desc: "Type a sentence, paste a script, or upload a photo. Pick a style, ratio and voice.",
  },
  {
    icon: Clapperboard,
    title: "Preview the demo",
    desc: "Misty AI shows a simulated render flow so you can feel the full studio experience.",
  },
  {
    icon: Download,
    title: "Save & download",
    desc: "Keep clips in My Videos, then download a demo poster or share the preview link.",
  },
];

const TESTIMONIALS = [
  {
    name: "Ananya R.",
    role: "Reels creator, Bengaluru",
    quote:
      "The Hindi voice over is exactly what my audience needed. I drafted three reels on my phone during a commute.",
  },
  {
    name: "Karan M.",
    role: "Small business owner, Jaipur",
    quote:
      "I made a product teaser for my store in ten minutes. The interface is simple enough for my whole team.",
  },
  {
    name: "Fatima S.",
    role: "Teacher & YouTuber, Hyderabad",
    quote:
      "Cartoon mode is perfect for my explainer channel. The storybook style looks premium and loads fast.",
  },
];

const FAQS = [
  {
    q: "Does Misty AI generate real videos right now?",
    a: "Not yet. This is a design preview with a working interface. Generating shows a simulated render and saves a demo project locally. No AI model or paid API is connected.",
  },
  {
    q: "Will my Hindi and English voice over work?",
    a: "Voice samples on this demo use your device's built-in speech engine so you can hear the pacing. Studio-grade voice models will be enabled at launch.",
  },
  {
    q: "Do I need a credit card to try it?",
    a: "No. The Free plan is open to everyone and no payment gateway is connected in this preview. Pricing pages are informational only.",
  },
  {
    q: "Where are my projects stored?",
    a: "Demo projects are stored in your browser's local storage on this device. Clearing site data removes them, so download anything you want to keep.",
  },
  {
    q: "Can I use Misty AI on Android?",
    a: "Yes. The whole studio is designed mobile-first, with large tap targets, sticky generate buttons and layouts that work from 360px upward.",
  },
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] grid-bg" />

      <section className="relative mx-auto w-full max-w-7xl px-4 pb-8 pt-10 sm:px-6 sm:pt-16 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div className="min-w-0 animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1.5 text-[11px] font-medium text-violet-200 sm:text-xs">
              <span className="flex size-1.5 rounded-full bg-violet-300" />
              New · Hindi + English AI voice over
              <ArrowRight className="size-3" />
            </div>

            <h1 className="mt-5 text-[2.4rem] font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl">
              Create Amazing
              <br />
              <span className="text-gradient">Videos with AI.</span>
            </h1>

            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/60 sm:text-lg">
              Misty AI turns a sentence or a photo into a polished video — with
              cinematic styles, reels-ready formats and natural Hindi or English
              narration. Built for creators on Android.
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-xl brand-gradient px-6 text-[15px] font-semibold text-white shadow-xl shadow-violet-900/40"
              >
                <Link href="#studio">
                  <Sparkles className="size-5" />
                  Start creating free
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-xl border-white/15 bg-white/5 px-6 text-[15px] text-white hover:bg-white/10"
              >
                <Link href="/my-videos">
                  <Play className="size-4" />
                  Watch demo clips
                </Link>
              </Button>
            </div>

            <div className="mt-7 grid max-w-lg grid-cols-3 gap-3">
              {[
                { value: "12k+", label: "Demo projects" },
                { value: "2", label: "Voice languages" },
                { value: "4.9", label: "Creator rating", star: true },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5"
                >
                  <p className="flex items-center gap-1 text-lg font-semibold text-white">
                    {stat.value}
                    {stat.star && (
                      <Star className="size-3.5 fill-amber-300 text-amber-300" />
                    )}
                  </p>
                  <p className="text-[11px] text-white/45">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="studio" className="min-w-0 animate-fade-up scroll-mt-24">
            <PromptStudio compact />
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-white/40">
              <span className="flex items-center gap-1">
                <Check className="size-3 text-emerald-400" /> No card needed
              </span>
              <span className="flex items-center gap-1">
                <Check className="size-3 text-emerald-400" /> Works on Android
              </span>
              <span className="flex items-center gap-1">
                <Check className="size-3 text-emerald-400" /> Hindi + English
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-2xl border border-white/8 bg-white/[0.02] px-6 py-5 text-xs text-white/35">
          <span className="font-medium uppercase tracking-[0.18em] text-white/45">
            Built for
          </span>
          {["YouTube Shorts", "Instagram Reels", "WhatsApp Status", "Product Ads", "Kids Channels"].map(
            (item) => (
              <span key={item} className="font-medium text-white/55">
                {item}
              </span>
            ),
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300/90">
              The studio
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Four ways to make your next video
            </h2>
          </div>
          <p className="max-w-md text-sm text-white/50">
            Each tool shares the same simple flow: prompt, preview, download.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className={`group relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br ${tool.tint} p-5 transition hover:-translate-y-1 hover:border-violet-400/30`}
              >
                <span className="grid size-11 place-items-center rounded-xl border border-white/15 bg-white/10 text-white">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-white">
                  {tool.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-white/55">
                  {tool.desc}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-violet-200">
                  Open tool
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <RecentShowcase />

      <section
        id="how-it-works"
        className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="rounded-3xl border border-white/8 bg-white/[0.025] p-6 sm:p-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300/90">
              How it works
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              From an idea to a clip in three steps
            </h2>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl brand-gradient text-white shadow-lg shadow-violet-900/40">
                      <Icon className="size-5" />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/30">
                      Step {index + 1}
                    </span>
                  </div>
                  <h3 className="mt-3.5 text-base font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-white/55">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300/90">
              AI voice
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Hindi and English narration that sounds human
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/55">
              Add a voice over to any project in one tap. Choose a language and
              tone, preview it instantly, then drop it into your clip.
            </p>
            <ul className="mt-5 space-y-2.5 text-sm text-white/65">
              {[
                "Male and female voices in both languages",
                "Adjustable pacing for reels and explainers",
                "Works without an account for quick previews",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
            <Button
              asChild
              className="mt-6 rounded-xl brand-gradient text-white shadow-lg shadow-violet-900/40"
            >
              <Link href="/voice">
                <Mic className="size-4" />
                Try the voice studio
              </Link>
            </Button>
          </div>
          <div className="ring-gradient rounded-3xl bg-white/[0.03] p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-white">Voice preview</p>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/50">
                Live device sample
              </span>
            </div>
            <VoiceSamples />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300/90">
            Why Misty
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Everything you need, nothing you don&apos;t
          </h2>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/8 bg-white/[0.025] p-5 transition hover:border-violet-400/25 hover:bg-white/[0.04]"
              >
                <span className="grid size-10 place-items-center rounded-xl border border-violet-400/25 bg-violet-500/15 text-violet-200">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-3.5 text-sm font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-white/50">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/8 bg-gradient-to-br from-violet-600/15 via-transparent to-blue-600/15 p-6 sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300/90">
                Pricing
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Start free, upgrade when you grow
              </h2>
              <p className="mt-2 max-w-lg text-sm text-white/50">
                Plans are previews only in this demo. No payment gateway is
                connected and nothing is charged.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              <Link href="/pricing">
                Compare all plans
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-5 ${
                  plan.highlight
                    ? "border-violet-400/40 bg-violet-500/10"
                    : "border-white/8 bg-white/[0.03]"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-2.5 left-4 rounded-full brand-gradient px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    Popular
                  </span>
                )}
                <p className="text-sm font-semibold text-white">{plan.name}</p>
                <p className="mt-1 text-xs text-white/45">{plan.tagline}</p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {plan.monthly === 0 ? "₹0" : `₹${plan.monthly}`}
                  <span className="text-xs font-normal text-white/40"> /mo</span>
                </p>
                <ul className="mt-3 space-y-1.5 text-xs text-white/55">
                  {plan.features.slice(0, 3).map((item) => (
                    <li key={item} className="flex items-start gap-1.5">
                      <Check className="mt-0.5 size-3 shrink-0 text-emerald-400" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={plan.highlight ? "default" : "outline"}
                  className={`mt-4 w-full rounded-xl ${
                    plan.highlight
                      ? "brand-gradient text-white"
                      : "border-white/15 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  <Link href="/pricing">{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <figure
              key={item.name}
              className="rounded-2xl border border-white/8 bg-white/[0.03] p-5"
            >
              <div className="flex gap-0.5 text-amber-300">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-3.5 fill-current" />
                ))}
              </div>
              <blockquote className="mt-3 text-[13px] leading-relaxed text-white/70">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-full brand-gradient text-xs font-semibold text-white">
                  {item.name[0]}
                </span>
                <span>
                  <span className="block text-xs font-medium text-white">
                    {item.name}
                  </span>
                  <span className="block text-[11px] text-white/40">
                    {item.role}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section
        id="faq"
        className="mx-auto w-full max-w-4xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300/90">
            FAQ
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Questions, answered
          </h2>
        </div>
        <Accordion
          type="single"
          collapsible
          className="mt-6 rounded-2xl border border-white/8 bg-white/[0.025] px-4 sm:px-6"
        >
          {FAQS.map((faq, index) => (
            <AccordionItem
              key={faq.q}
              value={`faq-${index}`}
              className="border-white/8"
            >
              <AccordionTrigger className="text-left text-sm font-medium text-white hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-[13px] leading-relaxed text-white/55">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl brand-gradient p-8 text-center sm:p-12">
          <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_20%,#fff_0,transparent_40%),radial-gradient(circle_at_80%_60%,#fff_0,transparent_35%)]" />
          <h2 className="relative text-2xl font-semibold tracking-tight text-white sm:text-4xl">
            Your next video starts with one sentence.
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-sm text-white/80 sm:text-base">
            Open the studio, type an idea and see the Misty AI experience in
            under a minute. Free to try on any Android phone.
          </p>
          <div className="relative mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-xl bg-white px-6 text-[15px] font-semibold text-violet-700 hover:bg-white/90"
            >
              <Link href="/signup">
                <Sparkles className="size-5" />
                Create free account
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-xl border-white/40 bg-white/10 px-6 text-[15px] text-white hover:bg-white/20"
            >
              <Link href="/dashboard">
                <LayoutDashboard className="size-4" />
                Explore dashboard
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
