import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { FlameLinkLogo } from '../ui/FlameLinkLogo';

export const TableLobbyModal: React.FC = () => {
  const isPinModalOpen = useAppStore((state) => state.isPinModalOpen);
  const pendingJoinTable = useAppStore((state) => state.pendingJoinTable);
  const closePinModal = useAppStore((state) => state.closePinModal);
  const joinTableWithPin = useAppStore((state) => state.joinTableWithPin);
  const initTableSession = useAppStore((state) => state.initTableSession);
  const tableSessions = useAppStore((state) => state.tableSessions);

  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isPinModalOpen || !pendingJoinTable) return null;

  const targetTable = pendingJoinTable.trim().toUpperCase();
  const existingSession = tableSessions[targetTable];
  const isNewSession = !existingSession;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isNewSession) {
      initTableSession(targetTable, name.trim() || 'You (Host)');
      closePinModal();
      return;
    }

    if (!pin.trim()) {
      setError('Please enter the 4-digit table PIN');
      return;
    }

    const success = joinTableWithPin(targetTable, pin.trim(), name.trim() || 'Guest Diner');
    if (!success) {
      setError(`Incorrect PIN for Table ${targetTable}. Ask the first diner for the PIN.`);
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffe0e8] text-[#FF0055] text-[12px] font-mono-num font-medium">
            <span>Table Pool Security</span>
          </div>
          <h2 className="text-2xl font-medium text-[#262626] mt-2">
            Join Table {targetTable} Pool
          </h2>
          <p className="text-[13px] text-[#727272] mt-1">
            {isNewSession
              ? `You are the first diner at Table ${targetTable}. Claim host role to generate a secure PIN.`
              : `Enter your name and the 4-digit PIN displayed on the table stand or host phone.`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="member-name" className="block text-[12px] font-medium text-[#262626] mb-1">
              Your Name / Nickname
            </label>
            <input
              id="member-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah, Karim, Omar"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-[#262626] text-[14px] focus:outline-none focus:border-[#FF0055] transition-colors"
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
                className="w-full px-3.5 py-2.5 text-center tracking-widest font-mono-num text-[20px] font-medium rounded-lg border border-[#e5e7eb] bg-white text-[#262626] focus:outline-none focus:border-[#FF0055] transition-colors"
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
            {isNewSession ? `Create Table ${targetTable} Lobby ->` : `Join Table ${targetTable} Pool ->`}
          </button>
        </form>
      </div>
    </div>
  );
};
