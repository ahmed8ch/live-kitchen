import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n';

export const TableLobbyBar: React.FC = () => {
  const activeTable = useAppStore((state) => state.activeTable);
  const activeTablePin = useAppStore((state) => state.activeTablePin);
  const currentMember = useAppStore((state) => state.currentMember);
  const companionMember = useAppStore((state) => state.companionMember);
  const tableSessions = useAppStore((state) => state.tableSessions);
  const setActiveTable = useAppStore((state) => state.setActiveTable);
  const setMemberReadyToPay = useAppStore((state) => state.setMemberReadyToPay);
  const removeMemberFromTable = useAppStore((state) => state.removeMemberFromTable);
  const resetTableSession = useAppStore((state) => state.resetTableSession);
  const leaveTableSession = useAppStore((state) => state.leaveTableSession);
  const showToast = useAppStore((state) => state.showToast);
  const { t, lang } = useTranslation();

  const [copied, setCopied] = useState(false);
  const location = useLocation();

  if (!activeTable) {
    return null;
  }

  const isCompanionView =
    location.pathname.startsWith('/companion') ||
    location.pathname.startsWith('/guest-order') ||
    (typeof window !== 'undefined' &&
      (window.location.pathname.startsWith('/companion') || window.location.pathname.startsWith('/guest-order')));
  const session = activeTable ? tableSessions[activeTable] : null;
  const members = session?.members || [];
  const isHost = currentMember
    ? Boolean(currentMember.isHost)
    : companionMember
    ? false
    : !isCompanionView;
  const pin = activeTablePin || session?.pin || '----';

  const hostMember = session?.members?.find((m) => m.isHost) || (currentMember?.isHost ? currentMember : null);
  const effectiveUser = isHost
    ? (hostMember || currentMember)
    : (companionMember || currentMember);

  const handleCopyPin = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(pin);
      setCopied(true);
      showToast(
        lang === 'eg'
          ? `تم نسخ رمز PIN لترابيزة ${activeTable}: ${pin}`
          : `Copied Table ${activeTable} PIN: ${pin}`
      );
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleReady = () => {
    if (!activeTable || !effectiveUser) return;
    const nextState = !effectiveUser.isReadyToPay;
    setMemberReadyToPay(activeTable, effectiveUser.id, nextState);
  };

  return (
    <div className="w-full bg-[#f9f9f9] border-b border-[#e5e7eb] px-4 py-2 transition-colors text-start">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Start: Table Seating */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono-num font-bold text-[14px] text-[#262626]">
              {t('lobby.bar.tableLabel', { table: activeTable })}
            </span>
            {isHost ? (
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#FF0055] text-white">
                {t('common.host')}
              </span>
            ) : (
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-white border border-[#ffd1dc] text-[#FF0055]">
                {(effectiveUser?.name || t('common.companion')).replace(/\s*\(Host\)$/i, '')}
              </span>
            )}
          </div>

          <div className="h-4 w-[1px] bg-[#e5e7eb]" />

          {/* 4-digit PIN Badge for Host */}
          {isHost ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-[#727272]">
                {t('common.pin')}:
              </span>
              <button
                type="button"
                onClick={handleCopyPin}
                title={t('lobby.modal.pinCardHint', { table: activeTable })}
                className="inline-flex items-center gap-1.5 px-3 min-h-[44px] rounded-full bg-white border border-[#ffd1dc] text-[#FF0055] text-[13px] font-mono-num font-bold shadow-xs hover:border-[#FF0055] transition-colors cursor-pointer"
              >
                <span>{pin}</span>
                <svg className="w-3.5 h-3.5 text-[#727272]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
              {copied && (
                <span className="text-[11px] text-[#262626] font-medium">
                  {t('lobby.modal.copiedLink')}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[11px] text-[#727272]">
              {t('lobby.modal.title', { table: activeTable })}
            </span>
          )}
        </div>

        {/* Center: Party Members seated with Kick / Leave Controls */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none">
          <span className="text-[11px] text-[#727272] shrink-0 font-medium">
            {t('lobby.bar.dinersCount', { count: members.length })}:
          </span>

          {members.map((member, idx) => {
            if (!member) return null;
            const isMe = isHost
              ? Boolean(member.isHost || (hostMember && member.id === hostMember.id))
              : Boolean(effectiveUser && member.id === effectiveUser.id);
            const cleanName = (member.name || t('common.companion')).replace(/\s*\(Host\)$/i, '');

            return (
              <div
                key={member.id || `mem-${idx}`}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium shrink-0 border transition-colors ${
                  isMe
                    ? 'bg-white border-[#FF0055] text-[#262626] shadow-xs'
                    : 'bg-white border-[#e5e7eb] text-[#616161]'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    member.isReadyToPay ? 'bg-[#15803d]' : 'bg-[#e5e7eb]'
                  }`}
                  title={member.isReadyToPay ? t('common.ready') : t('common.ordering')}
                />
                <span>
                  {cleanName}
                  {member.isHost ? ` (${t('common.host')})` : ''}
                </span>

                {/* Host can remove duplicate/departed companions */}
                {isHost && !member.isHost && activeTable && (
                  <button
                    type="button"
                    onClick={() => removeMemberFromTable(activeTable, member.id)}
                    className="min-w-[44px] min-h-[44px] rounded-full bg-[#f9f9f9] hover:bg-red-50 text-[#727272] hover:text-red-600 inline-flex items-center justify-center text-sm ms-1 cursor-pointer transition-colors border border-[#e5e7eb]"
                    title={`${t('lobby.modal.removeMemberBtn')} ${cleanName}`}
                    aria-label={`${t('lobby.modal.removeMemberBtn')} ${cleanName}`}
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}

          {isHost && members.length > 1 && (
            <button
              type="button"
              onClick={() => resetTableSession(activeTable)}
              className="min-h-[44px] text-[12px] font-medium text-[#727272] hover:text-[#FF0055] px-3.5 py-1.5 rounded-full bg-white border border-[#e5e7eb] shrink-0 cursor-pointer inline-flex items-center transition-colors"
              title={t('common.clear')}
            >
              {t('common.clear')}
            </button>
          )}
        </div>

        {/* End: Seated Actions */}
        <div className="flex items-center gap-2">
          {!isHost && effectiveUser && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleToggleReady}
                className={`min-h-[44px] px-4 py-2 rounded-full text-[12px] font-medium transition-colors cursor-pointer shadow-xs inline-flex items-center justify-center ${
                  effectiveUser.isReadyToPay
                    ? 'bg-[#262626] text-white hover:bg-black'
                    : 'bg-white text-[#262626] border border-[#e5e7eb] hover:border-[#FF0055]'
                }`}
              >
                {effectiveUser.isReadyToPay
                  ? t('cart.drawer.markedReadyBtn')
                  : t('cart.drawer.markReadyBtn')}
              </button>
              {activeTable && (
                <button
                  type="button"
                  onClick={() => leaveTableSession(activeTable, effectiveUser.id)}
                  className="min-h-[44px] min-w-[44px] text-[12px] text-red-600 hover:underline px-2 cursor-pointer inline-flex items-center justify-center font-medium"
                  title={t('lobby.modal.leaveSessionBtn')}
                >
                  {t('lobby.modal.leaveSessionBtn')}
                </button>
              )}
            </div>
          )}

          {isHost && (
            <div className="flex items-center gap-2">
              {members.length > 1 && (
                <span className="text-[11px] text-[#727272] px-2.5 py-1 rounded-full bg-white border border-[#e5e7eb]">
                  <span className="font-mono-num font-bold text-[#262626]">
                    {members.filter((m) => m?.isReadyToPay).length}/{members.length}
                  </span>{' '}
                  {t('common.ready')}
                </span>
              )}
              <button
                type="button"
                onClick={() => setActiveTable(null)}
                className="min-h-[44px] px-3 py-1.5 rounded-full bg-white hover:bg-[#f0f0f0] border border-[#e5e7eb] text-[11px] font-medium text-[#727272] hover:text-[#262626] transition-colors cursor-pointer"
              >
                {t('nav.switchTablePrompt')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
