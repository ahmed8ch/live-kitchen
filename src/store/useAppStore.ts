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
  DinerPaymentRecord,
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
  leaveTableSession: (tableNumber: string, memberId: string) => void;
  removeMemberFromTable: (tableNumber: string, targetMemberId: string) => void;
  resetTableSession: (tableNumber: string) => void;

  // Platform Feedback & Inquiries
  platformFeedback: Array<{
    id: string;
    name: string;
    email: string;
    category: string;
    message: string;
    priority: string;
    submittedAt: number;
  }>;
  submitPlatformFeedback: (data: {
    name: string;
    email: string;
    category: string;
    message: string;
    priority: string;
  }) => string;

  // Companion (2nd Diner POV) actions
  companionMember: MemberProfile | null;
  initCompanionSession: (tableNumber: string) => MemberProfile;
  addToCartAsCompanion: (menuItem: MenuItem, selectedModifiers: ModifierOption[], quantity: number, notes?: string) => void;
  toggleCompanionReady: (tableNumber: string) => void;

  // The Payment Gate & Order actions
  createOrder: (paymentMethod: PaymentMethod) => OrderTicket;
  verifyCashierPayment: (orderId: string, paymentMethod?: PaymentMethod) => void;
  advanceOrderStatus: (orderId: string) => void;
  payOrderOnline: (orderId: string, method: PaymentMethod, splitCount?: number) => void;
  payDinerShare: (orderId: string, memberId: string, method: PaymentMethod, amount: number) => void;
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
      companionMember: null,
      tableSessions: initialTableSessions,
      orders: [], // 0 hardcoded orders - all flow dynamically from live cart
      toastMessage: null,
      isPinModalOpen: false,
      pendingJoinTable: null,
      platformFeedback: [],

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

      initTableSession: (tableNumber, memberName = 'Red Panda (Host)', _avatar = 'Red Panda') => {
        const cleanTable = tableNumber.trim().toUpperCase();
        const { tableSessions } = get();

        // Always generate a fresh, dynamic 4-digit PIN for new table sessions
        const hostPin = Math.floor(1000 + Math.random() * 9000).toString();
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

        // Compute taken identities to guarantee collision-free assignment
        const takenNames = new Set(
          session.members.map((m) => m.name.replace(/\s*\(Host\)$/, '').trim().toLowerCase())
        );

        const ROSTER = ['Orange Fox', 'Golden Eagle', 'Blue Falcon', 'Emerald Owl', 'Silver Wolf', 'Red Panda'];
        let finalName = memberName.trim() || avatar;

        if (takenNames.has(finalName.toLowerCase())) {
          const nextAvailable = ROSTER.find((name) => !takenNames.has(name.toLowerCase()));
          finalName = nextAvailable || `${finalName} #${session.members.length + 1}`;
        }

        const newGuestMember: MemberProfile = {
          id: `guest-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: finalName,
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

      initCompanionSession: (tableNumber: string) => {
        const cleanTable = tableNumber.trim().toUpperCase();
        const { tableSessions, companionMember } = get();
        let session = tableSessions[cleanTable];

        // If table doesn't exist yet, initialize it
        if (!session) {
          session = {
            tableNumber: cleanTable,
            pin: '1004',
            hostId: 'host-demo',
            members: [
              {
                id: 'host-demo',
                name: 'Red Panda (Host)',
                isHost: true,
                isReadyToPay: false,
                joinedAt: Date.now() - 300000,
              },
            ],
            status: 'ordering',
            lastUpdated: Date.now(),
          };
        }

        // If companionMember is already set and seated in this session, return it
        if (companionMember && session.members.some((m) => m.id === companionMember.id)) {
          return companionMember;
        }

        // Find taken identities
        const takenNames = new Set(
          session.members.map((m) => m.name.replace(/\s*\(Host\)$/, '').trim().toLowerCase())
        );
        const ROSTER = ['Orange Fox', 'Golden Eagle', 'Blue Falcon', 'Emerald Owl', 'Silver Wolf', 'Red Panda'];
        const nextAvailable = ROSTER.find((name) => !takenNames.has(name.toLowerCase())) || 'Orange Fox';

        const newCompanion: MemberProfile = {
          id: `companion-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: nextAvailable,
          isHost: false,
          isReadyToPay: false,
          joinedAt: Date.now(),
        };

        const updatedSession: TableSession = {
          ...session,
          members: [...session.members, newCompanion],
          lastUpdated: Date.now(),
        };

        const updatedSessions = {
          ...tableSessions,
          [cleanTable]: updatedSession,
        };

        set({
          tableSessions: updatedSessions,
          companionMember: newCompanion,
        });

        if (broadcastChannel) {
          broadcastChannel.postMessage({
            type: 'GUEST_JOINED',
            tableSessions: updatedSessions,
            guestName: newCompanion.name,
            tableNumber: cleanTable,
          });
        }

        return newCompanion;
      },

      addToCartAsCompanion: (menuItem, selectedModifiers, quantity, notes) => {
        const { companionMember, activeTable, cart } = get();
        if (!companionMember) return;

        const newItem: CartItem = {
          cartItemId: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          menuItem,
          selectedModifiers,
          quantity,
          notes,
          addedBy: {
            memberId: companionMember.id,
            name: companionMember.name,
            isHost: false,
          },
        };

        const nextCart = [...cart, newItem];
        set({ cart: nextCart });
        get().showToast(`Added ${quantity}x ${menuItem.name} (${companionMember.name})`);

        if (broadcastChannel && activeTable) {
          broadcastChannel.postMessage({ type: 'CART_SYNC', cart: nextCart, tableNumber: activeTable });
        }
      },

      toggleCompanionReady: (tableNumber: string) => {
        const cleanTable = tableNumber.trim().toUpperCase();
        const { companionMember } = get();
        if (!companionMember) return;
        get().setMemberReadyToPay(cleanTable, companionMember.id, !companionMember.isReadyToPay);
        set((state) => ({
          companionMember: state.companionMember
            ? { ...state.companionMember, isReadyToPay: !state.companionMember.isReadyToPay }
            : null,
        }));
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

      leaveTableSession: (tableNumber, memberId) => {
        const cleanTable = tableNumber.trim().toUpperCase();
        const { tableSessions, currentMember, companionMember } = get();
        const session = tableSessions[cleanTable];
        if (!session) return;

        const remainingMembers = session.members.filter((m) => m.id !== memberId);
        let newHostId = session.hostId;

        // If departing member was host, pass host to next senior member
        if (session.hostId === memberId && remainingMembers.length > 0) {
          remainingMembers[0] = { ...remainingMembers[0], isHost: true };
          newHostId = remainingMembers[0].id;
        }

        const updatedSession: TableSession = {
          ...session,
          hostId: newHostId,
          members: remainingMembers,
          status: remainingMembers.length === 0 ? 'idle' : session.status,
          lastUpdated: Date.now(),
        };

        const updatedSessions = { ...tableSessions, [cleanTable]: updatedSession };

        const isLeavingUserCurrent = currentMember?.id === memberId;
        const isLeavingUserCompanion = companionMember?.id === memberId;

        set({
          tableSessions: updatedSessions,
          currentMember: isLeavingUserCurrent ? null : currentMember,
          companionMember: isLeavingUserCompanion ? null : companionMember,
        });

        if (broadcastChannel) {
          broadcastChannel.postMessage({ type: 'SESSIONS_SYNC', tableSessions: updatedSessions });
        }

        get().showToast(`Left Table ${cleanTable}.`);
      },

      removeMemberFromTable: (tableNumber, targetMemberId) => {
        const cleanTable = tableNumber.trim().toUpperCase();
        const { tableSessions, currentMember } = get();
        const session = tableSessions[cleanTable];
        if (!session) return;

        const target = session.members.find((m) => m.id === targetMemberId);
        const remainingMembers = session.members.filter((m) => m.id !== targetMemberId);

        const updatedSession: TableSession = {
          ...session,
          members: remainingMembers,
          lastUpdated: Date.now(),
        };

        const updatedSessions = { ...tableSessions, [cleanTable]: updatedSession };

        set({
          tableSessions: updatedSessions,
          currentMember: currentMember?.id === targetMemberId ? null : currentMember,
        });

        if (broadcastChannel) {
          broadcastChannel.postMessage({ type: 'SESSIONS_SYNC', tableSessions: updatedSessions });
        }

        get().showToast(`Removed ${target?.name || 'Diner'} from Table ${cleanTable}.`);
      },

      resetTableSession: (tableNumber) => {
        const cleanTable = tableNumber.trim().toUpperCase();
        const { tableSessions } = get();
        const session = tableSessions[cleanTable];

        const hostPin = session?.pin || '1004';
        const freshHost: MemberProfile = {
          id: `host-${Date.now()}`,
          name: 'Red Panda (Host)',
          isHost: true,
          isReadyToPay: false,
          joinedAt: Date.now(),
        };

        const freshSession: TableSession = {
          tableNumber: cleanTable,
          pin: hostPin,
          hostId: freshHost.id,
          members: [freshHost],
          status: 'ordering',
          lastUpdated: Date.now(),
        };

        const updatedSessions = { ...tableSessions, [cleanTable]: freshSession };

        set({
          tableSessions: updatedSessions,
          activeTable: cleanTable,
          currentMember: freshHost,
          companionMember: null,
          cart: [],
        });

        if (broadcastChannel) {
          broadcastChannel.postMessage({ type: 'SESSIONS_SYNC', tableSessions: updatedSessions });
        }

        get().showToast(`Table ${cleanTable} session reset to clean Host state.`);
      },

      submitPlatformFeedback: (data) => {
        const ticketId = `FLM-${Math.floor(10000 + Math.random() * 90000)}`;
        const newRecord = {
          id: ticketId,
          ...data,
          submittedAt: Date.now(),
        };

        set((state) => ({
          platformFeedback: [newRecord, ...state.platformFeedback],
        }));

        get().showToast(`Feedback submitted! Reference Ticket #${ticketId}`);
        return ticketId;
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

      // THE PAYMENT GATE: Dynamic order creation from cart (starts as Draft until settled)
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

        // PAYMENT GATE: All orders strictly start in 'pending_verification' (Draft)
        // Only payOrderOnline or verifyCashierPayment transitions to 'verified_paid'!
        const newTicket: OrderTicket = {
          id: orderId,
          tableNumber: activeTable,
          tablePin: activeTablePin || undefined,
          items: [...cart],
          subtotal,
          vatAmount,
          total,
          status: 'received',
          isPaid: false,
          paymentMethod,
          paymentStatus: 'pending_verification',
          cashierChitCode: cashierCode,
          createdAt: Date.now(),
        };

        const updatedOrders = [newTicket, ...orders];

        // Update table session status to waiting_for_payment
        let updatedSessions = tableSessions;
        if (activeTable && tableSessions[activeTable]) {
          updatedSessions = {
            ...tableSessions,
            [activeTable]: {
              ...tableSessions[activeTable],
              status: 'waiting_for_payment' as TableStatus,
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

        get().showToast(`Order #${orderId} placed. Ready for settlement.`);

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

      payDinerShare: (orderId, memberId, method, amount) => {
        const { orders, tableSessions } = get();
        let targetTable: string | null = null;
        let allDinersSettled = false;

        const updatedOrders = orders.map((ticket) => {
          if (ticket.id !== orderId) return ticket;
          targetTable = ticket.tableNumber;

          const currentPaid = ticket.paidDiners || {};
          const memberName =
            ticket.items.find((i) => i.addedBy?.memberId === memberId)?.addedBy?.name || 'Diner';

          const updatedPaid: Record<string, DinerPaymentRecord> = {
            ...currentPaid,
            [memberId]: {
              memberId,
              name: memberName,
              amount,
              paidAt: Date.now(),
              paymentMethod: method,
            },
          };

          const totalPaidSoFar = Object.values(updatedPaid).reduce((sum, r) => sum + r.amount, 0);
          const remaining = Math.max(0, ticket.total - totalPaidSoFar);
          const isNowFullyPaid = remaining <= 0.05;

          if (isNowFullyPaid) {
            allDinersSettled = true;
          }

          return {
            ...ticket,
            paidDiners: updatedPaid,
            isPaid: isNowFullyPaid,
            paymentStatus: isNowFullyPaid ? ('verified_paid' as const) : ticket.paymentStatus,
            paidAt: isNowFullyPaid ? Date.now() : ticket.paidAt,
            paymentMethod: isNowFullyPaid ? method : ticket.paymentMethod,
          };
        });

        let updatedSessions = tableSessions;
        if (allDinersSettled && targetTable && tableSessions[targetTable]) {
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
            type: allDinersSettled ? 'ORDER_PAID' : 'DINER_SHARE_PAID',
            orders: updatedOrders,
            tableSessions: updatedSessions,
          });
        }
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
        if (store.currentMember?.isHost) {
          store.showToast(`${data.guestName} has joined your table.`);
        }
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
    if (data.type === 'ORDER_CREATED' || data.type === 'ORDER_PAID' || data.type === 'DINER_SHARE_PAID') {
      if (data.orders) store.syncOrders(data.orders);
      if (data.tableSessions) store.syncTableSessions(data.tableSessions);
    }
  };
}
