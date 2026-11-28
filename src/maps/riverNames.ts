import { riverPeople } from '../content/riverNames';
import { namesLane, namesQuay, releases, type Release } from '../domain/riverNames';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';
function prop(
  id: string,
  label: string,
  kind: Interactable['kind'],
  art: string,
  x: number,
  y: number,
  other: Partial<Interactable> = {},
): Interactable {
  return { id: 'river-names-' + id, label, kind, art, x, y, w: 1, h: 1, ...other };
}
function door(
  id: string,
  label: string,
  x: number,
  y: number,
  map: string,
  tx: number,
  ty: number,
  visibleIf?: Condition,
) {
  return prop(id, label, 'door', 'rivernames.oven', x, y, {
    walkThrough: true,
    to: { map, x: tx, y: ty },
    visibleIf,
  });
}
const centre = 'sea.turning-room',
  out = 'water.gatehouse';
const freshPacket: Condition = { any: releases.map((r) => ({ flag: 'rivernames.packet', eq: r })) };
const canRevisit: Condition = { any: [freshPacket, { flag: 'rivernames.everReceived', eq: true }] };
function floor(x: number, y: number) {
  if (x < 1 || x > 23 || y < 0 || y > 15) return null;
  if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
  if (y === 8) return x === 5 || x === 18 ? 'water-bridge' : 'water-ripple-a';
  return y === 7 || y === 9 ? 'water-bank' : x === 5 || x === 18 ? 'water-path' : 'island-boards';
}
const riverBlocks: MapDef['blocks'] = [
  [0, 0, 25, 3],
  [1, 8, 4, 1],
  [6, 8, 12, 1],
  [19, 8, 5, 1],
];
const faces: Record<Release, { title: string; x: number; y: number; art: string }> = {
  window: {
    title: 'The red shutter where Pendlow serves a meal',
    x: 5,
    y: 5,
    art: 'rivernames.shutter',
  },
  walk: { title: 'The waiting guide with the brass thimble', x: 19, y: 11, art: 'rivernames.threads' },
  district: { title: 'The twice-crossed district post sack', x: 6, y: 11, art: 'rivernames.sack' },
};
export const ovenLane: MapDef = {
  id: namesLane,
  name: 'Seagrass Steps: The Last Oven',
  world: 'WORLD-09',
  width: 25,
  height: 17,
  music: 'music.town',
  ambience: 'town',
  background: 0x283744,
  spawn: { x: 12, y: 13 },
  floor,
  blocks: riverBlocks,
  zones: [],
  lights: [
    { x: 6, y: 5, r: 65, color: 0xf6b373 },
    { x: 19, y: 5, r: 46, color: 0x74c7bd },
  ],
  stamps: [
    { stamp: 'window', x: 5, y: 1 },
    { stamp: 'window', x: 18, y: 1 },
    { stamp: 'crates', x: 2, y: 11 },
  ],
  npcs: [
    { id: riverPeople.emlet, x: 8, y: 10, facing: 'left' },
    { id: riverPeople.rialla, x: 15, y: 5, facing: 'down' },
    { id: riverPeople.pendlow, x: 5, y: 6, facing: 'right' },
  ],
  interactables: [
    door('home', 'The steps back to Lantern House', 12, 14, centre, 15, 12),
    prop('spool', 'A parcel thread leading to a warm brick', 'fieldgame', 'rivernames.threads', 8, 11, {
      game: 'river-names-spool',
    }),
    prop('stamp', 'Rialla’s stamp with a painted eye', 'fieldgame', 'rivernames.shutter', 16, 5, {
      game: 'river-names-stamp',
    }),
    prop('press', 'Two tide slips and a waiting post bag', 'fieldgame', 'rivernames.sack', 18, 10, {
      game: 'river-names-press',
    }),
    prop(
      'leaves',
      'Three separate source leaves and the two hand stops',
      'fieldgame',
      'rivernames.oven',
      7,
      5,
      { game: 'river-names-leaves' },
    ),
    prop('fold-out', 'The oven skate’s foil press', 'fieldgame', 'rivernames.skate', 9, 5, {
      game: 'river-postmark-out',
    }),
    prop('flour', 'The warm bricks under the burnt arch', 'sign', 'rivernames.oven', 3, 5, {
      text: 'The oven burned down nine winters ago. Someone has dusted the sill with fresh flour. The mark underneath is shaped like a small swimming wing.',
    }),
    prop('bend', 'A crescent fin on the mooring rope', 'sign', 'rivernames.skate', 18, 7, {
      text: 'The little skate follows warm bricks. The map shows where the people actually walked. At the West Rope a small splash can help you find a dry step.',
    }),
  ],
};
export const letterQuay: MapDef = {
  id: namesQuay,
  name: 'Water Commons: The Letter Quay',
  world: 'WORLD-12',
  width: 25,
  height: 17,
  music: 'music.town',
  ambience: 'town',
  background: 0x293c43,
  spawn: { x: 12, y: 13 },
  floor,
  blocks: riverBlocks,
  zones: [],
  lights: [
    { x: 5, y: 5, r: 54, color: 0xd99b77 },
    { x: 17, y: 11, r: 50, color: 0xb1d7ae },
  ],
  stamps: [
    { stamp: 'market-bench', x: 8, y: 5 },
    { stamp: 'water-lantern', x: 17, y: 5 },
    { stamp: 'window', x: 4, y: 1 },
  ],
  npcs: [
    { id: riverPeople.pendlow, x: 13, y: 5, facing: 'left' },
    { id: riverPeople.emlet, x: 8, y: 11, facing: 'down' },
    { id: riverPeople.rialla, x: 16, y: 11, facing: 'right' },
  ],
  interactables: [
    door('bank', 'The way up to the Old Weir', 12, 14, out, 15, 16),
    ...releases.map((r) => {
      const f = faces[r];
      return prop('receive-' + r, f.title, 'fieldgame', f.art, f.x, f.y, {
        game: 'river-names-receive',
        visibleIf: { flag: 'rivernames.packet', eq: r },
      });
    }),
    prop('council', 'The extra stool at the quay table', 'fieldgame', 'rivernames.threads', 12, 5, {
      game: 'river-names-council',
      visibleIf: { flag: 'rivernames.everReceived', eq: true },
    }),
    prop('fold-in', 'Three readers for a folded postmark', 'fieldgame', 'rivernames.sack', 14, 11, {
      game: 'river-postmark-in',
      visibleIf: { flag: 'postmark.sent', eq: true },
    }),
    prop('new-step', 'The neighbour’s landing after closing', 'sign', 'rivernames.shutter', 3, 11, {
      visibleIf: { flag: 'rivernames.council.turn', eq: 'neighbour' },
      text: 'Whoever takes the late basket holds the post key until morning. The stairs have come back onto the chart in the handwriting of the person who climbs them.',
    }),
    prop('stools', 'Two waiting stools by the tide stick', 'sign', 'rivernames.sack', 21, 5, {
      visibleIf: { flag: 'rivernames.council.turn', eq: 'pair' },
      text: 'The two stools face different landings. Their readers will mark what happens on separate rounds. The public board has a space where a later reading can go.',
    }),
  ],
};
export function riverDoors(map: string): Interactable[] {
  if (map === centre)
    return [door('arch', 'The warm arch beside Lantern House', 15, 11, namesLane, 12, 13)];
  if (map === out)
    return [
      door(
        'forwarding',
        'The forwarding door to the Letter Quay',
        15,
        15,
        namesQuay,
        12,
        13,
        canRevisit,
      ),
    ];
  return [];
}
