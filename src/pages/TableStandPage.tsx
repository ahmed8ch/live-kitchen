import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { FlameLinkLogo } from '../components/ui/FlameLinkLogo';

const QUICK_TABLES = ['T-01', 'T-02', 'T-04', 'T-08', 'T-12', 'T-16'];

export const TableStandPage: React.FC = () => {
  const [tableId, setTableId] = useState('T-04');
  const [standFace, setStandFace] = useState<'front' | 'back'>('front');
  const [baseStyle, setBaseStyle] = useState<'acrylic' | 'oak'>('oak');
  const navigate = useNavigate();
  const setActiveTable = useAppStore((state) => state.setActiveTable);

  const cleanTable = tableId.trim().toUpperCase() || 'T-04';
  const targetUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/menu?table=${cleanTable}`
    : `https://flamelink.dev/menu?table=${cleanTable}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    targetUrl
  )}&margin=2`;

  const handleSimulateScan = () => {
    setActiveTable(cleanTable);
    navigate(`/menu?table=${cleanTable}`);
  };

  return (
    <div className="flex-1 w-full bg-[#f9f9f9] py-10 sm:py-16 pb-36 select-none" data-ui-container="stand-studio">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Studio Header (Hidden on Print) */}
        <div className="no-print text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#e5e7eb] text-[11px] font-mono-num font-bold text-[#FF0055] uppercase mb-3 shadow-xs">
            Hardware Studio // 4x6" Physical Stand
          </div>
          <h1 className="text-3xl font-extrabold text-[#262626] tracking-tight" data-ui-balance>
            Acrylic Tabletop Stand Studio
          </h1>
          <p className="mt-2 text-[14px] text-[#616161]" data-ui-pretty>
            Generate realistic, restaurant-grade acrylic table tent inserts. Guests scan with standard phone camera to enter the multiplayer table pool.
          </p>

          {/* Quick Table Switcher Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2" data-ui-actions="table-picker">
            <span className="text-[13px] font-bold text-[#262626] mr-1">Active Table:</span>
            {QUICK_TABLES.map((id) => (
              <button
                key={id}
                onClick={() => setTableId(id)}
                data-ui-radius="8"
                className={`px-3 py-1.5 rounded-lg text-[13px] font-mono-num font-bold transition-all cursor-pointer ${
                  cleanTable === id
                    ? 'bg-[#FF0055] text-white shadow-xs'
                    : 'bg-white hover:bg-[#f0f0f0] text-[#727272] border border-[#e5e7eb]'
                }`}
              >
                {id}
              </button>
            ))}

            <div className="flex items-center ml-2">
              <input
                type="text"
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
                placeholder="Custom"
                aria-label="Custom Table Code"
                className="w-24 px-3 py-1.5 text-[13px] font-mono-num font-bold rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055]"
              />
            </div>
          </div>

          {/* Stand Customizer Toggles */}
          <div className="mt-4 flex items-center justify-center gap-3 text-[12px] font-mono-num">
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#e5e7eb]">
              <button
                onClick={() => setStandFace('front')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  standFace === 'front' ? 'bg-[#262626] text-white font-bold' : 'text-[#727272]'
                }`}
              >
                Front (QR Code)
              </button>
              <button
                onClick={() => setStandFace('back')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  standFace === 'back' ? 'bg-[#262626] text-white font-bold' : 'text-[#727272]'
                }`}
              >
                Back (Guest Wi-Fi)
              </button>
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#e5e7eb]">
              <button
                onClick={() => setBaseStyle('oak')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  baseStyle === 'oak' ? 'bg-[#262626] text-white font-bold' : 'text-[#727272]'
                }`}
              >
                Oak Base
              </button>
              <button
                onClick={() => setBaseStyle('acrylic')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  baseStyle === 'acrylic' ? 'bg-[#262626] text-white font-bold' : 'text-[#727272]'
                }`}
              >
                Clear Tent
              </button>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#fafafa] border border-[#e5e7eb] text-[#262626] text-[13px] font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <svg className="w-4 h-4 text-[#727272]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span>Print 4x6" Insert</span>
            </button>

            <button
              onClick={handleSimulateScan}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-[13px] font-bold shadow-xs transition-all btn-crimson-glow active:scale-95 cursor-pointer"
            >
              <span>Test Customer Scan ({cleanTable}) -&gt;</span>
            </button>
          </div>
        </div>

        {/* Realistic 3D Physical Tabletop Mockup with Base & Ambient Light */}
        <div className="max-w-sm mx-auto py-6 flex flex-col items-center">
          {/* Acrylic Tent Insert */}
          <div
            id="printable-stand"
            className="w-full bg-white p-7 rounded-2xl border-4 border-slate-100 shadow-[0_24px_50px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] relative select-none"
            style={{
              aspectRatio: '4 / 6',
            }}
          >
            {/* Double-Beveled Glass Refractive Sheen */}
            <div className="absolute inset-2 rounded-xl border border-white/80 pointer-events-none shadow-[inset_0_1px_3px_rgba(255,255,255,0.9)]" />

            {standFace === 'front' ? (
              <div className="h-full flex flex-col justify-between text-center relative z-10 py-1">
                {/* Brand Header & Table Indicator */}
                <div className="flex items-center justify-between pb-3 border-b border-[#f0f0f0]">
                  <FlameLinkLogo size="md" />
                  <span className="px-3 py-1 rounded-full bg-[#fff0f3] border-2 border-[#FF0055] text-[#FF0055] text-[12px] font-mono-num font-extrabold">
                    {cleanTable}
                  </span>
                </div>

                {/* Big Table Callout */}
                <div className="py-2">
                  <div className="text-[11px] font-mono-num uppercase tracking-widest text-[#949494]">
                    TABLE SELF-ORDERING
                  </div>
                  <div className="text-2xl font-extrabold font-changa text-[#262626] mt-0.5">
                    Table {cleanTable}
                  </div>
                </div>

                {/* Scannable Real QR Code */}
                <div className="w-52 h-52 mx-auto bg-white p-3 rounded-2xl border border-[#e5e7eb] shadow-sm flex items-center justify-center">
                  <img
                    src={qrImageUrl}
                    alt={`Real Scannable QR Code for Table ${cleanTable}`}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* 3-Step Diner Scan Guide */}
                <div className="space-y-1 text-center pt-2">
                  <div className="text-[14px] font-bold text-[#262626]">
                    Point Camera to Order
                  </div>
                  <div className="text-[11px] text-[#727272]">
                    1. Scan QR • 2. Pick Dishes • 3. Settle at Table
                  </div>
                  <div className="text-[9px] font-mono-num text-[#949494] truncate pt-1 border-t border-[#f0f0f0]">
                    {targetUrl}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-between text-center relative z-10 py-1 space-y-4">
                {/* Back Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#f0f0f0]">
                  <FlameLinkLogo size="md" />
                  <span className="px-3 py-1 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] text-[#262626] text-[11px] font-mono-num font-bold">
                    GUEST WI-FI
                  </span>
                </div>

                <div className="space-y-2 py-4">
                  <div className="text-[12px] font-mono-num uppercase tracking-wider text-[#949494]">
                    High-Speed Dining Access
                  </div>
                  <h3 className="text-xl font-bold text-[#262626]">
                    Welcome to Our Dining Room
                  </h3>
                  <p className="text-[12px] text-[#727272] max-w-xs mx-auto leading-relaxed">
                    Connect your mobile phone to our complimentary dining Wi-Fi for instantaneous kitchen pass ordering.
                  </p>
                </div>

                {/* Wi-Fi Credential Card */}
                <div className="bg-[#f9f9f9] border border-[#e5e7eb] rounded-xl p-4 text-left space-y-2 font-mono-num text-[12px]">
                  <div className="flex justify-between">
                    <span className="text-[#727272]">Network (SSID):</span>
                    <span className="font-bold text-[#262626]">FlameLink-Guest</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#727272]">Password:</span>
                    <span className="font-bold text-[#FF0055]">dinein2026</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[#e5e7eb]">
                    <span className="text-[#727272]">Table PIN:</span>
                    <span className="font-bold text-[#262626]">Ask Host or Scan QR</span>
                  </div>
                </div>

                <div className="pt-2 text-[10px] font-mono-num text-[#949494] border-t border-[#f0f0f0]">
                  FlameLink Multi-Player Dine-In OS • Sub-150ms Synchronization
                </div>
              </div>
            )}
          </div>

          {/* Physical Stand Base (Weighted Natural Oak or Clear Acrylic Foot) */}
          {baseStyle === 'oak' ? (
            <div className="w-[108%] h-7 bg-[#b48052] rounded-b-xl border-t border-[#cfa479] shadow-[0_12px_24px_rgba(0,0,0,0.18)] flex items-center justify-center relative -mt-1.5 z-20">
              <div className="w-16 h-1 rounded-full bg-[#8c5a2b]/40" />
            </div>
          ) : (
            <div className="w-[106%] h-6 bg-white/70 backdrop-blur-md rounded-b-xl border border-white/80 shadow-[0_10px_20px_rgba(0,0,0,0.1)] relative -mt-1 z-20" />
          )}

          {/* Soft Surface Shadow */}
          <div className="w-[90%] h-4 bg-black/10 rounded-full blur-md -mt-2" />
        </div>
      </div>
    </div>
  );
};