import type { Group, User, DebtTransaction } from '../types';

export interface UserCycleCalculation {
  userId: string;
  userName: string;
  userAvatar: string;
  targetDays: number;
  verifiedDays: number;
  missedDays: number;
  isDoubleDown: boolean;
  shieldUsed: boolean;
  penaltyOwed: number;
  shares: number;
  dividendEarned: number;
  netBalance: number; // positive = is owed money, negative = owes money
}

export interface GroupCycleSettlementResult {
  calculations: UserCycleCalculation[];
  totalPenalties: number;
  totalDividends: number;
  qualifiersCount: number;
  defaultersCount: number;
  simplifiedTransactions: DebtTransaction[];
}

/**
 * Calculates net balances and generates Splitwise-style simplified debt transactions
 */
export function calculateCycleSettlement(
  group: Group,
  users: User[],
  cycleId: string = `cycle-${group.cycleNumber}`
): GroupCycleSettlementResult {
  const usersMap = new Map(users.map((u) => [u.id, u]));
  const calculations: UserCycleCalculation[] = [];

  let totalPenalties = 0;
  let totalShares = 0;

  // Step 1: Calculate missed days and penalties for each member
  for (const memberId of group.memberIds) {
    const user = usersMap.get(memberId);
    if (!user) continue;

    const stats = group.membersStats[memberId] || {
      userId: memberId,
      daysLoggedThisWeek: 0,
      daysVerifiedThisWeek: 0,
      missedDays: 0,
      isDoubleDown: user.isDoubleDown,
      shieldUsedThisWeek: user.shieldActive,
      dailyStatuses: {},
      status: 'yet_to_log',
    };

    const targetDays = group.targetDaysPerWeek;
    const verifiedDays = stats.daysVerifiedThisWeek;

    // Check missed days
    let rawMissed = Math.max(0, targetDays - verifiedDays);
    // If shield used, protect 1 missed day
    if (stats.shieldUsedThisWeek && rawMissed > 0) {
      rawMissed = Math.max(0, rawMissed - 1);
    }

    const multiplier = stats.isDoubleDown ? 2 : 1;
    const penaltyOwed = rawMissed * group.penaltyPerMissedDay * multiplier;

    totalPenalties += penaltyOwed;

    // Qualifiers who met 100% of target
    const isQualifier = rawMissed === 0;
    const shares = isQualifier ? (stats.isDoubleDown ? 2 : 1) : 0;
    totalShares += shares;

    calculations.push({
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      targetDays,
      verifiedDays,
      missedDays: rawMissed,
      isDoubleDown: stats.isDoubleDown,
      shieldUsed: stats.shieldUsedThisWeek,
      penaltyOwed,
      shares,
      dividendEarned: 0,
      netBalance: 0,
    });
  }

  // Step 2: Distribute dividend or accumulate bounty
  let totalDividends = 0;
  let qualifiersCount = 0;
  let defaultersCount = 0;

  if (group.poolType === 'dividend') {
    const dividendPerShare = totalShares > 0 ? totalPenalties / totalShares : 0;

    for (const calc of calculations) {
      if (calc.shares > 0) {
        calc.dividendEarned = Math.round(calc.shares * dividendPerShare);
        totalDividends += calc.dividendEarned;
        qualifiersCount++;
      } else if (calc.penaltyOwed > 0) {
        defaultersCount++;
      }
      calc.netBalance = calc.dividendEarned - calc.penaltyOwed;
    }
  } else {
    // Bounty pool mode: defaulters owe to group bounty
    for (const calc of calculations) {
      if (calc.penaltyOwed > 0) {
        calc.netBalance = -calc.penaltyOwed;
        defaultersCount++;
      } else {
        calc.netBalance = 0;
        qualifiersCount++;
      }
    }
  }

  // Step 3: Splitwise Debt Simplification Algorithm
  // Balances > 0 are Creditors; Balances < 0 are Debtors
  interface Party {
    userId: string;
    userName: string;
    userAvatar: string;
    amount: number;
  }

  const creditors: Party[] = [];
  const debtors: Party[] = [];

  for (const calc of calculations) {
    if (calc.netBalance > 0.5) {
      creditors.push({
        userId: calc.userId,
        userName: calc.userName,
        userAvatar: calc.userAvatar,
        amount: calc.netBalance,
      });
    } else if (calc.netBalance < -0.5) {
      debtors.push({
        userId: calc.userId,
        userName: calc.userName,
        userAvatar: calc.userAvatar,
        amount: -calc.netBalance, // make positive for easier arithmetic
      });
    }
  }

  // Greedy match largest debtor with largest creditor
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const simplifiedTransactions: DebtTransaction[] = [];
  let txIndex = 1;

  let cIdx = 0;
  let dIdx = 0;

  while (cIdx < creditors.length && dIdx < debtors.length) {
    const creditor = creditors[cIdx];
    const debtor = debtors[dIdx];

    const matchAmount = Math.min(creditor.amount, debtor.amount);
    const roundedAmount = Math.round(matchAmount);

    if (roundedAmount > 0) {
      simplifiedTransactions.push({
        id: `tx-gen-${cycleId}-${txIndex++}`,
        cycleId,
        groupId: group.id,
        fromUserId: debtor.userId,
        fromUserName: debtor.userName,
        fromUserAvatar: debtor.userAvatar,
        toUserId: creditor.userId,
        toUserName: creditor.userName,
        toUserAvatar: creditor.userAvatar,
        amount: roundedAmount,
        currency: group.currency,
        isSettled: false,
      });
    }

    creditor.amount -= matchAmount;
    debtor.amount -= matchAmount;

    if (creditor.amount < 0.5) cIdx++;
    if (debtor.amount < 0.5) dIdx++;
  }

  return {
    calculations,
    totalPenalties,
    totalDividends,
    qualifiersCount,
    defaultersCount,
    simplifiedTransactions,
  };
}
