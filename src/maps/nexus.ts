/**
 * WORLD-01 The Nexus: the recruitment archive hall (spec 5.3, 6.2).
 * A stone hall floating in a starry void. 40 x 20 tiles.
 * West part (x 1-24): the archive hall with the three 'first' exhibits.
 * East wing (x 26-38): the Hall of Firsts, an optional side quest with
 * plaques, each about one person shown with their own place and people, from many periods.
 */
import type { Condition } from '../domain/types';
import type { MapDef } from './types';
import { sceneProp } from './sceneProps';

const W = 40, H = 20;

const ferryShelf: [state: string, art: string, visible: Condition][] = [
  ['shelf', 'board-stand', { not: { flagSet: 'nexus.ferry.packet' } }],
  ['dispatch', 'nile.slip', { all: [{ flagSet: 'nexus.ferry.packet' }, { not: { flagSet: 'nexus.ferry.edition' } }] }],
  ['copies', 'nile.scroll', { flag: 'nexus.ferry.edition', eq: 'copies' }],
  ['reading', 'ledger', { flag: 'nexus.ferry.edition', eq: 'reading' }],
];

function floor(x: number, y: number): string | null {
  if (x < 1 || x > W - 2 || y < 3 || y > H - 1) return null;
  if (y === 3) return x === 1 ? 'stone-tl' : x === W - 2 ? 'stone-tr' : 'stone-t';
  if (y === H - 1) return x === 1 ? 'stone-bl' : x === W - 2 ? 'stone-br' : 'stone-b';
  if (x === 1) return 'stone-l';
  if (x === W - 2) return 'stone-r';
  return 'stone-c';
}

export const NEXUS: MapDef = {
  id: 'nexus.archive',
  name: 'The Nexus: Archive Hall',
  world: 'WORLD-01',
  width: W, height: H,
  music: 'music.archive',
  ambience: 'archive',
  background: 0x120f24,
  floor: (x, y) => {
    if (y >= 0 && y <= 2 && x >= 1 && x <= W - 2) return y === 0 ? 'wall-top' : y === 1 ? 'wall-mid' : 'wall-base';
    return floor(x, y);
  },
  stamps: [
    { stamp: 'bookshelf', x: 1, y: 1 },
    { stamp: 'bookshelf', x: 18, y: 1 },
    { stamp: 'bookshelf', x: 21, y: 1 },
    { stamp: 'banners', x: 8, y: 1 },
    { stamp: 'banners', x: 16, y: 1 },
    { stamp: 'rug-green', x: 11, y: 10 },
    { stamp: 'plant-tall', x: 2, y: 4 },
    { stamp: 'plant-tall', x: 23, y: 4 },
    { stamp: 'plant-tall', x: 2, y: 17 },
    { stamp: 'statue', x: 22, y: 12 },
    { stamp: 'long-table', x: 19, y: 16 },
    { stamp: 'cabinet', x: 23, y: 15 },
    { stamp: 'table', x: 2, y: 12 },
    { stamp: 'plant-tall', x: 23, y: 9 },
    { stamp: 'bench', x: 7, y: 14 },
    { stamp: 'bench', x: 15, y: 15 },
    { stamp: 'crates', x: 22, y: 17 },
    // East wing: the Hall of Firsts
    { stamp: 'banners', x: 30, y: 1 },
    { stamp: 'bookshelf', x: 34, y: 1 },
    { stamp: 'rug-green', x: 30, y: 10 },
    { stamp: 'plant-tall', x: 25, y: 8 },
    { stamp: 'plant-tall', x: 25, y: 14 },
    { stamp: 'plant-tall', x: 37, y: 17 },
    { stamp: 'bench', x: 31, y: 15 },
  ],
  blocks: [
    [0, 0, 1, H], [W - 1, 0, 1, H],   // side edges
    [1, 0, W - 2, 3],                   // north wall
    [0, H, W, 1],
    [11, 3, 1, 2], [14, 3, 1, 2],      // portal posts
  ],
  npcs: [
    { id: 'warden-ise', x: 12, y: 11, facing: 'down' },
    { id: 'curator-dace', x: 4, y: 8, facing: 'right' },
    { id: 'clerk-venn', x: 20, y: 8, facing: 'left' },
    { id: 'kip-arden', x: 6, y: 15, facing: 'right' },
    { id: 'villager-2', x: 17, y: 13, facing: 'up' },
    { id: 'archivist-tull', x: 35, y: 13, facing: 'down' },
    { id: 'visitor-sol', x: 29, y: 8, facing: 'up' },
    // Origin side quests (spec 35.1): each giver appears only for that origin.
    { id: 'cataloguer-bela', x: 6, y: 12, facing: 'down', visibleIf: { origin: 'archive' } },
    { id: 'translator-lio', x: 24, y: 13, facing: 'right', visibleIf: { origin: 'traveller' } },
  ],
  interactables: [
    ...sceneProp('nexus.entrance-guide', 13, 17, 'the entrance guide stand', 'board-stand',
      { record: 'ledger', use: 'nile.slip' }),
    ...sceneProp('nexus.loan-slip', 11, 8, 'the model loan slip', 'nile.slip',
      { alias: 'nile.scroll', number: 'ledger' }),
    ...sceneProp('nexus.translation-slip', 15, 8, 'the two translators’ proofs', 'nile.slip',
      { date: 'ledger', gloss: 'nile.scroll' }),
    ...sceneProp('nexus.route-board', 18, 14, 'the visitors’ route board', 'cork-board',
      { objects: 'nile.map', sources: 'ledger' }),
    // One shelf carries the request, the prepared envelope and the edition kept for visitors.
    ...ferryShelf.map(([state, art, condition]) => ({
      id: `nexus.ferry.${state}`, kind: 'scene' as const, node: `nexus.ferry.${state}`,
      x: 16, y: 14, w: 1, h: 1, label: 'the reading shelf', walkThrough: true, art,
      visibleIf: { all: [{ flag: 'nexus.ferry.started', eq: true }, condition] },
    })),
    { id: 'nile-stone-case', kind: 'exhibit', exhibit: 'OBJ-NILE-STONE', x: 31, y: 17, w: 1, h: 1, walkThrough: true, label: 'the Singapore Stone fragment', art: 'nile.stone', visibleIf: { flag: 'nile.returned', eq: true } },
    { id: 'nile-badang-case', kind: 'exhibit', exhibit: 'OBJ-NILE-BADANG', x: 34, y: 17, w: 1, h: 1, walkThrough: true, label: 'the Badang account', art: 'nile.scroll', visibleIf: { flag: 'nile.returned', eq: true } },
    { id: 'nile-stone-label', kind: 'label', kit: 'nile-stone', x: 36, y: 17, w: 1, h: 1, walkThrough: true, label: 'the river records label stand', art: 'label-stand', visibleIf: { flag: 'nile.returned', eq: true } },
    ...([
      ['voices', 32, 'The stoppage leads. Beside it, a dated slip traces one payment and the next protest.'],
      ['payment', 32, 'The grain payment leads. Right beside it, the renewed protest keeps a visitor from mistaking payment for a settlement.'],
    ] as const).map(([choice, x, text]) => ({ id: 'nile-worker-tag-' + choice, kind: 'sign' as const, x, y: 8, w: 1, h: 1, walkThrough: true, label: 'the heading on the workers’ slips', text, art: 'nile.slip',
      visibleIf: { all: [{ flag: 'nile.dispatch', eq: 'read' }, { flag: 'nile.returned', eq: true }, { flag: 'nile.workerLead', eq: choice }] } })),
    ...([
      ['cast', 27, 'The cast arrived intact with the slower cart. The apprentice sets it next to the quick note and invites visitors to compare weight and texture.'],
      ['copy', 27, 'The quick courier brought the paper copy. The cast stays in the archive. A visitor can look for marks here, but cannot weigh them.'],
    ] as const).map(([choice, x, text]) => ({ id: 'nile-delivery-tag-' + choice, kind: 'sign' as const, x, y: 10, w: 1, h: 1, walkThrough: true, label: 'the tag from the model route', text, art: 'nile.slip',
      visibleIf: { all: [{ flag: 'nile.dispatch', eq: 'pair' }, { flag: 'nile.returned', eq: true }, { flag: 'nile.routeLead', eq: choice }] } })),

    { id: 'door-without-a-name', kind: 'door', x: 37, y: 2, w: 1, h: 1, label: 'the Door Without a Name', art: 'nile.door',
      visibleIf: { all: [{ flag: 'study.letter', eq: true }, { objective: 'm02.o8.ise' }] }, flag: 'nile.arrived', to: { map: 'nile.hall', x: 12, y: 10 } },
    { id: 'preserved-door', kind: 'door', x: 38, y: 15, w: 1, h: 1, label: 'the door to the Cold Store', art: 'preserved.door',
      walkThrough: true, visibleIf: { flag: 'nile.returned', eq: true }, flag: 'preserved.arrived',
      to: { map: 'preserved.archive', x: 14, y: 14 } },
    { id: 'observatory-door', kind: 'door', x: 28, y: 17, w: 1, h: 1, label: 'the waypost to the Observatory Coast', art: 'coast.waypost',
      walkThrough: true, visibleIf: { objective: 'preserved.publish' }, flag: 'coast.arrived',
      to: { map: 'observatory.harbour', x: 13, y: 16 } },
    { id: 'forest-door', kind: 'door', x: 25, y: 17, w: 1, h: 1, label: 'the passage to the Living Forest', art: 'forest.waypost',
      walkThrough: true, visibleIf: { objective: 'coast.revise' }, flag: 'forest.arrived',
      to: { map: 'forest.station', x: 12, y: 12 } },
    { id: 'metalworks-door', kind: 'door', x: 22, y: 15, w: 1, h: 1, label: 'the passage to the Metalworks', art: 'metalworks.waypost',
      walkThrough: true, visibleIf: { objective: 'forest.finish' }, flag: 'metal.arrived',
      to: { map: 'metalworks.yard', x: 12, y: 12 } },
    { id: 'preserved-return-desk', kind: 'sign', x: 37, y: 16, w: 1, h: 1, label: 'the Cold Store reference copy', art: 'ledger', walkThrough: true,
      text: 'The docket points to the separate royal and coastal records. One line is left open for the transfer we cannot trace.',
      visibleIf: { flag: 'preserved.reply', eq: 'desk' } },
    { id: 'preserved-return-margin', kind: 'sign', x: 37, y: 16, w: 1, h: 1, label: 'the Cold Store reference slips', art: 'nile.slip', walkThrough: true,
      text: 'Two slips cite two records. The gap in the royal chain stays on the royal slip. The limits of the coastal comparison travel with the other.',
      visibleIf: { flag: 'preserved.reply', eq: 'margin' } },
    ...([
      ['print', 34, 'the corrected public case', 'The old heading is crossed out. Both dates stay in the case.', 'nile.tablet'],
      ['read', 31, 'the workers’ reading table', 'Two slips sit side by side. Amunnakht’s name is on both. Beside them is an empty chair.', 'nile.scroll'],
      ['pair', 28, 'the workshop’s paired display', 'One tag names the ancient map. Another states what the model tested, and what it cannot say about the past.', 'nile.map'],
    ] as const).map(([route, x, label, text, art]) => ({ id: 'nile-outcome-' + route, kind: 'sign' as const, x, y: 8, w: 1, h: 1, walkThrough: true, label, text, art,
      visibleIf: { all: [{ flag: 'nile.dispatch', eq: route }, { flag: 'nile.returned', eq: true }] } })),

    { id: 'secret-misfiled', kind: 'secret', secret: 'misfiled', x: 22, y: 3, w: 1, h: 1, label: 'a gap behind the bookshelf' },
    { id: 'ex-a', kind: 'exhibit', exhibit: 'OBJ-001-A', x: 8, y: 7, w: 1, h: 1, label: 'the patent drawing', art: 'pedestal.patent' },
    { id: 'ex-b', kind: 'exhibit', exhibit: 'OBJ-001-B', x: 12, y: 7, w: 2, h: 1, label: 'the workshop model', art: 'pedestal.model' },
    { id: 'ex-c', kind: 'exhibit', exhibit: 'OBJ-001-C', x: 17, y: 7, w: 1, h: 1, label: 'the Biro pen record', art: 'pedestal.biro' },
    { id: 'bench', kind: 'bench', x: 19, y: 16, w: 3, h: 2, label: 'the workshop bench (marking test)' },
    { id: 'label-pen', kind: 'label', kit: 'pen', x: 10, y: 15, w: 1, h: 1, label: 'the label stand', art: 'label-stand' },
    { id: 'waystone', kind: 'waystone', place: 'Nexus archive hall', x: 2, y: 9, w: 1, h: 1, label: 'the Waystone (save and rest)', art: 'waystone' },
    ...([['OBJ-101', 'eratosthenes'], ['OBJ-102', 'haytham'], ['OBJ-103', 'bisheng'], ['OBJ-104', 'sikdar'], ['OBJ-105', 'santos'], ['OBJ-106', 'sheppard'], ['OBJ-107', 'wollstonecraft']] as const)
      .map(([ex, key], i) => ({ id: `plaque-${key}`, kind: 'exhibit' as const, exhibit: ex, kit: `first.${key}`, x: 27 + i * 2, y: 5, w: 1, h: 1, label: 'a plaque in the Hall of Firsts', art: 'plaque' })),
    { id: 'sign-hall', kind: 'sign', x: 26, y: 12, w: 1, h: 1, label: 'the Hall of Firsts sign', art: 'signpost',
      text: 'THE HALL OF FIRSTS. Every plaque here says "the first". First at what? Repair a plaque by choosing what kind of first it was, and what we do not know.' },
    { id: 'alcove-firsts', kind: 'alcove', alcove: 'firsts', x: 27, y: 14, w: 1, h: 1, label: 'the Alcove of Firsts (exhibition)', art: 'alcove', visibleIf: { objective: 'm01.o6.label' } },
    { id: 'title-lock', kind: 'lock', lock: 'inventor', x: 37, y: 13, w: 1, h: 1, label: 'the Title Lock (EE practice)', art: 'title-lock', visibleIf: { objective: 'm01.o6.label' } },
    { id: 'claim-board', kind: 'label', kit: 'ee.inventor', x: 33, y: 16, w: 1, h: 1, label: "Tull's claim board", art: 'label-stand', visibleIf: { objective: 'ee1.o3.weigh' } },
    // Lorelings (spec 36.1): three places to watch the Glimmermoth. They go when it is a friend.
    ...([['lamp', 7, 8, 'the glimmer by the patent drawing'], ['desk', 4, 13, 'the glimmer at the reading table'], ['case', 22, 14, 'the glimmer by the glass cabinet']] as const)
      .map(([sg, x, y, label]) => ({ id: `lor-${sg}`, kind: 'loreling' as const, loreling: 'glimmermoth', sighting: sg, x, y, w: 1, h: 1, label, visibleIf: { not: { flag: 'lor.glimmermoth.friend', eq: true } } })),
    // One knowledge-gated door (spec 12.23): it opens with the Date-Kind Lens and an understanding of date kinds.
    { id: 'timeline-door', kind: 'puzzle', puzzle: 'timeline-door', x: 5, y: 2, w: 1, h: 1, label: 'the Timeline Door', art: 'timeline-door',
      artOpen: { key: 'timeline-door.open', if: { flag: 'puzzle.timeline-door.done', eq: true } } },
    { id: 'round-window', kind: 'puzzle', puzzle: 'round-window', x: 24, y: 2, w: 1, h: 1, label: 'the unfinished round window', art: 'round-window',
      artOpen: { key: 'round-window.done', if: { flag: 'puzzle.round-window.done', eq: true } } },
    { id: 'diving-bell', kind: 'dive', x: 4, y: 16, w: 1, h: 1, label: 'the Diving Bell (the Deep Dive, daily)', art: 'diving-bell' },
    { id: 'quarters-door', kind: 'quarters', x: 18, y: 2, w: 1, h: 1, label: 'the door to your quarters', art: 'quarters-door' },
    { id: 'sign-portal', kind: 'sign', x: 10, y: 4, w: 1, h: 1, label: 'the portal sign', art: 'signpost',
      text: 'PORTAL TO AETHELGARD. Opens for Guardians on assignment.' },
  ],
  zones: [
    { id: 'portal', x: 12, y: 3, w: 2, h: 2, if: { objective: 'm01.o6.label' }, to: { map: 'aethelgard.emberford', x: 20, y: 21 } },
  ],
  lights: [
    { x: 12.5, y: 3.5, r: 70, color: 0x8fd3ff },
    { x: 8.5, y: 7, r: 34, color: 0xffd28a, flicker: true },
    { x: 13, y: 7, r: 34, color: 0xffd28a, flicker: true },
    { x: 17.5, y: 7, r: 34, color: 0x9fe8ff, flicker: true },
    { x: 20.5, y: 16.5, r: 46, color: 0xffb36b, flicker: true },
    { x: 3, y: 2, r: 50, color: 0xffcf8a },
    { x: 22, y: 2, r: 50, color: 0xffcf8a },
    { x: 12.5, y: 11.5, r: 60, color: 0xfff0c8 },
    { x: 2.5, y: 9.5, r: 34, color: 0x8fd3ff, flicker: true },
    { x: 33, y: 5.5, r: 90, color: 0xffd28a },
    { x: 32, y: 12, r: 70, color: 0xfff0c8 },
    { x: 36, y: 13.5, r: 40, color: 0xffd28a, flicker: true },
  ],
  spawn: { x: 12, y: 17 },
};
