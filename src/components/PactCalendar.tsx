import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Calendar as CalendarIcon,
  Flame,
  ShieldCheck,
  Dumbbell,
  Shield,
  Gift,
  Trophy,
  Check,
  X,
  RotateCcw,
} from 'lucide-react';
import { playPop, playShieldSound } from '../utils/audio';

interface DayData {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  status: 'verified' | 'rest' | 'shielded' | 'defaulted' | 'future';
  workoutType?: string;
  workoutDuration?: number;
  workoutTitle?: string;
  notes?: string;
  calories?: number;
}

interface StreakMilestone {
  days: number;
  name: string;
  shieldReward: number;
  icon: string;
  rewardTitle: string;
  description: string;
}

const STREAK_MILESTONES: StreakMilestone[] = [
  {
    days: 7,
    name: '7-Day Kickoff',
    shieldReward: 1,
    icon: '🥉',
    rewardTitle: '+1 Rest Shield',
    description: 'First perfect week logged without missing a single cutoff.',
  },
  {
    days: 14,
    name: '14-Day Iron Will',
    shieldReward: 1,
    icon: '🥈',
    rewardTitle: '+1 Rest Shield',
    description: 'Two consecutive weeks of iron-clad accountability.',
  },
  {
    days: 30,
    name: '30-Day Master',
    shieldReward: 1,
    icon: '💎',
    rewardTitle: '+1 Rest Shield + Diamond Freeze',
    description: 'One full month of unshakeable athletic discipline.',
  },
  {
    days: 60,
    name: '60-Day Titan',
    shieldReward: 2,
    icon: '⚡',
    rewardTitle: '+2 Rest Shields + Titan Status',
    description: 'Top 1% elite consistency in the entire squad network.',
  },
  {
    days: 100,
    name: '100-Day Centurion',
    shieldReward: 3,
    icon: '👑',
    rewardTitle: '+3 Rest Shields + Golden Crown',
    description: 'Legendary fitness streak enshrined in the Glory Hall.',
  },
];

export const PactCalendar: React.FC = () => {
  const { activeUser, showToast, activateStreakShield, addStreakShields } = useApp();

  // Current view month (default to November 2026)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 10, 3)); // Nov 03, 2026
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isMilestonesModalOpen, setIsMilestonesModalOpen] = useState(false);

  // Selected Day Edit State
  const [editWorkoutType, setEditWorkoutType] = useState('Gym');
  const [editDuration, setEditDuration] = useState(45);

  // User-marked custom day overrides (stored in localStorage)
  const [customDays, setCustomDays] = useState<
    Record<
      string,
      {
        status: 'verified' | 'rest' | 'shielded' | 'defaulted';
        workoutType?: string;
        workoutDuration?: number;
        workoutTitle?: string;
        calories?: number;
      }
    >
  >(() => {
    const saved = localStorage.getItem('stakefit_custom_calendar_days');
    return saved ? JSON.parse(saved) : {};
  });

  // Duolingo-style Streak Rewards Claimed State
  const [claimedMilestones, setClaimedMilestones] = useState<number[]>(() => {
    const saved = localStorage.getItem('stakefit_claimed_milestones');
    return saved ? JSON.parse(saved) : [7, 14]; // 7 & 14 days already claimed for 28-day user
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed (10 = November)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  // Real today reference
  const todayStr = '2026-11-03';

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleTodayJump = () => {
    setCurrentDate(new Date(2026, 10, 3));
  };

  // Streak Milestones Progress (Duolingo Style)
  const userStreak = activeUser.streakDays;
  const nextMilestone =
    STREAK_MILESTONES.find((m) => !claimedMilestones.includes(m.days)) ||
    STREAK_MILESTONES[STREAK_MILESTONES.length - 1];

  const daysRemainingToGoal = Math.max(0, nextMilestone.days - userStreak);
  const streakProgressPct = Math.min(
    100,
    Math.round((userStreak / nextMilestone.days) * 100)
  );
  const canClaimNext = userStreak >= nextMilestone.days && !claimedMilestones.includes(nextMilestone.days);

  // Claim a Streak Milestone Reward
  const handleClaimMilestone = (milestone: StreakMilestone) => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ef4444', '#3b82f6', '#fbbf24', '#ffffff'],
    });
    playShieldSound();
    const nextClaimed = [...claimedMilestones, milestone.days];
    setClaimedMilestones(nextClaimed);
    localStorage.setItem('stakefit_claimed_milestones', JSON.stringify(nextClaimed));
    addStreakShields(milestone.shieldReward);
    showToast(`🎉 Claimed ${milestone.rewardTitle}! (${milestone.shieldReward}x Emergency Shield added to your arsenal)`);
  };

  // Quick Day Marking Actions
  const handleMarkSelectedDay = (
    status: 'verified' | 'rest' | 'shielded',
    wType = editWorkoutType,
    duration = editDuration
  ) => {
    if (!selectedDay) return;
    playPop();

    if (status === 'shielded') {
      if (activeUser.shieldsAvailable <= 0) {
        showToast('No Emergency Shields left! Hit the 30-day streak milestone to earn your next shield.');
        return;
      }
      activateStreakShield();
      playShieldSound();
    }

    const updatedRecord = {
      status,
      workoutType: status === 'verified' ? wType : status === 'rest' ? 'Rest' : 'Shield',
      workoutDuration: status === 'verified' ? duration : 0,
      workoutTitle:
        status === 'verified'
          ? `${wType} Workout (${duration}m)`
          : status === 'rest'
          ? 'Scheduled Active Recovery Day'
          : 'Emergency Streak Shield Protected',
      calories: status === 'verified' ? duration * 8 : 0,
    };

    const nextCustom = { ...customDays, [selectedDay.dateStr]: updatedRecord };
    setCustomDays(nextCustom);
    localStorage.setItem('stakefit_custom_calendar_days', JSON.stringify(nextCustom));

    setSelectedDay((prev) => (prev ? { ...prev, ...updatedRecord } : null));
    setIsDayModalOpen(false);

    showToast(
      status === 'verified'
        ? `Marked ${selectedDay.dateStr} as Workout Day (${wType})! ✓`
        : status === 'rest'
        ? `Marked ${selectedDay.dateStr} as Scheduled Rest Day! 💤`
        : `🛡️ Rest Shield deployed on ${selectedDay.dateStr}!`
    );
  };

  const handleClearSelectedDay = () => {
    if (!selectedDay) return;
    playPop();
    const nextCustom = { ...customDays };
    delete nextCustom[selectedDay.dateStr];
    setCustomDays(nextCustom);
    localStorage.setItem('stakefit_custom_calendar_days', JSON.stringify(nextCustom));
    setIsDayModalOpen(false);
    showToast(`Reset status for ${selectedDay.dateStr}.`);
  };

  // Generate calendar days for the month (Monday-based week)
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Convert to Mon=0, Tue=1, ..., Sun=6
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

  // Previous month padding
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const days: DayData[] = [];

  // Pad previous month days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const d = new Date(year, month - 1, dayNum);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const override = customDays[dateStr];

    days.push({
      date: d,
      dateStr,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: false,
      status: override?.status || 'verified',
      workoutType: override?.workoutType || 'Gym',
      workoutDuration: override?.workoutDuration || 55,
      workoutTitle: override?.workoutTitle || 'Full Body Push / Pull',
      calories: override?.calories || 420,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const isToday = dateStr === todayStr;
    const dayOfWeek = (d.getDay() + 6) % 7; // Mon=0, Sun=6

    let status: 'verified' | 'rest' | 'shielded' | 'defaulted' | 'future' = 'verified';
    let workoutType = 'Gym';
    let workoutDuration = 50;
    let workoutTitle = 'Upper Body Hypertrophy';
    let calories = 430;

    // Check user custom override first
    if (customDays[dateStr]) {
      const c = customDays[dateStr];
      status = c.status;
      workoutType = c.workoutType || 'Gym';
      workoutDuration = c.workoutDuration || 45;
      workoutTitle = c.workoutTitle || 'Custom Logged Activity';
      calories = c.calories || 350;
    } else if (dateStr > todayStr) {
      status = 'future';
    } else if (dateStr === '2026-11-01') {
      status = 'rest';
      workoutType = 'Rest';
      workoutTitle = 'Scheduled Active Recovery';
      workoutDuration = 0;
      calories = 0;
    } else if (dateStr === '2026-10-28') {
      status = 'shielded';
      workoutType = 'Shield';
      workoutTitle = 'Emergency Streak Shield';
      workoutDuration = 0;
      calories = 0;
    } else if (dayOfWeek === 6 && dateStr < todayStr) {
      status = 'rest';
      workoutType = 'Rest';
      workoutTitle = 'Rest & Meal Prep Day';
      workoutDuration = 0;
      calories = 0;
    } else {
      status = 'verified';
      if (dayOfWeek === 1 || dayOfWeek === 4) {
        workoutType = 'Running';
        workoutTitle = 'Tempo 8K Trail Run';
        workoutDuration = 45;
        calories = 510;
      } else if (dayOfWeek === 2) {
        workoutType = 'Gym';
        workoutTitle = '5x5 Squats & Deadlifts';
        workoutDuration = 60;
        calories = 490;
      } else {
        workoutType = 'Calisthenics';
        workoutTitle = 'Weighted Dips & Pullups';
        workoutDuration = 40;
        calories = 380;
      }
    }

    days.push({
      date: d,
      dateStr,
      dayNumber: i,
      isCurrentMonth: true,
      isToday,
      status,
      workoutType,
      workoutDuration,
      workoutTitle,
      calories,
    });
  }

  // Next month padding to fill out 35 or 42 grid cells
  const remainingCells = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const d = new Date(year, month + 1, i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const override = customDays[dateStr];

    days.push({
      date: d,
      dateStr,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: false,
      status: override?.status || 'future',
      workoutType: override?.workoutType,
      workoutDuration: override?.workoutDuration,
    });
  }

  // Count month stats
  const currentMonthDays = days.filter((d) => d.isCurrentMonth && d.status !== 'future');
  const verifiedCount = currentMonthDays.filter((d) => d.status === 'verified').length;
  const restCount = currentMonthDays.filter((d) => d.status === 'rest').length;
  const shieldCount = currentMonthDays.filter((d) => d.status === 'shielded').length;

  return (
    <div className="bg-[#121214] text-white border border-[#27272a] rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Calendar Header with Sleek Dark Red, White & Black Styling */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272a] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-600 text-white shadow-md glow-red">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>Pact Activity Calendar</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600 text-white">
                  Interactive Days & Proofs
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Click any day to mark workouts, schedule rest days, or deploy emergency shields
              </p>
            </div>
          </div>
        </div>

        {/* Month Navigation & Today Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-[#18181b] hover:bg-zinc-800 border border-[#27272a] text-zinc-300 hover:text-white transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-3 py-1.5 rounded-xl bg-[#18181b] border border-[#27272a] text-white text-xs font-black uppercase tracking-wider min-w-[130px] text-center shadow-md">
            {monthNames[month]} {year}
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-[#18181b] hover:bg-zinc-800 border border-[#27272a] text-zinc-300 hover:text-white transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleTodayJump}
            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md glow-red"
          >
            Today
          </button>
        </div>
      </div>

      {/* DUOLINGO-STYLE STREAK SHIELD REWARDS BANNER */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#1c1313] via-[#1a141b] to-[#12161f] border-2 border-amber-500/40 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Flame className="w-6 h-6 fill-amber-500 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white uppercase tracking-wider">
                  Streak Shield Milestone Goal
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-700 font-mono">
                  Duolingo Rewards
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-0.5">
                Maintain your streak to earn free Emergency Rest Shields: <strong className="text-white">Goal: {nextMilestone.name} ({nextMilestone.days}d)</strong>
              </p>
            </div>
          </div>

          {/* Shields Inventory Counter & Roadmap CTA */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#18181b] border border-blue-600/40 text-blue-400 text-xs font-mono font-black shadow-md">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>{activeUser.shieldsAvailable} Shields Available</span>
            </div>

            <button
              onClick={() => setIsMilestonesModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-black uppercase tracking-wider transition-colors border border-zinc-700"
            >
              Roadmap 🗺️
            </button>
          </div>
        </div>

        {/* Duolingo Progress Bar toward Next Shield Reward */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <span>{nextMilestone.icon} Reward:</span>
              <strong className="text-white">{nextMilestone.rewardTitle}</strong>
            </span>
            <span className="text-zinc-300 font-bold">
              {userStreak} / {nextMilestone.days} Days ({streakProgressPct}%)
              {daysRemainingToGoal > 0 ? ` • ${daysRemainingToGoal} days left!` : ' • Goal Reached!'}
            </span>
          </div>

          <div className="w-full h-3 bg-[#121214] rounded-full p-0.5 border border-[#27272a] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 transition-all duration-500 shadow-md"
              style={{ width: `${streakProgressPct}%` }}
            />
          </div>
        </div>

        {/* Claim Reward Button or Milestone Status */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
            <span>Unlocked:</span>
            <span className="text-emerald-400 font-bold">7d Shield ✓</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">14d Shield ✓</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">30d (2d to go)</span>
          </div>

          <button
            onClick={() => handleClaimMilestone(nextMilestone)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white text-xs font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all ${
              canClaimNext
                ? 'bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 shadow-amber-950/50 glow-red animate-pulse'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
            }`}
            title="Claim streak shield reward"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>{canClaimNext ? 'Claim Milestone Reward! 🎁' : 'Milestone Reward 🎁'}</span>
          </button>
        </div>
      </div>

      {/* Legend & Instructions */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-zinc-300 font-bold">
          <span className="text-[11px] uppercase tracking-wider text-zinc-500">Legend:</span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-400 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Verified Workout</span>
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#18181b] border border-zinc-700 text-zinc-400 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-zinc-500" />
            <span>Rest Day</span>
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-950/60 border border-blue-800 text-blue-400 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>Shield Protected</span>
          </span>
        </div>

        <div className="text-xs font-mono font-bold text-zinc-400">
          💡 <span className="text-zinc-200">Tip:</span> Tap any cell to mark workout, rest, or deploy shield
        </div>
      </div>

      {/* Day of Week Headers (7 Columns: MON - SUN) */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {dayNames.map((dayName, idx) => {
          const isWeekend = idx >= 5;
          return (
            <div
              key={dayName}
              className={`text-center py-2 text-[11px] sm:text-xs font-black uppercase tracking-wider rounded-lg border ${
                isWeekend
                  ? 'bg-[#18181b]/50 text-zinc-500 border-zinc-800'
                  : 'bg-[#18181b] text-white border-zinc-700 shadow-sm'
              }`}
            >
              {dayName}
            </div>
          );
        })}
      </div>

      {/* Calendar Grid (Interactive Days & Dates) */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((day, idx) => {
          const isSelected = selectedDay?.dateStr === day.dateStr;

          let cellStyle = 'bg-[#18181b] border-[#27272a] text-zinc-300 hover:border-zinc-500';
          let statusBadge = null;

          if (!day.isCurrentMonth) {
            cellStyle = 'bg-[#121214]/40 border-zinc-900/60 text-zinc-600 opacity-40';
          } else if (day.isToday) {
            cellStyle = 'bg-red-950/40 border-2 border-red-500 ring-2 ring-red-500/30 shadow-lg glow-red';
          } else if (day.status === 'verified') {
            cellStyle = 'bg-emerald-950/25 border-emerald-800/60 hover:border-emerald-500 text-zinc-200';
          } else if (day.status === 'shielded') {
            cellStyle = 'bg-blue-950/30 border-blue-800/60 hover:border-blue-500 text-zinc-200';
          } else if (day.status === 'rest') {
            cellStyle = 'bg-[#18181b] border-[#27272a] hover:border-zinc-600 text-zinc-400';
          } else if (day.status === 'future') {
            cellStyle = 'bg-[#121214] border-zinc-800/60 text-zinc-500 hover:border-zinc-700';
          }

          if (day.status === 'verified') {
            statusBadge = (
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 truncate">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate hidden sm:inline">{day.workoutType}</span>
              </div>
            );
          } else if (day.status === 'shielded') {
            statusBadge = (
              <div className="flex items-center gap-1 text-[10px] font-bold text-blue-400 truncate">
                <ShieldCheck className="w-3 h-3 text-blue-400 shrink-0" />
                <span className="truncate hidden sm:inline">Shield</span>
              </div>
            );
          } else if (day.status === 'rest') {
            statusBadge = (
              <div className="text-[10px] font-medium text-zinc-400">
                <span className="hidden sm:inline">Rest</span>
                <span className="sm:hidden">💤</span>
              </div>
            );
          } else if (day.isToday) {
            statusBadge = (
              <div className="text-[10px] font-black text-red-400 animate-pulse">
                <span>DUE</span>
              </div>
            );
          }

          return (
            <button
              key={`${day.dateStr}-${idx}`}
              onClick={() => {
                setSelectedDay(day);
                setIsDayModalOpen(true);
              }}
              className={`group min-h-[64px] sm:min-h-[82px] p-2 rounded-xl sm:rounded-2xl border text-left flex flex-col justify-between transition-all relative overflow-hidden active:scale-95 ${cellStyle} ${
                isSelected ? 'ring-2 ring-red-500 scale-102 shadow-2xl' : ''
              }`}
            >
              {/* Day Top: Date Number + Today Pill */}
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-xs sm:text-sm font-black font-mono leading-none ${
                    day.isToday
                      ? 'text-red-400 font-extrabold'
                      : day.status === 'verified'
                      ? 'text-emerald-300'
                      : day.isCurrentMonth
                      ? 'text-white'
                      : 'text-zinc-600'
                  }`}
                >
                  {day.dayNumber}
                </span>

                {day.isToday && (
                  <span className="px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-black uppercase bg-red-600 text-white shadow-sm">
                    Today
                  </span>
                )}
              </div>

              {/* Day Bottom: Status indicator */}
              <div className="mt-1 w-full truncate">
                {statusBadge}
                {day.status === 'verified' && day.workoutDuration ? (
                  <div className="text-[9px] font-mono text-zinc-400 hidden sm:block truncate">
                    {day.workoutDuration}m • {day.calories} kcal
                  </div>
                ) : null}
              </div>

              {/* Accent colored left highlight */}
              {day.status === 'verified' && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l" />
              )}
              {day.status === 'shielded' && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l" />
              )}
              {day.isToday && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Metrics */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono pt-3 border-t border-[#27272a]">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-red-500 fill-red-500" />
          <span className="text-zinc-400">
            Active Streak:{' '}
            <strong className="text-white bg-red-600 px-2 py-0.5 rounded font-black">
              {activeUser.streakDays} Days
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-4 text-zinc-300 font-bold">
          <span>
            Verified:{' '}
            <strong className="text-emerald-400 font-mono">{verifiedCount} Logged</strong>
          </span>
          <span>•</span>
          <span>
            Rest Days:{' '}
            <strong className="text-zinc-400 font-mono">{restCount} Rest</strong>
          </span>
          <span>•</span>
          <span>
            Shields Deployed:{' '}
            <strong className="text-blue-400 font-mono">{shieldCount} Used</strong>
          </span>
        </div>
      </div>

      {/* INTERACTIVE DAY MANAGER MODAL (MARK REST, WORKOUT, OR SHIELD) */}
      {isDayModalOpen && selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-[#121214] text-white border-2 border-red-600/50 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-red-500 tracking-wider">
                  Manage Calendar Date
                </span>
                <h3 className="text-lg font-black text-white">
                  {selectedDay.date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </h3>
              </div>
              <button
                onClick={() => setIsDayModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Day Status Banner */}
            <div className="p-3 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-between">
              <span className="text-xs text-zinc-400">Current Standing:</span>
              <span
                className={`text-xs font-black font-mono px-2.5 py-0.5 rounded-full uppercase ${
                  selectedDay.status === 'verified'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : selectedDay.status === 'shielded'
                    ? 'bg-blue-950 text-blue-400 border border-blue-800'
                    : selectedDay.status === 'rest'
                    ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    : 'bg-red-950 text-red-400 border border-red-800'
                }`}
              >
                {selectedDay.status === 'verified'
                  ? `✓ Verified (${selectedDay.workoutType})`
                  : selectedDay.status === 'shielded'
                  ? '🛡️ Shield Protected'
                  : selectedDay.status === 'rest'
                  ? '💤 Scheduled Rest'
                  : 'Unlogged'}
              </span>
            </div>

            {/* Interactive Actions for this Date */}
            <div className="space-y-3">
              <div className="text-xs font-black text-zinc-400 uppercase tracking-wider">
                Select Action for This Day
              </div>

              {/* Action 1: Mark Workout */}
              <div className="p-3.5 rounded-2xl bg-[#18181b] border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-black text-white uppercase">Mark as Workout Done</span>
                  </div>
                  <button
                    onClick={() => handleMarkSelectedDay('verified', editWorkoutType, editDuration)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider shadow-md"
                  >
                    ✓ Save Workout
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-zinc-400 font-bold block mb-1">Workout Type</label>
                    <select
                      value={editWorkoutType}
                      onChange={(e) => setEditWorkoutType(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#121214] border border-zinc-700 text-xs text-white"
                    >
                      <option value="Gym">Gym / Weights</option>
                      <option value="Running">Running / Cardio</option>
                      <option value="Calisthenics">Calisthenics</option>
                      <option value="HIIT">HIIT Workout</option>
                      <option value="Swimming">Swimming</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 font-bold block mb-1">Duration (mins)</label>
                    <input
                      type="number"
                      min="10"
                      max="180"
                      value={editDuration}
                      onChange={(e) => setEditDuration(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#121214] border border-zinc-700 text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Action 2: Mark as Rest Day */}
              <button
                onClick={() => handleMarkSelectedDay('rest')}
                className="w-full p-3 rounded-2xl bg-[#18181b] hover:bg-zinc-800 border border-zinc-800 flex items-center justify-between text-left transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-zinc-800 text-zinc-400">💤</div>
                  <div>
                    <div className="text-xs font-black text-white uppercase">Mark as Scheduled Rest Day</div>
                    <div className="text-[10px] text-zinc-400">Scheduled recovery day (does not count as missed)</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-zinc-400">Apply →</span>
              </button>

              {/* Action 3: Deploy Shield */}
              <button
                onClick={() => handleMarkSelectedDay('shielded')}
                disabled={activeUser.shieldsAvailable <= 0}
                className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-all ${
                  activeUser.shieldsAvailable > 0
                    ? 'bg-blue-950/30 hover:bg-blue-950/50 border-blue-800 text-blue-200'
                    : 'bg-[#18181b] border-zinc-800 text-zinc-500 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-900/40 text-blue-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white uppercase flex items-center gap-2">
                      <span>Deploy Emergency Shield</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-blue-900 rounded font-mono">
                        {activeUser.shieldsAvailable} Available
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Protects streak from forfeiture due to travel or sickness
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-400">Use Shield →</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#27272a]">
              <button
                onClick={handleClearSelectedDay}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-red-400 transition-colors font-mono"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>
              <button
                onClick={() => setIsDayModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-black"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DUOLINGO STREAK MILESTONES ROADMAP MODAL */}
      {isMilestonesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-[#121214] text-white border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    Streak Shield Reward Ladder
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Duolingo-style milestones that grant free Emergency Rest Shields
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMilestonesModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Milestones List */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {STREAK_MILESTONES.map((m) => {
                const isClaimed = claimedMilestones.includes(m.days);
                const isCurrentGoal = nextMilestone.days === m.days;
                const isEligible = userStreak >= m.days && !isClaimed;

                return (
                  <div
                    key={m.days}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isClaimed
                        ? 'bg-emerald-950/20 border-emerald-800/50'
                        : isCurrentGoal
                        ? 'bg-amber-950/30 border-amber-500/60 shadow-lg'
                        : 'bg-[#18181b] border-zinc-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{m.icon}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white">{m.name}</span>
                          <span className="text-xs font-mono font-bold text-amber-400">
                            {m.rewardTitle}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400">{m.description}</p>
                      </div>
                    </div>

                    <div>
                      {isClaimed ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Claimed</span>
                        </span>
                      ) : isEligible ? (
                        <button
                          onClick={() => handleClaimMilestone(m)}
                          className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider shadow-md animate-bounce"
                        >
                          Claim 🎁
                        </button>
                      ) : (
                        <span className="text-xs font-mono font-bold text-zinc-500">
                          {userStreak}/{m.days}d
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-xl bg-[#18181b] border border-[#27272a] text-xs text-zinc-400">
              💡 <strong>How it works:</strong> Every consecutive day you log a verified workout advances your streak. When you hit a milestone, you automatically unlock an Emergency Rest Shield to protect yourself during future holidays or sickness.
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setIsMilestonesModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider"
              >
                Close Roadmap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
