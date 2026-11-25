"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Clapperboard,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Mic,
  Palette,
  ShieldCheck,
  Sparkles,
  Video,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { quotaLabel } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/text-to-video", label: "Text to Video", icon: Sparkles },
  { href: "/image-to-video", label: "Image to Video", icon: ImageIcon },
  { href: "/cartoon-video", label: "Cartoon", icon: Palette },
  { href: "/voice", label: "AI Voice", icon: Mic },
  { href: "/pricing", label: "Pricing", icon: Clapperboard },
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function SiteHeader() {
  const pathname = usePathname();
  const { user, ready, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0b0917]/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Brand />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/65 hover:bg-white/5 hover:text-white",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {!ready ? (
            <div className="h-9 w-40 animate-pulse rounded-full bg-white/5" />
          ) : user ? (
            <>
              <Button
                asChild
                variant="ghost"
                className="rounded-full text-white/80 hover:bg-white/10 hover:text-white"
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 text-sm text-white/90 transition hover:bg-white/10"
                    aria-label="Account menu"
                  >
                    <Avatar className="size-7">
                      <AvatarFallback className="brand-gradient text-xs font-semibold text-white">
                        {initials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-24 truncate">{user.name}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="mt-1 text-[11px] text-violet-300">
                      {user.plan} plan · {quotaLabel(user.plan)}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="size-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-videos">
                      <Video className="size-4" />
                      My Videos
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <ShieldCheck className="size-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={signOut}
                    className="text-rose-300 focus:text-rose-200"
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="rounded-full text-white/80 hover:bg-white/10 hover:text-white"
              >
                <Link href="/login">Log in</Link>
              </Button>
              <Button
                asChild
                className="rounded-full brand-gradient text-white shadow-lg shadow-violet-900/40 hover:opacity-90"
              >
                <Link href="/signup">Sign up free</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          {ready && !user && (
            <Button
              asChild
              size="sm"
              className="rounded-full brand-gradient text-white"
            >
              <Link href="/signup">Sign up</Link>
            </Button>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-white/10 bg-white/5 text-white"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[86vw] max-w-sm border-white/10 bg-[#0d0a1d] p-0"
            >
              <SheetHeader className="border-b border-white/5 px-5 py-4">
                <SheetTitle className="text-left">
                  <Brand />
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 px-3 py-4">
                {NAV_LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium",
                        pathname === link.href
                          ? "bg-white/10 text-white"
                          : "text-white/70 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <Icon className="size-4 text-violet-300" />
                      {link.label}
                    </Link>
                  );
                })}
                <div className="my-2 h-px bg-white/5" />
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white"
                    >
                      <LayoutDashboard className="size-4 text-violet-300" />
                      Dashboard
                    </Link>
                    <Link
                      href="/my-videos"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white"
                    >
                      <Video className="size-4 text-violet-300" />
                      My Videos
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white"
                      >
                        <ShieldCheck className="size-4 text-violet-300" />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        signOut();
                        setOpen(false);
                      }}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-rose-300 hover:bg-rose-500/10"
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 px-1 pt-1">
                    <Button
                      asChild
                      variant="outline"
                      className="rounded-xl border-white/15 bg-white/5"
                    >
                      <Link href="/login" onClick={() => setOpen(false)}>
                        Log in
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="rounded-xl brand-gradient text-white"
                    >
                      <Link href="/signup" onClick={() => setOpen(false)}>
                        Create free account
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
