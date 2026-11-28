import { doorPeople, houseFieldGates, secondLanding } from '../content/openHouse';
import { housePorch, houseRoom, houseSites } from '../domain/openHouse';
import type { Condition } from '../domain/types';
import type { MapDef, Interactable } from './types';
const prop = (
  id: string,
  label: string,
  kind: Interactable['kind'],
  art: string,
  x: number,
  y: number,
  extra: Partial<Interactable> = {},
): Interactable => ({ id: 'middlehouse-' + id, label, kind, art, x, y, w: 1, h: 1, ...extra });
const door = (
  id: string,
  label: string,
  x: number,
  y: number,
  map: string,
  toX: number,
  toY: number,
  ifc?: Condition,
) =>
  prop(id, label, 'door', 'middlehouse.threshold', x, y, {
    walkThrough: true,
    to: { map, x: toX, y: toY },
    visibleIf: ifc,
  });
const friend = (
  name: keyof typeof doorPeople,
  x: number,
  y: number,
  facing: 'left' | 'right' | 'down' = 'down',
  visibleIf?: Condition,
): MapDef['npcs'][number] => ({ id: doorPeople[name], x, y, facing, visibleIf });
export const middleRoom: MapDef = {
  id: houseRoom,
  name: 'The Nexus: The Inn under the Mat',
  world: 'WORLD-01',
  width: 22,
  height: 16,
  music: 'music.archive',
  ambience: 'study',
  background: 0x373044,
  floor: (x, y) =>
    x < 1 || x > 20 || y < 0 || y > 14
      ? null
      : y < 3
        ? ['wall-top', 'wall-mid', 'wall-base'][y]
        : y > 8 && x > 7 && x < 14
          ? 'stone-c'
          : 'civic-hall-tile',
  blocks: [[0, 0, 22, 3]],
  zones: [],
  spawn: { x: 11, y: 12 },
  stamps: [
    { stamp: 'window', x: 4, y: 1 },
    { stamp: 'window', x: 15, y: 1 },
    { stamp: 'rug-green', x: 5, y: 7 },
    { stamp: 'plant-tall', x: 17, y: 11 },
    { stamp: 'bench', x: 4, y: 11 },
  ],
  lights: [
    { x: 9, y: 6, r: 53, color: 0xf3c48e },
    { x: 16, y: 10, r: 38, color: 0x97b9c7 },
  ],
  npcs: [
    friend('neska', 5, 6),
    friend('tover', 14, 7, 'left'),
    friend('yilka', 16, 10),
    friend('jane', 5, 10, 'right'),
    friend('zaha', 14, 4, 'left'),
  ],
  interactables: [
    prop('floor', 'The nine door tiles under Neska’s mat', 'fieldgame', 'middlehouse.floor', 10, 6, {
      game: 'middlehouse-plan',
    }),
    prop('chairs', 'Three warm places by the hearth', 'fieldgame', 'middlehouse.seats', 7, 9, {
      game: 'middlehouse-roost',
    }),
    prop('small-key', 'The key under the front mat', 'sign', 'quarters-door', 17, 6, {
      text: 'Two knocks bought supper. A scratch bought a bed. The last keeper wrote a third line in smaller letters. Some guests arrive without a hand to knock with.',
    }),
    door('up', 'The lift under your quarters', 11, 13, 'nexus.archive', 19, 5),
    prop('sealed-door', 'A thumb-wide door on the stair', 'sign', 'middlehouse.threshold', 3, 8, {
      visibleIf: { not: secondLanding },
      text: 'Somebody has pushed a spoon through the crack for a handle. Two keys turn inside. A third person would have to take a turn from the other side.',
    }),
    door('to-porch', 'The middle door opens onto a new landing', 3, 8, housePorch, 6, 9, secondLanding),
  ],
};
export const middleLanding: MapDef = {
  id: housePorch,
  name: 'The Nexus: Somebody Lives Here',
  world: 'WORLD-01',
  width: 18,
  height: 14,
  music: 'music.town',
  ambience: 'town',
  background: 0x2e4340,
  floor: (x, y) => (x < 1 || x > 16 || y < 1 || y > 12 ? null : y > 8 ? 'stone-c' : 'grass'),
  blocks: [],
  zones: [],
  spawn: { x: 6, y: 9 },
  stamps: [
    { stamp: 'bench', x: 11, y: 5 },
    { stamp: 'flowers-white', x: 2, y: 4 },
    { stamp: 'tree', x: 12, y: 1 },
  ],
  lights: [
    { x: 6, y: 6, r: 40, color: 0xe7c487 },
    { x: 11, y: 8, r: 43, color: 0xc4b6d6 },
  ],
  npcs: [friend('neska', 7, 6, 'down')],
  interactables: [
    door('from-porch', 'Go back through the old mat', 4, 9, houseRoom, 4, 8),
    prop('porch-roost', 'The three places belonging to the house', 'fieldgame', 'middlehouse.seats', 11, 8, {
      game: 'middlehouse-roost',
    }),
    ...(['tea', 'loft', 'garden'] as const).map((v, i) =>
      prop(
        'porch-' + v,
        ['The kettle reached the east table', 'A music stand reached the loft', 'A chair reached the garden'][
          i
        ],
        'fieldgame',
        ['middlehouse.kettle', 'middlehouse.lamp', 'middlehouse.seats'][i],
        [10, 9, 5][i],
        [5, 4, 6][i],
        { game: 'middlehouse-porch', visibleIf: { flag: 'middlehouse.porchStop', eq: v } },
      ),
    ),
  ],
};
export function houseAt(map: string): Interactable[] {
  if (map === 'nexus.archive')
    return [door('under-mat', 'The small inn under your quarters', 19, 4, houseRoom, 11, 12)];
  if (map === houseSites.cart)
    return [
      prop('cart', 'Tover’s kettle cart and the nine yard rooms', 'fieldgame', 'middlehouse.kettle', 14, 22, {
        game: 'middlehouse-cart',
        visibleIf: houseFieldGates.cart,
      }),
    ];
  if (map === houseSites.light)
    return [
      prop('lamp', 'Yilka’s lamp on a long cord', 'fieldgame', 'middlehouse.lamp', 11, 8, {
        game: 'middlehouse-light',
        visibleIf: houseFieldGates.light,
      }),
    ];
  if (map === houseSites.table)
    return [
      prop('keys', 'The listening table with three keys', 'fieldgame', 'middlehouse.threshold', 8, 9, {
        game: 'middlehouse-table',
        visibleIf: houseFieldGates.table,
      }),
    ];
  return [];
}
export function houseVisitors(map: string): MapDef['npcs'] {
  if (map === houseSites.cart)
    return [
      friend('tover', 13, 22, 'right', houseFieldGates.cart),
      friend('jane', 15, 22, 'left', houseFieldGates.cart),
    ];
  if (map === houseSites.light)
    return [
      friend('yilka', 10, 8, 'right', houseFieldGates.light),
      friend('zaha', 12, 8, 'left', houseFieldGates.light),
    ];
  if (map === houseSites.table) return [friend('neska', 7, 9, 'right', houseFieldGates.table)];
  return [];
}
