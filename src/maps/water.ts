/** Water Commons. The allocation records and gate experiment are fictional. */
import type { Condition } from '../domain/types';
import { reliefReading, reliefRouting } from '../domain/routeTiles';
import { WATER_APPEAL_LOWER, WATER_APPEAL_WITNESSES, WATER_APPEAL_YARD } from './civicAppeal';
import { WATER_FITTING_BENCHES } from './fittingViews';
import { WATER_LATCH_DOOR } from './latchCheck';
import { COUNCIL_BOUNDARY, LOWER_BOUNDARY, UPPER_BOUNDARY } from './serviceBoundary';
import type { Interactable, MapDef } from './types';

function crossing(id: string, x: number, y: number, label: string, to: NonNullable<Interactable['to']>, art = 'water.waypost'): Interactable {
  return { id, kind: 'door', x, y, w: 1, h: 1, label, to, art };
}

function sign(id: string, x: number, y: number, label: string, art: string, text: string,
  options: { flag?: string; visibleIf?: Condition } = {}): Interactable {
  return { id, kind: 'sign', x, y, w: 1, h: 1, label, art, text, walkThrough: true, ...options };
}

function ground(width: number, height: number, tile: (x: number, y: number) => string) {
  return (x: number, y: number) => x < 1 || y < 0 || x >= width - 1 || y >= height ? null : tile(x, y);
}

const ripples = ['water-ripple-a', 'water-ripple-b', 'water-ripple-c'];
const repaired: Condition = { flag: 'water.repaired', eq: true };
const reliefAvailable: Condition = { objective: 'water.finish' };
const reliefChoice = (route: 'first' | 'second'): Condition => ({ flag: 'water.routing.layout', eq: route });
const observerNotebook: Condition = { all: [
  { objective: 'water.arrival' }, { flag: 'perspective.active', eq: 'observer-notebook' },
] };
const lowerCheck: Condition = { all: [observerNotebook, { flag: 'water.observer.blocked', eq: true }] };
const observerNote = (layout: 'paired' | 'local'): Condition => ({ flag: 'water.observer.layout', eq: layout });
const observerPath: Condition = { all: [observerNotebook, { flagSet: 'water.observer.layout' }] };
const counterReady: Condition = { all: [{ objective: 'water.arrival' }, { objective: 'forest.counter.finish' }] };
const counterDisplay = (layout: 'marker' | 'ledger'): Condition => ({ flag: 'water.counter.layout', eq: layout });

function observerScene(id: string, x: number, y: number, label: string,
  art: string, node: string, visibleIf: Condition): Interactable {
  return { id, kind: 'scene', x, y, w: 1, h: 1, label, art, node, visibleIf, walkThrough: true };
}
const checkedSplit: Condition = { all: [
  { objective: 'water.drought' }, { flag: 'water.trial.drought.split', eq: true },
] };

export const WATER_GATEHOUSE: MapDef = {
  id: 'water.gatehouse', name: 'Water Commons: Old Weir', world: 'WORLD-12',
  width: 31, height: 20, music: 'music.town', ambience: 'town', background: 0x28444d,
  floor: ground(31, 20, (x, y) => {
    const bridge = (y >= 9 && y <= 10) || (y >= 13 && y <= 14);
    if (x >= 18 && x <= 20) return bridge ? 'water-bridge' : ripples[(x + y) % ripples.length];
    const path = (x >= 11 && x <= 16 && y >= 7) || ((bridge || y === 8) && x >= 7 && x <= 26);
    return path ? 'water-path' : 'water-bank';
  }),
  blocks: [[18, 0, 3, 9], [18, 11, 3, 2], [18, 15, 3, 5]], zones: [],
  spawn: { x: 12, y: 12 },
  npcs: [{ id: 'water-keeper', x: 13, y: 7, facing: 'down' }],
  stamps: [
    { stamp: 'water-weir', x: 16, y: 3 }, { stamp: 'market-home', x: 7, y: 2 },
    { stamp: 'water-lantern', x: 12, y: 6 }, { stamp: 'water-lantern', x: 23, y: 11 },
    { stamp: 'water-gauge', x: 17, y: 11 }, { stamp: 'water-gauge', x: 21, y: 11 },
    { stamp: 'tree', x: 3, y: 4 }, { stamp: 'tree', x: 26, y: 3 }, { stamp: 'tree', x: 6, y: 15 },
    { stamp: 'bench', x: 5, y: 10 }, { stamp: 'crates', x: 25, y: 10 },
    { stamp: 'water-terrace-wall', x: 3, y: 14 }, { stamp: 'water-terrace-wall', x: 24, y: 16 },
  ],
  interactables: [
    ...WATER_FITTING_BENCHES,
    WATER_LATCH_DOOR,
    ...UPPER_BOUNDARY,
    crossing('water-council-path', 24, 7, 'the path to the council yard', { map: 'water.council', x: 12, y: 13 }),
    crossing('water-lower-path', 25, 14, 'the lower path past the fields', { map: 'water.lower-channel', x: 5, y: 12 }),
    crossing('water-nexus-return', 12, 17, 'the crossing back to the Nexus', { map: 'nexus.archive', x: 24, y: 11 }, 'preserved.door'),
    { id: 'water-gate', kind: 'water-gate', x: 16, y: 8, w: 1, h: 1, label: 'the gate lever',
      art: 'water.lever', artOpen: { key: 'water.lever-repaired', if: repaired } },
    { id: 'water-weir-waystone', kind: 'waystone', x: 8, y: 13, w: 1, h: 1,
      label: 'the Old Weir Waystone', place: 'the Old Weir', art: 'waystone' },
    // The long mystery (docs/STORY_BIBLE.md section 7): the old Harrowmere weir label, found here.
    { id: 'harrowmere-order', kind: 'sign', x: 9, y: 7, w: 1, h: 1, label: 'an old drawer under the gate-house window', art: 'ledger',
      flag: 'harrowmere.found', visibleIf: { objective: 'water.drought' },
      text: "Under a stack of drought orders is a much older card, in the Nexus style. 'WEIR AT HARROWMERE. This weir is safe in all floods.' The Nexus mark is in the corner, and a signature: I. Marrow. Under the main line, someone scraped a second line away. Lumen holds a little light close. You can read three words: 'tested only in...'. Weirkeeper Omi, behind you, says nothing for a long time." },
    sign('water-weir-directory', 10, 11, 'the weir path sign', 'water.waypost',
      'The gate lever is by the upper crossing. The council yard lies east of that crossing. The lower path goes to the seed rows and channel marker.'),
    sign('water-draft-split', 15, 10, 'the draft split claim', 'preserved.slip',
      'SPLIT KEEPS ALL TWELVE IN THE CHANNELS. The tally on the draft is blank.',
      { flag: 'water.draft.read', visibleIf: { not: checkedSplit } }),
    sign('water-checked-split', 15, 10, 'the checked split tally', 'water.split',
      'At the drought gate, the split sent five buckets to each branch and lost two at the gate. The draft stays behind this tally so readers can compare.',
      { flag: 'water.checked.read', visibleIf: checkedSplit }),
    sign('water-repair-mark', 15, 6, 'the checked repair mark', 'water.notice',
      'The keeper checked the repaired gate. A fresh tally starts here. Keep the drought readings on the previous page.',
      { visibleIf: repaired }),
    { id: 'water-relief-bench', kind: 'fieldgame', game: 'relief-routing', x: 10, y: 9, w: 1, h: 1,
      label: 'Omi’s relief bench', art: 'water.split', walkThrough: true, visibleIf: reliefAvailable },
    observerScene('water-observer-upper', 14, 12, 'the clear space above the upper peg', 'water.notice',
      'water.observer.upper', observerNotebook),
    sign('water-counter-upper-slip', 11, 7, 'Omi’s rehearsal slip and the council copy', 'preserved.display-paired',
      'At the first rehearsal Omi saw zero buckets pass the spill line from the upper rail. Sena brought the number on a copy of Omi’s slip. The mark for its origin stayed the same.',
      { flag: 'water.counter.source.first', visibleIf: counterReady }),
    sign('water-observer-upper-copy', 15, 14, 'the upper peg’s local note', 'preserved.slip',
      'Omi’s noon peg, three notch intervals from its own foot. The checked lower view and its date sit with the crew that took it.',
      { visibleIf: observerNote('local') }),
  ],
  lights: [
    { x: 13, y: 7, r: 72, color: 0xf6dbaa }, { x: 16, y: 8, r: 76, color: 0xcee2cc },
    { x: 19, y: 10, r: 54, color: 0x9ec7c9 }, { x: 12, y: 15, r: 54, color: 0xc5d0aa },
  ],
};

const droughtDisplays = [
  ['fields', 'the drought record for the seed rows',
    'Drought trial. Seven buckets reached the rows and three reached the lower channel. The rows have one above their work card. The lower crew is two short of its daily line.'],
  ['split', 'the drought record for the two channels',
    'Drought trial. Five buckets reached each branch. The lower crew met its daily line. The farm is one bucket short of its work card.'],
  ['channel', 'the drought record for the lower channel',
    'Drought trial. Three buckets reached the rows and seven reached the lower channel. The lower crew can hold two in reserve. The farm is three short of its work card.'],
] as const;

const repairedDisplays = [
  ['fields', 'the corrected repair record for the rows',
    'Repair trial. Seven buckets went to the rows and five to the lower channel. Both daily notes are within that count. The drought record keeps its own limits.'],
  ['split', 'the corrected repair record for the two channels',
    'Repair trial. Five went to the rows and seven to the lower channel. The farm has one bucket less than its work card. The lower crew has two above its usual mark. The drought entry stays on its own line.'],
  ['channel', 'the corrected repair record for the lower channel',
    'Repair trial. Three went to the rows and nine to the lower channel. The farm delays three buckets of its work card. The lower crew can hold four in reserve.'],
] as const;

export const WATER_COUNCIL: MapDef = {
  id: 'water.council', name: 'Water Commons: Council Yard', world: 'WORLD-12',
  width: 26, height: 16, music: 'music.town', ambience: 'town', background: 0x444b4a,
  floor: ground(26, 16, (x, y) => (y >= 5 && y <= 12) || (x >= 10 && x <= 14) ? 'water-path' : 'water-bank'),
  blocks: [], zones: [], spawn: { x: 12, y: 13 },
  npcs: [{ id: 'water-scribe', x: 11, y: 8, facing: 'down' }],
  stamps: [
    { stamp: 'water-council-hall', x: 10, y: 1 }, { stamp: 'water-banner', x: 7, y: 5 },
    { stamp: 'water-banner', x: 18, y: 5 }, { stamp: 'market-bench', x: 4, y: 9 },
    { stamp: 'market-bench', x: 18, y: 12 }, { stamp: 'market-planter', x: 6, y: 3 },
    { stamp: 'market-planter', x: 18, y: 3 }, { stamp: 'water-lantern', x: 12, y: 11 },
    { stamp: 'tree', x: 1, y: 2 }, { stamp: 'tree', x: 22, y: 3 },
  ],
  interactables: [
    ...COUNCIL_BOUNDARY,
    crossing('water-council-return', 12, 15, 'the path back to the Old Weir', { map: 'water.gatehouse', x: 23, y: 8 }),
    crossing('water-council-to-lower', 23, 10, 'the council steps to the lower path', { map: 'water.lower-channel', x: 23, y: 6 }),
    { ...crossing('water-observer-council-track', 7, 9, 'the marked observer track to the lower bank', { map: 'water.lower-channel', x: 25, y: 14 }),
      visibleIf: observerPath, walkThrough: true, flag: 'water.observer.crossed' },
    observerScene('water-observer-board', 14, 9, 'Sena’s two-peg copy board', 'preserved.display-records',
      'water.observer.board', { all: [observerNotebook, { objective: 'water.observer.readings' }] }),
    { id: 'water-counter-bench', kind: 'fieldgame', game: 'water-counter', x: 5, y: 6, w: 1, h: 1,
      label: 'Sena’s three-messenger counter', art: 'water.split', walkThrough: true, visibleIf: counterReady },
    sign('water-counter-ledger', 7, 11, 'the crew’s source-and-runner docket', 'preserved.display-records',
      'The two checks from the first rehearsal keep their own observers. Sena’s envelope belongs with Omi’s upper check. The after-bell record is still open. The lower crew can bring its next slip to this docket.',
      { flag: 'water.counter.seen.ledger', visibleIf: counterDisplay('ledger') }),
    sign('water-observer-paired-sight', 8, 7, 'the paired noon peg copy', 'preserved.display-paired',
      'Both readings belong to the noon bell. The upper peg showed three intervals from its own foot. The high step showed two intervals at the lower peg. Each peg keeps its own base and viewing position.',
      { visibleIf: { all: [observerNote('paired'), { flag: 'water.observer.lower', eq: 'sight' }] } }),
    sign('water-observer-paired-handover', 8, 7, 'the paired copy with different bells', 'preserved.display-paired',
      'Omi’s upper peg gives three intervals at noon. The lower keeper’s handover gives two at the previous bell. Its noon square stays blank. Keep the times and the people who checked them with the readings.',
      { visibleIf: { all: [observerNote('paired'), { flag: 'water.observer.lower', eq: 'handover' }] } }),
    ...droughtDisplays.map(([setting, label, text]) => sign(
      'water-result-' + setting, 12, 6, label, 'water.' + setting, text,
      { visibleIf: { flag: 'water.response', eq: setting } },
    )),
    ...repairedDisplays.map(([setting, label, text]) => sign(
      'water-revised-' + setting, 16, 8, label, 'water.' + setting, text,
      { visibleIf: { flag: 'water.revision', eq: setting } },
    )),
    sign('water-repair-note', 19, 10, 'the repair crew’s note', 'preserved.folder',
      'The gate lost two buckets during the drought trial. The crew sealed the leak and asked the keeper to check it before a new tally.',
      { flag: 'water.repair.read', visibleIf: { objective: 'water.publish' } }),
    sign('water-contested-slip', 16, 11, 'the draft heading over the drought entry', 'preserved.slip',
      'Draft heading. WE AGREED TO KEEP BOTH DAILY MARKS. Someone has pinned this above the original drought entry. The original allocation below records one setting for that day.',
      { flag: 'water.claim.read', visibleIf: repaired }),
    sign('water-register-copy', 6, 12, 'the larger register copy', 'preserved.display-records',
      'The drought and repair entries have separate columns. Each keeps the seed-row card and the lower channel line in reach. The old heading stays beside the checked wording.',
      { visibleIf: { flag: 'water.register-copy', eq: true } }),
    ...WATER_APPEAL_YARD,
  ],
  lights: [
    { x: 12, y: 6, r: 77, color: 0xffdfaf }, { x: 16, y: 8, r: 69, color: 0xcde0cb },
    { x: 12, y: 12, r: 52, color: 0xf4d7a7 },
  ],
};

export const WATER_LOWER_CHANNEL: MapDef = {
  id: 'water.lower-channel', name: 'Water Commons: Lower Channel and Seed Rows', world: 'WORLD-12',
  width: 29, height: 17, music: 'music.town', ambience: 'town', background: 0x355359,
  floor: ground(29, 17, (x, y) => {
    const bridge = y === 6 || y === 12;
    if (x >= 17 && x <= 18) return bridge ? 'water-bridge' : ripples[(x + y) % ripples.length];
    if (y === 6 || (y >= 11 && y <= 13) || (x >= 14 && x <= 16)) return 'water-path';
    if (x >= 6 && x <= 12 && ((y >= 3 && y <= 5) || (y >= 8 && y <= 10))) {
      return x % 2 === 0 ? 'water-field-a' : 'water-field-b';
    }
    return 'water-bank';
  }),
  blocks: [[17, 0, 2, 6], [17, 7, 2, 5], [17, 13, 2, 4]], zones: [],
  spawn: { x: 5, y: 12 }, npcs: WATER_APPEAL_WITNESSES,
  stamps: [
    { stamp: 'water-terrace-wall', x: 6, y: 1 }, { stamp: 'water-terrace-wall', x: 10, y: 1 },
    { stamp: 'water-terrace-wall', x: 6, y: 12 }, { stamp: 'water-terrace-wall', x: 10, y: 12 },
    { stamp: 'water-gauge', x: 20, y: 8 }, { stamp: 'water-lantern', x: 15, y: 10 },
    { stamp: 'market-home', x: 23, y: 9 }, { stamp: 'market-bench', x: 21, y: 13 },
    { stamp: 'tree', x: 3, y: 3 }, { stamp: 'tree', x: 23, y: 2 },
    { stamp: 'crates', x: 3, y: 8 }, { stamp: 'barrel', x: 19, y: 14 },
  ],
  interactables: [
    ...LOWER_BOUNDARY,
    { id: 'cross-sluice', kind: 'fieldgame', game: 'cross-sluice', x: 20, y: 6, w: 1, h: 1, label: 'the upper sluice gate (a crossing)', art: 'flood-post' },
    { id: 'loyalty-rook', kind: 'fieldgame', game: 'loyalty-rook', x: 10, y: 10, w: 1, h: 1, label: "an old well with a flaking gold seal (The Clean Well)", art: 'old-sign', visibleIf: { flag: 'rook.joined', eq: true } },
    crossing('water-lower-return', 3, 12, 'the upper gate path', { map: 'water.gatehouse', x: 24, y: 14 }),
    crossing('water-lower-to-council', 25, 6, 'the steps back to the council yard', { map: 'water.council', x: 22, y: 10 }),
    { ...crossing('water-observer-bank-track', 26, 14, 'the marked observer track to the council', { map: 'water.council', x: 7, y: 8 }),
      visibleIf: observerPath, walkThrough: true, flag: 'water.observer.crossed' },
    observerScene('water-observer-blocked', 22, 10, 'the reeds beside the lower peg', 'forest.screen',
      'water.observer.blocked', observerNotebook),
    observerScene('water-observer-high-step', 25, 13, 'the high step above the reeds', 'forest.ridge',
      'water.observer.sight', lowerCheck),
    observerScene('water-observer-crew-log', 5, 8, 'the lower keeper’s dated handover', 'preserved.folder',
      'water.observer.handover', lowerCheck),
    sign('water-counter-lower-slip', 22, 12, 'the lower crew’s independently written check', 'preserved.slip',
      'The lower crew watched the spill line from its own side during the rehearsal. It wrote zero buckets on its own slip before the runners met. A check after the bell is still due.',
      { flag: 'water.counter.source.second', visibleIf: counterReady }),
    sign('water-counter-marker', 27, 10, 'the pending-check marker on the bank', 'water.notice',
      'CHECK WANTED AFTER THE BELL. Someone on the lower bank can see the open slot from the path. The two earlier rehearsal slips stay in the Council Yard. This marker gives the next watcher a place to look.',
      { flag: 'water.counter.seen.marker', visibleIf: counterDisplay('marker') }),
    sign('water-observer-lower-sight-copy', 20, 10, 'the lower peg’s local noon note', 'preserved.slip',
      'From the high step the lower peg showed two intervals at noon. The figures travel with the standing place. The lower watch keeps a blank beside the view from behind the reeds.',
      { visibleIf: { all: [observerNote('local'), { flag: 'water.observer.lower', eq: 'sight' }] } }),
    sign('water-observer-lower-handover-copy', 20, 10, 'the local note from the previous bell', 'preserved.slip',
      'The handover records two intervals from the lower peg’s foot at the previous bell. The noon square stays blank for someone who can take the high step.',
      { visibleIf: { all: [observerNote('local'), { flag: 'water.observer.lower', eq: 'handover' }] } }),
    sign('water-farm-card', 7, 7, 'the seed-row work card', 'preserved.folder',
      'Today’s marked seed rows need six buckets for the work on this card. The outside rows can wait until the next count.',
      { flag: 'water.farm.note' }),
    sign('water-channel-marker', 21, 9, 'the lower channel’s use line', 'water.notice',
      'The lower crew uses five buckets as today’s channel-use line. When more arrives, they can hold some in reserve.',
      { flag: 'water.channel.note' }),
    sign('water-lower-path-sign', 15, 13, 'the lower crossing sign', 'water.waypost',
      'Follow the lower boards to the use line, or take the upper boards to the council path. The seed-row card is on the west terrace.'),
    sign('water-relief-seed-slip', 9, 7, 'the seed terrace’s relief slip', 'preserved.folder',
      'The seed crew passes a marked scoop down the row at each handover. For the small relief trial, it asks for four buckets to wet all the new beds. The old daily work card stays with the main gate records.',
      { flag: 'water.routing.source.first', visibleIf: reliefAvailable }),
    sign('water-relief-channel-slip', 24, 8, 'the lower crew’s relief slip', 'water.notice',
      'The lower crew rinses the shared troughs before passing the lane to the next households. It needs five buckets in this trial. The spare basin holds two. When it fills, later water reaches the practice bank.',
      { flag: 'water.routing.source.second', visibleIf: reliefAvailable }),
    sign('water-relief-installed-rows', 11, 8, 'the wide relief mouth at the rows', 'water.fields',
      `Omi fits the wide tile to the branch at the seed beds. The eight-bucket trial records ${reliefReading(reliefRouting(8, 'first'))}. The lower crew’s five-bucket request stays beside the new reading.`,
      { flag: 'water.routing.seen', visibleIf: reliefChoice('first') }),
    sign('water-relief-installed-channel', 22, 8, 'the wide relief mouth at the lower bank', 'water.channel',
      `Omi fits the wide tile at the lower bank. The eight-bucket trial records ${reliefReading(reliefRouting(8, 'second'))}. The seed beds’ four-bucket request stays beside the new reading.`,
      { flag: 'water.routing.seen', visibleIf: reliefChoice('second') }),
    ...WATER_APPEAL_LOWER,
  ],
  lights: [
    { x: 7, y: 7, r: 69, color: 0xffd8a7 }, { x: 21, y: 9, r: 68, color: 0xb9dcd8 },
    { x: 16, y: 12, r: 56, color: 0xc8e1bd },
  ],
};
