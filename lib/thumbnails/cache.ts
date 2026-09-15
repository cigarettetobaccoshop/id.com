interface CacheEntry {
  url: string;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const TTL_MS = 365 * 24 * 60 * 60 * 1000;

export function getThumbnailCache(key: string): string | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.url;
}

export function setThumbnailCache(key: string, url: string): void {
  cache.set(key, { url, expiresAt: Date.now() + TTL_MS });
}
