import Image from 'next/image';
import type { CSSProperties } from 'react';
import { useThumbnail } from '../../hooks/thumbnails/useThumbnail';

interface ProductThumbnailProps { name: string; sourceUrl?: string; size?: number; className?: string; }

export default function ProductThumbnail({ name, sourceUrl, size = 160, className }: ProductThumbnailProps): JSX.Element {
  const thumbnail = useThumbnail(name, sourceUrl);
  const style: CSSProperties = { width: size, height: size, objectFit: 'contain' };
  return <div className={className} aria-label={`Gambar produk ${name}`} style={{ position: 'relative', width: size, height: size }}>
    {thumbnail.loading ? <div aria-hidden="true" style={{ ...style, borderRadius: 12, background: 'linear-gradient(90deg,#e5e7eb,#f8fafc,#e5e7eb)' }} /> : <Image src={thumbnail.url} alt={name} width={size} height={size} style={style} unoptimized />}
  </div>;
}
