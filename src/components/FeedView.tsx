import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBar } from './StatusBar';
import { PostCard } from './PostCard';
import { PlusCircle, CheckCircle2, AlertCircle, Shield, ShieldCheck } from 'lucide-react';
import { playShieldSound, playPop } from '../utils/audio';

interface FeedViewProps {
  onOpenCheckIn: () => void;
  onOpenDispute: (postId: string) => void;
}

export const FeedView: React.FC<FeedViewProps> = ({ onOpenCheckIn, onOpenDispute }) => {
  const {
    posts,
    activeGroupId,
    activeUserId,
    activeUser,
    activeGroup,
    activateStreakShield,
    showToast,
  } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const userStats = activeGroup.membersStats[activeUserId] || {
    userId: activeUserId,
    daysLoggedThisWeek: 0,
    daysVerifiedThisWeek: 0,
    missedDays: 0,
    isDoubleDown: false,
    shieldUsedThisWeek: false,
    dailyStatuses: {},
    status: 'yet_to_log',
  };

  const targetDays = activeGroup.targetDaysPerWeek;
  const verifiedDays = userStats.daysVerifiedThisWeek;
  const isTargetMet = verifiedDays >= targetDays;
  const daysNeeded = Math.max(0, targetDays - verifiedDays);

  const totalSquadMembers = activeGroup.memberIds.length;
  const verifiedCountToday = activeGroup.memberIds.filter(
    (id) => activeGroup.membersStats[id]?.status === 'verified'
  ).length;
  const squadEnergyPct = Math.round((verifiedCountToday / Math.max(1, totalSquadMembers)) * 100);

  // Filter posts for active group
  const groupPosts = posts.filter((p) => p.groupId === activeGroupId);

  const filteredPosts = groupPosts.filter((post) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'needs_review') return post.status === 'pending' || post.vouches.length < 2;
    if (selectedFilter === 'mine') return post.userId === activeUserId;
    if (selectedFilter === 'verified') return post.status === 'verified';
    return post.workoutType.toLowerCase() === selectedFilter.toLowerCase();
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* High-Contrast Red, White & Black Hero Motivation Card */}
      <div className="bg-[#121214] border-2 border-red-600 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-2xl glow-red">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={activeUser.avatar}
              alt={activeUser.name}
              className="w-14 h-14 rounded-full object-cover ring-4 ring-red-600 shadow-lg"
            />
            <span className="absolute -bottom-1 -right-1 text-sm bg-black rounded-full p-0.5">🔥</span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                Ready for today's sweat, {activeUser.name.split(' ')[0]}?
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-600 text-white shadow-sm">
                Active Pact
              </span>
              {activeUser.shieldActive && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-600 text-white flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Shielded Today</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-300 mt-1 font-semibold">
              {isTargetMet ? (
                <span className="text-emerald-400 font-black flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Target Met ({verifiedDays}/{targetDays}d)! 100% Dividend Qualified.</span>
                </span>
              ) : (
                <span className="text-zinc-300 font-bold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span>
                    {verifiedDays} of {targetDays} days verified • <strong className="text-red-400">{daysNeeded} more required before Sunday</strong>
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
          {activeUser.shieldsAvailable > 0 && !activeUser.shieldActive && !isTargetMet && (
            <button
              onClick={() => {
                activateStreakShield();
                playShieldSound();
                showToast('Rest shield deployed! Fine waived for today.');
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
              title="Deploy emergency shield for rest or travel day"
            >
              <Shield className="w-4 h-4" />
              <span>Use Rest Shield ({activeUser.shieldsAvailable})</span>
            </button>
          )}

          <button
            onClick={() => {
              playPop();
              onOpenCheckIn();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-xl shadow-red-900/50 glow-red border-2 border-red-500 active:scale-95 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Today's Proof</span>
          </button>
        </div>
      </div>

      {/* Daily Squad Roll Call Strip */}
      <StatusBar />

      {/* Squad Sweat Meter (Gamified Athletic Progress) */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#18181b] via-[#141214] to-[#121214] border border-red-900/40 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 font-bold shrink-0">
            🔥
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Squad Sweat Meter
              </span>
              <span className="text-[10px] font-mono font-black text-amber-400 bg-amber-950/60 border border-amber-800 px-1.5 py-0.5 rounded">
                {verifiedCountToday} of {totalSquadMembers} Verified ({squadEnergyPct}%)
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
              {squadEnergyPct === 100
                ? '🏆 100% SQUAD CHECKED IN! Dividend pool protected, zero defaults today!'
                : `${totalSquadMembers - verifiedCountToday} member(s) still need to log or get vouches before midnight.`}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full sm:w-48 shrink-0 space-y-1">
          <div className="w-full h-2.5 bg-[#09090b] rounded-full overflow-hidden border border-zinc-800 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${squadEnergyPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase font-bold">
            <span>0%</span>
            <span>Squad Target</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs - Athletic Red, White & Black */}
      <div className="flex items-center justify-between gap-3 border-b-2 border-[#27272a] pb-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {[
            { id: 'all', label: 'All Proofs' },
            { id: 'needs_review', label: 'Needs Vouches ⚠️' },
            { id: 'verified', label: 'Verified ✓' },
            { id: 'mine', label: 'My Posts' },
            { id: 'gym', label: 'Gym' },
            { id: 'running', label: 'Running' },
            { id: 'calisthenics', label: 'Calisthenics' },
          ].map((tab) => {
            const isActive = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-red-600 text-white shadow-lg shadow-red-950/60 border-2 border-red-500 scale-105'
                    : 'text-zinc-400 hover:text-white hover:bg-[#18181b] border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Workout Posts Feed */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center bg-[#09090b] border-2 border-dashed border-[#27272a] rounded-3xl text-zinc-400 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center mx-auto shadow-md">
              <PlusCircle className="w-6 h-6 text-red-600" />
            </div>
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              No check-ins under this filter
            </h4>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Upload your workout proof or review your squad mates' posts to verify their days.
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} onOpenDispute={onOpenDispute} />
          ))
        )}
      </div>
    </div>
  );
};
