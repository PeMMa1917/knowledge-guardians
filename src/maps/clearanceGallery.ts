import { CLEARANCE_CASES, CLEARANCE_GROUP } from '../content/clearanceCases';
import type { Interactable, MapDef } from './types';

export const CLEARANCE_DOOR: Interactable = {
  id: 'cold-clearance-door', kind: 'door', x: 25, y: 13, w: 1, h: 1,
  label: 'the gallery with two viewing rails', art: 'preserved.door',
  visibleIf: { objective: 'preserved.publish' },
  to: { map: 'preserved.clearance', x: 10, y: 12 },
};

export const CLEARANCE_GALLERY: MapDef = {
  id: 'preserved.clearance', name: 'Preserved Lives: Gallery with Two Rails', world: 'WORLD-04',
  width: 21, height: 16, spawn: { x: 10, y: 12 },
  music: 'music.archive', ambience: 'study', background: 0x273747,
  floor: (x, y) => {
    if (x < 1 || x > 19 || y < 0 || y >= 15) return null;
    return y < 3 ? ['wall-top', 'wall-mid', 'wall-base'][y] : 'stone-c';
  },
  blocks: [[0, 0, 21, 3], [0, 0, 1, 16], [20, 0, 1, 16], [0, 15, 21, 1]],
  stamps: [
    { stamp: 'bookshelf', x: 2, y: 1 }, { stamp: 'bookshelf', x: 16, y: 1 },
    { stamp: 'rug-green', x: 9, y: 7 }, { stamp: 'bench', x: 2, y: 11 },
    { stamp: 'bench', x: 16, y: 11 },
  ],
  npcs: [
    { id: 'clearance-reader-tavi', x: 4, y: 11, facing: 'down' },
    { id: 'clearance-reader-jase', x: 17, y: 11, facing: 'down' },
  ],
  lights: [
    { x: 4, y: 5, r: 64, color: 0xb5e2eb }, { x: 17, y: 5, r: 65, color: 0xf3cd9c },
    { x: 10, y: 11, r: 88, color: 0xf4d1ad, flicker: true },
  ],
  zones: [],
  interactables: [
    ...CLEARANCE_CASES.flatMap((record, i): Interactable[] => {
      const x = 3 + i * 3;
      const y = i % 2 === 0 ? 5 : 7;
      return [{
        id: `case-${record.slug}`, kind: 'exhibit', exhibit: record.exhibit, x, y, w: 1, h: 1,
        art: 'collection-stand', label: record.title,
      }, {
        id: `fit-${record.slug}`, kind: 'fieldgame', game: `${CLEARANCE_GROUP}:${record.slug}`, x: x + 1, y, w: 1, h: 1,
        walkThrough: true, visibleIf: { card: record.card }, art: 'board-stand', label: `the trial frame for ${record.accession}`,
        artBy: { flag: `${record.flag}.route`, keys: { near: 'fold.strip', wide: 'fold.paired' } },
      }];
    }),
    { id: 'cold-clearance-near', kind: 'fieldgame', game: `${CLEARANCE_GROUP}:near`, x: 5, y: 13, w: 1, h: 1,
      art: 'fold.strip', label: 'Tavi’s low-rail reading tray', walkThrough: true },
    { id: 'cold-clearance-wide', kind: 'fieldgame', game: `${CLEARANCE_GROUP}:wide`, x: 16, y: 13, w: 1, h: 1,
      art: 'fold.paired', label: 'Jase’s wide-rail reading bench', walkThrough: true },
    { id: 'cold-clearance-back', kind: 'door', x: 10, y: 14, w: 1, h: 1, art: 'preserved.door',
      label: 'the way back to the Cold Store', to: { map: 'preserved.archive', x: 24, y: 13 } },
  ],
};
