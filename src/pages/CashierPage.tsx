import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { PaymentMethod } from '../types/domain';
import { WorkstationBarrier } from '../components/layout/WorkstationBarrier';
import { useTranslation } from '../i18n';

const RESTAURANT_TABLES = ['T-01', 'T-02', 'T-03', 'T-04', 'T-05', 'T-06', 'T-08', 'T-12'];

type FilterTab = 'all' | 'waiting' | 'active' | 'cleared' | 'ledger';

export const CashierPage: React.FC = () => {
  const { t, localizeDish, localizeModifier } = useTranslation();

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
      <div className="flex-1 w-full bg-[#f9f9f9] min-h-screen pb-24" data-ui-container="cashier-station">
        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
          {/* Station Title & Daily Total Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-[#262626] tracking-tight">
                {t('cashier.title')}
              </h1>
              <p className="text-xs text-[#727272] mt-0.5">
                {t('cashier.subtitle')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white border border-[#e5e7eb] rounded-2xl flex items-center gap-3 shadow-xs">
                <span className="text-xs text-[#727272] font-medium">{t('cashier.verifiedToday')}</span>
                <span className="text-sm font-mono-num font-bold text-[#262626]">
                  {totalCollectedToday.toFixed(2)} {t('common.egp')}
                </span>
              </div>
            </div>
          </div>

          {/* KPI Telemetry Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#e5e7eb] shadow-xs">
              <span className="text-[11px] font-semibold text-[#727272]">{t('cashier.waitingForPayment')}</span>
              <div className="text-2xl font-mono-num font-bold text-[#FF0055] mt-1">
                {t('cashier.chitsCount', { count: pendingOrders.length })}
              </div>
              <div className="text-[12px] text-[#727272] mt-1">
                {t('cashier.pendingCashierStamp', {
                  amount: pendingOrders.reduce((s, o) => s + o.total, 0).toFixed(2),
                })}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e5e7eb] shadow-xs">
              <span className="text-[11px] font-semibold text-[#727272]">{t('cashier.verifiedFiredKds')}</span>
              <div className="text-2xl font-mono-num font-bold text-[#262626] mt-1">
                {t('cashier.ordersCount', { count: verifiedOrders.length })}
              </div>
              <div className="text-[12px] text-[#727272] mt-1">
                {t('cashier.cookingOrExpediting')}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e5e7eb] shadow-xs">
              <span className="text-[11px] font-semibold text-[#727272]">{t('cashier.activeDiningTables')}</span>
              <div className="text-2xl font-mono-num font-bold text-[#262626] mt-1">
                {t('cashier.tablesSeatedCount', {
                  count: Object.values(tableSessions).filter((s) => s.members.length > 0).length,
                })}
              </div>
              <div className="text-[12px] text-[#727272] mt-1">
                {t('cashier.realtimeSync')}
              </div>
            </div>
          </section>

          {/* Live Restaurant Tables Matrix & Search Filters */}
          <section className="bg-white p-6 rounded-2xl border border-[#e5e7eb] shadow-xs space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#262626]">{t('cashier.floorPlanMatrixTitle')}</h2>
                <p className="text-[13px] text-[#727272]">
                  {t('cashier.floorPlanMatrixSubtitle')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => addSampleOrder(selectedTableNum)}
                  className="px-3.5 py-1.5 rounded-full border border-[#ffd1dc] bg-[#fff0f3] text-[#FF0055] text-[12px] font-medium hover:bg-[#ffe0e8] transition-colors cursor-pointer"
                >
                  {t('cashier.testChitOnTable', { table: selectedTableNum })}
                </button>
              </div>
            </div>

            {/* Filter Tabs and Search Bar (Includes Audit Ledger tab) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[#e5e7eb]">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                    activeTab === 'all'
                      ? 'bg-[#262626] text-white'
                      : 'bg-[#f9f9f9] text-[#727272] hover:bg-[#e5e7eb]'
                  }`}
                >
                  {t('cashier.tabs.allTables', { count: RESTAURANT_TABLES.length })}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('waiting')}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
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
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
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
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                    activeTab === 'cleared'
                      ? 'bg-[#64748b] text-white'
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
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors cursor-pointer ${
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
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder={t('cashier.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full ps-8 pe-3 py-1.5 bg-[#f9f9f9] border border-[#e5e7eb] rounded-lg text-[12px] text-[#262626] focus:outline-hidden focus:border-[#FF0055]"
                />
                <svg
                  className="w-4 h-4 absolute start-2.5 top-2.5 text-[#727272]"
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

            {/* Disciplined Floor Plan Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {filteredTables.map((tableNum) => {
                const meta = getTableMeta(tableNum);
                const isSelected = selectedTableNum === tableNum;

                return (
                  <button
                    key={tableNum}
                    type="button"
                    onClick={() => setSelectedTableNum(tableNum)}
                    className={`p-3.5 rounded-2xl text-center transition-all cursor-pointer relative ${meta.badgeClass} ${
                      isSelected ? 'ring-2 ring-[#262626] ring-offset-2' : 'hover:scale-[1.02]'
                    }`}
                  >
                    <div className="text-xl font-mono-num font-bold">
                      {tableNum}
                    </div>
                    <div className="text-[11px] font-medium mt-1 truncate">
                      {meta.label}
                    </div>
                    {meta.amountText && (
                      <div className="text-[11px] font-mono-num font-bold mt-1 truncate">
                        {meta.amountText}
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
                    {t('cashier.tableDetailsTitle', { table: selectedTableNum })}
                  </h3>
                  <span className="text-[12px] text-[#727272]">
                    {t('cashier.statusLabel', { status: getTableMeta(selectedTableNum).label })}
                  </span>
                </div>

                {getTableMeta(selectedTableNum).status !== 'idle' && (
                  <button
                    type="button"
                    onClick={() => handleClearTable(selectedTableNum)}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-[#f9f9f9] hover:bg-red-50 hover:text-red-600 text-[#727272] transition-colors border border-[#e5e7eb] cursor-pointer"
                  >
                    {t('cashier.clearTableBtn')}
                  </button>
                )}
              </div>

              {/* PIN Code */}
              <div className="p-3 bg-[#f9f9f9] rounded-2xl border border-[#e5e7eb] flex items-center justify-between text-[13px]">
                <span className="text-[#727272]">{t('cashier.tablePinLabel')}</span>
                <span className="font-mono-num font-bold text-[#262626] tracking-widest text-[16px]">
                  {activeSession?.pin || '----'}
                </span>
              </div>

              {/* Seated Diners List with Independent Payment Status */}
              <div>
                <div className="text-[12px] font-semibold text-[#262626] mb-2">
                  {t('cashier.seatedDinersLabel', { count: activeSession?.members.length || 0 })}
                </div>

                {!activeSession || activeSession.members.length === 0 ? (
                  <div className="text-[13px] text-[#949494] py-4 text-center border border-dashed border-[#e5e7eb] rounded-2xl">
                    {t('cashier.tableCurrentlyCleared')}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeSession.members.map((m) => {
                      const dinerPayment = tableOrder?.paidDiners?.[m.id];
                      return (
                        <div
                          key={m.id}
                          className="p-2.5 rounded-lg bg-[#f9f9f9] border border-[#e5e7eb] flex items-center justify-between text-[13px]"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${dinerPayment ? 'bg-[#262626]' : 'bg-[#727272]'}`} />
                            <span className="font-medium text-[#262626]">{m.name}</span>
                            {m.isHost && (
                              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded-full bg-[#ffe0e8] text-[#FF0055] font-bold">
                                {t('common.host')}
                              </span>
                            )}
                          </div>

                          {dinerPayment ? (
                            <span className="text-[11px] text-[#262626] font-medium">
                              {t('cashier.paidAmount', { amount: dinerPayment.amount.toFixed(0) })}
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#727272]">
                              {m.isReadyToPay ? t('common.ready') : t('common.ordering')}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Active Order & Cashier Settlement Engine */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#e5e7eb] shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#e5e7eb]">
                <div>
                  <h3 className="text-lg font-bold text-[#262626]">
                    {t('cashier.settlementTerminalTitle', { table: selectedTableNum })}
                  </h3>
                  <span className="text-[12px] text-[#727272]">
                    {tableOrder
                      ? t('home.terminal.orderNumber', { id: tableOrder.id })
                      : t('cashier.noActiveOrderOnTable')}
                  </span>
                </div>

                {tableOrder && (
                  <div className="text-end">
                    {isOrderFullySettled ? (
                      <div>
                        <span className="text-[11px] text-[#262626] font-bold block">
                          {t('cashier.settledAndPaid')}
                        </span>
                        <span className="text-2xl font-mono-num font-bold text-[#262626]">
                          0.00 {t('common.egp')}
                        </span>
                        <span className="text-[11px] text-[#727272] block">
                          {t('cashier.paidInFullAmount', { amount: tableOrder.total.toFixed(2) })}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[11px] text-[#FF0055] font-bold block">
                          {t('cashier.balanceDueLabel')}
                        </span>
                        <span className="text-2xl font-mono-num font-bold text-[#FF0055]">
                          {remainingDue.toFixed(2)} {t('common.egp')}
                        </span>
                        {totalPaidOnline > 0 && (
                          <span className="text-[11px] text-[#262626] block">
                            {t('cashier.paidByCompanionsAmount', { amount: totalPaidOnline.toFixed(2) })}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!tableOrder ? (
                <div className="py-12 text-center text-[#727272]">
                  <div className="w-12 h-12 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] flex items-center justify-center mx-auto mb-2 text-[#727272]">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                  </div>
                  <div className="text-[14px] font-medium text-[#262626]">
                    {t('cashier.noActiveChitTitle', { table: selectedTableNum })}
                  </div>
                  <p className="text-[12px] mt-1 max-w-sm mx-auto">
                    {t('cashier.noActiveChitDesc')}
                  </p>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => addSampleOrder(selectedTableNum)}
                      className="px-4 py-2 rounded-full bg-[#262626] text-white text-[12px] font-medium hover:bg-black transition-colors shadow-xs cursor-pointer"
                    >
                      {t('cashier.addTestOrderOnTable', { table: selectedTableNum })}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Visual State Banner */}
                  {isOrderFullySettled ? (
                    <div className="p-3.5 rounded-2xl bg-[#f9f9f9] border border-[#e5e7eb] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-[#262626] uppercase block">
                          {t('cashier.verifiedPaidCookingBanner')}
                        </span>
                        <span className="text-[13px] text-[#262626] font-medium">
                          {t('cashier.chitPaidVia', {
                            chit: tableOrder.cashierChitCode || tableOrder.id,
                            method: tableOrder.paymentMethod?.toUpperCase() || 'POS',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenReceipt(tableOrder.id)}
                          className="px-3.5 py-1.5 bg-white border border-[#e5e7eb] hover:bg-[#f9f9f9] text-[#262626] rounded-full text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          {t('cashier.printThermalChitBtn')}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenVoidModal(tableOrder.id)}
                          className="px-3.5 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-full text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          {t('cashier.voidRefundBtn')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-[#fff0f3] border border-[#ffd1dc] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-semibold text-[#FF0055] uppercase block">
                          {t('cashier.waitingRegisterSettlementBanner')}
                        </span>
                        <span className="text-[13px] text-[#262626] font-medium">
                          {t('common.chit')} #{tableOrder.cashierChitCode || tableOrder.id}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenReceipt(tableOrder.id)}
                          className="px-3 py-1 bg-white border border-[#e5e7eb] hover:bg-[#f9f9f9] text-[#262626] rounded-full text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          {t('cashier.printChitBtn')}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenVoidModal(tableOrder.id)}
                          className="px-3 py-1 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-full text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          {t('cashier.voidOrderBtn')}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Line Items List with Member Attribution and Payment Tag */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pe-1">
                    {tableOrder.items.map((item, idx) => {
                      const memberId = item.addedBy?.memberId;
                      const isItemPaid = memberId && tableOrder.paidDiners?.[memberId];
                      const localDish = localizeDish(item.menuItem);

                      return (
                        <div
                          key={item.cartItemId || idx}
                          className="flex justify-between text-[13px] py-1 border-b border-[#f0f0f0]"
                        >
                          <span className="text-[#262626] flex items-center flex-wrap gap-1">
                            <strong className="font-mono-num font-bold text-[#111827] me-1">
                              {item.quantity}x
                            </strong>
                            <span>{localDish.name}</span>
                            {item.selectedModifiers.length > 0 && (
                              <span className="text-[11px] text-[#727272]">
                                (+{item.selectedModifiers.map((m) => localizeModifier(item.menuItem.id, m.id, m.name)).join(', ')})
                              </span>
                            )}
                            {item.addedBy && (
                              <span className="text-[11px] text-[#727272]">
                                ({item.addedBy.name})
                              </span>
                            )}
                            {isItemPaid && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-[#f9f9f9] text-[#262626] border border-[#e5e7eb] rounded-full font-medium">
                                {t('cashier.paidOnlineBadge')}
                              </span>
                            )}
                          </span>
                          <span className="font-mono-num font-medium text-[#262626]">
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
                  <div className="pt-2 border-t border-[#e5e7eb] space-y-1 text-[12px]">
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
                    <div className="flex justify-between text-[14px] font-bold text-[#262626] pt-1 border-t border-[#e5e7eb]">
                      <span>{t('cashier.totalBill')}</span>
                      <span className="font-mono-num text-[#262626]">
                        {tableOrder.total.toFixed(2)} {t('common.egp')}
                      </span>
                    </div>

                    {totalPaidOnline > 0 && (
                      <div className="flex justify-between text-[12px] text-[#15803d]">
                        <span>{t('cashier.lessSettledCompanions')}</span>
                        <span className="font-mono-num font-bold">
                          -{totalPaidOnline.toFixed(2)} {t('common.egp')}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-[15px] font-bold pt-1 border-t border-[#e5e7eb]">
                      <span className={isOrderFullySettled ? 'text-[#15803d]' : 'text-[#FF0055]'}>
                        {isOrderFullySettled ? t('cashier.netBalanceDue') : t('cashier.remainingBalanceDue')}
                      </span>
                      <span
                        className={`font-mono-num ${
                          isOrderFullySettled ? 'text-[#15803d]' : 'text-[#FF0055]'
                        }`}
                      >
                        {remainingDue.toFixed(2)} {t('common.egp')}
                      </span>
                    </div>
                  </div>

                  {/* Cashier Payment Action (Only if pending remaining balance) */}
                  {!isOrderFullySettled && (
                    <div className="pt-4 border-t border-[#e5e7eb] space-y-3">
                      <div className="text-[12px] font-medium text-[#262626]">{t('cashier.tenderMethod')}</div>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedMethod('card')}
                          className={`p-2 rounded-lg border text-center transition-all cursor-pointer text-[12px] font-medium ${
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
                          className={`p-2 rounded-lg border text-center transition-all cursor-pointer text-[12px] font-medium ${
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
                          className={`p-2 rounded-lg border text-center transition-all cursor-pointer text-[12px] font-medium ${
                            selectedMethod === 'apple_pay'
                              ? 'border-[#FF0055] bg-[#fff0f3] text-[#FF0055] font-bold'
                              : 'bg-[#f9f9f9] text-[#727272] border-[#e5e7eb]'
                          }`}
                        >
                          {t('cart.drawer.applePay')}
                        </button>
                      </div>

                      {/* Physical Cash Tender Quick Calculator */}
                      {selectedMethod === 'cashier' && (
                        <div className="p-3.5 bg-[#f9f9f9] rounded-2xl border border-[#e5e7eb] space-y-3">
                          <div className="flex items-center justify-between text-[12px]">
                            <span className="font-medium text-[#262626]">{t('cashier.cashTendered')}</span>
                            <span className="text-[11px] text-[#727272]">{t('cashier.quickBillPresets')}</span>
                          </div>

                          {/* Presets */}
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              onClick={() => setCashTendered(remainingDue.toFixed(2))}
                              className="px-2.5 py-1 bg-white hover:bg-[#e5e7eb] border border-[#e5e7eb] rounded-full text-[12px] font-bold text-[#262626] cursor-pointer"
                            >
                              {t('cashier.exactAmount', { amount: remainingDue.toFixed(0) })}
                            </button>
                            {['100', '200', '500', '1000'].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setCashTendered(preset)}
                                className="px-2.5 py-1 bg-white hover:bg-[#e5e7eb] border border-[#e5e7eb] rounded-full text-[12px] font-medium text-[#262626] cursor-pointer"
                              >
                                {preset}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const curr = parseFloat(cashTendered) || remainingDue;
                                setCashTendered((curr + 50).toString());
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-[#e5e7eb] border border-[#e5e7eb] rounded-full text-[12px] font-medium text-[#262626] cursor-pointer"
                            >
                              +50
                            </button>
                          </div>

                          <input
                            type="number"
                            value={cashTendered}
                            onChange={(e) => setCashTendered(e.target.value)}
                            placeholder={`e.g. ${Math.ceil(remainingDue / 100) * 100}`}
                            className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] bg-white font-mono-num text-[14px] text-[#262626] focus:outline-hidden focus:border-[#FF0055]"
                          />

                          {tenderedAmount > 0 && (
                            <div className="flex items-center justify-between text-[13px] pt-1 border-t border-[#e5e7eb]">
                              <span className="text-[#727272]">{t('cashier.changeDueToGuest')}</span>
                              <span className="font-mono-num font-bold text-[#262626] text-[16px]">
                                {changeDue.toFixed(2)} {t('common.egp')}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleConfirmPayment(tableOrder.id, tableOrder.cashierChitCode)}
                        className="w-full py-3.5 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-[14px] font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
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
          </section>

          {/* Global Pending Chits Queue */}
          <section className="bg-white p-6 rounded-2xl border border-[#e5e7eb] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#262626]">
                {t('cashier.unpaidChitsQueueTitle', { count: pendingOrders.length })}
              </h2>
              <span className="text-[12px] text-[#727272]">
                {t('cashier.realtimeRegisterQueue')}
              </span>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="p-6 text-center text-[#727272] bg-[#f9f9f9] rounded-2xl border border-[#e5e7eb]">
                {t('cashier.noUnpaidChitsPending')}
              </div>
            ) : (
              <div className="divide-y divide-[#e5e7eb]">
                {pendingOrders.map((order) => {
                  const paidOnline = Object.values(order.paidDiners || {}).reduce((s, d) => s + d.amount, 0);
                  const netDue = Math.max(0, Math.round((order.total - paidOnline) * 100) / 100);

                  return (
                    <div
                      key={order.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono-num font-bold text-[#262626] text-[15px]">
                            {t('common.chit')} #{order.cashierChitCode || order.id}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[#fff0f3] text-[#FF0055] text-[11px] font-semibold">
                            {t('common.table')} {order.tableNumber || 'Counter'}
                          </span>
                        </div>
                        <div className="text-[12px] text-[#727272] mt-0.5">
                          {order.items
                            .map((i) => `${i.quantity}x ${localizeDish(i.menuItem).name}`)
                            .join(', ')}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-end">
                          <span className="font-mono-num font-bold text-[#FF0055] text-[16px]">
                            {netDue.toFixed(2)} {t('common.egp')}
                          </span>
                          <span className="text-[10px] text-[#949494] block">{t('cashier.inclVat')}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenVoidModal(order.id)}
                          className="px-3 py-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          {t('cashier.voidBtn')}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleConfirmPayment(order.id, order.cashierChitCode)}
                          className="px-4 py-2 rounded-full bg-[#FF0055] text-white text-[12px] font-bold hover:opacity-95 transition-all cursor-pointer shadow-xs"
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

        {/* THERMAL RECEIPT MODAL WITH ETA TAX COMPLIANCE & PRINT CAPABILITY */}
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
                  LIVE KITCHEN (لايف كيتشن)
                </div>
                <div className="text-[11px] text-[#727272]">
                  {t('home.support.addressValue')}
                </div>
                <div className="text-[11px] text-[#727272]">
                  {t('cashier.etaReg')}
                </div>
                <div className="text-[10px] text-[#949494]">
                  {t('cashier.registerPass')}
                </div>
              </div>

              <div className="flex justify-between text-[#727272] text-[11px]">
                <span>{t('common.chit')}: #{receiptOrder.cashierChitCode || receiptOrder.id}</span>
                <span>{t('common.table')}: {receiptOrder.tableNumber || 'Counter'}</span>
              </div>
              <div className="text-[#727272] text-[11px]">
                {new Date(receiptOrder.createdAt).toLocaleDateString()} {new Date(receiptOrder.createdAt).toLocaleTimeString()}
              </div>

              {/* Receipt Items */}
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
                      {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                        <div className="ps-4 text-[10px] text-[#727272]">
                          + {item.selectedModifiers.map((m) => localizeModifier(item.menuItem.id, m.id, m.name)).join(', ')}
                        </div>
                      )}
                      {item.notes && (
                        <div className="ps-4 text-[10px] text-[#727272] italic">
                          &quot;{item.notes}&quot;
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
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

                {/* Companion online deductions */}
                {receiptOrder.paidDiners && Object.keys(receiptOrder.paidDiners).length > 0 && (
                  <div className="pt-1 border-t border-dashed border-[#e5e7eb] space-y-0.5 text-[#262626]">
                    {Object.values(receiptOrder.paidDiners).map((rec) => (
                      <div key={rec.memberId} className="flex justify-between">
                        <span>
                          {t('settlement.lessSettledBy', {
                            name: rec.name,
                            method: rec.paymentMethod.replace('_', ' ').toUpperCase(),
                          })}
                        </span>
                        <span>-{rec.amount.toFixed(2)} {t('common.egp')}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-[#262626] pt-0.5">
                      <span>{t('cashier.balanceSettledAtRegister')}</span>
                      <span>
                        {Math.max(
                          0,
                          receiptOrder.total -
                            Object.values(receiptOrder.paidDiners).reduce((s, d) => s + d.amount, 0)
                        ).toFixed(2)}{' '}
                        {t('common.egp')}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-[11px] text-[#727272] pt-1">
                  <span>{t('cashier.fiscalStatus')}</span>
                  <span className="font-bold text-[#15803d]">
                    {receiptOrder.isPaid ? t('cashier.paidInFullFiscalized') : t('cashier.awaitingPaymentStatus')}
                  </span>
                </div>
              </div>

              <div className="text-center pt-2 text-[10px] text-[#727272] border-t border-dashed border-[#262626]">
                {t('cashier.thankYouReceipt')}
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
                  onClick={() => {
                    window.print();
                  }}
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
