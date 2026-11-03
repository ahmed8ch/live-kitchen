import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { FlameLinkLogo } from '../ui/FlameLinkLogo';

const RESTAURANT_TABLES = ['T-01', 'T-02', 'T-03', 'T-04', 'T-05', 'T-06', 'T-08', 'T-12'];

export const UnifiedNavbar: React.FC = () => {
  const location = useLocation();
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

  // Clean, real-world customer navigation (no back-office clutter in consumer header)
  const customerNav = [
    { label: 'Overview', to: '/', pathMatch: (p: string) => p === '/' },
    { label: 'Menu', to: `/menu${tableParam}`, pathMatch: (p: string) => p.startsWith('/menu') },
    { label: 'Companion Pool', to: `/companion${tableParam}`, pathMatch: (p: string) => p.startsWith('/companion') || p.startsWith('/guest-order') },
    {
      label: 'Order Status',
      to: trackerTarget,
      badge: currentTicket ? (currentTicket.paymentStatus === 'verified_paid' ? currentTicket.status : 'Hold') : undefined,
      pathMatch: (p: string) => p.startsWith('/tracker') || p.startsWith('/order'),
    },
    {
      label: 'Bill & Split',
      to: settlementTarget,
      badge: currentTicket && !currentTicket.isPaid ? `${currentTicket.total.toFixed(0)} EGP` : undefined,
      pathMatch: (p: string) => p.startsWith('/settlement'),
    },
  ];

  // Staff / Operations Workstation Switcher (Only prominent when inside an operations route or mobile menu)
  const operationsNav = [
    { label: 'Kitchen Pass (KDS)', to: '/kds', pathMatch: (p: string) => p.startsWith('/kds') },
    { label: 'Cashier POS', to: '/cashier', pathMatch: (p: string) => p.startsWith('/cashier') },
    { label: 'Table Stand QR', to: '/stand', pathMatch: (p: string) => p.startsWith('/stand') },
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
    <header className="sticky top-0 z-40 bg-white border-b border-[#e5e7eb] select-none">
      {/* Staff Workstation Context Bar (Only shown on /kds, /cashier, /stand) */}
      {isOperationsView && (
        <div className="bg-[#262626] text-white px-4 sm:px-6 py-2 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none">
            <span className="font-bold text-[#FF0055] uppercase tracking-wider shrink-0">
              Operations Portal
            </span>
            <span className="text-[#616161]">|</span>
            <div className="flex items-center gap-1.5">
              {operationsNav.map((op) => {
                const active = op.pathMatch(location.pathname);
                return (
                  <Link
                    key={op.label}
                    to={op.to}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                      active
                        ? 'bg-[#FF0055] text-white font-bold'
                        : 'text-[#d1d5db] hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {op.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <Link
            to={`/menu${tableParam}`}
            className="px-3.5 py-1 rounded-full bg-white text-[#262626] hover:bg-[#f9f9f9] text-xs font-bold transition-colors shrink-0"
          >
            Exit to Dine-In View -&gt;
          </Link>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 min-h-[44px]">
              <FlameLinkLogo size="md" />
            </Link>
            <span className="hidden xl:inline-block text-xs text-[#727272] pl-3 border-l border-[#e5e7eb]">
              Live Kitchen (لايف كيتشن)
            </span>
          </div>

          {/* Center: Clean Editorial Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
            {customerNav.map((item) => {
              const isActive = item.pathMatch(location.pathname);
              return (
                <Link
                  key={item.label}
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

          {/* Right: Real State Controls (Table Session, Account, Cart) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Table Session Selector */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setTableDropdownOpen(!tableDropdownOpen)}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTable
                    ? 'bg-[#fff0f3] text-[#FF0055] border-[#ffd1dc] font-bold'
                    : 'bg-[#f9f9f9] text-[#262626] border-[#e5e7eb] hover:bg-[#f0f0f0]'
                }`}
                title="Select or manage your dining table"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeTable ? 'bg-[#FF0055]' : 'bg-[#949494]'
                  }`}
                />
                <span>
                  {activeTable ? `Table ${activeTable}` : 'Select Table'}
                </span>
                {activeTable && sessionPin && (
                  <span className="hidden sm:inline tabular-nums text-[11px] px-1.5 py-0.5 rounded-full bg-white border border-[#ffd1dc] text-[#262626]">
                    PIN {sessionPin}
                  </span>
                )}
                <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Table Session Popover */}
              {tableDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#f9f9f9] p-1.5 border border-[#e5e7eb] shadow-xl z-50 text-xs select-none">
                  <div className="bg-white rounded-xl border border-[#e5e7eb] p-3.5 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#e5e7eb]">
                      <div>
                        <div className="font-bold text-[#262626]">
                          {activeTable ? `Seated at Table ${activeTable}` : 'Choose Your Dining Table'}
                        </div>
                        <div className="text-[11px] text-[#727272]">
                          {activeTable && sessionPin
                            ? `Share PIN ${sessionPin} with table companions`
                            : 'Select a table number to start ordering'}
                        </div>
                      </div>
                      {activeTable && (
                        <button
                          type="button"
                          onClick={handleClearTable}
                          className="px-2.5 py-1 rounded-full bg-[#f9f9f9] hover:bg-red-50 text-[#727272] hover:text-red-600 border border-[#e5e7eb] text-[11px] font-semibold cursor-pointer transition-colors"
                        >
                          Leave
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

                    <div className="pt-2 border-t border-[#e5e7eb] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTableDropdownOpen(false);
                          openPinModal(activeTable || 'T-04');
                        }}
                        className="w-full min-h-[38px] py-2 px-3 rounded-full bg-[#f9f9f9] hover:bg-[#f0f0f0] border border-[#e5e7eb] text-[#262626] font-semibold text-xs cursor-pointer transition-colors text-center"
                      >
                        Join Table Pool with 4-Digit PIN
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Account / Loyalty Trigger */}
            <button
              type="button"
              onClick={() => openAccountModal()}
              className="hidden sm:inline-flex min-h-[40px] px-3.5 py-1.5 rounded-full border border-[#e5e7eb] bg-[#f9f9f9] hover:bg-[#f0f0f0] text-xs font-semibold text-[#262626] items-center gap-2 cursor-pointer transition-colors"
              title="Diner Profile & 10% Cashback Rewards"
            >
              <span className="w-5 h-5 rounded-full bg-[#262626] text-white text-[10px] font-bold flex items-center justify-center">
                {userAccount ? userAccount.fullName.charAt(0).toUpperCase() : 'G'}
              </span>
              <span className="max-w-[96px] truncate">
                {userAccount ? userAccount.fullName.split(' ')[0] : 'Sign In'}
              </span>
            </button>

            {/* Primary Action: Cart Button (when cart has items) or Dine-In Menu CTA */}
            {totalCartItems > 0 ? (
              <button
                type="button"
                onClick={() => openCartDrawer()}
                className="min-h-[40px] inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF0055] hover:bg-[#e0004d] text-white text-xs font-bold transition-transform active:scale-95 cursor-pointer"
              >
                <span className="px-1.5 py-0.5 rounded-full bg-white text-[#FF0055] tabular-nums text-[11px] font-bold">
                  {totalCartItems}
                </span>
                <span className="hidden sm:inline">Cart</span>
                <span className="tabular-nums">{cartSubtotal.toFixed(0)} EGP</span>
              </button>
            ) : !location.pathname.startsWith('/menu') ? (
              <Link
                to={`/menu${tableParam}`}
                className="hidden sm:inline-flex min-h-[40px] items-center px-4 py-2 rounded-full bg-[#FF0055] text-white text-xs font-bold hover:bg-[#e0004d] active:scale-95 transition-transform"
              >
                Dine-In Menu
              </Link>
            ) : null}

            {/* Mobile Menu Button (< 1024px) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden min-h-[40px] min-w-[40px] p-2 rounded-full border border-[#e5e7eb] bg-[#f9f9f9] text-[#262626] flex items-center justify-center cursor-pointer"
              aria-label="Toggle navigation menu"
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

        {/* Mobile Slide-Down Drawer (< 1024px) */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 pt-3 border-t border-[#e5e7eb] space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {customerNav.map((item) => {
                const isActive = item.pathMatch(location.pathname);
                return (
                  <Link
                    key={item.label}
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
                {userAccount ? `Profile: ${userAccount.fullName}` : 'Guest Sign In (10% Cashback)'}
              </button>
              <Link
                to="/kds"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] px-4 py-2 rounded-full bg-[#262626] text-white text-xs font-bold inline-flex items-center justify-center"
              >
                Staff Portal
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
