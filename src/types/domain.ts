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

export interface MemberProfile {
  id: string;
  name: string;
  isHost: boolean;
  isReadyToPay: boolean;
  joinedAt: number;
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  selectedModifiers: ModifierOption[];
  quantity: number;
  notes?: string;
  addedBy?: {
    memberId: string;
    name: string;
    isHost: boolean;
  };
}

export type PaymentMethod = 'apple_pay' | 'card' | 'cashier';

export type PaymentStatus = 'pending_verification' | 'verified_paid';

export interface DinerPaymentRecord {
  memberId: string;
  name: string;
  amount: number;
  paidAt: number;
  paymentMethod: PaymentMethod;
}

export interface OrderTicket {
  id: string;
  tableNumber: string | null;
  tablePin?: string;
  items: CartItem[];
  subtotal: number;
  vatAmount: number; // Strictly 14% ETA VAT
  total: number;
  status: OrderStatus;
  isPaid: boolean;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus; // GATE: Only verified_paid tickets reach KDS!
  cashierChitCode?: string; // e.g. "PAY-401" for in-person cashier verification
  splitCount?: number;
  paidDiners?: Record<string, DinerPaymentRecord>; // Itemized diner settlements
  tipAmount?: number;
  rating?: number; // Post-meal 5-star review
  reviewFeedback?: string;
  createdAt: number;
  paidAt?: number;
}

export type TableStatus = 'idle' | 'ordering' | 'waiting_for_payment' | 'paid_cooking' | 'ready' | 'served';

export interface TableSession {
  tableNumber: string;
  pin: string;
  hostId: string;
  members: MemberProfile[];
  status: TableStatus;
  activeOrderId?: string;
  lastUpdated: number;
}
