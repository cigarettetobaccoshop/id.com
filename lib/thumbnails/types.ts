export type ThumbnailSource = 'astro' | 'google' | 'placeholder';

export interface ThumbnailProduct {
  name: string;
  sku?: string;
  sourceUrl?: string;
}

export interface ThumbnailResult {
  success: boolean;
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

export interface ThumbnailResolveResponse extends ThumbnailResult, Partial<ThumbnailError> {}
