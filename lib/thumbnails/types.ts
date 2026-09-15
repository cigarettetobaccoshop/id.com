export type ThumbnailSource = 'astro' | 'openverse' | 'wikimedia' | 'google' | 'placeholder';

export interface ThumbnailProduct {
  name: string;
  sku?: string;
  sourceUrl?: string;
}

export interface ThumbnailResult {
  success: true;
  url: string;
  source: ThumbnailSource;
  product: string;
  cached: boolean;
}

export interface ThumbnailError {
  success: false;
  error: string;
  code: string;
  hint: string;
}

export type ThumbnailResolveResponse = ThumbnailResult | ThumbnailError;
