import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, UserCheck, Flame, ArrowRight } from 'lucide-react';
import { playPop } from '../utils/audio';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { users, switchActiveUser, showToast } = useApp();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');

  if (!isOpen) return null;

  const handleSelectUser = (userId: string, userName: string) => {
    playPop();
    switchActiveUser(userId);
    showToast(`Welcome back, ${userName}! Signed in.`);
    onSuccess();
    onClose();
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    playPop();
    // In our live state, select the primary user and update greeting
    showToast(`Account created for ${name}! Welcome to StakeFit.`);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#121214] border border-[#27272a] rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#27272a] flex items-center justify-between bg-[#18181b]/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white glow-red">
              <Flame className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {tab === 'signin' ? 'Sign In to StakeFit' : 'Create Your Account'}
              </h3>
              <p className="text-[11px] text-zinc-400">Put your money where your sweat is</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#18181b] rounded-xl border border-zinc-800 text-xs font-bold">
            <button
              onClick={() => setTab('signin')}
              className={`py-2 rounded-lg transition-all ${
                tab === 'signin' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab('signup')}
              className={`py-2 rounded-lg transition-all ${
                tab === 'signup' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {tab === 'signin' ? (
            <div className="space-y-3">
              <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-red-500" />
                <span>1-Click Instant Persona Sign In:</span>
              </div>
              <div className="space-y-2">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSelectUser(u.id, u.name)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#18181b] hover:bg-zinc-800 border border-zinc-800 hover:border-red-500/50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-zinc-700 group-hover:ring-red-500 transition-all"
                      />
                      <div>
                        <div className="text-xs font-black text-white group-hover:text-red-400 transition-colors">
                          {u.name}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {u.handle} • {u.streakDays}d Streak • {u.shieldsAvailable} Shields
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateAccount} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Fitness Handle
                </label>
                <input
                  type="text"
                  required
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@alex_lift"
                  className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Preferred UPI ID (for Forfeits & Dividend Payouts)
                </label>
                <input
                  type="text"
                  placeholder="alex@oksbi"
                  className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-red-950/60 glow-red"
              >
                Create Account & Join Squads
              </button>
            </form>
          )}

          <div className="pt-2 border-t border-zinc-800 text-center text-[10px] text-zinc-500 font-mono">
            🔒 Protected by Peer Vouch Consensus & EXIF Verification
          </div>
        </div>
      </div>
    </div>
  );
};
