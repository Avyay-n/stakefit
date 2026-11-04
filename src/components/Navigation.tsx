import React from 'react';
import { useApp } from '../context/AppContext';

export type PageId = 'feed' | 'shame-wall' | 'ledger' | 'transformation' | 'squad';

interface NavigationProps {
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
  pendingDebtsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onPageChange,
  pendingDebtsCount,
}) => {
  const { activeGroup } = useApp();

  // Count defaulted members in current group for shame wall badge
  const defaultedCount = Object.values(activeGroup.membersStats || {}).filter(
    (s) => s.status === 'defaulted'
  ).length;

  const pages = [
    {
      id: 'feed' as PageId,
      label: 'Feed',
      badge: null,
      funEmoji: '🔥',
    },
    {
      id: 'shame-wall' as PageId,
      label: 'Shame Wall',
      badge: defaultedCount > 0 ? `${defaultedCount} 💀` : null,
      badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/40',
      funEmoji: '💀',
    },
    {
      id: 'ledger' as PageId,
      label: 'Ledger & Debts',
      badge: pendingDebtsCount > 0 ? `${pendingDebtsCount} unsettled` : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
      funEmoji: '💸',
    },
    {
      id: 'transformation' as PageId,
      label: 'Transformation',
      badge: null,
      funEmoji: '📸',
    },
    {
      id: 'squad' as PageId,
      label: 'Squad Pact',
      badge: null,
      funEmoji: '⚔️',
    },
  ];

  return (
    <div className="w-full border-b border-[#27272a] bg-[#0c0c0e]/95 sticky top-16 z-30 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2.5 scrollbar-none" aria-label="Pages">
          {pages.map((p) => {
            const isActive = currentPage === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onPageChange(p.id)}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-red-600 text-white shadow-lg shadow-red-950/60 glow-red'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#18181b]'
                }`}
              >
                <span className="text-sm">{p.funEmoji}</span>
                <span>{p.label}</span>
                {p.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full ${
                      isActive ? 'bg-white/20 text-white' : p.badgeColor
                    }`}
                  >
                    {p.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
