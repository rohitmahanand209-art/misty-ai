"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const COMPARISON: { feature: string; values: [string, string, string, string] }[] = [
  { feature: "Videos included", values: ["5 / day", "30 / month", "100 / month", "300 / month"] },
  { feature: "Video length", values: ["10s each", "10s each", "10s each", "10s each"] },
  { feature: "Export quality", values: ["720p", "1080p", "1080p", "4K (soon)"] },
  { feature: "Watermark", values: ["Yes", "No", "No", "No"] },
  { feature: "Hindi + English voice", values: ["English", "Both", "Both", "Both"] },
  { feature: "Image to video", values: ["—", "Yes", "Yes", "Yes"] },
  { feature: "Cartoon styles", values: ["2 styles", "All styles", "All styles", "All styles"] },
  { feature: "Team seats", values: ["1", "1", "1", "5"] },
  { feature: "Commercial licence", values: ["—", "Yes", "Yes", "Yes"] },
];

export function PricingTable() {
  const [yearly, setYearly] = useState(false);

  return (
    <>
      <div className="mt-8 flex flex-col items-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
          <button
            type="button"
            onClick={() => setYearly(false)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition",
              !yearly ? "bg-white/12 text-white" : "text-white/50 hover:text-white",
            )}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setYearly(true)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition",
              yearly ? "bg-white/12 text-white" : "text-white/50 hover:text-white",
            )}
          >
            Yearly
            <span className="rounded-full bg-emerald-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
              2 months free
            </span>
          </button>
        </div>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan) => {
          const price = yearly ? plan.yearly : plan.monthly;
          return (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-3xl border p-6",
                plan.highlight
                  ? "border-violet-400/40 bg-gradient-to-b from-violet-600/20 to-transparent shadow-2xl shadow-violet-950/40"
                  : "border-white/8 bg-white/[0.03]",
              )}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full brand-gradient px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                  <Sparkles className="size-3" />
                  Most popular
                </span>
              )}
              <h2 className="text-lg font-semibold text-white">{plan.name}</h2>
              <p className="mt-1 text-xs text-white/45">{plan.tagline}</p>

              <div className="mt-5 flex items-end gap-1">
                <span className="text-4xl font-semibold tracking-tight text-white">
                  ₹{price.toLocaleString("en-IN")}
                </span>
                <span className="pb-1 text-xs text-white/40">
                  /{yearly ? "year" : "month"}
                </span>
              </div>
              <p className="mt-1 text-[11px] font-medium text-violet-200/80">
                {plan.quota}
              </p>

              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-[13px] text-white/65"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={cn(
                  "mt-6 h-11 w-full rounded-xl",
                  plan.highlight
                    ? "brand-gradient text-white"
                    : "border border-white/15 bg-white/5 text-white hover:bg-white/10",
                )}
                variant={plan.highlight ? "default" : "outline"}
              >
                <Link href="/signup">{plan.cta}</Link>
              </Button>
              <p className="mt-2 text-center text-[10px] text-white/30">
                Preview only · no payment collected
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-white/8 text-left">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-white/40">
                  Feature
                </th>
                {PLANS.map((plan) => (
                  <th
                    key={plan.name}
                    className={cn(
                      "px-4 py-3 text-center text-xs font-medium uppercase tracking-wider",
                      plan.highlight ? "text-violet-300" : "text-white/40",
                    )}
                  >
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr
                  key={row.feature}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="px-4 py-3 text-[13px] text-white/65">
                    {row.feature}
                  </td>
                  {row.values.map((value, index) => {
                    const highlighted = PLANS[index]?.highlight;
                    return (
                      <td
                        key={PLANS[index]?.name ?? index}
                        className={cn(
                          "px-4 py-3 text-center text-[13px]",
                          highlighted
                            ? "bg-violet-500/[0.06] font-medium text-white"
                            : "text-white/50",
                        )}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
