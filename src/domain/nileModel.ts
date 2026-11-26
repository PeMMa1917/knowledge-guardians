/** Fictional model parameters. They are neither ancient measurements nor modern route advice. */
export const NILE_TRIALS = {
  ridge: { name: 'Narrow ridge', route: 'ridge', turns: 2, upright: false, line: 'The high crate tips where the ridge turns.' },
  wash: { name: 'Wide wash', route: 'wash', turns: 4, upright: true, line: 'The wider track keeps the high crate upright.' },
} as const;
export type NileRoad = keyof typeof NILE_TRIALS;
export type NileDelivery = 'cast' | 'copy';
export function runNileTrial(road: NileRoad) {
  if (!Object.hasOwn(NILE_TRIALS, road)) throw new Error('That road does not exist in the model.');
  return NILE_TRIALS[road];
}
export const NILE_DELIVERIES = {
  cast: { name: 'Hand courier + cast by the wide wash', line: 'A paper note arrives first; the cast follows intact. The new display can discuss weight and texture too.' },
  copy: { name: 'Hand courier with a paper copy', line: 'The note and image arrive together; the cast stays here. The new display cannot use its weight or texture.' },
} as const;

export function nileDelivery(choice: NileDelivery) {
  if (!Object.hasOwn(NILE_DELIVERIES, choice)) throw new Error('Choose what to send from the archive.');
  return NILE_DELIVERIES[choice];
}
