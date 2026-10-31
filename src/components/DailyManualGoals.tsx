/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Check, Trash2, Edit2, Target, Sparkles, CheckCircle2 } from 'lucide-react';
import { DailyManualGoal } from '../types/system';
import { sound } from '../utils/audio';

interface DailyManualGoalsProps {
  goals: DailyManualGoal[];
  onAddGoal: (text: string) => void;
  onToggleGoal: (id: string) => void;
  onDeleteGoal: (id: string) => void;
  onEditGoal: (id: string, newText: string) => void;
}

export const DailyManualGoals: React.FC<DailyManualGoalsProps> = ({
  goals,
  onAddGoal,
  onToggleGoal,
  onDeleteGoal,
  onEditGoal,
}) => {
  const [inputText, setInputText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const completedCount = goals.filter((g) => g.completed).length;
  const totalCount = goals.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sound.playClick();
    onAddGoal(inputText.trim());
    setInputText('');
  };

  const handleStartEdit = (goal: DailyManualGoal) => {
    sound.playClick();
    setEditingId(goal.id);
    setEditText(goal.text);
  };

  const handleSaveEdit = (id: string) => {
    if (!editText.trim()) return;
    sound.playClick();
    onEditGoal(id, editText.trim());
    setEditingId(null);
  };

  return (
    <div className="system-panel relative overflow-hidden rounded-xl p-4 sm:p-5 border-cyan-500/30">
      <div className="system-corner-tl" />
      <div className="system-corner-br" />

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-sky-950/80 pb-3">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-cyan-400" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-system text-sm font-bold tracking-wider text-white">
                DAILY MANUAL GOALS
              </h3>
              <span className="rounded bg-cyan-950/70 px-1.5 py-0.5 font-mono text-[10px] text-cyan-300 border border-cyan-800/40">
                MANUAL DIRECTIVES
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              दैनिक व्यक्तिगत लक्ष्य — Add, customize, and conquer your own daily targets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="font-mono text-xs font-bold text-cyan-300">
              {completedCount} / {totalCount} Cleared
            </span>
            <span className="ml-1 text-[11px] text-slate-500">({percent}%)</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-900 border border-sky-950">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}

      {/* Add New Goal Input */}
      <form onSubmit={handleAdd} className="mt-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Add today's manual goal (e.g. Study Chemistry Ch. 3, Drink 3L water)..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 rounded-lg border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
        />
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-lg border border-cyan-500/50 bg-cyan-500/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-cyan-300 hover:bg-cyan-400 hover:text-slate-950 transition-colors shadow-[0_0_12px_rgba(6,182,212,0.2)]"
        >
          <Plus className="h-4 w-4" />
          <span>ADD TARGET</span>
        </button>
      </form>

      {/* Goals List */}
      <div className="mt-4 space-y-2 max-h-64 overflow-y-auto pr-1">
        {goals.map((goal) => {
          const isEditing = editingId === goal.id;
          return (
            <div
              key={goal.id}
              className={`flex items-center justify-between gap-3 rounded-lg border p-2.5 transition-all ${
                goal.completed
                  ? 'border-emerald-500/40 bg-emerald-950/20 text-slate-300'
                  : 'border-slate-800 bg-slate-900/60 text-white hover:border-slate-700'
              }`}
            >
              <div className="flex flex-1 items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onToggleGoal(goal.id);
                  }}
                  aria-label={goal.completed ? `Unmark goal ${goal.text}` : `Mark goal complete ${goal.text}`}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                    goal.completed
                      ? 'border-emerald-500 bg-emerald-500 text-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                      : 'border-slate-700 bg-slate-950 hover:border-cyan-400'
                  }`}
                >
                  {goal.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </button>

                {isEditing ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 rounded border border-cyan-500 bg-slate-950 px-2 py-0.5 text-xs text-white focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(goal.id)}
                      className="rounded bg-cyan-600 px-2.5 py-0.5 text-xs font-bold text-slate-950 hover:bg-cyan-400"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <span
                    onClick={() => {
                      sound.playClick();
                      onToggleGoal(goal.id);
                    }}
                    className={`cursor-pointer truncate text-xs font-medium ${
                      goal.completed ? 'line-through text-slate-400' : 'text-slate-100'
                    }`}
                  >
                    {goal.text}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-500/20 px-1.5 py-0.5 rounded">
                  +{goal.xpReward || 15} XP
                </span>
                {!isEditing && (
                  <button
                    onClick={() => handleStartEdit(goal)}
                    aria-label={`Edit target ${goal.text}`}
                    className="text-slate-500 hover:text-cyan-400 p-1"
                    title="Edit Goal Text"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => {
                    sound.playClick();
                    onDeleteGoal(goal.id);
                  }}
                  aria-label={`Delete target ${goal.text}`}
                  className="text-slate-500 hover:text-rose-400 p-1"
                  title="Delete Target"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="py-6 text-center text-xs text-slate-500">
            No manual goals set for today. Add your personalized targets above.
          </div>
        )}
      </div>
    </div>
  );
};
