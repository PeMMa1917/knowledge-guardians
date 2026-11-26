import { CONCEPTS, type Concept } from '../src/domain/types';

export const FRAMEWORK_PARTS = ['scope', 'perspectives', 'methods-and-tools', 'ethics'] as const;
type Dimension = Concept | typeof FRAMEWORK_PARTS[number];

export interface TimedEncounter {
  minute: number;
  action: string;
  dimensions: readonly Dimension[];
}

export interface CoverageGap {
  dimension: Dimension;
  from: number;
  /** The gap ends just before this encounter. Null means it persists through the end of the trace. */
  until: number | null;
}

/**
 * Check every full trailing window, not just disjoint blocks. An encounter at
 * minute 8 supports windows ending at minute 8 through just before minute 38.
 * Input comes from an author timeline or a timed playtest, never a student save.
 */
export function coverageGaps(end: number, encounters: readonly TimedEncounter[], window = 30): CoverageGap[] {
  if (!Number.isFinite(end) || end < 0 || !Number.isFinite(window) || window <= 0) {
    throw new RangeError('Expected a nonnegative trace length and a positive window length.');
  }
  if (encounters.some(({ minute }) => !Number.isFinite(minute) || minute < 0 || minute > end)) {
    throw new RangeError('Every encounter must fall within the trace.');
  }
  if (end < window) return [];

  const ordered = [...encounters].sort((a, b) => a.minute - b.minute);
  const gaps: CoverageGap[] = [];
  for (const dimension of [...CONCEPTS, ...FRAMEWORK_PARTS]) {
    let coveredUntil = window;
    for (const { minute, dimensions } of ordered) {
      if (!dimensions.includes(dimension)) continue;
      if (minute > coveredUntil) gaps.push({ dimension, from: coveredUntil, until: minute });
      coveredUntil = Math.max(coveredUntil, minute + window);
    }
    if (coveredUntil <= end) gaps.push({ dimension, from: coveredUntil, until: null });
  }
  return gaps;
}
