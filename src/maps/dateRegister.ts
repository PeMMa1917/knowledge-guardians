import { DATE_REGISTER_CASES, DATE_REGISTER_GROUP, DATE_REGISTER_OPEN, registerFiled } from '../content/dateRegisterCases';
import { DRESDEN_CODEX_KEY } from '../domain/dateRegister';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

export const DATE_REGISTER_DOOR: Interactable = {
  id: 'sea-date-register-door', kind: 'door', x: 18, y: 15, w: 1, h: 1,
  label: 'the passage into the two-faced register room', art: 'preserved.door', visibleIf: DATE_REGISTER_OPEN,
  to: { map: 'sea.register-room', x: 18, y: 28 },
};

const CIVIC_OPEN: Condition = { all: [{ objective: 'civic.arrival' }, { any: DATE_REGISTER_CASES.map(registerFiled) }] };

function station(id: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id: `date-register-${id}`, kind: 'fieldgame', game: `${DATE_REGISTER_GROUP}:${id}`,
    x, y, w: 1, h: 1, label, art, visibleIf, walkThrough: true };
}

export const SEA_DATE_REGISTER_PROPS: Interactable[] = [
  {
    ...station('porch', 3, 12, 'Eneth’s open source cabinet', 'fold.paired', DATE_REGISTER_OPEN),
    artOpen: { key: 'preserved.display-records', if: { any: DATE_REGISTER_CASES.map(({ flag }) => ({ flag: `${flag}.route`, eq: 'porch' })) } },
  },
  {
    ...station('runner', 23, 7, 'Caren’s box for checked date lines', 'fold.strip', DATE_REGISTER_OPEN),
    artOpen: { key: 'preserved.display-records', if: { any: DATE_REGISTER_CASES.map(({ flag }) => ({ flag: `${flag}.route`, eq: 'runner' })) } },
  },
];

export const SEA_DATE_REGISTER_READERS: MapDef['npcs'] = [
  { id: 'register-reader-eneth', x: 4, y: 12, facing: 'up', visibleIf: DATE_REGISTER_OPEN },
  { id: 'register-runner-caren', x: 24, y: 7, facing: 'left', visibleIf: DATE_REGISTER_OPEN },
];

export const CIVIC_DATE_REGISTER_PROPS: Interactable[] = [
  {
    ...station('civic', 24, 6, 'Elwen’s object guide and event register', 'civic.ledger', CIVIC_OPEN),
    artOpen: { key: 'preserved.display-paired', if: { any: DATE_REGISTER_CASES.map(({ civicObjective }) => ({ objective: civicObjective })) } },
  },
];

export const CIVIC_DATE_REGISTER_READERS: MapDef['npcs'] = [
  { id: 'register-clerk-elwen', x: 25, y: 6, facing: 'left', visibleIf: CIVIC_OPEN },
];

const WIDTH = 38;
const HEIGHT = 31;

export const DATE_REGISTER_ROOM: MapDef = {
  id: 'sea.register-room', name: 'Cartographers’ Sea: Lantern House Register Room', world: 'WORLD-09',
  width: WIDTH, height: HEIGHT, spawn: { x: 18, y: 28 },
  music: 'music.archive', ambience: 'study', background: 0x2a3947,
  floor: (x, y) => {
    if (x < 1 || x >= WIDTH - 1 || y < 0 || y >= HEIGHT) return null;
    if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
    return x === 18 || x === 19 || y === 27 ? 'stone-c' : 'civic-hall-tile';
  },
  blocks: [[1, 0, WIDTH - 2, 3]], zones: [],
  npcs: [],
  stamps: [
    { stamp: 'window', x: 4, y: 1 }, { stamp: 'window', x: 16, y: 1 }, { stamp: 'window', x: 28, y: 1 },
    { stamp: 'bench', x: 7, y: 28 }, { stamp: 'bench', x: 27, y: 28 },
    { stamp: 'rug-green', x: 17, y: 27 },
  ],
  lights: [
    ...[7, 19, 31].flatMap((x) => [6, 15, 23].map((y) => ({ x, y, r: 80, color: 0xf7dfac }))),
    { x: 18, y: 28, r: 76, color: 0xbadce3 },
  ],
  interactables: [
    ...DATE_REGISTER_CASES.flatMap((record, index): Interactable[] => {
      const x = 3 + 6 * (index % 6);
      const y = 5 + 5 * Math.floor(index / 6);
      return [
        { id: `register-exhibit-${record.slug}`, kind: 'exhibit', exhibit: record.exhibit, x, y, w: 1, h: 1,
          label: record.title, art: record.key === DRESDEN_CODEX_KEY ? 'register.codex-fold' : 'preserved.folder' },
        { ...station(record.slug, x + 2, y, `the dated fold for ${record.accession}`, 'board-stand', DATE_REGISTER_OPEN),
          artOpen: { key: 'preserved.display-paired', if: { objective: record.objective } } },
      ];
    }),
    { id: 'date-register-note', kind: 'sign', x: 18, y: 26, w: 1, h: 1, label: 'the register room’s folding guide',
      art: 'preserved.slip', walkThrough: true, text: 'Open the object’s case. Then lift both faces at its stand. Eneth can show the full picture and its date. Caren’s narrow box keeps one other dated event with its number. Keep the signed receipt if you travel to Civic Dispatch.' },
    { id: 'date-register-return', kind: 'door', x: 18, y: 30, w: 1, h: 1, label: 'the passage back to the date annex',
      art: 'preserved.door', to: { map: 'sea.date-room', x: 18, y: 16 } },
  ],
};
