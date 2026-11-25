import {
  ADMIN_DEMO,
  DEMO_USERS,
  SEED_VIDEOS,
  makeId,
  type DemoUser,
  type DemoVideo,
} from "./demo-data";

const VIDEOS_KEY = "misty_videos_v1";
const USERS_KEY = "misty_users_v1";
const SESSION_KEY = "misty_session_v1";
const STORE_EVENT = "misty-store-change";

function isBrowser() {
  return typeof window !== "undefined";
}

function emit() {
  if (isBrowser()) {
    window.dispatchEvent(new Event(STORE_EVENT));
  }
}

export function subscribeStore(callback: () => void) {
  if (!isBrowser()) return () => {};
  window.addEventListener(STORE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(STORE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage may be unavailable in private mode
  }
  emit();
}

export function getVideos(): DemoVideo[] {
  if (!isBrowser()) return [];
  const stored = readJson<DemoVideo[] | null>(VIDEOS_KEY, null);
  if (stored === null) {
    writeJson(VIDEOS_KEY, SEED_VIDEOS);
    return SEED_VIDEOS;
  }
  return stored;
}

export function getVideo(id: string): DemoVideo | undefined {
  return getVideos().find((video) => video.id === id);
}

export function addVideo(video: DemoVideo): DemoVideo {
  const next = [video, ...getVideos()];
  writeJson(VIDEOS_KEY, next);
  return video;
}

export function createDemoVideo(input: {
  prompt: string;
  mode: DemoVideo["mode"];
  style: string;
  aspect: DemoVideo["aspect"];
  duration: number;
  voice: string;
  title?: string;
  gradient: string;
  source?: DemoVideo["source"];
  motion?: DemoVideo["motion"];
  sizeLabel?: string;
}): DemoVideo {
  const title =
    input.title?.trim() ||
    input.prompt.trim().split(/\s+/).slice(0, 6).join(" ") ||
    "Untitled video";
  const resolution =
    input.aspect === "9:16"
      ? "1080 × 1920"
      : input.aspect === "1:1"
        ? "1080 × 1080"
        : "1920 × 1080";
  const video: DemoVideo = {
    id: makeId(),
    title,
    prompt: input.prompt,
    mode: input.mode,
    style: input.style,
    aspect: input.aspect,
    duration: input.duration,
    voice: input.voice,
    status: "ready",
    createdAt: new Date().toISOString(),
    gradient: input.gradient,
    resolution,
    sizeLabel: input.sizeLabel ?? `${(input.duration * 1.35 + 2.4).toFixed(1)} MB`,
    source: input.source ?? "demo",
    motion: input.motion,
  };
  return addVideo(video);
}

export function deleteVideo(id: string) {
  writeJson(
    VIDEOS_KEY,
    getVideos().filter((video) => video.id !== id),
  );
}

export function getUsers(): DemoUser[] {
  if (!isBrowser()) return [];
  const stored = readJson<DemoUser[] | null>(USERS_KEY, null);
  if (stored === null) {
    writeJson(USERS_KEY, DEMO_USERS);
    return DEMO_USERS;
  }
  return stored;
}

export function upsertUser(user: DemoUser) {
  const users = getUsers();
  const exists = users.some(
    (item) => item.email.toLowerCase() === user.email.toLowerCase(),
  );
  const next = exists
    ? users.map((item) =>
        item.email.toLowerCase() === user.email.toLowerCase() ? user : item,
      )
    : [user, ...users];
  writeJson(USERS_KEY, next);
}

export function removeUser(email: string) {
  writeJson(
    USERS_KEY,
    getUsers().filter((item) => item.email.toLowerCase() !== email.toLowerCase()),
  );
}

export function getSession(): DemoUser | null {
  return readJson<DemoUser | null>(SESSION_KEY, null);
}

export function setSession(user: DemoUser | null) {
  if (!isBrowser()) return;
  if (user) {
    writeJson(SESSION_KEY, user);
  } else {
    try {
      window.localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
    emit();
  }
}

export function makeSessionUser(
  name: string,
  email: string,
  password: string,
): DemoUser {
  const normalized = email.trim().toLowerCase();
  if (normalized === ADMIN_DEMO.email && password === "admin123") {
    return ADMIN_DEMO;
  }
  const existing = getUsers().find(
    (item) => item.email.toLowerCase() === normalized,
  );
  if (existing) return existing;
  const isAdmin = normalized.startsWith("admin@");
  return {
    name: name.trim() || normalized.split("@")[0] || "Misty Creator",
    email: normalized,
    role: isAdmin ? "admin" : "user",
    plan: "Free",
    credits: isAdmin ? 5000 : 20,
    createdAt: new Date().toISOString(),
  };
}

export { STORE_EVENT };
