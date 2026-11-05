import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { playPop, playGong } from '../utils/audio';
import { ScrollDissolveReveal } from './ui/scroll-dissolve-reveal';

interface IntroSplashProps {
  onComplete: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete }) => {
  // Phase 1: 'fire-only' for the first 2 seconds
  // Phase 2: 'words-pop' after 2 seconds
  const [phase, setPhase] = useState<'fire-only' | 'words-pop'>('fire-only');
  const [dissolveProgress, setDissolveProgress] = useState(0);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Initial ignition sound
    try {
      playPop();
    } catch {
      // Audio safeguard
    }

    // In the first 2 seconds, only the fire is lit.
    // At 2.0s, the words pop out from the fire to the right!
    const timer = setTimeout(() => {
      setPhase('words-pop');
      try {
        playGong();
      } catch {
        // Audio safeguard
      }
    }, 2000);

    // Escape key skips directly into home page
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  // Smooth in-place dissolve loop driven by scroll/wheel
  useEffect(() => {
    let touchStartY = 0;

    const handleWheel = (e: WheelEvent) => {
      // Accumulate scroll in place without page moving up
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
  }, [onComplete]);

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
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-200"
          style={{ opacity: overlayOpacity }}
        >
          {/* Skip Button */}
          <button
            onClick={onComplete}
            className="absolute top-6 right-6 pointer-events-auto px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold text-zinc-500 hover:text-white bg-black/60 hover:bg-zinc-900 border border-zinc-800 transition-all z-30"
          >
            Skip ✕
          </button>

          {/* Fire Light Ambient Glow */}
          <div
            className="absolute w-[360px] h-[360px] sm:w-[520px] sm:h-[520px] rounded-full pointer-events-none blur-3xl transition-all duration-1000"
            style={{
              background:
                'radial-gradient(circle, rgba(239,68,68,0.38) 0%, rgba(249,115,22,0.22) 38%, rgba(0,0,0,0) 70%)',
            }}
          />

          {/* Center Brand Group: Free-Standing Fire (Image 2) + Words Popping Out */}
          <div className="relative z-10 flex items-center justify-center px-4">
            {/* Free-Standing Blazing Fire (Matching Image 2: No Box, Curved Flame Tongues) */}
            <div className="relative flex items-center justify-center">
              <div className="relative animate-flame-flicker">
                {/* Athletic Multi-Tier Flame SVG (Exact 3-Color Fire from Image 2) */}
                <svg
                  viewBox="0 0 120 140"
                  className="w-24 h-32 sm:w-32 sm:h-44 lg:w-36 lg:h-48 drop-shadow-[0_0_30px_rgba(239,68,68,0.95)] drop-shadow-[0_0_60px_rgba(249,115,22,0.7)]"
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

                {/* Rising Sparks / Embers floating upward */}
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
            </div>

            {/* The Words "STAKE FIT" Popping Out From The Fire To The Right (NO "PRO") */}
            <div
              className={`flex items-center overflow-hidden transition-all duration-800 ease-out ${
                phase === 'words-pop'
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

          {/* "SCROLL TO ENTER" Prompt Appearing Underneath */}
          <div
            className={`mt-10 sm:mt-14 transition-all duration-700 pointer-events-auto ${
              phase === 'words-pop'
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
