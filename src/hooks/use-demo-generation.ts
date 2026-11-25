"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DemoVideo } from "@/lib/demo-data";
import { pickGradient } from "@/lib/demo-data";
import { createDemoVideo } from "@/lib/demo-store";
import {
  formatBytes,
  registerVideoBlob,
  releaseVideoBlob,
} from "@/lib/video-blobs";
import {
  canRenderProcedurally,
  renderProceduralVideo,
} from "@/lib/procedural-render";

export type GenerationStatus = "idle" | "working" | "done";
export type GenerationProvider = "demo" | "procedural";

const DEMO_STEPS = [
  "Reading your prompt",
  "Designing the scene",
  "Rendering demo frames",
  "Mixing the soundtrack",
  "Finishing touches",
];

const PROCEDURAL_STEPS = [
  "Reading your prompt",
  "Designing the scene",
  "Rendering frames",
  "Encoding the video",
  "Finishing touches",
];

export function useDemoGeneration(provider: GenerationProvider = "demo") {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<DemoVideo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const steps = provider === "procedural" ? PROCEDURAL_STEPS : DEMO_STEPS;

  const clear = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  useEffect(() => clear, [clear]);

  const reset = useCallback(() => {
    clear();
    setStatus("idle");
    setProgress(0);
    setStep(0);
    setError(null);
    setResult((current) => {
      if (current?.source === "procedural") releaseVideoBlob(current.id);
      return null;
    });
  }, [clear]);

  const start = useCallback(
    (input: Omit<Parameters<typeof createDemoVideo>[0], "gradient">) => {
      clear();
      setStatus("working");
      setProgress(4);
      setStep(0);
      setResult(null);
      setError(null);

      if (provider === "procedural") {
        if (!canRenderProcedurally()) {
          setStatus("idle");
          setProgress(0);
          setError(
            "This browser cannot record video locally. Switch to demo mode.",
          );
          return;
        }
        const controller = new AbortController();
        abortRef.current = controller;
        const labelCount = PROCEDURAL_STEPS.length;

        renderProceduralVideo({
          prompt: input.prompt,
          aspect: input.aspect === "9:16" ? "9:16" : "16:9",
          duration: input.duration,
          style: input.style,
          signal: controller.signal,
          onProgress: (value) => {
            setProgress(value);
            setStep(
              Math.min(labelCount - 1, Math.floor((value / 100) * labelCount)),
            );
          },
        })
          .then((blob) => {
            if (!blob || controller.signal.aborted) return;
            const video = createDemoVideo({
              ...input,
              gradient: pickGradient(
                input.prompt + input.mode + Date.now().toString(),
              ),
              source: "procedural",
              sizeLabel: formatBytes(blob.size),
            });
            registerVideoBlob(video.id, blob);
            abortRef.current = null;
            setResult(video);
            setProgress(100);
            setStep(labelCount - 1);
            setStatus("done");
          })
          .catch((reason: unknown) => {
            if (controller.signal.aborted) return;
            abortRef.current = null;
            setStatus("idle");
            setProgress(0);
            setStep(0);
            setError(
              reason instanceof Error
                ? reason.message
                : "The local render failed. Try demo mode.",
            );
          });
        return;
      }

      let value = 4;
      timer.current = setInterval(() => {
        value += Math.random() * 9 + 5;
        if (value >= 100) {
          value = 100;
          clear();
          const video = createDemoVideo({
            ...input,
            gradient: pickGradient(input.prompt + input.mode + Date.now()),
          });
          setResult(video);
          setProgress(100);
          setStep(DEMO_STEPS.length - 1);
          setStatus("done");
          return;
        }
        setProgress(value);
        setStep(Math.min(DEMO_STEPS.length - 1, Math.floor((value / 100) * DEMO_STEPS.length)));
      }, 520);
    },
    [clear, provider],
  );

  return {
    status,
    progress,
    stepLabel: steps[step],
    steps,
    result,
    error,
    start,
    reset,
  };
}
