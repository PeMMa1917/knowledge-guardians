import { RELAY_CASES, RELAY_GROUP } from '../content/relayCases';
import { RELAY_CLIPS, type RelayChannel } from '../domain/specimenRelay';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

export const SEA_RELAY_ENTRANCE: Interactable = {
  id: 'specimen-relay-entrance', kind: 'door', x: 22, y: 6, w: 1, h: 1, art: 'sea.margin',
  label: 'the door to the cord relay room', visibleIf: { objective: 'sea.arrival' },
  to: { map: 'sea.relay-room', x: 13, y: 14 },
};

function receiver(channel: RelayChannel, x: number, y: number, label: string): Interactable {
  const hasDelivery: Condition = { any: RELAY_CASES.map((record) => ({
    flag: `${record.key}.sent`, in: RELAY_CLIPS.map((clip) => `${channel}-${clip}`),
  })) };
  return {
    id: `${RELAY_GROUP}-${channel}-receiver`, kind: 'fieldgame', game: `${RELAY_GROUP}:${channel}`, x, y, w: 1, h: 1,
    label, art: 'preserved.slip', artOpen: { key: channel === 'bell' ? 'sea.shore-chart' : 'sea.shoal-chart', if: hasDelivery },
    walkThrough: true, visibleIf: { objective: 'sea.arrival' },
  };
}

export const SEA_RELAY_HARBOUR_RECEIVER = receiver('bell', 6, 10, 'Sora’s relay catches by the harbour bell');
export const SEA_RELAY_CHART_RECEIVER = receiver('trace', 15, 12, 'Renna’s late relay tray');

const places = [
  [4, 5], [10, 5], [16, 5], [22, 5],
  [4, 10], [10, 10], [16, 10], [22, 10],
] as const;

export const SEA_RELAY_ROOM: MapDef = {
  id: 'sea.relay-room', name: 'Cartographers’ Sea: Cord Relay Room', world: 'WORLD-09',
  width: 28, height: 17, music: 'music.archive', ambience: 'study', background: 0x283941,
  spawn: { x: 13, y: 14 }, blocks: [[1, 0, 26, 3]], zones: [], npcs: [],
  floor: (x, y) => {
    if (x < 1 || x > 26 || y < 0 || y > 16) return null;
    if (y === 0) return 'wall-top';
    if (y === 1) return 'wall-mid';
    if (y === 2) return 'wall-base';
    return y === 7 || y === 12 ? 'stone-c' : 'voices-slate';
  },
  stamps: [
    { stamp: 'window', x: 6, y: 1 }, { stamp: 'window', x: 13, y: 1 }, { stamp: 'window', x: 20, y: 1 },
    { stamp: 'bookshelf', x: 1, y: 3 }, { stamp: 'bookshelf', x: 24, y: 3 },
    { stamp: 'bench', x: 1, y: 8 }, { stamp: 'bench', x: 24, y: 8 },
    { stamp: 'plant-tall', x: 1, y: 13 }, { stamp: 'plant-tall', x: 26, y: 13 },
    { stamp: 'rug-green', x: 11, y: 13 },
  ],
  interactables: [
    { id: 'specimen-relay-return', kind: 'door', x: 13, y: 16, w: 1, h: 1, art: 'sea.waypost',
      label: 'the door back to Lantern House', to: { map: 'sea.chartroom', x: 22, y: 7 } },
    { id: 'specimen-relay-note', kind: 'sign', x: 13, y: 11, w: 1, h: 1, art: 'sea.waypost', walkThrough: true,
      label: 'Sora’s note on the relay room',
      text: 'The harbour bell gives people little time. Test the two catches at any case. When you send, you can go down to the bell to check what arrived, or stay in Lantern House and use Renna’s late tray. These practice cords carry copies.' },
    ...RELAY_CASES.flatMap((record, i): Interactable[] => {
      const [x, y] = places[i];
      return [
        { id: `${RELAY_GROUP}-${record.slug}-exhibit`, kind: 'exhibit', exhibit: record.exhibit,
          x, y, w: 1, h: 1, label: `the museum record for ${record.name}`, art: 'preserved.catalogue', walkThrough: true },
        { id: `${RELAY_GROUP}-${record.slug}-cord`, kind: 'fieldgame', game: `${RELAY_GROUP}:${record.slug}`,
          x: x + 2, y, w: 1, h: 1, label: `the cord stand for ${record.name}`, art: 'sea.margin', walkThrough: true,
          artOpen: { key: 'sea.shore-chart', if: { objective: record.objective } } },
      ];
    }),
  ],
  lights: [
    { x: 6, y: 5, r: 67, color: 0xd6e9dc }, { x: 12, y: 5, r: 60, color: 0xfcda9b },
    { x: 18, y: 5, r: 66, color: 0xd2e3e6 }, { x: 24, y: 5, r: 64, color: 0xe8cbb2 },
    { x: 6, y: 10, r: 64, color: 0xf7d7a8 }, { x: 12, y: 10, r: 64, color: 0xa9cce0 },
    { x: 18, y: 10, r: 62, color: 0xefdaa7 }, { x: 24, y: 10, r: 66, color: 0xd3e2d4 },
  ],
};
