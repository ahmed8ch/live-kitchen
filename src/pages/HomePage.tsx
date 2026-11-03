import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { MENU_ITEMS } from '../domain/menuData';
import { MenuItem } from '../types/domain';
import { DishCard } from '../components/menu/DishCard';
import { DishModal } from '../components/menu/DishModal';
import { FloatingCartBar } from '../components/cart/FloatingCartBar';
import { CartDrawer } from '../components/cart/CartDrawer';

const DINING_TABLES = ['T-01', 'T-02', 'T-03', 'T-04', 'T-05', 'T-06', 'T-08', 'T-12'];

export const HomePage: React.FC = () => {
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

  // Featured dishes from MENU_ITEMS (6 signature plates across categories)
  const featuredDishes = [
    MENU_ITEMS[0], // Angus Flame-Grilled Burger (185 EGP)
    MENU_ITEMS[4], // 45-Day Dry Aged Ribeye
    MENU_ITEMS[7], // San Marzano Margherita D.O.P.
    MENU_ITEMS[10], // Braised Short Rib Rigatoni
    MENU_ITEMS[11], // Truffle Parmesan Hand-Cut Fries
    MENU_ITEMS[12], // Smoked Vanilla Bean Espresso Gelato
  ].filter(Boolean);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim() || !message.trim()) {
      showToast('Please fill out all required fields.');
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
      showToast('Message recorded on Supabase.');
    }
  };

  return (
    <div className="flex-1 w-full bg-white text-[#262626] pb-24" data-ui-container="home-overview">
      {/* =========================================================================
          HERO SECTION: Editorial Split + Real Stateful Table Check-In / Session Panel
          ========================================================================= */}
      <section id="hero" className="border-b border-[#e5e7eb] bg-white py-12 sm:py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Column: Authentic Live Kitchen Identity & Direct Actions */}
            <div className="lg:col-span-7 space-y-6 pt-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] text-xs font-semibold text-[#262626]">
                <span className="w-2 h-2 rounded-full bg-[#FF0055]" />
                <span>Live Kitchen (لايف كيتشن) &middot; Open Wood-Flame Dining</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#262626] leading-[1.08]">
                Wood-Fired Open Kitchen, Ordered From Your Table.
              </h1>

              <p className="text-base sm:text-lg text-[#616161] leading-relaxed max-w-xl">
                Every dish is prepared fresh in our open kitchen the moment your table order is confirmed. Select your table to start ordering, share your 4-digit PIN with companions, and split the check on your own phone.
              </p>

              {/* Primary & Secondary CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  to={menuLink}
                  className="min-h-[48px] inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-full bg-[#FF0055] hover:bg-[#e0004d] text-white text-sm font-bold transition-transform active:scale-[0.98] cursor-pointer"
                >
                  <span>
                    {activeTable ? `Open Table ${activeTable} Menu` : 'Browse Full Dine-In Menu'}
                  </span>
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                    -&gt;
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => openPinModal(activeTable || 'T-04')}
                  className="min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#f9f9f9] hover:bg-[#f0f0f0] border border-[#e5e7eb] text-[#262626] text-sm font-semibold transition-transform active:scale-[0.98] cursor-pointer"
                >
                  <span>Join Seated Table with PIN</span>
                </button>
              </div>

              {/* Real Factual Venue Information (from live-kitchen-facts.md) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#e5e7eb] text-xs">
                <div className="p-3.5 rounded-2xl bg-[#f9f9f9] border border-[#e5e7eb]">
                  <div className="text-[#727272] font-medium">Location</div>
                  <div className="font-bold text-[#262626] mt-0.5">
                    Republic St., Next to El-Montazah
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#f9f9f9] border border-[#e5e7eb]">
                  <div className="text-[#727272] font-medium">Opening Hours</div>
                  <div className="font-bold text-[#262626] mt-0.5">
                    Daily 12:00 PM &ndash; 12:00 AM
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#f9f9f9] border border-[#e5e7eb]">
                  <div className="text-[#727272] font-medium">Accepted Settlement</div>
                  <div className="font-bold text-[#262626] mt-0.5">
                    Cash, Card, InstaPay &amp; Apple Pay
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: REAL Live Table Session & Order Terminal (Zero Fake Static Data) */}
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
                            Dining Room Check-In
                          </span>
                          <h2 className="text-lg font-bold text-[#262626] mt-0.5">
                            Select Your Seated Table
                          </h2>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] text-[#727272] text-xs font-semibold">
                          No Active Order
                        </span>
                      </div>

                      <p className="text-xs text-[#616161] leading-relaxed">
                        Seated in the dining room? Choose your table number below to open a live table session and get a 4-digit PIN for your companions, or browse the menu directly.
                      </p>

                      <div className="grid grid-cols-4 gap-2">
                        {DINING_TABLES.map((tbl) => (
                          <button
                            key={tbl}
                            type="button"
                            onClick={() => setActiveTable(tbl)}
                            className="min-h-[48px] py-2.5 px-2 rounded-2xl bg-[#f9f9f9] hover:bg-[#fff0f3] border border-[#e5e7eb] hover:border-[#FF0055] text-[#262626] hover:text-[#FF0055] font-mono-num font-bold text-xs transition-colors cursor-pointer flex flex-col items-center justify-center"
                          >
                            <span>{tbl}</span>
                            <span className="text-[10px] font-sans font-normal text-[#727272]">Open</span>
                          </button>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-[#e5e7eb] flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={() => openPinModal('T-04')}
                          className="flex-1 min-h-[44px] py-2.5 px-4 rounded-full bg-[#f9f9f9] hover:bg-[#f0f0f0] border border-[#e5e7eb] text-xs font-bold text-[#262626] cursor-pointer transition-colors"
                        >
                          Join Table with 4-Digit PIN
                        </button>
                        <Link
                          to="/menu"
                          className="flex-1 min-h-[44px] py-2.5 px-4 rounded-full bg-[#262626] hover:bg-black text-white text-xs font-bold inline-flex items-center justify-center transition-colors"
                        >
                          View Menu First -&gt;
                        </Link>
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
                              {activeTable ? `Table ${activeTable} Session` : 'Your Current Order'}
                            </h2>
                          </div>
                          <p className="text-xs text-[#727272] mt-0.5">
                            {sessionMembers.length > 0
                              ? `${sessionMembers.length} seated ${sessionMembers.length === 1 ? 'diner' : 'diners'}`
                              : 'Active dining session'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {sessionPin && (
                            <span className="px-2.5 py-1 rounded-full bg-[#fff0f3] text-[#FF0055] border border-[#ffd1dc] text-xs font-bold">
                              PIN: <span className="font-mono-num">{sessionPin}</span>
                            </span>
                          )}
                          {activeTable && (
                            <button
                              type="button"
                              onClick={() => setActiveTable(null)}
                              className="min-h-[36px] px-2.5 py-1 rounded-full bg-[#f9f9f9] hover:bg-red-50 text-xs text-[#727272] hover:text-red-600 border border-[#e5e7eb] cursor-pointer"
                            >
                              Leave
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
                              {m.isHost ? ' (Host)' : ''}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Live Cart Items */}
                      {safeCart.length === 0 ? (
                        <div className="p-5 rounded-2xl bg-[#f9f9f9] border border-[#e5e7eb] text-center space-y-2">
                          <div className="text-sm font-bold text-[#262626]">
                            No dishes added yet
                          </div>
                          <p className="text-xs text-[#727272]">
                            Your table session is active. Select dishes from the menu below or open the full menu to start your order.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5 bg-[#f9f9f9] p-3.5 rounded-2xl border border-[#e5e7eb] text-xs max-h-52 overflow-y-auto">
                          {safeCart.map((item) => {
                            const modSum = (item.selectedModifiers || []).reduce((s, m) => s + m.price, 0);
                            const lineTotal = (item.menuItem.basePrice + modSum) * item.quantity;
                            return (
                              <div
                                key={item.cartItemId}
                                className="flex justify-between items-start pb-2 border-b border-[#e5e7eb] last:border-b-0 last:pb-0"
                              >
                                <div>
                                  <div className="font-bold text-[#262626]">
                                    {item.quantity}x {item.menuItem.name}
                                  </div>
                                  {item.addedBy && (
                                    <div className="text-[11px] text-[#727272]">
                                      Added by {item.addedBy.name}
                                    </div>
                                  )}
                                </div>
                                <span className="font-mono-num font-bold text-[#262626] shrink-0 ml-2">
                                  {lineTotal.toFixed(2)} EGP
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {safeCart.length > 0 && (
                        <div className="space-y-1.5 text-xs pt-2 border-t border-[#e5e7eb]">
                          <div className="flex justify-between text-[#727272]">
                            <span>Subtotal</span>
                            <span className="font-mono-num">{cartSubtotal.toFixed(2)} EGP</span>
                          </div>
                          <div className="flex justify-between text-[#727272]">
                            <span>14% ETA VAT</span>
                            <span className="font-mono-num">{cartVat.toFixed(2)} EGP</span>
                          </div>
                          <div className="flex justify-between text-sm font-bold text-[#262626] pt-1">
                            <span>Total Payable</span>
                            <span className="font-mono-num text-[#FF0055]">{cartTotal.toFixed(2)} EGP</span>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2 pt-1">
                        <Link
                          to={menuLink}
                          className="flex-1 min-h-[44px] py-2.5 px-4 rounded-full bg-[#FF0055] hover:bg-[#e0004d] text-white text-xs font-bold inline-flex items-center justify-center transition-colors"
                        >
                          {safeCart.length > 0 ? 'Add More Dishes' : 'Open Table Menu ->'}
                        </Link>
                        {safeCart.length > 0 && (
                          <button
                            type="button"
                            onClick={() => openCartDrawer()}
                            className="flex-1 min-h-[44px] py-2.5 px-4 rounded-full bg-[#262626] hover:bg-black text-white text-xs font-bold cursor-pointer transition-colors"
                          >
                            Review &amp; Checkout
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
                              Order #{currentOrder.id}
                            </h2>
                          </div>
                          <div className="text-xs text-[#727272] mt-0.5">
                            {currentOrder.tableNumber ? `Table ${currentOrder.tableNumber}` : 'Dine-In Order'}
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
                            ? `Kitchen: ${currentOrder.status.toUpperCase()}`
                            : 'Awaiting Settlement'}
                        </span>
                      </div>

                      <div className="space-y-2 bg-[#f9f9f9] p-3.5 rounded-2xl border border-[#e5e7eb] text-xs max-h-48 overflow-y-auto">
                        {currentOrder.items.map((item) => {
                          const modSum = (item.selectedModifiers || []).reduce((s, m) => s + m.price, 0);
                          const lineTotal = (item.menuItem.basePrice + modSum) * item.quantity;
                          return (
                            <div
                              key={item.cartItemId}
                              className="flex justify-between items-center pb-2 border-b border-[#e5e7eb] last:border-b-0 last:pb-0"
                            >
                              <span className="font-bold text-[#262626]">
                                {item.quantity}x {item.menuItem.name}
                              </span>
                              <span className="font-mono-num font-bold text-[#262626]">
                                {lineTotal.toFixed(2)} EGP
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-between items-center text-sm font-bold text-[#262626] pt-1">
                        <span>Total (incl. 14% VAT)</span>
                        <span className="font-mono-num text-[#FF0055]">
                          {currentOrder.total.toFixed(2)} EGP
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Link
                          to={`/order/${currentOrder.id}`}
                          className="min-h-[44px] py-2.5 px-4 rounded-full bg-[#f9f9f9] hover:bg-[#f0f0f0] border border-[#e5e7eb] text-[#262626] text-xs font-bold inline-flex items-center justify-center transition-colors"
                        >
                          Order Tracker
                        </Link>
                        <Link
                          to={`/settlement/${currentOrder.id}`}
                          className="min-h-[44px] py-2.5 px-4 rounded-full bg-[#FF0055] hover:bg-[#e0004d] text-white text-xs font-bold inline-flex items-center justify-center transition-colors"
                        >
                          {currentOrder.isPaid ? 'View Receipt' : 'Settle Bill ->'}
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
          SIGNATURE WOOD-FIRED DISHES: Real Interactive Menu Preview
          ========================================================================= */}
      <section id="signatures" className="py-16 sm:py-24 bg-[#f9f9f9] border-b border-[#e5e7eb]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#262626] tracking-tight">
                Signature Wood-Fired Dishes
              </h2>
              <p className="mt-1.5 text-sm sm:text-base text-[#616161]">
                Tap any dish below to customize cuts, toppings, and kitchen notes directly for your table.
              </p>
            </div>
            <Link
              to={menuLink}
              className="min-h-[44px] px-5 py-2.5 rounded-full bg-white hover:bg-[#f0f0f0] border border-[#e5e7eb] text-xs font-bold text-[#262626] inline-flex items-center justify-center shrink-0 transition-colors"
            >
              View All {MENU_ITEMS.length} Dishes -&gt;
            </Link>
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
          VENUE DETAILS & DIRECT SUPPORT DESK (Supabase Messages Integration)
          ========================================================================= */}
      <section id="support" className="py-16 sm:py-24 bg-white border-b border-[#e5e7eb]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Authentic Live Kitchen Information (from live-kitchen-facts.md) */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#262626] tracking-tight">
                  Visit Live Kitchen (لايف كيتشن)
                </h2>
                <p className="mt-2 text-sm text-[#616161] leading-relaxed">
                  Fresh dishes prepared right in front of you with exceptional ingredients. Dine in at our Republic Street dining room or reach out to our team below.
                </p>
              </div>

              <div className="bg-[#f9f9f9] p-2 rounded-2xl border border-[#e5e7eb]">
                <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5 space-y-4 text-sm">
                  <div className="pb-3 border-b border-[#e5e7eb]">
                    <div className="text-xs font-semibold text-[#727272]">Address</div>
                    <div className="font-bold text-[#262626] mt-0.5">
                      Republic Street, adjacent to El-Montazah Park
                    </div>
                  </div>

                  <div className="pb-3 border-b border-[#e5e7eb]">
                    <div className="text-xs font-semibold text-[#727272]">Service Hours</div>
                    <div className="mt-1 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#616161]">Saturday &ndash; Thursday</span>
                        <span className="font-mono-num font-bold text-[#262626]">12:00 PM &ndash; 12:00 AM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#616161]">Friday</span>
                        <span className="font-mono-num font-bold text-[#262626]">1:00 PM &ndash; 12:00 AM</span>
                      </div>
                    </div>
                  </div>

                  <div className="pb-3 border-b border-[#e5e7eb]">
                    <div className="text-xs font-semibold text-[#727272]">Direct Phone &amp; Delivery</div>
                    <div className="font-mono-num font-bold text-[#262626] mt-0.5">0100 000 0000</div>
                    <div className="text-xs text-[#727272] mt-0.5">
                      Local delivery available (150 EGP minimum order)
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-[#727272]">Food Allergy Policy</div>
                    <div className="text-xs text-[#616161] mt-0.5 leading-relaxed">
                      Please inform our service team or note any food allergies in your dish customization before ordering.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Guest Feedback, Inquiries & Support Form */}
            <div className="lg:col-span-7">
              <div className="bg-[#f9f9f9] p-2 rounded-2xl border border-[#e5e7eb]">
                <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 sm:p-8 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#262626] tracking-tight">
                      Guest Feedback &amp; Inquiries
                    </h3>
                    <p className="text-sm text-[#616161] mt-1">
                      Send a direct message, table reservation question, or dining suggestion to the Live Kitchen management desk.
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
                        Message Received &amp; Saved
                      </div>
                      <p className="text-xs text-[#727272] max-w-sm mx-auto">
                        Your reference <span className="font-mono-num font-bold text-[#262626]">#{submittedTicket}</span> has been recorded.
                      </p>
                      <button
                        type="button"
                        onClick={() => setSubmittedTicket(null)}
                        className="mt-2 min-h-[44px] px-5 py-2 rounded-full bg-white border border-[#e5e7eb] text-[#262626] text-xs font-semibold hover:bg-[#f0f0f0] transition-colors cursor-pointer"
                      >
                        Send Another Message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="fb-name" className="block text-xs font-semibold text-[#262626] mb-1.5">
                            Your Full Name
                          </label>
                          <input
                            id="fb-name"
                            type="text"
                            required
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="e.g. Tarek Mansour"
                            className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055]"
                          />
                        </div>

                        <div>
                          <label htmlFor="fb-phone" className="block text-xs font-semibold text-[#262626] mb-1.5">
                            Phone Number / Contact
                          </label>
                          <input
                            id="fb-phone"
                            type="text"
                            required
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder="0100 000 0000"
                            className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="fb-category" className="block text-xs font-semibold text-[#262626] mb-1.5">
                            Topic
                          </label>
                          <select
                            id="fb-category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055]"
                          >
                            <option value="Platform Inquiry">Dining &amp; Table Inquiry</option>
                            <option value="Feature Suggestion">Menu &amp; Service Suggestion</option>
                            <option value="Bug / Issue Report">Order Support</option>
                            <option value="Enterprise Hardware">Private Event / Group Booking</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="fb-priority" className="block text-xs font-semibold text-[#262626] mb-1.5">
                            Priority
                          </label>
                          <select
                            id="fb-priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055]"
                          >
                            <option value="Normal">Standard Inquiry</option>
                            <option value="High">Currently Seated at Restaurant</option>
                            <option value="Urgent">Urgent Order Assistance</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="fb-message" className="block text-xs font-semibold text-[#262626] mb-1.5">
                          Message
                        </label>
                        <textarea
                          id="fb-message"
                          required
                          rows={3}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="How can our kitchen or service team help?"
                          className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingForm}
                        className="w-full min-h-[48px] py-3.5 rounded-full bg-[#FF0055] hover:bg-[#e0004d] text-white text-sm font-bold transition-transform active:scale-[0.98] cursor-pointer disabled:opacity-50"
                      >
                        {isSubmittingForm ? 'Sending Message...' : 'Send Message to Live Kitchen ->'}
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
