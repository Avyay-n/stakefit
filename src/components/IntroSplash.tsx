import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { playPop, playGong } from '../utils/audio';

interface IntroSplashProps {
  onComplete: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'dark' | 'ignite' | 'reveal' | 'fadeout'>('dark');

  useEffect(() => {
    // Stage 1: Ignite the fire at 200ms
    const timer1 = setTimeout(() => {
      setPhase('ignite');
      try {
        playPop();
      } catch {
        // audio safeguard
      }
    }, 200);

    // Stage 2: Reveal the name STAKEFIT emerging to the right from the fire at 700ms
    const timer2 = setTimeout(() => {
      setPhase('reveal');
      try {
        playGong();
      } catch {
        // audio safeguard
      }
    }, 700);

    // Stage 3: Begin smooth fade out at 2300ms
    const timer3 = setTimeout(() => {
      setPhase('fadeout');
    }, 2300);

    // Stage 4: Unmount completely at 2850ms
    const timer4 = setTimeout(() => {
      onComplete();
    }, 2850);

    // Escape key skips
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#000000] flex items-center justify-center overflow-hidden transition-opacity duration-600 select-none ${
        phase === 'fadeout' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="StakeFit Splash Intro"
    >
      {/* Background radial heat aura when fire is lit */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
          phase === 'ignite' || phase === 'reveal'
            ? 'opacity-100'
            : 'opacity-0'
        }`}
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.22) 0%, rgba(249, 115, 22, 0.08) 35%, rgba(0, 0, 0, 0) 70%)',
        }}
      />

      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold text-zinc-500 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all z-20"
      >
        Skip ✕
      </button>

      {/* Main Fire + Name Animation Container */}
      <div className="relative flex items-center justify-center">
        {/* The Fire Element */}
        <div
          className={`relative z-10 flex items-center justify-center transition-all duration-700 ease-out ${
            phase === 'dark'
              ? 'scale-0 opacity-0'
              : phase === 'ignite'
              ? 'scale-125 opacity-100'
              : 'scale-100 opacity-100'
          }`}
        >
          {/* Pulsing Outer Fire Light Glow */}
          <div
            className={`absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-t from-red-600/70 via-orange-500/50 to-transparent blur-2xl transition-all duration-500 ${
              phase !== 'dark' ? 'scale-150 opacity-100' : 'scale-50 opacity-0'
            }`}
          />

          {/* Realistic SVG Fiery Flame */}
          <div className="relative animate-flame-flicker">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-tr from-red-600 via-orange-500 to-amber-300 p-0.5 shadow-[0_0_50px_rgba(239,68,68,0.9),0_0_90px_rgba(249,115,22,0.6)] flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-[#050505] flex items-center justify-center overflow-hidden relative">
                {/* Internal flame core glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-red-600/40 via-orange-500/30 to-transparent animate-pulse" />
                <Flame className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-white fill-white drop-shadow-[0_0_16px_rgba(255,255,255,0.95)]" />
              </div>
            </div>

            {/* Rising Sparks / Embers */}
            {phase !== 'dark' && (
              <div className="absolute inset-0 pointer-events-none">
                <span
                  className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 blur-[0.5px] animate-spark-rise"
                  style={{ top: '20%', left: '30%', animationDelay: '0.1s', '--spark-drift': '-15px' } as React.CSSProperties}
                />
                <span
                  className="absolute w-1 h-1 rounded-full bg-orange-400 blur-[0.5px] animate-spark-rise"
                  style={{ top: '10%', left: '60%', animationDelay: '0.35s', '--spark-drift': '20px' } as React.CSSProperties}
                />
                <span
                  className="absolute w-2 h-2 rounded-full bg-red-400 blur-[0.5px] animate-spark-rise"
                  style={{ top: '30%', left: '50%', animationDelay: '0.5s', '--spark-drift': '-8px' } as React.CSSProperties}
                />
              </div>
            )}
          </div>
        </div>

        {/* The Name "STAKEFIT" Emerging From The Fire To The Right */}
        <div
          className={`flex items-center overflow-hidden transition-all duration-800 ease-out ${
            phase === 'reveal' || phase === 'fadeout'
              ? 'max-w-[800px] opacity-100 translate-x-0 ml-4 sm:ml-6'
              : 'max-w-0 opacity-0 -translate-x-12 ml-0'
          }`}
          style={{
            transitionProperty: 'max-width, opacity, transform, margin-left',
          }}
        >
          <div className="flex items-center whitespace-nowrap text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight font-display select-none">
            {/* STAKE: Solid Bold White */}
            <span className="text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.35)]">
              STAKE
            </span>

            {/* FIT: Shiny Vibrant Red with Glare Sheen */}
            <span className="relative inline-block ml-1">
              <span className="animate-money-glare inline-block text-red-500 font-black drop-shadow-[0_0_35px_rgba(239,68,68,0.95)]">
                FIT
              </span>

              {/* Glossy sheen glare streak */}
              <span className="absolute inset-0 overflow-hidden pointer-events-none">
                <span className="absolute -inset-y-2 -inset-x-6 w-12 bg-gradient-to-r from-transparent via-white/80 to-transparent rotate-[25deg] blur-[1px] animate-glare-beam" />
              </span>
            </span>

            {/* PRO Badge */}
            <span className="ml-3 sm:ml-4 text-xs sm:text-sm font-black font-sans px-2.5 py-1 rounded-md bg-red-600 text-white shadow-lg shadow-red-950/60 uppercase tracking-widest align-middle">
              PRO
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
