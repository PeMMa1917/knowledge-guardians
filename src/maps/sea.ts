import { pictureFerryDoor, ferryShoreBench } from './pictureFerry';
import { SHORE_REPLY_DOOR } from './shoreReply';
/** Fictional island charts, drawn for the Seagrass Steps and Shoal Shelf surveys. */
import type { Condition } from '../domain/types';
import { SEA_DATE_PEG_DOOR, SEA_DATE_PEG_READERS, SEA_DATE_PEG_RECEIVERS } from './datePeg';
import { SEA_DATE_REGISTER_PROPS, SEA_DATE_REGISTER_READERS } from './dateRegister';
import { SEA_CALLBOARD_RETURNS } from './civicCallboard';
import { SEA_PAPER_LANDING } from './paperLanding';
import { SHOAL_PROOF_DOOR, SHOAL_PROOF_LOWER, SHOAL_PROOF_READERS, SHOAL_PROOF_UPPER } from './specimenPassage';
import { SEA_RELAY_CHART_RECEIVER, SEA_RELAY_ENTRANCE, SEA_RELAY_HARBOUR_RECEIVER } from './specimenRelay';
import { TURNING_DOOR, TURNING_READERS } from './turningTable';
import { THREAD_BEND_CHARTROOM, THREAD_BEND_HARBOUR } from './threadBend';
import type { Interactable, MapDef } from './types';

function crossing(id: string, x: number, y: number, label: string, to: NonNullable<Interactable['to']>, art = 'sea.waypost'): Interactable {
  return { id, kind: 'door', x, y, w: 1, h: 1, label, to, art };
}

function chartNote(id: string, x: number, y: number, label: string, art: string, text: string,
  options: { flag?: string; visibleIf?: Condition } = {}): Interactable {
  return { id, kind: 'sign', x, y, w: 1, h: 1, label, art, text, walkThrough: true, ...options };
}

const harbourWidth = 30;
const harbourHeight = 19;

function harbourFloor(x: number, y: number): string | null {
  if (x < 0 || y < 0 || x >= harbourWidth || y >= harbourHeight) return null;
  if ((x >= 27 && y >= 8) || (x <= 1 && y >= 10)) return null;
  if (y >= 14) {
    if (x >= 11 && x <= 13) return 'stone-c';
    if (x >= 18 && x <= 21 && y <= 16) return 'stone-c';
    return null;
  }
  if (x >= 3 && x <= 26 && (y >= 7 || (x >= 5 && x <= 8))) return 'stone-c';
  return 'grass';
}

export const SEA_HARBOUR: MapDef = {
  id: 'sea.harbour', name: 'Cartographers’ Sea: Seagrass Steps', world: 'WORLD-09',
  width: harbourWidth, height: harbourHeight, music: 'music.town', ambience: 'town',
  background: 0x28566c, floor: harbourFloor,
  spawn: { x: 12, y: 12 }, blocks: [], zones: [],
  npcs: [{ id: 'sea-harbourkeeper', x: 14, y: 8, facing: 'down' }, ...SEA_DATE_PEG_READERS, ...SEA_DATE_REGISTER_READERS],
  stamps: [
    { stamp: 'house-b', x: 2, y: 1 }, { stamp: 'house-a', x: 11, y: 1 },
    { stamp: 'tower', x: 20, y: 0 }, { stamp: 'stall', x: 20, y: 5 },
    { stamp: 'tree', x: 26, y: 2 }, { stamp: 'tree', x: 0, y: 5 },
    { stamp: 'bench', x: 4, y: 9 }, { stamp: 'barrel', x: 9, y: 9 },
    { stamp: 'crates', x: 15, y: 11 }, { stamp: 'barrel', x: 22, y: 13 },
    { stamp: 'flowers-small', x: 8, y: 3 }, { stamp: 'flowers-white', x: 24, y: 3 },
  ],
  interactables: [
    pictureFerryDoor, ferryShoreBench,
    { id: 'field-fog', kind: 'fieldgame', game: 'fog', x: 16, y: 3, w: 1, h: 1, label: 'Renna’s fog chart (The Fog Chart)', art: 'old-sign' },
    ...SEA_PAPER_LANDING,
    ...THREAD_BEND_HARBOUR,
    SEA_RELAY_HARBOUR_RECEIVER,
    ...SEA_DATE_PEG_RECEIVERS,
    ...SEA_DATE_REGISTER_PROPS,
    { id: 'cross-drowned-bell', kind: 'fieldgame', game: 'cross-drowned-bell', x: 8, y: 8, w: 1, h: 1, label: 'the old pier where the bell is said to ring (a crossing)', art: 'sea.margin' },
    crossing('sea-chartroom-path', 7, 4, 'the path to Lantern House', { map: 'sea.chartroom', x: 12, y: 12 }),
    crossing('sea-shoal-path', 24, 12, 'the skiff to Shoal Shelf', { map: 'sea.shoal', x: 6, y: 12 }, 'sea.skiff'),
    crossing('sea-nexus-return', 12, 17, 'the crossing back to the Nexus', { map: 'nexus.archive', x: 20, y: 14 }, 'preserved.door'),
    { id: 'sea-harbour-waystone', kind: 'waystone', x: 9, y: 12, w: 1, h: 1,
      label: 'the Seagrass Steps Waystone', place: 'Seagrass Steps', art: 'waystone' },
    { id: 'sea-chart-harbour', kind: 'sea-chart', node: 'harbour', x: 18, y: 11, w: 1, h: 1,
      label: 'the shore survey chart', art: 'sea.shore-chart' },
    chartNote('sea-harbour-directory', 10, 10, 'the Seagrass Steps directory', 'sea.waypost',
      'Seagrass Steps. The shore chart is by the Market Rail. The skiff to Shoal Shelf leaves from the east path. The upper road leads to Lantern House.'),
    chartNote('sea-reader-note', 17, 7, 'the reader’s note at the rail', 'preserved.slip',
      'Seagrass Steps are on one sheet. Beyond the Market Rail the paper is blank. I thought that meant the rest of the way was clear. Where did the survey stop?',
      { flag: 'sea.feedback', visibleIf: { flagSet: 'sea.response' } }),
    chartNote('sea-response-shore', 10, 7, 'the shore chart display', 'sea.shore-chart',
      'The shore plan hangs where market carriers pass. It names the Seagrass Steps and Market Rail. A small insert refers to the separate shoal survey.',
      { visibleIf: { flag: 'sea.response', eq: 'shore' } }),
    chartNote('sea-response-water', 21, 11, 'the water chart display', 'sea.shoal-chart',
      'The two sheets sit together by the landing. The shoal panel shows Lantern House and the Shoal Shelf at a larger scale. The separate shore plan carries the steps and rail.',
      { visibleIf: { flag: 'sea.response', eq: 'water' } }),
    chartNote('sea-followup-notice', 16, 8, 'the chart’s revised boundary note', 'sea.margin',
      'A hatched space begins where each survey stopped. By the shore, “The walkers stopped here.” At the water’s edge, “The crew checked within this strip.” The place names stay visible.',
      { visibleIf: { flag: 'sea.followup', eq: true } }),
    chartNote('sea-wide-key', 11, 13, 'the wide reading key', 'sea.margin',
      'Place names and survey edges have their own lines here. The marks on either chart point to the same key.',
      { visibleIf: { flag: 'sea.wide-key', eq: true } }),
    chartNote('sea-symbol-sight-frame', 20, 9, 'the two marks at the shore sight frame', 'sea.shore-chart',
      'Match the roof-shaped cutout to the upper roof step. Follow the two dots to the lantern hooks beneath that step. Both lines meet the same upstairs landing at Lantern House.',
      { flag: 'sea.symbol.sight', visibleIf: { all: [
        { objective: 'sea.finish' },
        { flag: 'sea.symbol.roof', eq: true },
        { flag: 'sea.symbol.lights', eq: true },
      ] } }),
    { id: 'sea-symbol-key-holder', kind: 'scene', node: 'sea.symbol.place', x: 18, y: 9, w: 1, h: 1,
      label: 'the holder for a two-mark key', art: 'sea.margin', walkThrough: true,
      visibleIf: { objective: 'sea.symbol.compared' } },
    chartNote('sea-symbol-key-rail', 16, 9, 'the Lantern House key at Market Rail', 'sea.margin',
      'Follow the stepped roof to Lantern House. The two dots on a deck copy mark its pair of lights. Both signs point to the same upstairs landing.',
      { visibleIf: { flag: 'sea.symbol.mount', eq: 'rail' } }),
    chartNote('sea-symbol-key-skiff', 23, 10, 'the Lantern House key at the skiff', 'sea.shoal-chart',
      'Find the pair of lights at Lantern House. On shore copies the same landing has the stepped roof mark. Keep the house name with either mark when you pass on the copy.',
      { visibleIf: { flag: 'sea.symbol.mount', eq: 'skiff' } }),
    chartNote('sea-name-step', 22, 12, 'the carrier’s mark at Salt Step', 'sea.waypost',
      'Salt Step is this ledge where the rail ends. A carrier drops a crate on the marked shelf. The crew can move the skiff elsewhere after loading.',
      { flag: 'sea.name.step', visibleIf: { not: { flag: 'sea.name.readback', eq: true } } }),
    chartNote('sea-name-load', 22, 12, 'the next carrier at Salt Step', 'sea.margin',
      'The next carrier followed the new key to this ledge. They left the crate on the shelf while a crew member retied Glint. The new line stays with the step until the next loading schedule.',
      { flag: 'sea.name.loaded', visibleIf: { flag: 'sea.name.readback', eq: true } }),
    { id: 'sea-name-publish', kind: 'scene', node: 'sea.name.publish', x: 15, y: 9, w: 1, h: 1, walkThrough: true,
      label: 'Sora’s holder for the new loading key', art: 'sea.margin',
      visibleIf: { all: [{ objective: 'sea.name.joined' }, { not: { flagSet: 'sea.name.layout' } }] } },
    chartNote('sea-name-rail', 15, 9, 'the complete key on Market Rail', 'sea.shore-chart',
      'Glint is the vessel. Salt Step is the ledge straight along the rail. Leave the next load on the shelf there. Lantern House keeps the source for each name.',
      { flag: 'sea.name.readback', visibleIf: { flag: 'sea.name.layout', eq: 'rail' } }),
    chartNote('sea-name-skiff', 24, 10, 'the Salt Step strip by the skiff', 'sea.shoal-chart',
      'Follow the rail to the ledge at Salt Step and leave the crate on the shelf. The name line for Glint and the museum record stay in Lantern House.',
      { flag: 'sea.name.readback', visibleIf: { flag: 'sea.name.layout', eq: 'skiff' } }),
  ],
  lights: [
    { x: 7, y: 6, r: 57, color: 0xf5ce98 }, { x: 14, y: 8, r: 62, color: 0xf6d8a8 },
    { x: 18, y: 11, r: 72, color: 0xc1e3e0 }, { x: 24, y: 12, r: 52, color: 0x91c6d3 },
    { x: 12, y: 15, r: 55, color: 0xa8d6d8 },
  ],
};

const chartroomWidth = 26;
const chartroomHeight = 16;

function chartroomFloor(x: number, y: number): string | null {
  if (x < 1 || y < 0 || x >= chartroomWidth - 1 || y >= chartroomHeight) return null;
  if (y === 0) return 'wall-top';
  if (y === 1) return 'wall-mid';
  if (y === 2) return 'wall-base';
  return 'stone-c';
}

export const SEA_CHARTROOM: MapDef = {
  id: 'sea.chartroom', name: 'Cartographers’ Sea: Lantern House', world: 'WORLD-09',
  width: chartroomWidth, height: chartroomHeight, music: 'music.archive', ambience: 'study',
  background: 0x2b3742, floor: chartroomFloor,
  spawn: { x: 12, y: 12 }, blocks: [[1, 0, chartroomWidth - 2, 3]], zones: [],
  npcs: [{ id: 'sea-cartographer', x: 12, y: 6, facing: 'down' }],
  stamps: [
    { stamp: 'window', x: 8, y: 1 }, { stamp: 'window', x: 16, y: 1 },
    { stamp: 'bookshelf', x: 2, y: 3 }, { stamp: 'bookshelf', x: 21, y: 3 },
    { stamp: 'table', x: 5, y: 7 }, { stamp: 'long-table', x: 17, y: 7 },
    { stamp: 'bench', x: 3, y: 12 }, { stamp: 'plant-tall', x: 22, y: 12 },
    { stamp: 'rug-green', x: 11, y: 9 },
  ],
  interactables: [
    SEA_DATE_PEG_DOOR,
    ...THREAD_BEND_CHARTROOM,
    ...SEA_CALLBOARD_RETURNS,
    SEA_RELAY_ENTRANCE, SEA_RELAY_CHART_RECEIVER, TURNING_DOOR, ...TURNING_READERS,
    crossing('sea-chartroom-return', 12, 15, 'the path back to Seagrass Steps', { map: 'sea.harbour', x: 7, y: 6 }),
    crossing('sea-chartroom-to-shoal', 24, 8, 'the lower skiff stair to Shoal Shelf', { map: 'sea.shoal', x: 6, y: 8 }, 'sea.skiff'),
    { id: 'sea-name-canoe', kind: 'exhibit', exhibit: 'OBJ-SEA-RRA-00001826', x: 9, y: 5, w: 1, h: 1, walkThrough: true,
      label: 'the museum record for Rra-Kalwanyimara', art: 'sea.dugout-diagram' },
    { id: 'sea-name-desk', kind: 'scene', node: 'sea.name.join', x: 13, y: 8, w: 1, h: 1, walkThrough: true,
      label: 'the boat token and the fixed step', art: 'sea.margin',
      visibleIf: { all: [{ objective: 'sea.name.sources' }, { not: { objective: 'sea.name.joined' } }] } },
    chartNote('sea-name-lines', 13, 8, 'the name and the direction on two rails', 'sea.margin',
      'The left shelf names the museum canoe and its makers. The right chart tracks Glint as a moveable token beside the fixed ledge at Salt Step. The two records have their own context.',
      { visibleIf: { objective: 'sea.name.joined' } }),
    chartNote('sea-routebook', 8, 7, 'the local route book', 'ledger',
      'Market carriers use the Seagrass Steps and the rail beside the stalls. The boat crew uses Lantern House as a sight point. Local keepers call the marked shelf Shoal Shelf. A named place guides talk about a route. Each crew still checked a different patch.',
      { flag: 'sea.routebook' }),
    chartNote('sea-edge-draft', 15, 8, 'the printer’s draft heading', 'preserved.slip',
      'WATER CHECKED TO THE PAGE EDGE. A clerk has clipped the heading here for a chart maker to check.',
      { visibleIf: { not: { objective: 'sea.compare' } } }),
    chartNote('sea-edge-correction', 15, 8, 'the checked draft heading', 'preserved.slip',
      'WATER CHECKED IN ONE STRIP. The survey line stops before the page edge. The unmarked part stays open.',
      { visibleIf: { objective: 'sea.compare' } }),
    // Tupaia's chart (KG-CH8-I02, X-006). Content and sources: src/content/sea-tupaia.json.
    { id: 'sea-tupaia-navigator', kind: 'scene', node: 'sea.tupaia.navigator', x: 12, y: 4, w: 1, h: 1, walkThrough: true,
      label: 'the shelf about Tupaia of Ra’iātea', art: 'preserved.folder', visibleIf: { flagSet: 'sea.response' } },
    { id: 'sea-tupaia-chart', kind: 'scene', node: 'sea.tupaia.chart', x: 15, y: 4, w: 1, h: 1, walkThrough: true,
      label: 'the copy of Tupaia’s chart under glass', art: 'sea.shore-chart', visibleIf: { flagSet: 'sea.response' } },
    { id: 'sea-tupaia-reading', kind: 'scene', node: 'sea.tupaia.reading', x: 22, y: 8, w: 1, h: 1, walkThrough: true,
      label: 'two papers that disagree about the chart', art: 'preserved.display-paired', visibleIf: { flagSet: 'sea.response' } },
    { id: 'sea-tupaia-desk', kind: 'scene', node: 'sea.tupaia.desk', x: 17, y: 10, w: 1, h: 1, walkThrough: true,
      label: 'the blank label for Tupaia’s chart', art: 'sea.margin', visibleIf: { all: [{ flagSet: 'sea.response' }, { not: { flagSet: 'sea.tupaia.label' } }] } },
    chartNote('sea-tupaia-card', 17, 10, 'the label for Tupaia’s chart', 'sea.margin',
      'The label under Tupaia’s chart names him, says where its sources come from, and says how its first readers misread it.',
      { visibleIf: { flagSet: 'sea.tupaia.label' } }),
    // Marshall Islands stick charts (KG-CH8-I01, X-006). Content and sources: src/content/sea-stick-charts.json.
    { id: 'sea-stick-kinds', kind: 'scene', node: 'sea.stick.kinds', x: 5, y: 4, w: 1, h: 1, walkThrough: true,
      label: 'the stick chart shelf', art: 'sea.margin', visibleIf: { flagSet: 'sea.response' } },
    { id: 'sea-stick-voyage', kind: 'scene', node: 'sea.stick.voyage', x: 18, y: 4, w: 1, h: 1, walkThrough: true,
      label: 'the voyage folder from the Marshall Islands', art: 'preserved.folder', visibleIf: { flagSet: 'sea.response' } },
    { id: 'sea-stick-held', kind: 'scene', node: 'sea.stick.held', x: 20, y: 6, w: 1, h: 1, walkThrough: true,
      label: 'the letter clipped to the case', art: 'preserved.slip', visibleIf: { flagSet: 'sea.response' } },
    { id: 'sea-stick-desk', kind: 'scene', node: 'sea.stick.desk', x: 7, y: 9, w: 1, h: 1, walkThrough: true,
      label: 'Renna’s blank display card', art: 'sea.margin', visibleIf: { all: [{ flagSet: 'sea.response' }, { not: { flagSet: 'sea.stick.label' } }] } },
    chartNote('sea-stick-card', 7, 9, 'the stick chart display card', 'sea.margin',
      'The card under the stick chart says what the chart is for, where its sources come from, and that some of this knowledge is held by Marshallese navigators.',
      { visibleIf: { flagSet: 'sea.stick.label' } }),
    { id: 'sea-symbol-desk', kind: 'scene', node: 'sea.symbol.desk', x: 10, y: 7, w: 1, h: 1,
      label: 'Renna’s same-sheet symbol desk', art: 'sea.margin', walkThrough: true,
      artBy: { flag: 'sea.symbol.last', keys: { roof: 'sea.shore-chart', lights: 'sea.shoal-chart' } },
      visibleIf: { objective: 'sea.finish' } },
  ],
  lights: [
    { x: 12, y: 6, r: 77, color: 0xffdeaf }, { x: 8, y: 7, r: 55, color: 0xc8ded4 },
    { x: 20, y: 8, r: 56, color: 0xafdce3 },
  ],
};

const shoalWidth = 29;
const shoalHeight = 18;
const rimPointed: Condition = { flag: 'sea.frog.rim.pointed', eq: true };
const rimChecked: Condition = { flag: 'sea.frog.rim.checked', eq: true };
const staffChecked: Condition = { flag: 'sea.frog.staff.checked', eq: true };

function seepProp(id: string, x: number, y: number, label: string, art: string, node: string,
  after?: Interactable['artOpen'], visibleIf: Condition = { objective: 'sea.arrival' }): Interactable {
  return { id, kind: 'scene', x, y, w: 1, h: 1, label, art, node, walkThrough: true, artOpen: after, visibleIf };
}

function shoalFloor(x: number, y: number): string | null {
  if (x < 0 || y < 0 || x >= shoalWidth || y >= shoalHeight) return null;
  const channel = y >= 5 && y <= 15 && x >= 10 && x <= 12;
  const crossingPlanks = (y >= 8 && y <= 9) || (y >= 12 && y <= 13);
  if (channel && !crossingPlanks) return null;
  if (x < 2 || x > 25 || y < 2 || y > 15) return null;
  if (crossingPlanks || (x >= 14 && x <= 21 && y >= 5 && y <= 11)) return 'stone-c';
  return 'grass';
}

export const SEA_SHOAL: MapDef = {
  id: 'sea.shoal', name: 'Cartographers’ Sea: Shoal Shelf', world: 'WORLD-09',
  width: shoalWidth, height: shoalHeight, music: 'music.town', ambience: 'town',
  background: 0x356878, floor: shoalFloor,
  spawn: { x: 6, y: 12 }, blocks: [], npcs: SHOAL_PROOF_READERS,
  zones: [{ id: 'sea-frog-low-planks', x: 10, y: 12, w: 3, h: 2, if: staffChecked }],
  stamps: [
    { stamp: 'crates', x: 2, y: 4 }, { stamp: 'barrel', x: 7, y: 5 },
    { stamp: 'bush', x: 8, y: 10 }, { stamp: 'tree', x: 4, y: 3 }, { stamp: 'tree', x: 6, y: 13 },
    { stamp: 'tree', x: 22, y: 3 }, { stamp: 'tree', x: 24, y: 11 },
    { stamp: 'bench', x: 18, y: 10 }, { stamp: 'pot-plant', x: 24, y: 7 },
    { stamp: 'flowers-white', x: 9, y: 7 }, { stamp: 'flowers-small', x: 23, y: 7 },
  ],
  interactables: [
    SHOAL_PROOF_DOOR, SHOAL_PROOF_LOWER, SHOAL_PROOF_UPPER, SHORE_REPLY_DOOR,
    seepProp('sea-frog-rim-check', 8, 6, 'the freshwater rim above the reed hollow',
      'stiltfrog.rim-hidden', 'sea.frog.rim', { key: 'stiltfrog.rim', if: rimPointed }),
    seepProp('sea-frog-staff', 8, 14, 'Sora’s fixed staff by the south planks',
      'stiltfrog.tide-staff', 'sea.frog.staff', { key: 'stiltfrog.staff-checked', if: staffChecked }),
    { ...crossing('sea-frog-rim-cross', 9, 5, 'the marked dry rim above the reeds',
      { map: 'sea.shoal', x: 14, y: 5 }, 'stiltfrog.rim'), walkThrough: true, visibleIf: rimPointed, openIf: rimChecked,
      text: 'The frog showed this rim from its height. Use the keeper’s rod to check both seats before crossing.',
      flag: 'sea.frog.rim.crossed' },
    { ...crossing('sea-frog-rim-back', 14, 4, 'the dry rim back to the west bank',
      { map: 'sea.shoal', x: 8, y: 5 }, 'stiltfrog.rim'), walkThrough: true, visibleIf: rimChecked },
    seepProp('sea-frog-upper', 17, 5, 'the single-person view above the reed lip',
      'stiltfrog.window-high', 'sea.frog.watch.upper',
      { key: 'stiltfrog.sight-upper', if: { flag: 'sea.frog.read.upper', eq: true } }, { flag: 'sea.frog.rim.crossed', eq: true }),
    seepProp('sea-frog-lower', 18, 13, 'the two-person view at the low shoulder',
      'stiltfrog.window-low', 'sea.frog.watch.lower', { key: 'stiltfrog.sight-lower', if: { flag: 'sea.frog.read.lower', eq: true } }),
    crossing('sea-shoal-return', 4, 12, 'the skiff back to Seagrass Steps', { map: 'sea.harbour', x: 23, y: 12 }, 'sea.skiff'),
    crossing('sea-shoal-to-chartroom', 5, 6, 'the skiff to the Lantern House stair', { map: 'sea.chartroom', x: 23, y: 8 }, 'sea.skiff'),
    { id: 'sea-chart-shoal', kind: 'sea-chart', node: 'shoal', x: 16, y: 8, w: 1, h: 1,
      label: 'the Shoal Shelf survey chart', art: 'sea.shoal-chart' },
    chartNote('sea-shoal-directory', 8, 12, 'the Shoal Shelf crossings sign', 'sea.waypost',
      'Shoal Shelf. Both plank crossings lead to the survey board. The south skiff goes to Seagrass Steps. The north skiff reaches Lantern House.'),
    chartNote('sea-name-crew', 18, 8, 'the crew’s movable Glint marker', 'sea.skiff',
      'Glint is painted inside our skiff. I take its token when we change moorings. The crew leaves Salt Step on the load sheet so another porter knows where to set down. —Deck hand',
      { flag: 'sea.name.crew' }),
  ],
  lights: [
    { x: 4, y: 12, r: 63, color: 0xf3d8a5 }, { x: 12, y: 9, r: 66, color: 0xa5d6df },
    { x: 16, y: 8, r: 72, color: 0xcbe3d9 },
  ],
};
