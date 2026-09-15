import type { NextApiRequest, NextApiResponse } from 'next';
import dns from 'node:dns/promises';
import net from 'node:net';

function isPrivateIp(address: string): boolean {
  if (net.isIPv4(address)) {
    const [a, b] = address.split('.').map(Number);
    return a === 10 || a === 127 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a === 0;
  }
  return address === '::1' || address.startsWith('fc') || address.startsWith('fd') || address.startsWith('fe80:');
}

async function safeUrl(raw: string): Promise<URL> {
  const url = new URL(raw);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('INVALID_PROTOCOL');
  const addresses = await dns.lookup(url.hostname, { all: true });
  if (addresses.some((item) => isPrivateIp(item.address))) throw new Error('PRIVATE_TARGET');
  return url;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'GET') { res.status(405).end(); return; }
  const raw = typeof req.query.url === 'string' ? req.query.url : '';
  if (!raw || raw.length > 2048) { res.status(400).end(); return; }
  try {
    const url = await safeUrl(raw);
    const response = await fetch(url, { redirect: 'manual', headers: { accept: 'image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8' }, signal: AbortSignal.timeout(15000) });
    if (response.status >= 300 && response.status < 400) { res.status(400).end(); return; }
    if (!response.ok) { res.status(response.status).end(); return; }
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.startsWith('image/')) { res.status(415).end(); return; }
    const length = Number(response.headers.get('content-length') ?? 0);
    if (length > 8_000_000) { res.status(413).end(); return; }
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.byteLength > 8_000_000) { res.status(413).end(); return; }
    res.setHeader('Content-Type', contentType.split(';')[0]);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(bytes);
  } catch (error: unknown) {
    const code = error instanceof Error ? error.message : 'PROXY_FAILED';
    res.status(code === 'PRIVATE_TARGET' ? 403 : 400).end();
  }
}
