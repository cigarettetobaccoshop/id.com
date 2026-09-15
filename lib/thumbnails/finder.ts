import type { ThumbnailProduct, ThumbnailResult, ThumbnailSource } from './types';
import { getThumbnailCache, setThumbnailCache } from './cache';
import { scrapeImage } from './scraper';

const FALLBACK = '/images/thumbnails/cigarette-pack-fallback.svg';
const OPENVERSE_ENDPOINT = 'https://api.openverse.org/v1/images/';
const WIKIMEDIA_ENDPOINT = 'https://commons.wikimedia.org/w/api.php';

interface Candidate {
  url: string;
  text: string;
  source: Exclude<ThumbnailSource, 'cigarette-fallback'>;
}

const POSITIVE_TERMS = [
  'cigarette', 'cigarettes', 'rokok', 'tobacco', 'tembakau', 'cigarillo', 'smoking',
  'cigarette pack', 'tobacco pack', 'rokok batang', 'bungkus rokok', 'pack of cigarettes',
];

const NEGATIVE_TERMS = [
  'food', 'drink', 'beverage', 'snack', 'coffee', 'tea', 'fruit', 'vegetable', 'shirt',
  'clothing', 'shoe', 'car', 'motorcycle', 'landscape', 'person', 'portrait', 'animal',
  'phone', 'laptop', 'logo only', 'icon', 'wallpaper', 'abstract',
];

function keyOf(product: ThumbnailProduct): string {
  return `${product.sku ?? ''}:${product.name.trim().toLowerCase()}`;
}

function isImageUrl(value: unknown): value is string {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokens(value: string): string[] {
  return normalize(value).split(' ').filter((token) => token.length >= 3);
}

function relevance(text: string, productName: string): number {
  const haystack = normalize(text);
  const product = normalize(productName);
  const productTokens = tokens(productName);
  const exact = haystack.includes(product) ? 55 : 0;
  const matched = productTokens.filter((token) => haystack.includes(token)).length;
  const tokenScore = productTokens.length ? Math.round((matched / productTokens.length) * 30) : 0;
  const cigaretteScore = POSITIVE_TERMS.some((term) => haystack.includes(normalize(term))) ? 20 : 0;
  const negativePenalty = NEGATIVE_TERMS.some((term) => haystack.includes(normalize(term))) ? 70 : 0;
  return Math.max(0, Math.min(100, exact + tokenScore + cigaretteScore - negativePenalty));
}

function isAcceptable(text: string, productName: string, minimum = 45): boolean {
  const score = relevance(text, productName);
  const categoryMatch = POSITIVE_TERMS.some((term) => normalize(text).includes(normalize(term)));
  return categoryMatch && score >= minimum;
}

export async function findThumbnail(product: ThumbnailProduct): Promise<ThumbnailResult> {
  const key = keyOf(product);
  const cached = getThumbnailCache(key);
  if (cached) {
    return {
      success: true,
      url: cached.url,
      source: cached.source,
      product: product.name,
      cached: true,
      confidence: cached.confidence,
    };
  }

  if (product.sourceUrl) {
    const scraped = await scrapeImage(product.sourceUrl);
    if (scraped && isAcceptable(scraped.text, product.name, 45)) {
      const confidence = relevance(scraped.text, product.name);
      setThumbnailCache(key, { url: scraped.url, source: 'astro', confidence });
      return { success: true, url: scraped.url, source: 'astro', product: product.name, cached: false, confidence };
    }
  }

  const candidates = [
    ...(await searchOpenverseCandidates(product.name)),
    ...(await searchWikimediaCandidates(product.name)),
  ];
  const best = candidates
    .map((candidate) => ({ candidate, score: relevance(candidate.text, product.name) }))
    .filter((item) => isAcceptable(item.candidate.text, product.name, 45))
    .sort((a, b) => b.score - a.score)[0];

  if (best) {
    setThumbnailCache(key, { url: best.candidate.url, source: best.candidate.source, confidence: best.score });
    return { success: true, url: best.candidate.url, source: best.candidate.source, product: product.name, cached: false, confidence: best.score };
  }

  const google = await googleFallback(product.name);
  if (google) {
    const score = relevance(google.text, product.name);
    if (score >= 45 && isAcceptable(google.text, product.name, 45)) {
      setThumbnailCache(key, { url: google.url, source: 'google', confidence: score });
      return { success: true, url: google.url, source: 'google', product: product.name, cached: false, confidence: score };
    }
  }

  setThumbnailCache(key, { url: FALLBACK, source: 'cigarette-fallback', confidence: 35 });
  return { success: true, url: FALLBACK, source: 'cigarette-fallback', product: product.name, cached: false, confidence: 35 };
}

async function searchOpenverseCandidates(query: string): Promise<Candidate[]> {
  const queries = [
    `${query} cigarette pack`,
    `${query} cigarette tobacco`,
    `${query} cigarettes`,
  ];
  const results: Candidate[] = [];
  for (const searchQuery of queries) {
    try {
      const endpoint = `${OPENVERSE_ENDPOINT}?q=${encodeURIComponent(searchQuery)}&page_size=10`;
      const response = await fetch(endpoint, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(10000) });
      if (!response.ok) continue;
      const data: unknown = await response.json();
      if (!data || typeof data !== 'object') continue;
      const raw = (data as { results?: unknown }).results;
      if (!Array.isArray(raw)) continue;
      for (const item of raw) {
        if (!item || typeof item !== 'object') continue;
        const value = item as Record<string, unknown>;
        const url = isImageUrl(value.thumbnail) ? value.thumbnail : isImageUrl(value.url) ? value.url : null;
        if (!url) continue;
        const title = typeof value.title === 'string' ? value.title : '';
        const description = typeof value.description === 'string' ? value.description : '';
        results.push({ url, text: `${title} ${description}`, source: 'openverse' });
      }
    } catch {
      // Continue to the next independent source/query.
    }
  }
  return results;
}

async function searchWikimediaCandidates(query: string): Promise<Candidate[]> {
  try {
    const params = new URLSearchParams({
      action: 'query', generator: 'search', gsrsearch: `${query} cigarette pack`, gsrnamespace: '6', gsrlimit: '10',
      prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: '600', format: 'json', origin: '*',
    });
    const response = await fetch(`${WIKIMEDIA_ENDPOINT}?${params.toString()}`, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(10000) });
    if (!response.ok) return [];
    const data: unknown = await response.json();
    if (!data || typeof data !== 'object') return [];
    const queryData = (data as { query?: unknown }).query;
    if (!queryData || typeof queryData !== 'object') return [];
    const pages = (queryData as { pages?: unknown }).pages;
    if (!pages || typeof pages !== 'object') return [];

    return Object.values(pages as Record<string, unknown>).flatMap((item): Candidate[] => {
      if (!item || typeof item !== 'object') return [];
      const page = item as Record<string, unknown>;
      const imageinfo = Array.isArray(page.imageinfo) ? page.imageinfo[0] : null;
      if (!imageinfo || typeof imageinfo !== 'object') return [];
      const info = imageinfo as Record<string, unknown>;
      const url = isImageUrl(info.thumburl) ? info.thumburl : isImageUrl(info.url) ? info.url : null;
      if (!url) return [];
      const title = typeof page.title === 'string' ? page.title : '';
      const metadata = info.extmetadata && typeof info.extmetadata === 'object' ? JSON.stringify(info.extmetadata) : '';
      return [{ url, text: `${title} ${metadata}`, source: 'wikimedia' }];
    });
  } catch {
    return [];
  }
}

async function googleFallback(query: string): Promise<{ url: string; text: string } | null> {
  const key = process.env.GOOGLE_CSE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;
  if (!key || !cx) return null;
  try {
    const endpoint = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(key)}&cx=${encodeURIComponent(cx)}&searchType=image&num=5&q=${encodeURIComponent(`${query} cigarette pack`)}`;
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    if (!data || typeof data !== 'object') return null;
    const items = (data as { items?: unknown }).items;
    if (!Array.isArray(items)) return null;
    for (const item of items) {
      if (!item || typeof item !== 'object') continue;
      const value = item as Record<string, unknown>;
      const link = value.link;
      if (!isImageUrl(link)) continue;
      const text = `${typeof value.title === 'string' ? value.title : ''} ${typeof value.snippet === 'string' ? value.snippet : ''}`;
      if (isAcceptable(text, query, 45)) return { url: link, text };
    }
    return null;
  } catch {
    return null;
  }
}
