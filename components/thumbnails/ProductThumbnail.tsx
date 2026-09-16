import Image from 'next/image';

interface ProductThumbnailProps {
  name: string;
  sourceUrl?: string;
  catalogLabel?: 'R2' | 'Resmi';
  size?: number;
  className?: string;
}

const PACK_ASSETS = {
  R2: '/images/thumbnails/r2-pack-grayscale.svg',
  Resmi: '/images/thumbnails/resmi-pack-grayscale.svg',
};

export default function ProductThumbnail({ name, catalogLabel = 'R2', size = 160, className }: ProductThumbnailProps): JSX.Element {
  const label = catalogLabel === 'Resmi' ? 'Resmi' : 'R2';
  const src = PACK_ASSETS[label];
  const imageSizes = size <= 190 ? '(max-width: 639px) 45vw, 190px' : `${size}px`;

  return (
    <div
      className={className}
      aria-label={`Thumbnail katalog ${label} untuk ${name}`}
      style={{ position: 'relative', width: size, height: size, display: 'grid', placeItems: 'center' }}
    >
      <Image
        src={src}
        alt={`Visual kemasan ${label} — ${name}`}
        width={size}
        height={size}
        sizes={imageSizes}
        loading="lazy"
        decoding="async"
        unoptimized
        style={{ width: size, height: size, objectFit: 'contain' }}
      />
    </div>
  );
}
