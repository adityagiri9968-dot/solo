/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, CheckCircle, Brain, Sparkles } from 'lucide-react';
import { Quest } from '../types/system';
import { sound } from '../utils/audio';

interface InteractiveRecallModalProps {
  quest: Quest;
  onClose: () => void;
  onComplete: (questId: string, recallItems: string[]) => void;
}

export const InteractiveRecallModal: React.FC<InteractiveRecallModalProps> = ({
  quest,
  onClose,
  onComplete,
}) => {
  const [items, setItems] = useState<string[]>(
    quest.recallItems && quest.recallItems.length === 5
      ? quest.recallItems
      : ['', '', '', '', '']
  );

  const handleItemChange = (index: number, val: string) => {
    const updated = [...items];
    updated[index] = val;
    setItems(updated);
  };

  const filledCount = items.filter((item) => item.trim().length > 0).length;
  const canClaim = filledCount >= 3;

  const handleSaveAndClaim = () => {
    if (!canClaim) return;
    sound.playClick();
    onComplete(quest.id, items);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="system-panel w-full max-w-lg rounded-2xl p-6 border-cyan-500/50 shadow-2xl relative">
        <div className="system-corner-tl" />
        <div className="system-corner-br" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-sky-900/60 pb-3">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-cyan-400" />
            <h3 className="font-system text-base font-bold tracking-wider text-white">
              ACTIVE RECALL PROTOCOL
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm px-2 py-1"
          >
            ✕
          </button>
        </div>

        {/* Description */}
        <div className="mt-3">
          <h4 className="font-heading text-lg font-bold text-white">
            {quest.title}
          </h4>
          <p className="text-xs text-cyan-400/90">
            {quest.titleHindi || 'किताब बंद करके 5 बातें याद करना'}
          </p>
          <p className="mt-1 text-xs text-slate-300">
            Close all books, tabs, and reference notes. Retrieve 5 core insights purely from long-term memory.
          </p>
        </div>

        {/* 5 Input Slots */}
        <div className="my-5 space-y-2.5">
          {items.map((val, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-950/40 font-mono text-xs font-bold text-cyan-300">
                0{idx + 1}
              </span>
              <input
                type="text"
                placeholder={`Key insight or concept #${idx + 1}...`}
                value={val}
                onChange={(e) => handleItemChange(idx, e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>
          ))}
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2">
          <span>Insights Recalled: {filledCount} / 5</span>
          <span className={filledCount >= 3 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
            {filledCount >= 3 ? 'Threshold Satisfied' : 'Enter at least 3 points'}
          </span>
        </div>

        {/* Claim Button */}
        <div className="border-t border-sky-950 pt-3">
          <button
            onClick={handleSaveAndClaim}
            disabled={quest.completed || !canClaim}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold uppercase tracking-wider transition-all ${
              quest.completed
                ? 'cursor-not-allowed border border-slate-800 bg-slate-900 text-slate-600'
                : canClaim
                ? 'border border-cyan-500/50 bg-cyan-500/30 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:bg-cyan-400 hover:text-slate-950'
                : 'cursor-not-allowed border border-slate-800 bg-slate-900 text-slate-500'
            }`}
          >
            <CheckCircle className="h-5 w-5" />
            {quest.completed
              ? 'ALREADY CLAIMED TODAY'
              : `SAVE RECALL & CLAIM +${quest.xpReward} XP`}
          </button>
        </div>
      </div>
    </div>
  );
};
