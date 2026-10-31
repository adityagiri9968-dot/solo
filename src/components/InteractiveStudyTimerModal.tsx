/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, Clock, Volume2 } from 'lucide-react';
import { Quest } from '../types/system';
import { sound } from '../utils/audio';

interface InteractiveStudyTimerModalProps {
  quest: Quest;
  onClose: () => void;
  onComplete: (questId: string) => void;
}

export const InteractiveStudyTimerModal: React.FC<InteractiveStudyTimerModalProps> = ({
  quest,
  onClose,
  onComplete,
}) => {
  const initialSeconds = quest.timerDurationSeconds || 30 * 60;
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setHasFinished(true);
            sound.playTimerAlert();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const toggleRun = () => {
    sound.playClick();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    sound.playClick();
    setIsRunning(false);
    setTimeLeft(initialSeconds);
    setHasFinished(false);
  };

  const handleClaim = () => {
    onComplete(quest.id);
    onClose();
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressRatio = (initialSeconds - timeLeft) / initialSeconds;
  const progressPercent = Math.min(100, Math.round(progressRatio * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="system-panel w-full max-w-md rounded-2xl p-6 border-cyan-500/50 shadow-2xl relative">
        <div className="system-corner-tl" />
        <div className="system-corner-br" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-sky-900/60 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-cyan-400" />
            <h3 className="font-system text-base font-bold tracking-wider text-white">
              FOCUS SESSION
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm px-2 py-1"
          >
            ✕
          </button>
        </div>

        {/* Quest Info */}
        <div className="mt-4 text-center">
          <h4 className="font-heading text-xl font-bold text-white">
            {quest.title}
          </h4>
          {quest.titleHindi && (
            <p className="text-xs text-cyan-400/80">{quest.titleHindi}</p>
          )}
          <p className="mt-1 text-xs text-slate-400">{quest.description}</p>
        </div>

        {/* Timer Display */}
        <div className="my-8 flex flex-col items-center justify-center">
          <div className="relative flex h-52 w-52 items-center justify-center rounded-full border-4 border-slate-800 bg-slate-950/80 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            {/* SVG Ring Progress */}
            <svg className="absolute inset-0 h-full w-full -rotate-90">
              <circle
                cx="104"
                cy="104"
                r="96"
                stroke="currentColor"
                strokeWidth="6"
                className="text-slate-900"
                fill="transparent"
              />
              <circle
                cx="104"
                cy="104"
                r="96"
                stroke="currentColor"
                strokeWidth="6"
                className="text-cyan-400 transition-all duration-300"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 96}
                strokeDashoffset={2 * Math.PI * 96 * (1 - progressRatio)}
                strokeLinecap="round"
              />
            </svg>

            {/* Inner Digits */}
            <div className="text-center">
              <div className="font-system text-4xl font-black tracking-wider text-white">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
              <div className="mt-1 font-mono text-[11px] text-cyan-400">
                {hasFinished
                  ? 'SESSION CLEARED'
                  : isRunning
                  ? 'FOCUS PROTOCOL ACTIVE'
                  : 'PAUSED / READY'}
              </div>
              <div className="mt-0.5 font-mono text-[10px] text-slate-500">
                {progressPercent}% Complete
              </div>
            </div>
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={toggleRun}
            className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${
              isRunning
                ? 'bg-amber-600 text-slate-950 hover:bg-amber-500'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-cyan-500/20'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4" /> Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4" /> Start Focus
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:border-slate-500"
            title="Reset Timer"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>

        {/* Complete / Claim Button */}
        <div className="mt-6 border-t border-sky-950 pt-4">
          <button
            onClick={handleClaim}
            disabled={quest.completed}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold uppercase tracking-wider transition-all ${
              quest.completed
                ? 'cursor-not-allowed border border-slate-800 bg-slate-900 text-slate-600'
                : 'border border-emerald-500/50 bg-emerald-600/30 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-500 hover:text-slate-950'
            }`}
          >
            <CheckCircle className="h-5 w-5" />
            {quest.completed ? 'ALREADY CLAIMED TODAY' : `CLAIM +${quest.xpReward} XP`}
          </button>
          <p className="mt-2 text-center text-[11px] text-slate-500">
            Tip: Complete the full session to maximize neural retention and willpower growth.
          </p>
        </div>
      </div>
    </div>
  );
};
