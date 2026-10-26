import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

interface NavItem {
  id: string;
  label: string;
  to: string;
  icon: (active: boolean) => React.ReactNode;
}

export const Sidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const activeTable = useAppStore((state) => state.activeTable);
  const orders = useAppStore((state) => state.orders);

  // Active tracker link
  const trackerTarget = orders.length > 0 ? `/order/${orders[0].id}` : '/order/active';
  const tableParam = activeTable ? `?table=${activeTable}` : '';

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Platform Overview',
      to: '/',
      icon: (active) => (
        <svg className={`w-5 h-5 ${active ? 'text-[#ea580c]' : 'text-[#727272]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <svg className={`w-5 h-5 ${active ? 'text-[#ea580c]' : 'text-[#727272]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2h-3a4 4 0 0 0-4 4v14a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
          <path d="M6 2h3a4 4 0 0 1 4 4v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
        </svg>
      ),
    },
    {
      id: 'tracker',
      label: 'Order Tracker',
      to: `${trackerTarget}${tableParam}`,
      icon: (active) => (
        <svg className={`w-5 h-5 ${active ? 'text-[#ea580c]' : 'text-[#727272]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <svg className={`w-5 h-5 ${active ? 'text-[#ea580c]' : 'text-[#727272]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
    },
    {
      id: 'kds',
      label: 'Kitchen KDS',
      to: '/kds',
      icon: (active) => (
        <svg className={`w-5 h-5 ${active ? 'text-[#ea580c]' : 'text-[#727272]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <svg className={`w-5 h-5 ${active ? 'text-[#ea580c]' : 'text-[#727272]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <aside
      className={`hidden md:flex flex-col border-r border-[#e5e7eb] bg-[#faf8f5]/60 backdrop-blur-xs transition-all duration-300 z-30 shrink-0 ${
        isExpanded ? 'w-60' : 'w-16'
      }`}
    >
      {/* Top Expansion Toggle */}
      <div className="h-14 flex items-center justify-between px-3.5 border-b border-[#e5e7eb]/80">
        {isExpanded && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#727272]">
            Navigation
          </span>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-9 h-9 rounded-lg hover:bg-white text-[#727272] hover:text-[#262626] flex items-center justify-center transition-colors ml-auto border border-transparent hover:border-[#e5e7eb]"
          aria-label={isExpanded ? 'Collapse navigation rail' : 'Expand navigation rail'}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-4 px-2.5 space-y-1.5">
        {navItems.map((item) => {
          const isActive =
            item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to.split('?')[0]);

          return (
            <NavLink
              key={item.id}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all group ${
                isActive
                  ? 'bg-white text-[#0f172a] shadow-xs font-semibold border border-[#e5e7eb]'
                  : 'text-[#727272] hover:text-[#0f172a] hover:bg-white/80'
              }`}
              title={!isExpanded ? item.label : undefined}
            >
              <div className="shrink-0">{item.icon(isActive)}</div>
              {isExpanded && (
                <span className="truncate whitespace-nowrap">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info if Expanded */}
      {isExpanded && (
        <div className="p-4 border-t border-[#e5e7eb]/80 text-[11px] text-[#727272] space-y-1">
          <div className="font-semibold text-[#0f172a]">MatbakhLink Suite</div>
          <div>Dine-In & Kitchen v2.0</div>
        </div>
      )}
    </aside>
  );
};
