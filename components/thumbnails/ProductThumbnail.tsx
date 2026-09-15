import Image from 'next/image';
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useThumbnail } from '../../hooks/thumbnails/useThumbnail';

interface ProductThumbnailProps {
  name: string;
  sourceUrl?: string;
  size?: number;
  className?: string;
}

const SAFE_FALLBACK = '/images/thumbnails/cigarette-pack-fallback.svg';

export default function ProductThumbnail({ name, sourceUrl, size = 160, className }: ProductThumbnailProps): JSX.Element {
  const thumbnail = useThumbnail(name, sourceUrl);
  const [imageError, setImageError] = useState(false);
  const style: CSSProperties = { width: size, height: size, objectFit: 'contain' };
  const showFallback = imageError || thumbnail.source === 'cigarette-fallback';

  return (
    <div className={className} aria-label={`Gambar produk ${name}`} style={{ position: 'relative', width: size, height: size, display: 'grid', placeItems: 'center' }}>
      {thumbnail.loading ? (
        <div aria-hidden="true" style={{ ...style, borderRadius: 12, background: 'linear-gradient(90deg,#e5e7eb,#f8fafc,#e5e7eb)' }} />
      ) : showFallback ? (
        <Image src={SAFE_FALLBACK} alt={`Visual rokok ${name}`} width={size} height={size} style={style} unoptimized />
      ) : (
        <Image src={thumbnail.url} alt={name} width={size} height={size} style={style} unoptimized onError={() => setImageError(true)} />
      )}
    </div>
  );
}
