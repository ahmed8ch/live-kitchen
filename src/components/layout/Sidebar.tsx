import React, { useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  Home,
  UtensilsCrossed,
  Users,
  Package,
  Receipt,
  Building,
  ChefHat,
  QrCode,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Menu as MenuIcon,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { FlameLinkLogo } from '../ui/FlameLinkLogo';

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const location = useLocation();

  const activeTable = useAppStore((state) => state.activeTable);
  const orders = useAppStore((state) => state.orders);
  const cart = useAppStore((state) => state.cart);
  const openCartDrawer = useAppStore((state) => state.openCartDrawer);

  const trackerTarget = orders.length > 0 ? `/order/${orders[0].id}` : '/tracker';
  const settlementTarget = orders.length > 0 ? `/settlement/${orders[0].id}` : '/settlement';
  const tableParam = activeTable ? `?table=${activeTable}` : '';
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    {
      id: 'home',
      label: 'Overview',
      to: '/',
      icon: Home,
    },
    {
      id: 'menu',
      label: 'Menu',
      to: `/menu${tableParam}`,
      badge: activeTable ? activeTable : undefined,
      icon: UtensilsCrossed,
    },
    {
      id: 'companion',
      label: 'Companion Order',
      to: `/companion${tableParam}`,
      icon: Users,
    },
    {
      id: 'tracker',
      label: 'Order Tracker',
      to: `${trackerTarget}${tableParam}`,
      badge: orders.length > 0 && !orders[0].isPaid ? 'Live' : undefined,
      icon: Package,
    },
    {
      id: 'settlement',
      label: 'Bill & Split',
      to: `${settlementTarget}${tableParam}`,
      icon: Receipt,
    },
    {
      id: 'cashier',
      label: 'Cashier Station',
      to: '/cashier',
      badge: 'POS',
      icon: Building,
    },
    {
      id: 'kds',
      label: 'Kitchen Pass',
      to: '/kds',
      badge: 'Pass',
      icon: ChefHat,
    },
    {
      id: 'stand',
      label: 'Table QR Stand',
      to: '/stand',
      icon: QrCode,
    },
  ];

  return (
    <>
      {/* Mobile Bar: Brand + Quick Cart Drawer */}
      <header className="md:hidden h-14 w-full bg-[#f9f9f9] border-b border-[#e5e7eb] px-4 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="inline-flex items-center min-h-[36px] min-w-[36px]">
          <FlameLinkLogo size="md" />
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
          >
            {mobileDrawerOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
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
                <Link to="/" onClick={() => setMobileDrawerOpen(false)}>
                  <FlameLinkLogo size="lg" />
                </Link>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-white border border-[#e5e7eb] flex items-center justify-center text-[#727272] cursor-pointer"
                  aria-label="Close drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="mt-5 space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.id}
                      to={item.to}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] transition-[background-color,color,border-color,box-shadow] duration-150 ${
                          isActive
                            ? 'bg-[#fff0f3] text-[#FF0055] font-semibold border border-[#ffd1dc]/80 shadow-[0_1px_2px_rgba(255,0,85,0.06)]'
                            : 'text-[#727272] hover:bg-white hover:text-[#262626] border border-transparent'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-[#fff0f3] border border-[#ffd1dc] text-[#FF0055] text-[10px] font-mono-num font-medium">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#e5e7eb] text-[11px] font-mono-num text-[#949494]">
              FlameLink v2.0 // Dine-In OS
            </div>
          </div>
        </div>
      )}

      {/* Desktop Structural Left Sidebar Rail (Cloudflare-engulfing aesthetic) */}
      <aside
        data-ui-container="sidebar"
        className={`${
          isOpen ? 'w-64' : 'w-16'
        } hidden md:flex flex-col border-r border-[#e5e7eb] bg-[#f9f9f9] sticky top-0 h-screen transition-all duration-300 ease-in-out z-30 shrink-0 select-none shadow-[1px_0_10px_rgba(0,0,0,0.02)]`}
      >
        {/* Top Wordmark & Collapse Trigger Header (Clicking Logo toggles compact/full) */}
        <div
          className={`h-16 flex items-center border-b border-[#e5e7eb] px-3 ${
            isOpen ? 'justify-between' : 'justify-center'
          } bg-white transition-all`}
        >
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center justify-center group select-none transition-transform cursor-pointer"
            aria-label={isOpen ? 'Compact navigation sidebar' : 'Expand navigation sidebar'}
            title={isOpen ? 'Click logo to compact sidebar' : 'Click logo to expand sidebar'}
          >
            <FlameLinkLogo size="lg" showWordmark={isOpen} />
          </button>

          {isOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg hover:bg-[#f9f9f9] text-[#727272] hover:text-[#262626] flex items-center justify-center transition-colors border border-transparent hover:border-[#e5e7eb] cursor-pointer shrink-0"
              aria-label="Collapse navigation sidebar"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Items List with Lucide-React Icons */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto" data-ui-actions="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to.split('?')[0]);

            return (
              <NavLink
                key={item.id}
                to={item.to}
                className={`flex items-center ${
                  isOpen ? 'justify-between px-3 h-10' : 'justify-center w-10 h-10 mx-auto'
                } rounded-xl text-[13px] transition-[background-color,color,border-color,box-shadow] duration-150 group relative ${
                  isActive
                    ? 'bg-[#fff0f3] text-[#FF0055] font-semibold border border-[#ffd1dc]/80 shadow-[0_1px_2px_rgba(255,0,85,0.06)]'
                    : 'text-[#727272] hover:text-[#262626] hover:bg-white/80 border border-transparent'
                }`}
                title={!isOpen ? item.label : undefined}
                aria-label={item.label}
              >
                <div className={`flex items-center ${isOpen ? 'gap-3 min-w-0' : 'justify-center'}`}>
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-[#FF0055] stroke-[2.25px]'
                        : 'text-[#727272] group-hover:text-[#262626] stroke-[1.75px]'
                    }`}
                  />
                  {isOpen && (
                    <span className="truncate whitespace-nowrap">{item.label}</span>
                  )}
                </div>

                {isOpen && item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono-num font-bold transition-colors ${
                      isActive
                        ? 'bg-white text-[#FF0055] border border-[#ffd1dc] shadow-xs'
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

        {/* Bottom Rail Collapse / Expand Toggle */}
        <div className="p-2 border-t border-[#e5e7eb] bg-white">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full h-9 rounded-xl hover:bg-[#f0f0f0] text-[#727272] hover:text-[#262626] flex items-center justify-center transition-colors cursor-pointer"
            aria-label={isOpen ? 'Compact sidebar rail' : 'Expand sidebar rail'}
            title={isOpen ? 'Compact sidebar rail' : 'Expand sidebar rail'}
          >
            {isOpen ? (
              <div className="flex items-center gap-2.5 text-[12px] font-medium w-full px-2">
                <PanelLeftClose className="w-4 h-4 text-[#727272]" />
                <span>Collapse Rail</span>
              </div>
            ) : (
              <PanelLeftOpen className="w-4 h-4 text-[#727272]" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
};