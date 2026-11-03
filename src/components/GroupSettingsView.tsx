import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { PoolType, Currency } from '../types';
import {
  Users,
  Copy,
  Check,
  Trash2,
  UserPlus,
  Settings,
  Flame,
} from 'lucide-react';

export const GroupSettingsView: React.FC = () => {
  const {
    activeGroup,
    users,
    activeUser,
    updateGroupPact,
    addMemberToGroup,
    removeMemberFromGroup,
  } = useApp();

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Editable Pact state
  const [name, setName] = useState(activeGroup.name);
  const [description, setDescription] = useState(activeGroup.description);
  const [targetDays, setTargetDays] = useState(activeGroup.targetDaysPerWeek);
  const [penalty, setPenalty] = useState(activeGroup.penaltyPerMissedDay);
  const [currency, setCurrency] = useState<Currency>(activeGroup.currency);
  const [poolType, setPoolType] = useState<PoolType>(activeGroup.poolType);
  const [bountyGoal, setBountyGoal] = useState(activeGroup.bountyGoalDescription || 'Group Celebration Dinner');

  const usersMap = new Map(users.map((u) => [u.id, u]));

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(activeGroup.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    const link = `https://stakefit.app/join/${activeGroup.inviteCode}`;
    navigator.clipboard?.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSavePact = (e: React.FormEvent) => {
    e.preventDefault();
    updateGroupPact(activeGroup.id, {
      name,
      description,
      targetDaysPerWeek: Number(targetDays),
      penaltyPerMissedDay: Number(penalty),
      currency,
      poolType,
      bountyGoalDescription: bountyGoal,
    });
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    addMemberToGroup(activeGroup.id, newMemberName.trim());
    setNewMemberName('');
    setShowAddMemberModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Invite Code & Share Banner */}
      <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{activeGroup.avatar}</span>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                {activeGroup.name}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-mono font-bold">
                Private Pact
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              {activeGroup.description}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md glow-red"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Member</span>
            </button>
          </div>
        </div>

        {/* Shareable Link and Code Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-between">
            <div>
              <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                Group Invite Code
              </div>
              <div className="text-base font-black font-mono text-white tracking-widest mt-0.5">
                {activeGroup.inviteCode}
              </div>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                Shareable Invite Link
              </div>
              <div className="text-xs font-mono text-zinc-300 truncate mt-1">
                https://stakefit.app/join/{activeGroup.inviteCode}
              </div>
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors shrink-0"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pact Rules Configurator */}
      <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4 text-red-500" />
              <span>Configure Pact Rules & Stakes</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Admin controls to tune weekly target frequency, penalties, and settlement model
            </p>
          </div>
          <span className="text-xs font-bold text-red-400 bg-red-950/40 px-2.5 py-1 rounded-lg border border-red-900 font-mono">
            Admin Controlled
          </span>
        </div>

        <form onSubmit={handleSavePact} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Group Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Pact Motto / Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {/* Target Frequency */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Target Days Per Week ({targetDays} days)
              </label>
              <input
                type="range"
                min="1"
                max="7"
                value={targetDays}
                onChange={(e) => setTargetDays(Number(e.target.value))}
                className="w-full accent-red-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                <span>1 day</span>
                <span>4 days (Standard)</span>
                <span>7 days (Savage)</span>
              </div>
            </div>

            {/* Penalty Stake */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Penalty Per Missed Day
              </label>
              <div className="flex gap-2">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="px-2.5 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white font-mono"
                >
                  <option value="₹">₹ INR</option>
                  <option value="$">$ USD</option>
                  <option value="€">€ EUR</option>
                  <option value="£">£ GBP</option>
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

            {/* Payout Model */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Payout Model
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPoolType('dividend')}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                    poolType === 'dividend'
                      ? 'bg-red-500/20 border-red-500 text-white shadow-md'
                      : 'bg-[#18181b] border-[#27272a] text-zinc-400'
                  }`}
                >
                  Dividend Split
                </button>
                <button
                  type="button"
                  onClick={() => setPoolType('bounty')}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                    poolType === 'bounty'
                      ? 'bg-red-500/20 border-red-500 text-white shadow-md'
                      : 'bg-[#18181b] border-[#27272a] text-zinc-400'
                  }`}
                >
                  Group Bounty
                </button>
              </div>
            </div>
          </div>

          {poolType === 'bounty' && (
            <div className="p-3.5 rounded-xl bg-[#18181b] border border-[#27272a]">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                Bounty Event / Goal Description
              </label>
              <input
                type="text"
                value={bountyGoal}
                onChange={(e) => setBountyGoal(e.target.value)}
                placeholder="e.g. End of quarter steakhouse dinner or weekend mountain trip"
                className="w-full px-3 py-1.5 bg-[#121214] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md glow-red"
            >
              Update Pact Settings
            </button>
          </div>
        </form>
      </div>

      {/* Member Roster & Management */}
      <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-red-500" />
              <span>Active Members Roster ({activeGroup.memberIds.length})</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Manage permissions, view streaks, and manage pact participation
            </p>
          </div>

          <button
            onClick={() => setShowAddMemberModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-xs font-bold text-zinc-200 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-red-400" />
            <span>Add Member</span>
          </button>
        </div>

        <div className="divide-y divide-[#27272a]">
          {activeGroup.memberIds.map((memberId) => {
            const user = usersMap.get(memberId);
            if (!user) return null;
            const stats = activeGroup.membersStats[memberId];
            const isAdmin = user.role === 'admin';
            const isMe = user.id === activeUser.id;

            return (
              <div
                key={user.id}
                className="py-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-zinc-700"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{user.name}</span>
                      {isAdmin && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-red-950 text-red-400 border border-red-800">
                          ADMIN
                        </span>
                      )}
                      {isMe && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-zinc-800 text-zinc-300">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-zinc-400 flex items-center gap-2 mt-0.5 font-mono text-[11px]">
                      <span>{user.handle}</span>
                      <span>•</span>
                      <span className="text-amber-400 flex items-center gap-0.5">
                        <Flame className="w-3 h-3 fill-amber-500" />
                        {user.streakDays}d streak
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="font-mono font-bold text-zinc-200">
                      {stats?.daysVerifiedThisWeek || 0}/{activeGroup.targetDaysPerWeek} Days
                    </div>
                    <div className="text-[10px] text-zinc-400">This Cycle</div>
                  </div>

                  {!isAdmin && activeGroup.memberIds.length > 2 && (
                    <button
                      onClick={() => removeMemberFromGroup(activeGroup.id, user.id)}
                      className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Remove member from pact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#121214] border border-[#27272a] rounded-2xl p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Add New Member to Pact
            </h3>
            <p className="text-xs text-zinc-400">
              Enter their name to add them to {activeGroup.name}
            </p>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Member Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g. Liam Gallagher"
                  className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#27272a]">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider shadow-md glow-red"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
