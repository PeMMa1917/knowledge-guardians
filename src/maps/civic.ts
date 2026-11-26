/** A fictional mobile-library route with a dispatch hall and two street stops. */
import type { Condition } from '../domain/types';
import { CIVIC_ARRIVAL_TRAYS, civicReceivingArrangements, civicReceivingLoad } from '../domain/civicArrivals';
import { civicLaneReading, civicLaneRouting, type RouteSocket } from '../domain/routeTiles';
import { CIVIC_APPEAL_CANAL, CIVIC_APPEAL_DISPATCH } from './civicAppeal';
import { CIVIC_INCENTIVE_BOARD } from './civicIncentive';
import { CIVIC_BENCH_DEBATE } from './benchDebate';
import { CIVIC_BOUNDARY } from './serviceBoundary';
import { CIVIC_DATE_REGISTER_PROPS, CIVIC_DATE_REGISTER_READERS } from './dateRegister';
import { CIVIC_CALLBOARD_DOOR } from './civicCallboard';
import { MATERIAL_CANAL_REVISIT } from './materialStores';
import { starStations } from './starPaths';
import type { Interactable, MapDef } from './types';

function door(id: string, x: number, y: number, label: string, to: NonNullable<Interactable['to']>, art = 'civic.waypost'): Interactable {
  return { id, kind: 'door', x, y, w: 1, h: 1, label, to, art };
}

function sign(id: string, x: number, y: number, label: string, art: string, text: string,
  options: { flag?: string; visibleIf?: Condition } = {}): Interactable {
  return { id, kind: 'sign', x, y, w: 1, h: 1, label, art, text, walkThrough: true, ...options };
}

function ground(width: number, height: number, tile: (x: number, y: number) => string) {
  return (x: number, y: number) => x < 1 || y < 0 || x >= width - 1 || y >= height ? null : tile(x, y);
}

const compared: Condition = { objective: 'civic.compare' };
const published: Condition = { objective: 'civic.publish' };
const revised: Condition = { flag: 'civic.revised', eq: true };
const cobbles = ['civic-cobbles-a', 'civic-cobbles-b'];
const overlapAvailable: Condition = { objective: 'civic.arrival' };
const rackReady: Condition = { objective: 'civic.overlap.trays' };
const counted: Condition = { flag: 'civic.overlap.counted', eq: true };
const arrangements = civicReceivingArrangements();
const laneAvailable: Condition = { objective: 'civic.finish' };
const laneChoice = (route: RouteSocket): Condition => ({ flag: 'civic.routing.layout', eq: route });
const recordReferral: Condition = { flagSet: 'record.edge.voices.mount' };
const recordFolio: Condition = { all: [recordReferral, { flag: 'perspective.active', eq: 'record-edge-folio' }] };
const reliefReply = (route: RouteSocket): Condition => ({ all: [
  { objective: 'water.routing.finish' }, { flag: 'water.routing.layout', eq: route },
] });

function overlapScene(id: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id, kind: 'scene', x, y, w: 1, h: 1, label, art, node: id, walkThrough: true, visibleIf };
}

function trayProps(tray: keyof typeof CIVIC_ARRIVAL_TRAYS, x: number, y: number): Interactable[] {
  const id = `civic-overlap-${tray}`;
  const label = `the ${tray} receiving tray`;
  const opened: Condition = { flag: `civic.overlap.${tray}`, eq: true };
  const marks = CIVIC_ARRIVAL_TRAYS[tray];
  const { waiting, free } = civicReceivingLoad(marks);
  return [
    overlapScene(id, x, y, label, 'civic.ledger', { all: [overlapAvailable, { not: opened }] }),
    sign(`${id}-loaded`, x, y, label, 'civic.notice',
      `Three loads arrived at marks ${marks.join(', ')}. Loads waiting ${waiting}. Empty marks ${free}.`,
      { visibleIf: { all: [overlapAvailable, opened] } }),
  ];
}

export const CIVIC_DISPATCH: MapDef = {
  id: 'civic.dispatch', name: 'Civic Machine: Library Dispatch', world: 'WORLD-13',
  width: 29, height: 18, music: 'music.archive', ambience: 'study', background: 0x243a46,
  floor: ground(29, 18, (x, y) => {
    if (y < 3) return y === 0 ? 'wall-top' : y === 1 ? 'wall-mid' : 'wall-base';
    return (x >= 11 && x <= 17) || (y >= 10 && y <= 13) ? 'civic-hall-route' : 'civic-hall-tile';
  }),
  blocks: [[1, 0, 27, 3]], zones: [], spawn: { x: 12, y: 12 },
  npcs: [{ id: 'civic-operator', x: 13, y: 7, facing: 'down' }, ...CIVIC_DATE_REGISTER_READERS],
  stamps: [
    { stamp: 'civic-route-wall', x: 11, y: 2 }, { stamp: 'civic-bookcases', x: 3, y: 3 },
    { stamp: 'civic-bookcases', x: 22, y: 3 }, { stamp: 'civic-cart', x: 6, y: 7 },
    { stamp: 'civic-cart', x: 21, y: 7 }, { stamp: 'window', x: 7, y: 1 },
    { stamp: 'window', x: 20, y: 1 }, { stamp: 'bench', x: 5, y: 13 },
    { stamp: 'bench', x: 20, y: 13 }, { stamp: 'plant-tall', x: 10, y: 14 },
    { stamp: 'plant-tall', x: 16, y: 14 },
  ],
  interactables: [
    ...starStations('oracle', [20, 14], [21, 14]),
    ...CIVIC_DATE_REGISTER_PROPS,
    CIVIC_CALLBOARD_DOOR,
    door('civic-steps-path', 3, 11, 'the west passage to North Steps', { map: 'civic.steps', x: 12, y: 14 }),
    door('civic-canal-path', 25, 11, 'the east passage to Canal Walk', { map: 'civic.canal', x: 5, y: 10 }),
    door('civic-nexus-return', 13, 16, 'the crossing back to the Nexus', { map: 'nexus.archive', x: 28, y: 12 }, 'preserved.door'),
    { id: 'civic-console', kind: 'civic-console', x: 15, y: 9, w: 1, h: 1, label: 'the route console', art: 'civic.console' },
    { id: 'civic-dispatch-waystone', kind: 'waystone', x: 9, y: 12, w: 1, h: 1,
      label: 'the Library Dispatch Waystone', place: 'Library Dispatch', art: 'waystone' },
    sign('civic-dispatch-directory', 12, 10, 'the dispatch directory', 'civic.waypost',
      'North Steps has the public desk to the west. Canal Walk keeps the walking crew’s slip to the east. Ade has the loaded route console in the middle.'),
    ...trayProps('red', 7, 10),
    ...trayProps('blue', 20, 11),
    overlapScene('civic-overlap-rack', 17, 12, 'the four-mark counting rack', 'civic.rank',
      { all: [rackReady, { not: counted }] }),
    sign('civic-overlap-count', 17, 12, 'the filled counting rack', 'civic.even',
      `Every courier in the trial chose among four marks equally and made their own draw. The rack has ${arrangements.all} ordered arrivals. The separate-mark rows use four first choices, three second choices and two last choices. That's ${arrangements.separate} separate and ${arrangements.shared} with a shared mark.`,
      { visibleIf: counted }),
    overlapScene('civic-overlap-plan', 19, 6, 'the practice dispatch board', 'civic.wide',
      { all: [{ objective: 'civic.overlap.evidence' }, { not: { flagSet: 'civic.overlap.layout' } }] }),
    { id: 'civic-route-tiles', kind: 'fieldgame', game: 'civic-lane-routing', x: 18, y: 9, w: 1, h: 1,
      label: 'Ade’s two-stop lane board', art: 'civic.reserve', walkThrough: true, visibleIf: laneAvailable },
    sign('civic-routing-water-rows', 17, 6, 'Omi’s relief note from the rows', 'water.fields',
      'You widened the seed route at the weir. Ade has hung the lower crew’s unmet request beside the count. The lane board has the same spare-piece constraint. Its readers can tell Ade whether a route and a time fit.',
      { visibleIf: reliefReply('first') }),
    sign('civic-routing-water-channel', 17, 6, 'Omi’s relief note from the lower channel', 'water.channel',
      'You widened the lower route at the weir. Ade has hung the seed rows’ unmet request beside the count. The lane board has the same spare-piece constraint. Its readers can tell Ade whether a route and a time fit.',
      { visibleIf: reliefReply('second') }),
    { id: 'civic-edge-wea-case', kind: 'exhibit', exhibit: 'OBJ-EDGE-WEA', x: 5, y: 6, w: 1, h: 1,
      label: 'the separate Wea convention', art: 'civic.ledger', visibleIf: recordReferral },
    { id: 'civic-edge-wea-stand', kind: 'scene', node: 'record.edge.wea', x: 5, y: 7, w: 1, h: 1,
      label: 'the stand for the two treaty dates', art: 'preserved.folder', walkThrough: true, visibleIf: recordFolio,
      artOpen: { key: 'preserved.display-paired', if: { flag: 'record.edge.wea', eq: true } } },
    { id: 'civic-edge-place', kind: 'scene', node: 'record.edge.post', x: 11, y: 14, w: 1, h: 1,
      label: 'Lin’s stand for the source copies', art: 'civic.notice', walkThrough: true,
      visibleIf: { all: [recordFolio, { objective: 'record.edge.civic.compare' }, { not: { flagSet: 'record.edge.civic.mount' } }] } },
    ...CIVIC_APPEAL_DISPATCH,
  ],
  lights: [
    { x: 13, y: 7, r: 85, color: 0xe5bd87 }, { x: 15, y: 9, r: 68, color: 0xc3dfda },
    { x: 3, y: 11, r: 54, color: 0xf4cc99 }, { x: 25, y: 11, r: 54, color: 0xafdae1 },
    { x: 13, y: 15, r: 50, color: 0xaececb },
  ],
};

const windowResults = [
  ['rank', 'the rank rule timetable',
    'North Steps has zero windows. Canal Walk has four. The rank rule sent them to the district with the higher recorded count, 16 to 15. Times and exact stops are open.'],
  ['reserve', 'the reserve rule timetable',
    'North Steps has one window. Canal Walk has three. Each district had a starting window. The other two went to the larger recorded count. Times and exact stops are open.'],
  ['even', 'the equal rule timetable',
    'North Steps and Canal Walk each have two windows. An equal timetable uses the same number for each district. Times and exact stops are open.'],
] as const;

export const CIVIC_STEPS: MapDef = {
  id: 'civic.steps', name: 'Civic Machine: North Steps', world: 'WORLD-13',
  width: 28, height: 17, music: 'music.town', ambience: 'town', background: 0x3e4446,
  floor: ground(28, 17, (x, y) => {
    if ((y === 5 || y === 6) && (x < 10 || x > 14)) return 'civic-riser';
    if ((x >= 10 && x <= 14) || y === 12 || y === 13) return 'civic-kerb';
    return cobbles[(y + Math.floor(x / 2)) % cobbles.length];
  }),
  blocks: [], zones: [], spawn: { x: 12, y: 14 },
  npcs: [{ id: 'civic-clerk', x: 11, y: 8, facing: 'down' }],
  stamps: [
    { stamp: 'civic-steps-office', x: 10, y: 1 }, { stamp: 'civic-steps-office', x: 21, y: 1 },
    { stamp: 'market-home', x: 2, y: 1 }, { stamp: 'civic-cart', x: 5, y: 9 },
    { stamp: 'civic-stand', x: 15, y: 5 }, { stamp: 'civic-stand', x: 19, y: 9 },
    { stamp: 'civic-lamp', x: 7, y: 7 }, { stamp: 'civic-lamp', x: 22, y: 9 },
    { stamp: 'bench', x: 3, y: 13 }, { stamp: 'market-planter', x: 16, y: 13 },
    { stamp: 'market-planter', x: 4, y: 5 },
  ],
  interactables: [
    CIVIC_INCENTIVE_BOARD,
    ...CIVIC_BENCH_DEBATE,
    ...CIVIC_BOUNDARY,
    { id: 'cross-name-box', kind: 'fieldgame', game: 'cross-name-box', x: 19, y: 5, w: 1, h: 1, label: 'the gate machine (a crossing)', art: 'board-stand' },
    door('civic-steps-return', 12, 16, 'the west passage back to Library Dispatch', { map: 'civic.dispatch', x: 4, y: 11 }),
    door('civic-steps-to-canal', 25, 12, 'the street to Canal Walk', { map: 'civic.canal', x: 23, y: 9 }),
    sign('civic-desk-slip', 10, 7, 'the desk-hours request slip', 'civic.ledger',
      'Desk-hours forms. Twelve confirmed requests at North Steps and five at Canal Walk. Each of these forms came from the desk while it was open.',
      { flag: 'civic.desk.read' }),
    sign('civic-ledger-draft', 7, 12, 'the draft claim above the ledger', 'preserved.slip',
      'THE DESK COUNT COVERS EVERY REQUEST. The draft was pinned before the walking crew brought in its slip.',
      { visibleIf: { not: compared } }),
    sign('civic-ledger-checked', 7, 12, 'the checked ledger heading', 'civic.ledger',
      'Seventeen recorded at the desk. Fourteen more from the walking round after repeats were set aside. The two slips still have their own collection dates and places.',
      { visibleIf: compared }),
    ...windowResults.map(([rule, label, copy]) => sign('civic-result-' + rule, 16, 8, label, 'civic.' + rule, copy,
      { visibleIf: { flag: 'civic.response', eq: rule } })),
    sign('civic-revised', 20, 12, 'the provisional timetable with its next check', 'civic.notice',
      'These window counts are provisional. The next check will collect useful times and reachable stop locations. The existing request counts have their own dates.',
      { visibleIf: revised }),
    sign('civic-wide-notice', 4, 12, 'the large timetable copy at the bench', 'civic.wide',
      'An enlarged copy puts the two districts on separate lines. The provisional window counts are easy to find, and the dated slips are still beside them.',
      { visibleIf: { flag: 'civic.wide-notice', eq: true } }),
    sign('civic-overlap-stagger', 7, 9, 'the staggered practice board', 'civic.even',
      'The practice dispatch assigns three couriers to separate marks. All three loads fit if everyone can use their assigned mark. A spare mark stays open for a courier whose shift pattern changes.',
      { flag: 'civic.overlap.seen', visibleIf: { flag: 'civic.overlap.layout', eq: 'stagger' } }),
    sign('civic-routing-steps-slip', 5, 7, 'the North Steps stair and ramp slip', 'civic.ledger',
      'The school families meet below North Steps at the pick-up bell. They sent four practice requests. Two people can use either lane. Two ask for a step-free approach before the bell. The stop has three trial places.',
      { flag: 'civic.routing.source.first', visibleIf: laneAvailable }),
    sign('civic-routing-steps-ramp', 19, 7, 'the ramp and trial notice at North Steps', 'forest.ridge',
      `The ramp tile comes to North Steps. In the trial North Steps ${civicLaneReading(civicLaneRouting('first').steps)}. Keep the Canal Walk requests visible and ask which evening time would work.`,
      { flag: 'civic.routing.seen', visibleIf: laneChoice('first') }),
    { id: 'civic-edge-eastern-case', kind: 'exhibit', exhibit: 'OBJ-EDGE-EASTERN', x: 14, y: 6, w: 1, h: 1,
      label: 'the Eastern Shawnee Tribe of Oklahoma’s constitutional case', art: 'preserved.folder', visibleIf: recordReferral },
    { id: 'civic-edge-eastern-stand', kind: 'scene', node: 'record.edge.eastern', x: 14, y: 7, w: 1, h: 1,
      label: 'the constitutional title window', art: 'preserved.slip', walkThrough: true, visibleIf: recordFolio,
      artOpen: { key: 'civic.ledger', if: { flag: 'record.edge.eastern', eq: true } } },
    sign('civic-edge-dates', 14, 9, 'two separate treaty records at North Steps', 'preserved.display-paired',
      '30 September 1809, Fort Wayne. Article 5 calls for a separate agreement. 26 October 1809, Vincennes. The convention records a declaration by the listed Wea representatives. A reader has pencilled in both document locators for the next copy.',
      { flag: 'record.edge.seen', visibleIf: { flag: 'record.edge.civic.mount', eq: 'dates' } }),
  ],
  lights: [
    { x: 11, y: 8, r: 72, color: 0xf9d4a2 }, { x: 16, y: 8, r: 67, color: 0xe6b7ab },
    { x: 20, y: 12, r: 58, color: 0xc9c6a5 }, { x: 7, y: 8, r: 46, color: 0xf1c48c },
  ],
};

export const CIVIC_CANAL: MapDef = {
  id: 'civic.canal', name: 'Civic Machine: Canal Walk', world: 'WORLD-13',
  width: 28, height: 17, music: 'music.town', ambience: 'town', background: 0x293e50,
  floor: ground(28, 17, (x, y) => {
    if (y >= 13) return (x + y) % 2 === 0 ? 'civic-canal-a' : 'civic-canal-b';
    if (y === 11 || y === 12) return 'civic-boardwalk';
    if (y >= 8 && y <= 10) return 'civic-kerb';
    return cobbles[(x + Math.floor(y / 2)) % cobbles.length];
  }),
  blocks: [[1, 13, 26, 4]], zones: [], spawn: { x: 5, y: 10 }, npcs: [],
  stamps: [
    { stamp: 'market-home', x: 3, y: 2 }, { stamp: 'market-home', x: 19, y: 2 },
    { stamp: 'civic-cart', x: 8, y: 6 }, { stamp: 'civic-stand', x: 14, y: 7 },
    { stamp: 'civic-lamp', x: 5, y: 11 }, { stamp: 'civic-lamp', x: 15, y: 11 },
    { stamp: 'civic-lamp', x: 23, y: 11 }, { stamp: 'civic-rail', x: 7, y: 12 },
    { stamp: 'civic-rail', x: 17, y: 12 }, { stamp: 'civic-rail', x: 24, y: 12 },
    { stamp: 'bench', x: 12, y: 10 }, { stamp: 'market-planter', x: 23, y: 5 },
  ],
  interactables: [
    MATERIAL_CANAL_REVISIT,
    door('civic-canal-return', 3, 10, 'the east passage back to Library Dispatch', { map: 'civic.dispatch', x: 24, y: 11 }),
    door('civic-canal-to-steps', 25, 9, 'the street back to North Steps', { map: 'civic.steps', x: 24, y: 12 }),
    sign('civic-walk-slip', 9, 9, 'the walking crew’s request slip', 'civic.ledger',
      'Walking-round forms. Three more at North Steps and eleven more at Canal Walk, with repeated request numbers set aside. The crew still missed some late windows.',
      { flag: 'civic.walk.read' }),
    sign('civic-reader-note', 16, 8, 'the reader’s question at the stop', 'civic.notice',
      'I see how many windows each district has. I finish work after the desk shuts. When and where could I actually use one?',
      { flag: 'civic.reader.read', visibleIf: published }),
    sign('civic-evening-call', 20, 10, 'the evening-call slip', 'civic.notice',
      'A crew will take requests here after the desk shuts and ask which times people could use. The trial window counts stay on the public desk copy.',
      { visibleIf: { flag: 'civic.revision', eq: 'evening' } }),
    sign('civic-route-log', 20, 10, 'the wider walking-round slip', 'civic.ledger',
      'The crew will walk both routes again, asking where the cart can stop within reach and at which times. These entries will have their own dated collection line.',
      { visibleIf: { flag: 'civic.revision', eq: 'walk' } }),
    sign('civic-overlap-local', 12, 9, 'the dock crew’s end-of-shift slip', 'civic.ledger',
      'The workshop releases its crew at one bell. Three couriers can reach the stop close together. This slip names the release time. It gives no count for the four arrival marks.',
      { flag: 'civic.overlap.local', visibleIf: overlapAvailable }),
    sign('civic-overlap-buffer', 21, 7, 'the second receiving spot for the practice run', 'civic.reserve',
      'A helper makes one mark wide enough for two loads. The red tray can clear if its two couriers reach that mark. Three loads together would still make somebody wait.',
      { flag: 'civic.overlap.seen', visibleIf: { flag: 'civic.overlap.layout', eq: 'buffer' } }),
    sign('civic-routing-canal-slip', 8, 11, 'the Canal Walk stair and ramp slip', 'civic.ledger',
      'Canal Walk crews hand their keys to the next watch before they go. They sent four practice requests. Two people can use either lane. Two ask for a step-free approach after handover. The stop has three trial places.',
      { flag: 'civic.routing.source.second', visibleIf: laneAvailable }),
    sign('civic-routing-canal-ramp', 24, 8, 'the ramp and trial notice at Canal Walk', 'forest.ridge',
      `The ramp tile comes to Canal Walk. In the trial Canal Walk ${civicLaneReading(civicLaneRouting('second').canal)}. Keep the North Steps requests visible and ask which pick-up time would work.`,
      { flag: 'civic.routing.seen', visibleIf: laneChoice('second') }),
    sign('civic-edge-scope', 13, 10, 'the named constitution’s source line at Canal Walk', 'civic.notice',
      'The direction points to the Eastern Shawnee Tribe of Oklahoma’s own public constitution at North Steps. Beside it, a reader has made two columns for the Civic rehearsal. One names who wrote down the request. The other names who may decide it.',
      { flag: 'record.edge.seen', visibleIf: { flag: 'record.edge.civic.mount', eq: 'scope' } }),
    ...CIVIC_APPEAL_CANAL,
  ],
  lights: [
    { x: 9, y: 9, r: 67, color: 0xf1c591 }, { x: 16, y: 8, r: 70, color: 0xd5dbb2 },
    { x: 20, y: 10, r: 63, color: 0xf5bb88 }, { x: 5, y: 11, r: 49, color: 0xd4b191 },
  ],
};
