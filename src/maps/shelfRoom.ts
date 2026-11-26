import type { Condition } from '../domain/types';
import { PRISM_ANNEX } from './prismViewer';
import type { Interactable, MapDef } from './types';

const width = 18;
const height = 15;
const room = 'aethelgard.shelf-room';
const model = 'aethelgard.shelf-model';
const bothPlans: Condition = { objective: 'shelf.room.compare' };
const route = (value: string): Condition => ({ flag: 'shelf.room.route', eq: value });

function scene(id: string, node: string, x: number, y: number, label: string, art: string, visibleIf?: Condition): Interactable {
  return { id, node, kind: 'scene', x, y, w: 1, h: 1, label, art, walkThrough: true, visibleIf };
}

function door(id: string, x: number, y: number, label: string, art: string,
  destination: string, to: [number, number], visibleIf?: Condition): Interactable {
  return { id, kind: 'door', x, y, w: 1, h: 1, label, art, to: { map: destination, x: to[0], y: to[1] }, visibleIf };
}

function floor(x: number, y: number): string | null {
  if (x < 1 || x >= width - 1 || y < 0 || y >= height - 1) return null;
  if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
  if (y === 3) return 'stone-t';
  return 'stone-c';
}

export const SHELF_ROOM_DOOR = door('study-side-annex', 3, 6, 'the door to Elsbet’s loan annex', 'preserved.door',
  room, [9, 12], { flag: 'study.letter', eq: true });

const common = {
  world: 'WORLD-02', width, height, music: 'music.box', ambience: 'study',
  floor, npcs: [], zones: [], spawn: { x: 9, y: 12 },
} satisfies Partial<MapDef>;

export const SHELF_ROOM: MapDef = {
  ...common, id: room, name: 'Emberford: Elsbet’s loan annex', background: 0x1e1422,
  blocks: [[0, 0, width, 3], [0, 0, 1, height], [width - 1, 0, 1, height], [0, height - 1, width, 1],
    [3, 7, 2, 1], [6, 7, 6, 1]],
  conditionalBlocks: [{ x: 5, y: 7, when: { not: route('west') } }],
  stamps: [{ stamp: 'bookshelf', x: 6, y: 1 }, { stamp: 'long-table', x: 11, y: 5 },
    { stamp: 'bench', x: 5, y: 9 }, { stamp: 'crates', x: 12, y: 7 }],
  lights: [{ x: 10, y: 10, r: 80, color: 0xffcf91, flicker: true }, { x: 5, y: 5, r: 45, color: 0xdbc68f }],
  interactables: [
    ...PRISM_ANNEX,
    door('shelf-room-exit', 9, 13, 'the stair back to Elsbet’s study', 'preserved.door', 'aethelgard.study', [3, 7]),
    { id: 'shelf-blocked-west', kind: 'sign', x: 5, y: 7, w: 1, h: 1, walkThrough: true, label: 'the loan crate filling the west gap',
      art: 'preserved.folder', visibleIf: { not: route('west') },
      text: 'The crate occupies the point where someone would turn past the bench. There is more room at the east end.' },
    { id: 'shelf-east-crate', kind: 'sign', x: 15, y: 6, w: 1, h: 1, walkThrough: true, label: 'the loan crate in the drying bay',
      art: 'preserved.folder', visibleIf: route('west'),
      text: 'The crate is out of the west path. The repairer can still reach it. The bay only has room for one.' },
    scene('shelf-room-prop', 'shelf.room.start', 11, 11, 'the loan annex’s damp repair ledger', 'ledger'),
    door('shelf-room-projection', 9, 8, 'step into the working reconstruction', 'shelf-room.layer', model, [9, 9],
      { flagSet: 'shelf.room.current' }),
    scene('shelf-room-choose', 'shelf.room.choose', 11, 9, 'the annex circulation peg', 'nexus.viewer-sheet', bothPlans),
    scene('shelf-room-west', 'shelf.room.west', 3, 5, 'the test at the west reading path', 'fold.paired', route('west')),
    scene('shelf-room-desk', 'shelf.room.desk', 14, 10, 'the test at the staffed deposit desk', 'fold.strip', route('desk')),
  ],
};

export const SHELF_MODEL: MapDef = {
  ...common, id: model, name: 'Emberford: loan annex before the flood, working reconstruction', background: 0x26354e,
  spawn: { x: 9, y: 9 },
  blocks: [[0, 0, width, 3], [0, 0, 1, height], [width - 1, 0, 1, height], [0, height - 1, width, 1],
    [11, 5, 1, 6]],
  stamps: [{ stamp: 'bench', x: 7, y: 5 }, { stamp: 'rug-green', x: 4, y: 7 }, { stamp: 'table', x: 13, y: 7 }],
  lights: [{ x: 5, y: 6, r: 76, color: 0x83d6de }, { x: 13, y: 8, r: 70, color: 0x91a9e9 }],
  interactables: [
    door('shelf-projection-return', 9, 8, 'step back into the present annex', 'shelf-room.layer', room, [9, 9]),
    scene('shelf-model-sill', 'shelf.room.sill', 4, 5, 'the frame line copied from the dated sketch', 'shelf-room.staple'),
    scene('shelf-model-turn', 'shelf.room.turn', 13, 10, 'the disputed shelf line shown in broken marks', 'shelf-room.tear'),
  ],
};

export const SHELF_NILE_CALLBACK: Interactable[] = [
  scene('nile-shelf-stops', 'shelf.nile.stops', 14, 9, 'Marek’s two plan tabs at the passage model', 'shelf-room.layer',
    { all: [{ item: 'item.annex-register' }, { objective: 'nile.routes' }] }),
  scene('nile-shelf-open', 'shelf.nile.open', 20, 9, 'the tested clearance on the marked aisle', 'fold.paired',
    { flag: 'shelf.nile.route', eq: 'open' }),
  scene('nile-shelf-copy', 'shelf.nile.copy', 18, 10, 'the signed stock desk routing test', 'fold.strip',
    { flag: 'shelf.nile.route', eq: 'desk' }),
];
