import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { PaymentMethod } from '../types/domain';
import { FlameLinkLogo } from '../components/ui/FlameLinkLogo';

const SPLIT_OPTIONS = [1, 2, 3, 4, 5, 6, 8];
const TIP_PERCENTAGES = [0, 10, 12, 15];

export const SettlementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const orders = useAppStore((state) => state.orders);
  const payOrder = useAppStore((state) => state.payOrder);
  const activeTable = useAppStore((state) => state.activeTable);

  const [splitWays, setSplitWays] = useState<number>(1);
  const [tipPercent, setTipPercent] = useState<number>(0);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('apple_pay');
  const [isProcessing, setIsProcessing] = useState(false);

  // Target ticket or fallback to latest
  const ticket =
    id && id !== 'active'
      ? orders.find((o) => o.id === id) || orders[0]
      : orders[0];

  if (!ticket) {
    return (
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-20 text-center" data-ui-container="empty-settlement">
        <div className="w-14 h-14 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] flex items-center justify-center mx-auto text-[#727272] mb-4">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        </div>
        <h2 className="text-xl font-medium text-[#262626]">No Open Ticket to Settle</h2>
        <p className="mt-2 text-[#727272] text-[14px] max-w-sm mx-auto">
          You currently have no unpaid tickets on file. Order from the dine-in menu to generate an invoice.
        </p>
        <div className="mt-6">
          <Link
            to={activeTable ? `/menu?table=${activeTable}` : '/menu'}
            data-ui-radius="999"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#ff4d00] text-white text-[13px] font-medium transition-all btn-ember-glow"
          >
            <span>Open Dine-In Menu -&gt;</span>
          </Link>
        </div>
      </div>
    );
  }

  const tipAmount = Math.round((ticket.subtotal * (tipPercent / 100)) * 100) / 100;
  const grandTotal = Math.round((ticket.total + tipAmount) * 100) / 100;
  const perPersonAmount = Math.round((grandTotal / splitWays) * 100) / 100;

  const handleSettle = () => {
    setIsProcessing(true);
    setTimeout(() => {
      payOrder(ticket.id, selectedMethod, splitWays, tipAmount);
      setIsProcessing(false);
    }, 500);
  };

  return (
    <div className="flex-1 w-full bg-[#f9f9f9] py-8 sm:py-12 pb-32" data-ui-container="settlement-view">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to={`/order/${ticket.id}`}
            className="inline-flex items-center gap-1.5 text-[13px] text-[#727272] hover:text-[#262626] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Back to Live Tracker</span>
          </Link>

          <span className="text-[12px] font-mono-num text-[#949494]" data-ui-number>
            ETA FISCAL RECEIPT #{ticket.id}
          </span>
        </div>

        {/* Perforated Thermal Ticket Container (DESIGN.md §4.3) */}
        <div className="thermal-ticket-light p-6 sm:p-8 bg-white shadow-xs">
          {/* Header Tear Band */}
          <div className="flex items-start justify-between pb-6 border-b border-[#e5e7eb]">
            <div>
              <FlameLinkLogo size="md" />
              <div className="text-[12px] text-[#727272] mt-1.5">
                Official Egyptian Tax Authority (ETA) e-Receipt
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-mono-num uppercase tracking-wider text-[#949494] block">
                {ticket.tableNumber ? `Table ${ticket.tableNumber}` : 'Online Guest'}
              </span>
              <span className="text-[14px] font-mono-num font-medium text-[#262626]" data-ui-number>
                #{ticket.id}
              </span>
            </div>
          </div>

          {/* Notch Line Indicator */}
          <div className="py-2.5 my-1 thermal-tear-line flex items-center justify-between text-[11px] text-[#949494] font-mono-num uppercase">
            <span>Fiscal ID: 849-204-118</span>
            <span>{new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          {/* Itemized Line Items */}
          <div className="py-4 space-y-3.5 border-b border-[#e5e7eb]">
            <div className="text-[11px] font-mono-num uppercase tracking-wider text-[#949494]">
              Itemized Order Summary
            </div>

            {ticket.items.map((item) => {
              const itemModifiersTotal = item.selectedModifiers.reduce((sum, m) => sum + m.price, 0);
              const unitPrice = item.menuItem.basePrice + itemModifiersTotal;
              const lineTotal = unitPrice * item.quantity;

              return (
                <div key={item.cartItemId} className="space-y-1">
                  <div className="flex items-baseline justify-between text-[14px]">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono-num font-medium text-[#262626]" data-ui-number>
                        {item.quantity}x
                      </span>
                      <span className="text-[#262626] font-medium">{item.menuItem.name}</span>
                      {/* @unit_price ONLY when quantity > 1 (Agent 03 specification) */}
                      {item.quantity > 1 && (
                        <span className="text-[12px] font-mono-num text-[#949494]" data-ui-number>
                          @{unitPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <span className="font-mono-num font-medium text-[#262626]" data-ui-number>
                      {lineTotal.toFixed(2)} EGP
                    </span>
                  </div>

                  {/* Modifiers List */}
                  {item.selectedModifiers.length > 0 && (
                    <div className="pl-6 space-y-0.5 text-[12px] text-[#727272]">
                      {item.selectedModifiers.map((m) => (
                        <div key={m.id} className="flex justify-between">
                          <span>+ {m.name}</span>
                          <span className="font-mono-num" data-ui-number>+{m.price.toFixed(2)} EGP</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Customer Notes */}
                  {item.notes && (
                    <div className="pl-6 text-[12px] italic text-[#949494]">
                      Note: "{item.notes}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tax & Total Calculation */}
          <div className="py-4 space-y-2 border-b border-[#e5e7eb] text-[13px]">
            <div className="flex justify-between text-[#727272]">
              <span>Subtotal (Net of Tax)</span>
              <span className="font-mono-num text-[#262626]" data-ui-number>{ticket.subtotal.toFixed(2)} EGP</span>
            </div>

            <div className="flex justify-between text-[#727272]">
              <span>Value Added Tax (ETA Standard 14%)</span>
              <span className="font-mono-num text-[#262626]" data-ui-number>{ticket.vatAmount.toFixed(2)} EGP</span>
            </div>

            {tipPercent > 0 && (
              <div className="flex justify-between text-[#727272]">
                <span>Kitchen Line Gratuity ({tipPercent}%)</span>
                <span className="font-mono-num text-[#262626]" data-ui-number>+{tipAmount.toFixed(2)} EGP</span>
              </div>
            )}

            <div className="pt-2 flex justify-between text-[17px] font-medium text-[#262626]">
              <span>Grand Total</span>
              <span className="font-mono-num font-medium text-[#ff4d00]" data-ui-number>{grandTotal.toFixed(2)} EGP</span>
            </div>
          </div>

          {/* Gratuity / Tip Selection */}
          {!ticket.isPaid && (
            <div className="py-4 border-b border-[#e5e7eb]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[12px] font-medium text-[#262626]">Kitchen Line Gratuity</span>
                <span className="text-[12px] font-mono-num text-[#727272]" data-ui-number>
                  {tipPercent}% ({tipAmount.toFixed(2)} EGP)
                </span>
              </div>
              <div className="flex items-center gap-2">
                {TIP_PERCENTAGES.map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setTipPercent(pct)}
                    data-ui-radius="999"
                    className={`flex-1 py-1.5 rounded-full text-[12px] font-mono-num transition-all cursor-pointer ${
                      tipPercent === pct
                        ? 'bg-[#262626] text-white font-medium shadow-xs'
                        : 'bg-[#f9f9f9] hover:bg-[#f0f0f0] text-[#727272] border border-[#e5e7eb]'
                    }`}
                  >
                    {pct === 0 ? 'No Tip' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Split Bill Calculator */}
          {!ticket.isPaid && (
            <div className="py-4 border-b border-[#e5e7eb]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[12px] font-medium text-[#262626]">Split Bill Between Party</span>
                <span className="text-[12px] font-mono-num text-[#ff4d00]" data-ui-number>
                  {perPersonAmount.toFixed(2)} EGP / person
                </span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {SPLIT_OPTIONS.map((num) => (
                  <button
                    key={num}
                    onClick={() => setSplitWays(num)}
                    data-ui-radius="8"
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-mono-num transition-all cursor-pointer shrink-0 ${
                      splitWays === num
                        ? 'bg-[#ff4d00] text-white font-medium shadow-xs'
                        : 'bg-[#f9f9f9] hover:bg-[#f0f0f0] text-[#727272] border border-[#e5e7eb]'
                    }`}
                  >
                    {num === 1 ? '1 Pay All' : `${num} Ways`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Settlement Status / Payment Action */}
          <div className="pt-5">
            {ticket.isPaid ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 text-emerald-800 font-medium text-[14px]">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>PAID IN FULL</span>
                </div>
                <div className="text-[12px] font-mono-num text-emerald-700" data-ui-number>
                  Auth: #AUTH-{ticket.id.replace('ORD-', '99')}-ETA • Method: {ticket.paymentMethod?.replace('_', ' ').toUpperCase()}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-[12px] font-medium text-[#262626]">Select Payment Method:</div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedMethod('apple_pay')}
                    data-ui-radius="8"
                    className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                      selectedMethod === 'apple_pay'
                        ? 'border-[#ff4d00] bg-[#fff8f5] shadow-xs'
                        : 'border-[#e5e7eb] bg-white hover:bg-[#f9f9f9]'
                    }`}
                  >
                    <div className="text-[13px] font-medium text-[#262626]">Apple Pay</div>
                    <div className="text-[11px] text-[#949494] mt-0.5">Contactless</div>
                  </button>

                  <button
                    onClick={() => setSelectedMethod('card')}
                    data-ui-radius="8"
                    className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                      selectedMethod === 'card'
                        ? 'border-[#ff4d00] bg-[#fff8f5] shadow-xs'
                        : 'border-[#e5e7eb] bg-white hover:bg-[#f9f9f9]'
                    }`}
                  >
                    <div className="text-[13px] font-medium text-[#262626]">Card</div>
                    <div className="text-[11px] text-[#949494] mt-0.5">Visa / Meeza</div>
                  </button>

                  <button
                    onClick={() => setSelectedMethod('cashier')}
                    data-ui-radius="8"
                    className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                      selectedMethod === 'cashier'
                        ? 'border-[#ff4d00] bg-[#fff8f5] shadow-xs'
                        : 'border-[#e5e7eb] bg-white hover:bg-[#f9f9f9]'
                    }`}
                  >
                    <div className="text-[13px] font-medium text-[#262626]">Cashier</div>
                    <div className="text-[11px] text-[#949494] mt-0.5">Door Register</div>
                  </button>
                </div>

                <button
                  onClick={handleSettle}
                  disabled={isProcessing}
                  data-ui-radius="999"
                  className="w-full py-3.5 rounded-full bg-[#ff4d00] hover:opacity-95 text-white text-[14px] font-medium transition-all btn-ember-glow active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <span>Authorizing Transaction...</span>
                  ) : (
                    <span>
                      Settle Bill ({perPersonAmount.toFixed(2)} EGP {splitWays > 1 ? `/ person` : ''}) -&gt;
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Print / Download Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 text-[13px] text-[#727272] hover:text-[#262626] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            <span>Print Fiscal Receipt (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
