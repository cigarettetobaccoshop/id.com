interface CacheEntry {
  url: string;
  source: 'astro' | 'openverse' | 'wikimedia' | 'google' | 'cigarette-fallback';
  confidence: number;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const TTL_MS = 365 * 24 * 60 * 60 * 1000;

export function getThumbnailCache(key: string): CacheEntry | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry;
}

export function setThumbnailCache(
  key: string,
  value: Omit<CacheEntry, 'expiresAt'>,
): void {
  cache.set(key, { ...value, expiresAt: Date.now() + TTL_MS });
}
