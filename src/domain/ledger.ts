/**
 * The Guardian's Ledger (Mika 2026-11-25: scores, streaks and visible progress).
 * Pure rules, no DOM. Activity is kept per day on this device in the permanent record:
 * active seconds and concept XP. Nothing here is a grade, and nothing here gives XP.
 *
 * Streaks are kind: a day counts when the player was active for 5 minutes or earned XP.
 * Every 7 days in a row earn a freeze shield (at most 2). A missed day uses a shield, so a
 * rest day does not break a streak. Today never breaks a streak (the day is not over).
 */
export interface DayActivity { xp: number; secs: number }
export type Activity = Record<string, DayActivity>;

export const ACTIVE_DAY_SECS = 300;
export const MAX_SHIELDS = 2;

/** A day key in the player's own time zone, for example 2026-11-25. */
export function dayOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(d: Date, n: number): Date { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }

/** Add time or XP to one day. Returns a new object. */
export function addActivity(a: Activity | undefined, day: string, add: Partial<DayActivity>): Activity {
  const cur = a?.[day] ?? { xp: 0, secs: 0 };
  return { ...(a ?? {}), [day]: { xp: cur.xp + Math.max(0, add.xp ?? 0), secs: cur.secs + Math.max(0, add.secs ?? 0) } };
}

export const isActive = (d: DayActivity | undefined): boolean => !!d && (d.secs >= ACTIVE_DAY_SECS || d.xp > 0);

export interface LedgerSums {
  today: DayActivity; week: DayActivity; month: DayActivity; total: DayActivity;
  weekStreak: number; monthStreak: number;
  activeDays: number; streak: number; bestStreak: number; shields: number;
}

// The current period can still be played. Monday starts the local calendar
// week. UTC ordinals represent local date labels, independent of DST.
function periodIndexes(localDate: string) {
  const [year, month, day] = localDate.split('-').map(Number);
  const ordinal = Math.floor(Date.UTC(year, month - 1, day) / 86400000);
  return { week: Math.floor((ordinal + 3) / 7), month: year * 12 + month - 1 };
}

function currentRun(periods: Set<number>, current: number): number {
  let n = periods.has(current) ? current : current - 1;
  let count = 0;
  while (periods.has(n--)) count++;
  return count;
}

export function ledgerSums(a: Activity | undefined, now: Date): LedgerSums {
  const act = a ?? {};
  const z = (): DayActivity => ({ xp: 0, secs: 0 });
  const add = (t: DayActivity, d: DayActivity) => { t.xp += d.xp; t.secs += d.secs; };
  const today = dayOf(now), monthKey = today.slice(0, 7);
  const weekKeys = new Set(Array.from({ length: 7 }, (_, i) => dayOf(addDays(now, -i))));
  const s: LedgerSums = { today: z(), week: z(), month: z(), total: z(), weekStreak: 0, monthStreak: 0, activeDays: 0, streak: 0, bestStreak: 0, shields: 0 };
  const weeks = new Set<number>(), months = new Set<number>();
  for (const [k, d] of Object.entries(act)) {
    add(s.total, d);
    if (k === today) add(s.today, d);
    if (weekKeys.has(k)) add(s.week, d);
    if (k.startsWith(monthKey)) add(s.month, d);
    if (isActive(d)) {
      s.activeDays++;
      if (k <= today) {
        const period = periodIndexes(k);
        weeks.add(period.week);
        months.add(period.month);
      }
    }
  }
  const current = periodIndexes(today);
  s.weekStreak = currentRun(weeks, current.week);
  s.monthStreak = currentRun(months, current.month);
  // Walk each day from the first active day to today.
  const keys = Object.keys(act).filter((k) => isActive(act[k])).sort();
  if (keys.length) {
    const [y, m, d] = keys[0].split('-').map(Number);
    let day = new Date(y, m - 1, d), streak = 0, shields = 0;
    for (let guard = 0; guard < 4000 && dayOf(day) <= today; guard++, day = addDays(day, 1)) {
      const k = dayOf(day);
      if (isActive(act[k])) {
        streak++;
        if (streak % 7 === 0) shields = Math.min(MAX_SHIELDS, shields + 1);
      } else if (k !== today) {
        if (shields > 0) shields--; else streak = 0;
      }
      s.bestStreak = Math.max(s.bestStreak, streak);
    }
    s.streak = streak; s.shields = shields;
  }
  return s;
}

/** The last `weeks` weeks as a grid (columns are weeks, rows Monday to Sunday), oldest first. */
export function calendarGrid(a: Activity | undefined, now: Date, weeks = 12): { day: string; secs: number; xp: number; future: boolean }[][] {
  const act = a ?? {};
  const dow = (now.getDay() + 6) % 7; // Monday = 0
  const start = addDays(now, -dow - (weeks - 1) * 7);
  const today = dayOf(now);
  return Array.from({ length: weeks }, (_, w) => Array.from({ length: 7 }, (_, r) => {
    const k = dayOf(addDays(start, w * 7 + r));
    return { day: k, secs: act[k]?.secs ?? 0, xp: act[k]?.xp ?? 0, future: k > today };
  }));
}

/** Shade 0 to 4 for a calendar cell, by active minutes. */
export function shade(secs: number): 0 | 1 | 2 | 3 | 4 {
  const m = secs / 60;
  return m <= 0 ? 0 : m < 5 ? 1 : m < 15 ? 2 : m < 30 ? 3 : 4;
}

export function fmtTime(secs: number): string {
  const m = Math.floor(secs / 60), h = Math.floor(m / 60);
  return h ? `${h} h ${m % 60} min` : `${m} min`;
}
