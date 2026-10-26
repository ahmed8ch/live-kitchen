import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, MenuItem, ModifierOption, OrderTicket, PaymentMethod } from '../types/domain';

interface AppState {
  cart: CartItem[];
  isCartDrawerOpen: boolean;
  activeTable: string | null;
  orders: OrderTicket[];

  // Cart actions
  addToCart: (menuItem: MenuItem, selectedModifiers: ModifierOption[], quantity: number, notes?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartItemQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;

  // Table actions
  setActiveTable: (table: string | null) => void;

  // Order actions
  createOrder: (paymentMethod?: PaymentMethod) => OrderTicket;
  advanceOrderStatus: (orderId: string) => void;
  payOrder: (orderId: string, method: PaymentMethod, splitCount?: number) => void;
  syncOrders: (orders: OrderTicket[]) => void;
}

const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('matbakh_sync')
  : null;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      cart: [],
      isCartDrawerOpen: false,
      activeTable: null,
      orders: [],

      addToCart: (menuItem, selectedModifiers, quantity, notes) => {
        set((state) => {
          // Check if identical item with identical modifiers and notes exists
          const modKey = selectedModifiers.map((m) => m.id).sort().join(',');
          const existingIndex = state.cart.findIndex(
            (item) =>
              item.menuItem.id === menuItem.id &&
              item.selectedModifiers.map((m) => m.id).sort().join(',') === modKey &&
              (item.notes || '') === (notes || '')
          );

          if (existingIndex > -1) {
            const nextCart = [...state.cart];
            nextCart[existingIndex] = {
              ...nextCart[existingIndex],
              quantity: nextCart[existingIndex].quantity + quantity,
            };
            return { cart: nextCart };
          }

          const newItem: CartItem = {
            cartItemId: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            menuItem,
            selectedModifiers,
            quantity,
            notes,
          };

          return { cart: [...state.cart, newItem] };
        });
      },

      removeFromCart: (cartItemId) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.cartItemId !== cartItemId),
        }));
      },

      updateCartItemQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(cartItemId);
          return;
        }
        set((state) => ({
          cart: state.cart.map((item) =>
            item.cartItemId === cartItemId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ cart: [], isCartDrawerOpen: false });
      },

      openCartDrawer: () => {
        set({ isCartDrawerOpen: true });
      },

      closeCartDrawer: () => {
        set({ isCartDrawerOpen: false });
      },

      setActiveTable: (table) => {
        set({ activeTable: table });
      },

      createOrder: (paymentMethod) => {
        const { cart, activeTable, orders } = get();
        if (cart.length === 0) {
          throw new Error('Cannot create an order with an empty cart');
        }

        const subtotal = cart.reduce((sum, item) => {
          const modTotal = item.selectedModifiers.reduce((mSum, m) => mSum + m.price, 0);
          return sum + (item.menuItem.basePrice + modTotal) * item.quantity;
        }, 0);

        const vatAmount = Math.round(subtotal * 0.14 * 100) / 100;
        const total = Math.round((subtotal + vatAmount) * 100) / 100;

        const ticketNumber = 100 + orders.length + 1;
        const newTicket: OrderTicket = {
          id: `ORD-${ticketNumber}`,
          tableNumber: activeTable,
          items: [...cart],
          subtotal,
          vatAmount,
          total,
          status: 'received',
          isPaid: false,
          paymentMethod,
          createdAt: Date.now(),
        };

        const updatedOrders = [newTicket, ...orders];
        set({
          orders: updatedOrders,
          cart: [],
          isCartDrawerOpen: false,
        });

        // Broadcast to KDS / other tabs
        if (broadcastChannel) {
          broadcastChannel.postMessage({ type: 'ORDER_CREATED', orders: updatedOrders });
        }

        return newTicket;
      },

      advanceOrderStatus: (orderId) => {
        set((state) => {
          const updated = state.orders.map((ticket) => {
            if (ticket.id !== orderId) return ticket;
            let nextStatus: OrderTicket['status'] = ticket.status;
            if (ticket.status === 'received') nextStatus = 'cooking';
            else if (ticket.status === 'cooking') nextStatus = 'ready';
            else if (ticket.status === 'ready') nextStatus = 'served';

            return { ...ticket, status: nextStatus };
          });

          if (broadcastChannel) {
            broadcastChannel.postMessage({ type: 'STATUS_UPDATED', orders: updated });
          }

          return { orders: updated };
        });
      },

      payOrder: (orderId, method, splitCount = 1) => {
        set((state) => {
          const updated = state.orders.map((ticket) => {
            if (ticket.id !== orderId) return ticket;
            return {
              ...ticket,
              isPaid: true,
              paymentMethod: method,
              splitCount,
            };
          });

          if (broadcastChannel) {
            broadcastChannel.postMessage({ type: 'ORDER_PAID', orders: updated });
          }

          return { orders: updated };
        });
      },

      syncOrders: (orders) => {
        set({ orders });
      },
    }),
    {
      name: 'matbakh_store_v2',
      partialize: (state) => ({
        cart: state.cart,
        orders: state.orders,
        activeTable: state.activeTable,
      }),
    }
  )
);

// Listen to cross-tab updates
if (broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    if (event.data?.orders) {
      useAppStore.getState().syncOrders(event.data.orders);
    }
  };
}
