import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AnimatedList, type AnimatedListItem } from './AnimatedList';
import FlipCard from './ui/FlipCard';
import {
  Skull,
  Flame,
  Shield,
  Zap,
  Clock,
  Award,
  ShieldCheck,
  Activity,
  MessageCircle,
  Copy,
  MapPin,
  RotateCw,
  CreditCard,
  Navigation,
} from 'lucide-react';
import { playSkullThud, playPop } from '../utils/audio';

export const ShameWallPage: React.FC = () => {
  const {
    activeGroup,
    users,
    activeUser,
    activateStreakShield,
    showToast,
  } = useApp();

  const usersMap = new Map(users.map((u) => [u.id, u]));

  // Find members who defaulted or missed
  const defaultedMembers: {
    user: (typeof users)[0];
    stats: (typeof activeGroup.membersStats)[string];
  }[] = [];

  const activeMembers: {
    user: (typeof users)[0];
    stats: (typeof activeGroup.membersStats)[string];
  }[] = [];

  for (const memberId of activeGroup.memberIds) {
    const user = usersMap.get(memberId);
    if (!user) continue;
    const stats = activeGroup.membersStats[memberId] || {
      userId: memberId,
      daysLoggedThisWeek: 0,
      daysVerifiedThisWeek: 0,
      missedDays: 0,
      isDoubleDown: user.isDoubleDown,
      shieldUsedThisWeek: user.shieldActive,
      dailyStatuses: {},
      status: 'yet_to_log',
    };

    if (stats.status === 'defaulted' || stats.missedDays > 0) {
      defaultedMembers.push({ user, stats });
    }
    activeMembers.push({ user, stats });
  }

  // Sort active members by streak
  const rankedMembers = [...activeMembers].sort(
    (a, b) => b.user.streakDays - a.user.streakDays
  );

  const funRoasts = [
    'Chose Netflix binge over gym session. Forfeited to the squad dividend pool.',
    'Claimed "rest day" without an active shield. Wallet is now lighter.',
    'Hit snooze 4 times. Midnight cutoff spared no mercy.',
    'Subscribed to the couch potato protocol today.',
  ];

  const activityItems: AnimatedListItem[] = [
    {
      title: 'Priya Patel: 8K Tempo Run Verified',
      description: '4/4 Days Met • 100% Target Met (Dividend Qualified)',
      meta: '3h ago',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    },
    {
      title: 'Rahul Sharma: 5x5 Squats @ 140kg',
      description: '3/4 Days Done • 2X Double Down High-Roller Stake',
      meta: '42m ago',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    },
    {
      title: 'Dev Malik: Missed Midnight Cutoff',
      description: 'Defaulted • ₹500 forfeit added to the squad pool',
      meta: 'Yesterday',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    },
    {
      title: 'Sarah Jenkins: Rest Shield Deployed',
      description: 'Emergency shield active for flight & travel day',
      meta: '2d ago',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    },
    {
      title: 'Marcus Chen: Settled ₹250 Debt',
      description: 'Paid Priya Patel via UPI (GPay ref: UPI-REF-9921448)',
      meta: 'Nov 01',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    },
  ];

    const totalPenaltiesCollected = defaultedMembers.reduce((sum, { stats }) => {
      const missedCount = stats.missedDays || 1;
      const penalty = missedCount * activeGroup.penaltyPerMissedDay * (stats.isDoubleDown ? 2 : 1);
      return sum + penalty;
    }, 0);

  useEffect(() => {
    if (defaultedMembers.length > 0) {
      playSkullThud();
    }
  }, []);

  const handleShareShameReceipt = () => {
    playPop();
    const defaulterNames =
      defaultedMembers
        .map(
          (d) =>
            `${d.user.name} (-${activeGroup.currency}${
              activeGroup.penaltyPerMissedDay * (d.stats.missedDays || 1)
            })`
        )
        .join(', ') || 'No defaulters today!';
    const text = `💀 STAKEFIT SHAME INVOICE 💀\nPact: ${activeGroup.name}\nTotal Penalties Levied: ${activeGroup.currency}${totalPenaltiesCollected}\nDefaulters today: ${defaulterNames}\nCutoff 11:59 PM spared no mercy! Routed to ${activeGroup.poolType} pool. Check wall: https://stakefit.app`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyReceipt = () => {
    playPop();
    const defaulterNames =
      defaultedMembers
        .map(
          (d) =>
            `${d.user.name} (-${activeGroup.currency}${
              activeGroup.penaltyPerMissedDay * (d.stats.missedDays || 1)
            })`
        )
        .join(', ') || 'No defaulters today!';
    const text = `💀 STAKEFIT SHAME INVOICE 💀\nPact: ${activeGroup.name}\nTotal Penalties: ${activeGroup.currency}${totalPenaltiesCollected}\nDefaulters: ${defaulterNames}\n"Excuses get taxed, streaks get celebrated."`;
    navigator.clipboard?.writeText(text);
    showToast('Shame Wall receipt copied to clipboard!');
  };

  const handleSendWhatsAppRoastForUser = (userName: string, userHandle: string, penaltyAmount: number, roast: string) => {
    playPop();
    const text = `🚨 *OFFICIAL STAKEFIT SLACKER DOCKET* 🚨\n\n💀 *${userName}* (${userHandle}) failed the 11:59 PM gym cutoff!\n💸 *Outstanding Penalty Debt:* -${activeGroup.currency}${penaltyAmount}\n📍 *GPS Telemetry:* 0 pings detected at Gold's Gym Sector 29.\n⚖️ *Crime:* "${roast}"\n\nPay your debt to the squad dividend pool or stay on the One Piece Shame Wall: https://stakefit.app`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    showToast(`WhatsApp Roast dispatched for ${userName}!`);
  };

  const handleSettleUpiDebtForUser = (userName: string, penaltyAmount: number, upiId?: string) => {
    playPop();
    const upiLink = `upi://pay?pa=${encodeURIComponent(upiId || 'stakefit@okaxis')}&pn=${encodeURIComponent(userName)}&am=${penaltyAmount}&cu=INR&tn=${encodeURIComponent(`StakeFit Default Forfeit: ${userName}`)}`;
    window.open(upiLink, '_self');
    showToast(`💳 Settle UPI Debt: Prompted ${activeGroup.currency}${penaltyAmount} transfer to ${activeGroup.poolType} dividend pool!`);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Fun Hero Header */}
      <div className="text-center space-y-2 py-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-900/50 text-red-400 text-xs font-mono font-bold">
          <Clock className="w-3.5 h-3.5 animate-spin" />
          <span>Cutoff: 11:59 PM Every Night • Forfeit: {activeGroup.currency}{activeGroup.penaltyPerMissedDay}/day</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-sans">
          The <span className="text-red-500">Shame Wall</span> & Glory Hall
        </h1>
        <p className="text-sm text-zinc-400 max-w-lg mx-auto">
          Where excuses get taxed, streaks get celebrated, and accountability stays 100% public.
        </p>

        {/* 1-Click WhatsApp & Receipt Actions */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          <button
            onClick={handleShareShameReceipt}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/50 glow-green active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Share Shame Invoice to WhatsApp</span>
          </button>

          <button
            onClick={handleCopyReceipt}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
          >
            <Copy className="w-4 h-4" />
            <span>Copy Receipt Text</span>
          </button>
        </div>
      </div>

      {/* High-Contrast Red, White & Black Escrow & Forfeits Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#121214] border border-[#27272a] shadow-xl">
          <div className="text-[10px] font-black uppercase tracking-wider text-red-500 flex items-center gap-1.5">
            <Skull className="w-4 h-4 text-red-500" />
            <span>Active Penalties Levied</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
            {activeGroup.currency}{totalPenaltiesCollected}
          </div>
          <div className="text-[11px] text-zinc-400 font-bold mt-1">
            {defaultedMembers.length} squad {defaultedMembers.length === 1 ? 'member' : 'members'} on the wall
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#121214] border border-[#27272a] shadow-xl">
          <div className="text-[10px] font-black uppercase tracking-wider text-red-500 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-red-500" />
            <span>Pool Settlement Model</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1 capitalize">
            {activeGroup.poolType}
          </div>
          <div className="text-[11px] text-zinc-400 font-bold mt-1">
            {activeGroup.poolType === 'dividend' ? 'Split among 100% achievers' : 'Escrow for squad bounty goal'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#121214] border border-[#27272a] shadow-xl">
          <div className="text-[10px] font-black uppercase tracking-wider text-red-500 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-red-500" />
            <span>Midnight Cutoff Rule</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
            11:59 PM
          </div>
          <div className="text-[11px] text-zinc-400 font-bold mt-1">
            Daily reset time (strictly peer-verified)
          </div>
        </div>
      </div>

      {/* SECTION 1: THE WALL OF SHAME */}
      <div className="bg-[#121214] border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl glow-red space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-red-500/20 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
              <Skull className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>The Defaulters' Wall</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800 font-mono">
                  {defaultedMembers.length} on the wall
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Members who missed their daily workout quota or got flagged for unverified proof
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-zinc-400 bg-[#18181b] px-3.5 py-1.5 rounded-xl border border-zinc-800">
            Forfeits split to: <strong className="text-emerald-400 capitalize">{activeGroup.poolType} Pool</strong>
          </div>
        </div>

        {defaultedMembers.length === 0 ? (
          <div className="p-8 text-center bg-[#18181b]/40 rounded-2xl border border-dashed border-zinc-800 space-y-2">
            <div className="text-2xl">✨</div>
            <h4 className="text-sm font-bold text-white">The Wall is Spotless Today!</h4>
            <p className="text-xs text-zinc-500">
              All squad members have logged their workouts or are safe under review. Check back after 11:59 PM!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {defaultedMembers.map(({ user, stats }, index) => {
              const missedCount = stats.missedDays || 1;
              const penaltyAmount = missedCount * activeGroup.penaltyPerMissedDay * (stats.isDoubleDown ? 2 : 1);
              const roast = funRoasts[index % funRoasts.length];

              const frontFace = (
                <div
                  className="relative h-full flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-[#f5eed9] text-[#2c1809] border-[6px] border-[#532e17] shadow-inner font-serif select-none"
                  style={{
                    backgroundImage: 'radial-gradient(#fff9e8 15%, #ebd3a8 100%)',
                    boxShadow: 'inset 0 0 30px rgba(97,54,25,0.25)',
                  }}
                >
                  {/* Weathered Corner Nails / Rivets */}
                  <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-[#3e2213] border border-[#784628] shadow-inner" />
                  <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-[#3e2213] border border-[#784628] shadow-inner" />
                  <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-[#3e2213] border border-[#784628] shadow-inner" />
                  <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-[#3e2213] border border-[#784628] shadow-inner" />

                  {/* Top Iconic "WANTED" Header */}
                  <div className="text-center pt-0.5">
                    <h2
                      className="text-4xl sm:text-5xl font-black tracking-[0.22em] text-[#3e2213] uppercase drop-shadow-[0_2px_1px_rgba(255,255,255,0.8)]"
                      style={{ fontFamily: 'Georgia, serif' }}
                    >
                      WANTED
                    </h2>
                    <div className="text-[10px] tracking-[0.3em] font-black uppercase text-[#6d3e1d] mt-0.5">
                      ★ STAKEFIT GRAND LINE FLEET ★
                    </div>
                  </div>

                  {/* Character Mugshot / Portrait in woodcut frame */}
                  <div className="relative mx-auto w-32 h-32 sm:w-36 sm:h-36 rounded border-4 border-[#3e2213] bg-[#faf0db] p-1 shadow-inner overflow-hidden my-1">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover filter contrast-125 sepia-[0.3] brightness-95"
                    />
                    <div className="absolute bottom-1 right-1 bg-[#3e2213] text-[#ebd3a8] text-[9px] font-mono font-black px-1.5 py-0.5 rounded shadow">
                      DEFAULTER
                    </div>
                  </div>

                  {/* "DEAD OR ALIVE" Banner */}
                  <div className="text-center">
                    <div
                      className="text-xs sm:text-sm font-black tracking-[0.25em] text-[#3e2213] uppercase border-y-2 border-[#532e17] py-0.5"
                      style={{ fontFamily: 'Georgia, serif' }}
                    >
                      DEAD OR FORFEITED
                    </div>
                  </div>

                  {/* Pirate Name */}
                  <div className="text-center space-y-0.5">
                    <h3
                      className="text-2xl sm:text-3xl font-black tracking-widest text-[#24130a] uppercase"
                      style={{ fontFamily: 'Georgia, serif' }}
                    >
                      {user.name}
                    </h3>
                    <div className="text-[11px] font-mono font-black text-[#7a421b]">
                      {user.handle} • {missedCount} Missed {missedCount === 1 ? 'Cutoff' : 'Cutoffs'}
                    </div>
                  </div>

                  {/* Bounty Amount with Berry ฿ symbol */}
                  <div className="text-center py-1.5 px-3 rounded-xl bg-[#e3c79a]/60 border-2 border-[#532e17]/50 shadow-inner">
                    <div className="text-[9px] font-black tracking-widest uppercase text-[#5c341b]">
                      SQUAD BOUNTY FORFEIT
                    </div>
                    <div className="text-2xl sm:text-3xl font-black tracking-wider text-[#991b1b] font-mono flex items-center justify-center gap-1.5 drop-shadow-sm">
                      <span className="font-serif text-xl sm:text-2xl font-black">฿</span>
                      <span>{(penaltyAmount * 1000).toLocaleString()}-</span>
                    </div>
                    <div className="text-[10px] font-black text-[#3e2213] font-mono">
                      (-{activeGroup.currency}{penaltyAmount} deducted to {activeGroup.poolType} pool)
                    </div>
                  </div>

                  {/* Crime / Offense Quote */}
                  <div className="p-2 rounded-xl bg-[#faf0db]/90 border border-[#784628]/40 text-xs text-[#3e2213] italic text-center font-serif leading-tight">
                    "{roast}"
                  </div>

                  {/* Marine Seal & Bottom Tap Prompt */}
                  <div className="space-y-2 pt-1 border-t-2 border-[#532e17]/40">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[9px] font-mono font-black text-[#5c341b] tracking-wider uppercase">
                        ⚓ MARINE HQ • STREAK: 0d
                      </div>
                      <button
                        type="button"
                        data-no-flip="true"
                        onClick={(e) => {
                          e.stopPropagation();
                          showToast(`⚓ Marine Nudge sent to ${user.name.split(' ')[0]}! "Collect your bounty tomorrow!"`);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#851818] hover:bg-[#3e2213] text-[#fff6e5] text-[11px] font-black uppercase tracking-wider transition-all shadow-md active:scale-95 border border-[#532e17]"
                      >
                        Poke Pirate 🏴‍☠️
                      </button>
                    </div>

                    <div className="text-center py-1 px-2 rounded-lg bg-[#3e2213]/10 border border-[#532e17]/30 text-[10px] font-mono font-bold text-[#4a2612] flex items-center justify-center gap-1.5">
                      <RotateCw className="w-3 h-3 text-red-700 animate-spin" />
                      <span>Click or drag to flip for Slacker Crime Sheet & Debt ➔</span>
                    </div>
                  </div>
                </div>
              );

              const backFace = (
                <div
                  className="relative h-full flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-[#09090b] text-white border-2 border-red-500/50 shadow-2xl overflow-y-auto select-none"
                  style={{
                    backgroundImage: 'radial-gradient(ellipse at top, #1c0a0e 0%, #09090b 80%)',
                  }}
                >
                  {/* Top Docket Header */}
                  <div className="flex items-center justify-between border-b border-red-500/30 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                      <div>
                        <div className="text-[10px] font-mono font-black tracking-widest text-red-400 uppercase">
                          CASE DOCKET #SF-2026-{user.id.slice(-4).toUpperCase()}
                        </div>
                        <div className="text-xs font-black text-white uppercase tracking-wider">
                          Slacker Debt Invoice & Crime Sheet
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800 font-mono font-bold uppercase">
                      Guilty as Charged
                    </span>
                  </div>

                  {/* Accused Profile Row */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 mt-2">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-red-500/60"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-white truncate">{user.name}</h4>
                        <span className="text-[10px] font-mono text-zinc-500">{user.handle}</span>
                      </div>
                      <div className="text-[11px] text-red-400 font-medium">
                        Offense: Missed 11:59 PM Workout Cutoff ({missedCount}d)
                      </div>
                    </div>
                  </div>

                  {/* Exact Monetary Penalty Owed Box */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-red-950/60 via-zinc-900 to-zinc-950 border border-red-500/40 text-center my-2 shadow-inner">
                    <div className="text-[10px] font-mono font-black tracking-widest uppercase text-red-400">
                      EXACT MONETARY PENALTY OWED
                    </div>
                    <div className="text-3xl sm:text-4xl font-black font-mono text-red-500 tracking-tight my-0.5">
                      -{activeGroup.currency}{penaltyAmount}
                    </div>
                    <div className="text-[11px] font-mono text-zinc-300">
                      {missedCount} Missed Day(s) × {activeGroup.currency}{activeGroup.penaltyPerMissedDay}
                      {stats.isDoubleDown ? ' (2X Double Down High-Roller)' : ''}
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400 mt-1 font-bold">
                      → Forfeit routed directly into Sunday Dividend Pool
                    </div>
                  </div>

                  {/* Gym GPS Telemetry & Absence Telemetry */}
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5 text-xs text-zinc-300">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-zinc-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        <span>Registered Gym:</span>
                      </span>
                      <span className="font-bold text-white">Gold's Gym - Sector 29</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-zinc-400 flex items-center gap-1">
                        <Navigation className="w-3.5 h-3.5 text-amber-500" />
                        <span>GPS Coordinates:</span>
                      </span>
                      <span className="font-mono text-zinc-300 text-[10px]">28.4595° N, 77.0266° E</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-red-400" />
                        <span>Telemetry Check:</span>
                      </span>
                      <span className="text-red-400 font-bold">❌ 0 Pings at 11:59 PM Cutoff</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono pt-0.5 border-t border-zinc-800/60">
                      <span className="text-zinc-400">Anti-Tamper Score:</span>
                      <span className="text-red-400 font-black">0% Attendance Confidence</span>
                    </div>
                  </div>

                  {/* Direct Action Buttons: Send WhatsApp Roast & Settle UPI Debt */}
                  <div className="space-y-2 pt-2 border-t border-zinc-800">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        data-no-flip="true"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendWhatsAppRoastForUser(user.name, user.handle, penaltyAmount, roast);
                        }}
                        className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Roast</span>
                      </button>

                      <button
                        type="button"
                        data-no-flip="true"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSettleUpiDebtForUser(user.name, penaltyAmount, user.upiId);
                        }}
                        className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[11px] font-black uppercase tracking-wider transition-all shadow-md active:scale-95 glow-red"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Settle UPI Debt</span>
                      </button>
                    </div>

                    <div className="text-center py-1 text-[10px] font-mono text-zinc-400 flex items-center justify-center gap-1">
                      <RotateCw className="w-3 h-3 text-zinc-500" />
                      <span>Click anywhere or drag to flip back to Wanted poster</span>
                    </div>
                  </div>
                </div>
              );

              return (
                <div key={user.id} className="w-full flex justify-center">
                  <FlipCard
                    width="100%"
                    height={590}
                    radius={24}
                    tiltMax={10}
                    perspective={1000}
                    glare={true}
                    glareOpacity={0.22}
                    background="transparent"
                    front={frontFace}
                    back={backFace}
                    className="w-full"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: THE GLORY HALL (STREAKS LEADERBOARD) */}
      <div className="bg-[#121214] border border-[#27272a] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>The Glory Hall</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800 font-mono">
                  Consistency Kings
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Squad members holding consecutive workout streaks and earning dividend shares
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {rankedMembers.map(({ user, stats }, idx) => {
            const isTop3 = idx < 3;
            const medal = idx === 0 ? '👑' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
            const isMe = user.id === activeUser.id;

            return (
              <div
                key={user.id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  isMe
                    ? 'bg-red-500/10 border-red-500/40 glow-red'
                    : isTop3
                    ? 'bg-[#18181b] border-zinc-800'
                    : 'bg-[#18181b]/50 border-[#27272a]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 text-center font-black font-mono text-base text-zinc-400">
                    {medal}
                  </div>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-500/40"
                  />
                  <div>
                    <div className="font-bold text-white text-sm flex items-center gap-2">
                      <span>{user.name}</span>
                      {isMe && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-zinc-800 text-zinc-300 rounded font-mono">
                          YOU
                        </span>
                      )}
                      {stats.isDoubleDown && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-red-950 text-red-400 border border-red-800 rounded font-bold font-mono">
                          2X BET
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-400 font-mono mt-0.5">
                      This Week: {stats.daysVerifiedThisWeek}/{activeGroup.targetDaysPerWeek} Days Done
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-base sm:text-lg font-black font-mono text-amber-400 justify-end">
                    <Flame className="w-5 h-5 fill-amber-500" />
                    <span>{user.streakDays} Days</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono">
                    {user.streakWeeks} Perfect Weeks
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: HABIT MECHANICS ARMORY */}
      <div>
        {/* Streak Shield Card */}
        <div className="bg-[#121214] border border-[#27272a] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl border ${
                activeUser.shieldActive
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400'
              }`}>
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>Emergency Rest Shield</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800 font-mono font-bold">
                    {activeUser.shieldsAvailable} Available
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Earn shields with streak milestones (Duolingo-style rewards). Protects against illness or travel without forfeit.
                </p>
              </div>
            </div>

            <button
              onClick={activateStreakShield}
              disabled={activeUser.shieldActive || activeUser.shieldsAvailable <= 0}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md ${
                activeUser.shieldActive
                  ? 'bg-blue-950 border border-blue-800 text-blue-300 cursor-default'
                  : activeUser.shieldsAvailable > 0
                  ? 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {activeUser.shieldActive ? 'Shield Active Today' : 'Deploy Emergency Shield'}
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-[#18181b] border border-[#27272a] text-xs text-zinc-300">
            {activeUser.shieldActive ? (
              <div className="flex items-center gap-2 text-blue-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Shield is currently ACTIVE for today! No penalty or streak reset will be applied.</span>
              </div>
            ) : (
              <span>Feeling unwell or traveling? Deploy a shield to protect your streak and avoid paying forfeit. Maintain a streak to unlock extra shields on the calendar!</span>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 4: SQUAD ACCOUNTABILITY LIVE STREAM */}
      <div className="bg-[#121214] border border-[#27272a] rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#27272a] pb-4">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-500" />
              <span>Squad Accountability Audit Stream</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live chronological log of verified workouts, shield deployments & forfeit events
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400 bg-[#18181b] px-3 py-1 rounded-xl border border-[#27272a] hidden sm:block">
            Use ↑ ↓ arrow keys or hover to glide
          </span>
        </div>

        <div className="flex justify-center pt-2">
          <AnimatedList
            items={activityItems}
            animation="pop"
            theme="dark"
            accentColor="#ef4444"
            width="100%"
            maxHeight={380}
            onItemSelect={(item) => showToast(`Selected: ${item.title}`)}
          />
        </div>
      </div>
    </div>
  );
};
