import { ferryMap, ferrySheets, shoreMap } from '../domain/pictureFerry';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

const visibleSheet: Condition = {
  any: ferrySheets.flatMap((sheet) =>
    sheet.item ? [{ item: sheet.item }] : [],
  ),
};
function prop(
  id: string,
  x: number,
  y: number,
  label: string,
  art: string,
  extra: Partial<Interactable> & Pick<Interactable, 'kind'>,
): Interactable {
  return {
    id: 'picture-ferry-' + id,
    x,
    y,
    w: 1,
    h: 1,
    label,
    art,
    walkThrough: true,
    ...extra,
  };
}
const sail: Condition = { flag: 'picture-ferry.landing', eq: 'sail' },
  moor: Condition = { flag: 'picture-ferry.landing', eq: 'moor' };
export const pictureFerryDoor = prop(
  'gangway',
  19,
  12,
  'the painted boat with two little moons',
  'picture-ferry.boat',
  {
    kind: 'door',
    to: { map: ferryMap, x: 9, y: 12 },
  },
);
export const ferryShoreBench = prop(
  'passenger',
  18,
  13,
  'the passenger with a scrap of silver paper',
  'picture-ferry.window',
  {
    kind: 'fieldgame',
    game: 'picture-ferry-passenger',
    visibleIf: { flagSet: 'picture-ferry.landing' },
  },
);
export const ferryPlaybills: Interactable[] = [
  prop(
    'evening-show',
    17,
    8,
    'Hari’s three-page evening house',
    'picture-ferry.lamp',
    {
      kind: 'fieldgame',
      game: 'picture-ferry-gallery',
      visibleIf: { flag: 'picture-bill.posted', eq: true },
    },
  ),
  prop(
    'playbill-sail',
    16,
    8,
    'the programme low down beside the last seat',
    'picture-ferry.ticket',
    { kind: 'scene', node: 'picture-ferry.poster-sail', visibleIf: sail },
  ),
  prop(
    'playbill-moor',
    16,
    8,
    'the damp ticket Hari left on an empty chair',
    'stage.programme',
    { kind: 'scene', node: 'picture-ferry.poster-moor', visibleIf: moor },
  ),
];
export const pictureFerryRoom: MapDef = {
  id: ferryMap,
  world: 'WORLD-09',
  name: 'Cartographers’ Sea · The picture ferry',
  width: 22,
  height: 16,
  background: 0x193a48,
  music: 'music.town',
  ambience: 'town',
  spawn: { x: 9, y: 12 },
  blocks: [[0, 0, 22, 3]],
  zones: [],
  floor(x, y) {
    if (y < 1 || y > 14 || x < 2 || x > 19) return null;
    if ((x < 4 || x > 17) && (y < 5 || y > 11)) return null;
    if (y < 3) return y === 1 ? 'wall-mid' : 'wall-base';
    return 'island-boards';
  },
  lights: [
    { x: 10, y: 7, r: 78, color: 0xffc362 },
    { x: 5, y: 9, r: 48, color: 0x8ed5db },
  ],
  stamps: [
    { stamp: 'bench', x: 4, y: 6 },
    { stamp: 'bench', x: 15, y: 9 },
    { stamp: 'barrel', x: 17, y: 5 },
    { stamp: 'window', x: 9, y: 1 },
  ],
  npcs: [
    { id: 'ferry-tova', x: 14, y: 6, facing: 'left' },
    { id: 'callboard-reader', x: 6, y: 8, facing: 'right' },
    { id: 'picture-boy', x: 14, y: 10, facing: 'down' },
  ],
  interactables: [
    prop(
      'lamp',
      10,
      7,
      'the lamp with the three-sided paper sleeve',
      'picture-ferry.lamp',
      { kind: 'fieldgame', game: 'picture-ferry-wheel' },
    ),
    prop(
      'print-case',
      8,
      7,
      'the signed Civic prints waiting for projection',
      'picture-ferry.ticket',
      {
        kind: 'fieldgame',
        game: 'picture-ferry-wheel',
        visibleIf: visibleSheet,
      },
    ),
    prop(
      'bill',
      10,
      5,
      'the clothesline with three brass pegs',
      'picture-ferry.ticket',
      { kind: 'fieldgame', game: 'picture-ferry-bill' },
    ),
    prop(
      'ticket',
      12,
      10,
      'the brown supper ring beneath the silver moon',
      'picture-ferry.window',
      { kind: 'scene', node: 'picture-ferry.ticket' },
    ),
    prop(
      'berth',
      4,
      11,
      'the berth with an orange on its pillow',
      'stage.programme',
      { kind: 'scene', node: 'picture-ferry.orange' },
    ),
    prop('back', 9, 13, 'the gangway back to Seagrass Steps', 'sea.skiff', {
      kind: 'door',
      to: { map: shoreMap, x: 19, y: 13 },
    }),
    prop(
      'gallery',
      17,
      11,
      'the lantern boat to the evening performance',
      'picture-ferry.boat',
      {
        kind: 'door',
        visibleIf: sail,
        to: { map: 'stage.gallery', x: 16, y: 9 },
      },
    ),
    prop(
      'walk',
      4,
      10,
      'the long bank path Neris takes to the theatre',
      'sea.waypost',
      {
        kind: 'door',
        visibleIf: moor,
        to: { map: 'stage.gallery', x: 16, y: 9 },
      },
    ),
  ],
};
