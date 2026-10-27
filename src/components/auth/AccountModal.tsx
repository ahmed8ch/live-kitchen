import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { AccountModalTab } from '../../types/domain';

const DIETARY_OPTIONS = [
  'Halal',
  'Gluten-Free',
  'Dairy-Free',
  'Nut Allergy',
  'Low Carb',
  'Vegetarian',
  'No Seafood',
];

export const AccountModal: React.FC = () => {
  const isAccountModalOpen = useAppStore((state) => state.isAccountModalOpen);
  const accountModalTab = useAppStore((state) => state.accountModalTab);
  const closeAccountModal = useAppStore((state) => state.closeAccountModal);
  const setAccountModalTab = useAppStore((state) => state.setAccountModalTab);
  const userAccount = useAppStore((state) => state.userAccount);
  const savedAccounts = useAppStore((state) => state.savedAccounts);
  const signInDiner = useAppStore((state) => state.signInDiner);
  const signUpDiner = useAppStore((state) => state.signUpDiner);
  const signOutDiner = useAppStore((state) => state.signOutDiner);
  const updateDinerProfile = useAppStore((state) => state.updateDinerProfile);
  const reorderPastOrder = useAppStore((state) => state.reorderPastOrder);
  const reorderSingleItem = useAppStore((state) => state.reorderSingleItem);
  const orders = useAppStore((state) => state.orders);

  // Sign In Form State
  const [signInPhone, setSignInPhone] = useState('01012345678');
  const [signInPin, setSignInPin] = useState('1234');

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPin, setSignUpPin] = useState('');
  const [signUpDietary, setSignUpDietary] = useState<string[]>(['Halal']);

  if (!isAccountModalOpen) return null;

  const currentTab: AccountModalTab = accountModalTab;

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signInDiner(signInPhone, signInPin);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signUpDiner({
      fullName: signUpName,
      phone: signUpPhone,
      email: signUpEmail,
      pin: signUpPin,
      dietaryTags: signUpDietary,
    });
  };

  const toggleSignUpDietary = (tag: string) => {
    if (signUpDietary.includes(tag)) {
      setSignUpDietary(signUpDietary.filter((t) => t !== tag));
    } else {
      setSignUpDietary([...signUpDietary, tag]);
    }
  };

  const toggleProfileDietary = (tag: string) => {
    if (!userAccount) return;
    const currentTags = userAccount.dietaryTags || [];
    const updatedTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    updateDinerProfile({ dietaryTags: updatedTags });
  };

  // Find past orders belonging to this account or all completed orders
  const pastOrders = userAccount
    ? orders.filter(
        (o) =>
          userAccount.orderHistoryIds.includes(o.id) ||
          o.dinerAccountId === userAccount.id ||
          o.isPaid
      )
    : orders.filter((o) => o.isPaid);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-modal-title"
    >
      <div className="bg-white border border-[#e5e7eb] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb] bg-[#f9f9f9]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FF0055]/10 flex items-center justify-center text-[#FF0055]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <h2 id="account-modal-title" className="text-[15px] font-bold text-[#262626]">
                {userAccount ? userAccount.fullName : 'Dine-In Guest Profile'}
              </h2>
              <p className="text-[11px] text-[#727272] font-mono-num">
                {userAccount
                  ? `${userAccount.phone} // 10% Loyalty Active`
                  : 'Fast 1-touch sign-in & past order history'}
              </p>
            </div>
          </div>

          <button
            onClick={closeAccountModal}
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#727272] hover:text-[#262626] hover:bg-black/5 transition-colors"
            aria-label="Close dialog"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#e5e7eb] bg-white px-6 gap-2">
          {userAccount ? (
            <>
              <button
                onClick={() => setAccountModalTab('profile')}
                className={`py-3 px-3 text-[13px] font-medium border-b-2 transition-colors ${
                  currentTab === 'profile'
                    ? 'border-[#FF0055] text-[#FF0055] font-bold'
                    : 'border-transparent text-[#727272] hover:text-[#262626]'
                }`}
              >
                Profile & Loyalty
              </button>
              <button
                onClick={() => setAccountModalTab('history')}
                className={`py-3 px-3 text-[13px] font-medium border-b-2 transition-colors ${
                  currentTab === 'history'
                    ? 'border-[#FF0055] text-[#FF0055] font-bold'
                    : 'border-transparent text-[#727272] hover:text-[#262626]'
                }`}
              >
                Past Orders ({pastOrders.length})
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setAccountModalTab('signin')}
                className={`py-3 px-3 text-[13px] font-medium border-b-2 transition-colors ${
                  currentTab === 'signin'
                    ? 'border-[#FF0055] text-[#FF0055] font-bold'
                    : 'border-transparent text-[#727272] hover:text-[#262626]'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAccountModalTab('signup')}
                className={`py-3 px-3 text-[13px] font-medium border-b-2 transition-colors ${
                  currentTab === 'signup'
                    ? 'border-[#FF0055] text-[#FF0055] font-bold'
                    : 'border-transparent text-[#727272] hover:text-[#262626]'
                }`}
              >
                Create Account (+50 EGP)
              </button>
              <button
                onClick={() => setAccountModalTab('history')}
                className={`py-3 px-3 text-[13px] font-medium border-b-2 transition-colors ${
                  currentTab === 'history'
                    ? 'border-[#FF0055] text-[#FF0055] font-bold'
                    : 'border-transparent text-[#727272] hover:text-[#262626]'
                }`}
              >
                Table History ({pastOrders.length})
              </button>
            </>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {/* TAB: SIGN IN */}
          {currentTab === 'signin' && (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div className="p-3 bg-[#fff0f3] border border-[#ffd1dc] rounded-xl text-[12px] text-[#262626]">
                <span className="font-bold text-[#FF0055] block">Quick Seated Diner Access</span>
                Sign in with your phone and 4-digit PIN to retrieve past favorites and earn 10% loyalty cashback.
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#262626] mb-1">
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 01012345678"
                  value={signInPhone}
                  onChange={(e) => setSignInPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f9f9f9] border border-[#e5e7eb] rounded-lg text-[13px] font-mono-num text-[#262626] focus:outline-hidden focus:border-[#FF0055]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#262626] mb-1">
                  4-Digit Security PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  placeholder="****"
                  value={signInPin}
                  onChange={(e) => setSignInPin(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f9f9f9] border border-[#e5e7eb] rounded-lg text-[13px] font-mono-num tracking-widest text-[#262626] focus:outline-hidden focus:border-[#FF0055]"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#FF0055] hover:bg-[#d90048] text-white rounded-full text-[13px] font-bold transition-colors shadow-xs"
                >
                  Sign In to Table Profile
                </button>

                {savedAccounts['01012345678'] && (
                  <button
                    type="button"
                    onClick={() => {
                      setSignInPhone('01012345678');
                      setSignInPin('1234');
                      signInDiner('01012345678', '1234');
                    }}
                    className="w-full py-2 bg-[#f9f9f9] hover:bg-[#e5e7eb] border border-[#e5e7eb] text-[#262626] rounded-full text-[12px] font-medium transition-colors"
                  >
                    1-Click Demo: Ahmed Hassan (01012345678 / 1234)
                  </button>
                )}
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAccountModalTab('signup')}
                  className="text-[12px] text-[#727272] hover:text-[#FF0055] transition-colors"
                >
                  First time dining here? Create an account for 50 EGP welcome bonus -&gt;
                </button>
              </div>
            </form>
          )}

          {/* TAB: SIGN UP */}
          {currentTab === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div className="p-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl text-[12px] text-[#166534]">
                <span className="font-bold block">50.00 EGP Welcome Bonus</span>
                Create your Dine-In account in 20 seconds. Earn 10% cashback on all orders and re-order previous dishes with 1 touch.
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#262626] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mariam El-Sayed"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f9f9f9] border border-[#e5e7eb] rounded-lg text-[13px] text-[#262626] focus:outline-hidden focus:border-[#FF0055]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-[#262626] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="01xxxxxxxxx"
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f9f9f9] border border-[#e5e7eb] rounded-lg text-[13px] font-mono-num text-[#262626] focus:outline-hidden focus:border-[#FF0055]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#262626] mb-1">
                    4-Digit Fast PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    placeholder="****"
                    value={signUpPin}
                    onChange={(e) => setSignUpPin(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f9f9f9] border border-[#e5e7eb] rounded-lg text-[13px] font-mono-num tracking-widest text-[#262626] focus:outline-hidden focus:border-[#FF0055]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#262626] mb-1">
                  Email (Optional for e-receipts)
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f9f9f9] border border-[#e5e7eb] rounded-lg text-[13px] text-[#262626] focus:outline-hidden focus:border-[#FF0055]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#262626] mb-1.5">
                  Dietary Preferences & Allergies
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DIETARY_OPTIONS.map((tag) => {
                    const isSelected = signUpDietary.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleSignUpDietary(tag)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors border ${
                          isSelected
                            ? 'bg-[#262626] text-white border-[#262626]'
                            : 'bg-[#f9f9f9] text-[#727272] border-[#e5e7eb] hover:border-[#262626]'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#FF0055] hover:bg-[#d90048] text-white rounded-full text-[13px] font-bold transition-colors shadow-xs"
                >
                  Create Account & Claim 50 EGP Bonus
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setAccountModalTab('signin')}
                  className="text-[12px] text-[#727272] hover:text-[#FF0055] transition-colors"
                >
                  Already have an account? Sign In -&gt;
                </button>
              </div>
            </form>
          )}

          {/* TAB: PROFILE & LOYALTY */}
          {currentTab === 'profile' && userAccount && (
            <div className="space-y-6">
              {/* Loyalty Reward Card */}
              <div className="bg-gradient-to-br from-[#262626] to-[#171717] text-white p-5 rounded-2xl relative overflow-hidden shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#999999] font-mono-num">
                      Live Kitchen Loyalty Balance
                    </span>
                    <div className="text-3xl font-mono-num font-bold text-white mt-1">
                      {userAccount.loyaltyPointsEgp.toFixed(2)}{' '}
                      <span className="text-[14px] text-[#FF0055] font-normal">EGP</span>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 bg-white/10 rounded-full text-[11px] font-mono-num text-white">
                    10% Cashback Tier
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-[#cccccc]">
                  <span>Member ID: {userAccount.id}</span>
                  <span>{userAccount.phone}</span>
                </div>
              </div>

              {/* Dietary Preferences Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-bold text-[#262626]">
                    Dietary & Allergy Notes
                  </span>
                  <span className="text-[11px] text-[#727272]">Click to toggle</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {DIETARY_OPTIONS.map((tag) => {
                    const isSelected = (userAccount.dietaryTags || []).includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleProfileDietary(tag)}
                        className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors border flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#FF0055] text-white border-[#FF0055]'
                            : 'bg-[#f9f9f9] text-[#727272] border-[#e5e7eb] hover:border-[#262626]'
                        }`}
                      >
                        <span>{tag}</span>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Account Quick Stats */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-[#f9f9f9] border border-[#e5e7eb] rounded-xl">
                  <span className="text-[10px] uppercase font-mono-num text-[#727272] block">
                    Completed Visits
                  </span>
                  <span className="text-[16px] font-mono-num font-bold text-[#262626]">
                    {pastOrders.length}
                  </span>
                </div>

                <div className="p-3 bg-[#f9f9f9] border border-[#e5e7eb] rounded-xl">
                  <span className="text-[10px] uppercase font-mono-num text-[#727272] block">
                    Member Since
                  </span>
                  <span className="text-[12px] font-mono-num text-[#262626]">
                    {new Date(userAccount.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-[#e5e7eb]">
                <button
                  onClick={() => setAccountModalTab('history')}
                  className="px-4 py-2 bg-[#262626] hover:bg-black text-white rounded-full text-[12px] font-medium transition-colors"
                >
                  View Past Orders ({pastOrders.length}) -&gt;
                </button>

                <button
                  onClick={signOutDiner}
                  className="px-4 py-2 border border-[#e5e7eb] hover:bg-[#f9f9f9] text-[#727272] hover:text-[#dc2626] rounded-full text-[12px] font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* TAB: PAST ORDERS */}
          {currentTab === 'history' && (
            <div className="space-y-4">
              {pastOrders.length === 0 ? (
                <div className="text-center py-10 px-4 bg-[#f9f9f9] border border-[#e5e7eb] rounded-2xl">
                  <div className="w-10 h-10 mx-auto rounded-full bg-[#e5e7eb] flex items-center justify-center text-[#727272] mb-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                  <h3 className="text-[14px] font-bold text-[#262626]">No Past Orders Found</h3>
                  <p className="text-[12px] text-[#727272] max-w-xs mx-auto mt-1">
                    Orders settled at your table will appear here for fast 1-touch re-ordering and receipts.
                  </p>
                </div>
              ) : (
                pastOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 bg-white border border-[#e5e7eb] rounded-xl hover:border-[#262626] transition-colors space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#f9f9f9] border border-[#e5e7eb] rounded-md font-mono-num text-[11px] font-bold text-[#262626]">
                          {order.id}
                        </span>
                        {order.cashierChitCode && (
                          <span className="text-[11px] font-mono-num text-[#727272]">
                            Chit #{order.cashierChitCode}
                          </span>
                        )}
                        {order.tableNumber && (
                          <span className="text-[11px] font-mono-num text-[#727272]">
                            Table {order.tableNumber}
                          </span>
                        )}
                      </div>

                      <span className="text-[13px] font-mono-num font-bold text-[#262626]">
                        {order.total.toFixed(2)} EGP
                      </span>
                    </div>

                    {/* Dish list */}
                    <div className="space-y-1.5 pt-1">
                      {order.items.map((item, idx) => (
                        <div
                          key={`${order.id}-item-${idx}`}
                          className="flex items-center justify-between text-[12px] text-[#616161]"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono-num text-[#262626] font-medium">
                              {item.quantity}x
                            </span>
                            <span>{item.menuItem.name}</span>
                            {item.selectedModifiers.length > 0 && (
                              <span className="text-[11px] text-[#727272]">
                                ({item.selectedModifiers.map((m) => m.name).join(', ')})
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => reorderSingleItem(item)}
                            className="text-[11px] text-[#FF0055] hover:underline font-medium"
                          >
                            + Add to Cart
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Re-Order Bar */}
                    <div className="pt-2 border-t border-[#e5e7eb] flex items-center justify-between">
                      <span className="text-[11px] text-[#727272] font-mono-num">
                        {new Date(order.createdAt).toLocaleDateString()} at{' '}
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      <button
                        type="button"
                        onClick={() => reorderPastOrder(order.id)}
                        className="px-3 py-1 bg-[#FF0055] hover:bg-[#d90048] text-white rounded-full text-[11px] font-bold transition-colors shadow-xs"
                      >
                        Re-order Entire Meal ({order.items.length} items)
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
