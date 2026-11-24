"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DemoVideo } from "@/lib/demo-data";
import { pickGradient } from "@/lib/demo-data";
import { createDemoVideo } from "@/lib/demo-store";

export type GenerationStatus = "idle" | "working" | "done";

const STEPS = [
  "Reading your prompt",
  "Designing the scene",
  "Rendering demo frames",
  "Mixing the soundtrack",
  "Finishing touches",
];

export function useDemoGeneration() {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<DemoVideo | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => clear, [clear]);

  const reset = useCallback(() => {
    clear();
    setStatus("idle");
    setProgress(0);
    setStep(0);
    setResult(null);
  }, [clear]);

  const start = useCallback(
    (input: Omit<Parameters<typeof createDemoVideo>[0], "gradient">) => {
      clear();
      setStatus("working");
      setProgress(4);
      setStep(0);
      setResult(null);

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
          setStep(STEPS.length - 1);
          setStatus("done");
          return;
        }
        setProgress(value);
        setStep(Math.min(STEPS.length - 1, Math.floor((value / 100) * STEPS.length)));
      }, 520);
    },
    [clear],
  );

  return {
    status,
    progress,
    stepLabel: STEPS[step],
    steps: STEPS,
    result,
    start,
    reset,
  };
}
