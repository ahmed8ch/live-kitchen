import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

const QUICK_TABLES = ['T-01', 'T-02', 'T-04', 'T-08', 'T-12', 'T-16', 'T-20'];

export const TableStandPage: React.FC = () => {
  const [tableId, setTableId] = useState('T-04');
  const navigate = useNavigate();
  const setActiveTable = useAppStore((state) => state.setActiveTable);

  const cleanTable = tableId.trim().toUpperCase() || 'T-04';
  const targetUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/menu?table=${cleanTable}`
    : `https://live-kitchen.pages.dev/menu?table=${cleanTable}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    targetUrl
  )}&margin=2`;

  const handleSimulateScan = () => {
    setActiveTable(cleanTable);
    navigate(`/menu?table=${cleanTable}`);
  };

  return (
    <div className="flex-1 w-full bg-[#faf8f5]/60 py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Studio Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#e5e7eb] text-[12px] font-bold text-[#ea580c] uppercase tracking-wider mb-3 shadow-xs">
            Hardware & Tabletop Studio
          </div>
          <h1 className="text-3xl font-extrabold text-[#0f172a]">
            Acrylic Table Stand Studio
          </h1>
          <p className="mt-2 text-[14px] text-[#727272]">
            Generate authentic scannable QR stands. When scanned, diners are instantly anchored to their table number without app downloads.
          </p>

          {/* Table Selector & Custom Input */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[13px] font-semibold text-[#0f172a] mr-1">Table:</span>
            {QUICK_TABLES.map((id) => (
              <button
                key={id}
                onClick={() => setTableId(id)}
                className={`px-3 py-1 rounded-lg text-[13px] font-mono-num font-bold transition-all cursor-pointer ${
                  cleanTable === id
                    ? 'bg-[#ea580c] text-white shadow-xs'
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
                placeholder="Custom (e.g. T-15)"
                className="w-24 px-2.5 py-1 text-[13px] font-mono-num font-bold rounded-lg border border-[#e5e7eb] bg-white text-[#0f172a] focus:outline-none focus:border-[#ea580c]"
              />
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-[#f9f9f9] border border-[#e5e7eb] text-[#0f172a] text-[13px] font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <svg className="w-4 h-4 text-[#727272]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span>Print 4x6" Stand</span>
            </button>

            <button
              onClick={handleSimulateScan}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ea580c] hover:bg-[#c2410c] text-white text-[13px] font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <span>Simulate Scanning {cleanTable} &rarr;</span>
            </button>
          </div>
        </div>

        {/* 3D Realistic Acrylic Tent Card Container */}
        <div className="print:m-0 print:p-0 print:shadow-none bg-gradient-to-b from-white to-slate-50 p-8 sm:p-12 rounded-3xl border border-[#e5e7eb] shadow-xl max-w-sm mx-auto text-center relative ring-1 ring-black/5">
          {/* Acrylic Badge */}
          <div className="absolute top-4 right-4">
            <span className="px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#ea580c] text-[11px] font-mono-num font-bold">
              Acrylic Stand
            </span>
          </div>

          {/* Unified Brand Mark: Flame + Single Line MatbakhLink */}
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-[#ea580c] flex items-center justify-center text-white shrink-0 shadow-xs">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
              </svg>
            </div>
            <span className="text-[17px] font-extrabold tracking-tight text-[#0f172a]">
              Matbakh<span className="text-[#ea580c]">Link</span>
            </span>
          </div>

          <div className="text-[12px] font-bold uppercase tracking-wider text-[#727272]">
            Dine-In Table
          </div>
          <div className="text-4xl font-extrabold font-mono-num text-[#0f172a] mt-1 mb-6">
            Table {cleanTable}
          </div>

          {/* Real High-Density Scannable QR Code */}
          <div className="w-56 h-56 mx-auto bg-white p-3 rounded-2xl border-2 border-[#0f172a] flex items-center justify-center shadow-md overflow-hidden">
            <img
              src={qrImageUrl}
              alt={`Real Scannable QR Code for Table ${cleanTable}`}
              className="w-full h-full object-contain"
              onError={(e) => {
                // High density fallback
                (e.currentTarget as HTMLImageElement).src =
                  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33 33" fill="%230f172a"><rect x="0" y="0" width="33" height="33" fill="white"/><rect x="3" y="3" width="7" height="7"/><rect x="4" y="4" width="5" height="5" fill="white"/><rect x="5" y="5" width="3" height="3"/><rect x="23" y="3" width="7" height="7"/><rect x="24" y="4" width="5" height="5" fill="white"/><rect x="25" y="5" width="3" height="3"/><rect x="3" y="23" width="7" height="7"/><rect x="4" y="24" width="5" height="5" fill="white"/><rect x="5" y="25" width="3" height="3"/><rect x="12" y="4" width="2" height="4"/><rect x="16" y="3" width="3" height="2"/><rect x="15" y="7" width="4" height="2"/><rect x="12" y="12" width="9" height="9"/><rect x="14" y="14" width="5" height="5" fill="white"/><rect x="15" y="15" width="3" height="3"/><rect x="4" y="12" width="2" height="7"/><rect x="8" y="14" width="2" height="5"/><rect x="23" y="12" width="7" height="2"/><rect x="25" y="16" width="5" height="3"/><rect x="12" y="23" width="3" height="6"/><rect x="18" y="25" width="4" height="4"/><rect x="24" y="24" width="6" height="6"/></svg>';
              }}
            />
          </div>

          <div className="mt-6 space-y-1">
            <div className="text-[14px] font-bold text-[#0f172a]">
              Point Camera to Order
            </div>
            <div className="text-[11px] font-mono-num text-[#727272] truncate px-2">
              {targetUrl}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-[#e5e7eb] text-[11px] text-[#727272] leading-relaxed">
            No app download required. Instant table synchronization with kitchen line cooks.
          </div>
        </div>

        {/* Bottom CTA to test flow */}
        <div className="mt-10 text-center">
          <button
            onClick={handleSimulateScan}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0f172a] hover:bg-black text-white text-[14px] font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span>Simulate Seated Diner on Table {cleanTable}</span>
            <svg className="w-4 h-4 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
