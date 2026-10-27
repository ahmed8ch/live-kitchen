import React, { useState, useRef, useEffect } from 'react';
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
  X,
  Menu as MenuIcon,
  Pin,
  PinOff,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { FlameLinkLogo } from '../ui/FlameLinkLogo';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const activeTable = useAppStore((state) => state.activeTable);
  const orders = useAppStore((state) => state.orders);

  // macOS Dock Auto-Hide & Pin State (Hidden by default per user directive)
  const [isRevealed, setIsRevealed] = useState(false);
  const [isPinned, setIsPinned] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('flamelink_dock_pinned') === 'true';
    }
    return false;
  });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trackerTarget = orders.length > 0 ? `/order/${orders[0].id}` : '/tracker';
  const settlementTarget = orders.length > 0 ? `/settlement/${orders[0].id}` : '/settlement';
  const tableParam = activeTable ? `?table=${activeTable}` : '';

  // Toggle Dock Pin
  const handlePinToggle = () => {
    const nextState = !isPinned;
    setIsPinned(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('flamelink_dock_pinned', String(nextState));
    }
  };

  // Edge Trigger Handler (Immediate reveal on edge approach)
  const handleTriggerEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setIsRevealed(true);
  };

  const handleTriggerLeave = (e: React.MouseEvent) => {
    if (isPinned) return;
    if (e.clientX > 32) {
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = setTimeout(() => {
        setIsRevealed(false);
        leaveTimerRef.current = null;
      }, 180);
    }
  };

  // Dock Hover & Leave Handlers (with 180ms safety debounce)
  const handleDockEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setIsRevealed(true);
  };

  const handleDockLeave = () => {
    if (isPinned) return;
    setHoveredIndex(null);
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    leaveTimerRef.current = setTimeout(() => {
      setIsRevealed(false);
      leaveTimerRef.current = null;
    }, 180);
  };

  // Global Edge Detection & Keyboard Shortcuts (Reliable across Firefox, Chrome, Safari)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'b' && (e.metaKey || e.ctrlKey)) ||
        (e.key === '[' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName))
      ) {
        e.preventDefault();
        setIsRevealed((prev) => !prev);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isPinned) return;

      // Mouse reaches the left edge trigger zone (<= 14px): reveal dock
      if (e.clientX <= 14) {
        if (leaveTimerRef.current) {
          clearTimeout(leaveTimerRef.current);
          leaveTimerRef.current = null;
        }
        setIsRevealed(true);
      } else if (e.clientX > 92) {
        // Mouse moved well past the dock capsule: auto-hide cleanly
        if (!leaveTimerRef.current) {
          leaveTimerRef.current = setTimeout(() => {
            setIsRevealed(false);
            leaveTimerRef.current = null;
          }, 180);
        }
      } else {
        // Mouse is within the dock capsule zone: cancel any hide timer
        if (leaveTimerRef.current) {
          clearTimeout(leaveTimerRef.current);
          leaveTimerRef.current = null;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, [isPinned]);

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
      id: 'kds',
      label: 'Kitchen Pass (KDS)',
      to: '/kds',
      badge: 'KDS',
      icon: ChefHat,
    },
    {
      id: 'cashier',
      label: 'Cashier POS',
      to: '/cashier',
      badge: 'POS',
      icon: Building,
    },
    {
      id: 'stand',
      label: 'Table QR Stand',
      to: '/stand',
      icon: QrCode,
    },
  ];

  // Parabolic Falloff Magnification (macOS Dock physical zoom)
  const getItemScale = (index: number) => {
    if (hoveredIndex === null) return 1;
    const distance = Math.abs(hoveredIndex - index);
    if (distance === 0) return 1.25;
    if (distance === 1) return 1.12;
    if (distance === 2) return 1.04;
    return 1;
  };

  // Separate consumer dining navigation from back-office staff links when seated at tables
  const isDineInRoute = ['/menu', '/companion', '/guest-order', '/tracker', '/settlement'].some(
    (path) => location.pathname.startsWith(path)
  );

  const visibleNavItems = isDineInRoute
    ? navItems.filter((item) => ['home', 'menu', 'companion', 'tracker', 'settlement'].includes(item.id))
    : navItems;

  const isDockVisible = isPinned || isRevealed;

  return (
    <>
      {/* =========================================================================
          MOBILE TOP BAR & SLIDE-IN DRAWER (< 768px Viewports)
          ========================================================================= */}
      <header className="md:hidden h-14 w-full bg-[#f9f9f9] border-b border-[#e5e7eb] px-4 flex items-center justify-between sticky top-0 z-40 select-none">
        <Link to="/" className="inline-flex items-center min-h-[44px] min-w-[44px]">
          <FlameLinkLogo size="md" />
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="p-2.5 rounded-xl text-[#262626] hover:bg-[#e5e7eb] border border-[#e5e7eb] flex items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer"
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
                  className="min-w-[44px] min-h-[44px] rounded-full bg-white border border-[#e5e7eb] flex items-center justify-center text-[#727272] cursor-pointer"
                  aria-label="Close drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="mt-5 space-y-1.5">
                {visibleNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.id}
                      to={item.to}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-3 min-h-[44px] rounded-xl text-[13px] active:scale-95 transition-[background-color,color,border-color,box-shadow] duration-150 ${
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

            <div className="pt-4 border-t border-[#e5e7eb] text-[11px] text-[#949494]">
              Live Kitchen | Dine-In OS
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DESKTOP macOS AUTO-HIDING DOCK (>= 768px Viewports)
          ========================================================================= */}

      {/* Left-Edge Trigger Sensor (14px wide edge detection) */}
      {!isPinned && (
        <div
          onMouseEnter={handleTriggerEnter}
          onMouseLeave={handleTriggerLeave}
          className="fixed left-0 top-0 bottom-0 w-3.5 z-40 hidden md:block"
          aria-hidden="true"
        />
      )}

      {/* Subtle Visual Peek Indicator along the Left Edge (Guides Diner/Cashier Eye) */}
      {!isPinned && !isRevealed && (
        <button
          type="button"
          onClick={() => setIsRevealed(true)}
          onMouseEnter={handleTriggerEnter}
          className="fixed left-0 top-1/2 -translate-y-1/2 h-16 w-1.5 hover:w-2.5 rounded-r-full bg-[#FF0055]/30 hover:bg-[#FF0055] transition-all cursor-pointer z-40 hidden md:block shadow-xs"
          title="Hover left edge or click to reveal Navigation Dock (or press '[')"
          aria-label="Reveal Navigation Dock"
        />
      )}

      {/* Floating macOS Dock Capsule */}
      <aside
        data-ui-container="macos-dock"
        onMouseEnter={handleDockEnter}
        onMouseLeave={handleDockLeave}
        className={`fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center py-3 px-2 rounded-[24px] bg-white/95 backdrop-blur-2xl border border-[#e5e7eb] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12),0_8px_20px_-4px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,1)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${
          isDockVisible
            ? 'translate-x-0 opacity-100 pointer-events-auto'
            : '-translate-x-[calc(100%+28px)] opacity-0 pointer-events-none'
        }`}
      >
        {/* Brand Flame Icon */}
        <Link
          to="/"
          className="p-1.5 rounded-xl hover:bg-[#f5f5f5] transition-transform duration-150 active:scale-90"
          title="FlameLink Overview"
          aria-label="Home Overview"
        >
          <FlameLinkLogo size="sm" showWordmark={false} />
        </Link>

        {/* Hairline Divider */}
        <div className="w-6 h-[1px] bg-[#e5e7eb] my-1" />

        {/* Dock Icons Stack with Smooth Parabolic Magnification */}
        <nav className="flex flex-col items-center gap-1.5" aria-label="Navigation Dock">
          {visibleNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to.split('?')[0]);
            const scale = getItemScale(index);

            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredIndex(index)}
                className="relative group flex items-center justify-center"
              >
                {/* Active Indicator Bar (Vertical pill anchored to left edge) */}
                {isActive && (
                  <span
                    className="absolute -left-2.5 w-1 h-5 rounded-r-full bg-[#FF0055] shadow-[0_0_8px_rgba(255,0,85,0.85)]"
                    aria-hidden="true"
                  />
                )}

                {/* Live Activity Pulse Pip */}
                {item.badge === 'Live' && !isActive && (
                  <span
                    className="absolute -left-1.5 w-1.5 h-1.5 rounded-full bg-[#FF0055] animate-ping"
                    aria-hidden="true"
                  />
                )}

                <NavLink
                  to={item.to}
                  style={{
                    transform: `scale(${scale}) translateX(${hoveredIndex === index ? '2px' : '0px'})`,
                    transformOrigin: 'left center',
                  }}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150 ease-out cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-[#fff0f3] text-[#FF0055] font-semibold border border-[#ffd1dc]/90 shadow-xs'
                      : 'text-[#727272] hover:text-[#262626] hover:bg-[#f5f5f5] hover:border-[#e5e7eb] border border-transparent'
                  }`}
                  aria-label={item.label}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.2px] text-[#FF0055]' : 'stroke-[1.8px]'}`} />
                </NavLink>

                {/* Instantaneous Clarity Tooltip (macOS Pill anchored to right) */}
                <div
                  role="tooltip"
                  className="absolute left-[calc(100%+14px)] px-2.5 py-1 rounded-md bg-[#262626] text-white text-[11px] font-medium whitespace-nowrap shadow-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-100 ease-out z-50 flex items-center gap-1.5"
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded bg-white/20 text-[9px] font-mono-num font-bold">
                      {item.badge}
                    </span>
                  )}
                  {/* Subtle Caret pointing back to dock */}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-[#262626]" />
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom Action: Pin Toggle */}
        <div className="w-6 h-[1px] bg-[#e5e7eb] my-1" />

        <div className="flex flex-col items-center gap-1">

          {/* Pin / Auto-Hide Dock Toggle */}
          <div className="relative group flex items-center justify-center">
            <button
              type="button"
              onClick={handlePinToggle}
              title={isPinned ? 'Auto-Hide Dock' : 'Pin Dock'}
              aria-label={isPinned ? 'Auto-Hide Dock' : 'Pin Dock'}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0055] ${
                isPinned
                  ? 'bg-[#fff0f3] text-[#FF0055] border border-[#ffd1dc]'
                  : 'text-[#949494] hover:text-[#262626] hover:bg-[#f5f5f5]'
              }`}
            >
              {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
            </button>

            <div
              role="tooltip"
              className="absolute left-[calc(100%+14px)] px-2.5 py-1 rounded-md bg-[#262626] text-white text-[11px] font-medium whitespace-nowrap shadow-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-100 ease-out z-50"
            >
              {isPinned ? 'Auto-Hide Dock' : 'Pin Dock'}
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-[#262626]" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
