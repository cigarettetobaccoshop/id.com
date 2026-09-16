import { useState } from 'react';

interface ProductThumbnailProps {
  name: string;
  sourceUrl?: string;
  catalogLabel?: 'R2' | 'Resmi';
  size?: number;
  className?: string;
}

const THUMBNAIL_ASSETS = {
  R2: 'https://i.ibb.co.com/93cLbdpZ/1000090184-99kb.jpg',
  Resmi: 'https://i.ibb.co.com/HLP1wkQV/1000090185-99kb.jpg',
};

const FALLBACK_ASSETS = {
  R2: '/images/thumbnails/r2-pack-grayscale.svg',
  Resmi: '/images/thumbnails/resmi-pack-grayscale.svg',
};

export default function ProductThumbnail({ name, sourceUrl, catalogLabel = 'R2', size = 160, className }: ProductThumbnailProps): JSX.Element {
  const label = catalogLabel === 'Resmi' ? 'Resmi' : 'R2';
  const [src, setSrc] = useState(sourceUrl || THUMBNAIL_ASSETS[label]);
  const imageSizes = size <= 190 ? '(max-width: 639px) 45vw, 190px' : `${size}px`;

  return (
    <div
      className={className}
      aria-label={`Thumbnail katalog ${label} untuk ${name}`}
      style={{ position: 'relative', width: size, height: size, display: 'grid', placeItems: 'center', overflow: 'hidden', borderRadius: 18 }}
    >
      <img
        src={src}
        alt={`Thumbnail produk ${label} — ${name}`}
        width={size}
        height={size}
        sizes={imageSizes}
        loading="lazy"
        decoding="async"
        onError={() => setSrc(FALLBACK_ASSETS[label])}
        style={{ width: size, height: size, objectFit: 'cover', display: 'block' }}
      />
    </div>
  );
}
