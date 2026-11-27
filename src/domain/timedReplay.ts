/**
 * Timed replay of a field game (Mika 2026-11-27, decision X-003, docs/audit/DECISIONS.md).
 *
 * A field game is never timed the first time. After the player finishes it once, they may choose to
 * play it again with a clock. The clock counts up: there is no time limit and no fail. The best time is
 * kept in a campaign flag. A timed run gives no extra permanent credit. Pure rules, no DOM.
 */
import { fieldDone } from './fieldgames';

export const bestFlag = (id: string): string => `field.${id}.best`;

/** A timed replay is offered only after the first, untimed play is finished. */
export function canTimedReplay(flags: Record<string, unknown>, id: string): boolean {
  return fieldDone(flags, id);
}

export interface TimedResult {
  seconds: number;
  /** The best time before this run, or null if this is the first timed run. */
  previous: number | null;
  best: number;
  isBest: boolean;
}

/** Whole seconds between start and end, at least 1. */
export function elapsedSeconds(startMs: number, endMs: number): number {
  return Math.max(1, Math.round((endMs - startMs) / 1000));
}

export function timedResult(flags: Record<string, unknown>, id: string, seconds: number): TimedResult {
  const raw = flags[bestFlag(id)];
  const previous = typeof raw === 'number' && Number.isFinite(raw) && raw > 0 ? raw : null;
  const isBest = previous === null || seconds < previous;
  return { seconds, previous, best: isBest ? seconds : previous, isBest };
}

/** Plain words for the clock and the result line. */
export function clockText(seconds: number): string {
  const m = Math.floor(seconds / 60), s = seconds % 60;
  return m ? `${m} min ${String(s).padStart(2, '0')} s` : `${s} s`;
}

export function resultText(r: TimedResult): string {
  if (r.previous === null) return `Your time: ${clockText(r.seconds)}. This is your first timed run.`;
  return r.isBest
    ? `Your time: ${clockText(r.seconds)}. A new best (before: ${clockText(r.previous)}).`
    : `Your time: ${clockText(r.seconds)}. Your best is still ${clockText(r.best)}.`;
}
