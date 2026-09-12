import React from 'react'
import { curatedBadge } from '../lib/curatedBadges'

const hashValue = value => {
  let hash = 0
  for (const char of String(value || 'R2')) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0
  return Math.abs(hash)
}

// PLACEHOLDER: rating estimasi, ganti dengan data review asli saat tersedia.
export const estimatedRating = product => {
  const bucket = hashValue(product?.Handle || product?.['Variant SKU'] || product?.Title)
  return (4.3 + (bucket % 7) / 10).toFixed(1)
}

const categoryOf = product => {
  const text = `${product?.Type || ''} ${product?.Tags || ''}`.toLowerCase()
  if (text.includes('international')) return 'international'
  if (text.includes('premium')) return 'premium'
  if (text.includes('mild')) return 'mild'
  if (text.includes('kretek') || text.includes('skt')) return 'kretek'
  return 'filter'
}

const palette = {
  kretek: { accent: '#d7a85c', paper: '#f5efe5', ink: '#402719' },
  mild: { accent: '#6db4c7', paper: '#eaf6f8', ink: '#123e49' },
  premium: { accent: '#caa56a', paper: '#f4eee3', ink: '#2d261e' },
  international: { accent: '#8ca7c6', paper: '#edf3f9', ink: '#1d3550' },
  filter: { accent: '#71808f', paper: '#eef1f4', ink: '#202a33' },
}

const barcode = Array.from({ length: 18 }, (_, i) => 2 + ((i * 7) % 3))

export default function ProductCardVisual({ product, favorite = false, onFavorite }) {
  const title = product?.Title || 'R2 NUSANTARA'
  const variant = product?.['Option1 Value'] && !/^default title$/i.test(String(product['Option1 Value']).trim())
    ? String(product['Option1 Value']).trim()
    : ''
  const category = categoryOf(product)
  const colors = palette[category]
  const badge = curatedBadge(product)
  const rating = estimatedRating(product)

  return (
    <div className={`pcv pcv-${category}`} style={{ '--pcv-accent': colors.accent, '--pcv-paper': colors.paper, '--pcv-ink': colors.ink }}>
      <div className="pcv-watermark" aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => <span key={i}>{title}</span>)}
      </div>
      {badge && <span className={`pcv-badge pcv-badge-${badge.type}`} aria-label={badge.label}>{badge.type === 'vip' ? '✦' : '＋'} {badge.label}</span>}
      <button type="button" className={`pcv-heart ${favorite ? 'is-active' : ''}`} onClick={onFavorite} aria-label={favorite ? 'Hapus dari wishlist' : 'Tambah ke wishlist'} aria-pressed={favorite}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.9c0 5-8.8 10.1-8.8 10.1S3.2 13.9 3.2 8.9A4.6 4.6 0 0 1 12 6.2a4.6 4.6 0 0 1 8.8 2.7Z" /></svg>
      </button>

      <div className="pcv-pack" aria-label={`Ilustrasi kemasan ${title}`}>
        <div className="pcv-warning">PERINGATAN KESEHATAN</div>
        <strong className="pcv-brand">{title}</strong>
        {variant && <span className="pcv-variant">{variant}</span>}
        <div className="pcv-barcode" aria-hidden="true">{barcode.map((width, i) => <i key={i} style={{ width }} />)}</div>
      </div>

      <div className="pcv-rating" aria-label={`Rating estimasi ${rating} dari 5`}>
        <span className="pcv-stars" aria-hidden="true">★★★★★</span>
        <strong>{rating}</strong>
        <small>estimasi</small>
      </div>
    </div>
  )
}
