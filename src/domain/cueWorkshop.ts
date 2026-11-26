import type { CampaignState, Effect } from './types';

export const CUE_ORDERS = ['close', 'spaced'] as const;
export const CUE_RUNS = ['clear', 'service'] as const;
export const CUE_READERS = ['walk', 'house'] as const;
export type CueOrder = typeof CUE_ORDERS[number];
export type CueRun = typeof CUE_RUNS[number];
export type CueReader = typeof CUE_READERS[number];
export type CueBeat = 'cue' | 'covered' | 'work' | 'rest';
type Flags = CampaignState['flags'];

const timings: Record<CueOrder, readonly number[]> = { close: [0, 1, 4], spaced: [0, 3, 6] };

/** A discrete timing trial of an invented workshop signal. */
export function cueRun(order: CueOrder, run: CueRun, work: readonly number[]): CueBeat[] {
  return Array.from({ length: 8 }, (_, beat) => {
    const cue = timings[order].includes(beat);
    const masked = run === 'service' && work.includes(beat);
    return cue ? masked ? 'covered' : 'cue' : masked ? 'work' : 'rest';
  });
}

export function cueKey(slug: string) { return `cue-workshop.${slug}`; }

export function cueTrialState(slug: string, flags: Flags) {
  const base = cueKey(slug);
  const order = CUE_ORDERS.find((item) => flags[`${base}.order`] === item);
  const reader = CUE_READERS.find((item) => flags[`${base}.reader`] === item);
  const ready = !!order && CUE_RUNS.every((run) => flags[`${base}.${order}.${run}`] === true);
  const delivered = !!reader && flags[`${base}.received`] === reader;
  return { order, reader, ready, delivered };
}

type Action =
  | { type: 'order'; order: CueOrder }
  | { type: 'try'; run: CueRun }
  | { type: 'send'; reader: CueReader }
  | { type: 'install'; reader: CueReader };

export function cueMove(slug: string, flags: Flags, action: Action): Extract<Effect, { setFlag: string }> | null {
  const base = cueKey(slug);
  const state = cueTrialState(slug, flags);
  switch (action.type) {
    case 'order': return state.reader ? null : { setFlag: `${base}.order`, value: action.order };
    case 'try': return !state.order || state.reader ? null : { setFlag: `${base}.${state.order}.${action.run}`, value: true };
    case 'send': return state.reader || !state.ready ? null : { setFlag: `${base}.reader`, value: action.reader };
    case 'install': return !state.ready || state.reader !== action.reader || state.delivered ? null
      : { setFlag: `${base}.received`, value: action.reader };
  }
}
