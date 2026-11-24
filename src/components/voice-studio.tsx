"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  Download,
  Loader2,
  Mic,
  Play,
  Save,
  Square,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { pickGradient, type DemoVideo } from "@/lib/demo-data";
import { createDemoVideo } from "@/lib/demo-store";
import { cn } from "@/lib/utils";

const VOICE_OPTIONS = [
  { id: "en-female", label: "English — Female", lang: "en-IN", pitch: 1.08, rate: 0.98 },
  { id: "en-male", label: "English — Male", lang: "en-GB", pitch: 0.92, rate: 0.96 },
  { id: "hi-female", label: "Hindi — Female", lang: "hi-IN", pitch: 1.06, rate: 0.94 },
  { id: "hi-male", label: "Hindi — Male", lang: "hi-IN", pitch: 0.9, rate: 0.92 },
];

const SCRIPT_IDEAS = [
  {
    lang: "English",
    text: "Introducing Misty AI — the fastest way to turn your ideas into beautiful videos. Write a prompt, pick a style, and let the studio do the rest.",
  },
  {
    lang: "हिन्दी",
    text: "मिस्टी एआई के साथ अपने विचारों को कुछ ही सेकंड में खूबसूरत वीडियो में बदलें। अपनी कहानी लिखें, शैली चुनें और वीडियो तैयार करें।",
  },
  {
    lang: "Hinglish",
    text: "Aaj hi apna pehla AI video banao — bas ek idea likho aur Misty AI baaki sab sambhal lega. Try karo free mein!",
  },
];

export function VoiceStudio() {
  const [text, setText] = useState(SCRIPT_IDEAS[0].text);
  const [voiceId, setVoiceId] = useState(VOICE_OPTIONS[0].id);
  const [rate, setRate] = useState(0.96);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const [saved, setSaved] = useState<DemoVideo | null>(null);
  const [saving, setSaving] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  const voice = VOICE_OPTIONS.find((item) => item.id === voiceId)!;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    const load = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      window.speechSynthesis.cancel();
    };
  }, []);

  function stop() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }

  function speak() {
    if (!supported) {
      toast.error("Your browser does not support speech preview.");
      return;
    }
    if (text.trim().length < 3) {
      toast.error("Write a short script first.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = voice.lang;
    utterance.rate = rate;
    utterance.pitch = voice.pitch;
    const available = voicesRef.current.length
      ? voicesRef.current
      : window.speechSynthesis.getVoices();
    const match =
      available.find((item) => item.lang === voice.lang) ??
      available.find((item) => item.lang.startsWith(voice.lang.slice(0, 2)));
    if (match) utterance.voice = match;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  function saveProject() {
    if (text.trim().length < 3) {
      toast.error("Write a short script before saving.");
      return;
    }
    setSaving(true);
    stop();
    const words = text.trim().split(/\s+/).length;
    const duration = Math.min(15, Math.max(5, Math.round(words / 2.6)));
    const video = createDemoVideo({
      prompt: text.trim(),
      mode: "voice",
      style: "Documentary",
      aspect: "16:9",
      duration,
      voice: voice.label,
      title: `Voice over — ${voice.label.split(" — ")[0]}`,
      gradient: pickGradient(text + Date.now()),
    });
    setSaved(video);
    setSaving(false);
    toast.success("Voice project saved to My Videos.");
  }

  return (
    <div className="ring-gradient relative overflow-hidden rounded-3xl bg-white/[0.04] p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-6">
      <div className="pointer-events-none absolute -right-20 -top-24 size-56 rounded-full bg-indigo-600/25 blur-3xl" />

      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-white">
          Write a script, hear it instantly
        </h2>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-200/90">
          <span className="size-1.5 rounded-full bg-amber-300" />
          Device voice preview
        </span>
      </div>

      <div className="relative mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <Textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={6}
            className="min-h-36 resize-none rounded-2xl border-white/10 bg-[#0d0a1d]/70 p-4 text-[15px] leading-relaxed text-white placeholder:text-white/30 focus-visible:border-violet-400/60 focus-visible:ring-violet-500/25"
            placeholder="Type or paste your narration script…"
            aria-label="Voice script"
          />
          <div className="mt-2 flex items-center justify-between text-[11px] text-white/35">
            <span>{text.trim().split(/\s+/).filter(Boolean).length} words</span>
            <span>~{Math.max(1, Math.round(text.trim().split(/\s+/).filter(Boolean).length / 2.6))}s read</span>
          </div>

          <div className="mt-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">
              Try a sample script
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {SCRIPT_IDEAS.map((idea) => (
                <button
                  key={idea.lang}
                  type="button"
                  onClick={() => setText(idea.text)}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-white/60 transition hover:border-violet-400/40 hover:text-white"
                >
                  {idea.lang}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">
              Voice
            </p>
            <div className="mt-1.5 grid gap-1.5">
              {VOICE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setVoiceId(option.id);
                    setRate(option.rate);
                    stop();
                  }}
                  className={cn(
                    "flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-xs transition",
                    voiceId === option.id
                      ? "border-violet-400/60 bg-violet-500/15 text-white"
                      : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Mic className="size-3.5 text-violet-300" />
                    {option.label}
                  </span>
                  {voiceId === option.id && (
                    <Check className="size-3.5 text-violet-300" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-medium uppercase tracking-wider text-white/40">
                Speed
              </span>
              <span className="text-white/55">{rate.toFixed(2)}×</span>
            </div>
            <Slider
              value={[rate]}
              min={0.7}
              max={1.3}
              step={0.02}
              onValueChange={(value) => setRate(value[0])}
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              onClick={speaking ? stop : speak}
              className="h-11 rounded-xl brand-gradient text-white"
            >
              {speaking ? (
                <>
                  <Square className="size-4" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="size-4" />
                  Listen
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={saveProject}
              disabled={saving}
              variant="outline"
              className="h-11 rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save
            </Button>
          </div>

          <p className="text-[11px] leading-relaxed text-white/35">
            {supported
              ? "Preview uses your device's built-in voice engine. Studio voice models will be available at launch."
              : "Speech preview is unavailable in this browser, but you can still save the script as a project."}
          </p>
        </div>
      </div>

      {saved && (
        <div className="mt-4 animate-fade-up flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-3.5">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-emerald-300">
              <Check className="size-3.5" /> Saved to My Videos
            </p>
            <p className="mt-1 truncate text-sm font-medium text-white">
              {saved.title}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              asChild
              size="sm"
              className="rounded-lg brand-gradient text-white"
            >
              <Link href={`/videos/${saved.id}`}>Open</Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="rounded-lg border-white/15 bg-white/5 text-white"
            >
              <Link href={`/videos/${saved.id}/download`}>
                <Download className="size-3.5" />
                Download
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
