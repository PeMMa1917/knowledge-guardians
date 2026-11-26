import {
  GLASS_RACK_CASES, GLASS_RACK_MODES, GLASS_RACK_PREFIX, GLASS_RACK_READY, GLASS_RACK_USES, glassFlag,
} from '../content/glassRack';
import { specimenEquipped } from '../domain/specimenGear';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

function station(id: string, slot: string, x: number, y: number, label: string, art: string, visibleIf?: Condition): Interactable {
  return { id, game: GLASS_RACK_PREFIX + slot, kind: 'fieldgame', x, y, w: 1, h: 1, label, art, visibleIf, walkThrough: true, sfx: 'sfx.page' };
}

export const GLASS_RACK_DOOR: Interactable = {
  id: 'cold-glass-rack-door', kind: 'door', x: 3, y: 13, w: 1, h: 1, label: 'the door to Quena’s Glass Rack',
  art: 'preserved.door', visibleIf: GLASS_RACK_READY,
  to: { map: 'preserved.glass-rack', x: 17, y: 32 },
};

export const NILE_GLASS_RACK_USES: Interactable[] = [
  ...GLASS_RACK_MODES.map((mode, index) => station(
    GLASS_RACK_USES[mode].prop, mode, 3, 4 + index * 3, GLASS_RACK_USES[mode].title, 'preserved.display-paired',
    { any: GLASS_RACK_CASES.filter((record) => record.mode === mode).map(({ key }) => specimenEquipped(key)) },
  )),
  station('nile-glass-reader-board', 'board', 7, 11, 'the public board with both views and record numbers', 'preserved.display-paired',
    { any: GLASS_RACK_CASES.map(({ flag }) => ({ flagSet: `${flag}.nile` })) }),
  station('nile-glass-reading-desk', 'desk', 9, 11, 'the registered views at Marek’s reading desk', 'preserved.display-records',
    { any: GLASS_RACK_CASES.map(({ flag }) => glassFlag(`${flag}.nile`, 'desk')) }),
];

const WIDTH = 35;
const HEIGHT = 35;
export const PRESERVED_GLASS_RACK: MapDef = {
  id: 'preserved.glass-rack', name: 'Preserved Lives: Quena’s Glass Rack', world: 'WORLD-04',
  width: WIDTH, height: HEIGHT, spawn: { x: 17, y: 32 }, background: 0x213641,
  music: 'music.archive', ambience: 'study',
  floor: (x, y) => {
    if (x < 1 || x >= WIDTH - 1 || y < 0 || y >= HEIGHT) return null;
    if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
    return y >= 29 || x === 17 ? 'civic-hall-route' : 'stone-c';
  },
  blocks: [[1, 0, WIDTH - 2, 3]], zones: [],
  npcs: [
    { id: 'glass-keeper', x: 18, y: 30, facing: 'left' },
    { id: 'glass-rail-reader', x: 5, y: 30, facing: 'down' },
    { id: 'glass-pocket-reader', x: 29, y: 30, facing: 'down' },
  ],
  stamps: [
    { stamp: 'window', x: 4, y: 1 }, { stamp: 'window', x: 16, y: 1 }, { stamp: 'window', x: 27, y: 1 },
    { stamp: 'bench', x: 4, y: 32 }, { stamp: 'rug-green', x: 15, y: 30 }, { stamp: 'bench', x: 28, y: 32 },
  ],
  lights: [5, 17, 29].flatMap((x) => [6, 15, 24, 31].map((y) => ({ x, y, r: 84, color: x === 17 ? 0xc1eee3 : 0xffd58f }))),
  interactables: [
    { id: 'glass-rack-return', kind: 'door', x: 17, y: 34, w: 1, h: 1, art: 'preserved.door',
      label: 'the way back to the Cold Store', to: { map: 'preserved.archive', x: 4, y: 13 } },
    station('glass-rack-rail', 'rail', 6, 31, 'Osyth’s broad rail for two views', 'preserved.display-paired'),
    station('glass-rack-pocket', 'pocket', 28, 31, 'Rennel’s hinged reading pocket', 'preserved.display-records'),
    ...GLASS_RACK_CASES.flatMap((c, i): Interactable[] => {
      const x = 3 + 4 * (i % 8);
      const y = 5 + 5 * Math.floor(i / 8);
      return [
        { id: `glass-case-${c.slug}`, kind: 'exhibit', exhibit: c.exhibit, x, y, w: 1, h: 1,
          label: c.title, art: 'preserved.catalogue' },
        { ...station(`glass-frame-${c.slug}`, c.slug, x + 1, y, `the viewing window for ${c.accession}`, 'board-stand'),
          artOpen: { if: { objective: c.earned }, key: 'preserved.display-paired' } },
      ];
    }),
  ],
};
