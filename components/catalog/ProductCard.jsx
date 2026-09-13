import Image from 'next/image';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import styles from './ProductCard.module.css';

export default function ProductCard({ product, onAddToCart }) {
  const [quantity, setQuantity] = useState(0);

  const handleQuantityChange = (delta) => {
    setQuantity((current) => Math.max(0, current + delta));
  };

  const handleAddToCart = () => {
    if (quantity < 1) return;
    onAddToCart?.(product, quantity);
    setQuantity(0);
  };

  const rating = Number(product?.rating) || 0;
  const reviews = Number(product?.reviews) || 0;
  const price = Number(product?.price) || 0;
  const originalPrice = Number(product?.originalPrice) || 0;
  const discount = Number(product?.discount) || 0;

  return (
    <article className={styles.card}>
      <div className={styles.imageContainer}>
        <Image
          src={product.image}
          alt={product.title}
          className={styles.image}
          fill
          sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
        />

        {product.badge && (
          <span className={`${styles.badge} ${styles[`badge${product.badgeType}`] || ''}`}>
            {product.badge}
          </span>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{product.title}</h3>

        <div className={styles.rating} aria-label={`Rating ${rating} dari 5, ${reviews} ulasan`}>
          <span className={styles.stars} aria-hidden="true">
            {'★'.repeat(Math.min(5, Math.max(0, Math.round(rating))))}
          </span>
          <span className={styles.ratingValue}>{rating.toFixed(1)}</span>
          <span className={styles.reviews}>({reviews})</span>
        </div>

        <div className={styles.priceBlock}>
          <div className={styles.priceRow}>
            <span className={styles.price}>Rp {price.toLocaleString('id-ID')}</span>
            {discount > 0 && <span className={styles.discount}>-{discount}%</span>}
          </div>
          {originalPrice > price && (
            <span className={styles.originalPrice}>Rp {originalPrice.toLocaleString('id-ID')}</span>
          )}
        </div>

        <div className={styles.stockStatus}>
          <span className={styles.statusDot} aria-hidden="true" />
          <span>Ready Stock Gudang</span>
        </div>

        <div className={styles.actions}>
          <div className={styles.quantityControl} aria-label={`Jumlah ${product.title}`}>
            <button
              type="button"
              onClick={() => handleQuantityChange(-1)}
              className={styles.qtyBtn}
              aria-label={`Kurangi jumlah ${product.title}`}
              disabled={quantity === 0}
            >
              <Minus size={16} strokeWidth={2.25} aria-hidden="true" />
            </button>
            <output className={styles.qtyDisplay} aria-live="polite">{quantity}</output>
            <button
              type="button"
              onClick={() => handleQuantityChange(1)}
              className={styles.qtyBtn}
              aria-label={`Tambah jumlah ${product.title}`}
            >
              <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            className={styles.cartBtn}
            onClick={handleAddToCart}
            disabled={quantity === 0}
            aria-label={`Tambah ${product.title} ke keranjang`}
          >
            <ShoppingCart size={18} strokeWidth={2.2} aria-hidden="true" />
            <span>Keranjang</span>
          </button>
        </div>
      </div>
    </article>
  );
}
