import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

const tile = { w: 1, h: 1, walkThrough: true };
const marked = (flag: string): Condition => ({ flagSet: flag });
const is = (flag: string, eq: boolean | string = true): Condition => ({ flag, eq });
const all = (...conditions: Condition[]): Condition => ({ all: conditions });
const before = (condition: Condition): Condition => ({ not: condition });
const done = (objective: string): Condition => ({ objective });

function notice(id: string, x: number, y: number, label: string, art: string, text: string,
  options: Pick<Interactable, 'flag' | 'visibleIf'> = {}): Interactable {
  return { id, kind: 'sign', x, y, ...tile, label, art, text, ...options };
}

function scene(id: string, x: number, y: number, label: string, art: string, node: string, visibleIf: Condition): Interactable {
  return { id, kind: 'scene', x, y, ...tile, label, art, node, visibleIf };
}

function door(id: string, x: number, y: number, label: string, to: NonNullable<Interactable['to']>,
  flag?: string, visibleIf?: Condition): Interactable {
  return { id, kind: 'door', x, y, w: 1, h: 1, label, art: 'preserved.door', to, flag, visibleIf };
}

function barrier(id: string, x: number, y: number, label: string, opened: Condition): Interactable {
  return {
    ...notice(id, x, y, label, 'cellar-door', 'This rail marks the practice lane. Follow the route posted at the receiving board.'),
    artOpen: { key: 'cellar-door.open', if: opened },
  };
}

function floor(x: number, y: number): string | null {
  if (x < 1 || x >= 18 || y < 0 || y >= 13) return null;
  if (y === 0) return 'wall-top';
  if (y === 1) return 'wall-mid';
  if (y === 2) return 'wall-base';
  return 'stone-c';
}

const metalDirect = is('latch.metal.layout', 'direct');
const metalRound = is('latch.metal.layout', 'round');
const metalUnchecked = before(is('latch.metal.served'));
const metalReference = is('latch.metal.draft');
const metalPlan = all(done('latch.metal.observed'), before(marked('latch.metal.layout')));

export const METAL_LATCH_DOOR = door('metal-latch-door', 2, 7, 'the passage to the practice loading bay',
  { map: 'metalworks.latch-bay', x: 2, y: 10 }, 'latch.metal.arrived', is('metal.arrived'));

export const METAL_LATCH_BAY: MapDef = {
  id: 'metalworks.latch-bay', name: 'Metalworks: Loading Bay', world: 'WORLD-07', width: 19, height: 13,
  background: 0x352d39, music: 'music.town', ambience: 'study', spawn: { x: 2, y: 10 }, zones: [], npcs: [],
  floor: (x, y) => x === 8 && y >= 3 && y < 13 && y !== 6 && y !== 10 ? 'wall-mid' : floor(x, y),
  blocks: [[1, 0, 17, 3], [8, 3, 1, 3], [8, 7, 1, 3], [8, 11, 1, 2]],
  conditionalBlocks: [
    { x: 8, y: 6, when: before(metalDirect) },
    { x: 8, y: 10, when: before(metalRound) },
  ],
  stamps: [
    { stamp: 'cabinet', x: 2, y: 3 }, { stamp: 'window', x: 5, y: 1 }, { stamp: 'window', x: 13, y: 1 },
    { stamp: 'crates', x: 14, y: 3 }, { stamp: 'bench', x: 14, y: 9 },
  ],
  interactables: [
    door('metal-latch-return', 2, 11, 'the passage back to the Sample Yard', { map: 'metalworks.yard', x: 3, y: 7 }),
    notice('metal-latch-draft', 3, 8, 'the bright lamp and stamped tally', 'metalworks.receipt',
      'OPEN is stamped under a drawing of the bright lamp. The tally keeper noted that this stamp comes from the request line that lights the lamp. Nobody signed a sighting of the latch.',
      { flag: 'latch.metal.draft' }),
    { ...scene('metal-latch-reference', 4, 6, 'Corra’s shutter on the reference stand', 'workbench', 'latch.metal.reference',
      all(metalReference, before(done('latch.metal.references')))),
      artBy: { flag: 'latch.metal.reference', keys: { open: 'cellar-door.open', closed: 'cellar-door' } } },
    notice('metal-latch-view-open', 6, 5, 'the sight slot at the known open stop', 'preserved.slip',
      'At the wide gap you can see the white strip. The bright lamp and its copied tally both say OPEN. Here the shutter is visibly open too.',
      { flag: 'latch.metal.seen.open', visibleIf: is('latch.metal.reference', 'open') }),
    notice('metal-latch-view-closed', 6, 5, 'the sight slot at the known closed stop', 'preserved.slip',
      'The shutter covers the white strip and touches its end stop. The lamp and copied tally still say OPEN. Both followed the same request.',
      { flag: 'latch.metal.seen.closed', visibleIf: is('latch.metal.reference', 'closed') }),
    scene('metal-latch-sill', 7, 5, 'the viewing grille by the actual latch', 'plumb-mark', 'latch.metal.sill',
      all(done('latch.metal.references'), before(done('latch.metal.observed')))),
    notice('metal-latch-observed', 7, 5, 'the first separate sighting', 'preserved.slip',
      'First sighting from the grille. The latch was home and the shutter was closed. OPEN had come from the request peg.',
      { visibleIf: done('latch.metal.observed') }),
    scene('metal-latch-plan', 5, 9, 'Corra’s run board', 'board-stand', 'latch.metal.plan', metalPlan),
    barrier('metal-latch-direct-rail', 8, 6, 'the short lane rail', metalDirect),
    barrier('metal-latch-round-rail', 8, 10, 'the round lane rail', metalRound),
    scene('metal-latch-direct-proof', 12, 6, 'the crate stop inside the short lane', 'crate-wares', 'latch.metal.direct', all(metalDirect, metalUnchecked)),
    scene('metal-latch-round-proof', 12, 10, 'the parcel shelf inside the round lane', 'preserved.folder', 'latch.metal.round', all(metalRound, metalUnchecked)),
    notice('metal-latch-direct-result', 12, 6, 'the attended crate receipt', 'metalworks.receipt',
      'The short lane took the full practice crate with Corra’s separate sighting. The crew still waits for her call when the stand is empty.',
      { visibleIf: all(metalDirect, done('latch.metal.finish')) }),
    notice('metal-latch-round-result', 12, 10, 'the parcel receipt', 'metalworks.receipt',
      'The round lane received the smaller parcel while Corra was at her bench. The crate waits at the short rail for a staffed check.',
      { visibleIf: all(metalRound, done('latch.metal.finish')) }),
  ],
  lights: [{ x: 5, y: 6, r: 75, color: 0xeec591 }, { x: 13, y: 8, r: 66, color: 0xd9e9ff }],
};

const waterDirect = is('latch.water.layout', 'direct');
const waterRound = is('latch.water.layout', 'round');
const waterUnchecked = before(is('latch.water.served'));
const waterStarted = marked('latch.water.source');
const waterPlan = all(done('latch.water.observed'), before(marked('latch.water.layout')));

export const WATER_LATCH_DOOR = door('water-latch-door', 4, 12, 'the path to the dry service lane',
  { map: 'water.service-lane', x: 3, y: 11 }, 'latch.water.arrived', done('water.arrival'));

export const WATER_SERVICE_LANE: MapDef = {
  id: 'water.service-lane', name: 'Water Commons: Dry Service Lane', world: 'WORLD-12', width: 19, height: 13,
  background: 0x293e43, music: 'music.town', ambience: 'town', spawn: { x: 3, y: 11 }, zones: [], npcs: [],
  floor: (x, y) => {
    const surface = floor(x, y);
    if (!surface || y < 3) return surface;
    if (y === 7) return x === 9 || x === 15 ? 'water-bridge' : 'water-ripple-a';
    return 'water-bank';
  },
  blocks: [[1, 0, 17, 3], [1, 7, 8, 1], [10, 7, 5, 1], [16, 7, 2, 1]],
  conditionalBlocks: [
    { x: 9, y: 7, when: before(waterDirect) },
    { x: 15, y: 7, when: before(waterRound) },
  ],
  stamps: [
    { stamp: 'window', x: 5, y: 1 }, { stamp: 'crates', x: 3, y: 4 },
    { stamp: 'water-lantern', x: 12, y: 5 }, { stamp: 'market-bench', x: 13, y: 10 },
  ],
  interactables: [
    door('water-latch-return', 2, 11, 'the path back to the Old Weir', { map: 'water.gatehouse', x: 5, y: 12 }),
    notice('water-latch-draft', 4, 10, 'the service flag and its tick sheet', 'water.notice',
      'CLOSED. The desk copied the lowered flag onto this sheet. Both refer to the closing request on the board. The dry service track has its own latch and a temporary rail.',
      { flag: 'latch.water.draft' }),
    scene('water-latch-start', 5, 9, 'Omi’s clip for two kinds of reading', 'preserved.folder', 'latch.water.start',
      all(is('latch.water.draft'), before(waterStarted))),
    notice('water-latch-carried', 5, 9, 'the reference strip from the Metalworks', 'metalworks.receipt',
      'Corra’s strip keeps the request and latch on separate lines. The Metalworks reading stays with its place. Omi has left the two spaces for the new local readings.',
      { visibleIf: is('latch.water.source', 'carry') }),
    notice('water-latch-local', 5, 9, 'the new two-line service strip', 'preserved.slip',
      'The requested position goes here. The position someone saw at the latch has its own line.',
      { visibleIf: is('latch.water.source', 'local') }),
    { ...scene('water-latch-reference', 6, 10, 'Omi’s model barrier and reference stops', 'workbench', 'latch.water.reference',
      all(waterStarted, before(done('latch.water.references')))),
      artBy: { flag: 'latch.water.reference', keys: { open: 'cellar-door.open', closed: 'cellar-door' } } },
    notice('water-latch-view-open', 8, 10, 'the model’s known open stop', 'water.notice',
      'The model bar is against the open stop. The flag hangs low and the copied sheet still reads CLOSED, just as it did for the request.',
      { flag: 'latch.water.seen.open', visibleIf: is('latch.water.reference', 'open') }),
    notice('water-latch-view-closed', 8, 10, 'the model’s known closed stop', 'water.notice',
      'The model bar spans its frame at the closed stop. The flag hangs low and the copied sheet reads CLOSED. The bar’s position is clear from the stop itself.',
      { flag: 'latch.water.seen.closed', visibleIf: is('latch.water.reference', 'closed') }),
    scene('water-latch-sill', 9, 8, 'the dry lane’s sight mark at the latch', 'plumb-mark', 'latch.water.sill',
      all(done('latch.water.references'), before(done('latch.water.observed')))),
    notice('water-latch-observed', 9, 8, 'the white mark’s separate sighting', 'preserved.slip',
      'First sighting from the white mark. The latch was open while CLOSED sat in the request clip. The temporary access rail was still up.',
      { visibleIf: done('latch.water.observed') }),
    scene('water-latch-plan', 11, 10, 'Omi’s dry lane board', 'board-stand', 'latch.water.plan', waterPlan),
    barrier('water-latch-direct-rail', 9, 7, 'the direct dry lane rail', waterDirect),
    barrier('water-latch-round-rail', 15, 7, 'the raised bank lane rail', waterRound),
    scene('water-latch-direct-proof', 10, 5, 'the broad tray stop inside the direct lane', 'crate-wares', 'latch.water.direct', all(waterDirect, waterUnchecked)),
    scene('water-latch-round-proof', 15, 5, 'the little tray stop by the raised bank', 'preserved.folder', 'latch.water.round', all(waterRound, waterUnchecked)),
    notice('water-latch-direct-result', 10, 5, 'the spotter’s received tray', 'water.notice',
      'The broad tool tray made the direct crossing under a spotter’s call. The marker crew wait for their next hand while the spotter stays on duty.',
      { visibleIf: all(waterDirect, done('latch.water.finish')) }),
    notice('water-latch-round-result', 15, 5, 'the bank walker’s received tray', 'water.notice',
      'The raised bank took a small tool tray with no need to call for the spotter. The marker crew could stay at their work. The broad tray waits for a staffed crossing.',
      { visibleIf: all(waterRound, done('latch.water.finish')) }),
  ],
  lights: [{ x: 7, y: 9, r: 66, color: 0xffd397 }, { x: 13, y: 4, r: 74, color: 0xc0e9e5 }],
};
