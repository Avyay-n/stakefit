import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { PoolType, Currency } from '../types';
import { X, Shield } from 'lucide-react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMOJI_AVATARS = ['🔥', '⚔️', '🦍', '⚡', '🏋️', '🥊', '🐺', '🛡️', '🏆'];

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose }) => {
  const { createGroup } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState(EMOJI_AVATARS[0]);
  const [currency, setCurrency] = useState<Currency>('₹');
  const [targetDays, setTargetDays] = useState(4);
  const [penalty, setPenalty] = useState(250);
  const [poolType, setPoolType] = useState<PoolType>('dividend');
  const [bountyGoal, setBountyGoal] = useState('End of season team barbecue dinner');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createGroup({
      name: name.trim(),
      description: description.trim() || 'Official accountability pact group.',
      avatar,
      currency,
      targetDaysPerWeek: Number(targetDays),
      penaltyPerMissedDay: Number(penalty),
      poolType,
      bountyGoalDescription: poolType === 'bounty' ? bountyGoal : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#121214] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden my-8">
        <div className="p-4 sm:p-5 border-b border-[#27272a] flex items-center justify-between bg-[#18181b]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create Private Accountability Pact</h3>
              <p className="text-xs text-zinc-400">Set stakes, weekly frequency & payout rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Avatar & Name */}
          <div className="flex gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Badge
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl p-2 rounded-xl bg-[#18181b] border border-[#27272a] block">
                  {avatar}
                </span>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Pact Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Iron Titans Squad"
                className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Emoji Avatar picker */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Choose Group Emblem
            </label>
            <div className="flex gap-2">
              {EMOJI_AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border transition-all ${
                    avatar === emoji
                      ? 'bg-red-500/20 border-red-500 scale-110'
                      : 'bg-[#18181b] border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Pact Motto / Mission
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 4 workouts weekly. Miss a day, pay the dividend."
              className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Weekly Frequency & Penalty */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Target Days ({targetDays} / wk)
              </label>
              <input
                type="number"
                min="1"
                max="7"
                value={targetDays}
                onChange={(e) => setTargetDays(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Penalty Per Missed Day
              </label>
              <div className="flex gap-1.5">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="px-2 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white font-mono"
                >
                  <option value="₹">₹</option>
                  <option value="$">$</option>
                  <option value="€">€</option>
                  <option value="£">£</option>
                </select>
                <input
                  type="number"
                  min="1"
                  value={penalty}
                  onChange={(e) => setPenalty(Number(e.target.value))}
                  className="flex-1 px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Pool Type */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Settlement Payout Model
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPoolType('dividend')}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                  poolType === 'dividend'
                    ? 'bg-red-500/20 border-red-500 text-white'
                    : 'bg-[#18181b] border-[#27272a] text-zinc-400'
                }`}
              >
                <div className="text-white font-bold">1. Dividend Split</div>
                <div className="text-[10px] text-zinc-400 font-normal mt-0.5">
                  Forfeited funds split among 100% qualifiers
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPoolType('bounty')}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                  poolType === 'bounty'
                    ? 'bg-red-500/20 border-red-500 text-white'
                    : 'bg-[#18181b] border-[#27272a] text-zinc-400'
                }`}
              >
                <div className="text-white font-bold">2. Group Bounty</div>
                <div className="text-[10px] text-zinc-400 font-normal mt-0.5">
                  Penalties pool for group dinner or celebration
                </div>
              </button>
            </div>
          </div>

          {poolType === 'bounty' && (
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                Bounty Event Goal
              </label>
              <input
                type="text"
                value={bountyGoal}
                onChange={(e) => setBountyGoal(e.target.value)}
                placeholder="e.g. End of year team dinner"
                className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#27272a]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md glow-red"
            >
              Create Group & Generate Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
