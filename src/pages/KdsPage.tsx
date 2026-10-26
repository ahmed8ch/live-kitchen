import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { OrderStatus, OrderTicket } from '../types/domain';

export const KdsPage: React.FC = () => {
  const orders = useAppStore((state) => state.orders);
  const advanceOrderStatus = useAppStore((state) => state.advanceOrderStatus);
  const addSampleOrder = useAppStore((state) => state.addSampleOrder);

  const [statusFilter, setStatusFilter] = useState<'active' | OrderStatus>('active');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Live ticking elapsed stopwatch timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const openTickets = orders.filter((o) => o.status === 'received');
  const cookingTickets = orders.filter((o) => o.status === 'cooking');
  const readyTickets = orders.filter((o) => o.status === 'ready');
  const servedTickets = orders.filter((o) => o.status === 'served');

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'active') return o.status !== 'served';
    return o.status === statusFilter;
  });

  const formatElapsed = (createdAt: number) => {
    const elapsedSeconds = Math.max(0, Math.floor((currentTime - createdAt) / 1000));
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getStatusActionText = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return 'START COOKING ->';
      case 'cooking':
        return 'MARK PLATED & READY ->';
      case 'ready':
        return 'MARK DELIVERED ->';
      case 'served':
        return 'COMPLETED';
    }
  };

  // High-contrast color-coded status banners for rapid visual scanning across the kitchen
  const getStatusBanner = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return {
          bannerBg: 'bg-[#ff4d00]',
          textColor: 'text-white',
          label: 'NEW TICKET / RECEIVED',
          timerBadge: 'bg-black/30 text-white',
        };
      case 'cooking':
        return {
          bannerBg: 'bg-[#d97706]',
          textColor: 'text-white',
          label: 'FLAME COOKING / IN LINE',
          timerBadge: 'bg-black/30 text-white',
        };
      case 'ready':
        return {
          bannerBg: 'bg-[#059669]',
          textColor: 'text-white',
          label: 'PLATED / READY TO SERVE',
          timerBadge: 'bg-black/30 text-white',
        };
      case 'served':
        return {
          bannerBg: 'bg-[#475569]',
          textColor: 'text-white',
          label: 'DELIVERED / CLOSED',
          timerBadge: 'bg-black/30 text-white',
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans select-none overflow-x-hidden">
      {/* High-Contrast Kitchen Top Bar */}
      <header className="h-18 px-6 sm:px-8 bg-[#161c28] border-b border-slate-800 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#ff4d00] flex items-center justify-center text-white font-extrabold text-[15px] shadow-sm">
            KDS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-wider uppercase text-white">
                Live Kitchen Pass
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono-num font-bold text-[11px]">
                SYNCED
              </span>
            </div>
            <div className="text-[12px] text-slate-400">
              Big Screen Kitchen Order System / Single-Tap Bump Station
            </div>
          </div>
        </div>

        {/* Global Summary Counts & Fire Demo Order */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2.5 font-mono-num text-[13px]">
            <span className="px-3 py-1.5 rounded-lg bg-orange-950/70 border border-orange-700/60 text-orange-200 font-bold">
              {openTickets.length} NEW
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-amber-950/70 border border-amber-700/60 text-amber-200 font-bold">
              {cookingTickets.length} COOKING
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-700/60 text-emerald-200 font-bold">
              {readyTickets.length} READY
            </span>
          </div>

          <button
            onClick={addSampleOrder}
            className="px-4 py-2 rounded-xl bg-[#ff4d00] hover:opacity-95 text-white text-[13px] font-bold transition-all shadow-md active:scale-95 cursor-pointer btn-ember-glow"
          >
            + Fire Sample Ticket
          </button>

          <Link
            to="/"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[13px] font-semibold border border-slate-700 transition-colors"
          >
            Exit -&gt;
          </Link>
        </div>
      </header>

      {/* Status Bar / Filter Tabs (Clean, unsectioned single row) */}
      <div className="bg-[#0e1422] border-b border-slate-800 px-6 sm:px-8 py-3 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2">
          {(
            [
              { id: 'active', label: `Active Board (${openTickets.length + cookingTickets.length + readyTickets.length})` },
              { id: 'received', label: `New (${openTickets.length})` },
              { id: 'cooking', label: `Cooking (${cookingTickets.length})` },
              { id: 'ready', label: `Ready (${readyTickets.length})` },
              { id: 'served', label: `Delivered (${servedTickets.length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-white text-[#262626] shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-[12px] font-mono-num text-slate-400 hidden sm:block">
          Tap anywhere on ticket to inspect or bump
        </div>
      </div>

      {/* Main Order Rail: Authentic Kitchen Paper Chit Simulation */}
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
        {filteredOrders.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-center text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4 text-slate-500 shadow-md">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Line Rail is Clear</h2>
            <p className="text-[14px] text-slate-400 mt-1 max-w-sm">
              No orders are currently waiting. Fire a sample demo ticket to test the real paper ticket simulation.
            </p>
            <div className="mt-5">
              <button
                onClick={addSampleOrder}
                className="px-6 py-3 rounded-full bg-[#ff4d00] hover:opacity-95 text-white text-[14px] font-bold transition-all shadow-md active:scale-95 cursor-pointer btn-ember-glow"
              >
                + Fire Sample Demo Ticket
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 items-start">
            {filteredOrders.map((ticket: OrderTicket) => {
              const banner = getStatusBanner(ticket.status);
              const isSelected = selectedTicketId === ticket.id;

              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(isSelected ? null : ticket.id)}
                  className={`relative flex flex-col bg-[#ffffff] text-[#111827] rounded-2xl shadow-2xl overflow-hidden transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'ring-4 ring-[#ff4d00] scale-[1.01]'
                      : 'hover:shadow-3xl hover:-translate-y-0.5'
                  }`}
                  style={{
                    backgroundColor: '#ffffff',
                    backgroundImage: 'linear-gradient(to bottom, #ffffff 0%, #fdfcf9 100%)',
                  }}
                >
                  {/* Top Color-Coded Header Band (Distinct color per status for fast staff scanning) */}
                  <div className={`${banner.bannerBg} px-4 py-2.5 flex items-center justify-between text-white font-black`}>
                    <div className="text-[12px] tracking-wider uppercase">
                      {banner.label}
                    </div>
                    {/* Live Stopwatch Clock */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/30 font-mono-num text-[12px]">
                      <span>{formatElapsed(ticket.createdAt)}</span>
                    </div>
                  </div>

                  {/* Paper Receipt Chit Header Area */}
                  <div className="p-4 sm:p-5 border-b-2 border-dashed border-slate-200">
                    <div className="flex items-start justify-between">
                      <div>
                        {/* Table Number in Huge Print for Big Screen Visibility */}
                        <div className="text-2xl sm:text-3xl font-black font-mono-num text-[#262626] tracking-tight">
                          {ticket.tableNumber ? `TABLE ${ticket.tableNumber}` : 'COUNTER PICKUP'}
                        </div>
                        <div className="text-[13px] font-mono-num font-bold text-[#64748b] mt-0.5">
                          TICKET #{ticket.id}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[12px] font-mono-num text-[#64748b]">
                          {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[11px] font-mono-num font-bold text-[#ff4d00] uppercase mt-0.5">
                          {ticket.items.reduce((s, i) => s + i.quantity, 0)} items total
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Paper Receipt Chit Body: Food Items with Modifiers & Special Notes */}
                  <div className="p-4 sm:p-5 flex-1 divide-y divide-slate-100 space-y-4">
                    {ticket.items.map((item) => (
                      <div key={item.cartItemId} className="pt-3 first:pt-0">
                        {/* Item Title in Bold Large Type */}
                        <div className="flex items-start gap-2 text-[16px] sm:text-[17px] font-black text-[#262626] leading-tight">
                          <span className="font-mono-num text-[#ff4d00] shrink-0">
                            [{item.quantity}x]
                          </span>
                          <span>{item.menuItem.name.toUpperCase()}</span>
                        </div>

                        {/* Modifiers Printed Sub-Bullets */}
                        {item.selectedModifiers.length > 0 && (
                          <div className="mt-2 space-y-1 ml-5">
                            {item.selectedModifiers.map((mod) => (
                              <div
                                key={mod.id}
                                className="text-[13px] font-bold text-[#334155] flex items-center gap-1.5"
                              >
                                <span className="text-[#ff4d00] font-mono-num">-&gt;</span>
                                <span>+ {mod.name.toUpperCase()}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Special Allergy / Kitchen Note Stamp */}
                        {item.notes && (
                          <div className="mt-2.5 ml-3 p-2 rounded-lg bg-red-50 border-2 border-dashed border-red-300 text-red-700 text-[12px] font-bold uppercase tracking-wide">
                            <span className="font-black text-red-800 mr-1.5">[NOTE]:</span>
                            {item.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Paper Chit Serrated Bottom Perforation Bar */}
                  <div className="border-t-2 border-dashed border-slate-200 px-4 py-3 bg-[#fcfbf9] flex items-center justify-between text-[11px] font-mono-num text-[#64748b]">
                    <span>MATBAKHLINK CHIT #{ticket.id}</span>
                    <span>14% VAT ETA FISCAL</span>
                  </div>

                  {/* Giant Touchscreen Bump Action Button (Easy to hit on big screen) */}
                  {ticket.status !== 'served' && (
                    <div className="p-3 bg-white border-t border-slate-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          advanceOrderStatus(ticket.id);
                        }}
                        className={`w-full py-4 px-4 rounded-xl font-black text-[15px] sm:text-[16px] tracking-wide uppercase transition-all shadow-md active:scale-95 cursor-pointer text-center text-white ${
                          ticket.status === 'received'
                            ? 'bg-[#ff4d00] hover:opacity-95'
                            : ticket.status === 'cooking'
                            ? 'bg-[#059669] hover:bg-[#047857]'
                            : 'bg-[#262626] hover:bg-black'
                        }`}
                      >
                        {getStatusActionText(ticket.status)}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
