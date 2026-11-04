import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { PoolType, Currency } from '../types';
import { OrbitCardStack, type OrbitStackItem } from './OrbitCardStack';
import {
  Users,
  Copy,
  Check,
  Trash2,
  UserPlus,
  Settings,
  Flame,
  Layers,
  List,
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
  const [memberView, setMemberView] = useState<'stack' | 'list'>('stack');

  // Editable Pact state
  const [name, setName] = useState(activeGroup.name);
  const [description, setDescription] = useState(activeGroup.description);
  const [targetDays, setTargetDays] = useState(activeGroup.targetDaysPerWeek);
  const [penalty, setPenalty] = useState(activeGroup.penaltyPerMissedDay);
  const [currency, setCurrency] = useState<Currency>(activeGroup.currency);
  const [poolType, setPoolType] = useState<PoolType>(activeGroup.poolType);
  const [bountyGoal, setBountyGoal] = useState(activeGroup.bountyGoalDescription || 'Group Celebration Dinner');

  const usersMap = new Map(users.map((u) => [u.id, u]));

  const memberOrbitItems: OrbitStackItem[] = activeGroup.memberIds.map((mid) => {
    const u = usersMap.get(mid);
    const s = activeGroup.membersStats[mid];
    const isDefaulted = s?.status === 'defaulted';
    const isQualifier = (s?.daysVerifiedThisWeek || 0) >= activeGroup.targetDaysPerWeek;

    return {
      name: u?.name || 'Member',
      role: u?.role === 'admin' ? 'Squad Admin' : (u?.handle || '@athlete'),
      description: isDefaulted
        ? `Missed yesterday's cutoff. Owes ${activeGroup.currency}${activeGroup.penaltyPerMissedDay} forfeit to the pool.`
        : isQualifier
        ? `Hit 100% target (${s?.daysVerifiedThisWeek}/${activeGroup.targetDaysPerWeek} days)! Dividend qualified.`
        : `Verified ${s?.daysVerifiedThisWeek || 0} of ${activeGroup.targetDaysPerWeek} days. On track for Sunday reset.`,
      stat: `${s?.daysVerifiedThisWeek || 0}/${activeGroup.targetDaysPerWeek} Days Done`,
      streak: isDefaulted ? '💀 Defaulted' : `🔥 ${u?.streakDays || 0}d`,
      badge: u?.role === 'admin' ? 'ADMIN' : isQualifier ? 'QUALIFIER' : isDefaulted ? 'DEFAULTED' : undefined,
      image: u?.avatar,
      accent: u?.role === 'admin' ? '#ef4444' : isQualifier ? '#22c55e' : '#f59e0b',
    };
  });

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
      <div className="bg-white text-zinc-950 border-2 border-zinc-200 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{activeGroup.avatar}</span>
              <h3 className="text-base font-black text-black uppercase tracking-wider">
                {activeGroup.name}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300 font-mono font-bold">
                Private Pact
              </span>
            </div>
            <p className="text-xs text-zinc-600 font-medium mt-1 max-w-xl">
              {activeGroup.description}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-black text-white text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Member</span>
            </button>
          </div>
        </div>

        {/* Shareable Link and Code Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                Group Invite Code
              </div>
              <div className="text-base font-black font-mono text-black tracking-widest mt-0.5">
                {activeGroup.inviteCode}
              </div>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 border border-zinc-300 text-black text-xs font-black transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                Shareable Invite Link
              </div>
              <div className="text-xs font-mono text-zinc-700 truncate mt-1">
                https://stakefit.app/join/{activeGroup.inviteCode}
              </div>
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 border border-zinc-300 text-black text-xs font-black transition-colors shrink-0"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pact Rules Configurator */}
      <div className="bg-white text-zinc-950 border-2 border-zinc-200 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
          <div>
            <h3 className="text-sm font-black text-black uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4 text-red-600" />
              <span>Configure Pact Rules & Stakes</span>
            </h3>
            <p className="text-xs text-zinc-600 font-medium mt-0.5">
              Admin controls to tune weekly target frequency, penalties, and settlement model
            </p>
          </div>
          <span className="text-xs font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-full border border-red-300 font-mono">
            Admin Controlled
          </span>
        </div>

        <form onSubmit={handleSavePact} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                Group Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-black focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                Pact Motto / Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-black focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {/* Target Frequency */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                Target Days Per Week ({targetDays} days)
              </label>
              <input
                type="range"
                min="1"
                max="7"
                value={targetDays}
                onChange={(e) => setTargetDays(Number(e.target.value))}
                className="w-full accent-red-600"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                <span>1 day</span>
                <span>4 days (Standard)</span>
                <span>7 days (Savage)</span>
              </div>
            </div>

            {/* Penalty Stake */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                Penalty Per Missed Day
              </label>
              <div className="flex gap-2">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="px-2.5 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-black font-mono font-bold"
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
                  className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-mono font-bold text-black focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            {/* Payout Model */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                Payout Model
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPoolType('dividend')}
                  className={`p-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                    poolType === 'dividend'
                      ? 'bg-red-600 border-red-600 text-white shadow-md'
                      : 'bg-zinc-100 border-zinc-300 text-zinc-700'
                  }`}
                >
                  Dividend Split
                </button>
                <button
                  type="button"
                  onClick={() => setPoolType('bounty')}
                  className={`p-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                    poolType === 'bounty'
                      ? 'bg-red-600 border-red-600 text-white shadow-md'
                      : 'bg-zinc-100 border-zinc-300 text-zinc-700'
                  }`}
                >
                  Group Bounty
                </button>
              </div>
            </div>
          </div>

          {poolType === 'bounty' && (
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                Bounty Event / Goal Description
              </label>
              <input
                type="text"
                value={bountyGoal}
                onChange={(e) => setBountyGoal(e.target.value)}
                placeholder="e.g. End of quarter steakhouse dinner or weekend mountain trip"
                className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-black focus:outline-none focus:border-red-600"
              />
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-black text-white text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              Update Pact Settings
            </button>
          </div>
        </form>
      </div>

      {/* Member Roster & Management */}
      <div className="bg-white text-zinc-950 border-2 border-zinc-200 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-200 pb-4">
          <div>
            <h3 className="text-sm font-black text-black uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-red-600" />
              <span>Squad Members Roster ({activeGroup.memberIds.length})</span>
            </h3>
            <p className="text-xs text-zinc-600 font-medium mt-0.5">
              Inspect athlete cards, weekly performance & pact standing
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher: Stack vs List */}
            <div className="flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200">
              <button
                type="button"
                onClick={() => setMemberView('stack')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  memberView === 'stack'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Orbit Deck</span>
              </button>
              <button
                type="button"
                onClick={() => setMemberView('list')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  memberView === 'list'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
            </div>

            <button
              onClick={() => setShowAddMemberModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-black text-xs font-black uppercase tracking-wider text-white transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 text-red-400" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {memberView === 'stack' ? (
          <div className="py-2">
            <div className="text-center text-xs text-zinc-600 mb-1">
              ✨ <span className="text-black font-bold">Hover to fan out the deck</span>. Use arrow keys or click cards to browse squad members.
            </div>
            <OrbitCardStack
              items={memberOrbitItems}
              cardClassName="border border-zinc-300 bg-white text-zinc-950 shadow-2xl"
            />
          </div>
        ) : (
          <div className="divide-y divide-zinc-200">
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
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-zinc-300 shadow-sm"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-black text-sm">{user.name}</span>
                        {isAdmin && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black font-mono bg-red-100 text-red-700 border border-red-300">
                            ADMIN
                          </span>
                        )}
                        {isMe && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black font-mono bg-zinc-100 text-zinc-700 border border-zinc-200">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-zinc-600 flex items-center gap-2 mt-0.5 font-mono text-[11px] font-bold">
                        <span>{user.handle}</span>
                        <span>•</span>
                        <span className="text-amber-600 flex items-center gap-0.5">
                          <Flame className="w-3 h-3 fill-amber-500" />
                          {user.streakDays}d streak
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <div className="font-mono font-black text-black">
                        {stats?.daysVerifiedThisWeek || 0}/{activeGroup.targetDaysPerWeek} Days
                      </div>
                      <div className="text-[10px] text-zinc-500 font-bold">This Cycle</div>
                    </div>

                    {!isAdmin && activeGroup.memberIds.length > 2 && (
                      <button
                        onClick={() => removeMemberFromGroup(activeGroup.id, user.id)}
                        className="p-2 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
        )}
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white text-zinc-950 border-2 border-zinc-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-black uppercase tracking-wider">
              Add New Member to Pact
            </h3>
            <p className="text-xs text-zinc-600 font-medium">
              Enter their name to add them to {activeGroup.name}
            </p>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                  Member Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g. Liam Gallagher"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-black focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-black text-white text-xs font-black uppercase tracking-wider shadow-md"
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
