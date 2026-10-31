/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Zap, Award, ArrowUp, Sparkles, Heart, Shield } from 'lucide-react';
import { AddXpResult } from '../utils/progression';
import { sound } from '../utils/audio';

interface LevelUpModalProps {
  levelUpData: AddXpResult;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  levelUpData,
  onClose,
}) => {
  useEffect(() => {
    if (levelUpData.rankPromoted) {
      sound.playRankUp();
    } else {
      sound.playLevelUp();
    }
  }, [levelUpData]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-lg">
      <div className="system-panel w-full max-w-md rounded-2xl p-6 border-cyan-400 shadow-[0_0_60px_rgba(6,182,212,0.5)] relative text-center">
        <div className="system-corner-tl" />
        <div className="system-corner-br" />

        {/* Ambient pulse */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-cyan-500/10 via-transparent to-blue-600/10" />

        {/* Level Up Crest */}
        <div className="relative mx-auto -mt-12 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-cyan-400 bg-slate-950 shadow-[0_0_35px_rgba(6,182,212,0.8)]">
          {levelUpData.rankPromoted ? (
            <Award className="h-10 w-10 text-amber-400 animate-bounce" />
          ) : (
            <Zap className="h-10 w-10 text-cyan-400 animate-pulse" />
          )}
          <div className="system-corner-tl" />
          <div className="system-corner-br" />
        </div>

        {/* System Alert Header */}
        <div className="mt-4">
          <span className="font-system text-xs font-bold tracking-widest text-cyan-400">
            [ SYSTEM NOTIFICATION ]
          </span>
          <h2 className="mt-1 font-system text-3xl font-black tracking-wider text-white">
            {levelUpData.rankPromoted ? 'RANK PROMOTED!' : 'LEVEL UP!'}
          </h2>
        </div>

        {/* Level & Rank Display */}
        <div className="my-5 rounded-xl border border-sky-500/40 bg-slate-900/80 p-4 shadow-inner">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <span className="font-mono text-[10px] text-slate-500 uppercase">Previous</span>
              <div className="font-system text-xl font-bold text-slate-400">
                LVL {levelUpData.oldLevel}
              </div>
            </div>

            <ArrowUp className="h-6 w-6 text-cyan-400 animate-pulse rotate-90" />

            <div className="text-center">
              <span className="font-mono text-[10px] text-cyan-400 uppercase">Ascended</span>
              <div className="font-system text-2xl font-black text-cyan-300 text-electric-glow">
                LVL {levelUpData.newLevel}
              </div>
            </div>
          </div>

          {levelUpData.rankPromoted && (
            <div className="mt-3 border-t border-sky-950 pt-3">
              <span className="font-mono text-xs text-amber-300">
                Rank Promotion: <strong>{levelUpData.newRank}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Stat Rewards */}
        <div className="grid grid-cols-2 gap-2 text-left font-mono text-xs">
          <div className="rounded-lg border border-rose-500/30 bg-rose-950/20 p-2.5 flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-400" />
            <div>
              <div className="text-[10px] text-slate-400">Max Vitality</div>
              <div className="font-bold text-rose-300">+{levelUpData.levelsGained * 5} Max HP</div>
            </div>
          </div>

          <div className="rounded-lg border border-indigo-500/30 bg-indigo-950/20 p-2.5 flex items-center gap-2">
            <Shield className="h-4 w-4 text-indigo-400" />
            <div>
              <div className="text-[10px] text-slate-400">Willpower</div>
              <div className="font-bold text-indigo-300">Restored 100%</div>
            </div>
          </div>
        </div>

        {/* Solo Leveling Quote */}
        <p className="mt-4 text-xs italic text-slate-400">
          "The system will continue to grant power to those who discipline their flesh and mind."
        </p>

        {/* Claim / Dismiss Button */}
        <div className="mt-6">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-system text-sm font-black tracking-wider text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:from-cyan-400 hover:to-blue-500 transition-all"
          >
            CONFIRM EVOLUTION
          </button>
        </div>
      </div>
    </div>
  );
};
