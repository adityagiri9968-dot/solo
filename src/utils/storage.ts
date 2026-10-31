/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DailyManualGoal,
  DayHistoryRecord,
  MitrJournalEntry,
  PlayerStats,
  Quest,
  SystemNotification,
} from '../types/system';
import {
  calculateStreak,
  DEFAULT_QUESTS,
  getTodayDateString,
  INITIAL_PLAYER_STATS,
} from './progression';

const STORAGE_KEYS = {
  STATS: 'system_awakening_stats_v1',
  QUESTS: 'system_awakening_quests_v1',
  NOTIFICATIONS: 'system_awakening_notifications_v1',
  HISTORY: 'system_awakening_history_v1',
  LAST_CHECKED_DATE: 'system_awakening_last_date_v1',
  MANUAL_GOALS: 'system_awakening_manual_goals_v1',
  MITR_JOURNAL: 'system_awakening_mitr_journal_v1',
};

export interface StoredAppState {
  stats: PlayerStats;
  quests: Quest[];
  notifications: SystemNotification[];
  history: Record<string, DayHistoryRecord>; // keyed by YYYY-MM-DD
  manualGoals: DailyManualGoal[];
  mitrEntries: Record<string, MitrJournalEntry>; // keyed by YYYY-MM-DD
  isNewDayRolledOver: boolean;
}

/**
 * Load app state from localStorage with safe fallback and automated daily rollover
 */
export function loadAppState(): StoredAppState {
  const today = getTodayDateString();
  let isNewDayRolledOver = false;

  // 1. Load Stats
  let stats: PlayerStats = INITIAL_PLAYER_STATS;
  try {
    const rawStats = localStorage.getItem(STORAGE_KEYS.STATS);
    if (rawStats) {
      stats = { ...INITIAL_PLAYER_STATS, ...JSON.parse(rawStats) };
      // Migrate old default name to Aditya
      if (stats.name === 'Sung Jin-Woo') {
        stats.name = 'Aditya';
      }
    }
  } catch {
    stats = INITIAL_PLAYER_STATS;
  }

  // 2. Load History
  let history: Record<string, DayHistoryRecord> = {};
  try {
    const rawHist = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (rawHist) {
      history = JSON.parse(rawHist);
    }
  } catch {
    history = {};
  }

  // Seed history if empty so graphs look alive from day 1
  if (Object.keys(history).length === 0) {
    history = seedMockRecentHistory();
  }

  // 3. Load Quests
  let quests: Quest[] = DEFAULT_QUESTS;
  try {
    const rawQuests = localStorage.getItem(STORAGE_KEYS.QUESTS);
    if (rawQuests) {
      const parsedQuests: Quest[] = JSON.parse(rawQuests);
      const defaultIds = new Set(DEFAULT_QUESTS.map((q) => q.id));
      const customOnes = parsedQuests.filter((q) => !defaultIds.has(q.id));
      quests = DEFAULT_QUESTS.map((dq) => {
        const existing = parsedQuests.find((q) => q.id === dq.id);
        return existing ? { ...dq, ...existing } : dq;
      }).concat(customOnes);
    }
  } catch {
    quests = DEFAULT_QUESTS;
  }

  // 4. Load Manual Goals
  let manualGoals: DailyManualGoal[] = [];
  try {
    const rawGoals = localStorage.getItem(STORAGE_KEYS.MANUAL_GOALS);
    if (rawGoals) {
      manualGoals = JSON.parse(rawGoals);
    }
  } catch {
    manualGoals = [];
  }

  if (manualGoals.length === 0) {
    manualGoals = [
      {
        id: `goal-init-1`,
        text: 'Drink 3 Liters of Water & Maintain Posture',
        completed: false,
        xpReward: 15,
        date: today,
        createdAt: Date.now(),
      },
      {
        id: `goal-init-2`,
        text: 'Finish Priority Learning Target Before 8:00 PM',
        completed: false,
        xpReward: 20,
        date: today,
        createdAt: Date.now() + 1,
      },
    ];
  }

  // 5. Load Mitr Journal Entries
  let mitrEntries: Record<string, MitrJournalEntry> = {};
  try {
    const rawMitr = localStorage.getItem(STORAGE_KEYS.MITR_JOURNAL);
    if (rawMitr) {
      mitrEntries = JSON.parse(rawMitr);
    }
  } catch {
    mitrEntries = {};
  }

  if (Object.keys(mitrEntries).length === 0) {
    mitrEntries[today] = {
      id: `mitr-${today}`,
      date: today,
      title: 'Day 1: The Matrix Awakes',
      content:
        'Welcome, Hunter Aditya. I am MITR (मित्र) — your inner confidant and personal reflection space. Here, you write without judgment: your daily struggles, micro-victories, and tomorrow’s non-negotiable battle plan. Remember: No excuses. No distractions. Just progress.',
      mood: 'victorious',
      lessonsLearned: 'Consistency in real life builds true Hunter Rank.',
      tomorrowPriority: 'Execute morning focus block with zero phone distractions.',
      updatedAt: Date.now(),
    };
  }

  // 6. Load Notifications
  let notifications: SystemNotification[] = [];
  try {
    const rawNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (rawNotifs) {
      notifications = JSON.parse(rawNotifs);
    }
  } catch {
    notifications = [];
  }

  if (notifications.length === 0) {
    notifications = [
      {
        id: 'init-notif-1',
        type: 'system_alert',
        title: 'SYSTEM AWAKENING ACTIVATED',
        message: 'Hunter Aditya profile initialized. Daily quests, Mitr journal, and manual target systems are online.',
        timestamp: Date.now(),
        read: false,
      },
    ];
  }

  // 7. Daily Rollover check
  const lastActive = stats.lastActiveDate || today;
  if (lastActive !== today) {
    isNewDayRolledOver = true;

    // Archive previous day's data into history record
    const completedYesterdayIds = quests.filter((q) => q.completed).map((q) => q.id);
    const yesterdayGoals = manualGoals.filter((g) => g.date === lastActive);
    const yesterdayMitr = mitrEntries[lastActive];

    const xpYesterday = quests
      .filter((q) => q.completed)
      .reduce((sum, q) => sum + q.xpReward, 0);

    history[lastActive] = {
      date: lastActive,
      completedQuestIds: completedYesterdayIds,
      xpEarned: xpYesterday,
      levelAtDay: stats.level,
      rankAtDay: stats.hunterTitle,
      manualGoals: yesterdayGoals,
      mitrJournal: yesterdayMitr,
    };

    // Check streak
    const streakResult = calculateStreak(lastActive, today, stats.currentStreak, stats.longestStreak);

    // Reset quest completion states for the brand new day
    quests = quests.map((q) => ({
      ...q,
      completed: false,
      completedDate: undefined,
    }));

    stats = {
      ...stats,
      currentStreak: streakResult.newStreak,
      longestStreak: streakResult.newLongestStreak,
      lastActiveDate: today,
      hp: stats.maxHp,
      willpower: stats.maxWillpower,
    };

    notifications.unshift({
      id: `rollover-${Date.now()}`,
      type: 'system_alert',
      title: 'DAILY QUESTS RESET',
      message: streakResult.streakBroken
        ? 'A new dawn rises, Hunter Aditya. The System has refreshed your daily missions and goals. Stand up and rebuild your momentum.'
        : `Daily quests refreshed. Streak maintained: ${stats.currentStreak} Days!`,
      timestamp: Date.now(),
      read: false,
    });
  }

  // Persist updated state
  saveStats(stats);
  saveQuests(quests);
  saveHistory(history);
  saveManualGoals(manualGoals);
  saveMitrEntries(mitrEntries);
  saveNotifications(notifications);

  return {
    stats,
    quests,
    notifications,
    history,
    manualGoals,
    mitrEntries,
    isNewDayRolledOver,
  };
}

export function saveStats(stats: PlayerStats) {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function saveQuests(quests: Quest[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify(quests));
  } catch {
    // ignore
  }
}

export function saveNotifications(notifications: SystemNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications.slice(0, 50)));
  } catch {
    // ignore
  }
}

export function saveHistory(history: Record<string, DayHistoryRecord>) {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

export function saveManualGoals(goals: DailyManualGoal[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.MANUAL_GOALS, JSON.stringify(goals));
  } catch {
    // ignore
  }
}

export function saveMitrEntries(entries: Record<string, MitrJournalEntry>) {
  try {
    localStorage.setItem(STORAGE_KEYS.MITR_JOURNAL, JSON.stringify(entries));
  } catch {
    // ignore
  }
}

/**
 * Hard Reset / Fresh Start (Non-shaming clean slate)
 */
export function clearAllData(): StoredAppState {
  try {
    localStorage.removeItem(STORAGE_KEYS.STATS);
    localStorage.removeItem(STORAGE_KEYS.QUESTS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.MANUAL_GOALS);
    localStorage.removeItem(STORAGE_KEYS.MITR_JOURNAL);
  } catch {
    // ignore
  }
  return loadAppState();
}

/**
 * Seed past 6 days history with believable discipline data so analytics are functional immediately
 */
function seedMockRecentHistory(): Record<string, DayHistoryRecord> {
  const history: Record<string, DayHistoryRecord> = {};
  const today = new Date();
  
  for (let i = 6; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const xpBase = 120 + ((i * 35) % 90);
    history[dateStr] = {
      date: dateStr,
      completedQuestIds: ['study-focus-30', 'workout-daily-routine', 'discipline-no-scroll'],
      xpEarned: xpBase,
      levelAtDay: Math.max(1, Math.floor(1 + (6 - i) / 2)),
      rankAtDay: 'Awakened Novice (ई-रैंक शिकारी)',
      manualGoals: [
        {
          id: `g-past-${i}-1`,
          text: '30 min Deep Focus Without Phone',
          completed: true,
          date: dateStr,
          createdAt: Date.now() - i * 86400000,
        },
        {
          id: `g-past-${i}-2`,
          text: 'Hydration Target Cleared (3 Liters)',
          completed: true,
          date: dateStr,
          createdAt: Date.now() - i * 86400000 + 1000,
        },
      ],
      mitrJournal: {
        id: `mitr-${dateStr}`,
        date: dateStr,
        title: `Hunter's Log: Day -${i}`,
        content: `Day closed with discipline. Overcame early morning inertia and finished the training routine. The mind wanted comfort, but the System demanded progress.`,
        mood: 'focused',
        lessonsLearned: 'Resistance is highest right before you start.',
        tomorrowPriority: 'Hit morning workout early without delays.',
        updatedAt: Date.now() - i * 86400000,
      },
    };
  }
  return history;
}
