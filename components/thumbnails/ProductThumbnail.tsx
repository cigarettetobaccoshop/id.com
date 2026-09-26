import { useEffect, useMemo, useState } from 'react';

interface ProductThumbnailProps {
  name: string;
  sourceUrl?: string;
  catalogLabel?: 'R2' | 'Resmi';
  sku?: string;
  size?: number;
  className?: string;
}

const THUMBNAIL_ASSETS = {
  R2: 'https://i.ibb.co.com/RpJyY5Sn/thumbnail-katalog-r2-100kb.jpg',
  Resmi: 'https://i.ibb.co.com/pjcxgm29/thumbnail-katalog-resmi-100kb.jpg',
};

const FALLBACK_ASSETS = {
  R2: '/images/thumbnails/r2-pack-grayscale.svg',
  Resmi: '/images/thumbnails/resmi-pack-grayscale.svg',
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function shortTitle(value: string): string {
  const normalized = value.trim().replace(/\s+/g, ' ');
  return normalized.length > 24 ? `${normalized.slice(0, 22)}…` : normalized;
}

function makeCatalogVisual(name: string, label: 'R2' | 'Resmi'): string {
  const title = escapeXml(shortTitle(name || 'Produk R2 NUSANTARA'));
  const brand = label === 'Resmi' ? 'RESMI' : 'R2 NUSANTARA';
  const accent = label === 'Resmi' ? '#9a6b16' : '#0b3f95';
  const dark = label === 'Resmi' ? '#4a3411' : '#071d49';
  const hash = Array.from(name).reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);
  const angle = (hash % 9) - 4;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 760">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f8fbff"/><stop offset="1" stop-color="#dceafb"/></linearGradient>
    <linearGradient id="pack" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${accent}"/><stop offset="1" stop-color="${dark}"/></linearGradient>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="22" stdDeviation="18" flood-color="#071d49" flood-opacity=".22"/></filter>
  </defs>
  <rect width="600" height="760" rx="34" fill="url(#bg)"/>
  <circle cx="500" cy="110" r="120" fill="#fff" opacity=".42"/>
  <g transform="translate(300 390) rotate(${angle}) translate(-180 -250)" filter="url(#shadow)">
    <rect width="360" height="500" rx="24" fill="url(#pack)"/>
    <rect x="18" y="18" width="324" height="64" rx="14" fill="#fff" opacity=".95"/>
    <text x="180" y="59" text-anchor="middle" font-family="Arial,sans-serif" font-size="25" font-weight="800" fill="${dark}">${brand}</text>
    <rect x="36" y="122" width="288" height="205" rx="18" fill="#fff" opacity=".94"/>
    <path d="M92 278 C120 230 145 226 160 250 C176 274 190 274 207 242 C223 212 245 217 268 270" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round" opacity=".82"/>
    <text x="180" y="174" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" font-weight="700" fill="${dark}" letter-spacing="2">GROSIR</text>
    <text x="180" y="372" text-anchor="middle" font-family="Arial,sans-serif" font-size="23" font-weight="800" fill="#fff">${title}</text>
    <text x="180" y="410" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" font-weight="700" fill="#fff" opacity=".82">KATALOG R2 NUSANTARA</text>
    <rect x="38" y="446" width="284" height="20" rx="10" fill="#fff" opacity=".24"/>
  </g>
  <text x="300" y="714" text-anchor="middle" font-family="Arial,sans-serif" font-size="15" font-weight="700" fill="#49627f" letter-spacing="1.6">VISUAL KATALOG</text>
</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export default function ProductThumbnail({ name, sourceUrl, catalogLabel = 'R2', sku = '', size = 160, className }: ProductThumbnailProps): JSX.Element {
  const normalizedSku = sku.trim();
  const label = catalogLabel === 'Resmi' ? 'Resmi' : 'R2';
  const generatedVisual = useMemo(() => makeCatalogVisual(name, label), [name, label]);
  const mappedSource = sourceUrl || undefined;
  const initialSource = THUMBNAIL_ASSETS[label] || mappedSource || generatedVisual;
  const [src, setSrc] = useState(initialSource);

  useEffect(() => {
    setSrc(initialSource);
  }, [initialSource]);

  const imageSizes = size <= 190 ? '(max-width: 639px) 45vw, 190px' : `${size}px`;

  return (
    <div
      className={className}
      aria-label={`Thumbnail katalog ${label} untuk ${name}${normalizedSku ? `, SKU ${normalizedSku}` : ''}`}
      style={{ position: 'relative', width: size, height: size, display: 'grid', placeItems: 'center', overflow: 'hidden', borderRadius: 18 }}
    >
      <img
        src={src}
        alt={`Visual katalog produk ${label} — ${name}`}
        width={size}
        height={size}
        sizes={imageSizes}
        loading="lazy"
        decoding="async"
        onError={() => setSrc(mappedSource || generatedVisual || FALLBACK_ASSETS[label])}
        style={{ width: size, height: size, objectFit: 'cover', display: 'block' }}
      />
    </div>
  );
}
