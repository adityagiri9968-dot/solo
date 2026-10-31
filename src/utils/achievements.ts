/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Achievement } from '../types/system';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-first-awakening',
    title: 'First Awakening',
    titleHindi: 'प्रथम जागरण (First Awakening)',
    description: 'Complete your first real-life quest. The journey of thousands of reps begins with one step.',
    icon: 'Sparkles',
    category: 'general',
    unlocked: false,
    xpBonus: 50,
    condition: (_stats, history, quests) => {
      const todayDone = quests.some((q) => q.completed);
      const pastDone = Object.values(history).some((d) => d.completedQuestIds.length > 0);
      return todayDone || pastDone;
    },
  },
  {
    id: 'ach-streak-7',
    title: 'Iron Will (7-Day Streak)',
    titleHindi: 'लौह संकल्प (7-Day Streak)',
    description: 'Maintain 7 consecutive days of discipline without a single break.',
    icon: 'Flame',
    category: 'discipline',
    unlocked: false,
    xpBonus: 100,
    condition: (stats) => stats.currentStreak >= 7 || stats.longestStreak >= 7,
  },
  {
    id: 'ach-streak-30',
    title: 'Monarch of Discipline (30-Day Streak)',
    titleHindi: 'अनुशासन का सम्राट (30-Day Streak)',
    description: 'Forge an unbreakable identity across 30 straight days of dedicated growth.',
    icon: 'Crown',
    category: 'discipline',
    unlocked: false,
    xpBonus: 250,
    condition: (stats) => stats.currentStreak >= 30 || stats.longestStreak >= 30,
  },
  {
    id: 'ach-study-scholar',
    title: 'High-Rank Scholar',
    titleHindi: 'महान शिक्षार्थी (Scholar Hunter)',
    description: 'Complete 10 deep focus study missions.',
    icon: 'BookOpen',
    category: 'study',
    unlocked: false,
    xpBonus: 80,
    condition: (_stats, history, quests) => {
      let count = quests.filter((q) => q.category === 'study' && q.completed).length;
      for (const day of Object.values(history)) {
        count += day.completedQuestIds.filter((id) => id.startsWith('study')).length;
      }
      return count >= 10;
    },
  },
  {
    id: 'ach-workout-iron',
    title: 'Shadow Monarch Physique',
    titleHindi: 'छाया सम्राट शरीर (Workout Titan)',
    description: 'Complete 10 physical training missions.',
    icon: 'Dumbbell',
    category: 'workout',
    unlocked: false,
    xpBonus: 80,
    condition: (_stats, history, quests) => {
      let count = quests.filter((q) => q.category === 'workout' && q.completed).length;
      for (const day of Object.values(history)) {
        count += day.completedQuestIds.filter((id) => id.startsWith('workout')).length;
      }
      return count >= 10;
    },
  },
  {
    id: 'ach-discipline-master',
    title: 'Master of Desires',
    titleHindi: 'इंद्रिय विजय (Master of Desires)',
    description: 'Complete 10 self-control & dopamine detox quests.',
    icon: 'Shield',
    category: 'discipline',
    unlocked: false,
    xpBonus: 90,
    condition: (_stats, history, quests) => {
      let count = quests.filter((q) => q.category === 'discipline' && q.completed).length;
      for (const day of Object.values(history)) {
        count += day.completedQuestIds.filter((id) => id.startsWith('discipline')).length;
      }
      return count >= 10;
    },
  },
  {
    id: 'ach-rank-d',
    title: 'D-Rank Elevation',
    titleHindi: 'डी-रैंक उत्थान (D-Rank Ascent)',
    description: 'Break through the novice threshold and reach Level 6.',
    icon: 'Award',
    category: 'general',
    unlocked: false,
    xpBonus: 100,
    condition: (stats) => stats.level >= 6,
  },
  {
    id: 'ach-rank-c',
    title: 'C-Rank Vanguard',
    titleHindi: 'सी-रैंक कमांडर (C-Rank Vanguard)',
    description: 'Reach Level 11 and awaken commanding authority.',
    icon: 'Zap',
    category: 'general',
    unlocked: false,
    xpBonus: 150,
    condition: (stats) => stats.level >= 11,
  },
  {
    id: 'ach-daily-cleared',
    title: 'Daily Clean Sweep',
    titleHindi: 'दैनिक संपूर्ण विजय (Clean Sweep)',
    description: 'Complete all assigned daily quests in a single day.',
    icon: 'CheckCheck',
    category: 'general',
    unlocked: false,
    xpBonus: 120,
    condition: (_stats, _history, quests) => {
      return quests.length > 0 && quests.every((q) => q.completed);
    },
  },
];
