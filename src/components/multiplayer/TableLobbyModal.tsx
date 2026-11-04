import React, { useState } from 'react';
import { DirectionalArrow } from '../ui/DirectionalArrow';
import { useAppStore } from '../../store/useAppStore';
import { FlameLinkLogo } from '../ui/FlameLinkLogo';
import { useTranslation } from '../../i18n';

const ANIMAL_IDENTITIES = [
  { id: 'panda', name: 'Red Panda', nameEg: 'الباندا الأحمر', color: 'border-[#FF0055] bg-[#fff0f3] text-[#FF0055]', dot: '#FF0055' },
  { id: 'fox', name: 'Orange Fox', nameEg: 'الثعلب البرتقالي', color: 'border-amber-500 bg-amber-50 text-amber-800', dot: '#f59e0b' },
  { id: 'eagle', name: 'Golden Eagle', nameEg: 'النسر الذهبي', color: 'border-yellow-500 bg-yellow-50 text-yellow-800', dot: '#eab308' },
  { id: 'falcon', name: 'Blue Falcon', nameEg: 'الصقر الأزرق', color: 'border-sky-500 bg-sky-50 text-sky-800', dot: '#0284c7' },
  { id: 'owl', name: 'Charcoal Owl', nameEg: 'البومة الفحمية', color: 'border-[#262626] bg-[#f9f9f9] text-[#262626]', dot: '#262626' },
  { id: 'wolf', name: 'Silver Wolf', nameEg: 'الذئب الفضي', color: 'border-slate-500 bg-slate-50 text-slate-800', dot: '#64748b' },
];

export const TableLobbyModal: React.FC = () => {
  const isPinModalOpen = useAppStore((state) => state.isPinModalOpen);
  const pendingJoinTable = useAppStore((state) => state.pendingJoinTable);
  const closePinModal = useAppStore((state) => state.closePinModal);
  const joinTableWithPin = useAppStore((state) => state.joinTableWithPin);
  const initTableSession = useAppStore((state) => state.initTableSession);
  const tableSessions = useAppStore((state) => state.tableSessions);
  const { t, lang } = useTranslation();

  const [selectedAnimal, setSelectedAnimal] = useState(ANIMAL_IDENTITIES[0].name);
  const [customName, setCustomName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const targetTable = (pendingJoinTable || 'T-04').trim().toUpperCase();
  const existingSession = tableSessions[targetTable];
  const isNewSession = !existingSession || !existingSession.members || existingSession.members.length === 0;

  // Set of names already taken by active table diners
  const takenNames = new Set(
    (existingSession?.members || []).map((m) =>
      (m?.name || '').replace(/\s*\(Host\)$/, '').trim().toLowerCase()
    )
  );

  // Auto-select the first untaken identity when modal opens
  React.useEffect(() => {
    const firstUntaken = ANIMAL_IDENTITIES.find(
      (a) => !takenNames.has(a.name.toLowerCase())
    );
    if (firstUntaken) {
      setSelectedAnimal(firstUntaken.name);
    }
  }, [pendingJoinTable, existingSession]);

  if (!isPinModalOpen || !pendingJoinTable) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const displayName = customName.trim() || selectedAnimal;

    if (!isNewSession && takenNames.has(displayName.toLowerCase())) {
      setError(
        lang === 'eg'
          ? `الاسم "${displayName}" مستخدم بالفعل على ترابيزة ${targetTable}. يرجى اختيار اسم آخر.`
          : `Identity "${displayName}" is already seated at Table ${targetTable}. Please choose an untaken identity.`
      );
      return;
    }

    if (isNewSession) {
      initTableSession(targetTable, displayName, selectedAnimal);
      closePinModal();
      return;
    }

    if (!pin.trim()) {
      setError(t('companion.invalidPinError', { table: targetTable }));
      return;
    }

    const success = joinTableWithPin(targetTable, pin.trim(), displayName, selectedAnimal);
    if (!success) {
      setError(t('companion.invalidPinError', { table: targetTable }));
    } else {
      closePinModal();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-150"
      onClick={closePinModal}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#e5e7eb] p-6 sm:p-7 relative select-none animate-in zoom-in-95 duration-150 text-start"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closePinModal}
          className="absolute top-4 end-4 min-w-[44px] min-h-[44px] rounded-full bg-[#f9f9f9] hover:bg-[#e5e7eb] flex items-center justify-center text-[#727272] transition-colors cursor-pointer"
          aria-label={t('lobby.modal.closeAria')}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <FlameLinkLogo size="md" className="justify-center mb-3" />
          <h2 className="text-xl font-bold text-[#262626]">
            {t('lobby.modal.title', { table: targetTable })}
          </h2>
          <p className="text-[13px] text-[#727272] mt-1">
            {t('lobby.modal.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Diner Persona Identity Selector */}
          <div>
            <label className="block text-[12px] font-semibold text-[#262626] mb-1.5">
              {t('lobby.modal.switchRoleTitle')}:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ANIMAL_IDENTITIES.map((animal) => {
                const isTaken = !isNewSession && takenNames.has(animal.name.toLowerCase());
                const label = lang === 'eg' ? animal.nameEg : animal.name;
                return (
                  <button
                    key={animal.id}
                    type="button"
                    disabled={isTaken}
                    onClick={() => !isTaken && setSelectedAnimal(animal.name)}
                    className={`p-2.5 min-h-[44px] rounded-lg border text-center transition-all text-[12px] font-medium flex items-center justify-center gap-1.5 ${
                      isTaken
                        ? 'border-[#e5e7eb] bg-[#f0f0f0] text-[#949494] opacity-50 cursor-not-allowed line-through'
                        : selectedAnimal === animal.name
                        ? `${animal.color} border-2 shadow-xs ring-2 ring-[#FF0055]/20 font-bold cursor-pointer`
                        : 'border-[#e5e7eb] bg-[#f9f9f9] text-[#727272] hover:bg-white cursor-pointer'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: isTaken ? '#d1d5db' : animal.dot }}
                    />
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="custom-nickname" className="block text-[12px] font-medium text-[#262626] mb-1">
              {t('companion.yourNameLabel')}
            </label>
            <input
              id="custom-nickname"
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={t('companion.yourNamePlaceholder')}
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-lg border border-[#e5e7eb] bg-white text-[#262626] text-[14px] focus:outline-none focus:border-[#FF0055]"
            />
          </div>

          {!isNewSession && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="table-pin" className="block text-[12px] font-semibold text-[#262626]">
                  {t('companion.tablePinLabel')}
                </label>
                <span className="text-[11px] text-[#949494]">
                  {t('common.host')}
                </span>
              </div>
              <input
                id="table-pin"
                type="text"
                maxLength={4}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • •"
                className="w-full px-3.5 py-2.5 min-h-[48px] text-center tracking-widest font-mono-num text-[22px] font-bold rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055]"
              />
            </div>
          )}

          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[12px] text-center font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full min-h-[44px] py-3.5 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-[14px] font-bold transition-all btn-crimson-glow active:scale-[0.99] cursor-pointer shadow-xs flex items-center justify-center gap-2"
          >
            <span>{t('companion.joinTableBtn', { table: targetTable })}</span>
            <DirectionalArrow className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
