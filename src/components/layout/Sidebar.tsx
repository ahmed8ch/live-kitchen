import React, { useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

interface NavItem {
  id: string;
  label: string;
  to: string;
  badge?: string;
  icon: (active: boolean) => React.ReactNode;
}

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const location = useLocation();

  const activeTable = useAppStore((state) => state.activeTable);
  const orders = useAppStore((state) => state.orders);
  const cart = useAppStore((state) => state.cart);
  const openCartDrawer = useAppStore((state) => state.openCartDrawer);

  const trackerTarget = orders.length > 0 ? `/order/${orders[0].id}` : '/order/active';
  const tableParam = activeTable ? `?table=${activeTable}` : '';
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Platform Overview',
      to: '/',
      icon: (active) => (
        <svg className={`w-5 h-5 shrink-0 ${active ? 'text-[#ea580c]' : 'text-[#727272]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      id: 'menu',
      label: 'Dine-In Menu',
      to: `/menu${tableParam}`,
      icon: (active) => (
        <svg className={`w-5 h-5 shrink-0 ${active ? 'text-[#ea580c]' : 'text-[#727272]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2h-3a4 4 0 0 0-4 4v14a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
          <path d="M6 2h3a4 4 0 0 1 4 4v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
        </svg>
      ),
    },
    {
      id: 'tracker',
      label: 'Order Tracker',
      to: `${trackerTarget}${tableParam}`,
      badge: orders.length > 0 && !orders[0].isPaid ? 'Live' : undefined,
      icon: (active) => (
        <svg className={`w-5 h-5 shrink-0 ${active ? 'text-[#ea580c]' : 'text-[#727272]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      id: 'settlement',
      label: 'Table Settlement',
      to: `${trackerTarget}${tableParam}`,
      icon: (active) => (
        <svg className={`w-5 h-5 shrink-0 ${active ? 'text-[#ea580c]' : 'text-[#727272]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
    },
    {
      id: 'kds',
      label: 'Kitchen KDS',
      to: '/kds',
      badge: 'Pass',
      icon: (active) => (
        <svg className={`w-5 h-5 shrink-0 ${active ? 'text-[#ea580c]' : 'text-[#727272]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
    },
    {
      id: 'stand',
      label: 'QR Stand Studio',
      to: '/stand',
      icon: (active) => (
        <svg className={`w-5 h-5 shrink-0 ${active ? 'text-[#ea580c]' : 'text-[#727272]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <path d="M10 3v4M3 10h4M14 10h3M10 14v3M10 21v-3" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Mobile Top Header (Small screens only, completely replaces duplicate nav bar) */}
      <header className="md:hidden h-14 w-full bg-white border-b border-[#e5e7eb] px-4 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#ea580c] flex items-center justify-center text-white shrink-0 shadow-xs">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
            </svg>
          </div>
          <span className="text-[17px] font-extrabold tracking-tight text-[#0f172a]">
            Matbakh<span className="text-[#ea580c]">Link</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {totalCartCount > 0 && (
            <button
              onClick={() => openCartDrawer()}
              className="px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#ea580c] text-[12px] font-bold flex items-center gap-1.5"
            >
              <span>Cart</span>
              <span className="w-5 h-5 rounded-full bg-[#ea580c] text-white flex items-center justify-center text-[10px] font-mono-num">
                {totalCartCount}
              </span>
            </button>
          )}

          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="p-2 rounded-lg text-[#0f172a] hover:bg-[#f9f9f9] border border-[#e5e7eb]"
            aria-label="Toggle navigation"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileDrawerOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Backdrop & Drawer */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className="w-72 bg-white h-full shadow-2xl p-5 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#e5e7eb]">
                <Link
                  to="/"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="inline-flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#ea580c] flex items-center justify-center text-white shrink-0">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
                    </svg>
                  </div>
                  <span className="text-[17px] font-extrabold tracking-tight text-[#0f172a]">
                    Matbakh<span className="text-[#ea580c]">Link</span>
                  </span>
                </Link>

                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#f9f9f9] flex items-center justify-center text-[#727272]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {activeTable && (
                <div className="mt-4 p-2.5 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between">
                  <span className="text-[12px] text-[#727272]">Assigned Seating:</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#ea580c] text-white text-[11px] font-mono-num font-bold">
                    Table {activeTable}
                  </span>
                </div>
              )}

              <nav className="mt-5 space-y-1.5">
                {navItems.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.to}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all ${
                        isActive
                          ? 'bg-orange-50 text-[#ea580c] font-bold border border-orange-200'
                          : 'text-[#0f172a] hover:bg-[#f9f9f9]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      {item.icon(false)}
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#ea580c] text-[10px] font-mono-num font-bold">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#e5e7eb] text-[11px] text-[#727272]">
              MatbakhLink &bull; Digital Dine-In
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sole Left Navigation Shell (NO duplicate top navbar) */}
      <aside
        className={`hidden md:flex flex-col border-r border-[#e5e7eb] bg-white sticky top-0 h-screen transition-all duration-200 z-30 shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Top Brand Lockup Area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#e5e7eb]">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 overflow-hidden group select-none"
            aria-label="MatbakhLink Home"
          >
            <div className="w-9 h-9 rounded-xl bg-[#ea580c] flex items-center justify-center text-white shrink-0 shadow-xs">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
              </svg>
            </div>
            {!isCollapsed && (
              <span className="text-xl font-extrabold tracking-tight text-[#0f172a] whitespace-nowrap">
                Matbakh<span className="text-[#ea580c]">Link</span>
              </span>
            )}
          </Link>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-7 h-7 rounded-lg hover:bg-[#f9f9f9] text-[#727272] hover:text-[#0f172a] flex items-center justify-center transition-colors border border-transparent hover:border-[#e5e7eb] cursor-pointer"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        {/* Table Seating Pill in Sidebar if Seated */}
        {activeTable && (
          <div className="p-3 border-b border-[#e5e7eb] bg-orange-50/50">
            {isCollapsed ? (
              <div
                className="w-full text-center py-1 rounded bg-[#ea580c] text-white text-[11px] font-mono-num font-bold"
                title={`Table ${activeTable}`}
              >
                T{activeTable.replace('T-', '')}
              </div>
            ) : (
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[#727272]">Table:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#ea580c] text-white font-mono-num font-bold">
                  Table {activeTable}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Navigation Items List */}
        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to.split('?')[0]);

            return (
              <NavLink
                key={item.id}
                to={item.to}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all group ${
                  isActive
                    ? 'bg-orange-50 text-[#ea580c] font-bold border border-orange-200/80 shadow-2xs'
                    : 'text-[#727272] hover:text-[#0f172a] hover:bg-[#f9f9f9]'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.icon(isActive)}
                  {!isCollapsed && (
                    <span className="truncate whitespace-nowrap">{item.label}</span>
                  )}
                </div>

                {!isCollapsed && item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono-num font-bold ${
                      isActive
                        ? 'bg-[#ea580c] text-white'
                        : 'bg-[#f9f9f9] border border-[#e5e7eb] text-[#727272]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Cart Trigger & System Status */}
        <div className="p-3 border-t border-[#e5e7eb] bg-[#faf8f5]/40 space-y-2">
          {/* Cart Pill */}
          <button
            onClick={() => openCartDrawer()}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all border cursor-pointer ${
              totalCartCount > 0
                ? 'bg-white border-orange-200 text-[#0f172a] shadow-xs hover:border-[#ea580c]'
                : 'bg-white border-[#e5e7eb] text-[#727272] hover:text-[#0f172a]'
            }`}
            title="View Order Cart"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <svg className="w-4 h-4 shrink-0 text-[#ea580c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {!isCollapsed && (
                <span className="text-[13px] font-semibold truncate">Order Cart</span>
              )}
            </div>

            {totalCartCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#ea580c] text-white text-[11px] font-mono-num font-bold shrink-0">
                {totalCartCount}
              </span>
            )}
          </button>

          {!isCollapsed && (
            <div className="text-[11px] text-[#727272] px-1 flex items-center justify-between">
              <span>ETA 14% VAT Engine</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
