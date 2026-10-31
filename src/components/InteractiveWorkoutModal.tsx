/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Dumbbell, Plus, Trash2, CheckCircle, Shield } from 'lucide-react';
import { Quest } from '../types/system';
import { sound } from '../utils/audio';

interface InteractiveWorkoutModalProps {
  quest: Quest;
  onClose: () => void;
  onComplete: (questId: string, updatedWorkout: NonNullable<Quest['workoutDetails']>) => void;
}

export const InteractiveWorkoutModal: React.FC<InteractiveWorkoutModalProps> = ({
  quest,
  onClose,
  onComplete,
}) => {
  const [routineName, setRoutineName] = useState(
    quest.workoutDetails?.routineName || 'Hunter Physical Conditioning'
  );
  const [exercises, setExercises] = useState(
    quest.workoutDetails?.exercises || [
      { name: 'Push-ups', sets: '3', reps: '15' },
      { name: 'Bodyweight Squats', sets: '3', reps: '20' },
      { name: 'Core Plank', sets: '3', reps: '45s' },
    ]
  );

  const [newExName, setNewExName] = useState('');
  const [newExSets, setNewExSets] = useState('3');
  const [newExReps, setNewExReps] = useState('12');

  const [completedExercises, setCompletedExercises] = useState<Record<number, boolean>>({});

  const toggleExerciseCheck = (index: number) => {
    sound.playClick();
    setCompletedExercises((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;
    sound.playClick();
    setExercises((prev) => [
      ...prev,
      { name: newExName.trim(), sets: newExSets || '3', reps: newExReps || '10' },
    ]);
    setNewExName('');
  };

  const handleRemoveExercise = (idx: number) => {
    sound.playClick();
    setExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleClaim = () => {
    sound.playClick();
    onComplete(quest.id, {
      routineName,
      exercises,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="system-panel w-full max-w-lg rounded-2xl p-6 border-cyan-500/50 shadow-2xl relative max-h-[90vh] flex flex-col">
        <div className="system-corner-tl" />
        <div className="system-corner-br" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-sky-900/60 pb-3">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-cyan-400" />
            <h3 className="font-system text-base font-bold tracking-wider text-white">
              WORKOUT CUSTOMIZER & LOG
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm px-2 py-1"
          >
            ✕
          </button>
        </div>

        {/* Routine Name Input */}
        <div className="mt-3">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Routine Title (Customizable to your capacity):
          </label>
          <input
            type="text"
            value={routineName}
            onChange={(e) => setRoutineName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-sm font-bold text-white focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {/* Exercise List */}
        <div className="my-4 flex-1 overflow-y-auto space-y-2 pr-1">
          <div className="text-xs font-mono text-cyan-300">EXERCISE TARGETS:</div>
          {exercises.map((ex, idx) => {
            const isDone = !!completedExercises[idx];
            return (
              <div
                key={idx}
                className={`flex items-center justify-between rounded-lg border p-2.5 transition-all ${
                  isDone
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-slate-300'
                    : 'border-slate-800 bg-slate-900/50 text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => toggleExerciseCheck(idx)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-400"
                    id={`ex-${idx}`}
                  />
                  <label
                    htmlFor={`ex-${idx}`}
                    className={`cursor-pointer text-xs font-semibold ${
                      isDone ? 'line-through text-slate-400' : 'text-slate-100'
                    }`}
                  >
                    {ex.name}
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
                    {ex.sets} sets × {ex.reps}
                  </span>
                  <button
                    onClick={() => handleRemoveExercise(idx)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Remove Exercise"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {exercises.length === 0 && (
            <div className="py-4 text-center text-xs text-slate-500">
              No exercises added yet. Use the form below to craft your workout.
            </div>
          )}

          {/* Add Exercise Form */}
          <form
            onSubmit={handleAddExercise}
            className="mt-3 rounded-lg border border-slate-800/80 bg-slate-900/30 p-2.5 space-y-2"
          >
            <div className="text-[11px] font-semibold text-slate-400">Add Exercise:</div>
            <div className="grid grid-cols-12 gap-2">
              <input
                type="text"
                placeholder="e.g. Pull-ups, Push-ups"
                value={newExName}
                onChange={(e) => setNewExName(e.target.value)}
                className="col-span-6 rounded border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Sets"
                value={newExSets}
                onChange={(e) => setNewExSets(e.target.value)}
                className="col-span-3 rounded border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-white focus:border-cyan-400 focus:outline-none text-center"
              />
              <input
                type="text"
                placeholder="Reps"
                value={newExReps}
                onChange={(e) => setNewExReps(e.target.value)}
                className="col-span-3 rounded border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-white focus:border-cyan-400 focus:outline-none text-center"
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-1.5 w-full rounded bg-slate-800 hover:bg-slate-700 py-1.5 text-xs font-semibold text-cyan-300"
            >
              <Plus className="h-3.5 w-3.5" /> Add Exercise to Routine
            </button>
          </form>
        </div>

        {/* Claim Reward */}
        <div className="border-t border-sky-950 pt-3">
          <button
            onClick={handleClaim}
            disabled={quest.completed}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold uppercase tracking-wider transition-all ${
              quest.completed
                ? 'cursor-not-allowed border border-slate-800 bg-slate-900 text-slate-600'
                : 'border border-cyan-500/50 bg-cyan-500/30 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:bg-cyan-400 hover:text-slate-950'
            }`}
          >
            <CheckCircle className="h-5 w-5" />
            {quest.completed
              ? 'ALREADY CLAIMED TODAY'
              : `SAVE ROUTINE & CLAIM +${quest.xpReward} XP`}
          </button>
        </div>
      </div>
    </div>
  );
};
