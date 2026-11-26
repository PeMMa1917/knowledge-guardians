import {
  DELIVERY_ROUTES, OBJECT_USE_CASES, OBJECT_USE_DETAILS, OBJECT_USE_GROUP, OBJECT_USE_ROOMS, objectUseDelivery,
  type ObjectUseHost, type ObjectUseRoom, type DeliveryRoute,
} from '../content/objectUseCases';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

const ENTRANCES = {
  packing: [12, 3], exchange: [23, 10], joinery: [12, 3], trace: [23, 10],
} as const;

const RETURNS = {
  packing: [12, 4], exchange: [22, 10], joinery: [12, 4], trace: [22, 10],
} as const;

const RECEIVERS = {
  packing: [[5, 15], [9, 15]], exchange: [[17, 15], [23, 15]],
  joinery: [[5, 15], [9, 15]], trace: [[17, 15], [23, 15]],
} as const;

const LAYOUTS = {
  packing: { tile: 'stone-c', background: 0x3e3f3b, light: 0xf3c69b, art: 'board-stand' },
  exchange: { tile: 'voices-slate', background: 0x33434a, light: 0xb8e0d2, art: 'ledger' },
  joinery: { tile: 'stone-c', background: 0x453a4b, light: 0xe6c5e8, art: 'stage.cues' },
  trace: { tile: 'voices-slate', background: 0x21394b, light: 0xa8cad5, art: 'stage.cues' },
} as const;

const HOST_MAP = { market: 'market.sample-shed', stage: 'stage.prop-room' } as const;
const NAMES = { market: 'Market of Measures', stage: 'House of Performance' } as const;
const STATIONS = [[4, 5], [11, 5], [18, 5], [6, 10], [16, 10]] as const;

function receiver(room: ObjectUseRoom, route: DeliveryRoute, i: number): Interactable {
  const plan = OBJECT_USE_DETAILS[room];
  const [x, y] = RECEIVERS[room][i];
  const deliveries: Condition = { any: OBJECT_USE_CASES.filter((job) => job.room === room).map((job) => objectUseDelivery(job, route)) };
  const received: Condition = { any: OBJECT_USE_CASES.filter((job) => job.room === room).map((job) => ({ flag: job.objective, eq: route })) };
  return {
    id: `${OBJECT_USE_GROUP}-${room}-${route}`, kind: 'fieldgame', x, y, w: 1, h: 1, walkThrough: true,
    game: `${OBJECT_USE_GROUP}:receive:${room}:${route}`,
    label: plan.stations[i], art: i === 0 ? 'fold.strip' : 'fold.paired',
    visibleIf: deliveries, artOpen: { key: 'preserved.display-records', if: received },
  };
}

export function objectUseEntries(host: ObjectUseHost): Interactable[] {
  return OBJECT_USE_ROOMS.flatMap((room): Interactable[] => {
    const plan = OBJECT_USE_DETAILS[room];
    if (plan.host !== host) return [];
    const [x, y] = ENTRANCES[room];
    const doorway: Interactable = {
      id: `${OBJECT_USE_GROUP}-${room}-entrance`, kind: 'door', x, y, w: 1, h: 1,
      label: `the door to ${plan.title.replace(/^The /, 'the ')}`, art: 'preserved.door',
      to: { map: plan.room, x: 12, y: 14 }, visibleIf: { objective: plan.chapter },
    };
    return [doorway, ...DELIVERY_ROUTES.map((route, i) => receiver(room, route, i))];
  });
}

function workshop(room: ObjectUseRoom): MapDef {
  const plan = OBJECT_USE_DETAILS[room];
  const [x, y] = RETURNS[room];
  const layout = LAYOUTS[room];
  return {
    id: plan.room, name: `${NAMES[plan.host]}: ${plan.title}`, world: plan.world, width: 25, height: 17,
    spawn: { x: 12, y: 14 }, music: plan.host === 'market' ? 'music.town' : 'music.archive',
    ambience: plan.host === 'market' ? 'town' : 'study', background: layout.background,
    floor: (gx, gy) => {
      if (gx < 1 || gx > 23 || gy < 0 || gy > 16) return null;
      if (gy < 3) return ['wall-top', 'wall-mid', 'wall-base'][gy];
      return gy === 8 || gy === 13 ? 'stone-c' : layout.tile;
    },
    blocks: [[1, 0, 23, 3]], zones: [],
    npcs: [{ id: plan.keeper.id, x: 12, y: 11, facing: 'down' }],
    stamps: [
      { stamp: 'window', x: 6, y: 1 }, { stamp: 'window', x: 18, y: 1 },
      { stamp: 'cabinet', x: 1, y: 4 }, { stamp: 'bookshelf', x: 21, y: 4 },
      { stamp: 'bench', x: 3, y: 13 }, { stamp: 'cabinet', x: 20, y: 13 },
      { stamp: 'rug-green', x: 11, y: 13 },
    ],
    lights: [
      ...STATIONS.map(([sx, sy]) => ({ x: sx + 1, y: sy, r: 66, color: layout.light })),
      { x: 12, y: 14, r: 55, color: 0xf8cd8e },
    ],
    interactables: [
      ...OBJECT_USE_CASES.filter((job) => job.room === room).flatMap((job, index): Interactable[] => {
        const [col, row] = STATIONS[index];
        return [
          { id: `${OBJECT_USE_GROUP}-${job.key}-exhibit`, kind: 'exhibit', exhibit: job.exhibit,
            x: col, y: row, w: 1, h: 1, art: 'preserved.catalogue', label: `${job.object.title} · ${job.object.accession}` },
          { id: `${OBJECT_USE_GROUP}-${job.key}-tool`, kind: 'fieldgame', game: `${OBJECT_USE_GROUP}:${job.key}`,
            x: col + 2, y: row, w: 1, h: 1, walkThrough: true, label: job.title, art: layout.art,
            visibleIf: { card: job.card }, artOpen: { key: 'preserved.display-records', if: { objective: job.objective } } },
        ];
      }),
      { id: `${OBJECT_USE_GROUP}-${room}-return`, kind: 'door', x: 12, y: 16, w: 1, h: 1,
        label: plan.host === 'market' ? 'the way back to the Sample Shed' : 'the way back to the Prop Room',
        art: 'preserved.door', to: { map: HOST_MAP[plan.host], x, y } },
    ],
  };
}

export const OBJECT_USE_WORKSHOPS = OBJECT_USE_ROOMS.map(workshop);
