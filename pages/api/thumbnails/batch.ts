import type { NextApiRequest, NextApiResponse } from 'next';
import { findThumbnail } from '../../../lib/thumbnails/finder';
import type { ThumbnailError, ThumbnailProduct, ThumbnailResult } from '../../../lib/thumbnails/types';

interface BatchResponse { success: true; results: ThumbnailResult[] }

export default async function handler(req: NextApiRequest, res: NextApiResponse<BatchResponse | ThumbnailError>): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Metode tidak diizinkan.', code: 'METHOD_NOT_ALLOWED', hint: 'Gunakan POST.' });
    return;
  }
  const secret = process.env.THUMBNAIL_BATCH_SECRET;
  if (!secret || req.headers['x-thumbnail-batch-secret'] !== secret) {
    res.status(401).json({ success: false, error: 'Akses ditolak.', code: 'UNAUTHORIZED', hint: 'Gunakan secret batch server-side.' });
    return;
  }
  const products = Array.isArray((req.body as { products?: unknown }).products) ? (req.body as { products: unknown[] }).products : [];
  if (products.length < 1 || products.length > 50) {
    res.status(400).json({ success: false, error: 'Batch tidak valid.', code: 'INVALID_BATCH', hint: 'Kirim 1 sampai 50 produk.' });
    return;
  }
  const valid: ThumbnailProduct[] = products.filter((item): item is ThumbnailProduct => {
    if (!item || typeof item !== 'object') return false;
    const candidate = item as Partial<ThumbnailProduct>;
    return typeof candidate.name === 'string' && candidate.name.trim().length >= 2;
  });
  const results: ThumbnailResult[] = [];
  for (const product of valid) results.push(await findThumbnail(product));
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ success: true, results });
}
