import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, MenuItem, ModifierOption, OrderTicket, PaymentMethod } from '../types/domain';
import { MENU_ITEMS } from '../domain/menuData';

interface AppState {
  cart: CartItem[];
  isCartDrawerOpen: boolean;
  activeTable: string | null;
  orders: OrderTicket[];
  toastMessage: string | null;

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
  addSampleOrder: () => void;

  // Toast
  showToast: (msg: string) => void;
  clearToast: () => void;
}

const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('flamelink_sync')
  : null;

// Initial sample order so KDS and Tracker always have rich interactive data
const createInitialSampleOrder = (): OrderTicket => {
  const burger = MENU_ITEMS[0];
  const ribeye = MENU_ITEMS[3];
  const sampleItems: CartItem[] = [
    {
      cartItemId: 'sample-cart-1',
      menuItem: burger,
      selectedModifiers: [burger.modifiers[0], burger.modifiers[1]],
      quantity: 1,
      notes: 'Medium Rare, extra smoked aioli',
    },
    {
      cartItemId: 'sample-cart-2',
      menuItem: ribeye,
      selectedModifiers: [ribeye.modifiers[0]],
      quantity: 1,
      notes: 'Truffle butter on side',
    },
  ];

  const subtotal = 285 + 85 + 45 + 690 + 45; // 1150
  const vatAmount = Math.round(subtotal * 0.14 * 100) / 100;
  const total = Math.round((subtotal + vatAmount) * 100) / 100;

  return {
    id: 'ORD-101',
    tableNumber: 'T-04',
    items: sampleItems,
    subtotal,
    vatAmount,
    total,
    status: 'cooking',
    isPaid: false,
    createdAt: Date.now() - 145000, // 2m 25s ago
  };
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      cart: [],
      isCartDrawerOpen: false,
      activeTable: null,
      orders: [createInitialSampleOrder()],
      toastMessage: null,

      showToast: (msg) => {
        set({ toastMessage: msg });
        setTimeout(() => {
          if (get().toastMessage === msg) {
            set({ toastMessage: null });
          }
        }, 3000);
      },

      clearToast: () => {
        set({ toastMessage: null });
      },

      addToCart: (menuItem, selectedModifiers, quantity, notes) => {
        set((state) => {
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

        get().showToast(`Added ${quantity}x ${menuItem.name} to cart`);
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

        get().showToast(`Order #${newTicket.id} dispatched to kitchen line`);

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

        get().showToast(`Ticket #${orderId} bumped to next stage`);
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

        get().showToast(`Invoice #${orderId} settled in full`);
      },

      addSampleOrder: () => {
        const { orders } = get();
        const burger = MENU_ITEMS[0];
        const pizza = MENU_ITEMS[7];
        const nextId = `ORD-${100 + orders.length + 1}`;
        const sampleItems: CartItem[] = [
          {
            cartItemId: `sample-${Date.now()}-1`,
            menuItem: burger,
            selectedModifiers: [burger.modifiers[0], burger.modifiers[1]],
            quantity: 1,
            notes: 'Extra crispy bacon, medium doneness',
          },
          {
            cartItemId: `sample-${Date.now()}-2`,
            menuItem: pizza,
            selectedModifiers: [pizza.modifiers[0]],
            quantity: 1,
            notes: 'Well done crust',
          },
        ];

        const subtotal = 285 + 85 + 45 + 275 + 50;
        const vatAmount = Math.round(subtotal * 0.14 * 100) / 100;
        const total = Math.round((subtotal + vatAmount) * 100) / 100;

        const newSample: OrderTicket = {
          id: nextId,
          tableNumber: `T-0${((orders.length % 5) + 1)}`,
          items: sampleItems,
          subtotal,
          vatAmount,
          total,
          status: 'received',
          isPaid: false,
          createdAt: Date.now(),
        };

        const updated = [newSample, ...orders];
        set({ orders: updated });

        if (broadcastChannel) {
          broadcastChannel.postMessage({ type: 'ORDER_CREATED', orders: updated });
        }

        get().showToast(`Sample Ticket #${nextId} fired to KDS pass`);
      },

      syncOrders: (orders) => {
        set({ orders });
      },
    }),
    {
      name: 'flamelink_store_v2',
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
