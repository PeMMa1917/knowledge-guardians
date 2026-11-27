import type { Condition } from '../domain/types';
import { SUPPER_GAME, SUPPER_ROOM } from '../domain/supperShadow';
import { islandProofReceipt } from '../domain/islandProofRack';
import { supperOutcome } from '../content/supperShadow';
import type { Interactable, MapDef } from './types';

const at = (x: number, y: number) => ({ x, y, w: 1, h: 1 });
function scene(
  id: string,
  x: number,
  y: number,
  label: string,
  art: string,
  visibleIf?: Condition,
): Interactable {
  return {
    id: 'supper-' + id,
    ...at(x, y),
    kind: 'scene',
    node: 'supper.' + id,
    label,
    art,
    visibleIf,
    walkThrough: true,
  };
}
const side = (
  id: 'hall' | 'kitchen' | 'booth',
  x: number,
  y: number,
  to: NonNullable<Interactable['to']>,
): Interactable => ({
  id: 'supper-stair-' + id,
  kind: 'door',
  ...at(x, y),
  to,
  visibleIf: supperOutcome(id),
  label:
    id === 'hall'
      ? 'the bell stair to the waiting children'
      : id === 'kitchen'
        ? 'the linen stair to the printing kitchen'
        : 'the little stair to the single-visitor booth',
  art: id === 'hall' ? 'study-stairs' : 'preserved.door',
});

export const SUPPER_HATCH: Interactable = {
  id: 'supper-hatch',
  kind: 'door',
  ...at(10, 11),
  art: 'preserved.door',
  label: 'the steaming hatch with the two chalk shadows',
  to: { map: SUPPER_ROOM, x: 11, y: 13 },
};
export const SUPPER_LANDING: Interactable = scene(
  'hall-reader',
  14,
  11,
  'Kip singing with the child at the landing',
  'board-stand',
  supperOutcome('hall'),
);
export const SUPPER_BOOTH: Interactable = scene(
  'booth-reader',
  7,
  10,
  'the solo shutter cords above Mina’s stool',
  'copies.reprint',
  supperOutcome('booth'),
);
export const SUPPER_KITCHEN: Interactable = scene(
  'kitchen-reader',
  14,
  12,
  'the second place at the printers’ supper table',
  'ledger',
  supperOutcome('kitchen'),
);
export const SUPPER_MARKET: Interactable = scene(
  'market-later',
  26,
  18,
  'the pair of spoons on Corvan’s shutter',
  'market.window',
  {
    any: [
      { flag: 'supper.read.hall', eq: true },
      { flag: 'supper.read.kitchen', eq: true },
      { flag: 'supper.read.booth', eq: true },
    ],
  },
);

export const SUPPER_MAP: MapDef = {
  id: SUPPER_ROOM,
  name: 'City of Copies · The supper hatch',
  world: 'WORLD-08',
  width: 24,
  height: 17,
  spawn: { x: 11, y: 13 },
  music: 'music.town',
  ambience: 'study',
  background: 0x402839,
  floor(x, y) {
    if (x < 1 || x > 22 || y < 0 || y > 15) return null;
    if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
    return x >= 8 && x <= 16 && y < 10 ? 'island-boards' : 'stone-c';
  },
  blocks: [
    [0, 0, 24, 3],
    [0, 0, 1, 17],
    [23, 0, 1, 17],
  ],
  zones: [],
  stamps: [
    { stamp: 'window', x: 6, y: 1 },
    { stamp: 'window', x: 17, y: 1 },
    { stamp: 'bench', x: 3, y: 12 },
    { stamp: 'cabinet', x: 1, y: 4 },
    { stamp: 'rug-green', x: 10, y: 11 },
    { stamp: 'plant-tall', x: 21, y: 12 },
  ],
  lights: [
    { x: 7, y: 6, r: 80, color: 0xffc980 },
    { x: 15, y: 6, r: 80, color: 0xffcb85 },
    { x: 19, y: 12, r: 52, color: 0xf9af83 },
  ],
  npcs: [{ id: 'otla-rusk', x: 12, y: 9, facing: 'down' }],
  interactables: [
    {
      id: 'supper-lamps',
      kind: 'fieldgame',
      game: SUPPER_GAME,
      ...at(11, 5),
      art: 'workbench',
      label: 'the spoon rack between the lamps',
    },
    scene('book', 5, 9, 'Kip’s stool facing the hatch', 'ledger', {
      item: 'item.journal',
    }),
    scene(
      'pen',
      8,
      7,
      'the curtain hem and a sheet of tracing paper',
      'preserved.slip',
      { item: 'tool.annotation-pen' },
    ),
    scene('seal', 4, 5, 'Ise’s wax pats beside the wick', 'board-stand', {
      item: 'item.gold-seal',
    }),
    scene(
      'map',
      16,
      8,
      'the Emberford route marked across the floor',
      'old-sign',
      { item: 'item.town-map' },
    ),
    scene(
      'deputy',
      18,
      12,
      'a covered bowl waiting on the back step',
      'fold.strip',
      { item: 'item.sill.claim-slip' },
    ),
    scene('pair', 19, 5, 'two paper bags on Mina’s ladle rack', 'fold.paired', {
      item: islandProofReceipt('paired-views'),
    }),
    scene(
      'scale',
      20,
      9,
      'the drawings and Otla’s sleeve with a loose name flap',
      'preserved.folder',
      { item: islandProofReceipt('scale-bar') },
    ),
    scene(
      'tea',
      6,
      12,
      'the narrow bench and its empty cup rest',
      'market.window',
      { any: [{ item: 'item.tea' }, { flagSet: 'supper.tea' }] },
    ),
    scene('optics', 14, 4, 'the observatory visitor’s peg rail', 'plumb-mark', {
      flag: 'thinker.haytham.test.tube',
      eq: true,
    }),
    scene(
      'curtain',
      14,
      6,
      'the bell cord and the curtain tie',
      'fold.two-hinges',
    ),
    side('hall', 5, 13, { map: 'copies.landing', x: 14, y: 12 }),
    side('kitchen', 18, 14, { map: 'copies.press', x: 14, y: 13 }),
    side('booth', 15, 13, { map: 'copies.archive', x: 7, y: 11 }),
    {
      id: 'supper-return',
      kind: 'door',
      ...at(11, 15),
      label: 'the hatch back to the landing',
      art: 'preserved.door',
      to: { map: 'copies.landing', x: 10, y: 12 },
    },
  ],
};
