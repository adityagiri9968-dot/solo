/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Dumbbell,
  Shield,
  Sparkles,
  Check,
  Plus,
  Play,
  Brain,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Flame,
  Award,
  Layers,
} from 'lucide-react';
import { Quest, QuestCategory } from '../types/system';
import { sound } from '../utils/audio';

interface QuestListProps {
  quests: Quest[];
  onCompleteQuest: (questId: string) => void;
  onUncompleteQuest: (questId: string) => void;
  onOpenTimerModal: (quest: Quest) => void;
  onOpenRecallModal: (quest: Quest) => void;
  onOpenWorkoutModal: (quest: Quest) => void;
  onOpenAddCustomModal: () => void;
  onDeleteCustomQuest: (questId: string) => void;
}

export const QuestList: React.FC<QuestListProps> = ({
  quests,
  onCompleteQuest,
  onUncompleteQuest,
  onOpenTimerModal,
  onOpenRecallModal,
  onOpenWorkoutModal,
  onOpenAddCustomModal,
  onDeleteCustomQuest,
}) => {
  const [activeCategory, setActiveCategory] = useState<QuestCategory | 'all'>('all');
  const [showPrivateMissions, setShowPrivateMissions] = useState(true);

  const filteredQuests = quests.filter((q) => {
    if (activeCategory !== 'all' && q.category !== activeCategory) {
      return false;
    }
    return true;
  });

  const allCompleted = quests.length > 0 && quests.every((q) => q.completed);

  const getCategoryIcon = (category: QuestCategory) => {
    switch (category) {
      case 'study':
        return <BookOpen className="h-4 w-4 text-cyan-400" />;
      case 'workout':
        return <Dumbbell className="h-4 w-4 text-blue-400" />;
      case 'discipline':
        return <Shield className="h-4 w-4 text-purple-400" />;
      default:
        return <Sparkles className="h-4 w-4 text-amber-400" />;
    }
  };

  const getCategoryColor = (category: QuestCategory) => {
    switch (category) {
      case 'study':
        return 'border-cyan-500/30 text-cyan-400 bg-cyan-950/20';
      case 'workout':
        return 'border-blue-500/30 text-blue-400 bg-blue-950/20';
      case 'discipline':
        return 'border-purple-500/30 text-purple-400 bg-purple-950/20';
      default:
        return 'border-amber-500/30 text-amber-400 bg-amber-950/20';
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Tabs & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/70 p-1" role="tablist">
          <button
            onClick={() => {
              sound.playClick();
              setActiveCategory('all');
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wider transition-colors ${
              activeCategory === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            ALL ({quests.length})
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveCategory('study');
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wider transition-colors ${
              activeCategory === 'study'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            STUDY ({quests.filter((q) => q.category === 'study').length})
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveCategory('workout');
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wider transition-colors ${
              activeCategory === 'workout'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Dumbbell className="h-3.5 w-3.5" />
            WORKOUT ({quests.filter((q) => q.category === 'workout').length})
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveCategory('discipline');
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wider transition-colors ${
              activeCategory === 'discipline'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            DISCIPLINE ({quests.filter((q) => q.category === 'discipline').length})
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveCategory('custom');
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wider transition-colors ${
              activeCategory === 'custom'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            CUSTOM ({quests.filter((q) => q.category === 'custom').length})
          </button>
        </div>

        {/* Action Buttons: Add Custom & Privacy Mask */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPrivateMissions(!showPrivateMissions)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            title="Toggle Privacy Blur on sensitive self-control quests"
          >
            {showPrivateMissions ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">
              {showPrivateMissions ? 'Private View' : 'Conceal Sensitive'}
            </span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenAddCustomModal();
            }}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/50 bg-cyan-500/20 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300 hover:bg-cyan-400 hover:text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.2)] transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            NEW MISSION
          </button>
        </div>
      </div>

      {/* 100% Cleared Celebration Banner */}
      {allCompleted && (
        <div className="system-panel rounded-xl border-emerald-500/50 bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-950 p-4 text-center shadow-[0_0_25px_rgba(16,185,129,0.2)]">
          <div className="flex items-center justify-center gap-2 text-emerald-400 font-system text-base font-bold tracking-wider">
            <Award className="h-5 w-5" />
            [DAILY QUEST CLEARED: ALL OBJECTIVES SATISFIED]
          </div>
          <p className="mt-1 text-xs text-slate-300">
            Outstanding discipline, Hunter. Your daily matrix is fully synchronized. Rest, consolidate, and awaken stronger tomorrow.
          </p>
        </div>
      )}

      {/* Quest Cards Grid */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {filteredQuests.map((quest) => {
          const isDone = quest.completed;
          const isPrivateConcealed = quest.isPrivate && !showPrivateMissions;

          return (
            <div
              key={quest.id}
              className={`system-panel group relative overflow-hidden rounded-xl p-4 transition-all duration-300 ${
                isDone
                  ? 'border-emerald-500/40 bg-emerald-950/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'border-slate-800/80 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.12)]'
              }`}
            >
              <div className="system-corner-tl opacity-60" />
              <div className="system-corner-br opacity-60" />

              <div className="flex items-start justify-between gap-3">
                {/* Category & Status */}
                <div className="flex items-center gap-2">
                  <span
                    className={`flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getCategoryColor(
                      quest.category
                    )}`}
                  >
                    {getCategoryIcon(quest.category)}
                    {quest.category}
                  </span>

                  {quest.isPrivate && (
                    <span className="flex items-center gap-1 rounded bg-purple-950/60 px-1.5 py-0.5 text-[10px] text-purple-300 border border-purple-800/40">
                      <Lock className="h-2.5 w-2.5" /> Private
                    </span>
                  )}
                </div>

                {/* XP Reward Badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-xs font-bold ${
                      isDone ? 'text-emerald-400' : 'text-cyan-400'
                    }`}
                  >
                    +{quest.xpReward} XP
                  </span>

                  {quest.isCustom && (
                    <button
                      onClick={() => onDeleteCustomQuest(quest.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="Delete Custom Mission"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div className="mt-2.5">
                <h3
                  className={`font-heading text-lg font-bold tracking-wide transition-colors ${
                    isDone
                      ? 'text-emerald-200 line-through opacity-80'
                      : 'text-white group-hover:text-cyan-100'
                  } ${isPrivateConcealed ? 'blur-sm select-none' : ''}`}
                >
                  {isPrivateConcealed ? 'Confidential Self-Control Goal' : quest.title}
                </h3>

                {quest.titleHindi && !isPrivateConcealed && (
                  <p className="text-xs text-cyan-400/80 font-medium">
                    {quest.titleHindi}
                  </p>
                )}

                <p
                  className={`mt-1 text-xs text-slate-400 ${
                    isPrivateConcealed ? 'blur-sm select-none' : ''
                  }`}
                >
                  {isPrivateConcealed
                    ? 'Private discipline objective. Toggle private view in the top right to unblur.'
                    : quest.description}
                </p>
              </div>

              {/* Interactive Actions & Claim Button */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-900/80 pt-3">
                {/* Specific tool buttons */}
                <div className="flex items-center gap-1.5">
                  {quest.interactionType === 'timer' && (
                    <button
                      onClick={() => onOpenTimerModal(quest)}
                      aria-label={`Start timer for ${quest.title}`}
                      className="flex items-center gap-1 rounded-md border border-sky-500/30 bg-sky-950/40 px-2.5 py-1 text-xs font-semibold text-cyan-300 hover:border-cyan-400 hover:bg-sky-900/50 transition-colors"
                    >
                      <Play className="h-3 w-3" />
                      <span>Focus Timer</span>
                    </button>
                  )}

                  {quest.interactionType === 'recall' && (
                    <button
                      onClick={() => onOpenRecallModal(quest)}
                      aria-label={`Open recall pad for ${quest.title}`}
                      className="flex items-center gap-1 rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2.5 py-1 text-xs font-semibold text-cyan-300 hover:border-cyan-400 hover:bg-cyan-900/50 transition-colors"
                    >
                      <Brain className="h-3 w-3" />
                      <span>Recall Pad (5)</span>
                    </button>
                  )}

                  {quest.interactionType === 'workout_builder' && (
                    <button
                      onClick={() => onOpenWorkoutModal(quest)}
                      aria-label={`Customize workout for ${quest.title}`}
                      className="flex items-center gap-1 rounded-md border border-blue-500/30 bg-blue-950/40 px-2.5 py-1 text-xs font-semibold text-blue-300 hover:border-blue-400 hover:bg-blue-900/50 transition-colors"
                    >
                      <Dumbbell className="h-3 w-3" />
                      <span>Customize Workout</span>
                    </button>
                  )}
                </div>

                {/* Primary Completion Button with Duplicate Prevention */}
                {isDone ? (
                  <button
                    onClick={() => onUncompleteQuest(quest.id)}
                    aria-label={`Undo completion for ${quest.title}`}
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-500/50 bg-emerald-950/60 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:border-amber-500/50 hover:bg-amber-950/40 hover:text-amber-300 transition-colors"
                    title="Click to undo if marked by accident (rolls back XP)"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>CLEARED (Undo)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onCompleteQuest(quest.id)}
                    aria-label={`Complete and claim ${quest.title}`}
                    className="flex items-center gap-1.5 rounded-lg border border-cyan-500/50 bg-cyan-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300 hover:bg-cyan-400 hover:text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.25)] transition-all"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>COMPLETE & CLAIM</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
