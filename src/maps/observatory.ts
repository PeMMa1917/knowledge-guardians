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
    sign('coast-fold-harbour-stair', 6, 10, 'the Fold’s bundle at the stone stair', 'coast.runner',
      'The quay clerk takes the Fold’s readings from a porter at the stair. The marked walk gives each porter a place to hand over a sheet. Boxes still reach the quay by the longer road.',
      { flag: 'coast.fold.received', visibleIf: { all: [
        { flag: 'coast.fold.route', eq: 'stair' }, { flag: 'coast.fold.crossed', eq: true },
      ] } }),
    sign('coast-fold-harbour-cart', 19, 10, 'the Fold’s bundle at the unloading ramp', 'preserved.slip',
      'A carter hangs the Fold’s readings where the trays are unloaded. The crew moves four trays in one delivery. The clerk keeps the stair on the map for people already walking.',
      { flag: 'coast.fold.received', visibleIf: { all: [
        { flag: 'coast.fold.route', eq: 'cart' }, { flag: 'coast.fold.crossed', eq: true },
      ] } }),
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
    { id: 'coast-fold-path', kind: 'door', x: 3, y: 9, w: 1, h: 1, label: 'the track to Marl Fold',
      art: 'coast.waypost', to: { map: 'observatory.inland', x: 21, y: 13 } },
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

const foldWidth = 26;
const foldHeight = 18;

function foldFloor(x: number, y: number): string | null {
  if (x < 0 || x >= foldWidth || y < 0 || y >= foldHeight) return null;
  if (y >= 14 && x <= 6) return null;
  if (y >= 11 && y <= 13 && x >= 4 && x <= 22) return 'stone-c';
  if (x >= 9 && x <= 13 && y >= 5 && y <= 10) return 'stone-c';
  return 'grass';
}

export const OBSERVATORY_INLAND: MapDef = {
  id: 'observatory.inland', name: 'Observatory Coast: Marl Fold', world: 'WORLD-05',
  width: foldWidth, height: foldHeight, music: 'music.town', ambience: 'town',
  background: 0x3d6154, floor: foldFloor,
  blocks: [], zones: [], spawn: { x: 21, y: 13 },
  npcs: [{ id: 'coast-fold-keeper', x: 12, y: 9, facing: 'down' }],
  stamps: [
    { stamp: 'house-a', x: 4, y: 2 }, { stamp: 'house-b', x: 17, y: 2 },
    { stamp: 'stall', x: 10, y: 5 }, { stamp: 'tree', x: 1, y: 2 },
    { stamp: 'tree', x: 21, y: 5 }, { stamp: 'tree', x: 7, y: 8 },
    { stamp: 'crates', x: 10, y: 8 }, { stamp: 'barrel', x: 4, y: 12 },
    { stamp: 'bench', x: 15, y: 11 }, { stamp: 'flowers-white', x: 8, y: 4 },
    { stamp: 'bush', x: 6, y: 13 }, { stamp: 'flowers-small', x: 18, y: 12 },
  ],
  interactables: [
    { id: 'coast-fold-return', kind: 'door', x: 23, y: 13, w: 1, h: 1, label: 'the track back to Headland Station',
      art: 'coast.waypost', to: { map: 'observatory.station', x: 4, y: 9 } },
    sign('coast-fold-stair-log', 5, 8, 'the porter’s dry-day tally', 'coast.runner',
      'Marl Fold yard to Slate Harbour quay. Dry day. Stone stair: nine minutes out, nine back. A porter takes one tray. The narrow turn blocks the cart. The tally ends at the quay, before unloading.',
      { flag: 'coast.fold.stair-log' }),
    sign('coast-fold-cart-log', 16, 7, 'the carter’s dry-day tally', 'preserved.slip',
      'Marl Fold yard to Slate Harbour quay. Dry day. Hedge lane: fourteen minutes out, fourteen back. A cart takes four trays. The tally ends at the quay, before unloading.',
      { flag: 'coast.fold.cart-log' }),
    sign('coast-fold-old-sheet', 12, 7, 'the old sheet beside the route board', 'forecast-board',
      'One faint line is marked “first boat”. The Fold’s older sheet counted a tray from the yard. The quay’s sheet counted a delivery when the trays were off the cart. Two clerks had copied the same heading.',
      { flag: 'coast.fold.old-sheet', visibleIf: { not: { flag: 'coast.fold.names-noted', eq: true } } }),
    sign('coast-fold-endpoints', 12, 7, 'the old tallies with their endpoints', 'preserved.display-paired',
      'Both sheets still say “first boat”. A slip under the Fold’s heading marks the first tray out of the yard. A second slip marks the quay’s first tray unloaded. The dates and writing on the sheets stay visible.',
      { visibleIf: { flag: 'coast.fold.names-noted', eq: true } }),
    sign('coast-fold-stair-board', 13, 9, 'the posted foot route', 'coast.runner',
      'STONE STAIR. One tray by hand. The stair outline marks the turn. The board gives the dry-day times and leaves a space for a wet-day run.',
      { visibleIf: { flag: 'coast.fold.route', eq: 'stair' } }),
    sign('coast-fold-cart-board', 13, 9, 'the posted cart route', 'coast.waypost',
      'HEDGE LANE. Four trays in one cart. The wheel mark leads to the ramp. The board gives the dry-day times and leaves a space for a wet-day run.',
      { visibleIf: { flag: 'coast.fold.route', eq: 'cart' } }),
    { id: 'coast-fold-stair', kind: 'door', x: 2, y: 10, w: 1, h: 1, label: 'the marked stone stair to Slate Harbour',
      art: 'coast.runner', flag: 'coast.fold.crossed', to: { map: 'observatory.harbour', x: 7, y: 11 },
      visibleIf: { flag: 'coast.fold.route', eq: 'stair' } },
    { id: 'coast-fold-cart', kind: 'door', x: 19, y: 9, w: 1, h: 1, label: 'the marked hedge lane to Slate Harbour',
      art: 'coast.waypost', flag: 'coast.fold.crossed', to: { map: 'observatory.harbour', x: 18, y: 10 },
      visibleIf: { flag: 'coast.fold.route', eq: 'cart' } },
  ],
  lights: [
    { x: 11, y: 8, r: 67, color: 0xf6d9a0 }, { x: 16, y: 7, r: 48, color: 0xf1e6b0 },
    { x: 5, y: 8, r: 48, color: 0xd3e2d4 }, { x: 22, y: 13, r: 49, color: 0xb4decc },
  ],
};
