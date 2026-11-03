export type WorkoutType = 
  | 'Gym'
  | 'Running'
  | 'Calisthenics'
  | 'Swimming'
  | 'Sports'
  | 'HIIT'
  | 'Cycling';

export type PoolType = 'dividend' | 'bounty';

export type Currency = '₹' | '$' | '€' | '£';

export interface WeighInRecord {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  bodyFatPct?: number;
  waistCm?: number;
  notes?: string;
  photoUrl?: string;
  isPrivate: boolean;
}

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  role: 'admin' | 'member';
  streakDays: number;
  streakWeeks: number;
  shieldsAvailable: number;
  shieldActive: boolean; // active for today's protection
  isDoubleDown: boolean; // opted in for 2x stakes/rewards this week
  baselineWeightKg: number;
  currentWeightKg: number;
  targetWeightKg: number;
  baselinePhotoUrl: string;
  currentPhotoUrl: string;
  baselineDate: string;
  currentDate: string;
  bodyFatPctBaseline: number;
  bodyFatPctCurrent: number;
  upiId: string;
  weightHistory: WeighInRecord[];
}

export interface ExifVerification {
  capturedAt: string; // e.g. "Today, 07:15 AM"
  uploadedAt: string; // e.g. "Today, 07:22 AM"
  device: string; // e.g. "iPhone 16 Pro"
  locationTag: string; // e.g. "Gold's Gym Downtown"
  isExifVerified: boolean;
  matchScore: number; // e.g. 98%
}

export interface DisputeRecord {
  userId: string;
  userName: string;
  userAvatar: string;
  reason: string;
  timestamp: string;
}

export interface Post {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userHandle: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // e.g. "2 hours ago"
  workoutType: WorkoutType;
  caption: string;
  imageUrl: string;
  metrics: {
    durationMinutes: number;
    distanceKm?: number;
    calories: number;
    heartRateBpm?: number;
  };
  exifData: ExifVerification;
  vouches: string[]; // array of userIds
  disputes: DisputeRecord[];
  status: 'pending' | 'verified' | 'disputed';
}

export interface GroupMemberCycleStats {
  userId: string;
  daysLoggedThisWeek: number;
  daysVerifiedThisWeek: number;
  missedDays: number;
  isDoubleDown: boolean;
  shieldUsedThisWeek: boolean;
  dailyStatuses: {
    [dayName: string]: 'verified' | 'pending' | 'yet_to_log' | 'defaulted' | 'shielded';
  };
  status: 'verified' | 'pending' | 'yet_to_log' | 'defaulted';
}

export interface Group {
  id: string;
  name: string;
  description: string;
  avatar: string;
  inviteCode: string;
  currency: Currency;
  penaltyPerMissedDay: number;
  targetDaysPerWeek: number;
  poolType: PoolType;
  bountyTotal: number; // accumulated amount if bounty pool
  bountyGoalDescription?: string;
  kickoffDate: string;
  currentCycleStart: string; // e.g. "Oct 27, 2026"
  currentCycleEnd: string; // e.g. "Nov 02, 2026"
  cycleNumber: number;
  daysRemainingInCycle: number;
  memberIds: string[];
  membersStats: { [userId: string]: GroupMemberCycleStats };
}

export interface DebtTransaction {
  id: string;
  cycleId: string;
  groupId: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  toUserId: string;
  toUserName: string;
  toUserAvatar: string;
  amount: number;
  currency: Currency;
  isSettled: boolean;
  settledAt?: string;
  paymentRef?: string;
  paymentMethod?: string;
}

export interface SettlementCycle {
  id: string;
  cycleNumber: number;
  groupId: string;
  startDate: string;
  endDate: string;
  totalPenaltiesCollected: number;
  totalDividendsPaid: number;
  poolType: PoolType;
  transactions: DebtTransaction[];
  status: 'active' | 'settled';
  defaultersCount: number;
  qualifiersCount: number;
}

