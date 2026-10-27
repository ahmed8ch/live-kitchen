import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
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
      {/* Primary Navigation System (Desktop macOS Dock + Mobile Header) */}
      {!isKds && <Sidebar />}

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <main className="flex-1 flex flex-col">
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Master Footer (Rendered across consumer dining pages; hidden on staff and print views) */}
        {!isKds && !isStand && !isCashier && (
          <footer className="border-t border-[#e5e7eb] bg-[#f9f9f9] py-14 mt-auto select-none">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-[#e5e7eb]">
                {/* Generous, Prominent Logo Presence */}
                <div className="space-y-2 max-w-xl">
                  <FlameLinkLogo size="xl" />
                  <p className="text-[13px] text-[#727272] leading-relaxed mt-2">
                    Bring-Your-Own-Device (BYOD) self-ordering via table QR codes. Guests order and settle checks directly from their personal mobile phones—saving restaurants capital equipment leases and maintenance fees on tabletop tablet kiosks.
                  </p>
                </div>
              </div>

              {/* Sitemap Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-[13px]">
                <div className="space-y-3">
                  <span className="font-bold text-[#262626] uppercase text-[11px] block tracking-wider font-medium">
                    Dine-In Operations
                  </span>
                  <ul className="space-y-2 text-[#727272]">
                    <li><Link to="/menu" className="hover:text-[#FF0055] transition-colors">Customer Menu</Link></li>
                    <li><Link to="/companion" className="hover:text-[#FF0055] transition-colors">Companion Order</Link></li>
                    <li><Link to="/stand" className="hover:text-[#FF0055] transition-colors">Table QR Stand</Link></li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <span className="font-bold text-[#262626] uppercase text-[11px] block tracking-wider font-medium">
                    Kitchen Systems
                  </span>
                  <ul className="space-y-2 text-[#727272]">
                    <li><Link to="/kds" className="hover:text-[#FF0055] transition-colors">Kitchen Pass (KDS)</Link></li>
                    <li><Link to="/cashier" className="hover:text-[#FF0055] transition-colors">Cashier POS Terminal</Link></li>
                    <li><Link to="/tracker" className="hover:text-[#FF0055] transition-colors">Live Order Tracking</Link></li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <span className="font-bold text-[#262626] uppercase text-[11px] block tracking-wider font-medium">
                    Financials
                  </span>
                  <ul className="space-y-2 text-[#727272]">
                    <li><Link to="/settlement" className="hover:text-[#FF0055] transition-colors">Itemized Bill Split</Link></li>
                    <li><span className="text-[#949494]">Digital Receipt &amp; Split</span></li>
                    <li><span className="text-[#949494]">Apple Pay &amp; Meeza</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>

      {/* Floating Toast Notification strictly at Top-Right */}
      <ToastContainer />

      {/* PIN-Protected Multiplayer Table Lobby Modal */}
      <TableLobbyModal />

      {/* Dine-In Profile & Loyalty History Modal */}
      <AccountModal />
    </div>
  );
};
