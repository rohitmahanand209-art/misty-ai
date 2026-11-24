"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BadgeCheck,
  Clapperboard,
  Coins,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Users,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getUsers,
  getVideos,
  removeUser,
  deleteVideo,
  subscribeStore,
} from "@/lib/demo-store";
import {
  MODE_LABELS,
  PLANS,
  type DemoUser,
  type DemoVideo,
  type VideoMode,
} from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const PLAN_STYLES: Record<DemoUser["plan"], string> = {
  Free: "border-white/10 bg-white/5 text-white/60",
  Creator: "border-violet-400/30 bg-violet-500/15 text-violet-200",
  Studio: "border-amber-400/30 bg-amber-400/10 text-amber-200",
};

export default function AdminPage() {
  const { user, signIn } = useAuth();
  const [users, setUsers] = useState<DemoUser[]>([]);
  const [videos, setVideos] = useState<DemoVideo[]>([]);
  const [query, setQuery] = useState("");
  const [confirmUser, setConfirmUser] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      setUsers(getUsers());
      setVideos(getVideos());
    };
    sync();
    return subscribeStore(sync);
  }, []);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.plan.toLowerCase().includes(q),
    );
  }, [users, query]);

  const stats = useMemo(() => {
    const paid = users.filter((item) => item.plan !== "Free");
    const mrr = paid.reduce((sum, item) => {
      const plan = PLANS.find((entry) => entry.name === item.plan);
      return sum + (plan?.monthly ?? 0);
    }, 0);
    const seconds = videos.reduce((sum, video) => sum + video.duration, 0);
    return [
      { label: "Total users", value: users.length, icon: Users, hint: `${paid.length} on paid plans` },
      { label: "Videos created", value: videos.length, icon: Video, hint: `${Math.round(seconds / 60)} min of content` },
      { label: "Demo MRR", value: `₹${mrr.toLocaleString("en-IN")}`, icon: Coins, hint: "Not billed in preview" },
      { label: "Active today", value: Math.max(2, Math.round(users.length * 0.4)), icon: Activity, hint: "Simulated activity" },
    ];
  }, [users, videos]);

  const byMode = useMemo(() => {
    const modes: VideoMode[] = ["text", "image", "cartoon", "voice"];
    return modes.map((mode) => ({
      mode,
      label: MODE_LABELS[mode],
      count: videos.filter((video) => video.mode === mode).length,
    }));
  }, [videos]);

  const maxCount = Math.max(1, ...byMode.map((item) => item.count));

  if (user?.role !== "admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-white/8 bg-white/[0.04] p-6 text-center sm:p-8">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-amber-400/25 bg-amber-400/10 text-amber-200">
            <ShieldAlert className="size-6" />
          </span>
          <h1 className="mt-4 text-xl font-semibold text-white">
            Admin access only
          </h1>
          <p className="mt-2 text-sm text-white/50">
            This area is limited to workspace administrators. Use the demo admin
            account to explore the controls.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <Button
              onClick={() => {
                const result = signIn("admin@mistyai.app", "admin123");
                if (result.ok) toast.success("Signed in as demo admin.");
              }}
              className="h-11 rounded-xl brand-gradient text-white"
            >
              <ShieldCheck className="size-4" />
              Sign in as demo admin
            </Button>
            <p className="text-[10px] text-white/30">
              admin@mistyai.app · admin123
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-violet-300/80">
            Administration
          </p>
          <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Admin Dashboard
            <span className="rounded-full border border-violet-400/30 bg-violet-500/15 px-2 py-0.5 text-[10px] font-medium text-violet-200">
              Demo
            </span>
          </h1>
          <p className="mt-1.5 text-sm text-white/50">
            Users, content and usage across the Misty AI workspace.
          </p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-right">
          <p className="text-[10px] uppercase tracking-wider text-white/35">
            Signed in as
          </p>
          <p className="text-xs font-medium text-white">{user.name}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                  {stat.label}
                </span>
                <span className="grid size-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-violet-200">
                  <Icon className="size-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-white">
                {stat.value}
              </p>
              <p className="mt-0.5 text-[11px] text-white/35">{stat.hint}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="min-w-0 rounded-2xl border border-white/8 bg-white/[0.03] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-white">Users</h2>
            <div className="relative w-full sm:w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/30" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search users…"
                className="h-9 rounded-lg border-white/10 bg-white/[0.04] pl-8 text-xs text-white placeholder:text-white/25"
              />
            </div>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-xs">
              <thead>
                <tr className="border-b border-white/8 text-[10px] uppercase tracking-wider text-white/35">
                  <th className="pb-2 pr-3 font-medium">User</th>
                  <th className="pb-2 pr-3 font-medium">Plan</th>
                  <th className="pb-2 pr-3 font-medium">Credits</th>
                  <th className="pb-2 pr-3 font-medium">Joined</th>
                  <th className="pb-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((item) => (
                  <tr
                    key={item.email}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="grid size-7 shrink-0 place-items-center rounded-full brand-gradient text-[10px] font-semibold text-white">
                          {item.name.slice(0, 2).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-white">
                            {item.name}
                          </p>
                          <p className="truncate text-[10px] text-white/35">
                            {item.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]",
                          PLAN_STYLES[item.plan],
                        )}
                      >
                        {item.plan !== "Free" && (
                          <BadgeCheck className="size-2.5" />
                        )}
                        {item.plan}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-white/55">
                      {item.credits}
                    </td>
                    <td className="py-2.5 pr-3 text-white/35">
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="py-2.5 text-right">
                      {confirmUser === item.email ? (
                        <button
                          onClick={() => {
                            removeUser(item.email);
                            setConfirmUser(null);
                            toast.success(`${item.name} removed.`);
                          }}
                          className="rounded-md bg-rose-500/90 px-2 py-1 text-[10px] font-medium text-white"
                        >
                          Confirm
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmUser(item.email)}
                          className="rounded-md p-1.5 text-white/30 hover:bg-rose-500/10 hover:text-rose-300"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-[11px] text-white/35"
                    >
                      No users match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="min-w-0 space-y-4">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 sm:p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Clapperboard className="size-4 text-violet-300" />
              Videos by tool
            </h2>
            <div className="mt-3 space-y-2.5">
              {byMode.map((item) => (
                <div key={item.mode}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-white/60">{item.label}</span>
                    <span className="text-white/40">{item.count}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full brand-gradient"
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-[11px] leading-relaxed text-amber-100/70">
            <p className="font-medium text-amber-200">Preview environment</p>
            <p className="mt-1">
              All numbers come from demo data in this browser. Nothing is
              connected to real billing, AI rendering or analytics.
            </p>
          </div>
        </div>
      </div>

      <div className="min-w-0 rounded-2xl border border-white/8 bg-white/[0.03] p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">
            Recent videos ({videos.length})
          </h2>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-xs">
            <thead>
              <tr className="border-b border-white/8 text-[10px] uppercase tracking-wider text-white/35">
                <th className="pb-2 pr-3 font-medium">Title</th>
                <th className="pb-2 pr-3 font-medium">Tool</th>
                <th className="pb-2 pr-3 font-medium">Style</th>
                <th className="pb-2 pr-3 font-medium">Length</th>
                <th className="pb-2 pr-3 font-medium">Created</th>
                <th className="pb-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {videos.slice(0, 8).map((video) => (
                <tr
                  key={video.id}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="max-w-56 truncate py-2.5 pr-3 font-medium text-white">
                    {video.title}
                  </td>
                  <td className="py-2.5 pr-3 text-white/50">
                    {MODE_LABELS[video.mode]}
                  </td>
                  <td className="py-2.5 pr-3 text-white/50">{video.style}</td>
                  <td className="py-2.5 pr-3 text-white/50">
                    {video.duration}s
                  </td>
                  <td className="py-2.5 pr-3 text-white/35">
                    {new Date(video.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => {
                        deleteVideo(video.id);
                        toast.success("Video deleted.");
                      }}
                      className="rounded-md p-1.5 text-white/30 hover:bg-rose-500/10 hover:text-rose-300"
                      aria-label={`Delete ${video.title}`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {videos.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 text-center text-[11px] text-white/35"
                  >
                    No videos yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
