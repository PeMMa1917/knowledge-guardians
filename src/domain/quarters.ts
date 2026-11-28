/**
 * The Guardian's quarters (spec 12.16 and 32.6): a room in the Nexus that the player
 * decorates from preset parts and fills with keepsakes earned in play. The ceiling is
 * the Star Chart: one star for each part of a concept ring the player has filled.
 * Cosmetic only: nothing here gives XP. Pure rules, no DOM.
 */
export const WALLS: Record<string, { name: string; base: string; line: string; kind: 'plain' | 'stripe' | 'brick' | 'panel' | 'dots' }> = {
  plaster: { name: 'Warm plaster', base: '#d8c7a3', line: '#c7b58f', kind: 'plain' },
  stripe: { name: 'Green stripes', base: '#4f6b4a', line: '#5e7c58', kind: 'stripe' },
  brick: { name: 'Old brick', base: '#8a4a3a', line: '#6b382c', kind: 'brick' },
  panel: { name: 'Oak panels', base: '#7a5230', line: '#5b3b22', kind: 'panel' },
  night: { name: 'Night-blue dots', base: '#2c3566', line: '#e9cf7a', kind: 'dots' },
  rose: { name: 'Rose limewash', base: '#c98d8d', line: '#b67b7b', kind: 'plain' },
  // From Corvan's stall (src/domain/shop.ts):
  cant: { name: 'River-cant script paper', base: '#2f4a5a', line: '#9fd3ff', kind: 'stripe' },
  ember: { name: 'Ember-glaze tiles', base: '#7a2e1e', line: '#ffad5c', kind: 'brick' },
};
export const FLOORS: Record<string, { name: string; a: string; b: string; kind: 'boards' | 'tiles' | 'stone' }> = {
  boards: { name: 'Pine boards', a: '#a87445', b: '#8a5a30', kind: 'boards' },
  dark: { name: 'Dark boards', a: '#5b3b22', b: '#4a2f1b', kind: 'boards' },
  tiles: { name: 'Red and cream tiles', a: '#b8483e', b: '#efe6cf', kind: 'tiles' },
  stone: { name: 'Grey flagstones', a: '#8b8f99', b: '#6f737d', kind: 'stone' },
  guild: { name: 'Guild-hall chequers', a: '#2a2440', b: '#c9a24a', kind: 'tiles' },
};
export const RUGS: Record<string, { name: string; a: string; b: string } | null> = {
  none: null,
  wine: { name: 'Wine and gold', a: '#7a1f3a', b: '#e9c45a' },
  sea: { name: 'Sea and sand', a: '#2b6d8f', b: '#e8d7a8' },
  moss: { name: 'Moss and cream', a: '#476b3a', b: '#efe6cf' },
  dusk: { name: 'Dusk violet', a: '#4b3a7a', b: '#c39bff' },
  river: { name: 'Ferry-folk weave', a: '#1f5a6b', b: '#f3c969' },
};
export const LAMPS: Record<string, { name: string; glow: string }> = {
  lantern: { name: 'Brass lantern', glow: '#ffd28a' },
  moonshade: { name: 'Spare Moon paper lantern', glow: '#ffdda3' },
  candle: { name: 'Tall candle', glow: '#ffe2a8' },
  lumen: { name: 'Lumen jar', glow: '#9fe8ff' },
  forge: { name: 'Ember bowl', glow: '#ff9a5a' },
  wall: { name: 'A lamp like the Lamp Wall', glow: '#ffe7a0' },
};
export const VIEWS: Record<string, { name: string; sky: string; ground: string; kind: 'stars' | 'roofs' | 'sea' | 'hills' }> = {
  stars: { name: 'Nexus stars', sky: '#141a3a', ground: '#232a52', kind: 'stars' },
  roofs: { name: 'Emberford roofs', sky: '#f2b880', ground: '#7a3d2a', kind: 'roofs' },
  sea: { name: 'Grey sea', sky: '#9fb7c8', ground: '#3f6f86', kind: 'sea' },
  hills: { name: 'Green hills', sky: '#bfe3f0', ground: '#4f8a4a', kind: 'hills' },
  river: { name: 'The ferry river at dusk', sky: '#e7a06a', ground: '#2b6f9a', kind: 'sea' },
};
export const PLANTS: Record<string, { name: string; leaf: string; flower?: string } | null> = {
  none: null,
  fern: { name: 'Fern', leaf: '#3f7a3a' },
  geranium: { name: 'Red geranium', leaf: '#4f8a4a', flower: '#d9534a' },
  lavender: { name: 'Lavender', leaf: '#6a8a5a', flower: '#a98be0' },
  cactus: { name: 'Small cactus', leaf: '#5f9a5a', flower: '#ffd75e' },
  reeds: { name: 'River reeds', leaf: '#7a8a3a', flower: '#b98d55' },
};
/** A room companion (cosmetic): it sleeps, blinks or wanders a little. */
export const PETS: Record<string, { name: string } | null> = {
  none: null,
  cat: { name: 'Ginger cat' },
  owl: { name: 'Little owl' },
  tortoise: { name: 'Tortoise' },
  hedgehog: { name: 'Hedgehog' },
  fox: { name: 'Sleepy fox cub' },
  axolotl: { name: 'Axolotl in a bowl' },
};
/** Shelf places. Rooms saved with the older six places are padded to eight. */
export const SLOTS = 8;

export interface Room { wall: string; floor: string; rug: string; lamp: string; view: string; plant: string; pet?: string; shelf: (string | null)[] }
export const DEFAULT_ROOM: Room = { wall: 'plaster', floor: 'boards', rug: 'wine', lamp: 'lantern', view: 'stars', plant: 'fern', pet: 'none', shelf: Array(SLOTS).fill(null) };

const ID = /^[a-z0-9-]{1,24}$/;

/** "wall.floor.rug.lamp.view.plant[.pet]|k1,k2,,k4,,". Strict: unknown parts give null. No pet: no 7th part (old saves stay the same). */
export function encodeRoom(r: Room): string {
  const parts = [r.wall, r.floor, r.rug, r.lamp, r.view, r.plant];
  if (r.pet && r.pet !== 'none') parts.push(r.pet);
  return `${parts.join('.')}|${r.shelf.map((x) => x ?? '').join(',')}`;
}
export function decodeRoom(s: unknown): Room | null {
  if (typeof s !== 'string') return null;
  const [look, shelf = ''] = s.split('|');
  const [wall, floor, rug, lamp, view, plant, pet = 'none', ...rest] = look.split('.');
  if (rest.length || !(pet in PETS) || !(wall in WALLS) || !(floor in FLOORS) || !(rug in RUGS) || !(lamp in LAMPS) || !(view in VIEWS) || !(plant in PLANTS)) return null;
  const items = shelf.split(',');
  if (items.length === 6) items.push(...Array(SLOTS - 6).fill(''));
  if (items.length !== SLOTS || items.some((x) => x !== '' && !ID.test(x))) return null;
  return { wall, floor, rug, lamp, view, plant, pet, shelf: items.map((x) => x || null) };
}

/** Put a keepsake in a slot. A keepsake sits in one slot only; null clears the slot. */
export function placeKeepsake(r: Room, slot: number, id: string | null): Room {
  if (slot < 0 || slot >= SLOTS) throw new Error('No such shelf slot');
  const shelf = r.shelf.map((x) => (id && x === id ? null : x));
  shelf[slot] = id;
  return { ...r, shelf };
}

/** Stars on the Star Chart for one concept ring: up to 5, one for each fifth filled. */
export function starsFor(got: number, max: number): number {
  if (max <= 0 || got <= 0) return 0;
  return Math.max(1, Math.min(5, Math.floor((got / max) * 5 + 1e-9)));
}

/** Fixed star positions for a concept (index 0..11): a small constellation in its own sector. */
export function starPoints(index: number, n: number, width: number, height: number): [number, number][] {
  const cell = width / 12;
  const pts: [number, number][] = [];
  let seed = (index + 1) * 2654435761;
  const rnd = () => { seed = (seed ^ (seed << 13)) >>> 0; seed = (seed ^ (seed >>> 17)) >>> 0; seed = (seed ^ (seed << 5)) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < n; i++) pts.push([Math.round(index * cell + 2 + rnd() * (cell - 4)), Math.round(3 + rnd() * (height - 6))]);
  return pts;
}
