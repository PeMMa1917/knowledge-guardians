import type { Interactable, MapDef } from './types';
import { grovePeople, forestGate, civicGate, placedGrove, underArch } from '../content/walkingOrchard';
import { bedName, beds, delivery, orchardSquare, orchardYard, type Edition } from '../domain/walkingOrchard';

const fern = 'forest.station',
  civic = 'civic.dispatch';
function prop(
  id: string,
  label: string,
  kind: Interactable['kind'],
  art: string,
  x: number,
  y: number,
  opts: Partial<Interactable> = {},
): Interactable {
  return { id: 'walking-grove-' + id, label, kind, art, x, y, w: 1, h: 1, ...opts };
}
function exit(
  id: string,
  label: string,
  x: number,
  y: number,
  map: string,
  endX: number,
  endY: number,
  visibleIf?: Interactable['visibleIf'],
) {
  return prop(id, label, 'door', 'orchard.cart', x, y, {
    walkThrough: true,
    to: { map, x: endX, y: endY },
    visibleIf,
  });
}
const positions = [
  [5, 6],
  [11, 5],
  [17, 6],
];
function yardGuest(
  who: keyof typeof grovePeople,
  x: number,
  y: number,
  facing: 'left' | 'right' | 'down',
): MapDef['npcs'][number] {
  return { id: grovePeople[who], x, y, facing };
}
export const groveNursery: MapDef = {
  id: orchardYard,
  name: 'Fern Station: The Walking Orchard',
  world: 'WORLD-06',
  width: 23,
  height: 17,
  music: 'music.town',
  ambience: 'town',
  background: 0x254236,
  floor: (x, y) =>
    x < 1 || x > 21 || y < 1 || y > 15 ? null : y === 8 || (x === 11 && y > 8) ? 'stone-c' : 'grass',
  blocks: [],
  zones: [],
  spawn: { x: 11, y: 13 },
  stamps: [
    { stamp: 'plant-tall', x: 2, y: 3 },
    { stamp: 'bench', x: 14, y: 12 },
    { stamp: 'tree', x: 19, y: 3 },
    { stamp: 'plant-tall', x: 3, y: 12 },
  ],
  lights: [
    { x: 5, y: 6, r: 42, color: 0xe7ad7a },
    { x: 11, y: 5, r: 43, color: 0xa1cda4 },
    { x: 17, y: 6, r: 45, color: 0xe1c77d },
  ],
  npcs: [
    yardGuest('gresa', 4, 7, 'right'),
    yardGuest('pella', 9, 9, 'down'),
    yardGuest('wangari', 16, 8, 'left'),
    yardGuest('paulo', 14, 11, 'down'),
  ],
  interactables: [
    ...beds.map((b, i) =>
      prop(
        'bed-' + b,
        bedName[b] + ' nursery glass',
        'fieldgame',
        'orchard.tub',
        positions[i][0],
        positions[i][1],
        { game: 'grove-bed-' + b },
      ),
    ),
    prop('shade', 'The little theatre under the counting cloth', 'fieldgame', 'orchard.shutter', 15, 10, {
      game: 'grove-shutters',
    }),
    prop('lamp', 'Two coins for the orchard lantern', 'fieldgame', 'orchard.lantern', 7, 11, {
      game: 'grove-promise',
    }),
    exit('nursery-back', 'The path back to Fern Station', 11, 15, fern, 22, 10),
    prop('chalk', 'The half circle behind the baths', 'sign', 'orchard.bench', 19, 10, {
      text: 'A pink chalk ring runs under the wall. There is one little gap where a wheel could pass. Beyond the wall, far away, somebody coughs halfway through a song.',
      visibleIf: { not: underArch },
    }),
    exit('cartway', 'The cartway through the pink circle', 19, 10, orchardSquare, 4, 9, underArch),
  ],
};
export const groveStage: MapDef = {
  id: orchardSquare,
  name: 'Civic Machine: The Third Turn',
  world: 'WORLD-13',
  width: 22,
  height: 16,
  music: 'music.town',
  ambience: 'town',
  background: 0x3e414b,
  floor: (x, y) =>
    x < 1 || x > 20 || y < 1 || y > 14
      ? null
      : y === 9
        ? 'civic-hall-route'
        : (x + y) % 2
          ? 'civic-cobbles-a'
          : 'civic-cobbles-b',
  blocks: [],
  zones: [],
  spawn: { x: 11, y: 12 },
  stamps: [
    { stamp: 'bench', x: 3, y: 5 },
    { stamp: 'plant-tall', x: 17, y: 5 },
    { stamp: 'bench', x: 15, y: 11 },
  ],
  lights: [
    { x: 10, y: 7, r: 59, color: 0xebbc76 },
    { x: 4, y: 9, r: 37, color: 0xa8c8b8 },
  ],
  npcs: [
    yardGuest('gresa', 6, 6, 'right'),
    yardGuest('pella', 15, 7, 'left'),
    yardGuest('wangari', 7, 10, 'right'),
    yardGuest('paulo', 15, 4, 'down'),
  ],
  interactables: [
    ...Object.entries(delivery).map(([route, data]) =>
      prop('installed-' + route, data.built, 'fieldgame', data.art, 10, 7, {
        game: 'grove-square',
        visibleIf: { flag: 'grove.edition', eq: route as Edition },
      }),
    ),
    prop('archive', 'The grower’s rolled-up rota', 'sign', 'orchard.shutter', 16, 10, {
      text: 'Twelve slips stayed at the nursery. This sealed roll carries the count, or the choice to say nothing. The chair has been pushed around it so often that the cobbles shine.',
    }),
    exit('civic-back', 'The cobbles back to Library Dispatch', 11, 13, civic, 4, 15),
    exit('cartway-back', 'Wheel tracks through the back wall', 3, 9, orchardYard, 18, 10, underArch),
  ],
};
export function groveDoors(id: string): Interactable[] {
  if (id === fern)
    return [
      exit('fern-door', 'The bootprints leading to the nursery', 22, 11, orchardYard, 11, 13, forestGate),
    ];
  if (id === civic)
    return [
      exit('civic-door', 'The wheel mark beside the choir pole', 4, 14, orchardSquare, 11, 12, {
        all: [civicGate, placedGrove],
      }),
    ];
  return [];
}
