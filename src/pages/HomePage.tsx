import React from 'react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  return (
    <div className="flex-1 w-full bg-white">
      {/* Hero Section with Warm Stone & Radial Dot Matrix */}
      <section
        className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden border-b border-[#e5e7eb]"
        style={{
          backgroundColor: '#faf8f5',
          backgroundImage: 'radial-gradient(#e2e8f0 1.2px, transparent 1.2px)',
          backgroundSize: '24px 24px',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#e5e7eb] mb-8 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#ea580c]" />
            <span className="text-[12px] font-semibold text-[#0f172a] uppercase tracking-wider">
              NEW &bull; Zero-Friction Table Self-Ordering
            </span>
          </div>

          {/* Two-Tone Hero Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.14]">
            <span className="text-[#0f172a] block">
              Turn Every Restaurant Table into a
            </span>
            <span className="text-[#ea580c] block mt-1">
              Self-Ordering Experience
            </span>
          </h1>

          {/* B2B Consistency Subheadline */}
          <p className="mt-6 text-lg sm:text-xl text-[#727272] max-w-2xl mx-auto leading-relaxed">
            Eliminate waitstaff bottlenecks, turn tables 42% faster, and route customized table orders straight to your kitchen display screens with zero tablet hardware.
          </p>

          {/* Call to Actions */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/menu"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#ea580c] hover:bg-[#c2410c] text-white text-[15px] font-semibold transition-all shadow-sm active:scale-95"
            >
              <span>Browse Dine-In Menu</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              to="/kds"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-white hover:bg-[#f9f9f9] border border-[#e5e7eb] text-[#0f172a] text-[15px] font-semibold transition-all shadow-xs active:scale-95"
            >
              <span>Open Kitchen KDS</span>
              <svg className="w-4 h-4 text-[#727272]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </Link>
          </div>

          {/* 4 Metric Cards */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-xl bg-white border border-[#e5e7eb] text-center shadow-xs">
              <div className="text-2xl font-bold font-mono-num text-[#0f172a]">0s</div>
              <div className="text-[12px] font-medium text-[#727272] mt-0.5">App Download Friction</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#e5e7eb] text-center shadow-xs">
              <div className="text-2xl font-bold font-mono-num text-[#ea580c]">42%</div>
              <div className="text-[12px] font-medium text-[#727272] mt-0.5">Faster Table Turnover</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#e5e7eb] text-center shadow-xs">
              <div className="text-2xl font-bold font-mono-num text-[#0f172a]">14%</div>
              <div className="text-[12px] font-medium text-[#727272] mt-0.5">ETA VAT Compliance</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#e5e7eb] text-center shadow-xs">
              <div className="text-2xl font-bold font-mono-num text-[#0f172a]">&lt; 1.2s</div>
              <div className="text-[12px] font-medium text-[#727272] mt-0.5">Kitchen Ticket Dispatch</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars Section */}
      <section id="features" className="py-20 md:py-28 bg-[#fafafa] border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-[12px] font-bold text-[#ea580c] uppercase tracking-wider">
              Core Capabilities
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
              Built for High-Volume Dining Operations
            </h2>
            <p className="mt-4 text-[#727272] text-[16px] leading-relaxed">
              Designed from first principles to eliminate waitstaff bottlenecks and sync every table order with kitchen line stations.
            </p>
          </div>

          {/* 3 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1: Culinary Utensils / Menu Icon (Replaced $) */}
            <div className="flex flex-col bg-white p-8 rounded-2xl border border-[#e5e7eb] shadow-xs hover:border-[#ea580c]/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ea580c] mb-6">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2v20M2 12h10M2 6h10M2 18h10M18 6a4 4 0 0 0-4 4v4a4 4 0 0 0 4 4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#0f172a]">Rich Visual Menu</h3>
              <p className="mt-3 text-[14px] text-[#727272] leading-relaxed flex-1">
                Detailed ingredient breakdown, calorie counts, portion sizing, and custom add-on modifiers. High-resolution culinary previews stimulate diner appetite and elevate check averages.
              </p>
              <div className="mt-6 pt-6 border-t border-[#e5e7eb] text-[13px] font-semibold text-[#ea580c] inline-flex items-center gap-1.5">
                <span>Interactive modifier modals</span>
                <span className="font-mono-num">&rarr;</span>
              </div>
            </div>

            {/* Pillar 2: Sub-Second Dispatch */}
            <div className="flex flex-col bg-white p-8 rounded-2xl border border-[#e5e7eb] shadow-xs hover:border-[#ea580c]/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ea580c] mb-6">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#0f172a]">Sub-Second Dispatch</h3>
              <p className="mt-3 text-[14px] text-[#727272] leading-relaxed flex-1">
                Instant kitchen station tickets dispatching directly to line cook KDS displays. Real-time 4-stage tracking allows customers to follow food preparation from order intake to table delivery.
              </p>
              <div className="mt-6 pt-6 border-t border-[#e5e7eb] text-[13px] font-semibold text-[#ea580c] inline-flex items-center gap-1.5">
                <span>Cross-tab KDS synchronization</span>
                <span className="font-mono-num">&rarr;</span>
              </div>
            </div>

            {/* Pillar 3: Table Settlement */}
            <div className="flex flex-col bg-white p-8 rounded-2xl border border-[#e5e7eb] shadow-xs hover:border-[#ea580c]/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ea580c] mb-6">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#0f172a]">Table Settlement & 14% Tax Engine</h3>
              <p className="mt-3 text-[14px] text-[#727272] leading-relaxed flex-1">
                Egyptian Tax Authority (ETA) compliant 14% VAT receipt calculations. Diners can split bills evenly 2, 3, or 4 ways and settle directly at the table with Apple Pay or pay at the front cashier.
              </p>
              <div className="mt-6 pt-6 border-t border-[#e5e7eb] text-[13px] font-semibold text-[#ea580c] inline-flex items-center gap-1.5">
                <span>Direct table checkouts</span>
                <span className="font-mono-num">&rarr;</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Physical Flow & Real Scannable Table Stand Section */}
      <section className="py-20 md:py-28 bg-white border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] text-[12px] font-bold text-[#ea580c] uppercase tracking-wider mb-4">
                First-Principles Architecture
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
                Physical Reality Meets Instant Digital Execution
              </h2>
              <p className="mt-4 text-[#727272] text-[15px] leading-relaxed">
                Customers sitting at a physical table simply point their camera at the acrylic table stand. The URL parameter immediately anchors their device to that exact table number, bypassing waitstaff queues.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] flex items-center justify-center text-[12px] font-mono-num font-bold text-[#0f172a] shrink-0 mt-0.5">
                    01
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-[#0f172a]">Seated QR Scan</h3>
                    <p className="text-[13px] text-[#727272] mt-0.5">
                      No app download, no account registration. Direct access to the full restaurant menu.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] flex items-center justify-center text-[12px] font-mono-num font-bold text-[#0f172a] shrink-0 mt-0.5">
                    02
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-[#0f172a]">Instant Kitchen Firing</h3>
                    <p className="text-[13px] text-[#727272] mt-0.5">
                      Tickets route simultaneously to line cook screens, complete with custom modifiers and allergy notes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] flex items-center justify-center text-[12px] font-mono-num font-bold text-[#0f172a] shrink-0 mt-0.5">
                    03
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-[#0f172a]">Frictionless Table Settlement</h3>
                    <p className="text-[13px] text-[#727272] mt-0.5">
                      Itemized 14% VAT receipt with instant bill-splitting. Pay at table or present cashier pass at exit.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  to="/stand"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#f9f9f9] hover:bg-[#f0f0f0] border border-[#e5e7eb] text-[13px] font-semibold text-[#0f172a] transition-all"
                >
                  <span>Preview Acrylic Table Stand Studio</span>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Stand & Card Preview Graphic with Real Scannable QR Code */}
            <div className="bg-[#f9f9f9] p-8 rounded-2xl border border-[#e5e7eb] flex flex-col items-center text-center shadow-xs">
              <div className="w-full max-w-sm bg-white p-6 rounded-2xl border border-[#e5e7eb] shadow-md">
                <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#ea580c] flex items-center justify-center text-white shrink-0">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
                      </svg>
                    </div>
                    <span className="text-[13px] font-bold text-[#0f172a]">
                      Matbakh<span className="text-[#ea580c]">Link</span>
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#ea580c] text-[11px] font-mono-num font-bold">
                    Table T-04
                  </span>
                </div>

                {/* Real Scannable QR Code */}
                <div className="w-48 h-48 mx-auto bg-white p-2.5 rounded-xl border border-[#e5e7eb] flex items-center justify-center shadow-xs">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https%3A%2F%2Flive-kitchen.pages.dev%2Fmenu%3Ftable%3DT-04&margin=2"
                    alt="Real Scannable QR Code for Table T-04"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // High-density crisp SVG fallback
                      (e.currentTarget as HTMLImageElement).src =
                        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33 33" fill="%230f172a"><rect x="0" y="0" width="33" height="33" fill="white"/><rect x="3" y="3" width="7" height="7"/><rect x="4" y="4" width="5" height="5" fill="white"/><rect x="5" y="5" width="3" height="3"/><rect x="23" y="3" width="7" height="7"/><rect x="24" y="4" width="5" height="5" fill="white"/><rect x="25" y="5" width="3" height="3"/><rect x="3" y="23" width="7" height="7"/><rect x="4" y="24" width="5" height="5" fill="white"/><rect x="5" y="25" width="3" height="3"/><rect x="12" y="4" width="2" height="4"/><rect x="16" y="3" width="3" height="2"/><rect x="15" y="7" width="4" height="2"/><rect x="12" y="12" width="9" height="9"/><rect x="14" y="14" width="5" height="5" fill="white"/><rect x="15" y="15" width="3" height="3"/><rect x="4" y="12" width="2" height="7"/><rect x="8" y="14" width="2" height="5"/><rect x="23" y="12" width="7" height="2"/><rect x="25" y="16" width="5" height="3"/><rect x="12" y="23" width="3" height="6"/><rect x="18" y="25" width="4" height="4"/><rect x="24" y="24" width="6" height="6"/></svg>';
                    }}
                  />
                </div>

                <div className="mt-4 text-center">
                  <div className="text-[13px] font-bold text-[#0f172a]">Point Camera to Order</div>
                  <div className="text-[11px] font-mono-num text-[#727272] mt-0.5">
                    https://live-kitchen.pages.dev/menu?table=T-04
                  </div>
                </div>
              </div>

              <div className="mt-4 text-[12px] text-[#727272]">
                Verified high-contrast optical standard for acrylic dine-in tabletop displays.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upgraded High-Contrast Dark Charcoal CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-14 shadow-xl text-center relative overflow-hidden border border-slate-800">
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[12px] font-semibold text-orange-400 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#ea580c]" />
              <span>Full Restaurant Operations Pass</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Ready to Experience MatbakhLink in Action?
            </h3>
            <p className="mt-4 text-[16px] text-slate-300 leading-relaxed">
              Test the live customer self-ordering menu, trigger cooking stages, and view kitchen tickets on the real-time KDS pass.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/menu"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#ea580c] hover:bg-[#c2410c] text-white text-[15px] font-semibold transition-all shadow-md active:scale-95"
              >
                Launch Live Demo Menu &rarr;
              </Link>
              <Link
                to="/kds"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-[15px] font-semibold transition-all active:scale-95"
              >
                Open Kitchen Line KDS &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
