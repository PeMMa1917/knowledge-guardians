import { DATE_PEG_CASES, DATE_PEG_DOCK, DATE_PEG_GROUP, DATE_PEG_MARKET, datePegProof, datePegRecords } from '../content/datePegCases';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

const OPEN: Condition = { objective: 'sea.finish' };

export const SEA_DATE_PEG_DOOR: Interactable = {
  id: 'sea-date-annex', kind: 'door', x: 21, y: 11, w: 1, h: 1,
  label: 'the date bench annex', art: 'preserved.door', visibleIf: OPEN,
  to: { map: 'sea.date-room', x: 10, y: 14 },
};

export const SEA_DATE_PEG_RECEIVERS: Interactable[] = ([
  { route: DATE_PEG_MARKET, x: 6, y: 9, label: 'Irven’s wide market bench', art: 'fold.paired' },
  { route: DATE_PEG_DOCK, x: 24, y: 8, label: 'Mireth’s pocket guide roll', art: 'fold.strip' },
] as const).map(({ route, ...prop }) => ({
  ...prop, id: `sea-date-${route}`, kind: 'fieldgame', game: `${DATE_PEG_GROUP}:${route}`,
  w: 1, h: 1, walkThrough: true, visibleIf: OPEN,
  artOpen: {
    key: 'preserved.display-records',
    if: { any: DATE_PEG_CASES.flatMap((record): Condition[] => [datePegProof(record, route),
      { flag: `${record.flag}.received`, eq: route }]) },
  },
}));

export const SEA_DATE_PEG_READERS: MapDef['npcs'] = [
  { id: 'peg-reader-irven', x: 6, y: 8, facing: 'down', visibleIf: OPEN },
  { id: 'peg-receiver-mireth', x: 25, y: 8, facing: 'left', visibleIf: OPEN },
];

const ANNEX_WIDE = 21;
const ANNEX_TALL = 17;

export const DATE_PEG_ROOM: MapDef = {
  id: 'sea.date-room', name: 'Cartographers’ Sea: Lantern House Date Annex', world: 'WORLD-09',
  width: ANNEX_WIDE, height: ANNEX_TALL, spawn: { x: 10, y: 14 },
  music: 'music.archive', ambience: 'study', background: 0x273d46,
  floor: (x, y) => {
    if (x < 1 || x >= ANNEX_WIDE - 1 || y < 0 || y >= ANNEX_TALL) return null;
    return y < 3 ? ['wall-top', 'wall-mid', 'wall-base'][y] : 'stone-c';
  },
  blocks: [[1, 0, ANNEX_WIDE - 2, 3]], zones: [], npcs: [],
  stamps: [
    { stamp: 'window', x: 6, y: 1 }, { stamp: 'window', x: 14, y: 1 },
    { stamp: 'bookshelf', x: 1, y: 3 }, { stamp: 'bookshelf', x: 18, y: 3 },
    { stamp: 'rug-green', x: 8, y: 13 }, { stamp: 'bench', x: 2, y: 14 },
    { stamp: 'bench', x: 17, y: 14 },
  ],
  lights: [
    { x: 4, y: 6, r: 70, color: 0xf6deb3 }, { x: 10, y: 7, r: 80, color: 0xf0cf99 },
    { x: 16, y: 6, r: 71, color: 0xf6deb3 }, { x: 10, y: 14, r: 82, color: 0xddf4ed },
  ],
  interactables: [
    ...DATE_PEG_CASES.flatMap((record, index): Interactable[] => {
      const x = 4 + (index % 3) * 6;
      const y = index < 3 ? 5 : 10;
      return [
        ...record.docs.map(({ exhibit, title }, side): Interactable => ({
          id: `date-case-${record.slug}-${side + 1}`, kind: 'exhibit', exhibit,
          x: x + 2 * side - 1, y, w: 1, h: 1, art: 'preserved.folder', label: title,
        })),
        { id: `date-bench-${record.slug}`, kind: 'fieldgame', game: `${DATE_PEG_GROUP}:${record.slug}`,
          x, y: y + 2, w: 1, h: 1, label: `the date peg for ${record.title.toLowerCase()}`,
          art: 'board-stand', artOpen: { key: 'preserved.display-records', if: datePegRecords(record) } },
      ];
    }),
    { id: 'sea-date-annex-note', kind: 'sign', x: 10, y: 13, w: 1, h: 1, walkThrough: true,
      art: 'sea.margin', label: 'the date bench keeper’s note',
      text: 'Each bench joins the two nearby object cards. Test the dates together. If you need both sheets wide open, find Irven’s market bench. If the paper has to travel in a sleeve, find Mireth at the dock roll.' },
    { id: 'sea-date-annex-return', kind: 'door', x: 10, y: 16, w: 1, h: 1,
      label: 'the passage back to Lantern House', art: 'preserved.door',
      to: { map: 'sea.chartroom', x: 21, y: 12 } },
  ],
};
