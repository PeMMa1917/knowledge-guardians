import { MOON_INSTRUMENT } from '../domain/spareMoonMusic';
import { moonHas, moonIs, moonLatch, moonMissing, nollKitchenShift } from '../content/spareMoon';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

const loft = 'nexus.bell-loft',
  house = 'nexus.spare-moon';
const finale: Condition = {
  all: [
    { flag: 'spare-moon.night', in: ['bell', 'cord', 'bench'] },
    { flagSet: 'ending.council' },
  ],
};
function fiddle(id: string, x: number, y: number, label: string, visibleIf?: Condition): Interactable {
  return {
    id: 'moon-song-' + id,
    kind: 'fieldgame',
    game: MOON_INSTRUMENT,
    x,
    y,
    w: 1,
    h: 1,
    label,
    art: 'moon.fiddle',
    walkThrough: true,
    visibleIf,
  };
}
export const MOON_COUNCIL_SONG = fiddle('council', 16, 6, 'two spoons left by a guest of the Spare Moon', finale);
export const MOON_HALL_SONG = fiddle(
  'hall',
  11,
  18,
  'Noll’s fiddle and the conductors’ spoons',
  moonIs('noll', 'hall'),
);
export const MOON_ROAD_SONG = fiddle('road', 21, 18, 'Auda’s bread tin', moonIs('auda', 'road'));
type NPC = MapDef['npcs'][number];
function actor(id: string, x: number, y: number, facing: NPC['facing'], visibleIf?: Condition): NPC {
  return { id, x, y, facing, visibleIf };
}
function door(
  id: string,
  label: string,
  x: number,
  y: number,
  map: string,
  arrivalX: number,
  arrivalY: number,
  art: string,
): Interactable {
  return { id: 'moon-' + id, label, x, y, w: 1, h: 1, kind: 'door', art, to: { map, x: arrivalX, y: arrivalY } };
}
function scene(
  id: string,
  x: number,
  y: number,
  label: string,
  art: string,
  sfx: string,
  visibleIf?: Condition,
): Interactable {
  return {
    id: 'moon-' + id,
    node: 'spare-moon.' + id,
    x,
    y,
    w: 1,
    h: 1,
    kind: 'scene',
    label,
    art,
    sfx,
    walkThrough: true,
    visibleIf,
  };
}

export const MOON_LOFT_DOOR: Interactable = {
  ...door('loft', 'the brass fish stair to the Bell Loft', 13, 16, loft, 8, 10, 'moon.fish'),
  flag: 'spare-moon.entered',
  walkThrough: true,
};
export const MOON_HALL_FIDDLER = actor('noll-wick', 10, 17, 'down', moonIs('noll', 'hall'));
export const MOON_EMBERFORD_CARRIER = actor('auda-wick', 22, 18, 'left', moonIs('auda', 'road'));

const shell = {
  width: 17,
  height: 14,
  world: 'WORLD-01',
  music: 'music.archive',
  ambience: 'study' as const,
  spawn: { x: 8, y: 10 },
  floor: (x: number, y: number) =>
    x < 1 || x > 15 || y < 0 || y > 12 ? null : y < 3 ? ['wall-top', 'wall-mid', 'wall-base'][y] : 'stone-c',
  blocks: [
    [0, 0, 17, 3],
    [0, 0, 1, 14],
    [16, 0, 1, 14],
    [0, 13, 17, 1],
  ] as MapDef['blocks'],
  zones: [],
};

export const BELL_LOFT: MapDef = {
  ...shell,
  id: loft,
  name: 'The Bell Loft',
  background: 0x24213b,
  stamps: [
    { stamp: 'window', x: 3, y: 1 },
    { stamp: 'banners', x: 11, y: 1 },
    { stamp: 'rug-green', x: 6, y: 8 },
    { stamp: 'crates', x: 13, y: 4 },
  ],
  lights: [
    { x: 4, y: 7, r: 90, color: 0xffc780 },
    { x: 8, y: 4, r: 72, color: 0xafc6ed },
    { x: 12, y: 9, r: 58, color: 0xefb787 },
  ],
  npcs: [
    actor('auda-wick', 4, 7, 'right', { not: moonIs('auda', 'road') }),
    actor('noll-wick', 12, 8, 'left', { all: [moonMissing('noll'), { not: nollKitchenShift }] }),
  ],
  interactables: [
    scene('empty-peg', 12, 8, 'Noll’s bow and a trail of flour', 'moon.fiddle', 'sfx.open', nollKitchenShift),
    fiddle('loft', 11, 7, 'the four-beat bootlace fiddle'),
    door('hall', 'the Archive Hall', 8, 12, 'nexus.archive', 13, 15, 'preserved.door'),
    {
      ...scene('moth', 8, 4, 'the Glimmermoth on the swing sign', 'moon.perch', 'sfx.sparkle'),
      artOpen: { key: 'moon.perch-open', if: moonLatch },
    },
    scene('thimble', 3, 4, 'a brass thimble swinging inside the small bell', 'moon.thimble', 'sfx.metal', {
      not: moonIs('auda', 'road'),
    }),
    {
      ...door('stair', 'the stair behind the painted moon', 9, 5, house, 8, 10, 'moon.open'),
      visibleIf: moonLatch,
    },
  ],
};
export const SPARE_MOON: MapDef = {
  ...shell,
  id: house,
  name: 'The Spare Moon',
  background: 0x302137,
  stamps: [
    { stamp: 'window', x: 10, y: 1 },
    { stamp: 'barrel', x: 2, y: 3 },
    { stamp: 'rug-green', x: 6, y: 7 },
    { stamp: 'plant-tall', x: 14, y: 8 },
  ],
  lights: [
    { x: 5, y: 5, r: 90, color: 0xeea763 },
    { x: 11, y: 8, r: 79, color: 0xffd6a1 },
  ],
  npcs: [
    actor('ket-ribble', 8, 6, 'down'),
    actor('noll-wick', 5, 8, 'right', { any: [moonIs('noll', 'home'), nollKitchenShift] }),
  ],
  interactables: [
    scene('shade', 6, 7, 'Ket’s folded paper moon', 'moon.sign', 'sfx.page', {
      all: [{ flag: 'owned.lamp-moonshade', eq: true }, moonMissing('shade')],
    }),
    scene(
      'shade-door',
      6,
      7,
      'a paper moon hung low beside Ket’s door',
      'moon.open',
      'sfx.page',
      moonIs('shade', 'door'),
    ),
    scene(
      'shade-me',
      6,
      7,
      'a paper moon angled at Ket’s reading chair',
      'moon.sign',
      'sfx.page',
      moonIs('shade', 'me'),
    ),
    fiddle('home', 5, 9, 'the guest’s two spoons', moonIs('noll', 'home')),
    door('up', 'the Bell Loft', 8, 12, loft, 9, 6, 'moon.open'),
    ...(
      [
        ['bell', 3, 6, 'the brass fish calling out to the street', 'moon.fish', 'sfx.metal'],
        ['cord', 13, 5, 'five blue wrist loops', 'moon.cord', 'sfx.page'],
        ['bench', 11, 9, 'the hinged flour bench', 'moon.bench', 'sfx.open'],
      ] as const
    ).map(([id, x, y, label, art, sfx]) =>
      scene('offer-' + id, x, y, label, art, sfx, { all: [moonHas('house'), moonMissing('night')] }),
    ),
    scene(
      'ket-bell',
      3,
      6,
      'a curtain inside the public door',
      'moon.curtain',
      'sfx.open',
      moonIs('night', 'bell'),
    ),
    scene('ket-cord', 13, 5, 'the sixth blue wrist loop', 'moon.sixth', 'sfx.page', moonIs('night', 'cord')),
    scene(
      'ket-bench',
      11,
      9,
      'a traveller fast asleep under a quilt',
      'moon.quilt',
      'sfx.open',
      moonIs('night', 'bench'),
    ),
    {
      ...door(
        'short-stair',
        'the public stair back to the Archive Hall',
        3,
        9,
        'nexus.archive',
        13,
        15,
        'moon.curtain',
      ),
      visibleIf: moonIs('night', 'bell'),
    },
  ],
};
