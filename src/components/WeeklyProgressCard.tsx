import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Flame,
  Shield,
  Target,
  AlertOctagon,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const WeeklyProgressCard: React.FC = () => {
  const {
    activeUser,
    activeGroup,
    activateStreakShield,
  } = useApp();

  const userStats = activeGroup.membersStats[activeUser.id] || {
    userId: activeUser.id,
    daysLoggedThisWeek: 0,
    daysVerifiedThisWeek: 0,
    missedDays: 0,
    isDoubleDown: activeUser.isDoubleDown,
    shieldUsedThisWeek: activeUser.shieldActive,
    dailyStatuses: {},
    status: 'yet_to_log',
  };

  const targetDays = activeGroup.targetDaysPerWeek;
  const verifiedDays = userStats.daysVerifiedThisWeek;
  const progressPercent = Math.min(100, Math.round((verifiedDays / targetDays) * 100));
  const isTargetMet = verifiedDays >= targetDays;
  const daysRemaining = targetDays - verifiedDays;

  // Potential penalty if they don't finish
  const penaltyPerDay = activeGroup.penaltyPerMissedDay;
  const potentialPenalty = Math.max(0, daysRemaining) * penaltyPerDay;

  return (
    <div className="w-full bg-[#121214] text-white border border-[#27272a] rounded-3xl p-5 sm:p-6 shadow-xl mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Col 1: Weekly Target Progress */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-red-950/60 border border-red-800 text-red-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>Weekly Commitment Pact</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#18181b] border border-zinc-800 text-zinc-300 font-mono font-bold">
                    Cycle #{activeGroup.cycleNumber}
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 font-medium">
                  Target: {targetDays} verified workout days before Sunday 11:59 PM
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isTargetMet ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800 text-emerald-400 text-xs font-black">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Target 100% Met! Dividend Eligible</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-800 text-amber-400 text-xs font-bold font-mono">
                  <AlertOctagon className="w-4 h-4 text-amber-400" />
                  <span>{daysRemaining} more {daysRemaining === 1 ? 'day' : 'days'} needed</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar & Day Markers */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-2 text-zinc-400">
              <span className="text-white font-black">
                {verifiedDays} of {targetDays} Days Verified ({progressPercent}%)
              </span>
              <span>
                Penalty at risk:{' '}
                <span className={potentialPenalty > 0 ? 'text-red-400 font-black' : 'text-emerald-400 font-black'}>
                  {activeGroup.currency}{potentialPenalty}
                </span>
              </span>
            </div>

            <div className="w-full h-3.5 bg-[#18181b] rounded-full p-0.5 border border-[#27272a] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isTargetMet
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-md'
                    : 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 shadow-md'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Daily check-in pip boxes */}
            <div className="flex items-center gap-2 mt-3">
              {Array.from({ length: targetDays }).map((_, idx) => {
                const isDone = idx < verifiedDays;
                return (
                  <div
                    key={idx}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-center text-xs font-black font-mono border transition-all ${
                      isDone
                        ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                        : 'bg-[#18181b] border-zinc-800 text-zinc-500'
                    }`}
                  >
                    Day {idx + 1} {isDone ? '✓' : '—'}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Col 2: Habit Mechanics (Streaks & Shields) */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-4 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-red-500" />
              <span>Habit Mechanics</span>
            </span>
            <div className="flex items-center gap-1.5 text-xs font-mono font-black text-amber-400">
              <Flame className="w-4 h-4 fill-amber-500" />
              <span>{activeUser.streakDays}d Streak ({activeUser.streakWeeks} wks)</span>
            </div>
          </div>

          {/* Streak Shield Mechanism */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#121214] border border-[#27272a] shadow-sm">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-1.5 rounded-lg border ${
                  activeUser.shieldActive
                    ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                }`}
              >
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  Emergency Shield
                  <span className="text-[10px] text-zinc-400">({activeUser.shieldsAvailable} left)</span>
                </div>
                <div className="text-[10px] text-zinc-400">
                  {activeUser.shieldActive
                    ? 'Active today: protected from penalty'
                    : 'Earn shields via streak milestones'}
                </div>
              </div>
            </div>

            <button
              onClick={activateStreakShield}
              disabled={activeUser.shieldActive || activeUser.shieldsAvailable <= 0}
              className={`px-3 py-1 text-xs font-black rounded-lg transition-all ${
                activeUser.shieldActive
                  ? 'bg-blue-950 text-blue-300 border border-blue-800 cursor-default'
                  : activeUser.shieldsAvailable > 0
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {activeUser.shieldActive ? 'Active' : 'Use'}
            </button>
          </div>

          <div className="text-[11px] font-mono text-zinc-400 bg-[#121214] p-2.5 rounded-xl border border-[#27272a]">
            🎯 Next Shield Milestone: <strong className="text-amber-400">30-Day Streak</strong> (2 days to unlock!)
          </div>
        </div>
      </div>
    </div>
  );
};
