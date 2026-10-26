import React from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export const HomePage: React.FC = () => {
  const activeTable = useAppStore((state) => state.activeTable);
  const menuLink = activeTable ? `/menu?table=${activeTable}` : '/menu';

  return (
    <div className="flex-1 w-full bg-white" data-ui-container="home-view">
      {/* Hero Section (Clean canvas, white background matching original design) */}
      <section className="relative pt-16 pb-20 md:pt-20 md:pb-24 border-b border-[#e5e7eb] bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Top Section Breadcrumb Pill */}
          <div className="flex justify-center mb-6">
            <span className="px-4 py-1.5 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] text-[12px] font-semibold text-[#727272]">
              Platform Overview
            </span>
          </div>

          {/* Release Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] mb-8 shadow-xs">
            <span className="px-2 py-0.5 rounded-full bg-[#EA580C] text-white text-[10px] font-bold uppercase tracking-wider">
              NEW
            </span>
            <span className="text-[12px] font-semibold text-[#262626]">
              Zero-Friction Table Self-Ordering
            </span>
            <span className="text-[#EA580C] font-mono-num font-bold">&gt;</span>
          </div>

          {/* Display Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#262626] max-w-4xl mx-auto leading-[1.15]" data-ui-balance>
            Turn Every Restaurant Table into a{' '}
            <span className="text-[#EA580C]">Self-Ordering Experience</span>
          </h1>

          {/* Subheadline matching original */}
          <p className="mt-6 text-base sm:text-lg text-[#727272] max-w-2xl mx-auto leading-relaxed" data-ui-pretty>
            Browse our handcrafted menu, customize toppings and portions, and send your order directly to the flame line cooks in real-time.
          </p>

          {/* Call to Actions matching original screenshot */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5" data-ui-actions="hero-cta">
            <Link
              to={menuLink}
              data-ui-radius="999"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#EA580C] hover:opacity-95 text-white text-[15px] font-semibold transition-all btn-flame-glow active:scale-95 shadow-sm"
            >
              <span>Browse Dine-In Menu -&gt;</span>
            </Link>

            <Link
              to="/order/active"
              data-ui-radius="999"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-[#f9f9f9] border border-[#e5e7eb] text-[#262626] text-[15px] font-semibold transition-all active:scale-95 shadow-xs"
            >
              <span>Track Existing Order</span>
            </Link>
          </div>

          {/* 3 Core Feature Cards (Exact replica of original screenshot) */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center max-w-4xl mx-auto">
            {/* Card 1: Rich Visual Menu */}
            <div
              data-ui-radius="16"
              className="flex flex-col items-center bg-[#ffffff] p-7 rounded-2xl border border-[#e5e7eb] shadow-xs hover:border-[#EA580C]/40 transition-all"
            >
              <div className="w-12 h-12 rounded-full border border-[#EA580C] flex items-center justify-center text-[#EA580C] mb-5 shadow-xs bg-white">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                  <line x1="6" y1="1" x2="6" y2="4" />
                  <line x1="10" y1="1" x2="10" y2="4" />
                  <line x1="14" y1="1" x2="14" y2="4" />
                </svg>
              </div>
              <h3 className="text-[17px] font-bold text-[#262626]">Rich Visual Menu</h3>
              <p className="mt-2 text-[13px] text-[#727272] leading-relaxed">
                Explore flame-grilled dishes with detailed ingredients, portion options, and custom toppings.
              </p>
            </div>

            {/* Card 2: Sub-Second Dispatch */}
            <div
              data-ui-radius="16"
              className="flex flex-col items-center bg-[#ffffff] p-7 rounded-2xl border border-[#e5e7eb] shadow-xs hover:border-[#EA580C]/40 transition-all"
            >
              <div className="w-12 h-12 rounded-full border border-[#EA580C] flex items-center justify-center text-[#EA580C] mb-5 shadow-xs bg-white">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className="text-[17px] font-bold text-[#262626]">Sub-Second Dispatch</h3>
              <p className="mt-2 text-[13px] text-[#727272] leading-relaxed">
                Tickets reach kitchen stations instantly. Watch live order progress from prep to plating.
              </p>
            </div>

            {/* Card 3: Table Settlement */}
            <div
              data-ui-radius="16"
              className="flex flex-col items-center bg-[#ffffff] p-7 rounded-2xl border border-[#e5e7eb] shadow-xs hover:border-[#EA580C]/40 transition-all"
            >
              <div className="w-12 h-12 rounded-full border border-[#EA580C] flex items-center justify-center text-[#EA580C] mb-5 shadow-xs bg-white">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <h3 className="text-[17px] font-bold text-[#262626]">Table Settlement</h3>
              <p className="mt-2 text-[13px] text-[#727272] leading-relaxed">
                Split checks, pay with Apple Pay or card at table, or generate an instant cashier pass.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Physical Reality & Table Stand Section */}
      <section className="py-16 md:py-20 bg-[#f9f9f9] border-b border-[#e5e7eb]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#e5e7eb] text-[12px] font-bold text-[#EA580C] uppercase tracking-wider mb-4">
                Hardware-Free Operations
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#262626] tracking-tight" data-ui-balance>
                Point Camera to Order at Table T-04
              </h2>
              <p className="mt-3 text-[#727272] text-[14px] leading-relaxed" data-ui-pretty>
                Diners scan the physical acrylic tent stand on their table. The URL instantly identifies the table number without app downloads or account logins.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/stand"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#f0f0f0] border border-[#e5e7eb] text-[13px] font-semibold text-[#262626] transition-all shadow-xs"
                >
                  <span>Open QR Stand Studio -&gt;</span>
                </Link>
                <Link
                  to="/kds"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#262626] hover:bg-black text-white text-[13px] font-semibold transition-all shadow-xs"
                >
                  <span>Kitchen Line KDS Pass -&gt;</span>
                </Link>
              </div>
            </div>

            {/* Scannable Card Mockup */}
            <div className="bg-white p-6 rounded-2xl border border-[#e5e7eb] shadow-md max-w-sm mx-auto text-center w-full">
              <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#EA580C] flex items-center justify-center text-white shrink-0">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
                    </svg>
                  </div>
                  <span className="text-[13px] font-bold text-[#262626]">
                    Flame<span className="text-[#EA580C]">Link</span>
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#EA580C] text-[11px] font-mono-num font-bold">
                  Table T-04
                </span>
              </div>

              <div className="w-44 h-44 mx-auto bg-white p-2.5 rounded-xl border border-[#e5e7eb] flex items-center justify-center shadow-xs">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https%3A%2F%2Flive-kitchen.pages.dev%2Fmenu%3Ftable%3DT-04&margin=2"
                  alt="Real Scannable QR Code for Table T-04"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="mt-3.5 text-center">
                <div className="text-[13px] font-bold text-[#262626]">Point Camera to Order</div>
                <div className="text-[11px] font-mono-num text-[#727272] mt-0.5">
                  https://live-kitchen.pages.dev/menu?table=T-04
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Elevated Bottom Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          data-ui-radius="16"
          className="bg-[#262626] text-white rounded-2xl p-8 sm:p-10 shadow-xl text-center relative overflow-hidden border border-[#383838]"
        >
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-block px-3 py-1 rounded-full bg-[#383838] border border-[#484848] text-[11px] font-bold text-orange-400 uppercase tracking-wider mb-4">
              Full Restaurant Pass
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight" data-ui-balance>
              Ready to Experience FlameLink in Action?
            </h3>
            <p className="mt-3 text-[14px] text-[#b5b5b5] leading-relaxed" data-ui-pretty>
              Test the live customer self-ordering menu, trigger cooking stages, and view kitchen tickets on the real-time KDS pass.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3.5" data-ui-actions="footer-cta">
              <Link
                to={menuLink}
                className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#EA580C] hover:opacity-95 text-white text-[14px] font-semibold transition-all shadow-md btn-flame-glow active:scale-95"
              >
                Launch Live Demo Menu -&gt;
              </Link>
              <Link
                to="/kds"
                className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#383838] hover:bg-[#484848] border border-[#505050] text-white text-[14px] font-semibold transition-all active:scale-95"
              >
                Open Kitchen Line KDS -&gt;
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
