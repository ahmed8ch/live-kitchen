import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { MENU_ITEMS } from '../domain/menuData';
import { MenuCategory, MenuItem, PaymentMethod } from '../types/domain';
import { DishModal } from '../components/menu/DishModal';
import { DishCard } from '../components/menu/DishCard';
import { FloatingCartBar } from '../components/cart/FloatingCartBar';
import { CartDrawer } from '../components/cart/CartDrawer';
import { TableLobbyBar } from '../components/multiplayer/TableLobbyBar';

const CATEGORIES: { id: 'all' | MenuCategory; label: string }[] = [
  { id: 'all', label: 'All Dishes' },
  { id: 'burgers', label: 'Flame Burgers' },
  { id: 'steaks', label: 'Prime Steaks' },
  { id: 'pizzas', label: 'Artisan Pizzas' },
  { id: 'pastas', label: 'Pastas & Sides' },
  { id: 'drinks', label: 'Drinks & Desserts' },
];

export const CompanionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tableParam = searchParams.get('table');

  const activeTable = useAppStore((state) => state.activeTable);
  const companionMember = useAppStore((state) => state.companionMember);
  const currentMember = useAppStore((state) => state.currentMember);
  const tableSessions = useAppStore((state) => state.tableSessions);
  const orders = useAppStore((state) => state.orders);
  const hasLeftTables = useAppStore((state) => state.hasLeftTables);
  const payDinerShare = useAppStore((state) => state.payDinerShare);
  const showToast = useAppStore((state) => state.showToast);
  const initCompanionSession = useAppStore((state) => state.initCompanionSession);
  const addToCartAsCompanion = useAppStore((state) => state.addToCartAsCompanion);
  const openPinModal = useAppStore((state) => state.openPinModal);

  const [activeCategory, setActiveCategory] = useState<'all' | MenuCategory>('all');
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('apple_pay');
  const [isProcessing, setIsProcessing] = useState(false);

  const targetTable = (tableParam || activeTable || '').trim().toUpperCase();
  const cleanTable = targetTable || 'T-04';
  const hasLeftTable = Boolean(hasLeftTables?.[cleanTable]);

  // Only auto-initialize companion session if a table was explicitly selected or passed via URL
  useEffect(() => {
    if (targetTable && !hasLeftTable && !companionMember) {
      initCompanionSession(targetTable);
    }
  }, [targetTable, initCompanionSession, hasLeftTable, companionMember]);

  const session = targetTable ? tableSessions[targetTable] : undefined;
  const effectiveMember = companionMember || currentMember;
  const isSeatedAtTable = Boolean(
    targetTable &&
      session &&
      effectiveMember &&
      (session.members || []).some((m) => m?.id === effectiveMember.id)
  );

  // Lookup active order ticket for this table session
  const activeTicket = useMemo(() => {
    if (!targetTable) return undefined;
    if (session?.activeOrderId) {
      const found = orders.find((o) => o.id === session.activeOrderId);
      if (found) return found;
    }
    const pendingOrder = orders.find(
      (o) => o.tableNumber === targetTable && (o.paymentStatus === 'pending_verification' || !o.isPaid)
    );
    if (pendingOrder) return pendingOrder;
    return orders.find((o) => o.tableNumber === targetTable);
  }, [orders, session?.activeOrderId, targetTable]);

  const isSettlementActive = Boolean(
    activeTicket && (session?.status === 'waiting_for_payment' || activeTicket.paymentStatus === 'pending_verification')
  );

  // Companion's attributed dishes from the active order
  const companionItems = useMemo(() => {
    if (!activeTicket || !effectiveMember) return [];
    return activeTicket.items.filter(
      (item) => item.addedBy?.memberId === effectiveMember.id || item.addedBy?.name === effectiveMember.name
    );
  }, [activeTicket, effectiveMember]);

  const companionSubtotal = useMemo(() => {
    return companionItems.reduce((sum, item) => {
      const modTotal = (item.selectedModifiers || []).reduce((mSum, m) => mSum + m.price, 0);
      return sum + (item.menuItem.basePrice + modTotal) * item.quantity;
    }, 0);
  }, [companionItems]);

  const companionVat = Math.round(companionSubtotal * 0.14 * 100) / 100;
  const companionTotalShare = Math.round((companionSubtotal + companionVat) * 100) / 100;

  const paidRecord = effectiveMember && activeTicket?.paidDiners ? activeTicket.paidDiners[effectiveMember.id] : undefined;
  const isCompanionSharePaid = Boolean(paidRecord);

  const totalPaidShares = Object.values(activeTicket?.paidDiners || {}).reduce(
    (sum, record) => sum + record.amount,
    0
  );
  const remainingTableBalance = activeTicket
    ? Math.max(0, Math.round((activeTicket.total - totalPaidShares) * 100) / 100)
    : 0;
  const isOrderFullySettled =
    activeTicket?.paymentStatus === 'verified_paid' || remainingTableBalance <= 0.05;

  const handlePayMyShare = () => {
    if (!activeTicket || !effectiveMember) return;
    setIsProcessing(true);
    setTimeout(() => {
      payDinerShare(activeTicket.id, effectiveMember.id, selectedMethod, companionTotalShare);
      setIsProcessing(false);
      showToast(`Your share of ${companionTotalShare.toFixed(2)} EGP authorized via ${selectedMethod.replace('_', ' ').toUpperCase()}.`);
    }, 450);
  };

  const filteredDishes =
    activeCategory === 'all'
      ? MENU_ITEMS
      : MENU_ITEMS.filter((item) => item.category === activeCategory);

  if (!targetTable || hasLeftTable || !isSeatedAtTable) {
    return (
      <div className="flex-1 w-full bg-[#f9f9f9] min-h-[100dvh] py-16 px-4" data-ui-container="not-seated-view">
        <div className="max-w-md mx-auto bg-white rounded-2xl border border-[#e5e7eb] p-6 sm:p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#fff0f3] border border-[#ffd1dc] flex items-center justify-center mx-auto text-[#FF0055] mb-4">
            <svg className="w-5 h-5 stroke-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#262626]">
            {hasLeftTable ? `You Left Table ${cleanTable}` : 'Join a Shared Table Session'}
          </h2>
          <p className="mt-2 text-[#727272] text-[13px] leading-relaxed">
            Enter the 4-digit Table PIN shown on the host&apos;s phone to add your own dishes to the shared table cart and settle your personal share directly.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => openPinModal(cleanTable)}
              className="w-full min-h-[44px] py-2.5 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-[13px] font-bold transition-colors btn-crimson-glow shadow-xs cursor-pointer flex items-center justify-center"
            >
              Enter 4-Digit Table PIN
            </button>
            <button
              type="button"
              onClick={() => {
                useAppStore.setState({
                  hasLeftTables: { ...hasLeftTables, [cleanTable]: false },
                });
                initCompanionSession(cleanTable);
              }}
              className="w-full min-h-[44px] py-2.5 rounded-full bg-[#f9f9f9] hover:bg-[#f0f0f0] border border-[#e5e7eb] text-[#262626] text-[13px] font-semibold transition-colors cursor-pointer flex items-center justify-center"
            >
              Join Table {cleanTable} Directly
            </button>
            <Link
              to={targetTable ? `/menu?table=${targetTable}` : '/menu'}
              className="w-full min-h-[44px] py-2.5 rounded-full bg-white hover:bg-[#f9f9f9] border border-[#e5e7eb] text-[#727272] text-[13px] font-medium transition-colors inline-flex items-center justify-center"
            >
              Return to Standard Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-white pb-52 select-none" data-ui-container="companion-menu-view">
      {/* Sticky Table Lobby Bar */}
      <TableLobbyBar />

      {/* DISTRIBUTED SETTLEMENT CARD: Only shown when companion actually has attributed items or has paid */}
      {isSettlementActive && activeTicket && (companionTotalShare > 0 || isCompanionSharePaid) && (
        <section className="bg-[#fff0f3] border-b border-[#ffd1dc] py-5 px-4 sm:px-6">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF0055]" />
                <span className="text-xs font-bold text-[#FF0055]">
                  Your Personal Table Share
                </span>
              </div>
              <span className="text-xs text-[#727272]">
                Chit #<span className="font-mono-num">{activeTicket.cashierChitCode || activeTicket.id}</span>
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#e5e7eb] shadow-xs space-y-4">
              <div className="flex items-start justify-between border-b border-[#f0f0f0] pb-3">
                <div>
                  <div className="text-xs font-medium text-[#727272]">
                    Seated Companion
                  </div>
                  <h3 className="text-lg font-bold text-[#262626] mt-0.5">
                    {effectiveMember?.name || 'Companion'}
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-xs font-medium text-[#727272]">
                    Share Total (incl. 14% VAT)
                  </div>
                  <div className="text-lg font-mono-num font-bold text-[#FF0055]">
                    {companionTotalShare.toFixed(2)} EGP
                  </div>
                </div>
              </div>

              {/* Exact Companion Item Breakdown */}
              {companionItems.length > 0 && (
                <div className="space-y-2 text-sm">
                  <div className="text-xs font-semibold text-[#727272]">
                    Dishes Added by You ({companionItems.length}):
                  </div>
                  {companionItems.map((item) => {
                    const modTotal = (item.selectedModifiers || []).reduce((s, m) => s + m.price, 0);
                    const linePrice = (item.menuItem.basePrice + modTotal) * item.quantity;
                    return (
                      <div key={item.cartItemId} className="flex justify-between items-start text-[#262626]">
                        <div>
                          <span className="font-medium">{item.quantity}x {item.menuItem.name}</span>
                          {item.selectedModifiers.length > 0 && (
                            <div className="text-xs text-[#727272]">
                              +{item.selectedModifiers.map((m) => m.name).join(', ')}
                            </div>
                          )}
                        </div>
                        <span className="font-mono-num text-[#727272] shrink-0 ml-2">
                          {linePrice.toFixed(2)} EGP
                        </span>
                      </div>
                    );
                  })}

                  <div className="pt-2 border-t border-[#f0f0f0] flex justify-between text-xs text-[#727272]">
                    <span>Net Subtotal: <span className="font-mono-num">{companionSubtotal.toFixed(2)} EGP</span></span>
                    <span>14% VAT: <span className="font-mono-num">{companionVat.toFixed(2)} EGP</span></span>
                  </div>
                </div>
              )}

              {/* Settlement Action State */}
              {isCompanionSharePaid ? (
                <div className="p-3.5 rounded-2xl bg-[#f9f9f9] border border-[#e5e7eb] text-center space-y-1">
                  <div className="text-[#262626] font-bold text-sm">
                    Share Settled: <span className="font-mono-num">{paidRecord?.amount.toFixed(2)} EGP</span> via {paidRecord?.paymentMethod?.replace('_', ' ').toUpperCase()}
                  </div>
                  <div className="text-xs text-[#727272]">
                    {isOrderFullySettled
                      ? 'All table shares settled. Dishes are firing to the kitchen pass.'
                      : `Awaiting other table diners (${remainingTableBalance.toFixed(2)} EGP remaining).`}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <div className="text-xs font-semibold text-[#262626]">
                    Select Your Payment Method:
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('apple_pay')}
                      className={`p-2.5 min-h-[48px] rounded-lg border text-center transition-colors cursor-pointer flex flex-col justify-center ${
                        selectedMethod === 'apple_pay'
                          ? 'border-[#FF0055] bg-[#fff0f3] shadow-xs'
                          : 'border-[#e5e7eb] bg-white hover:bg-[#f9f9f9]'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#262626]">Apple Pay</div>
                      <div className="text-xs text-[#727272] mt-0.5">Biometric Auth</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedMethod('card')}
                      className={`p-2.5 min-h-[48px] rounded-lg border text-center transition-colors cursor-pointer flex flex-col justify-center ${
                        selectedMethod === 'card'
                          ? 'border-[#FF0055] bg-[#fff0f3] shadow-xs'
                          : 'border-[#e5e7eb] bg-white hover:bg-[#f9f9f9]'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#262626]">Card</div>
                      <div className="text-xs text-[#727272] mt-0.5">Visa / Meeza</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedMethod('cashier')}
                      className={`p-2.5 min-h-[48px] rounded-lg border text-center transition-colors cursor-pointer flex flex-col justify-center ${
                        selectedMethod === 'cashier'
                          ? 'border-[#FF0055] bg-[#fff0f3] shadow-xs'
                          : 'border-[#e5e7eb] bg-white hover:bg-[#f9f9f9]'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#262626]">Cashier</div>
                      <div className="text-xs text-[#727272] mt-0.5">Desk Chit</div>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handlePayMyShare}
                    disabled={isProcessing}
                    data-ui-radius="999"
                    className="w-full min-h-[44px] py-3 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-sm font-bold transition-colors btn-crimson-glow shadow-xs cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
                  >
                    {isProcessing ? (
                      <span>Authorizing Payment...</span>
                    ) : (
                      <span>Pay My Share ({companionTotalShare.toFixed(2)} EGP) -&gt;</span>
                    )}
                  </button>
                </div>
              )}

              {/* Table Progress Bar */}
              <div className="pt-2 border-t border-[#f0f0f0] space-y-1.5">
                <div className="flex justify-between text-xs text-[#727272]">
                  <span>Table Balance Remaining:</span>
                  <span className="font-mono-num font-bold text-[#FF0055]">{remainingTableBalance.toFixed(2)} EGP</span>
                </div>
                <div className="w-full bg-[#e5e7eb] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#15803d] h-full transition-[width] duration-300"
                    style={{
                      width: `${Math.min(100, Math.round((totalPaidShares / activeTicket.total) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              <div className="text-center pt-1">
                <Link
                  to={`/settlement/${activeTicket.id}?table=${cleanTable}`}
                  className="text-xs text-[#727272] hover:text-[#262626] underline font-medium"
                >
                  View Full Table Bill &amp; Split Options -&gt;
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Compact notice if table has an active bill but companion hasn't added individual items */}
      {isSettlementActive && activeTicket && companionTotalShare === 0 && !isCompanionSharePaid && (
        <div className="bg-[#fff0f3] border-b border-[#ffd1dc] px-4 py-2.5">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <span className="text-[#262626]">
              Table {cleanTable} has an active check (<span className="font-mono-num font-bold text-[#FF0055]">{remainingTableBalance.toFixed(2)} EGP</span> remaining).
            </span>
            <Link
              to={`/settlement/${activeTicket.id}?table=${cleanTable}`}
              className="font-bold text-[#FF0055] hover:underline"
            >
              Open Bill &amp; Equal Split Options -&gt;
            </Link>
          </div>
        </div>
      )}

      {/* Companion Menu Header */}
      <section className="bg-white border-b border-[#e5e7eb] pt-6 pb-5 sm:pt-8 sm:pb-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#262626] tracking-tight">
                  Companion Order
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#fff0f3] border border-[#ffd1dc] text-[#FF0055] text-xs font-semibold">
                  {effectiveMember?.name || 'Guest'}
                </span>
              </div>
              <p className="text-sm text-[#727272]">
                Dishes you select are tagged with your name in the shared Table {cleanTable} cart so you can settle your exact share.
              </p>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" data-ui-actions="category-filters">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                data-ui-radius="999"
                className={`px-4 py-2 min-h-[44px] rounded-full text-sm font-medium transition-colors shrink-0 cursor-pointer flex items-center justify-center ${
                  activeCategory === cat.id
                    ? 'bg-[#fff0f3] text-[#FF0055] shadow-xs border-2 border-[#FF0055] font-bold'
                    : 'bg-white hover:bg-[#f0f0f0] text-[#727272] border border-[#e5e7eb]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Dish Grid Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#262626]">
            {CATEGORIES.find((c) => c.id === activeCategory)?.label}
          </h2>
          <span className="text-xs text-[#727272]">
            <span className="font-mono-num font-bold text-[#262626]">{filteredDishes.length}</span> dishes
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredDishes.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              onClick={() => setSelectedDish(dish)}
            />
          ))}
        </div>
      </section>

      {/* Dish Modal */}
      <DishModal
        dish={selectedDish}
        onClose={() => setSelectedDish(null)}
        onAdd={(dish, mods, q, notes) => addToCartAsCompanion(dish, mods, q, notes)}
      />

      {/* Floating Light-Theme Cart Bar */}
      <FloatingCartBar />

      {/* Shared Cart Drawer */}
      <CartDrawer />
    </div>
  );
};
