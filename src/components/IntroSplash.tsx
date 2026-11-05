import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { playPop, playGong } from '../utils/audio';
import { ScrollDissolveReveal } from './ui/scroll-dissolve-reveal';

interface IntroSplashProps {
  onComplete: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete }) => {
  // Phase 1: 'fire-only' for first 2 seconds
  // Phase 2: 'words-pop' after 2 seconds
  const [phase, setPhase] = useState<'fire-only' | 'words-pop'>('fire-only');
  const [userScrolled, setUserScrolled] = useState(false);

  useEffect(() => {
    // Stage 1: Audio cue on fire ignition
    try {
      playPop();
    } catch {
      // Audio safeguard
    }

    // Stage 2: In the first 2 seconds only fire is lit.
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

  // Handle scroll trigger to complete intro dissolve
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setUserScrolled(true);
      }
      // When scrolled near end of dissolve container (e.g. > 1100px)
      if (window.scrollY > 950) {
        onComplete();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [onComplete]);

  const handleScrollToEnter = () => {
    window.scrollTo({
      top: 1050,
      behavior: 'smooth',
    });
    setTimeout(() => {
      onComplete();
    }, 850);
  };

  return (
    <div className="relative w-full bg-black">
      {/* Three.js / Shader Scroll Dissolve Reveal Component */}
      <ScrollDissolveReveal
        imageFront="/intro-front.png"
        imageBack="/home-preview.jpg"
        containerClassName="relative h-[240vh] w-full"
      >
        {/* Full-Screen Sticky Overlay on top of the Shader Canvas */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none transition-opacity duration-700 ${
            userScrolled ? 'opacity-20' : 'opacity-100'
          }`}
        >
          {/* Skip Button */}
          <button
            onClick={onComplete}
            className="absolute top-6 right-6 pointer-events-auto px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold text-zinc-500 hover:text-white bg-black/50 hover:bg-zinc-900 border border-zinc-800 transition-all z-30"
          >
            Skip ✕
          </button>

          {/* Fire Light Ambient Radial Glow */}
          <div
            className="absolute w-[340px] h-[340px] sm:w-[500px] sm:h-[500px] rounded-full pointer-events-none blur-3xl transition-all duration-1000"
            style={{
              background:
                'radial-gradient(circle, rgba(239,68,68,0.35) 0%, rgba(249,115,22,0.2) 35%, rgba(0,0,0,0) 70%)',
            }}
          />

          {/* Center Brand Group: Free-Standing Fire + Words Popping Out */}
          <div className="relative z-10 flex items-center justify-center px-4">
            {/* Free-Standing Blazing Fire (NO BOX, NO CONTAINER, PURE ORGANIC FLAME) */}
            <div className="relative flex items-center justify-center transition-all duration-700">
              {/* Organic Flame SVG Tongues */}
              <div className="relative animate-flame-flicker">
                <svg
                  viewBox="0 0 100 130"
                  className="w-20 h-28 sm:w-28 sm:h-36 lg:w-32 lg:h-44 drop-shadow-[0_0_35px_rgba(239,68,68,0.95)] drop-shadow-[0_0_65px_rgba(249,115,22,0.7)]"
                >
                  <defs>
                    <linearGradient id="flameOuter" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#7f1d1d" />
                      <stop offset="35%" stopColor="#dc2626" />
                      <stop offset="70%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>
                    <linearGradient id="flameInner" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#ea580c" />
                      <stop offset="50%" stopColor="#fde047" />
                      <stop offset="100%" stopColor="#ffffff" />
                    </linearGradient>
                  </defs>

                  {/* Outer Blazing Tongue */}
                  <path
                    d="M50 5 C62 30 85 55 85 85 C85 110 68 125 50 125 C32 125 15 110 15 85 C15 55 38 30 50 5 Z"
                    fill="url(#flameOuter)"
                  />
                  {/* Secondary Flicker Flame Tongue */}
                  <path
                    d="M50 25 C60 48 76 68 74 92 C72 112 60 122 50 122 C40 122 28 112 26 92 C24 68 40 48 50 25 Z"
                    fill="url(#flameOuter)"
                    opacity="0.9"
                  />
                  {/* Glowing Core Flame Tongue */}
                  <path
                    d="M50 50 C57 68 66 82 64 98 C62 112 56 118 50 118 C44 118 38 112 36 98 C34 82 43 68 50 50 Z"
                    fill="url(#flameInner)"
                  />
                  {/* Ultra-Bright Center Spark Core */}
                  <ellipse cx="50" cy="100" rx="8" ry="14" fill="#ffffff" opacity="0.95" />
                </svg>

                {/* Rising Fiery Sparks & Embers Floating Upward */}
                <div className="absolute inset-0 pointer-events-none">
                  <span
                    className="absolute w-1.5 h-1.5 rounded-full bg-amber-300 blur-[0.5px] animate-spark-rise"
                    style={{ top: '15%', left: '35%', animationDelay: '0.1s', '--spark-drift': '-18px' } as React.CSSProperties}
                  />
                  <span
                    className="absolute w-2 h-2 rounded-full bg-orange-400 blur-[0.5px] animate-spark-rise"
                    style={{ top: '10%', left: '55%', animationDelay: '0.4s', '--spark-drift': '22px' } as React.CSSProperties}
                  />
                  <span
                    className="absolute w-1.5 h-1.5 rounded-full bg-red-400 blur-[0.5px] animate-spark-rise"
                    style={{ top: '25%', left: '48%', animationDelay: '0.7s', '--spark-drift': '-10px' } as React.CSSProperties}
                  />
                  <span
                    className="absolute w-1 h-1 rounded-full bg-amber-200 blur-[0.5px] animate-spark-rise"
                    style={{ top: '35%', left: '60%', animationDelay: '1.0s', '--spark-drift': '14px' } as React.CSSProperties}
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
