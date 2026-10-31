/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bell,
  Volume2,
  VolumeX,
  Settings,
  Sparkles,
  RotateCcw,
  Calendar,
  CheckSquare,
  Award,
  BookOpen,
  FileText,
} from 'lucide-react';
import { MOTIVATIONAL_SYSTEM_QUOTES } from '../utils/progression';
import { sound } from '../utils/audio';

export type AppTab = 'quests' | 'mitr' | 'records' | 'analytics' | 'achievements';

interface SystemHeaderProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  streak: number;
}

export const SystemHeader: React.FC<SystemHeaderProps> = ({
  currentTab,
  onTabChange,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenSettings,
  soundEnabled,
  onToggleSound,
  streak,
}) => {
  const [quoteIdx, setQuoteIdx] = useState(0);

  const cycleQuote = () => {
    sound.playClick();
    setQuoteIdx((prev) => (prev + 1) % MOTIVATIONAL_SYSTEM_QUOTES.length);
  };

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 border-b border-sky-500/20 bg-slate-950/85 backdrop-blur-md">
      {/* Top Banner Alert Bar */}
      <div className="border-b border-sky-950/80 bg-gradient-to-r from-sky-950/40 via-blue-900/20 to-slate-950 px-4 py-1.5 text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden text-sky-400">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            <span className="font-system text-[11px] font-semibold tracking-wider text-cyan-300">
              SYSTEM ONLINE
            </span>
            <span className="hidden text-slate-600 sm:inline">|</span>
            <button
              onClick={cycleQuote}
              className="group flex items-center gap-1.5 truncate text-left text-slate-300 transition-colors hover:text-cyan-200"
              title="Click for next system directive"
              aria-label="Cycle system directive quote"
            >
              <span className="font-medium tracking-wide">
                "{MOTIVATIONAL_SYSTEM_QUOTES[quoteIdx]}"
              </span>
              <RotateCcw className="h-3 w-3 opacity-40 transition-transform group-hover:rotate-180 group-hover:opacity-100" />
            </button>
          </div>

          <div className="hidden shrink-0 items-center gap-3 font-mono text-[11px] text-slate-400 md:flex">
            <span>{currentDateStr}</span>
            <span>·</span>
            <span className="text-amber-400">🔥 {streak} DAY STREAK</span>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/40 bg-gradient-to-br from-cyan-950/80 to-blue-950/90 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <div className="system-corner-tl" />
            <div className="system-corner-br" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-system text-base font-black tracking-wider text-white sm:text-lg">
                SYSTEM<span className="text-cyan-400">: AWAKENING</span>
              </h1>
            </div>
            <p className="font-mono text-[10px] tracking-widest text-cyan-400/80">
              REAL LIFE LEVELING SYSTEM
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Desktop & Tablet) */}
        <nav className="hidden items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-1 md:flex" aria-label="Main Navigation">
          <button
            onClick={() => {
              sound.playClick();
              onTabChange('quests');
            }}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold tracking-wider transition-all ${
              currentTab === 'quests'
                ? 'border border-cyan-500/40 bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="h-3.5 w-3.5" />
            MISSIONS
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onTabChange('mitr');
            }}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold tracking-wider transition-all ${
              currentTab === 'mitr'
                ? 'border border-cyan-500/40 bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
            MITR (मित्र)
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onTabChange('records');
            }}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold tracking-wider transition-all ${
              currentTab === 'records'
                ? 'border border-cyan-500/40 bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-blue-400" />
            RECORDS
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onTabChange('analytics');
            }}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold tracking-wider transition-all ${
              currentTab === 'analytics'
                ? 'border border-cyan-500/40 bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            STATS
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onTabChange('achievements');
            }}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold tracking-wider transition-all ${
              currentTab === 'achievements'
                ? 'border border-cyan-500/40 bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            BADGES
          </button>
        </nav>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 transition-colors hover:border-cyan-500/40 hover:text-cyan-400"
            title={soundEnabled ? 'Sound Enabled' : 'Sound Muted'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-slate-500" />}
          </button>

          {/* Notifications Drawer Trigger */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenNotifications();
            }}
            aria-label={`View system notifications (${unreadNotificationsCount} unread)`}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 transition-colors hover:border-cyan-500/40 hover:text-cyan-400"
          >
            <Bell className="h-4 w-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 font-mono text-[9px] font-bold text-slate-950 shadow-[0_0_8px_#06b6d4]">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Settings / Reset Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            aria-label="Open System Settings and profile"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 transition-colors hover:border-cyan-500/40 hover:text-cyan-400"
            title="System Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="flex overflow-x-auto no-scrollbar border-t border-slate-900 bg-slate-950/90 px-1 py-1 md:hidden">
        <button
          onClick={() => {
            sound.playClick();
            onTabChange('quests');
          }}
          className={`flex min-w-[72px] flex-1 items-center justify-center gap-1 py-2 text-[11px] font-semibold whitespace-nowrap ${
            currentTab === 'quests' ? 'border-b-2 border-cyan-400 text-cyan-300' : 'text-slate-400'
          }`}
        >
          <CheckSquare className="h-3 w-3" />
          QUESTS
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onTabChange('mitr');
          }}
          className={`flex min-w-[72px] flex-1 items-center justify-center gap-1 py-2 text-[11px] font-semibold whitespace-nowrap ${
            currentTab === 'mitr' ? 'border-b-2 border-cyan-400 text-cyan-300' : 'text-slate-400'
          }`}
        >
          <BookOpen className="h-3 w-3 text-cyan-400" />
          MITR
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onTabChange('records');
          }}
          className={`flex min-w-[72px] flex-1 items-center justify-center gap-1 py-2 text-[11px] font-semibold whitespace-nowrap ${
            currentTab === 'records' ? 'border-b-2 border-cyan-400 text-cyan-300' : 'text-slate-400'
          }`}
        >
          <FileText className="h-3 w-3 text-blue-400" />
          RECORDS
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onTabChange('analytics');
          }}
          className={`flex min-w-[72px] flex-1 items-center justify-center gap-1 py-2 text-[11px] font-semibold whitespace-nowrap ${
            currentTab === 'analytics' ? 'border-b-2 border-cyan-400 text-cyan-300' : 'text-slate-400'
          }`}
        >
          <Calendar className="h-3 w-3" />
          STATS
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onTabChange('achievements');
          }}
          className={`flex min-w-[72px] flex-1 items-center justify-center gap-1 py-2 text-[11px] font-semibold whitespace-nowrap ${
            currentTab === 'achievements' ? 'border-b-2 border-cyan-400 text-cyan-300' : 'text-slate-400'
          }`}
        >
          <Award className="h-3 w-3" />
          BADGES
        </button>
      </div>
    </header>
  );
};
