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
  const clearTableSession = useAppStore((state) => state.clearTableSession);
  const addSampleOrder = useAppStore((state) => state.addSampleOrder);
  const showToast = useAppStore((state) => state.showToast);

  const [selectedTableNum, setSelectedTableNum] = useState<string>('T-04');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [cashTendered, setCashTendered] = useState<string>('');

  // Verified vs Pending orders
  const pendingOrders = orders.filter((o) => o.paymentStatus === 'pending_verification');
  const verifiedOrders = orders.filter((o) => o.paymentStatus === 'verified_paid');

  const totalCollectedToday = verifiedOrders.reduce((sum, o) => sum + o.total, 0);

  // Active table session
  const activeSession = tableSessions[selectedTableNum];
  const tableOrder = orders.find((o) => o.tableNumber === selectedTableNum && o.status !== 'served');

  const handleConfirmPayment = (orderId: string, chitCode?: string) => {
    verifyCashierPayment(orderId, selectedMethod);
    setCashTendered('');
    showToast(`Payment confirmed for Chit #${chitCode || orderId}. Fired to KDS line.`);
  };

  const handleClearTable = (tableNum: string) => {
    clearTableSession(tableNum);
    showToast(`Table ${tableNum} marked Cleared & Available.`);
  };

  const handleSimulatePendingOrder = (tableNum: string) => {
    addSampleOrder(tableNum);
  };

  const getTableMeta = (tableNum: string) => {
    const session = tableSessions[tableNum];
    const pendingForTable = pendingOrders.find((o) => o.tableNumber === tableNum);

    if (pendingForTable) {
      return {
        status: 'waiting_for_payment',
        label: 'Waiting for Payment',
        badgeClass: 'bg-[#fff0f3] text-[#FF0055] border-[#ffd1dc] border-2 font-bold',
        amount: pendingForTable.total,
      };
    }

    if (session?.status === 'paid_cooking') {
      return {
        status: 'paid_cooking',
        label: 'Paid & Cooking',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-medium',
        amount: undefined,
      };
    }

    if (session && session.members.length > 0) {
      return {
        status: 'ordering',
        label: 'Ordering',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 font-medium',
        amount: undefined,
      };
    }

    return {
      status: 'idle',
      label: 'Cleared / Available',
      badgeClass: 'bg-[#f9f9f9] text-[#727272] border-[#e5e7eb]',
      amount: undefined,
    };
  };

  const tenderedAmount = parseFloat(cashTendered) || 0;
  const changeDue = tableOrder ? Math.max(0, tenderedAmount - tableOrder.total) : 0;

  return (
    <div className="flex-1 w-full bg-[#f9f9f9] min-h-screen pb-24" data-ui-container="cashier-station">
      {/* Station Top Bar */}
      <header className="bg-white border-b border-[#e5e7eb] px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <FlameLinkLogo size="md" />
            <div className="h-5 w-[1px] bg-[#e5e7eb] hidden sm:block" />
            <div>
              <div className="text-[14px] font-bold text-[#262626]">
                Cashier Station // Live POS Terminal
              </div>
              <div className="text-[12px] font-mono-num text-[#727272]">
                Front Register Verification Gate
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right px-3 py-1 bg-[#f9f9f9] border border-[#e5e7eb] rounded-lg">
              <span className="text-[10px] font-mono-num uppercase text-[#727272] block">Verified Today</span>
              <span className="text-[15px] font-mono-num font-bold text-[#15803d]">
                {totalCollectedToday.toFixed(2)} EGP
              </span>
            </div>

            <Link
              to="/kds"
              className="px-4 py-2 rounded-full bg-[#262626] hover:bg-black text-white text-[12px] font-medium transition-colors shadow-xs"
            >
              Open KDS Pass -&gt;
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* KPI Telemetry Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#e5e7eb] shadow-xs">
            <span className="text-[11px] font-mono-num uppercase text-[#727272]">Waiting for Payment</span>
            <div className="text-2xl font-mono-num font-bold text-[#FF0055] mt-1">
              {pendingOrders.length} Chits
            </div>
            <div className="text-[12px] font-mono-num text-[#727272] mt-1">
              {pendingOrders.reduce((s, o) => s + o.total, 0).toFixed(2)} EGP pending cashier stamp
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e5e7eb] shadow-xs">
            <span className="text-[11px] font-mono-num uppercase text-[#727272]">Verified & Fired to KDS</span>
            <div className="text-2xl font-mono-num font-bold text-[#15803d] mt-1">
              {verifiedOrders.length} Orders
            </div>
            <div className="text-[12px] font-mono-num text-[#727272] mt-1">
              On cooking pass or served
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e5e7eb] shadow-xs">
            <span className="text-[11px] font-mono-num uppercase text-[#727272]">Active Dining Tables</span>
            <div className="text-2xl font-mono-num font-bold text-[#262626] mt-1">
              {Object.values(tableSessions).filter((s) => s.members.length > 0).length} Tables Seated
            </div>
            <div className="text-[12px] font-mono-num text-[#727272] mt-1">
              Real-time multi-party state sync
            </div>
          </div>
        </section>

        {/* Live Restaurant Tables Status Grid (Interactive - Click any table) */}
        <section className="bg-white p-6 rounded-2xl border border-[#e5e7eb] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#262626]">Live Table Status</h2>
              <p className="text-[13px] text-[#727272]">
                Click any table to view seated diners, review draft items, ring up cashier settlement, or clear table.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSimulatePendingOrder(selectedTableNum)}
                className="px-3 py-1.5 rounded-lg border border-[#ffd1dc] bg-[#fff0f3] text-[#FF0055] text-[12px] font-medium hover:bg-[#ffe0e8] cursor-pointer"
              >
                + Simulate Test Chit on {selectedTableNum}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {RESTAURANT_TABLES.map((tableNum) => {
              const meta = getTableMeta(tableNum);
              const isSelected = selectedTableNum === tableNum;

              return (
                <button
                  key={tableNum}
                  onClick={() => setSelectedTableNum(tableNum)}
                  className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer relative ${meta.badgeClass} ${
                    isSelected ? 'ring-2 ring-[#FF0055] shadow-md' : 'hover:scale-[1.02]'
                  }`}
                >
                  <div className="text-xl font-mono-num font-bold">
                    {tableNum}
                  </div>
                  <div className="text-[11px] font-medium mt-1 truncate">
                    {meta.label}
                  </div>
                  {meta.amount && (
                    <div className="text-[11px] font-mono-num font-bold text-[#FF0055] mt-1">
                      {meta.amount.toFixed(0)} EGP
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Selected Table Inspection & Terminal Settlement Panel */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Table Details & Seated Guests */}
          <div className="bg-white p-6 rounded-2xl border border-[#e5e7eb] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e7eb]">
              <div>
                <h3 className="text-lg font-bold text-[#262626]">
                  Table {selectedTableNum} Details
                </h3>
                <span className="text-[12px] font-mono-num text-[#727272]">
                  Status: {getTableMeta(selectedTableNum).label}
                </span>
              </div>

              {activeSession && activeSession.members.length > 0 && (
                <button
                  onClick={() => handleClearTable(selectedTableNum)}
                  className="px-2.5 py-1 text-[11px] rounded-md bg-gray-100 hover:bg-red-50 hover:text-red-600 text-[#727272] transition-colors cursor-pointer"
                >
                  Clear Table
                </button>
              )}
            </div>

            {/* PIN Code */}
            <div className="p-3 bg-[#f9f9f9] rounded-xl border border-[#e5e7eb] flex items-center justify-between text-[13px]">
              <span className="text-[#727272]">Table PIN:</span>
              <span className="font-mono-num font-bold text-[#262626] tracking-widest text-[16px]">
                {activeSession?.pin || '----'}
              </span>
            </div>

            {/* Seated Diners List */}
            <div>
              <div className="text-[12px] font-semibold text-[#262626] mb-2">
                Seated Diners ({activeSession?.members.length || 0}):
              </div>

              {!activeSession || activeSession.members.length === 0 ? (
                <div className="text-[13px] text-[#949494] py-3 text-center border border-dashed border-[#e5e7eb] rounded-xl">
                  Table is currently cleared / empty
                </div>
              ) : (
                <div className="space-y-1.5">
                  {activeSession.members.map((m) => (
                    <div
                      key={m.id}
                      className="p-2 rounded-lg bg-[#f9f9f9] border border-[#e5e7eb] flex items-center justify-between text-[13px]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#15803d]" />
                        <span className="font-medium text-[#262626]">{m.name}</span>
                        {m.isHost && (
                          <span className="text-[10px] uppercase font-mono-num px-1 rounded bg-[#ffe0e8] text-[#FF0055]">
                            Host
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono-num text-[#727272]">
                        {m.isReadyToPay ? 'Ready' : 'Ordering'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Order & Cashier Settlement Engine */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#e5e7eb] shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e7eb]">
              <div>
                <h3 className="text-lg font-bold text-[#262626]">
                  Settlement Terminal // Table {selectedTableNum}
                </h3>
                <span className="text-[12px] text-[#727272]">
                  {tableOrder ? `Order #${tableOrder.id}` : 'No active order ticket on this table'}
                </span>
              </div>

              {tableOrder && (
                <div className="text-right">
                  <span className="text-[11px] font-mono-num text-[#727272] block uppercase">Total Due</span>
                  <span className="text-2xl font-mono-num font-bold text-[#FF0055]">
                    {tableOrder.total.toFixed(2)} EGP
                  </span>
                </div>
              )}
            </div>

            {!tableOrder ? (
              <div className="py-12 text-center text-[#727272]">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2 text-[#949494]">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </div>
                <div className="text-[14px] font-medium text-[#262626]">No unpaid ticket on Table {selectedTableNum}</div>
                <p className="text-[12px] mt-1">
                  Once guests submit an order choosing "Pay at Cashier Desk", the ticket will populate here.
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => handleSimulatePendingOrder(selectedTableNum)}
                    className="px-4 py-2 rounded-full bg-[#262626] text-white text-[12px] font-medium hover:bg-black cursor-pointer shadow-xs"
                  >
                    Simulate Sample Order on {selectedTableNum}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Status Alert */}
                <div className="p-3 rounded-xl bg-[#fff0f3] border border-[#ffd1dc] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono-num font-semibold text-[#FF0055] uppercase block">
                      {tableOrder.paymentStatus === 'pending_verification' ? 'WAITING FOR CASHIER SETTLEMENT' : 'PAID & COOKING'}
                    </span>
                    <span className="text-[13px] font-mono-num text-[#262626] font-medium">
                      Chit #{tableOrder.cashierChitCode || tableOrder.id}
                    </span>
                  </div>
                  <span className="text-[12px] font-mono-num text-[#727272]">
                    {tableOrder.items.reduce((s, i) => s + i.quantity, 0)} items
                  </span>
                </div>

                {/* Line Items List */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {tableOrder.items.map((item, idx) => (
                    <div key={item.cartItemId || idx} className="flex justify-between text-[13px] py-1 border-b border-[#f0f0f0]">
                      <span className="text-[#262626]">
                        <strong className="font-mono-num font-bold text-[#111827] mr-1.5">{item.quantity}x</strong>
                        {item.menuItem.name}
                        {item.addedBy && (
                          <span className="text-[11px] text-[#727272] ml-1.5">({item.addedBy.name})</span>
                        )}
                      </span>
                      <span className="font-mono-num font-medium text-[#262626]">
                        {(item.menuItem.basePrice * item.quantity).toFixed(2)} EGP
                      </span>
                    </div>
                  ))}
                </div>

                {/* Tax Breakdown */}
                <div className="pt-2 border-t border-[#e5e7eb] space-y-1 text-[12px]">
                  <div className="flex justify-between text-[#727272]">
                    <span>Net Subtotal:</span>
                    <span className="font-mono-num text-[#262626]">{tableOrder.subtotal.toFixed(2)} EGP</span>
                  </div>
                  <div className="flex justify-between text-[#727272]">
                    <span>ETA 14% VAT:</span>
                    <span className="font-mono-num text-[#262626]">{tableOrder.vatAmount.toFixed(2)} EGP</span>
                  </div>
                  <div className="flex justify-between text-[15px] font-bold text-[#262626] pt-1 border-t border-[#e5e7eb]">
                    <span>Grand Total:</span>
                    <span className="font-mono-num text-[#FF0055]">{tableOrder.total.toFixed(2)} EGP</span>
                  </div>
                </div>

                {/* Cashier Payment Action (Only if pending) */}
                {tableOrder.paymentStatus === 'pending_verification' ? (
                  <div className="pt-4 border-t border-[#e5e7eb] space-y-3">
                    <div className="text-[12px] font-medium text-[#262626]">Tender Method:</div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setSelectedMethod('card')}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer text-[12px] font-medium ${
                          selectedMethod === 'card' ? 'border-[#FF0055] bg-[#fff0f3] text-[#FF0055]' : 'bg-[#f9f9f9] text-[#727272]'
                        }`}
                      >
                        Visa / Meeza POS
                      </button>
                      <button
                        onClick={() => setSelectedMethod('cashier')}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer text-[12px] font-medium ${
                          selectedMethod === 'cashier' ? 'border-[#FF0055] bg-[#fff0f3] text-[#FF0055]' : 'bg-[#f9f9f9] text-[#727272]'
                        }`}
                      >
                        Physical Cash
                      </button>
                      <button
                        onClick={() => setSelectedMethod('apple_pay')}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer text-[12px] font-medium ${
                          selectedMethod === 'apple_pay' ? 'border-[#FF0055] bg-[#fff0f3] text-[#FF0055]' : 'bg-[#f9f9f9] text-[#727272]'
                        }`}
                      >
                        Apple Pay
                      </button>
                    </div>

                    {selectedMethod === 'cashier' && (
                      <div className="p-3 bg-[#f9f9f9] rounded-xl border border-[#e5e7eb] space-y-2">
                        <div className="flex items-center justify-between text-[12px]">
                          <span className="font-medium text-[#262626]">Cash Tendered:</span>
                          <span className="text-[11px] text-[#727272]">Enter bill received</span>
                        </div>
                        <input
                          type="number"
                          value={cashTendered}
                          onChange={(e) => setCashTendered(e.target.value)}
                          placeholder={`e.g. ${Math.ceil(tableOrder.total / 100) * 100}`}
                          className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] bg-white font-mono-num text-[14px] text-[#262626] focus:outline-none focus:border-[#FF0055]"
                        />
                        {tenderedAmount > 0 && (
                          <div className="flex items-center justify-between text-[12px] pt-1">
                            <span className="text-[#727272]">Change to Return:</span>
                            <span className="font-mono-num font-bold text-[#15803d]">
                              {changeDue.toFixed(2)} EGP
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => handleConfirmPayment(tableOrder.id, tableOrder.cashierChitCode)}
                      className="w-full py-3.5 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-[14px] font-bold transition-all btn-crimson-glow active:scale-[0.99] cursor-pointer shadow-md flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>
                        Confirm Payment ({tableOrder.total.toFixed(2)} EGP) & Fire to KDS
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                    <div className="text-emerald-800 font-bold text-[14px]">
                      VERIFIED PAID // FIRED TO KDS
                    </div>
                    <div className="text-[12px] font-mono-num text-emerald-700">
                      Paid via {tableOrder.paymentMethod?.toUpperCase()} • Cooking on grill line
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Global Pending Chits Queue */}
        <section className="bg-white p-6 rounded-2xl border border-[#e5e7eb] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#262626]">
              All Unpaid Chits Waiting for Register Stamp ({pendingOrders.length})
            </h2>
            <span className="text-[12px] font-mono-num text-[#727272]">
              Real-time register queue
            </span>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="p-6 text-center text-[#727272] bg-[#f9f9f9] rounded-xl border border-[#e5e7eb]">
              No unpaid chits pending at front desk. All orders are settled.
            </div>
          ) : (
            <div className="divide-y divide-[#e5e7eb]">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono-num font-bold text-[#262626] text-[15px]">
                        Chit #{order.cashierChitCode || order.id}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#fff0f3] text-[#FF0055] text-[11px] font-mono-num font-semibold">
                        Table {order.tableNumber || 'Counter'}
                      </span>
                    </div>
                    <div className="text-[12px] text-[#727272] mt-0.5">
                      {order.items.map((i) => `${i.quantity}x ${i.menuItem.name}`).join(', ')}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="font-mono-num font-bold text-[#FF0055] text-[16px]">
                        {order.total.toFixed(2)} EGP
                      </span>
                      <span className="text-[10px] font-mono-num text-[#949494] block">incl. VAT</span>
                    </div>

                    <button
                      onClick={() => handleConfirmPayment(order.id, order.cashierChitCode)}
                      className="px-4 py-2 rounded-full bg-[#FF0055] text-white text-[12px] font-bold hover:opacity-95 transition-all cursor-pointer shadow-xs"
                    >
                      Confirm Payment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
