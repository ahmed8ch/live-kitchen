import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { AsciiBackground } from '../components/ui/AsciiBackground';
import { FlameLinkLogo } from '../components/ui/FlameLinkLogo';

export const HomePage: React.FC = () => {
  const activeTable = useAppStore((state) => state.activeTable);
  const submitPlatformFeedback = useAppStore((state) => state.submitPlatformFeedback);
  const showToast = useAppStore((state) => state.showToast);

  const menuLink = activeTable ? `/menu?table=${activeTable}` : '/menu';

  // Section Tracking for Navigation Bar Spy
  const [activeSection, setActiveSection] = useState<'hero' | 'flow' | 'roi' | 'support'>('hero');

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const flowEl = document.getElementById('flow');
      const roiEl = document.getElementById('roi');
      const supportEl = document.getElementById('support');

      const flowTop = (flowEl?.offsetTop || 500) - 120;
      const roiTop = (roiEl?.offsetTop || 1000) - 120;
      const supportTop = (supportEl?.offsetTop || 1600) - 120;

      if (scrollY >= supportTop) {
        setActiveSection('support');
      } else if (scrollY >= roiTop) {
        setActiveSection('roi');
      } else if (scrollY >= flowTop) {
        setActiveSection('flow');
      } else {
        setActiveSection('hero');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ROI Estimator State (EGP)
  const [tableCount, setTableCount] = useState<number>(24);
  const [avgCheck, setAvgCheck] = useState<number>(380);

  // Platform Inquiries / Feedback / Support Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [category, setCategory] = useState('Platform Inquiry');
  const [priority, setPriority] = useState('Normal');
  const [message, setMessage] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !message.trim()) {
      showToast('Please fill out all required fields.');
      return;
    }

    const ticketId = submitPlatformFeedback({
      name: contactName.trim(),
      email: contactEmail.trim(),
      category,
      priority,
      message: message.trim(),
    });

    setSubmittedTicket(ticketId);
    setContactName('');
    setContactEmail('');
    setMessage('');
  };

  // ROI Calculations
  const extraDailyParties = Math.round(tableCount * 0.65);
  const extraDailyRevenue = extraDailyParties * avgCheck;
  const monthlyRevenueUplift = extraDailyRevenue * 30;

  return (
    <div className="flex-1 w-full bg-white select-none" data-ui-container="home-overview">
      {/* Top Navigation Bar with Logo, In-Page Section Anchor Links, and Quick Actions */}
      <nav
        aria-label="Home page navigation"
        className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e5e7eb] px-4 sm:px-8 py-3 flex items-center justify-between"
      >
        {/* Brand Logo with Smooth Scroll to Hero */}
        <button
          onClick={() => scrollTo('hero')}
          className="flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0055] rounded-lg text-left"
          aria-label="FlameLink Home"
        >
          <FlameLinkLogo size="md" />
        </button>

        {/* Section Navigation Links */}
        <div className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => scrollTo('flow')}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer ${
              activeSection === 'flow'
                ? 'bg-[#fff0f3] text-[#FF0055] border border-[#ffd1dc]'
                : 'text-[#616161] hover:text-[#262626] hover:bg-[#f9f9f9]'
            }`}
          >
            4-Stage Flow
          </button>

          <button
            onClick={() => scrollTo('roi')}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer ${
              activeSection === 'roi'
                ? 'bg-[#fff0f3] text-[#FF0055] border border-[#ffd1dc]'
                : 'text-[#616161] hover:text-[#262626] hover:bg-[#f9f9f9]'
            }`}
          >
            Table Economics
          </button>

          <button
            onClick={() => scrollTo('support')}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer ${
              activeSection === 'support'
                ? 'bg-[#fff0f3] text-[#FF0055] border border-[#ffd1dc]'
                : 'text-[#616161] hover:text-[#262626] hover:bg-[#f9f9f9]'
            }`}
          >
            Direct Platform Desk
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/kds"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#f9f9f9] hover:bg-[#f0f0f0] border border-[#e5e7eb] text-[#262626] text-[13px] font-medium transition-all active:scale-95 cursor-pointer"
          >
            Kitchen Pass
          </Link>

          <Link
            to={menuLink}
            className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-[13px] font-bold btn-crimson-glow transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <span>Dine-In Menu -&gt;</span>
          </Link>
        </div>
      </nav>

      {/* Mobile Horizontal Sub-Navigation for In-Page Section Anchor Jumping */}
      <div className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-[#f9f9f9] border-b border-[#e5e7eb] overflow-x-auto no-scrollbar text-[12px]">
        <button
          onClick={() => scrollTo('flow')}
          className={`px-3 py-1 rounded-full whitespace-nowrap cursor-pointer transition-colors ${
            activeSection === 'flow'
              ? 'bg-[#fff0f3] text-[#FF0055] font-semibold border border-[#ffd1dc]'
              : 'text-[#727272] bg-white border border-[#e5e7eb]'
          }`}
        >
          4-Stage Flow
        </button>
        <button
          onClick={() => scrollTo('roi')}
          className={`px-3 py-1 rounded-full whitespace-nowrap cursor-pointer transition-colors ${
            activeSection === 'roi'
              ? 'bg-[#fff0f3] text-[#FF0055] font-semibold border border-[#ffd1dc]'
              : 'text-[#727272] bg-white border border-[#e5e7eb]'
          }`}
        >
          Table Economics
        </button>
        <button
          onClick={() => scrollTo('support')}
          className={`px-3 py-1 rounded-full whitespace-nowrap cursor-pointer transition-colors ${
            activeSection === 'support'
              ? 'bg-[#fff0f3] text-[#FF0055] font-semibold border border-[#ffd1dc]'
              : 'text-[#727272] bg-white border border-[#e5e7eb]'
          }`}
        >
          Direct Platform Desk
        </button>
      </div>

      {/* Hero Card */}
      <section id="hero" className="p-4 sm:p-6 lg:p-8">
        <div className="relative bg-[#FF0055] text-white pt-16 pb-20 md:pt-24 md:pb-28 rounded-3xl sm:rounded-[32px] overflow-hidden shadow-xl shadow-[#FF0055]/10">
          {/* Ambient ASCII Background across the Hero Canvas */}
          <AsciiBackground theme="crimson" />

          <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center relative z-10">
            {/* Display Headline */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.08]"
              data-ui-balance
            >
              Turn Every Table into a Shared Dine-In Experience
            </h1>

            {/* Subtitle */}
            <p
              className="mt-6 text-base sm:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed font-normal"
              data-ui-pretty
            >
              Zero tablet leasing fees. Zero mandatory account logins. First diner sets table PIN; table pool orders together. The Payment Gate verifies settlement before food ever hits the grill line.
            </p>

            {/* High-Contrast Hero Actions */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5" data-ui-actions="hero-cta">
              <Link
                to={menuLink}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white hover:bg-[#fafafa] text-[#FF0055] text-[15px] font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <span>Open Dine-In Menu -&gt;</span>
              </Link>

              <Link
                to="/companion"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white text-[14px] font-medium backdrop-blur-xs transition-all active:scale-95 cursor-pointer"
              >
                <span>Companion Order</span>
              </Link>

              <Link
                to="/cashier"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white text-[14px] font-medium backdrop-blur-xs transition-all active:scale-95 cursor-pointer"
              >
                <span>Cashier POS</span>
              </Link>

              <Link
                to="/kds"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white text-[14px] font-medium backdrop-blur-xs transition-all active:scale-95 cursor-pointer"
              >
                <span>Kitchen Pass</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Stage Dine-In Flow */}
      <section id="flow" className="py-14 md:py-18 bg-[#f9f9f9] border-b border-[#e5e7eb]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="text-[11px] font-mono-num uppercase tracking-wider text-[#949494]">
              Operational Architecture
            </div>
            <h2 className="text-2xl font-bold text-[#262626]" data-ui-balance>
              4-Stage Dine-In Flow
            </h2>
          </div>

          {/* Clean Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#e5e7eb] border border-[#e5e7eb] rounded-2xl overflow-hidden shadow-xs relative">
            {/* Cell 1 */}
            <div className="bg-white p-6 sm:p-7 flex flex-col justify-between relative group">
              <div>
                <div className="w-8 h-8 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] text-[#FF0055] flex items-center justify-center font-mono-num font-bold text-[13px] mb-4">
                  01
                </div>
                <h3 className="text-[16px] font-bold text-[#262626]">
                  Acrylic Table Stand Scan
                </h3>
                <p className="mt-2 text-[13px] text-[#727272] leading-relaxed">
                  First diner scans table QR; assigns private 4-digit PIN. Companions enter PIN to join table pool.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#f0f0f0] text-[11px] font-mono-num text-[#949494]">
                Table Session Bound
              </div>
            </div>

            {/* Cell 2 */}
            <div className="bg-white p-6 sm:p-7 flex flex-col justify-between relative group">
              <div>
                <div className="w-8 h-8 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] text-[#FF0055] flex items-center justify-center font-mono-num font-bold text-[13px] mb-4">
                  02
                </div>
                <h3 className="text-[16px] font-bold text-[#262626]">
                  Multiplayer Dish Customization
                </h3>
                <p className="mt-2 text-[13px] text-[#727272] leading-relaxed">
                  Each guest selects rare temps, sides, and kitchen notes. Cart items track which seated diner ordered each plate.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#f0f0f0] text-[11px] font-mono-num text-[#949494]">
                Attributed Diner Items
              </div>
            </div>

            {/* Cell 3 */}
            <div className="bg-white p-6 sm:p-7 flex flex-col justify-between relative group">
              <div>
                <div className="w-8 h-8 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] text-[#FF0055] flex items-center justify-center font-mono-num font-bold text-[13px] mb-4">
                  03
                </div>
                <h3 className="text-[16px] font-bold text-[#262626]">
                  The Payment Gate
                </h3>
                <p className="mt-2 text-[13px] text-[#727272] leading-relaxed">
                  Equal split or Split by Diner. Orders remain Draft until verified online or at cashier. Zero unpaid food wastage.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#f0f0f0] text-[11px] font-mono-num text-[#949494]">
                Equal &amp; Itemized Split
              </div>
            </div>

            {/* Cell 4 */}
            <div className="bg-white p-6 sm:p-7 flex flex-col justify-between relative group">
              <div>
                <div className="w-8 h-8 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] text-[#FF0055] flex items-center justify-center font-mono-num font-bold text-[13px] mb-4">
                  04
                </div>
                <h3 className="text-[16px] font-bold text-[#262626]">
                  Thermal Kitchen Pass
                </h3>
                <p className="mt-2 text-[13px] text-[#727272] leading-relaxed">
                  Verified orders fire instantly to KDS wall pass. Color-coded ticket states (<span className="text-sky-600 font-bold">New</span>, <span className="text-amber-600 font-bold">Grill</span>, <span className="text-emerald-600 font-bold">Pass</span>).
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#f0f0f0] text-[11px] font-mono-num text-[#949494]">
                Direct Kitchen Ticket
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI & Turnover Projection Tool */}
      <section id="roi" className="py-14 bg-white border-b border-[#e5e7eb]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="text-[11px] font-mono-num uppercase tracking-wider text-[#949494]">
              Restaurant Unit Economics
            </div>
            <h2 className="text-2xl font-bold text-[#262626]">
              Turnover Speed &amp; Revenue Modeling
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Input Sliders */}
            <div className="space-y-6 bg-[#f9f9f9] p-6 sm:p-8 rounded-2xl border border-[#e5e7eb]">
              <div>
                <div className="flex justify-between text-[13px] mb-1.5">
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
                  className="w-full h-1.5 bg-[#e5e7eb] rounded-lg appearance-none cursor-pointer accent-[#FF0055]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[13px] mb-1.5">
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
                  className="w-full h-1.5 bg-[#e5e7eb] rounded-lg appearance-none cursor-pointer accent-[#FF0055]"
                />
              </div>
            </div>

            {/* Projected Output Card */}
            <div className="bg-[#f9f9f9] border border-[#e5e7eb] rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#e5e7eb]">
                <span className="text-[12px] font-mono-num uppercase text-[#949494]">
                  Monthly Growth Projection
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#fff0f3] border border-[#ffd1dc] text-[#FF0055] text-[11px] font-mono-num font-bold">
                  High-Capacity Dining
                </span>
              </div>

              <div>
                <div className="text-[12px] text-[#727272]">Estimated Monthly Revenue Uplift:</div>
                <div className="text-3xl sm:text-4xl font-mono-num font-bold text-[#262626] mt-1">
                  +{monthlyRevenueUplift.toLocaleString()} EGP
                </div>
                <div className="text-[12px] text-[#949494] mt-1 font-mono-num">
                  Based on +{extraDailyParties} extra table seatings/day @ {avgCheck} EGP check
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#e5e7eb] text-[13px]">
                <div>
                  <div className="text-[#949494] text-[11px] font-mono-num uppercase">Service Speed</div>
                  <div className="font-bold text-[#262626] mt-0.5">Faster Table Turnover</div>
                </div>
                <div>
                  <div className="text-[#949494] text-[11px] font-mono-num uppercase">Hardware Capital</div>
                  <div className="font-bold text-[#15803d] mt-0.5">0 EGP (No Hardware Leases)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Inquiries, Suggestions, Issues & Direct Support Form */}
      <section id="support" className="py-16 bg-[#f9f9f9] border-b border-[#e5e7eb]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 sm:p-9 shadow-xs space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff0f3] text-[#FF0055] border border-[#ffd1dc] text-[11px] font-mono-num font-bold uppercase tracking-wider mb-2">
                FlameLink Direct Platform Desk
              </div>
              <h2 className="text-2xl font-bold text-[#262626]">
                Inquiries, Suggestions & Issue Reports
              </h2>
              <p className="text-[13px] text-[#616161] mt-1">
                Have a question about deploying FlameLink, a feature recommendation, or experiencing an operational issue? Send a direct dispatch to our platform engineering desk.
              </p>
            </div>

            {submittedTicket ? (
              <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <div className="text-emerald-800 font-bold text-[15px]">
                  Dispatch Received & Logged
                </div>
                <p className="text-[13px] text-emerald-700">
                  Your ticket <span className="font-mono-num font-bold text-emerald-900">#{submittedTicket}</span> has been dispatched to platform operations. We will reply via email shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmittedTicket(null)}
                  className="mt-2 px-4 py-1.5 rounded-full bg-white border border-emerald-300 text-emerald-800 text-[12px] font-bold hover:bg-emerald-100 cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fb-name" className="block text-[12px] font-semibold text-[#262626] mb-1">
                      Your Name
                    </label>
                    <input
                      id="fb-name"
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Tarek Mansour"
                      className="w-full px-3.5 py-2.5 text-[13px] rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055]"
                    />
                  </div>

                  <div>
                    <label htmlFor="fb-email" className="block text-[12px] font-semibold text-[#262626] mb-1">
                      Email Address
                    </label>
                    <input
                      id="fb-email"
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="manager@restaurant.eg"
                      className="w-full px-3.5 py-2.5 text-[13px] rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fb-category" className="block text-[12px] font-semibold text-[#262626] mb-1">
                      Message Topic
                    </label>
                    <select
                      id="fb-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-[13px] rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055]"
                    >
                      <option value="Platform Inquiry">Platform Inquiry / Partnership</option>
                      <option value="Feature Suggestion">Feature Suggestion & Ideas</option>
                      <option value="Bug / Issue Report">Bug / Operational Issue Report</option>
                      <option value="Enterprise Hardware">Enterprise Hardware & Setup</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="fb-priority" className="block text-[12px] font-semibold text-[#262626] mb-1">
                      Priority Level
                    </label>
                    <select
                      id="fb-priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-[13px] rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055]"
                    >
                      <option value="Normal">Normal Inquiry</option>
                      <option value="High">High (Live Restaurant Operation)</option>
                      <option value="Urgent">Urgent System Concern</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="fb-message" className="block text-[12px] font-semibold text-[#262626] mb-1">
                    Details / Feedback / Problem Description
                  </label>
                  <textarea
                    id="fb-message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your suggestion, inquiry, or any problem you observed..."
                    className="w-full px-3.5 py-2.5 text-[13px] rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-[13px] font-bold btn-crimson-glow transition-all active:scale-[0.99] cursor-pointer shadow-xs"
                >
                  Send Message to Platform Team -&gt;
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};