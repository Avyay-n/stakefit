import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type {
  User,
  Group,
  Post,
  DebtTransaction,
  SettlementCycle,
  WeighInRecord,
  WorkoutType,
  PoolType,
  Currency,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_GROUPS,
  INITIAL_POSTS,
  INITIAL_TRANSACTIONS,
  INITIAL_SETTLEMENT_HISTORY,
} from '../data/mockData';
import { calculateCycleSettlement } from '../utils/settlementEngine';
import { supabase } from '../lib/supabase';

interface AppContextType {
  users: User[];
  activeUserId: string;
  activeUser: User;
  groups: Group[];
  activeGroupId: string;
  activeGroup: Group;
  posts: Post[];
  transactions: DebtTransaction[];
  settlementHistory: SettlementCycle[];
  toastMessage: string | null;
  showToast: (msg: string) => void;
  switchActiveUser: (userId: string) => void;
  switchActiveGroup: (groupId: string) => void;
  createPost: (data: {
    workoutType: WorkoutType;
    caption: string;
    imageUrl: string;
    durationMinutes: number;
    distanceKm?: number;
    workoutFocus?: string;
    intensity?: string;
    calories?: number;
    heartRateBpm?: number;
    locationTag?: string;
  }) => void;
  vouchPost: (postId: string) => void;
  disputePost: (postId: string, reason: string) => void;
  createGroup: (data: {
    name: string;
    description: string;
    avatar: string;
    currency: Currency;
    penaltyPerMissedDay: number;
    targetDaysPerWeek: number;
    poolType: PoolType;
    bountyGoalDescription?: string;
  }) => void;
  updateGroupPact: (
    groupId: string,
    pact: Partial<Group>
  ) => void;
  addMemberToGroup: (groupId: string, name: string) => void;
  removeMemberFromGroup: (groupId: string, userId: string) => void;
  toggleDoubleDown: () => void;
  activateStreakShield: () => void;
  addStreakShields: (count: number) => void;
  markTransactionSettled: (
    txId: string,
    paymentRef?: string,
    paymentMethod?: string
  ) => void;
  logWeighIn: (record: Omit<WeighInRecord, 'id'>) => void;
  simulateMidnightCutoff: () => void;
  simulateCycleEnd: () => void;
  resetToMockData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state or use initial seed
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('stakefit_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [activeUserId, setActiveUserId] = useState<string>(() => {
    return localStorage.getItem('stakefit_active_user') || 'user-rahul';
  });

  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem('stakefit_groups');
    return saved ? JSON.parse(saved) : INITIAL_GROUPS;
  });

  const [activeGroupId, setActiveGroupId] = useState<string>(() => {
    return localStorage.getItem('stakefit_active_group') || 'group-iron-titans';
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('stakefit_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [transactions, setTransactions] = useState<DebtTransaction[]>(() => {
    const saved = localStorage.getItem('stakefit_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [settlementHistory, setSettlementHistory] = useState<SettlementCycle[]>(() => {
    const saved = localStorage.getItem('stakefit_settlements');
    return saved ? JSON.parse(saved) : INITIAL_SETTLEMENT_HISTORY;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('stakefit_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('stakefit_active_user', activeUserId);
  }, [activeUserId]);

  useEffect(() => {
    localStorage.setItem('stakefit_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('stakefit_active_group', activeGroupId);
  }, [activeGroupId]);

  useEffect(() => {
    localStorage.setItem('stakefit_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('stakefit_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('stakefit_settlements', JSON.stringify(settlementHistory));
  }, [settlementHistory]);

  // Sync with live Supabase database if configured
  useEffect(() => {
    async function initSupabaseData() {
      if (!supabase) return;
      try {
        const { data: dbProfiles } = await supabase.from('profiles').select('*');
        if (dbProfiles && dbProfiles.length > 0) {
          console.log('✅ Connected to Supabase! Loaded profiles:', dbProfiles.length);
        }
      } catch (err) {
        console.warn('Supabase sync warning:', err);
      }
    }
    initSupabaseData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const activeUser = users.find((u) => u.id === activeUserId) || users[0];
  const activeGroup = groups.find((g) => g.id === activeGroupId) || groups[0];

  const switchActiveUser = (userId: string) => {
    setActiveUserId(userId);
    const u = users.find((x) => x.id === userId);
    showToast(`Switched perspective to ${u?.name || 'User'}`);
  };

  const switchActiveGroup = (groupId: string) => {
    setActiveGroupId(groupId);
    const g = groups.find((x) => x.id === groupId);
    showToast(`Switched group to ${g?.name || 'Group'}`);
  };

  const createPost = (data: {
    workoutType: WorkoutType;
    caption: string;
    imageUrl: string;
    durationMinutes: number;
    distanceKm?: number;
    workoutFocus?: string;
    intensity?: string;
    calories?: number;
    heartRateBpm?: number;
    locationTag?: string;
  }) => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      groupId: activeGroupId,
      userId: activeUser.id,
      userName: activeUser.name,
      userAvatar: activeUser.avatar,
      userHandle: activeUser.handle,
      date: new Date().toISOString().split('T')[0],
      timestamp: 'Just now',
      workoutType: data.workoutType,
      caption: data.caption,
      imageUrl: data.imageUrl,
      metrics: {
        durationMinutes: data.durationMinutes,
        distanceKm: data.distanceKm,
        workoutFocus: data.workoutFocus || (data.workoutType === 'Running' ? 'Outdoor Run' : `${data.workoutType} Session`),
        intensity: data.intensity || 'High Intensity 🔥',
        calories: data.calories || 350,
        heartRateBpm: data.heartRateBpm,
      },
      exifData: {
        capturedAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        uploadedAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        device: 'Verified Camera Live Capture',
        locationTag: data.locationTag || "Gold's Gym - Sector 29",
        isExifVerified: true,
        matchScore: 99,
      },
      vouches: [],
      disputes: [],
      status: 'pending',
    };

    setPosts([newPost, ...posts]);

    // Update group member's logged status
    setGroups((prevGroups) =>
      prevGroups.map((g) => {
        if (g.id !== activeGroupId) return g;
        const currentStats = g.membersStats[activeUser.id] || {
          userId: activeUser.id,
          daysLoggedThisWeek: 0,
          daysVerifiedThisWeek: 0,
          missedDays: 0,
          isDoubleDown: activeUser.isDoubleDown,
          shieldUsedThisWeek: activeUser.shieldActive,
          dailyStatuses: {},
          status: 'pending',
        };

        return {
          ...g,
          membersStats: {
            ...g.membersStats,
            [activeUser.id]: {
              ...currentStats,
              daysLoggedThisWeek: currentStats.daysLoggedThisWeek + 1,
              status: 'pending',
            },
          },
        };
      })
    );

    // Persist to Supabase if available
    if (supabase) {
      supabase
        .from('check_ins')
        .insert({
          group_id: 'b1111111-1111-1111-1111-111111111111',
          user_id: 'a1111111-1111-1111-1111-111111111111',
          workout_type: data.workoutType,
          caption: data.caption,
          image_url: data.imageUrl,
          duration_minutes: data.durationMinutes,
          distance_km: data.distanceKm,
          calories: data.calories,
          heart_rate_bpm: data.heartRateBpm,
          location_tag: data.locationTag || "Gold's Gym - Sector 29",
          status: 'pending',
        })
        .then(() => {
          console.log('✅ Check-in persisted to Supabase database');
        });
    }

    showToast('Check-in submitted! Needs 2 peer vouches to count toward weekly target.');
  };

  const vouchPost = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    if (post.userId === activeUserId) {
      showToast("You cannot vouch for your own check-in!");
      return;
    }

    if (post.vouches.includes(activeUserId)) {
      showToast("You have already vouched for this post.");
      return;
    }

    const updatedVouches = [...post.vouches, activeUserId];
    const willBeVerified = updatedVouches.length >= 2;
    const newStatus = willBeVerified ? 'verified' : post.status;

    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p.id === postId
          ? {
              ...p,
              vouches: updatedVouches,
              status: newStatus,
            }
          : p
      )
    );

    // If verified, update group stats and user streak
    if (willBeVerified) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#22c55e', '#ef4444', '#ffffff'],
      });

      setGroups((prevGroups) =>
        prevGroups.map((g) => {
          if (g.id !== post.groupId) return g;
          const userStats = g.membersStats[post.userId] || {
            userId: post.userId,
            daysLoggedThisWeek: 1,
            daysVerifiedThisWeek: 0,
            missedDays: 0,
            isDoubleDown: false,
            shieldUsedThisWeek: false,
            dailyStatuses: {},
            status: 'pending',
          };

          const newVerified = userStats.daysVerifiedThisWeek + 1;
          const isTargetMet = newVerified >= g.targetDaysPerWeek;

          return {
            ...g,
            membersStats: {
              ...g.membersStats,
              [post.userId]: {
                ...userStats,
                daysVerifiedThisWeek: newVerified,
                status: isTargetMet ? 'verified' : 'pending',
              },
            },
          };
        })
      );

      // Increment streak
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === post.userId
            ? { ...u, streakDays: u.streakDays + 1 }
            : u
        )
      );

      showToast(`Vouch recorded! Post is now VERIFIED ✓ (${updatedVouches.length}/2 vouches)`);
    } else {
      showToast(`Vouched! (${updatedVouches.length}/2 vouches needed)`);
    }
  };

  const disputePost = (postId: string, reason: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    if (post.userId === activeUserId) {
      showToast("You cannot dispute your own post.");
      return;
    }

    const newDispute = {
      userId: activeUser.id,
      userName: activeUser.name,
      userAvatar: activeUser.avatar,
      reason,
      timestamp: 'Just now',
    };

    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p.id === postId
          ? {
              ...p,
              status: 'disputed',
              disputes: [newDispute, ...(p.disputes || [])],
            }
          : p
      )
    );

    // Update group member status
    setGroups((prevGroups) =>
      prevGroups.map((g) => {
        if (g.id !== post.groupId) return g;
        const currentStats = g.membersStats[post.userId];
        if (!currentStats) return g;

        return {
          ...g,
          membersStats: {
            ...g.membersStats,
            [post.userId]: {
              ...currentStats,
              status: 'pending',
            },
          },
        };
      })
    );

    showToast('Post disputed! Flagged for group review.');
  };

  const createGroup = (data: {
    name: string;
    description: string;
    avatar: string;
    currency: Currency;
    penaltyPerMissedDay: number;
    targetDaysPerWeek: number;
    poolType: PoolType;
    bountyGoalDescription?: string;
  }) => {
    const newGroup: Group = {
      id: `group-${Date.now()}`,
      name: data.name,
      description: data.description,
      avatar: data.avatar || '🛡️',
      inviteCode: `PACT-${Math.floor(1000 + Math.random() * 9000)}`,
      currency: data.currency,
      penaltyPerMissedDay: data.penaltyPerMissedDay,
      targetDaysPerWeek: data.targetDaysPerWeek,
      poolType: data.poolType,
      bountyTotal: 0,
      bountyGoalDescription: data.bountyGoalDescription,
      kickoffDate: new Date().toISOString().split('T')[0],
      currentCycleStart: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      currentCycleEnd: new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      cycleNumber: 1,
      daysRemainingInCycle: 7,
      memberIds: [activeUserId, 'user-priya', 'user-marcus'],
      membersStats: {
        [activeUserId]: {
          userId: activeUserId,
          daysLoggedThisWeek: 0,
          daysVerifiedThisWeek: 0,
          missedDays: 0,
          isDoubleDown: false,
          shieldUsedThisWeek: false,
          dailyStatuses: {},
          status: 'yet_to_log',
        },
        'user-priya': {
          userId: 'user-priya',
          daysLoggedThisWeek: 0,
          daysVerifiedThisWeek: 0,
          missedDays: 0,
          isDoubleDown: false,
          shieldUsedThisWeek: false,
          dailyStatuses: {},
          status: 'yet_to_log',
        },
        'user-marcus': {
          userId: 'user-marcus',
          daysLoggedThisWeek: 0,
          daysVerifiedThisWeek: 0,
          missedDays: 0,
          isDoubleDown: false,
          shieldUsedThisWeek: false,
          dailyStatuses: {},
          status: 'yet_to_log',
        },
      },
    };

    setGroups([newGroup, ...groups]);
    setActiveGroupId(newGroup.id);
    showToast(`Pact group "${newGroup.name}" created!`);
  };

  const updateGroupPact = (groupId: string, pact: Partial<Group>) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, ...pact } : g))
    );
    showToast('Group pact settings updated!');
  };

  const addMemberToGroup = (groupId: string, name: string) => {
    const newUserId = `user-${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      name,
      handle: `@${name.toLowerCase().replace(/\s+/g, '')}`,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`,
      role: 'member',
      streakDays: 0,
      streakWeeks: 0,
      shieldsAvailable: 1,
      shieldActive: false,
      isDoubleDown: false,
      baselineWeightKg: 75,
      currentWeightKg: 75,
      targetWeightKg: 72,
      baselinePhotoUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80',
      currentPhotoUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80',
      baselineDate: 'Today',
      currentDate: 'Today',
      bodyFatPctBaseline: 20,
      bodyFatPctCurrent: 20,
      upiId: `${name.toLowerCase().replace(/\s+/g, '')}@upi`,
      weightHistory: [{ id: `w-${Date.now()}`, date: new Date().toISOString().split('T')[0], weightKg: 75, isPrivate: false }],
    };

    setUsers([...users, newUser]);

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          memberIds: [...g.memberIds, newUserId],
          membersStats: {
            ...g.membersStats,
            [newUserId]: {
              userId: newUserId,
              daysLoggedThisWeek: 0,
              daysVerifiedThisWeek: 0,
              missedDays: 0,
              isDoubleDown: false,
              shieldUsedThisWeek: false,
              dailyStatuses: {},
              status: 'yet_to_log',
            },
          },
        };
      })
    );

    showToast(`${name} joined the pact!`);
  };

  const removeMemberFromGroup = (groupId: string, userId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const newStats = { ...g.membersStats };
        delete newStats[userId];
        return {
          ...g,
          memberIds: g.memberIds.filter((id) => id !== userId),
          membersStats: newStats,
        };
      })
    );
    showToast('Member removed from group.');
  };

  const toggleDoubleDown = () => {
    const nextVal = !activeUser.isDoubleDown;
    setUsers((prev) =>
      prev.map((u) => (u.id === activeUserId ? { ...u, isDoubleDown: nextVal } : u))
    );
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== activeGroupId) return g;
        const s = g.membersStats[activeUserId];
        if (!s) return g;
        return {
          ...g,
          membersStats: {
            ...g.membersStats,
            [activeUserId]: { ...s, isDoubleDown: nextVal },
          },
        };
      })
    );

    if (nextVal) {
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.8 },
        colors: ['#dc2626', '#ef4444', '#f59e0b'],
      });
      showToast('🔥 Double Down Active! 2x penalty stake, 2x dividend payout!');
    } else {
      showToast('Double Down disabled. Back to standard 1x stake.');
    }
  };

  const activateStreakShield = () => {
    if (activeUser.shieldsAvailable <= 0) {
      showToast('No Streak Shields available! Maintain a 3-week perfect streak to earn one.');
      return;
    }

    if (activeUser.shieldActive) {
      showToast('Streak Shield is already active for today!');
      return;
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === activeUserId
          ? {
              ...u,
              shieldsAvailable: u.shieldsAvailable - 1,
              shieldActive: true,
            }
          : u
      )
    );

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== activeGroupId) return g;
        const s = g.membersStats[activeUserId];
        if (!s) return g;
        return {
          ...g,
          membersStats: {
            ...g.membersStats,
            [activeUserId]: {
              ...s,
              shieldUsedThisWeek: true,
            },
          },
        };
      })
    );

    showToast('🛡️ Rest / Emergency Shield activated! Today is protected from penalties.');
  };

  const addStreakShields = (count: number) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === activeUserId
          ? {
              ...u,
              shieldsAvailable: u.shieldsAvailable + count,
            }
          : u
      )
    );
  };

  const markTransactionSettled = (
    txId: string,
    paymentRef: string = `TX-${Math.floor(100000 + Math.random() * 900000)}`,
    paymentMethod: string = 'UPI Instant'
  ) => {
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === txId
          ? {
              ...tx,
              isSettled: true,
              settledAt: 'Just now',
              paymentRef,
              paymentMethod,
            }
          : tx
      )
    );

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#ffffff', '#10b981'],
    });

    showToast('Payment settled and recorded in ledger!');
  };

  const logWeighIn = (record: Omit<WeighInRecord, 'id'>) => {
    const newRecord: WeighInRecord = {
      id: `w-${Date.now()}`,
      ...record,
    };

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== activeUserId) return u;
        return {
          ...u,
          currentWeightKg: record.weightKg,
          bodyFatPctCurrent: record.bodyFatPct || u.bodyFatPctCurrent,
          currentPhotoUrl: record.photoUrl || u.currentPhotoUrl,
          weightHistory: [...u.weightHistory, newRecord],
        };
      })
    );

    showToast('Weigh-in & progress logged successfully!');
  };

  // Interactive Simulation 1: Midnight Cutoff
  const simulateMidnightCutoff = () => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== activeGroupId) return g;
        const updatedStats = { ...g.membersStats };

        for (const memberId of g.memberIds) {
          const stats = updatedStats[memberId];
          if (!stats) continue;

          // If member hasn't logged or verified today
          if (stats.status === 'yet_to_log') {
            if (stats.shieldUsedThisWeek) {
              // Shield protected
            } else {
              // Defaulted!
              stats.missedDays = (stats.missedDays || 0) + 1;
              stats.status = 'defaulted';
            }
          }
        }

        return {
          ...g,
          membersStats: updatedStats,
        };
      })
    );

    // Users who defaulted lose their active streak
    setUsers((prev) =>
      prev.map((u) => {
        const stats = activeGroup.membersStats[u.id];
        if (stats && stats.status === 'yet_to_log' && !stats.shieldUsedThisWeek) {
          return { ...u, streakDays: 0 };
        }
        return u;
      })
    );

    showToast('🌙 Midnight Cutoff Triggered! Unverified members moved to the Shame Wall as Defaulted.');
  };

  // Interactive Simulation 2: Sunday End of Cycle Resolution
  const simulateCycleEnd = () => {
    const settlement = calculateCycleSettlement(
      activeGroup,
      users,
      `cycle-${activeGroup.cycleNumber}`
    );

    const newSettlementCycle: SettlementCycle = {
      id: `cycle-${activeGroup.cycleNumber}`,
      cycleNumber: activeGroup.cycleNumber,
      groupId: activeGroup.id,
      startDate: activeGroup.currentCycleStart,
      endDate: activeGroup.currentCycleEnd,
      totalPenaltiesCollected: settlement.totalPenalties,
      totalDividendsPaid: settlement.totalDividends,
      poolType: activeGroup.poolType,
      transactions: settlement.simplifiedTransactions,
      status: 'active',
      defaultersCount: settlement.defaultersCount,
      qualifiersCount: settlement.qualifiersCount,
    };

    setTransactions([...settlement.simplifiedTransactions, ...transactions]);
    setSettlementHistory([newSettlementCycle, ...settlementHistory]);

    // If bounty pool, add to bounty total
    if (activeGroup.poolType === 'bounty') {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === activeGroup.id
            ? { ...g, bountyTotal: g.bountyTotal + settlement.totalPenalties }
            : g
        )
      );
    }

    // Advance cycle number
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== activeGroup.id) return g;
        // reset weekly stats for new week
        const resetStats: { [userId: string]: any } = {};
        for (const mid of g.memberIds) {
          resetStats[mid] = {
            userId: mid,
            daysLoggedThisWeek: 0,
            daysVerifiedThisWeek: 0,
            missedDays: 0,
            isDoubleDown: false,
            shieldUsedThisWeek: false,
            dailyStatuses: {},
            status: 'yet_to_log',
          };
        }

        return {
          ...g,
          cycleNumber: g.cycleNumber + 1,
          currentCycleStart: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          currentCycleEnd: new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          membersStats: resetStats,
        };
      })
    );

    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#ef4444', '#22c55e', '#fbbf24', '#ffffff'],
    });

    showToast(`🏁 Cycle #${activeGroup.cycleNumber} Resolved! Generated Splitwise settlement debts.`);
  };

  const resetToMockData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setActiveUserId('user-rahul');
    setGroups(INITIAL_GROUPS);
    setActiveGroupId('group-iron-titans');
    setPosts(INITIAL_POSTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setSettlementHistory(INITIAL_SETTLEMENT_HISTORY);
    showToast('Reset all data to fresh demo state.');
  };

  return (
    <AppContext.Provider
      value={{
        users,
        activeUserId,
        activeUser,
        groups,
        activeGroupId,
        activeGroup,
        posts,
        transactions,
        settlementHistory,
        toastMessage,
        showToast,
        switchActiveUser,
        switchActiveGroup,
        createPost,
        vouchPost,
        disputePost,
        createGroup,
        updateGroupPact,
        addMemberToGroup,
        removeMemberFromGroup,
        toggleDoubleDown,
        activateStreakShield,
        addStreakShields,
        markTransactionSettled,
        logWeighIn,
        simulateMidnightCutoff,
        simulateCycleEnd,
        resetToMockData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
