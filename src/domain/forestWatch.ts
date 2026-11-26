/** Authored sightings in the fictional Living Forest. Each watch has the same three beats. */
export const FOREST_WINDOWS = ['early', 'late', 'return'] as const;
export type ForestWindow = typeof FOREST_WINDOWS[number];
type Watch = readonly [number | null, number | null, number | null];

export const FOREST_WATCH: Record<string, { name: string; view: string; windows: Record<ForestWindow, Watch> }> = {
  creek: {
    name: 'Creek screen',
    view: 'Reeds hide part of the creek. Count crossings through the gap you can see.',
    windows: { early: [0, 1, 0], late: [1, 0, 2], return: [1, null, 1] },
  },
  ridge: {
    name: 'Ridge overlook',
    view: 'From the ridge, you can see across the opening between two trees.',
    windows: { early: [1, 2, 0], late: [0, 0, 1], return: [0, 1, 1] },
  },
};

export function forestWatch(site: string, window: ForestWindow): Watch {
  if (!Object.hasOwn(FOREST_WATCH, site)) throw new Error('That watch spot is outside the survey.');
  if (!FOREST_WINDOWS.includes(window)) throw new Error('That watch is outside the survey.');
  return FOREST_WATCH[site].windows[window];
}
