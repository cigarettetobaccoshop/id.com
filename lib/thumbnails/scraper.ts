import { assertDomainRateLimit } from './rateLimit';
import { thumbnailLog } from './logger';

const USER_AGENTS = [
  'R2-Nusantara-Thumbnail/1.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/123 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/17.0',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
];

export interface ScrapedImageCandidate {
  url: string;
  text: string;
}

export async function scrapeImage(sourceUrl: string): Promise<ScrapedImageCandidate | null> {
  const url = new URL(sourceUrl);
  if (!['http:', 'https:'].includes(url.protocol)) return null;
  assertDomainRateLimit(url.hostname);
  if (!(await allowedByRobots(url))) return null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(sourceUrl, {
        headers: { 'user-agent': USER_AGENTS[attempt % USER_AGENTS.length], accept: 'text/html,application/xhtml+xml' },
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error(`HTTP_${response.status}`);
      const html = await response.text();
      const imageMatch = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']/i);
      if (!imageMatch?.[1]) return null;

      const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '';
      const description = html.match(/<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']+)["']/i)?.[1] ?? '';
      const text = `${title} ${description}`.replace(/\s+/g, ' ').trim();
      return { url: new URL(imageMatch[1], url.origin).toString(), text };
    } catch (error: unknown) {
      thumbnailLog(attempt === 2 ? 'warn' : 'info', { event: 'scrape_retry', domain: url.hostname, code: error instanceof Error ? error.message : 'UNKNOWN' });
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
    }
  }
  return null;
}

async function allowedByRobots(url: URL): Promise<boolean> {
  try {
    const response = await fetch(`${url.origin}/robots.txt`, { headers: { 'user-agent': USER_AGENTS[0] }, signal: AbortSignal.timeout(5000) });
    if (!response.ok) return true;
    const text = await response.text();
    const rules = text.split(/\r?\n/).map((line) => line.trim().toLowerCase());
    let applies = false;
    for (const rule of rules) {
      if (rule === 'user-agent: *') applies = true;
      if (applies && rule.startsWith('disallow:')) {
        const path = rule.slice('disallow:'.length).trim();
        if (path && url.pathname.startsWith(path)) return false;
      }
    }
    return true;
  } catch {
    return true;
  }
}
