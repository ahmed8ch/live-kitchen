import React from 'react';
import { useAppStore } from '../../store/useAppStore';

export const FloatingCartBar: React.FC = () => {
  const cart = useAppStore((state) => state.cart);
  const isCartDrawerOpen = useAppStore((state) => state.isCartDrawerOpen);
  const openCartDrawer = useAppStore((state) => state.openCartDrawer);

  if (cart.length === 0 || isCartDrawerOpen) {
    return null;
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => {
    const modTotal = item.selectedModifiers.reduce((mSum, m) => mSum + m.price, 0);
    return sum + (item.menuItem.basePrice + modTotal) * item.quantity;
  }, 0);

  return (
    <aside
      aria-label="Active Order Cart Summary"
      data-ui-container="floating-cart"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] sm:w-auto min-w-[320px] sm:min-w-[360px] animate-in slide-in-from-bottom-4 duration-200"
    >
      <button
        onClick={() => openCartDrawer()}
        data-ui-radius="999"
        className="w-full flex items-center justify-between px-5 py-3.5 rounded-full bg-[#1e232d] text-white shadow-2xl hover:bg-[#111827] border border-white/10 transition-all active:scale-[0.98] cursor-pointer group"
      >
        {/* Left: Item Count Badge & Label */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-mono-num font-bold text-[13px] shadow-xs">
            {totalItems}
          </div>
          <span className="text-[14px] font-semibold tracking-wide">
            View Order Cart
          </span>
        </div>

        {/* Right: Subtotal & Arrow */}
        <div className="flex items-center gap-2.5">
          <span className="font-mono-num font-bold text-[15px] text-[#EA580C]" data-ui-number>
            {subtotal.toFixed(2)} EGP
          </span>
          <svg
            className="w-4 h-4 text-[#9ca3af] group-hover:text-white transition-colors group-hover:translate-x-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </button>
    </aside>
  );
};
