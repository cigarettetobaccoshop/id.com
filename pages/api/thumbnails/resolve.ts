import type { NextApiRequest, NextApiResponse } from 'next';
import { findThumbnail } from '../../../lib/thumbnails/finder';
import type { ThumbnailError, ThumbnailProduct, ThumbnailResult } from '../../../lib/thumbnails/types';

function errorResponse(code: string, error: string, hint: string): ThumbnailError {
  return { success: false, error, code, hint };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ThumbnailResult | ThumbnailError>): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json(errorResponse('METHOD_NOT_ALLOWED', 'Metode tidak diizinkan.', 'Gunakan POST.'));
    return;
  }
  const body = req.body as Partial<ThumbnailProduct>;
  if (typeof body.name !== 'string' || body.name.trim().length < 2 || body.name.length > 160) {
    res.status(400).json(errorResponse('INVALID_PRODUCT', 'Nama produk tidak valid.', 'Kirim field name minimal 2 karakter.'));
    return;
  }
  try {
    const result = await findThumbnail({ name: body.name.trim(), sku: typeof body.sku === 'string' ? body.sku : undefined, sourceUrl: typeof body.sourceUrl === 'string' ? body.sourceUrl : undefined });
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.status(200).json(result);
  } catch (error: unknown) {
    const code = error instanceof Error && error.message === 'THUMBNAIL_RATE_LIMIT' ? 'RATE_LIMITED' : 'RESOLVE_FAILED';
    res.status(code === 'RATE_LIMITED' ? 429 : 500).json(errorResponse(code, 'Thumbnail belum dapat diproses.', 'Coba lagi beberapa detik kemudian.'));
  }
}
