import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { PaymentMethod } from '../../types/domain';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const cart = useAppStore((state) => state.cart);
  const isCartDrawerOpen = useAppStore((state) => state.isCartDrawerOpen);
  const closeCartDrawer = useAppStore((state) => state.closeCartDrawer);
  const updateCartItemQuantity = useAppStore((state) => state.updateCartItemQuantity);
  const removeFromCart = useAppStore((state) => state.removeFromCart);
  const clearCart = useAppStore((state) => state.clearCart);
  const activeTable = useAppStore((state) => state.activeTable);
  const currentMember = useAppStore((state) => state.currentMember);
  const companionMember = useAppStore((state) => state.companionMember);
  const tableSessions = useAppStore((state) => state.tableSessions);
  const createOrder = useAppStore((state) => state.createOrder);
  const setMemberReadyToPay = useAppStore((state) => state.setMemberReadyToPay);
  const leaveTableSession = useAppStore((state) => state.leaveTableSession);
  const removeMemberFromTable = useAppStore((state) => state.removeMemberFromTable);

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('apple_pay');
  const [splitStrategy, setSplitStrategy] = useState<'host_pays_all' | 'split_by_diner' | 'equal_split'>('host_pays_all');
  const [showPaymentChoice, setShowPaymentChoice] = useState(false);

  if (!isCartDrawerOpen) {
    return null;
  }

  const session = activeTable ? tableSessions[activeTable] : null;

  // Clean persona isolation:
  // Route determines persona: /companion or /guest-order is Companion; /menu and default is Host.
  const isCompanionRoute =
    location.pathname.startsWith('/companion') ||
    location.pathname.startsWith('/guest-order') ||
    (typeof window !== 'undefined' &&
      (window.location.pathname.startsWith('/companion') || window.location.pathname.startsWith('/guest-order')));

  const isHost = !isCompanionRoute;
  const hostMember = session?.members?.find((m) => m.isHost) || (currentMember?.isHost ? currentMember : null);
  const effectiveMember = isHost
    ? (hostMember || currentMember)
    : (companionMember || currentMember);

  const members = session?.members || [];
  const readyMembersCount = members.filter((m) => m.isReadyToPay).length;

  const safeCart = cart || [];
  const subtotal = safeCart.reduce((sum, item) => {
    const modTotal = (item?.selectedModifiers || []).reduce((mSum, m) => mSum + (m?.price || 0), 0);
    const basePrice = item?.menuItem?.basePrice || 0;
    const qty = item?.quantity || 1;
    return sum + (basePrice + modTotal) * qty;
  }, 0);

  const vatAmount = Math.round(subtotal * 0.14 * 100) / 100;
  const total = Math.round((subtotal + vatAmount) * 100) / 100;

  // Group cart items by diner who added them
  const groupedCart = safeCart.reduce((acc, item) => {
    if (!item) return acc;
    const memberKey = item.addedBy?.memberId || 'unassigned';
    const memberName = item.addedBy?.name || 'Table Diner';
    if (!acc[memberKey]) {
      const isYou = isHost
        ? Boolean(item.addedBy?.isHost || (hostMember && memberKey === hostMember.id) || (currentMember?.isHost && memberKey === currentMember.id))
        : Boolean(effectiveMember && memberKey === effectiveMember.id);
      acc[memberKey] = {
        name: memberName,
        isYou,
        items: [],
      };
    }
    acc[memberKey].items.push(item);
    return acc;
  }, {} as Record<string, { name: string; isYou: boolean; items: typeof cart }>);

  const handleProceedToPayment = () => {
    if (cart.length === 0) return;
    setShowPaymentChoice(true);
  };

  const handleFinalizeCheckout = (method: PaymentMethod) => {
    const ticket = createOrder(method, splitStrategy);
    const query = activeTable ? `?table=${activeTable}` : '';
    navigate(`/settlement/${ticket.id}${query}`);
  };

  const handleToggleMyReady = () => {
    if (!activeTable || !effectiveMember) return;
    setMemberReadyToPay(activeTable, effectiveMember.id, !effectiveMember.isReadyToPay);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={closeCartDrawer}
    >
      <div
        data-ui-container="cart-drawer"
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#e5e7eb] animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#e5e7eb] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-medium text-[#262626]">Order Cart</h2>
            <span
              className="px-2 py-0.5 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] text-[12px] font-mono-num font-medium text-[#727272]"
              data-ui-number
            >
              {cart.reduce((s, i) => s + i.quantity, 0)} items
            </span>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && isHost && (
              <button
                onClick={clearCart}
                className="text-[12px] text-[#727272] hover:text-[#dc2626] px-2.5 py-1.5 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
              >
                Clear Cart
              </button>
            )}
            <button
              onClick={closeCartDrawer}
              className="min-w-[44px] min-h-[44px] rounded-full bg-[#f9f9f9] hover:bg-[#e5e7eb] flex items-center justify-center text-[#262626] transition-colors cursor-pointer"
              aria-label="Close cart drawer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Seating Banner (Clean & Functional with Host Reset Controls) */}
        {activeTable && (
          <div className="px-5 py-2.5 bg-[#fff0f3] border-b border-[#ffd1dc] flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-2">
              <span className="text-[#262626] font-bold">Table {activeTable}</span>
              <span className="text-[11px] font-mono-num text-[#727272]">
                {members.length > 0 ? `(${readyMembersCount}/${members.length} Ready)` : '(Shared Pool)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!isHost && currentMember && (
                <button
                  onClick={() => {
                    leaveTableSession(activeTable, currentMember.id);
                    closeCartDrawer();
                  }}
                  className="text-[11px] font-mono-num text-red-600 hover:underline cursor-pointer"
                >
                  Leave Table
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Cart Items List (Grouped by Diner) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-14 h-14 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] flex items-center justify-center text-[#949494] mb-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </div>
              <p className="text-[14px] font-medium text-[#262626]">Your cart is empty</p>
              <p className="text-[12px] text-[#727272] mt-1">Select dishes from the menu to start your order.</p>
            </div>
          ) : (
            Object.entries(groupedCart).map(([memberId, group]) => (
              <div key={memberId} className="space-y-3">
                {/* Group Heading */}
                <div className="flex items-center justify-between pb-1 border-b border-[#e5e7eb]">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF0055]" />
                    <span className="text-[12px] font-mono-num font-semibold text-[#262626] uppercase tracking-wider">
                      {group.isYou ? 'Your Items' : `${group.name}'s Items`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono-num text-[#727272]">
                      {group.items.reduce((s, i) => s + i.quantity, 0)} items
                    </span>
                    {isHost && !group.isYou && activeTable && (
                      <button
                        type="button"
                        onClick={() => removeMemberFromTable(activeTable, memberId)}
                        className="text-[10px] text-red-600 hover:underline cursor-pointer font-mono-num"
                        title="Remove member from table"
                      >
                        [Remove]
                      </button>
                    )}
                  </div>
                </div>

                {group.items.map((item) => {
                  const itemModifiersTotal = (item?.selectedModifiers || []).reduce((sum, m) => sum + (m?.price || 0), 0);
                  const basePrice = item?.menuItem?.basePrice || 0;
                  const itemUnitPrice = basePrice + itemModifiersTotal;
                  const qty = item?.quantity || 1;

                  return (
                    <div
                      key={item.cartItemId}
                      className="p-3 rounded-xl border border-[#e5e7eb] bg-white space-y-2.5 shadow-xs"
                    >
                      <div className="flex items-start gap-3">
                        {/* 48x48px Thumbnail (Fixes Image 5 flaw) */}
                        <img
                          src={item.menuItem.imageUrl}
                          alt={item.menuItem.name}
                          className="w-12 h-12 rounded-lg object-cover bg-[#f9f9f9] border border-[#e5e7eb] shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80';
                          }}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-[13px] text-[#262626] truncate">
                              {item.menuItem.name}
                            </h4>
                            <span className="font-mono-num font-medium text-[13px] text-[#262626] shrink-0" data-ui-number>
                              {(itemUnitPrice * qty).toFixed(2)} EGP
                            </span>
                          </div>

                          <div className="text-[11px] font-mono-num text-[#727272]" data-ui-number>
                            {itemUnitPrice.toFixed(2)} EGP each
                          </div>
                        </div>
                      </div>

                      {/* Modifiers */}
                      {(item.selectedModifiers || []).length > 0 && (
                        <div className="text-[11px] text-[#727272] space-y-0.5 pl-2 border-l border-[#e5e7eb]">
                          {item.selectedModifiers.map((m) => (
                            <div key={m.id} className="flex justify-between">
                              <span>+ {m.name}</span>
                              <span className="font-mono-num" data-ui-number>+{m.price.toFixed(2)} EGP</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Notes */}
                      {item.notes && (
                        <div className="text-[11px] italic text-[#949494] pl-2 border-l border-[#e5e7eb]">
                          "{item.notes}"
                        </div>
                      )}

                      {/* Quantity Adjustment Controls (Touchscreen >= 44x44px compliance) */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#f0f0f0]">
                        {isHost || group.isYou ? (
                          <>
                            <div className="flex items-center gap-1.5 border border-[#e5e7eb] rounded-full p-0.5 bg-[#f9f9f9]">
                              <button
                                onClick={() => updateCartItemQuantity(item.cartItemId, item.quantity - 1)}
                                className="min-w-[44px] min-h-[44px] rounded-full bg-white hover:bg-[#f0f0f0] border border-[#e5e7eb] flex items-center justify-center text-[#262626] cursor-pointer text-base font-bold transition-all active:scale-90 shadow-xs"
                                aria-label="Decrease quantity"
                              >
                                -
                              </button>
                              <span className="w-7 text-center font-mono-num font-bold text-[13px]" data-ui-number>
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateCartItemQuantity(item.cartItemId, item.quantity + 1)}
                                className="min-w-[44px] min-h-[44px] rounded-full bg-white hover:bg-[#f0f0f0] border border-[#e5e7eb] flex items-center justify-center text-[#262626] cursor-pointer text-base font-bold transition-all active:scale-90 shadow-xs"
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.cartItemId)}
                              className="min-h-[44px] px-3 inline-flex items-center text-[12px] font-medium text-[#727272] hover:text-[#dc2626] transition-colors cursor-pointer"
                            >
                              Remove
                            </button>
                          </>
                        ) : (
                          <div className="text-[11px] font-mono-num text-[#949494] py-1">
                            Chosen by {group.name} ({item.quantity}x)
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer Checkout Area */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-[#e5e7eb] bg-[#f9f9f9] space-y-4">
            <div className="space-y-1.5 text-[13px]">
              <div className="flex justify-between text-[#727272]">
                <span>Net Subtotal</span>
                <span className="font-mono-num text-[#262626]" data-ui-number>{subtotal.toFixed(2)} EGP</span>
              </div>
              <div className="flex justify-between text-[#727272]">
                <span>Taxes &amp; Fees (14%)</span>
                <span className="font-mono-num text-[#262626]" data-ui-number>{vatAmount.toFixed(2)} EGP</span>
              </div>
              <div className="flex justify-between text-[16px] font-medium text-[#262626] pt-1 border-t border-[#e5e7eb]">
                <span>Payable Total</span>
                <span className="font-mono-num font-medium text-[#FF0055]" data-ui-number>{total.toFixed(2)} EGP</span>
              </div>
            </div>

            {/* If user is Companion: NOT Host */}
            {!isHost ? (
              <div className="space-y-3 pt-1">
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-center space-y-1">
                  <div className="text-[12px] font-bold text-amber-900">
                    Waiting for Table Host to Finalize
                  </div>
                  <div className="text-[11px] text-amber-800">
                    Host ({session?.members.find((m) => m.isHost)?.name || 'Host'}) will review the table order and submit it to the kitchen.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleMyReady}
                  data-ui-radius="999"
                  className={`w-full py-3.5 rounded-full text-[13px] font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs ${
                    effectiveMember?.isReadyToPay
                      ? 'bg-[#15803d] text-white hover:bg-[#166534]'
                      : 'bg-[#FF0055] text-white hover:opacity-95 btn-crimson-glow'
                  }`}
                >
                  <span>
                    {effectiveMember?.isReadyToPay
                      ? 'Ready (Click to Keep Browsing)'
                      : 'I am Done Choosing (Notify Host) ->'}
                  </span>
                </button>
              </div>
            ) : showPaymentChoice ? (
              <div className="p-4 rounded-xl bg-white border border-[#e5e7eb] space-y-3 animate-in fade-in duration-150">
                {/* Split Strategy Choice */}
                <div>
                  <div className="text-[11px] font-mono-num font-bold uppercase tracking-wider text-[#727272] mb-1.5">
                    Table Payment Strategy
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => setSplitStrategy('host_pays_all')}
                      className={`p-2 rounded-lg border text-[11px] transition-all cursor-pointer ${
                        splitStrategy === 'host_pays_all'
                          ? 'border-[#FF0055] bg-[#fff0f3] font-bold text-[#FF0055]'
                          : 'border-[#e5e7eb] bg-white text-[#616161]'
                      }`}
                    >
                      Host Pays All
                    </button>
                    <button
                      type="button"
                      onClick={() => setSplitStrategy('split_by_diner')}
                      className={`p-2 rounded-lg border text-[11px] transition-all cursor-pointer ${
                        splitStrategy === 'split_by_diner'
                          ? 'border-[#FF0055] bg-[#fff0f3] font-bold text-[#FF0055]'
                          : 'border-[#e5e7eb] bg-white text-[#616161]'
                      }`}
                    >
                      Split by Diner
                    </button>
                    <button
                      type="button"
                      onClick={() => setSplitStrategy('equal_split')}
                      className={`p-2 rounded-lg border text-[11px] transition-all cursor-pointer ${
                        splitStrategy === 'equal_split'
                          ? 'border-[#FF0055] bg-[#fff0f3] font-bold text-[#FF0055]'
                          : 'border-[#e5e7eb] bg-white text-[#616161]'
                      }`}
                    >
                      Equal Split
                    </button>
                  </div>
                </div>

                <div className="text-[11px] font-mono-num font-bold uppercase tracking-wider text-[#727272] pt-1">
                  Payment Method:
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedMethod('apple_pay')}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      selectedMethod === 'apple_pay'
                        ? 'border-[#FF0055] bg-[#fff0f3]'
                        : 'border-[#e5e7eb] bg-white hover:bg-[#f9f9f9]'
                    }`}
                  >
                    <div className="text-[12px] font-medium text-[#262626]">Pay Online Now</div>
                    <div className="text-[10px] text-[#727272]">Instant Card / Apple Pay</div>
                  </button>

                  <button
                    onClick={() => setSelectedMethod('cashier')}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      selectedMethod === 'cashier'
                        ? 'border-[#FF0055] bg-[#fff0f3]'
                        : 'border-[#e5e7eb] bg-white hover:bg-[#f9f9f9]'
                    }`}
                  >
                    <div className="text-[12px] font-medium text-[#262626]">Pay at Cashier Desk</div>
                    <div className="text-[10px] text-[#727272]">Chit #PAY verification</div>
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setShowPaymentChoice(false)}
                    className="flex-1 py-2 rounded-full border border-[#e5e7eb] text-[#727272] text-[12px] hover:bg-[#f9f9f9] cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => handleFinalizeCheckout(selectedMethod)}
                    className="flex-2 py-2.5 rounded-full bg-[#FF0055] text-white text-[12px] font-bold hover:opacity-95 cursor-pointer shadow-xs btn-crimson-glow"
                  >
                    Submit Table Order -&gt;
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Host Master Checkout Button */}
                <button
                  onClick={handleProceedToPayment}
                  data-ui-radius="999"
                  className="w-full py-3.5 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-[14px] font-bold transition-all btn-crimson-glow active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Submit Table Order ({total.toFixed(2)} EGP) -&gt;</span>
                </button>

                {/* Diner Readiness Status */}
                {members.length > 1 && (
                  <div className="flex items-center justify-between pt-1 text-[11px] font-mono-num text-[#727272]">
                    <span>
                      Table Diners Ready: {readyMembersCount}/{members.length}
                    </span>
                    <span className="text-[11px] font-mono-num text-[#727272]">
                      {readyMembersCount === members.length
                        ? 'All companions ready'
                        : `${members.length - readyMembersCount} browsing`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
