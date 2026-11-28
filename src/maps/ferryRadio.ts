import { radioDock, radioLoft } from '../domain/ferryRadio';
import { radioPeople } from '../content/ferryRadio';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';
const harbour = 'sea.harbour';
const live: Condition = { flag: 'wire.editionMade', eq: true };
const islandGate: Condition = { all: [live, { objective: 'island.arrival' }] };
function mark(
  id: string,
  kind: Interactable['kind'],
  label: string,
  x: number,
  y: number,
  art: string,
  more: Partial<Interactable> = {},
): Interactable {
  return { id: 'wire-' + id, kind, label, x, y, w: 1, h: 1, art, ...more };
}
export const wireRoom: MapDef = {
  id: radioLoft,
  name: 'Seagrass Steps: Ferry Radio',
  world: 'WORLD-09',
  width: 21,
  height: 16,
  music: 'music.archive',
  ambience: 'study',
  background: 0x172c37,
  floor: (x, y) =>
    x < 1 || x > 19 || y < 0 || y > 14
      ? null
      : y < 3
        ? ['wall-top', 'wall-mid', 'wall-base'][y]
        : 'island-boards',
  blocks: [[0, 0, 21, 3]],
  lights: [
    { x: 6, y: 7, r: 58, color: 0xf4ba75 },
    { x: 15, y: 5, r: 55, color: 0x8cc5c6 },
  ],
  spawn: { x: 9, y: 12 },
  zones: [],
  stamps: [
    { stamp: 'window', x: 4, y: 1 },
    { stamp: 'window', x: 15, y: 1 },
    { stamp: 'cabinet', x: 2, y: 4 },
    { stamp: 'rug-green', x: 8, y: 10 },
  ],
  npcs: [
    { id: radioPeople.oda, x: 6, y: 6, facing: 'down' },
    { id: radioPeople.tavi, x: 15, y: 8, facing: 'left' },
    { id: radioPeople.dubois, x: 5, y: 10, facing: 'right' },
  ],
  interactables: [
    mark('console', 'fieldgame', 'The four-winding receiver', 10, 6, 'wire.receiver', {
      game: 'ferry-wire-studio',
    }),
    mark('ledge', 'sign', 'A teaspoon at the warm winding', 14, 5, 'wire.moth', {
      text: 'One paper moth has settled on the disconnected roof winding. Warmth brought it here. The absent voices have their own reasons.',
    }),
    mark('return', 'door', 'Down to Seagrass Steps', 9, 13, 'wire.stair', {
      walkThrough: true,
      to: { map: harbour, x: 19, y: 8 },
    }),
    mark('line', 'door', 'Ride the programme ferry to the island', 17, 12, 'wire.horn', {
      walkThrough: true,
      visibleIf: islandGate,
      to: { map: radioDock, x: 18, y: 8 },
    }),
    mark('timetable', 'sign', 'The island run', 17, 11, 'wire.reel', {
      visibleIf: { not: islandGate },
      text: 'When the Island of Models opens its dock and Oda has an edition ready, the programme ferry can carry you and the recording together.',
    }),
  ],
};
export function radioProps(map: string): Interactable[] {
  if (map === harbour)
    return [
      mark('studio', 'door', 'Climb to Oda’s ferry studio', 19, 9, 'wire.stair', {
        walkThrough: true,
        visibleIf: { objective: 'sea.arrival' },
        to: { map: radioLoft, x: 9, y: 12 },
      }),
    ];
  if (map !== radioDock) return [];
  return [
    mark('horn', 'fieldgame', 'The island receiving horn', 18, 8, 'wire.horn', {
      game: 'ferry-wire-island',
      visibleIf: live,
    }),
    mark('boat', 'door', 'Return to the ferry studio', 20, 8, 'wire.stair', {
      walkThrough: true,
      visibleIf: live,
      to: { map: radioLoft, x: 16, y: 12 },
    }),
    mark('sheet', 'sign', 'An extra song sheet under the awning', 5, 8, 'wire.reel', {
      visibleIf: {
        all: [
          { flag: 'wire.issued', eq: 'chorus' },
          { flag: 'wire.received', eq: true },
        ],
      },
      text: 'A child has tried three last words in the margin. Oda left room for a fourth.',
    }),
    mark('rest', 'sign', 'Four empty brass hooks', 5, 8, 'wire.reel', {
      visibleIf: {
        all: [
          { flag: 'wire.issued', eq: 'pause' },
          { flag: 'wire.received', eq: true },
        ],
      },
      text: 'The crowd has put four shells on the sill, one for each beat the singer left quiet.',
    }),
    mark('second', 'sign', 'A smaller horn facing the open rail', 5, 8, 'wire.horn', {
      visibleIf: {
        all: [
          { flag: 'wire.issued', eq: 'relay' },
          { flag: 'wire.received', eq: true },
        ],
      },
      text: 'Someone moved the new horn below the sail. The rail gives back a second voice, half a beat behind the awning.',
    }),
  ];
}
export function radioVisitors(map: string): MapDef['npcs'] {
  return map === radioDock
    ? [
        { id: radioPeople.oda, x: 8, y: 8, facing: 'down', visibleIf: live },
        { id: radioPeople.dubois, x: 16, y: 8, facing: 'down', visibleIf: live },
      ]
    : [];
}
