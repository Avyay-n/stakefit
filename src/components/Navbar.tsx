import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Flame,
  Shield,
  PlusCircle,
  ChevronDown,
  UserCheck,
  Plus,
  Coins,
} from 'lucide-react';

interface NavbarProps {
  onOpenCheckIn: () => void;
  onOpenCreateGroup: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCheckIn, onOpenCreateGroup }) => {
  const {
    groups,
    activeGroupId,
    activeGroup,
    switchActiveGroup,
    users,
    activeUserId,
    activeUser,
    switchActiveUser,
  } = useApp();

  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Calculate total stakes in current group
  const totalStakesAtRisk =
    activeGroup.memberIds.length *
    activeGroup.targetDaysPerWeek *
    activeGroup.penaltyPerMissedDay;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#27272a] bg-[#09090b]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Group Selector */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 via-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/30 glow-red">
              <Flame className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white uppercase font-sans">
                  Stake<span className="text-red-500">Fit</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                  Pact Active
                </span>
              </div>
            </div>
          </div>

          {/* Group Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setGroupDropdownOpen(!groupDropdownOpen);
                setUserDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] transition-all text-xs font-semibold text-zinc-200"
            >
              <span className="text-base">{activeGroup.avatar}</span>
              <span className="max-w-[120px] sm:max-w-[160px] truncate">{activeGroup.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {groupDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-xl bg-[#121214] border border-[#27272a] shadow-2xl p-2 z-50">
                <div className="text-[11px] font-semibold text-zinc-400 px-3 py-1.5 uppercase tracking-wider">
                  Your Accountability Pacts
                </div>
                {groups.map((grp) => (
                  <button
                    key={grp.id}
                    onClick={() => {
                      switchActiveGroup(grp.id);
                      setGroupDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors text-xs ${
                      grp.id === activeGroupId
                        ? 'bg-red-500/10 text-white font-medium border border-red-500/30'
                        : 'text-zinc-300 hover:bg-[#18181b]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-base">{grp.avatar}</span>
                      <div className="truncate">
                        <div className="font-semibold truncate">{grp.name}</div>
                        <div className="text-[10px] text-zinc-400">
                          {grp.memberIds.length} members • {grp.currency}{grp.penaltyPerMissedDay}/day
                        </div>
                      </div>
                    </div>
                    {grp.id === activeGroupId && (
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    )}
                  </button>
                ))}

                <div className="border-t border-[#27272a] mt-2 pt-2">
                  <button
                    onClick={() => {
                      setGroupDropdownOpen(false);
                      onOpenCreateGroup();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Pact Group</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Perspective Switcher, Stats & Check-in CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Stakes Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/40 border border-red-900/50 text-red-400 text-xs font-mono">
            <Coins className="w-3.5 h-3.5" />
            <span>Pool: {activeGroup.currency}{totalStakesAtRisk.toLocaleString()}</span>
          </div>

          {/* User Streak & Shield Quick Pills */}
          <div className="hidden sm:flex items-center gap-2">
            <div
              title={`${activeUser.streakDays} day streak!`}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#18181b] border border-amber-500/30 text-amber-400 text-xs font-bold font-mono"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
              <span>{activeUser.streakDays}d</span>
            </div>

            <div
              title={`${activeUser.shieldsAvailable} emergency shields remaining`}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${
                activeUser.shieldActive
                  ? 'bg-blue-950/60 border-blue-500 text-blue-400 glow-blue'
                  : 'bg-[#18181b] border-zinc-700 text-zinc-300'
              }`}
            >
              <Shield className={`w-3.5 h-3.5 ${activeUser.shieldActive ? 'text-blue-400 fill-blue-400' : 'text-zinc-400'}`} />
              <span>{activeUser.shieldsAvailable}</span>
            </div>
          </div>

          {/* Perspective Switcher (Switch User to Test Vouches / Settlements) */}
          <div className="relative">
            <button
              onClick={() => {
                setUserDropdownOpen(!userDropdownOpen);
                setGroupDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] transition-all"
              title="Switch user perspective to test vouches & settlements"
            >
              <img
                src={activeUser.avatar}
                alt={activeUser.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-red-500"
              />
              <span className="hidden md:inline text-xs font-semibold text-zinc-200 max-w-[90px] truncate">
                {activeUser.name.split(' ')[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#121214] border border-[#27272a] shadow-2xl p-2 z-50">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#27272a] mb-2">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Switch Perspective
                  </span>
                  <span className="text-[10px] text-red-400 font-mono">Simulate User</span>
                </div>
                <div className="space-y-1">
                  {users.map((u) => {
                    const isCurrent = u.id === activeUserId;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchActiveUser(u.id);
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors text-xs ${
                          isCurrent
                            ? 'bg-red-500/15 text-white border border-red-500/30'
                            : 'text-zinc-300 hover:bg-[#18181b]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-semibold flex items-center gap-1.5">
                              {u.name}
                              {u.role === 'admin' && (
                                <span className="text-[9px] px-1 py-0.2 bg-red-950 text-red-400 rounded border border-red-800">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-zinc-400 font-mono">
                              {u.streakDays}d streak • {u.isDoubleDown ? '2x Double' : '1x Stake'}
                            </div>
                          </div>
                        </div>
                        {isCurrent && <UserCheck className="w-4 h-4 text-red-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Primary Post Check-In CTA */}
          <button
            onClick={onOpenCheckIn}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-900/40 glow-red"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Log Proof</span>
            <span className="sm:hidden">Log</span>
          </button>
        </div>
      </div>
    </header>
  );
};
