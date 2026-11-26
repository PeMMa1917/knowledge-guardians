import { TIME_CASES, TIME_ROOM_OPEN } from '../content/timeRoomCases';
import { timeChoice, timeReturn, TIME_TOOL } from '../domain/timeRoom';
import { specimenEquipped } from '../domain/specimenGear';
import type { Interactable, MapDef } from './types';

export const TIME_ROOM_DOOR: Interactable = {
  id: 'study-time-room', kind: 'door', x: 14, y: 11, w: 1, h: 1, walkThrough: true, art: 'preserved.door',
  label: 'the door to Elsbet’s Time Room', visibleIf: TIME_ROOM_OPEN,
  to: { map: 'aethelgard.time-room', x: 15, y: 23 },
};

export const TIME_STUDY_RETURNS: Interactable[] = TIME_CASES.map((record) => ({
  id: record.revisit.prop, kind: 'fieldgame', game: `${TIME_TOOL}:return.${record.slug}`,
  x: 10, y: 5, w: 1, h: 1, walkThrough: true,
  label: `the new reading desk for ${record.accession}`, art: 'board-stand', visibleIf: specimenEquipped(record.key),
  artBy: { flag: timeReturn(record.stem), keys: { start: 'fold.strip', pace: 'fold.paired' } },
}));

export const TIME_ROOM: MapDef = {
  id: 'aethelgard.time-room', name: 'Emberford · Elsbet’s Time Room', world: 'WORLD-02',
  width: 32, height: 27, spawn: { x: 15, y: 23 }, music: 'music.box', ambience: 'study', background: 0x514439,
  floor: (x, y) => {
    if (x < 1 || x > 30 || y < 0 || y >= 26) return null;
    if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
    return y >= 22 || (x >= 14 && x <= 16) ? 'island-boards' : 'stone-c';
  },
  blocks: [[0, 0, 32, 3], [0, 0, 1, 27], [31, 0, 1, 27], [0, 26, 32, 1]],
  stamps: [
    { stamp: 'window', x: 7, y: 1 }, { stamp: 'window', x: 16, y: 1 }, { stamp: 'window', x: 25, y: 1 },
    { stamp: 'bookshelf', x: 1, y: 2 }, { stamp: 'bookshelf', x: 27, y: 2 },
    { stamp: 'rug-green', x: 14, y: 22 }, { stamp: 'bench', x: 4, y: 22 }, { stamp: 'cabinet', x: 27, y: 23 },
  ],
  npcs: [], zones: [],
  lights: [
    { x: 5, y: 6, r: 78, color: 0xf1d6a0 }, { x: 16, y: 7, r: 88, color: 0xaaccd5 }, { x: 26, y: 8, r: 72, color: 0xedc9ab },
    { x: 7, y: 16, r: 77, color: 0xead0a3 }, { x: 23, y: 16, r: 82, color: 0xcdc6d5 },
    { x: 16, y: 22, r: 87, color: 0xf8d09b, flicker: true },
  ],
  interactables: [
    ...TIME_CASES.flatMap((record, index): Interactable[] => {
      const x = 3 + index % 7 * 4;
      const y = 5 + Math.floor(index / 7) * 3;
      return [
        {
          id: `time-case-${record.slug}`, kind: 'exhibit', exhibit: record.exhibit, x, y, w: 1, h: 1,
          label: `${record.title}, ${record.accession}`, art: 'collection-stand',
        },
        {
          id: `time-bench-${record.slug}`, kind: 'fieldgame', game: `${TIME_TOOL}:${record.slug}`, x: x + 1, y, w: 1, h: 1,
          label: `the practice clock for ${record.accession}`, art: 'board-stand', walkThrough: true, visibleIf: { card: record.card },
          artBy: { flag: timeChoice(record.stem), keys: { arrival: 'fold.strip', relay: 'fold.paired' } },
        },
      ];
    }),
    {
      id: 'time-room-cue-board', kind: 'sign', x: 16, y: 22, w: 1, h: 1, label: 'Elsbet’s cue board',
      art: 'nile.scroll', walkThrough: true,
      text: 'The runner needs a signal for one arrival. The keeper takes the following shift. Keep the first mark and the spaces between the later bells on separate lines.',
    },
    {
      id: 'time-room-return', kind: 'door', x: 15, y: 25, w: 1, h: 1, art: 'preserved.door', label: 'the door back to Elsbet’s Study',
      to: { map: 'aethelgard.study', x: 14, y: 10 },
    },
  ],
};
