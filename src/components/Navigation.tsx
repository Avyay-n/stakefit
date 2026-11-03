import React from 'react';
import { Activity, Receipt, Sliders, Users2 } from 'lucide-react';

export type ActiveTab = 'feed' | 'ledger' | 'body' | 'settings';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  pendingDebtsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  pendingDebtsCount,
}) => {
  const tabs = [
    {
      id: 'feed' as ActiveTab,
      label: 'Feed & Activity',
      icon: Activity,
      badge: null,
    },
    {
      id: 'ledger' as ActiveTab,
      label: 'Pact & Ledger',
      icon: Receipt,
      badge: pendingDebtsCount > 0 ? `${pendingDebtsCount} unsettled` : null,
      badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/40',
    },
    {
      id: 'body' as ActiveTab,
      label: 'Body & Transformation',
      icon: Sliders,
      badge: null,
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Group Settings',
      icon: Users2,
      badge: null,
    },
  ];

  return (
    <div className="w-full border-b border-[#27272a] bg-[#0c0c0e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-2 sm:space-x-8 overflow-x-auto py-2 scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold tracking-wide transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-red-500/10 text-white border border-red-500/30 glow-red'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#18181b]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-red-500' : 'text-zinc-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${tab.badgeColor}`}
                  >
                    {tab.badge}
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

