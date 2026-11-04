import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { DirectionalArrow } from '../ui/DirectionalArrow';
import { useAppStore } from '../../store/useAppStore';
import { FlameLinkLogo } from '../ui/FlameLinkLogo';
import { useTranslation } from '../../i18n';

const RESTAURANT_TABLES = ['T-01', 'T-02', 'T-03', 'T-04', 'T-05', 'T-06', 'T-08', 'T-12'];

export const UnifiedNavbar: React.FC = () => {
  const location = useLocation();
  const { t, lang, toggleLang } = useTranslation();

  const activeTable = useAppStore((state) => state.activeTable);
  const activeTablePin = useAppStore((state) => state.activeTablePin);
  const tableSessions = useAppStore((state) => state.tableSessions);
  const setActiveTable = useAppStore((state) => state.setActiveTable);
  const openPinModal = useAppStore((state) => state.openPinModal);
  const orders = useAppStore((state) => state.orders);
  const cart = useAppStore((state) => state.cart);
  const openCartDrawer = useAppStore((state) => state.openCartDrawer);
  const userAccount = useAppStore((state) => state.userAccount);
  const openAccountModal = useAppStore((state) => state.openAccountModal);
  const showToast = useAppStore((state) => state.showToast);

  const [tableDropdownOpen, setTableDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setTableDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSwitch = () => {
    const nextLang = lang === 'en' ? 'eg' : 'en';
    toggleLang();
    showToast(
      nextLang === 'eg'
        ? 'تم التبديل إلى اللغة العربية (المصرية)'
        : 'Language switched to English'
    );
  };

  const tableParam = activeTable ? `?table=${activeTable}` : '';
  const activeOrders = orders.filter((o) => o.status !== 'voided');
  const currentTicket = activeTable
    ? activeOrders.find((o) => o.tableNumber === activeTable) || activeOrders[0]
    : activeOrders[0];

  const trackerTarget = currentTicket ? `/order/${currentTicket.id}${tableParam}` : `/tracker${tableParam}`;
  const settlementTarget = currentTicket ? `/settlement/${currentTicket.id}${tableParam}` : `/settlement${tableParam}`;

  const isKds = location.pathname.startsWith('/kds');
  const isCashier = location.pathname.startsWith('/cashier');
  const isStand = location.pathname.startsWith('/stand');
  const isOperationsView = isKds || isCashier || isStand;

  const totalCartItems = (cart || []).reduce((sum, item) => sum + (item?.quantity || 1), 0);
  const cartSubtotal = (cart || []).reduce((sum, item) => {
    const modTotal = (item?.selectedModifiers || []).reduce((mSum, m) => mSum + (m?.price || 0), 0);
    return sum + ((item?.menuItem?.basePrice || 0) + modTotal) * (item?.quantity || 1);
  }, 0);

  const currentSession = activeTable ? tableSessions[activeTable] : null;
  const sessionPin = activeTablePin || currentSession?.pin;

  // Operations Portal Navigation (Strictly ONE top bar on /kds, /cashier, /stand — zero duplicate headers)
  const operationsNav = [
    { label: t('nav.kitchenPass'), to: '/kds', pathMatch: (p: string) => p.startsWith('/kds') },
    { label: t('nav.cashierPos'), to: '/cashier', pathMatch: (p: string) => p.startsWith('/cashier') },
    { label: t('nav.tableStand'), to: '/stand', pathMatch: (p: string) => p.startsWith('/stand') },
  ];

  if (isOperationsView) {
    return (
      <header className="no-print sticky top-0 z-40 bg-white border-b border-[#e5e7eb] select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 min-h-[44px]">
              <FlameLinkLogo size="md" />
            </Link>
            <span className="hidden sm:inline-block h-4 w-[1px] bg-[#e5e7eb]" />
            <div className="flex items-center gap-1 bg-[#f9f9f9] p-1 rounded-full border border-[#e5e7eb]">
              {operationsNav.map((op) => {
                const active = op.pathMatch(location.pathname);
                return (
                  <Link
                    key={op.to}
                    to={op.to}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 ${
                      active
                        ? 'bg-[#262626] text-white font-bold'
                        : 'text-[#727272] hover:text-[#262626]'
                    }`}
                  >
                    {op.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLanguageSwitch}
              aria-label={t('common.switchLanguageLabel')}
              className="min-h-[40px] px-3.5 py-1.5 rounded-full border border-[#e5e7eb] bg-[#f9f9f9] hover:bg-[#f0f0f0] text-[#262626] text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#FF0055]" />
              <span>{t('common.switchLanguage')}</span>
            </button>

            <Link
              to={`/menu${tableParam}`}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#f9f9f9] hover:bg-[#f0f0f0] border border-[#e5e7eb] text-[#262626] text-xs font-semibold transition-colors shrink-0"
            >
              <span>{t('nav.liveMenu')}</span>
              <DirectionalArrow className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>
    );
  }

  // Consumer Navigation: Only shows Order Status & Bill when an order actually exists or user is viewing those routes
  const showOrderLinks =
    Boolean(currentTicket) ||
    location.pathname.startsWith('/tracker') ||
    location.pathname.startsWith('/order') ||
    location.pathname.startsWith('/settlement');

  const showCompanionLink =
    Boolean(activeTable && currentSession && currentSession.members.length > 1) ||
    location.pathname.startsWith('/companion') ||
    location.pathname.startsWith('/guest-order');

  const getTicketStageBadge = (status: string) => {
    if (lang !== 'eg') return status;
    const map: Record<string, string> = {
      received: 'مستلم',
      cooking: 'يتحضر',
      ready: 'جاهز',
      served: 'تقدّم',
    };
    return map[status] || status;
  };

  const customerNav = [
    { label: t('nav.home'), to: '/', pathMatch: (p: string) => p === '/' },
    { label: t('nav.menu'), to: `/menu${tableParam}`, pathMatch: (p: string) => p.startsWith('/menu') },
    ...(showCompanionLink
      ? [
          {
            label: t('nav.companionJoin'),
            to: `/companion${tableParam}`,
            pathMatch: (p: string) => p.startsWith('/companion') || p.startsWith('/guest-order'),
          },
        ]
      : []),
    ...(showOrderLinks
      ? [
          {
            label: t('nav.orderTracker'),
            to: trackerTarget,
            badge: currentTicket
              ? currentTicket.paymentStatus === 'verified_paid'
                ? getTicketStageBadge(currentTicket.status)
                : t('common.unpaid')
              : undefined,
            pathMatch: (p: string) => p.startsWith('/tracker') || p.startsWith('/order'),
          },
          {
            label: t('nav.splitSettle'),
            to: settlementTarget,
            badge:
              currentTicket && !currentTicket.isPaid
                ? `${currentTicket.total.toFixed(0)} ${t('common.egp')}`
                : undefined,
            pathMatch: (p: string) => p.startsWith('/settlement'),
          },
        ]
      : []),
  ];

  const handleSelectTable = (tbl: string) => {
    setActiveTable(tbl);
    setTableDropdownOpen(false);
  };

  const handleClearTable = () => {
    setActiveTable(null);
    setTableDropdownOpen(false);
  };

  return (
    <header className="no-print sticky top-0 z-40 bg-white border-b border-[#e5e7eb] select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Start: Single Brand Identity */}
          <Link to="/" className="flex items-center gap-2.5 min-h-[44px] shrink-0">
            <FlameLinkLogo size="md" />
          </Link>

          {/* Center: Clean Contextual Links */}
          <nav className="hidden md:flex items-center gap-1" aria-label={t('nav.navigationMenu')}>
            {customerNav.map((item) => {
              const isActive = item.pathMatch(location.pathname);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`min-h-[40px] px-4 py-2 rounded-full text-[13px] transition-colors flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#f9f9f9] text-[#262626] font-bold border border-[#e5e7eb]'
                      : 'text-[#727272] hover:text-[#262626] font-medium'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] tabular-nums font-bold uppercase ${
                        isActive
                          ? 'bg-[#FF0055] text-white'
                          : 'bg-[#fff0f3] text-[#FF0055] border border-[#ffd1dc]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* End: Language Switcher, Table Check-In, Guest Profile, and Live Cart */}
          <div className="flex items-center gap-2">
            {/* Language Switcher Pill */}
            <button
              type="button"
              onClick={handleLanguageSwitch}
              aria-label={t('common.switchLanguageLabel')}
              className="min-h-[40px] px-3 py-1.5 rounded-full border border-[#e5e7eb] bg-[#f9f9f9] hover:bg-[#f0f0f0] text-[#262626] text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Globe className="w-3.5 h-3.5 text-[#FF0055]" />
              <span>{t('common.switchLanguage')}</span>
            </button>

            {/* Table Selector */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setTableDropdownOpen(!tableDropdownOpen)}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTable
                    ? 'bg-[#fff0f3] text-[#FF0055] border-[#ffd1dc] font-bold'
                    : 'bg-[#f9f9f9] text-[#262626] border-[#e5e7eb] hover:bg-[#f0f0f0]'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeTable ? 'bg-[#FF0055]' : 'bg-[#949494]'
                  }`}
                />
                <span>
                  {activeTable ? t('nav.tableNumber', { table: activeTable }) : t('nav.selectTable')}
                </span>
                {activeTable && sessionPin && (
                  <span className="hidden sm:inline tabular-nums text-[11px] px-1.5 py-0.5 rounded-full bg-white border border-[#ffd1dc] text-[#262626]">
                    {t('common.pin')} {sessionPin}
                  </span>
                )}
                <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {tableDropdownOpen && (
                <div className="absolute end-0 mt-2 w-72 rounded-2xl bg-[#f9f9f9] p-1.5 border border-[#e5e7eb] shadow-xl z-50 text-xs select-none">
                  <div className="bg-white rounded-xl border border-[#e5e7eb] p-3.5 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#e5e7eb]">
                      <div className="text-start">
                        <div className="font-bold text-[#262626]">
                          {activeTable ? t('nav.tableNumber', { table: activeTable }) : t('nav.selectTable')}
                        </div>
                        <div className="text-[11px] text-[#727272]">
                          {activeTable && sessionPin
                            ? `${t('common.pin')}: ${sessionPin}`
                            : t('nav.switchTablePrompt')}
                        </div>
                      </div>
                      {activeTable && (
                        <button
                          type="button"
                          onClick={handleClearTable}
                          className="px-2.5 py-1 rounded-full bg-[#f9f9f9] hover:bg-red-50 text-[#727272] hover:text-red-600 border border-[#e5e7eb] text-[11px] font-semibold cursor-pointer transition-colors"
                        >
                          {t('common.clear')}
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      {RESTAURANT_TABLES.map((tbl) => (
                        <button
                          key={tbl}
                          type="button"
                          onClick={() => handleSelectTable(tbl)}
                          className={`min-h-[38px] p-2 rounded-lg text-center font-mono-num font-bold transition-colors cursor-pointer ${
                            activeTable === tbl
                              ? 'bg-[#FF0055] text-white'
                              : 'bg-[#f9f9f9] text-[#262626] hover:bg-[#e5e7eb] border border-[#e5e7eb]'
                          }`}
                        >
                          {tbl}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-[#e5e7eb]">
                      <button
                        type="button"
                        onClick={() => {
                          setTableDropdownOpen(false);
                          openPinModal(activeTable || 'T-04');
                        }}
                        className="w-full min-h-[38px] py-2 px-3 rounded-full bg-[#f9f9f9] hover:bg-[#f0f0f0] border border-[#e5e7eb] text-[#262626] font-semibold text-xs cursor-pointer transition-colors text-center"
                      >
                        {t('nav.joinCompanionWithPin')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Guest Profile / Sign In */}
            <button
              type="button"
              onClick={() => openAccountModal()}
              className="hidden sm:inline-flex min-h-[40px] px-3.5 py-1.5 rounded-full border border-[#e5e7eb] bg-white hover:bg-[#f9f9f9] text-xs font-medium text-[#262626] items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span className="max-w-[110px] truncate">
                {userAccount ? userAccount.fullName.split(' ')[0] : t('nav.signIn')}
              </span>
            </button>

            {/* Live Cart Button (Only visible when cart has dishes) */}
            {totalCartItems > 0 && (
              <button
                type="button"
                onClick={() => openCartDrawer()}
                className="min-h-[40px] inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF0055] hover:bg-[#e0004d] text-white text-xs font-bold transition-transform active:scale-95 cursor-pointer"
              >
                <span className="px-1.5 py-0.5 rounded-full bg-white text-[#FF0055] tabular-nums text-[11px] font-bold">
                  {totalCartItems}
                </span>
                <span className="tabular-nums">
                  {cartSubtotal.toFixed(0)} {t('common.egp')}
                </span>
              </button>
            )}

            {/* Mobile Menu Button (< 768px) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden min-h-[40px] min-w-[40px] p-2 rounded-full border border-[#e5e7eb] bg-[#f9f9f9] text-[#262626] flex items-center justify-center cursor-pointer"
              aria-label={mobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            >
              {mobileMenuOpen ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Drawer (< 768px) */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 pt-3 border-t border-[#e5e7eb] space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {customerNav.map((item) => {
                const isActive = item.pathMatch(location.pathname);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`min-h-[44px] px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between border ${
                      isActive
                        ? 'bg-[#fff0f3] text-[#FF0055] border-[#ffd1dc]'
                        : 'bg-[#f9f9f9] text-[#262626] border-[#e5e7eb]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-white text-[#FF0055] tabular-nums text-[10px]">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#e5e7eb] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAccountModal();
                }}
                className="flex-1 min-h-[44px] px-4 py-2 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] text-xs font-bold text-[#262626] text-center cursor-pointer"
              >
                {userAccount ? `${t('nav.myAccount')}: ${userAccount.fullName}` : t('nav.signIn')}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
