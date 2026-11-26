import { NUMBER_LEAVES, NUMBER_LEAF_ACCESS, NUMBER_LEAF_GROUP } from '../content/numberLeaves';
import type { Interactable, MapDef } from './types';
import { specimenEquipped } from '../domain/specimenGear';

export const NUMBER_LEAF_RETURNS: Interactable[] = NUMBER_LEAVES.map((entry, index) => ({
  id: entry.revisit.prop, kind: 'fieldgame', game: `${NUMBER_LEAF_GROUP}:return-${entry.slug}`,
  x: 26 + index * 2, y: 6, w: 1, h: 1, walkThrough: true, label: entry.revisit.method,
  art: 'preserved.slip', visibleIf: specimenEquipped(entry.key),
  artBy: { flag: `${entry.flag}.return`, keys: { practice: 'fold.strip', reserve: 'fold.paired' } },
}));

export const NUMBER_LEAF_DOOR: Interactable = {
  id: 'number-leaf-door', kind: 'door', x: 24, y: 17, w: 1, h: 1,
  art: 'preserved.door', label: 'the Ledger Room', to: { map: 'nexus.number-leaves', x: 11, y: 12 },
};

export const MARKET_NUMBER_LEAF: Interactable = {
  id: 'number-leaf-market', kind: 'fieldgame', game: `${NUMBER_LEAF_GROUP}:market`, x: 20, y: 19, w: 1, h: 1,
  art: 'preserved.slip', label: 'the market’s numbered reference clip', walkThrough: true,
  visibleIf: { any: NUMBER_LEAVES.map(({ objective }) => ({ objective })) },
};

export const NUMBER_LEAF_ROOM: MapDef = {
  id: 'nexus.number-leaves', name: 'The Nexus: Ledger Room', world: 'WORLD-01',
  width: 23, height: 16, spawn: { x: 11, y: 12 }, music: 'music.archive', ambience: 'study', background: 0x30283d,
  floor(x, y) {
    if (x < 1 || x > 21 || y >= 15) return null;
    return y < 3 ? ['wall-top', 'wall-mid', 'wall-base'][y] : 'stone-c';
  },
  blocks: [[0, 0, 23, 3], [0, 0, 1, 16], [22, 0, 1, 16], [0, 15, 23, 1]],
  stamps: [{ stamp: 'bookshelf', x: 2, y: 2 }, { stamp: 'window', x: 13, y: 1 }, { stamp: 'rug-green', x: 9, y: 8 }],
  npcs: [
    { id: 'number-leaf-lella', x: 5, y: 10, facing: 'down' }, { id: 'number-leaf-omrin', x: 18, y: 10, facing: 'down' },
  ],
  lights: [{ x: 6, y: 5, r: 61, color: 0xf3cc98 }, { x: 17, y: 7, r: 68, color: 0xb4d3e1 },
    { x: 11, y: 12, r: 58, color: 0xe4b88f, flicker: true }], zones: [],
  interactables: [
    ...NUMBER_LEAVES.flatMap((entry, i): Interactable[] => [
      { id: `number-leaf-case-${entry.slug}`, kind: 'exhibit', exhibit: entry.exhibit,
        x: 4 + 6 * i, y: 6, w: 1, h: 1, art: `${entry.art}.case`, label: entry.title },
      { id: `number-leaf-trial-${entry.slug}`, kind: 'fieldgame', game: `${NUMBER_LEAF_GROUP}:${entry.slug}`,
        x: 5 + 6 * i, y: 6, w: 1, h: 1, art: 'board-stand', label: `the practice board for ${entry.accession}`,
        visibleIf: { all: [NUMBER_LEAF_ACCESS, { card: entry.card }] }, walkThrough: true },
    ]),
    { id: 'number-leaf-method', kind: 'fieldgame', game: `${NUMBER_LEAF_GROUP}:method`, x: 5, y: 12, w: 1, h: 1,
      art: 'fold.strip', label: 'Lella’s guide rack', walkThrough: true },
    { id: 'number-leaf-context', kind: 'fieldgame', game: `${NUMBER_LEAF_GROUP}:context`, x: 18, y: 12, w: 1, h: 1,
      art: 'preserved.folder', label: 'Omrin’s finding desk', walkThrough: true },
    { id: 'number-leaf-back', kind: 'door', x: 11, y: 14, w: 1, h: 1, art: 'preserved.door', label: 'the Half-Light Room',
      to: { map: 'nexus.half-light', x: 24, y: 18 } },
  ],
};
