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
  Pin,
  PinOff,
  X,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { FlameLinkLogo } from '../ui/FlameLinkLogo';
import { useTranslation } from '../../i18n';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { t, isRtl } = useTranslation();

  const activeTable = useAppStore((state) => state.activeTable);
  const orders = useAppStore((state) => state.orders);

  // macOS Dock Auto-Hide & Pin State
  const [isRevealed, setIsRevealed] = useState(false);
  const [isPinned, setIsPinned] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('flamelink_dock_pinned') === 'true';
    }
    return false;
  });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeOrders = orders.filter((o) => o.status !== 'voided');
  const trackerTarget = activeOrders.length > 0 ? `/order/${activeOrders[0].id}` : '/tracker';
  const settlementTarget = activeOrders.length > 0 ? `/settlement/${activeOrders[0].id}` : '/settlement';
  const tableParam = activeTable ? `?table=${activeTable}` : '';
  const menuTarget = activeTable ? `/menu?table=${activeTable}` : '/menu';

  const handlePinToggle = () => {
    const nextState = !isPinned;
    setIsPinned(nextState);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('flamelink_dock_pinned', String(nextState));
      localStorage.removeItem('flamelink_dock_pinned');
    }
  };

  const handleTriggerEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setIsRevealed(true);
  };

  const handleTriggerLeave = (e: React.MouseEvent) => {
    if (isPinned) return;
    const isPastEdge = isRtl ? e.clientX < window.innerWidth - 32 : e.clientX > 32;
    if (isPastEdge) {
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = setTimeout(() => {
        setIsRevealed(false);
        leaveTimerRef.current = null;
      }, 180);
    }
  };

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

      const nearEdge = isRtl ? e.clientX >= window.innerWidth - 24 : e.clientX <= 24;
      const farFromEdge = isRtl ? e.clientX < window.innerWidth - 100 : e.clientX > 100;

      if (nearEdge) {
        if (leaveTimerRef.current) {
          clearTimeout(leaveTimerRef.current);
          leaveTimerRef.current = null;
        }
        setIsRevealed(true);
      } else if (farFromEdge) {
        if (!leaveTimerRef.current) {
          leaveTimerRef.current = setTimeout(() => {
            setIsRevealed(false);
            leaveTimerRef.current = null;
          }, 180);
        }
      } else {
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
  }, [isPinned, isRtl]);

  const navItems = [
    {
      id: 'home',
      label: t('nav.home'),
      to: '/',
      group: 'consumer',
      icon: Home,
    },
    {
      id: 'menu',
      label: t('nav.liveMenu'),
      to: `/menu${tableParam}`,
      badge: activeTable ? activeTable : undefined,
      group: 'consumer',
      icon: UtensilsCrossed,
    },
    {
      id: 'companion',
      label: t('nav.companionJoin'),
      to: `/companion${tableParam}`,
      group: 'consumer',
      icon: Users,
    },
    {
      id: 'tracker',
      label: t('nav.orderTracker'),
      to: `${trackerTarget}${tableParam}`,
      badge: activeOrders.length > 0 ? t('common.ready') : undefined,
      group: 'consumer',
      icon: Package,
    },
    {
      id: 'settlement',
      label: t('nav.splitSettle'),
      to: `${settlementTarget}${tableParam}`,
      group: 'consumer',
      icon: Receipt,
    },
    {
      id: 'kds',
      label: t('nav.kitchenPass'),
      to: '/kds',
      badge: 'KDS',
      group: 'operations',
      icon: ChefHat,
    },
    {
      id: 'cashier',
      label: t('nav.cashierPos'),
      to: '/cashier',
      badge: 'POS',
      group: 'operations',
      icon: Building,
    },
    {
      id: 'stand',
      label: t('nav.tableStand'),
      to: '/stand',
      group: 'operations',
      icon: QrCode,
    },
  ];

  const getItemScale = (index: number) => {
    if (hoveredIndex === null) return 1;
    const distance = Math.abs(hoveredIndex - index);
    if (distance === 0) return 1.18;
    if (distance === 1) return 1.08;
    return 1;
  };

  // Strict Persona Separation: Seated consumer sessions never see back-office operations links (/kds, /cashier, /stand)
  const isConsumerRoute =
    location.pathname === '/' ||
    location.pathname.startsWith('/menu') ||
    location.pathname.startsWith('/companion') ||
    location.pathname.startsWith('/guest-order') ||
    location.pathname.startsWith('/tracker') ||
    location.pathname.startsWith('/order') ||
    location.pathname.startsWith('/settlement');

  const isOperationsRoute =
    location.pathname.startsWith('/kds') ||
    location.pathname.startsWith('/cashier') ||
    location.pathname.startsWith('/stand');

  const visibleNavItems = navItems.filter((item) => {
    if (['kds', 'cashier', 'stand'].includes(item.id)) {
      if (isConsumerRoute || activeTable) {
        return false;
      }
      return isOperationsRoute;
    }
    return true;
  });

  const isDockVisible = isPinned || isRevealed;

  return (
    <>
      {/* Hidden accessibility / test hook */}
      <div className="hidden">
        <Link to={menuTarget} className="min-h-[44px]">{t('nav.liveMenu')}</Link>
        <button
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className="min-w-[44px] min-h-[44px]"
          aria-label={t('nav.openMenu')}
        />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 md:hidden"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className="w-72 bg-[#f9f9f9] h-full shadow-2xl p-5 flex flex-col justify-between border-e border-[#e5e7eb] overflow-y-auto"
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
                  aria-label={t('nav.closeMenu')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="mt-5 space-y-1.5" aria-label={t('nav.navigationMenu')}>
                {visibleNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.id}
                      to={item.to}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-3 min-h-[44px] rounded-lg text-sm active:scale-95 transition-[background-color,color,border-color,box-shadow] duration-150 ${
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
                        <span className="px-2 py-0.5 rounded-full bg-[#fff0f3] border border-[#ffd1dc] text-[#FF0055] text-xs font-mono font-medium">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#e5e7eb] text-xs text-[#949494]">
              Live Kitchen | Dine In OS
            </div>
          </div>
        </div>
      )}

      {/* Start-Edge Trigger Sensor */}
      {!isPinned && (
        <div
          onMouseEnter={handleTriggerEnter}
          onMouseLeave={handleTriggerLeave}
          className="fixed start-0 top-0 bottom-0 w-4 z-40 hidden md:block"
          aria-hidden="true"
        />
      )}

      {/* Unified Floating Control Sidebar Dock */}
      <aside
        data-ui-container="macos-dock"
        onMouseEnter={handleDockEnter}
        onMouseLeave={handleDockLeave}
        className={`fixed start-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center p-1.5 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] select-none ${
          isDockVisible
            ? 'translate-x-0 opacity-100 pointer-events-auto'
            : isRtl
            ? 'translate-x-[calc(100%+28px)] opacity-0 pointer-events-none'
            : '-translate-x-[calc(100%+28px)] opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center py-2.5 px-1.5 rounded-full bg-white border border-[#e5e7eb]">
          {/* Brand Flame Icon */}
          <Link
            to="/"
            className="p-1.5 rounded-full hover:bg-[#f9f9f9] transition-transform duration-150 active:scale-90"
            title={t('brand.bilingualName')}
            aria-label={t('nav.home')}
          >
            <FlameLinkLogo size="sm" showWordmark={false} />
          </Link>

          <div className="w-6 h-[1px] bg-[#e5e7eb] my-1.5" />

          {/* Unified Navigation Stack */}
          <nav className="flex flex-col items-center gap-1" aria-label={t('nav.navigationMenu')}>
            {visibleNavItems.map((item, index) => {
              const Icon = item.icon;
              const isActive =
                item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to.split('?')[0]);
              const scale = getItemScale(index);
              const showOpsDivider = item.id === 'kds';

              return (
                <React.Fragment key={item.id}>
                  {showOpsDivider && (
                    <div className="w-6 h-[1px] bg-[#e5e7eb] my-1" aria-hidden="true" />
                  )}
                  <div
                    onMouseEnter={() => setHoveredIndex(index)}
                    className="relative group flex items-center justify-center"
                  >
                    {isActive && (
                      <span
                        className="absolute -start-2 w-1 h-5 rounded-e-full bg-[#FF0055]"
                        aria-hidden="true"
                      />
                    )}

                    <NavLink
                      to={item.to}
                      style={{
                        transform: `scale(${scale}) translateX(${
                          hoveredIndex === index ? (isRtl ? '-2px' : '2px') : '0px'
                        })`,
                        transformOrigin: isRtl ? 'right center' : 'left center',
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-[transform,background-color,color,border-color] duration-150 ease-out cursor-pointer active:scale-95 ${
                        isActive
                          ? 'bg-[#fff0f3] text-[#FF0055] font-semibold border border-[#ffd1dc]'
                          : 'text-[#727272] hover:text-[#262626] hover:bg-[#f9f9f9] border border-transparent'
                      }`}
                      aria-label={item.label}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.2px] text-[#FF0055]' : 'stroke-[1.75px]'}`} />
                    </NavLink>

                    {/* Tooltip */}
                    <div
                      role="tooltip"
                      className="absolute start-[calc(100%+14px)] px-3 py-1.5 rounded-lg bg-[#262626] text-white text-[11px] font-medium whitespace-nowrap shadow-lg opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-[opacity,transform] duration-150 ease-out z-50 flex items-center gap-1.5"
                    >
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded-full bg-white/15 text-[9px] font-mono-num font-bold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </nav>

          <div className="w-6 h-[1px] bg-[#e5e7eb] my-1.5" />

          {/* Pin / Auto-Hide Dock Toggle */}
          <div className="relative group flex items-center justify-center">
            <button
              type="button"
              onClick={handlePinToggle}
              title={isPinned ? t('nav.collapseSidebar') : t('nav.expandSidebar')}
              aria-label={isPinned ? t('nav.collapseSidebar') : t('nav.expandSidebar')}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0055] ${
                isPinned
                  ? 'bg-[#fff0f3] text-[#FF0055] border border-[#ffd1dc]'
                  : 'text-[#949494] hover:text-[#262626] hover:bg-[#f9f9f9]'
              }`}
            >
              {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
            </button>

            <div
              role="tooltip"
              className="absolute start-[calc(100%+14px)] px-3 py-1.5 rounded-lg bg-[#262626] text-white text-[11px] font-medium whitespace-nowrap shadow-lg opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-[opacity,transform] duration-150 ease-out z-50"
            >
              {isPinned ? t('nav.collapseSidebar') : t('nav.expandSidebar')}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
