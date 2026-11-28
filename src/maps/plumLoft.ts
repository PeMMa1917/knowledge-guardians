import { hasPerkins, plumEdition, plumFlag } from '../content/plumOrchard';
import { PLUM_LOFT } from '../domain/plumChest';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

function place(
  id: string,
  x: number,
  y: number,
  label: string,
  art: string,
  kind: Interactable['kind'],
  extra: Partial<Interactable> = {},
): Interactable {
  return {
    id: 'plum-' + id,
    x,
    y,
    w: 1,
    h: 1,
    label,
    art,
    kind,
    walkThrough: true,
    ...extra,
  };
}
function story(
  id: string,
  x: number,
  y: number,
  label: string,
  art: string,
  visibleIf?: Condition,
) {
  return place(id, x, y, label, art, 'scene', {
    node: 'plum.' + id,
    visibleIf,
  });
}
function door(
  id: string,
  x: number,
  y: number,
  label: string,
  to: NonNullable<Interactable['to']>,
  visibleIf?: Condition,
) {
  return place(id, x, y, label, 'preserved.door', 'door', { to, visibleIf });
}
export const plumStair = door(
  'stair',
  18,
  10,
  'the loft with the biscuit-sized gap in its door',
  { map: PLUM_LOFT, x: 10, y: 13 },
);
export const roadPerformance = story(
  'cart',
  9,
  10,
  'the plum-stone handcart in the audience aisle',
  'plum.cart',
  plumEdition('road'),
);
export const rootsPerformance = story(
  'grove',
  14,
  11,
  'the old harness seats beneath the pear trees',
  'plum.seats',
  plumEdition('roots'),
);
export const rootsReturn = door(
  'orchard-return',
  10,
  8,
  'the way behind the mounted trees to the loft',
  { map: PLUM_LOFT, x: 16, y: 12 },
  plumEdition('roots'),
);
export const piaOrchard = {
  id: 'plum-pia',
  x: 17,
  y: 8,
  facing: 'left' as const,
  visibleIf: plumFlag('translated'),
};

export const plumLoft: MapDef = {
  id: PLUM_LOFT,
  name: 'House of Performance · The travelling orchard',
  world: 'WORLD-10',
  width: 23,
  height: 17,
  music: 'music.town',
  ambience: 'study',
  background: 0x332343,
  spawn: { x: 10, y: 13 },
  floor(x, y) {
    if (x < 1 || x > 21 || y < 0 || y > 15) return null;
    if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
    return x >= 6 && x <= 16 ? 'island-boards' : 'stone-c';
  },
  blocks: [
    [0, 0, 23, 3],
    [0, 0, 1, 17],
    [22, 0, 1, 17],
  ],
  zones: [],
  stamps: [
    { stamp: 'tree', x: 1, y: 3 },
    { stamp: 'tree', x: 17, y: 3 },
    { stamp: 'bench', x: 3, y: 11 },
    { stamp: 'window', x: 10, y: 1 },
    { stamp: 'plant-tall', x: 19, y: 11 },
  ],
  lights: [
    { x: 11, y: 5, r: 76, color: 0xffc27c },
    { x: 7, y: 12, r: 64, color: 0xd0a4b4 },
  ],
  npcs: [
    { id: 'plum-fen', x: 7, y: 9, facing: 'down' },
    { id: 'plum-tallowheel', x: 16, y: 9, facing: 'left' },
    {
      id: 'orchard-louis-braille',
      x: 3,
      y: 8,
      facing: 'right',
      visibleIf: hasPerkins,
    },
  ],
  interactables: [
    place(
      'chest',
      10,
      6,
      'the six-sided trunk on the folded coat',
      'plum.chest',
      'fieldgame',
      { game: 'plum-chest' },
    ),
    place(
      'mould',
      3,
      7,
      'Fen’s notched stylus table',
      'plum.mould',
      'fieldgame',
      { game: 'orchard-mould', visibleIf: hasPerkins },
    ),
    place(
      'drum',
      14,
      7,
      'the suspended rim beside the sounding board',
      'plum.drum',
      'fieldgame',
      { game: 'plum-drum' },
    ),
    story('score', 6, 5, 'the strips draped across Fen’s drum', 'ledger'),
    story('verse', 17, 6, 'the fruit tied to Fen’s branch', 'plum.tree'),
    story(
      'commission',
      11,
      10,
      'the biscuit tin holding the summer budget',
      'plum.chest',
    ),
    door(
      'road-door',
      5,
      13,
      'the painted wheel door out to the handcart',
      { map: 'stage.gallery', x: 9, y: 11 },
      plumEdition('road'),
    ),
    door(
      'root-trap',
      16,
      13,
      'the root trap under the little stage',
      { map: 'forest.community', x: 14, y: 12 },
      plumEdition('roots'),
    ),
    door('back', 10, 15, 'the unlatched stair back to rehearsal', {
      map: 'stage.rehearsal',
      x: 18,
      y: 11,
    }),
  ],
};
