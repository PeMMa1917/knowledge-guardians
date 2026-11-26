import {
  SCHEDULE_CASES, SCHEDULE_DETAILS, SCHEDULE_GAME, SCHEDULE_GATE, SCHEDULE_HUB, SCHEDULE_REVISIT, SCHEDULE_ROOMS,
  scheduleCarry, scheduleDelivery, type ScheduleRoom,
} from '../content/workScheduleCases';
import type { Condition } from '../domain/types';
import type { SchedulePriority } from '../domain/workSchedule';
import type { Interactable, MapDef } from './types';

const sites = {
  cloth: { x: 6, y: 4, tint: 0xd9b5ce, tile: 'stone-c', art: 'fold.paired' },
  vessels: { x: 14, y: 4, tint: 0xcae1a0, tile: 'voices-slate', art: 'board-stand' },
  hardware: { x: 6, y: 9, tint: 0xd8be88, tile: 'stone-c', art: 'coast.clear-frame' },
  paper: { x: 14, y: 9, tint: 0xb0dcd9, tile: 'voices-slate', art: 'ledger' },
} as const;

function door(id: string, x: number, y: number, label: string, to: NonNullable<Interactable['to']>): Interactable {
  return { id: `${SCHEDULE_GAME}-${id}`, kind: 'door', x, y, w: 1, h: 1, label, to, art: 'preserved.door' };
}

function receiver(route: SchedulePriority, x: number, y: number, label: string): Interactable {
  return { id: `${SCHEDULE_GAME}-receive-${route}`, kind: 'fieldgame', game: `${SCHEDULE_GAME}:receive:${route}`,
    x, y, w: 1, h: 1, label, art: route === 'source' ? 'preserved.slip' : 'fold.paired', walkThrough: true,
    visibleIf: { any: SCHEDULE_CASES.map((record) => scheduleDelivery(record, route)) },
    artOpen: { key: 'preserved.display-records', if: { any: SCHEDULE_CASES.map((record) => ({ flag: record.objective, eq: route })) } },
  };
}

export const WORK_SCHEDULE_ENTRANCE: Interactable = {
  ...door('entrance', 22, 5, 'the passage to the Working Cupboards', { map: SCHEDULE_HUB, x: 10, y: 12 }),
  visibleIf: SCHEDULE_GATE,
};
export const WORK_SCHEDULE_FERN = receiver('source', 16, 14, 'the first-bell source rack at Fern Station');
export const WORK_SCHEDULE_TRAIL = receiver('practice', 26, 11, 'the first-bell practice tray at Listening Trail');
const carried: Condition = { any: SCHEDULE_CASES.map(scheduleCarry) };
const checked: Condition = { any: SCHEDULE_CASES.map(({ reprise }) => ({ flag: reprise, eq: 'use' })) };

export const WORK_SCHEDULE_COPIES: Interactable = {
  id: SCHEDULE_REVISIT.prop, kind: 'fieldgame', game: `${SCHEDULE_GAME}:revisit`,
  x: 14, y: 13, w: 1, h: 1, label: 'the late-proof shelf by the record room desk', art: 'fold.paired', walkThrough: true,
  visibleIf: { any: [carried, checked] }, artOpen: { key: 'preserved.display-records', if: checked },
};

function floor(wide: number, tall: number, tile = 'stone-c'): MapDef['floor'] {
  return (x, y) => {
    if (x < 1 || x > wide - 2 || y < 0 || y >= tall) return null;
    if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
    return y === 7 || y === 12 ? 'stone-c' : tile;
  };
}

const hub: MapDef = {
  id: SCHEDULE_HUB, name: 'Living Forest: The Working Cupboards', world: 'WORLD-06', width: 21, height: 16,
  floor: floor(21, 16), blocks: [[1, 0, 19, 3]], zones: [], npcs: [],
  spawn: { x: 10, y: 12 }, music: 'music.archive', ambience: 'study', background: 0x283e42,
  stamps: [
    { stamp: 'window', x: 7, y: 1 }, { stamp: 'window', x: 13, y: 1 },
    { stamp: 'cabinet', x: 2, y: 6 }, { stamp: 'cabinet', x: 17, y: 6 },
    { stamp: 'plant-tall', x: 2, y: 11 }, { stamp: 'plant-tall', x: 17, y: 11 }, { stamp: 'rug-green', x: 9, y: 10 },
  ],
  lights: SCHEDULE_ROOMS.map((room) => ({ ...sites[room], r: 68, color: sites[room].tint })),
  interactables: [
    ...SCHEDULE_ROOMS.map((room) => {
      const { x, y } = sites[room];
      return door(`open-${room}`, x, y, SCHEDULE_DETAILS[room].title, { map: SCHEDULE_DETAILS[room].map, x: 17, y: 14 });
    }),
    door('leave', 10, 15, 'the passage to the Bridge Clearing', { map: 'forest.community', x: 22, y: 6 }),
  ],
};

function workshop(room: ScheduleRoom): MapDef {
  const info = SCHEDULE_DETAILS[room];
  const { x, y, art, tint, tile } = sites[room];
  const rows = SCHEDULE_CASES.filter((record) => record.room === room);
  return {
    id: info.map, name: `Living Forest: ${info.title}`, world: 'WORLD-06', width: 35, height: 17,
    floor: floor(35, 17, tile), blocks: [[1, 0, 33, 3]], zones: [],
    spawn: { x: 17, y: 14 }, music: 'music.archive', ambience: 'study', background: 0x383c43,
    npcs: [{ id: info.actor, x: 17, y: 12, facing: 'down' }],
    stamps: [
      { stamp: 'window', x: 7, y: 1 }, { stamp: 'window', x: 17, y: 1 }, { stamp: 'window', x: 27, y: 1 },
      { stamp: 'cabinet', x: 1, y: 7 }, { stamp: 'bookshelf', x: 32, y: 7 },
      { stamp: 'bench', x: 4, y: 13 }, { stamp: 'bench', x: 26, y: 13 },
      { stamp: 'rug-green', x: 17, y: 13 },
    ],
    lights: [{ x: 7, y: 6, r: 76, color: tint }, { x: 18, y: 7, r: 86, color: tint },
      { x: 28, y: 8, r: 76, color: tint }, { x: 17, y: 14, r: 58, color: 0xe5cea9 }],
    interactables: [
      ...rows.flatMap((record, index): Interactable[] => {
        const col = 3 + (index % 5) * 6;
        const row = index < 5 ? 5 : 10;
        return [
          { id: `${SCHEDULE_GAME}-${record.slug}-record`, kind: 'exhibit', exhibit: record.exhibit, x: col, y: row,
            w: 1, h: 1, label: `${record.object.title} · ${record.object.accession}`, art: 'preserved.catalogue' },
          { id: `${SCHEDULE_GAME}-${record.slug}-board`, kind: 'fieldgame', game: `${SCHEDULE_GAME}:${record.slug}`,
            x: col + 2, y: row, w: 1, h: 1, label: record.title, art, walkThrough: true,
            visibleIf: { card: record.card }, artOpen: { key: 'preserved.display-records', if: { objective: record.objective } } },
        ];
      }),
      door(`close-${room}`, 17, 16, 'the passage back to the Working Cupboards', { map: SCHEDULE_HUB, x, y: y + 1 }),
    ],
  };
}

export const WORK_SCHEDULE_MAPS = [hub, ...SCHEDULE_ROOMS.map(workshop)];
