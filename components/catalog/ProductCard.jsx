import { Heart, Minus, Plus, ShoppingCart } from 'lucide-react';
import ProductThumbnail from '../thumbnails/ProductThumbnail';
import styles from './ProductCard.module.css';

const text = (value) => String(value ?? '').trim();
const stock = (value) => value == null || value === '' ? null : Math.max(0, Number(value) || 0);
const money = (value) => Number.isFinite(Number(value))
  ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value))
  : 'Harga belum tersedia';

const professionalVariant = (product) => {
  const option = text(product?.['Option1 Value']);
  const type = text(product?.Type);
  const normalized = option.toLowerCase().replace(/[_-]+/g, ' ').trim();
  if (!option || normalized === 'default' || normalized === 'default title') {
    return type && !['default', 'default title'].includes(type.toLowerCase().trim()) ? type : 'GROSIR';
  }
  return option;
};

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
  const availability = inventory == null ? Boolean(product?.Published && product?.Status === 'active') : inventory > 0;
  const availabilityLabel = inventory == null ? (availability ? (text(product?.['Stock Status']) || 'READY STOCK') : 'TIDAK TERSEDIA') : (inventory > 0 ? 'READY STOCK' : 'STOK HABIS');
  const variant = professionalVariant(product);
  const sku = text(product?.['Variant SKU']);
  const catalog = text(product?.Catalog || product?.catalog);
  const isResmi = /^resmi-/i.test(sku) || /^resmi$/i.test(catalog);
  const catalogLabel = isResmi ? 'Resmi' : 'R2';

  return (
    <article className={styles.card} data-catalog={isResmi ? 'resmi' : 'r2'}>
      <div className={styles.media}>
        <div className={`${styles.productVisual} ${styles[`tone${index % 4}`]}`}>
          <ProductThumbnail name={title} sku={sku} catalogLabel={catalogLabel} size={190} className={styles.thumbnail} />
        </div>
        <span className={`${styles.stockBadge} ${availability ? '' : styles.out}`}>{availabilityLabel}</span>
        <button type="button" className={`${styles.favorite} ${favorite ? styles.active : ''}`} onClick={() => onFavorite?.(product)} aria-label={favorite ? `Hapus ${title} dari favorit` : `Tambah ${title} ke favorit`} aria-pressed={favorite}>
          <Heart size={17} fill={favorite ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
      </div>

      <div className={styles.body}>
        <h2>{title}</h2>
        <div className={styles.rating} aria-label={`Varian ${variant}`}>
          <span aria-hidden="true">VARIAN</span><b>{variant}</b>{sku && <small>SKU {sku}</small>}
        </div>
        <div className={styles.priceRow}>
          <strong>{money(price)}</strong>
        </div>
        <div className={styles.reference}>Harga grosir</div>
        <div className={styles.stock}><i aria-hidden="true" />{inventory == null ? (availability ? 'Ready stock · kuantitas dikonfirmasi saat pemesanan' : 'Tidak tersedia') : (inventory ? `${inventory} stok tersedia` : 'Stok habis')}</div>

        <div className={styles.actions}>
          <div className={styles.quantity} aria-label={`Jumlah ${title}`}>
            <button type="button" onClick={() => onDecrease?.(product)} disabled={quantity === 0} aria-label={`Kurangi ${title}`}><Minus size={17} strokeWidth={2.4} /></button>
            <output aria-live="polite">{quantity}</output>
            <button type="button" onClick={() => onAdd?.(product)} disabled={!availability} aria-label={`Tambah ${title}`}><Plus size={17} strokeWidth={2.4} /></button>
          </div>
          <button type="button" className={styles.cart} onClick={() => onAdd?.(product)} disabled={!availability} aria-label={`Tambah ${title} ke keranjang`}><ShoppingCart size={18} strokeWidth={2.3} /></button>
        </div>
      </div>
    </article>
  );
}
