import { useState } from 'react';
import ProductCard from './ProductCard';
import BottomNav from './BottomNav';
import { mockProducts, bottomNavItems } from './mockData';
import styles from './CatalogPage.module.css';

export default function CatalogPage({ initialProducts = mockProducts, onAddToCart }) {
  const [products] = useState(initialProducts);
  const [cartBadge, setCartBadge] = useState(0);

  const handleAddToCart = (product, quantity) => {
    setCartBadge((prev) => prev + quantity);
    onAddToCart?.(product, quantity);
  };

  const navItemsWithBadge = bottomNavItems.map((item) =>
    item.id === 'cart' ? { ...item, badge: cartBadge } : item
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <p className={styles.eyebrow}>R2 NUSANTARA</p>
          <h1 className={styles.title}>Katalog Produk</h1>
          <p className={styles.subtitle}>Produk pilihan dengan stok gudang yang siap dipesan.</p>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </main>

      <BottomNav items={navItemsWithBadge} cartBadge={cartBadge} />
    </div>
  );
}
