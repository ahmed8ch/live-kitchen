import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/ui/ToastContainer';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { OrderTrackerPage } from './pages/OrderTrackerPage';
import { KdsPage } from './pages/KdsPage';
import { TableStandPage } from './pages/TableStandPage';

export const App: React.FC = () => {
  const location = useLocation();
  const isKds = location.pathname === '/kds';

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0f172a]">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex w-full">
        {!isKds && <Sidebar />}

        <main className="flex-1 flex flex-col min-w-0">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/order/:id" element={<OrderTrackerPage />} />
            <Route path="/kds" element={<KdsPage />} />
            <Route path="/stand" element={<TableStandPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Unified Brand Footer */}
      {!isKds && (
        <footer className="border-t border-[#e5e7eb] bg-[#f9f9f9] py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2.5">
              {/* Identical Flame Icon */}
              <div className="w-8 h-8 rounded-xl bg-[#ea580c] flex items-center justify-center text-white shadow-xs shrink-0">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
                </svg>
              </div>
              <span className="text-[17px] font-extrabold tracking-tight text-[#0f172a]">
                Matbakh<span className="text-[#ea580c]">Link</span>
              </span>
              <span className="text-[12px] text-[#727272] hidden md:inline">
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

      {/* Global Floating Toast */}
      <ToastContainer />
    </div>
  );
};
