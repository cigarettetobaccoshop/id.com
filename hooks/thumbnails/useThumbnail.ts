import { useEffect, useState } from 'react';

interface ThumbnailState { url: string; loading: boolean; source: string }
interface CachedThumbnail { url: string; source: string; expiresAt: number }

const CACHE_PREFIX = 'r2-thumbnail:';
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const SAFE_FALLBACK = '/images/thumbnails/cigarette-pack-fallback.svg';

function cacheKey(name: string, sourceUrl?: string): string {
  return `${CACHE_PREFIX}${name.trim().toLowerCase()}|${sourceUrl ?? ''}`;
}

function readCache(name: string, sourceUrl?: string): CachedThumbnail | null {
  try {
    const raw = window.localStorage.getItem(cacheKey(name, sourceUrl));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const value = parsed as Partial<CachedThumbnail>;
    if (typeof value.url !== 'string' || typeof value.source !== 'string' || typeof value.expiresAt !== 'number') return null;
    if (value.expiresAt <= Date.now()) {
      window.localStorage.removeItem(cacheKey(name, sourceUrl));
      return null;
    }
    return value as CachedThumbnail;
  } catch {
    return null;
  }
}

function writeCache(name: string, sourceUrl: string | undefined, value: CachedThumbnail): void {
  try {
    window.localStorage.setItem(cacheKey(name, sourceUrl), JSON.stringify(value));
  } catch {
    // Browser storage can be unavailable or full; network resolution remains the fallback.
  }
}

export function useThumbnail(name: string, sourceUrl?: string): ThumbnailState {
  const [state, setState] = useState<ThumbnailState>({ url: SAFE_FALLBACK, loading: Boolean(name), source: 'cigarette-fallback' });

  useEffect(() => {
    if (!name.trim()) return;
    let active = true;
    const cached = readCache(name, sourceUrl);
    if (cached) {
      setState({ url: cached.url, loading: false, source: cached.source });
      return () => { active = false; };
    }

    setState((current) => ({ ...current, loading: true }));
    fetch('/api/thumbnails/resolve', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, sourceUrl }),
    })
      .then(async (response) => {
        const data: unknown = await response.json();
        if (!response.ok || !data || typeof data !== 'object') throw new Error('THUMBNAIL_REQUEST_FAILED');
        const result = data as { url?: unknown; source?: unknown };
        if (!active || typeof result.url !== 'string') return;
        const source = typeof result.source === 'string' ? result.source : 'cigarette-fallback';
        setState({ url: result.url, loading: false, source });
        writeCache(name, sourceUrl, { url: result.url, source, expiresAt: Date.now() + CACHE_TTL_MS });
      })
      .catch(() => {
        if (active) setState({ url: SAFE_FALLBACK, loading: false, source: 'cigarette-fallback' });
      });

    return () => { active = false; };
  }, [name, sourceUrl]);

  return state;
}
