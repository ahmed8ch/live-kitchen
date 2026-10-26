import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();

  const cart = useAppStore((state) => state.cart);
  const isCartDrawerOpen = useAppStore((state) => state.isCartDrawerOpen);
  const closeCartDrawer = useAppStore((state) => state.closeCartDrawer);
  const updateCartItemQuantity = useAppStore((state) => state.updateCartItemQuantity);
  const removeFromCart = useAppStore((state) => state.removeFromCart);
  const clearCart = useAppStore((state) => state.clearCart);
  const activeTable = useAppStore((state) => state.activeTable);
  const createOrder = useAppStore((state) => state.createOrder);

  if (!isCartDrawerOpen) {
    return null;
  }

  const subtotal = cart.reduce((sum, item) => {
    const modTotal = item.selectedModifiers.reduce((mSum, m) => mSum + m.price, 0);
    return sum + (item.menuItem.basePrice + modTotal) * item.quantity;
  }, 0);

  const vatAmount = Math.round(subtotal * 0.14 * 100) / 100;
  const total = Math.round((subtotal + vatAmount) * 100) / 100;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const ticket = createOrder();
    const query = activeTable ? `?table=${activeTable}` : '';
    navigate(`/order/${ticket.id}${query}`);
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

        {/* Seating Notice Banner */}
        {activeTable ? (
          <div className="px-5 py-2.5 bg-[#fff8f5] border-b border-[#fcddcc] flex items-center justify-between text-[12px]">
            <span className="text-[#262626] font-medium">Delivering directly to:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#ff4d00] text-white font-mono-num font-medium">
              Table {activeTable}
            </span>
          </div>
        ) : (
          <div className="px-5 py-2 bg-[#f9f9f9] border-b border-[#e5e7eb] text-[12px] text-[#727272]">
            Dine-In Counter / Online Seating
          </div>
        )}

        {/* Scrollable Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
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
            cart.map((item) => {
              const itemModifiersTotal = item.selectedModifiers.reduce((sum, m) => sum + m.price, 0);
              const itemUnitPrice = item.menuItem.basePrice + itemModifiersTotal;

              return (
                <div
                  key={item.cartItemId}
                  data-ui-radius="12"
                  className="p-4 rounded-xl border border-[#e5e7eb] bg-[#ffffff] space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-medium text-[14px] text-[#262626]">
                        {item.menuItem.name}
                      </div>
                      <div className="text-[12px] font-mono-num text-[#727272] mt-0.5" data-ui-number>
                        {itemUnitPrice.toFixed(2)} EGP each
                      </div>
                    </div>

                    <span className="font-mono-num font-medium text-[14px] text-[#262626]" data-ui-number>
                      {(itemUnitPrice * item.quantity).toFixed(2)} EGP
                    </span>
                  </div>

                  {/* Modifiers */}
                  {item.selectedModifiers.length > 0 && (
                    <div className="text-[12px] text-[#727272] space-y-0.5 pl-2 border-l border-[#e5e7eb]">
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
                        className="w-7 h-7 rounded-md bg-[#f9f9f9] hover:bg-[#e5e7eb] border border-[#e5e7eb] flex items-center justify-center text-[#262626] cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-mono-num font-medium text-[13px]" data-ui-number>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartItemQuantity(item.cartItemId, item.quantity + 1)}
                        className="w-7 h-7 rounded-md bg-[#f9f9f9] hover:bg-[#e5e7eb] border border-[#e5e7eb] flex items-center justify-center text-[#262626] cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="text-[12px] text-[#949494] hover:text-[#dc2626] transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer Checkout Area */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-[#e5e7eb] bg-[#f9f9f9] space-y-3">
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
                <span className="font-mono-num font-medium text-[#ff4d00]" data-ui-number>{total.toFixed(2)} EGP</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              data-ui-radius="999"
              className="w-full py-3.5 rounded-full bg-[#ff4d00] hover:opacity-95 text-white text-[14px] font-medium transition-all btn-ember-glow active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Send Order to Kitchen Line -&gt;</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
