import { FERRY_PACKING_CASES, FERRY_PACKING_OPEN } from '../content/ferryPackingCases';
import { handoffText, PACKING_LATEST, PACKING_POSITIONS, PACKING_TOOL, pickupTag, postedTag, receiptTag } from '../domain/ferryPacking';
import { specimenEquipped } from '../domain/specimenGear';
import type { Interactable, MapDef } from './types';

export const FERRY_PACKING_DOOR: Interactable = {
  id: 'ferry-packing-room-door', kind: 'door', x: 7, y: 5, w: 1, h: 1, walkThrough: true, art: 'preserved.door',
  label: 'the door to Tova’s packing room', visibleIf: FERRY_PACKING_OPEN,
  to: { map: 'aethelgard.ferry-packing', x: 15, y: 20 },
};

export const FERRY_PACKING_RETURNS: Interactable[] = FERRY_PACKING_CASES.map((record) => ({
  id: record.revisit.prop, kind: 'fieldgame', game: `${PACKING_TOOL}:return.${record.slug}`,
  x: 9, y: 16, w: 1, h: 1, walkThrough: true, label: `the Nexus receiving hook for ${record.accession}`,
  art: 'board-stand', visibleIf: specimenEquipped(record.key),
  artBy: { flag: pickupTag(record.stem), keys: { canopy: 'fold.paired', open: 'fold.strip' } },
}));

export const FERRY_PACKING_ROOM: MapDef = {
  id: 'aethelgard.ferry-packing', name: 'Aethelgard · Ferry Packing Room', world: 'WORLD-02',
  width: 32, height: 24, spawn: { x: 15, y: 20 }, music: 'music.town', ambience: 'town', background: 0x4c443a,
  floor: (x, y) => {
    if (x < 1 || x > 30 || y < 0 || y >= 23) return null;
    if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
    return y >= 19 || (x >= 14 && x <= 16) ? 'island-boards' : 'stone-c';
  },
  blocks: [[0, 0, 32, 3], [0, 0, 1, 24], [31, 0, 1, 24], [0, 23, 32, 1]],
  stamps: [
    { stamp: 'window', x: 6, y: 1 }, { stamp: 'window', x: 16, y: 1 }, { stamp: 'window', x: 25, y: 1 },
    { stamp: 'cabinet', x: 1, y: 1 }, { stamp: 'cabinet', x: 27, y: 1 },
    { stamp: 'crates', x: 4, y: 20 }, { stamp: 'barrel', x: 27, y: 21 }, { stamp: 'rug-green', x: 14, y: 19 },
  ],
  npcs: [], zones: [],
  lights: [
    { x: 5, y: 6, r: 70, color: 0xe4d8aa }, { x: 16, y: 7, r: 88, color: 0xb4d1d5 }, { x: 27, y: 8, r: 75, color: 0xeed2a4 },
    { x: 12, y: 16, r: 70, color: 0xecd1a4 }, { x: 23, y: 16, r: 85, color: 0xc6d5c9 },
    { x: 15, y: 20, r: 78, color: 0xf1cc8b, flicker: true },
  ],
  interactables: [
    ...FERRY_PACKING_CASES.flatMap((record, index): Interactable[] => {
      const x = 3 + index % 7 * 4;
      const y = 4 + Math.floor(index / 7) * 3;
      return [
        {
          id: `ferry-packing-exhibit-${record.slug}`, kind: 'exhibit', exhibit: record.exhibit, x, y, w: 1, h: 1,
          label: `${record.title}, ${record.accession}`, art: 'collection-stand',
        },
        {
          id: `ferry-packing-hook-${record.slug}`, kind: 'fieldgame', game: `${PACKING_TOOL}:${record.slug}`,
          x: x + 1, y, w: 1, h: 1, walkThrough: true, label: `the trial hook for ${record.accession}`,
          art: 'board-stand', visibleIf: { card: record.card },
          artBy: { flag: postedTag(record.stem), keys: { outside: 'fold.strip', inside: 'fold.paired' } },
        },
      ];
    }),
    ...FERRY_PACKING_CASES.flatMap((record) => PACKING_POSITIONS.map((position): Interactable => ({
      id: `ferry-packing-receipt-${record.slug}-${position}`, kind: 'sign',
      x: position === 'outside' ? 5 : 25, y: 21, w: 1, h: 1, walkThrough: true,
      label: position === 'outside' ? 'Tova’s queue receipt at the west rail' : 'Wenna’s receipt on the east drying table',
      art: position === 'outside' ? 'fold.strip' : 'fold.paired', flag: receiptTag(record.stem),
      visibleIf: { all: [{ flag: PACKING_LATEST, eq: record.slug }, { flag: postedTag(record.stem), eq: position }] },
      text: `${record.accession}. ${handoffText(record, position)}`,
    }))),
    {
      id: 'ferry-packing-wenna-note', kind: 'sign', x: 16, y: 20, w: 1, h: 1, label: 'Wenna’s drying board',
      art: 'nile.scroll', walkThrough: true,
      text: 'Tova sorts while the carriers are here. I can wait at the drying table if waiting keeps a name on a claim. Run the same little route twice and give one of us the next load.',
    },
    {
      id: 'ferry-packing-room-exit', kind: 'door', x: 15, y: 22, w: 1, h: 1, art: 'preserved.door',
      label: 'the door back to the old ferry road', to: { map: 'aethelgard.ferry', x: 6, y: 5 },
    },
  ],
};
