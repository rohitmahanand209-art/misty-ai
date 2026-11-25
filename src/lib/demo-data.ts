export type VideoMode = "text" | "image" | "cartoon" | "voice";

export type VideoStatus = "ready" | "processing" | "failed";

export type DemoUser = {
  name: string;
  email: string;
  role: "user" | "admin";
  plan: "Free" | "Creator" | "Studio";
  credits: number;
  createdAt: string;
};

export type DemoVideo = {
  id: string;
  title: string;
  prompt: string;
  mode: VideoMode;
  style: string;
  aspect: "16:9" | "9:16" | "1:1";
  duration: number;
  voice: string;
  status: VideoStatus;
  createdAt: string;
  gradient: string;
  resolution: string;
  sizeLabel: string;
  source?: "demo" | "procedural";
};

export const MODE_LABELS: Record<VideoMode, string> = {
  text: "Text to Video",
  image: "Image to Video",
  cartoon: "Cartoon Video",
  voice: "Voice Over",
};

export const MODE_ACCENTS: Record<VideoMode, string> = {
  text: "from-violet-500 to-indigo-500",
  image: "from-blue-500 to-cyan-400",
  cartoon: "from-fuchsia-500 to-purple-500",
  voice: "from-indigo-500 to-sky-400",
};

export const GRADIENTS = [
  "linear-gradient(135deg,#7c3aed 0%,#4f46e5 45%,#0ea5e9 100%)",
  "linear-gradient(135deg,#c026d3 0%,#7c3aed 55%,#2563eb 100%)",
  "linear-gradient(135deg,#0ea5e9 0%,#6366f1 55%,#a855f7 100%)",
  "linear-gradient(135deg,#8b5cf6 0%,#3b82f6 50%,#06b6d4 100%)",
  "linear-gradient(135deg,#f472b6 0%,#a855f7 50%,#4f46e5 100%)",
  "linear-gradient(135deg,#312e81 0%,#6d28d9 45%,#2563eb 100%)",
];

export const STYLES = [
  "Cinematic",
  "Realistic",
  "Anime",
  "3D Render",
  "Cartoon",
  "Cyberpunk",
  "Fantasy",
  "Documentary",
];

export const VOICES = [
  { id: "en-female", label: "English — Female", lang: "en" as const, code: "en-US" },
  { id: "en-male", label: "English — Male", lang: "en" as const, code: "en-GB" },
  { id: "hi-female", label: "Hindi — Female", lang: "hi" as const, code: "hi-IN" },
  { id: "hi-male", label: "Hindi — Male", lang: "hi" as const, code: "hi-IN" },
  { id: "none", label: "No voice over", lang: "en" as const, code: "" },
];

export const PROMPT_IDEAS = [
  "A misty Himalayan valley at sunrise, cinematic drone shot, soft golden light",
  "A neon cyberpunk market in Mumbai, rain reflections, slow camera pan",
  "A cute cartoon elephant dancing in a magical forest, bright colors",
  "A luxury perfume bottle rotating on a silk stage, studio lighting",
  "An astronaut walking through purple clouds, dreamy sci-fi atmosphere",
];

export const CARTOON_STYLES = [
  { id: "anime", name: "Anime", desc: "Bold lines, vibrant colors", emoji: "🌸" },
  { id: "3d", name: "3D Pixar", desc: "Soft lighting, glossy look", emoji: "🧸" },
  { id: "comic", name: "Comic Book", desc: "Halftones and ink outlines", emoji: "💥" },
  { id: "chibi", name: "Chibi", desc: "Cute oversized characters", emoji: "🐣" },
  { id: "storybook", name: "Storybook", desc: "Hand-painted watercolor", emoji: "📖" },
  { id: "retro", name: "Retro Cartoon", desc: "Classic 90s TV feel", emoji: "📺" },
];

export function makeId(prefix = "vid") {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function pickGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  }
  return GRADIENTS[hash % GRADIENTS.length];
}

export function daysAgo(days: number, hour = 11) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 24, 0, 0);
  return date.toISOString();
}

export const SEED_VIDEOS: DemoVideo[] = [
  {
    id: "vid_demo_mist",
    title: "Misty Himalayan Sunrise",
    prompt:
      "A misty Himalayan valley at sunrise, cinematic drone shot, layers of fog rolling over pine forests, soft golden light, ultra detailed.",
    mode: "text",
    style: "Cinematic",
    aspect: "16:9",
    duration: 10,
    voice: "English — Female",
    status: "ready",
    createdAt: daysAgo(1, 9),
    gradient: GRADIENTS[0],
    resolution: "1920 × 1080",
    sizeLabel: "14.2 MB",
  },
  {
    id: "vid_demo_neon",
    title: "Neon Mumbai Nights",
    prompt:
      "A neon cyberpunk street market in Mumbai during monsoon rain, glowing signboards, reflections on wet pavement, slow camera pan.",
    mode: "text",
    style: "Cyberpunk",
    aspect: "16:9",
    duration: 8,
    voice: "Hindi — Male",
    status: "ready",
    createdAt: daysAgo(2, 20),
    gradient: GRADIENTS[1],
    resolution: "1920 × 1080",
    sizeLabel: "11.8 MB",
  },
  {
    id: "vid_demo_elephant",
    title: "Dancing Baby Elephant",
    prompt:
      "A cute cartoon baby elephant dancing in a magical forest, fireflies, bright saturated colors, smooth loop animation for a kids channel.",
    mode: "cartoon",
    style: "3D Pixar",
    aspect: "9:16",
    duration: 6,
    voice: "Hindi — Female",
    status: "ready",
    createdAt: daysAgo(3, 16),
    gradient: GRADIENTS[2],
    resolution: "1080 × 1920",
    sizeLabel: "8.4 MB",
  },
  {
    id: "vid_demo_perfume",
    title: "Aurora Perfume Ad",
    prompt:
      "Luxury perfume bottle rotating slowly on flowing silk, purple and blue studio lighting, floating petals, premium product commercial.",
    mode: "image",
    style: "Realistic",
    aspect: "1:1",
    duration: 5,
    voice: "English — Male",
    status: "ready",
    createdAt: daysAgo(5, 12),
    gradient: GRADIENTS[3],
    resolution: "1080 × 1080",
    sizeLabel: "6.1 MB",
  },
  {
    id: "vid_demo_space",
    title: "Astronaut in Purple Clouds",
    prompt:
      "An astronaut floating through glowing purple clouds, distant ringed planet, dreamy sci-fi atmosphere, slow orbit camera move.",
    mode: "text",
    style: "Fantasy",
    aspect: "16:9",
    duration: 12,
    voice: "No voice over",
    status: "ready",
    createdAt: daysAgo(7, 18),
    gradient: GRADIENTS[5],
    resolution: "1920 × 1080",
    sizeLabel: "18.9 MB",
  },
  {
    id: "vid_demo_voice",
    title: "Hindi Explainer Intro",
    prompt:
      "Hindi voice over demo: Welcome to Misty AI, where your words become beautiful videos in seconds.",
    mode: "voice",
    style: "Documentary",
    aspect: "16:9",
    duration: 6,
    voice: "Hindi — Female",
    status: "ready",
    createdAt: daysAgo(9, 10),
    gradient: GRADIENTS[4],
    resolution: "1920 × 1080",
    sizeLabel: "3.2 MB",
  },
];

export const DEMO_USERS: DemoUser[] = [
  {
    name: "Aarav Sharma",
    email: "aarav@mistyai.app",
    role: "user",
    plan: "Free",
    credits: 18,
    createdAt: daysAgo(14),
  },
  {
    name: "Priya Nair",
    email: "priya@mistyai.app",
    role: "user",
    plan: "Creator",
    credits: 240,
    createdAt: daysAgo(9),
  },
  {
    name: "Rohan Verma",
    email: "rohan@mistyai.app",
    role: "user",
    plan: "Studio",
    credits: 900,
    createdAt: daysAgo(6),
  },
  {
    name: "Meera Iyer",
    email: "meera@mistyai.app",
    role: "user",
    plan: "Free",
    credits: 4,
    createdAt: daysAgo(3),
  },
  {
    name: "Dev Patel",
    email: "dev@mistyai.app",
    role: "user",
    plan: "Creator",
    credits: 120,
    createdAt: daysAgo(2),
  },
];

export const ADMIN_DEMO: DemoUser = {
  name: "Misty Admin",
  email: "admin@mistyai.app",
  role: "admin",
  plan: "Studio",
  credits: 5000,
  createdAt: daysAgo(120),
};

export const PLANS = [
  {
    name: "Free",
    tagline: "Try the studio, no card needed",
    monthly: 0,
    yearly: 0,
    credits: "20 demo credits / month",
    features: [
      "720p demo renders",
      "Up to 10 second clips",
      "English voice over",
      "Watermarked exports",
      "Community support",
    ],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Creator",
    tagline: "For creators shipping every week",
    monthly: 799,
    yearly: 7990,
    credits: "300 credits / month",
    features: [
      "1080p demo renders",
      "Up to 30 second clips",
      "Hindi + English voices",
      "No watermark",
      "Image to video + cartoon styles",
      "Priority email support",
    ],
    cta: "Choose Creator",
    highlight: true,
  },
  {
    name: "Studio",
    tagline: "For teams and agencies",
    monthly: 2499,
    yearly: 24990,
    credits: "1,500 credits / month",
    features: [
      "Everything in Creator",
      "4K demo renders (coming soon)",
      "5 team seats",
      "Brand presets and style memory",
      "Commercial usage licence",
      "Priority support",
    ],
    cta: "Choose Studio",
    highlight: false,
  },
];
