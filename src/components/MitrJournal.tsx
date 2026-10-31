/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Save,
  Sparkles,
  Calendar,
  Clock,
  Heart,
  CheckCircle,
  History,
  ChevronRight,
  Flame,
  Zap,
  Target,
} from 'lucide-react';
import { MitrJournalEntry } from '../types/system';
import { getTodayDateString } from '../utils/progression';
import { sound } from '../utils/audio';

interface MitrJournalProps {
  entries: Record<string, MitrJournalEntry>;
  onSaveEntry: (entry: MitrJournalEntry) => void;
  playerName: string;
}

export const MitrJournal: React.FC<MitrJournalProps> = ({
  entries,
  onSaveEntry,
  playerName,
}) => {
  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const currentEntry = entries[selectedDate] || {
    id: `mitr-${selectedDate}`,
    date: selectedDate,
    title: '',
    content: '',
    mood: 'focused',
    lessonsLearned: '',
    tomorrowPriority: '',
    updatedAt: Date.now(),
  };

  const [title, setTitle] = useState(currentEntry.title);
  const [content, setContent] = useState(currentEntry.content);
  const [mood, setMood] = useState<MitrJournalEntry['mood']>(currentEntry.mood || 'focused');
  const [lessonsLearned, setLessonsLearned] = useState(currentEntry.lessonsLearned || '');
  const [tomorrowPriority, setTomorrowPriority] = useState(currentEntry.tomorrowPriority || '');
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  // Sync state when selected date changes
  useEffect(() => {
    const entry = entries[selectedDate] || {
      id: `mitr-${selectedDate}`,
      date: selectedDate,
      title: '',
      content: '',
      mood: 'focused',
      lessonsLearned: '',
      tomorrowPriority: '',
      updatedAt: Date.now(),
    };
    setTitle(entry.title);
    setContent(entry.content);
    setMood(entry.mood || 'focused');
    setLessonsLearned(entry.lessonsLearned || '');
    setTomorrowPriority(entry.tomorrowPriority || '');
    setIsSavedRecently(false);
  }, [selectedDate, entries]);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    sound.playClick();

    const updatedEntry: MitrJournalEntry = {
      id: currentEntry.id,
      date: selectedDate,
      title: title.trim() || `Journal: ${selectedDate}`,
      content: content.trim(),
      mood,
      lessonsLearned: lessonsLearned.trim(),
      tomorrowPriority: tomorrowPriority.trim(),
      updatedAt: Date.now(),
    };

    onSaveEntry(updatedEntry);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 3000);
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const pastEntriesList = Object.values(entries)
    .filter((e) => e.date !== selectedDate)
    .sort((a, b) => b.date.localeCompare(a.date));

  const moodBadges: Array<{ id: MitrJournalEntry['mood']; label: string; icon: string }> = [
    { id: 'victorious', label: 'Victorious (विजयी)', icon: '⚡' },
    { id: 'focused', label: 'Deep Focus (एकाग्र)', icon: '🎯' },
    { id: 'calm', label: 'Calm Discipline (शांत)', icon: '🧘' },
    { id: 'battling', label: 'Battling Desires (संघर्षरत)', icon: '⚔️' },
    { id: 'reflective', label: 'Rebuilding (पुनर्निर्माण)', icon: '🛡️' },
  ];

  return (
    <div className="space-y-6">
      {/* Mitr Title Card */}
      <div className="system-panel relative overflow-hidden rounded-2xl p-6 border-cyan-500/40">
        <div className="system-corner-tl" />
        <div className="system-corner-br" />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400 bg-cyan-950/60 text-cyan-300">
                <BookOpen className="h-4 w-4" />
              </div>
              <h2 className="font-system text-lg font-bold tracking-wider text-white">
                MITR (मित्र) — THE HUNTER'S INNER JOURNAL
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your confidential space for self-honesty, honest struggles, mental clarity, and tomorrow’s battle directives. Write freely to your inner companion without fear or shame.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{selectedDate === todayStr ? `Today: ${selectedDate}` : selectedDate}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Journal Writing Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Active Entry Column (8 cols) */}
        <div className="system-panel rounded-2xl p-5 border-sky-500/30 lg:col-span-8 space-y-4">
          <form onSubmit={handleSave} className="space-y-4">
            {/* Title & Date */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Entry Directive Title:
              </label>
              <input
                type="text"
                placeholder="e.g. Conquered the Afternoon Slump, Rebuilding Momentum..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-sm font-bold text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Mindset / Mood Selector */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Today's Inner State (मनोस्थिति):
              </label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {moodBadges.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setMood(m.id);
                    }}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                      mood === m.id
                        ? 'border-cyan-400 bg-cyan-950/80 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Core Reflection Area */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span className="uppercase tracking-wider">Reflections to MITR (संवाद):</span>
                <span className="font-mono text-slate-500">{wordCount} words</span>
              </div>
              <textarea
                rows={9}
                placeholder="Write to Mitr about your day: What went well? Where did you feel resistance or impulses? How did you respond? Speak with complete honesty..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 leading-relaxed font-sans resize-y"
              />
            </div>

            {/* Structured Insights: Lessons & Tomorrow */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Key Insight / Lesson Learned:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Don't touch the phone first thing in the morning."
                  value={lessonsLearned}
                  onChange={(e) => setLessonsLearned(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Target className="h-3 w-3" /> Tomorrow's Primary Directive:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Finish 30-min study block by 9:00 AM."
                  value={tomorrowPriority}
                  onChange={(e) => setTomorrowPriority(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between border-t border-sky-950/80 pt-3">
              <span className="text-xs text-slate-400 font-mono">
                {isSavedRecently ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle className="h-3.5 w-3.5" /> Entry synchronized with Matrix
                  </span>
                ) : (
                  <span>Auto-saved locally</span>
                )}
              </span>

              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-5 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
              >
                <Save className="h-3.5 w-3.5" />
                <span>SAVE TO MITR</span>
              </button>
            </div>
          </form>
        </div>

        {/* Past Journal Archive Sidebar (4 cols) */}
        <div className="system-panel rounded-2xl p-5 border-sky-500/30 lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-sky-950/80 pb-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-cyan-400" />
                <h3 className="font-system text-xs font-bold tracking-wider text-white">
                  MITR ARCHIVE
                </h3>
              </div>
              <span className="font-mono text-[10px] text-slate-500">
                {Object.keys(entries).length} Logs
              </span>
            </div>

            {/* Today Quick Switch */}
            <button
              onClick={() => {
                sound.playClick();
                setSelectedDate(todayStr);
              }}
              className={`mt-3 w-full rounded-lg border p-2.5 text-left transition-all ${
                selectedDate === todayStr
                  ? 'border-cyan-400 bg-cyan-950/50 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'border-slate-800 bg-slate-900/40 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-system text-xs font-bold text-cyan-300">
                  ★ Today's Entry
                </span>
                <span className="font-mono text-[10px] text-slate-500">{todayStr}</span>
              </div>
              <p className="mt-1 text-[11px] truncate text-slate-400">
                {entries[todayStr]?.title || 'Today’s reflection...'}
              </p>
            </button>

            {/* Past Entries */}
            <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
              <div className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                Previous Days:
              </div>
              {pastEntriesList.map((entry) => {
                const isSelected = selectedDate === entry.date;
                return (
                  <button
                    key={entry.date}
                    onClick={() => {
                      sound.playClick();
                      setSelectedDate(entry.date);
                    }}
                    className={`w-full rounded-lg border p-2.5 text-left transition-all ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/60 text-white'
                        : 'border-slate-800/80 bg-slate-900/30 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-200 truncate">
                        {entry.title || `Entry: ${entry.date}`}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 shrink-0">
                        {entry.date}
                      </span>
                    </div>
                    {entry.content && (
                      <p className="mt-0.5 text-[11px] text-slate-500 truncate">
                        {entry.content}
                      </p>
                    )}
                  </button>
                );
              })}

              {pastEntriesList.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-600">
                  No earlier entries yet. As days pass, your reflections are archived here.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 border-t border-slate-900 pt-3 text-[10px] text-slate-500 italic">
            "A disciplined mind speaks truthfully to itself." — Mitr
          </div>
        </div>
      </div>
    </div>
  );
};
