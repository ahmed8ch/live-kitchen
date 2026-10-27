import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { OrderStatus } from '../types/domain';
import { ThermalText } from '../components/ui/ThermalText';

export const KdsPage: React.FC = () => {
  const orders = useAppStore((state) => state.orders);
  const advanceOrderStatus = useAppStore((state) => state.advanceOrderStatus);
  const addSampleOrder = useAppStore((state) => state.addSampleOrder);

  const [statusFilter, setStatusFilter] = useState<'active' | OrderStatus>('active');
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Live stopwatch timer ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // THE PAYMENT GATE: strictly filter only VERIFIED PAID orders on the kitchen line
  const verifiedOrders = orders.filter((o) => o.paymentStatus === 'verified_paid');

  const openTickets = verifiedOrders.filter((o) => o.status === 'received');
  const cookingTickets = verifiedOrders.filter((o) => o.status === 'cooking');
  const readyTickets = verifiedOrders.filter((o) => o.status === 'ready');
  const servedTickets = verifiedOrders.filter((o) => o.status === 'served');

  const filteredOrders = verifiedOrders.filter((o) => {
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
        return 'Start Cooking ->';
      case 'cooking':
        return 'Mark Ready for Pass ->';
      case 'ready':
        return 'Bump / Served ->';
      case 'served':
        return 'Closed';
    }
  };

  // Status Top Band Configuration per DESIGN.md §1 & §5.5
  const getTicketStatusTheme = (status: OrderStatus, elapsedSeconds: number) => {
    // Delayed condition: over 10 min (600s) and not served
    if (elapsedSeconds > 600 && status !== 'served') {
      return {
        bg: '#dc2626',
        label: 'DELAYED // >10 MIN',
        buttonClass: 'bg-[#dc2626] hover:bg-[#b91c1c] text-white',
      };
    }

    switch (status) {
      case 'received':
        return {
          bg: '#FF0055',
          label: 'NEW // VERIFIED PAID',
          buttonClass: 'bg-[#FF0055] hover:opacity-95 text-white',
        };
      case 'cooking':
        return {
          bg: '#d97706',
          label: 'COOKING // FLAME LINE',
          buttonClass: 'bg-[#d97706] hover:opacity-95 text-white',
        };
      case 'ready':
        return {
          bg: '#15803d',
          label: 'READY // PASS EXPEDITE',
          buttonClass: 'bg-[#15803d] hover:opacity-95 text-white',
        };
      case 'served':
        return {
          bg: '#475569',
          label: 'SERVED // CLOSED',
          buttonClass: 'bg-[#334155] text-[#94a3b8] cursor-default',
        };
    }
  };

  // Whole Number Aggregation Stats across all active orders
  const activeOrdersForStats = verifiedOrders.filter((o) => o.status !== 'served');
  const dishAggregations: Record<string, number> = {};
  activeOrdersForStats.forEach((ticket) => {
    ticket.items.forEach((item) => {
      dishAggregations[item.menuItem.name] =
        (dishAggregations[item.menuItem.name] || 0) + item.quantity;
    });
  });

  return (
    <div
      className="min-h-screen bg-[#0d0f12] blueprint-dots-dark text-white flex flex-col font-sans select-none overflow-x-hidden pb-16"
      data-ui-container="kds-screen"
    >
      {/* High-Contrast Kitchen Top Header */}
      <header className="h-16 px-6 sm:px-8 bg-[#151921] border-b border-[#252b36] flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF0055] animate-pulse" />
            <span className="text-[18px] font-bold tracking-tight text-white">
              Flame<span className="text-[#FF0055]">Pass</span> KDS
            </span>
          </Link>

          <span className="hidden sm:inline text-[13px] font-mono-num text-[#94a3b8]">
            Kitchen Expeditor Pass // Station 01
          </span>
        </div>

        {/* Action Controls & Simulated Test Order Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={addSampleOrder}
            data-ui-radius="999"
            className="px-4 py-1.5 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-[12px] font-mono-num font-medium transition-all shadow-xs cursor-pointer btn-crimson-glow-sm active:scale-95"
            title="Inject a realistic incoming order ticket"
          >
            + Fire Verified Test Chit
          </button>

          <Link
            to="/cashier"
            data-ui-radius="999"
            className="px-4 py-1.5 rounded-full bg-[#252b36] hover:bg-[#333b49] text-[#e2e8f0] text-[12px] font-medium transition-all cursor-pointer"
          >
            Cashier Station -&gt;
          </Link>
        </div>
      </header>

      {/* Real-Time Kitchen Metric Counters Bar */}
      <section className="px-6 sm:px-8 py-3.5 bg-[#11141a] border-b border-[#1f242d] flex flex-wrap items-center justify-between gap-4 text-[13px] font-mono-num">
        {/* Stage Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3.5 py-1 rounded-full text-[12px] transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-white text-[#0d0f12] font-semibold'
                : 'bg-[#1a202c] text-[#94a3b8] hover:text-white'
            }`}
          >
            Active Tickets ({openTickets.length + cookingTickets.length + readyTickets.length})
          </button>

          <button
            onClick={() => setStatusFilter('received')}
            className={`px-3.5 py-1 rounded-full text-[12px] transition-all cursor-pointer ${
              statusFilter === 'received'
                ? 'bg-[#FF0055] text-white font-semibold'
                : 'bg-[#1a202c] text-[#94a3b8] hover:text-white'
            }`}
          >
            New ({openTickets.length})
          </button>

          <button
            onClick={() => setStatusFilter('cooking')}
            className={`px-3.5 py-1 rounded-full text-[12px] transition-all cursor-pointer ${
              statusFilter === 'cooking'
                ? 'bg-[#d97706] text-white font-semibold'
                : 'bg-[#1a202c] text-[#94a3b8] hover:text-white'
            }`}
          >
            On Grill ({cookingTickets.length})
          </button>

          <button
            onClick={() => setStatusFilter('ready')}
            className={`px-3.5 py-1 rounded-full text-[12px] transition-all cursor-pointer ${
              statusFilter === 'ready'
                ? 'bg-[#15803d] text-white font-semibold'
                : 'bg-[#1a202c] text-[#94a3b8] hover:text-white'
            }`}
          >
            Ready for Pass ({readyTickets.length})
          </button>

          <button
            onClick={() => setStatusFilter('served')}
            className={`px-3.5 py-1 rounded-full text-[12px] transition-all cursor-pointer ${
              statusFilter === 'served'
                ? 'bg-[#475569] text-white font-semibold'
                : 'bg-[#1a202c] text-[#94a3b8] hover:text-white'
            }`}
          >
            Served ({servedTickets.length})
          </button>
        </div>

        {/* Live Clock & Queue Stack Indicator */}
        <div className="flex items-center gap-4 text-[#94a3b8]">
          {filteredOrders.length > 4 && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#252b36] text-[#FF0055] font-semibold text-[11px]">
              +{filteredOrders.length - 4} in queue
            </span>
          )}

          <div className="flex items-center gap-2">
            <span>STATION CLOCK:</span>
            <span className="text-white font-medium" data-ui-number>
              {new Date(currentTime).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </section>

      {/* Main Single Unsectioned Auto-Fill Grid (DESIGN.md §5.5) with Large Legible Font Hierarchy */}
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
        {filteredOrders.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-center text-[#94a3b8]">
            <div className="w-16 h-16 rounded-full bg-[#151921] border border-[#252b36] flex items-center justify-center text-[#64748b] mb-4">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-white">Line All Clear</h3>
            <p className="text-[14px] text-[#64748b] mt-1">
              No orders pending. Orders awaiting cashier verification will appear once settled.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
            {filteredOrders.map((ticket) => {
              const elapsedSeconds = getElapsedSeconds(ticket.createdAt);
              const theme = getTicketStatusTheme(ticket.status, elapsedSeconds);

              return (
                <article
                  key={ticket.id}
                  className="thermal-chit-kds flex flex-col justify-between animate-in zoom-in-95 duration-150 border-2 border-[#252b36] shadow-xl"
                  style={{ minHeight: '420px' }}
                >
                  {/* 44px Solid Status Top Band */}
                  <div
                    style={{ backgroundColor: theme.bg }}
                    className="h-12 px-4 flex items-center justify-between text-white font-mono-num font-semibold text-[13px] tracking-wider rounded-t-[5px]"
                  >
                    <span>{theme.label}</span>
                    <span className="text-white font-mono-num text-[14px]" data-ui-number>
                      {formatElapsed(ticket.createdAt)}
                    </span>
                  </div>

                  {/* Chit Header: 24px Font Size Table & Order ID (Agent 06 spec) */}
                  <div className="px-5 pt-4 pb-3 border-b border-[#e2e8f0] flex items-start justify-between bg-[#fcfbf7]">
                    <div>
                      <div className="text-[24px] font-mono-num font-bold text-[#111827] leading-none" data-ui-number>
                        {ticket.tableNumber ? `TABLE ${ticket.tableNumber}` : 'ONLINE ORDER'}
                      </div>
                      <div className="text-[13px] font-mono-num text-[#64748b] mt-1.5" data-ui-number>
                        CHIT #{ticket.id} • {ticket.items.reduce((s, i) => s + i.quantity, 0)} ITEMS
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-mono-num text-[#64748b] block uppercase">
                        FIRED
                      </span>
                      <span className="text-[13px] font-mono-num font-semibold text-[#111827]">
                        {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Notch Divider Tear Line */}
                  <div className="thermal-tear-line my-1" />

                  {/* Ticket Items: 20px Dish Font, 18px Bold Modifiers (Agent 06 spec) */}
                  <div className="px-5 py-4 space-y-5 flex-1 bg-[#fcfbf7]">
                    {ticket.items.map((item, idx) => (
                      <div key={item.cartItemId || idx} className="space-y-1.5 border-b border-dashed border-[#e2e8f0] pb-3 last:border-b-0 last:pb-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-baseline gap-2.5">
                            <span className="text-[20px] font-mono-num font-bold text-[#111827]" data-ui-number>
                              {item.quantity}x
                            </span>
                            <span className="text-[20px] font-bold text-[#111827] leading-snug">
                              <ThermalText text={item.menuItem.name} durationMs={idx === 0 ? 220 : 0} />
                            </span>
                          </div>
                        </div>

                        {/* Modifiers List: 18px Bold Crimson (Agent 06 spec) */}
                        {item.selectedModifiers.length > 0 && (
                          <div className="pl-6 space-y-1">
                            {item.selectedModifiers.map((mod) => (
                              <div
                                key={mod.id}
                                className="text-[18px] font-mono-num font-bold text-[#FF0055]"
                              >
                                + {mod.name}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Special Kitchen Notes */}
                        {item.notes && (
                          <div className="pl-6 text-[14px] font-mono-num text-[#b91c1c] font-bold uppercase bg-red-50 p-1.5 rounded">
                            ! NOTE: {item.notes}
                          </div>
                        )}

                        {/* Diner Attribution */}
                        {item.addedBy && (
                          <div className="pl-6 text-[11px] font-mono-num text-[#727272]">
                            Diner: {item.addedBy.name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Bottom Action Footer & Bump Button */}
                  <div className="p-4 bg-[#f4f2ea] border-t border-[#e2e8f0] rounded-b-[5px]">
                    {ticket.status !== 'served' ? (
                      <button
                        onClick={() => advanceOrderStatus(ticket.id)}
                        data-ui-radius="6"
                        className={`w-full py-3.5 px-4 rounded text-[15px] font-mono-num font-bold transition-all active:scale-[0.99] cursor-pointer shadow-md ${theme.buttonClass}`}
                      >
                        {getStatusActionText(ticket.status)}
                      </button>
                    ) : (
                      <div className="w-full py-2.5 text-center text-[13px] font-mono-num text-[#64748b]">
                        Ticket Completed & Expedited
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Sticky Bottom Footer: Whole Number Totals across all active orders */}
      <footer className="fixed bottom-0 inset-x-0 bg-[#151921] border-t border-[#252b36] py-2.5 px-6 z-30 flex items-center justify-between text-[12px] font-mono-num shadow-2xl">
        <div className="flex items-center gap-2 text-[#94a3b8] shrink-0 mr-4">
          <span className="w-2 h-2 rounded-full bg-[#FF0055]" />
          <span className="font-semibold text-white uppercase">Kitchen Batch Totals:</span>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto scrollbar-none py-1">
          {Object.keys(dishAggregations).length === 0 ? (
            <span className="text-[#64748b]">No active dishes on the grill line</span>
          ) : (
            Object.entries(dishAggregations).map(([name, count]) => (
              <div
                key={name}
                className="px-2.5 py-1 rounded bg-[#252b36] border border-[#333b49] text-white shrink-0 flex items-center gap-1.5"
              >
                <span className="text-[#FF0055] font-bold text-[13px]">{count}x</span>
                <span>{name}</span>
              </div>
            ))
          )}
        </div>
      </footer>
    </div>
  );
};
