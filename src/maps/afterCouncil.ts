import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

const ending: Condition = { flagSet: 'ending.council' };
const visited: Condition = { flagSet: 'postgame.open' };
const unfinished: Condition = { not: { flagSet: 'postgame.edition' } };

function scene(id: string, node: string, x: number, y: number, label: string, art: string, visibleIf?: Condition): Interactable {
  return { id, node, kind: 'scene', x, y, w: 1, h: 1, label, art, visibleIf, walkThrough: true };
}

export const FIRST_BENCH_EPILOGUE: Interactable[] = [
  scene('nexus-last-bench', 'postgame.open', 11, 15, 'Ise’s note beside the first label stand', 'preserved.slip',
    { all: [ending, { not: visited }] }),
  { id: 'nexus-next-bench', kind: 'door', x: 8, y: 17, w: 1, h: 1, label: 'the door to the next keeper’s bench',
    art: 'preserved.door', visibleIf: visited, to: { map: 'nexus.next-bench', x: 9, y: 11 } },
  scene('nexus-next-bench-public', 'postgame.back.public', 11, 15, 'the new visitor’s public note', 'preserved.display-paired',
    { all: [{ flag: 'postgame.edition', eq: 'public' }, { flagSet: 'postgame.read' }] }),
  scene('nexus-next-bench-loan', 'postgame.back.loan', 11, 15, 'the new visitor’s loan slip', 'ledger',
    { all: [{ flag: 'postgame.edition', eq: 'loan' }, { flagSet: 'postgame.read' }] }),
];

const views = [
  { id: 'light', tool: 'folding-light-screen', x: 14, y: 7, label: 'the spare label under a movable light', art: 'coast.clear-frame' },
  { id: 'watch', tool: 'observer-notebook', x: 14, y: 10, label: 'two unfinished visitor checks', art: 'ledger' },
  { id: 'edge', tool: 'record-edge-folio', x: 4, y: 10, label: 'the bound copy of the loan terms', art: 'preserved.folder' },
] as const;

export const NEXT_BENCH: MapDef = {
  id: 'nexus.next-bench',
  name: 'The Nexus: The Next Keeper’s Bench',
  world: 'WORLD-01',
  width: 19, height: 14, music: 'music.archive', ambience: 'study', background: 0x382c46,
  floor: (x, y) => x < 1 || x > 17 || y < 0 || y > 13 ? null
    : y < 3 ? ['wall-top', 'wall-mid', 'wall-base'][y] : 'stone-c',
  blocks: [[1, 0, 17, 3]], zones: [],
  spawn: { x: 9, y: 11 },
  npcs: [{ id: 'lia-vann', x: 7, y: 7, facing: 'down' }],
  stamps: [
    { stamp: 'bookshelf', x: 2, y: 3 }, { stamp: 'bookshelf', x: 14, y: 3 },
    { stamp: 'window', x: 9, y: 1 }, { stamp: 'long-table', x: 8, y: 6 },
    { stamp: 'rug-green', x: 8, y: 9 }, { stamp: 'plant-tall', x: 16, y: 11 },
  ],
  interactables: [
    { id: 'next-bench-return', kind: 'door', x: 9, y: 13, w: 1, h: 1, label: 'the door back to the Archive Hall',
      art: 'preserved.door', to: { map: 'nexus.archive', x: 8, y: 16 } },
    { id: 'next-bench-gallery', kind: 'door', x: 16, y: 8, w: 1, h: 1, label: 'the door to Lia’s Handover Room',
      art: 'preserved.door', walkThrough: true, visibleIf: { flag: 'postgame.closed', eq: true },
      flag: 'handover.arrived', to: { map: 'nexus.handover', x: 11, y: 11 } },
    scene('next-bench-copy', 'postgame.copy', 5, 8, 'the two boxed records from the old display', 'preserved.display-paired'),
    scene('next-bench-place', 'postgame.place', 10, 8, 'the borrowed-pen tray', 'preserved.slip',
      { all: [{ objective: 'postgame.retrace' }, unfinished] }),
    scene('next-bench-public', 'postgame.read.public', 12, 9, 'the next keeper’s public workbench',
      'preserved.display-records', { flag: 'postgame.edition', eq: 'public' }),
    scene('next-bench-loan', 'postgame.read.loan', 6, 11, 'the next keeper’s signed pen loan',
      'preserved.display-paired', { flag: 'postgame.edition', eq: 'loan' }),
    ...views.map((view) => scene(`next-bench-${view.id}`, `postgame.view.${view.id}`, view.x, view.y, view.label, view.art,
      { flag: 'perspective.active', eq: view.tool })),
  ],
  lights: [
    { x: 8, y: 7, r: 78, color: 0xffd99a }, { x: 5, y: 8, r: 50, color: 0xbddec9 },
    { x: 12, y: 9, r: 65, color: 0xc8cee8 },
  ],
};
