import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { playPop, playGong } from '../utils/audio';
import { ScrollDissolveReveal } from './ui/scroll-dissolve-reveal';

interface IntroSplashProps {
  onComplete: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete }) => {
  // 3-Stage Fire Animation Progression:
  // Stage 1: 'streak' (0s - 0.7s) - Flame streak shoots in and sparks fire
  // Stage 2: 'glow' (0.7s - 1.8s) - Intense burning, heat bloom & throbbing glow
  // Stage 3: 'explode' (1.8s+) - Fiery shockwave explosion, revealing STAKE FIT & scroll message
  const [stage, setStage] = useState<'streak' | 'glow' | 'explode'>('streak');
  const [hasExploded, setHasExploded] = useState(false);
  const [dissolveProgress, setDissolveProgress] = useState(0);

  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Stage 1: Flame streak ignition sound
    try {
      playPop();
    } catch {
      // Audio safeguard
    }

    // Transition to Stage 2: Intense Burning & Heat Glow at 0.7s
    const timer1 = setTimeout(() => {
      setStage('glow');
    }, 700);

    // Transition to Stage 3: Fiery Shockwave Explosion & Reveal at 1.8s
    const timer2 = setTimeout(() => {
      setStage('explode');
      setHasExploded(true);
      try {
        playGong();
      } catch {
        // Audio safeguard
      }
    }, 1800);

    // Escape key skips directly into home page
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  // Smooth in-place dissolve loop driven by scroll/wheel
  useEffect(() => {
    let touchStartY = 0;

    const handleWheel = (e: WheelEvent) => {
      // Only allow dissolve once explosion has revealed the text & prompt
      if (!hasExploded) return;
      const delta = e.deltaY;
      if (delta > 0) {
        targetProgressRef.current = Math.min(1.0, targetProgressRef.current + delta * 0.0016);
      } else {
        targetProgressRef.current = Math.max(0.0, targetProgressRef.current + delta * 0.0016);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!hasExploded) return;
      const delta = touchStartY - e.touches[0].clientY;
      touchStartY = e.touches[0].clientY;
      if (delta > 0) {
        targetProgressRef.current = Math.min(1.0, targetProgressRef.current + delta * 0.0035);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Smooth physics RAF loop
    const updateProgress = () => {
      currentProgressRef.current += (targetProgressRef.current - currentProgressRef.current) * 0.14;
      setDissolveProgress(currentProgressRef.current);

      // Once dissolved > 96%, finish and enter home page
      if (currentProgressRef.current >= 0.96) {
        onComplete();
        return;
      }

      animFrameRef.current = requestAnimationFrame(updateProgress);
    };

    animFrameRef.current = requestAnimationFrame(updateProgress);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [hasExploded, onComplete]);

  // Auto-dissolve when clicking "Scroll to Enter"
  const handleScrollToEnter = () => {
    targetProgressRef.current = 1.0;
  };

  // Overlay fire & text fade out smoothly as dissolve starts
  const overlayOpacity = Math.max(0, 1 - dissolveProgress * 2.8);

  return (
    <div className="fixed inset-0 z-[100] w-full h-full bg-black overflow-hidden select-none">
      {/* Burning Fire Scroll Dissolve Reveal Component (In Place) */}
      <ScrollDissolveReveal
        imageFront="/intro-front.png"
        imageBack="/home-preview.jpg"
        progress={dissolveProgress}
        className="absolute inset-0 w-full h-full"
      >
        {/* Full-Screen Overlay on top of the Shader Canvas */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-200 ${
            stage === 'explode' ? 'animate-burst-shake' : ''
          }`}
          style={{ opacity: overlayOpacity }}
        >
          {/* Skip Button */}
          <button
            onClick={onComplete}
            className="absolute top-6 right-6 pointer-events-auto px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold text-zinc-500 hover:text-white bg-black/60 hover:bg-zinc-900 border border-zinc-800 transition-all z-30"
          >
            Skip ✕
          </button>

          {/* Ambient Fire Glow Heat Aura */}
          <div
            className={`absolute w-[360px] h-[360px] sm:w-[540px] sm:h-[540px] rounded-full pointer-events-none blur-3xl transition-all duration-700 ${
              stage === 'streak'
                ? 'opacity-40 scale-75'
                : stage === 'glow'
                ? 'opacity-85 scale-125'
                : 'opacity-100 scale-140'
            }`}
            style={{
              background:
                'radial-gradient(circle, rgba(239,68,68,0.45) 0%, rgba(249,115,22,0.28) 38%, rgba(0,0,0,0) 70%)',
            }}
          />

          {/* Stage 3: Fiery Shockwave Explosion Ring */}
          {stage === 'explode' && (
            <div className="absolute w-44 h-44 rounded-full border-4 pointer-events-none animate-shockwave" />
          )}

          {/* Stage 3: Dispersed Explosion Sparks */}
          {stage === 'explode' && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {[
                { x: '120px', y: '-90px', delay: '0s', size: 'w-2.5 h-2.5', bg: 'bg-yellow-300' },
                { x: '-130px', y: '-110px', delay: '0.04s', size: 'w-2 h-2', bg: 'bg-orange-400' },
                { x: '160px', y: '50px', delay: '0.08s', size: 'w-3 h-3', bg: 'bg-red-500' },
                { x: '-150px', y: '60px', delay: '0.02s', size: 'w-2 h-2', bg: 'bg-amber-300' },
                { x: '90px', y: '130px', delay: '0.06s', size: 'w-2 h-2', bg: 'bg-orange-500' },
                { x: '-80px', y: '120px', delay: '0.1s', size: 'w-2.5 h-2.5', bg: 'bg-yellow-400' },
                { x: '0px', y: '-160px', delay: '0.05s', size: 'w-2 h-2', bg: 'bg-red-400' },
                { x: '0px', y: '150px', delay: '0.07s', size: 'w-2 h-2', bg: 'bg-amber-400' },
              ].map((sp, idx) => (
                <span
                  key={idx}
                  className={`absolute rounded-full ${sp.size} ${sp.bg} blur-[0.5px] animate-ember-burst`}
                  style={
                    {
                      '--burst-x': sp.x,
                      '--burst-y': sp.y,
                      animationDelay: sp.delay,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          )}

          {/* Center Brand Group: Unified Free-Standing Fire + Words Popping Out */}
          <div className="relative z-10 flex items-center justify-center px-4">
            {/* The Unified Athletic Fire (Exact same flame throughout all 3 stages) */}
            <div
              className={`relative flex items-center justify-center transition-all duration-700 ${
                stage === 'streak'
                  ? 'animate-flame-streak'
                  : stage === 'glow'
                  ? 'animate-flame-glow-pulse'
                  : 'animate-flame-flicker'
              }`}
            >
              {/* Athletic Multi-Tier Flame SVG (Exact 3-Color Fire from Image 2) */}
              <svg
                viewBox="0 0 120 140"
                className={`transition-all duration-500 ${
                  stage === 'streak'
                    ? 'w-20 h-28 sm:w-28 sm:h-36'
                    : stage === 'glow'
                    ? 'w-26 h-36 sm:w-36 sm:h-48 scale-110 drop-shadow-[0_0_40px_rgba(239,68,68,1)] drop-shadow-[0_0_80px_rgba(249,115,22,0.85)]'
                    : 'w-24 h-32 sm:w-32 sm:h-44 lg:w-36 lg:h-48 drop-shadow-[0_0_35px_rgba(239,68,68,0.95)] drop-shadow-[0_0_65px_rgba(249,115,22,0.7)]'
                }`}
              >
                <defs>
                  {/* Outer Red Flame Gradient */}
                  <linearGradient id="fireOuterRed" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#b91c1c" />
                    <stop offset="40%" stopColor="#dc2626" />
                    <stop offset="85%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#f87171" />
                  </linearGradient>

                  {/* Middle Orange Flame Gradient */}
                  <linearGradient id="fireMidOrange" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#c2410c" />
                    <stop offset="45%" stopColor="#ea580c" />
                    <stop offset="80%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#fb923c" />
                  </linearGradient>

                  {/* Inner Golden-Yellow Core Gradient */}
                  <linearGradient id="fireInnerYellow" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#eab308" />
                    <stop offset="50%" stopColor="#facc15" />
                    <stop offset="100%" stopColor="#fef08a" />
                  </linearGradient>
                </defs>

                {/* Outer Red Flame (Curved athletic tips matching Image 2) */}
                <path
                  d="M60 5 C68 28 82 38 88 52 C95 68 84 82 92 98 C96 106 90 118 78 126 C66 134 46 134 34 126 C22 118 16 104 22 92 C26 84 20 74 24 62 C28 50 40 40 42 26 C44 14 54 8 60 5 Z"
                  fill="url(#fireOuterRed)"
                />
                {/* Left and Right Outer Flame Hooks */}
                <path
                  d="M24 72 C14 80 12 94 18 106 C24 118 40 130 60 130 C80 130 96 118 102 106 C108 94 106 80 96 72 C92 84 86 96 76 104 C66 112 46 112 38 102 C30 92 28 82 24 72 Z"
                  fill="#dc2626"
                  opacity="0.85"
                />

                {/* Middle Orange Flame (Nested tongues matching Image 2) */}
                <path
                  d="M60 28 C66 45 76 54 78 68 C80 82 72 90 76 102 C78 108 72 118 64 122 C56 126 44 126 36 120 C28 114 26 102 30 92 C34 82 32 72 36 60 C40 48 52 38 60 28 Z"
                  fill="url(#fireMidOrange)"
                />

                {/* Inner Golden-Yellow Core Flame */}
                <path
                  d="M58 56 C64 70 70 78 68 90 C66 102 58 112 50 114 C42 112 36 102 38 90 C40 80 46 70 54 60 C56 58 57 57 58 56 Z"
                  fill="url(#fireInnerYellow)"
                />
                {/* Bright Core Heat Center */}
                <ellipse cx="52" cy="100" rx="9" ry="14" fill="#ffffff" opacity="0.9" />
              </svg>

              {/* Rising Sparks & Embers during burning */}
              <div className="absolute inset-0 pointer-events-none">
                <span
                  className="absolute w-1.5 h-1.5 rounded-full bg-amber-300 blur-[0.5px] animate-spark-rise"
                  style={{ top: '15%', left: '35%', animationDelay: '0.1s', '--spark-drift': '-16px' } as React.CSSProperties}
                />
                <span
                  className="absolute w-2 h-2 rounded-full bg-orange-400 blur-[0.5px] animate-spark-rise"
                  style={{ top: '10%', left: '55%', animationDelay: '0.35s', '--spark-drift': '20px' } as React.CSSProperties}
                />
                <span
                  className="absolute w-1.5 h-1.5 rounded-full bg-red-400 blur-[0.5px] animate-spark-rise"
                  style={{ top: '25%', left: '46%', animationDelay: '0.65s', '--spark-drift': '-10px' } as React.CSSProperties}
                />
                <span
                  className="absolute w-1 h-1 rounded-full bg-amber-200 blur-[0.5px] animate-spark-rise"
                  style={{ top: '35%', left: '62%', animationDelay: '0.95s', '--spark-drift': '14px' } as React.CSSProperties}
                />
              </div>
            </div>

            {/* The Words "STAKE FIT" Popping Out From The Explosion (NO "PRO") */}
            <div
              className={`flex items-center overflow-hidden transition-all duration-800 ease-out ${
                stage === 'explode'
                  ? 'max-w-[850px] opacity-100 translate-x-0 ml-4 sm:ml-7'
                  : 'max-w-0 opacity-0 -translate-x-14 ml-0'
              }`}
              style={{
                transitionProperty: 'max-width, opacity, transform, margin-left',
              }}
            >
              <div className="flex items-center whitespace-nowrap text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight font-display select-none">
                {/* STAKE: Solid Bold White */}
                <span className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                  STAKE
                </span>

                {/* FIT: Shiny Vibrant Red with Glare Sheen */}
                <span className="relative inline-block ml-2 sm:ml-3">
                  <span className="animate-money-glare inline-block text-red-500 font-black drop-shadow-[0_0_35px_rgba(239,68,68,0.95)]">
                    FIT
                  </span>

                  {/* Glossy Sheen Glare Streak */}
                  <span className="absolute inset-0 overflow-hidden pointer-events-none">
                    <span className="absolute -inset-y-3 -inset-x-8 w-14 bg-gradient-to-r from-transparent via-white/80 to-transparent rotate-[25deg] blur-[1px] animate-glare-beam" />
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* "SCROLL TO ENTER" Prompt Appearing Underneath After Explosion */}
          <div
            className={`mt-10 sm:mt-14 transition-all duration-700 pointer-events-auto ${
              stage === 'explode'
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            <button
              onClick={handleScrollToEnter}
              className="group flex flex-col items-center gap-2 cursor-pointer focus:outline-none"
            >
              <span className="px-5 py-2 rounded-full bg-red-950/70 border border-red-700/80 text-red-400 text-xs sm:text-sm font-mono font-black uppercase tracking-widest shadow-lg shadow-red-950/70 group-hover:bg-red-900 group-hover:text-white transition-all">
                Scroll To Enter The Squad Pact ↓
              </span>
              <div className="w-8 h-8 rounded-full bg-zinc-900/90 border border-zinc-700 flex items-center justify-center text-zinc-300 group-hover:text-red-400 group-hover:border-red-500 transition-all animate-bounce">
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </ScrollDissolveReveal>
    </div>
  );
};
