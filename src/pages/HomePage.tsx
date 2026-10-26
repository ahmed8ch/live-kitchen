import React from 'react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  return (
    <div className="flex-1 w-full bg-white">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] mb-8 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#ff4d00]" />
            <span className="text-[12px] font-semibold text-[#262626] uppercase tracking-wider">
              NEW · Zero-Friction Table Self-Ordering
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#262626] max-w-4xl mx-auto leading-[1.12]">
            Turn Every Restaurant Table into a Self-Ordering Experience
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg sm:text-xl text-[#727272] max-w-2xl mx-auto leading-relaxed">
            Browse our handcrafted menu, customize toppings and portions, and send your order directly to the flame line cooks in real-time.
          </p>

          {/* Call to Actions */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/menu"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#ff4d00] hover:bg-[#e04400] text-white text-[15px] font-semibold transition-all shadow-sm active:scale-95"
            >
              <span>Browse Dine-In Menu</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              to="/kds"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#f9f9f9] hover:bg-[#f0f0f0] border border-[#e5e7eb] text-[#262626] text-[15px] font-semibold transition-all active:scale-95"
            >
              <span>Open Kitchen KDS</span>
              <svg className="w-4 h-4 text-[#727272]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </Link>
          </div>

          {/* Live Metric Badges */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-xl bg-[#f9f9f9] border border-[#e5e7eb] text-center">
              <div className="text-2xl font-bold font-mono-num text-[#262626]">0s</div>
              <div className="text-[12px] font-medium text-[#727272] mt-0.5">App Download Friction</div>
            </div>
            <div className="p-4 rounded-xl bg-[#f9f9f9] border border-[#e5e7eb] text-center">
              <div className="text-2xl font-bold font-mono-num text-[#ff4d00]">42%</div>
              <div className="text-[12px] font-medium text-[#727272] mt-0.5">Faster Table Turnover</div>
            </div>
            <div className="p-4 rounded-xl bg-[#f9f9f9] border border-[#e5e7eb] text-center">
              <div className="text-2xl font-bold font-mono-num text-[#262626]">14%</div>
              <div className="text-[12px] font-medium text-[#727272] mt-0.5">ETA VAT Compliance</div>
            </div>
            <div className="p-4 rounded-xl bg-[#f9f9f9] border border-[#e5e7eb] text-center">
              <div className="text-2xl font-bold font-mono-num text-[#262626]">&lt; 1.2s</div>
              <div className="text-[12px] font-medium text-[#727272] mt-0.5">Kitchen Ticket Dispatch</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars Section */}
      <section id="features" className="py-20 md:py-28 bg-[#fafafa] border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-[12px] font-bold text-[#ff4d00] uppercase tracking-wider">
              Core Capabilities
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#262626] tracking-tight">
              Built for High-Volume Dining Operations
            </h2>
            <p className="mt-4 text-[#727272] text-[16px] leading-relaxed">
              Designed from first principles to eliminate waitstaff bottlenecks and sync every table order with kitchen line stations.
            </p>
          </div>

          {/* 3 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="flex flex-col bg-white p-8 rounded-2xl border border-[#e5e7eb] shadow-xs hover:border-[#ff4d00]/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ff4d00] mb-6">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#262626]">Rich Visual Menu</h3>
              <p className="mt-3 text-[14px] text-[#727272] leading-relaxed flex-1">
                Detailed ingredient breakdown, calorie counts, portion sizing, and custom add-on modifiers. High-resolution culinary previews stimulate diner appetite and elevate check averages.
              </p>
              <div className="mt-6 pt-6 border-t border-[#e5e7eb] text-[13px] font-semibold text-[#ff4d00] inline-flex items-center gap-1.5">
                <span>Interactive modifier modals</span>
                <span className="font-mono-num">&rarr;</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="flex flex-col bg-white p-8 rounded-2xl border border-[#e5e7eb] shadow-xs hover:border-[#ff4d00]/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ff4d00] mb-6">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#262626]">Sub-Second Dispatch</h3>
              <p className="mt-3 text-[14px] text-[#727272] leading-relaxed flex-1">
                Instant kitchen station tickets dispatching directly to line cook KDS displays. Real-time 4-stage tracking allows customers to follow food preparation from order intake to table delivery.
              </p>
              <div className="mt-6 pt-6 border-t border-[#e5e7eb] text-[13px] font-semibold text-[#ff4d00] inline-flex items-center gap-1.5">
                <span>Cross-tab KDS synchronization</span>
                <span className="font-mono-num">&rarr;</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="flex flex-col bg-white p-8 rounded-2xl border border-[#e5e7eb] shadow-xs hover:border-[#ff4d00]/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ff4d00] mb-6">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#262626]">Table Settlement & 14% Tax Engine</h3>
              <p className="mt-3 text-[14px] text-[#727272] leading-relaxed flex-1">
                Egyptian Tax Authority (ETA) compliant 14% VAT receipt calculations. Diners can split bills evenly 2, 3, or 4 ways and settle directly at the table with Apple Pay or pay at the front cashier.
              </p>
              <div className="mt-6 pt-6 border-t border-[#e5e7eb] text-[13px] font-semibold text-[#ff4d00] inline-flex items-center gap-1.5">
                <span>Direct table checkouts</span>
                <span className="font-mono-num">&rarr;</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Physical Flow & Table Stand Section */}
      <section className="py-20 md:py-28 bg-white border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] text-[12px] font-bold text-[#ff4d00] uppercase tracking-wider mb-4">
                First-Principles Architecture
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#262626] tracking-tight">
                Physical Reality Meets Instant Digital Execution
              </h2>
              <p className="mt-4 text-[#727272] text-[15px] leading-relaxed">
                Customers sitting at a physical table simply point their camera at the acrylic table stand. The URL parameter immediately anchors their device to that exact table number, bypassing waitstaff queues.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] flex items-center justify-center text-[12px] font-mono-num font-bold text-[#262626] shrink-0 mt-0.5">
                    01
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-[#262626]">Seated QR Scan</h4>
                    <p className="text-[13px] text-[#727272] mt-0.5">
                      No app download, no account registration. Direct access to the full restaurant menu.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] flex items-center justify-center text-[12px] font-mono-num font-bold text-[#262626] shrink-0 mt-0.5">
                    02
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-[#262626]">Instant Kitchen Firing</h4>
                    <p className="text-[13px] text-[#727272] mt-0.5">
                      Tickets route simultaneously to line cook screens, complete with custom modifiers and allergy notes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] flex items-center justify-center text-[12px] font-mono-num font-bold text-[#262626] shrink-0 mt-0.5">
                    03
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-[#262626]">Frictionless Table Settlement</h4>
                    <p className="text-[13px] text-[#727272] mt-0.5">
                      Itemized 14% VAT receipt with instant bill-splitting. Pay at table or present cashier pass at exit.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  to="/stand"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#f9f9f9] hover:bg-[#f0f0f0] border border-[#e5e7eb] text-[13px] font-semibold text-[#262626] transition-all"
                >
                  <span>Preview Acrylic Table Stand Studio</span>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Stand & Card Preview Graphic */}
            <div className="bg-[#f9f9f9] p-8 rounded-2xl border border-[#e5e7eb] flex flex-col items-center text-center">
              <div className="w-full max-w-sm bg-white p-6 rounded-2xl border border-[#e5e7eb] shadow-sm">
                <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#ff4d00] flex items-center justify-center text-white">
                      <span className="text-[10px] font-bold">ML</span>
                    </div>
                    <span className="text-[13px] font-bold text-[#262626]">MatbakhLink Stand</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#ff4d00] text-[11px] font-mono-num font-bold">
                    Table T-04
                  </span>
                </div>

                {/* Simulated QR Code Graphic */}
                <div className="w-44 h-44 mx-auto bg-white p-3 rounded-xl border border-[#e5e7eb] flex items-center justify-center shadow-xs">
                  <svg className="w-full h-full text-[#262626]" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="10" y="10" width="24" height="24" rx="2" fill="none" stroke="currentColor" strokeWidth="4" />
                    <rect x="16" y="16" width="12" height="12" />
                    <rect x="66" y="10" width="24" height="24" rx="2" fill="none" stroke="currentColor" strokeWidth="4" />
                    <rect x="72" y="16" width="12" height="12" />
                    <rect x="10" y="66" width="24" height="24" rx="2" fill="none" stroke="currentColor" strokeWidth="4" />
                    <rect x="16" y="72" width="12" height="12" />
                    <rect x="42" y="16" width="6" height="12" />
                    <rect x="52" y="24" width="6" height="14" />
                    <rect x="42" y="44" width="16" height="12" />
                    <rect x="68" y="44" width="18" height="6" />
                    <rect x="78" y="56" width="8" height="18" />
                    <rect x="42" y="66" width="8" height="18" />
                    <rect x="56" y="74" width="14" height="10" />
                  </svg>
                </div>

                <div className="mt-4 text-center">
                  <div className="text-[13px] font-bold text-[#262626]">Point Camera to Order</div>
                  <div className="text-[11px] font-mono-num text-[#727272] mt-0.5">https://live-kitchen.pages.dev/menu?table=T-04</div>
                </div>
              </div>

              <div className="mt-4 text-[12px] text-[#727272]">
                Verified high-contrast optical standard for acrylic dine-in tabletop displays.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="py-16 bg-[#fafafa]">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#262626]">
            Ready to Experience MatbakhLink in Action?
          </h3>
          <p className="mt-3 text-[15px] text-[#727272] max-w-xl mx-auto">
            Test the live customer self-ordering menu, trigger cooking stages, and view kitchen tickets on the real-time KDS pass.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/menu"
              className="px-6 py-3 rounded-full bg-[#ff4d00] hover:bg-[#e04400] text-white text-[14px] font-semibold transition-all shadow-sm"
            >
              Launch Live Demo Menu &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
