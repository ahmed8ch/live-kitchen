import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { FlameLinkLogo } from '../components/ui/FlameLinkLogo';

const QUICK_TABLES = ['T-01', 'T-02', 'T-04', 'T-08', 'T-12', 'T-16'];

export const TableStandPage: React.FC = () => {
  const [tableId, setTableId] = useState('T-04');
  const navigate = useNavigate();
  const setActiveTable = useAppStore((state) => state.setActiveTable);

  const cleanTable = tableId.trim().toUpperCase() || 'T-04';
  const targetUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/menu?table=${cleanTable}`
    : `https://live-kitchen.pages.dev/menu?table=${cleanTable}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    targetUrl
  )}&margin=2`;

  const handleSimulateScan = () => {
    setActiveTable(cleanTable);
    navigate(`/menu?table=${cleanTable}`);
  };

  return (
    <div className="flex-1 w-full bg-[#f9f9f9] py-10 sm:py-16 pb-32" data-ui-container="stand-studio">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Studio Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#e5e7eb] text-[11px] font-mono-num font-medium text-[#ff4d00] uppercase mb-3 shadow-xs">
            Physical Hardware Studio
          </div>
          <h1 className="text-3xl font-medium text-[#262626]" data-ui-balance>
            Acrylic Table Stand Studio
          </h1>
          <p className="mt-2 text-[14px] text-[#616161]" data-ui-pretty>
            Generate authentic 4×6" acrylic tent table stands. Diners scan with standard camera to bind directly to their table number.
          </p>

          {/* Table Selector & Custom Input */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2" data-ui-actions="table-picker">
            <span className="text-[13px] font-medium text-[#262626] mr-1">Table:</span>
            {QUICK_TABLES.map((id) => (
              <button
                key={id}
                onClick={() => setTableId(id)}
                data-ui-radius="8"
                className={`px-3 py-1 rounded-lg text-[13px] font-mono-num transition-all cursor-pointer ${
                  cleanTable === id
                    ? 'bg-[#ff4d00] text-white font-medium shadow-xs'
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
                className="w-24 px-2.5 py-1 text-[13px] font-mono-num rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#ff4d00]"
              />
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => window.print()}
              data-ui-radius="999"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#f9f9f9] border border-[#e5e7eb] text-[#262626] text-[13px] font-medium shadow-xs transition-all active:scale-95 cursor-pointer"
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
              data-ui-radius="999"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ff4d00] hover:opacity-95 text-white text-[13px] font-medium shadow-xs transition-all btn-ember-glow active:scale-95 cursor-pointer"
            >
              <span>Simulate Table Scan ({cleanTable}) -&gt;</span>
            </button>
          </div>
        </div>

        {/* 3D Realistic Acrylic Tent Card Container with Perspective Physics (DESIGN.md §4.3) */}
        <div className="max-w-xs mx-auto py-4">
          <div
            data-ui-radius="16"
            className="acrylic-stand-3d bg-white p-7 sm:p-9 rounded-2xl border border-[#e5e7eb] text-center relative select-none"
          >
            {/* Double-Walled Acrylic Edge Sheen */}
            <div className="absolute inset-1.5 rounded-xl border border-[#e5e7eb]/60 pointer-events-none" />

            {/* Stand Brand Header */}
            <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-3 mb-5">
              <FlameLinkLogo size="sm" />
              <span className="px-2 py-0.5 rounded-full bg-[#fff8f5] border border-[#fcddcc] text-[#ff4d00] text-[11px] font-mono-num font-medium">
                {cleanTable}
              </span>
            </div>

            {/* Scannable Real QR Code Container */}
            <div className="w-48 h-48 mx-auto bg-white p-3 rounded-xl border border-[#e5e7eb] flex items-center justify-center shadow-xs">
              <img
                src={qrImageUrl}
                alt={`Real Scannable QR Code for Table ${cleanTable}`}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Instruction Callout */}
            <div className="mt-5 text-center">
              <div className="text-[14px] font-medium text-[#262626]">
                Point Camera to Order
              </div>
              <div className="text-[11px] text-[#727272] mt-0.5">
                Instant self-ordering • No app required
              </div>
              <div className="text-[10px] font-mono-num text-[#949494] mt-2 pt-2 border-t border-[#f0f0f0] truncate">
                {targetUrl}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
