import React, { useState, useEffect, useRef } from 'react';
import lottie, { type AnimationItem } from 'lottie-web';
import { ChevronDown } from 'lucide-react';
import { playPop, playGong } from '../utils/audio';
import { ScrollDissolveReveal } from './ui/scroll-dissolve-reveal';
import streakData from '../assets/animations/streak.json';
import fireData from '../assets/animations/fire.json';
import explodeData from '../assets/animations/explode.json';

interface IntroSplashProps {
  onComplete: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete }) => {
  // 3-Stage Fire Animation Progression:
  // Stage 1: 'streak' (0s - 1.3s) - Flame streak shoots in and ignites the fire
  // Stage 2: 'burn'   (1.3s - 2.2s) - Fire is lit! Fluid blazing flame loops intensely
  // Stage 3: 'explode' (2.2s+) - Fiery shockwave explosion, revealing STAKE FIT & scroll message
  const [stage, setStage] = useState<'streak' | 'burn' | 'explode'>('streak');
  const [hasExploded, setHasExploded] = useState(false);
  const [dissolveProgress, setDissolveProgress] = useState(0);

  const streakContainerRef = useRef<HTMLDivElement>(null);
  const fireContainerRef = useRef<HTMLDivElement>(null);
  const explodeContainerRef = useRef<HTMLDivElement>(null);

  const animsRef = useRef<AnimationItem[]>([]);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  // Initialize and choreograph the 3-stage Lottie animations
  useEffect(() => {
    // Stage 1: Flame Streak Ignition
    try {
      playPop();
    } catch {
      // Audio safeguard
    }

    // 1. Load Flame Streak Lottie (Ignition)
    if (streakContainerRef.current) {
      const streakAnim = lottie.loadAnimation({
        container: streakContainerRef.current,
        renderer: 'svg',
        loop: false,
        autoplay: true,
        animationData: streakData,
      });
      streakAnim.setSpeed(1.6);
      animsRef.current.push(streakAnim);
    }

    // 2. Load Blazing Flame Lottie (Continuous Fluid Burning)
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

    // Transition to Stage 2: Fire Lit & Burning at 1.3s
    const timer1 = setTimeout(() => {
      setStage('burn');
    }, 1300);

    // Transition to Stage 3: Fiery Shockwave Explosion & Word Reveal at 2.2s
    const timer2 = setTimeout(() => {
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
        explodeAnim.setSpeed(1.3);
        animsRef.current.push(explodeAnim);
      }
    }, 2200);

    // Escape or Enter key shortcut to enter home page
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('keydown', handleKeyDown);
      animsRef.current.forEach((anim) => anim.destroy());
      animsRef.current = [];
    };
  }, [onComplete]);

  // Smooth in-place dissolve loop driven by scroll / wheel / swipe
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

      // Once dissolved > 96%, finish and transition into home page
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

  // Click handler for "Scroll To Enter" button
  const handleScrollToEnter = () => {
    targetProgressRef.current = 1.0;
  };

  // Overlay fire & text fade out smoothly as dissolve starts
  const overlayOpacity = Math.max(0, 1 - dissolveProgress * 2.8);

  return (
    <div className="fixed inset-0 z-[100] w-full h-full bg-black overflow-hidden select-none">
      {/* Burning Fire Scroll Dissolve Reveal Component (In Place, Pure Black Canvas) */}
      <ScrollDissolveReveal
        imageFront="/intro-front.png"
        imageBack="/home-preview.jpg"
        progress={dissolveProgress}
        className="absolute inset-0 w-full h-full bg-black"
      >
        {/* Full-Screen Overlay on top of the Shader Canvas */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-200 ${
            stage === 'explode' ? 'animate-burst-shake' : ''
          }`}
          style={{ opacity: overlayOpacity }}
        >
          {/* Center Brand Group: Fire + Words "STAKE FIT" Popping Out To The Right */}
          <div className="relative z-10 flex items-center justify-center px-4">
            {/* The Unified Fire Unit (Streak -> Burning Flame -> Fiery Shockwave) */}
            <div className="relative shrink-0 flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40">
              {/* Stage 1: Flame Streak Ignition Lottie */}
              <div
                ref={streakContainerRef}
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${
                  stage === 'streak' ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {/* Stage 2 & 3: Blazing Looping Flame Lottie */}
              <div
                ref={fireContainerRef}
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 pointer-events-none ${
                  stage !== 'streak' ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {/* Stage 3: Shockwave Fire Explosion Burst Lottie */}
              {stage === 'explode' && (
                <div
                  ref={explodeContainerRef}
                  className="absolute w-[360px] h-[430px] sm:w-[500px] sm:h-[600px] pointer-events-none z-20 flex items-center justify-center -translate-y-3"
                />
              )}
            </div>

            {/* The Words "STAKE FIT" Popping Out From The Fire To The Right (NO "PRO") */}
            <div
              className={`flex items-center overflow-hidden transition-all duration-700 ease-out ${
                stage === 'explode'
                  ? 'max-w-[850px] opacity-100 translate-x-0 ml-3 sm:ml-6'
                  : 'max-w-0 opacity-0 -translate-x-12 ml-0'
              }`}
              style={{
                transitionProperty: 'max-width, opacity, transform, margin-left',
              }}
            >
              <div className="flex items-center whitespace-nowrap text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight font-display select-none">
                {/* STAKE: Solid Bold White */}
                <span className="text-white">
                  STAKE
                </span>

                {/* FIT: Shiny Vibrant Red with Gloss Sheen Beam */}
                <span className="relative inline-block ml-2 sm:ml-3">
                  <span className="text-red-500 font-black">
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
