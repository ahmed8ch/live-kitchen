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

  const getElapsedSeconds = (createdAt: number) => {
    return Math.max(0, Math.floor((currentTime - createdAt) / 1000));
  };

  const formatElapsed = (createdAt: number) => {
    const elapsedSeconds = getElapsedSeconds(createdAt);
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getStatusActionText = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return 'Start Cooking';
      case 'cooking':
        return 'Mark Ready for Pass';
      case 'ready':
        return 'Bump / Served';
      case 'served':
        return 'Completed';
    }
  };

  // High-contrast color-coded status banners for rapid visual scanning across the kitchen
  const getStatusBanner = (status: OrderStatus, isDelayed: boolean) => {
    if (isDelayed && status !== 'served') {
      return {
        bannerBg: 'bg-[#DC2626]',
        textColor: 'text-white',
        label: 'DELAYED / OVER 10 MIN',
        buttonBg: 'bg-[#DC2626] hover:bg-[#b91c1c]',
      };
    }
    switch (status) {
      case 'received':
        return {
          bannerBg: 'bg-[#EA580C]',
          textColor: 'text-white',
          label: 'NEW / RECEIVED',
          buttonBg: 'bg-[#EA580C] hover:opacity-95',
        };
      case 'cooking':
        return {
          bannerBg: 'bg-[#D97706]',
          textColor: 'text-white',
          label: 'COOKING / ON GRILL',
          buttonBg: 'bg-[#D97706] hover:opacity-95',
        };
      case 'ready':
        return {
          bannerBg: 'bg-[#16A34A]',
          textColor: 'text-white',
          label: 'READY / PLATING',
          buttonBg: 'bg-[#16A34A] hover:opacity-95',
        };
      case 'served':
        return {
          bannerBg: 'bg-[#475569]',
          textColor: 'text-white',
          label: 'SERVED / CLOSED',
          buttonBg: 'bg-[#475569] hover:bg-[#334155]',
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0F12] text-white flex flex-col font-sans select-none overflow-x-hidden" data-ui-container="kds-screen">
      {/* High-Contrast Kitchen Top Bar */}
      <header className="h-18 px-6 sm:px-8 bg-[#151921] border-b border-[#252b36] flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#EA580C] flex items-center justify-center text-white font-extrabold text-[15px] shadow-sm">
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
              FlameLink Big Screen Order Display / Single-Tap Bump Station
            </div>
          </div>
        </div>

        {/* Global Summary Counts & Fire Demo Order */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2.5 font-mono-num text-[13px]" data-ui-number>
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
            data-ui-radius="8"
            className="px-4 py-2 rounded-xl bg-[#EA580C] hover:opacity-95 text-white text-[13px] font-bold transition-all shadow-md active:scale-95 cursor-pointer btn-flame-glow"
          >
            + Fire Sample Ticket
          </button>

          <Link
            to="/"
            data-ui-radius="8"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[13px] font-semibold border border-slate-700 transition-colors"
          >
            Exit -&gt;
          </Link>
        </div>
      </header>

      {/* Filter Tabs (Clean, unsectioned single row) */}
      <div className="bg-[#12161f] border-b border-[#252b36] px-6 sm:px-8 py-3 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2" data-ui-actions="kds-filter">
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
              data-ui-radius="8"
              className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-white text-[#111827] shadow-md'
                  : 'bg-[#181d26] text-slate-400 hover:text-white border border-[#272f3d]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-[12px] font-mono-num text-slate-400 hidden sm:block">
          Tap anywhere on ticket or giant bump button to advance
        </div>
      </div>

      {/* Main Order Rail: Single Unified Auto-Fill Grid (NO Sectioned Columns) */}
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
              No orders waiting. Fire a sample demo ticket to test real paper ticket simulation.
            </p>
            <div className="mt-5">
              <button
                onClick={addSampleOrder}
                data-ui-radius="999"
                className="px-6 py-3 rounded-full bg-[#EA580C] hover:opacity-95 text-white text-[14px] font-bold transition-all shadow-md active:scale-95 cursor-pointer btn-flame-glow"
              >
                + Fire Sample Demo Ticket
              </button>
            </div>
          </div>
        ) : (
          <div
            className="grid gap-6 items-start"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            }}
          >
            {filteredOrders.map((ticket: OrderTicket) => {
              const elapsedSecs = getElapsedSeconds(ticket.createdAt);
              const isDelayed = elapsedSecs > 600; // >10 minutes
              const banner = getStatusBanner(ticket.status, isDelayed);
              const isSelected = selectedTicketId === ticket.id;

              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(isSelected ? null : ticket.id)}
                  data-ui-radius="16"
                  className={`chit-paper relative flex flex-col rounded-2xl overflow-hidden transition-all duration-150 cursor-pointer ${
                    isDelayed && ticket.status !== 'served'
                      ? 'border-2 border-[#DC2626] animate-pulse shadow-red-950/40'
                      : 'border border-slate-300'
                  } ${
                    isSelected ? 'ring-4 ring-[#EA580C] scale-[1.01]' : 'hover:-translate-y-0.5'
                  }`}
                  style={{
                    backgroundColor: '#FCFBF7',
                    color: '#111827',
                  }}
                >
                  {/* Top Color-Coded Header Band */}
                  <div className={`${banner.bannerBg} px-4 py-2.5 flex items-center justify-between text-white font-black`}>
                    <div className="text-[12px] tracking-wider uppercase font-mono-num">
                      {banner.label}
                    </div>
                    {/* Live Stopwatch Clock */}
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/35 font-mono-num text-[12px]" data-ui-number>
                      <span>{formatElapsed(ticket.createdAt)}</span>
                    </div>
                  </div>

                  {/* Thermal Paper Receipt Chit Header Area (Large Screen Legibility 22px-24px) */}
                  <div className="p-4 sm:p-5 border-b border-dashed border-[#CBD5E1]">
                    <div className="flex items-start justify-between">
                      <div>
                        {/* Table Number: 22px-24px Bold Tabular Numerals */}
                        <div className="text-2xl sm:text-[24px] font-black font-mono-num text-[#111827] tracking-tight leading-none" data-ui-number>
                          {ticket.tableNumber ? `TABLE ${ticket.tableNumber}` : 'COUNTER PICKUP'}
                        </div>
                        <div className="text-[13px] font-mono-num font-bold text-[#64748b] mt-1.5" data-ui-number>
                          #ORD-{ticket.id.replace('ticket-', '').replace('order-', '')}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[12px] font-mono-num text-[#64748b]" data-ui-number>
                          {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[11px] font-mono-num font-bold text-[#EA580C] uppercase mt-1" data-ui-number>
                          {ticket.items.reduce((s, i) => s + i.quantity, 0)} items total
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chit Body: Food Items with Quantities & 16px Indented Modifiers */}
                  <div className="p-4 sm:p-5 flex-1 divide-y divide-dashed divide-[#CBD5E1] space-y-4">
                    {ticket.items.map((item) => (
                      <div key={item.cartItemId} className="pt-3 first:pt-0">
                        {/* Item Title in Bold Large Type: 18px-20px */}
                        <div className="flex items-start gap-2.5 text-[18px] sm:text-[19px] font-black text-[#111827] leading-tight">
                          <span className="font-mono-num text-[#EA580C] shrink-0" data-ui-number>
                            [{item.quantity}x]
                          </span>
                          <span>{item.menuItem.name.toUpperCase()}</span>
                        </div>

                        {/* Modifiers Printed Sub-Bullets: 16px Bold Callouts */}
                        {item.selectedModifiers.length > 0 && (
                          <div className="mt-2 space-y-1 ml-5">
                            {item.selectedModifiers.map((mod) => (
                              <div
                                key={mod.id}
                                className="text-[15px] sm:text-[16px] font-bold text-[#b45309] flex items-center gap-1.5"
                              >
                                <span className="text-[#EA580C] font-mono-num">-&gt;</span>
                                <span>+ {mod.name.toUpperCase()}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Special Allergy / Kitchen Note Stamp */}
                        {item.notes && (
                          <div className="mt-2.5 ml-4 p-2.5 rounded-lg bg-red-50 border-2 border-dashed border-red-300 text-red-700 text-[13px] sm:text-[14px] font-bold uppercase tracking-wide">
                            <span className="font-black text-red-800 mr-1.5">[NOTE]:</span>
                            {item.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Thermal Paper Chit Serrated Perforation Line */}
                  <div className="border-t border-dashed border-[#CBD5E1] px-4 py-2.5 bg-[#f6f5ef] flex items-center justify-between text-[11px] font-mono-num text-[#64748b]">
                    <span>FLAMELINK CHIT #{ticket.id}</span>
                    <span>14% VAT ETA FISCAL</span>
                  </div>

                  {/* Giant 56px Touchscreen Bump Action Button (Easy for gloved hand to hit) */}
                  {ticket.status !== 'served' && (
                    <div className="p-3 bg-[#FCFBF7] border-t border-[#CBD5E1]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          advanceOrderStatus(ticket.id);
                        }}
                        data-ui-radius="8"
                        className={`w-full h-14 rounded-xl font-black text-[16px] tracking-wider uppercase transition-all shadow-md active:scale-95 cursor-pointer text-center text-white ${banner.buttonBg}`}
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
