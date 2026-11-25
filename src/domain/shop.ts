/**
 * Corvan's stall (economy): cosmetic things for the player's quarters, bought with marks.
 * Marks come from deeds (each lamp lit: 5; each secret: 3). Nothing here gives XP or power.
 * TOK link: before the market Showdown, Corvan's labels shout; after it, they say what he knows.
 * A community that trusts the player gives a fair-friend discount. Pure rules, no DOM.
 */
import type { CampaignState, ContentPack } from './types';
import { trustOf } from './communities';
import { hasTalent } from './talents';

export interface Ware { id: string; part: 'wall' | 'floor' | 'rug' | 'lamp' | 'view' | 'plant'; key: string; price: number; community: string; hype: string; honest: string }

export const WARES: Ware[] = [
  { id: 'wall-cant', part: 'wall', key: 'cant', price: 20, community: 'river', hype: 'Secret wallpaper of the ancient river kings!', honest: 'Wallpaper printed with the river cant. Made this year by ferry-folk printers. Tova checked the words.' },
  { id: 'wall-ember', part: 'wall', key: 'ember', price: 25, community: 'forge', hype: 'Tiles that never crack, forged in dragon fire!', honest: "Glazed tiles from Hesper's kiln. Strong, but they can crack if you drop them." },
  { id: 'floor-guild', part: 'floor', key: 'guild', price: 20, community: 'guild', hype: 'The very floor the founders walked on!', honest: 'New tiles in the old guild-hall pattern. The pattern is old; these tiles are not.' },
  { id: 'rug-river', part: 'rug', key: 'river', price: 15, community: 'river', hype: 'A magic rug that brings good luck!', honest: 'A rug woven by the ferry folk. I cannot show that it brings luck. It is warm.' },
  { id: 'lamp-wall', part: 'lamp', key: 'wall', price: 15, community: 'guild', hype: 'A lamp from the Lamp Wall itself!', honest: 'A copy of a Lamp Wall lamp, made by the guild. The real ones stay on the wall.' },
  { id: 'view-river', part: 'view', key: 'river', price: 10, community: 'river', hype: 'A window that shows the future!', honest: 'A painted window scene of the ferry river at dusk, by Nell the painter. It shows one moment, framed.' },
  { id: 'plant-reeds', part: 'plant', key: 'reeds', price: 5, community: 'market', hype: 'Rare reeds that cure all illness!', honest: 'Reeds from the riverbank, in a pot. Pretty. I know of no cure.' },
];

/** Corvan's labels change after the market Showdown. */
export const honestLabels = (s: CampaignState): boolean => s.flags['sd.corvan.outcome'] !== undefined;

/** A fair-friend discount: 2 marks off when the ware's community trusts you, 4 when you are a friend. */
export function priceFor(w: Ware, s: CampaignState, pack: ContentPack): number {
  const cm = (pack.communities ?? []).find((c) => c.id === w.community);
  const pts = cm ? trustOf(cm, s).pts : 0;
  return Math.max(1, w.price - (pts >= 6 ? 4 : pts >= 4 ? 2 : 0) - (hasTalent(s, 'fairtrade') ? 1 : 0));
}

export const owns = (s: CampaignState, w: Ware): boolean => s.flags[`owned.${w.id}`] === true;

/** Is a quarters option locked (sold at the stall and not bought)? */
export function lockedOption(s: CampaignState, part: string, key: string): Ware | null {
  const w = WARES.find((x) => x.part === part && x.key === key);
  return w && !owns(s, w) ? w : null;
}
