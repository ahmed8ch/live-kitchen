import React, { useState } from 'react';
import { DirectionalArrow } from '../ui/DirectionalArrow';
import { useAppStore } from '../../store/useAppStore';
import { AccountModalTab } from '../../types/domain';
import { useTranslation } from '../../i18n';

const DIETARY_OPTIONS = [
  'Halal',
  'Gluten-Free',
  'Dairy-Free',
  'Vegetarian',
  'High-Protein',
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
  const { t, localizeDish, localizeTag, lang } = useTranslation();

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
      setSignUpDietary(signUpDietary.filter((item) => item !== tag));
    } else {
      setSignUpDietary([...signUpDietary, tag]);
    }
  };

  const toggleProfileDietary = (tag: string) => {
    if (!userAccount) return;
    const currentTags = userAccount.dietaryTags || [];
    const updatedTags = currentTags.includes(tag)
      ? currentTags.filter((item) => item !== tag)
      : [...currentTags, tag];
    updateDinerProfile({ dietaryTags: updatedTags });
  };

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-modal-title"
      onClick={closeAccountModal}
    >
      <div
        className="bg-white border border-[#e5e7eb] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-start"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb] bg-[#f9f9f9]">
          <div>
            <h2 id="account-modal-title" className="text-[15px] font-bold text-[#262626]">
              {userAccount ? userAccount.fullName : t('account.modalTitle')}
            </h2>
            <p className="text-[12px] text-[#727272]">
              {userAccount ? userAccount.phone : t('account.modalSubtitle')}
            </p>
          </div>

          <button
            onClick={closeAccountModal}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#727272] hover:text-[#262626] hover:bg-black/5 transition-colors cursor-pointer"
            aria-label={t('account.closeAria')}
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
                className={`py-3 px-3 min-h-[44px] inline-flex items-center text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${
                  currentTab === 'profile'
                    ? 'border-[#FF0055] text-[#FF0055] font-bold'
                    : 'border-transparent text-[#727272] hover:text-[#262626]'
                }`}
              >
                {t('account.tabs.profile')}
              </button>
              <button
                onClick={() => setAccountModalTab('history')}
                className={`py-3 px-3 min-h-[44px] inline-flex items-center text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${
                  currentTab === 'history'
                    ? 'border-[#FF0055] text-[#FF0055] font-bold'
                    : 'border-transparent text-[#727272] hover:text-[#262626]'
                }`}
              >
                {t('account.tabs.orders', { count: pastOrders.length })}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setAccountModalTab('signin')}
                className={`py-3 px-3 min-h-[44px] inline-flex items-center text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${
                  currentTab === 'signin'
                    ? 'border-[#FF0055] text-[#FF0055] font-bold'
                    : 'border-transparent text-[#727272] hover:text-[#262626]'
                }`}
              >
                {t('nav.signIn')}
              </button>
              <button
                onClick={() => setAccountModalTab('signup')}
                className={`py-3 px-3 min-h-[44px] inline-flex items-center text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${
                  currentTab === 'signup'
                    ? 'border-[#FF0055] text-[#FF0055] font-bold'
                    : 'border-transparent text-[#727272] hover:text-[#262626]'
                }`}
              >
                {t('account.createProfileBtn')}
              </button>
              <button
                onClick={() => setAccountModalTab('history')}
                className={`py-3 px-3 min-h-[44px] inline-flex items-center text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${
                  currentTab === 'history'
                    ? 'border-[#FF0055] text-[#FF0055] font-bold'
                    : 'border-transparent text-[#727272] hover:text-[#262626]'
                }`}
              >
                {t('account.tabs.orders', { count: pastOrders.length })}
              </button>
            </>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {/* TAB: SIGN IN */}
          {currentTab === 'signin' && (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <p className="text-[13px] text-[#727272] leading-relaxed">
                {t('account.modalSubtitle')}
              </p>

              <div>
                <label className="block text-[12px] font-medium text-[#262626] mb-1">
                  {t('account.phoneLabel')}
                </label>
                <input
                  type="tel"
                  required
                  placeholder={t('account.phonePlaceholder')}
                  value={signInPhone}
                  onChange={(e) => setSignInPhone(e.target.value)}
                  className="w-full px-3 py-2 min-h-[44px] bg-[#f9f9f9] border border-[#e5e7eb] rounded-lg text-[13px] font-mono-num text-[#262626] focus:outline-hidden focus:border-[#FF0055]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#262626] mb-1">
                  {t('common.pin')}
                </label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  placeholder="****"
                  value={signInPin}
                  onChange={(e) => setSignInPin(e.target.value)}
                  className="w-full px-3 py-2 min-h-[44px] bg-[#f9f9f9] border border-[#e5e7eb] rounded-lg text-[13px] font-mono-num tracking-widest text-[#262626] focus:outline-hidden focus:border-[#FF0055]"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full min-h-[44px] py-2.5 bg-[#FF0055] hover:bg-[#d90048] text-white rounded-full text-[13px] font-bold transition-colors shadow-xs flex items-center justify-center cursor-pointer"
                >
                  {t('nav.signIn')}
                </button>

                {savedAccounts['01012345678'] && (
                  <button
                    type="button"
                    onClick={() => {
                      setSignInPhone('01012345678');
                      setSignInPin('1234');
                      signInDiner('01012345678', '1234');
                    }}
                    className="w-full min-h-[44px] py-2 bg-[#f9f9f9] hover:bg-[#e5e7eb] border border-[#e5e7eb] text-[#262626] rounded-full text-[12px] font-medium transition-colors flex items-center justify-center cursor-pointer"
                  >
                    {lang === 'eg'
                      ? 'حساب تجريبي سريع: أحمد حسن (01012345678)'
                      : 'Demo Guest: Ahmed Hassan (01012345678)'}
                  </button>
                )}
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setAccountModalTab('signup')}
                  className="min-h-[44px] inline-flex items-center gap-1.5 text-[12px] text-[#727272] hover:text-[#FF0055] transition-colors cursor-pointer"
                >
                  <span>{t('account.createProfileBtn')}</span>
                  <DirectionalArrow className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* TAB: SIGN UP */}
          {currentTab === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <p className="text-[13px] text-[#727272] leading-relaxed">
                {t('account.dietaryHint')}
              </p>

              <div>
                <label className="block text-[12px] font-medium text-[#262626] mb-1">
                  {t('account.nameLabel')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('account.namePlaceholder')}
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  className="w-full px-3 py-2 min-h-[44px] bg-[#f9f9f9] border border-[#e5e7eb] rounded-lg text-[13px] text-[#262626] focus:outline-hidden focus:border-[#FF0055]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-[#262626] mb-1">
                    {t('account.phoneLabel')}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder={t('account.phonePlaceholder')}
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value)}
                    className="w-full px-3 py-2 min-h-[44px] bg-[#f9f9f9] border border-[#e5e7eb] rounded-lg text-[13px] font-mono-num text-[#262626] focus:outline-hidden focus:border-[#FF0055]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#262626] mb-1">
                    {t('common.pin')}
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    placeholder="****"
                    value={signUpPin}
                    onChange={(e) => setSignUpPin(e.target.value)}
                    className="w-full px-3 py-2 min-h-[44px] bg-[#f9f9f9] border border-[#e5e7eb] rounded-lg text-[13px] font-mono-num tracking-widest text-[#262626] focus:outline-hidden focus:border-[#FF0055]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#262626] mb-1">
                  {t('account.emailLabel')}
                </label>
                <input
                  type="email"
                  placeholder={t('account.emailPlaceholder')}
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  className="w-full px-3 py-2 min-h-[44px] bg-[#f9f9f9] border border-[#e5e7eb] rounded-lg text-[13px] text-[#262626] focus:outline-hidden focus:border-[#FF0055]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#262626] mb-1.5">
                  {t('account.dietaryTitle')}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DIETARY_OPTIONS.map((tag) => {
                    const isSelected = signUpDietary.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleSignUpDietary(tag)}
                        className={`px-3 py-1.5 min-h-[44px] rounded-full text-[12px] font-medium transition-colors border inline-flex items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#262626] text-white border-[#262626]'
                            : 'bg-[#f9f9f9] text-[#727272] border-[#e5e7eb] hover:border-[#262626]'
                        }`}
                      >
                        {localizeTag(tag)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full min-h-[44px] py-2.5 bg-[#FF0055] hover:bg-[#d90048] text-white rounded-full text-[13px] font-bold transition-colors shadow-xs flex items-center justify-center cursor-pointer"
                >
                  {t('account.createProfileBtn')}
                </button>
              </div>
            </form>
          )}

          {/* TAB: PROFILE & DIETARY PREFERENCES */}
          {currentTab === 'profile' && userAccount && (
            <div className="space-y-6">
              <div className="bg-[#f9f9f9] border border-[#e5e7eb] text-[#262626] p-5 rounded-2xl shadow-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[12px] text-[#727272] font-medium">
                      {t('account.modalTitle')}
                    </span>
                    <div className="text-xl font-bold text-[#262626] mt-0.5">
                      {userAccount.fullName}
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-white border border-[#e5e7eb] rounded-full text-[11px] font-mono-num text-[#262626]">
                    {userAccount.phone}
                  </span>
                </div>

                <div className="mt-4 pt-3.5 border-t border-[#e5e7eb] flex items-center justify-between text-[12px] text-[#727272]">
                  <span>
                    {t('account.tabs.orders', { count: pastOrders.length })}
                  </span>
                  <span>
                    {new Date(userAccount.createdAt).toLocaleDateString(lang === 'eg' ? 'ar-EG' : 'en-US')}
                  </span>
                </div>
              </div>

              {/* Dietary Preferences Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-bold text-[#262626]">
                    {t('account.dietaryTitle')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {DIETARY_OPTIONS.map((tag) => {
                    const isSelected = (userAccount.dietaryTags || []).includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleProfileDietary(tag)}
                        className={`px-3 py-1.5 min-h-[44px] rounded-full text-[12px] font-medium transition-colors border flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-[#FF0055] text-white border-[#FF0055]'
                            : 'bg-[#f9f9f9] text-[#727272] border-[#e5e7eb] hover:border-[#262626]'
                        }`}
                      >
                        <span>{localizeTag(tag)}</span>
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

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-[#e5e7eb]">
                <button
                  onClick={() => setAccountModalTab('history')}
                  className="px-4 py-2 min-h-[44px] inline-flex items-center gap-1.5 bg-[#262626] hover:bg-black text-white rounded-full text-[12px] font-medium transition-colors cursor-pointer"
                >
                  <span>{t('account.tabs.orders', { count: pastOrders.length })}</span>
                  <DirectionalArrow className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={signOutDiner}
                  className="px-4 py-2 min-h-[44px] inline-flex items-center border border-[#e5e7eb] hover:bg-[#f9f9f9] text-[#727272] hover:text-[#dc2626] rounded-full text-[12px] font-medium transition-colors cursor-pointer"
                >
                  {t('account.signOutBtn')}
                </button>
              </div>
            </div>
          )}

          {/* TAB: PAST ORDERS */}
          {currentTab === 'history' && (
            <div className="space-y-4">
              {pastOrders.length === 0 ? (
                <div className="text-center py-10 px-4 bg-[#f9f9f9] border border-[#e5e7eb] rounded-2xl">
                  <p className="text-[13px] text-[#727272] max-w-xs mx-auto">
                    {t('account.pastOrdersEmpty')}
                  </p>
                </div>
              ) : (
                pastOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 bg-white border border-[#e5e7eb] rounded-2xl hover:border-[#262626] transition-colors space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#f9f9f9] border border-[#e5e7eb] rounded-lg font-mono-num text-[12px] font-bold text-[#262626]">
                          {order.id}
                        </span>
                        {order.tableNumber && (
                          <span className="text-[12px] text-[#727272]">
                            {t('nav.tableNumber', { table: order.tableNumber })}
                          </span>
                        )}
                      </div>

                      <span className="text-[13px] font-mono-num font-bold text-[#262626]">
                        {order.total.toFixed(2)} {t('common.egp')}
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {order.items.map((item, idx) => {
                        const localized = localizeDish(item.menuItem);
                        return (
                          <div
                            key={`${order.id}-item-${idx}`}
                            className="flex items-center justify-between text-[12px] text-[#616161]"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono-num text-[#262626] font-medium">
                                {item.quantity}x
                              </span>
                              <span>{localized.name}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => reorderSingleItem(item)}
                              className="min-h-[44px] px-2 text-[11px] text-[#FF0055] hover:underline font-medium inline-flex items-center cursor-pointer"
                            >
                              + {t('menu.card.addToTable')}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-[#e5e7eb] flex items-center justify-between">
                      <span className="text-[11px] text-[#727272]">
                        {new Date(order.createdAt).toLocaleDateString(lang === 'eg' ? 'ar-EG' : 'en-US')}
                      </span>

                      <button
                        type="button"
                        onClick={() => reorderPastOrder(order.id)}
                        className="px-4 py-2 min-h-[44px] bg-[#FF0055] hover:bg-[#d90048] text-white rounded-full text-[11px] font-bold transition-colors shadow-xs inline-flex items-center cursor-pointer"
                      >
                        {t('tracker.orderMoreDishesBtn')} ({order.items.length})
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
