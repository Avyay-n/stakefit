import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Flame,
  Skull,
  Coins,
  Camera,
  Shield,
  ShieldCheck,
  ChevronDown,
  UserCheck,
  Plus,
  Volume2,
  VolumeX,
  X,
  Pin,
  PinOff,
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
  isPinned?: boolean;
  onTogglePin?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onPageChange,
  pendingDebtsCount,
  onOpenCreateGroup,
  onOpenHub,
  isMobileOpen = false,
  onMobileClose,
  isPinned = false,
  onTogglePin,
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

  const [isHovered, setIsHovered] = useState(false);
  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());

  // Expanded if mobile drawer open, pinned open, or hovered on desktop
  const isExpanded = isMobileOpen || isPinned || isHovered;

  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playPop();
  };

  const handleDeployShield = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  // The 5 core navigation items matching Supabase layout with athletic icons
  const navItems = [
    {
      id: 'feed' as PageId,
      label: 'Daily Proof Feed',
      shortLabel: 'Feed',
      icon: <Flame className="w-5 h-5" />,
      funEmoji: '🔥',
      badge: null,
      badgeColor: '',
    },
    {
      id: 'shame-wall' as PageId,
      label: 'The Shame Wall',
      shortLabel: 'Shame',
      icon: <Skull className="w-5 h-5" />,
      funEmoji: '💀',
      badge: defaultedCount > 0 ? `${defaultedCount} 💀` : null,
      badgeColor: 'bg-red-950/80 text-red-400 border border-red-700/60',
      hasAlert: defaultedCount > 0,
    },
    {
      id: 'ledger' as PageId,
      label: 'Settlement Ledger',
      shortLabel: 'Ledger',
      icon: <Coins className="w-5 h-5" />,
      funEmoji: '💸',
      badge: pendingDebtsCount > 0 ? `${pendingDebtsCount} Due` : null,
      badgeColor: 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/60',
      hasAlert: pendingDebtsCount > 0,
    },
    {
      id: 'transformation' as PageId,
      label: 'Transformation Vault',
      shortLabel: 'Vault',
      icon: <Camera className="w-5 h-5" />,
      funEmoji: '📸',
      badge: null,
      badgeColor: '',
    },
    {
      id: 'squad' as PageId,
      label: 'Squad Pact Settings',
      shortLabel: 'Squad',
      icon: <Shield className="w-5 h-5" />,
      funEmoji: '⚔️',
      badge: null,
      badgeColor: '',
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setGroupDropdownOpen(false);
        setUserDropdownOpen(false);
      }}
      className={`fixed inset-y-0 left-0 z-40 bg-[#0d0d0f] border-r border-[#222225] flex flex-col justify-between transition-all duration-300 ease-in-out ${
        isMobileOpen
          ? 'translate-x-0 w-72 shadow-2xl z-50'
          : '-translate-x-full md:translate-x-0'
      } ${isExpanded ? 'md:w-72 shadow-2xl shadow-black/90' : 'md:w-16 shadow-none'}`}
    >
      {/* Top Section */}
      <div className="p-3 border-b border-[#222225] bg-[#111113]/90 relative">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            {/* Logo Emblem */}
            <div
              onClick={() => {
                if (onOpenHub) onOpenHub();
              }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 via-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-950/60 glow-red border border-red-400/40 cursor-pointer shrink-0"
              title="StakeFit Pro Hub"
            >
              <Flame className="w-5 h-5 text-white fill-white" />
            </div>

            {/* Revealed Brand Text on Expand */}
            {isExpanded && (
              <div className="truncate animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black tracking-tight text-white uppercase font-sans">
                    STAKE<span className="text-red-500">FIT</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-red-600 text-white">
                    PRO
                  </span>
                </div>
                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider truncate">
                  Accountability Hub
                </p>
              </div>
            )}
          </div>

          {/* Quick Header Actions on Expand */}
          {isExpanded && (
            <div className="flex items-center gap-1 animate-in fade-in duration-200">
              {/* Pin/Unpin Toggle */}
              {onTogglePin && (
                <button
                  onClick={onTogglePin}
                  className={`hidden md:flex p-1.5 rounded-lg transition-colors ${
                    isPinned
                      ? 'text-red-400 bg-red-950/40 border border-red-800'
                      : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                  }`}
                  title={isPinned ? 'Unpin sidebar (auto-collapses)' : 'Pin sidebar open'}
                >
                  {isPinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
                </button>
              )}

              {/* Sound Toggle */}
              <button
                onClick={handleToggleSound}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title={soundOn ? 'Sound On' : 'Sound Muted'}
              >
                {soundOn ? (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
                )}
              </button>

              {/* Mobile Drawer Close */}
              <button
                onClick={onMobileClose}
                className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Active Group Selector (Supabase Gen_F style) */}
        {isExpanded ? (
          <div className="relative mt-3 animate-in fade-in duration-200">
            <button
              onClick={() => {
                setGroupDropdownOpen(!groupDropdownOpen);
                setUserDropdownOpen(false);
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-[#18181b] hover:bg-[#202024] border border-zinc-800 transition-all text-xs font-bold text-white shadow-md group"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-base shrink-0">{activeGroup.avatar}</span>
                <div className="truncate text-left">
                  <div className="truncate text-white font-black group-hover:text-emerald-400 transition-colors">
                    {activeGroup.name}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    {activeGroup.targetDaysPerWeek}d/wk • {activeGroup.currency}
                    {activeGroup.penaltyPerMissedDay}/miss
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white shrink-0 ml-1" />
            </button>

            {/* Dropdown Menu */}
            {groupDropdownOpen && (
              <div className="absolute left-0 right-0 mt-2 rounded-xl bg-[#141416] border border-zinc-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[9px] font-black text-zinc-400 px-3 py-1 uppercase tracking-wider">
                  Active Squads & Orgs
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {groups.map((grp) => (
                    <button
                      key={grp.id}
                      onClick={() => {
                        switchActiveGroup(grp.id);
                        setGroupDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors text-xs ${
                        grp.id === activeGroupId
                          ? 'bg-emerald-600 text-white font-black shadow-md'
                          : 'text-zinc-300 hover:bg-[#222225]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-sm">{grp.avatar}</span>
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

                <div className="border-t border-[#27272a] mt-2 pt-2 space-y-1">
                  {onOpenHub && (
                    <button
                      onClick={() => {
                        setGroupDropdownOpen(false);
                        onOpenHub();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs font-black text-zinc-300 hover:text-white bg-[#1a1a1d] hover:bg-zinc-800 transition-all border border-zinc-700"
                    >
                      <span>⚡</span>
                      <span>Organizations Hub</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setGroupDropdownOpen(false);
                      onOpenCreateGroup();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs font-black text-emerald-400 bg-emerald-950/40 hover:bg-emerald-600 hover:text-white transition-all border border-emerald-800/60"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ New Squad Pact</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Collapsed Mini Squad Icon */
          <div className="mt-3 flex justify-center">
            <button
              onClick={() => {
                if (onOpenHub) onOpenHub();
              }}
              className="w-9 h-9 rounded-xl bg-[#18181b] border border-zinc-800 hover:border-emerald-500 flex items-center justify-center text-lg transition-all shadow-inner group/emblem relative"
              title={`${activeGroup.name} (${activeGroup.targetDaysPerWeek}d/wk)`}
            >
              <span>{activeGroup.avatar}</span>
              <span className="absolute left-full ml-3 px-2 py-1 rounded bg-[#18181b] border border-zinc-700 text-[10px] font-black text-white whitespace-nowrap shadow-xl opacity-0 group-hover/emblem:opacity-100 pointer-events-none transition-opacity z-50">
                {activeGroup.name}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Middle Section: Nav Items */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4 scrollbar-none">
        {isExpanded && (
          <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 px-3 mb-1 animate-in fade-in duration-200">
            Navigation
          </div>
        )}

        <nav className="space-y-1.5" aria-label="Sidebar Navigation">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative w-full flex items-center rounded-xl transition-all group/nav ${
                  isExpanded
                    ? `px-3 py-2.5 text-xs font-black tracking-wide ${
                        isActive
                          ? 'bg-red-600 text-white shadow-xl glow-red border border-red-400/40'
                          : 'text-zinc-300 hover:text-white hover:bg-[#18181b] border border-transparent'
                      }`
                    : `h-11 justify-center ${
                        isActive
                          ? 'bg-red-600 text-white shadow-lg glow-red'
                          : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
                      }`
                }`}
                title={!isExpanded ? item.label : undefined}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 truncate">
                  <span className="shrink-0">{item.icon}</span>
                  {isExpanded && (
                    <span className="uppercase tracking-wider font-extrabold truncate animate-in fade-in duration-200">
                      {item.label}
                    </span>
                  )}
                </div>

                {/* Badges - single-line pill, never wrap or overlap */}
                {isExpanded ? (
                  item.badge && (
                    <span
                      className={`ml-2 shrink-0 whitespace-nowrap px-2 py-0.5 text-[10px] font-mono font-black rounded-full shadow-md leading-none inline-flex items-center gap-1 ${
                        isActive
                          ? 'bg-white text-red-600'
                          : item.badgeColor || 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )
                ) : (
                  /* Dot alert indicator in collapsed mode */
                  item.hasAlert && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-black animate-pulse" />
                  )
                )}

                {/* Floating Tooltip when Collapsed */}
                {!isExpanded && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-[#18181b] border border-zinc-700 text-xs font-bold text-white whitespace-nowrap shadow-2xl opacity-0 group-hover/nav:opacity-100 pointer-events-none transition-all duration-150 z-50">
                    <div className="flex items-center gap-1.5">
                      <span>{item.funEmoji}</span>
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-600 text-[9px] text-white font-mono">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Expanded HUD cards */}
        {isExpanded && (
          <div className="space-y-3 pt-2 border-t border-[#222225] animate-in fade-in duration-200">
            {/* Rest Shield Quick Deployment */}
            {activeUser.shieldActive ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-950/40 border border-blue-800 text-blue-300 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Shield Active Today</span>
                </div>
                <span className="text-[9px] font-mono bg-blue-900/60 px-1.5 py-0.5 rounded text-blue-200">
                  Protected
                </span>
              </div>
            ) : activeUser.shieldsAvailable > 0 ? (
              <button
                onClick={handleDeployShield}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#141416] hover:bg-blue-950/40 border border-blue-900/40 text-blue-400 hover:border-blue-700 text-xs font-bold transition-all"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>Use Rest Shield</span>
                </div>
                <span className="text-[9px] font-mono font-bold bg-blue-950 border border-blue-800 px-1.5 py-0.5 rounded">
                  {activeUser.shieldsAvailable} Left
                </span>
              </button>
            ) : null}

            {/* Live Pool Stakes Card */}
            <div className="p-3 rounded-xl bg-[#141416] border border-[#222225] shadow-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider text-red-500 flex items-center gap-1">
                  <Coins className="w-3 h-3" />
                  <span>Active Pact Pool</span>
                </span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  WK #{activeGroup.cycleNumber}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="text-lg font-black font-mono text-white">
                  {activeGroup.currency}
                  {totalStakesAtRisk.toLocaleString()}
                </div>
                <div className="text-[9px] font-bold text-zinc-500 uppercase">
                  At Stake
                </div>
              </div>

              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-red-600 h-full rounded-full w-3/4" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section: Active User Perspective */}
      <div className="p-2 border-t border-[#222225] bg-[#111113]/90">
        {isExpanded ? (
          <div className="relative animate-in fade-in duration-200">
            <button
              onClick={() => {
                setUserDropdownOpen(!userDropdownOpen);
                setGroupDropdownOpen(false);
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-[#18181b] hover:bg-[#222225] border border-zinc-800 transition-all text-left shadow-lg group"
              title="Switch user perspective to simulate different squad members"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="relative shrink-0">
                  <img
                    src={activeUser.avatar}
                    alt={activeUser.name}
                    className="w-8 h-8 rounded-full object-cover shadow-md ring-2 ring-red-500"
                  />
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-red-600 border-2 border-[#121214] flex items-center justify-center text-[7px] text-white font-bold">
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
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white shrink-0 ml-1" />
            </button>

            {/* User Perspective Dropdown */}
            {userDropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 rounded-xl bg-[#141416] border border-zinc-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between px-2.5 py-1 border-b border-[#27272a] mb-1">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">
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
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition-colors text-xs ${
                          isCurrent
                            ? 'bg-red-600 text-white font-bold shadow-md'
                            : 'text-zinc-300 hover:bg-[#222225]'
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
        ) : (
          /* Collapsed Mini User Avatar */
          <div className="flex flex-col items-center gap-2 py-1">
            <button
              onClick={() => {
                if (onOpenHub) onOpenHub();
              }}
              className="w-9 h-9 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs transition-colors group/hub relative"
              title="All Organizations & Squads Hub"
            >
              <span>⚡</span>
              <span className="absolute left-full ml-3 px-2 py-1 rounded bg-[#18181b] border border-zinc-700 text-[10px] font-black text-white whitespace-nowrap shadow-xl opacity-0 group-hover/hub:opacity-100 pointer-events-none transition-opacity z-50">
                All Squads Hub
              </span>
            </button>

            <button
              onClick={() => setIsHovered(true)}
              className="relative group/avatar cursor-pointer"
              title={`${activeUser.name} (${activeUser.streakDays}d streak)`}
            >
              <img
                src={activeUser.avatar}
                alt={activeUser.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-red-500 shadow-md hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-red-600 border border-[#121214] flex items-center justify-center text-[7px] text-white font-bold">
                ✓
              </span>
              <span className="absolute left-full ml-3 px-2 py-1 rounded bg-[#18181b] border border-zinc-700 text-[10px] font-black text-white whitespace-nowrap shadow-xl opacity-0 group-hover/avatar:opacity-100 pointer-events-none transition-opacity z-50">
                {activeUser.name} ({activeUser.streakDays}d streak)
              </span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
