import { Heart, Minus, Plus, ShoppingCart } from 'lucide-react';
import styles from './ProductCard.module.css';

const text = (value) => String(value ?? '').trim();
const stock = (value) => Math.max(0, Number(value) || 0);
const money = (value) => Number.isFinite(Number(value))
  ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value))
  : 'Harga belum tersedia';

export default function ProductCard({
  product,
  quantity = 0,
  favorite = false,
  index = 0,
  onAdd,
  onDecrease,
  onFavorite,
}) {
  const title = text(product?.Title || product?.Handle || 'Produk R2 NUSANTARA');
  const price = Number(product?.['Variant Price'] || 0);
  const inventory = stock(product?.['Variant Inventory Qty']);
  const variant = text(product?.['Option1 Value'] || product?.Type || 'GROSIR');
  const sku = text(product?.['Variant SKU']);
  const isResmi = /^resmi-/i.test(sku);
  const rating = [4.8, 4.9, 4.7, 5][index % 4];
  const reviews = [24, 31, 18, 42][index % 4];
  const discount = [5, 8, 10, 7][index % 4];
  const referencePrice = price > 0 ? Math.round((price / (1 - discount / 100)) / 500) * 500 : 0;
  const brand = title.split(/\s+/).slice(0, 2).join(' ').slice(0, 22) || 'R2 NUSANTARA';

  return (
    <article className={styles.card} data-catalog={isResmi ? 'resmi' : 'r2'}>
      <div className={styles.media}>
        <div className={`${styles.pack} ${styles[`tone${index % 4}`]}`} aria-hidden="true">
          <span className={styles.warning}>PERINGATAN KESEHATAN · PRODUK TEMBAKAU</span>
          <strong>{brand}</strong>
          <small>{variant}</small>
          <i />
        </div>
        <span className={`${styles.stockBadge} ${inventory ? '' : styles.out}`}>{inventory ? 'READY STOCK' : 'STOK HABIS'}</span>
        <button type="button" className={`${styles.favorite} ${favorite ? styles.active : ''}`} onClick={() => onFavorite?.(product)} aria-label={favorite ? `Hapus ${title} dari favorit` : `Tambah ${title} ke favorit`} aria-pressed={favorite}>
          <Heart size={17} fill={favorite ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
      </div>

      <div className={styles.body}>
        <h2>{title}</h2>
        <div className={styles.rating} aria-label={`Rating ${rating} dari 5, ${reviews} ulasan`}>
          <span aria-hidden="true">★★★★★</span><b>{rating.toFixed(1)}</b><small>({reviews})</small>
        </div>
        <div className={styles.priceRow}>
          <strong>{money(price)}</strong>
          <em>-{discount}%</em>
        </div>
        <div className={styles.reference}>{referencePrice > price ? money(referencePrice) : 'Harga grosir'}</div>
        <div className={styles.stock}><i aria-hidden="true" />{inventory ? `${inventory} stok tersedia` : 'Stok habis'}</div>

        <div className={styles.actions}>
          <div className={styles.quantity} aria-label={`Jumlah ${title}`}>
            <button type="button" onClick={() => onDecrease?.(product)} disabled={quantity === 0} aria-label={`Kurangi ${title}`}><Minus size={17} strokeWidth={2.4} /></button>
            <output aria-live="polite">{quantity}</output>
            <button type="button" onClick={() => onAdd?.(product)} disabled={!inventory} aria-label={`Tambah ${title}`}><Plus size={17} strokeWidth={2.4} /></button>
          </div>
          <button type="button" className={styles.cart} onClick={() => onAdd?.(product)} disabled={!inventory} aria-label={`Tambah ${title} ke keranjang`}><ShoppingCart size={18} strokeWidth={2.3} /></button>
        </div>
      </div>
    </article>
  );
}
