/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RankTier = 'E-RANK' | 'D-RANK' | 'C-RANK' | 'B-RANK' | 'A-RANK' | 'S-RANK' | 'NATIONAL LEVEL';

export type QuestCategory = 'study' | 'workout' | 'discipline' | 'custom';

export interface Quest {
  id: string;
  title: string;
  titleHindi?: string;
  description: string;
  category: QuestCategory;
  xpReward: number;
  completed: boolean;
  completedDate?: string; // YYYY-MM-DD
  isCustom?: boolean;
  isPrivate?: boolean;
  interactionType?: 'none' | 'timer' | 'recall' | 'workout_builder';
  timerDurationSeconds?: number;
  recallItems?: string[];
  workoutDetails?: {
    routineName?: string;
    exercises?: Array<{ name: string; sets: string; reps: string }>;
  };
}

export interface PlayerStats {
  name: string;
  hunterTitle: string;
  level: number;
  currentXp: number;
  totalXpEarned: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  hp: number;
  maxHp: number;
  willpower: number;
  maxWillpower: number;
  soundEnabled: boolean;
  quoteIndex: number;
}

export interface SystemNotification {
  id: string;
  type: 'quest_complete' | 'level_up' | 'rank_up' | 'streak_boost' | 'system_alert';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  xpAwarded?: number;
}

export interface Achievement {
  id: string;
  title: string;
  titleHindi?: string;
  description: string;
  icon: string;
  category: QuestCategory | 'general';
  unlocked: boolean;
  unlockedAt?: string;
  xpBonus: number;
  condition: (stats: PlayerStats, questHistory: Record<string, string[]>, quests: Quest[]) => boolean;
}

export interface DailyManualGoal {
  id: string;
  text: string;
  completed: boolean;
  xpReward?: number;
  date: string; // YYYY-MM-DD
  createdAt: number;
}

export interface MitrJournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  content: string;
  mood?: 'victorious' | 'focused' | 'calm' | 'battling' | 'reflective';
  lessonsLearned?: string;
  tomorrowPriority?: string;
  updatedAt: number;
}

export interface DayHistoryRecord {
  date: string; // YYYY-MM-DD
  completedQuestIds: string[];
  xpEarned: number;
  levelAtDay?: number;
  rankAtDay?: string;
  manualGoals?: DailyManualGoal[];
  mitrJournal?: MitrJournalEntry;
  notes?: string;
}

export interface RankInfo {
  tier: RankTier;
  minLevel: number;
  maxLevel: number;
  title: string;
  colorClass: string;
  borderGlow: string;
  bgGlow: string;
  badgeBg: string;
  accentHex: string;
}
