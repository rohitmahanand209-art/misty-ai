import Link from "next/link";
import { Info, ShieldCheck } from "lucide-react";
import { PricingTable } from "@/components/pricing-table";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Pricing Plans",
  description:
    "Simple plans for Misty AI. Start free and upgrade when you grow. Demo pricing only — no payment gateway connected.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-6 pt-10 sm:px-6 sm:pt-14 lg:px-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1.5 text-[11px] font-medium text-violet-200">
          <ShieldCheck className="size-3.5" />
          Simple, honest pricing
        </div>
        <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
          Pick a plan that fits{" "}
          <span className="text-gradient">your creative pace.</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-white/55">
          Every plan includes the full studio interface. Upgrade for longer
          clips, higher quality and Hindi voice over.
        </p>
      </div>

      <div className="mx-auto mt-5 flex max-w-xl items-start gap-2.5 rounded-2xl border border-amber-400/20 bg-amber-400/[0.07] p-3.5 text-[12px] leading-relaxed text-amber-100/80">
        <Info className="mt-0.5 size-4 shrink-0 text-amber-300" />
        <p>
          This is a design preview. No payment gateway or subscription is
          connected, and selecting a plan will not charge you. Prices shown are
          placeholders for the final launch.
        </p>
      </div>

      <PricingTable />

      <div className="mt-10 rounded-3xl border border-white/8 bg-gradient-to-br from-violet-600/15 via-transparent to-blue-600/15 p-6 text-center sm:p-8">
        <h2 className="text-xl font-semibold text-white sm:text-2xl">
          Not sure yet? Start on Free.
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/50">
          Create an account, explore all four tools and keep your demo projects
          in one dashboard.
        </p>
        <div className="mt-5 flex flex-col justify-center gap-2.5 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="h-11 rounded-xl brand-gradient px-6 text-white"
          >
            <Link href="/signup">Create free account</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-11 rounded-xl border-white/15 bg-white/5 px-6 text-white hover:bg-white/10"
          >
            <Link href="/dashboard">See the dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
