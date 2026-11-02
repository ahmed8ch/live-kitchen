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

        {/* Global Master Footer (Consumer dining focused, 0 back-office leaks) */}
        {!isKds && !isStand && !isCashier && (
          <footer className="border-t border-[#e5e7eb] bg-[#f9f9f9] py-14 mt-auto select-none">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-[#e5e7eb]">
                {/* Generous, Prominent Logo Presence */}
                <div className="space-y-2 max-w-xl">
                  <FlameLinkLogo size="xl" />
                  <p className="text-sm text-[#727272] leading-relaxed mt-2">
                    Bring-Your-Own-Device (BYOD) self-ordering via table QR codes. Seated guests order, customize, and settle checks directly from their personal mobile phones—saving restaurants capital equipment leases and maintenance fees on tabletop tablet kiosks.
                  </p>
                </div>
              </div>

              {/* Sitemap Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm">
                <div className="space-y-3">
                  <span className="font-bold text-[#262626] block">
                    Dine In Experience
                  </span>
                  <ul className="space-y-2 text-[#727272]">
                    <li><Link to="/menu" className="hover:text-[#FF0055] transition-colors">Digital Table Menu</Link></li>
                    <li><Link to="/companion" className="hover:text-[#FF0055] transition-colors">Companion Table Order</Link></li>
                    <li><Link to="/tracker" className="hover:text-[#FF0055] transition-colors">Live Order Status</Link></li>
                    <li><Link to="/stand" className="hover:text-[#FF0055] transition-colors">Acrylic Stand Generator</Link></li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <span className="font-bold text-[#262626] block">
                    Settlement &amp; Payments
                  </span>
                  <ul className="space-y-2 text-[#727272]">
                    <li><Link to="/settlement" className="hover:text-[#FF0055] transition-colors">Itemized Check Split</Link></li>
                    <li><span className="text-[#949494]">Apple Pay &amp; Meeza</span></li>
                    <li><span className="text-[#949494]">Direct Cashier Verification</span></li>
                    <li><span className="text-[#949494]">14% ETA VAT Compliance</span></li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <span className="font-bold text-[#262626] block">
                    Live Kitchen (لايف كيتشن)
                  </span>
                  <ul className="space-y-2 text-[#727272]">
                    <li><span>Port Said · Republic Street</span></li>
                    <li><span>Sat - Thu: 12:00 PM - 12:00 AM</span></li>
                    <li><span>Friday: 1:00 PM - 12:00 AM</span></li>
                    <li><span>Tel: 0100 000 0000</span></li>
                  </ul>
                </div>
              </div>

              {/* Staff Access & Legal Bar */}
              <div className="pt-8 border-t border-[#e5e7eb] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#949494]">
                <div className="flex items-center gap-4">
                  <span>FlameLink Dine-In OS &copy; 2026</span>
                  <span>·</span>
                  <span>Live Kitchen Operations</span>
                  <span>·</span>
                  <Link to="/kds" className="hover:text-[#FF0055] transition-colors">Staff KDS Line</Link>
                  <span>·</span>
                  <Link to="/cashier" className="hover:text-[#FF0055] transition-colors">Cashier Register</Link>
                </div>
                <div className="flex items-center gap-4">
                  <span>Privacy Policy</span>
                  <span>·</span>
                  <span>Terms of Service</span>
                  <span>·</span>
                  <span>Food Allergy Notice</span>
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
