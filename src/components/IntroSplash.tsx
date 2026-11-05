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
  // Stage 1: 'burn' (0s - 1.8s) - Pure blazing fire lights up and loops intensely
  // Stage 2: 'explode' (1.8s+) - Fiery shockwave explosion, revealing massive STAKE FIT & scroll message
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
          {/* Center Brand Group: Much Bigger Fire + STAKE FIT Words Covering The Screen */}
          <div className="relative z-10 flex items-center justify-center px-4 max-w-[95vw]">
            {/* The Blazing Fire Unit (Substantially Enriched & Scaled Up) */}
            <div className="relative shrink-0 flex items-center justify-center w-36 h-36 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-88 lg:h-88 xl:w-[420px] xl:h-[420px] transition-transform duration-700">
              {/* Blazing Looping Flame Lottie (Continuous from start, no streak) */}
              <div
                ref={fireContainerRef}
                className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in fade-in zoom-in-75 duration-700"
              />

              {/* Shockwave Fire Explosion Burst Lottie (Scaled to match the bigger fire) */}
              {stage === 'explode' && (
                <div
                  ref={explodeContainerRef}
                  className="absolute w-[500px] h-[600px] sm:w-[750px] sm:h-[900px] lg:w-[1100px] lg:h-[1300px] pointer-events-none z-20 flex items-center justify-center -translate-y-4"
                />
              )}
            </div>

            {/* The Words "STAKE FIT" Popping Out From The Fire (Massive, Covering More Screen) */}
            <div
              className={`flex items-center overflow-hidden transition-all duration-700 ease-out ${
                stage === 'explode'
                  ? 'max-w-[1300px] opacity-100 translate-x-0 ml-4 sm:ml-8 lg:ml-12'
                  : 'max-w-0 opacity-0 -translate-x-16 ml-0'
              }`}
              style={{
                transitionProperty: 'max-width, opacity, transform, margin-left',
              }}
            >
              <div className="flex items-center whitespace-nowrap text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] xl:text-[13rem] font-black uppercase tracking-tight font-display select-none leading-none">
                {/* STAKE: Solid Bold White */}
                <span className="text-white">
                  STAKE
                </span>

                {/* FIT: Shiny Vibrant Red with Gloss Sheen Beam */}
                <span className="relative inline-block ml-3 sm:ml-5 lg:ml-7">
                  <span className="text-red-500 font-black">
                    FIT
                  </span>

                  {/* Glossy Sheen Glare Streak */}
                  <span className="absolute inset-0 overflow-hidden pointer-events-none">
                    <span className="absolute -inset-y-6 -inset-x-12 w-24 bg-gradient-to-r from-transparent via-white/80 to-transparent rotate-[25deg] blur-[1px] animate-glare-beam" />
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* "SCROLL TO ENTER" Prompt Appearing Underneath (Bigger & Down Arrow Separated) */}
          <div
            className={`mt-12 sm:mt-16 md:mt-20 transition-all duration-700 pointer-events-auto ${
              stage === 'explode'
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-6'
            }`}
          >
            <button
              onClick={handleScrollToEnter}
              className="group flex flex-col items-center cursor-pointer focus:outline-none"
            >
              {/* Bigger & Bolder Pill Prompt */}
              <span className="px-8 py-3.5 sm:px-10 sm:py-4 md:px-12 md:py-4.5 rounded-full bg-red-950/70 border border-red-700/80 text-red-400 text-sm sm:text-base md:text-lg font-mono font-black uppercase tracking-widest shadow-xl shadow-red-950/70 group-hover:bg-red-900 group-hover:text-white transition-all">
                Scroll To Enter The Squad Pact ↓
              </span>

              {/* Down Arrow Button Moved Further Down With Clean Space */}
              <div className="mt-4 sm:mt-5 md:mt-6 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-zinc-900/95 border border-zinc-700 flex items-center justify-center text-zinc-300 group-hover:text-red-400 group-hover:border-red-500 transition-all animate-bounce shadow-lg shadow-black/80">
                <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </button>
          </div>
        </div>
      </ScrollDissolveReveal>
    </div>
  );
};
