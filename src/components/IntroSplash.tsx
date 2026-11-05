import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { playPop, playGong } from '../utils/audio';

interface IntroSplashProps {
  onComplete: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete }) => {
  const [zoomProgress, setZoomProgress] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const isZoomingRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);

  // Play introductory pop sound on mount
  useEffect(() => {
    try {
      playPop();
    } catch {
      // Audio safeguard
    }
  }, []);

  // Trigger smooth cinematic zoom into the center
  const triggerZoom = () => {
    if (isZoomingRef.current) return;
    isZoomingRef.current = true;
    setIsZooming(true);

    try {
      playGong();
    } catch {
      // Audio safeguard
    }

    const startTime = performance.now();
    const duration = 850; // Smooth 850ms cinematic acceleration into the center

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / duration);

      // Visceral acceleration curve: starts smooth, accelerates rapidly into center
      const eased = Math.pow(progress, 2.6);
      setZoomProgress(eased);

      if (progress < 1.0) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        onComplete();
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  };

  // Lock body scroll and listen for user interactions (wheel, touch, keys, clicks)
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    let touchStartY = 0;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Any scroll gesture immediately launches the zoom into center
      if (Math.abs(e.deltaY) > 5) {
        triggerZoom();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const delta = Math.abs(touchStartY - e.touches[0].clientY);
      if (delta > 8) {
        triggerZoom();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ([' ', 'Enter', 'ArrowDown', 'ArrowUp', 'Escape', 'PageDown'].includes(e.key)) {
        e.preventDefault();
        triggerZoom();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [onComplete]);

  // Compute zoom scale & opacity:
  // Scale expands exponentially from 1.0 to 18.0 directly into the center horizon
  const scale = 1 + zoomProgress * 17;
  // Opacity stays 1.0 for the first 35% of the zoom, then dissolves as camera passes through
  const opacity = Math.max(0, 1 - Math.max(0, (zoomProgress - 0.35) / 0.65));

  return (
    <div
      onClick={triggerZoom}
      className="fixed inset-0 z-[100] w-full h-full overflow-hidden select-none cursor-pointer bg-black"
    >
      <style>{`
        @keyframes leftToRightReveal {
          0% {
            clip-path: inset(0 100% 0 0);
            opacity: 0;
            transform: translateX(-40px);
            filter: blur(8px);
          }
          30% {
            opacity: 0.9;
          }
          100% {
            clip-path: inset(0 0% 0 0);
            opacity: 1;
            transform: translateX(0);
            filter: blur(0px);
          }
        }

        @keyframes shineSweep {
          0% {
            transform: translateX(-150%) skewX(-20deg);
          }
          100% {
            transform: translateX(250%) skewX(-20deg);
          }
        }
      `}</style>

      {/* Main Scaling Split Container (Transforms from the exact center seam) */}
      <div
        className="relative w-full h-full flex flex-col will-change-transform"
        style={{
          transform: `scale(${scale})`,
          opacity: opacity,
          transformOrigin: '50% 50%',
        }}
      >
        {/* ======================================================== */}
        {/* TOP HALF SCREEN: SOLID BLACK BACKGROUND */}
        {/* ======================================================== */}
        <div className="relative w-full h-1/2 bg-black flex items-center justify-center overflow-hidden">
          {/* Subtle noise grain for athletic realism */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* HUGE TEXT: "STAKE" IN RED COLOR */}
          <div className="relative flex items-center justify-center px-4 w-full">
            <h1
              className="text-red-600 font-black tracking-tight uppercase leading-none select-none text-center whitespace-nowrap"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 'clamp(4.5rem, min(22vw, 36vh), 25rem)',
                letterSpacing: '-0.02em',
                animation: 'leftToRightReveal 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both',
              }}
            >
              STAKE
            </h1>

            {/* Left to Right Glare Flare Sheen */}
            <div
              className="absolute inset-0 pointer-events-none overflow-hidden"
              style={{
                animation: 'leftToRightReveal 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both',
              }}
            >
              <div
                className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-red-400/35 to-transparent pointer-events-none"
                style={{
                  animation: 'shineSweep 1.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both',
                }}
              />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BOTTOM HALF SCREEN: SOLID RED BACKGROUND */}
        {/* ======================================================== */}
        <div className="relative w-full h-1/2 bg-red-600 flex items-center justify-center overflow-hidden">
          {/* Subtle athletic texture */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* HUGE TEXT: "FIT" IN BLACK COLOR */}
          <div className="relative flex items-center justify-center px-4 w-full">
            <h1
              className="text-black font-black tracking-tight uppercase leading-none select-none text-center whitespace-nowrap"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 'clamp(4.5rem, min(22vw, 36vh), 25rem)',
                letterSpacing: '-0.02em',
                animation: 'leftToRightReveal 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both',
              }}
            >
              FIT
            </h1>

            {/* Left to Right Glare Flare Sheen */}
            <div
              className="absolute inset-0 pointer-events-none overflow-hidden"
              style={{
                animation: 'leftToRightReveal 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both',
              }}
            >
              <div
                className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-black/30 to-transparent pointer-events-none"
                style={{
                  animation: 'shineSweep 1.8s cubic-bezier(0.16, 1, 0.3, 1) 0.65s both',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Scroll Prompt (Positioned on the right side, avoids center text, fades out when zooming) */}
      <div
        className={`absolute bottom-6 sm:bottom-10 right-6 sm:right-10 lg:right-14 z-30 transition-all duration-300 pointer-events-auto ${
          isZooming ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerZoom();
          }}
          className="group flex flex-col items-center gap-2 sm:gap-3 cursor-pointer focus:outline-none"
        >
          {/* Sleek Black Pill Button with Red Accent */}
          <div className="flex items-center gap-3 px-5 py-2.5 sm:px-7 sm:py-3 rounded-full bg-black border-2 border-black text-white text-xs sm:text-sm font-mono font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:scale-105 group-hover:bg-zinc-950 transition-all duration-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span>Scroll To Enter</span>
            <ChevronDown className="w-4 h-4 text-red-500 group-hover:translate-y-0.5 transition-transform duration-200" />
          </div>

          {/* Minimalist Animated Scroll Mouse Indicator */}
          <div className="w-5 h-8 rounded-full border-2 border-black flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-black animate-bounce" />
          </div>
        </button>
      </div>
    </div>
  );
};
