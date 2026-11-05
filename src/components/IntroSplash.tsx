import React, { useState, useEffect, useRef } from 'react';
import lottie, { type AnimationItem } from 'lottie-web';
import { ChevronDown } from 'lucide-react';
import { playPop, playGong } from '../utils/audio';
import { ScrollDissolveReveal } from './ui/scroll-dissolve-reveal';
import fireData from '../assets/animations/fire.json';
import explodeData from '../assets/animations/explode.json';

interface IntroSplashProps {
  onComplete: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete }) => {
  // Fire Animation Progression:
  // Stage 1: 'burn' (0s - 1.8s) - Pure blazing fire ignites and loops intensely
  // Stage 2: 'explode' (1.8s+) - Fiery shockwave explosion, revealing athletic STAKE FIT brandmark & scroll CTA
  const [stage, setStage] = useState<'burn' | 'explode'>('burn');
  const [hasExploded, setHasExploded] = useState(false);
  const [dissolveProgress, setDissolveProgress] = useState(0);

  const fireContainerRef = useRef<HTMLDivElement>(null);
  const explodeContainerRef = useRef<HTMLDivElement>(null);

  const animsRef = useRef<AnimationItem[]>([]);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  // Initialize and choreograph the fire & explosion animations
  useEffect(() => {
    // Ignition sound on mount
    try {
      playPop();
    } catch {
      // Audio safeguard
    }

    // Load the Blazing Flame Lottie (Continuous fluid burning from the start)
    if (fireContainerRef.current) {
      const fireAnim = lottie.loadAnimation({
        container: fireContainerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: fireData,
      });
      fireAnim.setSpeed(1.1);
      animsRef.current.push(fireAnim);
    }

    // Transition to Stage 2: Shockwave Explosion & Word Reveal at 1.8s
    const timer = setTimeout(() => {
      setStage('explode');
      setHasExploded(true);
      try {
        playGong();
      } catch {
        // Audio safeguard
      }

      // Play Explosion Shockwave Lottie
      if (explodeContainerRef.current) {
        const explodeAnim = lottie.loadAnimation({
          container: explodeContainerRef.current,
          renderer: 'svg',
          loop: false,
          autoplay: true,
          animationData: explodeData,
        });
        explodeAnim.setSpeed(1.25);
        animsRef.current.push(explodeAnim);
      }
    }, 1800);

    // Escape or Enter key shortcut to enter home page
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      animsRef.current.forEach((anim) => anim.destroy());
      animsRef.current = [];
    };
  }, [onComplete]);

  // Lock body scroll and smooth in-place dissolve loop driven by scroll / wheel / swipe
  useEffect(() => {
    // Prevent background page from scrolling under the intro
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    let touchStartY = 0;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
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
      e.preventDefault();
      if (!hasExploded) return;
      const delta = touchStartY - e.touches[0].clientY;
      touchStartY = e.touches[0].clientY;
      if (delta > 0) {
        targetProgressRef.current = Math.min(1.0, targetProgressRef.current + delta * 0.0035);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Smooth physics RAF loop
    const updateProgress = () => {
      currentProgressRef.current += (targetProgressRef.current - currentProgressRef.current) * 0.14;
      setDissolveProgress(currentProgressRef.current);

      // Once dissolved > 96%, finish and transition into home page
      if (currentProgressRef.current >= 0.96) {
        onComplete();
        return;
      }

      animFrameRef.current = requestAnimationFrame(updateProgress);
    };

    animFrameRef.current = requestAnimationFrame(updateProgress);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [hasExploded, onComplete]);

  // Click handler for "Scroll To Enter" button
  const handleScrollToEnter = () => {
    targetProgressRef.current = 1.0;
  };

  // Overlay fire & text fade out smoothly as dissolve starts
  const overlayOpacity = Math.max(0, 1 - dissolveProgress * 2.8);

  return (
    <div
      className="fixed inset-0 z-[100] w-full h-full overflow-hidden select-none"
      style={{ background: 'linear-gradient(to bottom, #dc2626 50%, #ffffff 50%)' }}
    >
      {/* Burning Fire Scroll Dissolve Reveal Component (Half Red, Half White Split Canvas) */}
      <ScrollDissolveReveal
        imageFront="/intro-front.png"
        imageBack="/home-preview.jpg"
        progress={dissolveProgress}
        className="absolute inset-0 w-full h-full"
        style={{ background: 'linear-gradient(to bottom, #dc2626 50%, #ffffff 50%)' }}
      >
        {/* Full-Screen Overlay on top of the Shader Canvas */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-200 ${
            stage === 'explode' ? 'animate-burst-shake' : ''
          }`}
          style={{ opacity: overlayOpacity }}
        >
          {/* Center Brand Group: Fire + Cohesive STAKE FIT Typographic Lockup */}
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-10 lg:gap-14 px-4 max-w-[95vw]">
            {/* 1. The Blazing Fire Unit */}
            <div className="relative shrink-0 flex items-center justify-center w-36 h-36 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-92 lg:h-92 xl:w-[420px] xl:h-[420px]">
              {/* Subtle volcanic ground heat reflection (Roots fire to stage, no muddy aura) */}
              <div className="absolute -bottom-3 w-3/4 h-5 bg-gradient-to-r from-transparent via-orange-600/35 to-transparent blur-md rounded-full pointer-events-none" />

              {/* Blazing Looping Flame Lottie (Continuous fluid burning) */}
              <div
                ref={fireContainerRef}
                className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in fade-in zoom-in-90 duration-700"
              />

              {/* Rising Subtle Ember Sparks */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <span
                  className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 blur-[0.5px] animate-spark-rise opacity-75"
                  style={{ top: '25%', left: '42%', animationDelay: '0.1s', '--spark-drift': '-14px' } as React.CSSProperties}
                />
                <span
                  className="absolute w-2 h-2 rounded-full bg-orange-500 blur-[0.5px] animate-spark-rise opacity-75"
                  style={{ top: '20%', left: '58%', animationDelay: '0.45s', '--spark-drift': '18px' } as React.CSSProperties}
                />
                <span
                  className="absolute w-1 h-1 rounded-full bg-red-400 blur-[0.5px] animate-spark-rise opacity-70"
                  style={{ top: '35%', left: '50%', animationDelay: '0.8s', '--spark-drift': '-8px' } as React.CSSProperties}
                />
              </div>

              {/* Shockwave Fire Explosion Burst Lottie */}
              {stage === 'explode' && (
                <div
                  ref={explodeContainerRef}
                  className="absolute w-[500px] h-[600px] sm:w-[750px] sm:h-[900px] lg:w-[1100px] lg:h-[1300px] pointer-events-none z-20 flex items-center justify-center -translate-y-4"
                />
              )}
            </div>

            {/* 2. Flat Sharp Boxed STAKE FIT Brandmark (Sticking, Sharp 90-deg Corners, Bangers Fire Font) */}
            <div
              className={`flex flex-col items-start gap-0 select-none transition-all duration-700 ${
                stage === 'explode'
                  ? 'opacity-100 translate-x-0 scale-100'
                  : 'opacity-0 -translate-x-12 scale-95 pointer-events-none'
              }`}
              style={{
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                fontFamily: "'Bangers', 'Barlow Condensed', cursive, sans-serif",
              }}
            >
              {/* STAKE: Solid Red Filled Box (Sharp 90-degree corners, no glow, sized to word, crisp black border & depth) */}
              <div className="inline-flex items-center justify-center px-5 py-1.5 sm:px-7 sm:py-2.5 md:px-9 md:py-3 rounded-none bg-red-600 border-2 sm:border-[3px] border-black shadow-[0_10px_25px_rgba(0,0,0,0.35)]">
                <span className="text-white text-6xl sm:text-7xl md:text-8xl lg:text-[8rem] xl:text-[9.5rem] uppercase tracking-wide leading-none">
                  STAKE
                </span>
              </div>

              {/* FIT: Solid White Filled Box (Sharp 90-degree corners, sticking directly to STAKE, no glow, sized to word, crisp black border) */}
              <div className="inline-flex items-center justify-center px-5 py-1.5 sm:px-7 sm:py-2.5 md:px-9 md:py-3 rounded-none bg-white border-2 sm:border-[3px] border-black border-t-0 -mt-[2px] sm:-mt-[3px] shadow-[0_10px_25px_rgba(0,0,0,0.2)]">
                <span className="text-red-600 text-6xl sm:text-7xl md:text-8xl lg:text-[8rem] xl:text-[9.5rem] uppercase tracking-wide leading-none">
                  FIT
                </span>
              </div>
            </div>
          </div>

          {/* 3. Sleek Interactive Scroll Prompt (UI Pro High-Tech Pill, Anchored at Bottom) */}
          <div
            className={`absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-30 transition-all duration-700 pointer-events-auto ${
              stage === 'explode'
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-6 pointer-events-none'
            }`}
            style={{
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <button
              onClick={handleScrollToEnter}
              className="group flex flex-col items-center gap-2 sm:gap-3 cursor-pointer focus:outline-none"
            >
              {/* Ultra-Sleek Pill Button with Glowing Red Neon Border */}
              <div className="flex items-center gap-3 px-7 py-3 sm:px-9 sm:py-3.5 rounded-full bg-black border-2 border-red-600 text-red-400 text-xs sm:text-sm font-mono font-black uppercase tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.6),0_10px_25px_rgba(0,0,0,0.35)] group-hover:border-red-400 group-hover:bg-red-950/90 group-hover:text-white group-hover:shadow-[0_0_30px_rgba(239,68,68,0.85)] group-hover:scale-105 transition-all duration-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span>Scroll To Enter Pact</span>
                <ChevronDown className="w-4 h-4 text-red-400 group-hover:text-white group-hover:translate-y-0.5 transition-all duration-200" />
              </div>

              {/* Minimalist Animated Scroll Mouse Indicator */}
              <div className="w-5 h-8 rounded-full border-2 border-zinc-900 group-hover:border-red-600 flex items-start justify-center p-1 transition-colors duration-300">
                <div className="w-1 h-2 rounded-full bg-red-600 animate-bounce" />
              </div>
            </button>
          </div>
        </div>
      </ScrollDissolveReveal>
    </div>
  );
};
