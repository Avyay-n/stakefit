import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
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
  RotateCw,
  Send,
  MapPin,
  Clock,
  Smartphone,
} from 'lucide-react';
import { playPop, playGong } from '../utils/audio';
import { CartoonGoldCoin } from './illustrations/CartoonAssets';
import { GrainGradient } from './ui/GrainGradient';
import { IntroSplash } from './IntroSplash';

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
  // Cinematic full-screen fire intro on first site open
  const [showIntro, setShowIntro] = useState(true);

  // Calculator state
  const [calcMembers, setCalcMembers] = useState(5);
  const [calcDays, setCalcDays] = useState(4);
  const [calcPenalty, setCalcPenalty] = useState(250);
  const [calcSlackers, setCalcSlackers] = useState(2);

  // Active preview tab for the 3 physical flip card spots
  const [activePreviewTab, setActivePreviewTab] = useState<'spot1' | 'spot2' | 'spot3'>('spot1');
  const [isFlippedSpot1, setIsFlippedSpot1] = useState(false);
  const [isFlippedSpot2, setIsFlippedSpot2] = useState(false);
  const [isFlippedSpot3, setIsFlippedSpot3] = useState(false);

  // FAQ Accordion open index
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Active section tracking for the right side bar
  const [activeSection, setActiveSection] = useState('hero');
  const pageRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  // Smooth scroll helper using Lenis
  const scrollToSection = (id: string) => {
    playPop();
    if (lenisRef.current) {
      lenisRef.current.scrollTo('#' + id, {
        offset: -70,
        duration: 1.35,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 200);
    } else {
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
    }
  };

  // Lenis Smooth Scroll & GSAP ScrollTrigger Synchronization
  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // 1. Initialize Lenis (Darkroom Engineering)
    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.8,
    });
    lenisRef.current = lenis;

    // 2. Synchronize Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // 3. Connect Lenis to GSAP ticker for 60/120fps frame-perfect lock
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // 4. Lenis Velocity-based Skew & Active Section Tracker
    lenis.on('scroll', (e: { scroll: number; velocity: number }) => {
      const clampedVelocity = Math.max(-4.5, Math.min(4.5, (e.velocity || 0) * 0.05));
      gsap.to('.lenis-velocity-skew', {
        skewY: clampedVelocity,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
      });

      // Track active section
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
    });

    const ctx = gsap.context(() => {
      // 0. Smooth scrubbed red progress bar at top of screen
      gsap.to('.gsap-scroll-progress', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: pageRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.15,
        },
      });

      // 1. Hero Entrance animations
      gsap.from('.gsap-hero-title', {
        y: 35,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.out',
        delay: 0.05,
        clearProps: 'all',
      });
      gsap.from('.gsap-hero-sub', {
        y: 20,
        opacity: 0,
        duration: 0.75,
        ease: 'power2.out',
        delay: 0.15,
        clearProps: 'all',
      });
      gsap.from('.gsap-hero-cta', {
        y: 15,
        opacity: 0,
        duration: 0.7,
        ease: 'back.out(1.4)',
        delay: 0.25,
        clearProps: 'all',
      });

      // 2. 4 Pillars / Features entrance & alternating parallax depth scrub
      gsap.from('.gsap-pillar-card', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '#features',
          start: 'top 85%',
          once: true,
        },
      });

      gsap.to('.gsap-pillar-card-odd', {
        y: -25,
        ease: 'none',
        scrollTrigger: {
          trigger: '#features',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      });
      gsap.to('.gsap-pillar-card-even', {
        y: 25,
        ease: 'none',
        scrollTrigger: {
          trigger: '#features',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      });

      // 3. Calculator section scroll animation: buttons pop up!
      gsap.fromTo(
        '.gsap-calc-btn',
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.45,
          stagger: 0.035,
          ease: 'back.out(2.4)',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: '#calculator',
            start: 'top 80%',
            once: true,
          },
        }
      );

      gsap.fromTo(
        '.gsap-calc-target-btn',
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.45,
          stagger: 0.04,
          delay: 0.12,
          ease: 'back.out(2.4)',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: '#calculator',
            start: 'top 80%',
            once: true,
          },
        }
      );

      gsap.from('.gsap-calc-slider-block', {
        y: 25,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '#calculator',
          start: 'top 80%',
          once: true,
        },
      });

      gsap.from('.gsap-calc-payout-card', {
        y: 35,
        scale: 0.94,
        opacity: 0,
        duration: 0.7,
        ease: 'back.out(1.6)',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '#calculator',
          start: 'top 80%',
          once: true,
        },
      });

      // Calculator background coin parallax scrub
      gsap.to('.gsap-calc-coin', {
        y: -75,
        rotation: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: '#calculator',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      });

      // 4. How It Works 3-Steps scroll animation
      gsap.from('.gsap-step-card', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '#how-it-works',
          start: 'top 85%',
          once: true,
        },
      });

      // 5. Product Preview scroll animation & Parallax drift
      gsap.from('.gsap-preview-card', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '#preview',
          start: 'top 85%',
          once: true,
        },
      });

      gsap.to('.gsap-preview-card', {
        y: -25,
        ease: 'none',
        scrollTrigger: {
          trigger: '#preview',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      // 6. FAQ Section scroll animation
      gsap.from('.gsap-faq-item', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '#faq',
          start: 'top 85%',
          once: true,
        },
      });
    }, pageRef);

    // Refresh ScrollTrigger and safety check so elements are NEVER left blank
    ScrollTrigger.refresh();
    const safetyTimer = setTimeout(() => {
      ScrollTrigger.refresh();
      document
        .querySelectorAll<HTMLElement>(
          '.gsap-step-card, .gsap-faq-item, .gsap-pillar-card, .gsap-preview-card, .gsap-calc-btn, .gsap-calc-target-btn, .gsap-calc-payout-card'
        )
        .forEach((el) => {
          if (el.style.opacity && parseFloat(el.style.opacity) < 0.9) {
            el.style.opacity = '1';
            el.style.transform = 'none';
          }
        });
    }, 400);

    return () => {
      clearTimeout(safetyTimer);
      ctx.revert();
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Robust Calculator computations
  const actualDefaulters = Math.min(calcSlackers, calcMembers);
  const totalWeeklyStakes = calcMembers * calcDays * calcPenalty;
  const missedDaysPerDefaulter = Math.max(1, Math.round(calcDays / 2));
  const totalForfeitedFines = actualDefaulters * missedDaysPerDefaulter * calcPenalty;
  const winnersCount = Math.max(0, calcMembers - actualDefaulters);
  const estimatedDividendPerWinner =
    winnersCount > 0 ? Math.round(totalForfeitedFines / winnersCount) : 0;

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-[#070709] text-[#f4f4f5] font-sans selection:bg-red-600 selection:text-white relative overflow-x-hidden"
    >
      {/* Full-Screen Fire & Logo Intro Animation */}
      {showIntro && (
        <IntroSplash
          onComplete={() => {
            setShowIntro(false);
            window.scrollTo({ top: 0, behavior: 'instant' });
            setTimeout(() => {
              ScrollTrigger.refresh();
            }, 100);
          }}
        />
      )}

      {/* Lenis Smooth Scroll Progress Indicator Bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-red-600/20 z-50 pointer-events-none">
        <div className="gsap-scroll-progress h-full w-full bg-gradient-to-r from-red-600 via-orange-500 to-red-600 origin-left scale-x-0 shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
      </div>

      {/* Atmospheric Deep Red / Athletic Grain Background with Increased Red Wave Coverage */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-85">
        <GrainGradient
          colorLight="#991b1b"
          colorMid="#450a0a"
          colorDark="#070709"
          position={-0.14}
          softness={0.58}
          scale={1.2}
          grain={0.28}
          grainSize={1.1}
          speed={1.6}
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
                ? 'text-orange-400 border-b-2 border-orange-500 font-black'
                : 'text-zinc-400 hover:text-orange-400'
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
      {/* Floating Side Bar (Section Navigation Rail) */}
      {/* ======================================================== */}
      <aside
        className="hidden xl:flex fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-2 p-2 rounded-2xl bg-[#09090b]/85 backdrop-blur-xl border border-zinc-800/90 shadow-[0_12px_40px_rgba(0,0,0,0.85)] group select-none transition-all duration-300 hover:border-red-500/40"
        aria-label="Section Navigation Rail"
      >
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
      </aside>

      {/* ======================================================== */}
      {/* Hero Section */}
      {/* ======================================================== */}
      <section id="hero" className="relative z-10 pt-16 pb-16 sm:pt-24 sm:pb-24 px-4 sm:px-8 max-w-5xl mx-auto text-center space-y-7">
        {/* Main Hero Headline with pure red glare on 'Money' and clean crisp 'Sweat' */}
        <h1 className="gsap-hero-title lenis-velocity-skew text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black uppercase tracking-tight text-white font-display leading-[0.96] max-w-4xl mx-auto select-text">
          Put Your{' '}
          {/* Pure Red & Dark Red Glare on Money (Zero Yellow) */}
          <span className="relative inline-block mx-1 group align-baseline">
            <span className="animate-money-glare inline-block font-black select-text drop-shadow-[0_0_24px_rgba(239,68,68,0.6)]">
              Money
            </span>
            {/* Pure Red Lens Flare Sheen */}
            <span className="absolute inset-0 overflow-hidden pointer-events-none rounded-lg">
              <span className="absolute -inset-y-3 -inset-x-10 w-14 bg-gradient-to-r from-transparent via-red-500/60 to-transparent rotate-[28deg] blur-[1px] animate-glare-beam pointer-events-none" />
            </span>
          </span>{' '}
          Where Your{' '}
          {/* Clean Underlined Sweat with athletic pulse animation (No water drops or bubbles) */}
          <span className="relative inline-block mx-1 pb-1 sm:pb-2 border-b-4 sm:border-b-8 border-red-600 align-baseline font-black text-white">
            <span className="animate-sweat-word">Sweat</span>
          </span>{' '}
          Is.
        </h1>

        <p className="gsap-hero-sub max-w-2xl mx-auto text-sm sm:text-base text-zinc-300 font-medium leading-relaxed">
          Form private fitness accountability pacts with friends. Stake financial penalties on every workout.
          Slackers forfeit <strong className="text-white font-black">their chosen penalty stake per missed workout</strong> directly into the dividend pool paid to members who hit 100% — and get roasted on the{' '}
          <strong className="text-red-400 font-black">Pirate Bounty Shame Wall</strong>.
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
      </section>

      {/* Continuous Infinite Kinetic Marquee Strip */}
      <div className="relative overflow-hidden py-3.5 bg-[#0a0a0d] border-y border-zinc-800/80 my-4 select-none">
        <div className="animate-marquee-infinite flex items-center gap-8 whitespace-nowrap text-xs font-mono font-black tracking-widest uppercase text-zinc-400">
          {[...Array(4)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="flex items-center gap-2">
                <span className="text-red-500">⚡</span> REAL MONEY STAKES
              </span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-2">
                <span className="text-orange-400">💰</span> SUNDAY DIVIDEND POOL
              </span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-2">
                <span className="text-red-500">💀</span> PIRATE BOUNTY SHAME WALL
              </span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-2">
                <span className="text-blue-400">🛡️</span> EMERGENCY REST SHIELDS
              </span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-2">
                <span className="text-red-500">📸</span> EXIF LIVE CAMERA VOUCHES
              </span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-2">
                <span className="text-emerald-400">0</span> ZERO CHEATING TOLERATED
              </span>
              <span className="text-zinc-600">•</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4 Core Pillars */}
      {/* ======================================================== */}
      <section id="features" className="relative z-10 py-16 px-4 sm:px-8 max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-black uppercase tracking-widest text-red-500">
            Engineered For Pure Discipline
          </span>
          <h2 className="lenis-velocity-skew text-3xl sm:text-5xl font-black uppercase text-white font-display">
            How StakeFit Forces You To Show Up
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Pillar 1 */}
          <div className="gsap-pillar-card gsap-pillar-card-odd p-5 sm:p-6 rounded-3xl bg-[#121214] border border-[#27272a] hover:border-red-600/50 transition-all space-y-2.5 group shadow-xl">
            <div className="w-11 h-11 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
              <Coins className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-black uppercase text-white font-display">
              1. Financial Stakes & Cash Dividends
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
              Miss a day, forfeit your stake. Hit 100% quota, split all slacker fines on Sunday.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="gsap-pillar-card gsap-pillar-card-even p-5 sm:p-6 rounded-3xl bg-[#121214] border border-[#27272a] hover:border-emerald-600/50 transition-all space-y-2.5 group shadow-xl">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-black uppercase text-white font-display">
              2. EXIF GPS Camera & 2-Vouch Rule
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
              Live camera & GPS anti-cheat. 2 peer vouches confirm your sweat.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="gsap-pillar-card gsap-pillar-card-odd p-5 sm:p-6 rounded-3xl bg-[#121214] border border-[#27272a] hover:border-amber-600/50 transition-all space-y-2.5 group shadow-xl">
            <div className="w-11 h-11 rounded-2xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Skull className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-black uppercase text-white font-display">
              3. Pirate Bounty Shame Wall
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
              Slackers get roasted on pirate bounty posters with ฿500,000 Berry bounties.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="gsap-pillar-card gsap-pillar-card-even p-5 sm:p-6 rounded-3xl bg-[#121214] border border-[#27272a] hover:border-blue-600/50 transition-all space-y-2.5 group shadow-xl">
            <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-black uppercase text-white font-display">
              4. Streak Shields & Milestone Rewards
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
              Earn rest shields for consistency. Freeze penalties on sick or travel days.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* Interactive Dividend & Slacker Penalty Calculator (Open Black Layout, Orange Theme) */}
      {/* ======================================================== */}
      <section id="calculator" className="relative z-10 py-16 px-4 sm:px-8 max-w-6xl mx-auto space-y-10">
        {/* Enlarged Floating Background Cartoon Coin */}
        <div className="gsap-calc-coin absolute -right-10 top-0 lg:-right-20 lg:-top-10 pointer-events-none opacity-20 z-0">
          <CartoonGoldCoin className="w-80 h-80 sm:w-[480px] sm:h-[480px] lg:w-[580px] lg:h-[580px]" />
        </div>

        {/* Section Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-950/60 border border-orange-800 text-orange-400 text-xs font-mono font-bold">
            <Coins className="w-3.5 h-3.5" />
            <span>Interactive Payout Simulator</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-white font-display">
            Calculate Your Squad Loot
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-lg mx-auto">
            See how much you stand to earn when your friends slack off on their workouts.
          </p>
        </div>

        {/* Free Open Grid (No Box Border Container) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Controls */}
          <div className="lg:col-span-7 space-y-6">
            {/* Control 1: Squad Members Buttons 1 to 10 */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs font-black uppercase text-zinc-300">
                <span>Squad Size:</span>
                <span className="text-orange-400 font-mono text-sm font-black">
                  {calcMembers} Friends
                </span>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      playPop();
                      setCalcMembers(num);
                    }}
                    className={`gsap-calc-btn py-2.5 rounded-xl text-xs font-black transition-all ${
                      calcMembers === num
                        ? 'bg-orange-500 text-white shadow-lg glow-orange border border-orange-400 scale-105'
                        : 'bg-[#18181b] border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Control 2: Weekly Target Days */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs font-black uppercase text-zinc-300">
                <span>Weekly Target:</span>
                <span className="text-orange-400 font-mono text-sm font-black">
                  {calcDays} Days / Week
                </span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {[2, 3, 4, 5, 6, 7].map((days) => (
                  <button
                    key={days}
                    onClick={() => {
                      playPop();
                      setCalcDays(days);
                    }}
                    className={`gsap-calc-target-btn py-2.5 rounded-xl text-xs font-black transition-all ${
                      calcDays === days
                        ? 'bg-orange-500 text-white shadow-lg glow-orange border border-orange-400 scale-105'
                        : 'bg-[#18181b] border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    {days}d
                  </button>
                ))}
              </div>
            </div>

            {/* Control 3: Penalty per Missed Workout (Range 100 to 2000 Slider) */}
            <div className="gsap-calc-slider-block space-y-2 p-4 rounded-2xl bg-[#121214]/80 border border-zinc-800/80">
              <div className="flex justify-between items-center text-xs font-black uppercase text-zinc-300">
                <span>Penalty Per Missed Workout:</span>
                <span className="text-orange-400 font-mono text-base font-black">
                  ₹{calcPenalty.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={calcPenalty}
                onChange={(e) => setCalcPenalty(Number(e.target.value))}
                className="slider-orange"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>₹100 (Casual)</span>
                <span>₹1,000 (Serious)</span>
                <span>₹2,000 (Hardcore)</span>
              </div>
            </div>

            {/* Control 4: Friends Who Missed Workouts (Simple Terms Slider 1 to 10) */}
            <div className="gsap-calc-slider-block space-y-2 p-4 rounded-2xl bg-[#121214]/80 border border-zinc-800/80">
              <div className="flex justify-between items-center text-xs font-black uppercase text-zinc-300">
                <span>Friends Who Missed Workouts:</span>
                <span className="text-orange-400 font-mono text-base font-black">
                  {calcSlackers} {calcSlackers === 1 ? 'Friend' : 'Friends'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={calcSlackers}
                onChange={(e) => setCalcSlackers(Number(e.target.value))}
                className="slider-orange"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>1 Friend</span>
                <span>5 Friends</span>
                <span>10 Friends</span>
              </div>
            </div>
          </div>

          {/* Right Result Card (Pure Athletic Orange Accents) */}
          <div className="gsap-calc-payout-card lg:col-span-5 p-7 rounded-3xl bg-[#121214] border border-orange-500/30 text-center space-y-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600" />

            <span className="inline-block text-[10px] font-mono font-black text-orange-400 uppercase tracking-widest bg-orange-950/60 border border-orange-800 px-3.5 py-1.5 rounded-full">
              ESTIMATED SUNDAY PAYOUT
            </span>

            <div>
              <div className="text-4xl sm:text-6xl font-black font-mono text-orange-400 font-display">
                +₹{estimatedDividendPerWinner.toLocaleString()}
              </div>
              <p className="text-xs text-zinc-300 font-bold mt-1.5">
                Cash Dividend Deposited in Your UPI Pocket
              </p>
            </div>

            {/* Breakdown Table */}
            <div className="p-4 rounded-2xl bg-[#18181b] border border-zinc-800 text-left text-xs text-zinc-300 space-y-2 font-mono">
              <div className="flex justify-between">
                <span>Total Pot at Stake:</span>
                <span className="text-white font-bold">₹{totalWeeklyStakes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Forfeited Penalty Fines:</span>
                <span className="text-orange-400 font-bold">₹{totalForfeitedFines.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Finishers Splitting Loot:</span>
                <span className="text-white font-bold">
                  {winnersCount > 0 ? `${winnersCount} Qualified` : '0 (Pot Rolls Over)'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                playPop();
                onEnterHub();
              }}
              className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-orange-950/60 glow-orange active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Create Squad With These Stakes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
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
          <div className="gsap-step-card p-6 rounded-3xl bg-[#121214] border border-[#27272a] space-y-3 relative overflow-hidden group hover:border-red-600/50 transition-all shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/40 flex items-center justify-center font-black text-xl">
              1
            </div>
            <h3 className="text-lg font-black uppercase text-white font-display">
              Lock In The Squad Pact
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Create a private squad with 1 to 10 friends. Agree on weekly workout frequency (e.g. 4 days) and set your custom stakes for every missed workout.
            </p>
            <span className="absolute top-4 right-4 text-3xl opacity-20">⚔️</span>
          </div>

          {/* Step 2 */}
          <div className="gsap-step-card p-6 rounded-3xl bg-[#121214] border border-[#27272a] space-y-3 relative overflow-hidden group hover:border-emerald-600/50 transition-all shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-black text-xl">
              2
            </div>
            <h3 className="text-lg font-black uppercase text-white font-display">
              Sweat & Get 2 Peer Vouches
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Snap your gym proof before midnight. Uploads check camera sensor EXIF & gym GPS. 2 squad mates must tap "Vouch 👍" to confirm you showed up.
            </p>
            <span className="absolute top-4 right-4 text-3xl opacity-20">📸</span>
          </div>

          {/* Step 3 */}
          <div className="gsap-step-card p-6 rounded-3xl bg-[#121214] border border-[#27272a] space-y-3 relative overflow-hidden group hover:border-amber-600/50 transition-all shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black text-xl">
              3
            </div>
            <h3 className="text-lg font-black uppercase text-white font-display">
              Split The Loot on Sunday
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Slackers pay their forfeited fines into the pot. 100% of fines are divided equally among members who completed their target, settled via UPI.
            </p>
            <span className="absolute top-4 right-4 text-3xl opacity-20">💰</span>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* Live Interactive Product Preview: The 3 Physical 3D Flip Card Spots */}
      {/* ======================================================== */}
      <section id="preview" className="relative z-10 py-16 px-4 sm:px-8 max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-800 text-red-400 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive 3D Physical Cards</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-white font-display">
            Inside The StakeFit Engine
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-lg mx-auto">
            Click any card to flip between the front face and back forensic proof!
          </p>
        </div>

        {/* Tab Controls for the 3 Spots */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
          {[
            { id: 'spot1' as const, label: '💀 1. Pirate Bounty Shame Wall' },
            { id: 'spot2' as const, label: '📸 2. Transformation Vault' },
            { id: 'spot3' as const, label: '🔍 3. EXIF Anti-Cheat Inspector' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                playPop();
                setActivePreviewTab(tab.id);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activePreviewTab === tab.id
                  ? 'bg-red-600 text-white shadow-lg glow-red'
                  : 'bg-[#141416] border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ======================================================== */}
        {/* SPOT #1: The Pirate Bounty Shame Wall (Wanted Poster -> Slacker Invoice) */}
        {/* ======================================================== */}
        {activePreviewTab === 'spot1' && (
          <div className="gsap-preview-card max-w-md mx-auto perspective-1000">
            <div
              onClick={() => {
                playPop();
                setIsFlippedSpot1(!isFlippedSpot1);
              }}
              className={`relative w-full min-h-[500px] rounded-3xl transition-transform duration-700 preserve-3d cursor-pointer shadow-2xl ${
                isFlippedSpot1 ? 'rotate-y-180' : ''
              }`}
            >
              {/* Front Face: Vintage Anime Bounty Poster */}
              <div className="absolute inset-0 backface-hidden p-6 rounded-3xl bg-[#f4ebd0] text-[#2c1d11] border-4 border-[#8b5a2b] shadow-2xl flex flex-col justify-between overflow-hidden">
                <div className="text-center space-y-1">
                  <div className="text-4xl sm:text-5xl font-black font-display tracking-widest uppercase text-[#3e2723]">
                    WANTED
                  </div>
                  <div className="text-[11px] font-mono font-black uppercase tracking-wider text-[#5d4037] border-y border-[#8b5a2b] py-0.5">
                    DEAD OR FORFEITED
                  </div>
                </div>

                <div className="relative my-3 mx-auto w-48 h-48 rounded-xl overflow-hidden border-2 border-[#5d4037] shadow-inner bg-[#d7ccc8]">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80"
                    alt="Marcus Chen Roast Mugshot"
                    className="w-full h-full object-cover grayscale contrast-125"
                  />
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded shadow">
                    SLACKER
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <div className="text-xl font-black uppercase font-display text-[#3e2723]">
                    Marcus Chen
                  </div>
                  <div className="text-xs font-mono font-black text-red-700">
                    ฿ 500,000 BERRY BOUNTY
                  </div>
                  <p className="text-[11px] font-serif italic text-[#5d4037] max-w-xs mx-auto">
                    "Hit snooze 4 times. Coffee shop was nice though."
                  </p>
                </div>

                <div className="mt-3 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3e2723] text-[#f4ebd0] text-[10px] font-mono font-bold">
                    <RotateCw className="w-3 h-3" />
                    <span>Tap Card to Flip Crime Sheet 🔄</span>
                  </span>
                </div>
              </div>

              {/* Back Face: Slacker Debt Invoice & Crime Sheet */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 p-6 rounded-3xl bg-[#121214] text-white border-2 border-red-600/70 shadow-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-red-500 font-black">
                      OFFICIAL DEBT INVOICE
                    </span>
                    <h4 className="text-lg font-black uppercase font-display text-white">
                      Marcus Chen
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-zinc-400">STATUS:</span>
                    <div className="text-xs font-mono font-black text-red-400">UNPAID DEBT</div>
                  </div>
                </div>

                {/* Penalty Owed & Days Missed */}
                <div className="space-y-3 font-mono">
                  <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase text-red-400 font-bold">Penalty Owed</div>
                      <div className="text-2xl font-black text-red-400 font-display">-₹500.00</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase text-zinc-400 font-bold">Days Missed</div>
                      <div className="text-sm font-black text-white">2 of 4 Days</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#18181b] border border-zinc-800 text-xs space-y-1">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>GPS Telemetry: Bed / Sofa (0 km/h)</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>Missed Cutoff: Thursday & Friday 11:59 PM</span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playPop();
                      alert('WhatsApp Roast link generated!');
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send WhatsApp Roast 💬</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playGong();
                      alert('UPI Settlement link generated for Marcus Chen!');
                    }}
                    className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg glow-red"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>Settle UPI Debt (-₹500) 💸</span>
                  </button>
                </div>

                <div className="text-center pt-1">
                  <span className="text-[10px] font-mono text-zinc-500">
                    🔄 Click anywhere to flip back to Wanted poster
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SPOT #2: Body Transformation Vault (Day 1 Before -> Day 90 After) */}
        {/* ======================================================== */}
        {activePreviewTab === 'spot2' && (
          <div className="gsap-preview-card max-w-md mx-auto perspective-1000">
            <div
              onClick={() => {
                playPop();
                setIsFlippedSpot2(!isFlippedSpot2);
              }}
              className={`relative w-full min-h-[500px] rounded-3xl transition-transform duration-700 preserve-3d cursor-pointer shadow-2xl ${
                isFlippedSpot2 ? 'rotate-y-180' : ''
              }`}
            >
              {/* Front Face: Day 1 Starting Physique */}
              <div className="absolute inset-0 backface-hidden p-6 rounded-3xl bg-[#121214] text-white border-2 border-zinc-700 shadow-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">
                      TRANSFORMATION VAULT
                    </span>
                    <h4 className="text-lg font-black uppercase font-display text-white">
                      DAY 1 — BEFORE
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-mono font-bold">
                    Oct 1, 2024
                  </span>
                </div>

                <div className="relative my-3 rounded-2xl overflow-hidden max-h-52 border border-zinc-700">
                  <img
                    src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80"
                    alt="Day 1 Starting Workout"
                    className="w-full h-52 object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[11px] font-mono text-zinc-200">
                    Initial Weigh-in Photo
                  </div>
                </div>

                {/* Day 1 Metrics */}
                <div className="grid grid-cols-3 gap-2 font-mono text-center">
                  <div className="p-2 rounded-xl bg-[#18181b] border border-zinc-800">
                    <div className="text-[9px] uppercase text-zinc-400">Weight</div>
                    <div className="text-sm font-black text-white">84.5 kg</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#18181b] border border-zinc-800">
                    <div className="text-[9px] uppercase text-zinc-400">Body Fat</div>
                    <div className="text-sm font-black text-white">24.8%</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#18181b] border border-zinc-800">
                    <div className="text-[9px] uppercase text-zinc-400">Stake</div>
                    <div className="text-sm font-black text-red-400">₹2,500</div>
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-950/60 border border-orange-800 text-orange-400 text-[10px] font-mono font-bold">
                    <RotateCw className="w-3 h-3" />
                    <span>Tap Card to Reveal Day 90 Shredded Physique 🔄</span>
                  </span>
                </div>
              </div>

              {/* Back Face: Day 90 Shredded Current Physique */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 p-6 rounded-3xl bg-[#121214] text-white border-2 border-emerald-500/80 shadow-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                      TRANSFORMATION VAULT
                    </span>
                    <h4 className="text-lg font-black uppercase font-display text-white">
                      DAY 90 — SHREDDED FINISH
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono font-bold">
                    Jan 1, 2025
                  </span>
                </div>

                <div className="relative my-3 rounded-2xl overflow-hidden max-h-52 border border-emerald-600/60">
                  <img
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80"
                    alt="Day 90 Shredded Physique"
                    className="w-full h-52 object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-emerald-950/90 border border-emerald-700 text-[11px] font-mono text-emerald-300 font-bold">
                    🏆 90-Day Discipline Dividend Winner
                  </div>
                </div>

                {/* Day 90 Metrics */}
                <div className="grid grid-cols-3 gap-2 font-mono text-center">
                  <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800">
                    <div className="text-[9px] uppercase text-zinc-400">Weight Loss</div>
                    <div className="text-sm font-black text-emerald-400">-11.3 kg</div>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800">
                    <div className="text-[9px] uppercase text-zinc-400">Lean Muscle</div>
                    <div className="text-sm font-black text-orange-400">+4.2 kg</div>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800">
                    <div className="text-[9px] uppercase text-zinc-400">Dividends</div>
                    <div className="text-sm font-black text-emerald-400">+₹4,750</div>
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <span className="text-[10px] font-mono text-zinc-500">
                    🔄 Click anywhere to flip back to Day 1 Starting Point
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SPOT #3: The Daily Proof EXIF Anti-Cheat Inspector */}
        {/* ======================================================== */}
        {activePreviewTab === 'spot3' && (
          <div className="gsap-preview-card max-w-md mx-auto perspective-1000">
            <div
              onClick={() => {
                playPop();
                setIsFlippedSpot3(!isFlippedSpot3);
              }}
              className={`relative w-full min-h-[500px] rounded-3xl transition-transform duration-700 preserve-3d cursor-pointer shadow-2xl ${
                isFlippedSpot3 ? 'rotate-y-180' : ''
              }`}
            >
              {/* Front Face: High-Resolution Workout Sweat Photo */}
              <div className="absolute inset-0 backface-hidden p-6 rounded-3xl bg-[#121214] text-white border-2 border-zinc-700 shadow-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                      alt="Priya Patel"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500"
                    />
                    <div>
                      <div className="text-xs font-black text-white">Priya Patel @priya_runs</div>
                      <div className="text-[10px] text-zinc-400">Today, 06:48 AM • Indiranagar</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>2 Vouches</span>
                  </span>
                </div>

                <div className="relative my-3 rounded-2xl overflow-hidden max-h-56 border border-zinc-700">
                  <img
                    src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80"
                    alt="Daily Workout Sweat Photo"
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md text-[11px] font-mono text-zinc-200 border border-zinc-700">
                    💧 45m HIIT Kettlebell Circuit
                  </div>
                </div>

                <p className="text-xs text-zinc-300 italic border-l-2 border-red-500 pl-3">
                  "Legs burning, but there was no way I was donating ₹250 to Dev today!"
                </p>

                <div className="mt-3 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-800 text-red-400 text-[10px] font-mono font-bold">
                    <RotateCw className="w-3 h-3" />
                    <span>Tap Card to Inspect EXIF Forensic Passport 🔄</span>
                  </span>
                </div>
              </div>

              {/* Back Face: The Anti-Cheat Forensic Passport */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 p-6 rounded-3xl bg-[#09090b] text-white border-2 border-emerald-500/80 shadow-2xl flex flex-col justify-between font-mono">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <span className="text-[10px] uppercase text-emerald-400 font-black">
                      EXIF FORENSIC PASSPORT
                    </span>
                    <h4 className="text-base font-black uppercase font-display text-white">
                      Anti-Cheat Verification
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-black">
                    99.4% CONFIDENCE
                  </span>
                </div>

                {/* Forensic Metadata Specs */}
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#121214] border border-zinc-800 space-y-1">
                    <div className="flex items-center gap-2 text-zinc-400 text-[10px]">
                      <Smartphone className="w-3 h-3 text-emerald-400" />
                      <span>Hardware Camera Sensor</span>
                    </div>
                    <div className="text-white font-bold text-[11px]">
                      Apple iPhone 16 Pro • 24mm f/1.78 • ISO 125
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#121214] border border-zinc-800 space-y-1">
                    <div className="flex items-center gap-2 text-zinc-400 text-[10px]">
                      <MapPin className="w-3 h-3 text-red-400" />
                      <span>Geofence GPS Telemetry</span>
                    </div>
                    <div className="text-white font-bold text-[11px]">
                      12.9716° N, 77.5946° E • Gold's Gym Indiranagar
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#121214] border border-zinc-800 space-y-1">
                    <div className="flex items-center gap-2 text-zinc-400 text-[10px]">
                      <Clock className="w-3 h-3 text-orange-400" />
                      <span>Timestamp Verification</span>
                    </div>
                    <div className="text-white font-bold text-[11px]">
                      06:48:22 AM IST (Captured within 3hr window)
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/80 space-y-1">
                    <div className="flex items-center gap-2 text-emerald-400 text-[10px]">
                      <Shield className="w-3 h-3" />
                      <span>Peer Signatures</span>
                    </div>
                    <div className="text-zinc-200 text-[10px]">
                      Vouched by @vikram_lifts (07:18 AM) & @rohit_k (07:22 AM)
                    </div>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <span className="text-[10px] text-zinc-500">
                    🔄 Click anywhere to flip back to Workout Sweat Photo
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
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
              a: 'Consistent workouts reward you with Milestone "Rest Shields". Deploying a shield freezes your daily requirement without forfeiting a penalty or resetting your streak.',
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
                className="gsap-faq-item rounded-2xl bg-[#121214] border border-[#27272a] overflow-hidden transition-all"
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
                  <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-zinc-800/60 pt-3 animate-in fade-in duration-150">
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
      <section className="relative z-10 border-t border-[#27272a]/70 bg-[#070709] py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white glow-red shadow-xl mx-auto">
            <Flame className="w-8 h-8 fill-white" />
          </div>

          <h3 className="text-3xl sm:text-4xl font-black uppercase text-white font-display">
            Ready to test your discipline?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-lg mx-auto">
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
              <span>Open Squads Hub</span>
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
