import { useEffect, useState } from 'react';

interface ThumbnailState { url: string; loading: boolean; source: string }

export function useThumbnail(name: string, sourceUrl?: string): ThumbnailState {
  const [state, setState] = useState<ThumbnailState>({ url: '/favicon.ico', loading: Boolean(name), source: 'placeholder' });

  useEffect(() => {
    if (!name.trim()) return;
    let active = true;
    setState((current) => ({ ...current, loading: true }));
    fetch('/api/thumbnails/resolve', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, sourceUrl }) })
      .then(async (response) => {
        const data: unknown = await response.json();
        if (!response.ok || !data || typeof data !== 'object') throw new Error('THUMBNAIL_REQUEST_FAILED');
        const result = data as { url?: unknown; source?: unknown };
        if (active && typeof result.url === 'string') setState({ url: result.url, loading: false, source: typeof result.source === 'string' ? result.source : 'placeholder' });
      })
      .catch(() => { if (active) setState({ url: '/favicon.ico', loading: false, source: 'placeholder' }); });
    return () => { active = false; };
  }, [name, sourceUrl]);

  return state;
}
