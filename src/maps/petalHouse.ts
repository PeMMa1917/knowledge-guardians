import { specimenEquipped } from '../domain/specimenGear';
import { extraCondition, petalExtras } from '../content/petalGlasshouse';
import { flowerFlag, petalMap } from '../domain/petalWindow';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

function at(
  id: string,
  x: number,
  y: number,
  label: string,
  art: string,
  extra: Partial<Interactable> & Pick<Interactable, 'kind'>,
): Interactable {
  return {
    id: 'petal-' + id,
    x,
    y,
    w: 1,
    h: 1,
    walkThrough: true,
    label,
    art,
    ...extra,
  };
}
const choice = (e: string): Condition => ({
  flag: flowerFlag('ending'),
  eq: e,
});
export const petalDoor = at(
  'house-door',
  19,
  9,
  'the low glass roof with two painted bees',
  'petal.glass',
  { kind: 'door', to: { map: petalMap, x: 11, y: 13 } },
);
export const gardenSeats = at(
  'garden-seats',
  15,
  9,
  'the waiting seats under the bridge awning',
  'petal.ledge',
  { kind: 'fieldgame', game: 'petal-audience', visibleIf: choice('garden') },
);
export const silkSeats = at(
  'silk-seats',
  16,
  9,
  'Viri’s copper wire by the rehearsal seats',
  'petal.glove',
  { kind: 'fieldgame', game: 'petal-audience', visibleIf: choice('silk') },
);
const merian = specimenEquipped('cma:1955.320');
export function travellingArtist(
  e: 'garden' | 'silk',
  x: number,
  y: number,
): MapDef['npcs'][number] {
  return {
    id: 'petal-merian',
    x,
    y,
    facing: 'down',
    visibleIf: { all: [merian, choice(e), { objective: 'petal.plate' }] },
  };
}
export const gardenRibbons = at(
  'garden-ribbons',
  14,
  9,
  'two folded watches in the garden wings',
  'petal.glove',
  { kind: 'fieldgame', game: 'petal-ribbons', visibleIf: choice('garden') },
);
export const silkRibbons = at(
  'silk-ribbons',
  17,
  9,
  'the dancer’s two sealed watch sleeves',
  'petal.crop',
  { kind: 'fieldgame', game: 'petal-ribbons', visibleIf: choice('silk') },
);
const places = [
  [4, 6],
  [6, 6],
  [18, 6],
  [20, 6],
  [10, 7],
  [4, 10],
  [20, 10],
  [18, 11],
];
export const petalHouse: MapDef = {
  id: petalMap,
  world: 'WORLD-06',
  name: 'Living Forest · The little glasshouse',
  width: 25,
  height: 17,
  background: 0x193341,
  music: 'music.town',
  ambience: 'town',
  spawn: { x: 11, y: 13 },
  blocks: [[2, 1, 21, 3]],
  floor(x, y) {
    if (x < 2 || x > 22 || y < 1 || y > 15) return null;
    if (y === 1) return 'wall-mid';
    if (y < 4) return 'wall-base';
    return y === 8 || x === 11 ? 'stone-c' : 'grass';
  },
  lights: [
    { x: 10, y: 6, r: 82, color: 0xf6d59a },
    { x: 17, y: 6, r: 55, color: 0xbcb6ed },
  ],
  stamps: [
    { stamp: 'window', x: 6, y: 1 },
    { stamp: 'window', x: 12, y: 1 },
    { stamp: 'window', x: 18, y: 1 },
    { stamp: 'flowers-small', x: 3, y: 5 },
    { stamp: 'flowers-white', x: 19, y: 5 },
    { stamp: 'bench', x: 4, y: 12 },
  ],
  zones: [],
  npcs: [
    { id: 'petal-dancer', x: 13, y: 8, facing: 'left' },
    { id: 'forest-naturalist', x: 7, y: 9, facing: 'right' },
    {
      id: 'petal-merian',
      x: 17,
      y: 4,
      facing: 'down',
      visibleIf: { all: [merian, { flag: flowerFlag('plate.met'), eq: true }] },
    },
  ],
  interactables: [
    at(
      'gears',
      13,
      5,
      'the rolling theatre with four paper cylinders',
      'petal.glove',
      {
        kind: 'fieldgame',
        game: 'petal-gears',
        visibleIf: { objective: 'petal.curtain' },
      },
    ),
    at(
      'window',
      10,
      6,
      'the two flower crops under the little window',
      'petal.crop',
      { kind: 'fieldgame', game: 'petal-window' },
    ),
    at(
      'ledge',
      15,
      6,
      'the sliding ledge with two glass mornings',
      'petal.ledge',
      { kind: 'fieldgame', game: 'petal-ledge' },
    ),
    at(
      'stage',
      13,
      11,
      'the copper glove hanging on the little stage',
      'petal.glove',
      { kind: 'fieldgame', game: 'petal-stage' },
    ),
    at(
      'engraving',
      16,
      5,
      'the credit ribbon for the 1771 Cleveland engraving',
      'preserved.folder',
      { kind: 'scene', node: 'petal.plate', visibleIf: merian },
    ),
    at('back', 11, 14, 'the door back to Fern Station', 'petal.glass', {
      kind: 'door',
      to: { map: 'forest.station', x: 20, y: 9 },
    }),
    at(
      'garden-door',
      18,
      13,
      'the opening under the garden seats',
      'petal.ledge',
      {
        kind: 'door',
        to: { map: 'forest.community', x: 15, y: 10 },
        visibleIf: choice('garden'),
      },
    ),
    at(
      'silk-door',
      5,
      13,
      'the wings of the performers’ small stage',
      'petal.glove',
      {
        kind: 'door',
        to: { map: 'stage.rehearsal', x: 16, y: 10 },
        visibleIf: choice('silk'),
      },
    ),
    ...petalExtras.map((t, i) =>
      at(
        'tool-' + t.id,
        places[i][0],
        places[i][1],
        t.name,
        t.art,
        t.id === 'pin'
          ? {
              kind: 'fieldgame',
              game: 'petal-window',
              visibleIf: extraCondition(t),
            }
          : {
              kind: 'scene',
              node: 'petal.tool.' + t.id,
              visibleIf: extraCondition(t),
            },
      ),
    ),
  ],
};
