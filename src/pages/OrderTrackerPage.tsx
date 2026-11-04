import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DirectionalArrow, DirectionalBackArrow } from '../components/ui/DirectionalArrow';
import { useAppStore } from '../store/useAppStore';
import { OrderStatus } from '../types/domain';
import { FlameLinkLogo } from '../components/ui/FlameLinkLogo';
import { ThermalText } from '../components/ui/ThermalText';
import { useTranslation } from '../i18n';

export const OrderTrackerPage: React.FC = () => {
  const { t, localizeDish, localizeModifier } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const orders = useAppStore((state) => state.orders);
  const activeTable = useAppStore((state) => state.activeTable);
  const orderAgain = useAppStore((state) => state.orderAgain);

  const [currentTime, setCurrentTime] = React.useState(Date.now());

  const stages: { key: OrderStatus; label: string; desc: string; stepNumber: number }[] = [
    { key: 'received', label: t('tracker.stages.receivedLabel'), desc: t('tracker.stages.receivedDesc'), stepNumber: 1 },
    { key: 'cooking', label: t('tracker.stages.cookingLabel'), desc: t('tracker.stages.cookingDesc'), stepNumber: 2 },
    { key: 'ready', label: t('tracker.stages.readyLabel'), desc: t('tracker.stages.readyDesc'), stepNumber: 3 },
    { key: 'served', label: t('tracker.stages.servedLabel'), desc: t('tracker.stages.servedDesc'), stepNumber: 4 },
  ];

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const ticket =
    id && id !== 'active' && id !== 'demo'
      ? orders.find((o) => o.id === id) || (activeTable ? orders.find((o) => o.tableNumber === activeTable) : orders[0]) || orders[0]
      : (activeTable ? orders.find((o) => o.tableNumber === activeTable) : orders[0]) || orders[0];

  const getElapsedSeconds = (ticketObj: typeof ticket) => {
    if (!ticketObj) return 0;
    if (ticketObj.paymentStatus !== 'verified_paid' && !ticketObj.isPaid) return 0;
    const baseline = ticketObj.paidAt || ticketObj.createdAt;
    return Math.min(7200, Math.max(0, Math.floor((currentTime - baseline) / 1000)));
  };

  const formatElapsed = (ticketObj: typeof ticket) => {
    const elapsedSeconds = getElapsedSeconds(ticketObj);
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleOrderAgain = () => {
    orderAgain();
    navigate(ticket?.tableNumber ? `/menu?table=${ticket.tableNumber}` : '/menu');
  };

  // Fallback when No Active Order Ticket Found
  if (!ticket) {
    return (
      <div className="flex-1 w-full max-w-md mx-auto px-4 py-20 sm:py-24 text-center" data-ui-container="empty-tracker">
        <div className="w-14 h-14 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] flex items-center justify-center mx-auto text-[#727272] mb-4 shadow-xs">
          <svg className="w-6 h-6 stroke-[1.75px]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-[#262626]">{t('tracker.emptyTitle')}</h2>
        <p className="mt-2 text-[#727272] text-sm leading-relaxed max-w-sm mx-auto">
          {t('tracker.emptyDesc')}
        </p>
        <div className="mt-6">
          <Link
            to={activeTable ? `/menu?table=${activeTable}` : '/menu'}
            data-ui-radius="999"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FF0055] text-white text-sm font-bold transition-colors btn-crimson-glow shadow-xs hover:bg-[#e0004d] active:scale-95"
          >
            <span>{t('tracker.openDineInMenu')}</span>
            <DirectionalArrow className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = ticket.status === 'served';
  const isVerifiedPaid = ticket.paymentStatus === 'verified_paid';
  const currentStageIndex = isVerifiedPaid ? stages.findIndex((s) => s.key === ticket.status) : -1;

  return (
    <div className="flex-1 w-full bg-[#f9f9f9] py-8 sm:py-12 pb-32" data-ui-container="tracker-view">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Top Breadcrumb & Status */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              to={ticket.tableNumber ? `/menu?table=${ticket.tableNumber}` : '/menu'}
              className="min-h-[44px] inline-flex items-center gap-1.5 text-sm text-[#727272] hover:text-[#262626] transition-colors"
            >
              <DirectionalBackArrow className="w-4 h-4" />
              <span>{t('tracker.backToMenu')}</span>
            </Link>

            <button
              onClick={handleOrderAgain}
              className="min-h-[44px] px-4 py-2 rounded-full bg-[#262626] hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer shadow-xs inline-flex items-center"
            >
              {t('tracker.orderAgainBtn')}
            </button>
          </div>

          {/* Live Kitchen Status Indicator (Diner View) */}
          {!isCompleted && isVerifiedPaid && ticket.status !== 'voided' && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fff0f3] border border-[#ffd1dc] text-xs font-semibold text-[#FF0055]">
              <span className="w-2 h-2 rounded-full bg-[#FF0055]" />
              <span>
                {t('tracker.stationActive', {
                  stage: stages[currentStageIndex]?.label || t('tracker.stages.cookingLabel'),
                })}
              </span>
              <span className="font-mono-num font-bold">({formatElapsed(ticket)})</span>
            </div>
          )}
        </div>

        {/* Voided Order Cancellation Notice */}
        {ticket.status === 'voided' && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              <span className="text-sm font-bold text-red-700">{t('tracker.voidedTitle')}</span>
            </div>
            <p className="text-xs text-red-700">
              {t('tracker.voidedReasonLabel')}{' '}
              <span className="font-medium">{ticket.voidReason || t('tracker.voidedDefaultReason')}</span>
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={handleOrderAgain}
                className="px-4 py-2 min-h-[44px] rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>{t('tracker.startNewOrderBtn')}</span>
                <DirectionalArrow className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Server Bump Alert Banner when ticket.status === 'ready' */}
        {isVerifiedPaid && ticket.status === 'ready' && (
          <div className="mb-6 p-4 rounded-2xl bg-[#fff0f3] border-2 border-[#FF0055] flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#FF0055] shrink-0" />
              <div>
                <div className="text-sm font-bold text-[#FF0055]">{t('tracker.readyAlertTitle')}</div>
                <div className="text-xs text-[#727272]">
                  {t('tracker.readyAlertDesc', { table: ticket.tableNumber || '' })}
                </div>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#FF0055] text-white text-xs font-bold shrink-0">
              {t('tracker.passBumped')}
            </span>
          </div>
        )}

        {/* Warning Banner if pending cashier verification */}
        {!isVerifiedPaid && ticket.status !== 'voided' && (
          <div className="mb-6 p-4 rounded-2xl bg-[#fff0f3] border border-[#ffd1dc] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF0055]" />
                <span className="text-sm font-bold text-[#262626]">
                  {t('tracker.paymentRequiredTitle', { chit: ticket.cashierChitCode || ticket.id })}
                </span>
              </div>
              <p className="text-xs text-[#727272]">
                {t('tracker.paymentRequiredDesc')}
              </p>
            </div>
            <Link
              to={`/settlement/${ticket.id}`}
              className="min-h-[40px] px-4 py-2 rounded-full bg-[#FF0055] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shrink-0 hover:opacity-95 transition-colors"
            >
              <span>{t('tracker.settleBillNowBtn')}</span>
              <DirectionalArrow className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Perforated Thermal Order Tracker Container */}
        <div className="thermal-ticket-light p-6 sm:p-8 bg-white shadow-xs mb-6">
          {/* Header */}
          <div className="flex items-start justify-between pb-6 border-b border-[#e5e7eb]">
            <div>
              <FlameLinkLogo size="md" />
              <div className="text-xs text-[#727272] mt-1.5">
                {t('tracker.dispatchMonitor')}
              </div>
            </div>

            <div className="text-end">
              <span className="text-xs font-medium text-[#727272] block">
                {ticket.tableNumber ? `${t('common.table')} ${ticket.tableNumber}` : t('tracker.onlineGuest')}
              </span>
              <span className="text-base font-mono-num font-bold text-[#262626]" data-ui-number>
                #<ThermalText text={ticket.cashierChitCode || ticket.id} durationMs={350} />
              </span>
              <div className="text-xs text-[#727272] mt-1 flex items-center justify-end gap-1">
                <span>{isVerifiedPaid ? t('tracker.cookTime') : t('tracker.kitchenTimer')}</span>
                <span className="font-mono-num font-bold text-[#262626]" data-ui-number>
                  {isVerifiedPaid ? formatElapsed(ticket) : t('tracker.holdTimer')}
                </span>
              </div>
            </div>
          </div>

          {/* Tear Line / Status Headline */}
          <div className="py-3 thermal-tear-line flex items-center justify-between">
            <span className="text-xs font-medium text-[#727272]">
              {t('tracker.currentKitchenStatus')}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              ticket.status === 'voided'
                ? 'bg-red-50 border border-red-200 text-red-700'
                : !isVerifiedPaid
                ? 'bg-[#f9f9f9] border border-[#e5e7eb] text-[#727272]'
                : 'bg-[#fff0f3] border border-[#ffd1dc] text-[#FF0055]'
            }`}>
              <ThermalText
                text={
                  ticket.status === 'voided'
                    ? t('tracker.statusVoided')
                    : !isVerifiedPaid
                    ? t('tracker.statusOnHold')
                    : (stages[currentStageIndex]?.label.toUpperCase() || t('tracker.stages.cookingLabel'))
                }
              />
            </span>
          </div>

          {/* 4-Stage Progress Stepper */}
          <div className="py-6 border-b border-[#e5e7eb]">
            <div className="space-y-6">
              {stages.map((stage, idx) => {
                const isPassed = isVerifiedPaid && idx < currentStageIndex;
                const isCurrent = isVerifiedPaid && idx === currentStageIndex;

                return (
                  <div key={stage.key} className="flex items-start gap-4 relative">
                    {/* Connecting Vertical Line */}
                    {idx < stages.length - 1 && (
                      <div
                        className={`absolute start-3.5 top-8 bottom-0 w-0.5 -mb-6 ${
                          isVerifiedPaid && idx < currentStageIndex ? 'bg-[#FF0055]' : 'bg-[#e5e7eb]'
                        }`}
                      />
                    )}

                    {/* Step Icon / Dot */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono-num shrink-0 z-10 transition-colors ${
                        isPassed
                          ? 'bg-[#FF0055] text-white shadow-xs'
                          : isCurrent
                          ? 'bg-white border-2 border-[#FF0055] text-[#FF0055] btn-crimson-glow-sm'
                          : 'bg-[#f9f9f9] border border-[#e5e7eb] text-[#727272]'
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
                          className={`text-sm font-semibold ${
                            isCurrent
                              ? 'text-[#FF0055]'
                              : isPassed
                              ? 'text-[#262626]'
                              : 'text-[#727272]'
                          }`}
                        >
                          {stage.label}
                        </span>
                        {isCurrent && (
                          <span className="text-xs font-semibold text-[#FF0055]">
                            {t('tracker.activeStation')}
                          </span>
                        )}
                        {!isVerifiedPaid && idx === 0 && (
                          <span className="text-xs font-medium text-[#727272]">
                            {t('tracker.queuedUntilPaid')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#727272] mt-0.5">
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
            <div className="text-xs font-semibold text-[#727272]">
              {t('tracker.orderSummaryItems', {
                count: ticket.items.reduce((s, i) => s + i.quantity, 0),
              })}
            </div>

            <div className="space-y-2.5">
              {ticket.items.map((item) => {
                const modTotal = (item.selectedModifiers || []).reduce((sum, m) => sum + m.price, 0);
                const itemTotal = (item.menuItem.basePrice + modTotal) * item.quantity;
                const localDish = localizeDish(item.menuItem);

                return (
                  <div key={item.cartItemId} className="text-sm pb-2 border-b border-[#f0f0f0] last:border-b-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-num font-bold text-[#262626]" data-ui-number>
                          {item.quantity}x
                        </span>
                        <span className="text-[#262626] font-medium" data-dish-name={item.menuItem.name}>
                          {localDish.name}
                        </span>
                        {item.addedBy && (
                          <span className="text-xs text-[#727272]">
                            ({item.addedBy.name.replace(/\s*\(Host\)$/i, '')})
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-mono-num font-medium text-[#262626]">
                        {itemTotal.toFixed(2)} {t('common.egp')}
                      </span>
                    </div>

                    {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                      <div className="ps-6 text-xs text-[#727272] space-y-0.5 mt-0.5">
                        {item.selectedModifiers.map((m) => (
                          <div key={m.id}>
                            + {localizeModifier(item.menuItem.id, m.id, m.name)}{' '}
                            {m.price > 0 && `(+${m.price.toFixed(2)} ${t('common.egp')})`}
                          </div>
                        ))}
                      </div>
                    )}

                    {item.notes && (
                      <div className="ps-6 text-xs text-[#FF0055] font-medium mt-0.5">
                        &quot;{item.notes}&quot;
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Footer: Link to Settle Bill & Loopback (14% VAT included) */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs font-medium text-[#727272]">
                {t('tracker.totalPayableInclVat')}
              </div>
              <div className="text-lg font-mono-num font-bold text-[#262626]" data-ui-number>
                {ticket.total.toFixed(2)} {t('common.egp')}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {ticket.isPaid && (
                <button
                  onClick={handleOrderAgain}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#262626] hover:bg-black text-white text-sm font-bold transition-colors active:scale-[0.99] shadow-xs cursor-pointer"
                >
                  <span>{t('tracker.orderAgainBtn')}</span>
                </button>
              )}

              <Link
                to={`/settlement/${ticket.id}`}
                data-ui-radius="999"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-sm font-semibold transition-colors btn-crimson-glow active:scale-[0.99] shadow-xs"
              >
                <span>{ticket.isPaid ? t('tracker.viewFiscalReceipt') : t('tracker.splitSettleTableBill')}</span>
                {!ticket.isPaid && <DirectionalArrow className="w-4 h-4" />}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
