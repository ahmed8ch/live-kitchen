import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { PaymentMethod } from '../types/domain';
import { WorkstationBarrier } from '../components/layout/WorkstationBarrier';
import { useTranslation } from '../i18n';

const RESTAURANT_TABLES = ['T-01', 'T-02', 'T-03', 'T-04', 'T-05', 'T-06', 'T-08', 'T-12'];

type FilterTab = 'all' | 'waiting' | 'active' | 'cleared' | 'ledger';

export const CashierPage: React.FC = () => {
  const { t, localizeDish } = useTranslation();

  const orders = useAppStore((state) => state.orders);
  const tableSessions = useAppStore((state) => state.tableSessions);
  const verifyCashierPayment = useAppStore((state) => state.verifyCashierPayment);
  const clearTableSession = useAppStore((state) => state.clearTableSession);
  const voidOrder = useAppStore((state) => state.voidOrder);
  const deleteOrder = useAppStore((state) => state.deleteOrder);
  const addSampleOrder = useAppStore((state) => state.addSampleOrder);
  const showToast = useAppStore((state) => state.showToast);

  const voidReasons = [
    t('cashier.voidReasons.walkedOut'),
    t('cashier.voidReasons.duplicate'),
    t('cashier.voidReasons.outOfStock'),
    t('cashier.voidReasons.wrongTable'),
    t('cashier.voidReasons.declined'),
  ];

  const [selectedTableNum, setSelectedTableNum] = useState<string>('T-04');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);
  const [voidTargetOrderId, setVoidTargetOrderId] = useState<string | null>(null);
  const [selectedVoidReason, setSelectedVoidReason] = useState(voidReasons[0]);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptOrderId, setReceiptOrderId] = useState<string | null>(null);

  // Filter orders by payment verification status
  const pendingOrders = orders.filter((o) => o.paymentStatus === 'pending_verification' && o.status !== 'voided');
  const verifiedOrders = orders.filter((o) => o.paymentStatus === 'verified_paid' && o.status !== 'voided');
  const voidedOrders = orders.filter((o) => o.status === 'voided');
  const totalCollectedToday = verifiedOrders.reduce((sum, o) => sum + o.total, 0);

  // Active table metadata and order lookup
  const activeSession = tableSessions[selectedTableNum];
  const pendingForTable = pendingOrders.find((o) => o.tableNumber === selectedTableNum);
  const tableOrder =
    pendingForTable ||
    orders.find((o) => o.tableNumber === selectedTableNum && o.status !== 'served' && o.status !== 'voided');

  // Exact financial calculations taking companion settlements into account
  const paidDinersList = Object.values(tableOrder?.paidDiners || {});
  const totalPaidOnline = paidDinersList.reduce((sum, d) => sum + d.amount, 0);
  const isOrderFullySettled = tableOrder
    ? tableOrder.isPaid || tableOrder.paymentStatus === 'verified_paid'
    : false;
  const remainingDue = isOrderFullySettled
    ? 0
    : tableOrder
    ? Math.max(0, Math.round((tableOrder.total - totalPaidOnline) * 100) / 100)
    : 0;

  const tenderedAmount = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, Math.round((tenderedAmount - remainingDue) * 100) / 100);

  const localizeMemberName = (name?: string) => {
    if (!name) return t('common.guest');
    const cleaned = name.replace(/\s*\(Host\)$/i, '').trim();
    if (/^(table host|red panda|host)$/i.test(cleaned)) return t('common.tableHost');
    if (/^(companion guest|companion)$/i.test(cleaned)) return t('common.companion');
    return cleaned;
  };

  const getTableMeta = (tableNum: string) => {
    const session = tableSessions[tableNum];
    const pending = pendingOrders.find((o) => o.tableNumber === tableNum);

    if (pending) {
      const pendingPaidOnline = Object.values(pending.paidDiners || {}).reduce((s, d) => s + d.amount, 0);
      const pendingRemaining = Math.max(0, Math.round((pending.total - pendingPaidOnline) * 100) / 100);

      return {
        status: 'waiting_for_payment' as const,
        label: t('cashier.tableStatus.waitingPayment'),
        badgeClass: 'bg-[#fff0f3] text-[#FF0055] border-[#ffd1dc] border',
        amountText: t('cashier.tableStatus.egpDue', { amount: pendingRemaining.toFixed(0) }),
        orderId: pending.id,
        chitCode: pending.cashierChitCode,
      };
    }

    const activeCookingOrder = orders.find(
      (o) =>
        o.tableNumber === tableNum &&
        o.paymentStatus === 'verified_paid' &&
        o.status !== 'served' &&
        o.status !== 'voided'
    );
    if (activeCookingOrder) {
      const isReady = activeCookingOrder.status === 'ready';
      return {
        status: 'paid_cooking' as const,
        label: isReady ? t('cashier.tableStatus.readyAtPass') : t('cashier.tableStatus.cookingOnLine'),
        badgeClass: isReady
          ? 'bg-[#f9f9f9] text-[#262626] border-[#262626] border'
          : 'bg-[#f9f9f9] text-[#262626] border-[#e5e7eb] border',
        amountText: t('cashier.tableStatus.settled'),
        orderId: activeCookingOrder.id,
        chitCode: activeCookingOrder.cashierChitCode,
      };
    }

    if (session && session.members.length > 0) {
      return {
        status: 'ordering' as const,
        label: t('cashier.tableStatus.dinersCount', { count: session.members.length }),
        badgeClass: 'bg-[#fffbeb] text-[#b45309] border-[#fde68a] border',
        amountText: t('cashier.tableStatus.browsing'),
        orderId: undefined,
        chitCode: undefined,
      };
    }

    return {
      status: 'idle' as const,
      label: t('cashier.tableStatus.available'),
      badgeClass: 'bg-[#f9f9f9] text-[#727272] border-[#e5e7eb] border',
      amountText: undefined,
      orderId: undefined,
      chitCode: undefined,
    };
  };

  // Filtered tables based on tabs and search query
  const filteredTables = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return RESTAURANT_TABLES.filter((tableNum) => {
      const meta = getTableMeta(tableNum);

      if (activeTab === 'waiting' && meta.status !== 'waiting_for_payment') return false;
      if (activeTab === 'active' && meta.status !== 'paid_cooking') return false;
      if (activeTab === 'cleared' && meta.status !== 'idle') return false;

      if (q) {
        const matchesTable = tableNum.toLowerCase().includes(q);
        const matchesChit = meta.chitCode?.toLowerCase().includes(q);
        const matchesOrder = meta.orderId?.toLowerCase().includes(q);
        return matchesTable || matchesChit || matchesOrder;
      }
      return true;
    });
  }, [activeTab, searchQuery, orders, tableSessions, t]);

  const handleConfirmPayment = (orderId: string, chitCode?: string) => {
    if (selectedMethod === 'cashier' && cashTendered.trim() !== '' && tenderedAmount < remainingDue) {
      showToast(
        t('cashier.tenderedLessToast', {
          tendered: tenderedAmount.toFixed(2),
          due: remainingDue.toFixed(2),
        })
      );
      return;
    }
    verifyCashierPayment(orderId, selectedMethod);
    setCashTendered('');
    showToast(t('cashier.paymentConfirmedToast', { chit: chitCode || orderId }));
  };

  const handleClearTable = (tableNum: string) => {
    clearTableSession(tableNum);
    showToast(t('cashier.tableClearedToast', { table: tableNum }));
  };

  const handleOpenVoidModal = (orderId: string) => {
    setVoidTargetOrderId(orderId);
    setSelectedVoidReason(voidReasons[0]);
    setIsVoidModalOpen(true);
  };

  const handleConfirmVoid = () => {
    if (!voidTargetOrderId) return;
    voidOrder(voidTargetOrderId, selectedVoidReason);
    setIsVoidModalOpen(false);
    setVoidTargetOrderId(null);
  };

  const handleOpenReceipt = (orderId: string) => {
    setReceiptOrderId(orderId);
    setIsReceiptModalOpen(true);
  };

  const receiptOrder = orders.find((o) => o.id === receiptOrderId) || tableOrder;

  return (
    <WorkstationBarrier
      portalName={t('cashier.portalName')}
      portalCode="POS-FRONT-01"
      stationRole={t('cashier.stationRole')}
      description={t('cashier.portalDesc')}
    >
      <div className="flex-1 w-full bg-[#f9f9f9] min-h-screen pb-16" data-ui-container="cashier-station">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
          {/* Compact Single-Row Header + Inline Telemetry Strip */}
          <div className="bg-white p-4 rounded-2xl border border-[#e5e7eb] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center justify-between lg:justify-start gap-4">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-[#262626] tracking-tight">
                  {t('cashier.title')}
                </h1>
                <p className="text-xs text-[#727272]">
                  {t('cashier.subtitle')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => addSampleOrder(selectedTableNum)}
                className="px-3.5 py-1.5 rounded-full border border-[#ffd1dc] bg-[#fff0f3] text-[#FF0055] text-xs font-bold hover:bg-[#ffe0e8] transition-colors cursor-pointer shrink-0"
              >
                {t('cashier.testChitOnTable', { table: selectedTableNum })}
              </button>
            </div>

            {/* Inline KPI Readouts */}
            <div className="grid grid-cols-3 gap-2.5 sm:flex sm:items-center">
              <div className="px-3.5 py-2 rounded-xl bg-[#fff0f3] border border-[#ffd1dc]">
                <span className="text-[10px] font-semibold text-[#727272] block">{t('cashier.waitingForPayment')}</span>
                <span className="text-sm font-mono-num font-bold text-[#FF0055]">
                  {t('cashier.chitsCount', { count: pendingOrders.length })}
                </span>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-[#f9f9f9] border border-[#e5e7eb]">
                <span className="text-[10px] font-semibold text-[#727272] block">{t('cashier.verifiedFiredKds')}</span>
                <span className="text-sm font-mono-num font-bold text-[#262626]">
                  {t('cashier.ordersCount', { count: verifiedOrders.length })}
                </span>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-[#f9f9f9] border border-[#e5e7eb]">
                <span className="text-[10px] font-semibold text-[#727272] block">{t('cashier.verifiedToday')}</span>
                <span className="text-sm font-mono-num font-bold text-[#262626]">
                  {totalCollectedToday.toFixed(0)} {t('common.egp')}
                </span>
              </div>
            </div>
          </div>

          {/* 2-Column Desktop POS Workspace (Left: Floor Matrix + Queue / Audit Ledger | Right: Active Register Terminal) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* LEFT / START 7 COLUMNS: Floor Plan Matrix & Queue / Audit Ledger */}
            <div className="lg:col-span-7 space-y-5">
              <section className="bg-white p-5 rounded-2xl border border-[#e5e7eb] space-y-4">
                {/* Filter Tabs and Search Bar (Includes Audit Ledger tab) */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-3 border-b border-[#e5e7eb]">
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setActiveTab('all')}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                        activeTab === 'all'
                          ? 'bg-[#262626] text-white font-bold'
                          : 'bg-[#f9f9f9] text-[#727272] hover:bg-[#e5e7eb]'
                      }`}
                    >
                      {t('cashier.tabs.allTables', { count: RESTAURANT_TABLES.length })}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('waiting')}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                        activeTab === 'waiting'
                          ? 'bg-[#FF0055] text-white font-bold'
                          : 'bg-[#fff0f3] text-[#FF0055] hover:bg-[#ffd1dc]'
                      }`}
                    >
                      {t('cashier.tabs.waitingPayment', { count: pendingOrders.length })}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('active')}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                        activeTab === 'active'
                          ? 'bg-[#262626] text-white font-bold'
                          : 'bg-[#f9f9f9] text-[#727272] hover:bg-[#e5e7eb]'
                      }`}
                    >
                      {t('cashier.tabs.activeKitchen', {
                        count: verifiedOrders.filter((o) => o.status !== 'served').length,
                      })}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('cleared')}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                        activeTab === 'cleared'
                          ? 'bg-[#262626] text-white font-bold'
                          : 'bg-[#f9f9f9] text-[#727272] hover:bg-[#e5e7eb]'
                      }`}
                    >
                      {t('cashier.tabs.cleared')}
                    </button>
                    {/* AuditLedger Tab */}
                    <button
                      type="button"
                      data-tab="audit-ledger"
                      onClick={() => setActiveTab('ledger')}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                        activeTab === 'ledger'
                          ? 'bg-[#262626] text-white font-bold'
                          : 'bg-[#f9f9f9] text-[#727272] hover:bg-[#e5e7eb]'
                      }`}
                    >
                      {t('cashier.tabs.auditLedger', {
                        count: orders.filter((o) => o.status === 'voided' || o.paymentStatus === 'verified_paid').length,
                      })}
                    </button>
                  </div>

                  {/* Quick Search Input */}
                  <div className="relative w-full sm:w-48 shrink-0">
                    <input
                      type="text"
                      placeholder={t('cashier.searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full ps-8 pe-3 py-1.5 bg-[#f9f9f9] border border-[#e5e7eb] rounded-lg text-xs text-[#262626] focus:outline-hidden focus:border-[#FF0055]"
                    />
                    <svg
                      className="w-3.5 h-3.5 absolute start-2.5 top-2 text-[#727272]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                </div>

                {/* Audit Ledger View when activeTab === 'ledger' */}
                {activeTab === 'ledger' ? (
                  <div className="space-y-2.5 max-h-80 overflow-y-auto">
                    {orders
                      .filter((o) => o.status === 'voided' || o.paymentStatus === 'verified_paid')
                      .map((ord) => (
                        <div
                          key={ord.id}
                          className="p-3 rounded-xl bg-[#f9f9f9] border border-[#e5e7eb] flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono-num font-bold text-[#262626]">#{ord.id}</span>
                              <span className="text-[#727272]">{ord.tableNumber || 'Counter'}</span>
                              {ord.status === 'voided' ? (
                                <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold">
                                  VOIDED
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-white text-[#262626] border border-[#e5e7eb] text-[10px] font-bold">
                                  {t('common.paid')}
                                </span>
                              )}
                            </div>
                            {ord.voidReason && (
                              <div className="text-[11px] text-red-600 mt-0.5">{ord.voidReason}</div>
                            )}
                          </div>
                          <span className="font-mono-num font-bold text-[#262626]">
                            {ord.total.toFixed(2)} {t('common.egp')}
                          </span>
                        </div>
                      ))}
                    {voidedOrders.length === 0 && verifiedOrders.length === 0 && (
                      <div className="p-6 text-center text-xs text-[#727272]">
                        {t('cashier.noUnpaidChitsPending')}
                      </div>
                    )}
                  </div>
                ) : (
                  /* 4x2 Floor Plan Matrix */
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {filteredTables.map((tableNum) => {
                      const meta = getTableMeta(tableNum);
                      const isSelected = selectedTableNum === tableNum;

                      return (
                        <button
                          key={tableNum}
                          type="button"
                          onClick={() => setSelectedTableNum(tableNum)}
                          className={`p-3 rounded-2xl text-center transition-all cursor-pointer relative ${meta.badgeClass} ${
                            isSelected ? 'ring-2 ring-[#262626] ring-offset-1' : 'hover:border-[#262626]'
                          }`}
                        >
                          <div className="text-lg font-mono-num font-bold">
                            {tableNum}
                          </div>
                          <div className="text-[11px] font-medium mt-0.5 truncate">
                            {meta.label}
                          </div>
                          {meta.amountText && (
                            <div className="text-[11px] tabular-nums font-bold mt-0.5 truncate">
                              {meta.amountText}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Unpaid Chits Queue */}
              <section className="bg-white p-5 rounded-2xl border border-[#e5e7eb] space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-[#262626]">
                    {t('cashier.unpaidChitsQueueTitle', { count: pendingOrders.length })}
                  </h2>
                  <span className="text-[11px] text-[#727272]">
                    {t('cashier.realtimeRegisterQueue')}
                  </span>
                </div>

                {pendingOrders.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#727272] bg-[#f9f9f9] rounded-xl border border-[#e5e7eb]">
                    {t('cashier.noUnpaidChitsPending')}
                  </div>
                ) : (
                  <div className="divide-y divide-[#e5e7eb] max-h-64 overflow-y-auto">
                    {pendingOrders.map((order) => {
                      const paidOnline = Object.values(order.paidDiners || {}).reduce((s, d) => s + d.amount, 0);
                      const netDue = Math.max(0, Math.round((order.total - paidOnline) * 100) / 100);

                      return (
                        <div
                          key={order.id}
                          className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="tabular-nums font-bold text-[#262626] text-xs">
                                {t('common.chit')} #{order.cashierChitCode || order.id}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-[#fff0f3] text-[#FF0055] text-[10px] font-semibold">
                                {t('common.table')} {order.tableNumber || 'Counter'}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#727272] mt-0.5 truncate max-w-sm">
                              {order.items
                                .map((i) => `${i.quantity}x ${localizeDish(i.menuItem).name}`)
                                .join(', ')}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono-num font-bold text-[#FF0055] text-sm">
                              {netDue.toFixed(2)} {t('common.egp')}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleOpenVoidModal(order.id)}
                              className="px-2.5 py-1 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-medium transition-colors cursor-pointer"
                            >
                              {t('cashier.voidBtn')}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleConfirmPayment(order.id, order.cashierChitCode)}
                              className="px-3.5 py-1.5 rounded-full bg-[#FF0055] text-white text-[11px] font-bold hover:opacity-95 transition-all cursor-pointer"
                            >
                              {t('cashier.confirmPaymentBtn')}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* RIGHT / END 5 COLUMNS: Sticky Selected Table Register & Settlement Terminal */}
            <div className="lg:col-span-5 lg:sticky lg:top-20 bg-white p-5 rounded-2xl border border-[#e5e7eb] space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-[#e5e7eb]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#262626]">
                      {t('cashier.settlementTerminalTitle', { table: selectedTableNum })}
                    </h3>
                    {getTableMeta(selectedTableNum).status !== 'idle' && (
                      <button
                        type="button"
                        onClick={() => handleClearTable(selectedTableNum)}
                        className="px-2 py-0.5 text-[10px] rounded-full bg-[#f9f9f9] hover:bg-red-50 hover:text-red-600 text-[#727272] transition-colors border border-[#e5e7eb] cursor-pointer"
                      >
                        {t('cashier.clearTableBtn')}
                      </button>
                    )}
                  </div>
                  <span className="text-xs text-[#727272]">
                    {tableOrder
                      ? `#${tableOrder.cashierChitCode || tableOrder.id}`
                      : t('cashier.noActiveOrderOnTable')}
                  </span>
                </div>

                {tableOrder && (
                  <div className="text-end">
                    <span className="text-[10px] font-bold uppercase text-[#727272] block">
                      {isOrderFullySettled ? t('cashier.settledAndPaid') : t('cashier.balanceDueLabel')}
                    </span>
                    <span className={`text-xl font-mono-num font-bold ${isOrderFullySettled ? 'text-[#262626]' : 'text-[#FF0055]'}`}>
                      {remainingDue.toFixed(2)} {t('common.egp')}
                    </span>
                  </div>
                )}
              </div>

              {/* Seated Diners Compact Pills */}
              {activeSession && activeSession.members.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pb-2 border-b border-[#f0f0f0]">
                  <span className="text-[11px] font-semibold text-[#727272]">
                    {t('cashier.seatedDinersLabel', { count: activeSession.members.length })}:
                  </span>
                  {activeSession.members.map((m) => {
                    const dinerPayment = tableOrder?.paidDiners?.[m.id];
                    return (
                      <span
                        key={m.id}
                        className="px-2.5 py-0.5 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] text-[11px] text-[#262626] inline-flex items-center gap-1"
                      >
                        <span className="font-medium">{localizeMemberName(m.name)}</span>
                        {dinerPayment && (
                          <span className="tabular-nums text-[10px] font-bold text-[#15803d]">
                            ({dinerPayment.amount.toFixed(0)})
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              )}

              {!tableOrder ? (
                <div className="py-8 text-center text-[#727272] space-y-2">
                  <div className="text-xs font-medium text-[#262626]">
                    {t('cashier.noActiveChitTitle', { table: selectedTableNum })}
                  </div>
                  <button
                    type="button"
                    onClick={() => addSampleOrder(selectedTableNum)}
                    className="px-4 py-2 rounded-full bg-[#262626] text-white text-xs font-medium hover:bg-black transition-colors cursor-pointer"
                  >
                    {t('cashier.addTestOrderOnTable', { table: selectedTableNum })}
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {/* Action Strip: Print Chit & Void */}
                  <div className="flex items-center justify-between gap-2 bg-[#f9f9f9] p-2.5 rounded-xl border border-[#e5e7eb]">
                    <span className="text-[11px] font-bold text-[#262626]">
                      {isOrderFullySettled
                        ? t('cashier.verifiedPaidCookingBanner')
                        : t('cashier.waitingRegisterSettlementBanner')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenReceipt(tableOrder.id)}
                        className="px-2.5 py-1 bg-white border border-[#e5e7eb] hover:bg-[#f0f0f0] text-[#262626] rounded-full text-[11px] font-medium cursor-pointer"
                      >
                        {t('cashier.printChitBtn')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenVoidModal(tableOrder.id)}
                        className="px-2.5 py-1 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-full text-[11px] font-medium cursor-pointer"
                      >
                        {t('cashier.voidBtn')}
                      </button>
                    </div>
                  </div>

                  {/* Line Items List */}
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pe-1">
                    {tableOrder.items.map((item, idx) => {
                      const localDish = localizeDish(item.menuItem);
                      return (
                        <div
                          key={item.cartItemId || idx}
                          className="flex justify-between text-xs py-1 border-b border-[#f0f0f0] last:border-b-0"
                        >
                          <span className="text-[#262626]">
                            <strong className="font-mono-num font-bold me-1">{item.quantity}x</strong>
                            <span>{localDish.name}</span>
                          </span>
                          <span className="font-mono-num font-medium text-[#262626] shrink-0 ms-2">
                            {(
                              (item.menuItem.basePrice +
                                item.selectedModifiers.reduce((s, m) => s + m.price, 0)) *
                              item.quantity
                            ).toFixed(2)}{' '}
                            {t('common.egp')}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tax Breakdown */}
                  <div className="pt-2 border-t border-[#e5e7eb] space-y-1 text-xs">
                    <div className="flex justify-between text-[#727272]">
                      <span>{t('cashier.netSubtotal')}</span>
                      <span className="font-mono-num text-[#262626]">
                        {tableOrder.subtotal.toFixed(2)} {t('common.egp')}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#727272]">
                      <span>{t('cashier.taxes14')}</span>
                      <span className="font-mono-num text-[#262626]">
                        {tableOrder.vatAmount.toFixed(2)} {t('common.egp')}
                      </span>
                    </div>
                    {totalPaidOnline > 0 && (
                      <div className="flex justify-between text-[#15803d]">
                        <span>{t('cashier.lessSettledCompanions')}</span>
                        <span className="font-mono-num font-bold">
                          -{totalPaidOnline.toFixed(2)} {t('common.egp')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold pt-1 border-t border-[#e5e7eb]">
                      <span className="text-[#262626]">{t('cashier.remainingBalanceDue')}</span>
                      <span className="font-mono-num text-[#FF0055]">
                        {remainingDue.toFixed(2)} {t('common.egp')}
                      </span>
                    </div>
                  </div>

                  {/* Cashier Payment Action */}
                  {!isOrderFullySettled && (
                    <div className="pt-2 border-t border-[#e5e7eb] space-y-2.5">
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedMethod('card')}
                          className={`p-2 rounded-lg border text-center transition-all cursor-pointer text-xs font-medium ${
                            selectedMethod === 'card'
                              ? 'border-[#FF0055] bg-[#fff0f3] text-[#FF0055] font-bold'
                              : 'bg-[#f9f9f9] text-[#727272] border-[#e5e7eb]'
                          }`}
                        >
                          {t('cashier.visaMeezaPos')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedMethod('cashier')}
                          className={`p-2 rounded-lg border text-center transition-all cursor-pointer text-xs font-medium ${
                            selectedMethod === 'cashier'
                              ? 'border-[#FF0055] bg-[#fff0f3] text-[#FF0055] font-bold'
                              : 'bg-[#f9f9f9] text-[#727272] border-[#e5e7eb]'
                          }`}
                        >
                          {t('cashier.physicalCash')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedMethod('apple_pay')}
                          className={`p-2 rounded-lg border text-center transition-all cursor-pointer text-xs font-medium ${
                            selectedMethod === 'apple_pay'
                              ? 'border-[#FF0055] bg-[#fff0f3] text-[#FF0055] font-bold'
                              : 'bg-[#f9f9f9] text-[#727272] border-[#e5e7eb]'
                          }`}
                        >
                          {t('cart.drawer.applePay')}
                        </button>
                      </div>

                      {selectedMethod === 'cashier' && (
                        <div className="p-2.5 bg-[#f9f9f9] rounded-xl border border-[#e5e7eb] space-y-2">
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              onClick={() => setCashTendered(remainingDue.toFixed(2))}
                              className="px-2 py-0.5 bg-white border border-[#e5e7eb] rounded-full text-[11px] font-bold text-[#262626] cursor-pointer"
                            >
                              {t('cashier.exactAmount', { amount: remainingDue.toFixed(0) })}
                            </button>
                            {['100', '200', '500', '1000'].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setCashTendered(preset)}
                                className="px-2 py-0.5 bg-white border border-[#e5e7eb] rounded-full text-[11px] font-medium text-[#262626] cursor-pointer"
                              >
                                {preset}
                              </button>
                            ))}
                          </div>

                          <input
                            type="number"
                            value={cashTendered}
                            onChange={(e) => setCashTendered(e.target.value)}
                            placeholder={`e.g. ${Math.ceil(remainingDue / 100) * 100}`}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#e5e7eb] bg-white font-mono-num text-xs text-[#262626] focus:outline-hidden focus:border-[#FF0055]"
                          />

                          {tenderedAmount > 0 && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[#727272]">{t('cashier.changeDueToGuest')}</span>
                              <span className="font-mono-num font-bold text-[#262626]">
                                {changeDue.toFixed(2)} {t('common.egp')}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleConfirmPayment(tableOrder.id, tableOrder.cashierChitCode)}
                        className="w-full min-h-[44px] py-3 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>
                          {t('cashier.confirmCashierPaymentBtn', { amount: remainingDue.toFixed(2) })}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* VOID ORDER MODAL */}
        {isVoidModalOpen && voidTargetOrderId && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-white border border-[#e5e7eb] rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#e5e7eb]">
                <h3 className="text-[16px] font-bold text-red-600">
                  {t('cashier.voidModalTitle', { id: voidTargetOrderId })}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsVoidModalOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-[#727272] hover:text-[#262626] hover:bg-[#f9f9f9] cursor-pointer"
                  aria-label={t('common.closeDialog')}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <p className="text-[13px] text-[#727272]">
                {t('cashier.voidModalDesc')}
              </p>

              <div className="space-y-2">
                {voidReasons.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-[12px] cursor-pointer transition-colors ${
                      selectedVoidReason === reason
                        ? 'bg-red-50 border-red-300 text-red-900 font-medium'
                        : 'bg-[#f9f9f9] border-[#e5e7eb] text-[#262626]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="voidReason"
                      value={reason}
                      checked={selectedVoidReason === reason}
                      onChange={(e) => setSelectedVoidReason(e.target.value)}
                      className="accent-red-600"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#e5e7eb]">
                <button
                  type="button"
                  onClick={() => {
                    if (voidTargetOrderId) {
                      deleteOrder(voidTargetOrderId);
                      setIsVoidModalOpen(false);
                      setVoidTargetOrderId(null);
                    }
                  }}
                  className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-full text-[12px] font-medium transition-colors border border-transparent hover:border-red-200 cursor-pointer"
                >
                  {t('cashier.deletePermanentlyBtn')}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsVoidModalOpen(false)}
                    className="px-4 py-2 border border-[#e5e7eb] rounded-full text-[12px] font-medium text-[#727272] hover:bg-[#f9f9f9] cursor-pointer"
                  >
                    {t('common.cancel')}
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmVoid}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-[12px] font-bold shadow-xs cursor-pointer"
                  >
                    {t('cashier.confirmVoidOrderBtn')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* THERMAL RECEIPT MODAL */}
        {isReceiptModalOpen && receiptOrder && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45"
            role="dialog"
            aria-modal="true"
          >
            <div
              id="printable-receipt"
              className="bg-white border border-[#e5e7eb] rounded-2xl w-full max-w-sm p-6 shadow-xl space-y-4 font-mono-num text-[12px]"
            >
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-[#262626]">
                <div className="font-bold text-[16px] tracking-wider text-[#262626]">
                  FLAMELINK
                </div>
                <div className="text-[11px] text-[#727272]">
                  {t('home.support.addressValue')}
                </div>
                <div className="text-[11px] text-[#727272]">
                  {t('cashier.etaReg')}
                </div>
              </div>

              <div className="flex justify-between text-[#727272] text-[11px]">
                <span>{t('common.chit')}: #{receiptOrder.cashierChitCode || receiptOrder.id}</span>
                <span>{t('common.table')}: {receiptOrder.tableNumber || 'Counter'}</span>
              </div>

              <div className="py-2 border-y border-dashed border-[#262626] space-y-2">
                {receiptOrder.items.map((item, idx) => {
                  const modTotal = (item.selectedModifiers || []).reduce((s, m) => s + m.price, 0);
                  const itemTotal = (item.menuItem.basePrice + modTotal) * item.quantity;
                  const localDish = localizeDish(item.menuItem);
                  return (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {item.quantity}x {localDish.name}
                        </span>
                        <span>{itemTotal.toFixed(2)} {t('common.egp')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>{t('settlement.subtotalNetTax')}:</span>
                  <span>{receiptOrder.subtotal.toFixed(2)} {t('common.egp')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('settlement.taxesService14')}:</span>
                  <span>{receiptOrder.vatAmount.toFixed(2)} {t('common.egp')}</span>
                </div>
                <div className="flex justify-between font-bold text-[14px] text-[#262626] pt-1 border-t border-[#e5e7eb]">
                  <span>{t('cashier.totalBill')}</span>
                  <span>{receiptOrder.total.toFixed(2)} {t('common.egp')}</span>
                </div>
              </div>

              <div className="no-print flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="px-4 py-2 border border-[#e5e7eb] rounded-full text-[12px] font-sans text-[#727272] hover:bg-[#f9f9f9] cursor-pointer"
                >
                  {t('common.close')}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#262626] hover:bg-black text-white rounded-full text-[12px] font-sans font-medium cursor-pointer"
                >
                  {t('cashier.printChitBtn')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </WorkstationBarrier>
  );
};
