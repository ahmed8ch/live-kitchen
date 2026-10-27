import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { PaymentMethod } from '../../types/domain';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();

  const cart = useAppStore((state) => state.cart);
  const isCartDrawerOpen = useAppStore((state) => state.isCartDrawerOpen);
  const closeCartDrawer = useAppStore((state) => state.closeCartDrawer);
  const updateCartItemQuantity = useAppStore((state) => state.updateCartItemQuantity);
  const removeFromCart = useAppStore((state) => state.removeFromCart);
  const clearCart = useAppStore((state) => state.clearCart);
  const activeTable = useAppStore((state) => state.activeTable);
  const currentMember = useAppStore((state) => state.currentMember);
  const tableSessions = useAppStore((state) => state.tableSessions);
  const createOrder = useAppStore((state) => state.createOrder);
  const setMemberReadyToPay = useAppStore((state) => state.setMemberReadyToPay);

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('apple_pay');
  const [showPaymentChoice, setShowPaymentChoice] = useState(false);

  if (!isCartDrawerOpen) {
    return null;
  }

  const session = activeTable ? tableSessions[activeTable] : null;
  const isHost = currentMember?.isHost ?? true;
  const members = session?.members || [];
  const readyMembersCount = members.filter((m) => m.isReadyToPay).length;

  const subtotal = cart.reduce((sum, item) => {
    const modTotal = item.selectedModifiers.reduce((mSum, m) => mSum + m.price, 0);
    return sum + (item.menuItem.basePrice + modTotal) * item.quantity;
  }, 0);

  const vatAmount = Math.round(subtotal * 0.14 * 100) / 100;
  const total = Math.round((subtotal + vatAmount) * 100) / 100;

  // Group cart items by diner who added them
  const groupedCart = cart.reduce((acc, item) => {
    const memberKey = item.addedBy?.memberId || 'unassigned';
    const memberName = item.addedBy?.name || 'Table Diner';
    if (!acc[memberKey]) {
      acc[memberKey] = {
        name: memberName,
        isYou: memberKey === currentMember?.id,
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
    const ticket = createOrder(method);
    const query = activeTable ? `?table=${activeTable}` : '';
    navigate(`/settlement/${ticket.id}${query}`);
  };

  const handleToggleMyReady = () => {
    if (!activeTable || !currentMember) return;
    setMemberReadyToPay(activeTable, currentMember.id, !currentMember.isReadyToPay);
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
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[12px] text-[#727272] hover:text-[#dc2626] px-2 py-1 rounded transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              onClick={closeCartDrawer}
              className="w-8 h-8 rounded-full bg-[#f9f9f9] hover:bg-[#e5e7eb] flex items-center justify-center text-[#262626] transition-colors cursor-pointer"
              aria-label="Close cart drawer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Seating & Multiplayer Notice Banner */}
        {activeTable ? (
          <div className="px-5 py-2.5 bg-[#fff0f3] border-b border-[#ffd1dc] flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF0055]" />
              <span className="text-[#262626] font-medium">Table {activeTable} Shared Cart</span>
            </div>
            <span className="text-[11px] font-mono-num text-[#727272]">
              {members.length > 0 ? `${readyMembersCount}/${members.length} Diners Ready` : 'Table Bound'}
            </span>
          </div>
        ) : (
          <div className="px-5 py-2 bg-[#f9f9f9] border-b border-[#e5e7eb] text-[12px] text-[#727272]">
            Dine-In Counter / Online Seating
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
                  <span className="text-[11px] font-mono-num text-[#727272]">
                    {group.items.reduce((s, i) => s + i.quantity, 0)} items
                  </span>
                </div>

                {group.items.map((item) => {
                  const itemModifiersTotal = item.selectedModifiers.reduce((sum, m) => sum + m.price, 0);
                  const itemUnitPrice = item.menuItem.basePrice + itemModifiersTotal;

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
                              {(itemUnitPrice * item.quantity).toFixed(2)} EGP
                            </span>
                          </div>

                          <div className="text-[11px] font-mono-num text-[#727272]" data-ui-number>
                            {itemUnitPrice.toFixed(2)} EGP each
                          </div>
                        </div>
                      </div>

                      {/* Modifiers */}
                      {item.selectedModifiers.length > 0 && (
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

                      {/* Quantity Adjustment Controls */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#f0f0f0]">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateCartItemQuantity(item.cartItemId, item.quantity - 1)}
                            className="w-6 h-6 rounded bg-[#f9f9f9] hover:bg-[#e5e7eb] border border-[#e5e7eb] flex items-center justify-center text-[#262626] cursor-pointer text-[12px]"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-mono-num font-medium text-[12px]" data-ui-number>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartItemQuantity(item.cartItemId, item.quantity + 1)}
                            className="w-6 h-6 rounded bg-[#f9f9f9] hover:bg-[#e5e7eb] border border-[#e5e7eb] flex items-center justify-center text-[#262626] cursor-pointer text-[12px]"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="text-[11px] text-[#949494] hover:text-[#dc2626] transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
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
                <span>ETA 14% VAT</span>
                <span className="font-mono-num text-[#262626]" data-ui-number>{vatAmount.toFixed(2)} EGP</span>
              </div>
              <div className="flex justify-between text-[16px] font-medium text-[#262626] pt-1 border-t border-[#e5e7eb]">
                <span>Payable Total</span>
                <span className="font-mono-num font-medium text-[#FF0055]" data-ui-number>{total.toFixed(2)} EGP</span>
              </div>
            </div>

            {/* Payment Choice Selection Modal / Expanded Area */}
            {showPaymentChoice ? (
              <div className="p-4 rounded-xl bg-white border border-[#e5e7eb] space-y-3 animate-in fade-in duration-150">
                <div className="text-[12px] font-medium text-[#262626]">
                  Select Checkout Verification Gate:
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
                    className="flex-2 py-2.5 rounded-full bg-[#FF0055] text-white text-[12px] font-medium hover:opacity-95 cursor-pointer shadow-xs"
                  >
                    Confirm & Settle ({total.toFixed(2)} EGP)
                  </button>
                </div>
              </div>
            ) : isHost ? (
              <button
                onClick={handleProceedToPayment}
                data-ui-radius="999"
                className="w-full py-3.5 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-[14px] font-medium transition-all btn-crimson-glow active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Proceed to Checkout ({total.toFixed(2)} EGP) -&gt;</span>
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleToggleMyReady}
                  className={`w-full py-3 rounded-full text-[13px] font-medium transition-all cursor-pointer shadow-xs ${
                    currentMember?.isReadyToPay
                      ? 'bg-[#15803d] text-white hover:bg-[#166534]'
                      : 'bg-white text-[#262626] border border-[#e5e7eb] hover:border-[#FF0055]'
                  }`}
                >
                  {currentMember?.isReadyToPay ? 'Marked Ready to Settle' : 'Mark Yourself Ready to Settle'}
                </button>
                <p className="text-[11px] text-center text-[#727272]">
                  Host will proceed to payment checkout when all table members are ready.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
