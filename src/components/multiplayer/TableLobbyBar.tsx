import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

export const TableLobbyBar: React.FC = () => {
  const activeTable = useAppStore((state) => state.activeTable);
  const activeTablePin = useAppStore((state) => state.activeTablePin);
  const currentMember = useAppStore((state) => state.currentMember);
  const companionMember = useAppStore((state) => state.companionMember);
  const tableSessions = useAppStore((state) => state.tableSessions);
  const openPinModal = useAppStore((state) => state.openPinModal);
  const setMemberReadyToPay = useAppStore((state) => state.setMemberReadyToPay);
  const removeMemberFromTable = useAppStore((state) => state.removeMemberFromTable);
  const resetTableSession = useAppStore((state) => state.resetTableSession);
  const leaveTableSession = useAppStore((state) => state.leaveTableSession);
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

  const location = useLocation();
  const isCompanionView =
    location.pathname.startsWith('/companion') ||
    location.pathname.startsWith('/guest-order') ||
    (typeof window !== 'undefined' &&
      (window.location.pathname.startsWith('/companion') || window.location.pathname.startsWith('/guest-order')));
  const session = activeTable ? tableSessions[activeTable] : null;
  const members = session?.members || [];
  const isHost = !isCompanionView;
  const pin = activeTablePin || session?.pin || '----';

  const hostMember = session?.members?.find((m) => m.isHost) || (currentMember?.isHost ? currentMember : null);
  const effectiveUser = isHost
    ? (hostMember || currentMember)
    : (companionMember || currentMember);

  const handleCopyPin = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(pin);
      setCopied(true);
      showToast(`Copied Table ${activeTable} PIN: ${pin}`);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleReady = () => {
    if (!activeTable || !effectiveUser) return;
    const nextState = !effectiveUser.isReadyToPay;
    setMemberReadyToPay(activeTable, effectiveUser.id, nextState);
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
                {effectiveUser?.name || 'Guest'}
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

        {/* Center: Party Members seated with Kick / Leave Controls */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none">
          <span className="text-[11px] text-[#727272] shrink-0 font-mono-num">
            Diners ({members.length}):
          </span>

          {members.map((member, idx) => {
            if (!member) return null;
            const isMe = isHost
              ? Boolean(member.isHost || (hostMember && member.id === hostMember.id))
              : Boolean(effectiveUser && member.id === effectiveUser.id);
            return (
              <div
                key={member.id || `mem-${idx}`}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium shrink-0 border transition-colors ${
                  isMe
                    ? 'bg-white border-[#FF0055] text-[#262626] shadow-xs'
                    : 'bg-white/80 border-[#e5e7eb] text-[#616161]'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    member.isReadyToPay ? 'bg-[#15803d]' : 'bg-[#e5e7eb]'
                  }`}
                  title={member.isReadyToPay ? 'Ready: done choosing dishes' : 'Still choosing dishes'}
                />
                <span>{member.name || 'Diner'}{member.isHost ? ' (Host)' : ''}</span>

                {/* Host can kick unwanted/duplicate companions */}
                {isHost && !member.isHost && activeTable && (
                  <button
                    type="button"
                    onClick={() => removeMemberFromTable(activeTable, member.id)}
                    className="w-4 h-4 rounded-full bg-[#f9f9f9] hover:bg-red-100 text-[#949494] hover:text-red-600 flex items-center justify-center text-[11px] ml-1 cursor-pointer transition-colors"
                    title={`Remove ${member.name || 'Diner'}`}
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}

          {/* Quick Clean Reset for Host if duplicates exist */}
          {isHost && members.length > 1 && (
            <button
              onClick={() => resetTableSession(activeTable)}
              className="text-[10px] font-mono-num text-[#727272] hover:text-[#FF0055] px-2 py-0.5 rounded bg-white border border-[#e5e7eb] shrink-0 cursor-pointer"
              title="Reset table session to single host"
            >
              Reset Diners
            </button>
          )}
        </div>

        {/* Right: Seated Actions */}
        <div className="flex items-center gap-2">
          {!isHost && effectiveUser && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleToggleReady}
                title={
                  effectiveUser.isReadyToPay
                    ? 'You are marked ready. Click to switch back to browsing.'
                    : 'Notify the table host that you have finished picking your dishes.'
                }
                className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all cursor-pointer shadow-xs ${
                  effectiveUser.isReadyToPay
                    ? 'bg-[#15803d] text-white hover:bg-[#166534]'
                    : 'bg-white text-[#262626] border border-[#e5e7eb] hover:border-[#FF0055]'
                }`}
              >
                {effectiveUser.isReadyToPay ? 'Ready (Done Choosing)' : 'I am Done Choosing'}
              </button>
              {activeTable && (
                <button
                  type="button"
                  onClick={() => leaveTableSession(activeTable, effectiveUser.id)}
                  className="text-[11px] font-mono-num text-red-600 hover:underline px-1 cursor-pointer"
                  title="Leave table pool"
                >
                  Leave
                </button>
              )}
            </div>
          )}

          {isHost && (
            <span className="text-[11px] font-mono-num text-[#727272] px-2.5 py-1 rounded bg-white border border-[#ffd1dc]/60">
              Host Controls Active ({members.filter((m) => m?.isReadyToPay).length}/{members.length} Diners Ready)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
