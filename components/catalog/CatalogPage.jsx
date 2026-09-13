import { useState } from 'react';
import ProductCard from './ProductCard';
import BottomNav from './BottomNav';
import { mockProducts, bottomNavItems } from './mockData';
import styles from './CatalogPage.module.css';

export default function CatalogPage({ initialProducts = mockProducts, onAddToCart, onProductSelect }) {
  const [products] = useState(initialProducts);
  const [cartBadge, setCartBadge] = useState(0);

  const handleAddToCart = (product, quantity) => {
    setCartBadge((prev) => prev + quantity);
    if (onAddToCart) {
      onAddToCart(product, quantity);
    }
  };

  const handleProductSelect = (product) => {
    if (onProductSelect) {
      onProductSelect(product);
    }
  };

  const navItemsWithBadge = bottomNavItems.map((item) =>
    item.id === 'cart' ? { ...item, badge: cartBadge } : item
  );

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Katalog R2 Nusantara</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Products Grid */}
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onQuickView={handleProductSelect}
            />
          ))}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav items={navItemsWithBadge} cartBadge={cartBadge} />

      {/* Safe Area for Bottom Nav */}
      <div className={styles.navSpacer} />
    </div>
  );
}
