import { cupShop, cupStops, stops, type CupStop } from '../domain/firstCup';
import { cupHosts } from '../content/firstCup';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

const away: Condition = { flag: 'cup.route', in: ['steps', 'weir'] };
const home: Condition = { not: away };
const market = 'market.square';
const places = { weir: { x: 21, y: 10 }, steps: { x: 17, y: 12 } } as const;
const stopIds = Object.keys(places) as CupStop[];
const streetFor = (map: string) => stopIds.find((k) => cupStops[k] === map);
const there = (stop: CupStop): Condition => ({ flag: 'cup.route', eq: stop });
function door(
  id: string,
  label: string,
  x: number,
  y: number,
  to: NonNullable<Interactable['to']>,
  visibleIf?: Condition,
): Interactable {
  return { id, kind: 'door', label, x, y, w: 1, h: 1, to, visibleIf, art: 'cup.flap', walkThrough: true };
}
export function cupStreet(map: string): Interactable[] {
  if (map === market)
    return [
      door('first-cup-stairs', 'the cocoa stairs under the red flap', 13, 16, { map: cupShop, x: 9, y: 11 }),
    ];
  const stop = streetFor(map);
  if (!stop) return [];
  const { x, y } = places[stop];
  return [
    {
      id: 'first-cup-cart-' + stop,
      kind: 'fieldgame',
      game: 'first-cup-street',
      label: 'Cen’s cocoa cart and the two thermometers',
      art: 'cup.cart',
      x,
      y,
      w: 1,
      h: 1,
      walkThrough: true,
      visibleIf: there(stop),
    },
    door(
      'first-cup-return-' + stop,
      'the covered lane to the cocoa shop',
      x + 1,
      y + 2,
      { map: cupShop, x: 9, y: 11 },
      { flag: 'cup.visited.' + stop, eq: true },
    ),
    {
      id: 'first-cup-rail-' + stop,
      kind: 'sign',
      label: 'chalk letters on the brass rail',
      text: 'A visitor mouths the number before coming up to the counter. The figure left in the brass is deeper than the new chalk.',
      art: 'cup.board',
      x: x + 2,
      y,
      w: 1,
      h: 1,
      walkThrough: true,
      visibleIf: { all: [there(stop), { flag: 'cup.serving', eq: 'chalk' }] },
    },
    {
      id: 'first-cup-fold-' + stop,
      kind: 'sign',
      label: 'a porcelain cup full of folded offers',
      text: 'The top fold has a thumbprint in street chalk. The one underneath shows a tiny drawing of a wheel. A new visitor holds an empty slip up to the light.',
      art: 'cup.slips',
      x: x + 2,
      y,
      w: 1,
      h: 1,
      walkThrough: true,
      visibleIf: { all: [there(stop), { flag: 'cup.serving', eq: 'slips' }] },
    },
  ];
}
export function cupVisitors(map: string): MapDef['npcs'] {
  const stop = streetFor(map);
  if (!stop) return [];
  const { x, y } = places[stop];
  return [
    { id: cupHosts.cen, x: x - 2, y, facing: 'right', visibleIf: there(stop) },
    { id: cupHosts.kit, x, y: y + 2, facing: 'up', visibleIf: there(stop) },
    { id: cupHosts.daniel, x: x - 1, y: y - 1, facing: 'down', visibleIf: there(stop) },
    { id: cupHosts.amos, x: x + 2, y: y - 1, facing: 'down', visibleIf: there(stop) },
  ];
}
export const firstCupRoom: MapDef = {
  id: cupShop,
  name: 'The shop under an old price',
  world: 'WORLD-11',
  width: 19,
  height: 15,
  background: 0x45333e,
  spawn: { x: 9, y: 11 },
  ambience: 'study',
  music: 'music.archive',
  floor: (x, y) =>
    x < 1 || x > 17 || y < 0 || y > 13 ? null : y < 3 ? ['wall-top', 'wall-mid', 'wall-base'][y] : 'island-boards',
  blocks: [[0, 0, 19, 3]],
  zones: [],
  lights: [
    { x: 4, y: 6, r: 68, color: 0xf1bc69 },
    { x: 15, y: 4, r: 58, color: 0x7bb7bd },
  ],
  stamps: [
    { stamp: 'window', x: 14, y: 1 },
    { stamp: 'barrel', x: 2, y: 4 },
    { stamp: 'bench', x: 6, y: 9 },
  ],
  npcs: [
    { id: cupHosts.cen, x: 5, y: 5, facing: 'right', visibleIf: home },
    { id: cupHosts.kit, x: 12, y: 6, facing: 'left', visibleIf: home },
    { id: cupHosts.daniel, x: 8, y: 4, facing: 'down', visibleIf: home },
    { id: cupHosts.amos, x: 15, y: 7, facing: 'left', visibleIf: home },
  ],
  interactables: [
    {
      id: 'first-cup-jug',
      kind: 'fieldgame',
      game: 'first-cup-shop',
      label: 'the two carafes and the silent counter',
      art: 'cup.pots',
      x: 9,
      y: 7,
      w: 1,
      h: 1,
      walkThrough: true,
    },
    {
      id: 'first-cup-gutter',
      kind: 'sign',
      label: 'a line of rain drops below the flap',
      art: 'cup.rain',
      x: 13,
      y: 4,
      w: 1,
      h: 1,
      walkThrough: true,
      visibleIf: { flag: 'cup.rain', eq: true },
      text: 'Water runs over the first figure on the price board. The gutter has two fresh wheel tracks underneath.',
    },
    door('first-cup-square', 'the stairs to Lantern Square', 9, 12, { map: market, x: 13, y: 17 }),
    ...stopIds.map((stop) =>
      door(
        'first-cup-road-' + stop,
        'the covered road to ' + stops[stop],
        15,
        10,
        { map: cupStops[stop], x: places[stop].x, y: places[stop].y + 1 },
        there(stop),
      ),
    ),
  ],
};
