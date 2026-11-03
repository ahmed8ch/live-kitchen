import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { FlameLinkLogo } from '../ui/FlameLinkLogo';

const RESTAURANT_TABLES = ['T-01', 'T-02', 'T-03', 'T-04', 'T-05', 'T-06', 'T-08', 'T-12'];

export const UnifiedNavbar: React.FC = () => {
  const location = useLocation();
  const activeTable = useAppStore((state) => state.activeTable);
  const setActiveTable = useAppStore((state) => state.setActiveTable);
  const orders = useAppStore((state) => state.orders);

  const [tableDropdownOpen, setTableDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tableParam = activeTable ? `?table=${activeTable}` : '';
  const trackerTarget = orders.length > 0 ? `/order/${orders[0].id}${tableParam}` : `/tracker${tableParam}`;
  const settlementTarget = orders.length > 0 ? `/settlement/${orders[0].id}${tableParam}` : `/settlement${tableParam}`;

  const isKds = location.pathname.startsWith('/kds');
  const isCashier = location.pathname.startsWith('/cashier');

  // Customer Dine-In Routes
  const customerNav = [
    { label: 'Overview', to: '/', pathMatch: (p: string) => p === '/' },
    { label: 'Menu', to: `/menu${tableParam}`, pathMatch: (p: string) => p.startsWith('/menu') },
    { label: 'Companion Order', to: `/companion${tableParam}`, pathMatch: (p: string) => p.startsWith('/companion') || p.startsWith('/guest-order') },
    { label: 'Order Tracker', to: trackerTarget, pathMatch: (p: string) => p.startsWith('/tracker') || p.startsWith('/order') },
    { label: 'Bill & Split', to: settlementTarget, pathMatch: (p: string) => p.startsWith('/settlement') },
  ];

  // Operations / Staff Routes
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
    <header className="sticky top-0 z-40 bg-white border-b border-[#e5e7eb] select-none shadow-xs">
      {/* Workstation Alert Banner for KDS and Cashier */}
      {(isKds || isCashier) && (
        <div className="bg-[#262626] text-white px-4 py-1.5 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF0055] animate-pulse" />
            <span className="font-bold tracking-wide">
              {isKds ? 'KITCHEN EXPEDITOR PASS (KDS)' : 'CASHIER POS WORKSTATION'}
            </span>
            <span className="text-[#a3a3a3] hidden sm:inline">&middot; Live Kitchen Internal Portal</span>
          </div>

          <Link
            to={`/menu${tableParam}`}
            className="px-3 py-1 rounded-full bg-white text-[#262626] hover:bg-[#f0f0f0] text-[11px] font-bold transition-all"
          >
            Switch to Dine-In View -&gt;
          </Link>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Primary Brand Anchor */}
          <div className="flex items-center gap-6 shrink-0">
            <Link to="/" className="flex items-center gap-2 group min-h-[44px]">
              <FlameLinkLogo size="md" />
            </Link>
          </div>

          {/* Desktop Navigation Groups (>= 1024px) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-medium" aria-label="Global Navigation">
            {/* Dine-In Segment */}
            <div className="flex items-center gap-1 bg-[#f9f9f9] p-1 rounded-full border border-[#e5e7eb]">
              {customerNav.map((item) => {
                const isActive = item.pathMatch(location.pathname);
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={`min-h-[36px] px-3.5 py-1.5 rounded-full transition-all flex items-center ${
                      isActive
                        ? 'bg-white text-[#FF0055] font-bold shadow-xs border border-[#ffd1dc]'
                        : 'text-[#616161] hover:text-[#262626] hover:bg-white/60'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Subtle Divider */}
            <div className="h-6 w-[1px] bg-[#e5e7eb] mx-1" />

            {/* Operations Segment */}
            <div className="flex items-center gap-1 bg-[#f9f9f9] p-1 rounded-full border border-[#e5e7eb]">
              {operationsNav.map((item) => {
                const isActive = item.pathMatch(location.pathname);
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={`min-h-[36px] px-3 py-1.5 rounded-full transition-all flex items-center ${
                      isActive
                        ? 'bg-[#262626] text-white font-bold shadow-xs'
                        : 'text-[#616161] hover:text-[#262626] hover:bg-white/60'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Right Action: Table Switcher & Mobile Trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Table Selector Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setTableDropdownOpen(!tableDropdownOpen)}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTable
                    ? 'bg-[#fff0f3] text-[#FF0055] border-[#ffd1dc] shadow-xs'
                    : 'bg-[#f9f9f9] text-[#616161] border-[#e5e7eb] hover:bg-white'
                }`}
                title="Change or set seated table number"
              >
                <span className="w-2 h-2 rounded-full bg-[#FF0055]" />
                <span>{activeTable ? `Table ${activeTable}` : 'Pick Table'}</span>
                <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Table Picker Dropdown */}
              {tableDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#e5e7eb] shadow-xl p-3 z-50 text-xs select-none">
                  <div className="font-bold text-[#262626] pb-2 border-b border-[#e5e7eb] flex items-center justify-between">
                    <span>Simulate Seated Table</span>
                    {activeTable && (
                      <button
                        onClick={handleClearTable}
                        className="text-[10px] text-[#FF0055] hover:underline cursor-pointer"
                      >
                        Clear Table
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 pt-2">
                    {RESTAURANT_TABLES.map((tbl) => (
                      <button
                        key={tbl}
                        onClick={() => handleSelectTable(tbl)}
                        className={`p-2 rounded-xl text-center font-mono font-bold transition-all cursor-pointer ${
                          activeTable === tbl
                            ? 'bg-[#FF0055] text-white shadow-xs'
                            : 'bg-[#f9f9f9] text-[#262626] hover:bg-[#e5e7eb]'
                        }`}
                      >
                        {tbl.replace('T-', '')}
                      </button>
                    ))}
                  </div>
                  <div className="pt-2 mt-2 border-t border-[#e5e7eb] text-[10px] text-[#727272]">
                    Republic St. Dining Room (8 Tables)
                  </div>
                </div>
              )}
            </div>

            {/* Quick Dine-In Action Button */}
            <Link
              to={`/menu${tableParam}`}
              className="hidden sm:inline-flex min-h-[40px] items-center px-4 py-2 rounded-full bg-[#FF0055] text-white text-xs font-bold btn-crimson-glow shadow-xs hover:bg-[#e0004d] active:scale-95 transition-all"
            >
              Dine-In Menu
            </Link>

            {/* Mobile Navigation Trigger Button (< 1024px) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden min-h-[40px] min-w-[40px] p-2 rounded-xl border border-[#e5e7eb] bg-[#f9f9f9] text-[#262626] flex items-center justify-center cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Menu Drawer (< 1024px) */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 pt-2 border-t border-[#e5e7eb] space-y-4">
            <div>
              <div className="text-[11px] font-bold text-[#727272] uppercase tracking-wider mb-2">
                Dine-In Guest Experience
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {customerNav.map((item) => {
                  const isActive = item.pathMatch(location.pathname);
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between border ${
                        isActive
                          ? 'bg-[#fff0f3] text-[#FF0055] border-[#ffd1dc]'
                          : 'bg-[#f9f9f9] text-[#262626] border-[#e5e7eb]'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FF0055]" />}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold text-[#727272] uppercase tracking-wider mb-2">
                Operations &amp; Back-Office
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {operationsNav.map((item) => {
                  const isActive = item.pathMatch(location.pathname);
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between border ${
                        isActive
                          ? 'bg-[#262626] text-white border-[#262626]'
                          : 'bg-[#f9f9f9] text-[#262626] border-[#e5e7eb]'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FF0055]" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
