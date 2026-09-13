import Image from 'next/image';
import { Heart, Eye, ShoppingCart, Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import styles from './ProductCard.module.css';

export default function ProductCard({ product, onAddToCart, onQuickView }) {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleQuantityChange = (delta) => {
    const newQty = Math.max(1, quantity + delta);
    setQuantity(newQty);
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product, quantity);
    }
    setQuantity(1);
  };

  return (
    <div className={styles.card}>
      {/* Image Container */}
      <div className={styles.imageContainer}>
        <Image src={product.image} alt={product.title} className={styles.image} fill sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw" />

        {/* Badge */}
        {product.badge && (
          <div className={`${styles.badge} ${styles[`badge${product.badgeType}`]}`}>
            {product.badge}
          </div>
        )}

        {/* Heart Icon */}
        <button
          className={`${styles.heartIcon} ${isWishlisted ? styles.wishlisted : ''}`}
          onClick={() => setIsWishlisted(!isWishlisted)}
          aria-label="Add to wishlist"
        >
          <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Overlay Info */}
        <div className={styles.overlay}>
          <button
            className={styles.quickViewBtn}
            onClick={() => onQuickView?.(product)}
            aria-label="Quick view"
          >
            <Eye size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h3 className={styles.title}>{product.title}</h3>

        {/* Rating */}
        <div className={styles.rating}>
          <span className={styles.stars}>{'★'.repeat(Math.floor(product.rating))}</span>
          <span className={styles.ratingValue}>{product.rating}</span>
          <span className={styles.reviews}>({product.reviews})</span>
        </div>

        {/* Price */}
        <div className={styles.priceContainer}>
          {product.originalPrice && (
            <span className={styles.originalPrice}>Rp {product.originalPrice.toLocaleString('id-ID')}</span>
          )}
          <span className={styles.price}>Rp {product.price.toLocaleString('id-ID')}</span>
          {product.discount && <span className={styles.discount}>Hemat {product.discount}%</span>}
        </div>

        {/* Stock Status */}
        <div className={styles.stockStatus}>
          <span className={styles.statusIcon}>✓</span>
          <span className={styles.statusText}>Ready Stock Gudang</span>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {/* Quantity Control - Hidden by default, shown on demand */}
          <div className={styles.quantityControl}>
            <button
              onClick={() => handleQuantityChange(-1)}
              className={styles.qtyBtn}
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <output className={styles.qtyDisplay}>{quantity}</output>
            <button
              onClick={() => handleQuantityChange(1)}
              className={styles.qtyBtn}
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button className={styles.cartBtn} onClick={handleAddToCart} aria-label="Add to cart">
            <ShoppingCart size={18} />
            <span>Keranjang</span>
          </button>

          {/* Quick View Icon */}
          <button
            className={styles.viewBtn}
            onClick={() => onQuickView?.(product)}
            aria-label="Quick view modal"
          >
            <Eye size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
