/**
 * Wenna's barter boat at the ferry landing (economy, Mika 2026-11-25: trade between places, with
 * price parts compared). Wenna sells cloak dyes and trades the materials for the Maker's bench.
 * Every dye price is shown as its parts (material, work, carrying, toll). The same dye costs more in
 * Emberford. Players can open the two price slips side by side.
 * Cosmetic only: a dye adds an outfit colour; it gives no XP and no power. Base colours are always
 * free (appearance is never locked). TOK link: evidence for a judgement, perspective, value and price.
 */
import type { Resource } from './craft';

export interface Dye { id: string; name: string; parts: { material: number; work: number }; note: string }

export const WOAD_BLUE: Dye = {
  id: 'woad', name: 'Woad blue', parts: { material: 2, work: 4 },
  note: 'Dyed with woad leaves. The cloth goes in green and comes out blue in the air.',
};

/** Dye colours (outfit keys in appearance.ts). Plant dyes, made by the ferry folk in this fictional world. */
export const DYES: Dye[] = [
  { id: 'madder', name: 'Madder red', parts: { material: 2, work: 3 }, note: 'Dyed with madder root from the river meadow.' },
  WOAD_BLUE,
  { id: 'weld', name: 'Weld yellow', parts: { material: 1, work: 3 }, note: 'Dyed with weld, a tall plant by the old road.' },
  { id: 'walnut', name: 'Walnut brown', parts: { material: 1, work: 2 }, note: 'Dyed with walnut husks. The easiest dye, and the most patient colour.' },
];

/** What it costs to bring a thing from the ferry landing to a stall in Emberford. */
export const TOWN_COSTS = { carrying: 2, toll: 1, stall: 1 } as const;

export const ferryPrice = (d: Dye): number => d.parts.material + d.parts.work;
export const townPrice = (d: Dye): number => ferryPrice(d) + TOWN_COSTS.carrying + TOWN_COSTS.toll + TOWN_COSTS.stall;

/** Wenna's barter prices for materials, in marks. Ore is rare at the ferry, so she pays well for it. */
export const BARTER: Record<Resource, { buy: number; sell: number }> = {
  reed: { buy: 1, sell: 0 }, clay: { buy: 1, sell: 0 }, ore: { buy: 0, sell: 3 },
};

export const ownsDye = (flags: Record<string, unknown>, id: string): boolean => flags[`owned.dye.${id}`] === true;
