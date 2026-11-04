import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { PoolType, Currency } from '../types';
import { X, Trophy, Coins, UserPlus } from 'lucide-react';
import { playPop, playGong } from '../utils/audio';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (newGroupId: string) => void;
}

const EMOJI_AVATARS = ['🔥', '⚔️', '🦍', '⚡', '🏋️', '🥊', '🐺', '🛡️', '🏆', '🏃', '🏊', '👑'];

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { createGroup, showToast } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState(EMOJI_AVATARS[0]);
  const [currency, setCurrency] = useState<Currency>('₹');
  const [targetDays, setTargetDays] = useState(4);
  const [penalty, setPenalty] = useState(250);
  const [poolType, setPoolType] = useState<PoolType>('dividend');
  const [bountyGoal, setBountyGoal] = useState('End of season squad celebration dinner');
  const [vouchThreshold, setVouchThreshold] = useState(2);
  const [memberInvites, setMemberInvites] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    playGong();
    createGroup({
      name: name.trim(),
      description: description.trim() || 'Private squad fitness pact with financial stakes.',
      avatar,
      currency,
      targetDaysPerWeek: Number(targetDays),
      penaltyPerMissedDay: Number(penalty),
      poolType,
      bountyGoalDescription: poolType === 'bounty' ? bountyGoal : undefined,
    });

    showToast(`🎉 "${name.trim()}" Squad Pact created successfully!`);
    onClose();
    if (onCreated) {
      onCreated(`group-${Date.now()}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#121214] border border-[#27272a] rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-[#27272a] flex items-center justify-between bg-[#18181b]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-lg font-black">
              ⚡
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                Create New Squad Organization
              </h3>
              <p className="text-xs text-zinc-400">Configure financial stakes, verification rules & payout terms</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Avatar & Squad Name */}
          <div className="flex items-start gap-3">
            <div>
              <label className="block text-xs font-black text-zinc-300 uppercase tracking-wider mb-1.5">
                Emblem
              </label>
              <span className="text-3xl w-12 h-12 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-center shadow-inner">
                {avatar}
              </span>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-black text-zinc-300 uppercase tracking-wider mb-1.5">
                Squad Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dawn Patrol Runners or Iron Titans"
                className="w-full px-3.5 py-2.5 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors font-medium"
              />
            </div>
          </div>

          {/* Emblem Selector */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Select Emblem Mascot
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    playPop();
                    setAvatar(emoji);
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border transition-all ${
                    avatar === emoji
                      ? 'bg-emerald-500/20 border-emerald-500 scale-110 shadow-md glow-green'
                      : 'bg-[#18181b] border-zinc-800 hover:bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Description & Mission */}
          <div>
            <label className="block text-xs font-black text-zinc-300 uppercase tracking-wider mb-1.5">
              Squad Mission / Motto
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 4 workouts weekly. Zero excuses before 8 AM. Miss a day, pay the dividend."
              className="w-full px-3.5 py-2.5 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Target Frequency & Penalty Stakes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-zinc-300 uppercase tracking-wider mb-1.5">
                Weekly Target ({targetDays} Days / Week)
              </label>
              <div className="flex gap-1.5">
                {[3, 4, 5, 6].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => {
                      playPop();
                      setTargetDays(days);
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                      targetDays === days
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-[#18181b] border border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {days}d
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-zinc-300 uppercase tracking-wider mb-1.5">
                Penalty Per Missed Workout
              </label>
              <div className="flex gap-2">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white font-mono font-bold"
                >
                  <option value="₹">₹ (INR)</option>
                  <option value="$">$ (USD)</option>
                  <option value="€">€ (EUR)</option>
                  <option value="£">£ (GBP)</option>
                </select>
                <div className="flex-1 flex gap-1.5">
                  {[100, 250, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        playPop();
                        setPenalty(amt);
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-mono font-black transition-all ${
                        penalty === amt
                          ? 'bg-red-600 text-white shadow-md glow-red'
                          : 'bg-[#18181b] border border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {currency}{amt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Settlement Model */}
          <div>
            <label className="block text-xs font-black text-zinc-300 uppercase tracking-wider mb-1.5">
              Pool Settlement Model
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  playPop();
                  setPoolType('dividend');
                }}
                className={`p-3.5 rounded-2xl text-xs font-bold border transition-all text-left ${
                  poolType === 'dividend'
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md'
                    : 'bg-[#18181b] border-[#27272a] text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="text-white font-black flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-emerald-400" />
                  <span>1. Dividend Split (Recommended)</span>
                </div>
                <div className="text-[11px] text-zinc-400 font-normal mt-1 leading-relaxed">
                  Forfeited fines are distributed equally every Sunday among members who completed 100% of their target.
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  playPop();
                  setPoolType('bounty');
                }}
                className={`p-3.5 rounded-2xl text-xs font-bold border transition-all text-left ${
                  poolType === 'bounty'
                    ? 'bg-red-500/15 border-red-500 text-white shadow-md'
                    : 'bg-[#18181b] border-[#27272a] text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="text-white font-black flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>2. Squad Bounty Jackpot</span>
                </div>
                <div className="text-[11px] text-zinc-400 font-normal mt-1 leading-relaxed">
                  Fines pool together for an end-of-season squad dinner, party, or collective celebration.
                </div>
              </button>
            </div>
          </div>

          {poolType === 'bounty' && (
            <div>
              <label className="block text-xs font-black text-zinc-300 uppercase tracking-wider mb-1">
                Bounty Event Target
              </label>
              <input
                type="text"
                value={bountyGoal}
                onChange={(e) => setBountyGoal(e.target.value)}
                placeholder="e.g. End of year team dinner or go-karting"
                className="w-full px-3.5 py-2.5 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          )}

          {/* Peer Verification Rule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-zinc-300 uppercase tracking-wider mb-1.5">
                Vouch Verification Threshold
              </label>
              <select
                value={vouchThreshold}
                onChange={(e) => setVouchThreshold(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
              >
                <option value={1}>1 Peer Vouch (Casual squads)</option>
                <option value={2}>2 Peer Vouches (Recommended standard)</option>
                <option value={3}>3 Peer Vouches (Strict hard-mode)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-zinc-300 uppercase tracking-wider mb-1.5">
                Invite Squad Members
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={memberInvites}
                  onChange={(e) => setMemberInvites(e.target.value)}
                  placeholder="e.g. @priya_runs, @marcus_cali"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <UserPlus className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#27272a]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/40 active:scale-95"
            >
              Launch Squad Pact 🚀
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
