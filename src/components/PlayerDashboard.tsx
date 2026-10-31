/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Flame,
  Heart,
  Zap,
  TrendingUp,
  Edit2,
  Check,
  Award,
  ChevronRight,
  Shield,
  RotateCw,
} from 'lucide-react';
import { PlayerStats, Quest } from '../types/system';
import { getRankForLevel, getXpRequiredForLevel, RANK_TIERS } from '../utils/progression';
import { sound } from '../utils/audio';

interface PlayerDashboardProps {
  stats: PlayerStats;
  quests: Quest[];
  onUpdateName: (newName: string) => void;
  onManualDailyReset: () => void;
}

export const PlayerDashboard: React.FC<PlayerDashboardProps> = ({
  stats,
  quests,
  onUpdateName,
  onManualDailyReset,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(stats.name);
  const [showRanksModal, setShowRanksModal] = useState(false);

  const rankInfo = getRankForLevel(stats.level);
  const xpNeeded = getXpRequiredForLevel(stats.level);
  const xpPercent = Math.min(100, Math.round((stats.currentXp / xpNeeded) * 100));

  const totalQuests = quests.length;
  const completedQuests = quests.filter((q) => q.completed).length;
  const completionPercent = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;
  const todayEarnedXp = quests
    .filter((q) => q.completed)
    .reduce((sum, q) => sum + q.xpReward, 0);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onUpdateName(nameInput.trim());
      setIsEditingName(false);
      sound.playClick();
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Holographic Status Panel */}
      <div className={`system-panel relative overflow-hidden rounded-xl p-5 ${rankInfo.borderGlow} transition-all`}>
        <div className="system-corner-tl" />
        <div className="system-corner-br" />

        {/* Ambient Rank Hue in background */}
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20 blur-3xl"
          style={{ background: rankInfo.accentHex }}
        />

        <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
          {/* Col 1: Player Identity & Rank Avatar (5 cols) */}
          <div className="space-y-3 lg:col-span-5">
            <div className="flex items-start gap-4">
              {/* Rank Crest Emblem */}
              <div
                className="relative flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl border border-sky-400/30 bg-gradient-to-b from-slate-900 to-slate-950 p-2 shadow-inner"
                style={{ borderColor: `${rankInfo.accentHex}66` }}
              >
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                  RANK
                </span>
                <span
                  className="font-system text-2xl font-black tracking-wider"
                  style={{ color: rankInfo.accentHex }}
                >
                  {rankInfo.tier.split('-')[0]}
                </span>
                <button
                  onClick={() => setShowRanksModal(true)}
                  aria-label="View all ranks progression tier list"
                  className="mt-1 flex items-center text-[9px] font-semibold uppercase text-cyan-400 hover:text-cyan-200"
                >
                  TIERS <ChevronRight className="h-2.5 w-2.5" />
                </button>
              </div>

              {/* Name & Title */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-system text-xs font-bold tracking-widest text-cyan-400">
                    HUNTER STATUS
                  </span>
                  <span className="rounded bg-sky-950/80 px-1.5 py-0.5 font-mono text-[10px] text-sky-300 border border-sky-800/40">
                    AWAKENED
                  </span>
                </div>

                {isEditingName ? (
                  <form onSubmit={handleSaveName} className="mt-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="rounded border border-cyan-500 bg-slate-900 px-2 py-0.5 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      autoFocus
                      maxLength={24}
                    />
                    <button
                      type="submit"
                      aria-label="Save hunter name"
                      className="flex h-7 w-7 items-center justify-center rounded bg-cyan-600 text-slate-950 hover:bg-cyan-400"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  </form>
                ) : (
                  <div className="mt-0.5 flex items-center gap-2">
                    <h2 className="truncate font-heading text-xl font-bold tracking-wide text-white sm:text-2xl">
                      {stats.name}
                    </h2>
                    <button
                      onClick={() => {
                        setNameInput(stats.name);
                        setIsEditingName(true);
                      }}
                      aria-label="Edit hunter name"
                      className="flex items-center gap-1 rounded bg-slate-800/80 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 hover:bg-cyan-950/80 hover:text-cyan-200 transition-colors border border-slate-700/60"
                      title="Edit Hunter Name (नाम बदलें)"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Edit Name</span>
                    </button>
                  </div>
                )}

                <p className="mt-0.5 text-xs font-medium text-slate-300">
                  {rankInfo.title}
                </p>

                {/* Level badge */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-md border border-cyan-500/40 bg-cyan-950/50 px-2.5 py-1 text-xs font-bold text-cyan-300">
                    <Zap className="h-3.5 w-3.5 text-cyan-400" />
                    <span>LEVEL {stats.level}</span>
                  </div>
                  <span className="font-mono text-xs text-slate-400">
                    Total XP: {stats.totalXpEarned}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: Level XP Bar & Vitals (4 cols) */}
          <div className="space-y-3 lg:col-span-4">
            {/* XP Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="font-semibold text-cyan-300 flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" /> EXPERIENCE MATRIX
                </span>
                <span className="text-slate-300">
                  <strong className="text-white">{stats.currentXp}</strong> / {xpNeeded} XP
                  <span className="ml-1 text-cyan-400">({xpPercent}%)</span>
                </span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full border border-sky-500/30 bg-slate-900/90 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 transition-all duration-700 ease-out"
                  style={{ width: `${xpPercent}%` }}
                />
                {/* Glow shimmer */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
                  }}
                />
              </div>
            </div>

            {/* Vitals: HP and Willpower */}
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
              {/* HP Bar */}
              <div className="rounded-lg border border-rose-500/20 bg-rose-950/20 p-2">
                <div className="flex items-center justify-between text-rose-300">
                  <span className="flex items-center gap-1 font-semibold text-[11px]">
                    <Heart className="h-3 w-3 text-rose-400" /> HP VITALITY
                  </span>
                  <span>{stats.hp}/{stats.maxHp}</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-900">
                  <div
                    className="h-full bg-rose-500"
                    style={{ width: `${(stats.hp / stats.maxHp) * 100}%` }}
                  />
                </div>
              </div>

              {/* Willpower Bar */}
              <div className="rounded-lg border border-indigo-500/20 bg-indigo-950/20 p-2">
                <div className="flex items-center justify-between text-indigo-300">
                  <span className="flex items-center gap-1 font-semibold text-[11px]">
                    <Shield className="h-3 w-3 text-indigo-400" /> WILLPOWER
                  </span>
                  <span>{stats.willpower}/{stats.maxWillpower}</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-900">
                  <div
                    className="h-full bg-indigo-500"
                    style={{ width: `${(stats.willpower / stats.maxWillpower) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Col 3: Streak & Today's Quest Rate (3 cols) */}
          <div className="flex items-center justify-between rounded-xl border border-sky-500/20 bg-slate-900/60 p-3 sm:p-4 lg:col-span-3 lg:flex-col lg:items-start lg:justify-center lg:space-y-3">
            {/* Streak Counter */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-950/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                <Flame className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <div className="font-system text-base font-bold text-amber-300 sm:text-lg">
                  {stats.currentStreak} DAYS
                </div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                  Best: {stats.longestStreak} Days Streak
                </div>
              </div>
            </div>

            {/* Today's Mission Score */}
            <div className="border-l border-slate-800 pl-4 lg:border-l-0 lg:border-t lg:border-slate-800 lg:pl-0 lg:pt-2 w-full">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Today Cleared:</span>
                <span className="font-bold text-cyan-300">
                  {completedQuests} / {totalQuests}
                </span>
              </div>
              <div className="mt-0.5 flex items-center justify-between text-[11px] text-slate-400">
                <span>Today's XP:</span>
                <span className="font-mono text-emerald-400">+{todayEarnedXp} XP</span>
              </div>
              {/* Daily Reset button trigger */}
              <button
                onClick={onManualDailyReset}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded border border-slate-700 bg-slate-800/60 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
                title="Reset daily quest checkboxes for a new cycle"
              >
                <RotateCw className="h-3 w-3" />
                <span>Reset Daily Tasks</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Solo Leveling Rank Tier List Modal */}
      {showRanksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="system-panel max-w-lg w-full rounded-2xl p-6 border-cyan-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-sky-900/60 pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-cyan-400" />
                <h3 className="font-system text-base font-bold tracking-wider text-white">
                  SOLO LEVELING RANK TIERS
                </h3>
              </div>
              <button
                onClick={() => setShowRanksModal(false)}
                className="text-slate-400 hover:text-white text-sm px-2 py-1"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Your real-life actions directly power up your Hunter Rank. Advance your level by completing daily discipline blocks.
            </p>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {RANK_TIERS.map((tier) => {
                const isCurrent = tier.tier === rankInfo.tier;
                return (
                  <div
                    key={tier.tier}
                    className={`flex items-center justify-between rounded-lg border p-3 transition-all ${
                      isCurrent
                        ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                        : 'border-slate-800 bg-slate-900/40 text-slate-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="font-system font-black tracking-wider text-sm"
                          style={{ color: tier.accentHex }}
                        >
                          {tier.tier}
                        </span>
                        {isCurrent && (
                          <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/40">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-300">{tier.title}</div>
                    </div>
                    <div className="font-mono text-xs font-semibold text-slate-400">
                      LVL {tier.minLevel}{tier.maxLevel < 999 ? `–${tier.maxLevel}` : '+'}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-sky-900/40 pt-3 text-center">
              <button
                onClick={() => setShowRanksModal(false)}
                className="rounded-lg bg-cyan-600 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors"
              >
                RETURN TO SYSTEM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
