import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Link, useNavigate } from 'react-router-dom';
import { UnifiedNavbar } from './components/layout/UnifiedNavbar';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/ui/ToastContainer';
import { TableLobbyModal } from './components/multiplayer/TableLobbyModal';
import { AccountModal } from './components/auth/AccountModal';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { OrderTrackerPage } from './pages/OrderTrackerPage';
import { SettlementPage } from './pages/SettlementPage';
import { KdsPage } from './pages/KdsPage';
import { CashierPage } from './pages/CashierPage';
import { TableStandPage } from './pages/TableStandPage';
import { CompanionPage } from './pages/CompanionPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { useAppStore } from './store/useAppStore';
import { FlameLinkLogo } from './components/ui/FlameLinkLogo';
import { useTranslation } from './i18n';

export const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const setActiveTable = useAppStore((state) => state.setActiveTable);
  const { t, dir, lang } = useTranslation();

  const isKds = location.pathname.startsWith('/kds');
  const isStand = location.pathname.startsWith('/stand');
  const isCashier = location.pathname.startsWith('/cashier');

  // Ingest ?table=XX from URL on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tableParam = searchParams.get('table');
    if (tableParam) {
      setActiveTable(tableParam.trim().toUpperCase());
    }
  }, [location.search, setActiveTable]);

  return (
    <div dir={dir} data-lang={lang} className="min-h-screen flex flex-col bg-white text-[#262626]">
      {/* Accessible Skip to Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#262626] focus:text-white focus:rounded-full focus:text-xs focus:font-bold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#FF0055]"
      >
        {lang === 'eg' ? 'تخطي إلى المحتوى الرئيسي' : 'Skip to main content'}
      </a>

      {/* Single Contextual Top Bar */}
      <UnifiedNavbar />

      {/* Floating Control Sidebar Dock */}
      {!isKds && !isCashier && !isStand && <Sidebar />}

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <main id="main-content" className="flex-1 flex flex-col" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/companion" element={<CompanionPage />} />
            <Route path="/guest-order" element={<CompanionPage />} />
            <Route path="/tracker" element={<OrderTrackerPage />} />
            <Route path="/order/:id" element={<OrderTrackerPage />} />
            <Route path="/settlement" element={<SettlementPage />} />
            <Route path="/settlement/:id" element={<SettlementPage />} />
            <Route path="/cashier" element={<CashierPage />} />
            <Route path="/kds" element={<KdsPage />} />
            <Route path="/stand" element={<TableStandPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        {/* Structured Multi-Column Global Footer */}
        {!isKds && !isStand && !isCashier && (
          <footer className="border-t border-[#e5e7eb] bg-[#f9f9f9] py-10 mt-auto select-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-[#e5e7eb]">
                {/* Brand & Venue Column */}
                <div className="md:col-span-5 space-y-2.5">
                  <FlameLinkLogo size="md" />
                  <p className="text-xs text-[#727272] max-w-sm leading-relaxed">
                    {t('brand.address')} · {t('brand.hours')}
                  </p>
                </div>

                {/* Dine-In Navigation */}
                <div className="md:col-span-4 space-y-2.5">
                  <div className="text-xs font-bold text-[#262626]">
                    {lang === 'eg' ? 'تجربة الصالة' : 'Dine-In Experience'}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#727272]">
                    <Link to="/menu" className="hover:text-[#262626] transition-colors font-medium">
                      {t('nav.menu')}
                    </Link>
                    <Link to="/companion" className="hover:text-[#262626] transition-colors font-medium">
                      {t('nav.companionJoin')}
                    </Link>
                    <Link to="/tracker" className="hover:text-[#262626] transition-colors font-medium">
                      {t('nav.orderTracker')}
                    </Link>
                    <Link to="/settlement" className="hover:text-[#262626] transition-colors font-medium">
                      {t('nav.splitSettle')}
                    </Link>
                  </div>
                </div>

                {/* Operations Workstations */}
                <div className="md:col-span-3 space-y-2.5">
                  <div className="text-xs font-bold text-[#262626]">
                    {lang === 'eg' ? 'بوابات التشغيل' : 'Workstations'}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => navigate('/kds')}
                      className="px-3 py-1.5 rounded-full bg-white hover:bg-[#fff0f3] border border-[#e5e7eb] hover:border-[#ffd1dc] text-[#262626] hover:text-[#FF0055] font-semibold transition-colors cursor-pointer"
                    >
                      {t('nav.kitchenPass')}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/cashier')}
                      className="px-3 py-1.5 rounded-full bg-white hover:bg-[#fff0f3] border border-[#e5e7eb] hover:border-[#ffd1dc] text-[#262626] hover:text-[#FF0055] font-semibold transition-colors cursor-pointer"
                    >
                      {t('nav.cashierPos')}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/stand')}
                      className="px-3 py-1.5 rounded-full bg-white hover:bg-[#fff0f3] border border-[#e5e7eb] hover:border-[#ffd1dc] text-[#262626] hover:text-[#FF0055] font-semibold transition-colors cursor-pointer"
                    >
                      {t('nav.tableStand')}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#727272]">
                <span>FlameLink Dine-In OS</span>
                <span className="font-mono-num">{t('home.support.phoneNumber')}</span>
              </div>
            </div>
          </footer>
        )}
      </div>

      {/* Floating Toast Notification */}
      <ToastContainer />

      {/* PIN-Protected Multiplayer Table Lobby Modal */}
      <TableLobbyModal />

      {/* Guest Profile & Past Orders Modal */}
      <AccountModal />
    </div>
  );
};
