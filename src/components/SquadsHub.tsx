import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Plus,
  HelpCircle,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import { playPop } from '../utils/audio';

interface SquadsHubProps {
  onSelectSquad: (squadId: string) => void;
  onOpenCreateSquad: () => void;
  onOpenAuth: () => void;
  onBackToHome: () => void;
}

export const SquadsHub: React.FC<SquadsHubProps> = ({
  onSelectSquad,
  onOpenCreateSquad,
  onOpenAuth,
  onBackToHome,
}) => {
  const { groups, activeGroup, activeUser, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0d0d0e] text-[#ededed] font-sans selection:bg-emerald-500/30 selection:text-white">
      {/* Supabase-Style Minimal Top Bar Header */}
      <header className="w-full bg-[#111113] border-b border-[#222225] h-14 px-4 sm:px-8 flex items-center justify-between text-xs">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playPop();
              onBackToHome();
            }}
            className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors group"
            title="Go to StakeFit Home"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
              ⚡
            </div>
            <span className="font-bold text-zinc-400 group-hover:text-white">StakeFit</span>
          </button>
          <span className="text-zinc-600 font-bold">/</span>
          <span className="text-white font-bold">Organizations & Pacts</span>
        </div>

        {/* Right: Search, Feedback, Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => showToast('Feedback channel opened. Thank you!')}
            className="hidden sm:inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Feedback</span>
          </button>

          {/* Quick Search trigger */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#18181b] border border-[#27272a] text-zinc-400 text-[11px] font-mono">
            <Search className="w-3 h-3 text-zinc-500" />
            <span>Search...</span>
            <kbd className="px-1 rounded bg-[#222225] text-zinc-400 text-[9px]">Ctrl K</kbd>
          </div>

          <button
            onClick={() => showToast('StakeFit Help Center: 24/7 Community Support')}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors"
            title="Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={() => {
              playPop();
              onOpenAuth();
            }}
            className="flex items-center gap-2 pl-2 border-l border-[#27272a] text-left group"
            title="Switch User / Account"
          >
            <img
              src={activeUser.avatar}
              alt={activeUser.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-700 group-hover:ring-emerald-500 transition-all"
            />
            <span className="hidden sm:inline text-xs font-bold text-zinc-200 group-hover:text-white">
              {activeUser.name.split(' ')[0]}
            </span>
          </button>
        </div>
      </header>

      {/* Main Hub Body (Exact Visual Matching to Image 1) */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-8">
        {/* Page Title: "Your organizations" */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Your organizations & fitness squads
          </h1>
          <p className="text-xs text-zinc-400 font-medium">
            Manage your active financial pacts, review member stakes, or launch a new private squad.
          </p>
        </div>

        {/* Search Bar + "+ New Organization" Action Button Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for an organization or squad..."
              className="w-full pl-10 pr-4 py-2 bg-[#141416] border border-[#27272a] rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* "+ New organization" Button (Green/Emerald pill button like Supabase in Image 1) */}
          <button
            onClick={() => {
              playPop();
              onOpenCreateSquad();
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-lg shadow-emerald-950/40 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ New organization / squad</span>
          </button>
        </div>

        {/* Squad Organizations List / Cards */}
        <div className="space-y-3">
          {filteredGroups.length === 0 ? (
            <div className="p-12 text-center bg-[#141416] border border-[#222225] rounded-2xl text-zinc-400 space-y-3">
              <p className="text-xs">No organizations or squads found matching "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-emerald-400 hover:underline font-bold"
              >
                Clear search filter
              </button>
            </div>
          ) : (
            filteredGroups.map((group) => {
              const isCurrent = group.id === activeGroup.id;
              const totalPool =
                group.memberIds.length * group.targetDaysPerWeek * group.penaltyPerMissedDay;

              return (
                <div
                  key={group.id}
                  onClick={() => {
                    playPop();
                    onSelectSquad(group.id);
                  }}
                  className="w-full p-4 sm:p-5 rounded-2xl bg-[#141416] hover:bg-[#18181b] border border-[#222225] hover:border-zinc-700 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-4">
                    {/* Organization Icon Box (matching Image 1 Gen_F icon layout) */}
                    <div className="w-12 h-12 rounded-xl bg-[#1b1b1e] border border-zinc-800 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shadow-sm">
                      {group.avatar}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors">
                          {group.name}
                        </h3>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                            Current Active
                          </span>
                        )}
                      </div>

                      {/* Subtitle matching "Free Plan • 2 projects" from Image 1 */}
                      <div className="text-xs text-zinc-400 font-mono mt-0.5 flex flex-wrap items-center gap-2">
                        <span>{group.targetDaysPerWeek}d/week</span>
                        <span>•</span>
                        <span>
                          {group.currency}
                          {group.penaltyPerMissedDay}/missed day
                        </span>
                        <span>•</span>
                        <span>{group.memberIds.length} members</span>
                        <span>•</span>
                        <span className="text-amber-400 font-bold">
                          Pool: {group.currency}
                          {totalPool.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right side CTA badge */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-xs font-bold text-zinc-400 group-hover:text-white flex items-center gap-1 transition-colors">
                      <span>Enter Squad Dashboard</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Back to Landing link */}
        <div className="pt-6 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
          <button
            onClick={() => {
              playPop();
              onBackToHome();
            }}
            className="hover:text-zinc-300 transition-colors flex items-center gap-1"
          >
            <span>← Back to StakeFit Home Page</span>
          </button>
          <span>StakeFit Pro • Financial Accountability Engine</span>
        </div>
      </main>
    </div>
  );
};
