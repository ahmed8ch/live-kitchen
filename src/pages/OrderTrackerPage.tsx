import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { OrderStatus, PaymentMethod } from '../types/domain';

const STAGES: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'received', label: 'Order Received', desc: 'Station cooks reviewing ticket' },
  { key: 'cooking', label: 'Flame Line Cooking', desc: 'Patties searing & wood-fire oven active' },
  { key: 'ready', label: 'Plating & Assembly', desc: 'Garnish inspection & tray expediting' },
  { key: 'served', label: 'Delivered to Table', desc: 'Enjoy your handcrafted gourmet meal' },
];

export const OrderTrackerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const orders = useAppStore((state) => state.orders);
  const payOrder = useAppStore((state) => state.payOrder);
  const advanceOrderStatus = useAppStore((state) => state.advanceOrderStatus);
  const activeTable = useAppStore((state) => state.activeTable);

  const [splitWays, setSplitWays] = useState<number>(1);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('apple_pay');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Find target ticket or fallback to latest order
  const ticket =
    id === 'active' || id === 'demo'
      ? orders[0]
      : orders.find((o) => o.id === id) || orders[0];

  if (!ticket) {
    return (
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] flex items-center justify-center mx-auto text-[#727272] mb-4">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#262626]">No Active Order Found</h2>
        <p className="mt-2 text-[#727272] text-[15px] max-w-md mx-auto">
          You have not placed an order yet. Visit our self-ordering menu to select your dishes.
        </p>
        <div className="mt-6">
          <Link
            to={activeTable ? `/menu?table=${activeTable}` : '/menu'}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#ff4d00] hover:opacity-95 text-white text-[14px] font-semibold transition-all shadow-sm btn-ember-glow"
          >
            Browse Dine-In Menu -&gt;
          </Link>
        </div>
      </div>
    );
  }

  const currentStageIndex = STAGES.findIndex((s) => s.key === ticket.status);
  const perPersonAmount = Math.round((ticket.total / splitWays) * 100) / 100;

  const handleSettleBill = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      payOrder(ticket.id, selectedMethod, splitWays);
      setIsProcessingPayment(false);
    }, 600);
  };

  return (
    <div className="flex-1 w-full bg-[#fafafa] py-8 sm:py-12 pb-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Top Status Header */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#e5e7eb]">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#727272]">
                  Live Kitchen Ticket
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] text-[12px] font-mono-num font-bold text-[#262626]">
                  #{ticket.id}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-[#262626] mt-1">
                Order Tracking & Settlement
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {ticket.tableNumber ? (
                <div className="px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#ff4d00] text-[13px] font-mono-num font-bold">
                  Table {ticket.tableNumber}
                </div>
              ) : (
                <div className="px-3.5 py-1.5 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] text-[#727272] text-[13px] font-medium">
                  Online Guest
                </div>
              )}

              {ticket.isPaid ? (
                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[12px] font-semibold">
                  Paid & Settled
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[12px] font-semibold">
                  Payment Open
                </span>
              )}
            </div>
          </div>

          {/* 4-Stage Progress Tracker */}
          <div className="pt-8 pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {STAGES.map((stage, idx) => {
                const isPast = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div key={stage.key} className="flex flex-col items-center text-center">
                    {/* Circle Node */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-mono-num text-[13px] font-bold transition-all mb-3 ${
                        isCurrent
                          ? 'bg-[#ff4d00] text-white shadow-md ring-4 ring-orange-100'
                          : isPast
                          ? 'bg-[#262626] text-white'
                          : 'bg-[#f0f0f0] text-[#9ca3af]'
                      }`}
                    >
                      {isPast ? (
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        idx + 1
                      )}
                    </div>

                    <div className={`text-[13px] font-bold ${isCurrent ? 'text-[#ff4d00]' : 'text-[#262626]'}`}>
                      {stage.label}
                    </div>
                    <div className="text-[11px] text-[#727272] mt-0.5 leading-snug hidden sm:block">
                      {stage.desc}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Demo Stepper Bar */}
            <div className="mt-8 pt-6 border-t border-[#e5e7eb] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#f9f9f9] p-3.5 rounded-xl border border-[#e5e7eb]">
              <div className="flex items-center gap-2 text-[12px] text-[#727272]">
                <span className="font-semibold text-[#262626]">Testing Demo?</span>
                <span>Watch status progress in real time</span>
              </div>

              <div className="flex items-center gap-2.5">
                {ticket.status !== 'served' ? (
                  <button
                    onClick={() => advanceOrderStatus(ticket.id)}
                    className="px-3.5 py-1.5 rounded-full bg-[#ff4d00] hover:opacity-95 text-white text-[12px] font-semibold transition-all shadow-xs cursor-pointer btn-ember-glow active:scale-95"
                  >
                    Advance Cooking Stage -&gt;
                  </button>
                ) : (
                  <span className="text-[12px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Order Fully Delivered
                  </span>
                )}

                <Link
                  to="/kds"
                  className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#f0f0f0] text-[#262626] border border-[#e5e7eb] text-[12px] font-semibold transition-colors"
                >
                  Open Kitchen KDS -&gt;
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Itemized Fiscal Receipt */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-xs mb-8">
          <div className="flex items-center justify-between pb-4 border-b border-[#e5e7eb]">
            <h3 className="text-lg font-bold text-[#262626]">Itemized Receipt</h3>
            <span className="text-[12px] font-mono-num text-[#727272]">
              {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="divide-y divide-[#e5e7eb] py-2">
            {ticket.items.map((item) => {
              const modPrice = item.selectedModifiers.reduce((sum, m) => sum + m.price, 0);
              const singlePrice = item.menuItem.basePrice + modPrice;
              const lineTotal = singlePrice * item.quantity;

              return (
                <div key={item.cartItemId} className="py-3.5 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[14px] font-bold text-[#262626]">
                      <span className="font-mono-num text-[#ff4d00] mr-2">{item.quantity}x</span>
                      {item.menuItem.name}
                    </div>
                    {item.selectedModifiers.length > 0 && (
                      <div className="mt-1 text-[11px] text-[#727272] space-y-0.5 ml-6">
                        {item.selectedModifiers.map((mod) => (
                          <div key={mod.id}>
                            + {mod.name} (+{mod.price} EGP)
                          </div>
                        ))}
                      </div>
                    )}
                    {item.notes && (
                      <div className="mt-1 text-[11px] text-amber-700 ml-6 italic">
                        Note: {item.notes}
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono-num font-bold text-[14px] text-[#262626]">
                      {lineTotal.toFixed(2)} EGP
                    </div>
                    {item.quantity > 1 && (
                      <div className="text-[11px] font-mono-num text-[#727272]">
                        @{singlePrice.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Subtotal, VAT, Total */}
          <div className="pt-4 border-t border-[#e5e7eb] space-y-2 text-[13px]">
            <div className="flex justify-between text-[#727272]">
              <span>Food & Beverage Net Subtotal</span>
              <span className="font-mono-num font-medium text-[#262626]">
                {ticket.subtotal.toFixed(2)} EGP
              </span>
            </div>
            <div className="flex justify-between text-[#727272]">
              <span>Egyptian Tax Authority (ETA) VAT (14%)</span>
              <span className="font-mono-num font-medium text-[#262626]">
                {ticket.vatAmount.toFixed(2)} EGP
              </span>
            </div>
            <div className="pt-2 border-t border-[#e5e7eb] flex justify-between text-[16px] font-bold text-[#262626]">
              <span>Invoice Grand Total</span>
              <span className="font-mono-num text-[#ff4d00]">
                {ticket.total.toFixed(2)} EGP
              </span>
            </div>
          </div>
        </div>

        {/* Fiscal Settlement & Bill Split Engine */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#e5e7eb]">
            <div>
              <h3 className="text-lg font-bold text-[#262626]">Table Settlement Engine</h3>
              <p className="text-[12px] text-[#727272] mt-0.5">
                Split the check evenly or pay the entire table bill directly.
              </p>
            </div>
          </div>

          {ticket.isPaid ? (
            <div className="pt-6 text-center py-6">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-[#262626]">Invoice Settled in Full</h4>
              <p className="text-[13px] text-[#727272] mt-1">
                Settled via {ticket.paymentMethod === 'apple_pay' ? 'Apple Pay' : ticket.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cashier Counter Pass'}.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Link
                  to={activeTable ? `/menu?table=${activeTable}` : '/menu'}
                  className="px-5 py-2.5 rounded-full bg-[#ff4d00] text-white text-[13px] font-semibold hover:opacity-95 transition-all btn-ember-glow"
                >
                  Order Additional Dishes
                </Link>
              </div>
            </div>
          ) : (
            <div className="pt-6 space-y-6">
              {/* Split Check Selector */}
              <div>
                <label className="block text-[13px] font-bold text-[#262626] uppercase tracking-wider mb-2.5">
                  Split Check Options
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((count) => (
                    <button
                      key={count}
                      onClick={() => setSplitWays(count)}
                      className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                        splitWays === count
                          ? 'border-[#ff4d00] bg-orange-50/60 font-bold text-[#ff4d00]'
                          : 'border-[#e5e7eb] bg-[#f9f9f9] text-[#262626] hover:bg-white'
                      }`}
                    >
                      <div className="text-[13px]">
                        {count === 1 ? 'Full' : `${count} Ways`}
                      </div>
                      <div className="text-[11px] font-mono-num text-[#727272] mt-0.5">
                        {(ticket.total / count).toFixed(2)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Per Person Amount Display */}
              <div className="p-4 rounded-xl bg-[#f9f9f9] border border-[#e5e7eb] flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-medium text-[#727272]">
                    {splitWays === 1 ? 'Total Amount Due' : `Amount Per Diner (1 of ${splitWays})`}
                  </div>
                  <div className="text-xl font-bold font-mono-num text-[#262626]">
                    {perPersonAmount.toFixed(2)} EGP
                  </div>
                </div>
                <div className="text-[11px] text-[#727272] font-mono-num text-right">
                  VAT Included
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-[13px] font-bold text-[#262626] uppercase tracking-wider mb-2.5">
                  Select Payment Flow
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Apple Pay */}
                  <label
                    onClick={() => setSelectedMethod('apple_pay')}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                      selectedMethod === 'apple_pay'
                        ? 'border-[#ff4d00] bg-orange-50/40 shadow-xs'
                        : 'border-[#e5e7eb] bg-[#f9f9f9] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] font-bold text-[#262626]">Apple Pay</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedMethod === 'apple_pay' ? 'border-[#ff4d00] bg-[#ff4d00] text-white' : 'border-gray-400'}`}>
                        {selectedMethod === 'apple_pay' && (
                          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="text-[11px] text-[#727272]">Instant contactless payment</div>
                  </label>

                  {/* Card */}
                  <label
                    onClick={() => setSelectedMethod('card')}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                      selectedMethod === 'card'
                        ? 'border-[#ff4d00] bg-orange-50/40 shadow-xs'
                        : 'border-[#e5e7eb] bg-[#f9f9f9] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] font-bold text-[#262626]">Card Terminal</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedMethod === 'card' ? 'border-[#ff4d00] bg-[#ff4d00] text-white' : 'border-gray-400'}`}>
                        {selectedMethod === 'card' && (
                          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="text-[11px] text-[#727272]">Visa / Mastercard at table</div>
                  </label>

                  {/* Cashier Pass */}
                  <label
                    onClick={() => setSelectedMethod('cashier')}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                      selectedMethod === 'cashier'
                        ? 'border-[#ff4d00] bg-orange-50/40 shadow-xs'
                        : 'border-[#e5e7eb] bg-[#f9f9f9] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] font-bold text-[#262626]">Cashier Pass</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedMethod === 'cashier' ? 'border-[#ff4d00] bg-[#ff4d00] text-white' : 'border-gray-400'}`}>
                        {selectedMethod === 'cashier' && (
                          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="text-[11px] text-[#727272]">Pay cash/card at front desk</div>
                  </label>
                </div>
              </div>

              {/* Settle Action Button */}
              <button
                onClick={handleSettleBill}
                disabled={isProcessingPayment}
                className="w-full py-4 rounded-full bg-[#ff4d00] hover:opacity-95 text-white text-[15px] font-semibold transition-all shadow-sm btn-ember-glow active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <span>Processing Settlement...</span>
                ) : (
                  <span>
                    Settle {perPersonAmount.toFixed(2)} EGP ({selectedMethod === 'apple_pay' ? 'Apple Pay' : selectedMethod === 'card' ? 'Table Card Reader' : 'Generate Cashier Pass'})
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
