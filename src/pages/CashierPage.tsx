import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { PaymentMethod } from '../types/domain';
import { FlameLinkLogo } from '../components/ui/FlameLinkLogo';

const RESTAURANT_TABLES = ['T-01', 'T-02', 'T-03', 'T-04', 'T-05', 'T-06', 'T-08', 'T-12'];

export const CashierPage: React.FC = () => {
  const orders = useAppStore((state) => state.orders);
  const tableSessions = useAppStore((state) => state.tableSessions);
  const verifyCashierPayment = useAppStore((state) => state.verifyCashierPayment);
  const showToast = useAppStore((state) => state.showToast);

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'verified'>('all');

  // Orders pending front desk settlement
  const pendingOrders = orders.filter((o) => o.paymentStatus === 'pending_verification');
  const verifiedOrders = orders.filter((o) => o.paymentStatus === 'verified_paid');

  const totalCollectedToday = verifiedOrders.reduce((sum, o) => sum + o.total, 0);
  const totalPendingCollection = pendingOrders.reduce((sum, o) => sum + o.total, 0);

  const handleVerify = (orderId: string, chitCode?: string) => {
    verifyCashierPayment(orderId, selectedMethod);
    showToast(`Chit #${chitCode || orderId} settled via ${selectedMethod.toUpperCase()} & fired to KDS!`);
  };

  const getTableStatus = (tableNum: string) => {
    const session = tableSessions[tableNum];
    if (!session) return { status: 'idle', label: 'Idle / Available', color: 'bg-gray-100 text-[#727272] border-[#e5e7eb]' };

    // Check if table has an active pending order
    const hasPending = pendingOrders.some((o) => o.tableNumber === tableNum);
    if (hasPending) {
      return { status: 'waiting_for_payment', label: 'Waiting for Payment', color: 'bg-[#fff0f3] text-[#FF0055] border-[#ffd1dc] animate-pulse' };
    }

    if (session.status === 'paid_cooking') {
      return { status: 'paid_cooking', label: 'Paid & Cooking', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }

    if (session.status === 'ordering') {
      return { status: 'ordering', label: 'Ordering in Progress', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    }

    return { status: 'idle', label: 'Idle / Available', color: 'bg-gray-100 text-[#727272] border-[#e5e7eb]' };
  };

  return (
    <div className="flex-1 w-full bg-[#f9f9f9] min-h-screen pb-24" data-ui-container="cashier-station">
      {/* Station Top Bar */}
      <header className="bg-white border-b border-[#e5e7eb] px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <FlameLinkLogo size="md" />
            <div className="h-5 w-[1px] bg-[#e5e7eb] hidden sm:block" />
            <div>
              <div className="text-[14px] font-medium text-[#262626]">
                Front Register Station // Cashier Pass
              </div>
              <div className="text-[12px] font-mono-num text-[#727272]">
                Sub-150ms KDS Kitchen Gate Lock
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right px-3 py-1 bg-[#f9f9f9] border border-[#e5e7eb] rounded-lg">
              <span className="text-[10px] font-mono-num uppercase text-[#727272] block">Verified Today</span>
              <span className="text-[14px] font-mono-num font-semibold text-[#15803d]">
                {totalCollectedToday.toFixed(2)} EGP
              </span>
            </div>

            <Link
              to="/kds"
              className="px-4 py-2 rounded-full bg-[#262626] hover:bg-[#1a1a1a] text-white text-[12px] font-medium transition-colors shadow-xs"
            >
              Open KDS Screen -&gt;
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* KPI Telemetry Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#e5e7eb] shadow-xs">
            <span className="text-[11px] font-mono-num uppercase text-[#727272]">Waiting for Payment</span>
            <div className="text-2xl font-mono-num font-medium text-[#FF0055] mt-1">
              {pendingOrders.length} Chits
            </div>
            <div className="text-[12px] font-mono-num text-[#727272] mt-1">
              Total {totalPendingCollection.toFixed(2)} EGP
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e5e7eb] shadow-xs">
            <span className="text-[11px] font-mono-num uppercase text-[#727272]">Verified & Fired to KDS</span>
            <div className="text-2xl font-mono-num font-medium text-[#15803d] mt-1">
              {verifiedOrders.length} Orders
            </div>
            <div className="text-[12px] font-mono-num text-[#727272] mt-1">
              Instant Pass Authorization
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e5e7eb] shadow-xs">
            <span className="text-[11px] font-mono-num uppercase text-[#727272]">Active Dine-In Pools</span>
            <div className="text-2xl font-mono-num font-medium text-[#262626] mt-1">
              {Object.keys(tableSessions).length} Tables Active
            </div>
            <div className="text-[12px] font-mono-num text-[#727272] mt-1">
              Multi-party PIN sync active
            </div>
          </div>
        </section>

        {/* Live Restaurant Tables Status Matrix */}
        <section className="bg-white p-6 rounded-2xl border border-[#e5e7eb] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium text-[#262626]">Live Dining Room Table Status</h2>
              <p className="text-[13px] text-[#727272]">
                Real-time synchronization across seated guest mobile browsers and cashier station.
              </p>
            </div>
            <span className="text-[12px] font-mono-num text-[#949494]">
              {RESTAURANT_TABLES.length} Registered Tables
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {RESTAURANT_TABLES.map((tableNum) => {
              const info = getTableStatus(tableNum);
              const session = tableSessions[tableNum];

              return (
                <div
                  key={tableNum}
                  className={`p-3 rounded-xl border text-center transition-all ${info.color}`}
                >
                  <div className="text-lg font-mono-num font-bold">
                    {tableNum}
                  </div>
                  <div className="text-[10px] font-medium tracking-tight mt-1 truncate">
                    {info.label}
                  </div>
                  {session?.pin && (
                    <div className="text-[10px] font-mono-num text-[#727272] mt-1">
                      PIN: {session.pin}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Critical Gate: Pending Cashier Settlements */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF0055] animate-ping" />
                <h2 className="text-lg font-medium text-[#262626]">
                  The Payment Gate // Pending Cashier Chits
                </h2>
              </div>
              <p className="text-[13px] text-[#727272]">
                Orders below are strictly BLOCKED from KDS kitchen line until payment is confirmed by front register.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#727272]">Payment Type:</span>
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#e5e7eb]">
                {(['card', 'cashier', 'apple_pay'] as PaymentMethod[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMethod(m)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      selectedMethod === m
                        ? 'bg-[#262626] text-white'
                        : 'text-[#727272] hover:text-[#262626]'
                    }`}
                  >
                    {m === 'card' ? 'Visa / Card' : m === 'cashier' ? 'Cash' : 'Apple Pay'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#e5e7eb]">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#15803d] border border-emerald-200 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="text-[15px] font-medium text-[#262626]">No Pending Chits at Register</h3>
              <p className="text-[13px] text-[#727272] mt-1">
                All submitted orders have been paid and verified. The kitchen line is fully synced.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border-2 border-[#ffd1dc] shadow-sm p-6 space-y-4 relative"
                >
                  <div className="flex items-start justify-between pb-3 border-b border-[#e5e7eb]">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ffe0e8] text-[#FF0055] text-[11px] font-mono-num font-semibold">
                        <span>AWAITING PAYMENT</span>
                      </div>
                      <div className="text-xl font-mono-num font-bold text-[#262626] mt-1">
                        Chit #{order.cashierChitCode || order.id}
                      </div>
                      <div className="text-[13px] text-[#727272] font-medium">
                        {order.tableNumber ? `Delivering to Table ${order.tableNumber}` : 'Dine-In Counter'}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-mono-num uppercase text-[#949494] block">Payable Total</span>
                      <span className="text-2xl font-mono-num font-bold text-[#FF0055]">
                        {order.total.toFixed(2)} EGP
                      </span>
                      <span className="text-[10px] font-mono-num text-[#949494] block">
                        incl. 14% VAT ({order.vatAmount.toFixed(2)} EGP)
                      </span>
                    </div>
                  </div>

                  {/* Order Line Items */}
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {order.items.map((item, idx) => (
                      <div key={item.cartItemId || idx} className="flex justify-between text-[13px]">
                        <span className="text-[#262626]">
                          <strong className="font-mono-num font-semibold text-[#111827]">{item.quantity}x</strong> {item.menuItem.name}
                          {item.addedBy && (
                            <span className="text-[11px] text-[#727272] ml-1.5 font-mono-num">
                              ({item.addedBy.name})
                            </span>
                          )}
                        </span>
                        <span className="font-mono-num text-[#727272]">
                          {(item.menuItem.basePrice * item.quantity).toFixed(2)} EGP
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Cashier Action Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleVerify(order.id, order.cashierChitCode)}
                      className="w-full py-3.5 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-[14px] font-medium transition-all btn-crimson-glow active:scale-[0.99] cursor-pointer shadow-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>
                        Verify Table Settlement ({order.total.toFixed(2)} EGP) -&gt; Fire to KDS
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Settled Orders History Audit */}
        <section className="bg-white p-6 rounded-2xl border border-[#e5e7eb] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-[#262626]">Settled Transactions Ledger</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-full text-[12px] font-mono-num transition-colors ${
                  filterMode === 'all' ? 'bg-[#262626] text-white' : 'bg-[#f9f9f9] text-[#727272]'
                }`}
              >
                All Orders ({orders.length})
              </button>
              <button
                onClick={() => setFilterMode('verified')}
                className={`px-3 py-1 rounded-full text-[12px] font-mono-num transition-colors ${
                  filterMode === 'verified' ? 'bg-[#15803d] text-white' : 'bg-[#f9f9f9] text-[#727272]'
                }`}
              >
                Paid ({verifiedOrders.length})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-[#e5e7eb] text-[11px] font-mono-num uppercase text-[#727272]">
                <tr>
                  <th className="py-2.5">Order ID</th>
                  <th className="py-2.5">Table</th>
                  <th className="py-2.5">Items</th>
                  <th className="py-2.5">Method</th>
                  <th className="py-2.5">Total (EGP)</th>
                  <th className="py-2.5">Gate Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0] font-mono-num">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#fcfbf9]">
                    <td className="py-2.5 font-medium text-[#262626]">{o.id}</td>
                    <td className="py-2.5">{o.tableNumber || 'Counter'}</td>
                    <td className="py-2.5">{o.items.reduce((s, i) => s + i.quantity, 0)} items</td>
                    <td className="py-2.5 uppercase text-[#727272]">{o.paymentMethod?.replace('_', ' ') || 'UNSET'}</td>
                    <td className="py-2.5 font-semibold text-[#262626]">{o.total.toFixed(2)}</td>
                    <td className="py-2.5">
                      {o.paymentStatus === 'verified_paid' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-[#15803d] border border-emerald-200">
                          VERIFIED / ON KDS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[#ffe0e8] text-[#FF0055] border border-[#ffd1dc]">
                          BLOCKED / PENDING
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};
