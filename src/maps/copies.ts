/** A fictional city where the archive, press and landing share written notices. */
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';
import { COPIES_ARCHIVE_BACKBILL, COPIES_PRESS_BACKBILL } from './backbill';
import { COPIES_WELCOME } from './welcome';
import { carriedFrame } from './sharedCarry';
import { COPIES_ARCHIVE_CITATION_RAIL, COPIES_PRESS_CITATION_RAIL } from './citationRail';
import { LANDING_SAME_RED, PRESS_SAME_RED } from './sameRed';

type CitySite = Pick<MapDef, 'id' | 'name' | 'width' | 'height' | 'background' | 'spawn'
  | 'npcs' | 'interactables' | 'stamps' | 'lights'>;

function interior(plan: CitySite): MapDef {
  return {
    ...plan,
    world: 'WORLD-08', music: 'music.archive', ambience: 'study',
    floor: (x, y) => {
      if (x < 1 || y < 0 || x >= plan.width - 1 || y >= plan.height) return null;
      if (y === 0) return 'wall-top';
      if (y === 1) return 'wall-mid';
      if (y === 2) return 'wall-base';
      return 'stone-c';
    },
    blocks: [[1, 0, plan.width - 2, 3]], zones: [],
  };
}

function door(id: string, x: number, y: number, label: string, to: NonNullable<Interactable['to']>): Interactable {
  return { id, kind: 'door', x, y, w: 1, h: 1, label, to, art: 'copies.waypost' };
}

function print(id: string, x: number, y: number, label: string, art: string, text: string,
  options: { flag?: string; visibleIf?: Condition } = {}): Interactable {
  return { id, kind: 'sign', x, y, w: 1, h: 1, label, art, text, walkThrough: true, ...options };
}

function translationProp(id: string, x: number, y: number, label: string, art: string, node: string,
  visibleIf?: Condition): Interactable {
  return { id, kind: 'scene', x, y, w: 1, h: 1, label, art, node, walkThrough: true, visibleIf };
}

const translationUnfiled: Condition = { not: { flagSet: 'copies.translation.edition' } };
const translationPlain: Condition = { flag: 'copies.translation.edition', eq: 'plain' };
const translationPaired: Condition = { flag: 'copies.translation.edition', eq: 'paired' };
const marginUnsent: Condition = { not: { flagSet: 'copies.margin.sent' } };
const marginShort: Condition = { flagSet: 'copies.margin.short' };
const marginWide: Condition = { flagSet: 'copies.margin.wide' };
const carryLaneReserved: Condition = { flag: 'copies.carry.phase', in: ['lift', 'upper'] };

function shortCarryLane(id: string, x: number, landing: number): Interactable {
  return {
    ...door(id, x, 11, 'the short lane by the keeper’s rail', { map: 'copies.landing', x: landing, y: 11 }),
    art: 'voices.railing', artOpen: { key: 'shared-carry.barrier', if: carryLaneReserved },
    openIf: { not: carryLaneReserved },
    text: 'Both keepers are with the frame. Use the ordinary steps until Mina waves the short lane open.',
  };
}

export const COPIES_ARCHIVE = interior({
  id: 'copies.archive', name: 'City of Copies: Record Room', width: 26, height: 16,
  background: 0x302b46, spawn: { x: 12, y: 12 }, npcs: [],
  stamps: [
    { stamp: 'bookshelf', x: 1, y: 3 }, { stamp: 'bookshelf', x: 22, y: 3 },
    { stamp: 'window', x: 8, y: 1 }, { stamp: 'window', x: 16, y: 1 },
    { stamp: 'long-table', x: 9, y: 5 }, { stamp: 'bench', x: 19, y: 11 },
    { stamp: 'cabinet', x: 2, y: 9 }, { stamp: 'plant-tall', x: 23, y: 12 },
    { stamp: 'rug-green', x: 11, y: 10 },
  ],
  interactables: [
    ...COPIES_ARCHIVE_BACKBILL,
    ...COPIES_ARCHIVE_CITATION_RAIL,
    door('copies-press-path', 4, 3, 'the west passage to the press', { map: 'copies.press', x: 11, y: 12 }),
    door('copies-landing-path', 21, 3, 'the east steps to the landing', { map: 'copies.landing', x: 12, y: 12 }),
    { ...door('copies-nexus-return', 12, 15, 'the crossing back to the Nexus', { map: 'nexus.archive', x: 21, y: 13 }),
      art: 'preserved.door' },
    { id: 'copies-archive-waystone', kind: 'waystone', x: 7, y: 12, w: 1, h: 1,
      label: 'the Record Room Waystone', place: 'the Record Room', art: 'waystone' },
    print('copies-source', 12, 7, 'the Lending Clerk’s trial log', 'copies.source',
      'During Tuesday’s trial, the return-slip line moved faster. — Lending Clerk, trial log',
      { flag: 'copies.source' }),
    print('copies-route-book', 17, 10, 'the delivery route book', 'ledger',
      'The press sends whole sheets to the lending hall door. Runners take small strips past the landing stalls and return to the hall with the copies they’ve updated.',
      { flag: 'copies.route-book' }),
    print('copies-admission-register', 16, 8, 'the signed admission register', 'preserved.catalogue',
      'Lending Hall admission register. Any reader may enter. At the returns desk a slip links the book to its loan. Signed by the Lending Clerk at opening.',
      { flag: 'stage.transfer.rule', visibleIf: { flag: 'stage.transfer.started', eq: true } }),
    print('copies-directory', 10, 11, 'the Record Room directory', 'copies.waypost',
      'Record Room. The original trial log is on the middle stand. The west passage leads to the press. The east steps lead to the landing. The small mending file sits by the cabinet.'),
    translationProp('copies-translation-file', 5, 9, 'the menders’ fold and register', 'preserved.folder', 'copies.translation.file'),
  ],
  lights: [
    { x: 12, y: 7, r: 72, color: 0xffd5a6 }, { x: 4, y: 5, r: 52, color: 0xe6c7d5 },
    { x: 21, y: 5, r: 52, color: 0xafd8dd }, { x: 17, y: 10, r: 47, color: 0xc9cfca },
  ],
});

export const COPIES_PRESS = interior({
  id: 'copies.press', name: 'City of Copies: Print Workshop', width: 24, height: 15,
  background: 0x3b303a, spawn: { x: 11, y: 12 },
  npcs: [{ id: 'copies-presskeeper', x: 11, y: 6, facing: 'down' }],
  stamps: [
    { stamp: 'window', x: 7, y: 1 }, { stamp: 'window', x: 15, y: 1 },
    { stamp: 'cabinet', x: 2, y: 3 }, { stamp: 'long-table', x: 16, y: 6 },
    { stamp: 'long-table', x: 5, y: 6 }, { stamp: 'crates', x: 19, y: 4 },
    { stamp: 'crates', x: 2, y: 11 }, { stamp: 'barrel', x: 18, y: 11 },
    { stamp: 'bench', x: 14, y: 11 },
  ],
  interactables: [
    ...COPIES_PRESS_BACKBILL,
    ...COPIES_PRESS_CITATION_RAIL,
    ...PRESS_SAME_RED,
    { id: 'cross-crowd', kind: 'fieldgame', game: 'cross-crowd', x: 9, y: 6, w: 1, h: 1, label: 'the crowd at the press door (a crossing)', art: 'notice-board' },
    door('copies-press-return', 11, 14, 'the passage back to the Record Room', { map: 'copies.archive', x: 4, y: 5 }),
    door('copies-press-to-landing', 22, 9, 'the passage to the landing', { map: 'copies.landing', x: 5, y: 9 }),
    { id: 'copies-compare-press', kind: 'copy-compare', node: 'press', x: 13, y: 8, w: 1, h: 1,
      label: 'the first press proof', art: 'copies.press' },
    { id: 'copies-translation-type', kind: 'label', kit: 'copies.mending-card', x: 8, y: 10, w: 1, h: 1,
      label: 'the press for the mending card', art: 'copies.press', walkThrough: true, visibleIf: { all: [
        translationUnfiled, { card: 'card.copies.mender' }, { card: 'card.copies.reader-fold' },
      ] } },
    translationProp('copies-translation-carrier', 10, 9, 'the carrier’s clip beside the mending press', 'copies.strip',
      'copies.translation.carrier', { all: [translationUnfiled, { flag: 'label.copies.mending-card.holds', eq: true }] }),
    translationProp('copies-translation-workshop-proof', 6, 9, 'the paired mending card on the workshop rack', 'preserved.display-paired',
      'copies.translation.workshop-proof', translationPaired),
    translationProp('copies.margin.short', 17, 8, 'the press’s short runner guide', 'copies.press',
      'copies.margin.short', { not: marginShort }),
    translationProp('copies-margin-short-proof', 17, 8, 'the narrow test proof', 'copies.strip',
      'copies.margin.short.tested', marginShort),
    translationProp('copies.margin.wide', 17, 10, 'the press’s full-width guide', 'copies.press',
      'copies.margin.wide', { not: marginWide }),
    translationProp('copies-margin-wide-proof', 17, 10, 'the wide test proof', 'copies.reprint',
      'copies.margin.wide.tested', marginWide),
    translationProp('copies-margin-press-tray', 20, 7, 'Lark’s tray for the ramp orders', 'preserved.folder',
      'copies.margin.tray', { all: [{ objective: 'copies.margin.compare' }, marginUnsent] }),
  ],
  lights: [
    { x: 11, y: 6, r: 61, color: 0xf6cea1 }, { x: 13, y: 8, r: 55, color: 0xffd0aa },
    { x: 21, y: 9, r: 55, color: 0xb3ccd7 },
  ],
});

const landingWidth = 28;
const landingHeight = 17;

function landingFloor(x: number, y: number): string | null {
  if (x < 0 || y < 0 || x >= landingWidth || y >= landingHeight) return null;
  if (y >= 14) return x >= 10 && x <= 13 ? 'stone-c' : null;
  if (x >= 25 && y >= 10) return null;
  if (x >= 3 && x <= 24 && y >= 6) return 'stone-c';
  return 'grass';
}

export const COPIES_LANDING: MapDef = {
  id: 'copies.landing', name: 'City of Copies: Lending Hall Landing', world: 'WORLD-08',
  width: landingWidth, height: landingHeight, music: 'music.town', ambience: 'town',
  background: 0x3b586a, floor: landingFloor,
  spawn: { x: 12, y: 12 }, blocks: [], zones: [],
  npcs: [{ id: 'copies-lendingkeeper', x: 14, y: 8, facing: 'down' }],
  stamps: [
    { stamp: 'house-a', x: 2, y: 1 }, { stamp: 'gatehouse', x: 13, y: 1 },
    { stamp: 'house-b', x: 20, y: 1 }, { stamp: 'stall', x: 7, y: 3 },
    { stamp: 'bench', x: 16, y: 11 }, { stamp: 'crates', x: 23, y: 11 },
    { stamp: 'barrel', x: 3, y: 12 }, { stamp: 'barrel', x: 9, y: 13 },
    { stamp: 'flowers-white', x: 1, y: 9 }, { stamp: 'flowers-small', x: 3, y: 5 },
  ],
  interactables: [
    ...COPIES_WELCOME,
    ...LANDING_SAME_RED,
    door('copies-landing-return', 12, 15, 'the steps back to the Record Room', { map: 'copies.archive', x: 21, y: 5 }),
    carriedFrame('copies', 'start', 5, 12, 'Mina’s wide-page frame on the delivery hooks'),
    carriedFrame('copies', 'cart', 11, 10, 'the wide-page frame at the first cart rest'),
    carriedFrame('copies', 'cart-turn', 18, 13, 'the wide-page frame at the far cart rest'),
    carriedFrame('copies', 'lift', 15, 13, 'the wide-page frame and the second keeper'),
    carriedFrame('copies', 'low', 21, 13, 'the wide-page frame at the low return counter'),
    carriedFrame('copies', 'upper', 21, 10, 'the wide-page frame at the covered cradle'),
    print('shared-carry-parked-cart', 18, 13, 'the handcart in the overflow space', 'shared-carry.parked',
      'The handcart and its spare straps stay here for the low frame. Mina keeps the extra return tray inside for now.',
      { visibleIf: { flag: 'copies.carry.phase', in: ['done-low', 'read-low'] } }),
    shortCarryLane('shared-carry-lane-near', 15, 22),
    shortCarryLane('shared-carry-lane-far', 21, 14),
    door('copies-landing-to-press', 3, 9, 'the passage back to the press', { map: 'copies.press', x: 21, y: 9 }),
    { id: 'copies-compare-landing', kind: 'copy-compare', node: 'landing', x: 20, y: 9, w: 1, h: 1,
      label: 'the runner’s landing copy', art: 'copies.landing' },
    print('copies-reader-note', 19, 11, 'the reader’s question', 'preserved.slip',
      'At the lending hall I read the words “return-slip line”. I thought I had to bring a slip just to enter. Did that trial observation become a rule?',
      { flag: 'copies.reader', visibleIf: { flagSet: 'copies.response' } }),
    print('copies-response-reprint', 16, 6, 'the new full sheet on the hall door', 'copies.reprint',
      'A new sheet hangs by the lending hall door. Tuesday’s trial and the Lending Clerk’s log appear on the same line. A dated old copy stays in the record pouch.',
      { visibleIf: { flag: 'copies.response', eq: 'reprint' } }),
    print('copies-response-strip', 6, 8, 'the runners’ correction strips', 'copies.strip',
      'Two runners carry small corrections beside the old sheets. Each strip puts the trial time next to the clerk’s log, so the source can travel with the words.',
      { visibleIf: { flag: 'copies.response', eq: 'strip' } }),
    print('copies-followup-notice', 12, 6, 'the reading hall access notice', 'copies.source',
      'Tuesday’s trial recorded a quicker line for returns. The lending hall admits readers whether they carry a slip. Take return slips to the return desk.',
      { visibleIf: { flag: 'copies.followup', eq: true } }),
    { id: 'copies-compare-proof', kind: 'copy-compare', node: 'proof', x: 17, y: 9, w: 1, h: 1,
      label: 'the corrected trial proof', art: 'copies.reprint', walkThrough: true,
      visibleIf: { flag: 'copies.followup', eq: true } },
    print('copies-readable', 20, 12, 'the low reading stand', 'preserved.display-records',
      'A large copy shows the dated trial and the hall’s entry rule on different lines. The log name sits with the trial.',
      { visibleIf: { flag: 'copies.readable', eq: true } }),
    { id: 'copies-transfer-desk', kind: 'scene', x: 13, y: 9, w: 1, h: 1,
      label: 'the admission copy desk', art: 'preserved.folder', walkThrough: true, node: 'stage.transfer.dispatch',
      visibleIf: { all: [{ objective: 'stage.transfer.check' }, { not: { flagSet: 'stage.transfer.notice' } }] } },
    print('copies-transfer-door-line', 15, 7, 'the signed line at the door', 'copies.reprint',
      'You may enter with or without a return slip. See the signed admission register in the Record Room.',
      { visibleIf: { flag: 'stage.transfer.notice', eq: 'door' } }),
    print('copies-transfer-queue-line', 8, 11, 'the returns queue copy', 'copies.strip',
      'Bring a slip to identify the book you’re returning. Readers may enter with or without one. Both lines come from the signed admission register.',
      { visibleIf: { flag: 'stage.transfer.notice', eq: 'queue' } }),
    translationProp('copies-translation-reader', 10, 7, 'the borrowed atlas beside its wrapper', 'preserved.folder',
      'copies.translation.reader'),
    translationProp('copies-translation-landing-proof', 8, 8, 'the mending card by the shared return tray', 'copies.reprint',
      'copies.translation.landing-proof', translationPlain),
    print('copies-margin-master', 23, 7, 'the signed ramp trial order', 'copies.source',
      'Empty carts only on the west ramp, on this shift. Loaded carts use the stone steps hoist. Signed by the landing crew after a trial with an empty cart.',
      { flag: 'copies.margin.master' }),
    translationProp('copies-margin-fold', 23, 9, 'the tie on the folded order at the ramp', 'copies.reprint',
      'copies.margin.fold', { all: [marginUnsent, { flag: 'copies.margin.bundle', eq: 'fold' }] }),
    translationProp('copies-margin-pair', 5, 10, 'the runner’s two hooks at the landing', 'copies.strip',
      'copies.margin.pair', { all: [marginUnsent, { flag: 'copies.margin.bundle', eq: 'pair' }] }),
    print('copies-margin-folded', 23, 9, 'the full order on the ramp board', 'copies.reprint',
      'The whole order is at the ramp. Loaded carts have the hoist directions beside the trial limit. The near queue sees both. The outer stalls wait for runners.',
      { visibleIf: { flag: 'copies.margin.sent', eq: 'fold' } }),
    print('copies-margin-paired', 5, 10, 'the linked order at the runner’s hooks', 'preserved.display-paired',
      'The runner has reached the outer stalls. Each order has a large turn arrow and a matching strip with the trial limit and the crew’s signature.',
      { visibleIf: { flag: 'copies.margin.sent', eq: 'pair' } }),
    print('copies-margin-waited', 23, 9, 'the tray left with the landing crew', 'preserved.folder',
      'The test sheets are in Lark’s tray. A crew member calls directions from the ramp until the runners get a checked copy.',
      { visibleIf: { flag: 'copies.margin.sent', eq: 'wait' } }),
  ],
  lights: [
    { x: 16, y: 6, r: 65, color: 0xcce0d9 }, { x: 20, y: 9, r: 65, color: 0xadd7dc },
    { x: 6, y: 8, r: 62, color: 0xf6d99e }, { x: 12, y: 13, r: 51, color: 0xb2dccc },
  ],
};
