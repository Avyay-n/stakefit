import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Clock, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const { activeGroup, users } = useApp();

  const usersMap = new Map(users.map((u) => [u.id, u]));

  return (
    <div className="w-full bg-[#121214] border border-[#27272a] rounded-2xl p-4 sm:p-5 shadow-xl mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Daily Check-In Status & Shame Wall</span>
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
              Midnight Cutoff
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Peer vouches required before 11:59 PM to avoid daily forfeit penalties
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
            <span>Verified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/20" />
            <span>Reviewing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-600 ring-2 ring-zinc-600/20" />
            <span>Yet to log</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-500/30 animate-pulse" />
            <span className="text-red-400 font-semibold">Defaulted</span>
          </div>
        </div>
      </div>

      {/* Avatars Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
        {activeGroup.memberIds.map((memberId) => {
          const user = usersMap.get(memberId);
          if (!user) return null;

          const stats = activeGroup.membersStats[memberId] || {
            userId: memberId,
            daysLoggedThisWeek: 0,
            daysVerifiedThisWeek: 0,
            missedDays: 0,
            isDoubleDown: false,
            shieldUsedThisWeek: false,
            dailyStatuses: {},
            status: 'yet_to_log',
          };

          // Ring styling based on status
          let ringColor = 'ring-zinc-700 border-zinc-800';
          let statusBadge = (
            <span className="flex items-center gap-1 text-[10px] text-zinc-400 font-semibold">
              <Clock className="w-3 h-3 text-zinc-500" />
              <span>Pending log</span>
            </span>
          );
          let cardBg = 'bg-[#18181b]/60 border-[#27272a]';

          if (stats.shieldUsedThisWeek) {
            ringColor = 'ring-blue-500 ring-offset-2 ring-offset-[#121214]';
            cardBg = 'bg-blue-950/20 border-blue-900/40';
            statusBadge = (
              <span className="flex items-center gap-1 text-[10px] text-blue-400 font-semibold">
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                <span>Rest Shield</span>
              </span>
            );
          } else if (stats.status === 'verified') {
            ringColor = 'ring-emerald-500 ring-offset-2 ring-offset-[#121214] shadow-lg shadow-emerald-950/50';
            cardBg = 'bg-emerald-950/15 border-emerald-900/40';
            statusBadge = (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Verified</span>
              </span>
            );
          } else if (stats.status === 'pending') {
            ringColor = 'ring-amber-500 ring-offset-2 ring-offset-[#121214] animate-pulse';
            cardBg = 'bg-amber-950/15 border-amber-900/40';
            statusBadge = (
              <span className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>Under Review</span>
              </span>
            );
          } else if (stats.status === 'defaulted') {
            ringColor = 'ring-red-600 ring-offset-2 ring-offset-[#121214] shadow-lg shadow-red-950/70';
            cardBg = 'bg-red-950/25 border-red-900/50 glow-red';
            statusBadge = (
              <span className="flex items-center gap-1 text-[10px] text-red-400 font-black uppercase tracking-wider animate-pulse">
                <XCircle className="w-3 h-3 text-red-500" />
                <span>DEFAULTED</span>
              </span>
            );
          }

          return (
            <div
              key={user.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${cardBg}`}
            >
              <div className="relative shrink-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className={`w-11 h-11 rounded-full object-cover ring-2 ${ringColor}`}
                />
                {stats.status === 'defaulted' && (
                  <span className="absolute -bottom-1 -right-1 text-xs">💀</span>
                )}
                {stats.status === 'verified' && (
                  <span className="absolute -bottom-1 -right-1 text-xs">🔥</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-zinc-100 truncate">
                    {user.name.split(' ')[0]}
                  </h4>
                  {stats.isDoubleDown && (
                    <span className="text-[9px] px-1 py-0.2 bg-red-950 border border-red-800 text-red-400 font-bold rounded">
                      2X
                    </span>
                  )}
                </div>
                <div className="mt-0.5">{statusBadge}</div>
                <div className="text-[10px] font-mono text-zinc-400 mt-1">
                  Week: {stats.daysVerifiedThisWeek}/{activeGroup.targetDaysPerWeek} days
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

