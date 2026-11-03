import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
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

export const App: React.FC = () => {
  const location = useLocation();
  const setActiveTable = useAppStore((state) => state.setActiveTable);
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
    <div className="min-h-screen flex flex-col bg-white text-[#262626]">
      {/* Accessible Skip to Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#262626] focus:text-white focus:rounded-full focus:text-xs focus:font-bold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#FF0055]"
      >
        Skip to main content
      </a>

      {/* Single Contextual Top Bar */}
      <UnifiedNavbar />

      {/* Auto-Hiding Edge Dock (Consumer views only) */}
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

        {/* Compact, Authentic Restaurant Footer (0 duplicate giant logos, 0 B2B pitch fluff) */}
        {!isKds && !isStand && !isCashier && (
          <footer className="border-t border-[#e5e7eb] bg-[#f9f9f9] py-8 mt-auto select-none">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs text-[#727272]">
              <div className="flex flex-wrap items-center gap-3">
                <FlameLinkLogo size="sm" showWordmark={false} />
                <span className="font-bold text-[#262626]">Live Kitchen (لايف كيتشن)</span>
                <span>·</span>
                <span>Republic Street, next to El-Montazah Park</span>
                <span>·</span>
                <span>Daily 12:00 PM – 12:00 AM (Fri from 1:00 PM)</span>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link to="/menu" className="hover:text-[#262626] transition-colors font-medium">Dine-In Menu</Link>
                <Link to="/companion" className="hover:text-[#262626] transition-colors font-medium">Join Table Pool</Link>
                <Link to="/tracker" className="hover:text-[#262626] transition-colors font-medium">Order Status</Link>
                <Link to="/settlement" className="hover:text-[#262626] transition-colors font-medium">Table Bill</Link>
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
