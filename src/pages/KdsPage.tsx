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
          bg: '#ff4d00',
          label: 'NEW // RECEIVED',
          buttonClass: 'bg-[#ff4d00] hover:opacity-95 text-white',
        };
      case 'cooking':
        return {
          bg: '#d97706',
          label: 'COOKING // GRILL LINE',
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

  return (
    <div
      className="min-h-screen bg-[#0d0f12] blueprint-dots-dark text-white flex flex-col font-sans select-none overflow-x-hidden"
      data-ui-container="kds-screen"
    >
      {/* High-Contrast Kitchen Top Header */}
      <header className="h-16 px-6 sm:px-8 bg-[#151921] border-b border-[#252b36] flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff4d00] animate-pulse" />
            <span className="text-[16px] font-medium tracking-tight text-white">
              Flame<span className="text-[#ff4d00]">Pass</span> KDS
            </span>
          </Link>

          <span className="hidden sm:inline text-[12px] font-mono-num text-[#94a3b8]">
            Line 01 Pass Expeditor
          </span>
        </div>

        {/* Action Controls & Simulated Test Order Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={addSampleOrder}
            data-ui-radius="999"
            className="px-4 py-1.5 rounded-full bg-[#ff4d00] hover:opacity-95 text-white text-[12px] font-mono-num font-medium transition-all shadow-xs cursor-pointer btn-ember-glow-sm active:scale-95"
            title="Inject a realistic incoming order ticket"
          >
            + Fire Test Chit
          </button>

          <Link
            to="/menu"
            data-ui-radius="999"
            className="px-4 py-1.5 rounded-full bg-[#252b36] hover:bg-[#333b49] text-[#e2e8f0] text-[12px] font-medium transition-all cursor-pointer"
          >
            Open Menu -&gt;
          </Link>
        </div>
      </header>

      {/* Real-Time Kitchen Metric Counters Bar */}
      <section className="px-6 sm:px-8 py-3.5 bg-[#11141a] border-b border-[#1f242d] flex flex-wrap items-center justify-between gap-4 text-[12px] font-mono-num">
        {/* Stage Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 rounded-full text-[12px] transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-white text-[#0d0f12] font-medium'
                : 'bg-[#1a202c] text-[#94a3b8] hover:text-white'
            }`}
          >
            Active Tickets ({openTickets.length + cookingTickets.length + readyTickets.length})
          </button>

          <button
            onClick={() => setStatusFilter('received')}
            className={`px-3 py-1 rounded-full text-[12px] transition-all cursor-pointer ${
              statusFilter === 'received'
                ? 'bg-[#ff4d00] text-white font-medium'
                : 'bg-[#1a202c] text-[#94a3b8] hover:text-white'
            }`}
          >
            New ({openTickets.length})
          </button>

          <button
            onClick={() => setStatusFilter('cooking')}
            className={`px-3 py-1 rounded-full text-[12px] transition-all cursor-pointer ${
              statusFilter === 'cooking'
                ? 'bg-[#d97706] text-white font-medium'
                : 'bg-[#1a202c] text-[#94a3b8] hover:text-white'
            }`}
          >
            On Grill ({cookingTickets.length})
          </button>

          <button
            onClick={() => setStatusFilter('ready')}
            className={`px-3 py-1 rounded-full text-[12px] transition-all cursor-pointer ${
              statusFilter === 'ready'
                ? 'bg-[#15803d] text-white font-medium'
                : 'bg-[#1a202c] text-[#94a3b8] hover:text-white'
            }`}
          >
            Ready for Pass ({readyTickets.length})
          </button>

          <button
            onClick={() => setStatusFilter('served')}
            className={`px-3 py-1 rounded-full text-[12px] transition-all cursor-pointer ${
              statusFilter === 'served'
                ? 'bg-[#475569] text-white font-medium'
                : 'bg-[#1a202c] text-[#94a3b8] hover:text-white'
            }`}
          >
            Served ({servedTickets.length})
          </button>
        </div>

        {/* Live Clock */}
        <div className="flex items-center gap-3 text-[#94a3b8]">
          <span>STATION CLOCK:</span>
          <span className="text-white font-medium" data-ui-number>
            {new Date(currentTime).toLocaleTimeString()}
          </span>
        </div>
      </section>

      {/* Main Single Unsectioned Auto-Fill Grid (DESIGN.md §5.5) */}
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
        {filteredOrders.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-center text-[#94a3b8]">
            <div className="w-16 h-16 rounded-full bg-[#151921] border border-[#252b36] flex items-center justify-center text-[#64748b] mb-4">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white">Line All Clear</h3>
            <p className="text-[13px] text-[#64748b] mt-1">No orders pending in this filter station.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(330px,1fr))] gap-6 items-start">
            {filteredOrders.map((ticket) => {
              const elapsedSeconds = getElapsedSeconds(ticket.createdAt);
              const theme = getTicketStatusTheme(ticket.status, elapsedSeconds);

              return (
                <article
                  key={ticket.id}
                  className="thermal-chit-kds flex flex-col justify-between animate-in zoom-in-95 duration-150"
                  style={{ minHeight: '380px' }}
                >
                  {/* 44px Solid Status Top Band */}
                  <div
                    style={{ backgroundColor: theme.bg }}
                    className="h-11 px-4 flex items-center justify-between text-white font-mono-num font-medium text-[12px] tracking-wider rounded-t-[5px]"
                  >
                    <span>{theme.label}</span>
                    <span className="text-white font-mono-num" data-ui-number>
                      {formatElapsed(ticket.createdAt)}
                    </span>
                  </div>

                  {/* Chit Header: Table & Order ID */}
                  <div className="px-5 pt-4 pb-3 border-b border-[#e2e8f0] flex items-start justify-between bg-[#fcfbf7]">
                    <div>
                      <div className="text-[20px] font-mono-num font-medium text-[#111827]" data-ui-number>
                        {ticket.tableNumber ? `TABLE ${ticket.tableNumber}` : 'ONLINE ORDER'}
                      </div>
                      <div className="text-[12px] font-mono-num text-[#64748b] mt-0.5" data-ui-number>
                        CHIT #{ticket.id} • {ticket.items.reduce((s, i) => s + i.quantity, 0)} ITEMS
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-mono-num text-[#64748b] block">
                        FIRED AT
                      </span>
                      <span className="text-[12px] font-mono-num font-medium text-[#111827]">
                        {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Notch Divider Tear Line */}
                  <div className="thermal-tear-line my-1" />

                  {/* Ticket Items & Modifier Specifications Printed Clearly on Face */}
                  <div className="px-5 py-3 space-y-4 flex-1 bg-[#fcfbf7]">
                    {ticket.items.map((item, idx) => (
                      <div key={item.cartItemId || idx} className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-baseline gap-2">
                            <span className="text-[16px] font-mono-num font-medium text-[#111827]" data-ui-number>
                              {item.quantity}x
                            </span>
                            <span className="text-[15px] font-medium text-[#111827] leading-tight">
                              <ThermalText text={item.menuItem.name} durationMs={idx === 0 ? 220 : 0} />
                            </span>
                          </div>
                        </div>

                        {/* Modifiers List on Ticket Face */}
                        {item.selectedModifiers.length > 0 && (
                          <div className="pl-6 space-y-0.5">
                            {item.selectedModifiers.map((mod) => (
                              <div
                                key={mod.id}
                                className="text-[12px] font-mono-num text-[#ff4d00] font-medium"
                              >
                                + {mod.name}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Special Kitchen Notes */}
                        {item.notes && (
                          <div className="pl-6 text-[12px] font-mono-num text-[#b91c1c] font-medium uppercase">
                            ! NOTE: {item.notes}
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
                        className={`w-full py-2.5 px-4 rounded text-[13px] font-mono-num font-medium transition-all active:scale-[0.99] cursor-pointer shadow-xs ${theme.buttonClass}`}
                      >
                        {getStatusActionText(ticket.status)}
                      </button>
                    ) : (
                      <div className="w-full py-2 text-center text-[12px] font-mono-num text-[#64748b]">
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
    </div>
  );
};
