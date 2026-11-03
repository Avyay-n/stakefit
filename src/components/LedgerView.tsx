import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateCycleSettlement } from '../utils/settlementEngine';
import type { DebtTransaction } from '../types';
import {
  Receipt,
  Scale,
  CheckCircle2,
  ArrowRight,
  CreditCard,
  History,
  TrendingUp,
  TrendingDown,
  Flame,
  Calendar,
} from 'lucide-react';

interface LedgerViewProps {
  onSettleTransaction: (transaction: DebtTransaction) => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({ onSettleTransaction }) => {
  const {
    activeGroup,
    users,
    activeUser,
    activeUserId,
    transactions,
    settlementHistory,
  } = useApp();

  const [activeLedgerTab, setActiveLedgerTab] = useState<'current' | 'history'>('current');

  // Compute live current cycle settlement
  const currentSettlement = calculateCycleSettlement(activeGroup, users);

  // Find active user calculation
  const myCalc = currentSettlement.calculations.find((c) => c.userId === activeUserId);
  const myNetBalance = myCalc ? myCalc.netBalance : 0;

  // Filter transactions for this active group
  const groupTransactions = transactions.filter((tx) => tx.groupId === activeGroup.id);
  const pendingTransactions = groupTransactions.filter((tx) => !tx.isSettled);
  const settledTransactions = groupTransactions.filter((tx) => tx.isSettled);

  return (
    <div className="space-y-6">
      {/* Top Pact Rules Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272a] shadow-lg">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Pact Rule Model
          </div>
          <div className="text-lg font-black text-white mt-1 capitalize flex items-center gap-1.5">
            <span>{activeGroup.poolType === 'dividend' ? 'Dividend Payout' : 'Group Bounty'}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-mono">
              {activeGroup.poolType === 'dividend' ? 'Winner Split' : 'Shared Escrow'}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {activeGroup.poolType === 'dividend'
              ? 'Missed day penalties split among 100% achievers'
              : `Penalties pool into ${activeGroup.bountyGoalDescription || 'group feast budget'}`}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272a] shadow-lg">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Daily Forfeit Stake
          </div>
          <div className="text-lg font-black text-white font-mono mt-1 text-red-400">
            {activeGroup.currency}{activeGroup.penaltyPerMissedDay}
            <span className="text-xs font-normal text-zinc-400 font-sans"> / missed day</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Target: {activeGroup.targetDaysPerWeek} verified days / week
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272a] shadow-lg">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Current Week Pool
          </div>
          <div className="text-lg font-black text-white font-mono mt-1 text-amber-400">
            {activeGroup.currency}
            {activeGroup.poolType === 'dividend'
              ? currentSettlement.totalPenalties
              : activeGroup.bountyTotal + currentSettlement.totalPenalties}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 font-mono">
            {currentSettlement.defaultersCount} defaulters • {currentSettlement.qualifiersCount} qualifiers
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272a] shadow-lg">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Active Cycle #{activeGroup.cycleNumber}
          </div>
          <div className="text-xs font-bold text-zinc-200 mt-1">
            {activeGroup.currentCycleStart} – {activeGroup.currentCycleEnd}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-red-400 font-mono mt-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>Resolves Sunday 11:59 PM</span>
          </div>
        </div>
      </div>

      {/* Personal Net Balance Hero Card */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          myNetBalance > 0
            ? 'bg-gradient-to-r from-emerald-950/40 to-[#121214] border-emerald-500/40 glow-green'
            : myNetBalance < 0
            ? 'bg-gradient-to-r from-red-950/40 to-[#121214] border-red-500/40 glow-red'
            : 'bg-[#121214] border-[#27272a]'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={activeUser.avatar}
              alt={activeUser.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-red-500"
            />
            <div>
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Your Running Cycle Balance
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono mt-0.5 flex items-center gap-2">
                {myNetBalance > 0 ? (
                  <span className="text-emerald-400 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6" />
                    <span>+{activeGroup.currency}{myNetBalance}</span>
                  </span>
                ) : myNetBalance < 0 ? (
                  <span className="text-red-400 flex items-center gap-2">
                    <TrendingDown className="w-6 h-6" />
                    <span>-{activeGroup.currency}{Math.abs(myNetBalance)}</span>
                  </span>
                ) : (
                  <span className="text-zinc-200">
                    {activeGroup.currency}0 (Even)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xs font-medium text-zinc-300">
              {myNetBalance > 0
                ? '🎉 You have met your commitment and will receive dividend payout!'
                : myNetBalance < 0
                ? '⚠️ You have missed days this week. Settle debt to maintain good standing.'
                : '✓ On track! Complete remaining sessions to earn dividend shares.'}
            </div>
            {myCalc?.isDoubleDown && (
              <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-mono font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800">
                <Flame className="w-3 h-3 fill-red-400" />
                2X Double Down Active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs: Current Week Live Matrix vs History */}
      <div className="flex items-center gap-2 border-b border-[#27272a] pb-2">
        <button
          onClick={() => setActiveLedgerTab('current')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeLedgerTab === 'current'
              ? 'bg-red-600 text-white glow-red shadow-lg'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#18181b]'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Current Week Balance Sheet</span>
        </button>

        <button
          onClick={() => setActiveLedgerTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeLedgerTab === 'history'
              ? 'bg-red-600 text-white glow-red shadow-lg'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#18181b]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Past Cycle Settlements ({settlementHistory.length})</span>
        </button>
      </div>

      {activeLedgerTab === 'current' ? (
        <div className="space-y-6">
          {/* Member Balance Breakdown Table */}
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 sm:p-5 border-b border-[#27272a] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Member Performance & Forfeit Breakdown
                </h3>
                <p className="text-xs text-zinc-400">
                  Real-time ledger computed based on verified workout check-ins
                </p>
              </div>
              <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-lg">
                Cycle #{activeGroup.cycleNumber}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#18181b] text-zinc-400 uppercase text-[10px] tracking-wider border-b border-[#27272a]">
                  <tr>
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-3 text-center">Target</th>
                    <th className="py-3 px-3 text-center">Verified</th>
                    <th className="py-3 px-3 text-center">Missed</th>
                    <th className="py-3 px-3 text-center">Multiplier</th>
                    <th className="py-3 px-3 text-right">Gross Penalty</th>
                    <th className="py-3 px-3 text-right">Dividend Share</th>
                    <th className="py-3 px-4 text-right">Net Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a]">
                  {currentSettlement.calculations.map((row) => {
                    const isMe = row.userId === activeUserId;
                    return (
                      <tr
                        key={row.userId}
                        className={`transition-colors ${
                          isMe ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-[#18181b]/50'
                        }`}
                      >
                        <td className="py-3 px-4 flex items-center gap-2.5">
                          <img
                            src={row.userAvatar}
                            alt={row.userName}
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-700"
                          />
                          <div className="truncate">
                            <span className="font-bold text-white">{row.userName}</span>
                            {isMe && (
                              <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono">
                                YOU
                              </span>
                            )}
                            {row.shieldUsed && (
                              <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-blue-950 text-blue-400 border border-blue-800">
                                Shielded
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center font-mono text-zinc-400">
                          {row.targetDays}d
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-bold text-emerald-400">
                          {row.verifiedDays}d
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-bold">
                          {row.missedDays > 0 ? (
                            <span className="text-red-400">{row.missedDays}d</span>
                          ) : (
                            <span className="text-zinc-500">0</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center font-mono">
                          {row.isDoubleDown ? (
                            <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 text-[10px] font-bold">
                              2X
                            </span>
                          ) : (
                            <span className="text-zinc-500 text-[10px]">1X</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right font-mono text-zinc-400">
                          {row.penaltyOwed > 0 ? (
                            <span className="text-red-400 font-semibold">
                              {activeGroup.currency}{row.penaltyOwed}
                            </span>
                          ) : (
                            <span>{activeGroup.currency}0</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right font-mono text-zinc-400">
                          {row.dividendEarned > 0 ? (
                            <span className="text-emerald-400 font-semibold">
                              +{activeGroup.currency}{row.dividendEarned}
                            </span>
                          ) : (
                            <span>{activeGroup.currency}0</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold">
                          {row.netBalance > 0 ? (
                            <span className="text-emerald-400">
                              +{activeGroup.currency}{row.netBalance}
                            </span>
                          ) : row.netBalance < 0 ? (
                            <span className="text-red-400">
                              -{activeGroup.currency}{Math.abs(row.netBalance)}
                            </span>
                          ) : (
                            <span className="text-zinc-400">{activeGroup.currency}0</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Splitwise-Style Debt Simplification Matrix */}
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-red-500" />
                  <span>Splitwise-Style Minimized Debt Settlement</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Greedy debt optimization algorithm matches net debtors to net creditors to minimize peer payments.
                </p>
              </div>

              <div className="text-[11px] font-mono text-zinc-400 bg-[#18181b] px-3 py-1 rounded-lg border border-[#27272a]">
                {pendingTransactions.length} Pending • {settledTransactions.length} Settled
              </div>
            </div>

            {/* List of Simplified Transactions */}
            {groupTransactions.length === 0 ? (
              <div className="p-8 text-center bg-[#18181b]/50 border border-dashed border-[#27272a] rounded-xl text-zinc-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <div className="text-sm font-semibold text-white">No Pending Debts in Current Cycle</div>
                <div className="text-xs text-zinc-500 mt-1">
                  All active members are hitting their weekly targets or debts have already been settled!
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {groupTransactions.map((tx) => {
                  const isDebtor = tx.fromUserId === activeUserId;
                  const isCreditor = tx.toUserId === activeUserId;

                  return (
                    <div
                      key={tx.id}
                      className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        tx.isSettled
                          ? 'bg-[#18181b]/40 border-zinc-800 opacity-70'
                          : isDebtor
                          ? 'bg-red-950/20 border-red-500/40 glow-red'
                          : isCreditor
                          ? 'bg-emerald-950/20 border-emerald-500/40 glow-green'
                          : 'bg-[#18181b] border-[#27272a]'
                      }`}
                    >
                      {/* Left: Parties */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={tx.fromUserAvatar}
                          alt={tx.fromUserName}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-red-500/50"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                            <span>{tx.fromUserName}</span>
                            <ArrowRight className="w-3 h-3 text-zinc-500 shrink-0" />
                            <span>{tx.toUserName}</span>
                          </div>
                          <div className="text-[11px] font-mono text-zinc-400">
                            {tx.isSettled
                              ? `Settled on ${tx.settledAt}`
                              : isDebtor
                              ? 'You owe this debt'
                              : isCreditor
                              ? 'You will receive this payout'
                              : 'Pending peer payment'}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Settle CTA */}
                      <div className="text-right shrink-0">
                        <div className="text-sm font-black font-mono text-white mb-1">
                          {tx.currency}{tx.amount}
                        </div>

                        {tx.isSettled ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Settled</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => onSettleTransaction(tx)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs font-bold transition-all shadow-md glow-red"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Settle Up</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* History Archive Tab */
        <div className="space-y-4">
          {settlementHistory.map((hist) => (
            <div
              key={hist.id}
              className="bg-[#121214] border border-[#27272a] rounded-2xl p-5 shadow-xl space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#27272a] pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-zinc-800 text-zinc-300">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Settlement Cycle #{hist.cycleNumber}
                    </h4>
                    <p className="text-xs text-zinc-400">
                      {hist.startDate} – {hist.endDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-zinc-400">
                    Collected: <strong className="text-white">{activeGroup.currency}{hist.totalPenaltiesCollected}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase text-[10px]">
                    {hist.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {hist.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#18181b] border border-[#27272a] text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{tx.fromUserName}</span>
                      <ArrowRight className="w-3 h-3 text-zinc-500" />
                      <span className="font-semibold text-white">{tx.toUserName}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="font-bold text-white">{tx.currency}{tx.amount}</span>
                      <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Settled ({tx.paymentRef || 'Ref Verified'})</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
