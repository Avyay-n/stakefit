import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBar } from './StatusBar';
import { PostCard } from './PostCard';
import {
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Shield,
  ShieldCheck,
  Coins,
  Clock,
  XCircle,
  ThumbsUp,
  Award,
  Sparkles,
} from 'lucide-react';
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
    users,
    vouchPost,
    activateStreakShield,
    showToast,
  } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const usersMap = new Map(users.map((u) => [u.id, u]));

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

  // Group posts
  const groupPosts = posts.filter((p) => p.groupId === activeGroupId);

  // Category counts
  const needsReviewCount = groupPosts.filter(
    (p) => p.status === 'pending' || p.vouches.length < 2
  ).length;
  const verifiedPostsCount = groupPosts.filter((p) => p.status === 'verified').length;
  const myPostsCount = groupPosts.filter((p) => p.userId === activeUserId).length;

  const filteredPosts = groupPosts.filter((post) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'needs_review') return post.status === 'pending' || post.vouches.length < 2;
    if (selectedFilter === 'mine') return post.userId === activeUserId;
    if (selectedFilter === 'verified') return post.status === 'verified';
    return post.workoutType.toLowerCase() === selectedFilter.toLowerCase();
  });

  const totalStakesAtRisk =
    activeGroup.memberIds.length *
    activeGroup.targetDaysPerWeek *
    activeGroup.penaltyPerMissedDay;

  // Defaulters count and penalty pool
  const defaultedCount = activeGroup.memberIds.filter(
    (id) => activeGroup.membersStats[id]?.status === 'defaulted'
  ).length;
  const collectedFines = defaultedCount * activeGroup.penaltyPerMissedDay;

  // Members who met target (qualified for dividend)
  const qualifiedMembers = activeGroup.memberIds.filter((id) => {
    const s = activeGroup.membersStats[id];
    return s && s.daysVerifiedThisWeek >= activeGroup.targetDaysPerWeek;
  });

  const estimatedDividendPerWinner =
    qualifiedMembers.length > 0
      ? Math.round((collectedFines + totalStakesAtRisk * 0.2) / qualifiedMembers.length)
      : 0;

  return (
    <div className="w-full max-w-[1560px] mx-auto space-y-6">
      {/* 12-Column Responsive Dashboard Layout (Utilizes 100% of Screen Width) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* Left / Main Column: Feed Stream & Primary Actions (Cols 1-8) */}
        {/* ======================================================== */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-5">
          {/* High-Contrast Hero Motivation Banner */}
          <div className="bg-[#121214] border-2 border-red-600 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-2xl glow-red">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src={activeUser.avatar}
                  alt={activeUser.name}
                  className="w-14 h-14 rounded-full object-cover ring-4 ring-red-600 shadow-lg"
                />
                <span className="absolute -bottom-1 -right-1 text-sm bg-black rounded-full p-0.5">
                  🔥
                </span>
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
                        {verifiedDays} of {targetDays} days verified •{' '}
                        <strong className="text-red-400">
                          {daysNeeded} more required before Sunday
                        </strong>
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

          {/* Mobile-Only Squad Strip (Visible on small screens, on desktop handled by right HUD) */}
          <div className="block lg:hidden space-y-4">
            <StatusBar />
            <div className="p-3.5 rounded-2xl bg-[#121214] border border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🔥</span>
                <div>
                  <div className="text-xs font-black text-white uppercase">Squad Sweat Meter</div>
                  <div className="text-[10px] text-zinc-400">
                    {verifiedCountToday} of {totalSquadMembers} Verified ({squadEnergyPct}%)
                  </div>
                </div>
              </div>
              <div className="w-32 bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-500 via-red-500 to-emerald-500 h-full rounded-full"
                  style={{ width: `${squadEnergyPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Filter Tabs Bar */}
          <div className="flex items-center justify-between gap-3 border-b-2 border-[#27272a] pb-3">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
              {[
                { id: 'all', label: 'All Proofs', count: groupPosts.length },
                { id: 'needs_review', label: 'Needs Vouches ⚠️', count: needsReviewCount },
                { id: 'verified', label: 'Verified ✓', count: verifiedPostsCount },
                { id: 'mine', label: 'My Posts', count: myPostsCount },
                { id: 'gym', label: 'Gym', count: null },
                { id: 'running', label: 'Running', count: null },
                { id: 'calisthenics', label: 'Calisthenics', count: null },
              ].map((tab) => {
                const isActive = selectedFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      playPop();
                      setSelectedFilter(tab.id);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-red-600 text-white shadow-lg shadow-red-950/60 border-2 border-red-500 scale-105'
                        : 'text-zinc-400 hover:text-white hover:bg-[#18181b] border border-transparent'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count !== null && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                          isActive ? 'bg-white text-red-600' : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
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
                <button
                  onClick={onOpenCheckIn}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md inline-flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Log Workout Now</span>
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} onOpenDispute={onOpenDispute} />
              ))
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* Right Column: Squad Tactical HUD / Command Center (Cols 9-12) */}
        {/* ======================================================== */}
        <div className="hidden lg:block lg:col-span-4 xl:col-span-4 space-y-5 sticky top-20 self-start">
          {/* HUD Widget 1: Today's Squad Roll Call Roster */}
          <div className="bg-[#121214] border border-[#27272a] rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">📋</span>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    Today's Squad Roll Call
                  </h4>
                  <p className="text-[10px] text-zinc-400">Midnight Cutoff spared no slackers</p>
                </div>
              </div>
              <span className="text-[10px] text-red-400 font-mono font-black px-2 py-0.5 rounded-full bg-red-950/60 border border-red-800">
                11:59 PM
              </span>
            </div>

            {/* Member Roster List */}
            <div className="space-y-2.5">
              {activeGroup.memberIds.map((memberId) => {
                const member = usersMap.get(memberId);
                if (!member) return null;

                const stats = activeGroup.membersStats[memberId] || {
                  userId: memberId,
                  daysLoggedThisWeek: 0,
                  daysVerifiedThisWeek: 0,
                  missedDays: 0,
                  isDoubleDown: false,
                  shieldUsedThisWeek: false,
                  dailyStatuses: {},
                  status: 'yet_to_log',
                };

                // Check if user has a pending post needing vouch
                const pendingPost = groupPosts.find(
                  (p) => p.userId === memberId && (p.status === 'pending' || p.vouches.length < 2)
                );
                const canVouchThis =
                  pendingPost &&
                  memberId !== activeUserId &&
                  !pendingPost.vouches.includes(activeUserId);

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-[#18181b] border border-zinc-800/80 hover:border-zinc-700 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className={`w-9 h-9 rounded-full object-cover ring-2 ${
                            stats.status === 'verified'
                              ? 'ring-emerald-500'
                              : stats.status === 'defaulted'
                              ? 'ring-red-500'
                              : stats.shieldUsedThisWeek
                              ? 'ring-blue-500'
                              : 'ring-amber-500'
                          }`}
                        />
                        {stats.status === 'defaulted' && (
                          <span className="absolute -bottom-1 -right-1 text-[10px]">💀</span>
                        )}
                        {stats.status === 'verified' && (
                          <span className="absolute -bottom-1 -right-1 text-[10px]">🔥</span>
                        )}
                        {stats.shieldUsedThisWeek && (
                          <span className="absolute -bottom-1 -right-1 text-[10px]">🛡️</span>
                        )}
                      </div>

                      <div className="truncate">
                        <div className="text-xs font-black text-white truncate flex items-center gap-1.5">
                          <span>{member.name}</span>
                          {member.id === activeUserId && (
                            <span className="text-[9px] font-mono text-zinc-400 bg-zinc-800 px-1 rounded">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                          {stats.daysVerifiedThisWeek}/{targetDays}d target
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {/* Status Badges */}
                      {stats.status === 'verified' && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      )}

                      {stats.status === 'defaulted' && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-red-950 text-red-400 border border-red-800 flex items-center gap-1 shadow-sm">
                          <XCircle className="w-3 h-3" />
                          <span>-{activeGroup.currency}{activeGroup.penaltyPerMissedDay}</span>
                        </span>
                      )}

                      {stats.shieldUsedThisWeek && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Shielded</span>
                        </span>
                      )}

                      {stats.status === 'pending' && (
                        <div className="flex items-center gap-1.5">
                          {canVouchThis ? (
                            <button
                              onClick={() => {
                                playPop();
                                vouchPost(pendingPost.id);
                                showToast(`👍 You vouched for ${member.name}'s workout!`);
                              }}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md flex items-center gap-1 active:scale-95"
                              title="Verify this squad mate's proof"
                            >
                              <ThumbsUp className="w-3 h-3" />
                              <span>Vouch</span>
                            </button>
                          ) : (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-amber-950/60 text-amber-300 border border-amber-800 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Review</span>
                            </span>
                          )}
                        </div>
                      )}

                      {stats.status === 'yet_to_log' && !stats.shieldUsedThisWeek && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-zinc-500 bg-zinc-900 border border-zinc-800">
                          Unlogged
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* HUD Widget 2: Squad Sweat Meter & Energy Radar */}
          <div className="bg-[#121214] border border-[#27272a] rounded-3xl p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center font-bold">
                  🔥
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    Squad Sweat Meter
                  </h4>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    {verifiedCountToday} of {totalSquadMembers} Verified ({squadEnergyPct}%)
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-black text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded-lg">
                {squadEnergyPct}%
              </span>
            </div>

            {/* Energy Bar */}
            <div className="w-full h-3 bg-[#09090b] rounded-full overflow-hidden border border-zinc-800 p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${squadEnergyPct}%` }}
              />
            </div>

            <div className="p-3 rounded-2xl bg-[#18181b] border border-zinc-800/60 text-xs text-zinc-300">
              {squadEnergyPct === 100 ? (
                <div className="flex items-center gap-2 text-emerald-400 font-black">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>100% Squad Checked In! All dividends protected.</span>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">⚠️</span>
                  <span className="text-[11px] text-zinc-400 leading-relaxed">
                    {totalSquadMembers - verifiedCountToday} member(s) still need to log proof or get 2 vouches before midnight.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* HUD Widget 3: Live Pact Pool & Financial Dividend HUD */}
          <div className="bg-[#121214] border border-[#27272a] rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Live Pact Pool & Dividends
                </h4>
              </div>
              <span className="text-[10px] font-mono font-black text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                WK #{activeGroup.cycleNumber}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-[#18181b] border border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Total Cycle Pool
                </div>
                <div className="text-lg font-black font-mono text-white mt-1">
                  {activeGroup.currency}{totalStakesAtRisk.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-800/40">
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Est. Dividend / Winner
                </div>
                <div className="text-lg font-black font-mono text-emerald-300 mt-1">
                  {activeGroup.currency}{estimatedDividendPerWinner.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#18181b] border border-zinc-800 text-[11px] text-zinc-400 space-y-1.5">
              <div className="flex items-center justify-between text-zinc-300 font-medium">
                <span>Qualified Finishers:</span>
                <span className="text-white font-bold">{qualifiedMembers.length} members</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300 font-medium">
                <span>Collected Fines Today:</span>
                <span className="text-red-400 font-bold">{activeGroup.currency}{collectedFines}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300 font-medium pt-1 border-t border-zinc-800">
                <span>Settlement Payout:</span>
                <span className="text-emerald-400 font-bold">Sunday 11:59 PM</span>
              </div>
            </div>
          </div>

          {/* HUD Widget 4: Anti-Cheat & 2-Vouch Rule */}
          <div className="bg-[#121214] border border-[#27272a] rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-wider">
              <Award className="w-4 h-4 text-red-500" />
              <span>Anti-Cheat & Vouch Rules</span>
            </div>
            <ul className="text-[11px] text-zinc-400 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">1.</span>
                <span><strong>2-Vouch Rule:</strong> Every workout requires 2 peer approvals to count toward your weekly target.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">2.</span>
                <span><strong>Auto-Pass:</strong> Undisputed GPS-matched posts auto-pass at midnight if peers forget to vouch.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">3.</span>
                <span><strong>Call Out ⚠️:</strong> Any member can dispute suspicious photos to freeze fines and protect dividends.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
