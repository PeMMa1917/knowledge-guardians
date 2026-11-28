import { readyCase, readyLanding } from '../content/courierLift';
import { dispatchLift, liftLandings } from '../domain/courierLift';
import type { MapDef, Interactable } from './types';

export const weightRoom = 'nexus.counterweight';
const trap = {
  all: [
    { flag: 'courier.bew-signed', eq: true },
    { flag: 'courier.pella-signed', eq: true },
  ],
};
function desk(
  id: string,
  x: number,
  y: number,
  label: string,
  art: string,
  extra: Partial<Interactable>,
): Interactable {
  return {
    id: 'courier-' + id,
    x,
    y,
    w: 1,
    h: 1,
    kind: 'fieldgame',
    walkThrough: true,
    label,
    art,
    ...extra,
  };
}
export function courierAt(map: string): Interactable[] {
  if (map === dispatchLift)
    return [
      desk('cradle', 10, 7, 'the counterweight cradle', 'courier.cradle', {
        game: 'courier-lift',
      }),
      desk(
        'hatch',
        16,
        13,
        'the stair under the counterweight',
        'courier.hatch',
        { kind: 'door', to: { map: weightRoom, x: 7, y: 9 }, visibleIf: trap },
      ),
    ];
  if (map === liftLandings.market)
    return [
      desk('market', 23, 5, 'Bew’s freight counter', 'courier.cradle', {
        game: 'courier-market',
        visibleIf: readyLanding('market'),
      }),
    ];
  if (map === liftLandings.theatre)
    return [
      desk('theatre', 24, 5, 'Pella’s handbell', 'courier.bell', {
        game: 'courier-theatre',
        visibleIf: readyLanding('theatre'),
      }),
    ];
  return [];
}
export const underWeight: MapDef = {
  id: weightRoom,
  world: 'WORLD-01',
  name: 'The room below the rope',
  background: 0x30273d,
  width: 16,
  height: 13,
  spawn: { x: 7, y: 9 },
  music: 'music.archive',
  ambience: 'study',
  floor: (x, y) =>
    x < 1 || x > 14 || y < 1 || y > 11
      ? null
      : y === 1
        ? 'wall-mid'
        : y === 2
          ? 'wall-base'
          : 'island-boards',
  blocks: [[0, 0, 16, 3]],
  zones: [],
  lights: [{ x: 8, y: 5, r: 70, color: 0xfac074 }],
  stamps: [
    { stamp: 'barrel', x: 3, y: 4 },
    { stamp: 'bench', x: 11, y: 7 },
  ],
  npcs: [
    { id: 'courier-bew', x: 5, y: 6, facing: 'right' },
    { id: 'courier-pella', x: 10, y: 5, facing: 'left' },
  ],
  interactables: [
    desk(
      'back',
      7,
      10,
      'the stairs up to the collection room',
      'courier.hatch',
      { kind: 'door', to: { map: dispatchLift, x: 15, y: 13 } },
    ),
    desk(
      'receipts',
      8,
      4,
      'the envelope threaded onto a bell cord',
      'courier.bell',
      { kind: 'scene', node: 'courier.under.letter', visibleIf: readyCase },
    ),
  ],
};
