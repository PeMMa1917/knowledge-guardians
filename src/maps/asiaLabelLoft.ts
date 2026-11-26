import { LABEL_LOFT_ACCESS, LABEL_LOFT_CASES, LABEL_LOFT_COPY, LABEL_LOFT_COPY_METHODS } from '../content/asiaLabelCases';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

const route = (name: 'rail' | 'bench'): Condition => ({ flag: 'asia.loft.route', eq: name });
const published = (name: 'rail' | 'bench'): Condition => ({ flag: 'asia.loft.published', eq: name });
const reedLamp = 'island.waypost';

function station(id: string, node: string, x: number, y: number, label: string, art: string,
  visibleIf?: Condition): Interactable {
  return { id, kind: 'scene', node, x, y, w: 1, h: 1, label, art, visibleIf, walkThrough: true, sfx: 'sfx.page' };
}

export const LABEL_LOFT_OUTSIDE: Interactable[] = [
  {
    id: 'label-loft-door', kind: 'door', x: 12, y: 10, w: 1, h: 1, art: 'preserved.door',
    label: 'Nellin’s label loft', to: { map: 'island.label-loft', x: 14, y: 16 },
    flag: 'asia.loft.entered', visibleIf: LABEL_LOFT_ACCESS, walkThrough: true,
  },
  ...(['rail', 'bench'] as const).flatMap((name): Interactable[] => {
    const open: Condition = { all: [route(name), { flag: 'asia.loft.readback', eq: name }] };
    const closed: Condition = { all: [open, { not: published(name) }] };
    return [
      station(`loft-margin-${name}`, `asia.loft.margin.${name}`, 11, 12, 'the Quiet Margin copy rack', 'preserved.slip', closed),
      {
        id: `loft-margin-posted-${name}`, kind: 'sign', x: 11, y: 12, w: 1, h: 1,
        label: name === 'rail' ? 'Nellin’s posted berth rows' : 'Nellin’s pointer to the reading bench',
        art: name === 'rail' ? 'fold.paired' : 'preserved.folder', walkThrough: true, visibleIf: published(name),
        text: name === 'rail'
          ? 'Upper berth trial: four crates per circuit. Lower berth trial: two crates per circuit. Take a copy from the walk-up rail.'
          : 'Follow the loft path to the east bench to see both landing trials. Pick up loading slips at the dock work desk.',
      },
    ];
  }),
];

export const ASIA_LABEL_LOFT: MapDef = {
  id: 'island.label-loft', name: 'Island of Models · Nellin’s Label Loft', world: 'WORLD-15',
  width: 29, height: 20, spawn: { x: 14, y: 16 },
  music: 'music.archive', ambience: 'study', background: 0x3d554e,
  floor: (x, y) => {
    if (x < 1 || x > 27 || y < 0 || y >= 19) return null;
    if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
    if (y === 14 && ((x < 8 && x !== 4) || (x > 20 && x !== 24))) return 'wall-base';
    if (y > 14 && (x === 7 || x === 21)) return 'wall-base';
    if ((y >= 14 && (x < 8 || x > 20)) || (x >= 12 && x <= 16)) return 'island-boards';
    return 'island-slate';
  },
  blocks: [
    [0, 0, 29, 3], [0, 0, 1, 20], [28, 0, 1, 20], [0, 19, 29, 1],
    [1, 14, 3, 1], [5, 14, 3, 1], [7, 14, 1, 5],
    [21, 14, 3, 1], [25, 14, 3, 1], [21, 14, 1, 5],
  ],
  conditionalBlocks: [
    { x: 4, y: 14, when: { not: route('rail') } },
    { x: 24, y: 14, when: { not: route('bench') } },
  ],
  stamps: [
    { stamp: 'window', x: 6, y: 1 }, { stamp: 'window', x: 22, y: 1 },
    { stamp: 'civic-bookcases', x: 11, y: 2 }, { stamp: 'civic-bookcases', x: 17, y: 2 },
    { stamp: 'rug-green', x: 13, y: 13 }, { stamp: 'bench', x: 2, y: 17 },
    { stamp: 'voices-bench', x: 25, y: 17 }, { stamp: 'market-planter', x: 17, y: 17 },
  ],
  npcs: [{ id: 'label-loft-keeper', x: 11, y: 15, facing: 'down' }],
  zones: [],
  lights: [
    { x: 5, y: 6, r: 78, color: 0xe8caa4 }, { x: 15, y: 7, r: 80, color: 0xb9e6d9 },
    { x: 23, y: 8, r: 77, color: 0xd9c8f1 }, { x: 14, y: 15, r: 84, color: 0xf0d3a5, flicker: true },
    { x: 4, y: 17, r: 49, color: 0xf0d3a5 }, { x: 24, y: 17, r: 50, color: 0xb2e3d5 },
  ],
  interactables: [
    ...LABEL_LOFT_CASES.flatMap((record, index): Interactable[] => {
      const x = 3 + (index % 4) * 6;
      const y = 5 + Math.floor(index / 4) * 3;
      return [
        {
          id: `loft-case-${record.slug}`, kind: 'exhibit', exhibit: record.exhibit,
          label: `${record.title}, ${record.accession}`, art: 'collection-stand', x, y, w: 1, h: 1,
        },
        {
          ...station(`loft-front-${record.slug}`, `${record.stem}.front`, x + 1, y,
            `the ${record.method} strip for ${record.accession}`, 'preserved.slip', { card: record.card }),
          artOpen: { key: 'fold.strip', if: record.frontSeen },
        },
        {
          ...station(`loft-reverse-${record.slug}`, `${record.stem}.reverse`, x + 2, y,
            `the turned ${record.method} strip for ${record.accession}`, 'fold.strip', record.frontSeen),
          artOpen: { key: 'fold.paired', if: record.reverseSeen },
        },
      ];
    }),
    {
      ...station('loft-copy', LABEL_LOFT_COPY, 13, 14, 'Nellin’s dock copying board', 'board-stand'),
      artOpen: { key: 'fold.paired', if: { flagSet: LABEL_LOFT_COPY } },
    },
    ...LABEL_LOFT_COPY_METHODS.map(({ method, mark }): Interactable => ({
      id: `loft-copy-mark-${method}`, kind: 'sign', x: 14, y: 14, w: 1, h: 1, walkThrough: true,
      label: 'the prepared dock copy', art: 'preserved.slip', text: mark,
      visibleIf: { flag: LABEL_LOFT_COPY, eq: method },
    })),
    station('loft-dispatch', 'asia.loft.dispatch', 16, 15, 'Nellin’s dispatch hooks', 'board-stand'),
    ...(['rail', 'bench'] as const).flatMap((name): Interactable[] => {
      const x = name === 'rail' ? 4 : 24;
      return [
        {
          id: `loft-${name}-lane`, kind: 'sign', x, y: 13, w: 1, h: 1,
          label: name === 'rail' ? 'the west walk-up rail' : 'the east reading bench',
          text: name === 'rail' ? 'Walk-up copies of both berth rows.' : 'A staffed reading bench for both trial sheets.',
          art: reedLamp, artOpen: { key: 'island.landing', if: route(name) }, walkThrough: true,
        },
        {
          id: `loft-${name}-shutter`, kind: 'sign', x, y: 14, w: 1, h: 1,
          label: 'the closed bay shutter', text: 'The clerk opens this bay when Nellin hangs its order.',
          art: 'preserved.door', walkThrough: true, visibleIf: { not: route(name) },
        },
        station(`loft-${name}-copy`, `asia.loft.check.${name}`, x, 17,
          name === 'rail' ? 'the tray for crews’ quick copies' : 'the staffed bench and its trial sheets',
          name === 'rail' ? 'fold.paired' : 'preserved.folder', route(name)),
      ];
    }),
    {
      id: 'label-loft-return', kind: 'door', x: 14, y: 18, w: 1, h: 1, art: 'preserved.door',
      label: 'the way back to Quiet Margin', to: { map: 'island.margin', x: 13, y: 10 },
    },
  ],
};
