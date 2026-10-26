import React from 'react';
import { useAppStore } from '../../store/useAppStore';

export const ToastContainer: React.FC = () => {
  const toastMessage = useAppStore((state) => state.toastMessage);

  if (!toastMessage) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 pointer-events-none animate-in slide-in-from-bottom-2 fade-in duration-200"
    >
      <div className="bg-[#0f172a] text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700/60 flex items-center gap-3 max-w-sm">
        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span className="text-[13px] font-medium tracking-wide">
          {toastMessage}
        </span>
      </div>
    </div>
  );
};
