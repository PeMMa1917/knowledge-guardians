/**
 * WORLD-02 Aethelgard: the old ferry road and the ferry folk's landing, east of Emberford.
 * A pathway that a keepsake opens: Kip's map beside Elsbet's map shows the forgotten road
 * (flag clue.oldmap.folded-map). The ferry folk are their own people, with their own river cant
 * (an invented language) and their own knowledge of the river. 26 x 14 tiles. Fictional world.
 * Tiles with no floor show the background colour: here, the river.
 */
import { FERRY_FIELD_BADGES } from './fieldBadges';
import type { Condition } from '../domain/types';
import { specimenEquipped } from '../domain/specimenGear';
import { FERRY_PACKING_DOOR } from './ferryPacking';
import { WARM_FERRY_RETURNS } from './warmRoom';
import { FERRY_KETTLE } from './ferryKettle';
import { FERRY_WINDOW_DOOR } from './ferryWindow';
import type { MapDef } from './types';

const W = 26, H = 14;
const RIVER = 9; // first row of water
const departureCases: Condition = { all: [{ card: 'card.departure.tupaia' }, { card: 'card.departure.reading' }] };
const departureTag: Condition = { flag: 'departure.ferry.tag', eq: true };
const departureUndecided: Condition = { not: { flagSet: 'departure.ferry.route' } };
const tupaiaWorking = specimenEquipped('bl:add-ms-21593-c');

function floor(x: number, y: number): string | null {
  if (x < 0 || x >= W || y < 0 || y >= H) return null;
  if (x >= 11 && x <= 13 && y >= RIVER && y <= 11) return 'stone-c'; // the jetty
  if (y >= RIVER) return null;
  if (y >= 4 && y <= 5 && x <= 12) return 'stone-c'; // the old road, grass at its edges
  return 'grass';
}

export const FERRY: MapDef = {
  id: 'aethelgard.ferry',
  name: 'Aethelgard: the old ferry landing',
  world: 'WORLD-02',
  width: W, height: H,
  music: 'music.town',
  ambience: 'town',
  background: 0x2b6f9a,
  floor,
  stamps: [
    { stamp: 'house-b', x: 16, y: 1 },
    { stamp: 'tree', x: 2, y: 0 }, { stamp: 'tree', x: 8, y: 1 }, { stamp: 'tree', x: 23, y: 2 }, { stamp: 'tree', x: 4, y: 7 },
    { stamp: 'bush', x: 14, y: 3 }, { stamp: 'bush', x: 22, y: 7 }, { stamp: 'bush', x: 1, y: 7 },
    { stamp: 'crates', x: 14, y: 7 }, { stamp: 'barrel', x: 10, y: 8 }, { stamp: 'barrel', x: 16, y: 7 },
    { stamp: 'bench', x: 19, y: 6 },
    { stamp: 'flowers-white', x: 7, y: 7 }, { stamp: 'flowers-white', x: 21, y: 1 },
  ],
  blocks: [[-1, 0, 1, H], [W, 0, 1, H], [0, -1, W, 1], [0, H, W, 1]],
  npcs: [
    { id: 'ferry-tova', x: 12, y: 8, facing: 'up' },
    { id: 'ferry-cook', x: 4, y: 6, facing: 'up' },
  ],
  interactables: [
    ...FERRY_FIELD_BADGES,
    ...FERRY_KETTLE,
    FERRY_PACKING_DOOR,
    ...WARM_FERRY_RETURNS,
    FERRY_WINDOW_DOOR,
    { id: 'field-trade', kind: 'fieldgame', game: 'trade', x: 13, y: 3, w: 1, h: 1, label: 'a spare carrier tag on the ferry step (The Spare Tag)', art: 'guest-book' },
    { id: 'cross-lamb', kind: 'fieldgame', game: 'cross-lamb', x: 10, y: 5, w: 1, h: 1, label: 'the lamb on the old ford stone (a crossing)', art: 'flood-post' },
    { id: 'ferry-copy-ledger', kind: 'scene', node: 'tova.nexus-copy.ledger', x: 11, y: 7, w: 1, h: 1,
      label: 'the landing book with the Nexus packet', art: 'ledger', walkThrough: true,
      visibleIf: { flag: 'ferry.copy.place', eq: 'ledger' } },
    { id: 'ferry-copy-slate', kind: 'scene', node: 'tova.nexus-copy.slate', x: 14, y: 5, w: 1, h: 1,
      label: 'Tova’s note by the water slate', art: 'nile.slip', walkThrough: true,
      visibleIf: { flag: 'ferry.copy.place', eq: 'slate' } },
    { id: 'ferry-road-back', kind: 'door', x: 0, y: 4, w: 1, h: 2, label: 'the road back to Emberford', art: 'road-post', to: { map: 'aethelgard.emberford', x: 38, y: 18 } },
    { id: 'secret-star-names', kind: 'secret', secret: 'star-names', x: 22, y: 8, w: 1, h: 1, label: 'something glinting in the reeds' },
    { id: 'clay-bank', kind: 'gather', resource: 'clay', x: 9, y: 8, w: 1, h: 1, label: 'the clay bank (gather)', art: 'clay-bank' },
    { id: 'reeds-ferry', kind: 'gather', resource: 'reed', x: 19, y: 8, w: 1, h: 1, label: 'the tall reeds (gather)', art: 'reeds' },
    { id: 'barter-boat', kind: 'trader', x: 17, y: 8, w: 1, h: 1, label: "Wenna's barter boat (dyes and materials)", art: 'barter-boat' },
    { id: 'ferry-dice', kind: 'fieldgame', game: 'bones', x: 4, y: 3, w: 1, h: 1, label: "Juno's dice table (Lanterns and Bones)", art: 'dice-table' },
    { id: 'ferry-guest-book', kind: 'fieldgame', game: 'guests', x: 12, y: 5, w: 1, h: 1, label: "Tova's ferry guest book", art: 'guest-book' },
    { id: 'ferry-waystone', kind: 'waystone', place: 'the old ferry landing', x: 6, y: 3, w: 1, h: 1, label: 'the Waystone by the old road (save and rest)', art: 'waystone' },
    { id: 'ferry-camp-sign', kind: 'sign', x: 15, y: 5, w: 1, h: 1, label: 'the ferry folk\'s board', art: 'ferry-slate', flag: 'ferry.board',
      text: 'A slate board, written in the river cant and in town words. TODAY: slow water. The ford is good for walkers, not for carts. The next boat goes when the water says, not when the bell says. Ask Tova.' },
    { id: 'ferry-departure-catalogue', kind: 'exhibit', exhibit: 'OBJ-DEPART-TUPAIA', x: 8, y: 3, w: 1, h: 1,
      label: 'two records of Tupaia’s chart copy', art: 'departure.catalogue', walkThrough: true },
    { id: 'ferry-departure-reading', kind: 'exhibit', exhibit: 'OBJ-DEPART-READING', x: 9, y: 5, w: 1, h: 1,
      label: 'a proposed reading beside the chart records', art: 'departure.catalogue', walkThrough: true },
    { id: 'ferry-tupaia-return', kind: 'scene', node: 'departure.ferry.tupaia-return', x: 7, y: 6, w: 1, h: 1,
      art: 'departure.peg', walkThrough: true, label: 'Tova’s spare return hook',
      visibleIf: { all: [tupaiaWorking, { not: { flagSet: 'departure.tupaia.plan' } }] } },
    { id: 'ferry-tupaia-footpath', kind: 'door', x: 8, y: 7, w: 1, h: 1, art: 'departure.peg-marked', walkThrough: true,
      label: 'the marked low footpath to the dock stair', to: { map: 'aethelgard.ferry', x: 12, y: 11 }, flag: 'departure.tupaia.crossed',
      visibleIf: { flag: 'departure.tupaia.plan', eq: 'path' } },
    { id: 'ferry-tupaia-low-reply', kind: 'sign', x: 13, y: 11, w: 1, h: 1, art: 'departure.strip', walkThrough: true,
      label: 'the footpath’s named arrival mark', flag: 'departure.tupaia.used', visibleIf: { flag: 'departure.tupaia.crossed', eq: true },
      text: 'This peg is the arrival by the Dock Stair. The low path begins at Tova’s return hook. The next carrier can take the marked route from that side.' },
    { id: 'ferry-tupaia-bench-reply', kind: 'sign', x: 20, y: 5, w: 1, h: 1, art: 'departure.strip', walkThrough: true,
      label: 'Wenna’s two starting notes', flag: 'departure.tupaia.used', visibleIf: { flag: 'departure.tupaia.plan', eq: 'bench' },
      text: 'Wenna clips an old-road note and a dock-stair note to separate ends. A carrier who comes the other way pulls the strip for their own starting place.' },
    { id: 'ferry-departure-table', kind: 'scene', node: 'departure.ferry.table', x: 13, y: 6, w: 1, h: 1,
      label: 'Tova’s carrier tag for the wick bundle', art: 'departure.strip', walkThrough: true,
      visibleIf: { all: [departureCases, { not: departureTag }] } },
    { id: 'ferry-departure-road', kind: 'scene', node: 'departure.ferry.road', x: 5, y: 5, w: 1, h: 1,
      label: 'the old-road starting marker', art: 'departure.peg', walkThrough: true, visibleIf: departureTag,
      artOpen: { key: 'departure.peg-marked', if: { flag: 'departure.ferry.road', eq: true } } },
    { id: 'ferry-departure-stair', kind: 'scene', node: 'departure.ferry.stair', x: 12, y: 10, w: 1, h: 1,
      label: 'the landing-stair starting marker', art: 'departure.peg', walkThrough: true, visibleIf: departureTag,
      artOpen: { key: 'departure.peg-marked', if: { flag: 'departure.ferry.stair', eq: true } } },
    { id: 'ferry-departure-dispatch', kind: 'scene', node: 'departure.ferry.dispatch', x: 13, y: 6, w: 1, h: 1,
      label: 'Tova’s wick handoff table', art: 'departure.strip', walkThrough: true,
      visibleIf: { all: [{ objective: 'departure.ferry.compare' }, departureUndecided] } },
    { id: 'ferry-departure-paired', kind: 'scene', node: 'departure.ferry.pair-check', x: 6, y: 6, w: 1, h: 1,
      label: 'the evening carrier’s receipt at the old road', art: 'preserved.display-paired', walkThrough: true,
      visibleIf: { flag: 'departure.ferry.route', eq: 'paired' },
      artOpen: { key: 'departure.strip', if: { flag: 'departure.ferry.receipt', eq: 'paired' } } },
    { id: 'ferry-departure-wenna', kind: 'scene', node: 'departure.ferry.wenna-check', x: 18, y: 8, w: 1, h: 1,
      label: 'Wenna’s signed tag at the barter boat', art: 'preserved.slip', walkThrough: true,
      visibleIf: { flag: 'departure.ferry.route', eq: 'named' },
      artOpen: { key: 'departure.strip', if: { flag: 'departure.ferry.receipt', eq: 'named' } } },
    { id: 'ferry-departure-archive-index', kind: 'sign', x: 22, y: 5, w: 1, h: 1, walkThrough: true,
      label: 'the Bell Archive’s cross-index tab at the ferry', art: 'preserved.display-paired',
      visibleIf: { flag: 'departure.archive.readback', eq: 'cross' },
      text: 'Bell Archive, W-17. The two drawer tabs point to the wick receipt. Tova copies both names on the back of the ferry’s tag so the next carrier can go straight to the right drawer.' },
    { id: 'ferry-departure-archive-desk', kind: 'sign', x: 22, y: 5, w: 1, h: 1, walkThrough: true,
      label: 'the Bell Archive’s lending request at the ferry', art: 'preserved.slip',
      visibleIf: { flag: 'departure.archive.readback', eq: 'desk' },
      text: 'Bell Archive, W-17. Tova leaves the keeper’s reply on a hook for the next rider. Bring either slip when the desk is open. The keeper looks up the original and can check which peg Wenna means.' },
    { id: 'ferry-departure-file-return', kind: 'scene', node: 'departure.ferry.file-return', x: 21, y: 4, w: 1, h: 1,
      label: 'Wenna’s packing ledger and the returned tag', art: 'ledger', walkThrough: true,
      visibleIf: { all: [{ objective: 'departure.archive.checked' }, { flag: 'perspective.active', eq: 'departure-strip' }] },
      artOpen: { key: 'departure.strip', if: { flag: 'departure.ferry.clipped', eq: true } } },
  ],
  zones: [{ id: 'ferry', x: 0, y: 0, w: W, h: H }],
  lights: [
    { x: 12.5, y: 10, r: 50, color: 0x9fe8ff },
    { x: 18.5, y: 4.5, r: 40, color: 0xffd98a, flicker: true },
  ],
  spawn: { x: 1, y: 4 },
};
