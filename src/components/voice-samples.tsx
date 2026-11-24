"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SAMPLES = [
  {
    id: "en",
    lang: "en-IN",
    label: "English",
    flag: "🇬🇧",
    text: "Welcome to Misty AI. Turn your ideas into beautiful videos in just a few seconds.",
  },
  {
    id: "hi",
    lang: "hi-IN",
    label: "हिन्दी",
    flag: "🇮🇳",
    text: "मिस्टी एआई में आपका स्वागत है। अपने विचारों को कुछ ही सेकंड में सुंदर वीडियो में बदलें।",
  },
];

export function VoiceSamples({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSupported("speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function speak(sample: (typeof SAMPLES)[number]) {
    if (!supported) return;
    if (active === sample.id) {
      window.speechSynthesis.cancel();
      setActive(null);
      return;
    }
    window.speechSynthesis.cancel();
    const next = new SpeechSynthesisUtterance(sample.text);
    next.lang = sample.lang;
    next.rate = 0.96;
    next.pitch = 1.02;
    const voices = window.speechSynthesis.getVoices();
    const match =
      voices.find((voice) => voice.lang === sample.lang) ??
      voices.find((voice) => voice.lang.startsWith(sample.id));
    if (match) next.voice = match;
    next.onend = () => setActive(null);
    next.onerror = () => setActive(null);
    utterance.current = next;
    setActive(sample.id);
    window.speechSynthesis.speak(next);
  }

  return (
    <div className={cn("space-y-3", className)}>
      {SAMPLES.map((sample) => (
        <div
          key={sample.id}
          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
        >
          <button
            type="button"
            onClick={() => speak(sample)}
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-full border transition",
              active === sample.id
                ? "border-violet-300/60 bg-violet-500/30 text-white"
                : "border-white/15 bg-white/5 text-violet-200 hover:bg-white/10",
            )}
            aria-label={`Play ${sample.label} voice sample`}
          >
            {active === sample.id ? (
              <Pause className="size-4" />
            ) : (
              <Play className="ml-0.5 size-4 fill-current" />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-white">
              <span aria-hidden>{sample.flag}</span>
              {sample.label}
              <span className="ml-auto flex items-center gap-1 text-[10px] font-normal text-white/35">
                <Volume2 className="size-3" />
                {supported ? "Sample voice" : "Preview unavailable"}
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/50">
              {sample.text}
            </p>
            {active === sample.id && (
              <div className="mt-2 flex items-end gap-0.5">
                {[6, 12, 8, 16, 10, 14, 7, 11, 5, 9].map((height, index) => (
                  <span
                    key={index}
                    className="w-1 animate-pulse rounded-full bg-violet-400/70"
                    style={{ height, animationDelay: `${index * 90}ms` }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
      <p className="text-[11px] text-white/35">
        Voice samples play using your device&apos;s built-in speech engine.
        Studio voice models arrive with the full launch.
      </p>
    </div>
  );
}
