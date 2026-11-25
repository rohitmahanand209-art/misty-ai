"use client";

type StoredBlob = {
  url: string;
  mime: string;
  size: number;
};

const registry = new Map<string, StoredBlob>();
const sceneRegistry = new Map<string, StoredBlob>();

export function registerVideoBlob(id: string, blob: Blob) {
  const existing = registry.get(id);
  if (existing) URL.revokeObjectURL(existing.url);
  registry.set(id, {
    url: URL.createObjectURL(blob),
    mime: blob.type || "video/webm",
    size: blob.size,
  });
}

export function getVideoBlob(id: string | undefined | null): StoredBlob | undefined {
  if (!id) return undefined;
  return registry.get(id);
}

export function releaseVideoBlob(id: string) {
  const existing = registry.get(id);
  if (existing) {
    URL.revokeObjectURL(existing.url);
    registry.delete(id);
  }
}

export function registerSceneImage(id: string, blob: Blob) {
  const existing = sceneRegistry.get(id);
  if (existing) URL.revokeObjectURL(existing.url);
  sceneRegistry.set(id, {
    url: URL.createObjectURL(blob),
    mime: blob.type || "image/jpeg",
    size: blob.size,
  });
}

export function getSceneImage(id: string | undefined | null): StoredBlob | undefined {
  if (!id) return undefined;
  return sceneRegistry.get(id);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function videoExtension(mime: string): string {
  if (mime.includes("mp4")) return "mp4";
  return "webm";
}
