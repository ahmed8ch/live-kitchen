import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DirectionalArrow, DirectionalBackArrow } from '../components/ui/DirectionalArrow';
import { useAppStore } from '../store/useAppStore';
import { PaymentMethod } from '../types/domain';
import { FlameLinkLogo } from '../components/ui/FlameLinkLogo';
import { ThermalText } from '../components/ui/ThermalText';
import { useTranslation } from '../i18n';

const SPLIT_OPTIONS = [1, 2, 3, 4, 5, 6, 8];
const TIP_PERCENTAGES = [0, 10, 15, 20];

export const calculateEqualSplitShares = (totalAmount: number, dinerCount: number): number[] => {
  if (dinerCount <= 0) return [];
  const totalCents = Math.round(totalAmount * 100);
  const baseCents = Math.floor(totalCents / dinerCount);
  const remainderCents = totalCents % dinerCount;
  const shares: number[] = [];
  for (let i = 0; i < dinerCount; i++) {
    const shareCents = baseCents + (i < remainderCents ? 1 : 0);
    shares.push(Math.round(shareCents) / 100);
  }
  return shares;
};

export const SettlementPage: React.FC = () => {
  const { t, localizeDish, localizeModifier } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const orders = useAppStore((state) => state.orders);
  const activeOrderId = useAppStore((state) => state.activeOrderId);
  const tableSessions = useAppStore((state) => state.tableSessions);
  const payDinerShare = useAppStore((state) => state.payDinerShare);
  const submitMealReview = useAppStore((state) => state.submitMealReview);
  const orderAgain = useAppStore((state) => state.orderAgain);
  const activeTable = useAppStore((state) => state.activeTable);
  const currentMember = useAppStore((state) => state.currentMember);
  const companionMember = useAppStore((state) => state.companionMember);
  const showToast = useAppStore((state) => state.showToast);

  const receiptRef = useRef<HTMLDivElement>(null);

  // Dynamic ticket lookup: by URL param, or current active order, or latest in store
  const ticket = id && id !== 'active'
    ? orders.find((o) => o.id === id)
    : activeOrderId
    ? orders.find((o) => o.id === activeOrderId)
    : orders[0];

  const [splitMode, setSplitMode] = useState<'by_diner' | 'equal' | 'itemized'>('by_diner');
  const [splitWays, setSplitWays] = useState<number>(1);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('apple_pay');
  const [isProcessing, setIsProcessing] = useState(false);

  const localizeMemberName = (rawName?: string, memberIsHost?: boolean): string => {
    const cleaned = (rawName || '').replace(/\s*\(Host\)$/i, '').trim();
    if (!cleaned) {
      return memberIsHost ? t('common.tableHost') : t('common.companion');
    }
    const lower = cleaned.toLowerCase();
    if (lower === 'table host' || lower === 'red panda' || lower === 'host') {
      return t('common.tableHost');
    }
    if (lower === 'companion guest' || lower === 'companion' || lower === 'guest') {
      return t('common.companion');
    }
    return cleaned;
  };

  // Sync splitMode when ticket splitStrategy is defined
  useEffect(() => {
    if (ticket?.splitStrategy === 'equal_split') {
      setSplitMode('equal');
      if (ticket.splitCount) setSplitWays(ticket.splitCount);
    } else if (ticket?.splitStrategy === 'split_by_diner') {
      setSplitMode('by_diner');
    }
  }, [ticket?.id, ticket?.splitStrategy, ticket?.splitCount]);

  // Post-meal rating & tipping state (Happy Yellow #FBBF24)
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [tipPercent, setTipPercent] = useState<number>(10);
  const [feedback, setFeedback] = useState<string>('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (!ticket) {
    return (
      <div className="flex-1 w-full max-w-md mx-auto px-4 py-20 sm:py-24 text-center" data-ui-container="empty-settlement">
        <div className="w-14 h-14 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] flex items-center justify-center mx-auto text-[#727272] mb-4 shadow-xs">
          <svg className="w-6 h-6 stroke-[1.75px]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-[#262626]">{t('settlement.emptyTitle')}</h2>
        <p className="mt-2 text-[#727272] text-sm leading-relaxed max-w-sm mx-auto">
          {t('settlement.emptyDesc')}
        </p>
        <div className="mt-6">
          <Link
            to={activeTable ? `/menu?table=${activeTable}` : '/menu'}
            data-ui-radius="999"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FF0055] text-white text-sm font-bold transition-colors btn-crimson-glow shadow-xs hover:bg-[#e0004d] active:scale-95"
          >
            <span>{t('settlement.openDineInMenu')}</span>
            <DirectionalArrow className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const isVerifiedPaid = ticket.paymentStatus === 'verified_paid';

  // Dynamic grouping by seated diner who ordered each item
  const effectiveMember = currentMember || companionMember;
  const currentSession = ticket.tableNumber ? tableSessions[ticket.tableNumber] : null;

  const dinerGroups = useMemo(() => {
    const groups: Record<
      string,
      {
        memberId: string;
        name: string;
        isHost: boolean;
        isCurrentUser: boolean;
        isDeparted: boolean;
        items: typeof ticket.items;
        subtotal: number;
        vatAmount: number;
        total: number;
        isPaid: boolean;
        paymentRecord?: {
          memberId: string;
          name: string;
          amount: number;
          paidAt: number;
          paymentMethod: PaymentMethod;
        };
      }
    > = {};

    ticket.items.forEach((item) => {
      const memberId = item.addedBy?.memberId || 'host-diner';
      const isHost = item.addedBy?.isHost || memberId === 'host-diner';
      const memberName = localizeMemberName(item.addedBy?.name, isHost);
      const isDeparted = currentSession
        ? !(currentSession.members || []).some((m) => m?.id === memberId)
        : false;

      if (!groups[memberId]) {
        groups[memberId] = {
          memberId,
          name: memberName,
          isHost,
          isCurrentUser: effectiveMember?.id === memberId,
          isDeparted,
          items: [],
          subtotal: 0,
          vatAmount: 0,
          total: 0,
          isPaid: Boolean(ticket.paidDiners?.[memberId]),
          paymentRecord: ticket.paidDiners?.[memberId],
        };
      }

      groups[memberId].items.push(item);
      const modTotal = (item.selectedModifiers || []).reduce((mSum, m) => mSum + (m?.price || 0), 0);
      groups[memberId].subtotal += (item.menuItem.basePrice + modTotal) * item.quantity;
    });

    Object.values(groups).forEach((g) => {
      g.subtotal = Math.round(g.subtotal * 100) / 100;
      g.vatAmount = Math.round(g.subtotal * 0.14 * 100) / 100;
      g.total = Math.round((g.subtotal + g.vatAmount) * 100) / 100;
    });

    return Object.values(groups);
  }, [ticket, effectiveMember, currentSession, t]);

  const totalPaidShares = Object.values(ticket.paidDiners || {}).reduce(
    (sum, record) => sum + record.amount,
    0
  );
  const remainingTableBalance = Math.max(0, Math.round((ticket.total - totalPaidShares) * 100) / 100);

  // Itemized split calculation
  const selectedItems = ticket.items.filter((item) =>
    selectedItemIds.includes(item.cartItemId)
  );

  const itemizedSubtotal = selectedItems.reduce((sum, item) => {
    const modTotal = (item.selectedModifiers || []).reduce((mSum, m) => mSum + (m?.price || 0), 0);
    return sum + (item.menuItem.basePrice + modTotal) * item.quantity;
  }, 0);
  const itemizedVat = Math.round(itemizedSubtotal * 0.14 * 100) / 100;
  const itemizedTotal = Math.round((itemizedSubtotal + itemizedVat) * 100) / 100;

  // Equal split calculation with exact odd penny distribution
  const equalSplitShares = useMemo(() => {
    if (!ticket || splitWays <= 0) return [];
    return calculateEqualSplitShares(ticket.total, splitWays);
  }, [ticket?.total, splitWays]);

  const perPersonAmount = equalSplitShares[0] || (ticket ? Math.round((ticket.total / splitWays) * 100) / 100 : 0);

  // Post-meal tip calculation
  const tipAmount = Math.round((ticket.subtotal * (tipPercent / 100)) * 100) / 100;

  const toggleItemSelection = (cartItemId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(cartItemId) ? prev.filter((id) => id !== cartItemId) : [...prev, cartItemId]
    );
  };

  const selectAllItems = () => {
    setSelectedItemIds(ticket.items.map((i) => i.cartItemId));
  };

  const handlePayDinerShare = (memberId: string, amount: number) => {
    setIsProcessing(true);
    setTimeout(() => {
      payDinerShare(ticket.id, memberId, selectedMethod, amount);
      setIsProcessing(false);
      showToast(t('settlement.sharePaidToast', { amount: amount.toFixed(2) }));
    }, 450);
  };

  const handleSettleAction = () => {
    setIsProcessing(true);
    setTimeout(() => {
      if (splitMode === 'by_diner') {
        const memberId = effectiveMember?.id || 'host-diner';
        payDinerShare(ticket.id, memberId, selectedMethod, remainingTableBalance);
        showToast(t('settlement.settledRemainingToast', { amount: remainingTableBalance.toFixed(2) }));
      } else if (splitMode === 'equal') {
        const memberId = effectiveMember?.id || `diner-equal-${Date.now()}`;
        payDinerShare(ticket.id, memberId, selectedMethod, perPersonAmount);
        showToast(t('settlement.paidEqualShareToast', { amount: perPersonAmount.toFixed(2) }));
      } else {
        const memberId = effectiveMember?.id || `diner-custom-${Date.now()}`;
        payDinerShare(ticket.id, memberId, selectedMethod, itemizedTotal);
        showToast(t('settlement.paidSelectedDishesToast', { amount: itemizedTotal.toFixed(2) }));
      }
      setIsProcessing(false);
    }, 500);
  };

  const handleOrderAgain = () => {
    orderAgain();
    const query = activeTable ? `?table=${activeTable}` : '';
    navigate(`/menu${query}`);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    submitMealReview(ticket.id, rating, feedback.trim() || undefined, tipAmount);
    setReviewSubmitted(true);
  };

  // Export receipt as image (SVG canvas -> PNG download)
  const handleSaveAsImage = () => {
    const receiptElement = document.getElementById('printable-receipt');
    if (!receiptElement) return;

    const width = 480;
    const height = 620;

    const canvas = document.createElement('canvas');
    canvas.width = width * 2;
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      window.print();
      return;
    }

    ctx.scale(2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Thermal header banner
    ctx.fillStyle = '#FF0055';
    ctx.fillRect(0, 0, width, 40);

    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Live Kitchen e-Receipt', 20, 26);

    ctx.font = '12px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`#${ticket.id}`, width - 110, 26);

    // Body content
    ctx.font = '13px monospace';
    ctx.fillStyle = '#262626';
    ctx.fillText(`Table: ${ticket.tableNumber || 'Counter'}`, 20, 70);
    ctx.fillText(
      `Date: ${new Date(ticket.createdAt).toLocaleDateString()} ${new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      20,
      90
    );
    ctx.fillText(`Status: ${isVerifiedPaid ? 'PAID IN FULL' : 'PENDING CASHIER'}`, 20, 110);

    let y = 140;
    ctx.fillText('----------------------------------------------------', 20, y);
    y += 20;

    ticket.items.forEach((item) => {
      const modTotal = (item.selectedModifiers || []).reduce((sum, m) => sum + m.price, 0);
      const lineTotal = (item.menuItem.basePrice + modTotal) * item.quantity;
      ctx.fillText(`${item.quantity}x ${item.menuItem.name}`, 20, y);
      ctx.fillText(`${lineTotal.toFixed(2)} EGP`, width - 110, y);
      y += 20;
    });

    ctx.fillText('----------------------------------------------------', 20, y);
    y += 20;

    ctx.fillText(`Subtotal: ${ticket.subtotal.toFixed(2)} EGP`, 20, y);
    y += 18;
    ctx.fillText(`14% VAT: ${ticket.vatAmount.toFixed(2)} EGP`, 20, y);
    y += 22;

    if (totalPaidShares > 0) {
      ctx.font = '11px monospace';
      ctx.fillStyle = '#15803d';
      ctx.fillText(`Less: Pre-Settled Companion Shares: -${totalPaidShares.toFixed(2)} EGP`, 20, y);
      y += 18;
      ctx.font = 'bold 15px monospace';
      ctx.fillStyle = isVerifiedPaid ? '#15803d' : '#FF0055';
      ctx.fillText(`Net Balance Due: ${isVerifiedPaid ? '0.00' : remainingTableBalance.toFixed(2)} EGP`, 20, y);
    } else {
      ctx.font = 'bold 15px monospace';
      ctx.fillStyle = '#FF0055';
      ctx.fillText(`Total Paid: ${ticket.total.toFixed(2)} EGP`, 20, y);
    }

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `LiveKitchen-Receipt-${ticket.id}.png`;
    link.href = dataUrl;
    link.click();
    showToast(t('settlement.receiptSavedToast', { id: ticket.id }));
  };

  return (
    <div className="flex-1 w-full bg-[#f9f9f9] py-6 sm:py-8 pb-32" data-ui-container="settlement-view">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb & Order Again Loopback (NO-PRINT) */}
        <div className="no-print flex items-center justify-between mb-5">
          <Link
            to={`/order/${ticket.id}`}
            className="min-h-[44px] inline-flex items-center gap-1.5 text-sm text-[#727272] hover:text-[#262626] transition-colors"
          >
            <DirectionalBackArrow className="w-4 h-4" />
            <span>{t('settlement.backToLiveTracker')}</span>
          </Link>

          {/* Loopback: Order Again button */}
          <button
            onClick={handleOrderAgain}
            className="min-h-[44px] px-4 py-2 rounded-full bg-[#262626] hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer shadow-xs inline-flex items-center justify-center"
          >
            {t('settlement.orderAgainBtn')}
          </button>
        </div>

        {/* 2-Column Desktop Grid: Interactive Split & Payment (Start) + Thermal Receipt & Print (End) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Start Column: Chit Notice, Split Bill Engine & Post-Meal Review */}
          <div className="lg:col-span-7 space-y-5">
            {/* Cashier Chit Notice if payment is pending (NO-PRINT) */}
            {!isVerifiedPaid && (
              <div className="no-print p-4 rounded-2xl bg-[#fff0f3] border border-[#ffd1dc] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ffe0e8] text-[#FF0055] text-[11px] font-bold">
                    <span>{t('settlement.paymentRequiredBadge')}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#262626] mt-1">
                    {t('common.chit')} #<ThermalText text={ticket.cashierChitCode || ticket.id} durationMs={300} />
                  </h3>
                  <p className="text-xs sm:text-sm text-[#727272] mt-0.5">
                    {t('settlement.chitNoticeDesc')}
                  </p>
                </div>
              </div>
            )}

            {/* Interactive Split Bill Engine & Payment Verification Card (NO-PRINT) */}
            {!isVerifiedPaid && (
              <div className="no-print bg-white p-6 rounded-2xl border border-[#e5e7eb] shadow-xs space-y-5">
                {/* Split Bill Mode */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-[#e5e7eb]">
                  <span className="text-sm font-bold text-[#262626]">{t('settlement.splitBillMode')}</span>
                  <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-[#f9f9f9] p-1.5 rounded-full border border-[#e5e7eb] w-full sm:w-auto">
                    <button
                      onClick={() => setSplitMode('by_diner')}
                      className={`min-h-[44px] flex items-center justify-center px-3.5 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer text-center whitespace-nowrap ${
                        splitMode === 'by_diner' ? 'bg-[#262626] text-white shadow-xs' : 'text-[#727272] hover:text-[#262626]'
                      }`}
                    >
                      {t('settlement.splitByDiner')}
                    </button>
                    <button
                      onClick={() => setSplitMode('equal')}
                      className={`min-h-[44px] flex items-center justify-center px-3.5 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer text-center whitespace-nowrap ${
                        splitMode === 'equal' ? 'bg-[#262626] text-white shadow-xs' : 'text-[#727272] hover:text-[#262626]'
                      }`}
                    >
                      {t('settlement.equalSplit')}
                    </button>
                    <button
                      onClick={() => {
                        setSplitMode('itemized');
                        if (selectedItemIds.length === 0) selectAllItems();
                      }}
                      className={`min-h-[44px] flex items-center justify-center px-3.5 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer text-center whitespace-nowrap ${
                        splitMode === 'itemized' ? 'bg-[#262626] text-white shadow-xs' : 'text-[#727272] hover:text-[#262626]'
                      }`}
                    >
                      {t('settlement.customDishes')}
                    </button>
                  </div>
                </div>

                {/* SPLIT BY DINER (PAY FOR WHAT YOU ORDERED) */}
                {splitMode === 'by_diner' && (
                  <div className="space-y-4">
                    {/* Table Balance Progress Banner */}
                    <div className="p-3.5 rounded-2xl bg-[#f9f9f9] border border-[#e5e7eb] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#727272]">{t('settlement.remainingTableBalance')}</span>
                        <span className="font-mono-num font-bold text-[#FF0055] text-sm">
                          {remainingTableBalance.toFixed(2)} {t('common.egp')}
                        </span>
                      </div>
                      <div className="w-full bg-[#e5e7eb] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#15803d] h-full transition-[width] duration-300"
                          style={{
                            width: `${Math.min(100, Math.round((totalPaidShares / ticket.total) * 100))}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-[#727272]">
                        <span>
                          {t('settlement.settledLabel')}{' '}
                          <span className="font-mono-num font-medium">{totalPaidShares.toFixed(2)} {t('common.egp')}</span>
                        </span>
                        <span>
                          {t('settlement.totalLabel')}{' '}
                          <span className="font-mono-num font-medium">{ticket.total.toFixed(2)} {t('common.egp')}</span>
                        </span>
                      </div>
                    </div>

                    {/* Seated Diners Cards List */}
                    <div className="space-y-3">
                      {dinerGroups.map((group) => (
                        <div
                          key={group.memberId}
                          className={`p-4 rounded-2xl border transition-colors ${
                            group.isPaid
                              ? 'bg-[#f9f9f9] border-[#262626]'
                              : 'bg-white border-[#e5e7eb] shadow-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-[#f0f0f0]">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-[#262626]">
                                {group.name}
                              </span>
                              {group.isCurrentUser && (
                                <span className="px-2 py-0.5 rounded-full bg-[#FF0055]/10 text-[#FF0055] text-[10px] font-bold">
                                  {t('common.you')}
                                </span>
                              )}
                            </div>

                            {group.isPaid ? (
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                  group.isDeparted
                                    ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                    : 'bg-[#262626] text-white'
                                }`}
                              >
                                {group.isDeparted ? t('settlement.paidAndDeparted') : t('common.paid')}
                              </span>
                            ) : group.isDeparted ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px]">
                                {t('settlement.leftTable')}
                              </span>
                            ) : group.isCurrentUser ? (
                              <span className="text-xs text-[#FF0055] font-bold">
                                {t('settlement.yourShare')}
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] text-[#727272] text-[10px]">
                                {t('settlement.awaitingDinerDevice')}
                              </span>
                            )}
                          </div>

                          {/* Diner's exact ordered items */}
                          <div className="py-2.5 space-y-1.5 text-xs">
                            {group.items.map((item) => {
                              const modTotal = (item.selectedModifiers || []).reduce((sum, m) => sum + m.price, 0);
                              const unitPriceWithMods = item.menuItem.basePrice + modTotal;
                              const localDish = localizeDish(item.menuItem);
                              return (
                                <div key={item.cartItemId} className="flex justify-between items-start text-[#262626]">
                                  <div>
                                    <span>{item.quantity}x {localDish.name}</span>
                                    {modTotal > 0 && (
                                      <div className="text-[11px] text-[#727272]">
                                        +{item.selectedModifiers.map((m) => localizeModifier(item.menuItem.id, m.id, m.name)).join(', ')}
                                      </div>
                                    )}
                                  </div>
                                  <span className="font-mono-num text-[#727272] shrink-0 ms-2">
                                    {(unitPriceWithMods * item.quantity).toFixed(2)} {t('common.egp')}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Financial calculations for this diner */}
                          <div className="pt-2 border-t border-[#f0f0f0] space-y-1 text-xs">
                            <div className="flex justify-between text-[#727272]">
                              <span>{t('common.subtotal')}:</span>
                              <span className="font-mono-num">{group.subtotal.toFixed(2)} {t('common.egp')}</span>
                            </div>
                            <div className="flex justify-between text-[#727272]">
                              <span>{t('settlement.taxes14')}</span>
                              <span className="font-mono-num">{group.vatAmount.toFixed(2)} {t('common.egp')}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-[#262626] pt-1">
                              <span>{t('settlement.totalShare')}</span>
                              <span className="font-mono-num text-[#FF0055]">{group.total.toFixed(2)} {t('common.egp')}</span>
                            </div>
                          </div>

                          {/* Multi-Device Dynamic Actions */}
                          <div className="mt-3 pt-2">
                            {group.isPaid ? (
                              <div
                                className={`py-1.5 px-3 rounded-lg border text-center text-xs font-medium ${
                                  group.isDeparted
                                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                                    : 'bg-[#f9f9f9] border-[#e5e7eb] text-[#262626]'
                                }`}
                              >
                                <span>{group.isDeparted ? t('settlement.paidAndDeparted') : t('common.paid')} // </span>
                                <span className="font-mono-num font-bold">{group.total.toFixed(2)} {t('common.egp')}</span>
                                <span> {t('settlement.paidVia', { method: group.paymentRecord?.paymentMethod?.toUpperCase() || 'ONLINE' })}</span>
                              </div>
                            ) : group.isCurrentUser ? (
                              <button
                                type="button"
                                onClick={() => handlePayDinerShare(group.memberId, group.total)}
                                disabled={isProcessing}
                                className="min-h-[44px] w-full py-2.5 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-xs font-bold transition-colors btn-crimson-glow cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                              >
                                <span>{t('settlement.payMyShareBtn', { amount: group.total.toFixed(2) })}</span>
                                <DirectionalArrow className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <div className="space-y-1.5">
                                <div className="text-xs text-[#727272] flex items-center justify-between px-1">
                                  <span>{t('settlement.awaitingDinerPhone')}</span>
                                  <span className="font-mono-num font-bold text-[#FF0055]">{group.total.toFixed(2)} {t('common.egp')}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handlePayDinerShare(group.memberId, group.total)}
                                  disabled={isProcessing}
                                  className="min-h-[44px] w-full py-2 rounded-full bg-white hover:bg-[#f9f9f9] border border-[#e5e7eb] text-[#262626] text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1"
                                >
                                  <span>{t('settlement.coverForBtn', { name: group.name, amount: group.total.toFixed(2) })}</span>
                                  <DirectionalArrow className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {splitMode === 'equal' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#727272]">{t('settlement.dinersSharingBill')}</span>
                      <span className="text-sm font-mono-num font-bold text-[#FF0055]">
                        {equalSplitShares.length > 1 && equalSplitShares[0] !== equalSplitShares[equalSplitShares.length - 1]
                          ? `${equalSplitShares[0].toFixed(2)} - ${equalSplitShares[equalSplitShares.length - 1].toFixed(2)} ${t('common.egp')} ${t('settlement.perPerson')}`
                          : `${perPersonAmount.toFixed(2)} ${t('common.egp')} ${t('settlement.perPerson')}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {SPLIT_OPTIONS.map((num) => (
                        <button
                          key={num}
                          onClick={() => setSplitWays(num)}
                          data-ui-radius="8"
                          className={`min-h-[44px] min-w-[56px] px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 flex items-center justify-center ${
                            splitWays === num
                              ? 'bg-[#FF0055] text-white font-bold shadow-xs'
                              : 'bg-[#f9f9f9] hover:bg-[#f0f0f0] text-[#727272] border border-[#e5e7eb]'
                          }`}
                        >
                          {num === 1 ? t('settlement.onePayAll') : t('settlement.nWays', { count: num })}
                        </button>
                      ))}
                    </div>

                    {splitWays > 1 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {equalSplitShares.map((share, idx) => (
                          <span
                            key={`share-${idx}`}
                            className="px-2.5 py-1 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] text-xs font-mono-num text-[#262626]"
                          >
                            {t('settlement.dinerNumber', { num: idx + 1 })}{' '}
                            <span className="font-bold text-[#FF0055]">{share.toFixed(2)} {t('common.egp')}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {splitMode === 'itemized' && (
                  <div className="space-y-3 bg-[#f9f9f9] p-4 rounded-2xl border border-[#e5e7eb]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#262626]">{t('settlement.selectDishesConsumed')}</span>
                      <button
                        onClick={selectAllItems}
                        className="min-h-[44px] px-2 flex items-center text-xs text-[#FF0055] hover:underline cursor-pointer"
                      >
                        {t('settlement.selectAll')}
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {ticket.items.map((item) => {
                        const isSelected = selectedItemIds.includes(item.cartItemId);
                        const modTotal = item.selectedModifiers.reduce((mSum, m) => mSum + m.price, 0);
                        const itemPrice = (item.menuItem.basePrice + modTotal) * item.quantity;
                        const localDish = localizeDish(item.menuItem);

                        return (
                          <label
                            key={item.cartItemId}
                            className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-white border-[#FF0055] text-[#262626]'
                                : 'bg-white/60 border-[#e5e7eb] text-[#727272]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleItemSelection(item.cartItemId)}
                                className="accent-[#FF0055] rounded cursor-pointer"
                              />
                              <span>{item.quantity}x {localDish.name}</span>
                            </div>
                            <span className="font-mono-num font-bold">
                              {itemPrice.toFixed(2)} {t('common.egp')}
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-[#e5e7eb] flex items-center justify-between text-xs">
                      <span className="text-[#727272]">{t('settlement.yourShareInclVat')}</span>
                      <span className="font-mono-num font-bold text-[#FF0055]">
                        {itemizedTotal.toFixed(2)} {t('common.egp')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Payment Verification Method & Settle Action */}
                <div className="pt-4 border-t border-[#e5e7eb] space-y-4">
                  <div className="text-xs font-semibold text-[#262626]">
                    {t('settlement.selectPaymentVerificationMethod')}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setSelectedMethod('apple_pay')}
                      data-ui-radius="8"
                      className={`min-h-[56px] p-3 rounded-lg border text-center transition-colors cursor-pointer flex flex-col items-center justify-center ${
                        selectedMethod === 'apple_pay'
                          ? 'border-[#FF0055] bg-[#fff0f3] shadow-xs'
                          : 'border-[#e5e7eb] bg-white hover:bg-[#f9f9f9]'
                      }`}
                    >
                      <div className="text-xs sm:text-sm font-bold text-[#262626]">{t('cart.drawer.applePay')}</div>
                      <div className="text-[11px] text-[#949494] mt-0.5">{t('settlement.instantAuth')}</div>
                    </button>

                    <button
                      onClick={() => setSelectedMethod('card')}
                      data-ui-radius="8"
                      className={`min-h-[56px] p-3 rounded-lg border text-center transition-colors cursor-pointer flex flex-col items-center justify-center ${
                        selectedMethod === 'card'
                          ? 'border-[#FF0055] bg-[#fff0f3] shadow-xs'
                          : 'border-[#e5e7eb] bg-white hover:bg-[#f9f9f9]'
                      }`}
                    >
                      <div className="text-xs sm:text-sm font-bold text-[#262626]">{t('cart.drawer.card')}</div>
                      <div className="text-[11px] text-[#949494] mt-0.5">{t('cart.drawer.cardSub')}</div>
                    </button>

                    <button
                      onClick={() => setSelectedMethod('cashier')}
                      data-ui-radius="8"
                      className={`min-h-[56px] p-3 rounded-lg border text-center transition-colors cursor-pointer flex flex-col items-center justify-center ${
                        selectedMethod === 'cashier'
                          ? 'border-[#FF0055] bg-[#fff0f3] shadow-xs'
                          : 'border-[#e5e7eb] bg-white hover:bg-[#f9f9f9]'
                      }`}
                    >
                      <div className="text-xs sm:text-sm font-bold text-[#262626]">{t('settlement.cashierDesk')}</div>
                      <div className="text-[11px] text-[#949494] mt-0.5">{t('settlement.payAtDoor')}</div>
                    </button>
                  </div>

                  <button
                    onClick={handleSettleAction}
                    disabled={isProcessing}
                    data-ui-radius="999"
                    className="min-h-[44px] w-full py-3.5 px-4 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-sm font-bold transition-colors btn-crimson-glow active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 text-center shadow-xs"
                  >
                    {isProcessing ? (
                      <span>{t('settlement.authorizingTransaction')}</span>
                    ) : (
                      <>
                        <span>
                          {splitMode === 'by_diner'
                            ? t('settlement.settleRemainingBalanceBtn', { amount: remainingTableBalance.toFixed(2) })
                            : splitMode === 'equal'
                            ? t('settlement.settleEqualShareBtn', { amount: perPersonAmount.toFixed(2) })
                            : t('settlement.settleSelectedDishesBtn', { amount: itemizedTotal.toFixed(2) })}
                        </span>
                        <DirectionalArrow className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* POST-MEAL TIPPING & 5-STAR REVIEW (OUTSIDE PRINT AREA, WITH HAPPY YELLOW #FBBF24 STARS) */}
            {isVerifiedPaid && (
              <section className="no-print bg-white p-6 rounded-2xl border border-[#e5e7eb] shadow-xs">
                {!showRatingForm && !reviewSubmitted ? (
                  <div className="text-center py-2">
                    <button
                      onClick={() => setShowRatingForm(true)}
                      className="min-h-[44px] px-5 py-2.5 rounded-full bg-[#f9f9f9] hover:bg-[#f0f0f0] border border-[#e5e7eb] text-[#262626] text-sm font-bold transition-colors cursor-pointer inline-flex items-center justify-center"
                    >
                      {t('settlement.rateDiningExperienceBtn')}
                    </button>
                  </div>
                ) : !reviewSubmitted ? (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div className="text-center mb-3">
                      <h3 className="text-lg font-bold text-[#262626]">
                        {t('settlement.rateTitle')}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#727272]">
                        {t('settlement.rateSubtitle')}
                      </p>
                    </div>

                    {/* Star Rating (Happy Yellow #FBBF24) */}
                    <div className="flex items-center justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="min-w-[44px] min-h-[44px] p-2 flex items-center justify-center cursor-pointer transition-transform hover:scale-110 rounded-full"
                          aria-label={t('settlement.rateStarsAria', { count: star })}
                        >
                          <svg
                            className={`w-7 h-7 ${star <= rating ? 'text-[#FBBF24] fill-[#FBBF24]' : 'text-[#e5e7eb]'}`}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        </button>
                      ))}
                    </div>

                    {/* Optional Kitchen Gratuity */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-medium text-[#262626]">{t('settlement.optionalGratuity')}</span>
                        <span className="font-mono-num text-[#727272]">
                          {tipPercent}% ({tipAmount.toFixed(2)} {t('common.egp')})
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {TIP_PERCENTAGES.map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setTipPercent(pct)}
                            className={`min-h-[44px] py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-center ${
                              tipPercent === pct
                                ? 'bg-[#262626] text-white font-bold'
                                : 'bg-[#f9f9f9] border border-[#e5e7eb] text-[#727272] hover:bg-[#f0f0f0]'
                            }`}
                          >
                            {pct === 0 ? t('settlement.noTip') : `${pct}%`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={2}
                        placeholder={t('settlement.reviewCommentsPlaceholder')}
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#e5e7eb] focus:outline-none focus:border-[#FF0055]"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowRatingForm(false)}
                        className="min-h-[44px] px-4 py-2 rounded-full border border-[#e5e7eb] text-[#727272] text-xs hover:bg-[#f9f9f9] inline-flex items-center justify-center"
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        type="submit"
                        className="min-h-[44px] flex-1 py-2.5 rounded-full bg-[#262626] hover:bg-black text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-xs inline-flex items-center justify-center gap-1.5"
                      >
                        <span>{t('settlement.submitReviewBtn')}</span>
                        <DirectionalArrow className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#f9f9f9] border border-[#e5e7eb] text-center text-[#262626] text-sm font-bold">
                    {t('settlement.thankYouReview')}
                  </div>
                )}
              </section>
            )}

            {/* Prominent Loopback: Order Again (Maintains Table Session, Clears Cart) */}
            {isVerifiedPaid && (
              <div className="no-print p-6 rounded-2xl bg-[#fff0f3] border border-[#ffd1dc] text-center space-y-3 shadow-xs">
                <h3 className="text-base font-bold text-[#262626]">
                  {t('settlement.stillAtTableTitle', { table: ticket.tableNumber || activeTable || '' })}
                </h3>
                <p className="text-xs sm:text-sm text-[#727272] max-w-sm mx-auto">
                  {t('settlement.stillAtTableDesc')}
                </p>
                <div className="pt-1">
                  <button
                    onClick={handleOrderAgain}
                    className="min-h-[44px] w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#FF0055] hover:opacity-95 text-white font-bold text-sm btn-crimson-glow shadow-xs cursor-pointer transition-colors active:scale-[0.99] inline-flex items-center justify-center gap-2"
                  >
                    <span>{t('settlement.orderAnotherRoundBtn')}</span>
                    <DirectionalArrow className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right / End Column: Thermal Fiscal Receipt & Export Actions */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            {/* ONLY THIS DIV IS PRINTED (Perforated Thermal Ticket Container) */}
            <div
              id="printable-receipt"
              ref={receiptRef}
              className="thermal-ticket-light p-6 bg-white shadow-xs"
            >
              {/* Header Tear Band */}
              <div className="flex items-start justify-between pb-5 border-b border-[#e5e7eb] gap-4">
                <div className="min-w-0 flex-1">
                  <FlameLinkLogo size="md" />
                  <div className="text-xs text-[#727272] mt-1 leading-snug">
                    {t('settlement.officialEtaReceipt')}
                  </div>
                </div>

                <div className="shrink-0 text-end whitespace-nowrap">
                  <span className="text-xs text-[#949494] block">
                    {ticket.tableNumber ? `${t('common.table')} ${ticket.tableNumber}` : t('settlement.dineIn')}
                  </span>
                  <span className="text-base font-mono-num font-bold text-[#262626]" data-ui-number>
                    #<ThermalText text={ticket.id} durationMs={350} />
                  </span>
                </div>
              </div>

              {/* Notch Line Indicator */}
              <div className="py-2.5 my-1 thermal-tear-line flex items-center justify-between text-xs text-[#949494]">
                <span>{t('settlement.fiscalId')}</span>
                <span>{new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              {/* Itemized Line Items */}
              <div className="py-4 space-y-3 border-b border-[#e5e7eb]">
                <div className="text-xs font-medium text-[#949494]">
                  {t('settlement.itemizedOrderSummary')}
                </div>

                {ticket.items.map((item) => {
                  const itemModifiersTotal = item.selectedModifiers.reduce((sum, m) => sum + m.price, 0);
                  const unitPrice = item.menuItem.basePrice + itemModifiersTotal;
                  const lineTotal = unitPrice * item.quantity;
                  const localDish = localizeDish(item.menuItem);

                  return (
                    <div key={item.cartItemId} className="space-y-1">
                      <div className="flex items-start justify-between text-sm gap-2">
                        <div className="flex-1 min-w-0 pe-1">
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="font-mono-num font-bold text-[#262626] shrink-0" data-ui-number>
                              {item.quantity}x
                            </span>
                            <span className="text-[#262626] font-medium leading-snug">{localDish.name}</span>
                            {item.quantity > 1 && (
                              <span className="text-xs font-mono-num text-[#949494] shrink-0" data-ui-number>
                                @{unitPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          {item.addedBy && (
                            <div className="text-xs text-[#727272] mt-0.5">
                              {t('settlement.orderedBy', {
                                name: localizeMemberName(item.addedBy.name, item.addedBy.isHost),
                              })}
                            </div>
                          )}
                        </div>
                        <span className="shrink-0 font-mono-num font-bold text-[#262626] whitespace-nowrap pt-0.5" data-ui-number>
                          {lineTotal.toFixed(2)} {t('common.egp')}
                        </span>
                      </div>

                      {/* Modifiers List */}
                      {item.selectedModifiers.length > 0 && (
                        <div className="ps-6 space-y-0.5 text-xs text-[#727272]">
                          {item.selectedModifiers.map((m) => (
                            <div key={m.id} className="flex justify-between">
                              <span>+ {localizeModifier(item.menuItem.id, m.id, m.name)}</span>
                              <span className="font-mono-num" data-ui-number>+{m.price.toFixed(2)} {t('common.egp')}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Customer Notes */}
                      {item.notes && (
                        <div className="ps-6 text-xs italic text-[#949494]">
                          {t('settlement.noteLabel', { notes: item.notes })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Tax & Total Calculation */}
              <div className="py-4 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-[#727272]">
                  <span>{t('settlement.subtotalNetTax')}</span>
                  <span className="font-mono-num text-[#262626]" data-ui-number>{ticket.subtotal.toFixed(2)} {t('common.egp')}</span>
                </div>

                <div className="flex justify-between text-[#727272]">
                  <span>{t('settlement.taxesService14')}</span>
                  <span className="font-mono-num text-[#262626]" data-ui-number>{ticket.vatAmount.toFixed(2)} {t('common.egp')}</span>
                </div>

                <div className="pt-2 flex justify-between text-lg font-bold text-[#262626]">
                  <span>{t('settlement.grandTotal')}</span>
                  <span className="font-mono-num font-bold text-[#FF0055]" data-ui-number>{ticket.total.toFixed(2)} {t('common.egp')}</span>
                </div>

                {totalPaidShares > 0 && (
                  <div className="pt-2.5 mt-2 border-t border-dashed border-[#e5e7eb] space-y-1.5 text-xs">
                    <div className="text-[11px] uppercase text-[#727272] font-semibold tracking-wide">
                      {t('settlement.preSettledCompanionShares')}
                    </div>
                    {Object.values(ticket.paidDiners || {}).map((rec) => (
                      <div key={rec.memberId} className="flex justify-between text-[#262626]">
                        <span>
                          {t('settlement.lessSettledBy', {
                            name: localizeMemberName(rec.name, false),
                            method: rec.paymentMethod.replace('_', ' ').toUpperCase(),
                          })}
                        </span>
                        <span className="font-mono-num font-medium">-{rec.amount.toFixed(2)} {t('common.egp')}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm font-bold text-[#262626] pt-1.5 border-t border-[#e5e7eb]">
                      <span>{isVerifiedPaid ? t('settlement.balanceDue') : t('settlement.netBalanceDueHost')}</span>
                      <span className={`font-mono-num ${isVerifiedPaid ? 'text-[#262626]' : 'text-[#FF0055]'}`}>
                        {isVerifiedPaid ? `0.00 ${t('common.egp')}` : `${remainingTableBalance.toFixed(2)} ${t('common.egp')}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {isVerifiedPaid && (
                <div className="pt-4 border-t border-[#e5e7eb]">
                  <div className="p-3.5 rounded-2xl bg-[#f9f9f9] border border-[#e5e7eb] text-center space-y-1">
                    <div className="text-[#262626] font-bold text-xs sm:text-sm">
                      <ThermalText text={t('settlement.paidInFullVerified')} durationMs={350} />
                    </div>
                    <div className="text-xs text-[#727272]">
                      {t('settlement.authMethod', {
                        auth: `AUTH-${ticket.id.replace('ORD-', '99')}-01`,
                        method: ticket.paymentMethod?.replace('_', ' ').toUpperCase() || 'ONLINE',
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Print / Download / Share Actions Strip (NO-PRINT) */}
            <div className="no-print grid grid-cols-3 gap-2">
              <button
                onClick={() => window.print()}
                className="min-h-[44px] w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full border border-[#e5e7eb] bg-white text-xs font-medium text-[#262626] hover:bg-[#f9f9f9] transition-colors shadow-xs cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-[#727272] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                <span className="truncate">{t('settlement.printReceipt')}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="min-h-[44px] w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full border border-[#e5e7eb] bg-white text-xs font-medium text-[#262626] hover:bg-[#f9f9f9] transition-colors shadow-xs cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-[#727272] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span className="truncate">{t('settlement.downloadPdf')}</span>
              </button>

              <button
                onClick={handleSaveAsImage}
                className="min-h-[44px] w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full border border-[#e5e7eb] bg-white text-xs font-medium text-[#262626] hover:bg-[#f9f9f9] transition-colors shadow-xs cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-[#727272] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span className="truncate">{t('settlement.saveAsImage')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
