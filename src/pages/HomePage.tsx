import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

// ASCII thermal characters ordered by visual density
const ASCII_RAMP = [' ', '·', ':', '+', '*', '#'];

export const HomePage: React.FC = () => {
  const activeTable = useAppStore((state) => state.activeTable);
  const addSampleOrder = useAppStore((state) => state.addSampleOrder);

  const menuLink = activeTable ? `/menu?table=${activeTable}` : '/menu';

  // Interactive Thermal Flame ASCII Matrix State
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [asciiTick, setAsciiTick] = useState<number>(0);
  const [isFiringDemo, setIsFiringDemo] = useState<boolean>(false);
  const [conduitText, setConduitText] = useState<string>('··:++*##*++:·· 142MS');

  // ROI Estimator State (EGP)
  const [tableCount, setTableCount] = useState<number>(24);
  const [avgCheck, setAvgCheck] = useState<number>(380);

  // Animation ticker for thermal flame ASCII wave
  useEffect(() => {
    const interval = setInterval(() => {
      setAsciiTick((prev) => (prev + 1) % 1000);
    }, 120);
    return () => clearInterval(interval);
  }, []);

  // Compute 7x32 ASCII matrix
  const rows = 7;
  const cols = 32;
  const asciiMatrix: string[] = [];

  for (let r = 0; r < rows; r++) {
    let rowStr = '';
    for (let c = 0; c < cols; c++) {
      let intensity = 0;
      // Ambient thermal wave
      const wave = Math.sin((c * 0.4) + (asciiTick * 0.2) + (r * 0.5));
      if (wave > 0.4) intensity = 1;
      if (wave > 0.7) intensity = 2;

      // Mouse heat radiation
      if (mousePos) {
        const dx = c - mousePos.x;
        const dy = r - mousePos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 3.5) {
          intensity = Math.min(ASCII_RAMP.length - 1, intensity + Math.floor((3.5 - dist) * 1.5) + 1);
        }
      }

      // Base bottom coals heat
      if (r === rows - 1 && Math.random() > 0.3) {
        intensity = Math.max(intensity, 2);
      }

      rowStr += ASCII_RAMP[Math.min(ASCII_RAMP.length - 1, intensity)];
    }
    asciiMatrix.push(rowStr);
  }

  const handleFireDemoOrder = () => {
    setIsFiringDemo(true);
    setConduitText('==##**PULSE**##== 24MS');
    addSampleOrder();

    setTimeout(() => {
      setIsFiringDemo(false);
      setConduitText('··:++*##*++:·· 142MS');
    }, 700);
  };

  // ROI Calculations
  const extraDailyParties = Math.round(tableCount * 0.65);
  const extraDailyRevenue = extraDailyParties * avgCheck;
  const monthlyRevenueUplift = extraDailyRevenue * 30;

  return (
    <div className="flex-1 w-full bg-white select-none pb-24" data-ui-container="home-overview">
      {/* Blueprint Sub-Grid Hero Header */}
      <section className="relative pt-12 pb-16 md:pt-16 md:pb-20 border-b border-[#e5e7eb] blueprint-dots bg-[#f9f9f9]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Top Status Capsule */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#e5e7eb] mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#FF0055]" />
            <span className="text-[12px] font-mono-num font-medium text-[#262626]">
              FLAMELINK v2.0 // MULTIPLAYER DINE-IN OS
            </span>
          </div>

          {/* Two-Tone Engineered Display Headline */}
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#262626] max-w-3xl mx-auto leading-[1.12]"
            data-ui-balance
          >
            Turn Every Table into a{' '}
            <span className="text-[#FF0055]">Synchronized Multiplayer Kitchen</span>
          </h1>

          {/* Calm Technical Subtitle */}
          <p className="mt-4 text-base sm:text-lg text-[#616161] max-w-2xl mx-auto leading-relaxed" data-ui-pretty>
            Zero tablet leasing, zero mandatory logins. First diner sets table PIN; table pool orders together. The Payment Gate verifies settlement before food ever hits the grill line.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3" data-ui-actions="hero-cta">
            <Link
              to={menuLink}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-[14px] font-medium transition-all btn-crimson-glow active:scale-[0.99] shadow-sm"
            >
              <span>Launch Dine-In Menu -&gt;</span>
            </Link>

            <Link
              to="/cashier"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-[#f0f0f0] border border-[#e5e7eb] text-[#262626] text-[14px] font-medium transition-all active:scale-[0.99] shadow-xs"
            >
              <span>Cashier Station POS</span>
            </Link>

            <Link
              to="/kds"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-[#f0f0f0] border border-[#e5e7eb] text-[#262626] text-[14px] font-medium transition-all active:scale-[0.99] shadow-xs"
            >
              <span>Kitchen Line KDS</span>
            </Link>
          </div>

          {/* Interactive Thermal Flame ASCII Matrix (DESIGN.md §4.1) */}
          <div className="mt-12 max-w-xl mx-auto">
            <div
              className="bg-[#262626] text-[#ff8da1] p-4 rounded-lg border border-[#383838] shadow-lg text-left relative overflow-hidden font-mono-num text-[11px] sm:text-[13px] leading-tight tracking-widest cursor-crosshair"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const relX = (e.clientX - rect.left) / rect.width;
                const relY = (e.clientY - rect.top) / rect.height;
                setMousePos({
                  x: Math.floor(relX * cols),
                  y: Math.floor(relY * rows),
                });
              }}
              onMouseLeave={() => setMousePos(null)}
            >
              <div className="flex items-center justify-between text-[10px] text-[#949494] pb-2 mb-2 border-b border-[#383838] font-mono-num uppercase">
                <span>[ THERMAL FLAME SENSOR MATRIX ]</span>
                <span className="text-[#FF0055] animate-pulse">ACTIVE // 800°C LINE</span>
              </div>
              <pre className="font-mono m-0 overflow-hidden select-none">
                {asciiMatrix.map((line, i) => (
                  <div key={i} className="whitespace-pre">
                    {line}
                  </div>
                ))}
              </pre>
              <div className="pt-2 mt-2 border-t border-[#383838] flex items-center justify-between text-[10px] text-[#949494]">
                <span>Hover cursor to deflect flame line heat</span>
                <span className="font-mono-num">FPS: 60 • RTT: 1.2ms</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live ASCII WebSocket Conduit Bar (DESIGN.md §4.1 & §4.3) */}
      <section className="bg-white border-b border-[#e5e7eb] py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#15803d]" />
            <span className="text-[12px] font-mono-num font-medium text-[#262626]">
              LINE BROADCAST CONDUIT:
            </span>
          </div>

          {/* ASCII Wire */}
          <div
            className={`font-mono-num text-[12px] sm:text-[13px] px-4 py-1.5 rounded-lg border transition-all ${
              isFiringDemo
                ? 'bg-[#fff0f3] border-[#FF0055] text-[#FF0055] btn-crimson-glow-sm'
                : 'bg-[#f9f9f9] border-[#e5e7eb] text-[#262626]'
            }`}
          >
            TABLE T-04 ──[ <span className="text-[#FF0055] font-medium">{conduitText}</span> ]──&gt; FLAME PASS
          </div>

          <button
            onClick={handleFireDemoOrder}
            className="px-4 py-1.5 rounded-full bg-[#262626] hover:bg-black text-white text-[12px] font-mono-num font-medium transition-all active:scale-95 cursor-pointer shadow-xs shrink-0"
          >
            Fire Demo Order Ticket
          </button>
        </div>
      </section>

      {/* Asymmetric Bento Blueprint Grid (DESIGN.md §4.3) */}
      <section className="py-12 md:py-16 bg-[#f9f9f9] border-b border-[#e5e7eb]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-[11px] font-mono-num uppercase tracking-wider text-[#949494]">
                Architecture Blueprint
              </div>
              <h2 className="text-2xl font-medium text-[#262626]" data-ui-balance>
                Synchronized 4-Stage Dine-In Flow
              </h2>
            </div>
            <span className="hidden sm:inline text-[12px] font-mono-num text-[#727272]">
              Hairline Exposed Grid • 1px Mesh
            </span>
          </div>

          {/* Exposed Hairline Bento Grid with Corner Crosshairs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-[#e5e7eb] border border-[#e5e7eb] rounded-2xl overflow-hidden shadow-xs relative">
            {/* Cell 1: Acrylic Table Stand Scan & PIN Lobby */}
            <div className="bg-white p-6 sm:p-7 flex flex-col justify-between relative group card-glow-hover">
              <span className="absolute top-2 right-2 text-[#b5b5b5] font-mono text-[10px]">+</span>
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#f9f9f9] border border-[#e5e7eb] flex items-center justify-center text-[#FF0055] mb-4">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                </div>
                <div className="text-[12px] font-mono-num text-[#949494] uppercase">01 // Entry Point</div>
                <h3 className="text-[17px] font-medium text-[#262626] mt-1">PIN Table Pool</h3>
                <p className="mt-2 text-[13px] text-[#616161] leading-relaxed">
                  First diner generates a 4-digit PIN. Friends enter the PIN to join the shared cart without downloading an app.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#e5e7eb]">
                <Link to="/stand" className="text-[12px] font-medium text-[#FF0055] hover:underline">
                  Launch Stand Studio -&gt;
                </Link>
              </div>
            </div>

            {/* Cell 2: Self-Ordering & Customization */}
            <div className="bg-white p-6 sm:p-7 flex flex-col justify-between relative group card-glow-hover">
              <span className="absolute top-2 right-2 text-[#b5b5b5] font-mono text-[10px]">+</span>
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#f9f9f9] border border-[#e5e7eb] flex items-center justify-center text-[#FF0055] mb-4">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                    <line x1="6" y1="1" x2="6" y2="4" />
                    <line x1="10" y1="1" x2="10" y2="4" />
                    <line x1="14" y1="1" x2="14" y2="4" />
                  </svg>
                </div>
                <div className="text-[12px] font-mono-num text-[#949494] uppercase">02 // Culinary Menu</div>
                <h3 className="text-[17px] font-medium text-[#262626] mt-1">Shared Touch Cart</h3>
                <p className="mt-2 text-[13px] text-[#616161] leading-relaxed">
                  Touch anywhere on dish cards to customize. Items group by diner: "Sarah's Order", "Your Order".
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#e5e7eb]">
                <Link to={menuLink} className="text-[12px] font-medium text-[#FF0055] hover:underline">
                  Browse 14 Dishes -&gt;
                </Link>
              </div>
            </div>

            {/* Cell 3: The Payment Gate */}
            <div className="bg-white p-6 sm:p-7 flex flex-col justify-between relative group card-glow-hover">
              <span className="absolute top-2 right-2 text-[#b5b5b5] font-mono text-[10px]">+</span>
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#f9f9f9] border border-[#e5e7eb] flex items-center justify-center text-[#FF0055] mb-4">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                    <line x1="7" y1="15" x2="7.01" y2="15" strokeWidth="2.5" />
                    <line x1="11" y1="15" x2="17" y2="15" strokeWidth="2" />
                  </svg>
                </div>
                <div className="text-[12px] font-mono-num text-[#949494] uppercase">03 // The Payment Gate</div>
                <h3 className="text-[17px] font-medium text-[#262626] mt-1">Cashier Station</h3>
                <p className="mt-2 text-[13px] text-[#616161] leading-relaxed">
                  Orders are locked from kitchen until paid online or verified at the cashier desk via Chit #PAY-XX.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#e5e7eb]">
                <Link to="/cashier" className="text-[12px] font-medium text-[#FF0055] hover:underline">
                  Open Cashier POS -&gt;
                </Link>
              </div>
            </div>

            {/* Cell 4: KDS Thermal Pass */}
            <div className="bg-white p-6 sm:p-7 flex flex-col justify-between relative group card-glow-hover">
              <span className="absolute top-2 right-2 text-[#b5b5b5] font-mono text-[10px]">+</span>
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#f9f9f9] border border-[#e5e7eb] flex items-center justify-center text-[#FF0055] mb-4">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
                <div className="text-[12px] font-mono-num text-[#949494] uppercase">04 // Kitchen Pass</div>
                <h3 className="text-[17px] font-medium text-[#262626] mt-1">Thermal Chit KDS</h3>
                <p className="mt-2 text-[13px] text-[#616161] leading-relaxed">
                  24px headers, 20px dish names, 18px bold crimson modifiers. Sticky batch totals for high-speed line cooks.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#e5e7eb]">
                <Link to="/kds" className="text-[12px] font-medium text-[#FF0055] hover:underline">
                  Open Kitchen Pass -&gt;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Restaurant Table-Turn & ROI Estimator (in EGP) */}
      <section className="py-12 md:py-16 bg-white border-b border-[#e5e7eb]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] text-[11px] font-mono-num font-medium text-[#FF0055] uppercase mb-4">
                Economic Impact Model
              </div>
              <h2 className="text-2xl sm:text-3xl font-medium text-[#262626] tracking-tight" data-ui-balance>
                Restaurant Table-Turn & ROI Estimator
              </h2>
              <p className="mt-3 text-[14px] text-[#616161] leading-relaxed" data-ui-pretty>
                Diners place orders 4.5 minutes faster and pay at table in 30 seconds without waiting for a server. Calculate your projected monthly revenue increase in Egyptian Pounds.
              </p>

              {/* Sliders */}
              <div className="mt-6 space-y-5">
                <div>
                  <div className="flex justify-between text-[13px] mb-1.5">
                    <span className="font-medium text-[#262626]">Active Dining Tables</span>
                    <span className="font-mono-num font-medium text-[#FF0055]" data-ui-number>
                      {tableCount} Tables
                    </span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="80"
                    step="2"
                    value={tableCount}
                    aria-label="Active Dining Tables Count"
                    onChange={(e) => setTableCount(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#e5e7eb] rounded-lg appearance-none cursor-pointer accent-[#FF0055]"
                  />
                  <div className="flex justify-between text-[11px] text-[#949494] font-mono-num mt-1">
                    <span>6 Tables</span>
                    <span>80 Tables</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[13px] mb-1.5">
                    <span className="font-medium text-[#262626]">Average Check per Party</span>
                    <span className="font-mono-num font-medium text-[#FF0055]" data-ui-number>
                      {avgCheck} EGP
                    </span>
                  </div>
                  <input
                    type="range"
                    min="120"
                    max="1000"
                    step="20"
                    value={avgCheck}
                    aria-label="Average Check per Party in EGP"
                    onChange={(e) => setAvgCheck(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#e5e7eb] rounded-lg appearance-none cursor-pointer accent-[#FF0055]"
                  />
                  <div className="flex justify-between text-[11px] text-[#949494] font-mono-num mt-1">
                    <span>120 EGP</span>
                    <span>1,000 EGP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Projected Output Card */}
            <div className="bg-[#f9f9f9] border border-[#e5e7eb] rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#e5e7eb]">
                <span className="text-[12px] font-mono-num uppercase text-[#949494]">
                  Monthly Growth Projection
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#fff0f3] border border-[#ffd1dc] text-[#FF0055] text-[11px] font-mono-num font-medium">
                  +22% TABLE TURNS
                </span>
              </div>

              <div>
                <div className="text-[12px] text-[#727272]">Estimated Monthly Revenue Uplift:</div>
                <div className="text-3xl sm:text-4xl font-mono-num font-medium text-[#262626] mt-1" data-ui-number>
                  +{monthlyRevenueUplift.toLocaleString()} EGP
                </div>
                <div className="text-[12px] text-[#949494] mt-1 font-mono-num">
                  Based on +{extraDailyParties} extra table seatings/day @ {avgCheck} EGP check
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#e5e7eb] text-[13px]">
                <div>
                  <div className="text-[#949494] text-[11px] font-mono-num uppercase">Service Speed</div>
                  <div className="font-medium text-[#262626] mt-0.5">-18 min / party</div>
                </div>
                <div>
                  <div className="text-[#949494] text-[11px] font-mono-num uppercase">Hardware Capital</div>
                  <div className="font-medium text-[#15803d] mt-0.5">0 EGP (No Tablets)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
