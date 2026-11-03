import React, { useState, useEffect } from 'react';
import { Stage, Window, Phone } from '../../stageshow';
import { FlameLinkLogo } from '../ui/FlameLinkLogo';

export const StageshowDemo: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [orderSent, setOrderSent] = useState<boolean>(true);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(142);
  const [selectedBurger, setSelectedBurger] = useState<string>('Smoked Brisket Flame Burger');

  // Live timer for kitchen pass chit
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const STEPS = [
    {
      id: 0,
      title: 'Table 4 Self-Order & KDS Sync',
      subtitle: 'Diner selects items on personal phone; kitchen pass receives ticket in real time.',
    },
    {
      id: 1,
      title: 'Distributed Companion Settlement',
      subtitle: 'Each diner settles their own share via Apple Pay without passing cards.',
    },
    {
      id: 2,
      title: 'Zero Tablet Leases',
      subtitle: 'Acrylic QR stand replaces expensive tablet hardware and eliminates maintenance fees.',
    },
  ];

  return (
    <section className="py-14 sm:py-20 border-b border-[#e5e7eb] bg-[#f9f9f9]" aria-label="Stageshow Live Product Demonstration">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#e5e7eb]">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#e5e7eb] text-[#262626] text-xs font-medium shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#FF0055] animate-pulse" />
              <span>Live Device Pairing Demonstration</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#262626]">
              Real-Time Dine-In Synchronization
            </h2>
            <p className="text-sm text-[#727272] leading-relaxed">
              Watch how seated diners at Table 4 place orders on their personal mobile devices, instantly triggering tickets on the back-office Kitchen Display System without tablet kiosks.
            </p>
          </div>

          {/* Interactive Step Switcher */}
          <div className="flex flex-wrap gap-2">
            {STEPS.map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`min-h-[44px] px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                  activeStep === step.id
                    ? 'bg-[#FF0055] text-white border-[#FF0055] btn-crimson-glow shadow-xs'
                    : 'bg-white text-[#616161] border-[#e5e7eb] hover:text-[#262626] hover:bg-[#f9f9f9]'
                }`}
              >
                {step.title.split('&')[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {/* Stageshow Canvas */}
        <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4 sm:p-8 shadow-xs overflow-hidden">
          <Stage
            width={880}
            height={520}
            compact={{ below: 768, width: 358, height: 600 }}
            className="w-full flex items-center justify-center relative"
          >
            {() => (
              <div className="w-full h-full flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8 py-4">
                {/* 1. SEATED DINER PHONE (LEFT) */}
                <div className="w-full max-w-[320px] shrink-0">
                  <Phone
                    width={290}
                    frame="pro"
                    className="shadow-xl mx-auto border border-[#e5e7eb]"
                  >
                    <div className="p-4 bg-white min-h-[460px] flex flex-col justify-between text-left select-none font-sans">
                      {/* Phone App Header */}
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-[#e5e7eb]">
                          <FlameLinkLogo size="sm" showWordmark={true} />
                          <span className="px-2 py-0.5 rounded-full bg-[#fff0f3] text-[#FF0055] text-[11px] font-bold border border-[#ffd1dc]">
                            Table 04
                          </span>
                        </div>

                        {/* Guest Seated Banner */}
                        <div className="mt-3 p-2.5 rounded-xl bg-[#f9f9f9] border border-[#e5e7eb] text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#262626]">Live Kitchen Dine-In</span>
                            <span className="text-[10px] text-[#727272]">Republic St.</span>
                          </div>
                          <div className="text-[11px] text-[#727272] mt-0.5">
                            BYOD Session: Host (Salma, Omar)
                          </div>
                        </div>

                        {/* Dish Selection */}
                        <div className="mt-3 space-y-2">
                          <div className="text-xs font-bold text-[#262626]">
                            Table 4 Selection
                          </div>

                          <div
                            onClick={() => setSelectedBurger('Smoked Brisket Flame Burger')}
                            className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                              selectedBurger === 'Smoked Brisket Flame Burger'
                                ? 'border-[#FF0055] bg-[#fff0f3]/50'
                                : 'border-[#e5e7eb] bg-white'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-[#262626]">Smoked Brisket Burger</span>
                              <span className="font-bold text-sm text-[#262626]">185 EGP</span>
                            </div>
                            <div className="text-[10px] text-[#727272] mt-0.5">
                              Wood-flame seared, Truffle aioli, Brioche
                            </div>
                            <div className="mt-1 flex gap-1">
                              <span className="px-1.5 py-0.5 rounded bg-[#f0f0f0] text-[9px] text-[#616161]">
                                Medium-Well
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-[#f0f0f0] text-[9px] text-[#616161]">
                                + Cheddar
                              </span>
                            </div>
                          </div>

                          <div
                            onClick={() => setSelectedBurger('Truffle Parmesan Fries')}
                            className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                              selectedBurger === 'Truffle Parmesan Fries'
                                ? 'border-[#FF0055] bg-[#fff0f3]/50'
                                : 'border-[#e5e7eb] bg-white'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-[#262626]">Truffle Parmesan Fries</span>
                              <span className="font-bold text-sm text-[#262626]">75 EGP</span>
                            </div>
                            <div className="text-[10px] text-[#727272] mt-0.5">
                              Sea salt, Shaved aged parmesan, Herbs
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Phone Bottom Actions */}
                      <div className="pt-3 border-t border-[#e5e7eb] space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-[#262626]">
                          <span>Table Total (inc. 14% VAT)</span>
                          <span className="text-sm font-bold text-[#FF0055]">296.40 EGP</span>
                        </div>

                        <button
                          onClick={() => setOrderSent(true)}
                          className="w-full py-2.5 rounded-full bg-[#FF0055] text-white text-xs font-bold btn-crimson-glow text-center shadow-xs cursor-pointer transition-all active:scale-95"
                        >
                          {orderSent ? 'Order Transmitted to Kitchen Pass' : 'Transmit Table Order'}
                        </button>
                      </div>
                    </div>
                  </Phone>
                </div>

                {/* 2. REAL-TIME KITCHEN PASS KDS DISPLAY (RIGHT) */}
                <div className="w-full flex-1 max-w-[480px]">
                  <Window
                    url="kds.livekitchen.internal/station/pass"
                    className="shadow-xl border border-[#e5e7eb] bg-white"
                  >
                    <div className="p-4 bg-[#f9f9f9] min-h-[420px] flex flex-col justify-between text-left select-none">
                      {/* Window Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-[#e5e7eb]">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#FF0055] animate-ping" />
                          <span className="font-bold text-xs text-[#262626]">
                            Kitchen Expeditor Pass
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-white border border-[#e5e7eb] text-[#262626] text-xs font-bold">
                            Live Sink: 0.12s
                          </span>
                        </div>
                      </div>

                      {/* Active Ticket Chit */}
                      <div className="my-3 p-4 rounded-xl bg-white border-2 border-[#FF0055] shadow-xs space-y-3">
                        {/* Chit Top Meta */}
                        <div className="flex items-center justify-between pb-2 border-b border-[#e5e7eb]">
                          <div>
                            <span className="text-[10px] text-[#727272] font-bold block">
                              Order Ticket
                            </span>
                            <span className="text-base font-bold text-[#262626]">
                              Table 04, Chit #402
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="px-2 py-1 rounded-full bg-[#fff0f3] text-[#FF0055] text-xs font-bold border border-[#ffd1dc]">
                              {formatTimer(elapsedSeconds)}
                            </span>
                            <span className="text-[10px] text-[#727272] block mt-0.5">
                              Station 2: Broiler
                            </span>
                          </div>
                        </div>

                        {/* Chit Items */}
                        <div className="space-y-2 text-xs">
                          <div className="flex items-start justify-between font-bold text-[#262626]">
                            <span>1x Smoked Brisket Flame Burger</span>
                            <span className="font-bold text-sm">185.00 EGP</span>
                          </div>
                          <div className="text-[11px] text-[#FF0055] font-medium pl-3 border-l-2 border-[#FF0055] space-y-0.5">
                            <div>- Temperature: Medium-Well</div>
                            <div>- Sauce: Truffle Aioli</div>
                            <div>- Extra: Double Aged Smoked Cheddar</div>
                          </div>

                          <div className="flex items-start justify-between font-bold text-[#262626] pt-1">
                            <span>1x Truffle Parmesan Fries</span>
                            <span className="font-bold text-sm">75.00 EGP</span>
                          </div>
                          <div className="text-[11px] text-[#727272] pl-3 border-l-2 border-[#e5e7eb]">
                            <div>&middot; Side: Rosemary Herb Garnish</div>
                          </div>
                        </div>

                        {/* Station Action Buttons */}
                        <div className="pt-2 border-t border-[#e5e7eb] flex items-center justify-between gap-2">
                          <span className="text-[11px] font-sans text-[#727272]">
                            Tender: Apple Pay Verified
                          </span>
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-full bg-[#262626] hover:bg-black text-white text-[11px] font-bold transition-all"
                          >
                            Bump to Pass -&gt;
                          </button>
                        </div>
                      </div>

                      {/* KDS Footer Summary */}
                      <div className="pt-3 border-t border-[#e5e7eb] flex items-center justify-between text-xs text-[#727272]">
                        <span>Station: Broiler &amp; Fry Line</span>
                        <span className="text-[11px] font-bold text-[#262626]">
                          Avg Bump Time: 8m 40s
                        </span>
                      </div>
                    </div>
                  </Window>
                </div>
              </div>
            )}
          </Stage>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-6 rounded-2xl bg-white border border-[#e5e7eb] shadow-xs space-y-2">
            <div className="text-xs font-bold text-[#FF0055]">01 / Hardware Savings</div>
            <h3 className="font-bold text-base text-[#262626]">No Tablet Leasing Fees</h3>
            <p className="text-xs text-[#727272] leading-relaxed">
              Eliminate \$1,200/month tablet leases, charger theft, battery swelling, and screen cleaning between table turns.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#e5e7eb] shadow-xs space-y-2">
            <div className="text-xs font-bold text-[#FF0055]">02 / Companion Autonomy</div>
            <h3 className="font-bold text-base text-[#262626]">Distributed Bill Splitting</h3>
            <p className="text-xs text-[#727272] leading-relaxed">
              Every seated companion adds items to their own tab and settles their exact share directly through Apple Pay or Card.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#e5e7eb] shadow-xs space-y-2">
            <div className="text-xs font-bold text-[#FF0055]">03 / Kitchen Cadence</div>
            <h3 className="font-bold text-base text-[#262626]">Direct Kitchen Dispatch</h3>
            <p className="text-xs text-[#727272] leading-relaxed">
              Kitchen expeditors receive paid tickets in under 200ms with precise modifiers, timestamps, and station routing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
