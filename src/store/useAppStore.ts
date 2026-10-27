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
  activeOrderId: string | null;
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
  initTableSession: (tableNumber: string, memberName?: string, avatar?: string) => TableSession;
  joinTableWithPin: (tableNumber: string, pin: string, memberName: string, avatar?: string) => boolean;
  setMemberReadyToPay: (tableNumber: string, memberId: string, isReady: boolean) => void;
  transferHostControl: (tableNumber: string, targetMemberId: string) => void;
  openPinModal: (tableNumber: string) => void;
  closePinModal: () => void;
  clearTableSession: (tableNumber: string) => void;

  // The Payment Gate & Order actions
  createOrder: (paymentMethod: PaymentMethod) => OrderTicket;
  verifyCashierPayment: (orderId: string, paymentMethod?: PaymentMethod) => void;
  advanceOrderStatus: (orderId: string) => void;
  payOrderOnline: (orderId: string, method: PaymentMethod, splitCount?: number) => void;
  orderAgain: () => void;
  submitMealReview: (orderId: string, rating: number, feedback?: string, tipAmount?: number) => void;
  syncOrders: (orders: OrderTicket[]) => void;
  syncTableSessions: (sessions: Record<string, TableSession>) => void;
  syncCart: (cart: CartItem[]) => void;
  addSampleOrder: (targetTable?: string) => void;

  // Toast
  showToast: (msg: string) => void;
  clearToast: () => void;
}

const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('flamelink_multiplayer_sync')
  : null;

// Initial clean table registry
const initialTableSessions: Record<string, TableSession> = {
  'T-01': {
    tableNumber: 'T-01',
    pin: '1010',
    hostId: '',
    status: 'idle',
    lastUpdated: Date.now(),
    members: [],
  },
  'T-02': {
    tableNumber: 'T-02',
    pin: '2020',
    hostId: '',
    status: 'idle',
    lastUpdated: Date.now(),
    members: [],
  },
  'T-03': {
    tableNumber: 'T-03',
    pin: '3030',
    hostId: '',
    status: 'idle',
    lastUpdated: Date.now(),
    members: [],
  },
  'T-04': {
    tableNumber: 'T-04',
    pin: '4040',
    hostId: '',
    status: 'idle',
    lastUpdated: Date.now(),
    members: [],
  },
  'T-05': {
    tableNumber: 'T-05',
    pin: '5050',
    hostId: '',
    status: 'idle',
    lastUpdated: Date.now(),
    members: [],
  },
  'T-06': {
    tableNumber: 'T-06',
    pin: '6060',
    hostId: '',
    status: 'idle',
    lastUpdated: Date.now(),
    members: [],
  },
  'T-08': {
    tableNumber: 'T-08',
    pin: '8080',
    hostId: '',
    status: 'idle',
    lastUpdated: Date.now(),
    members: [],
  },
  'T-12': {
    tableNumber: 'T-12',
    pin: '1212',
    hostId: '',
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
      activeOrderId: null,
      currentMember: null,
      tableSessions: initialTableSessions,
      orders: [], // 0 hardcoded orders - all flow dynamically from live cart
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
          set({ activeTable: null, activeTablePin: null, currentMember: null });
          return;
        }

        const cleanTable = table.trim().toUpperCase();
        const { tableSessions, currentMember } = get();
        const session = tableSessions[cleanTable];

        // Check if session has active members
        if (session && session.members.length > 0) {
          // If current browser is already in this session's members, keep them
          const existingUser = currentMember && session.members.find((m) => m.id === currentMember.id);
          if (existingUser) {
            set({
              activeTable: cleanTable,
              activeTablePin: session.pin,
              currentMember: existingUser,
            });
            return;
          }

          // Otherwise, another device is Host! Prompt this user to join as guest
          set({
            activeTable: cleanTable,
            activeTablePin: session.pin,
            pendingJoinTable: cleanTable,
            isPinModalOpen: true,
          });
        } else {
          // Table is idle or new: This user automatically becomes Host! No PIN modal needed!
          get().initTableSession(cleanTable, 'Host', 'Crown');
        }
      },

      initTableSession: (tableNumber, memberName = 'Host', _avatar = 'Crown') => {
        const cleanTable = tableNumber.trim().toUpperCase();
        const { tableSessions } = get();
        const existingSession = tableSessions[cleanTable];

        const hostPin = existingSession?.pin || Math.floor(1000 + Math.random() * 9000).toString();
        const hostMember: MemberProfile = {
          id: `host-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: memberName,
          isHost: true,
          isReadyToPay: false,
          joinedAt: Date.now(),
        };

        const newSession: TableSession = {
          tableNumber: cleanTable,
          pin: hostPin,
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
          activeTablePin: hostPin,
          currentMember: hostMember,
          isPinModalOpen: false,
          pendingJoinTable: null,
        });

        if (broadcastChannel) {
          broadcastChannel.postMessage({ type: 'SESSIONS_SYNC', tableSessions: updatedSessions });
        }

        get().showToast(`Table ${cleanTable} session started. Your PIN is ${hostPin}`);
        return newSession;
      },

      joinTableWithPin: (tableNumber, pin, memberName, avatar = 'Red Panda') => {
        const cleanTable = tableNumber.trim().toUpperCase();
        const { tableSessions } = get();
        const session = tableSessions[cleanTable];

        if (!session) {
          get().showToast(`Table ${cleanTable} not found.`);
          return false;
        }

        if (session.pin !== pin.trim()) {
          get().showToast(`Incorrect PIN for Table ${cleanTable}. Ask the host.`);
          return false;
        }

        const newGuestMember: MemberProfile = {
          id: `guest-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: memberName.trim() || avatar,
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

        get().showToast(`Joined Table ${cleanTable} as ${newGuestMember.name}`);
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
            ? `${member?.name || 'Diner'} is ready to pay`
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
        get().showToast(`Host transferred to ${target?.name || 'Diner'}`);
      },

      clearTableSession: (tableNumber) => {
        const cleanTable = tableNumber.trim().toUpperCase();
        const { tableSessions } = get();
        const session = tableSessions[cleanTable];
        if (!session) return;

        const clearedSession: TableSession = {
          ...session,
          status: 'idle',
          members: [],
          hostId: '',
          activeOrderId: undefined,
          lastUpdated: Date.now(),
        };

        const updatedSessions = {
          ...tableSessions,
          [cleanTable]: clearedSession,
        };

        set({
          tableSessions: updatedSessions,
          activeTable: cleanTable === get().activeTable ? null : get().activeTable,
          activeOrderId: cleanTable === get().activeTable ? null : get().activeOrderId,
        });

        if (broadcastChannel) {
          broadcastChannel.postMessage({ type: 'SESSIONS_SYNC', tableSessions: updatedSessions });
        }

        get().showToast(`Table ${cleanTable} cleared & marked available.`);
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
              memberId: 'guest-solo',
              name: 'You',
              isHost: true,
            },
          };
          nextCart = [...cart, newItem];
        }

        set({ cart: nextCart });
        get().showToast(`Added ${quantity}x ${menuItem.name} to cart`);

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

      // THE PAYMENT GATE: Dynamic order creation from cart
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
          activeOrderId: orderId,
          cart: [],
          isCartDrawerOpen: false,
        });

        if (isInstantOnline) {
          get().showToast(`Payment verified! Order #${orderId} fired to kitchen line`);
        } else {
          get().showToast(`Cashier Chit #${cashierCode} generated. Settle at front register.`);
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

        get().showToast(`Payment for #${orderId} confirmed. Fired to KDS pass!`);
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

      // Loopback: Order Again button keeps table session intact and clears cart
      orderAgain: () => {
        set({ cart: [], isCartDrawerOpen: false, activeOrderId: null });
        get().showToast(`Ready for your next round of dishes!`);
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

        get().showToast(`Thank you! Your ${rating}-star feedback received.`);
      },

      // KDS Bump Pipeline
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
          get().showToast(`Dishes for Table ${notifiedTable} are ready at the pass!`);
        } else {
          get().showToast(`Ticket #${orderId} bumped to next stage`);
        }
      },

      addSampleOrder: (targetTable = 'T-04') => {
        const { orders, tableSessions } = get();
        const burger = MENU_ITEMS[0];
        const steak = MENU_ITEMS[4];
        const nextId = `ORD-${100 + orders.length + 1}`;

        const sampleItems: CartItem[] = [
          {
            cartItemId: `sample-${Date.now()}-1`,
            menuItem: burger,
            selectedModifiers: [burger.modifiers[0]],
            quantity: 2,
            notes: 'Medium doneness, extra crispy bacon',
            addedBy: { memberId: 'mem-1', name: 'Red Panda', isHost: true },
          },
          {
            cartItemId: `sample-${Date.now()}-2`,
            menuItem: steak,
            selectedModifiers: [],
            quantity: 1,
            notes: 'Medium rare',
            addedBy: { memberId: 'mem-2', name: 'Orange Fox', isHost: false },
          },
        ];

        const subtotal = 185 * 2 + 65 * 2 + 690;
        const vatAmount = Math.round(subtotal * 0.14 * 100) / 100;
        const total = Math.round((subtotal + vatAmount) * 100) / 100;

        const newSample: OrderTicket = {
          id: nextId,
          tableNumber: targetTable,
          cashierChitCode: `PAY-${targetTable.replace('T-', '')}-${100 + orders.length + 1}`,
          items: sampleItems,
          subtotal,
          vatAmount,
          total,
          status: 'received',
          isPaid: true,
          paymentStatus: 'verified_paid', // Verified paid so it shows on KDS
          paymentMethod: 'card',
          createdAt: Date.now(),
          paidAt: Date.now(),
        };

        const updated = [newSample, ...orders];
        const updatedSessions = {
          ...tableSessions,
          [targetTable]: {
            ...tableSessions[targetTable],
            status: 'paid_cooking' as TableStatus,
            activeOrderId: nextId,
            lastUpdated: Date.now(),
          },
        };

        set({ orders: updated, tableSessions: updatedSessions });

        if (broadcastChannel) {
          broadcastChannel.postMessage({ type: 'ORDER_CREATED', orders: updated, tableSessions: updatedSessions });
        }

        get().showToast(`Chit #${nextId} sent to KDS pass for Table ${targetTable}`);
      },

      syncOrders: (orders) => set({ orders }),
      syncTableSessions: (tableSessions) => set({ tableSessions }),
      syncCart: (cart) => set({ cart }),
    }),
    {
      name: 'flamelink_multiplayer_store_v4',
      partialize: (state) => ({
        cart: state.cart,
        orders: state.orders,
        activeTable: state.activeTable,
        activeTablePin: state.activeTablePin,
        activeOrderId: state.activeOrderId,
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
        store.showToast(`${data.guestName} has joined your table pool.`);
      }
    }
    if (data.type === 'MEMBER_READY_CHANGE') {
      if (store.activeTable === data.tableNumber) {
        store.syncTableSessions(data.tableSessions);
      }
    }
    if (data.type === 'CASHIER_VERIFIED') {
      store.syncOrders(data.orders);
      if (data.tableSessions) store.syncTableSessions(data.tableSessions);
      if (store.activeTable === data.targetTable) {
        store.showToast(`Cashier verified settlement! Your food is now firing on the grill.`);
      }
    }
    if (data.type === 'STATUS_UPDATED') {
      store.syncOrders(data.orders);
      if (data.isNowReady && store.activeTable === data.notifiedTable) {
        store.showToast(`Your food is ready at the pass! Server on the way.`);
      }
    }
    if (data.type === 'ORDER_CREATED' || data.type === 'ORDER_PAID') {
      if (data.orders) store.syncOrders(data.orders);
      if (data.tableSessions) store.syncTableSessions(data.tableSessions);
    }
  };
}
