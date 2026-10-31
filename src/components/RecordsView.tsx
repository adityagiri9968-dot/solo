/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Search,
  BookOpen,
  Target,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Download,
} from 'lucide-react';
import {
  DailyManualGoal,
  DayHistoryRecord,
  MitrJournalEntry,
  PlayerStats,
  Quest,
} from '../types/system';
import { getTodayDateString } from '../utils/progression';
import { sound } from '../utils/audio';

interface RecordsViewProps {
  stats: PlayerStats;
  quests: Quest[];
  history: Record<string, DayHistoryRecord>;
  manualGoals: DailyManualGoal[];
  mitrEntries: Record<string, MitrJournalEntry>;
}

export const RecordsView: React.FC<RecordsViewProps> = ({
  stats,
  quests,
  history,
  manualGoals,
  mitrEntries,
}) => {
  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all available dates (today + historical)
  const allDatesSet = new Set<string>([todayStr, ...Object.keys(history), ...Object.keys(mitrEntries)]);
  const allDates = Array.from(allDatesSet).sort((a, b) => b.localeCompare(a));

  // Filter dates by query
  const filteredDates = allDates.filter((dateStr) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const isDateMatch = dateStr.includes(q);
    const mitr = mitrEntries[dateStr];
    const isMitrMatch =
      mitr && (mitr.title.toLowerCase().includes(q) || mitr.content.toLowerCase().includes(q));
    const hist = history[dateStr];
    const isGoalMatch =
      hist?.manualGoals?.some((g) => g.text.toLowerCase().includes(q)) ||
      (dateStr === todayStr && manualGoals.some((g) => g.text.toLowerCase().includes(q)));
    return isDateMatch || isMitrMatch || isGoalMatch;
  });

  // Build the day record for selectedDate
  const isToday = selectedDate === todayStr;
  const todayCompletedQuests = quests.filter((q) => q.completed);
  const todayXp = todayCompletedQuests.reduce((sum, q) => sum + q.xpReward, 0);

  const selectedDayRecord: DayHistoryRecord = isToday
    ? {
        date: todayStr,
        completedQuestIds: todayCompletedQuests.map((q) => q.id),
        xpEarned: todayXp,
        levelAtDay: stats.level,
        rankAtDay: stats.hunterTitle,
        manualGoals: manualGoals.filter((g) => g.date === todayStr),
        mitrJournal: mitrEntries[todayStr],
      }
    : history[selectedDate] || {
        date: selectedDate,
        completedQuestIds: [],
        xpEarned: 0,
        manualGoals: [],
        mitrJournal: mitrEntries[selectedDate],
      };

  const selectedMitr = mitrEntries[selectedDate] || selectedDayRecord.mitrJournal;
  const dayGoals = isToday ? manualGoals : selectedDayRecord.manualGoals || [];

  const handleExportSelectedDay = () => {
    sound.playClick();
    const dataToExport = {
      date: selectedDate,
      hunterName: stats.name,
      xpEarned: selectedDayRecord.xpEarned,
      levelAtDay: selectedDayRecord.levelAtDay || stats.level,
      completedQuests: selectedDayRecord.completedQuestIds.map((id) => {
        const found = quests.find((q) => q.id === id);
        return found ? found.title : id;
      }),
      manualGoals: dayGoals,
      mitrJournal: selectedMitr,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hunter_record_${stats.name.toLowerCase()}_${selectedDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Records Header Card */}
      <div className="system-panel relative overflow-hidden rounded-2xl p-6 border-cyan-500/40">
        <div className="system-corner-tl" />
        <div className="system-corner-br" />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-400" />
              <h2 className="font-system text-lg font-bold tracking-wider text-white">
                HUNTER ARCHIVE & DAILY RECORDS
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              दैनिक संपूर्ण रिकॉर्ड — Complete chronological day-by-day logs: XP yields, quests, manual goals, and Mitr reflections.
            </p>
          </div>

          <button
            onClick={handleExportSelectedDay}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/60 px-3.5 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-900 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Day Log</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Archive Browser */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Date Selector List (4 cols) */}
        <div className="system-panel rounded-2xl p-5 border-sky-500/30 lg:col-span-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-sky-950/80 pb-3">
            <span className="font-system text-xs font-bold text-cyan-400">
              LOGGED TIMELINE
            </span>
            <span className="font-mono text-[10px] text-slate-500">
              {filteredDates.length} Days Recorded
            </span>
          </div>

          {/* Search Bar */}
          <div className="mt-3 relative">
            <input
              type="text"
              placeholder="Search date or reflection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/90 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          </div>

          {/* List of Dates */}
          <div className="mt-3 space-y-2 flex-1 overflow-y-auto max-h-[500px] pr-1">
            {filteredDates.map((dateStr) => {
              const isSelected = selectedDate === dateStr;
              const isDateToday = dateStr === todayStr;
              const hist = history[dateStr];
              const xpVal = isDateToday
                ? todayXp
                : hist?.xpEarned || 0;
              const hasMitr = !!mitrEntries[dateStr];

              return (
                <button
                  key={dateStr}
                  onClick={() => {
                    sound.playClick();
                    setSelectedDate(dateStr);
                  }}
                  className={`w-full rounded-xl border p-3 text-left transition-all ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : 'border-slate-800/80 bg-slate-900/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-system text-xs font-bold text-white flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-cyan-400" />
                      {dateStr}
                    </span>
                    {isDateToday && (
                      <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300 border border-cyan-500/30">
                        TODAY
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-emerald-400 font-bold">+{xpVal} XP</span>
                    {hasMitr && (
                      <span className="text-cyan-400 text-[10px] flex items-center gap-1">
                        <BookOpen className="h-2.5 w-2.5" /> Mitr Entry
                      </span>
                    )}
                  </div>
                </button>
              );
            })}

            {filteredDates.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-500">
                No matching records found.
              </div>
            )}
          </div>
        </div>

        {/* Detailed Record Sheet (8 cols) */}
        <div className="system-panel rounded-2xl p-6 border-sky-500/30 lg:col-span-8 space-y-5">
          {/* Day Title & Stat Header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-sky-950/80 pb-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400">
                OFFICIAL RECORD REPORT
              </span>
              <h3 className="font-heading text-xl font-bold text-white">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-right">
                <span className="font-mono text-[10px] text-slate-400 uppercase">Day's Yield</span>
                <div className="font-mono text-sm font-bold text-emerald-400">
                  +{selectedDayRecord.xpEarned} XP
                </div>
              </div>
            </div>
          </div>

          {/* Hunter Vitals At Day */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
              <span className="font-mono text-[10px] text-slate-500 uppercase">Hunter Name</span>
              <div className="font-bold text-xs text-white truncate">{stats.name}</div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
              <span className="font-mono text-[10px] text-slate-500 uppercase">Rank At Day</span>
              <div className="font-bold text-xs text-cyan-300 truncate">
                {selectedDayRecord.rankAtDay || stats.hunterTitle.split('(')[0]}
              </div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 col-span-2 sm:col-span-1">
              <span className="font-mono text-[10px] text-slate-500 uppercase">Missions Cleared</span>
              <div className="font-mono text-xs font-bold text-white">
                {selectedDayRecord.completedQuestIds.length} Objectives
              </div>
            </div>
          </div>

          {/* Section 1: Quests Cleared on this day */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-300">
              <CheckCircle className="h-4 w-4 text-cyan-400" />
              <span>Daily Quests Log</span>
            </div>

            <div className="space-y-1.5">
              {selectedDayRecord.completedQuestIds.length > 0 ? (
                selectedDayRecord.completedQuestIds.map((qid) => {
                  const quest = quests.find((q) => q.id === qid);
                  return (
                    <div
                      key={qid}
                      className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/50 p-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span className="font-medium text-slate-200 truncate">
                          {quest ? quest.title : qid}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-cyan-400 shrink-0">
                        +{quest ? quest.xpReward : 30} XP
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-3 text-xs text-slate-500">
                  No system daily quests marked complete on this date.
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Daily Manual Goals on this day */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300">
              <Target className="h-4 w-4 text-amber-400" />
              <span>Manual Goals Record (दैनिक लक्ष्य)</span>
            </div>

            <div className="space-y-1.5">
              {dayGoals.length > 0 ? (
                dayGoals.map((g) => (
                  <div
                    key={g.id}
                    className={`flex items-center justify-between rounded-lg border p-2 text-xs ${
                      g.completed
                        ? 'border-emerald-500/30 bg-emerald-950/20 text-slate-200'
                        : 'border-slate-800 bg-slate-900/40 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {g.completed ? (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                      )}
                      <span className={g.completed ? 'line-through text-slate-400' : ''}>
                        {g.text}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-500 shrink-0">
                      {g.completed ? 'COMPLETED' : 'PENDING'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-3 text-xs text-slate-500">
                  No manual goals were recorded on this day.
                </div>
              )}
            </div>
          </div>

          {/* Section 3: MITR (मित्र) Journal Entry for this day */}
          <div className="space-y-2 border-t border-sky-950/80 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-purple-300">
                <BookOpen className="h-4 w-4 text-purple-400" />
                <span>MITR (मित्र) Reflection Entry</span>
              </div>
              {selectedMitr?.mood && (
                <span className="font-mono text-[10px] text-cyan-300 bg-cyan-950/60 border border-cyan-500/20 px-2 py-0.5 rounded uppercase">
                  State: {selectedMitr.mood}
                </span>
              )}
            </div>

            {selectedMitr && (selectedMitr.content || selectedMitr.title) ? (
              <div className="rounded-xl border border-sky-950 bg-slate-950/70 p-4 space-y-2.5">
                <h4 className="font-heading text-base font-bold text-cyan-200">
                  {selectedMitr.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedMitr.content}
                </p>

                {(selectedMitr.lessonsLearned || selectedMitr.tomorrowPriority) && (
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 border-t border-slate-800/80 pt-2.5 text-xs">
                    {selectedMitr.lessonsLearned && (
                      <div className="text-slate-400">
                        <strong className="text-cyan-400">Lesson:</strong> {selectedMitr.lessonsLearned}
                      </div>
                    )}
                    {selectedMitr.tomorrowPriority && (
                      <div className="text-slate-400">
                        <strong className="text-amber-400">Priority:</strong> {selectedMitr.tomorrowPriority}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 text-xs text-slate-500">
                No Mitr journal entry was composed for this date.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
