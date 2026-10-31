/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  BarChart3,
  TrendingUp,
  Award,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Dumbbell,
  Shield,
  Sparkles,
  Flame,
} from 'lucide-react';
import { DayHistoryRecord, PlayerStats, Quest } from '../types/system';
import { getTodayDateString } from '../utils/progression';
import { sound } from '../utils/audio';

interface AnalyticsViewProps {
  stats: PlayerStats;
  quests: Quest[];
  history: Record<string, DayHistoryRecord>;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  stats,
  quests,
  history,
}) => {
  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Month navigation
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());

  const prevMonth = () => {
    sound.playClick();
    setCurrentMonthDate(
      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    sound.playClick();
    setCurrentMonthDate(
      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1)
    );
  };

  // Build last 7 days chart data
  const last7Days: Array<{ date: string; label: string; xp: number; isToday: boolean }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

    let xp = 0;
    if (dateStr === todayStr) {
      xp = quests.filter((q) => q.completed).reduce((sum, q) => sum + q.xpReward, 0);
    } else if (history[dateStr]) {
      xp = history[dateStr].xpEarned;
    }

    last7Days.push({
      date: dateStr,
      label: dayLabel,
      xp,
      isToday: dateStr === todayStr,
    });
  }

  const maxXpIn7Days = Math.max(150, ...last7Days.map((d) => d.xp));

  // Calendar calculations for currentMonthDate
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: Array<{
    dayNumber: number;
    dateStr: string;
    hasData: boolean;
    isToday: boolean;
    xpEarned: number;
  }> = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = dateStr === todayStr;
    const dayRecord = history[dateStr];
    let xp = 0;
    let hasData = false;

    if (isToday) {
      xp = quests.filter((q) => q.completed).reduce((sum, q) => sum + q.xpReward, 0);
      hasData = xp > 0;
    } else if (dayRecord) {
      xp = dayRecord.xpEarned;
      hasData = dayRecord.completedQuestIds.length > 0;
    }

    calendarDays.push({
      dayNumber: day,
      dateStr,
      hasData,
      isToday,
      xpEarned: xp,
    });
  }

  const selectedRecord =
    selectedDate === todayStr
      ? {
          date: todayStr,
          xpEarned: quests.filter((q) => q.completed).reduce((sum, q) => sum + q.xpReward, 0),
          completedQuestIds: quests.filter((q) => q.completed).map((q) => q.id),
        }
      : history[selectedDate] || null;

  // Breakdown across all records
  let studyCount = 0;
  let workoutCount = 0;
  let disciplineCount = 0;
  let customCount = 0;

  Object.values(history).forEach((rec) => {
    rec.completedQuestIds.forEach((id) => {
      if (id.startsWith('study')) studyCount++;
      else if (id.startsWith('workout')) workoutCount++;
      else if (id.startsWith('discipline')) disciplineCount++;
      else customCount++;
    });
  });

  // Add today's active completed
  quests.filter((q) => q.completed).forEach((q) => {
    if (q.category === 'study') studyCount++;
    else if (q.category === 'workout') workoutCount++;
    else if (q.category === 'discipline') disciplineCount++;
    else customCount++;
  });

  const totalCompletedQuestsEver = studyCount + workoutCount + disciplineCount + customCount;

  return (
    <div className="space-y-6">
      {/* Overview Metric Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="system-panel rounded-xl p-4 border-cyan-500/30">
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
            TOTAL XP EARNED
          </span>
          <div className="mt-1 font-system text-xl font-bold text-cyan-400">
            {stats.totalXpEarned} XP
          </div>
          <span className="text-[11px] text-slate-500">Across all sessions</span>
        </div>

        <div className="system-panel rounded-xl p-4 border-amber-500/30">
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
            CURRENT STREAK
          </span>
          <div className="mt-1 flex items-center gap-1.5 font-system text-xl font-bold text-amber-400">
            <Flame className="h-5 w-5" />
            {stats.currentStreak} DAYS
          </div>
          <span className="text-[11px] text-slate-500">Peak: {stats.longestStreak} days</span>
        </div>

        <div className="system-panel rounded-xl p-4 border-blue-500/30">
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
            MISSIONS CLEARED
          </span>
          <div className="mt-1 font-system text-xl font-bold text-blue-400">
            {totalCompletedQuestsEver}
          </div>
          <span className="text-[11px] text-slate-500">Lifetime objectives</span>
        </div>

        <div className="system-panel rounded-xl p-4 border-purple-500/30">
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
            HUNTER RANK
          </span>
          <div className="mt-1 font-system text-xl font-bold text-purple-400">
            LVL {stats.level}
          </div>
          <span className="text-[11px] text-slate-500">{stats.hunterTitle.split('(')[0]}</span>
        </div>
      </div>

      {/* 7-Day XP Graph & Discipline Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 7-Day XP Bar Chart (7 cols) */}
        <div className="system-panel rounded-2xl p-5 border-sky-500/30 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-sky-950/80 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-cyan-400" />
              <h3 className="font-system text-sm font-bold tracking-wider text-white">
                WEEKLY EXPERIENCE TRAJECTORY
              </h3>
            </div>
            <span className="font-mono text-[11px] text-slate-400">Last 7 Days</span>
          </div>

          <div className="mt-6 flex h-48 items-end justify-between gap-2 px-2 pt-4">
            {last7Days.map((item) => {
              const heightPercent = Math.max(8, Math.round((item.xp / maxXpIn7Days) * 100));
              return (
                <div key={item.date} className="flex flex-1 flex-col items-center gap-2 group">
                  <span className="font-mono text-[10px] text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    +{item.xp}
                  </span>
                  <div className="relative flex h-36 w-full max-w-[36px] items-end justify-center rounded-t-md bg-slate-900/60 p-0.5">
                    <div
                      className={`w-full rounded-t transition-all duration-500 ${
                        item.isToday
                          ? 'bg-gradient-to-t from-cyan-500 to-sky-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                          : 'bg-gradient-to-t from-blue-700 to-cyan-500/80'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span
                    className={`font-mono text-[11px] ${
                      item.isToday ? 'font-bold text-cyan-300' : 'text-slate-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown (5 cols) */}
        <div className="system-panel rounded-2xl p-5 border-sky-500/30 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-sky-950/80 pb-3">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              <h3 className="font-system text-sm font-bold tracking-wider text-white">
                PILLARS OF AWAKENING
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <BookOpen className="h-3.5 w-3.5" /> Study / Focus
                  </span>
                  <span className="font-mono font-bold">{studyCount} Cleared</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-900">
                  <div
                    className="h-full bg-cyan-400"
                    style={{
                      width: `${totalCompletedQuestsEver ? (studyCount / totalCompletedQuestsEver) * 100 : 33}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <Dumbbell className="h-3.5 w-3.5" /> Workout / Conditioning
                  </span>
                  <span className="font-mono font-bold">{workoutCount} Cleared</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-900">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${totalCompletedQuestsEver ? (workoutCount / totalCompletedQuestsEver) * 100 : 33}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 text-purple-400">
                    <Shield className="h-3.5 w-3.5" /> Self-Control / Discipline
                  </span>
                  <span className="font-mono font-bold">{disciplineCount} Cleared</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-900">
                  <div
                    className="h-full bg-purple-500"
                    style={{
                      width: `${totalCompletedQuestsEver ? (disciplineCount / totalCompletedQuestsEver) * 100 : 33}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-sky-950 bg-slate-950/60 p-3 text-xs text-slate-400">
            <span className="font-semibold text-cyan-300">Law of Compounding:</span> Small, consistent daily victories compound into an unbeatable life state.
          </div>
        </div>
      </div>

      {/* Calendar History Section */}
      <div className="system-panel rounded-2xl p-5 border-sky-500/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-sky-950/80 pb-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-cyan-400" />
            <h3 className="font-system text-sm font-bold tracking-wider text-white">
              DISCIPLINE LOG & CALENDAR MATRIX
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              aria-label="Previous month"
              className="rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-system text-xs font-bold text-cyan-300 min-w-32 text-center">
              {currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={nextMonth}
              aria-label="Next month"
              className="rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Calendar Grid (8 cols) */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] text-slate-500 pb-2">
              <span>SUN</span>
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {/* Empty leading days */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="h-12 rounded-lg bg-slate-950/30" />
              ))}

              {/* Month days */}
              {calendarDays.map((d) => {
                const isSelected = d.dateStr === selectedDate;
                return (
                  <button
                    key={d.dateStr}
                    onClick={() => {
                      sound.playClick();
                      setSelectedDate(d.dateStr);
                    }}
                    className={`flex h-12 flex-col items-center justify-between rounded-lg border p-1 text-xs transition-all ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                        : d.isToday
                        ? 'border-sky-500/60 bg-sky-950/40 text-cyan-300'
                        : d.hasData
                        ? 'border-emerald-500/40 bg-emerald-950/20 text-slate-200'
                        : 'border-slate-800/80 bg-slate-900/30 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-mono text-[10px] font-bold">{d.dayNumber}</span>
                    {d.hasData && (
                      <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
                    )}
                    {d.xpEarned > 0 && (
                      <span className="font-mono text-[9px] text-emerald-400">+{d.xpEarned}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Details (4 cols) */}
          <div className="rounded-xl border border-sky-950 bg-slate-900/60 p-4 lg:col-span-4 flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-800 pb-2">
                <span className="font-mono text-[10px] uppercase text-cyan-400 tracking-wider">
                  SELECTED LOG
                </span>
                <h4 className="font-heading text-base font-bold text-white">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </h4>
              </div>

              <div className="mt-3 space-y-2">
                {selectedRecord ? (
                  <>
                    <div className="flex items-center justify-between font-mono text-xs text-slate-300">
                      <span>XP Yield:</span>
                      <span className="font-bold text-emerald-400">+{selectedRecord.xpEarned} XP</span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-xs text-slate-300">
                      <span>Missions Completed:</span>
                      <span className="font-bold text-cyan-400">
                        {selectedRecord.completedQuestIds.length}
                      </span>
                    </div>

                    <div className="mt-3 border-t border-slate-800/80 pt-2">
                      <span className="text-[11px] font-semibold text-slate-400">Completed Quests:</span>
                      <div className="mt-1 space-y-1">
                        {selectedRecord.completedQuestIds.map((qid) => {
                          const found = quests.find((q) => q.id === qid);
                          return (
                            <div
                              key={qid}
                              className="flex items-center gap-1.5 rounded bg-slate-950/60 px-2 py-1 text-[11px] text-slate-300 border border-slate-800"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                              <span className="truncate">{found ? found.title : qid}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No active records found for this date.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 border-t border-slate-800 pt-2 text-[10px] font-mono text-slate-500">
              * The System records every milestone in persistent local storage.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
