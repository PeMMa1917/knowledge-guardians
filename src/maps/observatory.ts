/** Fictional coast. The weather records describe local game conditions. */
import type { Condition } from '../domain/types';
import { sceneProp } from './sceneProps';
import type { Interactable, MapDef } from './types';

function sign(id: string, x: number, y: number, label: string, art: string, text: string,
  options: { flag?: string; visibleIf?: Condition } = {}): Interactable {
  return { id, kind: 'sign', x, y, w: 1, h: 1, label, art, text, walkThrough: true, ...options };
}

const harbourWidth = 29;
const harbourHeight = 21;

function harbourFloor(x: number, y: number): string | null {
  if (x < 0 || x >= harbourWidth || y < 0 || y >= harbourHeight) return null;
  if (y >= 15) {
    // Two docks on the west and east sides of the inlet.
    if (x >= 11 && x <= 14 && y <= 18) return 'stone-c';
    if (x >= 20 && x <= 23 && y <= 16) return 'stone-c';
    return null;
  }
  if (x >= 26 && y >= 11) return null;
  if (x >= 10 && x <= 16 && y >= 2) return 'stone-c';
  if (x >= 3 && x <= 24 && y >= 9) return 'stone-c';
  return 'grass';
}

export const OBSERVATORY_HARBOUR: MapDef = {
  id: 'observatory.harbour', name: 'Observatory Coast: Slate Harbour', world: 'WORLD-05',
  width: harbourWidth, height: harbourHeight, music: 'music.town', ambience: 'town',
  background: 0x235268, floor: harbourFloor,
  blocks: [], zones: [], spawn: { x: 13, y: 16 },
  npcs: [{ id: 'coast-signalkeeper', x: 9, y: 12, facing: 'right' }],
  stamps: [
    { stamp: 'house-a', x: 2, y: 2 }, { stamp: 'house-b', x: 19, y: 3 },
    { stamp: 'gatehouse', x: 12, y: 1 },
    { stamp: 'tree', x: 0, y: 5 }, { stamp: 'tree', x: 23, y: 1 },
    { stamp: 'bench', x: 3, y: 9 }, { stamp: 'stall', x: 20, y: 5 },
    { stamp: 'crates', x: 7, y: 7 }, { stamp: 'crates', x: 22, y: 11 },
    { stamp: 'barrel', x: 18, y: 14 }, { stamp: 'barrel', x: 10, y: 14 },
    { stamp: 'flowers-small', x: 4, y: 7 }, { stamp: 'flowers-white', x: 17, y: 4 },
  ],
  interactables: [
    { id: 'coast-headland-path', kind: 'door', x: 13, y: 4, w: 1, h: 1, label: 'the steps up to the observatory',
      art: 'coast.waypost', to: { map: 'observatory.station', x: 11, y: 13 } },
    { id: 'coast-nexus-return', kind: 'door', x: 13, y: 18, w: 1, h: 1, label: 'the crossing back to the Nexus',
      art: 'preserved.door', to: { map: 'nexus.archive', x: 29, y: 17 } },
    { id: 'coast-waystone', kind: 'waystone', x: 5, y: 12, w: 1, h: 1,
      label: 'the harbour Waystone', place: 'Slate Harbour', art: 'waystone' },
    sign('coast-harbour-gauge', 21, 15, 'the harbour gauge', 'coast.gauge',
      'Quay rain gauge. Two finger-widths of water in one bell, in the sheltered quay.',
      { flag: 'coast.gauge.harbour' }),
    ...sceneProp('coast.bell-slip', 19, 13, 'the quay’s bell slip', 'preserved.slip',
      { both: 'preserved.display-paired', stamp: 'coast.signal' }, { flag: 'coast.gauge.harbour', eq: true }),
    sign('coast-harbour-notebook', 17, 11, 'the basket carriers’ route book', 'coast.runner',
      'The basket carriers arrive by different paths. One shortcut passes the quay board but misses the steps where runners usually deliver the handover.',
      { flag: 'coast.notebook' }),
    sign('coast-notice-signal', 12, 14, 'the signal board at the quay', 'coast.signal',
      'A carrier points to the words “sheltered quay”. They copy the two readings into the landing book. Someone will still need to carry the board’s news to the people up the steps.',
      { visibleIf: { flag: 'coast.notice', eq: 'signal' } }),
    sign('coast-notice-runner', 10, 8, 'the runner’s handover point', 'coast.runner',
      'The runner repeats both readings at the foot of the steps. The next crew waits here for the time of each reading. A carrier using the quay shortcut may still miss this handover.',
      { visibleIf: { flag: 'coast.notice', eq: 'runner' } }),
    sign('coast-notice-revision', 15, 14, 'the dated correction slip', 'preserved.slip',
      'The second headland reading is lower. It sits beside the time of the first. The space for the second quay reading stays empty until a record arrives.',
      { visibleIf: { flag: 'coast.updated', eq: true } }),
    sign('coast-notice-spare', 14, 7, 'the notice at the steps', 'coast.signal',
      'A spare notice carries both places and the time of the reading. The next crew can see what was measured even if they miss the first copy.',
      { visibleIf: { flag: 'coast.copy.present', eq: true } }),
  ],
  lights: [
    { x: 21, y: 15, r: 58, color: 0xa3dbdf }, { x: 9, y: 12, r: 65, color: 0xf5d29b },
    { x: 13, y: 5, r: 51, color: 0xc8e2d4 }, { x: 13, y: 17, r: 49, color: 0x9bccde },
  ],
};

const stationWidth = 24;
const stationHeight = 16;

function stationFloor(x: number, y: number): string | null {
  if (x < 0 || x >= stationWidth - 2 || y < 0 || y >= stationHeight) return null;
  if (x >= 4 && x <= 20 && y >= 5 && y <= 12) return 'stone-c';
  if (x >= 9 && x <= 13 && y >= 12) return 'stone-c';
  return 'grass';
}

export const OBSERVATORY_STATION: MapDef = {
  id: 'observatory.station', name: 'Observatory Coast: Headland Station', world: 'WORLD-05',
  width: stationWidth, height: stationHeight, music: 'music.town', ambience: 'town',
  background: 0x416b7c, floor: stationFloor,
  blocks: [], zones: [], spawn: { x: 11, y: 13 },
  npcs: [{ id: 'coast-forecaster', x: 10, y: 7, facing: 'down' }],
  stamps: [
    { stamp: 'tower', x: 10, y: 1 }, { stamp: 'long-table', x: 14, y: 6 },
    { stamp: 'bench', x: 4, y: 7 }, { stamp: 'bush', x: 20, y: 10 },
    { stamp: 'tree', x: 1, y: 2 }, { stamp: 'tree', x: 1, y: 11 },
    { stamp: 'plant-tall', x: 8, y: 4 }, { stamp: 'plant-tall', x: 13, y: 4 },
    { stamp: 'flowers-small', x: 3, y: 12 }, { stamp: 'flowers-white', x: 18, y: 3 },
    { stamp: 'barrel', x: 8, y: 10 }, { stamp: 'barrel', x: 17, y: 11 },
  ],
  interactables: [
    { id: 'coast-headland-return', kind: 'door', x: 11, y: 15, w: 1, h: 1, label: 'the steps down to Slate Harbour',
      art: 'coast.waypost', to: { map: 'observatory.harbour', x: 13, y: 6 } },
    sign('coast-station-gauge', 20, 6, 'the station gauge', 'coast.gauge',
      'Headland rain gauge. Five finger-widths of water in one bell, on the exposed headland.',
      { flag: 'coast.gauge.station' }),
    sign('coast-chart-board', 15, 9, 'the model chart', 'forecast-board',
      'Model estimate. If the wind stays the same, the sheltered quay readings may stay lower than the exposed ones. The estimate leaves open what happens when the wind shifts.',
      { flag: 'coast.chart' }),
    sign('coast-station-recheck', 20, 9, 'the headland’s next reading', 'coast.gauge',
      'Two finger-widths at the headland. Same gauge, same interval, one bell later. No second quay reading has reached the station.',
      { flag: 'coast.gauge.recheck', visibleIf: { flagSet: 'coast.notice' } }),
  ],
  lights: [
    { x: 11, y: 5, r: 58, color: 0xf8d7a7 }, { x: 15, y: 9, r: 52, color: 0xf4e5b0 },
    { x: 20, y: 8, r: 61, color: 0xaadbd9 },
  ],
};
