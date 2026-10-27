import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

export const TableLobbyBar: React.FC = () => {
  const activeTable = useAppStore((state) => state.activeTable);
  const activeTablePin = useAppStore((state) => state.activeTablePin);
  const currentMember = useAppStore((state) => state.currentMember);
  const tableSessions = useAppStore((state) => state.tableSessions);
  const openPinModal = useAppStore((state) => state.openPinModal);
  const setMemberReadyToPay = useAppStore((state) => state.setMemberReadyToPay);
  const showToast = useAppStore((state) => state.showToast);

  const [copied, setCopied] = useState(false);

  if (!activeTable) {
    return (
      <div className="w-full bg-[#f9f9f9] border-b border-[#e5e7eb] px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px]">
          <span className="text-[#727272]">
            Dine-In Self Ordering
          </span>
          <button
            onClick={() => openPinModal('T-04')}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#f0f0f0] border border-[#e5e7eb] text-[#262626] font-medium text-[12px] transition-colors cursor-pointer shadow-xs"
          >
            Join Table Pool -&gt;
          </button>
        </div>
      </div>
    );
  }

  const session = tableSessions[activeTable];
  const members = session?.members || [];
  const isHost = currentMember?.isHost ?? false;
  const pin = activeTablePin || session?.pin || '----';

  const handleCopyPin = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(pin);
      setCopied(true);
      showToast(`Copied Table ${activeTable} PIN: ${pin}`);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleReady = () => {
    if (!currentMember) return;
    const nextState = !currentMember.isReadyToPay;
    setMemberReadyToPay(activeTable, currentMember.id, nextState);
  };

  return (
    <div className="w-full bg-[#fff0f3] border-b border-[#ffd1dc] px-4 py-2.5 transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Table ID, PIN, and Copy Action (NO FLICKING DOTS) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono-num font-bold text-[14px] text-[#262626]">
              Table {activeTable}
            </span>
            {isHost && (
              <span className="text-[10px] font-mono-num font-semibold uppercase px-2 py-0.5 rounded-full bg-[#FF0055] text-white">
                Host
              </span>
            )}
          </div>

          <div className="h-4 w-[1px] bg-[#ffd1dc]" />

          {/* 4-digit PIN Badge with Copy Trigger */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono-num uppercase tracking-wider text-[#727272]">
              PIN:
            </span>
            <button
              onClick={handleCopyPin}
              title="Click to copy 4-digit PIN for companions"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white border border-[#ffd1dc] text-[#FF0055] text-[13px] font-mono-num font-semibold shadow-xs hover:border-[#FF0055] transition-colors cursor-pointer"
            >
              <span>{pin}</span>
              <svg className="w-3.5 h-3.5 text-[#727272]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
            {copied && (
              <span className="text-[11px] font-mono-num text-[#15803d]">Copied!</span>
            )}
          </div>
        </div>

        {/* Center: Party Members seated */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none">
          <span className="text-[11px] text-[#727272] shrink-0 font-mono-num">
            Diners ({members.length}):
          </span>

          {members.map((member) => (
            <div
              key={member.id}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium shrink-0 border transition-colors ${
                member.id === currentMember?.id
                  ? 'bg-white border-[#FF0055] text-[#262626] shadow-xs'
                  : 'bg-white/80 border-[#e5e7eb] text-[#616161]'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  member.isReadyToPay ? 'bg-[#15803d]' : 'bg-[#e5e7eb]'
                }`}
                title={member.isReadyToPay ? 'Ready to settle bill' : 'Choosing dishes'}
              />
              <span>{member.name}</span>
            </div>
          ))}
        </div>

        {/* Right: Guest Ready Toggle & Join Table Action */}
        <div className="flex items-center gap-2">
          {!isHost && currentMember && (
            <button
              onClick={handleToggleReady}
              className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all cursor-pointer shadow-xs ${
                currentMember.isReadyToPay
                  ? 'bg-[#15803d] text-white hover:bg-[#166534]'
                  : 'bg-white text-[#262626] border border-[#e5e7eb] hover:border-[#FF0055]'
              }`}
            >
              {currentMember.isReadyToPay ? 'Marked Ready' : 'Mark Ready to Pay'}
            </button>
          )}

          <button
            onClick={() => openPinModal(activeTable)}
            className="px-2.5 py-1 text-[11px] font-mono-num text-[#727272] hover:text-[#262626] bg-white rounded-md border border-[#e5e7eb] transition-colors cursor-pointer"
          >
            Join Table
          </button>
        </div>
      </div>
    </div>
  );
};
