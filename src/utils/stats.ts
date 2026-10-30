import type { CardStatus } from '../types';

export interface Stats {
  /** Cards graded per local day, keyed YYYY-MM-DD. */
  days: Record<string, number>;
  /** When each graded card comes back. */
  schedule: Record<string, { box: number; due: string }>;
  goal: number;
}

export const EMPTY_STATS: Stats = { days: {}, schedule: {}, goal: 20 };

// Days until a known card returns; each correct answer moves it one box further out
const INTERVALS = [1, 3, 7, 14, 30];

export function dayKey(date = new Date()): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function recordGrade(stats: Stats, id: string, status: CardStatus): Stats {
  const now = new Date();
  const today = dayKey(now);
  const previous = stats.schedule[id]?.box ?? -1;
  const box = status === 'known' ? Math.min(previous + 1, INTERVALS.length - 1) : 0;
  const due = status === 'known' ? dayKey(addDays(now, INTERVALS[box])) : today;
  return {
    ...stats,
    days: { ...stats.days, [today]: (stats.days[today] ?? 0) + 1 },
    schedule: { ...stats.schedule, [id]: { box, due } },
  };
}

/** Consecutive study days. Today not being done yet does not break it. */
export function currentStreak(days: Stats['days']): number {
  let cursor = new Date();
  if (!days[dayKey(cursor)]) cursor = addDays(cursor, -1);
  let streak = 0;
  while (days[dayKey(cursor)]) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function lastSevenDays(days: Stats['days']) {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(now, i - 6);
    return {
      key: dayKey(date),
      label: date.toLocaleDateString(undefined, { weekday: 'narrow' }),
      name: date.toLocaleDateString(undefined, { weekday: 'long' }),
      count: days[dayKey(date)] ?? 0,
    };
  });
}
