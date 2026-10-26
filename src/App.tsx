import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { OrderTrackerPage } from './pages/OrderTrackerPage';
import { KdsPage } from './pages/KdsPage';
import { TableStandPage } from './pages/TableStandPage';

export const App: React.FC = () => {
  const location = useLocation();
  const isKds = location.pathname === '/kds';

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#262626]">
      <Navbar />

      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/order/:id" element={<OrderTrackerPage />} />
          <Route path="/kds" element={<KdsPage />} />
          <Route path="/stand" element={<TableStandPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer (Consumer & SaaS pages only) */}
      {!isKds && (
        <footer className="border-t border-[#e5e7eb] bg-[#f9f9f9] py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#ff4d00] flex items-center justify-center text-white font-bold text-[11px]">
                ML
              </div>
              <span className="text-[14px] font-bold text-[#262626]">
                Matbakh<span className="text-[#ff4d00]">Link</span>
              </span>
              <span className="text-[12px] text-[#727272]">
                &bull; Digital Dine-In & Kitchen Synchronization
              </span>
            </div>

            <div className="text-[12px] text-[#727272] flex items-center gap-4">
              <span>Egyptian Tax Authority (ETA) 14% VAT Engine</span>
              <span>&bull;</span>
              <span>Zero-Friction Table Ordering</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
