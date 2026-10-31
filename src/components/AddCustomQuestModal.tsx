/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlusCircle, Sparkles } from 'lucide-react';
import { Quest, QuestCategory } from '../types/system';
import { sound } from '../utils/audio';

interface AddCustomQuestModalProps {
  onClose: () => void;
  onAdd: (newQuest: Quest) => void;
}

export const AddCustomQuestModal: React.FC<AddCustomQuestModalProps> = ({
  onClose,
  onAdd,
}) => {
  const [title, setTitle] = useState('');
  const [titleHindi, setTitleHindi] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<QuestCategory>('custom');
  const [xpReward, setXpReward] = useState<number>(30);
  const [hasTimer, setHasTimer] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(15);
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    sound.playClick();
    const newQuest: Quest = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      titleHindi: titleHindi.trim() || undefined,
      description: description.trim() || 'Custom Hunter personal objective.',
      category,
      xpReward: Math.min(100, Math.max(10, xpReward)),
      completed: false,
      isCustom: true,
      isPrivate,
      interactionType: hasTimer ? 'timer' : 'none',
      timerDurationSeconds: hasTimer ? timerMinutes * 60 : undefined,
    };

    onAdd(newQuest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="system-panel w-full max-w-md rounded-2xl p-6 border-cyan-500/50 shadow-2xl relative">
        <div className="system-corner-tl" />
        <div className="system-corner-br" />

        <div className="flex items-center justify-between border-b border-sky-900/60 pb-3">
          <div className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-cyan-400" />
            <h3 className="font-system text-base font-bold tracking-wider text-white">
              NEW HUNTER DIRECTIVE
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm px-2 py-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
              Quest Title:
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Read 15 pages of non-fiction, Cold shower"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Hindi Subtitle (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g., 15 पृष्ठ पुस्तक पठन"
              value={titleHindi}
              onChange={(e) => setTitleHindi(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as QuestCategory)}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="study">Study (पढ़ाई)</option>
                <option value="workout">Workout (कसरत)</option>
                <option value="discipline">Discipline (आत्म-नियंत्रण)</option>
                <option value="custom">Custom Habit (कस्टम)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                XP Reward (+{xpReward} XP):
              </label>
              <input
                type="number"
                min={10}
                max={100}
                step={5}
                value={xpReward}
                onChange={(e) => setXpReward(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-mono font-bold text-cyan-300 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
              Description / Directive:
            </label>
            <textarea
              rows={2}
              placeholder="Execution guidelines and rules of engagement..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none resize-none"
            />
          </div>

          {/* Optional Timer toggle */}
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="timer-toggle" className="text-xs font-semibold text-slate-300 cursor-pointer">
                Attach Countdown Focus Timer?
              </label>
              <input
                id="timer-toggle"
                type="checkbox"
                checked={hasTimer}
                onChange={(e) => setHasTimer(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-cyan-500"
              />
            </div>
            {hasTimer && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-slate-400">Duration:</span>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={timerMinutes}
                  onChange={(e) => setTimerMinutes(Number(e.target.value))}
                  className="w-20 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-center font-mono text-cyan-300"
                />
                <span className="text-xs text-slate-400">minutes</span>
              </div>
            )}
          </div>

          <div className="border-t border-sky-950 pt-4 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-800 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-cyan-500 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              INITIALIZE QUEST
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
