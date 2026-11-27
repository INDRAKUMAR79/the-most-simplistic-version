export type CategoryId =
  | 'all'
  | 'fresh'
  | 'deals'
  | 'prime'
  | 'electronics'
  | 'computers'
  | 'books'
  | 'toys'
  | 'baby'
  | 'grocery'
  | 'gift-cards';

export interface Product {
  id: string;
  title: string;
  brand: string;
  category: Exclude<CategoryId, 'all' | 'deals' | 'prime'>;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  dealLabel?: string;
  rating: number;
  reviewCount: number;
  deliveryText: string;
  isPrime: boolean;
  isDeal?: boolean;
  isPopular?: boolean;
  inStock: boolean;
  stockLeft: number;
  activeViewers: number;
  image: string;
  imageAlt: string;
  description: string;
  highlights: string[];
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  address: string;
  items: OrderItem[];
}

export interface MoodRecommendation {
  product: Product;
  reason: string;
}
