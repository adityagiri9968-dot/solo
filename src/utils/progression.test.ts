/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getRankForLevel,
  getXpRequiredForLevel,
  addXp,
  calculateStreak,
  DEFAULT_QUESTS,
  INITIAL_PLAYER_STATS,
} from './progression.ts';

test('Rank tiers match Solo Leveling progression accurately', () => {
  // E-RANK: 1-5
  assert.equal(getRankForLevel(1).tier, 'E-RANK');
  assert.equal(getRankForLevel(5).tier, 'E-RANK');

  // D-RANK: 6-10
  assert.equal(getRankForLevel(6).tier, 'D-RANK');
  assert.equal(getRankForLevel(10).tier, 'D-RANK');

  // C-RANK: 11-20
  assert.equal(getRankForLevel(11).tier, 'C-RANK');
  assert.equal(getRankForLevel(20).tier, 'C-RANK');

  // B-RANK: 21-35
  assert.equal(getRankForLevel(21).tier, 'B-RANK');
  assert.equal(getRankForLevel(35).tier, 'B-RANK');

  // A-RANK: 36-50
  assert.equal(getRankForLevel(36).tier, 'A-RANK');
  assert.equal(getRankForLevel(50).tier, 'A-RANK');

  // S-RANK: 51-75
  assert.equal(getRankForLevel(51).tier, 'S-RANK');
  assert.equal(getRankForLevel(75).tier, 'S-RANK');

  // NATIONAL LEVEL: 76+
  assert.equal(getRankForLevel(76).tier, 'NATIONAL LEVEL');
  assert.equal(getRankForLevel(100).tier, 'NATIONAL LEVEL');
});

test('XP calculation scales smoothly', () => {
  const req1 = getXpRequiredForLevel(1);
  const req2 = getXpRequiredForLevel(2);
  const req10 = getXpRequiredForLevel(10);
  assert.equal(req1, 100);
  assert.ok(req2 > req1, 'Level 2 requires more XP than Level 1');
  assert.ok(req10 > req2, 'Level 10 requires more XP than Level 2');
});

test('addXp correctly increases XP and computes Level Ups', () => {
  const initial = { ...INITIAL_PLAYER_STATS, level: 1, currentXp: 0 };
  
  // Add 50 XP (less than 100) -> no level up
  const r1 = addXp(initial, 50);
  assert.equal(r1.leveledUp, false);
  assert.equal(r1.updatedStats.level, 1);
  assert.equal(r1.updatedStats.currentXp, 50);
  assert.equal(r1.updatedStats.totalXpEarned, 50);

  // Add 60 more XP (total 110 >= 100) -> level up to level 2 with 10 carryover
  const r2 = addXp(r1.updatedStats, 60);
  assert.equal(r2.leveledUp, true);
  assert.equal(r2.levelsGained, 1);
  assert.equal(r2.updatedStats.level, 2);
  assert.equal(r2.updatedStats.currentXp, 10);
  assert.equal(r2.updatedStats.totalXpEarned, 110);
});

test('addXp handles rank promotion when crossing boundary (e.g. L5 -> L6)', () => {
  const level5Stats = {
    ...INITIAL_PLAYER_STATS,
    level: 5,
    currentXp: getXpRequiredForLevel(5) - 10,
  };
  const result = addXp(level5Stats, 20);
  assert.equal(result.leveledUp, true);
  assert.equal(result.newLevel, 6);
  assert.equal(result.oldRank, 'E-RANK');
  assert.equal(result.newRank, 'D-RANK');
  assert.equal(result.rankPromoted, true);
});

test('calculateStreak accurately tracks daily consistency and resets when broken', () => {
  // First time
  const r1 = calculateStreak('', '2026-10-30', 0, 0);
  assert.equal(r1.newStreak, 1);
  assert.equal(r1.streakBroken, false);

  // Same day
  const r2 = calculateStreak('2026-10-30', '2026-10-30', 5, 10);
  assert.equal(r2.newStreak, 5);
  assert.equal(r2.streakIncremented, false);

  // Consecutive day
  const r3 = calculateStreak('2026-10-29', '2026-10-30', 5, 10);
  assert.equal(r3.newStreak, 6);
  assert.equal(r3.streakIncremented, true);
  assert.equal(r3.streakBroken, false);

  // Missed days (compassionate reset to 1)
  const r4 = calculateStreak('2026-10-20', '2026-10-30', 12, 12);
  assert.equal(r4.newStreak, 1);
  assert.equal(r4.streakBroken, true);
  assert.equal(r4.newLongestStreak, 12);
});

test('Default quests include study, workout, and discipline categories', () => {
  assert.ok(DEFAULT_QUESTS.length >= 8);
  const categories = new Set(DEFAULT_QUESTS.map((q) => q.category));
  assert.ok(categories.has('study'));
  assert.ok(categories.has('workout'));
  assert.ok(categories.has('discipline'));

  // Ensure 30 min study (+50), recall 5 (+40), night revision (+30) exist
  const study30 = DEFAULT_QUESTS.find((q) => q.id === 'study-focus-30');
  assert.ok(study30 && study30.xpReward === 50);

  const recall5 = DEFAULT_QUESTS.find((q) => q.id === 'study-recall-5');
  assert.ok(recall5 && recall5.xpReward === 40);

  const nightRev = DEFAULT_QUESTS.find((q) => q.id === 'study-night-revision');
  assert.ok(nightRev && nightRev.xpReward === 30);
});

test('Default player name is initialized to Aditya', () => {
  assert.equal(INITIAL_PLAYER_STATS.name, 'Aditya');
});

