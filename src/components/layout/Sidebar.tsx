import React, { useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { FlameLinkLogo } from '../ui/FlameLinkLogo';

interface NavItem {
  id: string;
  label: string;
  to: string;
  badge?: string;
  icon: (active: boolean) => React.ReactNode;
}

export const Sidebar: React.FC = () => {
  // Collapsed by default per user directive
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const location = useLocation();

  const activeTable = useAppStore((state) => state.activeTable);
  const orders = useAppStore((state) => state.orders);
  const cart = useAppStore((state) => state.cart);
  const openCartDrawer = useAppStore((state) => state.openCartDrawer);

  const trackerTarget = orders.length > 0 ? `/order/${orders[0].id}` : '/order/active';
  const settlementTarget = orders.length > 0 ? `/settlement/${orders[0].id}` : '/settlement';
  const tableParam = activeTable ? `?table=${activeTable}` : '';
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Overview',
      to: '/',
      icon: (active) => (
        <svg
          className={`w-5 h-5 shrink-0 transition-colors ${active ? 'text-[#FF0055]' : 'text-[#727272]'}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: 'menu',
      label: 'Dine-In Menu',
      to: `/menu${tableParam}`,
      icon: (active) => (
        <svg
          className={`w-5 h-5 shrink-0 transition-colors ${active ? 'text-[#FF0055]' : 'text-[#727272]'}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      ),
    },
    {
      id: 'tracker',
      label: 'Order Tracker',
      to: `${trackerTarget}${tableParam}`,
      badge: orders.length > 0 && !orders[0].isPaid ? 'Live' : undefined,
      icon: (active) => (
        <svg
          className={`w-5 h-5 shrink-0 transition-colors ${active ? 'text-[#FF0055]' : 'text-[#727272]'}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      id: 'settlement',
      label: 'Table Bill',
      to: `${settlementTarget}${tableParam}`,
      icon: (active) => (
        <svg
          className={`w-5 h-5 shrink-0 transition-colors ${active ? 'text-[#FF0055]' : 'text-[#727272]'}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
    },
    {
      id: 'cashier',
      label: 'Cashier Station',
      to: '/cashier',
      badge: 'POS',
      icon: (active) => (
        <svg
          className={`w-5 h-5 shrink-0 transition-colors ${active ? 'text-[#FF0055]' : 'text-[#727272]'}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
          <line x1="7" y1="15" x2="7.01" y2="15" strokeWidth="2.5" />
          <line x1="11" y1="15" x2="17" y2="15" strokeWidth="2" />
        </svg>
      ),
    },
    {
      id: 'kds',
      label: 'Kitchen Pass',
      to: '/kds',
      badge: 'Pass',
      icon: (active) => (
        <svg
          className={`w-5 h-5 shrink-0 transition-colors ${active ? 'text-[#FF0055]' : 'text-[#727272]'}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
    },
    {
      id: 'stand',
      label: 'QR Stand',
      to: '/stand',
      icon: (active) => (
        <svg
          className={`w-5 h-5 shrink-0 transition-colors ${active ? 'text-[#FF0055]' : 'text-[#727272]'}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Mobile Bar (Small screens only: Brand + Drawer Button) */}
      <header className="md:hidden h-14 w-full bg-[#f9f9f9] border-b border-[#e5e7eb] px-4 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="inline-flex items-center min-h-[36px] min-w-[36px]">
          <FlameLinkLogo size="sm" />
        </Link>

        <div className="flex items-center gap-2">
          {totalCartCount > 0 && (
            <button
              onClick={() => openCartDrawer()}
              className="px-3 py-1.5 rounded-full bg-[#fff0f3] border border-[#ffd1dc] text-[#FF0055] text-[12px] font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <span>Cart</span>
              <span className="w-4 h-4 rounded-full bg-[#FF0055] text-white flex items-center justify-center text-[10px] font-mono-num font-medium">
                {totalCartCount}
              </span>
            </button>
          )}

          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="p-2 rounded-lg text-[#262626] hover:bg-[#e5e7eb] border border-[#e5e7eb] flex items-center justify-center min-w-[36px] min-h-[36px] cursor-pointer"
            aria-label="Toggle navigation drawer"
            title="Toggle navigation drawer"
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

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs md:hidden"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className="w-72 bg-[#f9f9f9] h-full shadow-2xl p-5 flex flex-col justify-between border-r border-[#e5e7eb]"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#e5e7eb]">
                <Link
                  to="/"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="inline-flex items-center min-h-[36px]"
                >
                  <FlameLinkLogo size="md" />
                </Link>

                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-white border border-[#e5e7eb] flex items-center justify-center text-[#727272] cursor-pointer"
                  aria-label="Close drawer"
                  title="Close drawer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {activeTable && (
                <div className="mt-4 p-2.5 rounded-xl bg-[#fff0f3] border border-[#ffd1dc] flex items-center justify-between">
                  <span className="text-[12px] text-[#727272]">Table:</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#FF0055] text-white text-[11px] font-mono-num font-medium">
                    {activeTable}
                  </span>
                </div>
              )}

              <nav className="mt-5 space-y-1.5" data-ui-actions="nav">
                {navItems.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.to}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all ${
                        isActive
                          ? 'bg-white text-[#FF0055] border-l-2 border-l-[#FF0055] shadow-xs'
                          : 'text-[#727272] hover:bg-white hover:text-[#262626]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      {item.icon(false)}
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-[#fff0f3] border border-[#ffd1dc] text-[#FF0055] text-[10px] font-mono-num font-medium">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#e5e7eb] text-[11px] font-mono-num text-[#949494]">
              FlameLink v2.0 // Dine-In OS
            </div>
          </div>
        </div>
      )}

      {/* Desktop Structural Left Sidebar Rail (DESIGN.md §5.2) */}
      <aside
        data-ui-container="sidebar"
        style={{ backgroundColor: '#f9f9f9' }}
        className={`hidden md:flex flex-col border-r border-[#e5e7eb] sticky top-0 h-screen transition-all duration-200 z-30 shrink-0 ${
          isCollapsed ? 'w-16' : 'w-[220px]'
        }`}
      >
        {/* Top Wordmark Area */}
        <div className={`h-16 flex items-center border-b border-[#e5e7eb] px-3 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <Link
            to="/"
            className="inline-flex items-center justify-center min-h-[36px] min-w-[36px] group select-none"
            aria-label="FlameLink Home"
            title="FlameLink Home"
          >
            {isCollapsed ? (
              <span className="w-8 h-8 rounded-lg bg-white border border-[#e5e7eb] flex items-center justify-center text-[#FF0055] shadow-xs">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
                </svg>
              </span>
            ) : (
              <FlameLinkLogo size="md" />
            )}
          </Link>

          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="w-8 h-8 p-1.5 rounded-lg hover:bg-white text-[#727272] hover:text-[#262626] flex items-center justify-center transition-colors border border-transparent hover:border-[#e5e7eb] cursor-pointer shrink-0"
              aria-label="Collapse navigation sidebar"
              title="Collapse navigation sidebar"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
        </div>

        {/* Table Seating Badge in Sidebar */}
        {activeTable && (
          <div className="p-2 border-b border-[#e5e7eb] bg-[#fff0f3]">
            {isCollapsed ? (
              <div
                className="w-full text-center py-0.5 rounded bg-[#FF0055] text-white text-[11px] font-mono-num font-medium"
                title={`Table ${activeTable}`}
              >
                {activeTable.replace('T-', '')}
              </div>
            ) : (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#727272]">Table:</span>
                <span className="px-2 py-0.5 rounded-full bg-[#FF0055] text-white font-mono-num font-medium">
                  {activeTable}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Navigation Items List */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto" data-ui-actions="sidebar-nav">
          {navItems.map((item) => {
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to.split('?')[0]);

            return (
              <NavLink
                key={item.id}
                to={item.to}
                className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2.5 rounded-lg text-[13px] font-medium transition-all group ${
                  isActive
                    ? 'bg-white text-[#262626] shadow-xs border-l-2 border-l-[#FF0055]'
                    : 'text-[#727272] hover:text-[#262626] hover:bg-white'
                }`}
                title={isCollapsed ? item.label : undefined}
                aria-label={item.label}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.icon(isActive)}
                  {!isCollapsed && (
                    <span className="truncate whitespace-nowrap">{item.label}</span>
                  )}
                </div>

                {!isCollapsed && item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono-num font-medium ${
                      isActive
                        ? 'bg-[#fff0f3] text-[#FF0055] border border-[#ffd1dc]'
                        : 'bg-white border border-[#e5e7eb] text-[#727272]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Area: Cart Trigger + Rail Expand Toggle */}
        <div className="p-2 border-t border-[#e5e7eb] bg-white space-y-2">
          <button
            onClick={() => openCartDrawer()}
            className={`w-full min-h-[44px] flex items-center ${isCollapsed ? 'justify-center p-2' : 'justify-between p-2.5'} rounded-lg transition-all border cursor-pointer ${
              totalCartCount > 0
                ? 'bg-[#fff0f3] border-[#ffd1dc] text-[#262626] shadow-xs hover:border-[#FF0055]'
                : 'bg-[#f9f9f9] border-[#e5e7eb] text-[#727272] hover:text-[#262626]'
            }`}
            title="View Order Cart"
            aria-label="View Order Cart"
          >
            <div className="flex items-center gap-2 min-w-0">
              <svg className="w-4 h-4 shrink-0 text-[#FF0055]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {!isCollapsed && (
                <span className="text-[12px] font-medium truncate">Cart</span>
              )}
            </div>

            {totalCartCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full bg-[#FF0055] text-white text-[10px] font-mono-num font-medium shrink-0 ${isCollapsed ? 'ml-1' : ''}`}>
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Dedicated Expand Button when Rail is Collapsed */}
          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-full h-8 rounded-lg hover:bg-[#f0f0f0] text-[#727272] hover:text-[#262626] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Expand navigation rail"
              title="Expand navigation rail"
            >
              <svg
                className="w-4 h-4 rotate-180"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
