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
  ShoppingCart,
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
      label: 'Dine-In Menu (Host)',
      to: `/menu${tableParam}`,
      badge: activeTable ? activeTable : undefined,
      icon: UtensilsCrossed,
    },
    {
      id: 'companion',
      label: 'Companion POV (Guest)',
      to: `/companion${tableParam}`,
      badge: 'Guest',
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
      label: 'Table Bill & Split',
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
      label: 'Acrylic QR Stand',
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
                        `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                          isActive
                            ? 'bg-white text-[#FF0055] border-l-2 border-l-[#FF0055] shadow-xs font-bold'
                            : 'text-[#727272] hover:bg-white hover:text-[#262626]'
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
        {/* Top Wordmark & Collapse Trigger Header (Bigger Logo on top + Flame Animation) */}
        <div
          className={`h-16 flex items-center border-b border-[#e5e7eb] px-3 ${
            isOpen ? 'justify-between' : 'justify-center'
          } bg-white transition-all`}
        >
          <Link
            to="/"
            className="inline-flex items-center justify-center group select-none transition-transform"
            aria-label="FlameLink Home"
            title="FlameLink Home"
          >
            {isOpen ? (
              <FlameLinkLogo size="lg" showWordmark={true} />
            ) : (
              <FlameLinkLogo size="lg" showWordmark={false} />
            )}
          </Link>

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
                  isOpen ? 'justify-between px-3' : 'justify-center px-2'
                } py-2.5 rounded-xl text-[13px] font-medium transition-all group relative ${
                  isActive
                    ? 'bg-white text-[#262626] shadow-xs border-l-2 border-l-[#FF0055] font-semibold'
                    : 'text-[#727272] hover:text-[#262626] hover:bg-white'
                }`}
                title={!isOpen ? item.label : undefined}
                aria-label={item.label}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-[#FF0055]' : 'text-[#727272] group-hover:text-[#262626]'
                    }`}
                  />
                  {isOpen && (
                    <span className="truncate whitespace-nowrap">{item.label}</span>
                  )}
                </div>

                {isOpen && item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono-num font-bold ${
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
            className={`w-full min-h-[44px] flex items-center ${
              isOpen ? 'justify-between p-2.5' : 'justify-center p-2'
            } rounded-xl transition-all border cursor-pointer ${
              totalCartCount > 0
                ? 'bg-[#fff0f3] border-[#ffd1dc] text-[#262626] shadow-xs hover:border-[#FF0055]'
                : 'bg-[#f9f9f9] border-[#e5e7eb] text-[#727272] hover:text-[#262626]'
            }`}
            title="View Order Cart"
            aria-label="View Order Cart"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <ShoppingCart className="w-4 h-4 shrink-0 text-[#FF0055]" />
              {isOpen && (
                <span className="text-[12px] font-semibold truncate">Shared Cart</span>
              )}
            </div>

            {totalCartCount > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full bg-[#FF0055] text-white text-[10px] font-mono-num font-bold shrink-0 ${
                  !isOpen ? 'ml-1' : ''
                }`}
              >
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Expand Toggle when Rail is Collapsed */}
          {!isOpen && (
            <button
              onClick={() => setIsOpen(true)}
              className="w-full h-8 rounded-lg hover:bg-[#f0f0f0] text-[#727272] hover:text-[#262626] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Expand navigation rail"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};