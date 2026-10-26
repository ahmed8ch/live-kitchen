import React from 'react';
import { useAppStore } from '../../store/useAppStore';

export const ToastContainer: React.FC = () => {
  const toastMessage = useAppStore((state) => state.toastMessage);
  const clearToast = useAppStore((state) => state.clearToast);

  if (!toastMessage) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      data-ui-container="toast"
      className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-3 fade-in duration-200"
    >
      <div
        data-ui-radius="8"
        className="bg-white text-[#262626] pl-4 pr-5 py-3 rounded-lg border border-[#e5e7eb] border-l-4 border-l-[#ff4d00] shadow-lg flex items-center gap-3 max-w-md select-none"
      >
        <span className="w-5 h-5 rounded-full bg-[#fcddcc] text-[#ff4d00] flex items-center justify-center shrink-0">
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        <span className="text-[13px] font-medium leading-tight text-[#262626]">
          {toastMessage}
        </span>
        <button
          onClick={clearToast}
          className="ml-auto text-[#949494] hover:text-[#262626] transition-colors p-1"
          aria-label="Dismiss toast"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
};
