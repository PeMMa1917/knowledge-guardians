import {
  FIELD_ROUTES, FIELD_STORE_CASES, FIELD_STORE_LAST, FIELD_STORE_OPEN, atFieldBench,
  fieldCurrent, fieldDone, fieldFree, fieldRead, fieldRevisited, type FieldStoreCase,
} from '../content/fieldStore';
import { specimenEquipped } from '../domain/specimenGear';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

export const FIELD_STORE_DOOR: Interactable = {
  id: 'field-store-door', kind: 'door', x: 2, y: 10, w: 1, h: 1,
  label: 'the Commons’ Field Store', art: 'preserved.door',
  visibleIf: FIELD_STORE_OPEN, to: { map: 'water.field-store', x: 16, y: 25 },
};

function scene(id: string, node: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id, node, x, y, w: 1, h: 1, label, art, visibleIf, kind: 'scene', walkThrough: true, sfx: 'sfx.page' };
}

function specimenProps(entry: FieldStoreCase, i: number): Interactable[] {
  const x = 3 + (i % 6) * 5;
  const y = 4 + Math.floor(i / 6) * 3;
  return [{
    id: `field-store-${entry.slug}-exhibit`, kind: 'exhibit', exhibit: entry.exhibit, x, y, w: 1, h: 1,
    art: 'collection-stand', label: entry.title,
  },
  scene(`field-store-${entry.slug}-plan`, `${entry.flag}.choose`, x + 2, y,
    `the practice reference for ${entry.accession}`, 'board-stand',
    { all: [{ card: entry.card }, fieldFree, { not: fieldDone(entry) }] }),
  scene(`field-store-${entry.slug}-hook`, `${entry.flag}.cancel`, x + 2, y,
    'the empty hook for the working reference', 'preserved.slip', fieldCurrent(entry)),
  ...FIELD_ROUTES.map((route) => scene(`field-store-${entry.slug}-reply-${route}`, `${entry.flag}.reply.${route}`, x + 2, y,
    route === 'time' ? 'the fixed-place report with two bells' : 'the same-bell report with two positions',
    route === 'time' ? 'fold.strip' : 'preserved.display-paired', fieldRead(entry, route)))];
}

export const FIELD_STORE: MapDef = {
  id: 'water.field-store', name: 'Water Commons: Field Store', world: 'WORLD-12',
  width: 34, height: 29, spawn: { x: 16, y: 25 },
  music: 'music.archive', ambience: 'study', background: 0x304a48,
  floor: (x, y) => {
    if (x < 1 || x > 32 || y < 0 || y >= 28) return null;
    if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
    return y >= 22 && x >= 12 && x <= 20 ? 'water-path' : 'stone-c';
  },
  blocks: [[0, 0, 34, 3], [0, 0, 1, 29], [33, 0, 1, 29], [0, 28, 34, 1]],
  stamps: [
    { stamp: 'window', x: 5, y: 1 }, { stamp: 'window', x: 15, y: 1 }, { stamp: 'window', x: 26, y: 1 },
    { stamp: 'rug-green', x: 15, y: 20 }, { stamp: 'bench', x: 3, y: 23 }, { stamp: 'bench', x: 24, y: 25 },
    { stamp: 'water-lantern', x: 12, y: 25 }, { stamp: 'water-lantern', x: 20, y: 25 },
  ],
  lights: [
    { x: 6, y: 5, r: 79, color: 0xa6d0b3 }, { x: 16, y: 7, r: 90, color: 0xdfd2aa },
    { x: 27, y: 7, r: 84, color: 0xadddcf }, { x: 6, y: 16, r: 82, color: 0xd0d6af },
    { x: 17, y: 16, r: 95, color: 0xf5d4a6 }, { x: 27, y: 18, r: 85, color: 0xbdd7d7 },
    { x: 8, y: 23, r: 61, color: 0xffd7a1, flicker: true }, { x: 26, y: 23, r: 75, color: 0xa4dfce },
  ],
  npcs: [{ id: 'field-store-aven', x: 18, y: 24, facing: 'left' }],
  zones: [],
  interactables: [
    ...FIELD_STORE_CASES.flatMap(specimenProps),
    { id: 'field-store-return', kind: 'door', x: 16, y: 27, w: 1, h: 1, label: 'the path back to Council Yard',
      art: 'preserved.door', to: { map: 'water.council', x: 3, y: 10 } },
    { id: 'field-store-overview', kind: 'sign', x: 15, y: 23, w: 1, h: 1, walkThrough: true,
      label: 'the tray and post directions', art: 'forest.notice',
      text: 'The left tray keeps one position for two bells. The two posts on the right use the same bell. Pick up a working reference beside any case before starting either practice.' },
    scene('field-store-time-start', 'field-store.bench.time.first', 8, 23,
      'the tray with the fixed notch', 'workbench', atFieldBench('time', true)),
    scene('field-store-time-next', 'field-store.bench.time.second', 8, 23,
      'the same tray at the next model bell', 'water.split', atFieldBench('time', false)),
    scene('field-store-place-start', 'field-store.bench.place.first', 24, 23,
      'the nearer position marked for this bell', 'forest.field-diagram', atFieldBench('place', true)),
    scene('field-store-place-next', 'field-store.bench.place.second', 29, 24,
      'the far position with a slot for the same bell slip', 'preserved.display-paired', atFieldBench('place', false)),
  ],
};

const anyCopy: Condition = { any: FIELD_STORE_CASES.map((entry) => specimenEquipped(entry.key)) };

export const FIELD_STORE_FOLD: Interactable[] = FIELD_STORE_CASES.flatMap((entry) => {
  const equipped = specimenEquipped(entry.key);
  const revisited = fieldRevisited(entry);
  return [
    scene(entry.revisit.prop, `${entry.flag}.fold`, 19, 14,
      `the Fold’s rain log and ${entry.accession}`, 'forecast-board',
      { all: [equipped, { not: revisited }] }),
    { ...scene(`field-store-fold-reply-${entry.slug}`, `${entry.flag}.fold-reply`, 19, 14,
      `the new Fold reference for ${entry.accession}`, 'preserved.display-records',
      { all: [revisited, { any: [equipped, { all: [{ not: anyCopy }, { flag: FIELD_STORE_LAST, eq: entry.slug }] }] }] }),
      artBy: { flag: entry.objective, keys: { time: 'preserved.display-records', place: 'preserved.display-paired' } } },
  ];
});
