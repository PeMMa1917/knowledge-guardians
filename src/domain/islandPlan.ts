/** The fictional island models the same fixed eight-crate order two ways. */
export const ISLAND_ROUTES = ['ridge', 'ferry', 'marsh'] as const;
export const ISLAND_LANDINGS = ['high', 'low'] as const;
export type IslandRoute = typeof ISLAND_ROUTES[number];
export type IslandLanding = typeof ISLAND_LANDINGS[number];
export const ISLAND_CRATES = 8;

const routes = {
  ridge: { capacity: 4, minutes: 18, crossings: 1 },
  ferry: { capacity: 4, minutes: 12, crossings: 2 },
  marsh: { capacity: 2, minutes: 10, crossings: 3 },
} as const;

export function islandPlan(landing: string, route: string) {
  if (landing !== 'high' && landing !== 'low') throw new Error('That landing does not belong to this plan.');
  if (route !== 'ridge' && route !== 'ferry' && route !== 'marsh') throw new Error('That route does not belong to this plan.');
  const record = routes[route];
  const capacity = route === 'ferry' && landing === 'low' ? 2 : record.capacity;
  const circuits = Math.ceil(ISLAND_CRATES / capacity);
  return { capacity, circuits, minutes: record.minutes * circuits, crossings: record.crossings * circuits };
}
