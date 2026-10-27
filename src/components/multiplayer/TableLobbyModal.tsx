import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { FlameLinkLogo } from '../ui/FlameLinkLogo';

const ANIMAL_IDENTITIES = [
  { id: 'panda', name: 'Red Panda', color: 'border-[#FF0055] bg-[#fff0f3] text-[#FF0055]' },
  { id: 'fox', name: 'Orange Fox', color: 'border-amber-400 bg-amber-50 text-amber-700' },
  { id: 'eagle', name: 'Golden Eagle', color: 'border-yellow-400 bg-yellow-50 text-yellow-800' },
  { id: 'falcon', name: 'Blue Falcon', color: 'border-sky-400 bg-sky-50 text-sky-700' },
  { id: 'wolf', name: 'Silver Wolf', color: 'border-slate-400 bg-slate-50 text-slate-700' },
  { id: 'tiger', name: 'Crimson Tiger', color: 'border-rose-400 bg-rose-50 text-rose-700' },
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
      setError(`Incorrect PIN for Table ${targetTable}. Ask the table host for the PIN.`);
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
          <h2 className="text-xl font-medium text-[#262626]">
            {isNewSession
              ? `Open Table ${targetTable} Session`
              : `Table ${targetTable} is Active. Join Pool?`}
          </h2>
          <p className="text-[13px] text-[#727272] mt-1">
            {isNewSession
              ? `You are the first seated diner at Table ${targetTable}. You will be assigned as Host.`
              : `Enter the 4-digit PIN displayed on the acrylic table stand or host phone.`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Diner Persona Identity Selector */}
          <div>
            <label className="block text-[12px] font-medium text-[#262626] mb-1.5">
              Choose Your Table Persona:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ANIMAL_IDENTITIES.map((animal) => (
                <button
                  key={animal.id}
                  type="button"
                  onClick={() => setSelectedAnimal(animal.name)}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer text-[12px] font-medium ${
                    selectedAnimal === animal.name
                      ? `${animal.color} border-2 shadow-xs`
                      : 'border-[#e5e7eb] bg-[#f9f9f9] text-[#727272] hover:bg-white'
                  }`}
                >
                  {animal.name}
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
              placeholder={`e.g. ${selectedAnimal} or Sarah`}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-[#262626] text-[14px] focus:outline-none focus:border-[#FF0055]"
            />
          </div>

          {!isNewSession && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="table-pin" className="block text-[12px] font-medium text-[#262626]">
                  4-Digit Table PIN
                </label>
                <span className="text-[11px] font-mono-num text-[#949494]">
                  Anti-Prank Guard
                </span>
              </div>
              <input
                id="table-pin"
                type="text"
                maxLength={4}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 4040"
                className="w-full px-3.5 py-2.5 text-center tracking-widest font-mono-num text-[20px] font-medium rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055]"
              />
            </div>
          )}

          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[12px] text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-[14px] font-medium transition-all btn-crimson-glow active:scale-[0.99] cursor-pointer shadow-xs"
          >
            {isNewSession ? `Claim Host Role for Table ${targetTable} ->` : `Join Table ${targetTable} Pool ->`}
          </button>
        </form>
      </div>
    </div>
  );
};
