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
            Dine-In Self-Ordering Active
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
        {/* Left: Table Seating (Strictly 0 flicking dots per user directive) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono-num font-bold text-[14px] text-[#262626]">
              Table {activeTable}
            </span>
            {isHost ? (
              <span className="text-[10px] font-mono-num font-semibold uppercase px-2 py-0.5 rounded-full bg-[#FF0055] text-white">
                Host
              </span>
            ) : (
              <span className="text-[10px] font-mono-num font-semibold uppercase px-2 py-0.5 rounded-full bg-white border border-[#ffd1dc] text-[#FF0055]">
                {currentMember?.name || 'Guest'}
              </span>
            )}
          </div>

          <div className="h-4 w-[1px] bg-[#ffd1dc]" />

          {/* 4-digit PIN Badge: Strictly visible ONLY to the first scanner / Host (Agent 01 spec) */}
          {isHost ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono-num uppercase tracking-wider text-[#727272]">
                Table PIN:
              </span>
              <button
                onClick={handleCopyPin}
                title="Click to copy 4-digit PIN for companions sitting at your table"
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white border border-[#ffd1dc] text-[#FF0055] text-[13px] font-mono-num font-bold shadow-xs hover:border-[#FF0055] transition-colors cursor-pointer"
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
          ) : (
            <span className="text-[11px] font-mono-num text-[#727272]">
              Shared Table Pool
            </span>
          )}
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
                title={member.isReadyToPay ? 'Ready to pay' : 'Browsing dishes'}
              />
              <span>{member.name}{member.isHost ? ' (Host)' : ''}</span>
            </div>
          ))}
        </div>

        {/* Right: Seated Actions (Zero redundant join button) */}
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

          {isHost && (
            <a
              href={`/companion?table=${activeTable}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono-num text-[#262626] hover:text-[#FF0055] bg-white rounded-full border border-[#e5e7eb] hover:border-[#ffd1dc] transition-colors cursor-pointer shadow-xs"
              title="Open Companion Guest POV in a separate window or tab to test multiplayer ordering"
            >
              <span>+ Companion Tab</span>
              <svg className="w-3 h-3 text-[#727272]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
