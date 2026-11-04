import React from 'react';
import { Link } from 'react-router-dom';
import { DirectionalArrow } from '../components/ui/DirectionalArrow';
import { useAppStore } from '../store/useAppStore';
import { FlameLinkLogo } from '../components/ui/FlameLinkLogo';
import { useTranslation } from '../i18n';

export const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  const activeTable = useAppStore((state) => state.activeTable);
  const menuLink = activeTable ? `/menu?table=${activeTable}` : '/menu';

  return (
    <div
      className="flex-1 w-full bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 select-none"
      data-ui-container="not-found-view"
    >
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
        {/* Start Col: Asymmetric Oversized Technical Monospace Indicator */}
        <div className="md:col-span-5 bg-[#f9f9f9] border border-[#e5e7eb] rounded-2xl p-8 relative">
          <div className="text-xs font-semibold text-[#727272] mb-2">
            {t('notFound.routeError')}
          </div>
          <div className="text-7xl sm:text-8xl font-mono-num font-bold text-[#262626] tracking-tighter leading-none" data-ui-number>
            404
          </div>
          <div className="mt-4 pt-4 border-t border-[#e5e7eb] flex items-center justify-between text-xs text-[#727272]">
            <span>{t('notFound.stationUnrouted')}</span>
            <span className="font-mono-num text-[#FF0055] font-bold">{t('notFound.byodFloorPass')}</span>
          </div>
        </div>

        {/* End Col: Editorial Copy & Action Links */}
        <div className="md:col-span-7 space-y-5 text-start">
          <FlameLinkLogo size="md" />

          <h1 className="text-2xl sm:text-3xl font-bold text-[#262626] tracking-tight">
            {t('notFound.title')}
          </h1>

          <p className="text-sm sm:text-base text-[#616161] leading-relaxed max-w-lg">
            {t('notFound.desc')}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to={menuLink}
              data-ui-radius="999"
              className="min-h-[44px] px-6 py-2.5 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-xs font-bold btn-crimson-glow transition-all active:scale-[0.98] shadow-xs inline-flex items-center justify-center gap-2"
            >
              <span>{t('notFound.openDineInMenuBtn')}</span>
              <DirectionalArrow className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/"
              data-ui-radius="999"
              className="min-h-[44px] px-6 py-2.5 rounded-full bg-white hover:bg-[#f9f9f9] border border-[#e5e7eb] text-[#262626] text-xs font-semibold transition-all active:scale-[0.98] inline-flex items-center justify-center shadow-xs"
            >
              {t('notFound.returnToOverviewBtn')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
