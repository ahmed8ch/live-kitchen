import React from 'react';
import { useParams, Link } from 'react-router-dom';
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

  const orders = useAppStore((state) => state.orders);
  const advanceOrderStatus = useAppStore((state) => state.advanceOrderStatus);
  const activeTable = useAppStore((state) => state.activeTable);

  // Target ticket or fallback to latest order
  const ticket =
    id === 'active' || id === 'demo' || !id
      ? orders[0]
      : orders.find((o) => o.id === id) || orders[0];

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
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#ff4d00] text-white text-[13px] font-medium transition-all btn-ember-glow"
          >
            <span>Open Dine-In Menu -&gt;</span>
          </Link>
        </div>
      </div>
    );
  }

  const currentStageIndex = STAGES.findIndex((s) => s.key === ticket.status);
  const isCompleted = ticket.status === 'served';

  return (
    <div className="flex-1 w-full bg-[#f9f9f9] py-8 sm:py-12 pb-32" data-ui-container="tracker-view">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Top Breadcrumb & Status */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to={ticket.tableNumber ? `/menu?table=${ticket.tableNumber}` : '/menu'}
            className="inline-flex items-center gap-1.5 text-[13px] text-[#727272] hover:text-[#262626] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Add More Dishes</span>
          </Link>

          {/* Single-Tab Demo Trigger: Advance Kitchen Stage */}
          {!isCompleted && (
            <button
              onClick={() => advanceOrderStatus(ticket.id)}
              data-ui-radius="999"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-[#f0f0f0] border border-[#e5e7eb] text-[12px] font-mono-num text-[#262626] transition-all cursor-pointer shadow-xs"
              title="Test the real-time kitchen state progression"
            >
              <span>Advance Kitchen Stage -&gt;</span>
            </button>
          )}
        </div>

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
                #{ticket.id}
              </span>
            </div>
          </div>

          {/* Tear Line / Status Headline */}
          <div className="py-3 thermal-tear-line flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#727272] uppercase tracking-wider">
              Current Kitchen Status:
            </span>
            <span className="px-3 py-1 rounded-full bg-[#fff8f5] border border-[#fcddcc] text-[#ff4d00] text-[12px] font-mono-num font-medium">
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
                          idx < currentStageIndex ? 'bg-[#ff4d00]' : 'bg-[#e5e7eb]'
                        }`}
                      />
                    )}

                    {/* Step Icon / Dot */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-mono-num shrink-0 z-10 transition-colors ${
                        isPassed
                          ? 'bg-[#ff4d00] text-white shadow-xs'
                          : isCurrent
                          ? 'bg-white border-2 border-[#ff4d00] text-[#ff4d00] btn-ember-glow-sm'
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
                              ? 'text-[#ff4d00]'
                              : isPassed
                              ? 'text-[#262626]'
                              : 'text-[#949494]'
                          }`}
                        >
                          {stage.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[11px] font-mono-num text-[#ff4d00] uppercase tracking-wider">
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

            <div className="space-y-2">
              {ticket.items.map((item) => (
                <div key={item.cartItemId} className="flex items-center justify-between text-[13px]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-num font-medium text-[#262626]" data-ui-number>
                      {item.quantity}x
                    </span>
                    <span className="text-[#262626]">{item.menuItem.name}</span>
                  </div>
                  <span className="text-[12px] font-mono-num text-[#727272]">
                    {(item.menuItem.basePrice * item.quantity).toFixed(2)} EGP
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer: Link to Settle Bill */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono-num uppercase text-[#949494]">
                Total Payable (incl. 14% VAT)
              </div>
              <div className="text-[18px] font-mono-num font-medium text-[#262626]" data-ui-number>
                {ticket.total.toFixed(2)} EGP
              </div>
            </div>

            <Link
              to={`/settlement/${ticket.id}`}
              data-ui-radius="999"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#ff4d00] hover:opacity-95 text-white text-[13px] font-medium transition-all btn-ember-glow active:scale-[0.99]"
            >
              <span>{ticket.isPaid ? 'View Fiscal Receipt' : 'Split & Settle Table Bill ->'}</span>
            </Link>
          </div>
        </div>

        {/* Real-Time WebSocket Notice */}
        <div className="text-center text-[12px] font-mono-num text-[#949494]">
          Live Kitchen Bus Connected • Sub-Second Broadcast Sync
        </div>
      </div>
    </div>
  );
};
