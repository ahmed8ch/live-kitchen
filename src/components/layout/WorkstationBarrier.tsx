import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FlameLinkLogo } from '../ui/FlameLinkLogo';

interface WorkstationBarrierProps {
  portalName: string;
  portalCode: string;
  stationRole: string;
  description: string;
  children: React.ReactNode;
}

export const WorkstationBarrier: React.FC<WorkstationBarrierProps> = ({
  portalName,
  portalCode,
  stationRole,
  description,
  children,
}) => {
  const [overrideAllowed, setOverrideAllowed] = useState(false);

  // If developer or operator overrides for inspection on responsive DevTools
  if (overrideAllowed) {
    return (
      <div className="relative">
        <div className="lg:hidden bg-[#fff0f3] border-b border-[#ffd1dc] px-4 py-2 text-center text-[12px] text-[#FF0055] font-medium flex items-center justify-between">
          <span>Workstation Emulation Active ({portalCode})</span>
          <button
            onClick={() => setOverrideAllowed(false)}
            className="underline hover:opacity-80 cursor-pointer"
          >
            Lock Mobile View
          </button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <>
      {/* Mobile & Small Screen Workstation Enforcement Screen (< 1024px) */}
      <div className="lg:hidden min-h-[calc(100vh-56px)] bg-[#f9f9f9] flex items-center justify-center p-4 sm:p-6 select-none">
        <div className="w-full max-w-md bg-white rounded-2xl border border-[#e5e7eb] p-6 sm:p-8 shadow-xs text-center space-y-6">
          {/* Header Brand */}
          <div className="flex justify-center">
            <FlameLinkLogo size="md" />
          </div>

          {/* Operational Role Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff0f3] border border-[#ffd1dc] text-[#FF0055] text-[11px] font-bold tracking-wide">
            <span>{stationRole}</span>
            <span>-</span>
            <span className="font-mono-num">{portalCode}</span>
          </div>

          {/* Workstation Hardware Graphic */}
          <div className="mx-auto w-20 h-20 rounded-2xl bg-[#f9f9f9] border border-[#e5e7eb] flex items-center justify-center text-[#262626]">
            <svg
              className="w-10 h-10 text-[#262626]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
              <circle cx="12" cy="10" r="2" />
            </svg>
          </div>

          {/* Title & Operational Mandate */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#262626]">
              {portalName}
            </h2>
            <div className="text-[12px] font-semibold text-[#FF0055]">
              Desktop &amp; Tablet Terminal Required
            </div>
            <p className="text-[13px] text-[#727272] leading-relaxed">
              {description}
            </p>
          </div>

          {/* Hardware Spec Notice */}
          <div className="p-3 rounded-xl bg-[#f9f9f9] border border-[#e5e7eb] text-[12px] text-[#616161] space-y-1 text-left">
            <div className="flex justify-between font-medium">
              <span>Required Resolution:</span>
              <span className="font-mono-num text-[#262626]">Minimum 1024 x 768px</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Supported Hardware:</span>
              <span className="text-[#262626]">10"+ Tablet (Landscape) / Desktop PC</span>
            </div>
          </div>

          {/* Direct Return Navigation Actions */}
          <div className="space-y-2.5 pt-2">
            <Link
              to="/menu?table=T-04"
              className="w-full inline-flex items-center justify-center py-3 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-[13px] font-bold btn-crimson-glow shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <span>Return to Dine-In Menu -&gt;</span>
            </Link>

            <Link
              to="/"
              className="w-full inline-flex items-center justify-center py-2.5 rounded-full border border-[#e5e7eb] bg-white hover:bg-[#f9f9f9] text-[#262626] text-[13px] font-medium cursor-pointer transition-all"
            >
              <span>Back to Home Overview</span>
            </Link>
          </div>

          {/* Developer / Responsive DevTools Bypass */}
          <div className="pt-2 border-t border-[#f0f0f0]">
            <button
              type="button"
              onClick={() => setOverrideAllowed(true)}
              className="text-[11px] text-[#949494] hover:text-[#262626] underline transition-colors cursor-pointer"
            >
              Simulate Workstation on Small Viewport (Desktop Override)
            </button>
          </div>
        </div>
      </div>

      {/* Full Workstation Display on Large Screens (>= 1024px) */}
      <div className="hidden lg:block w-full">
        {children}
      </div>
    </>
  );
};
