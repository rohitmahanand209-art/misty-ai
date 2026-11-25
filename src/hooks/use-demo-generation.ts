"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DemoVideo } from "@/lib/demo-data";
import { pickGradient } from "@/lib/demo-data";
import { createDemoVideo } from "@/lib/demo-store";
import {
  formatBytes,
  registerSceneImage,
  registerVideoBlob,
  releaseVideoBlob,
} from "@/lib/video-blobs";
import {
  canRenderProcedurally,
  renderProceduralVideo,
} from "@/lib/procedural-render";
import { generateSceneImage, SceneImageError } from "@/lib/scene-image";

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
  "Generating the scene image",
  "Animating frames",
  "Encoding the video",
  "Finishing touches",
];

type StartInput = Omit<Parameters<typeof createDemoVideo>[0], "gradient">;

export function useDemoGeneration(provider: GenerationProvider = "demo") {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<DemoVideo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState(0);
  const [canFallback, setCanFallback] = useState(false);
  const [usedSceneImage, setUsedSceneImage] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastInput = useRef<StartInput | null>(null);

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
    setRetryAfter(0);
    setCanFallback(false);
    setUsedSceneImage(false);
    setResult((current) => {
      if (current?.source === "procedural") releaseVideoBlob(current.id);
      return null;
    });
  }, [clear]);

  const runProcedural = useCallback(
    (input: StartInput, skipImage: boolean) => {
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
      const setStage = (value: number) => {
        setProgress(value);
        setStep(Math.min(labelCount - 1, Math.floor((value / 100) * labelCount)));
      };

      setStatus("working");
      setProgress(3);
      setStep(0);
      setError(null);
      setRetryAfter(0);
      setCanFallback(false);

      (async () => {
        let sceneBlob: Blob | null = null;
        if (!skipImage) {
          try {
            const scene = await generateSceneImage({
              prompt: input.prompt,
              style: input.style,
              aspect: input.aspect === "9:16" ? "9:16" : "16:9",
              signal: controller.signal,
            });
            if (controller.signal.aborted) return;
            sceneBlob = scene.blob;
            setStage(22);
          } catch (reason) {
            if (controller.signal.aborted) return;
            abortRef.current = null;
            setStatus("idle");
            setProgress(0);
            setStep(0);
            setCanFallback(true);
            if (reason instanceof SceneImageError) {
              setRetryAfter(reason.retryAfterSeconds ?? 0);
              setError(reason.message);
            } else {
              setError(
                "The free scene image could not be generated. You can retry or render an abstract clip instead.",
              );
            }
            return;
          }
        }

        const blob = await renderProceduralVideo({
          prompt: input.prompt,
          aspect: input.aspect === "9:16" ? "9:16" : "16:9",
          duration: input.duration,
          style: input.style,
          image: sceneBlob,
          signal: controller.signal,
          onProgress: (value) => setStage(25 + value * 0.75),
        });

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
        if (sceneBlob) registerSceneImage(video.id, sceneBlob);
        setUsedSceneImage(Boolean(sceneBlob));
        abortRef.current = null;
        setResult(video);
        setProgress(100);
        setStep(labelCount - 1);
        setStatus("done");
      })().catch((reason: unknown) => {
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
    },
    [],
  );

  const start = useCallback(
    (input: StartInput) => {
      clear();
      lastInput.current = input;
      setResult(null);

      if (provider === "procedural") {
        runProcedural(input, false);
        return;
      }

      setStatus("working");
      setProgress(4);
      setStep(0);
      setError(null);
      setRetryAfter(0);
      setCanFallback(false);
      setUsedSceneImage(false);

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
    [clear, provider, runProcedural],
  );

  const renderFallback = useCallback(() => {
    if (!lastInput.current) return;
    clear();
    setResult(null);
    runProcedural(lastInput.current, true);
  }, [clear, runProcedural]);

  return {
    status,
    progress,
    stepLabel: steps[step],
    steps,
    result,
    error,
    retryAfter,
    canFallback,
    usedSceneImage,
    start,
    reset,
    renderFallback,
  };
}
