import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CartItem,
  MenuItem,
  ModifierOption,
  OrderTicket,
  PaymentMethod,
  MemberProfile,
  TableSession,
  TableStatus,
} from '../types/domain';
import { MENU_ITEMS } from '../domain/menuData';

interface AppState {
  cart: CartItem[];
  isCartDrawerOpen: boolean;
  activeTable: string | null;
  activeTablePin: string | null;
  currentMember: MemberProfile | null;
  tableSessions: Record<string, TableSession>;
  orders: OrderTicket[];
  toastMessage: string | null;
  isPinModalOpen: boolean;
  pendingJoinTable: string | null;

  // Cart actions
  addToCart: (menuItem: MenuItem, selectedModifiers: ModifierOption[], quantity: number, notes?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartItemQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;

  // Table & Multiplayer actions
  setActiveTable: (table: string | null) => void;
  initTableSession: (tableNumber: string, memberName?: string) => TableSession;
  joinTableWithPin: (tableNumber: string, pin: string, memberName: string) => boolean;
  setMemberReadyToPay: (tableNumber: string, memberId: string, isReady: boolean) => void;
  transferHostControl: (tableNumber: string, targetMemberId: string) => void;
  regenerateTablePin: (tableNumber: string) => string;
  openPinModal: (tableNumber: string) => void;
  closePinModal: () => void;

  // The Payment Gate & Order actions
  createOrder: (paymentMethod: PaymentMethod) => OrderTicket;
  verifyCashierPayment: (orderId: string, paymentMethod?: PaymentMethod) => void;
  advanceOrderStatus: (orderId: string) => void;
  payOrderOnline: (orderId: string, method: PaymentMethod, splitCount?: number) => void;
  submitMealReview: (orderId: string, rating: number, feedback?: string, tipAmount?: number) => void;
  syncOrders: (orders: OrderTicket[]) => void;
  syncTableSessions: (sessions: Record<string, TableSession>) => void;
  syncCart: (cart: CartItem[]) => void;
  addSampleOrder: () => void;

  // Toast
  showToast: (msg: string) => void;
  clearToast: () => void;
}

const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('flamelink_multiplayer_sync')
  : null;

// Initial sample order that is ALREADY verified so KDS has realistic data on startup
const createInitialSampleOrder = (): OrderTicket => {
  const burger = MENU_ITEMS[0];
  const ribeye = MENU_ITEMS[4]; // 45-day dry aged ribeye
  const sampleItems: CartItem[] = [
    {
      cartItemId: 'sample-cart-1',
      menuItem: burger,
      selectedModifiers: [burger.modifiers[0], burger.modifiers[1]],
      quantity: 1,
      notes: 'Medium doneness, extra smoked aioli',
      addedBy: {
        memberId: 'mem-host-01',
        name: 'You (Host)',
        isHost: true,
      },
    },
    {
      cartItemId: 'sample-cart-2',
      menuItem: ribeye,
      selectedModifiers: [ribeye.modifiers[0]],
      quantity: 1,
      notes: 'Truffle butter melted on top',
      addedBy: {
        memberId: 'mem-guest-02',
        name: 'Sarah',
        isHost: false,
      },
    },
  ];

  const subtotal = 185 + 65 + 40 + 690 + 45; // 1025 EGP
  const vatAmount = Math.round(subtotal * 0.14 * 100) / 100;
  const total = Math.round((subtotal + vatAmount) * 100) / 100;

  return {
    id: 'ORD-101',
    tableNumber: 'T-04',
    tablePin: '4040',
    items: sampleItems,
    subtotal,
    vatAmount,
    total,
    status: 'cooking',
    isPaid: true,
    paymentStatus: 'verified_paid', // Verified: shows on KDS
    paymentMethod: 'apple_pay',
    createdAt: Date.now() - 145000,
    paidAt: Date.now() - 140000,
  };
};

const defaultTableSessions: Record<string, TableSession> = {
  'T-04': {
    tableNumber: 'T-04',
    pin: '4040',
    hostId: 'mem-host-01',
    status: 'paid_cooking',
    activeOrderId: 'ORD-101',
    lastUpdated: Date.now(),
    members: [
      {
        id: 'mem-host-01',
        name: 'You (Host)',
        isHost: true,
        isReadyToPay: true,
        joinedAt: Date.now() - 200000,
      },
      {
        id: 'mem-guest-02',
        name: 'Sarah',
        isHost: false,
        isReadyToPay: true,
        joinedAt: Date.now() - 180000,
      },
    ],
  },
  'T-01': {
    tableNumber: 'T-01',
    pin: '1010',
    hostId: 'mem-host-t1',
    status: 'ordering',
    lastUpdated: Date.now(),
    members: [
      {
        id: 'mem-host-t1',
        name: 'Ahmed',
        isHost: true,
        isReadyToPay: false,
        joinedAt: Date.now() - 50000,
      },
    ],
  },
  'T-02': {
    tableNumber: 'T-02',
    pin: '2020',
    hostId: 'mem-host-t2',
    status: 'waiting_for_payment',
    lastUpdated: Date.now(),
    members: [
      {
        id: 'mem-host-t2',
        name: 'Omar',
        isHost: true,
        isReadyToPay: true,
        joinedAt: Date.now() - 60000,
      },
    ],
  },
  'T-08': {
    tableNumber: 'T-08',
    pin: '8080',
    hostId: 'mem-host-t8',
    status: 'idle',
    lastUpdated: Date.now(),
    members: [],
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      cart: [],
      isCartDrawerOpen: false,
      activeTable: null,
      activeTablePin: null,
      currentMember: {
        id: 'mem-host-01',
        name: 'You (Host)',
        isHost: true,
        isReadyToPay: false,
        joinedAt: Date.now(),
      },
      tableSessions: defaultTableSessions,
      orders: [createInitialSampleOrder()],
      toastMessage: null,
      isPinModalOpen: false,
      pendingJoinTable: null,

      showToast: (msg) => {
        set({ toastMessage: msg });
        setTimeout(() => {
          if (get().toastMessage === msg) {
            set({ toastMessage: null });
          }
        }, 3200);
      },

      clearToast: () => {
        set({ toastMessage: null });
      },

      openPinModal: (tableNumber) => {
        set({ isPinModalOpen: true, pendingJoinTable: tableNumber });
      },

      closePinModal: () => {
        set({ isPinModalOpen: false, pendingJoinTable: null });
      },

      // Table & Multiplayer Lobby Management
      setActiveTable: (table) => {
        if (!table) {
          set({ activeTable: null, activeTablePin: null });
          return;
        }

        const cleanTable = table.trim().toUpperCase();
        const existingSession = get().tableSessions[cleanTable];

        if (existingSession) {
          set({
            activeTable: cleanTable,
            activeTablePin: existingSession.pin,
          });
        } else {
          // Initialize session for newly scanned table
          get().initTableSession(cleanTable);
        }
      },

      initTableSession: (tableNumber, memberName = 'You (Host)') => {
        const cleanTable = tableNumber.trim().toUpperCase();
        const { tableSessions } = get();

        if (tableSessions[cleanTable]) {
          return tableSessions[cleanTable];
        }

        const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
        const hostMember: MemberProfile = {
          id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: memberName,
          isHost: true,
          isReadyToPay: false,
          joinedAt: Date.now(),
        };

        const newSession: TableSession = {
          tableNumber: cleanTable,
          pin: generatedPin,
          hostId: hostMember.id,
          members: [hostMember],
          status: 'ordering',
          lastUpdated: Date.now(),
        };

        const updatedSessions = {
          ...tableSessions,
          [cleanTable]: newSession,
        };

        set({
          tableSessions: updatedSessions,
          activeTable: cleanTable,
          activeTablePin: generatedPin,
          currentMember: hostMember,
        });

        if (broadcastChannel) {
          broadcastChannel.postMessage({ type: 'SESSIONS_SYNC', tableSessions: updatedSessions });
        }

        get().showToast(`Lobby opened for Table ${cleanTable} (PIN: ${generatedPin})`);
        return newSession;
      },

      joinTableWithPin: (tableNumber, pin, memberName) => {
        const cleanTable = tableNumber.trim().toUpperCase();
        const { tableSessions } = get();
        const session = tableSessions[cleanTable];

        if (!session) {
          get().showToast(`Table ${cleanTable} has no active session. Create one.`);
          return false;
        }

        if (session.pin !== pin.trim()) {
          get().showToast(`Invalid PIN for Table ${cleanTable}. Check with the table host.`);
          return false;
        }

        const newGuestMember: MemberProfile = {
          id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: memberName.trim() || 'Guest Diner',
          isHost: false,
          isReadyToPay: false,
          joinedAt: Date.now(),
        };

        const updatedSession: TableSession = {
          ...session,
          members: [...session.members, newGuestMember],
          lastUpdated: Date.now(),
        };

        const updatedSessions = {
          ...tableSessions,
          [cleanTable]: updatedSession,
        };

        set({
          tableSessions: updatedSessions,
          activeTable: cleanTable,
          activeTablePin: session.pin,
          currentMember: newGuestMember,
          isPinModalOpen: false,
          pendingJoinTable: null,
        });

        if (broadcastChannel) {
          broadcastChannel.postMessage({
            type: 'GUEST_JOINED',
            tableSessions: updatedSessions,
            guestName: newGuestMember.name,
            tableNumber: cleanTable,
          });
        }

        get().showToast(`Joined Table ${cleanTable} pool as ${newGuestMember.name}`);
        return true;
      },

      setMemberReadyToPay: (tableNumber, memberId, isReady) => {
        const cleanTable = tableNumber.trim().toUpperCase();
        const { tableSessions, currentMember } = get();
        const session = tableSessions[cleanTable];
        if (!session) return;

        const updatedMembers = session.members.map((m) =>
          m.id === memberId ? { ...m, isReadyToPay: isReady } : m
        );

        const updatedSession = { ...session, members: updatedMembers, lastUpdated: Date.now() };
        const updatedSessions = { ...tableSessions, [cleanTable]: updatedSession };

        set({
          tableSessions: updatedSessions,
          currentMember: currentMember?.id === memberId
            ? { ...currentMember, isReadyToPay: isReady }
            : currentMember,
        });

        if (broadcastChannel) {
          broadcastChannel.postMessage({
            type: 'MEMBER_READY_CHANGE',
            tableSessions: updatedSessions,
            memberId,
            isReady,
            tableNumber: cleanTable,
          });
        }

        const member = session.members.find((m) => m.id === memberId);
        get().showToast(
          isReady
            ? `${member?.name || 'Diner'} is ready to pay!`
            : `${member?.name || 'Diner'} is still browsing`
        );
      },

      transferHostControl: (tableNumber, targetMemberId) => {
        const cleanTable = tableNumber.trim().toUpperCase();
        const { tableSessions, currentMember } = get();
        const session = tableSessions[cleanTable];
        if (!session) return;

        const updatedMembers = session.members.map((m) => ({
          ...m,
          isHost: m.id === targetMemberId,
        }));

        const updatedSession: TableSession = {
          ...session,
          hostId: targetMemberId,
          members: updatedMembers,
          lastUpdated: Date.now(),
        };

        const updatedSessions = { ...tableSessions, [cleanTable]: updatedSession };

        set({
          tableSessions: updatedSessions,
          currentMember: currentMember ? { ...currentMember, isHost: currentMember.id === targetMemberId } : null,
        });

        if (broadcastChannel) {
          broadcastChannel.postMessage({ type: 'HOST_TRANSFERRED', tableSessions: updatedSessions });
        }

        const target = session.members.find((m) => m.id === targetMemberId);
        get().showToast(`Host privileges transferred to ${target?.name || 'Diner'}`);
      },

      regenerateTablePin: (tableNumber) => {
        const cleanTable = tableNumber.trim().toUpperCase();
        const { tableSessions } = get();
        const newPin = Math.floor(1000 + Math.random() * 9000).toString();

        const updatedSessions = {
          ...tableSessions,
          [cleanTable]: {
            ...tableSessions[cleanTable],
            pin: newPin,
            lastUpdated: Date.now(),
          },
        };

        set({
          tableSessions: updatedSessions,
          activeTablePin: cleanTable === get().activeTable ? newPin : get().activeTablePin,
        });

        if (broadcastChannel) {
          broadcastChannel.postMessage({ type: 'SESSIONS_SYNC', tableSessions: updatedSessions });
        }

        get().showToast(`Generated new PIN for Table ${cleanTable}: ${newPin}`);
        return newPin;
      },

      // Cart Actions with Member Attribution
      addToCart: (menuItem, selectedModifiers, quantity, notes) => {
        const { currentMember, activeTable, cart } = get();
        const modKey = selectedModifiers.map((m) => m.id).sort().join(',');

        const existingIndex = cart.findIndex(
          (item) =>
            item.menuItem.id === menuItem.id &&
            item.selectedModifiers.map((m) => m.id).sort().join(',') === modKey &&
            (item.notes || '') === (notes || '') &&
            item.addedBy?.memberId === currentMember?.id
        );

        let nextCart: CartItem[];
        if (existingIndex > -1) {
          nextCart = [...cart];
          nextCart[existingIndex] = {
            ...nextCart[existingIndex],
            quantity: nextCart[existingIndex].quantity + quantity,
          };
        } else {
          const newItem: CartItem = {
            cartItemId: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            menuItem,
            selectedModifiers,
            quantity,
            notes,
            addedBy: currentMember ? {
              memberId: currentMember.id,
              name: currentMember.name,
              isHost: currentMember.isHost,
            } : {
              memberId: 'anon',
              name: 'Online Guest',
              isHost: true,
            },
          };
          nextCart = [...cart, newItem];
        }

        set({ cart: nextCart });
        get().showToast(`Added ${quantity}x ${menuItem.name} to order pool`);

        if (broadcastChannel && activeTable) {
          broadcastChannel.postMessage({ type: 'CART_SYNC', cart: nextCart, tableNumber: activeTable });
        }
      },

      removeFromCart: (cartItemId) => {
        const { cart, activeTable } = get();
        const nextCart = cart.filter((item) => item.cartItemId !== cartItemId);
        set({ cart: nextCart });

        if (broadcastChannel && activeTable) {
          broadcastChannel.postMessage({ type: 'CART_SYNC', cart: nextCart, tableNumber: activeTable });
        }
      },

      updateCartItemQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(cartItemId);
          return;
        }
        const { cart, activeTable } = get();
        const nextCart = cart.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity } : item
        );
        set({ cart: nextCart });

        if (broadcastChannel && activeTable) {
          broadcastChannel.postMessage({ type: 'CART_SYNC', cart: nextCart, tableNumber: activeTable });
        }
      },

      clearCart: () => {
        const { activeTable } = get();
        set({ cart: [], isCartDrawerOpen: false });

        if (broadcastChannel && activeTable) {
          broadcastChannel.postMessage({ type: 'CART_SYNC', cart: [], tableNumber: activeTable });
        }
      },

      openCartDrawer: () => set({ isCartDrawerOpen: true }),
      closeCartDrawer: () => set({ isCartDrawerOpen: false }),

      // THE PAYMENT GATE: BLOCK all orders from kitchen until payment verified
      createOrder: (paymentMethod) => {
        const { cart, activeTable, activeTablePin, orders, tableSessions } = get();
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
        const orderId = `ORD-${ticketNumber}`;
        const cashierCode = `PAY-${activeTable?.replace('T-', '') || '00'}-${ticketNumber}`;

        const isInstantOnline = paymentMethod === 'apple_pay' || paymentMethod === 'card';

        const newTicket: OrderTicket = {
          id: orderId,
          tableNumber: activeTable,
          tablePin: activeTablePin || undefined,
          items: [...cart],
          subtotal,
          vatAmount,
          total,
          status: 'received',
          isPaid: isInstantOnline,
          paymentMethod,
          paymentStatus: isInstantOnline ? 'verified_paid' : 'pending_verification',
          cashierChitCode: cashierCode,
          createdAt: Date.now(),
          paidAt: isInstantOnline ? Date.now() : undefined,
        };

        const updatedOrders = [newTicket, ...orders];

        // Update table session status
        let updatedSessions = tableSessions;
        if (activeTable && tableSessions[activeTable]) {
          const nextStatus: TableStatus = isInstantOnline ? 'paid_cooking' : 'waiting_for_payment';
          updatedSessions = {
            ...tableSessions,
            [activeTable]: {
              ...tableSessions[activeTable],
              status: nextStatus,
              activeOrderId: orderId,
              lastUpdated: Date.now(),
            },
          };
        }

        set({
          orders: updatedOrders,
          tableSessions: updatedSessions,
          cart: [],
          isCartDrawerOpen: false,
        });

        if (isInstantOnline) {
          get().showToast(`Payment verified! Order #${orderId} fired to kitchen line`);
        } else {
          get().showToast(`Cashier Chit #${cashierCode} generated! Settle at register.`);
        }

        if (broadcastChannel) {
          broadcastChannel.postMessage({
            type: 'ORDER_CREATED',
            orders: updatedOrders,
            tableSessions: updatedSessions,
          });
        }

        return newTicket;
      },

      // Cashier Station Verification (/cashier)
      verifyCashierPayment: (orderId, paymentMethod = 'card') => {
        const { orders, tableSessions } = get();
        let targetTable: string | null = null;

        const updatedOrders = orders.map((ticket) => {
          if (ticket.id !== orderId) return ticket;
          targetTable = ticket.tableNumber;
          return {
            ...ticket,
            isPaid: true,
            paymentStatus: 'verified_paid' as const,
            paymentMethod,
            paidAt: Date.now(),
          };
        });

        let updatedSessions = tableSessions;
        if (targetTable && tableSessions[targetTable]) {
          updatedSessions = {
            ...tableSessions,
            [targetTable]: {
              ...tableSessions[targetTable],
              status: 'paid_cooking',
              lastUpdated: Date.now(),
            },
          };
        }

        set({
          orders: updatedOrders,
          tableSessions: updatedSessions,
        });

        if (broadcastChannel) {
          broadcastChannel.postMessage({
            type: 'CASHIER_VERIFIED',
            orderId,
            orders: updatedOrders,
            tableSessions: updatedSessions,
            targetTable,
          });
        }

        get().showToast(`Payment for #${orderId} verified by cashier! Fired to KDS.`);
      },

      payOrderOnline: (orderId, method, splitCount = 1) => {
        const { orders, tableSessions } = get();
        let targetTable: string | null = null;

        const updatedOrders = orders.map((ticket) => {
          if (ticket.id !== orderId) return ticket;
          targetTable = ticket.tableNumber;
          return {
            ...ticket,
            isPaid: true,
            paymentStatus: 'verified_paid' as const,
            paymentMethod: method,
            splitCount,
            paidAt: Date.now(),
          };
        });

        let updatedSessions = tableSessions;
        if (targetTable && tableSessions[targetTable]) {
          updatedSessions = {
            ...tableSessions,
            [targetTable]: {
              ...tableSessions[targetTable],
              status: 'paid_cooking',
              lastUpdated: Date.now(),
            },
          };
        }

        set({ orders: updatedOrders, tableSessions: updatedSessions });

        if (broadcastChannel) {
          broadcastChannel.postMessage({
            type: 'ORDER_PAID',
            orders: updatedOrders,
            tableSessions: updatedSessions,
          });
        }

        get().showToast(`Order #${orderId} paid in full via ${method.toUpperCase()}!`);
      },

      // Post-meal 5-Star Review & Optional Kitchen Tip
      submitMealReview: (orderId, rating, feedback, tipAmount = 0) => {
        set((state) => {
          const updated = state.orders.map((ticket) => {
            if (ticket.id !== orderId) return ticket;
            return {
              ...ticket,
              rating,
              reviewFeedback: feedback,
              tipAmount,
            };
          });

          if (broadcastChannel) {
            broadcastChannel.postMessage({ type: 'REVIEW_SUBMITTED', orders: updated });
          }

          return { orders: updated };
        });

        get().showToast(`Thank you! Your ${rating}-star feedback & gratuity received.`);
      },

      // KDS Bump Pipeline with Waiter Customer Notification
      advanceOrderStatus: (orderId) => {
        let notifiedTable: string | null = null;
        let isNowReady = false;

        set((state) => {
          const updated = state.orders.map((ticket) => {
            if (ticket.id !== orderId) return ticket;
            let nextStatus: OrderTicket['status'] = ticket.status;
            if (ticket.status === 'received') nextStatus = 'cooking';
            else if (ticket.status === 'cooking') {
              nextStatus = 'ready';
              isNowReady = true;
              notifiedTable = ticket.tableNumber;
            } else if (ticket.status === 'ready') nextStatus = 'served';

            return { ...ticket, status: nextStatus };
          });

          if (broadcastChannel) {
            broadcastChannel.postMessage({
              type: 'STATUS_UPDATED',
              orders: updated,
              orderId,
              isNowReady,
              notifiedTable,
            });
          }

          return { orders: updated };
        });

        if (isNowReady && notifiedTable) {
          get().showToast(`Dishes for Table ${notifiedTable} are PLATED & heading to table!`);
        } else {
          get().showToast(`Ticket #${orderId} bumped to next stage`);
        }
      },

      addSampleOrder: () => {
        const { orders, tableSessions } = get();
        const burger = MENU_ITEMS[0];
        const pizza = MENU_ITEMS[7];
        const nextId = `ORD-${100 + orders.length + 1}`;
        const tableNum = `T-0${((orders.length % 5) + 1)}`;

        const sampleItems: CartItem[] = [
          {
            cartItemId: `sample-${Date.now()}-1`,
            menuItem: burger,
            selectedModifiers: [burger.modifiers[0]],
            quantity: 2,
            notes: 'Extra crispy bacon, medium doneness',
            addedBy: { memberId: 'mem-1', name: 'Omar', isHost: true },
          },
          {
            cartItemId: `sample-${Date.now()}-2`,
            menuItem: pizza,
            selectedModifiers: [],
            quantity: 1,
            notes: 'Well done crust',
            addedBy: { memberId: 'mem-2', name: 'Nour', isHost: false },
          },
        ];

        const subtotal = 185 * 2 + 65 * 2 + 220; // 720
        const vatAmount = Math.round(subtotal * 0.14 * 100) / 100;
        const total = Math.round((subtotal + vatAmount) * 100) / 100;

        const newSample: OrderTicket = {
          id: nextId,
          tableNumber: tableNum,
          items: sampleItems,
          subtotal,
          vatAmount,
          total,
          status: 'received',
          isPaid: true,
          paymentStatus: 'verified_paid', // Verified paid so it renders on KDS
          paymentMethod: 'card',
          createdAt: Date.now(),
          paidAt: Date.now(),
        };

        const updated = [newSample, ...orders];
        set({ orders: updated });

        if (broadcastChannel) {
          broadcastChannel.postMessage({ type: 'ORDER_CREATED', orders: updated, tableSessions });
        }

        get().showToast(`Verified Chit #${nextId} sent to KDS pass`);
      },

      syncOrders: (orders) => set({ orders }),
      syncTableSessions: (tableSessions) => set({ tableSessions }),
      syncCart: (cart) => set({ cart }),
    }),
    {
      name: 'flamelink_multiplayer_store_v3',
      partialize: (state) => ({
        cart: state.cart,
        orders: state.orders,
        activeTable: state.activeTable,
        activeTablePin: state.activeTablePin,
        currentMember: state.currentMember,
        tableSessions: state.tableSessions,
      }),
    }
  )
);

// Cross-tab real-time telemetry listener
if (broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    const data = event.data;
    if (!data) return;

    const store = useAppStore.getState();

    if (data.type === 'SESSIONS_SYNC' && data.tableSessions) {
      store.syncTableSessions(data.tableSessions);
    }
    if (data.type === 'CART_SYNC' && data.cart) {
      if (store.activeTable === data.tableNumber) {
        store.syncCart(data.cart);
      }
    }
    if (data.type === 'GUEST_JOINED') {
      if (store.activeTable === data.tableNumber) {
        store.syncTableSessions(data.tableSessions);
        store.showToast(`${data.guestName} joined Table ${data.tableNumber} pool!`);
      }
    }
    if (data.type === 'MEMBER_READY_CHANGE') {
      if (store.activeTable === data.tableNumber) {
        store.syncTableSessions(data.tableSessions);
        store.showToast(`Table diner is ready to settle bill`);
      }
    }
    if (data.type === 'CASHIER_VERIFIED') {
      store.syncOrders(data.orders);
      if (data.tableSessions) store.syncTableSessions(data.tableSessions);
      if (store.activeTable === data.targetTable) {
        store.showToast(`Cashier verified settlement! Your food is now on the grill.`);
      }
    }
    if (data.type === 'STATUS_UPDATED') {
      store.syncOrders(data.orders);
      if (data.isNowReady && store.activeTable === data.notifiedTable) {
        store.showToast(`Your food is ready at the kitchen pass! Server on the way.`);
      }
    }
    if (data.type === 'ORDER_CREATED' || data.type === 'ORDER_PAID') {
      if (data.orders) store.syncOrders(data.orders);
      if (data.tableSessions) store.syncTableSessions(data.tableSessions);
    }
  };
}
