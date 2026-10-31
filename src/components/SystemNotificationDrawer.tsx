/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Bell, CheckCheck, Trash2, X, Zap, ArrowUpCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { SystemNotification } from '../types/system';
import { sound } from '../utils/audio';

interface SystemNotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SystemNotification[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

export const SystemNotificationDrawer: React.FC<SystemNotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearAll,
}) => {
  if (!isOpen) return null;

  const getNotifIcon = (type: SystemNotification['type']) => {
    switch (type) {
      case 'level_up':
        return <Zap className="h-4 w-4 text-amber-400" />;
      case 'rank_up':
        return <ArrowUpCircle className="h-4 w-4 text-rose-400" />;
      case 'quest_complete':
        return <Sparkles className="h-4 w-4 text-cyan-400" />;
      default:
        return <ShieldAlert className="h-4 w-4 text-sky-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm">
      <div className="system-panel h-full w-full max-w-md border-l border-cyan-500/40 p-5 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sky-900/60 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-cyan-400" />
            <h3 className="font-system text-base font-bold tracking-wider text-white">
              SYSTEM NOTIFICATIONS
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white"
            aria-label="Close notifications panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="mt-2 flex items-center justify-between py-2 text-xs font-mono text-slate-400">
          <span>{notifications.length} System Directives</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onMarkAllAsRead();
              }}
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
            >
              <CheckCheck className="h-3 w-3" /> Mark Read
            </button>
            <span>·</span>
            <button
              onClick={() => {
                sound.playClick();
                onClearAll();
              }}
              className="flex items-center gap-1 text-slate-500 hover:text-rose-400"
            >
              <Trash2 className="h-3 w-3" /> Clear
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="mt-2 flex-1 space-y-2.5 overflow-y-auto pr-1">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`rounded-xl border p-3 transition-all ${
                notif.read
                  ? 'border-slate-800/80 bg-slate-900/40 text-slate-400'
                  : 'border-cyan-500/40 bg-cyan-950/30 text-white shadow-[0_0_15px_rgba(6,182,212,0.1)]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-sky-500/30 bg-slate-950">
                    {getNotifIcon(notif.type)}
                  </div>
                  <div>
                    <h4 className="font-system text-xs font-bold tracking-wider text-cyan-300">
                      [{notif.title}]
                    </h4>
                    <span className="font-mono text-[10px] text-slate-500">
                      {new Date(notif.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {notif.xpAwarded && (
                  <span className="rounded bg-cyan-500/20 px-2 py-0.5 font-mono text-xs font-bold text-cyan-300 border border-cyan-500/30">
                    +{notif.xpAwarded} XP
                  </span>
                )}
              </div>

              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                {notif.message}
              </p>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-500 font-mono">
              [NO ACTIVE SYSTEM NOTIFICATIONS]
            </div>
          )}
        </div>

        {/* Bottom Banner */}
        <div className="border-t border-sky-950/80 pt-3 text-center">
          <p className="font-system text-[10px] text-cyan-500/60 tracking-widest">
            SOLO LEVELING PROGRESSION ENGINE V1.0
          </p>
        </div>
      </div>
    </div>
  );
};
