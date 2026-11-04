import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface MidnightCutoffTimerProps {
  className?: string;
}

export const MidnightCutoffTimer: React.FC<MidnightCutoffTimerProps> = ({
  className = '',
}) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(23, 59, 59, 999);
      const diffMs = Math.max(0, midnight.getTime() - now.getTime());
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const hh = String(timeLeft.hours).padStart(2, '0');
  const mm = String(timeLeft.minutes).padStart(2, '0');
  const ss = String(timeLeft.seconds).padStart(2, '0');

  return (
    <div
      className={`flex items-center gap-2 sm:gap-3 px-3 py-1.5 rounded-2xl bg-[#121214] border-2 border-red-600 shadow-md shadow-red-950/30 ${className}`}
      title="Daily verification cutoff timer (Resets at 11:59:59 PM)"
    >
      {/* Title & 11:59 PM badge */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-red-500 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-red-500 animate-spin" />
          <span className="hidden sm:inline">Midnight Cutoff</span>
          <span className="sm:hidden">Cutoff</span>
        </span>
        <span className="text-[9px] font-mono font-black text-white bg-black border border-zinc-800 px-1.5 py-0.5 rounded shadow-xs">
          11:59 PM
        </span>
      </div>

      {/* Digits blocks: [HRS] : [MIN] : [SEC] */}
      <div className="flex items-center gap-1 sm:gap-1.5 font-mono text-center">
        <div className="bg-[#18181b] border border-zinc-700 px-1.5 sm:px-2 py-0.5 rounded-lg min-w-[28px] sm:min-w-[32px]">
          <span className="text-xs sm:text-sm font-black text-white">{hh}</span>
          <div className="text-[7px] sm:text-[8px] text-zinc-400 font-bold uppercase leading-none">HRS</div>
        </div>
        <span className="text-red-500 font-black text-xs sm:text-sm leading-none">:</span>
        <div className="bg-[#18181b] border border-zinc-700 px-1.5 sm:px-2 py-0.5 rounded-lg min-w-[28px] sm:min-w-[32px]">
          <span className="text-xs sm:text-sm font-black text-white">{mm}</span>
          <div className="text-[7px] sm:text-[8px] text-zinc-400 font-bold uppercase leading-none">MIN</div>
        </div>
        <span className="text-red-500 font-black text-xs sm:text-sm leading-none">:</span>
        <div className="bg-[#18181b] border border-zinc-700 px-1.5 sm:px-2 py-0.5 rounded-lg min-w-[28px] sm:min-w-[32px]">
          <span className="text-xs sm:text-sm font-black text-red-500">{ss}</span>
          <div className="text-[7px] sm:text-[8px] text-zinc-400 font-bold uppercase leading-none">SEC</div>
        </div>
      </div>
    </div>
  );
};

