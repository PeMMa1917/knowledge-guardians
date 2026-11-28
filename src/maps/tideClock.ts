import type { Condition } from '../domain/types';
import { clockRoom, clockDock } from '../domain/tideClock';
import { pierOpen, quarterPeople } from '../content/tideClock';
import type { Interactable, MapDef } from './types';
const signed: Condition = { flagSet: 'tideclock.issued' };
const lane: Condition = {
  all: [
    { flag: 'tideclock.remembered', eq: true },
    { flag: 'tideclock.stamp.slip.2', eq: true },
    { flag: 'tideclock.stamp.rail.5', eq: true },
  ],
};
const prop = (
  id: string,
  label: string,
  kind: Interactable['kind'],
  art: string,
  x: number,
  y: number,
  options: Partial<Interactable> = {},
): Interactable => ({
  id: 'quarter-' + id,
  label,
  kind,
  art,
  x,
  y,
  w: 1,
  h: 1,
  ...options,
});
export const quarterRoom: MapDef = {
  id: clockRoom,
  name: 'Two-Tide Dock: The Quarter House',
  world: 'WORLD-15',
  width: 22,
  height: 16,
  music: 'music.archive',
  ambience: 'study',
  background: 0x273347,
  floor: (x, y) =>
    x < 1 || x > 20 || y < 0 || y > 14
      ? null
      : y < 3
        ? ['wall-top', 'wall-mid', 'wall-base'][y]
        : x === 11 && y > 8
          ? 'island-path'
          : 'island-boards',
  blocks: [[0, 0, 22, 3]],
  spawn: { x: 11, y: 12 },
  zones: [],
  stamps: [
    { stamp: 'window', x: 4, y: 1 },
    { stamp: 'cabinet', x: 2, y: 5 },
    { stamp: 'rug-green', x: 7, y: 10 },
    { stamp: 'window', x: 16, y: 1 },
  ],
  lights: [
    { x: 7, y: 6, r: 50, color: 0xdeb775 },
    { x: 15, y: 7, r: 50, color: 0x80b6bc },
  ],
  npcs: [
    { id: quarterPeople.matel, x: 6, y: 6, facing: 'down' },
    { id: quarterPeople.ada, x: 15, y: 7, facing: 'left' },
  ],
  interactables: [
    prop('clock', 'Matel’s six-mark tide clock', 'fieldgame', 'quarter.clock', 10, 6, {
      game: 'quarter-house',
    }),
    prop('moth', 'Three numbered copper feet', 'sign', 'quarter.moth', 17, 5, {
      text: 'One foot walks, one listens, one sets the stamp. An empty pad leaves the brass clean. Somebody drew a square around the first blank.',
    }),
    prop('back', 'The steps up to Two-Tide Dock', 'door', 'wire.stair', 11, 13, {
      walkThrough: true,
      to: { map: clockDock, x: 23, y: 9 },
    }),
    prop('later-step', 'The gap beside the tide hand', 'sign', 'quarter.clock', 4, 9, {
      visibleIf: { not: lane },
      text: 'Two different shifts have left a chalk mark here. When both their hearings survive on the same card, the wall can remember where its old stair went.',
    }),
    prop('hidden-step', 'The stair the clock forgot', 'door', 'wire.stair', 4, 9, {
      walkThrough: true,
      visibleIf: lane,
      to: { map: 'sea.listening-wheel', x: 13, y: 10 },
    }),
  ],
};
export function clockProps(map: string): Interactable[] {
  if (map === clockDock)
    return [
      prop('door', 'The clock keeper’s steps under the island pier', 'door', 'quarter.clock', 23, 10, {
        visibleIf: pierOpen,
        walkThrough: true,
        to: { map: clockRoom, x: 11, y: 12 },
      }),
      prop('dock-plan', 'The floor plan under glass', 'fieldgame', 'quarter.plan', 23, 7, {
        game: 'quarter-plan',
        visibleIf: signed,
      }),
      prop('dock-fittings', 'Three fittings on the pier', 'sign', 'quarter.fittings', 10, 7, {
        visibleIf: signed,
        text: 'The fittings match the plan behind the glass. The two shifts come down at different times to try them.',
      }),
    ];
  if (map === 'sea.listening-wheel')
    return [
      prop('sea-step', 'The stair under the listening wheel', 'door', 'quarter.clock', 14, 9, {
        walkThrough: true,
        visibleIf: lane,
        to: { map: clockRoom, x: 5, y: 9 },
      }),
    ];
  return [];
}
export function clockGuests(map: string): MapDef['npcs'] {
  return map === clockDock
    ? [
        {
          id: quarterPeople.matel,
          x: 22,
          y: 6,
          facing: 'down',
          visibleIf: signed,
        },
        {
          id: quarterPeople.ada,
          x: 24,
          y: 6,
          facing: 'left',
          visibleIf: signed,
        },
      ]
    : [];
}
