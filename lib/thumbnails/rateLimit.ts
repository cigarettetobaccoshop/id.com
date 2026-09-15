const lastRequest = new Map<string, number>();
const MIN_INTERVAL_MS = 3000;

export function assertDomainRateLimit(domain: string): void {
  const now = Date.now();
  const previous = lastRequest.get(domain) ?? 0;
  if (now - previous < MIN_INTERVAL_MS) {
    throw new Error('THUMBNAIL_RATE_LIMIT');
  }
  lastRequest.set(domain, now);
}
