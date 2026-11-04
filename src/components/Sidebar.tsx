import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Flame,
  ChevronDown,
  UserCheck,
  Plus,
  Coins,
  X,
  Volume2,
  VolumeX,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import { isSoundEnabled, setSoundEnabled, playPop, playShieldSound } from '../utils/audio';

export type PageId = 'feed' | 'shame-wall' | 'ledger' | 'transformation' | 'squad';

interface SidebarProps {
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
  pendingDebtsCount: number;
  onOpenCheckIn?: () => void;
  onOpenCreateGroup: () => void;
  onOpenHub?: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onPageChange,
  pendingDebtsCount,
  onOpenCreateGroup,
  onOpenHub,
  isMobileOpen = false,
  onMobileClose,
}) => {
  const {
    groups,
    activeGroupId,
    activeGroup,
    switchActiveGroup,
    users,
    activeUserId,
    activeUser,
    switchActiveUser,
    activateStreakShield,
    showToast,
  } = useApp();

  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playPop();
  };

  const handleDeployShield = () => {
    activateStreakShield();
    playShieldSound();
    showToast('Emergency Streak Shield deployed! Rest day protected from fines.');
  };

  // Count defaulted members in current group for shame wall badge
  const defaultedCount = Object.values(activeGroup.membersStats || {}).filter(
    (s) => s.status === 'defaulted'
  ).length;

  const totalStakesAtRisk =
    activeGroup.memberIds.length *
    activeGroup.targetDaysPerWeek *
    activeGroup.penaltyPerMissedDay;

  // The 5 core navigation items from Image 2
  const navItems = [
    {
      id: 'feed' as PageId,
      label: 'Feed',
      funEmoji: '🔥',
      badge: null,
    },
    {
      id: 'shame-wall' as PageId,
      label: 'Shame Wall',
      funEmoji: '💀',
      badge: defaultedCount > 0 ? `${defaultedCount} 💀` : null,
      badgeColor: 'bg-white text-red-600 border border-red-500/30',
    },
    {
      id: 'ledger' as PageId,
      label: 'Ledger & Debts',
      funEmoji: '💸',
      badge: pendingDebtsCount > 0 ? `${pendingDebtsCount} unsettled` : null,
      badgeColor: 'bg-white text-emerald-700 border border-emerald-500/30',
    },
    {
      id: 'transformation' as PageId,
      label: 'Transformation',
      funEmoji: '📸',
      badge: null,
    },
    {
      id: 'squad' as PageId,
      label: 'Squad Pact',
      funEmoji: '⚔️',
      badge: null,
    },
  ];

  const handleNavClick = (pageId: PageId) => {
    playPop();
    onPageChange(pageId);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#000000] border-r-2 border-[#27272a] flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}
    >
      {/* Top Section: Brand + Sound Toggle + Group Switcher */}
      <div className="p-4 border-b border-[#27272a] bg-[#09090b]">
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 via-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/50 glow-red border border-red-400/40">
              <Flame className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-white uppercase font-sans">
                  STAKE<span className="text-red-500">FIT</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-red-600 text-white">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                Fitness Accountability
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Audio Toggle Button */}
            <button
              onClick={handleToggleSound}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title={soundOn ? 'Sound Effects Enabled (Click to mute)' : 'Sound Effects Muted (Click to enable)'}
            >
              {soundOn ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-zinc-500" />
              )}
            </button>

            {/* Close button for mobile drawer */}
            <button
              onClick={onMobileClose}
              className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Active Group Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setGroupDropdownOpen(!groupDropdownOpen);
              setUserDropdownOpen(false);
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#121214] hover:bg-[#18181b] border border-zinc-800 transition-all text-xs font-bold text-white shadow-md group"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="text-lg">{activeGroup.avatar}</span>
              <div className="truncate text-left">
                <div className="truncate text-white font-black group-hover:text-red-500 transition-colors">
                  {activeGroup.name}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono font-semibold">
                  {activeGroup.targetDaysPerWeek}d/wk • {activeGroup.currency}
                  {activeGroup.penaltyPerMissedDay}/miss
                </div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-white shrink-0 ml-1" />
          </button>

          {/* Group Dropdown Menu */}
          {groupDropdownOpen && (
            <div className="absolute left-0 right-0 mt-2 rounded-xl bg-[#121214] border-2 border-red-600/40 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[10px] font-black text-zinc-400 px-3 py-1 uppercase tracking-wider">
                Active Pacts
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {groups.map((grp) => (
                  <button
                    key={grp.id}
                    onClick={() => {
                      switchActiveGroup(grp.id);
                      setGroupDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors text-xs ${
                      grp.id === activeGroupId
                        ? 'bg-red-600 text-white font-black shadow-md'
                        : 'text-zinc-300 hover:bg-[#18181b]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base">{grp.avatar}</span>
                      <div className="truncate">
                        <div className="font-bold truncate">{grp.name}</div>
                        <div
                          className={`text-[9px] ${
                            grp.id === activeGroupId ? 'text-white/80' : 'text-zinc-500'
                          }`}
                        >
                          {grp.memberIds.length} members • {grp.currency}
                          {grp.penaltyPerMissedDay}/day
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="border-t border-[#27272a] mt-2 pt-2 space-y-1.5">
                {onOpenHub && (
                  <button
                    onClick={() => {
                      setGroupDropdownOpen(false);
                      onOpenHub();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-black text-zinc-300 hover:text-white bg-[#18181b] hover:bg-zinc-800 transition-all border border-zinc-700"
                  >
                    <span>⚡</span>
                    <span>All Squads & Orgs Hub</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setGroupDropdownOpen(false);
                    onOpenCreateGroup();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-black text-white bg-red-600/20 hover:bg-red-600 hover:text-white transition-all border border-red-500/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New Pact</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Middle Section: Navigation Links + Stakes */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {/* Navigation Section (Image 2 Items) */}
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-3 mb-2">
            Navigation
          </div>
          <nav className="space-y-1" aria-label="Sidebar Navigation">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-black tracking-wide transition-all ${
                    isActive
                      ? 'bg-red-600 text-white shadow-xl shadow-red-950/80 glow-red border border-red-400/40 translate-x-1'
                      : 'text-zinc-300 hover:text-white hover:bg-[#18181b] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg leading-none">{item.funEmoji}</span>
                    <span className="uppercase tracking-wider font-extrabold">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono font-black rounded-full shadow-md ${
                        isActive
                          ? 'bg-white text-red-600'
                          : item.badgeColor || 'bg-white text-black'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Gamification: Shield Quick Controls */}
        <div className="space-y-2 pt-1 border-t border-[#27272a]">
          {/* Quick Shield Deployment if available */}
          {activeUser.shieldActive ? (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-950/40 border border-blue-800 text-blue-300 text-xs font-bold">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Rest Shield Active Today</span>
              </div>
              <span className="text-[10px] font-mono bg-blue-900/60 px-1.5 py-0.5 rounded text-blue-200">
                Protected
              </span>
            </div>
          ) : activeUser.shieldsAvailable > 0 ? (
            <button
              onClick={handleDeployShield}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#121214] hover:bg-blue-950/30 border border-blue-900/40 text-blue-400 hover:border-blue-700 text-xs font-bold transition-all"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Deploy Emergency Shield</span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-blue-950 border border-blue-800 px-1.5 py-0.5 rounded">
                {activeUser.shieldsAvailable} Left
              </span>
            </button>
          ) : null}
        </div>

        {/* Live Pool Stakes Card */}
        <div className="p-3.5 rounded-xl bg-[#121214] border border-[#27272a] shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-red-500 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" />
              <span>Pact Pool</span>
            </span>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
              WEEK #{activeGroup.cycleNumber}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-xl font-black font-mono text-white">
              {activeGroup.currency}
              {totalStakesAtRisk.toLocaleString()}
            </div>
            <div className="text-[10px] font-bold text-zinc-400 uppercase">
              At Stake This Cycle
            </div>
          </div>

          <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-red-600 h-full rounded-full w-3/4" />
          </div>
        </div>
      </div>

      {/* Bottom Section: Active User Perspective Widget */}
      <div className="p-3 border-t-2 border-[#27272a] bg-[#09090b]">
        {/* User Card */}
        <div className="relative">
          <button
            onClick={() => {
              setUserDropdownOpen(!userDropdownOpen);
              setGroupDropdownOpen(false);
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#121214] hover:bg-[#18181b] border border-zinc-800 transition-all text-left shadow-lg group"
            title="Switch user perspective to simulate different squad members"
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className="relative">
                <img
                  src={activeUser.avatar}
                  alt={activeUser.name}
                  className="w-9 h-9 rounded-full object-cover shadow-md ring-2 ring-red-500"
                />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-600 border-2 border-[#121214] flex items-center justify-center text-[7px] text-white font-bold">
                  ✓
                </span>
              </div>
              <div className="truncate">
                <div className="text-xs font-black text-white group-hover:text-red-500 transition-colors truncate">
                  {activeUser.name}
                </div>
                <div className="text-[10px] text-red-400 font-mono font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-red-500 text-red-500" />
                  <span>{activeUser.streakDays}d streak</span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-400 uppercase font-semibold">{activeUser.role}</span>
                </div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-white shrink-0 ml-1" />
          </button>

          {/* Perspective Switcher Dropdown */}
          {userDropdownOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 rounded-xl bg-[#121214] border-2 border-red-600/40 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#27272a] mb-1.5">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                  Switch Perspective
                </span>
                <span className="text-[9px] text-red-400 font-mono font-bold">Simulate</span>
              </div>
              <div className="max-h-52 overflow-y-auto space-y-1">
                {users.map((u) => {
                  const isCurrent = u.id === activeUserId;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchActiveUser(u.id);
                        setUserDropdownOpen(false);
                        playPop();
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors text-xs ${
                        isCurrent
                          ? 'bg-red-600 text-white font-bold shadow-md'
                          : 'text-zinc-300 hover:bg-[#18181b]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-6 h-6 rounded-full object-cover ring-1 ring-white/20"
                        />
                        <div className="truncate">
                          <div className="font-bold truncate">{u.name}</div>
                          <div
                            className={`text-[9px] ${
                              isCurrent ? 'text-white/80' : 'text-zinc-500'
                            }`}
                          >
                            {u.streakDays}d • {u.role}
                          </div>
                        </div>
                      </div>
                      {isCurrent && <UserCheck className="w-3.5 h-3.5 text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
