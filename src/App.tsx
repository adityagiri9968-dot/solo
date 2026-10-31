/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  loadAppState,
  saveStats,
  saveQuests,
  saveNotifications,
  saveHistory,
  saveManualGoals,
  saveMitrEntries,
  clearAllData,
} from './utils/storage';
import {
  addXp,
  AddXpResult,
  getTodayDateString,
} from './utils/progression';
import { sound } from './utils/audio';
import { INITIAL_ACHIEVEMENTS } from './utils/achievements';
import {
  Achievement,
  DailyManualGoal,
  DayHistoryRecord,
  MitrJournalEntry,
  PlayerStats,
  Quest,
  SystemNotification,
} from './types/system';

import { SystemHeader, AppTab } from './components/SystemHeader';
import { PlayerDashboard } from './components/PlayerDashboard';
import { QuestList } from './components/QuestList';
import { DailyManualGoals } from './components/DailyManualGoals';
import { MitrJournal } from './components/MitrJournal';
import { RecordsView } from './components/RecordsView';
import { AnalyticsView } from './components/AnalyticsView';
import { AchievementsView } from './components/AchievementsView';
import { InteractiveStudyTimerModal } from './components/InteractiveStudyTimerModal';
import { InteractiveRecallModal } from './components/InteractiveRecallModal';
import { InteractiveWorkoutModal } from './components/InteractiveWorkoutModal';
import { AddCustomQuestModal } from './components/AddCustomQuestModal';
import { LevelUpModal } from './components/LevelUpModal';
import { SystemNotificationDrawer } from './components/SystemNotificationDrawer';
import { SettingsModal } from './components/SettingsModal';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [stats, setStats] = useState<PlayerStats>(() => loadAppState().stats);
  const [quests, setQuests] = useState<Quest[]>(() => loadAppState().quests);
  const [notifications, setNotifications] = useState<SystemNotification[]>(
    () => loadAppState().notifications
  );
  const [history, setHistory] = useState<Record<string, DayHistoryRecord>>(
    () => loadAppState().history
  );
  const [manualGoals, setManualGoals] = useState<DailyManualGoal[]>(
    () => loadAppState().manualGoals
  );
  const [mitrEntries, setMitrEntries] = useState<Record<string, MitrJournalEntry>>(
    () => loadAppState().mitrEntries
  );
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);

  const [currentTab, setCurrentTab] = useState<AppTab>('quests');

  // Modals & Drawers
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddCustomQuestOpen, setIsAddCustomQuestOpen] = useState(false);
  const [activeTimerQuest, setActiveTimerQuest] = useState<Quest | null>(null);
  const [activeRecallQuest, setActiveRecallQuest] = useState<Quest | null>(null);
  const [activeWorkoutQuest, setActiveWorkoutQuest] = useState<Quest | null>(null);
  const [activeLevelUpData, setActiveLevelUpData] = useState<AddXpResult | null>(null);

  // Floating transient system notification banner
  const [floatingToast, setFloatingToast] = useState<{
    id: string;
    title: string;
    message: string;
    xp?: number;
  } | null>(null);

  // Audio initialization
  useEffect(() => {
    sound.setEnabled(stats.soundEnabled);
  }, [stats.soundEnabled]);

  // Evaluate achievements on state changes
  useEffect(() => {
    setAchievements((prev) =>
      prev.map((ach) => {
        if (!ach.unlocked && ach.condition(stats, history, quests)) {
          sound.playLevelUp();
          return {
            ...ach,
            unlocked: true,
            unlockedAt: new Date().toISOString(),
          };
        }
        return ach;
      })
    );
  }, [stats, history, quests]);

  const showToast = useCallback((title: string, message: string, xp?: number) => {
    const id = `toast-${Date.now()}`;
    setFloatingToast({ id, title, message, xp });
    setTimeout(() => {
      setFloatingToast((current) => (current?.id === id ? null : current));
    }, 4000);
  }, []);

  // Complete a quest with duplicate reward prevention
  const handleCompleteQuest = (questId: string) => {
    const target = quests.find((q) => q.id === questId);
    if (!target) return;

    if (target.completed) {
      showToast('QUEST ALREADY COMPLETED', 'Reward has already been recorded for today.');
      return;
    }

    sound.playQuestComplete();
    const todayStr = getTodayDateString();

    const updatedQuests = quests.map((q) =>
      q.id === questId ? { ...q, completed: true, completedDate: todayStr } : q
    );
    setQuests(updatedQuests);
    saveQuests(updatedQuests);

    const xpResult = addXp(stats, target.xpReward);
    setStats(xpResult.updatedStats);
    saveStats(xpResult.updatedStats);

    const updatedHistory = { ...history };
    const currentDayRecord = updatedHistory[todayStr] || {
      date: todayStr,
      completedQuestIds: [],
      xpEarned: 0,
      levelAtDay: xpResult.updatedStats.level,
      rankAtDay: xpResult.updatedStats.hunterTitle,
    };

    if (!currentDayRecord.completedQuestIds.includes(questId)) {
      currentDayRecord.completedQuestIds.push(questId);
      currentDayRecord.xpEarned += target.xpReward;
      currentDayRecord.levelAtDay = xpResult.updatedStats.level;
      currentDayRecord.rankAtDay = xpResult.updatedStats.hunterTitle;
      updatedHistory[todayStr] = currentDayRecord;
      setHistory(updatedHistory);
      saveHistory(updatedHistory);
    }

    const newNotif: SystemNotification = {
      id: `quest-${Date.now()}`,
      type: 'quest_complete',
      title: 'QUEST COMPLETED',
      message: `Objective '${target.title}' verified. Reward allocated.`,
      timestamp: Date.now(),
      read: false,
      xpAwarded: target.xpReward,
    };

    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    saveNotifications(updatedNotifs);

    showToast('QUEST COMPLETED', target.title, target.xpReward);

    if (xpResult.leveledUp) {
      setTimeout(() => {
        setActiveLevelUpData(xpResult);
      }, 350);
    }
  };

  // Safe undo if clicked by mistake
  const handleUncompleteQuest = (questId: string) => {
    const target = quests.find((q) => q.id === questId);
    if (!target || !target.completed) return;

    sound.playClick();
    const todayStr = getTodayDateString();

    const updatedQuests = quests.map((q) =>
      q.id === questId ? { ...q, completed: false, completedDate: undefined } : q
    );
    setQuests(updatedQuests);
    saveQuests(updatedQuests);

    const rolledBackXp = Math.max(0, stats.currentXp - target.xpReward);
    const rolledBackTotal = Math.max(0, stats.totalXpEarned - target.xpReward);
    const updatedStats = {
      ...stats,
      currentXp: rolledBackXp,
      totalXpEarned: rolledBackTotal,
    };
    setStats(updatedStats);
    saveStats(updatedStats);

    const updatedHistory = { ...history };
    if (updatedHistory[todayStr]) {
      updatedHistory[todayStr].completedQuestIds = updatedHistory[
        todayStr
      ].completedQuestIds.filter((id) => id !== questId);
      updatedHistory[todayStr].xpEarned = Math.max(
        0,
        updatedHistory[todayStr].xpEarned - target.xpReward
      );
      setHistory(updatedHistory);
      saveHistory(updatedHistory);
    }

    showToast('QUEST UNDONE', `Rolled back ${target.xpReward} XP.`);
  };

  // Manual Goals Handlers
  const handleAddManualGoal = (text: string) => {
    const todayStr = getTodayDateString();
    const newGoal: DailyManualGoal = {
      id: `mgoal-${Date.now()}`,
      text: text.trim(),
      completed: false,
      xpReward: 15,
      date: todayStr,
      createdAt: Date.now(),
    };
    const updated = [newGoal, ...manualGoals];
    setManualGoals(updated);
    saveManualGoals(updated);
    showToast('MANUAL TARGET INITIALIZED', text.trim());
  };

  const handleToggleManualGoal = (id: string) => {
    const target = manualGoals.find((g) => g.id === id);
    if (!target) return;

    const willComplete = !target.completed;
    const reward = target.xpReward || 15;

    const updatedGoals = manualGoals.map((g) =>
      g.id === id ? { ...g, completed: willComplete } : g
    );
    setManualGoals(updatedGoals);
    saveManualGoals(updatedGoals);

    if (willComplete) {
      sound.playQuestComplete();
      const xpResult = addXp(stats, reward);
      setStats(xpResult.updatedStats);
      saveStats(xpResult.updatedStats);
      showToast('MANUAL TARGET COMPLETED', target.text, reward);

      if (xpResult.leveledUp) {
        setTimeout(() => setActiveLevelUpData(xpResult), 350);
      }
    } else {
      sound.playClick();
      const rolledBackXp = Math.max(0, stats.currentXp - reward);
      const rolledBackTotal = Math.max(0, stats.totalXpEarned - reward);
      const updatedStats = {
        ...stats,
        currentXp: rolledBackXp,
        totalXpEarned: rolledBackTotal,
      };
      setStats(updatedStats);
      saveStats(updatedStats);
      showToast('TARGET UNCHECKED', `Rolled back ${reward} XP.`);
    }
  };

  const handleDeleteManualGoal = (id: string) => {
    const updated = manualGoals.filter((g) => g.id !== id);
    setManualGoals(updated);
    saveManualGoals(updated);
    showToast('TARGET REMOVED', 'Manual objective deleted.');
  };

  const handleEditManualGoal = (id: string, newText: string) => {
    const updated = manualGoals.map((g) =>
      g.id === id ? { ...g, text: newText.trim() } : g
    );
    setManualGoals(updated);
    saveManualGoals(updated);
    showToast('TARGET UPDATED', newText.trim());
  };

  // Mitr Journal Handlers
  const handleSaveMitrEntry = (entry: MitrJournalEntry) => {
    const updatedEntries = { ...mitrEntries, [entry.date]: entry };
    setMitrEntries(updatedEntries);
    saveMitrEntries(updatedEntries);

    // Also link into day history
    const updatedHistory = { ...history };
    if (!updatedHistory[entry.date]) {
      updatedHistory[entry.date] = {
        date: entry.date,
        completedQuestIds: [],
        xpEarned: 0,
        levelAtDay: stats.level,
        rankAtDay: stats.hunterTitle,
      };
    }
    updatedHistory[entry.date].mitrJournal = entry;
    setHistory(updatedHistory);
    saveHistory(updatedHistory);

    showToast('MITR JOURNAL SYNCHRONIZED', entry.title || `Entry for ${entry.date}`);
  };

  // Add custom quest
  const handleAddCustomQuest = (newQuest: Quest) => {
    const updated = [...quests, newQuest];
    setQuests(updated);
    saveQuests(updated);
    showToast('NEW MISSION INITIALIZED', newQuest.title);
  };

  // Delete custom quest
  const handleDeleteCustomQuest = (questId: string) => {
    sound.playClick();
    const updated = quests.filter((q) => q.id !== questId);
    setQuests(updated);
    saveQuests(updated);
    showToast('MISSION REMOVED', 'Custom objective terminated.');
  };

  // Update Hunter Name
  const handleUpdateName = (newName: string) => {
    const updated = { ...stats, name: newName };
    setStats(updated);
    saveStats(updated);
    showToast('HUNTER IDENTITY UPDATED', newName);
  };

  // Toggle Sound
  const handleToggleSound = () => {
    const nextVal = !stats.soundEnabled;
    const updated = { ...stats, soundEnabled: nextVal };
    setStats(updated);
    saveStats(updated);
    sound.setEnabled(nextVal);
    if (nextVal) {
      sound.playClick();
    }
  };

  // Manual reset of today's quest checkboxes
  const handleManualDailyReset = () => {
    sound.playClick();
    const refreshed = quests.map((q) => ({
      ...q,
      completed: false,
      completedDate: undefined,
    }));
    setQuests(refreshed);
    saveQuests(refreshed);
    showToast('DAILY QUESTS RESET', 'All mission checkboxes refreshed for a new run.');
  };

  // Full clean reset (Non-shaming fresh start)
  const handleResetAllData = () => {
    const freshState = clearAllData();
    setStats(freshState.stats);
    setQuests(freshState.quests);
    setNotifications(freshState.notifications);
    setHistory(freshState.history);
    setManualGoals(freshState.manualGoals);
    setMitrEntries(freshState.mitrEntries);
    setAchievements(INITIAL_ACHIEVEMENTS);
    showToast('SYSTEM REINITIALIZED', 'Fresh awakening initiated. Welcome back, Hunter Aditya.');
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 pb-16 selection:bg-cyan-500 selection:text-black">
      <div className="scanlines-overlay" aria-hidden="true" />

      {/* System Top Header */}
      <SystemHeader
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        unreadNotificationsCount={unreadNotifsCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        soundEnabled={stats.soundEnabled}
        onToggleSound={handleToggleSound}
        streak={stats.currentStreak}
      />

      {/* Floating System HUD Toast */}
      {floatingToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="system-panel rounded-xl border-cyan-400/80 bg-slate-950/95 p-3.5 shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400 bg-cyan-950/60 text-cyan-300">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="font-system text-xs font-bold tracking-wider text-cyan-300">
                [{floatingToast.title}]
              </div>
              <div className="text-xs text-slate-300 max-w-xs truncate">
                {floatingToast.message}
              </div>
            </div>
            {floatingToast.xp && (
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                +{floatingToast.xp} XP
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Player Status / Vitals Dashboard */}
        <PlayerDashboard
          stats={stats}
          quests={quests}
          onUpdateName={handleUpdateName}
          onManualDailyReset={handleManualDailyReset}
        />

        {/* Tab Views */}
        {currentTab === 'quests' && (
          <div className="space-y-6">
            {/* Daily Manual Goals Widget */}
            <section aria-label="Daily Manual Goals">
              <DailyManualGoals
                goals={manualGoals}
                onAddGoal={handleAddManualGoal}
                onToggleGoal={handleToggleManualGoal}
                onDeleteGoal={handleDeleteManualGoal}
                onEditGoal={handleEditManualGoal}
              />
            </section>

            {/* Daily Quests List */}
            <section aria-label="Daily Quests">
              <QuestList
                quests={quests}
                onCompleteQuest={handleCompleteQuest}
                onUncompleteQuest={handleUncompleteQuest}
                onOpenTimerModal={(q) => setActiveTimerQuest(q)}
                onOpenRecallModal={(q) => setActiveRecallQuest(q)}
                onOpenWorkoutModal={(q) => setActiveWorkoutQuest(q)}
                onOpenAddCustomModal={() => setIsAddCustomQuestOpen(true)}
                onDeleteCustomQuest={handleDeleteCustomQuest}
              />
            </section>
          </div>
        )}

        {currentTab === 'mitr' && (
          <section aria-label="MITR Journal">
            <MitrJournal
              entries={mitrEntries}
              onSaveEntry={handleSaveMitrEntry}
              playerName={stats.name}
            />
          </section>
        )}

        {currentTab === 'records' && (
          <section aria-label="Daily Records Archive">
            <RecordsView
              stats={stats}
              quests={quests}
              history={history}
              manualGoals={manualGoals}
              mitrEntries={mitrEntries}
            />
          </section>
        )}

        {currentTab === 'analytics' && (
          <section aria-label="Progress & Analytics">
            <AnalyticsView stats={stats} quests={quests} history={history} />
          </section>
        )}

        {currentTab === 'achievements' && (
          <section aria-label="Hunter Achievements">
            <AchievementsView achievements={achievements} stats={stats} />
          </section>
        )}
      </main>

      {/* Interactive Modals */}
      {activeTimerQuest && (
        <InteractiveStudyTimerModal
          quest={activeTimerQuest}
          onClose={() => setActiveTimerQuest(null)}
          onComplete={(qid) => handleCompleteQuest(qid)}
        />
      )}

      {activeRecallQuest && (
        <InteractiveRecallModal
          quest={activeRecallQuest}
          onClose={() => setActiveRecallQuest(null)}
          onComplete={(qid, recallItems) => {
            const updated = quests.map((q) =>
              q.id === qid ? { ...q, recallItems } : q
            );
            setQuests(updated);
            saveQuests(updated);
            handleCompleteQuest(qid);
          }}
        />
      )}

      {activeWorkoutQuest && (
        <InteractiveWorkoutModal
          quest={activeWorkoutQuest}
          onClose={() => setActiveWorkoutQuest(null)}
          onComplete={(qid, workoutDetails) => {
            const updated = quests.map((q) =>
              q.id === qid ? { ...q, workoutDetails } : q
            );
            setQuests(updated);
            saveQuests(updated);
            handleCompleteQuest(qid);
          }}
        />
      )}

      {isAddCustomQuestOpen && (
        <AddCustomQuestModal
          onClose={() => setIsAddCustomQuestOpen(false)}
          onAdd={handleAddCustomQuest}
        />
      )}

      {activeLevelUpData && (
        <LevelUpModal
          levelUpData={activeLevelUpData}
          onClose={() => setActiveLevelUpData(null)}
        />
      )}

      {/* System Notification Drawer */}
      <SystemNotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          const marked = notifications.map((n) => ({ ...n, read: true }));
          setNotifications(marked);
          saveNotifications(marked);
        }}
        onClearAll={() => {
          setNotifications([]);
          saveNotifications([]);
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        stats={stats}
        soundEnabled={stats.soundEnabled}
        onToggleSound={handleToggleSound}
        onUpdateStats={(partial) => {
          const updated = { ...stats, ...partial };
          setStats(updated);
          saveStats(updated);
        }}
        onResetAllData={handleResetAllData}
      />
    </div>
  );
}
