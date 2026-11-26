import { SILL_CHECKED, SILL_CLOCK, SILL_FAR, SILL_FERRY_CHECK, SILL_HANDOVER, SILL_NEAR,
  SILL_FERRY_RECEIPT, SILL_PASSAGE, SILL_PLAN, SILL_RECEIPT, type SillRoute } from '../domain/sillBridge';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

const BRIDGE = 'emberford.sill-bridge';
const RECEIVING = 'emberford.sill-receiving';
const EMBERFORD = 'aethelgard.emberford';

const tile = (x: number, y: number) => ({ x, y, w: 1, h: 1, walkThrough: true });
const flag = (key: string, eq: true | SillRoute = true): Condition => ({ flag: key, eq });
const objective = (id: string): Condition => ({ objective: id });

export const EMBERFORD_SILL_BRIDGE: Interactable = {
  ...tile(36, 23), id: 'sill-bridge-entry', kind: 'door', label: 'the lantern steps down to Sill Bridge', art: 'road-post',
  visibleIf: flag('reached.emberford'), to: { map: BRIDGE, x: 3, y: 11 },
};

export const SILL_BRIDGE: MapDef = {
  id: BRIDGE, name: 'Emberford: Sill Bridge', world: 'WORLD-02', width: 25, height: 15,
  music: 'music.town', ambience: 'town', background: 0x2b6f9a,
  spawn: { x: 3, y: 11 },
  floor(x, y) {
    if (x < 0 || x >= 25 || y < 0 || y >= 15) return null;
    if (x >= 11 && x <= 13) return y >= 7 && y <= 9 ? 'water-bridge' : null;
    if (y >= 7 && y <= 9 || (x >= 18 && y >= 3 && y <= 6)) return 'stone-c';
    return 'grass';
  },
  blocks: [[11, 0, 3, 7], [11, 10, 3, 5]],
  stamps: [
    { stamp: 'tree', x: 1, y: 1 }, { stamp: 'flowers-small', x: 3, y: 5 },
    { stamp: 'bench', x: 6, y: 4 }, { stamp: 'flowers-white', x: 9, y: 11 },
    { stamp: 'crates', x: 15, y: 3 }, { stamp: 'flowers-small2', x: 15, y: 12 },
    { stamp: 'tree', x: 22, y: 10 }, { stamp: 'barrel', x: 21, y: 7 },
  ],
  npcs: [],
  interactables: [
    { ...tile(2, 12), id: 'sill-bridge-return', kind: 'door', label: 'the lantern steps back to Emberford', art: 'road-post', to: { map: EMBERFORD, x: 36, y: 24 } },
    { ...tile(5, 9), id: 'sill-ticket-hook', kind: 'scene', label: 'Estelle’s practice ticket hook', node: 'sill.take-ticket', art: 'fold.strip', sfx: 'sfx.page' },
    {
      ...tile(9, 8), id: 'sill-west-peg', kind: 'scene', label: 'the peg on the town bank', node: 'sill.west-peg', art: 'bridge-post',
      artOpen: { key: 'departure.peg-marked', if: flag(SILL_NEAR) },
    },
    {
      ...tile(15, 8), id: 'sill-east-peg', kind: 'scene', label: 'the peg on the loft bank', node: 'sill.east-peg', art: 'bridge-post',
      artOpen: { key: 'departure.peg-marked', if: flag(SILL_FAR) },
    },
    {
      ...tile(18, 5), id: 'sill-bell-wheel', kind: 'fieldgame', game: `${SILL_CLOCK}bridge`,
      label: 'the loft’s four-notch bell wheel', art: 'plumb-mark',
    },
    {
      ...tile(22, 5), id: 'sill-access-ledger', kind: 'scene', label: 'Estelle’s access ledger', node: 'sill.access-ledger', art: 'ledger',
      artBy: { flag: SILL_PLAN, keys: { deputy: 'fold.strip', public: 'fold.paired' } },
    },
    {
      ...tile(17, 12), id: 'sill-deputy-door', kind: 'door', label: 'the signed-deputy hatch', art: 'cellar-door',
      visibleIf: flag(SILL_PLAN, 'deputy'), flag: SILL_PASSAGE, to: { map: RECEIVING, x: 3, y: 6 },
    },
    {
      ...tile(22, 9), id: 'sill-public-door', kind: 'door', label: 'the second-turn stair', art: 'road-post',
      visibleIf: flag(SILL_PLAN, 'public'), flag: SILL_PASSAGE, to: { map: RECEIVING, x: 14, y: 6 },
    },
  ],
  zones: [{ id: 'sill-bridge', x: 0, y: 0, w: 25, h: 15 }],
  lights: [
    { x: 4.5, y: 8.5, r: 68, color: 0xffd98a, flicker: true },
    { x: 12.5, y: 8.5, r: 47, color: 0xb5e5ff },
    { x: 20.5, y: 5.5, r: 72, color: 0xffd98a, flicker: true },
  ],
};

function receivingSide(route: SillRoute, x: number, label: string, art: string): Interactable[] {
  const visibleIf: Condition = { all: [objective(SILL_CHECKED), flag(SILL_PLAN, route), flag(SILL_PASSAGE)] };
  return [
    { ...tile(x, 3), id: `sill-${route}-receipt`, kind: 'scene', label, art, visibleIf, node: `sill.receiving.${route}`,
      artOpen: { key: 'departure.strip', if: flag(SILL_RECEIPT, route) } },
    {
      ...tile(x, 7), id: `sill-${route}-return`, kind: 'door', label: 'the receiving passage back to Sill Bridge', art: 'road-post',
      to: { map: BRIDGE, x: route === 'deputy' ? 17 : 22, y: route === 'deputy' ? 11 : 8 },
    },
  ];
}

export const SILL_RECEIVING: MapDef = {
  id: RECEIVING, name: 'Emberford: Sill Bridge receiving bay', world: 'WORLD-02', width: 18, height: 9,
  music: 'music.town', ambience: 'study', background: 0x293c43, spawn: { x: 3, y: 6 },
  floor: (x, y) => x < 0 || y < 0 || x >= 18 || y >= 9 || x === 8 || x === 9 ? null : y === 0 ? 'wall-mid' : 'stone-c',
  blocks: [[8, 0, 2, 9], [0, 0, 18, 1]],
  stamps: [
    { stamp: 'crates', x: 1, y: 2 }, { stamp: 'barrel', x: 6, y: 4 },
    { stamp: 'bench', x: 11, y: 2 }, { stamp: 'flowers-white', x: 15, y: 4 },
  ],
  npcs: [],
  interactables: [
    ...receivingSide('deputy', 3, 'Leïla at the signed-deputy hatch', 'fold.strip'),
    ...receivingSide('public', 14, 'René at the staffed second turn', 'fold.paired'),
  ],
  zones: [{ id: 'sill-receiving', x: 0, y: 0, w: 18, h: 9 }],
  lights: [{ x: 3.5, y: 3.5, r: 66, color: 0xffd98a }, { x: 14.5, y: 3.5, r: 66, color: 0xffe9b0 }],
};

export const FERRY_SILL_BRIDGE: Interactable[] = [
  {
    ...tile(24, 6), id: 'sill-ferry-wheel', kind: 'fieldgame', game: `${SILL_CLOCK}ferry`, label: 'Tova’s afternoon practice wheel',
    visibleIf: objective(SILL_HANDOVER), art: 'plumb-mark',
  },
  {
    ...tile(23, 8), id: 'sill-ferry-deputy', kind: 'scene', node: 'sill.ferry.deputy', art: 'fold.strip',
    label: 'Leïla’s release tag by the loading lane',
    visibleIf: { all: [objective(SILL_FERRY_CHECK), flag(SILL_RECEIPT, 'deputy')] },
    artOpen: { key: 'departure.strip', if: flag(SILL_FERRY_RECEIPT, 'deputy') },
  },
  {
    ...tile(25, 8), id: 'sill-ferry-public', kind: 'scene', node: 'sill.ferry.public', art: 'fold.paired',
    label: 'René’s late-turn tag by the east waiting rail',
    visibleIf: { all: [objective(SILL_FERRY_CHECK), flag(SILL_RECEIPT, 'public')] },
    artOpen: { key: 'departure.strip', if: flag(SILL_FERRY_RECEIPT, 'public') },
  },
];
