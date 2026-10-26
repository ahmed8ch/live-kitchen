import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { OrderStatus, OrderTicket } from '../types/domain';

type StationFilter = 'all' | 'grill' | 'oven' | 'cold';

export const KdsPage: React.FC = () => {
  const orders = useAppStore((state) => state.orders);
  const advanceOrderStatus = useAppStore((state) => state.advanceOrderStatus);
  const addSampleOrder = useAppStore((state) => state.addSampleOrder);

  const [stationFilter, setStationFilter] = useState<StationFilter>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Live ticking elapsed timer updating every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const openTicketsCount = orders.filter((o) => o.status === 'received').length;
  const cookingTicketsCount = orders.filter((o) => o.status === 'cooking').length;
  const readyTicketsCount = orders.filter((o) => o.status === 'ready').length;

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (statusFilter === 'all' && o.status === 'served') return false;

    // Filter by station based on item category
    if (stationFilter === 'grill') {
      return o.items.some((i) => i.menuItem.category === 'burgers' || i.menuItem.category === 'steaks');
    }
    if (stationFilter === 'oven') {
      return o.items.some((i) => i.menuItem.category === 'pizzas' || i.menuItem.category === 'pastas');
    }
    if (stationFilter === 'cold') {
      return o.items.some((i) => i.menuItem.category === 'drinks');
    }

    return true;
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
        return 'Start Cooking';
      case 'cooking':
        return 'Mark Ready';
      case 'ready':
        return 'Mark Delivered';
      case 'served':
        return 'Delivered';
    }
  };

  const getHeaderColors = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return 'bg-orange-950/70 border-orange-700/60 text-orange-200';
      case 'cooking':
        return 'bg-amber-950/70 border-amber-700/60 text-amber-200';
      case 'ready':
        return 'bg-emerald-950/70 border-emerald-700/60 text-emerald-200';
      case 'served':
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  return (
    <div
      className="min-h-screen bg-[#0f172a] text-[#f1f5f9] flex flex-col font-sans"
      style={{
        backgroundImage: 'radial-gradient(#1e293b 1.2px, transparent 1.2px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Top Station Header */}
      <header className="h-16 px-6 bg-[#1e293b]/90 backdrop-blur-md border-b border-slate-700/70 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#ea580c] flex items-center justify-center text-white font-bold text-[13px] shadow-sm">
            KDS
          </div>
          <div>
            <h1 className="text-[15px] font-bold tracking-tight text-white flex items-center gap-2">
              <span>Kitchen Display Station</span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-orange-400 font-semibold">Hot Flame Pass</span>
            </h1>
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Cross-Tab WebSocket Sync Active</span>
            </div>
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={addSampleOrder}
            className="px-3 py-1.5 rounded-lg bg-[#ea580c] hover:bg-[#c2410c] text-white text-[12px] font-semibold transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            + Fire Sample Demo Ticket
          </button>
          <Link
            to="/"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[12px] font-medium border border-slate-700 transition-colors"
          >
            Exit to Home &rarr;
          </Link>
        </div>
      </header>

      {/* Live KDS Metrics Summary Bar */}
      <section className="bg-slate-900/80 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Metric Counters */}
        <div className="flex items-center gap-4 text-[13px]">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-slate-400">Open Tickets:</span>
            <span className="font-mono-num font-bold text-orange-400">{openTicketsCount}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-slate-400">Flame Cooking:</span>
            <span className="font-mono-num font-bold text-amber-400">{cookingTicketsCount}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-slate-400">Ready to Bump:</span>
            <span className="font-mono-num font-bold text-emerald-400">{readyTicketsCount}</span>
          </div>
        </div>

        {/* Station Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {(
            [
              { id: 'all', label: 'All Stations' },
              { id: 'grill', label: 'Flame Grill' },
              { id: 'oven', label: 'Wood-Fired Oven' },
              { id: 'cold', label: 'Cold Pass' },
            ] as const
          ).map((station) => (
            <button
              key={station.id}
              onClick={() => setStationFilter(station.id)}
              className={`px-3 py-1 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                stationFilter === station.id
                  ? 'bg-white text-[#0f172a] shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700/80'
              }`}
            >
              {station.label}
            </button>
          ))}

          <span className="text-slate-700 mx-1">|</span>

          {/* Status Filter */}
          {(['all', 'received', 'cooking', 'ready'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono-num uppercase transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-[#ea580c] text-white font-bold'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </section>

      {/* Orders Grid */}
      <main className="flex-1 p-6 overflow-y-auto">
        {filteredOrders.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-center text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4 text-slate-500 shadow-md">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">Line Pass is Clear</h3>
            <p className="text-[13px] text-slate-400 mt-1 max-w-sm">
              All placed orders have been expedited. Click below to fire a rich sample ticket and test line bump mechanics.
            </p>
            <div className="mt-5">
              <button
                onClick={addSampleOrder}
                className="px-5 py-2.5 rounded-full bg-[#ea580c] hover:bg-[#c2410c] text-white text-[13px] font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                + Fire Sample Demo Ticket
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredOrders.map((ticket: OrderTicket) => (
              <div
                key={ticket.id}
                className="bg-slate-900/95 rounded-2xl border border-slate-800 flex flex-col justify-between overflow-hidden shadow-lg transition-all hover:border-slate-700"
              >
                {/* Header with Table Badge & Elapsed Stopwatch */}
                <div className={`p-4 border-b ${getHeaderColors(ticket.status)} flex items-center justify-between`}>
                  <div>
                    <div className="text-[15px] font-extrabold font-mono-num tracking-tight">
                      #{ticket.id}
                    </div>
                    <div className="text-[13px] font-bold mt-0.5 tracking-wide">
                      {ticket.tableNumber ? (
                        <span className="inline-block bg-white/20 px-2 py-0.5 rounded font-mono-num">
                          TABLE {ticket.tableNumber}
                        </span>
                      ) : (
                        <span className="text-slate-300">Online / Counter Pickup</span>
                      )}
                    </div>
                  </div>

                  {/* Stopwatch Elapsed Timer */}
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 border border-white/10 font-mono-num text-[12px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                      <span>{formatElapsed(ticket.createdAt)}</span>
                    </div>
                    <div className="text-[10px] text-white/70 font-mono-num mt-1">
                      {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {/* Items & Modifiers Sub-bullets */}
                <div className="p-4 divide-y divide-slate-800/80 flex-1 overflow-y-auto max-h-72 space-y-3.5">
                  {ticket.items.map((item) => (
                    <div key={item.cartItemId} className="pt-2 first:pt-0">
                      <div className="flex items-start justify-between text-[14px] font-bold text-white">
                        <span>
                          <span className="text-[#ea580c] font-mono-num mr-1.5">{item.quantity}x</span>
                          {item.menuItem.name}
                        </span>
                      </div>

                      {/* Render All Selected Add-ons / Modifiers with Sub-bullet */}
                      {item.selectedModifiers.length > 0 && (
                        <div className="mt-1.5 text-[12px] text-slate-300 space-y-1 ml-4">
                          {item.selectedModifiers.map((mod) => (
                            <div key={mod.id} className="flex items-center gap-1.5 text-amber-200/90 font-medium">
                              <span className="text-slate-500 font-mono-num">&rarr;</span>
                              <span>+ {mod.name}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Special Kitchen Note */}
                      {item.notes && (
                        <div className="mt-2 text-[11px] text-amber-200 bg-amber-950/50 border border-amber-800/60 px-2.5 py-1 rounded ml-4 font-medium">
                          Note: {item.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer Bump Action */}
                <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-3">
                  <div className="text-[12px] font-bold text-slate-400 font-mono-num">
                    {ticket.status.toUpperCase()}
                  </div>

                  {ticket.status !== 'served' && (
                    <button
                      onClick={() => advanceOrderStatus(ticket.id)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white text-[13px] font-bold transition-all active:scale-95 cursor-pointer shadow-md text-center"
                    >
                      {getStatusActionText(ticket.status)} &rarr;
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
