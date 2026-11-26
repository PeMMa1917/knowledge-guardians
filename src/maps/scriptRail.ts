import type { Condition } from '../domain/types';
import type { ScriptLayout } from '../domain/scriptRail';
import {
  SCRIPT_CABINET, SCRIPT_CASES, SCRIPT_DESTINATIONS, SCRIPT_DETAILS, SCRIPT_RAIL, SCRIPT_RAIL_GATE,
  SCRIPT_RAIL_RETURN, SCRIPT_ROOMS, scriptCarry, scriptDelivery, type ScriptRoom,
} from '../content/scriptRail';
import type { Interactable, MapDef } from './types';

const wings = {
  verse: { x: 6, y: 4, art: 'stage.cues', tint: 0xd3bc82 },
  drama: { x: 14, y: 4, art: 'stage.rehearsal', tint: 0xe0a5ad },
  prose: { x: 6, y: 9, art: 'preserved.catalogue', tint: 0xafc7d2 },
  edition: { x: 14, y: 9, art: 'preserved.display-records', tint: 0xcdadd2 },
} as const;

function door(id: string, x: number, y: number, label: string, to: NonNullable<Interactable['to']>): Interactable {
  return { id: `${SCRIPT_RAIL}-${id}`, kind: 'door', x, y, w: 1, h: 1, label, to, art: 'stage.waypost' };
}

export const SCRIPT_RAIL_ENTRANCE: Interactable = {
  ...door('entrance', 24, 12, 'the passage to the Script Cabinet', { map: SCRIPT_CABINET, x: 10, y: 12 }),
  visibleIf: SCRIPT_RAIL_GATE,
};

const receipt = (layout: ScriptLayout, x: number, y: number): Interactable => ({
  id: SCRIPT_DESTINATIONS[layout].prop, kind: 'fieldgame', game: `${SCRIPT_RAIL}:receive:${layout}`,
  x, y, w: 1, h: 1, label: SCRIPT_DESTINATIONS[layout].label,
  art: layout === 'cue' ? 'stage.programme' : 'preserved.catalogue', walkThrough: true,
  visibleIf: { any: SCRIPT_CASES.map((record) => scriptDelivery(record, layout)) },
  artOpen: { key: 'preserved.display-paired', if: { any: SCRIPT_CASES.map((record) => ({ flag: record.objective, eq: layout })) } },
});

export const SCRIPT_RAIL_GALLERY = [receipt('cue', 24, 9), receipt('catalogue', 24, 12)];
const returned: Condition = { any: SCRIPT_CASES.map(({ reprise }) => ({ flag: reprise, eq: 'use' })) };
export const SCRIPT_RAIL_COPIES: Interactable = {
  id: SCRIPT_RAIL_RETURN.prop, kind: 'fieldgame', game: `${SCRIPT_RAIL}:revisit`,
  x: 19, y: 13, w: 1, h: 1, label: 'the folded index beside the City of Copies reading desk',
  art: 'preserved.slip', walkThrough: true,
  visibleIf: { any: [{ any: SCRIPT_CASES.map(scriptCarry) }, returned] },
  artOpen: { key: 'preserved.display-records', if: returned },
};

function floor(width: number, height: number): MapDef['floor'] {
  return (x, y) => {
    if (x < 1 || x > width - 2 || y < 0 || y >= height) return null;
    if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
    return 'stone-c';
  };
}

const cabinet: MapDef = {
  id: SCRIPT_CABINET, name: 'House of Performance: The Script Cabinet', world: 'WORLD-10', music: 'music.archive',
  ambience: 'study', background: 0x392c42, width: 21, height: 16,
  floor: floor(21, 16), blocks: [[1, 0, 19, 3]], zones: [], npcs: [], spawn: { x: 10, y: 12 },
  stamps: [
    { stamp: 'banners', x: 6, y: 1 }, { stamp: 'window', x: 11, y: 1 }, { stamp: 'banners', x: 15, y: 1 },
    { stamp: 'rug-green', x: 9, y: 9 }, { stamp: 'bench', x: 2, y: 12 }, { stamp: 'bench', x: 16, y: 12 },
  ],
  lights: SCRIPT_ROOMS.map((room) => ({ x: wings[room].x, y: wings[room].y, r: 82, color: wings[room].tint })),
  interactables: [
    ...SCRIPT_ROOMS.map((room) => door(`open-${room}`, wings[room].x, wings[room].y, SCRIPT_DETAILS[room].title,
      { map: SCRIPT_DETAILS[room].map, x: 17, y: 14 })),
    door('leave', 10, 15, 'the passage back to the Front Foyer', { map: 'stage.foyer', x: 23, y: 12 }),
  ],
};

function chamber(room: ScriptRoom): MapDef {
  const place = SCRIPT_DETAILS[room];
  const wing = wings[room];
  const records = SCRIPT_CASES.filter((record) => record.room === room);
  return {
    id: place.map, name: `House of Performance: ${place.title}`, world: 'WORLD-10', width: 35, height: 17,
    floor: floor(35, 17), blocks: [[1, 0, 33, 3]], zones: [], spawn: { x: 17, y: 14 },
    music: 'music.archive', ambience: 'study', background: 0x3d3244,
    npcs: [{ id: place.actor, x: 17, y: 12, facing: 'down' }],
    stamps: [
      { stamp: 'window', x: 5, y: 1 }, { stamp: 'banners', x: 16, y: 1 }, { stamp: 'window', x: 28, y: 1 },
      { stamp: 'cabinet', x: 1, y: 6 }, { stamp: 'bookshelf', x: 32, y: 7 },
      { stamp: 'bench', x: 6, y: 13 }, { stamp: 'bench', x: 25, y: 13 }, { stamp: 'rug-green', x: 17, y: 13 },
    ],
    lights: [{ x: 6, y: 5, r: 82, color: wing.tint }, { x: 17, y: 8, r: 98, color: wing.tint },
      { x: 28, y: 10, r: 82, color: wing.tint }, { x: 17, y: 13, r: 58, color: 0xead5a7 }],
    interactables: [
      ...records.flatMap((record, index): Interactable[] => {
        const x = 3 + (index % 5) * 6;
        const y = index < 5 ? 5 : 10;
        return [
          {
            id: `${SCRIPT_RAIL}-${record.slug}-record`, kind: 'exhibit', exhibit: record.exhibit, x, y, w: 1, h: 1,
            label: `${record.object.title} · ${record.object.accession}`, art: 'stage.programme',
          },
          {
            id: `${SCRIPT_RAIL}-${record.slug}-fold`, kind: 'fieldgame', game: `${SCRIPT_RAIL}:${record.slug}`,
            x: x + 2, y, w: 1, h: 1, label: record.title, art: wing.art, walkThrough: true,
            visibleIf: { card: record.card }, artOpen: { key: 'preserved.display-paired', if: { objective: record.objective } },
          },
        ];
      }),
      door(`close-${room}`, 17, 16, 'the passage back to the Script Cabinet', { map: SCRIPT_CABINET, x: wing.x, y: wing.y + 1 }),
    ],
  };
}

export const SCRIPT_RAIL_MAPS = [cabinet, ...SCRIPT_ROOMS.map(chamber)];
