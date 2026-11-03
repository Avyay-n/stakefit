import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Flame,
  Shield,
  Zap,
  Target,
  AlertOctagon,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const WeeklyProgressCard: React.FC = () => {
  const {
    activeUser,
    activeGroup,
    toggleDoubleDown,
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
  const currentMultiplier = activeUser.isDoubleDown ? 2 : 1;
  const potentialPenalty = Math.max(0, daysRemaining) * penaltyPerDay * currentMultiplier;

  return (
    <div className="w-full bg-[#121214] border border-[#27272a] rounded-2xl p-5 sm:p-6 shadow-xl mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Col 1: Weekly Target Progress */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Weekly Commitment Pact</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                    Cycle #{activeGroup.cycleNumber}
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Target: {targetDays} verified workout days before Sunday 11:59 PM
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isTargetMet ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold glow-green">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Target 100% Met! Dividend Eligible</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono">
                  <AlertOctagon className="w-4 h-4" />
                  <span>{daysRemaining} more {daysRemaining === 1 ? 'day' : 'days'} needed</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar & Day Markers */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-2 text-zinc-400">
              <span className="text-zinc-200 font-bold">
                {verifiedDays} of {targetDays} Days Verified ({progressPercent}%)
              </span>
              <span>
                Penalty at risk:{' '}
                <span className={potentialPenalty > 0 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {activeGroup.currency}{potentialPenalty}
                </span>
              </span>
            </div>

            <div className="w-full h-3.5 bg-[#18181b] rounded-full p-0.5 border border-[#27272a] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isTargetMet
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-lg shadow-emerald-900/50'
                    : 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 shadow-lg shadow-red-900/50'
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
                    className={`flex-1 py-1.5 px-2 rounded-lg text-center text-xs font-bold font-mono border transition-all ${
                      isDone
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
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

        {/* Col 2: Habit Mechanics (Streaks, Shields & Double Down) */}
        <div className="bg-[#18181b]/80 border border-[#27272a] rounded-xl p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-red-500" />
              <span>Habit Mechanics</span>
            </span>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
              <Flame className="w-4 h-4 fill-amber-500" />
              <span>{activeUser.streakDays}d Streak ({activeUser.streakWeeks} wks)</span>
            </div>
          </div>

          {/* Streak Shield Mechanism */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#121214] border border-[#27272a]">
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
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  Emergency Shield
                  <span className="text-[10px] text-zinc-400">({activeUser.shieldsAvailable} left)</span>
                </div>
                <div className="text-[10px] text-zinc-400">
                  {activeUser.shieldActive
                    ? 'Active today: protected from penalty'
                    : 'Earned every 3 perfect weeks'}
                </div>
              </div>
            </div>

            <button
              onClick={activateStreakShield}
              disabled={activeUser.shieldActive || activeUser.shieldsAvailable <= 0}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                activeUser.shieldActive
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 cursor-default'
                  : activeUser.shieldsAvailable > 0
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {activeUser.shieldActive ? 'Active' : 'Use'}
            </button>
          </div>

          {/* Double Down Mode Mechanism */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#121214] border border-[#27272a]">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-1.5 rounded-lg border ${
                  activeUser.isDoubleDown
                    ? 'bg-red-500/20 border-red-500/40 text-red-400 glow-red'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                }`}
              >
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  Double Down Mode
                  {activeUser.isDoubleDown && (
                    <span className="text-[10px] px-1 py-0.2 bg-red-950 text-red-400 border border-red-800 rounded font-bold">
                      2X
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-zinc-400">
                  {activeUser.isDoubleDown
                    ? '2x penalty at risk, 2x dividend payout'
                    : 'Boost stakes for 2x dividend rewards'}
                </div>
              </div>
            </div>

            <button
              onClick={toggleDoubleDown}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                activeUser.isDoubleDown
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-900/50 glow-red'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
              }`}
            >
              {activeUser.isDoubleDown ? '2X On' : 'Opt In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
