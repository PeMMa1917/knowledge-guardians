/** A fictional mobile-library route with a dispatch hall and two street stops. */
import type { Condition } from '../domain/types';
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

export const CIVIC_DISPATCH: MapDef = {
  id: 'civic.dispatch', name: 'Civic Machine: Library Dispatch', world: 'WORLD-13',
  width: 29, height: 18, music: 'music.archive', ambience: 'study', background: 0x243a46,
  floor: ground(29, 18, (x, y) => {
    if (y < 3) return y === 0 ? 'wall-top' : y === 1 ? 'wall-mid' : 'wall-base';
    return (x >= 11 && x <= 17) || (y >= 10 && y <= 13) ? 'civic-hall-route' : 'civic-hall-tile';
  }),
  blocks: [[1, 0, 27, 3]], zones: [], spawn: { x: 12, y: 12 },
  npcs: [{ id: 'civic-operator', x: 13, y: 7, facing: 'down' }],
  stamps: [
    { stamp: 'civic-route-wall', x: 11, y: 2 }, { stamp: 'civic-bookcases', x: 3, y: 3 },
    { stamp: 'civic-bookcases', x: 22, y: 3 }, { stamp: 'civic-cart', x: 6, y: 7 },
    { stamp: 'civic-cart', x: 21, y: 7 }, { stamp: 'window', x: 7, y: 1 },
    { stamp: 'window', x: 20, y: 1 }, { stamp: 'bench', x: 5, y: 13 },
    { stamp: 'bench', x: 20, y: 13 }, { stamp: 'plant-tall', x: 10, y: 14 },
    { stamp: 'plant-tall', x: 16, y: 14 },
  ],
  interactables: [
    door('civic-steps-path', 3, 11, 'the west passage to North Steps', { map: 'civic.steps', x: 12, y: 14 }),
    door('civic-canal-path', 25, 11, 'the east passage to Canal Walk', { map: 'civic.canal', x: 5, y: 10 }),
    door('civic-nexus-return', 13, 16, 'the crossing back to the Nexus', { map: 'nexus.archive', x: 28, y: 12 }, 'preserved.door'),
    { id: 'civic-console', kind: 'civic-console', x: 15, y: 9, w: 1, h: 1, label: 'the route console', art: 'civic.console' },
    { id: 'civic-dispatch-waystone', kind: 'waystone', x: 9, y: 12, w: 1, h: 1,
      label: 'the Library Dispatch Waystone', place: 'Library Dispatch', art: 'waystone' },
    sign('civic-dispatch-directory', 12, 10, 'the dispatch directory', 'civic.waypost',
      'North Steps has the public desk to the west. Canal Walk keeps the walking crew’s slip to the east. Ade has the loaded route console in the middle.'),
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
  ],
  lights: [
    { x: 9, y: 9, r: 67, color: 0xf1c591 }, { x: 16, y: 8, r: 70, color: 0xd5dbb2 },
    { x: 20, y: 10, r: 63, color: 0xf5bb88 }, { x: 5, y: 11, r: 49, color: 0xd4b191 },
  ],
};
