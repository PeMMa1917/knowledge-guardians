/** A straight approach, with a model square reserved for a handler where needed. */
export const CLEAR_BAY_GAME = 'clear-bay';
export const CLEAR_BAY_DIALOGUE = {
  trials: 'clearbay.trials',
  prepare: 'clearbay.prepare',
  publish: 'clearbay.publish',
} as const;

export function clearBayEntries(game: string): string[] {
  return game === CLEAR_BAY_GAME ? Object.values(CLEAR_BAY_DIALOGUE) : [];
}

export const CLEAR_BAY_TRIALS = [
  { id: 'bare', gate: 'west', load: 3, handler: 0, action: 'Slide the cart template to West without its handler' },
  { id: 'west', gate: 'west', load: 3, handler: 1, action: 'Add the handler and try the cart at West' },
  { id: 'north', gate: 'north', load: 3, handler: 1, action: 'Move the same cart and handler to North' },
  { id: 'parcel', gate: 'west', load: 2, handler: 1, action: 'Try the hand parcel and handler at West' },
] as const;

export type BayTrial = typeof CLEAR_BAY_TRIALS[number];

export function clearanceReading(trial: BayTrial) {
  const width = trial.gate === 'north' ? 4 : 3;
  const needed = trial.load + trial.handler;
  return { width, needed, fits: needed <= width };
}
