export type OrderStatus = 'received' | 'cooking' | 'ready' | 'served';

export type MenuCategory = 'burgers' | 'steaks' | 'pizzas' | 'pastas' | 'drinks';

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  basePrice: number;
  calories: number;
  description: string;
  imageUrl: string;
  badge?: string;
  rating?: number;
  reviewsCount?: number;
  prepTime?: string;
  tags?: string[];
  modifiers: ModifierOption[];
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  selectedModifiers: ModifierOption[];
  quantity: number;
  notes?: string;
}

export type PaymentMethod = 'apple_pay' | 'card' | 'cashier';

export interface OrderTicket {
  id: string;
  tableNumber: string | null; // null if online/unassigned; populated strictly from ?table=XX URL parameter
  items: CartItem[];
  subtotal: number;
  vatAmount: number; // Strictly 14% ETA VAT rate (0.14)
  total: number;
  status: OrderStatus;
  isPaid: boolean;
  paymentMethod?: PaymentMethod;
  splitCount?: number;
  createdAt: number;
}
