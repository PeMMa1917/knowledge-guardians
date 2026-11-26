import { WARM_CASES, WARM_ROOM_OPEN } from '../content/warmRoomCases';
import { specimenEquipped } from '../domain/specimenGear';
import { WARM_FIXTURES, WARM_LATEST, WARM_TOOL, warmFerry, warmHandoff, warmNotice, warmReceipt } from '../domain/warmRoom';
import type { Interactable, MapDef } from './types';

export const WARM_ROOM_DOOR: Interactable = {
  id: 'metal-warm-room', kind: 'door', x: 19, y: 6, w: 1, h: 1, walkThrough: true,
  label: 'Bea’s Warm Room door', art: 'preserved.door', visibleIf: WARM_ROOM_OPEN,
  to: { map: 'metalworks.warm-room', x: 15, y: 21 },
};

export const WARM_FERRY_RETURNS: Interactable[] = WARM_CASES.map((record) => ({
  id: record.revisit.prop, kind: 'fieldgame', game: `${WARM_TOOL}:return.${record.slug}`,
  x: 10, y: 7, w: 1, h: 1, walkThrough: true, label: `Enna’s cold-crossing tray for ${record.accession}`,
  art: 'board-stand', visibleIf: specimenEquipped(record.key),
  artBy: { flag: warmFerry(record.stem), keys: { bench: 'fold.strip', carrier: 'fold.paired' } },
}));

export const WARM_ROOM: MapDef = {
  id: 'metalworks.warm-room', name: 'Metalworks · The Warm Room', world: 'WORLD-07',
  width: 32, height: 25, spawn: { x: 15, y: 21 }, music: 'music.town', ambience: 'study', background: 0x3d3130,
  floor: (x, y) => {
    if (x < 1 || x > 30 || y < 0 || y >= 24) return null;
    if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
    return y >= 20 || (x >= 14 && x <= 16) ? 'island-boards' : 'stone-c';
  },
  blocks: [[0, 0, 32, 3], [0, 0, 1, 25], [31, 0, 1, 25], [0, 24, 32, 1]],
  stamps: [
    { stamp: 'window', x: 6, y: 1 }, { stamp: 'window', x: 16, y: 1 }, { stamp: 'window', x: 25, y: 1 },
    { stamp: 'cabinet', x: 1, y: 1 }, { stamp: 'cabinet', x: 27, y: 1 },
    { stamp: 'crates', x: 5, y: 21 }, { stamp: 'bench', x: 25, y: 21 }, { stamp: 'rug-green', x: 14, y: 20 },
  ],
  lights: [
    { x: 6, y: 6, r: 75, color: 0xf1c28c }, { x: 16, y: 7, r: 80, color: 0xc7d7d6 }, { x: 26, y: 8, r: 75, color: 0xf1ce99 },
    { x: 6, y: 16, r: 70, color: 0xe4be91 }, { x: 24, y: 17, r: 85, color: 0xcedbdf },
    { x: 15, y: 22, r: 70, color: 0xf6cc8a, flicker: true },
  ],
  npcs: [], zones: [],
  interactables: [
    ...WARM_CASES.flatMap((record, index): Interactable[] => {
      const x = 3 + index % 7 * 4;
      const y = 4 + Math.floor(index / 7) * 3;
      return [
        { id: `warm-case-${record.slug}`, kind: 'exhibit', exhibit: record.exhibit, x, y, w: 1, h: 1,
          label: `${record.title}, ${record.accession}`, art: 'collection-stand' },
        { id: `warm-board-${record.slug}`, kind: 'fieldgame', game: `${WARM_TOOL}:${record.slug}`, x: x + 1, y, w: 1, h: 1,
          label: `the two-probe board for ${record.accession}`, art: 'board-stand', walkThrough: true, visibleIf: { card: record.card },
          artBy: { flag: warmHandoff(record.stem), keys: { bench: 'fold.strip', carrier: 'fold.paired' } } },
      ];
    }),
    ...WARM_CASES.flatMap((record) => WARM_FIXTURES.map((fixture): Interactable => ({
      id: `warm-receipt-${record.slug}-${fixture}`, kind: 'sign', x: fixture === 'bench' ? 8 : 26, y: 22, w: 1, h: 1,
      walkThrough: true, label: fixture === 'bench' ? 'Bea’s first-service receipt at the west counter' : 'Bea’s padded-carrier receipt at the east table',
      art: fixture === 'bench' ? 'fold.strip' : 'fold.paired', flag: warmReceipt(record.stem), text: `${record.accession}. ${warmNotice(record, fixture)}`,
      visibleIf: { all: [{ flag: WARM_LATEST, eq: record.slug }, { flag: warmHandoff(record.stem), eq: fixture }] },
    }))),
    { id: 'warm-guide', kind: 'sign', x: 17, y: 21, w: 1, h: 1, walkThrough: true, art: 'nile.scroll',
      label: 'Bea’s two-probe note',
      text: 'The body probe tracks the vessel. The brief contact strip checks what passed to the new surface. Run the same practice pulse on both supports. Each of our two tables needs a different kind of handoff.' },
    { id: 'warm-room-exit', kind: 'door', x: 15, y: 23, w: 1, h: 1, art: 'preserved.door',
      label: 'the door back to the Trade Hall', to: { map: 'metalworks.records', x: 18, y: 6 } },
  ],
};
