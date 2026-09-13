import { useRouter } from 'next/router';
import { Home, Grid2X2, ShoppingCart, Heart, MessageCircle } from 'lucide-react';
import styles from './BottomNav.module.css';

const iconMap = {
  home: Home,
  grid: Grid2X2,
  cart: ShoppingCart,
  heart: Heart,
  whatsapp: MessageCircle,
};

export default function BottomNav({ items = [], cartBadge = 0 }) {
  const router = useRouter();

  const handleNavClick = (route, id) => {
    if (id === 'whatsapp') {
      window.open('https://wa.me/62', '_blank');
    } else {
      router.push(route);
    }
  };

  return (
    <nav className={styles.nav}>
      <ul className={styles.list}>
        {items.map((item) => {
          const IconComponent = iconMap[item.icon];
          const isActive = router.pathname === item.route;

          return (
            <li key={item.id}>
              <button
                className={`${styles.item} ${isActive ? styles.active : ''}`}
                onClick={() => handleNavClick(item.route, item.id)}
                aria-label={item.label}
              >
                <div className={styles.iconWrapper}>
                  <IconComponent size={24} />
                  {item.badge > 0 && (
                    <span className={styles.badge}>{item.badge > 9 ? '9+' : item.badge}</span>
                  )}
                </div>
                <span className={styles.label}>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
