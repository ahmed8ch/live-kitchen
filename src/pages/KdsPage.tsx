import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { OrderStatus, OrderTicket } from '../types/domain';

export const KdsPage: React.FC = () => {
  const orders = useAppStore((state) => state.orders);
  const advanceOrderStatus = useAppStore((state) => state.advanceOrderStatus);
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');

  const filteredOrders = orders.filter((o) => {
    if (filter === 'all') return o.status !== 'served';
    return o.status === filter;
  });

  const getStatusActionText = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return 'Start Cooking';
      case 'cooking':
        return 'Mark Ready';
      case 'ready':
        return 'Mark Served';
      case 'served':
        return 'Delivered';
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-900/60 text-blue-300 text-[11px] font-bold uppercase tracking-wider border border-blue-700/50">Received</span>;
      case 'cooking':
        return <span className="px-2.5 py-0.5 rounded-full bg-orange-900/60 text-orange-300 text-[11px] font-bold uppercase tracking-wider border border-orange-700/50">Flame Cooking</span>;
      case 'ready':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 text-[11px] font-bold uppercase tracking-wider border border-emerald-700/50">Plated & Ready</span>;
      case 'served':
        return <span className="px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-400 text-[11px] font-bold uppercase tracking-wider border border-gray-700">Delivered</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#111315] text-[#f1f1f1] flex flex-col font-sans">
      {/* KDS Station Header */}
      <header className="h-16 px-6 bg-[#181a1d] border-b border-[#282b30] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#ff4d00] flex items-center justify-center text-white font-bold text-[13px]">
            KDS
          </div>
          <div>
            <h1 className="text-[15px] font-bold tracking-tight text-white">
              Kitchen Display Station &bull; Main Flame Line
            </h1>
            <div className="text-[11px] text-[#8e939a] flex items-center gap-2">
              <span>Station #1 (Hot Pass)</span>
              <span>&bull;</span>
              <span className="text-emerald-400">Live Cross-Tab Sync Active</span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {(['all', 'received', 'cooking', 'ready'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-colors cursor-pointer ${
                filter === tab
                  ? 'bg-[#ff4d00] text-white shadow-xs'
                  : 'bg-[#22252a] text-[#8e939a] hover:text-white border border-[#2e3238]'
              }`}
            >
              {tab === 'all' ? 'Active Line' : tab}
            </button>
          ))}

          <Link
            to="/"
            className="ml-4 px-3 py-1.5 rounded-lg bg-[#22252a] hover:bg-[#2c3036] text-[#8e939a] hover:text-white text-[12px] font-medium border border-[#2e3238] transition-colors"
          >
            Exit to SaaS &rarr;
          </Link>
        </div>
      </header>

      {/* Orders Board */}
      <main className="flex-1 p-6 overflow-x-auto">
        {filteredOrders.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-center text-[#8e939a]">
            <div className="w-14 h-14 rounded-full bg-[#181a1d] border border-[#282b30] flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-[#5b6068]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h3 className="text-[16px] font-bold text-white">Pass is clear</h3>
            <p className="text-[13px] text-[#6d727b] mt-1 max-w-sm">
              All placed tickets have been served. Orders fired from customer tables or the online menu appear here instantly.
            </p>
            <div className="mt-4">
              <Link
                to="/menu"
                className="px-4 py-2 rounded-lg bg-[#22252a] hover:bg-[#2c3036] text-white text-[12px] font-semibold border border-[#2e3238]"
              >
                Open Diner Menu to Fire Demo Order
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredOrders.map((ticket: OrderTicket) => (
              <div
                key={ticket.id}
                className="bg-[#181a1d] rounded-xl border border-[#282b30] flex flex-col justify-between overflow-hidden shadow-md"
              >
                {/* Ticket Top Header */}
                <div className="p-4 bg-[#202328] border-b border-[#282b30] flex items-center justify-between">
                  <div>
                    <div className="text-[15px] font-bold font-mono-num text-white">
                      #{ticket.id}
                    </div>
                    <div className="text-[12px] font-semibold text-[#ff4d00]">
                      {ticket.tableNumber ? `Table ${ticket.tableNumber}` : 'Guest Pickup'}
                    </div>
                  </div>
                  <div>{getStatusBadge(ticket.status)}</div>
                </div>

                {/* Items List */}
                <div className="p-4 divide-y divide-[#282b30] flex-1 overflow-y-auto max-h-72 space-y-3">
                  {ticket.items.map((item) => (
                    <div key={item.cartItemId} className="pt-2 first:pt-0">
                      <div className="flex items-start justify-between text-[14px] font-bold text-white">
                        <span>
                          <span className="text-[#ff4d00] font-mono-num mr-1.5">{item.quantity}x</span>
                          {item.menuItem.name}
                        </span>
                      </div>

                      {item.selectedModifiers.length > 0 && (
                        <div className="mt-1 text-[11px] text-[#8e939a] space-y-0.5 ml-4">
                          {item.selectedModifiers.map((mod) => (
                            <div key={mod.id}>&bull; {mod.name}</div>
                          ))}
                        </div>
                      )}

                      {item.notes && (
                        <div className="mt-1 text-[11px] text-amber-300 bg-amber-950/40 border border-amber-900/50 px-2 py-0.5 rounded ml-4">
                          Special: {item.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Action Advance Button */}
                <div className="p-4 bg-[#141618] border-t border-[#282b30] flex items-center justify-between gap-3">
                  <div className="text-[11px] font-mono-num text-[#8e939a]">
                    {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  {ticket.status !== 'served' && (
                    <button
                      onClick={() => advanceOrderStatus(ticket.id)}
                      className="flex-1 py-2 px-3 rounded-lg bg-[#ff4d00] hover:bg-[#e04400] text-white text-[13px] font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
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
