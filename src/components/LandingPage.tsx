import React from 'react';
import {
  Flame,
  Shield,
  Coins,
  Skull,
  Camera,
  ArrowRight,
} from 'lucide-react';
import { playPop } from '../utils/audio';

interface LandingPageProps {
  onEnterHub: () => void;
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterHub, onOpenAuth }) => {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-red-600 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 w-full bg-[#09090b]/90 backdrop-blur-md border-b border-[#27272a] h-16 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white glow-red shadow-lg">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-black tracking-tight text-white uppercase font-sans">
              STAKE<span className="text-red-500">FIT</span>
            </span>
            <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-red-600 text-white">
              PRO
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs font-bold text-zinc-400">
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#features" className="hover:text-white transition-colors">Game Mechanics</a>
          <a href="#shame-wall" className="hover:text-white transition-colors">The Shame Wall</a>
          <a href="#anti-cheat" className="hover:text-white transition-colors">Anti-Cheat Engine</a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playPop();
              onOpenAuth();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-[#18181b] hover:bg-zinc-800 text-zinc-200 text-xs font-black uppercase tracking-wider transition-all border border-zinc-700"
          >
            Sign In
          </button>

          <button
            onClick={() => {
              playPop();
              onEnterHub();
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-red-950/60 glow-red border border-red-400/40"
          >
            <span>Your Squads ⚡</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-8 max-w-6xl mx-auto text-center space-y-6">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-red-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/60 border border-red-800/80 text-red-400 text-xs font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>Real Money Stakes • Peer Verification • Splitwise Payouts</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white font-display leading-[0.95]">
          Put Your <span className="text-red-500">Money</span> Where Your <span className="underline decoration-red-600 decoration-4">Sweat</span> Is.
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-300 font-medium leading-relaxed">
          Form private accountability squads with friends. Stake financial penalties on your workouts.
          Slackers forfeit <strong className="text-white">₹250/day</strong> directly into the dividend pool paid to members who show up — and get roasted on the <strong className="text-red-400">One Piece Shame Wall</strong>.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
          <button
            onClick={() => {
              playPop();
              onEnterHub();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-sm font-black uppercase tracking-wider transition-all shadow-xl shadow-red-950/80 glow-red border-2 border-red-400 active:scale-95"
          >
            <Flame className="w-4 h-4 fill-white" />
            <span>Enter Squads & Pacts Hub</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              playPop();
              onOpenAuth();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#121214] hover:bg-[#18181b] text-zinc-200 text-sm font-black uppercase tracking-wider transition-all border border-zinc-700"
          >
            <span>Sign In / Demo Login</span>
          </button>
        </div>

        {/* Live Social Proof Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-10 max-w-3xl mx-auto text-center font-mono">
          <div className="p-3 rounded-2xl bg-[#121214] border border-[#27272a]">
            <div className="text-xl sm:text-2xl font-black text-white font-display">₹25,000+</div>
            <div className="text-[10px] text-zinc-400 uppercase font-bold mt-0.5">Stakes Locked</div>
          </div>
          <div className="p-3 rounded-2xl bg-[#121214] border border-[#27272a]">
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-display">460+</div>
            <div className="text-[10px] text-zinc-400 uppercase font-bold mt-0.5">Verified Workouts</div>
          </div>
          <div className="p-3 rounded-2xl bg-[#121214] border border-[#27272a]">
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-display">28 Days</div>
            <div className="text-[10px] text-zinc-400 uppercase font-bold mt-0.5">Top Active Streak</div>
          </div>
          <div className="p-3 rounded-2xl bg-[#121214] border border-[#27272a]">
            <div className="text-xl sm:text-2xl font-black text-red-500 font-display">0 Cheats</div>
            <div className="text-[10px] text-zinc-400 uppercase font-bold mt-0.5">Peer-Enforced</div>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars */}
      <section id="features" className="py-16 px-4 sm:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-black uppercase tracking-widest text-red-500">
            Engineered For Pure Discipline
          </span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase text-white font-display">
            How StakeFit Forces You To Show Up
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 rounded-3xl bg-[#121214] border border-[#27272a] hover:border-red-600/50 transition-all space-y-3 group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black uppercase text-white font-display">
              1. Financial Stakes & Cash Dividends
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Every squad agrees on a target (e.g. 4 days/week) and a penalty (e.g. ₹250 per missed day).
              On Sunday midnight, members who missed pay their fines, which are split equally as a cash dividend to those who completed their quota.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-3xl bg-[#121214] border border-[#27272a] hover:border-emerald-600/50 transition-all space-y-3 group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black uppercase text-white font-display">
              2. EXIF GPS Camera & 2-Vouch Rule
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              No fake gym selfies. Uploads check live camera metadata and gym geofencing. Each workout requires 2 peer vouches to become verified. With our Anti-Sabotage guarantee, undisputed check-ins auto-pass at midnight!
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-3xl bg-[#121214] border border-[#27272a] hover:border-amber-600/50 transition-all space-y-3 group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Skull className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black uppercase text-white font-display">
              3. One Piece Most Wanted Shame Wall
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Skip a workout? Your face is framed in a vintage One Piece "WANTED DEAD OR FORFEITED" pirate bounty poster with a ฿500,000 Berry bounty, roast crime tag, and interactive "Poke Pirate" button.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-6 rounded-3xl bg-[#121214] border border-[#27272a] hover:border-blue-600/50 transition-all space-y-3 group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black uppercase text-white font-display">
              4. Streak Shields & Duolingo Rewards
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Maintain your streak to earn Emergency Rest Shields (7d, 14d, 30d, 60d, 100d milestones). Deploy shields on rest or travel days to legally freeze your penalties without breaking your streak!
            </p>
          </div>
        </div>
      </section>

      {/* Footer Banner */}
      <section className="border-t border-[#27272a] bg-[#0c0c0e] py-14 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-5">
          <h3 className="text-2xl sm:text-3xl font-black uppercase text-white font-display">
            Ready to test your discipline?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400">
            Open the Squads Hub to join an active pact or build your private squad in seconds.
          </p>
          <button
            onClick={() => {
              playPop();
              onEnterHub();
            }}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-xl shadow-red-950/80 glow-red border border-red-400"
          >
            <span>Open Squads Hub (Supabase Style)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
