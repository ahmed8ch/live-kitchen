import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cart = useAppStore((state) => state.cart);
  const openCartDrawer = useAppStore((state) => state.openCartDrawer);
  const activeTable = useAppStore((state) => state.activeTable);
  const setActiveTable = useAppStore((state) => state.setActiveTable);
  const orders = useAppStore((state) => state.orders);

  // Read ?table=XX from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tableParam = params.get('table');
    if (tableParam && tableParam.trim().length > 0) {
      setActiveTable(tableParam.trim().toUpperCase());
    }
  }, [location.search, setActiveTable]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const latestOrder = orders.length > 0 ? orders[0] : null;

  const isMenuPage = location.pathname === '/menu';
  const isKdsPage = location.pathname === '/kds';

  if (isKdsPage) {
    return null;
  }

  const handleTrackerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (latestOrder) {
      navigate(`/order/${latestOrder.id}${activeTable ? `?table=${activeTable}` : ''}`);
    } else {
      navigate(`/order/active${activeTable ? `?table=${activeTable}` : ''}`);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#e5e7eb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Lockup: Single Baseline MatbakhLink */}
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 text-left group transition-opacity hover:opacity-95"
          aria-label="MatbakhLink Home"
        >
          {/* Flame Icon */}
          <div className="w-9 h-9 rounded-xl bg-[#ea580c] flex items-center justify-center text-white shadow-sm shrink-0">
            <svg
              className="w-5 h-5"
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

          {/* Unified Single Baseline Typography */}
          <span className="text-xl font-extrabold tracking-tight text-[#0f172a] select-none">
            Matbakh<span className="text-[#ea580c]">Link</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-[14px] font-medium text-[#727272]">
          <Link
            to="/#features"
            className="transition-colors hover:text-[#0f172a]"
          >
            Features
          </Link>
          <Link
            to={activeTable ? `/menu?table=${activeTable}` : '/menu'}
            className={`transition-colors hover:text-[#0f172a] ${
              isMenuPage ? 'text-[#ea580c] font-semibold' : ''
            }`}
          >
            Live Demo Menu
          </Link>
          <button
            onClick={handleTrackerClick}
            className="transition-colors hover:text-[#0f172a] text-left cursor-pointer flex items-center gap-1.5"
          >
            <span>Order Tracker</span>
            {latestOrder && !latestOrder.isPaid && (
              <span className="px-1.5 py-0.5 text-[11px] rounded-full bg-amber-100 text-amber-800 font-mono-num font-semibold">
                Live
              </span>
            )}
          </button>
          <Link
            to="/kds"
            className="transition-colors hover:text-[#0f172a]"
          >
            Kitchen KDS
          </Link>
          <Link
            to="/stand"
            className="transition-colors hover:text-[#0f172a]"
          >
            QR Stand Studio
          </Link>
        </nav>

        {/* Right Actions: Table Pill & CTAs */}
        <div className="flex items-center gap-3">
          {activeTable && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] text-[12px] font-medium text-[#0f172a]">
              <span className="w-2 h-2 rounded-full bg-[#ea580c]" />
              <span className="font-mono-num font-semibold">Table {activeTable}</span>
            </div>
          )}

          {isMenuPage ? (
            <button
              onClick={() => openCartDrawer()}
              className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f9f9f9] hover:bg-[#f0f0f0] border border-[#e5e7eb] text-[13px] font-medium text-[#0f172a] transition-all cursor-pointer active:scale-95"
              aria-label="View Cart"
            >
              <svg
                className="w-4 h-4 text-[#0f172a]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span>Cart</span>
              {totalCartCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#ea580c] text-white text-[11px] font-mono-num font-bold">
                  {totalCartCount}
                </span>
              )}
            </button>
          ) : (
            <Link
              to={activeTable ? `/menu?table=${activeTable}` : '/menu'}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ea580c] hover:bg-[#c2410c] text-white text-[13px] font-semibold transition-all shadow-sm active:scale-95"
            >
              <span>Launch Dine-In Menu</span>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#0f172a] hover:bg-[#f9f9f9] border border-[#e5e7eb] transition-colors"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#e5e7eb] bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-[14px] font-medium text-[#0f172a] hover:bg-[#f9f9f9]"
          >
            Features
          </Link>
          <Link
            to={activeTable ? `/menu?table=${activeTable}` : '/menu'}
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-[14px] font-semibold text-[#ea580c] hover:bg-[#f9f9f9]"
          >
            Live Demo Menu
          </Link>
          <button
            onClick={handleTrackerClick}
            className="w-full text-left px-3 py-2 rounded-lg text-[14px] font-medium text-[#0f172a] hover:bg-[#f9f9f9] flex items-center justify-between"
          >
            <span>Order Tracker</span>
            {latestOrder && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-mono-num font-semibold">
                #{latestOrder.id}
              </span>
            )}
          </button>
          <Link
            to="/kds"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-[14px] font-medium text-[#0f172a] hover:bg-[#f9f9f9]"
          >
            Kitchen KDS (Line Cook Display)
          </Link>
          <Link
            to="/stand"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-[14px] font-medium text-[#0f172a] hover:bg-[#f9f9f9]"
          >
            QR Stand Studio
          </Link>
        </div>
      )}
    </header>
  );
};
