import ProductCard, { type ProductCardData } from './ProductCard'

export interface ProductGridProps {
  products: ProductCardData[]
  onAddToCart?: (product: ProductCardData) => void
  onQuickView?: (product: ProductCardData) => void
  onToggleWishlist?: (product: ProductCardData) => void
  wishlistIds?: Array<string | number>
}

export default function ProductGrid({
  products,
  onAddToCart,
  onQuickView,
  onToggleWishlist,
  wishlistIds = [],
}: ProductGridProps) {
  const wishlist = new Set(wishlistIds.map(String))

  return (
    <div
      aria-label="Katalog produk"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
        gap: '12px',
      }}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < 4}
          wishlistActive={wishlist.has(String(product.id))}
          onAddToCart={onAddToCart}
          onQuickView={onQuickView}
          onToggleWishlist={onToggleWishlist}
        />
      ))}
    </div>
  )
}
