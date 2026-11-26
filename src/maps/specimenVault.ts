import { SPECIMEN_BASE } from '../domain/specimenGear';
import type { Interactable, MapDef } from './types';

export const SPECIMEN_VAULT_DOOR: Interactable = {
  id: 'specimen-vault-door', kind: 'door', x: 30, y: 15, w: 1, h: 1, art: 'preserved.door',
  label: 'your collection room', visibleIf: { flag: 'specimens.collected', eq: true }, to: { map: SPECIMEN_BASE, x: 10, y: 12 },
};

export const SPECIMEN_VAULT: MapDef = {
  id: SPECIMEN_BASE, name: 'The Nexus: Your Collection', world: 'WORLD-01', width: 21, height: 16,
  spawn: { x: 10, y: 12 }, music: 'music.archive', ambience: 'study', background: 0x27263e,
  floor: (x, y) => {
    if (x < 1 || x > 19 || y >= 15) return null;
    return y < 3 ? ['wall-top', 'wall-mid', 'wall-base'][y] : 'stone-c';
  },
  blocks: [[0, 0, 21, 3], [0, 0, 1, 16], [20, 0, 1, 16], [0, 15, 21, 1]],
  npcs: [], stamps: [{ stamp: 'bookshelf', x: 4, y: 2 }, { stamp: 'bookshelf', x: 14, y: 2 }, { stamp: 'rug-green', x: 9, y: 7 }],
  lights: [{ x: 5, y: 6, r: 64, color: 0xf2b87a }, { x: 15, y: 6, r: 69, color: 0xaccaef }], zones: [],
  interactables: [
    { id: 'specimen-vault-display', kind: 'fieldgame', game: 'specimen-vault', x: 5, y: 6, w: 1, h: 1,
      label: 'the displays and satchel hooks', art: 'preserved.display-paired', walkThrough: true },
    { id: 'specimen-vault-arch', kind: 'fieldgame', game: 'specimen-return', x: 15, y: 6, w: 1, h: 1,
      label: 'the collection’s return arch', art: 'nile.door', walkThrough: true },
    { id: 'specimen-vault-exit', kind: 'door', x: 10, y: 14, w: 1, h: 1, art: 'preserved.door',
      label: 'the Archive Hall', to: { map: 'nexus.archive', x: 30, y: 16 } },
  ],
};
