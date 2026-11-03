import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Moon, Award, RotateCcw, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';

export const SimulationControls: React.FC = () => {
  const {
    simulateMidnightCutoff,
    simulateCycleEnd,
    resetToMockData,
    activeUser,
    users,
    switchActiveUser,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <div className="bg-[#121214]/95 border border-[#27272a] hover:border-red-500/50 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-300">
        {/* Toggle Bar Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-zinc-300 hover:text-white transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Interactive Demo Simulator</span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />}
        </button>

        {/* Expanded Controls Drawer */}
        {isOpen && (
          <div className="p-3 border-t border-[#27272a] space-y-2.5 max-w-xs animate-in slide-in-from-bottom-2 duration-200">
            <p className="text-[10px] text-zinc-400 leading-tight">
              Test automated rules, peer verification, shame wall defaults, and Splitwise debt calculations:
            </p>

            {/* Quick user perspective switcher */}
            <div>
              <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1">
                Active Perspective: <span className="text-red-400 font-semibold">{activeUser.name.split(' ')[0]}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => switchActiveUser(u.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      u.id === activeUser.id
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-[#18181b] text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    {u.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulation Triggers */}
            <div className="flex flex-col gap-1.5 pt-1">
              <button
                onClick={simulateMidnightCutoff}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-zinc-200 text-xs font-semibold border border-zinc-800 hover:border-amber-500/40 transition-all text-left"
              >
                <div className="flex items-center gap-2">
                  <Moon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Simulate Midnight Cutoff</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">Shame Wall</span>
              </button>

              <button
                onClick={simulateCycleEnd}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-zinc-200 text-xs font-semibold border border-zinc-800 hover:border-emerald-500/40 transition-all text-left"
              >
                <div className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Simulate End of Cycle</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">Resolve Ledgers</span>
              </button>

              <button
                onClick={resetToMockData}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#18181b] hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-semibold transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Reset Demo State</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
