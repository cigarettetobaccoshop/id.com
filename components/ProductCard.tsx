import Image from 'next/image'
import type { ReactNode } from 'react'
import styles from './ProductCard.module.css'

export interface ProductCardData {
  id: string | number
  name: string
  category?: string
  originalPrice?: number
  discountPrice?: number
  discountPercentage?: number
  rating?: number
  stockStatus?: string
  imageUrl?: string
  isVip?: boolean
  isNew?: boolean
  quantity?: number
}

export interface ProductCardProps {
  product: ProductCardData
  onAddToCart?: (product: ProductCardData) => void
  onIncrease?: (product: ProductCardData) => void
  onDecrease?: (product: ProductCardData) => void
  onQuickView?: (product: ProductCardData) => void
  onToggleWishlist?: (product: ProductCardData) => void
  wishlistActive?: boolean
  priority?: boolean
}

const money = (value?: number) => {
  if (!Number.isFinite(Number(value))) return '—'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

function ActionButton({ children, label, onClick, className = '' }: { children: ReactNode; label: string; onClick?: () => void; className?: string }) {
  return <button type="button" aria-label={label} onClick={onClick} className={`${styles.iconButton} ${className}`}>{children}</button>
}

export default function ProductCard({ product, onAddToCart, onIncrease, onDecrease, onQuickView, onToggleWishlist, wishlistActive = false, priority = false }: ProductCardProps) {
  const hasDiscount = typeof product.originalPrice === 'number' && typeof product.discountPrice === 'number' && product.discountPrice < product.originalPrice
  const finalPrice = typeof product.discountPrice === 'number' ? product.discountPrice : product.originalPrice

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {product.imageUrl ? <Image src={product.imageUrl} alt={product.name} fill priority={priority} sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw" className={styles.image} /> : <div className={styles.imageFallback}><span>R2 NUSANTARA</span></div>}
        <div className={styles.imageOverlay} />
        <div className={styles.badges}>{product.isVip && <span className={styles.vip}>VIP</span>}{product.isNew && <span className={styles.new}>BARU</span>}</div>
        <ActionButton label={wishlistActive ? `Hapus ${product.name} dari wishlist` : `Tambah ${product.name} ke wishlist`} onClick={() => onToggleWishlist?.(product)} className={wishlistActive ? styles.wishlistActive : ''}>{wishlistActive ? '♥' : '♡'}</ActionButton>
      </div>
      <div className={styles.body}>
        {product.category && <span className={styles.category}>{product.category}</span>}
        <h3 className={styles.name}>{product.name}</h3>
        {typeof product.rating === 'number' && <div className={styles.rating} aria-label={`Rating ${product.rating} dari 5`}><span>★</span> {product.rating.toFixed(1)}</div>}
        <div className={styles.priceBlock}>
          {hasDiscount && <div className={styles.oldPriceRow}><span>{money(product.originalPrice)}</span>{product.discountPercentage ? <b>-{product.discountPercentage}%</b> : null}</div>}
          <strong>{money(finalPrice)}</strong>
        </div>
        <div className={styles.stock}><i /> {product.stockStatus || 'Cek stok'}</div>
        <div className={styles.actions}>
          <div className={styles.quantity} aria-label={`Jumlah ${product.name}`}>
            <button type="button" aria-label="Kurangi jumlah" disabled={!product.quantity} onClick={() => onDecrease?.(product)}>−</button>
            <output aria-live="polite">{product.quantity || 0}</output>
            <button type="button" aria-label="Tambah jumlah" onClick={() => onIncrease?.(product)}>+</button>
          </div>
          <button type="button" className={styles.cartButton} onClick={() => onAddToCart?.(product)}>🛒 Keranjang</button>
          <ActionButton label={`Quick View ${product.name}`} onClick={() => onQuickView?.(product)}>◉</ActionButton>
        </div>
      </div>
    </article>
  )
}
