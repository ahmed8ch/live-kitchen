import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { OrderStatus } from '../types/domain';
import { FlameLinkLogo } from '../components/ui/FlameLinkLogo';
import { ThermalText } from '../components/ui/ThermalText';

const STAGES: { key: OrderStatus; label: string; desc: string; stepNumber: number }[] = [
  { key: 'received', label: 'Order Received', desc: 'Station cooks reviewing kitchen chit', stepNumber: 1 },
  { key: 'cooking', label: 'Flame Line Cooking', desc: 'Patties searing & wood-fire oven active', stepNumber: 2 },
  { key: 'ready', label: 'Plating & Expediting', desc: 'Final garnish & tray pass inspection', stepNumber: 3 },
  { key: 'served', label: 'Delivered to Table', desc: 'Delivered fresh to your table', stepNumber: 4 },
];

export const OrderTrackerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const orders = useAppStore((state) => state.orders);
  const advanceOrderStatus = useAppStore((state) => state.advanceOrderStatus);
  const activeTable = useAppStore((state) => state.activeTable);
  const orderAgain = useAppStore((state) => state.orderAgain);

  // Target ticket or fallback to latest order
  const ticket =
    id === 'active' || id === 'demo' || !id
      ? orders[0]
      : orders.find((o) => o.id === id) || orders[0];

  const handleOrderAgain = () => {
    orderAgain();
    navigate(ticket?.tableNumber ? `/menu?table=${ticket.tableNumber}` : '/menu');
  };

  if (!ticket) {
    return (
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-20 text-center" data-ui-container="empty-tracker">
        <div className="w-14 h-14 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] flex items-center justify-center mx-auto text-[#727272] mb-4">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h2 className="text-xl font-medium text-[#262626]">No Active Order Found</h2>
        <p className="mt-2 text-[#727272] text-[14px] max-w-sm mx-auto">
          You have not placed an order yet. Visit our dine-in menu to order dishes.
        </p>
        <div className="mt-6">
          <Link
            to={activeTable ? `/menu?table=${activeTable}` : '/menu'}
            data-ui-radius="999"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FF0055] text-white text-[13px] font-medium transition-all btn-crimson-glow shadow-xs"
          >
            <span>Open Dine-In Menu -&gt;</span>
          </Link>
        </div>
      </div>
    );
  }

  const currentStageIndex = STAGES.findIndex((s) => s.key === ticket.status);
  const isCompleted = ticket.status === 'served';
  const isVerifiedPaid = ticket.paymentStatus === 'verified_paid';

  return (
    <div className="flex-1 w-full bg-[#f9f9f9] py-8 sm:py-12 pb-32" data-ui-container="tracker-view">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Top Breadcrumb & Status */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              to={ticket.tableNumber ? `/menu?table=${ticket.tableNumber}` : '/menu'}
              className="inline-flex items-center gap-1.5 text-[13px] text-[#727272] hover:text-[#262626] transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Menu</span>
            </Link>

            <button
              onClick={handleOrderAgain}
              className="px-3 py-1 rounded-full bg-[#262626] hover:bg-black text-white text-[12px] font-bold transition-all cursor-pointer shadow-xs"
            >
              + Order Again
            </button>
          </div>

          {/* Advance Kitchen Stage button (active if verified) */}
          {!isCompleted && isVerifiedPaid && (
            <button
              onClick={() => advanceOrderStatus(ticket.id)}
              data-ui-radius="999"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-[#f0f0f0] border border-[#e5e7eb] text-[12px] font-mono-num text-[#262626] transition-all cursor-pointer shadow-xs"
              title="Test the real-time kitchen state progression"
            >
              <span>Advance Stage -&gt;</span>
            </button>
          )}
        </div>

        {/* Warning Banner if pending cashier verification */}
        {!isVerifiedPaid && (
          <div className="mb-6 p-4 rounded-2xl bg-[#fff0f3] border-2 border-[#ffd1dc] space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF0055]" />
              <span className="text-[13px] font-bold text-[#FF0055] font-mono-num">
                AWAITING CASHIER SETTLEMENT (CHIT #{ticket.cashierChitCode || ticket.id})
              </span>
            </div>
            <p className="text-[12px] text-[#727272]">
              Kitchen cooking is strictly on hold until payment is confirmed by the front register.
              Please present your Chit code at the front counter.
            </p>
            <div className="pt-1">
              <Link
                to={`/settlement/${ticket.id}`}
                className="text-[12px] font-medium text-[#FF0055] hover:underline"
              >
                Go to Bill & Settlement / Pay Online Now -&gt;
              </Link>
            </div>
          </div>
        )}

        {/* Perforated Thermal Order Tracker Container */}
        <div className="thermal-ticket-light p-6 sm:p-8 bg-white shadow-xs mb-6">
          {/* Header */}
          <div className="flex items-start justify-between pb-6 border-b border-[#e5e7eb]">
            <div>
              <FlameLinkLogo size="md" />
              <div className="text-[12px] text-[#727272] mt-1.5">
                Live Kitchen Dispatch Monitor
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-mono-num uppercase tracking-wider text-[#949494] block">
                {ticket.tableNumber ? `Table ${ticket.tableNumber}` : 'Online Guest'}
              </span>
              <span className="text-[15px] font-mono-num font-medium text-[#262626]" data-ui-number>
                #<ThermalText text={ticket.id} durationMs={350} />
              </span>
            </div>
          </div>

          {/* Tear Line / Status Headline */}
          <div className="py-3 thermal-tear-line flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#727272] uppercase tracking-wider">
              Current Kitchen Status:
            </span>
            <span className="px-3 py-1 rounded-full bg-[#fff0f3] border border-[#ffd1dc] text-[#FF0055] text-[12px] font-mono-num font-medium">
              <ThermalText text={STAGES[currentStageIndex]?.label.toUpperCase() || 'COOKING'} />
            </span>
          </div>

          {/* 4-Stage Progress Stepper */}
          <div className="py-6 border-b border-[#e5e7eb]">
            <div className="space-y-6">
              {STAGES.map((stage, idx) => {
                const isPassed = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div key={stage.key} className="flex items-start gap-4 relative">
                    {/* Connecting Vertical Line */}
                    {idx < STAGES.length - 1 && (
                      <div
                        className={`absolute left-3.5 top-8 bottom-0 w-0.5 -mb-6 ${
                          idx < currentStageIndex ? 'bg-[#FF0055]' : 'bg-[#e5e7eb]'
                        }`}
                      />
                    )}

                    {/* Step Icon / Dot */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-mono-num shrink-0 z-10 transition-colors ${
                        isPassed
                          ? 'bg-[#FF0055] text-white shadow-xs'
                          : isCurrent
                          ? 'bg-white border-2 border-[#FF0055] text-[#FF0055] btn-crimson-glow-sm'
                          : 'bg-[#f9f9f9] border border-[#e5e7eb] text-[#949494]'
                      }`}
                      data-ui-number
                    >
                      {isPassed ? (
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        stage.stepNumber
                      )}
                    </div>

                    {/* Stage Label & Details */}
                    <div className="flex-1 pt-0.5">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[14px] font-medium ${
                            isCurrent
                              ? 'text-[#FF0055]'
                              : isPassed
                              ? 'text-[#262626]'
                              : 'text-[#949494]'
                          }`}
                        >
                          {stage.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[11px] font-mono-num text-[#FF0055] uppercase tracking-wider">
                            Active Station
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#727272] mt-0.5">
                        {stage.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ticket Items Overview */}
          <div className="py-4 border-b border-[#e5e7eb] space-y-2.5">
            <div className="text-[11px] font-mono-num uppercase tracking-wider text-[#949494]">
              Dishes in Preparation ({ticket.items.reduce((s, i) => s + i.quantity, 0)} Items)
            </div>

            <div className="space-y-2.5">
              {ticket.items.map((item) => {
                const modTotal = (item.selectedModifiers || []).reduce((sum, m) => sum + m.price, 0);
                const itemTotal = (item.menuItem.basePrice + modTotal) * item.quantity;

                return (
                  <div key={item.cartItemId} className="text-[13px] pb-2 border-b border-[#f0f0f0] last:border-b-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-num font-bold text-[#262626]" data-ui-number>
                          {item.quantity}x
                        </span>
                        <span className="text-[#262626] font-medium">{item.menuItem.name}</span>
                        {item.addedBy && (
                          <span className="text-[11px] text-[#727272]">({item.addedBy.name})</span>
                        )}
                      </div>
                      <span className="text-[13px] font-mono-num font-medium text-[#262626]">
                        {itemTotal.toFixed(2)} EGP
                      </span>
                    </div>

                    {/* Modifiers List */}
                    {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                      <div className="pl-6 text-[11px] text-[#727272] space-y-0.5 mt-0.5">
                        {item.selectedModifiers.map((m) => (
                          <div key={m.id}>
                            + {m.name} {m.price > 0 && `(+${m.price.toFixed(2)} EGP)`}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Kitchen Notes */}
                    {item.notes && (
                      <div className="pl-6 text-[11px] text-[#FF0055] italic mt-0.5">
                        &quot;{item.notes}&quot;
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Footer: Link to Settle Bill & Loopback */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono-num uppercase text-[#949494]">
                Total Payable (incl. 14% VAT)
              </div>
              <div className="text-[18px] font-mono-num font-medium text-[#262626]" data-ui-number>
                {ticket.total.toFixed(2)} EGP
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {ticket.isPaid && (
                <button
                  onClick={handleOrderAgain}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#262626] hover:bg-black text-white text-[13px] font-bold transition-all active:scale-[0.99] shadow-xs cursor-pointer"
                >
                  <span>+ Order Again</span>
                </button>
              )}

              <Link
                to={`/settlement/${ticket.id}`}
                data-ui-radius="999"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-[13px] font-medium transition-all btn-crimson-glow active:scale-[0.99] shadow-xs"
              >
                <span>{ticket.isPaid ? 'View Fiscal Receipt' : 'Split & Settle Table Bill ->'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
