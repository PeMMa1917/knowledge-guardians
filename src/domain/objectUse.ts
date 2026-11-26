export const TRIAL_SIDES = [0, 1] as const;
export type TrialSide = typeof TRIAL_SIDES[number];
type Pair = [number, number];

export type WorkshopBench =
  | { kind: 'clearance'; sample: Pair; opening: Pair; labels: [string, string] }
  | { kind: 'tally'; counts: Pair; margin: Pair; labels: [string, string]; unit: string }
  | { kind: 'seam'; marks: Pair; labels: [string, string] }
  | { kind: 'pulse'; events: number[]; widths: Pair; labels: [string, string] };

export function calculateClearance(bench: Extract<WorkshopBench, { kind: 'clearance' }>, side: TrialSide) {
  const spans = side === 0 ? bench.sample : [bench.sample[1], bench.sample[0]];
  const margins = bench.opening.map((size, i) => Math.round((size - spans[i]) * 10) / 10);
  return { spans, margins };
}

export function calculateTally(bench: Extract<WorkshopBench, { kind: 'tally' }>, side: TrialSide) {
  const base = bench.counts[side];
  const added = bench.margin[side];
  return { base, added, total: base + added };
}

export function seamOffset(bench: Extract<WorkshopBench, { kind: 'seam' }>, side: TrialSide, position: number): number {
  return position - bench.marks[side];
}

export function seenPulses(bench: Extract<WorkshopBench, { kind: 'pulse' }>, side: TrialSide, position: number): number[] {
  return bench.events.filter((point) => point >= position && point < position + bench.widths[side]);
}

export function pulseStart(bench: Extract<WorkshopBench, { kind: 'pulse' }>, side: TrialSide): number {
  return bench.events[side === 0 ? 0 : 2];
}

export function canTakeReading(bench: WorkshopBench, side: TrialSide, position: number): boolean {
  switch (bench.kind) {
    case 'seam': return seamOffset(bench, side, position) === 0;
    case 'pulse': return position === pulseStart(bench, side);
    default: return true;
  }
}
