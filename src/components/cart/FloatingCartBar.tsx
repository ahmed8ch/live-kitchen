import React, { useEffect, useState } from 'react';
import { DirectionalArrow } from '../ui/DirectionalArrow';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n';

export const FloatingCartBar: React.FC = () => {
  const cart = useAppStore((state) => state.cart);
  const activeTable = useAppStore((state) => state.activeTable);
  const isCartDrawerOpen = useAppStore((state) => state.isCartDrawerOpen);
  const openCartDrawer = useAppStore((state) => state.openCartDrawer);
  const { t } = useTranslation();

  const [counterPop, setCounterPop] = useState(false);

  const safeCart = cart || [];
  const totalItems = safeCart.reduce((sum, item) => sum + (item?.quantity || 1), 0);

  useEffect(() => {
    if (totalItems > 0) {
      setCounterPop(true);
      const timer = setTimeout(() => setCounterPop(false), 420);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  if (safeCart.length === 0 || isCartDrawerOpen) {
    return null;
  }

  const subtotal = safeCart.reduce((sum, item) => {
    const modTotal = (item?.selectedModifiers || []).reduce((mSum, m) => mSum + (m?.price || 0), 0);
    const basePrice = item?.menuItem?.basePrice || 0;
    const qty = item?.quantity || 1;
    return sum + (basePrice + modTotal) * qty;
  }, 0);

  return (
    <aside
      aria-label={t('cart.floatingBar.tableBasket', { table: activeTable || 'T-04' })}
      data-ui-container="floating-cart"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] sm:w-auto min-w-[320px] sm:min-w-[360px] animate-in slide-in-from-bottom-4 duration-200 select-none"
    >
      <button
        onClick={() => openCartDrawer()}
        data-ui-radius="999"
        style={{
          boxShadow: '0 0 0 5px rgba(255, 0, 85, 0.08), 0 20px 30px -10px rgba(0, 0, 0, 0.12)',
        }}
        className={`w-full min-h-[48px] flex items-center justify-between px-5 py-3.5 rounded-full bg-white text-[#262626] hover:bg-[#fafafa] border border-[#e5e7eb] hover:border-[#FF0055] transition-all cursor-pointer group ${
          counterPop ? 'animate-spring-pop ring-2 ring-[#FF0055]' : ''
        } active:scale-95`}
      >
        {/* Start: Item Count Badge & Label */}
        <div className="flex items-center gap-3">
          <div
            className={`w-7 h-7 rounded-full bg-[#FF0055] text-white flex items-center justify-center font-mono-num font-bold text-[13px] shadow-xs transition-transform duration-200 ${
              counterPop ? 'scale-125' : 'scale-100'
            }`}
            data-ui-number
          >
            {totalItems}
          </div>
          <span className="text-[14px] font-bold tracking-tight text-[#262626]">
            {t('cart.floatingBar.viewAndSubmit')}
          </span>
        </div>

        {/* End: Subtotal & Tax Note & Directional Arrow */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end text-end">
            <span className="font-mono-num font-bold text-[15px] text-[#FF0055] leading-tight" data-ui-number>
              {subtotal.toFixed(2)} {t('common.egp')}
            </span>
            <span className="text-[10px] text-[#727272] font-medium leading-tight">
              + {t('brand.vatLabel')}
            </span>
          </div>
          <DirectionalArrow className="w-4 h-4 text-[#727272] group-hover:text-[#FF0055] transition-colors" />
        </div>
      </button>
    </aside>
  );
};
