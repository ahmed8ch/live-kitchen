import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const TableStandPage: React.FC = () => {
  const [tableId, setTableId] = useState('T-04');
  const navigate = useNavigate();

  const handleLaunchTest = () => {
    navigate(`/menu?table=${tableId}`);
  };

  return (
    <div className="flex-1 w-full bg-[#fafafa] py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#e5e7eb] text-[12px] font-bold text-[#ff4d00] uppercase tracking-wider mb-3 shadow-xs">
            Hardware & Tabletop Studio
          </div>
          <h1 className="text-3xl font-extrabold text-[#262626]">
            Acrylic Table Stand Generator
          </h1>
          <p className="mt-2 text-[14px] text-[#727272]">
            Generate and print table stands for your restaurant. When scanned, customers are automatically locked to their assigned table number.
          </p>

          {/* Table Selector */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className="text-[13px] font-semibold text-[#262626]">Selected Table:</span>
            <div className="flex items-center gap-1.5">
              {['T-01', 'T-02', 'T-04', 'T-08', 'T-12'].map((id) => (
                <button
                  key={id}
                  onClick={() => setTableId(id)}
                  className={`px-3 py-1 rounded-lg text-[13px] font-mono-num font-bold transition-all cursor-pointer ${
                    tableId === id
                      ? 'bg-[#ff4d00] text-white shadow-xs'
                      : 'bg-white hover:bg-[#f0f0f0] text-[#727272] border border-[#e5e7eb]'
                  }`}
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Printable Stand Physical Preview */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#e5e7eb] shadow-lg max-w-sm mx-auto text-center relative">
          <div className="absolute top-4 right-4">
            <span className="px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#ff4d00] text-[11px] font-mono-num font-bold">
              Acrylic Display
            </span>
          </div>

          {/* Brand Mark */}
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-[#ff4d00] flex items-center justify-center text-white">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
              </svg>
            </div>
            <div className="flex flex-col text-left leading-none">
              <span className="text-[14px] font-bold text-[#262626]">Matbakh</span>
              <span className="text-[12px] font-semibold text-[#ff4d00] ml-2">Link</span>
            </div>
          </div>

          <div className="text-[12px] font-semibold uppercase tracking-wider text-[#727272]">
            Dine-In Table
          </div>
          <div className="text-4xl font-extrabold font-mono-num text-[#262626] mt-1 mb-6">
            Table {tableId}
          </div>

          {/* High-Contrast SVG QR Pattern */}
          <div className="w-56 h-56 mx-auto bg-white p-4 rounded-2xl border-2 border-[#262626] flex items-center justify-center shadow-xs">
            <svg className="w-full h-full text-[#262626]" viewBox="0 0 100 100" fill="currentColor">
              <rect x="8" y="8" width="26" height="26" rx="2" fill="none" stroke="currentColor" strokeWidth="4" />
              <rect x="14" y="14" width="14" height="14" />
              <rect x="66" y="8" width="26" height="26" rx="2" fill="none" stroke="currentColor" strokeWidth="4" />
              <rect x="72" y="14" width="14" height="14" />
              <rect x="8" y="66" width="26" height="26" rx="2" fill="none" stroke="currentColor" strokeWidth="4" />
              <rect x="14" y="72" width="14" height="14" />
              <rect x="42" y="14" width="8" height="14" />
              <rect x="54" y="24" width="6" height="16" />
              <rect x="42" y="44" width="18" height="14" />
              <rect x="68" y="44" width="20" height="6" />
              <rect x="78" y="56" width="10" height="20" />
              <rect x="42" y="68" width="8" height="18" />
              <rect x="56" y="74" width="16" height="12" />
            </svg>
          </div>

          <div className="mt-6 space-y-1">
            <div className="text-[14px] font-bold text-[#262626]">
              Point Camera to Order
            </div>
            <div className="text-[11px] font-mono-num text-[#727272]">
              https://live-kitchen.pages.dev/menu?table={tableId}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-[#e5e7eb] text-[11px] text-[#727272] leading-relaxed">
            No app download required. Instant table synchronization with kitchen line cooks.
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleLaunchTest}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#ff4d00] hover:bg-[#e04400] text-white text-[14px] font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            Launch Customer Experience for Table {tableId} &rarr;
          </button>
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-white hover:bg-[#f9f9f9] border border-[#e5e7eb] text-[#262626] text-[14px] font-semibold transition-all active:scale-95 cursor-pointer"
          >
            Print Table Stand (PDF)
          </button>
        </div>
      </div>
    </div>
  );
};
