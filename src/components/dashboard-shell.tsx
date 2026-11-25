"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Clapperboard,
  CreditCard,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Mic,
  Palette,
  ShieldCheck,
  Sparkles,
  Video,
  Wand2,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { useAuth } from "@/components/providers/auth-provider";
import { getVideos, subscribeStore } from "@/lib/demo-store";
import {
  countVideosInQuota,
  getPlanLimit,
  type DemoVideo,
} from "@/lib/demo-data";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/my-videos", label: "My Videos", icon: Video },
  { href: "/text-to-video", label: "Text to Video", icon: Sparkles },
  { href: "/image-to-video", label: "Image to Video", icon: ImageIcon },
  { href: "/cartoon-video", label: "Cartoon Maker", icon: Palette },
  { href: "/voice", label: "AI Voice", icon: Mic },
  { href: "/pricing", label: "Plans", icon: CreditCard },
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-white/10 text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon
              className={cn(
                "size-4",
                active ? "text-violet-300" : "text-white/40",
              )}
            />
            {item.label}
          </Link>
        );
      })}
      {user?.role === "admin" && (
        <Link
          href="/admin"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
            pathname === "/admin"
              ? "bg-white/10 text-white"
              : "text-white/60 hover:bg-white/5 hover:text-white",
          )}
        >
          <ShieldCheck className="size-4 text-violet-300" />
          Admin Dashboard
        </Link>
      )}
    </nav>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const { user, signOut } = useAuth();
  const [videos, setVideos] = useState<DemoVideo[]>([]);

  useEffect(() => {
    const sync = () => setVideos(getVideos());
    sync();
    return subscribeStore(sync);
  }, []);

  const plan = user?.plan ?? "Free";
  const planLimit = getPlanLimit(plan);
  const videosUsed = countVideosInQuota(videos, plan);

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 py-5">
        <Brand href="/dashboard" compact />
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
          Workspace
        </p>
        <NavList onNavigate={onNavigate} />

        {user && (
          <div className="mt-5 rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-600/20 to-blue-600/10 p-3.5">
            <div className="flex items-center justify-between text-[11px] text-white/60">
              <span className="flex items-center gap-1.5">
                <Wand2 className="size-3.5 text-violet-300" />
                {plan} plan
              </span>
              <span>
                {videosUsed}/{planLimit.videos} this {planLimit.period}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full brand-gradient"
                style={{
                  width: `${Math.min(100, (videosUsed / planLimit.videos) * 100)}%`,
                }}
              />
            </div>
            <Button
              asChild
              size="sm"
              className="mt-3 w-full rounded-lg brand-gradient text-[11px] text-white"
            >
              <Link href="/pricing" onClick={onNavigate}>
                Upgrade plan
              </Link>
            </Button>
          </div>
        )}
      </div>

      <div className="border-t border-white/5 p-3">
        {user ? (
          <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
            <Avatar className="size-8">
              <AvatarFallback className="brand-gradient text-[11px] font-semibold text-white">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">
                {user.name}
              </p>
              <p className="truncate text-[10px] text-white/40">{user.email}</p>
            </div>
            <button
              onClick={signOut}
              className="grid size-8 place-items-center rounded-lg text-white/40 hover:bg-white/5 hover:text-rose-300"
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        ) : (
          <Button
            asChild
            className="w-full rounded-xl brand-gradient text-white"
          >
            <Link href="/login" onClick={onNavigate}>
              Log in
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, ready, signIn } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, []);

  if (!ready) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-6 p-4">
        <div className="hidden w-60 shrink-0 space-y-3 lg:block">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="flex-1 space-y-4">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="pointer-events-none absolute inset-0 grid-bg" />
        <div className="relative w-full max-w-md text-center">
          <Brand className="justify-center" />
          <div className="mt-6 rounded-3xl border border-white/8 bg-white/[0.04] p-6 backdrop-blur-xl sm:p-8">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl brand-gradient text-white shadow-lg shadow-violet-900/40">
              <Clapperboard className="size-6" />
            </span>
            <h1 className="mt-4 text-xl font-semibold text-white">
              Sign in to open your studio
            </h1>
            <p className="mt-2 text-sm text-white/50">
              Your dashboard keeps your demo videos, credits and plan in one
              place. Use a demo account to look around instantly.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Button
                asChild
                className="h-11 rounded-xl brand-gradient text-white"
              >
                <Link href="/login">Log in</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10"
              >
                <Link href="/signup">Create free account</Link>
              </Button>
              <button
                type="button"
                onClick={() => signIn("aarav@mistyai.app", "demo123")}
                className="mt-1 text-[11px] text-violet-300 hover:text-violet-200"
              >
                Continue with demo creator account
              </button>
            </div>
          </div>
          <Link
            href="/"
            className="mt-4 inline-block text-xs text-white/40 hover:text-white"
          >
            ← Back to website
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-white/5 bg-[#0a0817]/70 backdrop-blur-xl lg:block">
        <SidebarBody />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-white/5 bg-[#0b0917]/80 px-4 backdrop-blur-xl lg:hidden">
          <Brand href="/dashboard" compact />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-white/10 bg-white/5 text-white"
                aria-label="Open dashboard menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[80vw] max-w-xs border-white/10 bg-[#0d0a1d] p-0"
            >
              <SheetHeader className="sr-only">
                <SheetTitle>Dashboard menu</SheetTitle>
              </SheetHeader>
              <SidebarBody onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
