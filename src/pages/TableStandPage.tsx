import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { FlameLinkLogo } from '../components/ui/FlameLinkLogo';

interface TableOption {
  id: string;
  label: string;
}

const RESTAURANT_TABLES: TableOption[] = [
  { id: 'T-01', label: 'Table 1' },
  { id: 'T-02', label: 'Table 2' },
  { id: 'T-03', label: 'Table 3' },
  { id: 'T-04', label: 'Table 4' },
  { id: 'T-05', label: 'Table 5' },
  { id: 'T-06', label: 'Table 6' },
  { id: 'T-08', label: 'Table 8' },
  { id: 'T-12', label: 'Table 12' },
];

export const TableStandPage: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState('T-04');
  const [customTable, setCustomTable] = useState('');
  const [baseStyle, setBaseStyle] = useState<'oak' | 'acrylic'>('oak');
  const navigate = useNavigate();
  const setActiveTable = useAppStore((state) => state.setActiveTable);

  const activeTableCode = (customTable.trim() ? customTable.trim().toUpperCase() : selectedTable) || 'T-04';

  const getTableLabel = (code: string): string => {
    const numericMatch = code.match(/^T-0*(\d+)$/i);
    if (numericMatch) {
      return `Table ${numericMatch[1]}`;
    }
    return code.startsWith('T-') ? `Table ${code.replace(/^T-/i, '')}` : `Table ${code}`;
  };

  const targetUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/menu?table=${activeTableCode}`
    : `https://flamelink.dev/menu?table=${activeTableCode}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
    targetUrl
  )}&margin=2`;

  const handleSelectTable = (id: string) => {
    setSelectedTable(id);
    setCustomTable('');
  };

  const handlePreviewMenu = () => {
    setActiveTable(activeTableCode);
    navigate(`/menu?table=${activeTableCode}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 w-full bg-[#f9f9f9] py-10 sm:py-16 pb-36 select-none" data-ui-container="table-stand">
      {/* Print Stylesheet for clean 4x6 cardstock printing */}
      <style>{`
        @media print {
          @page {
            size: 4in 6in;
            margin: 0;
          }
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
          }
          body * {
            visibility: hidden !important;
          }
          .no-print,
          .stand-base,
          .stand-shadow {
            display: none !important;
          }
          #printable-stand,
          #printable-stand * {
            visibility: visible !important;
          }
          #printable-stand {
            position: absolute !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 3.75in !important;
            height: 5.75in !important;
            max-width: none !important;
            aspect-ratio: auto !important;
            margin: 0 !important;
            padding: 24px !important;
            box-shadow: none !important;
            border: 1px dashed #cbd5e1 !important;
            border-radius: 12px !important;
            background: #ffffff !important;
            page-break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Tool Header (Hidden on Print) */}
        <div className="no-print text-center max-w-xl mx-auto mb-8">
          <h1 className="text-3xl font-extrabold text-[#262626] tracking-tight" data-ui-balance>
            Table QR Stand
          </h1>
          <p className="mt-2 text-[14px] text-[#616161]" data-ui-pretty>
            Select a table to preview and print its physical dining stand insert. Diners scan with their camera to browse and order directly.
          </p>

          {/* Table Picker Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2" data-ui-actions="table-picker">
            <span className="text-[13px] font-bold text-[#262626] mr-1">Select Table:</span>
            {RESTAURANT_TABLES.map((table) => {
              const isSelected = activeTableCode === table.id && !customTable;
              return (
                <button
                  key={table.id}
                  onClick={() => handleSelectTable(table.id)}
                  data-ui-radius="8"
                  className={`px-3 py-1.5 rounded-lg text-[13px] font-mono-num font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FF0055] text-white shadow-xs'
                      : 'bg-white hover:bg-[#f0f0f0] text-[#727272] border border-[#e5e7eb]'
                  }`}
                >
                  {table.label}
                </button>
              );
            })}

            <div className="flex items-center ml-2">
              <input
                type="text"
                value={customTable}
                onChange={(e) => setCustomTable(e.target.value)}
                placeholder="Custom ID"
                aria-label="Custom Table Code"
                className="w-28 px-3 py-1.5 text-[13px] font-mono-num font-bold rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055]"
              />
            </div>
          </div>

          {/* Base Style Toggles */}
          <div className="mt-4 flex items-center justify-center gap-2 text-[12px] font-mono-num">
            <span className="text-[#727272] mr-1">Preview Base:</span>
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
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white hover:bg-[#fafafa] border border-[#e5e7eb] text-[#262626] text-[13px] font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <svg className="w-4 h-4 text-[#727272]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span>Print Ready Stand</span>
            </button>

            <button
              onClick={handlePreviewMenu}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-[13px] font-bold shadow-xs transition-all btn-crimson-glow active:scale-95 cursor-pointer"
            >
              <span>Preview Menu ({activeTableCode})</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>

        {/* Realistic Tabletop Stand Mockup */}
        <div className="max-w-sm mx-auto py-6 flex flex-col items-center">
          {/* Acrylic Card Insert / Print Target */}
          <div
            id="printable-stand"
            className="w-full bg-white p-7 rounded-2xl border-4 border-slate-100 shadow-[0_24px_50px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] relative select-none flex flex-col justify-between text-center"
            style={{
              aspectRatio: '4 / 6',
            }}
          >
            {/* Double-Beveled Glass Refractive Sheen for Screen Preview */}
            <div className="no-print absolute inset-2 rounded-xl border border-white/80 pointer-events-none shadow-[inset_0_1px_3px_rgba(255,255,255,0.9)]" />

            <div className="h-full flex flex-col justify-between text-center relative z-10 py-1">
              {/* Brand Header & Table Indicator */}
              <div className="flex items-center justify-between pb-3 border-b border-[#f0f0f0]">
                <FlameLinkLogo size="md" />
                <span className="px-3 py-1 rounded-full bg-[#fff0f3] border-2 border-[#FF0055] text-[#FF0055] text-[12px] font-mono-num font-extrabold">
                  {activeTableCode}
                </span>
              </div>

              {/* Table Identification */}
              <div className="py-2">
                <div className="text-[11px] font-mono-num uppercase tracking-widest text-[#949494]">
                  DINE-IN ORDERING
                </div>
                <div className="text-2xl font-extrabold font-changa text-[#262626] mt-0.5">
                  {getTableLabel(activeTableCode)}
                </div>
              </div>

              {/* Scannable Physical QR Code */}
              <div className="w-52 h-52 mx-auto bg-white p-3 rounded-2xl border border-[#e5e7eb] shadow-sm flex items-center justify-center">
                <img
                  src={qrImageUrl}
                  alt={`QR Code to view menu and order for ${getTableLabel(activeTableCode)}`}
                  className="w-full h-full object-contain"
                  loading="eager"
                />
              </div>

              {/* Diner Instructions */}
              <div className="space-y-1 text-center pt-2">
                <div className="text-[15px] font-bold text-[#262626]">
                  Scan with camera to view menu &amp; order
                </div>
                <div className="text-[11px] text-[#727272] leading-relaxed max-w-[260px] mx-auto">
                  Point your smartphone camera at this code to explore our menu, customize dishes, and order directly to the kitchen.
                </div>
                <div className="text-[9px] font-mono-num text-[#949494] truncate pt-1 border-t border-[#f0f0f0]">
                  {targetUrl}
                </div>
              </div>

              {/* Tabletop Wi-Fi Strip */}
              <div className="pt-2 border-t border-[#f0f0f0] flex items-center justify-center gap-3 text-[11px] font-mono-num text-[#727272]">
                <span>Wi-Fi: <strong className="text-[#262626]">FlameLink-Guest</strong></span>
                <span className="text-[#e5e7eb]">•</span>
                <span>Pass: <strong className="text-[#262626]">dinein2026</strong></span>
              </div>
            </div>
          </div>

          {/* Physical Stand Base (Weighted Natural Oak or Clear Acrylic Foot) */}
          {baseStyle === 'oak' ? (
            <div className="stand-base w-[108%] h-7 bg-[#b48052] rounded-b-xl border-t border-[#cfa479] shadow-[0_12px_24px_rgba(0,0,0,0.18)] flex items-center justify-center relative -mt-1.5 z-20">
              <div className="w-16 h-1 rounded-full bg-[#8c5a2b]/40" />
            </div>
          ) : (
            <div className="stand-base w-[106%] h-6 bg-white/70 backdrop-blur-md rounded-b-xl border border-white/80 shadow-[0_10px_20px_rgba(0,0,0,0.1)] relative -mt-1 z-20" />
          )}

          {/* Soft Surface Shadow */}
          <div className="stand-shadow w-[90%] h-4 bg-black/10 rounded-full blur-md -mt-2" />
        </div>
      </div>
    </div>
  );
};
