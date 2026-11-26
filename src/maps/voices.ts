/** Fictional listening archive and the two approaches to Glass Walk. */
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

function door(id: string, x: number, y: number, label: string, to: NonNullable<Interactable['to']>, art = 'voices.waypost'): Interactable {
  return { id, kind: 'door', x, y, w: 1, h: 1, label, to, art };
}

function sign(id: string, x: number, y: number, label: string, art: string, text: string,
  options: { flag?: string; visibleIf?: Condition } = {}): Interactable {
  return { id, kind: 'sign', x, y, w: 1, h: 1, label, art, text, walkThrough: true, ...options };
}

function ground(width: number, height: number, tile: (x: number, y: number) => string) {
  return (x: number, y: number) => x < 1 || y < 0 || x >= width - 1 || y >= height ? null : tile(x, y);
}

const verified: Condition = { objective: 'voices.verify' };
const published: Condition = { objective: 'voices.publish' };

export const VOICES_LISTENING: MapDef = {
  id: 'voices.listening', name: 'Archive of Voices: Listening Room', world: 'WORLD-14',
  width: 29, height: 18, music: 'music.archive', ambience: 'study', background: 0x3c364d,
  floor: ground(29, 18, (x, y) => {
    if (y < 3) return y === 0 ? 'wall-top' : y === 1 ? 'wall-mid' : 'wall-base';
    return (x >= 11 && x <= 16) || (y >= 10 && y <= 12) ? 'voices-inlay' : 'voices-slate';
  }),
  blocks: [[1, 0, 27, 3]], zones: [], spawn: { x: 12, y: 12 },
  npcs: [{ id: 'voices-steward', x: 12, y: 7, facing: 'down' }],
  stamps: [
    { stamp: 'voices-screen', x: 6, y: 3 }, { stamp: 'voices-screen', x: 19, y: 3 },
    { stamp: 'voices-reel-shelf', x: 3, y: 3 }, { stamp: 'voices-reel-shelf', x: 23, y: 3 },
    { stamp: 'voices-cabinet', x: 5, y: 7 }, { stamp: 'voices-cabinet', x: 20, y: 7 },
    { stamp: 'voices-bench', x: 5, y: 13 }, { stamp: 'voices-bench', x: 19, y: 13 },
    { stamp: 'plant-tall', x: 10, y: 13 }, { stamp: 'plant-tall', x: 17, y: 13 },
  ],
  interactables: [
    door('voices-walk-path', 3, 11, 'the passage to the Glass Walk stairs', { map: 'voices.walk', x: 11, y: 13 }),
    door('voices-quay-path', 25, 11, 'the passage to the lamp quay', { map: 'voices.quay', x: 5, y: 12 }),
    door('voices-nexus-return', 13, 15, 'the crossing back to the Nexus', { map: 'nexus.archive', x: 31, y: 12 }, 'preserved.door'),
    { id: 'voices-desk', kind: 'voices-desk', x: 14, y: 8, w: 1, h: 1,
      label: 'the listening desk', art: 'voices.desk' },
    { id: 'voices-archive-waystone', kind: 'waystone', x: 10, y: 11, w: 1, h: 1,
      label: 'the Listening Room Waystone', place: 'the Listening Room', art: 'waystone' },
    sign('voices-permission', 8, 8, 'the carrier’s permission slip', 'voices.permission',
      'A carrier on the test walk approved “Second lamp, then the rail” for public quotation. They asked that their name and full account stay out of the notice. The clerk’s opening entry can be quoted with its date and source.',
      { flag: 'voices.permissions.read' }),
    sign('voices-quote-desk', 10, 8, 'the excerpt at the reading slot', 'voices.permission',
      'The carrier’s approved words sit at the reading slot alongside the date and purpose. Ask here to see the copy.',
      { visibleIf: { flag: 'voices.quote.layout', eq: 'desk' } }),
    sign('voices-quote-queue', 6, 12, 'the approved excerpt by the waiting bench', 'voices.paired',
      'A carrier on the Lantern 4 test walk said, “Second lamp, then the rail.” A small edge line points to the source desk.',
      { visibleIf: { flag: 'voices.quote.layout', eq: 'queue' } }),
    sign('voices-draft-label', 18, 9, 'the old opening caption', 'preserved.slip',
      'FIRST CROSSING ON LANTERN 6. The date comes from the signed opening entry.',
      { visibleIf: { not: verified } }),
    sign('voices-checked-label', 18, 9, 'the checked opening caption', 'voices.paired',
      'A carrier recalls a test walk on Lantern 4 at dusk. The signed opening register begins on Lantern 6. A date for the first crossing stays open.',
      { visibleIf: verified }),
  ],
  lights: [
    { x: 8, y: 8, r: 61, color: 0xf0c1aa }, { x: 14, y: 8, r: 77, color: 0xe9c7ad },
    { x: 18, y: 9, r: 63, color: 0xc9c8e4 }, { x: 3, y: 11, r: 49, color: 0xcfc0e1 },
    { x: 25, y: 11, r: 49, color: 0xeec6a6 },
  ],
};

export const VOICES_WALK: MapDef = {
  id: 'voices.walk', name: 'Archive of Voices: Glass Walk', world: 'WORLD-14',
  width: 29, height: 18, music: 'music.town', ambience: 'town', background: 0x39444a,
  floor: ground(29, 18, (x, y) => {
    if (x >= 14 && x <= 18 && y <= 8) return 'voices-glass';
    if (y >= 9 && y <= 12 && x >= 14 && x <= 18) return 'voices-stairs';
    if ((y >= 10 && y <= 14) || (x >= 10 && x <= 13)) return 'voices-promenade';
    return (x + y) % 2 === 0 ? 'voices-paving-a' : 'voices-paving-b';
  }),
  blocks: [[14, 6, 1, 1], [18, 6, 1, 1]], zones: [], spawn: { x: 11, y: 13 },
  npcs: [{ id: 'voices-clerk', x: 11, y: 7, facing: 'down' }],
  stamps: [
    { stamp: 'voices-arch', x: 14, y: 3 }, { stamp: 'voices-rail', x: 14, y: 6 },
    { stamp: 'voices-rail', x: 18, y: 6 }, { stamp: 'voices-bench', x: 6, y: 11 },
    { stamp: 'voices-bench', x: 21, y: 10 }, { stamp: 'voices-cabinet', x: 7, y: 6 },
    { stamp: 'market-home', x: 3, y: 2 }, { stamp: 'market-home', x: 22, y: 2 },
    { stamp: 'market-planter', x: 3, y: 9 }, { stamp: 'market-planter', x: 24, y: 13 },
  ],
  interactables: [
    door('voices-walk-return', 11, 15, 'the steps back to the Listening Room', { map: 'voices.listening', x: 4, y: 11 }),
    door('voices-walk-to-quay', 25, 11, 'the rail passage to the quay', { map: 'voices.quay', x: 23, y: 12 }),
    sign('voices-opening-register', 9, 8, 'the signed opening register', 'voices.register',
      'Lantern 6. Glass Walk opened for public passage. This is the first signed opening entry.',
      { flag: 'voices.register.read' }),
    sign('voices-stairs-approach', 18, 13, 'the stair post', 'voices.railing',
      'The stairs rise to the arch. A low rail follows the paving, then turns under the arch toward the quay.'),
    sign('voices-stairs-view', 16, 12, 'the view from the stair foot', 'voices.arch',
      'The arch and the turning rail are both visible from the stair foot. There are no quay lamps on this approach.',
      { flag: 'voices.stairs.view', visibleIf: published }),
    sign('voices-result-paired', 13, 6, 'the side-by-side opening notice', 'voices.paired',
      '“Second lamp, then the rail.” From the quay, take the rail after the second lamp. The carrier remembers a Lantern 4 trial. The opening register starts on Lantern 6.',
      { visibleIf: { flag: 'voices.response', eq: 'paired' } }),
    sign('voices-result-guide', 13, 6, 'the route-first opening notice', 'voices.guide',
      'From the quay, take the rail after the second lamp. The two dated sources and the carrier’s approved words are available at the listening desk.',
      { visibleIf: { flag: 'voices.response', eq: 'guide' } }),
    sign('voices-revised-landmarks', 20, 8, 'the shared landmark notice', 'voices.arch',
      'Find the arch and follow the rail where it bends beneath it. Those two marks are visible from either approach. The first quay direction stays beside the dated records.',
      { visibleIf: { flag: 'voices.revision', eq: 'landmarks' } }),
    sign('voices-revised-routes', 20, 8, 'the notice with two approaches', 'voices.guide',
      'From the quay, pass two lamps and follow the rail. From the stair foot, climb toward the arch and take the same rail. Each direction starts from a named place.',
      { visibleIf: { flag: 'voices.revision', eq: 'routes' } }),
    sign('voices-wide-note', 20, 11, 'the Room on the Rail panel by the bench', 'voices.paired',
      'The two approaches have separate lines and each names the arch and rail. The dates stay beside the register and carrier excerpt where readers can check them.',
      { visibleIf: { flag: 'voices.access.ready', eq: true } }),
  ],
  lights: [
    { x: 11, y: 7, r: 64, color: 0xffd5a4 }, { x: 17, y: 8, r: 82, color: 0xc0d8d5 },
    { x: 16, y: 12, r: 53, color: 0xc1d5d6 }, { x: 21, y: 8, r: 50, color: 0xe9c3c2 },
  ],
};

export const VOICES_QUAY: MapDef = {
  id: 'voices.quay', name: 'Archive of Voices: Lamp Quay', world: 'WORLD-14',
  width: 31, height: 18, music: 'music.town', ambience: 'town', background: 0x293f4e,
  floor: ground(31, 18, (x, y) => {
    if (y >= 14) return (x + y) % 2 === 0 ? 'voices-tide-a' : 'voices-tide-b';
    if (y >= 11) return 'voices-quay';
    if ((y >= 8 && y <= 10) || (x >= 14 && x <= 17)) return 'voices-promenade';
    return (x + y) % 2 === 0 ? 'voices-paving-a' : 'voices-paving-b';
  }),
  blocks: [[1, 14, 29, 4], [17, 7, 1, 1], [21, 7, 1, 1]], zones: [], spawn: { x: 5, y: 12 }, npcs: [],
  stamps: [
    { stamp: 'market-home', x: 4, y: 2 }, { stamp: 'market-home', x: 11, y: 2 },
    { stamp: 'voices-arch', x: 17, y: 4 }, { stamp: 'voices-rail', x: 17, y: 7 }, { stamp: 'voices-rail', x: 21, y: 7 },
    { stamp: 'voices-edge-rail', x: 6, y: 13 }, { stamp: 'voices-edge-rail', x: 19, y: 13 },
    { stamp: 'voices-bench', x: 13, y: 9 }, { stamp: 'crates', x: 25, y: 6 },
  ],
  interactables: [
    door('voices-quay-return', 3, 12, 'the quay passage back to the Listening Room', { map: 'voices.listening', x: 24, y: 11 }),
    door('voices-quay-to-walk', 25, 12, 'the rail passage to the Glass Walk stairs', { map: 'voices.walk', x: 24, y: 11 }),
    sign('voices-quay-first-lamp', 6, 9, 'the first lamp on the quay', 'voices.lamp',
      'The first lamp has a round pane. There is another pool of amber light farther along the quay.'),
    sign('voices-quay-second-lamp', 10, 9, 'the second lamp on the quay', 'voices.lamp',
      'The second lamp stands beyond the mooring stones. From here the rail comes into view near the arch.'),
    sign('voices-shared-rail', 18, 9, 'the turning rail', 'voices.railing',
      'The rail turns under the arch. Its other end meets the top of the stairs.'),
    sign('voices-quay-view', 12, 11, 'the view along the quay', 'voices.guide',
      'Two lamps come into view before the rail. Past the second lamp the rail bends under the arch.',
      { flag: 'voices.quay.view', visibleIf: published }),
    sign('voices-reader-note', 23, 9, 'the reader’s note by the other end of the rail', 'voices.permission',
      'I came from the stairs. There isn’t a second lamp from that side. Is this the same rail?',
      { flag: 'voices.reader.read', visibleIf: published }),
  ],
  lights: [
    { x: 6, y: 9, r: 62, color: 0xffcf86 }, { x: 10, y: 9, r: 66, color: 0xffd694 },
    { x: 19, y: 7, r: 67, color: 0xb9d9cf }, { x: 23, y: 9, r: 47, color: 0xd1c8d3 },
  ],
};
