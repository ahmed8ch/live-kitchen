import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, UtensilsCrossed, CreditCard, MapPin, Clock, Phone, ShieldAlert } from 'lucide-react';
import { DirectionalArrow } from '../components/ui/DirectionalArrow';
import { useAppStore } from '../store/useAppStore';
import { MENU_ITEMS } from '../domain/menuData';
import { MenuCategory, MenuItem } from '../types/domain';
import { DishCard } from '../components/menu/DishCard';
import { DishModal } from '../components/menu/DishModal';
import { FloatingCartBar } from '../components/cart/FloatingCartBar';
import { CartDrawer } from '../components/cart/CartDrawer';
import { useTranslation } from '../i18n';

const DINING_TABLES = ['T-01', 'T-02', 'T-03', 'T-04', 'T-05', 'T-06', 'T-08', 'T-12'];

export const HomePage: React.FC = () => {
  const { t, localizeDish } = useTranslation();

  const activeTable = useAppStore((state) => state.activeTable);
  const activeTablePin = useAppStore((state) => state.activeTablePin);
  const tableSessions = useAppStore((state) => state.tableSessions);
  const setActiveTable = useAppStore((state) => state.setActiveTable);
  const openPinModal = useAppStore((state) => state.openPinModal);
  const cart = useAppStore((state) => state.cart);
  const orders = useAppStore((state) => state.orders);
  const openCartDrawer = useAppStore((state) => state.openCartDrawer);
  const submitPlatformFeedback = useAppStore((state) => state.submitPlatformFeedback);
  const showToast = useAppStore((state) => state.showToast);

  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [signatureCategory, setSignatureCategory] = useState<'all' | MenuCategory>('all');

  // Guest Inquiry & Feedback Form State (Supabase Persistence)
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [category, setCategory] = useState('Platform Inquiry');
  const [priority, setPriority] = useState('Normal');
  const [message, setMessage] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const menuLink = activeTable ? `/menu?table=${activeTable}` : '/menu';
  const currentSession = activeTable ? tableSessions[activeTable] : null;
  const sessionPin = activeTablePin || currentSession?.pin;
  const sessionMembers = currentSession?.members || [];

  // Active non-voided order for this table (or latest active order)
  const activeOrders = orders.filter((o) => o.status !== 'voided');
  const currentOrder = activeTable
    ? activeOrders.find((o) => o.tableNumber === activeTable) || null
    : activeOrders[0] || null;

  const safeCart = cart || [];
  const cartSubtotal = safeCart.reduce((sum, item) => {
    const modTotal = (item.selectedModifiers || []).reduce((mSum, m) => mSum + m.price, 0);
    return sum + (item.menuItem.basePrice + modTotal) * item.quantity;
  }, 0);
  const cartVat = Math.round(cartSubtotal * 0.14 * 100) / 100;
  const cartTotal = Math.round((cartSubtotal + cartVat) * 100) / 100;

  // Featured dishes from MENU_ITEMS (6 signature plates across categories, or filtered by quick category pill)
  const defaultFeatured = [
    MENU_ITEMS[0], // Angus Flame-Grilled Burger (185 EGP)
    MENU_ITEMS[4], // 45-Day Dry Aged Ribeye
    MENU_ITEMS[7], // San Marzano Margherita D.O.P.
    MENU_ITEMS[10], // Braised Short Rib Rigatoni
    MENU_ITEMS[11], // Truffle Parmesan Hand-Cut Fries
    MENU_ITEMS[12], // Smoked Vanilla Bean Espresso Gelato
  ].filter(Boolean);

  const featuredDishes =
    signatureCategory === 'all'
      ? defaultFeatured
      : MENU_ITEMS.filter((item) => item.category === signatureCategory).slice(0, 6);

  const signatureCategories: { id: 'all' | MenuCategory; label: string }[] = [
    { id: 'all', label: t('menu.categories.all') },
    { id: 'burgers', label: t('menu.categories.burgers') },
    { id: 'steaks', label: t('menu.categories.steaks') },
    { id: 'pizzas', label: t('menu.categories.pizzas') },
    { id: 'pastas', label: t('menu.categories.pastas') },
    { id: 'drinks', label: t('menu.categories.drinks') },
  ];

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim() || !message.trim()) {
      showToast(t('home.support.fillRequiredToast'));
      return;
    }

    setIsSubmittingForm(true);

    const ticketId = submitPlatformFeedback({
      name: contactName.trim(),
      email: contactPhone.trim(),
      category,
      priority,
      message: message.trim(),
    });

    try {
      const response = await fetch('https://vatdmlmthjdtgpvjzlep.supabase.co/rest/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'sb_publishable_BK5eQmfVdgz00gN9TpiY5w_ZylSieJk',
          'Authorization': 'Bearer sb_publishable_BK5eQmfVdgz00gN9TpiY5w_ZylSieJk',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          name: contactName.trim(),
          phone: contactPhone.trim(),
          message: `[${category} | ${priority}] ${message.trim()}`,
        }),
      });

      if (!response.ok) {
        console.warn('Supabase insert status:', response.status);
      }
    } catch (err) {
      console.warn('Supabase messages insert error:', err);
    } finally {
      setIsSubmittingForm(false);
      setSubmittedTicket(ticketId);
      setContactName('');
      setContactPhone('');
      setMessage('');
      showToast(t('home.support.savedToast'));
    }
  };

  return (
    <div className="flex-1 w-full bg-white text-[#262626] pb-24" data-ui-container="home-overview">
      {/* =========================================================================
          SECTION 1 (#hero): Editorial Split + Real Stateful Table Check-In / Session Panel
          ========================================================================= */}
      <section id="hero" className="border-b border-[#e5e7eb] bg-white py-10 sm:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Quick Architectural Section Jump Strip */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-8 mb-8 border-b border-[#e5e7eb]">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] text-xs font-semibold text-[#262626]">
              <span className="w-2 h-2 rounded-full bg-[#FF0055]" />
              <span>{t('home.hero.eyebrow')}</span>
            </div>

            <nav aria-label="Page sections" className="hidden sm:flex items-center gap-2 text-xs font-medium text-[#727272]">
              <a
                href="#how-it-works"
                className="px-3 py-1.5 rounded-full bg-[#f9f9f9] hover:bg-[#f0f0f0] border border-[#e5e7eb] text-[#262626] transition-colors"
              >
                {t('home.howItWorks.badge')}
              </a>
              <a
                href="#signatures"
                className="px-3 py-1.5 rounded-full bg-[#f9f9f9] hover:bg-[#f0f0f0] border border-[#e5e7eb] text-[#262626] transition-colors"
              >
                {t('home.signatures.badge')}
              </a>
              <a
                href="#support"
                className="px-3 py-1.5 rounded-full bg-[#f9f9f9] hover:bg-[#f0f0f0] border border-[#e5e7eb] text-[#262626] transition-colors"
              >
                {t('home.support.badge')}
              </a>
            </nav>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Start Column: Authentic Live Kitchen Identity & Direct Actions */}
            <div className="lg:col-span-7 space-y-6 pt-1">
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#262626] leading-[1.12]">
                {t('home.hero.headline')}
              </h1>

              <p className="text-base sm:text-lg text-[#616161] leading-relaxed max-w-xl">
                {t('home.hero.description')}
              </p>

              {/* Primary & Secondary CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  to={menuLink}
                  className="min-h-[48px] inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-full bg-[#FF0055] hover:bg-[#e0004d] text-white text-sm font-bold transition-transform active:scale-[0.98] cursor-pointer"
                >
                  <span>
                    {activeTable
                      ? t('home.hero.openTableMenu', { table: activeTable })
                      : t('home.hero.browseFullMenu')}
                  </span>
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                    <DirectionalArrow className="w-3.5 h-3.5" />
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => openPinModal(activeTable || 'T-04')}
                  className="min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#f9f9f9] hover:bg-[#f0f0f0] border border-[#e5e7eb] text-[#262626] text-sm font-semibold transition-transform active:scale-[0.98] cursor-pointer"
                >
                  <span>{t('home.hero.joinSeatedPin')}</span>
                </button>
              </div>

              {/* Real Factual Venue Information (from live-kitchen-facts.md) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#e5e7eb] text-xs">
                <div className="p-3.5 rounded-2xl bg-[#f9f9f9] border border-[#e5e7eb]">
                  <div className="text-[#727272] font-medium">{t('home.hero.locationLabel')}</div>
                  <div className="font-bold text-[#262626] mt-0.5">
                    {t('home.hero.locationValue')}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#f9f9f9] border border-[#e5e7eb]">
                  <div className="text-[#727272] font-medium">{t('home.hero.hoursLabel')}</div>
                  <div className="font-bold text-[#262626] mt-0.5">
                    {t('home.hero.hoursValue')}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#f9f9f9] border border-[#e5e7eb]">
                  <div className="text-[#727272] font-medium">{t('home.hero.settlementLabel')}</div>
                  <div className="font-bold text-[#262626] mt-0.5">
                    {t('home.hero.settlementValue')}
                  </div>
                </div>
              </div>
            </div>

            {/* End Column: REAL Live Table Session & Order Terminal (Zero Fake Static Data) */}
            <div className="lg:col-span-5 w-full">
              {/* Double-Bezel Outer Shell */}
              <div className="bg-[#f9f9f9] p-2 rounded-2xl border border-[#e5e7eb]">
                <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 space-y-5">
                  {/* STATE A: No Table Selected & No Active Order -> Real Table Check-In Picker */}
                  {!activeTable && !currentOrder && safeCart.length === 0 && (
                    <>
                      <div className="flex items-center justify-between pb-4 border-b border-[#e5e7eb]">
                        <div>
                          <span className="text-xs font-semibold text-[#727272] block">
                            {t('home.terminal.checkInBadge')}
                          </span>
                          <h2 className="text-lg font-bold text-[#262626] mt-0.5">
                            {t('home.terminal.selectTableTitle')}
                          </h2>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] text-[#727272] text-xs font-semibold">
                          {t('home.terminal.noActiveOrder')}
                        </span>
                      </div>

                      <p className="text-xs text-[#616161] leading-relaxed">
                        {t('home.terminal.selectTableDesc')}
                      </p>

                      <div className="grid grid-cols-4 gap-2">
                        {DINING_TABLES.map((tbl) => (
                          <button
                            key={tbl}
                            type="button"
                            onClick={() => setActiveTable(tbl)}
                            className="min-h-[48px] py-2.5 px-2 rounded-2xl bg-[#f9f9f9] hover:bg-[#fff0f3] border border-[#e5e7eb] hover:border-[#FF0055] text-[#262626] hover:text-[#FF0055] font-mono-num font-bold text-sm transition-colors cursor-pointer flex flex-col items-center justify-center"
                          >
                            <span>{tbl}</span>
                            <span className="text-[10px] font-sans font-normal text-[#727272]">
                              {t('home.terminal.openLabel')}
                            </span>
                          </button>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-[#e5e7eb] flex items-center justify-between text-xs text-[#727272]">
                        <span>{t('home.terminal.tablesAvailable')}</span>
                        <span className="font-medium text-[#262626]">{t('home.terminal.tapToCheckIn')}</span>
                      </div>
                    </>
                  )}

                  {/* STATE B: Active Table or Cart Items (Before Order Submission) */}
                  {(activeTable || safeCart.length > 0) && !currentOrder && (
                    <>
                      <div className="flex items-center justify-between pb-4 border-b border-[#e5e7eb]">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#FF0055]" />
                            <h2 className="text-base font-bold text-[#262626]">
                              {activeTable
                                ? t('home.terminal.tableSessionTitle', { table: activeTable })
                                : t('home.terminal.currentOrderTitle')}
                            </h2>
                          </div>
                          <p className="text-xs text-[#727272] mt-0.5">
                            {sessionMembers.length > 0
                              ? sessionMembers.length === 1
                                ? t('home.terminal.seatedDinersSingle', { count: sessionMembers.length })
                                : t('home.terminal.seatedDinersPlural', { count: sessionMembers.length })
                              : t('home.terminal.activeDiningSession')}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {sessionPin && (
                            <span className="px-2.5 py-1 rounded-full bg-[#fff0f3] text-[#FF0055] border border-[#ffd1dc] text-xs font-bold">
                              {t('common.pin')}: <span className="font-mono-num">{sessionPin}</span>
                            </span>
                          )}
                          {activeTable && (
                            <button
                              type="button"
                              onClick={() => setActiveTable(null)}
                              className="min-h-[36px] px-2.5 py-1 rounded-full bg-[#f9f9f9] hover:bg-red-50 text-xs text-[#727272] hover:text-red-600 border border-[#e5e7eb] cursor-pointer"
                            >
                              {t('common.leave')}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Seated Members Strip */}
                      {sessionMembers.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {sessionMembers.map((m) => (
                            <span
                              key={m.id}
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                m.isHost
                                  ? 'bg-[#262626] text-white border-[#262626]'
                                  : 'bg-[#f9f9f9] text-[#262626] border-[#e5e7eb]'
                              }`}
                            >
                              {m.name.replace(/\s*\(Host\)$/i, '')}
                              {m.isHost ? ` (${t('common.host')})` : ''}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Live Cart Items */}
                      {safeCart.length === 0 ? (
                        <div className="p-5 rounded-2xl bg-[#f9f9f9] border border-[#e5e7eb] text-center space-y-2">
                          <div className="text-sm font-bold text-[#262626]">
                            {t('home.terminal.noDishesAddedTitle')}
                          </div>
                          <p className="text-xs text-[#727272]">
                            {t('home.terminal.noDishesAddedDesc')}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5 bg-[#f9f9f9] p-3.5 rounded-2xl border border-[#e5e7eb] text-xs max-h-52 overflow-y-auto">
                          {safeCart.map((item) => {
                            const modSum = (item.selectedModifiers || []).reduce((s, m) => s + m.price, 0);
                            const lineTotal = (item.menuItem.basePrice + modSum) * item.quantity;
                            const localDish = localizeDish(item.menuItem);
                            return (
                              <div
                                key={item.cartItemId}
                                className="flex justify-between items-start pb-2 border-b border-[#e5e7eb] last:border-b-0 last:pb-0"
                              >
                                <div>
                                  <div className="font-bold text-[#262626]">
                                    {item.quantity}x {localDish.name}
                                  </div>
                                  {item.addedBy && (
                                    <div className="text-[11px] text-[#727272]">
                                      {t('home.terminal.addedBy', { name: item.addedBy.name })}
                                    </div>
                                  )}
                                </div>
                                <span className="font-mono-num font-bold text-[#262626] shrink-0 ms-2">
                                  {lineTotal.toFixed(2)} {t('common.egp')}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {safeCart.length > 0 && (
                        <div className="space-y-1.5 text-xs pt-2 border-t border-[#e5e7eb]">
                          <div className="flex justify-between text-[#727272]">
                            <span>{t('common.subtotal')}</span>
                            <span className="font-mono-num">{cartSubtotal.toFixed(2)} {t('common.egp')}</span>
                          </div>
                          <div className="flex justify-between text-[#727272]">
                            <span>{t('common.vat14')}</span>
                            <span className="font-mono-num">{cartVat.toFixed(2)} {t('common.egp')}</span>
                          </div>
                          <div className="flex justify-between text-sm font-bold text-[#262626] pt-1">
                            <span>{t('common.totalPayable')}</span>
                            <span className="font-mono-num text-[#FF0055]">{cartTotal.toFixed(2)} {t('common.egp')}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2 pt-1">
                        <Link
                          to={menuLink}
                          className="flex-1 min-h-[44px] py-2.5 px-4 rounded-full bg-[#FF0055] hover:bg-[#e0004d] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <span>
                            {safeCart.length > 0 ? t('home.terminal.addMoreDishes') : t('home.terminal.openTableMenu')}
                          </span>
                          <DirectionalArrow className="w-3.5 h-3.5" />
                        </Link>
                        {safeCart.length > 0 && (
                          <button
                            type="button"
                            onClick={() => openCartDrawer()}
                            className="flex-1 min-h-[44px] py-2.5 px-4 rounded-full bg-[#262626] hover:bg-black text-white text-xs font-bold cursor-pointer transition-colors"
                          >
                            {t('home.terminal.reviewCheckout')}
                          </button>
                        )}
                      </div>
                    </>
                  )}

                  {/* STATE C: Active Order Ticket Exists */}
                  {currentOrder && (
                    <>
                      <div className="flex items-center justify-between pb-4 border-b border-[#e5e7eb]">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#FF0055]" />
                            <h2 className="text-base font-bold text-[#262626]">
                              {t('home.terminal.orderNumber', { id: currentOrder.id })}
                            </h2>
                          </div>
                          <div className="text-xs text-[#727272] mt-0.5">
                            {currentOrder.tableNumber
                              ? `${t('common.table')} ${currentOrder.tableNumber}`
                              : t('home.terminal.dineInOrder')}
                          </div>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            currentOrder.paymentStatus === 'verified_paid'
                              ? 'bg-[#f9f9f9] text-[#262626] border-[#e5e7eb]'
                              : 'bg-[#fff0f3] text-[#FF0055] border-[#ffd1dc]'
                          }`}
                        >
                          {currentOrder.paymentStatus === 'verified_paid'
                            ? t('home.terminal.kitchenStatus', { status: currentOrder.status.toUpperCase() })
                            : t('home.terminal.awaitingSettlement')}
                        </span>
                      </div>

                      <div className="space-y-2 bg-[#f9f9f9] p-3.5 rounded-2xl border border-[#e5e7eb] text-xs max-h-48 overflow-y-auto">
                        {currentOrder.items.map((item) => {
                          const modSum = (item.selectedModifiers || []).reduce((s, m) => s + m.price, 0);
                          const lineTotal = (item.menuItem.basePrice + modSum) * item.quantity;
                          const localDish = localizeDish(item.menuItem);
                          return (
                            <div
                              key={item.cartItemId}
                              className="flex justify-between items-center pb-2 border-b border-[#e5e7eb] last:border-b-0 last:pb-0"
                            >
                              <span className="font-bold text-[#262626]">
                                {item.quantity}x {localDish.name}
                              </span>
                              <span className="font-mono-num font-bold text-[#262626]">
                                {lineTotal.toFixed(2)} {t('common.egp')}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-between items-center text-sm font-bold text-[#262626] pt-1">
                        <span>{t('home.terminal.totalInclVat')}</span>
                        <span className="font-mono-num text-[#FF0055]">
                          {currentOrder.total.toFixed(2)} {t('common.egp')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Link
                          to={`/order/${currentOrder.id}`}
                          className="min-h-[44px] py-2.5 px-4 rounded-full bg-[#f9f9f9] hover:bg-[#f0f0f0] border border-[#e5e7eb] text-[#262626] text-xs font-bold inline-flex items-center justify-center transition-colors"
                        >
                          {t('home.terminal.orderTrackerBtn')}
                        </Link>
                        <Link
                          to={`/settlement/${currentOrder.id}`}
                          className="min-h-[44px] py-2.5 px-4 rounded-full bg-[#FF0055] hover:bg-[#e0004d] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <span>
                            {currentOrder.isPaid ? t('home.terminal.viewReceiptBtn') : t('home.terminal.settleBillBtn')}
                          </span>
                          {!currentOrder.isPaid && <DirectionalArrow className="w-3.5 h-3.5" />}
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2 (#how-it-works): 3-Step Table Self-Ordering Architecture
          ========================================================================= */}
      <section id="how-it-works" className="py-14 sm:py-20 bg-[#f9f9f9] border-b border-[#e5e7eb]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-[#e5e7eb] text-xs font-semibold text-[#FF0055] mb-3">
              {t('home.howItWorks.badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#262626] tracking-tight">
              {t('home.howItWorks.title')}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#616161] leading-relaxed">
              {t('home.howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-[#e5e7eb] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#fff0f3] border border-[#ffd1dc] flex items-center justify-center text-[#FF0055]">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#262626]">
                  {t('home.howItWorks.step1Title')}
                </h3>
                <p className="text-xs sm:text-sm text-[#616161] leading-relaxed">
                  {t('home.howItWorks.step1Desc')}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-[#e5e7eb] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#fff0f3] border border-[#ffd1dc] flex items-center justify-center text-[#FF0055]">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#262626]">
                  {t('home.howItWorks.step2Title')}
                </h3>
                <p className="text-xs sm:text-sm text-[#616161] leading-relaxed">
                  {t('home.howItWorks.step2Desc')}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-[#e5e7eb] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#fff0f3] border border-[#ffd1dc] flex items-center justify-center text-[#FF0055]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#262626]">
                  {t('home.howItWorks.step3Title')}
                </h3>
                <p className="text-xs sm:text-sm text-[#616161] leading-relaxed">
                  {t('home.howItWorks.step3Desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3 (#signatures): Real Interactive Menu Preview with Quick Filter
          ========================================================================= */}
      <section id="signatures" className="py-16 sm:py-24 bg-white border-b border-[#e5e7eb]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] text-xs font-semibold text-[#FF0055] mb-3">
                {t('home.signatures.badge')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#262626] tracking-tight">
                {t('home.signatures.title')}
              </h2>
              <p className="mt-1.5 text-sm sm:text-base text-[#616161]">
                {t('home.signatures.subtitle')}
              </p>
            </div>
            <Link
              to={menuLink}
              className="min-h-[44px] px-5 py-2.5 rounded-full bg-[#f9f9f9] hover:bg-[#f0f0f0] border border-[#e5e7eb] text-xs font-bold text-[#262626] inline-flex items-center justify-center gap-2 shrink-0 transition-colors"
            >
              <span>{t('home.signatures.viewAllDishes', { count: MENU_ITEMS.length })}</span>
              <DirectionalArrow className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Interactive Category Quick-Switch Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
            {signatureCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSignatureCategory(cat.id)}
                className={`min-h-[40px] px-4 py-1.5 rounded-full text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                  signatureCategory === cat.id
                    ? 'bg-[#262626] text-white'
                    : 'bg-[#f9f9f9] hover:bg-[#f0f0f0] text-[#727272] border border-[#e5e7eb]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {featuredDishes.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                onClick={() => setSelectedDish(dish)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4 (#support): Venue Details & Direct Support Desk (Supabase Persistence)
          ========================================================================= */}
      <section id="support" className="py-16 sm:py-24 bg-[#f9f9f9] border-b border-[#e5e7eb]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Start Column: Authentic Live Kitchen Information (from live-kitchen-facts.md) */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-[#e5e7eb] text-xs font-semibold text-[#FF0055] mb-3">
                  {t('home.support.badge')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#262626] tracking-tight">
                  {t('home.support.visitTitle')}
                </h2>
                <p className="mt-2 text-sm text-[#616161] leading-relaxed">
                  {t('home.support.visitDesc')}
                </p>
              </div>

              <div className="bg-white p-2 rounded-2xl border border-[#e5e7eb]">
                <div className="bg-[#f9f9f9] rounded-2xl border border-[#e5e7eb] p-5 space-y-4 text-sm">
                  <div className="pb-3 border-b border-[#e5e7eb] flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#FF0055] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-[#727272]">{t('home.support.addressLabel')}</div>
                      <div className="font-bold text-[#262626] mt-0.5">
                        {t('home.support.addressValue')}
                      </div>
                    </div>
                  </div>

                  <div className="pb-3 border-b border-[#e5e7eb] flex items-start gap-3">
                    <Clock className="w-4 h-4 text-[#FF0055] shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-[#727272]">{t('home.support.serviceHoursLabel')}</div>
                      <div className="mt-1 space-y-1 text-xs">
                        <div className="flex justify-between gap-2">
                          <span className="text-[#616161]">{t('home.support.satThu')}</span>
                          <span className="font-mono-num font-bold text-[#262626]">{t('home.support.satThuHours')}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-[#616161]">{t('home.support.friday')}</span>
                          <span className="font-mono-num font-bold text-[#262626]">{t('home.support.fridayHours')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pb-3 border-b border-[#e5e7eb] flex items-start gap-3">
                    <Phone className="w-4 h-4 text-[#FF0055] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-[#727272]">{t('home.support.phoneDeliveryLabel')}</div>
                      <div className="font-mono-num font-bold text-[#262626] mt-0.5">{t('home.support.phoneNumber')}</div>
                      <div className="text-xs text-[#727272] mt-0.5">
                        {t('home.support.deliveryNote')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-4 h-4 text-[#FF0055] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-[#727272]">{t('home.support.allergyPolicyLabel')}</div>
                      <div className="text-xs text-[#616161] mt-0.5 leading-relaxed">
                        {t('home.support.allergyPolicyValue')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* End Column: Guest Feedback, Inquiries & Support Form */}
            <div className="lg:col-span-7">
              <div className="bg-white p-2 rounded-2xl border border-[#e5e7eb]">
                <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 sm:p-8 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#262626] tracking-tight">
                      {t('home.support.formTitle')}
                    </h3>
                    <p className="text-sm text-[#616161] mt-1">
                      {t('home.support.formSubtitle')}
                    </p>
                  </div>

                  {submittedTicket ? (
                    <div className="p-6 rounded-2xl bg-[#f9f9f9] border border-[#e5e7eb] text-center space-y-3">
                      <div className="w-10 h-10 rounded-full bg-[#fff0f3] text-[#FF0055] flex items-center justify-center mx-auto">
                        <svg className="w-5 h-5 text-[#FF0055]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div className="text-sm font-bold text-[#262626]">
                        {t('home.support.messageReceivedTitle')}
                      </div>
                      <p className="text-xs text-[#727272] max-w-sm mx-auto">
                        {t('home.support.messageReceivedDesc', { id: submittedTicket })}
                      </p>
                      <button
                        type="button"
                        onClick={() => setSubmittedTicket(null)}
                        className="mt-2 min-h-[44px] px-5 py-2 rounded-full bg-white border border-[#e5e7eb] text-[#262626] text-xs font-semibold hover:bg-[#f0f0f0] transition-colors cursor-pointer"
                      >
                        {t('home.support.sendAnotherBtn')}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="fb-name" className="block text-xs font-semibold text-[#262626] mb-1.5">
                            {t('home.support.fullNameLabel')}
                          </label>
                          <input
                            id="fb-name"
                            type="text"
                            required
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder={t('home.support.fullNamePlaceholder')}
                            className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055]"
                          />
                        </div>

                        <div>
                          <label htmlFor="fb-phone" className="block text-xs font-semibold text-[#262626] mb-1.5">
                            {t('home.support.phoneLabel')}
                          </label>
                          <input
                            id="fb-phone"
                            type="text"
                            required
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder={t('home.support.phonePlaceholder')}
                            className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="fb-category" className="block text-xs font-semibold text-[#262626] mb-1.5">
                            {t('home.support.topicLabel')}
                          </label>
                          <select
                            id="fb-category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055]"
                          >
                            <option value="Platform Inquiry">{t('home.support.topicInquiry')}</option>
                            <option value="Feature Suggestion">{t('home.support.topicSuggestion')}</option>
                            <option value="Bug / Issue Report">{t('home.support.topicOrderSupport')}</option>
                            <option value="Enterprise Hardware">{t('home.support.topicGroupBooking')}</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="fb-priority" className="block text-xs font-semibold text-[#262626] mb-1.5">
                            {t('home.support.priorityLabel')}
                          </label>
                          <select
                            id="fb-priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055]"
                          >
                            <option value="Normal">{t('home.support.priorityStandard')}</option>
                            <option value="High">{t('home.support.prioritySeated')}</option>
                            <option value="Urgent">{t('home.support.priorityUrgent')}</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="fb-message" className="block text-xs font-semibold text-[#262626] mb-1.5">
                          {t('home.support.messageLabel')}
                        </label>
                        <textarea
                          id="fb-message"
                          required
                          rows={3}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={t('home.support.messagePlaceholder')}
                          className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingForm}
                        className="w-full min-h-[48px] py-3.5 rounded-full bg-[#FF0055] hover:bg-[#e0004d] text-white text-sm font-bold transition-transform active:scale-[0.98] cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2"
                      >
                        <span>
                          {isSubmittingForm ? t('home.support.sendingBtn') : t('home.support.sendBtn')}
                        </span>
                        {!isSubmittingForm && <DirectionalArrow className="w-4 h-4" />}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Cart & Dish Customization on Home Page */}
      <FloatingCartBar />
      <CartDrawer />
      <DishModal dish={selectedDish} onClose={() => setSelectedDish(null)} />
    </div>
  );
};
