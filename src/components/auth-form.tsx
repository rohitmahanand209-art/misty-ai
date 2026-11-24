"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/auth-provider";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const result = isSignup
      ? signUp(name, email, password)
      : signIn(email, password);
    if (!result.ok) {
      setError(result.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }
    toast.success(
      isSignup
        ? `Welcome to Misty AI, ${result.user?.name.split(" ")[0]}!`
        : `Welcome back, ${result.user?.name.split(" ")[0]}!`,
    );
    router.push(result.user?.role === "admin" ? "/admin" : "/dashboard");
  }

  function fillDemo(kind: "user" | "admin") {
    if (kind === "admin") {
      setEmail("admin@mistyai.app");
      setPassword("admin123");
      if (isSignup) setName("Misty Admin");
    } else {
      setEmail("aarav@mistyai.app");
      setPassword("demo123");
      if (isSignup) setName("Aarav Sharma");
    }
    setError(null);
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {isSignup ? "Create your free account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-sm text-white/50">
        {isSignup
          ? "Start making videos in under a minute. No card required."
          : "Log in to open your studio and continue creating."}
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        {isSignup && (
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs text-white/60">
              Full name
            </Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                autoComplete="name"
                className="h-11 rounded-xl border-white/10 bg-white/[0.04] pl-9 text-white placeholder:text-white/25"
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs text-white/60">
            Email address
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="h-11 rounded-xl border-white/10 bg-white/[0.04] pl-9 text-white placeholder:text-white/25"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs text-white/60">
            Password
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              autoComplete={isSignup ? "new-password" : "current-password"}
              className="h-11 rounded-xl border-white/10 bg-white/[0.04] pl-9 pr-10 text-white placeholder:text-white/25"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-400/25 bg-rose-500/10 p-3 text-xs text-rose-200">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-xl brand-gradient text-[15px] font-semibold text-white shadow-lg shadow-violet-900/40"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              {isSignup ? "Create account" : "Log in"}
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-5">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-white/25">
          <span className="h-px flex-1 bg-white/10" />
          Demo accounts
          <span className="h-px flex-1 bg-white/10" />
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => fillDemo("user")}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left transition hover:border-violet-400/40 hover:bg-white/[0.06]"
          >
            <span className="flex items-center gap-1.5 text-xs font-medium text-white">
              <User className="size-3.5 text-violet-300" />
              Creator demo
            </span>
            <span className="mt-0.5 block text-[10px] text-white/40">
              aarav@mistyai.app · demo123
            </span>
          </button>
          <button
            type="button"
            onClick={() => fillDemo("admin")}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left transition hover:border-violet-400/40 hover:bg-white/[0.06]"
          >
            <span className="flex items-center gap-1.5 text-xs font-medium text-white">
              <ShieldCheck className="size-3.5 text-violet-300" />
              Admin demo
            </span>
            <span className="mt-0.5 block text-[10px] text-white/40">
              admin@mistyai.app · admin123
            </span>
          </button>
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-white/30">
          Any email with a 6+ character password also works in this demo. Data
          is stored only in your browser.
        </p>
      </div>

      <p className="mt-5 text-center text-xs text-white/45">
        {isSignup ? "Already have an account?" : "New to Misty AI?"}{" "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="font-medium text-violet-300 hover:text-violet-200"
        >
          {isSignup ? "Log in" : "Create a free account"}
        </Link>
      </p>
    </div>
  );
}
