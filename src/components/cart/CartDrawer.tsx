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
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={closeCartDrawer}
    >
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#e5e7eb] animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#e5e7eb] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-[#0f172a]">Your Order Cart</h2>
            <span className="px-2 py-0.5 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] text-[12px] font-mono-num font-bold text-[#727272]">
              {cart.reduce((s, i) => s + i.quantity, 0)} items
            </span>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[12px] text-[#727272] hover:text-red-600 px-2 py-1 rounded transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={closeCartDrawer}
              className="w-8 h-8 rounded-full bg-[#f9f9f9] hover:bg-[#e5e7eb] flex items-center justify-center text-[#0f172a] transition-colors"
              aria-label="Close cart drawer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Table Anchor Notice */}
        {activeTable ? (
          <div className="px-5 py-2.5 bg-orange-50/70 border-b border-orange-100 flex items-center justify-between text-[12px]">
            <span className="text-[#0f172a] font-medium">Delivering direct to table:</span>
            <span className="px-2 py-0.5 rounded-full bg-[#ea580c] text-white font-mono-num font-bold">
              Table {activeTable}
            </span>
          </div>
        ) : (
          <div className="px-5 py-2 bg-[#f9f9f9] border-b border-[#e5e7eb] text-[12px] text-[#727272]">
            Online guest ordering &bull; Pickup / Dine-In counter
          </div>
        )}

        {/* Scrollable Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#f9f9f9] border border-[#e5e7eb] flex items-center justify-center text-[#9ca3af] mb-4">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </div>
              <h3 className="text-[16px] font-bold text-[#0f172a]">Your cart is empty</h3>
              <p className="text-[13px] text-[#727272] mt-1 max-w-xs">
                Explore our handcrafted flame dishes and add your favorites to get started.
              </p>
              <button
                onClick={closeCartDrawer}
                className="mt-5 px-5 py-2 rounded-full bg-[#0f172a] text-white text-[13px] font-semibold hover:bg-black transition-colors"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const modPrice = item.selectedModifiers.reduce((sum, m) => sum + m.price, 0);
              const singleItemPrice = item.menuItem.basePrice + modPrice;
              const lineTotal = singleItemPrice * item.quantity;

              return (
                <div
                  key={item.cartItemId}
                  className="p-3.5 rounded-xl border border-[#e5e7eb] bg-[#f9f9f9] flex gap-3.5 items-start"
                >
                  {/* Thumbnail Image */}
                  <img
                    src={item.menuItem.imageUrl}
                    alt={item.menuItem.name}
                    className="w-14 h-14 rounded-lg object-cover shrink-0 border border-[#e5e7eb]"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';
                    }}
                  />

                  {/* Item Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-[14px] font-bold text-[#0f172a] truncate">
                        {item.menuItem.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="text-[#9ca3af] hover:text-red-500 p-0.5 transition-colors"
                        aria-label="Remove item"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Modifiers List */}
                    {item.selectedModifiers.length > 0 && (
                      <div className="mt-1 text-[11px] text-[#727272] space-y-0.5">
                        {item.selectedModifiers.map((mod) => (
                          <div key={mod.id} className="flex justify-between">
                            <span>+ {mod.name}</span>
                            <span className="font-mono-num">+{mod.price} EGP</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Kitchen Instructions */}
                    {item.notes && (
                      <div className="mt-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded italic">
                        Note: {item.notes}
                      </div>
                    )}

                    {/* Quantity Stepper & Price */}
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#e5e7eb]">
                      <div className="inline-flex items-center border border-[#e5e7eb] bg-white rounded-full p-0.5">
                        <button
                          onClick={() => updateCartItemQuantity(item.cartItemId, item.quantity - 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[#0f172a] hover:bg-[#f0f0f0] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-mono-num font-bold text-[12px] text-[#0f172a]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartItemQuantity(item.cartItemId, item.quantity + 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[#0f172a] hover:bg-[#f0f0f0] transition-colors"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <div className="font-mono-num font-bold text-[13px] text-[#0f172a]">
                        {lineTotal.toFixed(2)} EGP
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer: Fiscal Summary & Submit */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-[#e5e7eb] bg-[#f9f9f9] space-y-4">
            <div className="space-y-1.5 text-[13px]">
              <div className="flex justify-between text-[#727272]">
                <span>Food & Beverage Subtotal</span>
                <span className="font-mono-num text-[#0f172a] font-medium">{subtotal.toFixed(2)} EGP</span>
              </div>
              <div className="flex justify-between text-[#727272]">
                <span>ETA Fiscal VAT (14%)</span>
                <span className="font-mono-num text-[#0f172a] font-medium">{vatAmount.toFixed(2)} EGP</span>
              </div>
              <div className="pt-2 border-t border-[#e5e7eb] flex justify-between text-[16px] font-bold text-[#0f172a]">
                <span>Grand Total</span>
                <span className="font-mono-num text-[#ea580c]">{total.toFixed(2)} EGP</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-full bg-[#ea580c] hover:bg-[#c2410c] text-white text-[15px] font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <span>Send Order to Kitchen Line</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <div className="text-center text-[11px] text-[#727272]">
              Instant ticket dispatch to line cook station. Pay now or at table.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
