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
        @keyframes slowLeftToRightReveal {
          0% {
            clip-path: inset(0 100% 0 0);
            opacity: 0.2;
          }
          12% {
            opacity: 1;
          }
          100% {
            clip-path: inset(0 0% 0 0);
            opacity: 1;
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

          {/* HUGE TEXT: "STAKE" IN SOLID RED (UI Pro Max Bold Sports Display Font, Zero Glare) */}
          <div
            className="relative flex items-center justify-center px-4 w-full"
            style={{
              animation: 'slowLeftToRightReveal 1.2s cubic-bezier(0.3, 0.0, 0.2, 1) 0.05s both',
            }}
          >
            <h1
              className="text-red-600 font-black uppercase leading-none select-none text-center whitespace-nowrap"
              style={{
                fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif",
                fontSize: 'clamp(8rem, min(36vw, 58vh), 46rem)',
                letterSpacing: '0.03em',
              }}
            >
              STAKE
            </h1>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BOTTOM HALF SCREEN: SOLID RED BACKGROUND */}
        {/* ======================================================== */}
        <div className="relative w-full h-1/2 bg-red-600 flex items-center justify-center overflow-hidden">
          {/* Subtle athletic texture */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* HUGE TEXT: "FIT" IN SOLID BLACK (UI Pro Max Bold Sports Display Font, Zero Glare) */}
          <div
            className="relative flex items-center justify-center px-4 w-full"
            style={{
              animation: 'slowLeftToRightReveal 1.2s cubic-bezier(0.3, 0.0, 0.2, 1) 0.12s both',
            }}
          >
            <h1
              className="text-black font-black uppercase leading-none select-none text-center whitespace-nowrap"
              style={{
                fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif",
                fontSize: 'clamp(8rem, min(36vw, 58vh), 46rem)',
                letterSpacing: '0.03em',
              }}
            >
              FIT
            </h1>
          </div>
        </div>
      </div>

      {/* Floating Scroll Prompt (Positioned closely across the 50% Horizon Meeting Line on the right side) */}
      <div
        className={`absolute top-1/2 right-6 sm:right-10 lg:right-14 z-30 transition-all duration-300 pointer-events-auto flex flex-col items-center ${
          isZooming ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'
        }`}
        style={{ transform: 'translateY(-54px)' }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerZoom();
          }}
          className="group flex flex-col items-center cursor-pointer focus:outline-none"
        >
          {/* IN BLACK HALF: Pill lifted cleanly above the 50% seam line with breathing room */}
          <div className="mb-5 flex items-center gap-3 px-5 py-2 sm:px-6 sm:py-2.5 rounded-full bg-white border-2 border-white text-black text-xs sm:text-sm font-mono font-black uppercase tracking-widest shadow-[0_4px_25px_rgba(255,255,255,0.25)] group-hover:scale-105 group-hover:bg-zinc-100 transition-all duration-300 whitespace-nowrap">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
            </span>
            <span>Scroll To Enter</span>
            <ChevronDown className="w-4 h-4 text-red-600 group-hover:translate-y-0.5 transition-transform duration-200" />
          </div>

          {/* IN RED HALF: Mouse icon sitting closely below the 50% seam line */}
          <div className="w-[26px] h-10 rounded-full border-[2.5px] border-black flex items-start justify-center p-1.5 shadow-sm">
            <div className="w-1.5 h-2.5 rounded-full bg-black animate-bounce" />
          </div>
        </button>
      </div>
    </div>
  );
};
