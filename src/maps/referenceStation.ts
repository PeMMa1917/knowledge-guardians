import pack from '../content/reference-station.json';
import { specimenEquipped } from '../domain/specimenGear';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

const station = 'observatory.station';
const room = 'observatory.reference-station';
const arrived: Condition = { flag: 'coast.arrived', eq: true };
const f = (name: string, eq: true | string = true): Condition => ({ flag: `refstation.${name}`, eq });
const set = (name: string): Condition => ({ flagSet: `refstation.${name}` });
const o = (name: string): Condition => ({ objective: `refstation.${name}` });
const all = (...conditions: Condition[]): Condition => ({ all: conditions });
const not = (condition: Condition): Condition => ({ not: condition });
const needs = (name: string): Condition => ({ card: `card.refstation.${name}` });

function scene(id: string, x: number, y: number, label: string, art: string, visibleIf?: Condition, node = id): Interactable {
  return { id: `refstation-${id}`, kind: 'scene', x, y, w: 1, h: 1, label,
    node: `refstation.${node}`, art: `refstation.${art}`, visibleIf, walkThrough: true };
}

function sign(id: string, x: number, y: number, label: string, art: string, text: string, visibleIf?: Condition, flag?: string): Interactable {
  return { id: `refstation-${id}`, kind: 'sign', x, y, w: 1, h: 1, label,
    art: `refstation.${art}`, text, visibleIf, flag: flag && `refstation.${flag}`, walkThrough: true };
}

export const HEADLAND_REFERENCE: Interactable[] = [
  { id: 'refstation-door', kind: 'door', x: 5, y: 12, w: 1, h: 1, art: 'preserved.door',
    label: 'the three reference benches', visibleIf: arrived, to: { map: room, x: 14, y: 15 } },
  scene('proof-local', 7, 12, 'Loen’s first-reading rail', 'draft', all(f('plan', 'local'), not(o('proof'))), 'proof.local'),
  sign('done-local', 7, 12, 'the used local readings and next check', 'local',
    'Blank: 1. Ridge and open sky: 3. The two practice views have their own names. The next shift keeps the repeat slot empty until it is checked.', f('proof', 'local')),
  scene('proof-repeat', 11, 10, 'Loen’s independent reader at the upper post', 'receiver', all(f('plan', 'repeat'), not(f('second'))), 'proof.repeat'),
  { ...sign('read-repeat', 12, 10, 'the independent receiver’s three checked readings', 'repeat',
    'The second reader gives 2 on its own blank and 4 from each direction. Both receivers show an excess of 2 in these conditions. The record keeps each baseline.',
    all(f('second'), not(o('proof'))), 'second.read'), sfx: 'sfx.sparkle' },
  scene('publish-repeat', 11, 10, 'the separate local and upper receiver records', 'repeat', all(f('second.read'), not(o('proof'))), 'publish.repeat'),
  sign('done-repeat', 11, 10, 'the paired dated repeat notice', 'repeat',
    'Two readers, two baselines, an excess of 2 from each direction at this exercise. Loen marks the source of the excess for another check.', f('proof', 'repeat')),
];

const testedGlobe = all(f('seen.outside'), f('seen.inside'));
const testedTube = o('tube');
const testedHorn = o('horn');
const ready = all(o('globe'), testedTube, testedHorn);

const casePlaces = [5, 14, 23];
const cases = pack.exhibits.map((e, i): Interactable => ({
  id: `refstation-case-${e.grantsCard.split('.').at(-1)}`, kind: 'exhibit', exhibit: e.id, x: casePlaces[i], y: 6, w: 1, h: 1,
  label: e.name, art: e.art,
}));

export const REFERENCE_STATION: MapDef = {
  id: room, name: 'Observatory Coast: Three Reference Benches', world: 'WORLD-05',
  width: 29, height: 18, music: 'music.archive', ambience: 'study', background: 0x213647, spawn: { x: 14, y: 15 },
  floor: (x, y) => {
    if (x < 1 || x > 27 || y < 0 || y > 17) return null;
    if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
    return x === 14 || y === 14 ? 'stone-b' : 'stone-c';
  },
  blocks: [[1, 0, 27, 3]], zones: [],
  stamps: [{ stamp: 'window', x: 4, y: 1 }, { stamp: 'window', x: 13, y: 1 }, { stamp: 'window', x: 22, y: 1 },
    { stamp: 'bookshelf', x: 1, y: 2 }, { stamp: 'bookshelf', x: 25, y: 2 },
    { stamp: 'bench', x: 3, y: 14 }, { stamp: 'bench', x: 23, y: 14 }, { stamp: 'rug-green', x: 13, y: 13 }],
  lights: [{ x: 6, y: 8, r: 78, color: 0xf1d2a1 }, { x: 14, y: 8, r: 78, color: 0xb7dcf0 },
    { x: 23, y: 8, r: 78, color: 0xbdd8de }, { x: 14, y: 14, r: 66, color: 0xe4d3a7 }],
  npcs: [{ id: 'reference-keeper-cerin', x: 8, y: 8, facing: 'left' }, { id: 'reference-observer-loen', x: 24, y: 10, facing: 'down' }],
  interactables: [
    ...cases,
    { id: 'refstation-return', kind: 'door', x: 14, y: 17, w: 1, h: 1, art: 'preserved.door',
      label: 'the passage back to Headland Station', to: { map: station, x: 6, y: 12 } },
    sign('shop-guide', 14, 14, 'the three places and dates', 'draft',
      'Lahore, 1663. Cambridge, 1896–97. Holmdel, 1964–65. Each practice bench has its own place and dated source. Its readings belong to the reconstruction.'),
    sign('first-claim', 17, 14, 'the old nearby-sender claim', 'draft',
      'DRAFT. THE EXTRA TRACE PROVES THE SENDER IS NEARBY. The title has no baseline or named viewpoint.', not(set('plan'))),

    { ...scene('globe', 5, 9, 'the silver peg and two views of the study globe', 'globe-out', all(needs('globe'), not(testedGlobe))),
      artBy: { flag: 'refstation.globe', keys: { outside: 'refstation.globe-out', inside: 'refstation.globe-in' } } },
    sign('globe-outside', 3, 11, 'the outside witness strip', 'globe-out',
      'From this strip, the left-to-right order is silver peg, crescent, star. The peg stayed in the same hole.', f('globe', 'outside'), 'seen.outside'),
    sign('globe-inside', 8, 11, 'the inside witness strip', 'globe-in',
      'From this side, the left-to-right order is star, crescent, silver peg. The same physical peg sits in its fixed hole.', f('globe', 'inside'), 'seen.inside'),
    sign('globe-cites', 5, 12, 'the two numbered globe references', 'draft',
      'The current museum gives T.1890.330. The cited 1985 study calls its seamless globe no. 27 and prints inventory 1890-331. Keep both identifiers with their source. The join still needs a check.',
      all(needs('globe'), not(o('globe'))), 'globe.cites'),
    sign('globe-cites-used', 5, 12, 'the checked globe source tabs', 'local',
      'The maker, place and date stay with the current record. The older inventory number stays with the study’s separate observation about construction.', o('globe')),

    { ...scene('tube', 14, 9, 'the printed trace card and fixed grey line', 'trace-left', all(needs('tube'), not(testedTube))),
      artBy: { flag: 'refstation.tube', keys: { left: 'refstation.trace-left', right: 'refstation.trace-right' } } },
    sign('tube-left', 11, 11, 'the first peg on the same ruled base', 'trace-left',
      'The trace is two divisions to the left. The grey reference is still centred. This result belongs to the paper comparison.',
      all(f('tube', 'left'), not(testedTube)), 'seen.left'),
    sign('tube-right', 17, 11, 'the second peg on the same ruled base', 'trace-right',
      'The trace is two divisions to the right. The grey reference is still centred under the same mark.',
      all(f('tube', 'right'), not(testedTube)), 'seen.right'),
    sign('tube-checked', 14, 10, 'both trace positions beside the fixed centre', 'local',
      'The grey line keeps the shared reference. Both marked trace positions now have a separate reading tab.', testedTube),

    { ...scene('horn', 22, 9, 'the fixed-interval reader and its three strips', 'receiver', all(needs('horn'), not(testedHorn))),
      artBy: { flag: 'refstation.horn', keys: { blank: 'refstation.blank', ridge: 'refstation.ridge', sky: 'refstation.sky' } } },
    sign('horn-blank', 23, 12, 'the blank reference for one interval', 'blank',
      'Practice receiver alone: 1 unit in the fixed interval. The blank gives this receiver’s own reference.', all(f('horn', 'blank'), not(testedHorn)), 'seen.blank'),
    sign('horn-ridge', 23, 12, 'the ridge-facing interval', 'ridge',
      'Ridge: 3 units in the same interval. The difference from this blank is 2 units.', all(f('horn', 'ridge'), not(testedHorn)), 'seen.ridge'),
    sign('horn-sky', 23, 12, 'the open-sky interval', 'sky',
      'Open sky: 3 units in the same interval. The difference from this blank remains 2 units.', all(f('horn', 'sky'), not(testedHorn)), 'seen.sky'),
    sign('horn-checked', 23, 12, 'blank and both direction strips on tagged clips', 'repeat',
      'The excess remained in both directions. The three clips keep their direction and fixed interval. Another source could explain what persisted.', testedHorn),

    scene('send', 17, 14, 'Cerin’s checked dispatch and two readers', 'local', all(ready, not(set('plan')))),
    sign('sent-local', 17, 14, 'the first dated reading sent to the low rail', 'local',
      'The first figures go to the low rail at Headland Station. Read them with the watch crew. The second check retains its own space.', f('plan', 'local')),
    sign('sent-repeat', 17, 14, 'the separate upper reader request', 'repeat',
      'Loen has the three labelled strips. Set the separate upper reference out at Headland Station before posting its repeat.', f('plan', 'repeat')),
  ],
};

type Check = 'globe' | 'tube' | 'horn';
type Position = { x: number; y: number };

interface RevisitRoute {
  subject: Check;
  point: Position;
  prompt: string;
  states: { key: string; art: string; point: Position; label: string; text: string }[];
  promptPost: string;
  outcomes: { key: string; art: string; label: string; text: string }[];
}

function revisit(route: RevisitRoute): Interactable[] {
  const { subject, point, prompt, states, promptPost, outcomes } = route;
  const exact = pack.exhibits.find((e) => e.grantsCard === `card.refstation.${subject}`)!;
  const equipped = specimenEquipped(exact.specimen.key);
  const namespace = `return.${subject}`;
  const compared = all(...states.map(({ key }) => f(`${namespace}.${key}`)));
  const posted = set(`${namespace}.done`);
  return [
    { ...scene(`revisit-${subject}`, point.x, point.y, prompt, states[0].art, all(equipped, not(compared), not(posted)), namespace),
      artBy: { flag: `refstation.${namespace}.view`, keys: Object.fromEntries(states.map(({ key, art }) => [key, `refstation.${art}`])) } },
    ...states.map(({ key, art, point, label, text }) => sign(`revisit-${subject}-${key}`, point.x, point.y,
      label, art, text, all(equipped, f(`${namespace}.view`, key), not(compared), not(posted)), `${namespace}.${key}`)),
    scene(`revisit-${subject}-post`, point.x, point.y, promptPost, 'draft', all(equipped, compared, not(posted)), `${namespace}.post`),
    ...outcomes.map(({ key, art, label, text }) => sign(`revisit-${subject}-${key}-posted`, point.x, point.y,
      label, art, text, f(`${namespace}.done`, key))),
  ];
}

export const ARCHIVE_GLOBE_REVISIT = revisit({
  subject: 'globe', point: { x: 10, y: 5 }, prompt: 'the archive route board and its fixed room pin',
  states: [
    { key: 'west', art: 'globe-out', point: { x: 8, y: 5 }, label: 'the frame from the reading path', text: 'From the west reading path, the storage hook lies to the right of the fixed silver pin.' },
    { key: 'east', art: 'globe-in', point: { x: 11, y: 6 }, label: 'the same frame from the door approach', text: 'From the door, the same storage hook lies to the left of that room pin. The hook and pin stay put.' },
  ], promptPost: 'the tested archive directions and both mounting clips',
  outcomes: [
    { key: 'west', art: 'globe-out', label: 'the large western frame and small entrance tab', text: 'The reading path gives the large direction. At the door, a small reverse tab keeps the same room pin clear.' },
    { key: 'east', art: 'globe-in', label: 'the large east frame and west path tab', text: 'The entrance gives the large map. The west approach uses its separate frame tab to find the same room pin.' },
  ],
});

export const FOLD_TUBE_REVISIT = revisit({
  subject: 'tube', point: { x: 8, y: 12 }, prompt: 'the Fold’s loose sheet and fixed wall nail',
  states: [
    { key: 'sheet', art: 'trace-left', point: { x: 7, y: 11 }, label: 'the written line over the fixed nail', text: 'The paper shifted. The practice load peg stays at the same nail.' },
    { key: 'load', art: 'trace-right', point: { x: 9, y: 13 }, label: 'the load mark beyond the nail', text: 'The load peg moved two marks past the nail. The sheet stayed on the same hook.' },
  ], promptPost: 'the two checks of the Fold’s fixed nail',
  outcomes: [
    { key: 'rail', art: 'trace-left', label: 'the nail check for the next porter', text: 'The first line tells a porter to check the peg at the wall nail. The full tracing remains at the desk.' },
    { key: 'desk', art: 'trace-right', label: 'the two traces at the Fold’s desk', text: 'The keeper keeps the sheet slide and load movement on separate strips. The rail points a porter to the check desk.' },
  ],
});

export const HARBOUR_HORN_REVISIT = revisit({
  subject: 'horn', point: { x: 24, y: 12 }, prompt: 'the two copies on the harbour signal bench',
  states: [
    { key: 'copy', art: 'local', point: { x: 24, y: 14 }, label: 'the matching copies by the low bench', text: 'Both slips carry the same source cut and blank. The second slip is a copy of the first reading.' },
    { key: 'watch', art: 'repeat', point: { x: 25, y: 12 }, label: 'the east post’s independently dated check', text: 'The east post used a different blank and dated its own observation. Its signed entry has a separate source.' },
  ], promptPost: 'the independent stamp and braced copies',
  outcomes: [
    { key: 'side', art: 'repeat', label: 'the two-source tide handover', text: 'The copies share one bracket. The independent stamp has its own source line next to the harbour handover.' },
    { key: 'slot', art: 'local', label: 'the independent stamp at its own keeping slot', text: 'The public note tells its reader where to find the second check. The independent date and blank stay with the east post.' },
  ],
});
