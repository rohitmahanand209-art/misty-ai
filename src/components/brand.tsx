import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({
  href = "/",
  compact = false,
  className,
}: {
  href?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("group flex items-center gap-2.5", className)}
      aria-label="Misty AI home"
    >
      <span className="relative grid size-9 place-items-center rounded-xl brand-gradient shadow-lg shadow-violet-900/40 transition-transform group-hover:scale-105">
        <Sparkles className="size-5 text-white" strokeWidth={2.2} />
        <span className="absolute inset-0 rounded-xl ring-1 ring-white/30" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[1.05rem] font-semibold tracking-tight text-white">
          Misty <span className="text-gradient">AI</span>
        </span>
        {!compact && (
          <span className="mt-1 hidden text-[10px] font-medium uppercase tracking-[0.18em] text-white/40 sm:block">
            AI Video Studio
          </span>
        )}
      </span>
    </Link>
  );
}
