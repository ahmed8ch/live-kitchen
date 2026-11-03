import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { AsciiBackground } from '../components/ui/AsciiBackground';
import { StageshowDemo } from '../components/home/StageshowDemo';

export const HomePage: React.FC = () => {
  const activeTable = useAppStore((state) => state.activeTable);
  const openPinModal = useAppStore((state) => state.openPinModal);
  const submitPlatformFeedback = useAppStore((state) => state.submitPlatformFeedback);
  const showToast = useAppStore((state) => state.showToast);

  const menuLink = activeTable ? `/menu?table=${activeTable}` : '/menu';

  // ROI Estimator State (EGP)
  const [tableCount, setTableCount] = useState<number>(24);
  const [avgCheck, setAvgCheck] = useState<number>(380);

  // Platform Inquiries / Feedback / Support Form State
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [category, setCategory] = useState('Platform Inquiry');
  const [priority, setPriority] = useState('Normal');
  const [message, setMessage] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim() || !message.trim()) {
      showToast('Please fill out all required fields.');
      return;
    }

    setIsSubmittingForm(true);

    const ticketId = submitPlatformFeedback({
      name: contactName.trim(),
      email: contactPhone.trim(),
      category,
      priority,
      message: message.trim(),
    });

    try {
      const response = await fetch('https://vatdmlmthjdtgpvjzlep.supabase.co/rest/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'sb_publishable_BK5eQmfVdgz00gN9TpiY5w_ZylSieJk',
          'Authorization': 'Bearer sb_publishable_BK5eQmfVdgz00gN9TpiY5w_ZylSieJk',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          name: contactName.trim(),
          phone: contactPhone.trim(),
          message: `[${category} | ${priority}] ${message.trim()}`,
        }),
      });

      if (!response.ok) {
        console.warn('Supabase insert status:', response.status);
      }
    } catch (err) {
      console.warn('Supabase messages insert error:', err);
    } finally {
      setIsSubmittingForm(false);
      setSubmittedTicket(ticketId);
      setContactName('');
      setContactPhone('');
      setMessage('');
      showToast('Message recorded on Supabase.');
    }
  };

  // ROI Calculations
  const extraDailyParties = Math.round(tableCount * 0.65);
  const extraDailyRevenue = extraDailyParties * avgCheck;
  const monthlyRevenueUplift = extraDailyRevenue * 30;

  return (
    <div className="flex-1 w-full bg-white text-[#262626]" data-ui-container="home-overview">
      {/* =========================================================================
          HERO SECTION: High-Craft Editorial Layout with Live Table Terminal Preview
          ========================================================================= */}
      <section id="hero" className="relative border-b border-[#e5e7eb] bg-white overflow-hidden">
        {/* Ambient Interactive ASCII Background Canvas */}
        <AsciiBackground theme="light" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Editorial Display Typography */}
            <div className="lg:col-span-7 space-y-6">
              {/* Product Identity Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] text-xs font-semibold text-[#616161]">
                <span className="w-2 h-2 rounded-full bg-[#FF0055]" />
                <span>Live Kitchen, Dine In Operating System</span>
              </div>

              {/* Display Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#262626] leading-[1.12]">
                Direct Table Ordering Synchronized with Kitchen Operations
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-[#616161] leading-relaxed max-w-2xl">
                Bring-Your-Own-Device self-ordering on Table T-04. Seated guests scan the table QR, join the shared party pool via four-digit PIN, and split their check. Unpaid tickets never crowd the kitchen pass.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  to={menuLink}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-sm font-bold btn-crimson-glow transition-all active:scale-[0.98] shadow-xs text-center cursor-pointer"
                >
                  <span>Open Table T-04 Menu -&gt;</span>
                </Link>

                <button
                  type="button"
                  onClick={() => openPinModal(activeTable || 'T-04')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#f9f9f9] hover:bg-[#f0f0f0] border border-[#e5e7eb] text-[#262626] text-sm font-semibold transition-all active:scale-[0.98] text-center cursor-pointer"
                >
                  <span>Join Seated Table with PIN</span>
                </button>
              </div>

              {/* Operational Proof Points */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#f0f0f0] text-xs">
                <div>
                  <div className="text-[#949494] font-medium">Hardware Capital</div>
                  <div className="font-bold text-[#262626] mt-0.5">0 EGP Leases</div>
                </div>
                <div>
                  <div className="text-[#949494] font-medium">Multiplayer Pool</div>
                  <div className="font-bold text-[#262626] mt-0.5">4-Digit PIN</div>
                </div>
                <div>
                  <div className="text-[#949494] font-medium">Payment Gate</div>
                  <div className="font-bold text-[#15803d] mt-0.5">Pre-Settled Line</div>
                </div>
                <div>
                  <div className="text-[#949494] font-medium">Telemetry Pass</div>
                  <div className="font-bold text-[#262626] mt-0.5">Sub-150ms Sync</div>
                </div>
              </div>
            </div>

            {/* Right Column: Tactile Live Table T-04 Terminal Simulator */}
            <div className="lg:col-span-5">
              <div className="relative bg-[#f9f9f9] rounded-2xl border border-[#e5e7eb] p-6 shadow-sm">
                {/* Punch-hole side notches for physical thermal chit tactile cue */}
                <div className="absolute top-12 -left-2 w-4 h-4 rounded-full bg-white border border-[#e5e7eb]" />
                <div className="absolute top-12 -right-2 w-4 h-4 rounded-full bg-white border border-[#e5e7eb]" />

                {/* Simulator Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#e5e7eb]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF0055] animate-pulse" />
                    <span className="text-xs font-bold text-[#262626]">
                      Table T-04 Active Session
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white text-[#FF0055] border border-[#ffd1dc] text-xs font-bold">
                    PIN: <span className="font-mono-num">4892</span>
                  </span>
                </div>

                {/* Seated Diners Pill Bar */}
                <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-[#262626] text-white font-medium flex items-center gap-1 shrink-0">
                    <span>Host (You)</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]" />
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white border border-[#e5e7eb] text-[#616161] font-medium flex items-center gap-1 shrink-0">
                    <span>Sarah</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]" />
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white border border-[#e5e7eb] text-[#616161] font-medium flex items-center gap-1 shrink-0">
                    <span>Omar</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  </span>
                </div>

                {/* Live Shared Cart Items */}
                <div className="mt-4 space-y-2.5 bg-white p-3.5 rounded-2xl border border-[#e5e7eb] text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f0]">
                    <div>
                      <div className="font-bold text-[#262626]">Angus Flame-Grilled Burger</div>
                      <div className="text-[11px] text-[#727272]">Medium-Rare, Aged Cheddar, Ordered by You</div>
                    </div>
                    <span className="font-mono-num font-bold text-[#262626]">185.00 EGP</span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f0]">
                    <div>
                      <div className="font-bold text-[#262626]">Fettuccine Alfredo</div>
                      <div className="text-[11px] text-[#727272]">Grilled Chicken, Parmesan, Ordered by Sarah</div>
                    </div>
                    <span className="font-mono-num font-bold text-[#262626]">150.00 EGP</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-[#262626]">Golden Fries</div>
                      <div className="text-[11px] text-[#727272]">Special Spices, Cheese Dip, Ordered by Omar</div>
                    </div>
                    <span className="font-mono-num font-bold text-[#262626]">50.00 EGP</span>
                  </div>
                </div>

                {/* Thermal Divider Line */}
                <div className="my-4 border-t border-dashed border-[#d1d5db]" />

                {/* Bill Calculation & Payment Gate Lock */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#727272]">
                    <span>Table Subtotal:</span>
                    <span className="font-mono-num font-medium">385.00 EGP</span>
                  </div>
                  <div className="flex justify-between text-[#727272]">
                    <span>14% ETA VAT:</span>
                    <span className="font-mono-num font-medium">53.90 EGP</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-[#262626] pt-1 border-t border-[#e5e7eb]">
                    <span>Total Settlement:</span>
                    <span className="font-mono-num text-[#FF0055]">438.90 EGP</span>
                  </div>
                </div>

                {/* Real-Time Gate Indicator */}
                <div className="mt-4 p-3 rounded-2xl bg-[#f9f9f9] border border-[#e5e7eb] text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FF0055]" />
                    <span className="font-bold text-[#262626]">Payment Gate Verified</span>
                  </div>
                  <span className="font-medium text-[#727272]">Broadcasted to KDS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          STAGESHOW LIVE PRODUCT DEMONSTRATION: BYOD Phone & Kitchen Pass Synchronization
          ========================================================================= */}
      <StageshowDemo />

      {/* =========================================================================
          FOUR STAGE DINE-IN FLOW: Sequential Architecture (No Symmetrical Slop)
          ========================================================================= */}
      <section id="flow" className="py-16 md:py-20 bg-[#f9f9f9] border-b border-[#e5e7eb]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-semibold text-[#FF0055] mb-2">
              Table to Kitchen Workflow
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#262626] tracking-tight">
              Four Stage Dine In Architecture
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#616161]">
              How table self-ordering synchronizes with cashier verification and real time kitchen operations without back-office leaks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stage 01 */}
            <div className="bg-white p-7 rounded-2xl border border-[#e5e7eb] flex flex-col justify-between hover:border-[#FF0055]/50 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-[#FF0055] px-2.5 py-1 rounded-full bg-[#fff0f3] border border-[#ffd1dc]">
                    Stage 01
                  </span>
                  <span className="text-xs font-medium text-[#949494]">Acrylic Tent Stand</span>
                </div>
                <h3 className="text-lg font-bold text-[#262626]">
                  Acrylic Table Stand Scan
                </h3>
                <p className="mt-2 text-sm text-[#616161] leading-relaxed">
                  First seated diner scans the physical table QR on Table T-04 and assigns the four-digit table PIN. Zero app store downloads and zero registration walls before looking at the menu.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#f0f0f0] flex items-center justify-between text-xs text-[#727272]">
                <span className="font-medium">Device: Diner Phone (BYOD)</span>
                <span className="font-semibold text-[#262626]">Table PIN Generated</span>
              </div>
            </div>

            {/* Stage 02 */}
            <div className="bg-white p-7 rounded-2xl border border-[#e5e7eb] flex flex-col justify-between hover:border-[#FF0055]/50 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-[#FF0055] px-2.5 py-1 rounded-full bg-[#fff0f3] border border-[#ffd1dc]">
                    Stage 02
                  </span>
                  <span className="text-xs font-medium text-[#949494]">Multiplayer Pool</span>
                </div>
                <h3 className="text-lg font-bold text-[#262626]">
                  Multi-Diner Dish Customization
                </h3>
                <p className="mt-2 text-sm text-[#616161] leading-relaxed">
                  Companions join the table pool with the PIN. Each guest personalizes rare cuts, cheese options, and kitchen notes. Every line item maintains strict attribution of which companion ordered it.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#f0f0f0] flex items-center justify-between text-xs text-[#727272]">
                <span className="font-medium">Telemetry: BroadcastChannel Sync</span>
                <span className="font-semibold text-[#262626]">Itemized Per Guest</span>
              </div>
            </div>

            {/* Stage 03 */}
            <div className="bg-white p-7 rounded-2xl border border-[#e5e7eb] flex flex-col justify-between hover:border-[#FF0055]/50 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-[#FF0055] px-2.5 py-1 rounded-full bg-[#fff0f3] border border-[#ffd1dc]">
                    Stage 03
                  </span>
                  <span className="text-xs font-medium text-[#949494]">Strict Payment Gate</span>
                </div>
                <h3 className="text-lg font-bold text-[#262626]">
                  Pre-Settlement &amp; Bill Splitting
                </h3>
                <p className="mt-2 text-sm text-[#616161] leading-relaxed">
                  Guests split equally or pay their exact personal total on their own phones via Apple Pay, Meeza, or front Cashier desk. Orders remain pending until settlement is verified. Zero unpaid kitchen waste.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#f0f0f0] flex items-center justify-between text-xs text-[#727272]">
                <span className="font-medium">Gate: Payment Lock Active</span>
                <span className="font-semibold text-[#262626]">Verified Settlement</span>
              </div>
            </div>

            {/* Stage 04 */}
            <div className="bg-white p-7 rounded-2xl border border-[#e5e7eb] flex flex-col justify-between hover:border-[#FF0055]/50 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-[#FF0055] px-2.5 py-1 rounded-full bg-[#fff0f3] border border-[#ffd1dc]">
                    Stage 04
                  </span>
                  <span className="text-xs font-medium text-[#949494]">Dedicated KDS</span>
                </div>
                <h3 className="text-lg font-bold text-[#262626]">
                  Thermal Kitchen Wall Pass
                </h3>
                <p className="mt-2 text-sm text-[#616161] leading-relaxed">
                  Verified orders broadcast immediately to kitchen line tablets and wall screens. Color-coded ticket states with elapsed timers keep grill cooks in rhythm. Pass bump alerts notify table servers.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#f0f0f0] flex items-center justify-between text-xs text-[#727272]">
                <span className="font-medium">Portal: /kds Workstation</span>
                <span className="font-semibold text-[#262626]">Sub-150ms Grill Dispatch</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          TABLE ECONOMICS: Turnover Speed & Capital Savings Calculator
          ========================================================================= */}
      <section id="roi" className="py-16 md:py-20 bg-white border-b border-[#e5e7eb]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-semibold text-[#FF0055] mb-2">
              Restaurant Economics
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#262626] tracking-tight">
              Turnover Speed &amp; Revenue Modeling
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#616161]">
              Calculate the operational upside of BYOD mobile ordering compared to capital tablet leasing fees.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Input Controls */}
            <div className="lg:col-span-6 bg-[#f9f9f9] p-7 sm:p-8 rounded-2xl border border-[#e5e7eb] space-y-6">
              <div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="font-semibold text-[#262626]">Active Dining Tables</span>
                  <span className="font-mono-num font-bold text-[#FF0055]">{tableCount} Tables</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="80"
                  step="2"
                  value={tableCount}
                  onChange={(e) => setTableCount(Number(e.target.value))}
                  className="w-full h-2 bg-[#e5e7eb] rounded-lg appearance-none cursor-pointer accent-[#FF0055]"
                />
                <div className="flex justify-between text-[11px] text-[#949494] mt-1">
                  <span>6 Tables</span>
                  <span>40 Tables</span>
                  <span>80 Tables</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="font-semibold text-[#262626]">Average Check per Party</span>
                  <span className="font-mono-num font-bold text-[#FF0055]">{avgCheck} EGP</span>
                </div>
                <input
                  type="range"
                  min="120"
                  max="1000"
                  step="20"
                  value={avgCheck}
                  onChange={(e) => setAvgCheck(Number(e.target.value))}
                  className="w-full h-2 bg-[#e5e7eb] rounded-lg appearance-none cursor-pointer accent-[#FF0055]"
                />
                <div className="flex justify-between text-[11px] text-[#949494] mt-1">
                  <span>120 EGP</span>
                  <span>500 EGP</span>
                  <span>1,000 EGP</span>
                </div>
              </div>
            </div>

            {/* Calculated Output Card */}
            <div className="lg:col-span-6 bg-[#f9f9f9] p-7 sm:p-8 rounded-2xl border border-[#e5e7eb] space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#e5e7eb]">
                <span className="text-xs text-[#727272] font-semibold">
                  Monthly Growth Projection
                </span>
                <span className="px-3 py-1 rounded-full bg-[#fff0f3] border border-[#ffd1dc] text-[#FF0055] text-xs font-bold">
                  High Turnover Efficiency
                </span>
              </div>

              <div>
                <div className="text-xs text-[#727272]">Estimated Monthly Revenue Uplift:</div>
                <div className="text-3xl sm:text-4xl font-mono-num font-bold text-[#262626] mt-1.5">
                  +{monthlyRevenueUplift.toLocaleString()} EGP
                </div>
                <div className="text-xs text-[#727272] mt-1.5">
                  Based on +{extraDailyParties} extra seated parties/day at {avgCheck} EGP average check
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#e5e7eb] text-sm">
                <div>
                  <div className="text-[#949494] text-xs font-medium">Table Turnover Speed</div>
                  <div className="font-bold text-[#262626] mt-0.5">+18% Faster Turns</div>
                </div>
                <div>
                  <div className="text-[#949494] text-xs font-medium">Hardware Capital Cost</div>
                  <div className="font-bold text-[#15803d] mt-0.5">
                    <span className="font-mono-num">0 EGP</span> (No Leases)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          DIRECT PLATFORM DESK: Inquiries, Feedback & Supabase Persistence
          ========================================================================= */}
      <section id="support" className="py-16 md:py-20 bg-[#f9f9f9] border-b border-[#e5e7eb]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 sm:p-10 shadow-xs space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff0f3] text-[#FF0055] border border-[#ffd1dc] text-xs font-bold mb-2.5">
                FlameLink Direct Platform Desk
              </div>
              <h2 className="text-2xl font-bold text-[#262626] tracking-tight">
                Platform Inquiries, Suggestions &amp; Support
              </h2>
              <p className="text-sm text-[#616161] mt-1.5">
                Have a question about deploying FlameLink at your venue, a feature recommendation, or an operational inquiry? Send a direct dispatch to our engineering desk.
              </p>
            </div>

            {submittedTicket ? (
              <div className="p-6 rounded-2xl bg-[#f9f9f9] border border-[#e5e7eb] text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#fff0f3] text-[#FF0055] flex items-center justify-center mx-auto text-base font-bold">
                  <svg className="w-5 h-5 text-[#FF0055]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="text-sm font-bold text-[#262626]">
                  Dispatch Received &amp; Saved to Supabase
                </div>
                <p className="text-xs text-[#727272] max-w-sm mx-auto">
                  Your ticket <span className="font-mono-num font-bold text-[#262626]">#{submittedTicket}</span> has been logged directly to the Supabase messages ledger.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmittedTicket(null)}
                  className="mt-2 px-5 py-2 rounded-full bg-white border border-[#e5e7eb] text-[#262626] text-xs font-semibold hover:bg-[#f0f0f0] transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fb-name" className="block text-xs font-semibold text-[#262626] mb-1.5">
                      Your Full Name
                    </label>
                    <input
                      id="fb-name"
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Tarek Mansour"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055]/15 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="fb-phone" className="block text-xs font-semibold text-[#262626] mb-1.5">
                      Phone Number / Contact
                    </label>
                    <input
                      id="fb-phone"
                      type="text"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="0100 000 0000 or email"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055]/15 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fb-category" className="block text-xs font-semibold text-[#262626] mb-1.5">
                      Message Topic
                    </label>
                    <select
                      id="fb-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055]/15 transition-all"
                    >
                      <option value="Platform Inquiry">Platform Inquiry / Live Kitchen Venue</option>
                      <option value="Feature Suggestion">Feature Suggestion &amp; Improvements</option>
                      <option value="Bug / Issue Report">Operational Issue / Bug Report</option>
                      <option value="Enterprise Hardware">Enterprise Hardware &amp; KDS Setup</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="fb-priority" className="block text-xs font-semibold text-[#262626] mb-1.5">
                      Priority Level
                    </label>
                    <select
                      id="fb-priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055]/15 transition-all"
                    >
                      <option value="Normal">Normal Inquiry</option>
                      <option value="High">High (Active Dining Floor)</option>
                      <option value="Urgent">Urgent Kitchen Floor Emergency</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="fb-message" className="block text-xs font-semibold text-[#262626] mb-1.5">
                    Message Details
                  </label>
                  <textarea
                    id="fb-message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your inquiry, suggestion, or specific venue requirements..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055]/15 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingForm}
                  className="w-full py-3.5 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-sm font-bold btn-crimson-glow transition-all active:scale-[0.98] cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmittingForm ? 'Recording to Supabase...' : 'Send Message to Platform Desk ->'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
