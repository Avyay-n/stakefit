import React, { useState, useEffect, useRef } from 'react';
import lottie, { type AnimationItem } from 'lottie-web';
import { ChevronDown } from 'lucide-react';
import { playPop, playGong } from '../utils/audio';
import { ScrollDissolveReveal } from './ui/scroll-dissolve-reveal';
import { CartoonDumbbell } from './illustrations/CartoonAssets';
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
      {/* Full-Screen Glowing Bright Red Border Frame (For Intro Animation Only) */}
      <div
        className="fixed inset-2.5 sm:inset-4 lg:inset-5 rounded-2xl sm:rounded-3xl border-2 sm:border-[3px] border-red-500 pointer-events-none z-50 shadow-[0_0_30px_rgba(255,0,0,0.9),0_0_60px_rgba(239,68,68,0.5),inset_0_0_20px_rgba(255,0,0,0.25)] transition-opacity duration-300"
        style={{ opacity: overlayOpacity }}
      />

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
          {/* Center Brand Group: Fire + Centered STAKE FIT + Cartoon Dumbbell */}
          <div className="relative z-10 flex items-center justify-center px-4 max-w-[95vw]">
            {/* The Blazing Fire Unit (Pure Roaring Flame, Dumbbell Removed) */}
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

            {/* The Words "STAKE FIT" + Cartoon Dumbbell Beside It */}
            <div
              className={`flex items-center overflow-hidden transition-all duration-700 ease-out ${
                stage === 'explode'
                  ? 'max-w-[1400px] opacity-100 translate-x-0 ml-4 sm:ml-8 lg:ml-12'
                  : 'max-w-0 opacity-0 -translate-x-16 ml-0'
              }`}
              style={{
                transitionProperty: 'max-width, opacity, transform, margin-left',
              }}
            >
              {/* Stacked & Centered STAKE FIT with Balanced Tracking */}
              <div className="flex flex-col items-center select-none font-display leading-[0.82]">
                {/* STAKE: Solid Bold White */}
                <span className="text-white text-5xl sm:text-7xl md:text-8xl lg:text-[8.5rem] xl:text-[10.5rem] font-black uppercase tracking-tight">
                  STAKE
                </span>

                {/* FIT: Directly Under STAKE in Shiny Vibrant Red with Harmonized Letter-Spacing */}
                <span className="relative inline-block text-red-500 text-5xl sm:text-7xl md:text-8xl lg:text-[8.5rem] xl:text-[10.5rem] font-black uppercase tracking-[0.24em] pl-[0.24em]">
                  <span>FIT</span>

                  {/* Glossy Sheen Glare Streak */}
                  <span className="absolute inset-0 overflow-hidden pointer-events-none">
                    <span className="absolute -inset-y-6 -inset-x-12 w-24 bg-gradient-to-r from-transparent via-white/80 to-transparent rotate-[25deg] blur-[1px] animate-glare-beam" />
                  </span>
                </span>
              </div>

              {/* Chunky Cartoon Dumbbell Beside The STAKE FIT Name */}
              <div className="relative shrink-0 flex items-center justify-center ml-4 sm:ml-6 lg:ml-8">
                <CartoonDumbbell className="w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 lg:w-56 lg:h-56 -rotate-12 drop-shadow-[0_0_30px_rgba(239,68,68,0.7)]" />
              </div>
            </div>
          </div>

          {/* "SCROLL TO ENTER" Prompt Appearing Underneath (Bright Red Glowing Border) */}
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
              {/* Bigger & Bolder Pill Prompt with Bright Red Glowing Border */}
              <span className="px-8 py-3.5 sm:px-10 sm:py-4 md:px-12 md:py-4.5 rounded-full bg-black/85 border-2 border-red-500 text-red-400 text-sm sm:text-base md:text-lg font-mono font-black uppercase tracking-widest shadow-[0_0_30px_rgba(255,0,0,0.9),0_0_60px_rgba(239,68,68,0.55),inset_0_0_15px_rgba(255,0,0,0.3)] group-hover:border-red-400 group-hover:bg-red-950/60 group-hover:text-white group-hover:shadow-[0_0_40px_rgba(255,0,0,1),0_0_80px_rgba(239,68,68,0.8)] transition-all">
                Scroll To Enter The Squad Pact ↓
              </span>

              {/* Down Arrow Button with Bright Red Glowing Border & Lower Placement */}
              <div className="mt-4 sm:mt-5 md:mt-6 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-zinc-950 border-2 border-red-500 flex items-center justify-center text-red-400 group-hover:text-white group-hover:border-red-400 group-hover:shadow-[0_0_25px_rgba(255,0,0,1)] transition-all animate-bounce shadow-[0_0_20px_rgba(255,0,0,0.85)]">
                <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </button>
          </div>
        </div>
      </ScrollDissolveReveal>
    </div>
  );
};
