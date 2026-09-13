export interface Product {
  id: string;
  title: string;
  image: string;
  badge?: string;
  badgeType?: 'vip' | 'new' | 'sale';
  rating: number;
  reviews: number;
  originalPrice?: number;
  price: number;
  discount?: number;
  stockStatus: 'ready' | 'limited' | 'preorder';
  quantity?: number;
}

export interface BottomNavItem {
  id: string;
  label: string;
  icon: 'home' | 'grid' | 'cart' | 'heart' | 'whatsapp';
  route: string;
  badge?: number;
}

export interface CatalogPageProps {
  initialProducts?: Product[];
  onProductSelect?: (product: Product) => void;
  onAddToCart?: (product: Product, quantity: number) => void;
}
