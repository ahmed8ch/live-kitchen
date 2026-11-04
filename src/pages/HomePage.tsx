import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  Users,
  Package,
  Receipt,
  ChefHat,
  Building,
  QrCode,
  MapPin,
  Clock,
  Phone,
} from 'lucide-react';
import { DirectionalArrow } from '../components/ui/DirectionalArrow';
import { useAppStore } from '../store/useAppStore';
import { MENU_ITEMS } from '../domain/menuData';
import { MenuCategory, MenuItem } from '../types/domain';
import { DishCard } from '../components/menu/DishCard';
import { DishModal } from '../components/menu/DishModal';
import { FloatingCartBar } from '../components/cart/FloatingCartBar';
import { CartDrawer } from '../components/cart/CartDrawer';
import { useTranslation } from '../i18n';

export const HomePage: React.FC = () => {
  const { t, lang } = useTranslation();

  const activeTable = useAppStore((state) => state.activeTable);
  const orders = useAppStore((state) => state.orders);
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

  const tableParam = activeTable ? `?table=${activeTable}` : '';
  const menuLink = `/menu${tableParam}`;
  const activeOrders = orders.filter((o) => o.status !== 'voided');
  const currentOrder = activeTable
    ? activeOrders.find((o) => o.tableNumber === activeTable) || activeOrders[0]
    : activeOrders[0];

  const trackerLink = currentOrder ? `/order/${currentOrder.id}${tableParam}` : `/tracker${tableParam}`;
  const settlementLink = currentOrder ? `/settlement/${currentOrder.id}${tableParam}` : `/settlement${tableParam}`;

  const defaultFeatured = [
    MENU_ITEMS[0],
    MENU_ITEMS[1],
    MENU_ITEMS[4],
    MENU_ITEMS[5],
    MENU_ITEMS[7],
    MENU_ITEMS[10],
    MENU_ITEMS[11],
    MENU_ITEMS[12],
  ].filter(Boolean);

  const featuredDishes =
    signatureCategory === 'all'
      ? defaultFeatured
      : MENU_ITEMS.filter((item) => item.category === signatureCategory).slice(0, 8);

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
    <div className="flex-1 w-full bg-white text-[#262626] pb-20" data-ui-container="home-overview">
      {/* =========================================================================
          SECTION 1 (#hero): Full-Viewport Hero & Instant Workspace Hub
          ========================================================================= */}
      <section id="hero" className="border-b border-[#e5e7eb] bg-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Start Column: Direct Headline & Primary CTA */}
            <div className="lg:col-span-5 space-y-5">
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-[#262626] leading-[1.14]">
                {t('home.hero.headline')}
              </h1>

              <p className="text-sm sm:text-base text-[#616161] leading-relaxed">
                {t('home.hero.description')}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to={menuLink}
                  className="min-h-[46px] inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full bg-[#FF0055] hover:bg-[#e0004d] text-white text-sm font-bold transition-transform active:scale-[0.98] cursor-pointer"
                >
                  <span>
                    {activeTable
                      ? t('home.hero.openTableMenu', { table: activeTable })
                      : t('home.hero.browseFullMenu')}
                  </span>
                  <DirectionalArrow className="w-4 h-4" />
                </Link>

                <Link
                  to={settlementLink}
                  className="min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#f9f9f9] hover:bg-[#f0f0f0] border border-[#e5e7eb] text-[#262626] text-sm font-semibold transition-transform active:scale-[0.98]"
                >
                  <span>{t('nav.splitSettle')}</span>
                </Link>
              </div>
            </div>

            {/* End Column: Complete 6-Card Workspace & Operations Hub (Dine-In + KDS + Cashier + Stand) */}
            <div className="lg:col-span-7">
              <div className="bg-[#f9f9f9] p-2 rounded-2xl border border-[#e5e7eb]">
                <div className="bg-white rounded-2xl border border-[#e5e7eb] p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#e5e7eb]">
                    <span className="text-xs font-bold text-[#262626]">
                      {lang === 'eg' ? 'الوصول السريع وبوابات التشغيل' : 'Quick Access & Workstations'}
                    </span>
                    <Link
                      to="/stand"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f9f9f9] hover:bg-[#fff0f3] border border-[#e5e7eb] hover:border-[#ffd1dc] text-[11px] font-semibold text-[#262626] hover:text-[#FF0055] transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5 text-[#FF0055]" />
                      <span>{t('nav.tableStand')}</span>
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <Link
                      to={menuLink}
                      className="p-3.5 rounded-2xl bg-[#f9f9f9] hover:bg-[#fff0f3] border border-[#e5e7eb] hover:border-[#ffd1dc] transition-colors group flex flex-col justify-between min-h-[88px]"
                    >
                      <div className="flex items-center justify-between">
                        <UtensilsCrossed className="w-4 h-4 text-[#FF0055]" />
                        <DirectionalArrow className="w-3.5 h-3.5 text-[#727272] group-hover:text-[#FF0055]" />
                      </div>
                      <div className="mt-2">
                        <div className="text-xs font-bold text-[#262626]">{t('nav.menu')}</div>
                        <div className="text-[11px] text-[#727272] tabular-nums">
                          {MENU_ITEMS.length} {t('common.dishes')}
                        </div>
                      </div>
                    </Link>

                    <Link
                      to={`/companion${tableParam}`}
                      className="p-3.5 rounded-2xl bg-[#f9f9f9] hover:bg-[#fff0f3] border border-[#e5e7eb] hover:border-[#ffd1dc] transition-colors group flex flex-col justify-between min-h-[88px]"
                    >
                      <div className="flex items-center justify-between">
                        <Users className="w-4 h-4 text-[#FF0055]" />
                        <DirectionalArrow className="w-3.5 h-3.5 text-[#727272] group-hover:text-[#FF0055]" />
                      </div>
                      <div className="mt-2">
                        <div className="text-xs font-bold text-[#262626]">{t('nav.companionJoin')}</div>
                        <div className="text-[11px] text-[#727272]">
                          {lang === 'eg' ? 'طلب مشترك' : 'Shared Cart'}
                        </div>
                      </div>
                    </Link>

                    <Link
                      to={trackerLink}
                      className="p-3.5 rounded-2xl bg-[#f9f9f9] hover:bg-[#fff0f3] border border-[#e5e7eb] hover:border-[#ffd1dc] transition-colors group flex flex-col justify-between min-h-[88px]"
                    >
                      <div className="flex items-center justify-between">
                        <Package className="w-4 h-4 text-[#FF0055]" />
                        <DirectionalArrow className="w-3.5 h-3.5 text-[#727272] group-hover:text-[#FF0055]" />
                      </div>
                      <div className="mt-2">
                        <div className="text-xs font-bold text-[#262626]">{t('nav.orderTracker')}</div>
                        <div className="text-[11px] text-[#727272] tabular-nums">
                          {currentOrder ? `#${currentOrder.id}` : (lang === 'eg' ? 'متابعة فورية' : 'Live Status')}
                        </div>
                      </div>
                    </Link>

                    <Link
                      to={settlementLink}
                      className="p-3.5 rounded-2xl bg-[#f9f9f9] hover:bg-[#fff0f3] border border-[#e5e7eb] hover:border-[#ffd1dc] transition-colors group flex flex-col justify-between min-h-[88px]"
                    >
                      <div className="flex items-center justify-between">
                        <Receipt className="w-4 h-4 text-[#FF0055]" />
                        <DirectionalArrow className="w-3.5 h-3.5 text-[#727272] group-hover:text-[#FF0055]" />
                      </div>
                      <div className="mt-2">
                        <div className="text-xs font-bold text-[#262626]">{t('nav.splitSettle')}</div>
                        <div className="text-[11px] text-[#727272] tabular-nums">
                          {currentOrder ? `${currentOrder.total.toFixed(0)} ${t('common.egp')}` : (lang === 'eg' ? 'تقسيم مرن' : 'Split Check')}
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/kds"
                      className="p-3.5 rounded-2xl bg-[#fff0f3] hover:bg-[#ffe0e8] border border-[#ffd1dc] transition-colors group flex flex-col justify-between min-h-[88px]"
                    >
                      <div className="flex items-center justify-between">
                        <ChefHat className="w-4 h-4 text-[#FF0055]" />
                        <span className="px-1.5 py-0.5 rounded-full bg-white text-[#FF0055] tabular-nums text-[10px] font-bold">
                          KDS
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="text-xs font-bold text-[#262626]">{t('nav.kitchenPass')}</div>
                        <div className="text-[11px] text-[#727272]">
                          {lang === 'eg' ? 'شاشة الطهاة' : 'Kitchen Display'}
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/cashier"
                      className="p-3.5 rounded-2xl bg-[#fff0f3] hover:bg-[#ffe0e8] border border-[#ffd1dc] transition-colors group flex flex-col justify-between min-h-[88px]"
                    >
                      <div className="flex items-center justify-between">
                        <Building className="w-4 h-4 text-[#FF0055]" />
                        <span className="px-1.5 py-0.5 rounded-full bg-white text-[#FF0055] tabular-nums text-[10px] font-bold">
                          POS
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="text-xs font-bold text-[#262626]">{t('nav.cashierPos')}</div>
                        <div className="text-[11px] text-[#727272]">
                          {lang === 'eg' ? 'تحصيل ومراجعة' : 'Front Register'}
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2 (#signatures): Full-Width 4-Column Interactive Menu Grid
          ========================================================================= */}
      <section id="signatures" className="py-10 sm:py-14 bg-white border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <h2 className="text-xl sm:text-2xl font-bold text-[#262626] tracking-tight">
              {t('home.signatures.title')}
            </h2>

            <Link
              to={menuLink}
              className="min-h-[40px] px-4 py-2 rounded-full bg-[#f9f9f9] hover:bg-[#f0f0f0] border border-[#e5e7eb] text-xs font-bold text-[#262626] inline-flex items-center justify-center gap-1.5 shrink-0 transition-colors"
            >
              <span>{t('home.signatures.viewAllDishes', { count: MENU_ITEMS.length })}</span>
              <DirectionalArrow className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Interactive Category Quick-Switch Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-5 scrollbar-none">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
          SECTION 3 (#support): Compact Venue Info & Direct Message Form (Supabase)
          ========================================================================= */}
      <div id="support" className="py-10 sm:py-14 bg-[#f9f9f9]">
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Start Column: Concise Hours & Location */}
            <div className="lg:col-span-4 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-[#262626] tracking-tight">
                {t('home.support.visitTitle')}
              </h2>

              <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5 space-y-4 text-sm">
                <div className="pb-3 border-b border-[#e5e7eb] flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#FF0055] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-[#727272]">{t('home.support.addressLabel')}</div>
                    <div className="font-bold text-[#262626] mt-0.5 text-xs sm:text-sm">
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

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#FF0055] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-[#727272]">{t('home.support.phoneDeliveryLabel')}</div>
                    <div className="font-mono-num font-bold text-[#262626] mt-0.5">{t('home.support.phoneNumber')}</div>
                    <div className="text-xs text-[#727272] mt-0.5">
                      {t('home.support.deliveryNote')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* End Column: Direct Support Form */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5 sm:p-6 space-y-4">
                <h3 className="text-lg font-bold text-[#262626] tracking-tight">
                  {t('home.support.formTitle')}
                </h3>

                {submittedTicket ? (
                  <div className="p-5 rounded-2xl bg-[#f9f9f9] border border-[#e5e7eb] text-center space-y-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#fff0f3] text-[#FF0055] flex items-center justify-center mx-auto">
                      <svg className="w-4 h-4 text-[#FF0055]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                      className="min-h-[40px] px-4 py-2 rounded-full bg-white border border-[#e5e7eb] text-[#262626] text-xs font-semibold hover:bg-[#f0f0f0] transition-colors cursor-pointer"
                    >
                      {t('home.support.sendAnotherBtn')}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label htmlFor="fb-name" className="block text-xs font-semibold text-[#262626] mb-1">
                          {t('home.support.fullNameLabel')}
                        </label>
                        <input
                          id="fb-name"
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder={t('home.support.fullNamePlaceholder')}
                          className="w-full min-h-[42px] px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055]"
                        />
                      </div>

                      <div>
                        <label htmlFor="fb-phone" className="block text-xs font-semibold text-[#262626] mb-1">
                          {t('home.support.phoneLabel')}
                        </label>
                        <input
                          id="fb-phone"
                          type="text"
                          required
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder={t('home.support.phonePlaceholder')}
                          className="w-full min-h-[42px] px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055]"
                        />
                      </div>

                      <div>
                        <label htmlFor="fb-category" className="block text-xs font-semibold text-[#262626] mb-1">
                          {t('home.support.topicLabel')}
                        </label>
                        <select
                          id="fb-category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full min-h-[42px] px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055]"
                        >
                          <option value="Platform Inquiry">{t('home.support.topicInquiry')}</option>
                          <option value="Feature Suggestion">{t('home.support.topicSuggestion')}</option>
                          <option value="Bug / Issue Report">{t('home.support.topicOrderSupport')}</option>
                          <option value="Enterprise Hardware">{t('home.support.topicGroupBooking')}</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="fb-priority" className="block text-xs font-semibold text-[#262626] mb-1">
                          {t('home.support.priorityLabel')}
                        </label>
                        <select
                          id="fb-priority"
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          className="w-full min-h-[42px] px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055]"
                        >
                          <option value="Normal">{t('home.support.priorityNormal')}</option>
                          <option value="High">{t('home.support.prioritySeated')}</option>
                          <option value="Urgent">{t('home.support.priorityUrgent')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                      <div className="flex-1">
                        <label htmlFor="fb-message" className="block text-xs font-semibold text-[#262626] mb-1">
                          {t('home.support.messageLabel')}
                        </label>
                        <textarea
                          id="fb-message"
                          rows={2}
                          required
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={t('home.support.messagePlaceholder')}
                          className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingForm}
                        className="sm:w-56 min-h-[44px] py-2.5 px-5 rounded-full bg-[#FF0055] hover:bg-[#e0004d] text-white text-xs sm:text-sm font-bold transition-transform active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 shrink-0"
                      >
                        <span>
                          {isSubmittingForm ? t('home.support.sendingBtn') : t('home.support.submitBtn')}
                        </span>
                        <DirectionalArrow className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <FloatingCartBar />
      <CartDrawer />
      <DishModal dish={selectedDish} onClose={() => setSelectedDish(null)} />
    </div>
  );
};
