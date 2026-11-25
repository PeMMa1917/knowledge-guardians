/**
 * WORLD-01 The Nexus: the recruitment archive hall (spec 5.3, 6.2).
 * A stone hall floating in a starry void. 40 x 20 tiles.
 * West part (x 1-24): the archive hall with the three 'first' exhibits.
 * East wing (x 26-38): the Hall of Firsts, an optional side quest with
 * plaques about people from every inhabited continent and many periods.
 */
import type { MapDef } from './types';

const W = 40, H = 20;

function floor(x: number, y: number): string | null {
  if (x < 1 || x > W - 2 || y < 3 || y > H - 1) return null;
  if (y === 3) return x === 1 ? 'stone-tl' : x === W - 2 ? 'stone-tr' : 'stone-t';
  if (y === H - 1) return x === 1 ? 'stone-bl' : x === W - 2 ? 'stone-br' : 'stone-b';
  if (x === 1) return 'stone-l';
  if (x === W - 2) return 'stone-r';
  return 'stone-c';
}

export const NEXUS: MapDef = {
  id: 'nexus.archive',
  name: 'The Nexus: Archive Hall',
  world: 'WORLD-01',
  width: W, height: H,
  music: 'music.archive',
  ambience: 'archive',
  background: 0x120f24,
  floor: (x, y) => {
    if (y >= 0 && y <= 2 && x >= 1 && x <= W - 2) return y === 0 ? 'wall-top' : y === 1 ? 'wall-mid' : 'wall-base';
    return floor(x, y);
  },
  stamps: [
    { stamp: 'bookshelf', x: 1, y: 1 },
    { stamp: 'bookshelf', x: 18, y: 1 },
    { stamp: 'bookshelf', x: 21, y: 1 },
    { stamp: 'banners', x: 8, y: 1 },
    { stamp: 'banners', x: 16, y: 1 },
    { stamp: 'rug-green', x: 11, y: 10 },
    { stamp: 'plant-tall', x: 2, y: 4 },
    { stamp: 'plant-tall', x: 23, y: 4 },
    { stamp: 'plant-tall', x: 2, y: 17 },
    { stamp: 'statue', x: 22, y: 12 },
    { stamp: 'long-table', x: 19, y: 16 },
    { stamp: 'cabinet', x: 23, y: 15 },
    { stamp: 'table', x: 2, y: 12 },
    { stamp: 'plant-tall', x: 23, y: 9 },
    { stamp: 'bench', x: 7, y: 14 },
    { stamp: 'bench', x: 15, y: 15 },
    { stamp: 'crates', x: 22, y: 17 },
    // East wing: the Hall of Firsts
    { stamp: 'banners', x: 30, y: 1 },
    { stamp: 'bookshelf', x: 34, y: 1 },
    { stamp: 'rug-green', x: 30, y: 10 },
    { stamp: 'plant-tall', x: 25, y: 8 },
    { stamp: 'plant-tall', x: 25, y: 14 },
    { stamp: 'plant-tall', x: 37, y: 17 },
    { stamp: 'bench', x: 31, y: 15 },
  ],
  blocks: [
    [0, 0, 1, H], [W - 1, 0, 1, H],   // side edges
    [1, 0, W - 2, 3],                   // north wall
    [0, H, W, 1],
    [11, 3, 1, 2], [14, 3, 1, 2],      // portal posts
  ],
  npcs: [
    { id: 'warden-ise', x: 12, y: 11, facing: 'down' },
    { id: 'curator-dace', x: 4, y: 8, facing: 'right' },
    { id: 'clerk-venn', x: 20, y: 8, facing: 'left' },
    { id: 'kip-arden', x: 6, y: 15, facing: 'right' },
    { id: 'villager-2', x: 17, y: 13, facing: 'up' },
    { id: 'archivist-tull', x: 35, y: 13, facing: 'down' },
  ],
  interactables: [
    { id: 'ex-a', kind: 'exhibit', exhibit: 'OBJ-001-A', x: 8, y: 7, w: 1, h: 1, label: 'the patent drawing', art: 'pedestal.patent' },
    { id: 'ex-b', kind: 'exhibit', exhibit: 'OBJ-001-B', x: 12, y: 7, w: 2, h: 1, label: 'the workshop model', art: 'pedestal.model' },
    { id: 'ex-c', kind: 'exhibit', exhibit: 'OBJ-001-C', x: 17, y: 7, w: 1, h: 1, label: 'the Biro pen record', art: 'pedestal.biro' },
    { id: 'bench', kind: 'bench', x: 19, y: 16, w: 3, h: 2, label: 'the workshop bench (marking test)' },
    { id: 'label-pen', kind: 'label', kit: 'pen', x: 10, y: 15, w: 1, h: 1, label: 'the label stand', art: 'label-stand' },
    { id: 'waystone', kind: 'waystone', place: 'Nexus archive hall', x: 2, y: 9, w: 1, h: 1, label: 'the Waystone (save and rest)', art: 'waystone' },
    ...([['OBJ-101', 'eratosthenes'], ['OBJ-102', 'haytham'], ['OBJ-103', 'bisheng'], ['OBJ-104', 'sikdar'], ['OBJ-105', 'santos'], ['OBJ-106', 'sheppard'], ['OBJ-107', 'wollstonecraft']] as const)
      .map(([ex, key], i) => ({ id: `plaque-${key}`, kind: 'exhibit' as const, exhibit: ex, kit: `first.${key}`, x: 27 + i * 2, y: 5, w: 1, h: 1, label: 'a plaque in the Hall of Firsts', art: 'plaque' })),
    { id: 'sign-hall', kind: 'sign', x: 26, y: 12, w: 1, h: 1, label: 'the Hall of Firsts sign', art: 'signpost',
      text: 'THE HALL OF FIRSTS. Every plaque here says "the first". First at what? Repair a plaque by choosing what kind of first it was, and what we do not know.' },
    { id: 'title-lock', kind: 'lock', lock: 'inventor', x: 37, y: 13, w: 1, h: 1, label: 'the Title Lock (EE practice)', art: 'title-lock', visibleIf: { objective: 'm01.o6.label' } },
    { id: 'claim-board', kind: 'label', kit: 'ee.inventor', x: 33, y: 16, w: 1, h: 1, label: "Tull's claim board", art: 'label-stand', visibleIf: { objective: 'ee1.o3.weigh' } },
    { id: 'sign-portal', kind: 'sign', x: 10, y: 4, w: 1, h: 1, label: 'the portal sign', art: 'signpost',
      text: 'PORTAL TO AETHELGARD. Opens for Guardians on assignment.' },
  ],
  zones: [
    { id: 'portal', x: 12, y: 3, w: 2, h: 2, if: { objective: 'm01.o6.label' }, to: { map: 'aethelgard.emberford', x: 20, y: 21 } },
  ],
  lights: [
    { x: 12.5, y: 3.5, r: 70, color: 0x8fd3ff },
    { x: 8.5, y: 7, r: 34, color: 0xffd28a, flicker: true },
    { x: 13, y: 7, r: 34, color: 0xffd28a, flicker: true },
    { x: 17.5, y: 7, r: 34, color: 0x9fe8ff, flicker: true },
    { x: 20.5, y: 16.5, r: 46, color: 0xffb36b, flicker: true },
    { x: 3, y: 2, r: 50, color: 0xffcf8a },
    { x: 22, y: 2, r: 50, color: 0xffcf8a },
    { x: 12.5, y: 11.5, r: 60, color: 0xfff0c8 },
    { x: 2.5, y: 9.5, r: 34, color: 0x8fd3ff, flicker: true },
    { x: 33, y: 5.5, r: 90, color: 0xffd28a },
    { x: 32, y: 12, r: 70, color: 0xfff0c8 },
    { x: 36, y: 13.5, r: 40, color: 0xffd28a, flicker: true },
  ],
  spawn: { x: 12, y: 17 },
};
