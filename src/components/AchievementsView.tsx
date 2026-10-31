/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Award,
  Sparkles,
  Flame,
  Crown,
  BookOpen,
  Dumbbell,
  Shield,
  Zap,
  CheckCheck,
  Lock,
} from 'lucide-react';
import { Achievement, PlayerStats } from '../types/system';

interface AchievementsViewProps {
  achievements: Achievement[];
  stats: PlayerStats;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({
  achievements,
}) => {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="h-6 w-6 text-amber-400" />;
      case 'Crown':
        return <Crown className="h-6 w-6 text-yellow-400" />;
      case 'BookOpen':
        return <BookOpen className="h-6 w-6 text-cyan-400" />;
      case 'Dumbbell':
        return <Dumbbell className="h-6 w-6 text-blue-400" />;
      case 'Shield':
        return <Shield className="h-6 w-6 text-purple-400" />;
      case 'Zap':
        return <Zap className="h-6 w-6 text-indigo-400" />;
      case 'CheckCheck':
        return <CheckCheck className="h-6 w-6 text-emerald-400" />;
      default:
        return <Sparkles className="h-6 w-6 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Achievements Header Card */}
      <div className="system-panel rounded-2xl p-6 border-cyan-500/40 relative overflow-hidden">
        <div className="system-corner-tl" />
        <div className="system-corner-br" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-cyan-400" />
              <h2 className="font-system text-lg font-bold tracking-wider text-white">
                HUNTER ACCOLADES & BADGES
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              Special system certifications unlocked by proving superior discipline, focus, and physical might.
            </p>
          </div>

          <div className="text-right">
            <div className="font-system text-2xl font-black text-cyan-300">
              {unlockedCount} / {totalCount}
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              {progressPercent}% Unlocked
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-900 border border-sky-950">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((ach) => {
          const isUnlocked = ach.unlocked;

          return (
            <div
              key={ach.id}
              className={`system-panel relative overflow-hidden rounded-xl p-5 transition-all duration-300 ${
                isUnlocked
                  ? 'border-cyan-500/50 bg-cyan-950/20 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                  : 'border-slate-800/80 bg-slate-950/40 opacity-70'
              }`}
            >
              <div className="system-corner-tl opacity-40" />
              <div className="system-corner-br opacity-40" />

              <div className="flex items-start gap-4">
                {/* Badge Icon Frame */}
                <div
                  className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border p-2 ${
                    isUnlocked
                      ? 'border-cyan-400/60 bg-gradient-to-br from-slate-900 to-cyan-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'border-slate-800 bg-slate-900'
                  }`}
                >
                  {isUnlocked ? (
                    getIcon(ach.icon)
                  ) : (
                    <Lock className="h-6 w-6 text-slate-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3
                      className={`truncate font-heading text-base font-bold ${
                        isUnlocked ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      {ach.title}
                    </h3>
                    <span
                      className={`font-mono text-xs font-bold shrink-0 ${
                        isUnlocked ? 'text-cyan-400' : 'text-slate-600'
                      }`}
                    >
                      +{ach.xpBonus} XP
                    </span>
                  </div>

                  {ach.titleHindi && (
                    <p className="text-[11px] text-cyan-400/80 font-medium">
                      {ach.titleHindi}
                    </p>
                  )}

                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    {ach.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-900/90 pt-2 font-mono text-[10px]">
                    <span
                      className={`font-bold ${
                        isUnlocked ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {isUnlocked ? 'STATUS: AWAKENED' : 'STATUS: DORMANT'}
                    </span>
                    {ach.unlockedAt && (
                      <span className="text-slate-500">
                        {new Date(ach.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
