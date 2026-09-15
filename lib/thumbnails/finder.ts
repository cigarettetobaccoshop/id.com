import type { ThumbnailProduct, ThumbnailResult } from './types';
import { getThumbnailCache, setThumbnailCache } from './cache';
import { scrapeImage } from './scraper';

const PLACEHOLDER = '/favicon.ico';
const OPENVERSE_ENDPOINT = 'https://api.openverse.org/v1/images/';
const WIKIMEDIA_ENDPOINT = 'https://commons.wikimedia.org/w/api.php';

type OpenLicenseMatch = { url: string; source: 'openverse' | 'wikimedia' };

function keyOf(product: ThumbnailProduct): string {
  return `${product.sku ?? ''}:${product.name.trim().toLowerCase()}`;
}

function isImageUrl(value: unknown): value is string {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
}

function titleScore(title: string, productName: string): number {
  const productTokens = productName.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length >= 3);
  const candidate = title.toLowerCase();
  return productTokens.reduce((score, token) => score + (candidate.includes(token) ? 1 : 0), 0);
}

export async function findThumbnail(product: ThumbnailProduct): Promise<ThumbnailResult> {
  const key = keyOf(product);
  const cached = getThumbnailCache(key);
  if (cached) return { success: true, url: cached, source: 'openverse', product: product.name, cached: true };

  if (product.sourceUrl) {
    const url = await scrapeImage(product.sourceUrl);
    if (url) {
      setThumbnailCache(key, url);
      return { success: true, url, source: 'astro', product: product.name, cached: false };
    }
  }

  const openLicenseMatch = await openLicenseFallback(product.name);
  if (openLicenseMatch) {
    setThumbnailCache(key, openLicenseMatch.url);
    return { success: true, url: openLicenseMatch.url, source: openLicenseMatch.source, product: product.name, cached: false };
  }

  const googleUrl = await googleFallback(product.name);
  if (googleUrl) {
    setThumbnailCache(key, googleUrl);
    return { success: true, url: googleUrl, source: 'google', product: product.name, cached: false };
  }

  return { success: true, url: PLACEHOLDER, source: 'placeholder', product: product.name, cached: false };
}

async function openLicenseFallback(query: string): Promise<OpenLicenseMatch | null> {
  const exact = await searchOpenverse(query);
  if (exact) return exact;

  const related = await searchOpenverse(`${query} cigarette tobacco pack`);
  if (related) return related;

  return searchWikimedia(`${query} cigarette pack`);
}

async function searchOpenverse(query: string): Promise<OpenLicenseMatch | null> {
  try {
    const endpoint = `${OPENVERSE_ENDPOINT}?q=${encodeURIComponent(query)}&page_size=5`;
    const response = await fetch(endpoint, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    if (!data || typeof data !== 'object') return null;
    const results = (data as { results?: unknown }).results;
    if (!Array.isArray(results)) return null;

    const candidates = results
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
      .map((item) => ({
        url: isImageUrl(item.thumbnail) ? item.thumbnail : isImageUrl(item.url) ? item.url : null,
        title: typeof item.title === 'string' ? item.title : '',
        score: typeof item.title === 'string' ? titleScore(item.title, query) : 0,
      }))
      .filter((item) => item.url)
      .sort((a, b) => b.score - a.score);

    const url = candidates[0]?.url;
    return url ? { url, source: 'openverse' } : null;
  } catch {
    return null;
  }
}

async function searchWikimedia(query: string): Promise<OpenLicenseMatch | null> {
  try {
    const params = new URLSearchParams({
      action: 'query',
      generator: 'search',
      gsrsearch: query,
      gsrnamespace: '6',
      gsrlimit: '5',
      prop: 'imageinfo',
      iiprop: 'url',
      iiurlwidth: '600',
      format: 'json',
      origin: '*',
    });
    const response = await fetch(`${WIKIMEDIA_ENDPOINT}?${params.toString()}`, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    if (!data || typeof data !== 'object') return null;
    const queryData = (data as { query?: unknown }).query;
    if (!queryData || typeof queryData !== 'object') return null;
    const pages = (queryData as { pages?: unknown }).pages;
    if (!pages || typeof pages !== 'object') return null;

    const candidates = Object.values(pages as Record<string, unknown>)
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
      .map((item) => {
        const imageinfo = Array.isArray(item.imageinfo) ? item.imageinfo[0] : null;
        const info = imageinfo && typeof imageinfo === 'object' ? imageinfo as Record<string, unknown> : null;
        return info && isImageUrl(info.thumburl)
          ? info.thumburl
          : info && isImageUrl(info.url)
            ? info.url
            : null;
      })
      .filter((url): url is string => Boolean(url));

    return candidates[0] ? { url: candidates[0], source: 'wikimedia' } : null;
  } catch {
    return null;
  }
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
    return isImageUrl(link) ? link : null;
  } catch {
    return null;
  }
}
