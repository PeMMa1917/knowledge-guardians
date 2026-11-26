import {
  MATERIAL_CASES, MATERIAL_GAME, MATERIAL_GATE, MATERIAL_HUB, MATERIAL_REVISIT, MATERIAL_ROOMS,
  storeCarry, storeRouted, type StoreRoute,
} from '../content/materialStores';
import { STORE_FAMILIES, type StoreFamily } from '../domain/materialStores';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

const SITES = {
  fibres:   { x: 6, y: 4, tint: 0xdbc699, tile: 'stone-c', art: 'fold.paired' },
  forms:    { x: 14, y: 4, tint: 0xc2ded1, tile: 'civic-hall-tile', art: 'board-stand' },
  travel:   { x: 6, y: 9, tint: 0xe6c4a0, tile: 'voices-slate', art: 'ledger' },
  surfaces: { x: 14, y: 9, tint: 0xd9bbdb, tile: 'civic-hall-tile', art: 'coast.clear-frame' },
} as const;

function passage(id: string, x: number, y: number, label: string, to: NonNullable<Interactable['to']>): Interactable {
  return { id: `${MATERIAL_GAME}-${id}`, kind: 'door', x, y, w: 1, h: 1, label, to, art: 'preserved.door' };
}

function receipt(route: StoreRoute, x: number, y: number, label: string): Interactable {
  return {
    id: `${MATERIAL_GAME}-${route}-receiver`, kind: 'fieldgame', game: `${MATERIAL_GAME}:receipt:${route}`,
    x, y, w: 1, h: 1, label, art: route === 'yard' ? 'fold.strip' : 'fold.paired', walkThrough: true,
    visibleIf: { any: MATERIAL_CASES.map((record) => storeRouted(record, route)) },
    artOpen: { key: 'preserved.display-records', if: { any: MATERIAL_CASES.map((record) => ({ flag: record.objective, eq: route })) } },
  };
}

export const MATERIAL_YARD_PROPS: Interactable[] = [
  { ...passage('entrance', 24, 12, 'the side entrance to the Material Stores', { map: MATERIAL_HUB, x: 10, y: 12 }), visibleIf: MATERIAL_GATE },
  receipt('yard', 4, 11, 'the Material Stores’ open tray in the Council Yard'),
];

export const MATERIAL_CHANNEL_RECEIVER = receipt('channel', 16, 11, 'the Material Stores’ weather sleeve at the Lower Channel');

const repairs: Condition = { any: MATERIAL_CASES.map(({ reprise }) => ({ flag: reprise, eq: 'use' })) };
export const MATERIAL_CANAL_REVISIT: Interactable = {
  id: MATERIAL_REVISIT.prop, kind: 'fieldgame', game: `${MATERIAL_GAME}:revisit`,
  x: 3, y: 8, w: 1, h: 1, label: 'Canal Walk’s used-work-copy shelf', art: 'preserved.slip', walkThrough: true,
  visibleIf: { any: [repairs, ...MATERIAL_CASES.map(storeCarry)] },
  artOpen: { key: 'preserved.display-paired', if: repairs },
};

function roomFloor(wide: number, tall: number, tile = 'stone-c'): MapDef['floor'] {
  return (x, y) => {
    if (x < 1 || x >= wide - 1 || y < 0 || y >= tall) return null;
    if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
    return y === 7 || y === 12 ? 'stone-c' : tile;
  };
}

const hub: MapDef = {
  id: MATERIAL_HUB, name: 'Water Commons: The Material Stores', world: 'WORLD-12',
  width: 21, height: 16,
  floor: roomFloor(21, 16), blocks: [[1, 0, 19, 3]], zones: [], npcs: [],
  spawn: { x: 10, y: 12 }, music: 'music.archive', ambience: 'study', background: 0x384a4c,
  stamps: [{ stamp: 'window', x: 7, y: 1 }, { stamp: 'window', x: 13, y: 1 },
    { stamp: 'cabinet', x: 2, y: 6 }, { stamp: 'cabinet', x: 17, y: 6 },
    { stamp: 'bench', x: 3, y: 11 }, { stamp: 'bench', x: 15, y: 11 },
    { stamp: 'rug-green', x: 10, y: 8 }],
  lights: STORE_FAMILIES.map((family) => ({ x: SITES[family].x, y: SITES[family].y, r: 75, color: SITES[family].tint })),
  interactables: [
    ...STORE_FAMILIES.map((family) => {
      const { x, y } = SITES[family];
      return passage(`open-${family}`, x, y, MATERIAL_ROOMS[family].title, { map: MATERIAL_ROOMS[family].id, x: 17, y: 14 });
    }),
    passage('back-to-yard', 10, 15, 'the return to the Council Yard', { map: 'water.council', x: 24, y: 13 }),
  ],
};

function workroom(family: StoreFamily): MapDef {
  const plan = MATERIAL_ROOMS[family];
  const site = SITES[family];
  const jobs = MATERIAL_CASES.filter(({ fixture }) => fixture.kind === family);
  return {
    id: plan.id, name: `Water Commons: ${plan.title}`, world: plan.world, width: 35, height: 17,
    floor: roomFloor(35, 17, site.tile), blocks: [[1, 0, 33, 3]], zones: [],
    spawn: { x: 17, y: 14 }, music: 'music.archive', ambience: 'study', background: 0x374245,
    npcs: [{ id: plan.keeper.id, x: 17, y: 12, facing: 'down' }],
    stamps: [
      { stamp: 'window', x: 7, y: 1 }, { stamp: 'window', x: 17, y: 1 }, { stamp: 'window', x: 27, y: 1 },
      { stamp: 'cabinet', x: 1, y: 7 }, { stamp: 'bookshelf', x: 32, y: 7 },
      { stamp: 'bench', x: 4, y: 13 }, { stamp: 'bench', x: 26, y: 13 },
      { stamp: 'rug-green', x: 17, y: 13 },
    ],
    lights: [{ x: 7, y: 6, r: 76, color: site.tint }, { x: 18, y: 7, r: 82, color: site.tint },
      { x: 28, y: 8, r: 76, color: site.tint }, { x: 17, y: 14, r: 62, color: 0xe9d5a7 }],
    interactables: [
      ...jobs.flatMap((record, i): Interactable[] => {
        const x = 3 + (i % 5) * 6;
        const y = i < 5 ? 5 : 10;
        return [
          { id: `${MATERIAL_GAME}-${record.slug}-record`, kind: 'exhibit', exhibit: record.exhibit,
            x, y, w: 1, h: 1, label: `${record.object.title} · ${record.object.accession}`, art: 'preserved.catalogue' },
          { id: `${MATERIAL_GAME}-${record.slug}-fixture`, kind: 'fieldgame', game: `${MATERIAL_GAME}:${record.slug}`,
            x: x + 2, y, w: 1, h: 1, label: record.title, art: site.art, walkThrough: true,
            visibleIf: { card: record.card }, artOpen: { key: 'preserved.display-records', if: { objective: record.objective } } },
        ];
      }),
      passage(`close-${family}`, 17, 16, 'the door back to the Material Stores', { map: MATERIAL_HUB, x: site.x, y: site.y + 1 }),
    ],
  };
}

export const MATERIAL_STORE_MAPS = [hub, ...STORE_FAMILIES.map(workroom)];
