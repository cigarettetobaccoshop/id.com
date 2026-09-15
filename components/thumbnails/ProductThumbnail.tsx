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

export default function ProductThumbnail({ name, sourceUrl, size = 160, className }: ProductThumbnailProps): JSX.Element {
  const thumbnail = useThumbnail(name, sourceUrl);
  const [imageError, setImageError] = useState(false);
  const style: CSSProperties = { width: size, height: size, objectFit: 'contain' };
  const showFallback = thumbnail.loading || imageError || thumbnail.source === 'placeholder';

  return (
    <div className={className} aria-label={`Gambar produk ${name}`} style={{ position: 'relative', width: size, height: size, display: 'grid', placeItems: 'center' }}>
      {thumbnail.loading ? (
        <div aria-hidden="true" style={{ ...style, borderRadius: 12, background: 'linear-gradient(90deg,#e5e7eb,#f8fafc,#e5e7eb)' }} />
      ) : showFallback ? (
        <div aria-hidden="true" style={{ width: size * 0.46, height: size * 0.72, padding: 8, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: 7, background: 'linear-gradient(160deg,#173d67,#0b2746)', color: '#fff', boxShadow: '0 15px 28px rgba(7,29,73,.22)', textAlign: 'center' }}>
          <small style={{ fontSize: Math.max(5, size / 32), lineHeight: 1.1 }}>R2 NUSANTARA</small>
          <strong style={{ fontSize: Math.max(11, size / 12), lineHeight: 1.05, overflowWrap: 'anywhere' }}>{name}</strong>
          <small style={{ fontSize: Math.max(6, size / 25), letterSpacing: 1 }}>GROSIR</small>
        </div>
      ) : (
        <Image src={thumbnail.url} alt={name} width={size} height={size} style={style} unoptimized onError={() => setImageError(true)} />
      )}
    </div>
  );
}
