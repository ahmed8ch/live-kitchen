import React, { useState, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { PaymentMethod } from '../types/domain';
import { FlameLinkLogo } from '../components/ui/FlameLinkLogo';
import { ThermalText } from '../components/ui/ThermalText';

const SPLIT_OPTIONS = [1, 2, 3, 4, 5, 6, 8];
const TIP_PERCENTAGES = [0, 10, 12, 15];

export const SettlementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const orders = useAppStore((state) => state.orders);
  const activeOrderId = useAppStore((state) => state.activeOrderId);
  const payOrderOnline = useAppStore((state) => state.payOrderOnline);
  const payDinerShare = useAppStore((state) => state.payDinerShare);
  const verifyCashierPayment = useAppStore((state) => state.verifyCashierPayment);
  const submitMealReview = useAppStore((state) => state.submitMealReview);
  const orderAgain = useAppStore((state) => state.orderAgain);
  const activeTable = useAppStore((state) => state.activeTable);
  const currentMember = useAppStore((state) => state.currentMember);
  const companionMember = useAppStore((state) => state.companionMember);
  const showToast = useAppStore((state) => state.showToast);

  const receiptRef = useRef<HTMLDivElement>(null);

  const [splitMode, setSplitMode] = useState<'by_diner' | 'equal' | 'itemized'>('by_diner');
  const [splitWays, setSplitWays] = useState<number>(1);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('apple_pay');
  const [isProcessing, setIsProcessing] = useState(false);

  // Post-meal rating & tipping state (Happy Yellow #FBBF24)
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [tipPercent, setTipPercent] = useState<number>(10);
  const [feedback, setFeedback] = useState<string>('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Dynamic ticket lookup: by URL param, or current active order, or latest in store
  const ticket = id && id !== 'active'
    ? orders.find((o) => o.id === id)
    : activeOrderId
    ? orders.find((o) => o.id === activeOrderId)
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
        <h2 className="text-xl font-bold text-[#262626]">No Active Order Ticket</h2>
        <p className="mt-2 text-[#727272] text-[14px] max-w-sm mx-auto">
          Your table currently has no orders placed. Select dishes from the menu to start.
        </p>
        <div className="mt-6">
          <Link
            to={activeTable ? `/menu?table=${activeTable}` : '/menu'}
            data-ui-radius="999"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FF0055] text-white text-[13px] font-bold transition-all btn-crimson-glow shadow-xs"
          >
            <span>Open Menu -&gt;</span>
          </Link>
        </div>
      </div>
    );
  }

  const isVerifiedPaid = ticket.paymentStatus === 'verified_paid';

  // Dynamic grouping by seated diner who ordered each item
  const effectiveMember = currentMember || companionMember;
  const dinerGroups = useMemo(() => {
    const groups: Record<
      string,
      {
        memberId: string;
        name: string;
        isHost: boolean;
        isCurrentUser: boolean;
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
      const memberName = item.addedBy?.name || 'Table Diner';
      const isHost = item.addedBy?.isHost || false;

      if (!groups[memberId]) {
        groups[memberId] = {
          memberId,
          name: memberName,
          isHost,
          isCurrentUser: effectiveMember?.id === memberId,
          items: [],
          subtotal: 0,
          vatAmount: 0,
          total: 0,
          isPaid: Boolean(ticket.paidDiners?.[memberId]),
          paymentRecord: ticket.paidDiners?.[memberId],
        };
      }

      groups[memberId].items.push(item);
      const modTotal = item.selectedModifiers.reduce((mSum, m) => mSum + m.price, 0);
      groups[memberId].subtotal += (item.menuItem.basePrice + modTotal) * item.quantity;
    });

    Object.values(groups).forEach((g) => {
      g.subtotal = Math.round(g.subtotal * 100) / 100;
      g.vatAmount = Math.round(g.subtotal * 0.14 * 100) / 100;
      g.total = Math.round((g.subtotal + g.vatAmount) * 100) / 100;
    });

    return Object.values(groups);
  }, [ticket, effectiveMember]);

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
    const modTotal = item.selectedModifiers.reduce((mSum, m) => mSum + m.price, 0);
    return sum + (item.menuItem.basePrice + modTotal) * item.quantity;
  }, 0);
  const itemizedVat = Math.round(itemizedSubtotal * 0.14 * 100) / 100;
  const itemizedTotal = Math.round((itemizedSubtotal + itemizedVat) * 100) / 100;

  // Equal split calculation
  const perPersonAmount = Math.round((ticket.total / splitWays) * 100) / 100;

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
      showToast(`Share of ${amount.toFixed(2)} EGP paid successfully.`);
    }, 450);
  };

  const handleSettleOnline = () => {
    setIsProcessing(true);
    setTimeout(() => {
      payOrderOnline(ticket.id, selectedMethod, splitWays);
      setIsProcessing(false);
      showToast(`Order #${ticket.id} verified and paid in full.`);
    }, 500);
  };

  const handleSimulateCashierVerify = () => {
    verifyCashierPayment(ticket.id, 'card');
    showToast(`Cashier confirmed settlement for Chit #${ticket.cashierChitCode || ticket.id}.`);
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
    ctx.fillText('FlameLink e-Receipt', 20, 26);

    ctx.font = '12px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`#${ticket.id}`, width - 110, 26);

    // Body content
    ctx.font = '13px monospace';
    ctx.fillStyle = '#262626';
    ctx.fillText(`Table: ${ticket.tableNumber || 'Counter'}`, 20, 70);
    ctx.fillText(`Date: ${new Date(ticket.createdAt).toLocaleDateString()} ${new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 20, 90);
    ctx.fillText(`Status: ${isVerifiedPaid ? 'PAID IN FULL' : 'PENDING CASHIER'}`, 20, 110);

    let y = 140;
    ctx.fillText('----------------------------------------------------', 20, y);
    y += 20;

    ticket.items.forEach((item) => {
      ctx.fillText(`${item.quantity}x ${item.menuItem.name}`, 20, y);
      ctx.fillText(`${(item.menuItem.basePrice * item.quantity).toFixed(2)} EGP`, width - 110, y);
      y += 20;
    });

    ctx.fillText('----------------------------------------------------', 20, y);
    y += 20;

    ctx.fillText(`Subtotal: ${ticket.subtotal.toFixed(2)} EGP`, 20, y);
    y += 18;
    ctx.fillText(`14% VAT: ${ticket.vatAmount.toFixed(2)} EGP`, 20, y);
    y += 22;

    ctx.font = 'bold 15px monospace';
    ctx.fillStyle = '#FF0055';
    ctx.fillText(`Total Paid: ${ticket.total.toFixed(2)} EGP`, 20, y);

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `FlameLink-Receipt-${ticket.id}.png`;
    link.href = dataUrl;
    link.click();
    showToast(`Receipt #${ticket.id} saved as image.`);
  };

  return (
    <div className="flex-1 w-full bg-[#f9f9f9] py-8 sm:py-12 pb-32" data-ui-container="settlement-view">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        {/* Navigation Breadcrumb & Order Again Loopback (NO-PRINT) */}
        <div className="no-print flex items-center justify-between mb-6">
          <Link
            to={`/order/${ticket.id}`}
            className="inline-flex items-center gap-1.5 text-[13px] text-[#727272] hover:text-[#262626] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Back to Live Tracker</span>
          </Link>

          {/* Loopback: Order Again button */}
          <button
            onClick={handleOrderAgain}
            className="px-3.5 py-1.5 rounded-full bg-[#262626] hover:bg-black text-white text-[12px] font-bold transition-all cursor-pointer shadow-xs"
          >
            + Order Again
          </button>
        </div>

        {/* Cashier Chit Notice if payment is pending (NO-PRINT) */}
        {!isVerifiedPaid && (
          <div className="no-print mb-6 p-4 rounded-2xl bg-[#fff0f3] border-2 border-[#ffd1dc] space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ffe0e8] text-[#FF0055] text-[11px] font-mono-num font-bold">
                  <span>PAYMENT REQUIRED BEFORE COOKING</span>
                </div>
                <h3 className="text-lg font-bold text-[#262626] mt-1">
                  Chit #<ThermalText text={ticket.cashierChitCode || ticket.id} durationMs={300} />
                </h3>
                <p className="text-[13px] text-[#727272] mt-0.5">
                  Present this chit at the front register, or settle online below to fire order to kitchen line.
                </p>
              </div>

              <button
                onClick={handleSimulateCashierVerify}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#ffd1dc] hover:border-[#FF0055] text-[#FF0055] text-[11px] font-mono-num font-bold transition-colors cursor-pointer shadow-xs shrink-0"
                title="Simulate cashier desk payment confirmation"
              >
                Simulate Cashier Stamp
              </button>
            </div>
          </div>
        )}

        {/* ONLY THIS DIV IS PRINTED (Perforated Thermal Ticket Container) */}
        <div
          id="printable-receipt"
          ref={receiptRef}
          className="thermal-ticket-light p-6 sm:p-8 bg-white shadow-xs"
        >
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
                {ticket.tableNumber ? `Table ${ticket.tableNumber}` : 'Dine-In'}
              </span>
              <span className="text-[15px] font-mono-num font-bold text-[#262626]" data-ui-number>
                #<ThermalText text={ticket.id} durationMs={350} />
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
                      <span className="font-mono-num font-bold text-[#262626]" data-ui-number>
                        {item.quantity}x
                      </span>
                      <span className="text-[#262626] font-medium">{item.menuItem.name}</span>
                      {item.quantity > 1 && (
                        <span className="text-[12px] font-mono-num text-[#949494]" data-ui-number>
                          @{unitPrice.toFixed(2)}
                        </span>
                      )}
                      {item.addedBy && (
                        <span className="text-[11px] font-mono-num text-[#727272]">
                          ({item.addedBy.name})
                        </span>
                      )}
                    </div>
                    <span className="font-mono-num font-bold text-[#262626]" data-ui-number>
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
              <span>Taxes &amp; Service (14%)</span>
              <span className="font-mono-num text-[#262626]" data-ui-number>{ticket.vatAmount.toFixed(2)} EGP</span>
            </div>

            <div className="pt-2 flex justify-between text-[18px] font-bold text-[#262626]">
              <span>Grand Total</span>
              <span className="font-mono-num font-bold text-[#FF0055]" data-ui-number>{ticket.total.toFixed(2)} EGP</span>
            </div>
          </div>

          {/* ADVANCED BILL SPLITTING ENGINE (NO-PRINT) */}
          {!isVerifiedPaid && (
            <div className="no-print py-4 border-b border-[#e5e7eb] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-[#262626]">Split Bill Mode</span>
                <div className="flex items-center gap-1 bg-[#f9f9f9] p-0.5 rounded-lg border border-[#e5e7eb]">
                  <button
                    onClick={() => setSplitMode('by_diner')}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      splitMode === 'by_diner' ? 'bg-[#262626] text-white' : 'text-[#727272]'
                    }`}
                  >
                    Split by Diner
                  </button>
                  <button
                    onClick={() => setSplitMode('equal')}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      splitMode === 'equal' ? 'bg-[#262626] text-white' : 'text-[#727272]'
                    }`}
                  >
                    Equal Split
                  </button>
                  <button
                    onClick={() => {
                      setSplitMode('itemized');
                      if (selectedItemIds.length === 0) selectAllItems();
                    }}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      splitMode === 'itemized' ? 'bg-[#262626] text-white' : 'text-[#727272]'
                    }`}
                  >
                    Custom Dishes
                  </button>
                </div>
              </div>

              {/* SPLIT BY DINER (PAY FOR WHAT YOU ORDERED) */}
              {splitMode === 'by_diner' && (
                <div className="space-y-4">
                  {/* Table Balance Progress Banner */}
                  <div className="p-3.5 rounded-xl bg-[#f9f9f9] border border-[#e5e7eb] space-y-2">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-[#727272]">Remaining Table Balance:</span>
                      <span className="font-mono-num font-bold text-[#FF0055] text-[15px]">
                        {remainingTableBalance.toFixed(2)} EGP
                      </span>
                    </div>
                    <div className="w-full bg-[#e5e7eb] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#15803d] h-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, Math.round((totalPaidShares / ticket.total) * 100))}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono-num text-[#727272]">
                      <span>Settled: {totalPaidShares.toFixed(2)} EGP</span>
                      <span>Total: {ticket.total.toFixed(2)} EGP</span>
                    </div>
                  </div>

                  {/* Seated Diners Cards List */}
                  <div className="space-y-3">
                    {dinerGroups.map((group) => (
                      <div
                        key={group.memberId}
                        className={`p-4 rounded-xl border transition-all ${
                          group.isPaid
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-white border-[#e5e7eb] shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-[#f0f0f0]">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-[#262626]">
                              {group.name}
                            </span>
                            {group.isCurrentUser && (
                              <span className="px-2 py-0.5 rounded-full bg-[#FF0055]/10 text-[#FF0055] text-[10px] font-mono-num font-bold">
                                You
                              </span>
                            )}
                          </div>

                          {group.isPaid ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-mono-num font-bold">
                              PAID
                            </span>
                          ) : (
                            <span className="text-[11px] font-mono-num text-[#727272]">
                              {group.items.length} {group.items.length === 1 ? 'dish' : 'dishes'}
                            </span>
                          )}
                        </div>

                        {/* Diner's exact ordered items */}
                        <div className="py-2.5 space-y-1.5 text-[12px]">
                          {group.items.map((item) => (
                            <div key={item.cartItemId} className="flex justify-between text-[#262626]">
                              <span>{item.quantity}x {item.menuItem.name}</span>
                              <span className="font-mono-num text-[#727272]">
                                {(item.menuItem.basePrice * item.quantity).toFixed(2)} EGP
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Financial calculations for this diner */}
                        <div className="pt-2 border-t border-[#f0f0f0] space-y-1 text-[11px]">
                          <div className="flex justify-between text-[#727272]">
                            <span>Subtotal:</span>
                            <span className="font-mono-num">{group.subtotal.toFixed(2)} EGP</span>
                          </div>
                          <div className="flex justify-between text-[#727272]">
                            <span>Taxes (14%):</span>
                            <span className="font-mono-num">{group.vatAmount.toFixed(2)} EGP</span>
                          </div>
                          <div className="flex justify-between text-[13px] font-bold text-[#262626] pt-1">
                            <span>Total Share:</span>
                            <span className="font-mono-num text-[#FF0055]">{group.total.toFixed(2)} EGP</span>
                          </div>
                        </div>

                        {/* CTA or Paid Stamp */}
                        <div className="mt-3 pt-2">
                          {group.isPaid ? (
                            <div className="py-1.5 px-3 rounded-lg bg-emerald-100/70 border border-emerald-200 text-center text-emerald-800 text-[11px] font-mono-num font-bold">
                              PAID // {group.total.toFixed(2)} EGP via {group.paymentRecord?.paymentMethod?.toUpperCase() || 'ONLINE'}
                            </div>
                          ) : (
                            <button
                              onClick={() => handlePayDinerShare(group.memberId, group.total)}
                              disabled={isProcessing}
                              className="w-full py-2.5 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-[12px] font-bold transition-all btn-crimson-glow cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                            >
                              <span>Pay My Share ({group.total.toFixed(2)} EGP) -&gt;</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {splitMode === 'equal' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[#727272]">Diners sharing bill:</span>
                    <span className="text-[13px] font-mono-num font-bold text-[#FF0055]">
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
                            ? 'bg-[#FF0055] text-white font-bold shadow-xs'
                            : 'bg-[#f9f9f9] hover:bg-[#f0f0f0] text-[#727272] border border-[#e5e7eb]'
                        }`}
                      >
                        {num === 1 ? '1 Pay All' : `${num} Ways`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {splitMode === 'itemized' && (
                <div className="space-y-2.5 bg-[#f9f9f9] p-3 rounded-xl border border-[#e5e7eb]">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-medium text-[#262626]">Select Dishes You Consumed:</span>
                    <button
                      onClick={selectAllItems}
                      className="text-[11px] text-[#FF0055] hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {ticket.items.map((item) => {
                      const isSelected = selectedItemIds.includes(item.cartItemId);
                      const modTotal = item.selectedModifiers.reduce((mSum, m) => mSum + m.price, 0);
                      const itemPrice = (item.menuItem.basePrice + modTotal) * item.quantity;

                      return (
                        <label
                          key={item.cartItemId}
                          className={`flex items-center justify-between p-2 rounded-lg border text-[12px] transition-colors cursor-pointer ${
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
                            <span>{item.quantity}x {item.menuItem.name}</span>
                          </div>
                          <span className="font-mono-num font-bold">
                            {itemPrice.toFixed(2)} EGP
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-[#e5e7eb] flex items-center justify-between text-[12px]">
                    <span className="text-[#727272]">Your Share (incl. 14% VAT):</span>
                    <span className="font-mono-num font-bold text-[#FF0055]">
                      {itemizedTotal.toFixed(2)} EGP
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Settlement Status / Payment Action (NO-PRINT) */}
          <div className="pt-5">
            {isVerifiedPaid ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                <div className="text-emerald-800 font-bold text-[14px]">
                  <ThermalText text="PAID IN FULL // VERIFIED AT REGISTER" durationMs={350} />
                </div>
                <div className="text-[12px] font-mono-num text-emerald-700" data-ui-number>
                  Auth: #AUTH-{ticket.id.replace('ORD-', '99')}-01 • Method: {ticket.paymentMethod?.replace('_', ' ').toUpperCase()}
                </div>
              </div>
            ) : (
              <div className="no-print space-y-4">
                <div className="text-[12px] font-medium text-[#262626]">Select Payment Verification Method:</div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedMethod('apple_pay')}
                    data-ui-radius="8"
                    className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                      selectedMethod === 'apple_pay'
                        ? 'border-[#FF0055] bg-[#fff0f3] shadow-xs'
                        : 'border-[#e5e7eb] bg-white hover:bg-[#f9f9f9]'
                    }`}
                  >
                    <div className="text-[13px] font-bold text-[#262626]">Apple Pay</div>
                    <div className="text-[11px] text-[#949494] mt-0.5">Instant Auth</div>
                  </button>

                  <button
                    onClick={() => setSelectedMethod('card')}
                    data-ui-radius="8"
                    className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                      selectedMethod === 'card'
                        ? 'border-[#FF0055] bg-[#fff0f3] shadow-xs'
                        : 'border-[#e5e7eb] bg-white hover:bg-[#f9f9f9]'
                    }`}
                  >
                    <div className="text-[13px] font-bold text-[#262626]">Card</div>
                    <div className="text-[11px] text-[#949494] mt-0.5">Visa / Meeza</div>
                  </button>

                  <button
                    onClick={() => setSelectedMethod('cashier')}
                    data-ui-radius="8"
                    className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                      selectedMethod === 'cashier'
                        ? 'border-[#FF0055] bg-[#fff0f3] shadow-xs'
                        : 'border-[#e5e7eb] bg-white hover:bg-[#f9f9f9]'
                    }`}
                  >
                    <div className="text-[13px] font-bold text-[#262626]">Cashier Desk</div>
                    <div className="text-[11px] text-[#949494] mt-0.5">Pay at Door</div>
                  </button>
                </div>

                <button
                  onClick={handleSettleOnline}
                  disabled={isProcessing}
                  data-ui-radius="999"
                  className="w-full py-3.5 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-[14px] font-bold transition-all btn-crimson-glow active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <span>Authorizing Transaction...</span>
                  ) : (
                    <span>
                      {splitMode === 'by_diner'
                        ? `Settle Full Remaining Balance (${remainingTableBalance.toFixed(2)} EGP) ->`
                        : splitMode === 'equal'
                        ? `Settle Equal Share (${perPersonAmount.toFixed(2)} EGP / person) ->`
                        : `Settle Selected Dishes (${itemizedTotal.toFixed(2)} EGP) ->`}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* POST-MEAL TIPPING & 5-STAR REVIEW (OUTSIDE PRINT AREA, WITH HAPPY YELLOW #FBBF24 STARS) */}
        {isVerifiedPaid && (
          <section className="no-print mt-8 bg-white p-6 rounded-2xl border border-[#e5e7eb] shadow-xs">
            {!showRatingForm && !reviewSubmitted ? (
              <div className="text-center py-2">
                <button
                  onClick={() => setShowRatingForm(true)}
                  className="px-5 py-2.5 rounded-full bg-[#f9f9f9] hover:bg-[#f0f0f0] border border-[#e5e7eb] text-[#262626] text-[13px] font-bold transition-colors cursor-pointer"
                >
                  Rate Dining Experience & Tip Kitchen
                </button>
              </div>
            ) : !reviewSubmitted ? (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="text-center mb-3">
                  <h3 className="text-lg font-bold text-[#262626]">
                    Rate Your Flame Dining Experience
                  </h3>
                  <p className="text-[13px] text-[#727272]">
                    Feedback directly supports our wood-fire kitchen crew.
                  </p>
                </div>

                {/* Star Rating (Happy Yellow #FBBF24) */}
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                      aria-label={`Rate ${star} stars`}
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
                  <div className="flex items-center justify-between text-[12px] mb-2">
                    <span className="font-medium text-[#262626]">Optional Kitchen Gratuity</span>
                    <span className="font-mono-num text-[#727272]">
                      {tipPercent}% ({tipAmount.toFixed(2)} EGP)
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {TIP_PERCENTAGES.map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setTipPercent(pct)}
                        className={`py-1.5 rounded-lg text-[12px] font-mono-num transition-colors cursor-pointer ${
                          tipPercent === pct
                            ? 'bg-[#262626] text-white font-bold'
                            : 'bg-[#f9f9f9] border border-[#e5e7eb] text-[#727272] hover:bg-[#f0f0f0]'
                        }`}
                      >
                        {pct === 0 ? 'No Tip' : `${pct}%`}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={2}
                    placeholder="Kitchen notes or comments (optional)"
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#e5e7eb] focus:outline-none focus:border-[#FF0055]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRatingForm(false)}
                    className="px-4 py-2 rounded-full border border-[#e5e7eb] text-[#727272] text-[12px] hover:bg-[#f9f9f9]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-full bg-[#262626] hover:bg-black text-white text-[13px] font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    Submit Review & Gratuity -&gt;
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center text-emerald-800 text-[13px] font-bold">
                Thank you! Your review and gratuity have been credited to the kitchen team.
              </div>
            )}
          </section>
        )}

        {/* Prominent Loopback: Order Again (Maintains Table Session, Clears Cart) */}
        {isVerifiedPaid && (
          <div className="no-print mt-6 p-6 rounded-2xl bg-[#fff0f3] border-2 border-[#ffd1dc] text-center space-y-3 shadow-xs">
            <h3 className="text-base font-bold text-[#262626]">
              Still at Table {ticket.tableNumber || activeTable}?
            </h3>
            <p className="text-[13px] text-[#727272] max-w-sm mx-auto">
              Ready for another round? Order drinks, desserts, or extra plates without losing your table session.
            </p>
            <div className="pt-1">
              <button
                onClick={handleOrderAgain}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#FF0055] hover:opacity-95 text-white font-bold text-[14px] btn-crimson-glow shadow-md cursor-pointer transition-all active:scale-[0.99] inline-flex items-center justify-center gap-2"
              >
                <span>+ Order Another Round</span>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Print / Download / Share Actions Strip (NO-PRINT) */}
        <div className="no-print mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#e5e7eb] bg-white text-[13px] text-[#262626] hover:bg-[#f9f9f9] transition-colors shadow-xs cursor-pointer"
          >
            <svg className="w-4 h-4 text-[#727272]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            <span>Print Receipt</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#e5e7eb] bg-white text-[13px] text-[#262626] hover:bg-[#f9f9f9] transition-colors shadow-xs cursor-pointer"
          >
            <svg className="w-4 h-4 text-[#727272]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Download PDF</span>
          </button>

          <button
            onClick={handleSaveAsImage}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#e5e7eb] bg-white text-[13px] text-[#262626] hover:bg-[#f9f9f9] transition-colors shadow-xs cursor-pointer"
          >
            <svg className="w-4 h-4 text-[#727272]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>Save / Share as Image</span>
          </button>
        </div>
      </div>
    </div>
  );
};
