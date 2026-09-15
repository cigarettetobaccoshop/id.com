import type { ThumbnailProduct, ThumbnailResult } from './types';
import { getThumbnailCache, setThumbnailCache } from './cache';
import { scrapeImage } from './scraper';

const PLACEHOLDER = '/favicon.ico';

function keyOf(product: ThumbnailProduct): string {
  return `${product.sku ?? ''}:${product.name.trim().toLowerCase()}`;
}

export async function findThumbnail(product: ThumbnailProduct): Promise<ThumbnailResult> {
  const key = keyOf(product);
  const cached = getThumbnailCache(key);
  if (cached) return { success: true, url: cached, source: 'astro', product: product.name, cached: true };

  if (product.sourceUrl) {
    const url = await scrapeImage(product.sourceUrl);
    if (url) {
      setThumbnailCache(key, url);
      return { success: true, url, source: 'astro', product: product.name, cached: false };
    }
  }

  const googleUrl = await googleFallback(product.name);
  if (googleUrl) {
    setThumbnailCache(key, googleUrl);
    return { success: true, url: googleUrl, source: 'google', product: product.name, cached: false };
  }

  return { success: true, url: PLACEHOLDER, source: 'placeholder', product: product.name, cached: false };
}

async function googleFallback(query: string): Promise<string | null> {
  const key = process.env.GOOGLE_CSE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;
  if (!key || !cx) return null;
  try {
    const endpoint = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(key)}&cx=${encodeURIComponent(cx)}&searchType=image&num=1&q=${encodeURIComponent(query)}`;
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    if (!data || typeof data !== 'object') return null;
    const items = (data as { items?: unknown }).items;
    if (!Array.isArray(items) || !items[0] || typeof items[0] !== 'object') return null;
    const link = (items[0] as { link?: unknown }).link;
    return typeof link === 'string' ? link : null;
  } catch {
    return null;
  }
}
