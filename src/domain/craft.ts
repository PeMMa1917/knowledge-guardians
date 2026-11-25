/**
 * Gathering and crafting (Mika 2026-11-25). The player gathers ore, clay and reeds from places in the
 * world (each place gives 2 once a day), then makes simple measuring tools at the Maker's bench.
 * Every tool must be calibrated: a short question about checking an instrument against something
 * known. Any answer makes the tool; only a checked tool is marked 'calibrated', and the player can
 * calibrate again at any time. TOK link: methods, measurement, error. Pure rules, no DOM.
 */
export type Resource = 'ore' | 'clay' | 'reed';
export const RESOURCES: Record<Resource, string> = { ore: 'Iron ore', clay: 'River clay', reed: 'Reeds' };
export const GATHER_YIELD = 2;

export interface Recipe {
  id: string; name: string; item: string; cost: Partial<Record<Resource, number>>; use: string;
  check: { q: string; options: { text: string; ok: boolean; why: string }[] };
}

export const RECIPES: Recipe[] = [
  { id: 'rain-gauge', name: 'Rain gauge', item: 'item.rain-gauge', cost: { clay: 2, reed: 1 }, use: 'A clay cup with a scale, to measure rain.',
    check: { q: "After the same shower, your new gauge reads 12 and Noa's old gauge reads 10. What do you do?", options: [
      { text: 'Mine is new, so mine is right.', ok: false, why: 'New is not the same as accurate. A new tool has not been checked yet.' },
      { text: "Noa's is older, so it is right.", ok: false, why: 'Old tools drift too. Age does not show which one is right.' },
      { text: 'Pour the same measured jug of water into both, and see which one is off.', ok: true, why: 'Yes: check both against something known. That is calibration.' },
    ] } },
  { id: 'plumb-line', name: 'Plumb line', item: 'item.plumb-line', cost: { ore: 2, reed: 1 }, use: 'A weight on a string, to check that a wall is upright.',
    check: { q: 'A wall looks straight to your eye. Your plumb line shows it leans a finger at the top. What do you do?', options: [
      { text: 'Trust my eyes. I have looked at many walls.', ok: false, why: 'Eyes are good at many things, but small leans fool them.' },
      { text: 'Trust the line, but first check it hangs still and does not touch the wall.', ok: true, why: 'Yes: trust the tool, after you check that it is working as it should.' },
      { text: 'Take the middle of the two answers.', ok: false, why: 'The middle of a good reading and a poor one is not better than the good one.' },
    ] } },
  { id: 'reed-pen', name: 'Reed pen', item: 'item.reed-pen', cost: { reed: 2 }, use: 'A pen cut from a reed, for clear labels.',
    check: { q: "You write a date with your new pen. The ink is thick, and Keeper Oduya cannot read it. You can. What do you do?", options: [
      { text: 'It is fine. I can read it.', ok: false, why: 'A record is for other people too. If they cannot read it, it does not do its job.' },
      { text: 'Recut the nib, write it again, and ask Oduya to read it back.', ok: true, why: 'Yes: test a record on its reader, not only on its writer.' },
      { text: 'Add more words around the date to explain it.', ok: false, why: 'More words do not fix a date that nobody can read.' },
    ] } },
];

export const resCount = (flags: Record<string, unknown>, r: Resource): number => Number(flags[`res.${r}`] ?? 0);

/** Why a recipe cannot be made now, or null. */
export function cannotCraft(flags: Record<string, unknown>, id: string): string | null {
  const r = RECIPES.find((x) => x.id === id);
  if (!r) return 'Unknown recipe';
  for (const [k, n] of Object.entries(r.cost) as [Resource, number][]) if (resCount(flags, k) < n) return `You need ${n} ${RESOURCES[k].toLowerCase()}`;
  return null;
}
