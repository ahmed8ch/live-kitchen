import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { FlameLinkLogo } from '../ui/FlameLinkLogo';

const ANIMAL_IDENTITIES = [
  { id: 'panda', name: 'Red Panda', color: 'border-[#FF0055] bg-[#fff0f3] text-[#FF0055]', dot: '#FF0055' },
  { id: 'fox', name: 'Orange Fox', color: 'border-amber-500 bg-amber-50 text-amber-800', dot: '#f59e0b' },
  { id: 'eagle', name: 'Golden Eagle', color: 'border-yellow-500 bg-yellow-50 text-yellow-800', dot: '#eab308' },
  { id: 'falcon', name: 'Blue Falcon', color: 'border-sky-500 bg-sky-50 text-sky-800', dot: '#0284c7' },
  { id: 'owl', name: 'Emerald Owl', color: 'border-emerald-500 bg-emerald-50 text-emerald-800', dot: '#10b981' },
  { id: 'wolf', name: 'Silver Wolf', color: 'border-slate-500 bg-slate-50 text-slate-800', dot: '#64748b' },
];

export const TableLobbyModal: React.FC = () => {
  const isPinModalOpen = useAppStore((state) => state.isPinModalOpen);
  const pendingJoinTable = useAppStore((state) => state.pendingJoinTable);
  const closePinModal = useAppStore((state) => state.closePinModal);
  const joinTableWithPin = useAppStore((state) => state.joinTableWithPin);
  const initTableSession = useAppStore((state) => state.initTableSession);
  const tableSessions = useAppStore((state) => state.tableSessions);

  const [selectedAnimal, setSelectedAnimal] = useState(ANIMAL_IDENTITIES[0].name);
  const [customName, setCustomName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isPinModalOpen || !pendingJoinTable) return null;

  const targetTable = pendingJoinTable.trim().toUpperCase();
  const existingSession = tableSessions[targetTable];
  const isNewSession = !existingSession || existingSession.members.length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const displayName = customName.trim() || selectedAnimal;

    if (isNewSession) {
      initTableSession(targetTable, displayName, selectedAnimal);
      closePinModal();
      return;
    }

    if (!pin.trim()) {
      setError('Please enter the 4-digit table PIN');
      return;
    }

    const success = joinTableWithPin(targetTable, pin.trim(), displayName, selectedAnimal);
    if (!success) {
      setError(`Incorrect PIN for Table ${targetTable}. Ask the seated host for the PIN.`);
    } else {
      closePinModal();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={closePinModal}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#e5e7eb] p-6 sm:p-7 relative select-none animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closePinModal}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#f9f9f9] hover:bg-[#e5e7eb] flex items-center justify-center text-[#727272] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <FlameLinkLogo size="md" className="justify-center mb-3" />
          <h2 className="text-xl font-bold text-[#262626]">
            {isNewSession
              ? `Open Table ${targetTable} Session`
              : `Table ${targetTable} is currently active. Join the pool?`}
          </h2>
          <p className="text-[13px] text-[#727272] mt-1">
            {isNewSession
              ? `You are the first seated diner at Table ${targetTable}. You will be assigned as Host with a private PIN.`
              : `Enter the 4-digit PIN provided by your table host to join the shared cart.`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Diner Persona Identity Selector */}
          <div>
            <label className="block text-[12px] font-semibold text-[#262626] mb-1.5">
              Select Your Diner Identity:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ANIMAL_IDENTITIES.map((animal) => (
                <button
                  key={animal.id}
                  type="button"
                  onClick={() => setSelectedAnimal(animal.name)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer text-[12px] font-medium flex items-center justify-center gap-1.5 ${
                    selectedAnimal === animal.name
                      ? `${animal.color} border-2 shadow-xs ring-2 ring-[#FF0055]/20 font-bold`
                      : 'border-[#e5e7eb] bg-[#f9f9f9] text-[#727272] hover:bg-white'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: animal.dot }}
                  />
                  <span className="truncate">{animal.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="custom-nickname" className="block text-[12px] font-medium text-[#262626] mb-1">
              Nickname (Optional)
            </label>
            <input
              id="custom-nickname"
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={`e.g. ${selectedAnimal} or Alex`}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-[#262626] text-[14px] focus:outline-none focus:border-[#FF0055]"
            />
          </div>

          {!isNewSession && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="table-pin" className="block text-[12px] font-semibold text-[#262626]">
                  Enter 4-Digit Table PIN
                </label>
                <span className="text-[11px] font-mono-num text-[#949494]">
                  Ask Seated Host
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
                className="w-full px-3.5 py-2.5 text-center tracking-widest font-mono-num text-[22px] font-bold rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055]"
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
            className="w-full py-3.5 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-[14px] font-bold transition-all btn-crimson-glow active:scale-[0.99] cursor-pointer shadow-xs"
          >
            {isNewSession ? `Start Table ${targetTable} Session ->` : `Join Table ${targetTable} Pool ->`}
          </button>
        </form>
      </div>
    </div>
  );
};
