import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Flame,
  Shield,
  Coins,
  Skull,
  Camera,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Zap,
  Layers,
  HelpCircle,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { playPop, playGong } from '../utils/audio';
import {
  CartoonGoldCoin,
} from './illustrations/CartoonAssets';
import { GrainGradient } from './ui/GrainGradient';

interface LandingPageProps {
  onEnterHub: () => void;
  onOpenAuth: () => void;
}

const NAV_SECTIONS = [
  { id: 'hero', label: 'Overview', icon: Zap },
  { id: 'features', label: 'How It Works', icon: Shield },
  { id: 'calculator', label: 'Dividend Calculator', icon: Coins },
  { id: 'how-it-works', label: '3-Step Flow', icon: Layers },
  { id: 'preview', label: 'Live Preview', icon: Activity },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterHub, onOpenAuth }) => {
  // Calculator state
  const [calcMembers, setCalcMembers] = useState(5);
  const [calcDays, setCalcDays] = useState(4);
  const [calcPenalty, setCalcPenalty] = useState(250);
  const [calcSlackers, setCalcSlackers] = useState(2);

  // Active preview tab for product showcase
  const [activePreviewTab, setActivePreviewTab] = useState<'feed' | 'shame' | 'ledger'>('feed');

  // FAQ Accordion open index
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Scroll and active section tracking for the right side bar
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');
  const pageRef = useRef<HTMLDivElement>(null);

  // Smooth scroll helper
  const scrollToSection = (id: string) => {
    playPop();
    const el = document.getElementById(id);
    if (el) {
      const topOffset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 150);
    }
  };

  // Scroll listener for side bar tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));

      // Determine active section based on scroll position
      const sections = ['hero', 'features', 'calculator', 'how-it-works', 'preview', 'faq'];
      for (const sectionId of [...sections].reverse()) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.45) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // GSAP ScrollTrigger Animations
  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Hero Entrance animations
      gsap.from('.gsap-hero-badge', {
        y: -20,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        clearProps: 'all',
      });
      gsap.from('.gsap-hero-title', {
        y: 35,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.out',
        delay: 0.08,
        clearProps: 'all',
      });
      gsap.from('.gsap-hero-sub', {
        y: 20,
        opacity: 0,
        duration: 0.75,
        ease: 'power2.out',
        delay: 0.2,
        clearProps: 'all',
      });
      gsap.from('.gsap-hero-cta', {
        y: 15,
        opacity: 0,
        duration: 0.7,
        ease: 'back.out(1.4)',
        delay: 0.3,
        clearProps: 'all',
      });
      gsap.from('.gsap-stat-card', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        delay: 0.4,
        clearProps: 'all',
      });

      // 2. 4 Pillars / Features section scroll animation
      gsap.fromTo(
        '.gsap-pillar-card',
        { y: 30, opacity: 0.2 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          clearProps: 'all',
          scrollTrigger: {
            trigger: '#features',
            start: 'top 95%',
            once: true,
          },
        }
      );

      // 3. Calculator section scroll animation
      gsap.fromTo(
        '.gsap-calculator-box',
        { y: 25, opacity: 0.3, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.65,
          ease: 'power2.out',
          clearProps: 'all',
          scrollTrigger: {
            trigger: '#calculator',
            start: 'top 95%',
            once: true,
          },
        }
      );

      // 4. How It Works 3-Steps scroll animation (starts top 95% + clearProps guarantees visibility)
      gsap.fromTo(
        '.gsap-step-card',
        { y: 30, opacity: 0.2 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          clearProps: 'all',
          scrollTrigger: {
            trigger: '#how-it-works',
            start: 'top 95%',
            once: true,
          },
        }
      );

      // 5. Product Preview scroll animation
      gsap.fromTo(
        '.gsap-preview-card',
        { y: 30, opacity: 0.2 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          clearProps: 'all',
          scrollTrigger: {
            trigger: '#preview',
            start: 'top 95%',
            once: true,
          },
        }
      );

      // 6. FAQ Section scroll animation (starts top 95% + clearProps guarantees visibility)
      gsap.fromTo(
        '.gsap-faq-item',
        { y: 20, opacity: 0.2 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          clearProps: 'all',
          scrollTrigger: {
            trigger: '#faq',
            start: 'top 95%',
            once: true,
          },
        }
      );
    }, pageRef);

    // Refresh ScrollTrigger and safety check so elements are NEVER left blank
    ScrollTrigger.refresh();
    const safetyTimer = setTimeout(() => {
      ScrollTrigger.refresh();
      document
        .querySelectorAll<HTMLElement>(
          '.gsap-step-card, .gsap-faq-item, .gsap-pillar-card, .gsap-calculator-box, .gsap-preview-card'
        )
        .forEach((el) => {
          if (el.style.opacity && parseFloat(el.style.opacity) < 0.5) {
            el.style.opacity = '1';
            el.style.transform = 'none';
          }
        });
    }, 350);

    return () => {
      clearTimeout(safetyTimer);
      ctx.revert();
    };
  }, []);

  // Calculator computations
  const totalWeeklyStakes = calcMembers * calcDays * calcPenalty;
  const totalForfeitedFines = calcSlackers * (calcDays / 2) * calcPenalty;
  const winnersCount = Math.max(1, calcMembers - calcSlackers);
  const estimatedDividendPerWinner = Math.round(totalForfeitedFines / winnersCount);

  return (
    <div ref={pageRef} className="min-h-screen bg-[#070709] text-[#f4f4f5] font-sans selection:bg-red-600 selection:text-white relative overflow-x-hidden">
      {/* WebGL Grain Gradient Background (Breathing Film Grain) */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-45">
        <GrainGradient
          colorLight="#dc2626"
          colorMid="#7f1d1d"
          colorDark="#050505"
          angle={25}
          curve={0.5}
          softness={0.24}
          scale={1.15}
          grain={0.42}
          grainSize={1.1}
          speed={1.55}
        />
      </div>

      {/* ======================================================== */}
      {/* Top Navigation Bar (Stationary Full-Width Header) */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 w-full bg-[#09090b]/85 backdrop-blur-md border-b border-[#27272a]/70 h-16 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            onClick={() => scrollToSection('hero')}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 via-red-600 to-red-800 flex items-center justify-center text-white glow-red shadow-lg border border-red-400/40 cursor-pointer shrink-0 hover:scale-105 transition-transform"
          >
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div onClick={() => scrollToSection('hero')} className="cursor-pointer">
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-tight text-white uppercase font-sans">
                STAKE<span className="text-red-500">FIT</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-red-600 text-white">
                PRO
              </span>
            </div>
            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider hidden sm:block">
              Financial Fitness Accountability
            </p>
          </div>
        </div>

        {/* Interactive Navigation Links with Active Scroll Highlighting */}
        <div className="hidden lg:flex items-center gap-7 text-xs font-black uppercase tracking-wider">
          <button
            onClick={() => scrollToSection('features')}
            className={`transition-colors py-1 ${
              activeSection === 'features'
                ? 'text-red-400 border-b-2 border-red-500 font-black'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('calculator')}
            className={`transition-colors py-1 ${
              activeSection === 'calculator'
                ? 'text-emerald-400 border-b-2 border-emerald-500 font-black'
                : 'text-zinc-400 hover:text-emerald-400'
            }`}
          >
            Dividend Calculator
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className={`transition-colors py-1 ${
              activeSection === 'how-it-works'
                ? 'text-white border-b-2 border-red-500 font-black'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            3-Step Flow
          </button>
          <button
            onClick={() => scrollToSection('preview')}
            className={`transition-colors py-1 ${
              activeSection === 'preview'
                ? 'text-red-400 border-b-2 border-red-500 font-black'
                : 'text-zinc-400 hover:text-red-400'
            }`}
          >
            Live Preview
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            className={`transition-colors py-1 ${
              activeSection === 'faq'
                ? 'text-white border-b-2 border-red-500 font-black'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            FAQ
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              playPop();
              onOpenAuth();
            }}
            className="px-3.5 py-2 rounded-xl bg-[#141416] hover:bg-zinc-800 text-zinc-200 text-xs font-black uppercase tracking-wider transition-all border border-zinc-700"
          >
            Sign In
          </button>

          <button
            onClick={() => {
              playPop();
              onEnterHub();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-red-950/60 glow-red border border-red-400/40 active:scale-95"
          >
            <span>Your Squads ⚡</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* Floating Side Bar (Moves & Tracks Scroll Down the Page) */}
      {/* ======================================================== */}
      <aside
        className="hidden xl:flex fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-2.5 p-2.5 rounded-2xl bg-[#09090b]/85 backdrop-blur-xl border border-zinc-800/90 shadow-[0_12px_40px_rgba(0,0,0,0.85)] group select-none transition-all duration-300 hover:border-red-500/40"
        aria-label="Scroll Navigation Rail"
      >
        {/* Scroll % Badge */}
        <div className="text-[10px] font-mono font-black text-red-400 bg-red-950/70 border border-red-900/80 px-2 py-0.5 rounded-md shadow-xs">
          {Math.round(scrollProgress)}%
        </div>

        {/* Vertical Moving Tracker Line */}
        <div className="relative w-1 h-36 bg-zinc-800 rounded-full my-1 overflow-hidden">
          <div
            className="w-full bg-gradient-to-b from-red-600 via-amber-500 to-emerald-400 transition-all duration-100 rounded-full shadow-[0_0_8px_#ef4444]"
            style={{ height: `${scrollProgress}%` }}
          />
        </div>

        {/* Section Icons Navigation */}
        <div className="flex flex-col items-center gap-2">
          {NAV_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                className={`relative group/btn p-2 rounded-xl transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-lg glow-red scale-110'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
                }`}
                title={sec.label}
              >
                <Icon className="w-4 h-4" />

                {/* Floating Tooltip Label to the left */}
                <span className="absolute right-12 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-[#141416] text-white text-[11px] font-mono font-bold whitespace-nowrap shadow-xl border border-zinc-700 opacity-0 group-hover/btn:opacity-100 transition-all duration-150 pointer-events-none translate-x-1 group-hover/btn:translate-x-0">
                  {sec.label}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ======================================================== */}
      {/* Hero Section */}
      {/* ======================================================== */}
      <section id="hero" className="relative z-10 pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-8 max-w-5xl mx-auto text-center space-y-7">
        {/* Top Tag Pill */}
        <div className="gsap-hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/70 border border-red-700/80 text-red-400 text-xs font-mono font-black shadow-lg glow-red">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span>Real Financial Stakes • Peer Camera Vouches • Sunday Dividends</span>
        </div>

        {/* Main Hero Headline */}
        <h1 className="gsap-hero-title text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black uppercase tracking-tight text-white font-display leading-[0.92] max-w-4xl mx-auto select-text">
          Put Your <span className="text-red-500 inline-block">Money</span> Where Your{' '}
          <span className="underline decoration-red-600 decoration-4 sm:decoration-8">Sweat</span> Is.
        </h1>

        <p className="gsap-hero-sub max-w-2xl mx-auto text-sm sm:text-base text-zinc-300 font-medium leading-relaxed">
          Form private fitness accountability pacts with friends. Stake financial penalties on every workout.
          Slackers forfeit <strong className="text-white font-black">₹250 per missed day</strong> directly into the dividend pool paid to members who hit 100% — and get roasted on the{' '}
          <strong className="text-red-400 font-black">One Piece Shame Wall</strong>.
        </p>

        {/* Hero CTAs */}
        <div className="gsap-hero-cta flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={() => {
              playGong();
              onEnterHub();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-sm sm:text-base font-black uppercase tracking-wider transition-all shadow-2xl shadow-red-950/80 glow-red border-2 border-red-400 active:scale-95 group"
          >
            <Flame className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
            <span>Enter Squads & Pacts Hub</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => {
              playPop();
              onOpenAuth();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-[#141416]/90 hover:bg-[#1a1a1e] text-zinc-200 text-sm font-black uppercase tracking-wider transition-all border border-zinc-700 active:scale-95 shadow-md"
          >
            <span>Sign In / Demo Login</span>
          </button>
        </div>

        {/* Live Social Proof Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-8 max-w-4xl mx-auto text-center font-mono relative z-10">
          <div className="gsap-stat-card p-4 rounded-2xl bg-[#121214]/90 border border-[#27272a] shadow-xl relative overflow-hidden group backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-black text-white font-display">₹25,000+</div>
            <div className="text-[10px] text-zinc-400 uppercase font-black mt-1 tracking-wider">
              Stakes Locked
            </div>
            <span className="absolute -right-2 -bottom-2 text-3xl opacity-15">💰</span>
          </div>

          <div className="gsap-stat-card p-4 rounded-2xl bg-[#121214]/90 border border-[#27272a] shadow-xl relative overflow-hidden group backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-display">460+</div>
            <div className="text-[10px] text-zinc-400 uppercase font-black mt-1 tracking-wider">
              Verified Workouts
            </div>
            <span className="absolute -right-2 -bottom-2 text-3xl opacity-15">🏋️</span>
          </div>

          <div className="gsap-stat-card p-4 rounded-2xl bg-[#121214]/90 border border-[#27272a] shadow-xl relative overflow-hidden group backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-display">28 Days</div>
            <div className="text-[10px] text-zinc-400 uppercase font-black mt-1 tracking-wider">
              Top Active Streak
            </div>
            <span className="absolute -right-2 -bottom-2 text-3xl opacity-15">🔥</span>
          </div>

          <div className="gsap-stat-card p-4 rounded-2xl bg-[#121214]/90 border border-[#27272a] shadow-xl relative overflow-hidden group backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-black text-red-500 font-display">0 Cheats</div>
            <div className="text-[10px] text-zinc-400 uppercase font-black mt-1 tracking-wider">
              Peer-Enforced
            </div>
            <span className="absolute -right-2 -bottom-2 text-3xl opacity-15">🛡️</span>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4 Core Pillars (Simplified, Short, Punchy Lines - Image 1) */}
      {/* ======================================================== */}
      <section id="features" className="relative z-10 py-16 px-4 sm:px-8 max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-black uppercase tracking-widest text-red-500">
            Engineered For Pure Discipline
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-white font-display">
            How StakeFit Forces You To Show Up
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Pillar 1 */}
          <div className="gsap-pillar-card p-5 sm:p-6 rounded-3xl bg-[#121214]/90 border border-[#27272a] hover:border-red-600/50 transition-all space-y-2.5 group shadow-xl backdrop-blur-sm">
            <div className="w-11 h-11 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
              <Coins className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-black uppercase text-white font-display">
              1. Financial Stakes & Cash Dividends
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium">
              Miss a day, pay ₹250. Hit 100% quota, split all slacker fines on Sunday.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="gsap-pillar-card p-5 sm:p-6 rounded-3xl bg-[#121214]/90 border border-[#27272a] hover:border-emerald-600/50 transition-all space-y-2.5 group shadow-xl backdrop-blur-sm">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-black uppercase text-white font-display">
              2. EXIF GPS Camera & 2-Vouch Rule
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium">
              Live camera & GPS anti-cheat. 2 peer vouches confirm your sweat.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="gsap-pillar-card p-5 sm:p-6 rounded-3xl bg-[#121214]/90 border border-[#27272a] hover:border-amber-600/50 transition-all space-y-2.5 group shadow-xl backdrop-blur-sm">
            <div className="w-11 h-11 rounded-2xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Skull className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-black uppercase text-white font-display">
              3. One Piece Shame Wall
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium">
              Slackers get roasted on pirate bounty posters with ฿500,000 Berry bounties.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="gsap-pillar-card p-5 sm:p-6 rounded-3xl bg-[#121214]/90 border border-[#27272a] hover:border-blue-600/50 transition-all space-y-2.5 group shadow-xl backdrop-blur-sm">
            <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-black uppercase text-white font-display">
              4. Streak Shields & Duolingo Rewards
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium">
              Earn rest shields for consistency. Freeze penalties on sick or travel days.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* Interactive Dividend & Slacker Penalty Calculator */}
      {/* ======================================================== */}
      <section id="calculator" className="relative z-10 py-16 px-4 sm:px-8 max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-mono font-bold">
            <Coins className="w-3.5 h-3.5" />
            <span>Interactive Payout Simulator</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-white font-display">
            Calculate Your Squad Loot
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
            See how much you stand to earn when your friends slack off on their workouts.
          </p>
        </div>

        <div className="gsap-calculator-box p-6 sm:p-8 rounded-3xl bg-[#121214]/90 border-2 border-emerald-500/50 shadow-2xl relative overflow-hidden backdrop-blur-sm">
          {/* Background cartoon coin accent */}
          <div className="absolute -right-6 -bottom-6 pointer-events-none opacity-20">
            <CartoonGoldCoin className="w-48 h-48" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Controls */}
            <div className="lg:col-span-7 space-y-5">
              {/* Control 1: Squad Members */}
              <div>
                <div className="flex justify-between text-xs font-black uppercase text-zinc-300 mb-2">
                  <span>Squad Size:</span>
                  <span className="text-emerald-400 font-mono text-sm">{calcMembers} Friends</span>
                </div>
                <div className="flex gap-2">
                  {[3, 4, 5, 8, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => setCalcMembers(num)}
                      className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                        calcMembers === num
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-[#18181b] border border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Control 2: Target Days */}
              <div>
                <div className="flex justify-between text-xs font-black uppercase text-zinc-300 mb-2">
                  <span>Weekly Target:</span>
                  <span className="text-emerald-400 font-mono text-sm">{calcDays} Days / Week</span>
                </div>
                <div className="flex gap-2">
                  {[3, 4, 5, 6].map((days) => (
                    <button
                      key={days}
                      onClick={() => setCalcDays(days)}
                      className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                        calcDays === days
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-[#18181b] border border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {days}d
                    </button>
                  ))}
                </div>
              </div>

              {/* Control 3: Penalty per Miss */}
              <div>
                <div className="flex justify-between text-xs font-black uppercase text-zinc-300 mb-2">
                  <span>Penalty Per Missed Workout:</span>
                  <span className="text-red-400 font-mono text-sm">₹{calcPenalty}</span>
                </div>
                <div className="flex gap-2">
                  {[100, 250, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setCalcPenalty(amt)}
                      className={`flex-1 py-2 rounded-xl text-xs font-mono font-black transition-all ${
                        calcPenalty === amt
                          ? 'bg-red-600 text-white shadow-md glow-red'
                          : 'bg-[#18181b] border border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Control 4: Slackers */}
              <div>
                <div className="flex justify-between text-xs font-black uppercase text-zinc-300 mb-2">
                  <span>How Many Slack Off This Week?</span>
                  <span className="text-red-400 font-mono text-sm">{calcSlackers} Defaulters</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={calcMembers - 1}
                  value={calcSlackers}
                  onChange={(e) => setCalcSlackers(Number(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Right Result Card */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-[#18181b] border border-zinc-800 text-center space-y-4 shadow-xl">
              <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full">
                ESTIMATED SUNDAY PAYOUT
              </span>

              <div>
                <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 font-display">
                  +₹{estimatedDividendPerWinner.toLocaleString()}
                </div>
                <p className="text-xs text-zinc-300 font-bold mt-1">
                  Cash Dividend in Your Pocket
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#121214] border border-zinc-800 text-left text-xs text-zinc-400 space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span>Total Pot at Stake:</span>
                  <span className="text-white font-bold">₹{totalWeeklyStakes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Forfeited Penalty Fines:</span>
                  <span className="text-red-400 font-bold">₹{totalForfeitedFines.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Winning Finishers:</span>
                  <span className="text-emerald-400 font-bold">{winnersCount} Qualified</span>
                </div>
              </div>

              <button
                onClick={() => {
                  playPop();
                  onEnterHub();
                }}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/50 active:scale-95"
              >
                Create Squad With These Stakes 🚀
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* How It Works in 3 Clear Steps */}
      {/* ======================================================== */}
      <section id="how-it-works" className="relative z-10 py-16 px-4 sm:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-black uppercase tracking-widest text-red-500">
            Social Game Rules
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-white font-display">
            How StakeFit Works In 3 Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="gsap-step-card p-6 rounded-3xl bg-[#121214]/90 border border-[#27272a] space-y-3 relative overflow-hidden group hover:border-red-600/50 transition-all shadow-xl backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/40 flex items-center justify-center font-black text-xl">
              1
            </div>
            <h3 className="text-lg font-black uppercase text-white font-display">
              Lock In The Squad Pact
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Create a private squad with 2 to 10 friends. Agree on weekly workout frequency (e.g. 4 days) and set the penalty stake (e.g. ₹250 per missed workout).
            </p>
            <span className="absolute top-4 right-4 text-3xl opacity-20">⚔️</span>
          </div>

          {/* Step 2 */}
          <div className="gsap-step-card p-6 rounded-3xl bg-[#121214]/90 border border-[#27272a] space-y-3 relative overflow-hidden group hover:border-emerald-600/50 transition-all shadow-xl backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-black text-xl">
              2
            </div>
            <h3 className="text-lg font-black uppercase text-white font-display">
              Sweat & Get 2 Peer Vouches
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Snap your gym proof before the 11:59 PM midnight cutoff. Uploads check live EXIF time & location. 2 squad mates must tap "Vouch 👍" to confirm you showed up.
            </p>
            <span className="absolute top-4 right-4 text-3xl opacity-20">📸</span>
          </div>

          {/* Step 3 */}
          <div className="gsap-step-card p-6 rounded-3xl bg-[#121214]/90 border border-[#27272a] space-y-3 relative overflow-hidden group hover:border-amber-600/50 transition-all shadow-xl backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black text-xl">
              3
            </div>
            <h3 className="text-lg font-black uppercase text-white font-display">
              Split The Loot on Sunday
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Slackers pay their forfeited fines into the pot. 100% of fines are divided equally among members who completed their target, settled automatically via UPI.
            </p>
            <span className="absolute top-4 right-4 text-3xl opacity-20">💰</span>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* Live Interactive Product Preview */}
      {/* ======================================================== */}
      <section id="preview" className="relative z-10 py-16 px-4 sm:px-8 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-800 text-red-400 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Platform Preview</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-white font-display">
            Inside The StakeFit Engine
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
            Take a look at the daily workout feed, the infamous Shame Wall, and the settlement ledger.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
          {[
            { id: 'feed' as const, label: '🔥 Daily Proof Feed' },
            { id: 'shame' as const, label: '💀 The Shame Wall' },
            { id: 'ledger' as const, label: '💸 Settlement Ledger' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                playPop();
                setActivePreviewTab(tab.id);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activePreviewTab === tab.id
                  ? 'bg-red-600 text-white shadow-lg glow-red'
                  : 'bg-[#141416] border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Preview Frame */}
        <div className="gsap-preview-card p-4 sm:p-6 rounded-3xl bg-[#121214]/95 border-2 border-[#27272a] shadow-2xl max-w-4xl mx-auto backdrop-blur-sm">
          {activePreviewTab === 'feed' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#18181b] border border-zinc-800">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="Priya"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500"
                  />
                  <div>
                    <div className="text-xs font-black text-white">Priya Patel @priya_runs</div>
                    <div className="text-[10px] text-zinc-400">Captured Today, 07:15 AM • Cubbon Park</div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified (2 Vouches)</span>
                </span>
              </div>

              <div className="relative rounded-2xl overflow-hidden max-h-[300px]">
                <img
                  src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80"
                  alt="Workout proof"
                  className="w-full object-cover max-h-[300px]"
                />
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-[11px] font-mono text-zinc-200 border border-zinc-700">
                  📍 EXIF GPS Verified: 100% Match
                </div>
              </div>
            </div>
          )}

          {activePreviewTab === 'shame' && (
            <div className="p-6 rounded-2xl bg-[#0a0a0c] border border-red-900/60 text-center space-y-4">
              <div className="inline-block px-4 py-1 rounded-full bg-red-950 border border-red-800 text-red-400 text-xs font-mono font-black animate-pulse">
                💀 MOST WANTED SLACKER OF THE DAY
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80"
                  alt="Marcus"
                  className="w-24 h-24 rounded-2xl object-cover ring-4 ring-red-600 shadow-2xl"
                />
                <div className="text-left space-y-1">
                  <h4 className="text-xl font-black text-white font-display uppercase">Marcus Chen</h4>
                  <div className="text-xs text-red-400 font-mono font-bold">
                    Forfeited: ₹500 (2 Days Missed) • Bounty: ฿500,000 Berry
                  </div>
                  <p className="text-xs text-zinc-400 max-w-sm">
                    "Alarm went off, hit snooze 4 times. Coffee shop was nice though."
                  </p>
                </div>
              </div>
            </div>
          )}

          {activePreviewTab === 'ledger' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black uppercase text-emerald-400">Your Running Balance</div>
                  <div className="text-2xl font-black font-mono text-emerald-300">+₹500 (Dividend Profit)</div>
                </div>
                <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase">
                  Payout Sunday
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#18181b] border border-zinc-800 text-xs text-zinc-300 flex justify-between">
                <span>Marcus Chen owes the pool:</span>
                <span className="font-mono text-red-400 font-black">-₹250</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#18181b] border border-zinc-800 text-xs text-zinc-300 flex justify-between">
                <span>Dev Malik owes the pool:</span>
                <span className="font-mono text-red-400 font-black">-₹250</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* FAQ Accordion Section */}
      {/* ======================================================== */}
      <section id="faq" className="relative z-10 py-16 px-4 sm:px-8 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-black uppercase tracking-widest text-zinc-500">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-white font-display">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'What if friends refuse to vouch for me on purpose?',
              a: 'Our Anti-Sabotage Rule protects you! If your photo has a valid EXIF timestamp and gym GPS match, and no peer files an active dispute before 11:59 PM midnight, your workout automatically auto-passes and locks into your quota.',
            },
            {
              q: 'How does the financial settlement work on Sunday?',
              a: 'At Sunday 11:59 PM, the settlement engine calculates the net debtor/creditor ledger. Members who missed days send UPI payments directly to the winners who hit their 100% quota, exactly like Splitwise.',
            },
            {
              q: 'Can someone cheat with an old photo from Google or last month?',
              a: 'No! When you upload, our verification engine reads the image metadata for capture timestamp (within last 3 hours) and GPS geofence. Plus, any squad mate can hit "Call Out ⚠️" to freeze fake check-ins.',
            },
            {
              q: 'What happens if I am genuinely sick or traveling?',
              a: 'Consistent workouts reward you with Duolingo-style "Rest Shields". Deploying a shield freezes your daily requirement without forfeiting a penalty or resetting your streak.',
            },
            {
              q: 'Can I create multiple squads for different friend groups?',
              a: 'Yes! You can manage separate squads for your gym buddies, running club, and office colleagues with different stakes and member rosters.',
            },
          ].map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="gsap-faq-item rounded-2xl bg-[#121214]/90 border border-[#27272a] overflow-hidden transition-all backdrop-blur-sm"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-black text-sm text-white hover:text-red-400 transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-red-500' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-3 animate-in fade-in duration-150">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* Footer Banner */}
      {/* ======================================================== */}
      <section className="relative z-10 border-t border-[#27272a]/70 bg-[#070709]/90 py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white glow-red shadow-xl mx-auto">
            <Flame className="w-8 h-8 fill-white" />
          </div>

          <h3 className="text-3xl sm:text-4xl font-black uppercase text-white font-display">
            Ready to test your discipline?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
            Join thousands of squad members putting their money where their sweat is. Form your squad in under 60 seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                playGong();
                onEnterHub();
              }}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-xl shadow-red-950/80 glow-red border border-red-400 active:scale-95"
            >
              <span>Open Squads Hub (Supabase Style)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[10px] text-zinc-600 font-mono pt-4">
            StakeFit is a peer accountability platform. All stakes and dividends are settled directly between squad members.
          </p>
        </div>
      </section>
    </div>
  );
};
