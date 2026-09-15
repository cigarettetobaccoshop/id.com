export type ThumbnailLogLevel = 'info' | 'warn' | 'error';

export interface ThumbnailLogContext {
  event: string;
  domain?: string;
  product?: string;
  code?: string;
}

export function thumbnailLog(level: ThumbnailLogLevel, context: ThumbnailLogContext): void {
  const payload = JSON.stringify({
    service: 'thumbnail-resolver',
    level,
    time: new Date().toISOString(),
    ...context,
  });

  if (level === 'error') console.error(payload);
  else if (level === 'warn') console.warn(payload);
  else console.info(payload);
}
