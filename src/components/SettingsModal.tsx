/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings,
  Volume2,
  VolumeX,
  RotateCcw,
  Download,
  Upload,
  User,
  Shield,
  AlertTriangle,
  HeartHandshake,
} from 'lucide-react';
import { PlayerStats } from '../types/system';
import { sound } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onUpdateStats: (newStats: Partial<PlayerStats>) => void;
  onResetAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  stats,
  soundEnabled,
  onToggleSound,
  onUpdateStats,
  onResetAllData,
}) => {
  const [name, setName] = useState(stats.name);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    onUpdateStats({ name: name.trim() || stats.name });
    onClose();
  };

  const handleExportData = () => {
    sound.playClick();
    try {
      const data = {
        stats: localStorage.getItem('system_awakening_stats_v1'),
        quests: localStorage.getItem('system_awakening_quests_v1'),
        history: localStorage.getItem('system_awakening_history_v1'),
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system_awakening_backup_${stats.name.toLowerCase().replace(/\s+/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // export catch
    }
  };

  const handleConfirmReset = () => {
    sound.playClick();
    onResetAllData();
    setShowResetConfirm(false);
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
            <Settings className="h-5 w-5 text-cyan-400" />
            <h3 className="font-system text-base font-bold tracking-wider text-white">
              SYSTEM CONFIGURATION
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm px-2 py-1"
          >
            ✕
          </button>
        </div>

        {/* Settings Body */}
        <div className="my-4 space-y-5">
          {/* Hunter Profile */}
          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
              <User className="h-4 w-4" /> Hunter Identity
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Hunter Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={24}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-cyan-600 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors"
            >
              Update Profile Name
            </button>
          </form>

          {/* Sound Settings */}
          <div className="border-t border-slate-900 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Audio Synthesis Effects</div>
                <div className="text-[11px] text-slate-400">
                  Synthesized Solo Leveling fanfare, chime, and timer alerts.
                </div>
              </div>
              <button
                onClick={onToggleSound}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  soundEnabled
                    ? 'border border-cyan-500/40 bg-cyan-500/20 text-cyan-300'
                    : 'border border-slate-800 bg-slate-900 text-slate-500'
                }`}
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="h-3.5 w-3.5 text-cyan-400" /> Enabled
                  </>
                ) : (
                  <>
                    <VolumeX className="h-3.5 w-3.5" /> Muted
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Data Export */}
          <div className="border-t border-slate-900 pt-4">
            <div className="text-xs font-semibold text-white">Local Storage & Backup</div>
            <p className="text-[11px] text-slate-400">
              All progress is persisted securely in your browser's local memory.
            </p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleExportData}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300"
              >
                <Download className="h-3.5 w-3.5" /> Export Data JSON
              </button>
            </div>
          </div>

          {/* Clean Restart / Non-shaming Reset */}
          <div className="border-t border-slate-900 pt-4">
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3.5">
              <div className="flex items-start gap-2.5">
                <HeartHandshake className="h-5 w-5 shrink-0 text-cyan-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Fresh Restart (Non-Shaming Clean Slate)
                  </h4>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
                    "XP is a record of real momentum, not your worth as a human being. If a week or day went off track, a true Hunter resets without guilt and begins again."
                  </p>
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-rose-500/50 bg-rose-950/40 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-900/60 transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset Progress to Level 1
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4">
            <div className="system-panel max-w-sm w-full rounded-2xl p-5 border-rose-500 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-950/80 border border-rose-500 text-rose-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h4 className="font-system text-base font-bold text-white">
                CONFIRM SYSTEM RESET?
              </h4>
              <p className="text-xs text-slate-300">
                This will clear your current level, streaks, and missions back to the initial awakening state. There is zero shame in starting anew.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-900 py-2 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReset}
                  className="flex-1 rounded-lg bg-rose-600 py-2 text-xs font-bold text-white hover:bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                >
                  Yes, Fresh Start
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
