/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlayerStats, Quest, RankInfo, RankTier } from '../types/system';

export const RANK_TIERS: RankInfo[] = [
  {
    tier: 'E-RANK',
    minLevel: 1,
    maxLevel: 5,
    title: 'Awakened Novice (ई-रैंक शिकारी)',
    colorClass: 'text-cyan-400',
    borderGlow: 'border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]',
    bgGlow: 'from-cyan-950/30 to-blue-950/20',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    accentHex: '#06b6d4',
  },
  {
    tier: 'D-RANK',
    minLevel: 6,
    maxLevel: 10,
    title: 'D-Rank Striker (डी-रैंक योद्धा)',
    colorClass: 'text-blue-400',
    borderGlow: 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    bgGlow: 'from-blue-950/40 to-sky-950/20',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    accentHex: '#3b82f6',
  },
  {
    tier: 'C-RANK',
    minLevel: 11,
    maxLevel: 20,
    title: 'C-Rank Vanguard (सी-रैंक कमांडर)',
    colorClass: 'text-indigo-400',
    borderGlow: 'border-indigo-500/60 shadow-[0_0_25px_rgba(99,102,241,0.35)]',
    bgGlow: 'from-indigo-950/40 to-blue-950/30',
    badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    accentHex: '#6366f1',
  },
  {
    tier: 'B-RANK',
    minLevel: 21,
    maxLevel: 35,
    title: 'B-Rank Shadow Elite (बी-रैंक अभिजात्य)',
    colorClass: 'text-purple-400',
    borderGlow: 'border-purple-500/60 shadow-[0_0_30px_rgba(168,85,247,0.35)]',
    bgGlow: 'from-purple-950/40 to-indigo-950/30',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    accentHex: '#a855f7',
  },
  {
    tier: 'A-RANK',
    minLevel: 36,
    maxLevel: 50,
    title: 'A-Rank High Monarch (ए-रैंक महानायक)',
    colorClass: 'text-fuchsia-400',
    borderGlow: 'border-fuchsia-500/70 shadow-[0_0_35px_rgba(217,70,239,0.4)]',
    bgGlow: 'from-fuchsia-950/40 to-purple-950/30',
    badgeBg: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/50',
    accentHex: '#d946ef',
  },
  {
    tier: 'S-RANK',
    minLevel: 51,
    maxLevel: 75,
    title: 'S-Rank Shadow Monarch (एस-रैंक छाया सम्राट)',
    colorClass: 'text-amber-400',
    borderGlow: 'border-amber-500/80 shadow-[0_0_40px_rgba(245,158,11,0.45)]',
    bgGlow: 'from-amber-950/40 to-purple-950/40',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
    accentHex: '#f59e0b',
  },
  {
    tier: 'NATIONAL LEVEL',
    minLevel: 76,
    maxLevel: 999,
    title: 'National Level Authority (राष्ट्रीय स्तर महासत्ता)',
    colorClass: 'text-rose-400',
    borderGlow: 'border-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.6)] animate-pulse',
    bgGlow: 'from-rose-950/50 via-purple-950/40 to-blue-950/50',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/60',
    accentHex: '#f43f5e',
  },
];

/**
 * Get rank details based on level
 */
export function getRankForLevel(level: number): RankInfo {
  const rank = RANK_TIERS.find((r) => level >= r.minLevel && level <= r.maxLevel);
  return rank || RANK_TIERS[RANK_TIERS.length - 1];
}

/**
 * Calculate XP required to clear the current level
 * Smooth scaling: early levels take ~100-250 XP (1-2 days of missions),
 * higher levels scale gracefully.
 */
export function getXpRequiredForLevel(level: number): number {
  if (level <= 1) return 100;
  return Math.floor(100 + (level - 1) * 35 + Math.pow(level - 1, 1.35) * 15);
}

export interface AddXpResult {
  updatedStats: PlayerStats;
  leveledUp: boolean;
  levelsGained: number;
  oldLevel: number;
  newLevel: number;
  oldRank: RankTier;
  newRank: RankTier;
  rankPromoted: boolean;
}

/**
 * Pure function to calculate new player stats after earning XP.
 * Handles multiple level-ups if large XP is awarded.
 */
export function addXp(stats: PlayerStats, xpGained: number): AddXpResult {
  if (xpGained <= 0) {
    const currentRank = getRankForLevel(stats.level).tier;
    return {
      updatedStats: { ...stats },
      leveledUp: false,
      levelsGained: 0,
      oldLevel: stats.level,
      newLevel: stats.level,
      oldRank: currentRank,
      newRank: currentRank,
      rankPromoted: false,
    };
  }

  const oldLevel = stats.level;
  const oldRank = getRankForLevel(oldLevel).tier;
  let level = stats.level;
  let currentXp = stats.currentXp + xpGained;
  const totalXpEarned = stats.totalXpEarned + xpGained;

  let reqXp = getXpRequiredForLevel(level);
  while (currentXp >= reqXp) {
    currentXp -= reqXp;
    level += 1;
    reqXp = getXpRequiredForLevel(level);
  }

  const newRank = getRankForLevel(level).tier;
  const leveledUp = level > oldLevel;
  const rankPromoted = newRank !== oldRank;

  // Max HP grows with level
  const maxHp = 100 + level * 5;
  const hp = Math.min(maxHp, stats.hp + (leveledUp ? 20 : 5));

  const updatedStats: PlayerStats = {
    ...stats,
    level,
    currentXp,
    totalXpEarned,
    maxHp,
    hp,
    hunterTitle: getRankForLevel(level).title,
  };

  return {
    updatedStats,
    leveledUp,
    levelsGained: level - oldLevel,
    oldLevel,
    newLevel: level,
    oldRank,
    newRank,
    rankPromoted,
  };
}

/**
 * Streak logic:
 * - If last active date is yesterday: increment streak
 * - If last active date is today: keep current streak
 * - If last active date was > 1 day ago: reset streak to 1
 * - If last active date is empty (first ever): set streak to 1
 */
export function calculateStreak(
  lastActiveDate: string,
  todayStr: string,
  currentStreak: number,
  longestStreak: number
): { newStreak: number; newLongestStreak: number; streakBroken: boolean; streakIncremented: boolean } {
  if (!lastActiveDate) {
    return {
      newStreak: 1,
      newLongestStreak: Math.max(longestStreak, 1),
      streakBroken: false,
      streakIncremented: true,
    };
  }

  if (lastActiveDate === todayStr) {
    return {
      newStreak: currentStreak,
      newLongestStreak: longestStreak,
      streakBroken: false,
      streakIncremented: false,
    };
  }

  const lastDate = new Date(lastActiveDate + 'T00:00:00');
  const today = new Date(todayStr + 'T00:00:00');
  const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    const updated = currentStreak + 1;
    return {
      newStreak: updated,
      newLongestStreak: Math.max(longestStreak, updated),
      streakBroken: false,
      streakIncremented: true,
    };
  } else if (diffDays > 1) {
    // Missed day(s) - compassionate reset
    return {
      newStreak: 1,
      newLongestStreak: longestStreak,
      streakBroken: true,
      streakIncremented: false,
    };
  }

  return {
    newStreak: currentStreak,
    newLongestStreak: longestStreak,
    streakBroken: false,
    streakIncremented: false,
  };
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const DEFAULT_QUESTS: Quest[] = [
  // Study Quests
  {
    id: 'study-focus-30',
    title: '30 Minutes Uninterrupted Study',
    titleHindi: '30 मिनट बिना व्यवधान पढ़ाई',
    description: 'Deep work focus block without phone, tabs, or interruptions. Enter the flow state.',
    category: 'study',
    xpReward: 50,
    completed: false,
    interactionType: 'timer',
    timerDurationSeconds: 30 * 60,
  },
  {
    id: 'study-recall-5',
    title: 'Close Book & Recall 5 Key Insights',
    titleHindi: 'किताब बंद करके 5 बातें याद करना',
    description: 'Active recall drill. Test memory retention immediately after learning without glancing back.',
    category: 'study',
    xpReward: 40,
    completed: false,
    interactionType: 'recall',
    recallItems: ['', '', '', '', ''],
  },
  {
    id: 'study-night-revision',
    title: '5-Minute Night Revision',
    titleHindi: 'रात को 5 मिनट Revision',
    description: 'Quick mental review before sleeping to consolidate neural memory synapses.',
    category: 'study',
    xpReward: 30,
    completed: false,
    interactionType: 'timer',
    timerDurationSeconds: 5 * 60,
  },

  // Workout Quests
  {
    id: 'workout-daily-routine',
    title: 'Daily Workout',
    titleHindi: 'दैनिक कसरत (Daily Workout)',
    description: 'Strength training, calisthenics, gym, or bodyweight exercises customized to your capacity.',
    category: 'workout',
    xpReward: 50,
    completed: false,
    interactionType: 'workout_builder',
    workoutDetails: {
      routineName: 'Hunter Physical Conditioning',
      exercises: [
        { name: 'Push-ups', sets: '3', reps: '15' },
        { name: 'Squats', sets: '3', reps: '20' },
        { name: 'Plank', sets: '3', reps: '45s' },
      ],
    },
  },
  {
    id: 'workout-walk-10',
    title: '10-Minute Brisk Walk',
    titleHindi: '10 मिनट Walk',
    description: 'Outdoor or tread walk to clear mental fog and trigger aerobic oxygen flow.',
    category: 'workout',
    xpReward: 20,
    completed: false,
    interactionType: 'timer',
    timerDurationSeconds: 10 * 60,
  },
  {
    id: 'workout-stretching',
    title: 'Mobility & Stretching',
    titleHindi: 'Stretching व गतिशीलता',
    description: 'Full-body joint rotations, hamstring release, and spine alignment for recovery.',
    category: 'workout',
    xpReward: 20,
    completed: false,
    interactionType: 'timer',
    timerDurationSeconds: 7 * 60,
  },

  // Discipline Quests
  {
    id: 'discipline-no-scroll',
    title: 'Avoid Unnecessary Scrolling',
    titleHindi: 'अनावश्यक Scrolling से बचना',
    description: 'Keep doomscrolling and short-form video dopamine traps strictly at zero.',
    category: 'discipline',
    xpReward: 30,
    completed: false,
    interactionType: 'none',
  },
  {
    id: 'discipline-no-porn',
    title: 'Clean Mind: Zero Pornography',
    titleHindi: 'Pornography से पूर्ण दूरी',
    description: 'Reset dopamine baseline and protect mental clarity. Private, non-shaming discipline.',
    category: 'discipline',
    xpReward: 50,
    completed: false,
    isPrivate: true,
    interactionType: 'none',
  },
  {
    id: 'discipline-self-control',
    title: 'Personal Self-Control Goal',
    titleHindi: 'व्यक्तिगत आत्म-नियंत्रण लक्ष्य',
    description: 'Your chosen daily willpower mastery (e.g. no junk food, on-time bedtime, no masturbation challenge).',
    category: 'discipline',
    xpReward: 30,
    completed: false,
    isPrivate: true,
    interactionType: 'none',
  },
];

export const INITIAL_PLAYER_STATS: PlayerStats = {
  name: 'Aditya',
  hunterTitle: 'Awakened Novice (ई-रैंक शिकारी)',
  level: 1,
  currentXp: 0,
  totalXpEarned: 0,
  currentStreak: 1,
  longestStreak: 1,
  lastActiveDate: getTodayDateString(),
  hp: 100,
  maxHp: 100,
  willpower: 100,
  maxWillpower: 100,
  soundEnabled: true,
  quoteIndex: 0,
};

export const MOTIVATIONAL_SYSTEM_QUOTES = [
  'NO EXCUSES. NO DISTRACTIONS. JUST PROGRESS.',
  'THE WEAKEST HUNTER BECOMES THE STRONGEST THROUGH RELENTLESS DAILY REPETITIONS.',
  'YOU DO NOT RISE TO THE LEVEL OF YOUR GOALS, YOU FALL TO THE LEVEL OF YOUR SYSTEMS.',
  'THE SYSTEM DOES NOT BARGAIN. COMPLETE YOUR DAILY MISSIONS OR FALL BEHIND.',
  'EVERY REP, EVERY STUDY MINUTE, EVERY RESISTED IMPULSE ADDS TO YOUR POWER LEVEL.',
  'PAIN IS WEAKNESS LEAVING THE BODY. TRANSCEND YOUR OLD LIMITS TODAY.',
  'A TRUE HUNTER ACCEPTS DEFEAT ONLY AS DATA FOR TOMORROW’S EVOLUTION.',
];
