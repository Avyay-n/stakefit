import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Clock, XCircle, ShieldCheck } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const { activeGroup, users } = useApp();
  const usersMap = new Map(users.map((u) => [u.id, u]));

  return (
    <div className="w-full bg-[#121214] border border-[#27272a] rounded-3xl p-5 shadow-xl">
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
          <span>Today's Squad Roll Call</span>
          <span className="text-[10px] text-red-400 font-mono font-black px-2 py-0.5 rounded-full bg-red-950/60 border border-red-800">
            11:59 PM CUTOFF
          </span>
        </span>
        <div className="flex items-center gap-2.5 text-[10px] font-mono font-black text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm" />
            <span className="text-zinc-300">Verified</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm" />
            <span className="text-zinc-300">Review</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-sm" />
            <span className="text-red-400">Defaulted</span>
          </span>
        </div>
      </div>

      {/* Sleek horizontal avatars scroll */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
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

          let ringColor = 'ring-zinc-700';
          let badgeIcon = <Clock className="w-2.5 h-2.5 text-zinc-400" />;
          let label = 'Pending';
          let textColor = 'text-zinc-400';
          let cardBg = 'bg-[#18181b] border-zinc-800';

          if (stats.shieldUsedThisWeek) {
            ringColor = 'ring-blue-500';
            badgeIcon = <ShieldCheck className="w-2.5 h-2.5 text-blue-400" />;
            label = 'Shielded';
            textColor = 'text-blue-400 font-bold';
            cardBg = 'bg-blue-950/40 border-blue-800/60';
          } else if (stats.status === 'verified') {
            ringColor = 'ring-emerald-500 shadow-md shadow-emerald-950/40';
            badgeIcon = <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />;
            label = 'Verified ✓';
            textColor = 'text-emerald-400 font-bold';
            cardBg = 'bg-emerald-950/30 border-emerald-800/50';
          } else if (stats.status === 'pending') {
            ringColor = 'ring-amber-500 animate-pulse';
            badgeIcon = <Clock className="w-2.5 h-2.5 text-amber-400" />;
            label = 'Reviewing';
            textColor = 'text-amber-400 font-bold';
            cardBg = 'bg-amber-950/30 border-amber-800/50';
          } else if (stats.status === 'defaulted') {
            ringColor = 'ring-red-500 shadow-md shadow-red-950/50 animate-pulse';
            badgeIcon = <XCircle className="w-2.5 h-2.5 text-white" />;
            label = 'Defaulted';
            textColor = 'text-white font-black';
            cardBg = 'bg-red-600 border-red-500 text-white shadow-md';
          }

          return (
            <div
              key={user.id}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border shrink-0 transition-all ${cardBg}`}
            >
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className={`w-8 h-8 rounded-full object-cover ring-2 ${ringColor}`}
                />
                {stats.status === 'defaulted' && (
                  <span className="absolute -bottom-1 -right-1 text-[10px]">💀</span>
                )}
                {stats.status === 'verified' && (
                  <span className="absolute -bottom-1 -right-1 text-[10px]">🔥</span>
                )}
              </div>
              <div className="text-left">
                <div className="text-xs font-black truncate max-w-[85px] text-white">
                  {user.name.split(' ')[0]}
                </div>
                <div className={`text-[10px] font-bold flex items-center gap-1 ${textColor}`}>
                  {badgeIcon}
                  <span>{label}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
