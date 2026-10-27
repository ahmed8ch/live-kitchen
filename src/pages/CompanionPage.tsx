import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { MENU_ITEMS } from '../domain/menuData';
import { MenuCategory, MenuItem, PaymentMethod } from '../types/domain';
import { DishModal } from '../components/menu/DishModal';
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
  const tableParam = searchParams.get('table') || 'T-04';

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

  const [activeCategory, setActiveCategory] = useState<'all' | MenuCategory>('all');
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('apple_pay');
  const [isProcessing, setIsProcessing] = useState(false);

  const cleanTable = (tableParam || activeTable || 'T-04').trim().toUpperCase();
  const hasLeftTable = Boolean(hasLeftTables?.[cleanTable]);

  // Ensure table session & companion profile are initialized if user has not departed
  useEffect(() => {
    if (!hasLeftTable && !companionMember) {
      initCompanionSession(cleanTable);
    }
  }, [cleanTable, initCompanionSession, hasLeftTable, companionMember]);

  const session = tableSessions[cleanTable];
  const effectiveMember = companionMember || currentMember;
  const isSeatedAtTable = Boolean(
    session && effectiveMember && (session.members || []).some((m) => m?.id === effectiveMember.id)
  );

  // Lookup active order ticket for this table session
  const activeTicket = useMemo(() => {
    if (session?.activeOrderId) {
      const found = orders.find((o) => o.id === session.activeOrderId);
      if (found) return found;
    }
    const pendingOrder = orders.find(
      (o) => o.tableNumber === cleanTable && (o.paymentStatus === 'pending_verification' || !o.isPaid)
    );
    if (pendingOrder) return pendingOrder;
    return orders.find((o) => o.tableNumber === cleanTable);
  }, [orders, session?.activeOrderId, cleanTable]);

  // Is table currently waiting for payment or recently created
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

  // Has this companion settled their share
  const paidRecord = effectiveMember && activeTicket?.paidDiners ? activeTicket.paidDiners[effectiveMember.id] : undefined;
  const isCompanionSharePaid = Boolean(paidRecord);

  // Table total progress
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

  if (hasLeftTable || !isSeatedAtTable) {
    return (
      <div className="flex-1 w-full bg-[#f9f9f9] min-h-screen py-16 px-4" data-ui-container="not-seated-view">
        <div className="max-w-md mx-auto bg-white rounded-2xl border border-[#e5e7eb] p-6 sm:p-8 text-center shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[#fff0f3] border border-[#ffd1dc] flex items-center justify-center mx-auto text-[#FF0055] mb-4">
            <svg className="w-6 h-6 stroke-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#262626]">Not Seated at Table {cleanTable}</h2>
          <p className="mt-2 text-[#727272] text-[13px] leading-relaxed">
            You have left Table {cleanTable} or are not currently part of this dining party. Join the table to select your dishes and settle your share directly.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => initCompanionSession(cleanTable)}
              className="w-full py-2.5 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-[13px] font-bold transition-all btn-crimson-glow shadow-xs cursor-pointer"
            >
              Join Table {cleanTable} as Guest Diner
            </button>
            <Link
              to={`/menu?table=${cleanTable}`}
              className="w-full py-2.5 rounded-full bg-white hover:bg-[#f9f9f9] border border-[#e5e7eb] text-[#262626] text-[13px] font-medium transition-colors shadow-xs inline-block"
            >
              Browse Dine-In Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-white pb-52 select-none" data-ui-container="companion-menu-view">
      {/* Sticky Table Lobby Bar (PIN, Table Diners, Companion sync) */}
      <TableLobbyBar />

      {/* DEDICATED DISTRIBUTED SETTLEMENT CARD (Visible when table order is in checkout/settlement) */}
      {isSettlementActive && activeTicket && (
        <section className="bg-[#fff0f3] border-b-2 border-[#ffd1dc] py-5 px-4 sm:px-6">
          <div className="max-w-xl mx-auto space-y-4">
            {/* Header Status Strip */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF0055]" />
                <span className="text-[11px] font-mono-num font-bold uppercase tracking-wider text-[#FF0055]">
                  Table Settlement Active
                </span>
              </div>
              <span className="text-[12px] font-mono-num text-[#727272]">
                Chit #{activeTicket.cashierChitCode || activeTicket.id}
              </span>
            </div>

            {/* Main Share Card */}
            <div className="bg-white rounded-2xl p-5 border border-[#e5e7eb] shadow-xs space-y-4">
              <div className="flex items-start justify-between border-b border-[#f0f0f0] pb-3">
                <div>
                  <div className="text-[11px] font-mono-num uppercase tracking-wider text-[#727272]">
                    Your Personal Dine-In Share
                  </div>
                  <h3 className="text-lg font-bold text-[#262626] mt-0.5">
                    {effectiveMember?.name || 'Companion'}
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-mono-num uppercase tracking-wider text-[#727272]">
                    Share Total
                  </div>
                  <div className="text-lg font-mono-num font-bold text-[#FF0055]">
                    {companionTotalShare.toFixed(2)} EGP
                  </div>
                </div>
              </div>

              {/* Exact Companion Item Breakdown */}
              {companionItems.length > 0 ? (
                <div className="space-y-2 text-[13px]">
                  <div className="text-[11px] font-mono-num uppercase text-[#949494]">
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
                            <div className="text-[11px] text-[#727272]">
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

                  <div className="pt-2 border-t border-[#f0f0f0] flex justify-between text-[11px] text-[#727272]">
                    <span>Net Subtotal: {companionSubtotal.toFixed(2)} EGP</span>
                    <span>14% VAT: {companionVat.toFixed(2)} EGP</span>
                  </div>
                </div>
              ) : (
                <div className="text-[13px] text-[#727272] py-2">
                  No individual dishes were attributed to your profile in this round.
                </div>
              )}

              {/* Settlement Action State */}
              {isCompanionSharePaid ? (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                  <div className="text-emerald-800 font-bold text-[13px]">
                    Share Settled: {paidRecord?.amount.toFixed(2)} EGP via {paidRecord?.paymentMethod?.replace('_', ' ').toUpperCase()}
                  </div>
                  <div className="text-[11px] font-mono-num text-emerald-700">
                    {isOrderFullySettled
                      ? 'All table shares settled. Dishes are firing to the kitchen pass.'
                      : `Awaiting other table diners (${remainingTableBalance.toFixed(2)} EGP remaining).`}
                  </div>
                </div>
              ) : companionTotalShare > 0 ? (
                <div className="space-y-3 pt-1">
                  <div className="text-[12px] font-medium text-[#262626]">
                    Select Your Payment Method:
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('apple_pay')}
                      className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                        selectedMethod === 'apple_pay'
                          ? 'border-[#FF0055] bg-[#fff0f3] shadow-xs'
                          : 'border-[#e5e7eb] bg-white hover:bg-[#f9f9f9]'
                      }`}
                    >
                      <div className="text-[12px] font-bold text-[#262626]">Apple Pay</div>
                      <div className="text-[10px] text-[#727272] mt-0.5">Biometric Auth</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedMethod('card')}
                      className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                        selectedMethod === 'card'
                          ? 'border-[#FF0055] bg-[#fff0f3] shadow-xs'
                          : 'border-[#e5e7eb] bg-white hover:bg-[#f9f9f9]'
                      }`}
                    >
                      <div className="text-[12px] font-bold text-[#262626]">Card</div>
                      <div className="text-[10px] text-[#727272] mt-0.5">Visa / Meeza</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedMethod('cashier')}
                      className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                        selectedMethod === 'cashier'
                          ? 'border-[#FF0055] bg-[#fff0f3] shadow-xs'
                          : 'border-[#e5e7eb] bg-white hover:bg-[#f9f9f9]'
                      }`}
                    >
                      <div className="text-[12px] font-bold text-[#262626]">Cashier</div>
                      <div className="text-[10px] text-[#727272] mt-0.5">Desk Chit</div>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handlePayMyShare}
                    disabled={isProcessing}
                    data-ui-radius="999"
                    className="w-full py-3 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-[13px] font-bold transition-all btn-crimson-glow shadow-xs cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
                  >
                    {isProcessing ? (
                      <span>Authorizing Payment...</span>
                    ) : (
                      <span>Pay My Share ({companionTotalShare.toFixed(2)} EGP) -&gt;</span>
                    )}
                  </button>
                </div>
              ) : null}

              {/* Table Progress Bar */}
              <div className="pt-2 border-t border-[#f0f0f0] space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono-num text-[#727272]">
                  <span>Table Balance Remaining:</span>
                  <span className="font-bold text-[#FF0055]">{remainingTableBalance.toFixed(2)} EGP</span>
                </div>
                <div className="w-full bg-[#e5e7eb] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#15803d] h-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.round((totalPaidShares / activeTicket.total) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              {/* Auxiliary Link */}
              <div className="text-center pt-1">
                <Link
                  to={`/settlement/${activeTicket.id}?table=${cleanTable}`}
                  className="text-[12px] text-[#727272] hover:text-[#262626] underline font-medium"
                >
                  View Full Table Thermal Chit -&gt;
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Clean, Functional Menu Header */}
      <section className="bg-white border-b border-[#e5e7eb] pt-6 pb-5 sm:pt-8 sm:pb-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#262626] tracking-tight">
                  Menu
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#fff0f3] border border-[#ffd1dc] text-[#FF0055] text-[11px] font-mono-num font-bold">
                  {effectiveMember?.name || 'Guest'}
                </span>
              </div>
              <p className="text-[13px] text-[#727272]">
                Cooked fresh over wood flame coals upon payment confirmation. Touch any dish to customize.
              </p>
            </div>

            <div className="sm:text-right bg-[#f9f9f9] px-4 py-2 rounded-xl border border-[#e5e7eb] shrink-0">
              <div className="text-[10px] font-mono-num uppercase tracking-wider text-[#727272]">
                Table Seating
              </div>
              <div className="text-base font-mono-num font-bold text-[#FF0055]">
                Table {cleanTable}
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" data-ui-actions="category-filters">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                data-ui-radius="999"
                className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all shrink-0 cursor-pointer ${
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
          <span className="text-[12px] font-mono-num text-[#949494]">
            {filteredDishes.length} dishes
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredDishes.map((dish) => (
            <div
              key={dish.id}
              onClick={() => setSelectedDish(dish)}
              data-ui-radius="16"
              className="group bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden shadow-xs hover:border-[#FF0055] transition-all cursor-pointer flex flex-col active:scale-[0.99] select-none"
            >
              <div className="relative h-48 sm:h-52 w-full bg-[#f9f9f9] overflow-hidden">
                <img
                  src={dish.imageUrl}
                  alt={dish.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                {dish.badge && (
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#FF0055] text-white text-[11px] font-mono-num font-semibold shadow-xs">
                    {dish.badge}
                  </div>
                )}
                {dish.rating && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-white/95 text-[#262626] text-[11px] font-mono-num font-medium shadow-xs flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 fill-[#FBBF24] text-[#FBBF24]" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-bold">{dish.rating}</span>
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-[16px] font-bold text-[#262626] group-hover:text-[#FF0055] transition-colors leading-snug">
                    {dish.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-[12px] font-mono-num text-[#949494]">
                    <span>{dish.calories} KCAL</span>
                    <span>•</span>
                    <span>{dish.prepTime || '10 min'}</span>
                  </div>
                  <p className="mt-2 text-[13px] text-[#727272] line-clamp-2 leading-relaxed">
                    {dish.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#f0f0f0] flex items-center justify-between">
                  <div className="text-[17px] font-mono-num font-bold text-[#FF0055]" data-ui-number>
                    {dish.basePrice.toFixed(2)} EGP
                  </div>

                  <span
                    data-ui-radius="999"
                    className="px-3.5 py-1.5 rounded-full bg-[#f9f9f9] group-hover:bg-[#FF0055] text-[#262626] group-hover:text-white border border-[#e5e7eb] group-hover:border-[#FF0055] text-[12px] font-medium transition-all shadow-xs"
                  >
                    Customize +
                  </span>
                </div>
              </div>
            </div>
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
