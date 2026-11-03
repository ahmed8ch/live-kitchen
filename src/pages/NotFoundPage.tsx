import React from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { FlameLinkLogo } from '../components/ui/FlameLinkLogo';

export const NotFoundPage: React.FC = () => {
  const activeTable = useAppStore((state) => state.activeTable);
  const menuLink = activeTable ? `/menu?table=${activeTable}` : '/menu';

  return (
    <div
      className="flex-1 w-full bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 select-none"
      data-ui-container="not-found-view"
    >
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
        {/* Left Col: Asymmetric Oversized Technical Monospace Indicator */}
        <div className="md:col-span-5 bg-[#f9f9f9] border border-[#e5e7eb] rounded-2xl p-8 relative">
          <div className="text-xs font-mono-num font-semibold text-[#727272] tracking-wider uppercase mb-2">
            Dispatched Route Error
          </div>
          <div className="text-7xl sm:text-8xl font-mono-num font-bold text-[#262626] tracking-tighter leading-none" data-ui-number>
            404
          </div>
          <div className="mt-4 pt-4 border-t border-[#e5e7eb] flex items-center justify-between text-xs text-[#727272]">
            <span>Station: Unrouted</span>
            <span className="font-mono-num text-[#FF0055] font-bold">BYOD Floor Pass</span>
          </div>
        </div>

        {/* Right Col: Editorial Copy & Action Links */}
        <div className="md:col-span-7 space-y-5 text-left">
          <FlameLinkLogo size="md" />

          <h1 className="text-2xl sm:text-3xl font-bold text-[#262626] tracking-tight">
            Station ticket not found
          </h1>

          <p className="text-sm sm:text-base text-[#616161] leading-relaxed max-w-lg">
            The URL or table session you requested does not correspond to an active dining station at Live Kitchen. Return to your table menu or start fresh from the dining overview.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to={menuLink}
              data-ui-radius="999"
              className="min-h-[44px] px-6 py-2.5 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-xs font-bold btn-crimson-glow transition-all active:scale-[0.98] shadow-xs inline-flex items-center justify-center"
            >
              Open Dine In Menu -&gt;
            </Link>

            <Link
              to="/"
              data-ui-radius="999"
              className="min-h-[44px] px-6 py-2.5 rounded-full bg-white hover:bg-[#f9f9f9] border border-[#e5e7eb] text-[#262626] text-xs font-semibold transition-all active:scale-[0.98] inline-flex items-center justify-center shadow-xs"
            >
              Return to Overview
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
