import ProductCard, { type ProductCardData } from './ProductCard'
import styles from './ProductGrid.module.css'

export interface ProductGridProps {
  products: ProductCardData[]
  onAddToCart?: (product: ProductCardData) => void
  onIncrease?: (product: ProductCardData) => void
  onDecrease?: (product: ProductCardData) => void
  onQuickView?: (product: ProductCardData) => void
  onToggleWishlist?: (product: ProductCardData) => void
  wishlistIds?: Array<string | number>
}

export default function ProductGrid({ products, onAddToCart, onIncrease, onDecrease, onQuickView, onToggleWishlist, wishlistIds = [] }: ProductGridProps) {
  const wishlist = new Set(wishlistIds.map(String))
  return (
    <div aria-label="Katalog produk" className={styles.grid}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 4} wishlistActive={wishlist.has(String(product.id))} onAddToCart={onAddToCart} onIncrease={onIncrease} onDecrease={onDecrease} onQuickView={onQuickView} onToggleWishlist={onToggleWishlist} />
      ))}
    </div>
  )
}
