/**
 * WORLD-02 Aethelgard: Emberford, a guild town (spec 5.4).
 * Fantasy world. Nothing here is a historical record unless an exhibit is
 * labelled "Documented" with a source. 40 x 28 tiles.
 */
import type { MapDef } from './types';

const W = 40, H = 28;
// Plaza (stone) rectangle
const PX = 11, PY = 8, PW = 18, PH = 13;

function plaza(x: number, y: number): string | null {
  if (x < PX || x >= PX + PW || y < PY || y >= PY + PH) return null;
  const l = x === PX, r = x === PX + PW - 1, t = y === PY, b = y === PY + PH - 1;
  if (t && l) return 'stone-tl'; if (t && r) return 'stone-tr';
  if (b && l) return 'stone-bl'; if (b && r) return 'stone-br';
  if (t) return 'stone-t'; if (b) return 'stone-b'; if (l) return 'stone-l'; if (r) return 'stone-r';
  return 'stone-c';
}
// Path south from plaza to portal stone
function path(x: number, y: number): string | null {
  if (x >= 18 && x <= 21 && y >= PY + PH - 1 && y <= 25) return 'stone-c';
  if (x >= 4 && x < PX + 1 && y >= 14 && y <= 16) return 'stone-c';
  return null;
}

function hash(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export const EMBERFORD: MapDef = {
  id: 'aethelgard.emberford',
  name: 'Aethelgard: Emberford market',
  world: 'WORLD-02',
  width: W, height: H,
  music: 'music.town',
  ambience: 'town',
  background: 0x2f6b3a,
  floor: (x, y) => {
    const p = plaza(x, y) ?? path(x, y);
    if (p) return p;
    void hash;
    return 'grass';
  },
  stamps: [
    // North row: houses and the guild hall
    { stamp: 'house-a', x: 2, y: 1 },
    { stamp: 'house-b', x: 26, y: 1 },
    { stamp: 'house-a', x: 32, y: 2 },
    { stamp: 'gatehouse', x: 17, y: 3 },
    { stamp: 'banners', x: 15, y: 4 },
    { stamp: 'banners', x: 21, y: 4 },
    // West: Hesper's smithy
    { stamp: 'house-b', x: 2, y: 8 },
    { stamp: 'forge', x: 8, y: 10 },
    { stamp: 'long-table', x: 5, y: 17 },
    { stamp: 'barrel', x: 8, y: 14 },
    { stamp: 'crates', x: 1, y: 14 },
    // Plaza
    { stamp: 'fountain-0', x: 18, y: 12, anim: ['fountain-0', 'fountain-1', 'fountain-2'] },
    { stamp: 'stall', x: 23, y: 7 },
    { stamp: 'fruit-yellow', x: 12, y: 18 },
    { stamp: 'fruit-red', x: 13, y: 18 },
    { stamp: 'fruit-green', x: 14, y: 18 },
    { stamp: 'bench', x: 14, y: 9 },
    { stamp: 'table', x: 23, y: 15 },
    { stamp: 'well-box', x: 30, y: 15 },
    { stamp: 'sign', x: 17, y: 21 },
    { stamp: 'pot-plant', x: 11, y: 8 },
    { stamp: 'pot-plant', x: 28, y: 8 },
    // Trees and nature
    { stamp: 'tree', x: 34, y: 10 }, { stamp: 'tree', x: 36, y: 14 }, { stamp: 'tree', x: 33, y: 19 },
    { stamp: 'tree', x: 1, y: 21 }, { stamp: 'tree', x: 4, y: 24 }, { stamp: 'tree', x: 9, y: 23 },
    { stamp: 'tree', x: 27, y: 23 }, { stamp: 'tree', x: 31, y: 24 }, { stamp: 'tree', x: 37, y: 21 },
    { stamp: 'tree', x: 37, y: 6 }, { stamp: 'tree', x: 13, y: 2 }, { stamp: 'tree', x: 23, y: 1 },
    { stamp: 'bush', x: 16, y: 23 }, { stamp: 'bush', x: 23, y: 24 }, { stamp: 'bush', x: 30, y: 12 },
    { stamp: 'flowers-white', x: 15, y: 25 }, { stamp: 'flowers-white', x: 24, y: 22 },
    { stamp: 'flowers-white', x: 35, y: 25 },
  ],
  blocks: [
    [0, -1, W, 1], [0, H, W, 1], [-1, 0, 1, H], [W, 0, 1, H],
  ],
  npcs: [
    { id: 'merchant-corvan', x: 25, y: 13, facing: 'down' },
    { id: 'smith-hesper', x: 7, y: 13, facing: 'right' },
    { id: 'guildmaster-orrin', x: 19, y: 7, facing: 'down' },
    { id: 'scholar-sefa', x: 22, y: 14, facing: 'left' },
    { id: 'villager-1', x: 13, y: 17, facing: 'down' },
  ],
  interactables: [
    { id: 'ex-blade', kind: 'exhibit', exhibit: 'OBJ-003-AE', x: 24, y: 11, w: 3, h: 1, label: 'the patterned blade', art: 'blade-on-counter' },
    { id: 'ex-ingots', kind: 'exhibit', exhibit: 'OBJ-002', x: 23, y: 15, w: 3, h: 2, label: "Sefa's catalogue (Met record)", art: 'catalogue' },
    { id: 'ex-assay', kind: 'assay', exhibit: 'AE-ASSAY', x: 30, y: 15, w: 2, h: 2, label: 'the assay table', art: 'assay' },
    { id: 'forge', kind: 'forge', x: 5, y: 17, w: 3, h: 2, label: "Hesper's anvil (forge a test billet)", art: 'anvil' },
    { id: 'thread-ledger', kind: 'thread', thread: 'blade', node: 'ledger', x: 21, y: 7, w: 1, h: 1, label: 'the guild ledger desk', art: 'ledger' },
    { id: 'thread-workshop', kind: 'thread', thread: 'blade', node: 'workshop', x: 3, y: 13, w: 1, h: 1, label: "Hesper's workshop sheet", art: 'board-stand' },
    { id: 'waystone', kind: 'waystone', place: 'Emberford market', x: 15, y: 14, w: 1, h: 1, label: 'the Waystone (save and rest)', art: 'waystone' },
    { id: 'old-sign', kind: 'sign', x: 22, y: 23, w: 1, h: 1, label: "Corvan's old sign board", art: 'old-sign', visibleIf: { flagSet: 'sd.corvan.outcome' },
      text: "Corvan's old sign board leans against the portal stone. Most of the words are scratched out. Kip says there is something on the back." },
    { id: 'sign-town', kind: 'sign', x: 17, y: 21, w: 1, h: 1, label: 'the town sign',
      text: 'EMBERFORD. Guild town of Aethelgard. Forge to the west, guild hall to the north, market in the square.' },
  ],
  zones: [
    { id: 'emberford', x: 0, y: 0, w: W, h: H },
    { id: 'portal-stone', x: 18, y: 23, w: 3, h: 3, if: { flag: 'seal.found', eq: true }, to: { map: 'nexus.archive', x: 12, y: 6 } },
  ],
  lights: [
    { x: 9, y: 11.5, r: 60, color: 0xff8a3a, flicker: true },
    { x: 19.5, y: 23.5, r: 54, color: 0x8fd3ff },
    { x: 19.5, y: 13.5, r: 50, color: 0xbfe8ff },
    { x: 25.5, y: 10, r: 40, color: 0xffe0a0 },
    { x: 15.5, y: 14.5, r: 30, color: 0x8fd3ff, flicker: true },
  ],
  spawn: { x: 20, y: 21 },
};
