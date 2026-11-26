import { sefaDispatchDesk } from './sefaDispatch';
import { EMBERFORD_PIGMENT_WINDOW } from './pigmentWindow';
import { EMBERFORD_PIGMENT_SAMPLE } from './pigmentSample';
import { PRICE_DRAWERS_RETURNS } from './priceDrawers';
import { JIG_EMBERFORD_RETURNS } from './jigShop';
/**
 * WORLD-02 Aethelgard: Emberford, a guild town (spec 5.4).
 * Fantasy world. Nothing here is a historical record unless an exhibit is
 * labelled "Documented" with a source. 40 x 28 tiles.
 */
import { EMBERFORD_FIELD_ORDER } from './fieldBadges';
import type { Condition } from '../domain/types';
import { eastWellSlipAt } from '../domain/rumours';
import type { Interactable, MapDef } from './types';
import { sceneProp } from './sceneProps';
import { EMBERFORD_LANTERN_FAIR } from './lanternfair';
import { EMBERFORD_BACKBILL } from './backbill';
import { EMBERFORD_DOOR_FOLD } from './doorFold';
import { EMBERFORD_DRAWER_CASES } from './drawerCases';
import { EMBERFORD_BASKET } from './marketBasket';
import { EMBERFORD_BRIDGE_PROOF } from './bridgeProof';
import { EMBERFORD_SILL_BRIDGE } from './sillBridge';
import { PORTER_EMBERFORD } from './porterPace';
import { EMBERFORD_WINDOW } from './ferryWindow';
import { CART_MEMORY_ACTORS, CART_MEMORY_PROPS } from './memoryCart';
import { EMBERFORD_LAST_TURN } from './lastTurn';
import { CIRCULAR_REPORT_EMBERFORD } from './circularReport';
import { starStations } from './starPaths';

const W = 40, H = 28;
// Plaza (stone) rectangle
const PX = 11, PY = 8, PW = 18, PH = 13;

function plaza(x: number, y: number): string | null {
  if (x < PX || x >= PX + PW || y < PY || y >= PY + PH) return null;
  const l = x === PX, r = x === PX + PW - 1, t = y === PY, b = y === PY + PH - 1;
  if (t && l) return 'stone-tl'; if (t && r) return 'stone-tr';
  if (b && l) return 'stone-bl'; if (b && r) return 'stone-br';
  if (t) return 'stone-t'; if (b) return 'stone-b'; if (l) return 'stone-l'; if (r) return 'stone-r';
  return 'stone-c';
}
// Path south from plaza to portal stone
function path(x: number, y: number): string | null {
  if (x >= 18 && x <= 21 && y >= PY + PH - 1 && y <= 25) return 'stone-c';
  if (x >= 4 && x < PX + 1 && y >= 14 && y <= 16) return 'stone-c';
  return null;
}

function hash(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function linenStand(id: string, x: number, y: number, label: string, text: string, resultArt: string): Interactable[] {
  const started = { flag: 'linen.started', eq: true };
  const done = { flag: `linen.${id}`, eq: true };
  const spot = { x, y, w: 1, h: 1, walkThrough: true } as const;
  return [
    {
      ...spot, id: `linen-${id}`, kind: 'scene', node: `linen.${id}`, label, art: 'board-stand',
      visibleIf: { all: [started, { not: done }] },
    },
    {
      ...spot, id: `linen-${id}-result`, kind: 'sign', label: 'the observation from ' + label, art: resultArt, text,
      visibleIf: done,
    },
  ];
}

const repairQueue = {
  arrival: { flag: 'reached.emberford', eq: true },
  started: { flag: 'repair.queue.started', eq: true },
  checked: { flag: 'repair.queue.tested', eq: true },
  permission: { flag: 'repair.queue.permission', eq: true },
  blanks: { flag: 'repair.queue.blanks', eq: true },
  tray: { flag: 'repair.queue.tray', eq: true },
  stub: { flag: 'repair.queue.stub', eq: true },
  chosen: { flagSet: 'cross.repair-queue' },
  receipt: { flagSet: 'repair.queue.receipt' },
} satisfies Record<string, Condition>;

const repairBranch = (eq: 'paired' | 'relay' | 'leave'): Condition => ({ flag: 'cross.repair-queue', eq });
const repairUnsettled: Condition = { all: [repairQueue.started, { not: repairQueue.chosen }] };

function repairScene(id: string, node: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id: `repair-queue-${id}`, kind: 'scene', node: `repair.queue.${node}`, x, y, w: 1, h: 1, label, art, visibleIf, walkThrough: true };
}

const REPAIR_GATE = { x: 2, y: 16 };
const REPAIR_SHELF = { x: 4, y: 16 };
const REPAIR_YARD_ID = 'aethelgard.repair-yard';

const tallyHeading: Condition = { flag: 'emberford.tally', in: ['weight', 'loaves'] };
const [unsetTally, ...setTallies] = sceneProp('emberford.tally', 14, 20, 'the bakers’ tally', 'ledger',
  { weight: 'nile.tablet', loaves: 'nile.scroll' });
const tallyPlaced = (heading: 'weight' | 'loaves'): Condition => ({ flag: 'emberford.tally.placed', eq: heading });
const tallyReceivers: Interactable[] = [
  { id: 'tally-bake-plan', kind: 'sign', x: 12, y: 20, w: 1, h: 1, walkThrough: true,
    label: 'Della’s marked bake plan', art: 'nile.scroll', flag: 'emberford.tally.witness',
    text: 'Small tray for six stalls. Six loaves at six scale weights. Reserve the large tray: three loaves at the same weight.',
    visibleIf: { all: [{ flag: 'emberford.tally', eq: 'loaves' }, tallyPlaced('loaves')] } },
  { id: 'tally-ferry-read', kind: 'scene', node: 'emberford.tally.ferry.read', x: 24, y: 23, w: 1, h: 1, walkThrough: true,
    label: 'Idris’s ferry copy of the tally', art: 'nile.slip',
    visibleIf: { all: [tallyHeading, { not: tallyPlaced('weight') }] } },
  { id: 'tally-load-slip', kind: 'sign', x: 24, y: 23, w: 1, h: 1, walkThrough: true,
    label: 'Idris’s clipped load slip', art: 'preserved.folder', flag: 'emberford.tally.witness',
    text: 'One deck compartment, six scale weights. Tie the three large loaves as one bundle. The six small loaves would weigh the same.',
    visibleIf: { all: [{ flag: 'emberford.tally', eq: 'weight' }, tallyPlaced('weight')] } },
];

export const EMBERFORD: MapDef = {
  id: 'aethelgard.emberford',
  name: 'Aethelgard: Emberford market',
  world: 'WORLD-02',
  width: W, height: H,
  music: 'music.town',
  ambience: 'town',
  background: 0x2f6b3a,
  floor: (x, y) => {
    const p = plaza(x, y) ?? path(x, y);
    if (p) return p;
    void hash;
    return 'grass';
  },
  stamps: [
    // North row: houses and the guild hall
    { stamp: 'house-a', x: 2, y: 1 },
    { stamp: 'house-b', x: 26, y: 1 },
    { stamp: 'house-a', x: 32, y: 2 },
    { stamp: 'gatehouse', x: 17, y: 3 },
    { stamp: 'banners', x: 15, y: 4 },
    { stamp: 'banners', x: 21, y: 4 },
    // West: Hesper's smithy
    { stamp: 'house-b', x: 2, y: 8 },
    { stamp: 'forge', x: 8, y: 10 },
    { stamp: 'long-table', x: 5, y: 17 },
    { stamp: 'barrel', x: 8, y: 14 },
    { stamp: 'crates', x: 1, y: 14 },
    // Plaza
    { stamp: 'fountain-0', x: 18, y: 12, anim: ['fountain-0', 'fountain-1', 'fountain-2'] },
    { stamp: 'stall', x: 23, y: 7 },
    { stamp: 'fruit-yellow', x: 12, y: 18 },
    { stamp: 'fruit-red', x: 13, y: 18 },
    { stamp: 'fruit-green', x: 14, y: 18 },
    { stamp: 'bench', x: 14, y: 9 },
    { stamp: 'table', x: 23, y: 15 },
    { stamp: 'well-box', x: 30, y: 15 },
    { stamp: 'well-box', x: 6, y: 21 },
    { stamp: 'sign', x: 17, y: 21 },
    { stamp: 'pot-plant', x: 11, y: 8 },
    { stamp: 'pot-plant', x: 28, y: 8 },
    // Trees and nature
    { stamp: 'tree', x: 34, y: 10 }, { stamp: 'tree', x: 36, y: 14 }, { stamp: 'tree', x: 33, y: 19 },
    { stamp: 'tree', x: 1, y: 21 }, { stamp: 'tree', x: 4, y: 24 }, { stamp: 'tree', x: 9, y: 23 },
    { stamp: 'tree', x: 27, y: 23 }, { stamp: 'tree', x: 31, y: 24 }, { stamp: 'tree', x: 37, y: 21 },
    { stamp: 'tree', x: 37, y: 6 }, { stamp: 'tree', x: 13, y: 2 }, { stamp: 'tree', x: 23, y: 1 },
    { stamp: 'bush', x: 16, y: 23 }, { stamp: 'bush', x: 23, y: 24 }, { stamp: 'bush', x: 30, y: 12 },
    { stamp: 'flowers-white', x: 15, y: 25 }, { stamp: 'flowers-white', x: 24, y: 22 },
    { stamp: 'flowers-white', x: 35, y: 25 },
  ],
  blocks: [
    [0, -1, W, 1], [0, H, W, 1], [-1, 0, 1, H], [W, 0, 1, H],
  ],
  npcs: [
    ...CART_MEMORY_ACTORS,
    { id: 'merchant-corvan', x: 25, y: 13, facing: 'down' },
    { id: 'smith-hesper', x: 7, y: 13, facing: 'right' },
    { id: 'guildmaster-orrin', x: 19, y: 7, facing: 'down' },
    { id: 'scholar-sefa', x: 22, y: 14, facing: 'left' },
    { id: 'villager-1', x: 13, y: 17, facing: 'down' },
    { id: 'keeper-oduya', x: 16, y: 8, facing: 'down' },
    { id: 'well-keeper', x: 32, y: 17, facing: 'left' },
    { id: 'fruit-seller', x: 15, y: 19, facing: 'down' },
    // The Shattering Rumour (side quest): each person heard the blade story from the next.
    { id: 'porter-idris', x: 23, y: 22, facing: 'left' },
    { id: 'baker-della', x: 11, y: 20, facing: 'right', visibleIf: tallyHeading },
    { id: 'stallkeeper-hana', x: 12, y: 12, facing: 'right' },
    // Origin side quests (spec 35.1): each giver appears only for that origin.
    { id: 'runner-tamar', x: 18, y: 21, facing: 'right', visibleIf: { origin: 'harbour' } },
    { id: 'apprentice-ren', x: 10, y: 17, facing: 'left', visibleIf: { origin: 'workshop' } },
    { id: 'singer-teodora', x: 16, y: 15, facing: 'down', visibleIf: { origin: 'singer' } },
  ],
  interactables: [
    ...EMBERFORD_FIELD_ORDER,
    ...starStations('chronicler', [17, 20], [18, 20]),
    ...EMBERFORD_WINDOW,
    ...EMBERFORD_BASKET,
    ...EMBERFORD_PIGMENT_WINDOW,
    ...EMBERFORD_PIGMENT_SAMPLE,
    ...PRICE_DRAWERS_RETURNS,
    ...EMBERFORD_BRIDGE_PROOF,
    EMBERFORD_SILL_BRIDGE,
    ...PORTER_EMBERFORD,
    ...CART_MEMORY_PROPS,
    ...EMBERFORD_LAST_TURN,
    ...JIG_EMBERFORD_RETURNS,
    ...EMBERFORD_LANTERN_FAIR,
    ...EMBERFORD_BACKBILL,
    ...EMBERFORD_DOOR_FOLD,
    ...EMBERFORD_DRAWER_CASES,
    { id: 'ballad-spot', kind: 'fieldgame', game: 'ballad', x: 37, y: 9, w: 1, h: 1, label: 'Wynn the ballad-singer, by the east well', art: 'notice-board' },
    { id: 'loyalty-hesper', kind: 'fieldgame', game: 'loyalty-hesper', x: 9, y: 18, w: 1, h: 1, label: "a record on Hesper's work bench (The Traveller's Quench)", art: 'ledger', visibleIf: { num: 'lamps.lit', gte: 6 } },
    { id: 'loyalty-sefa', kind: 'fieldgame', game: 'loyalty-sefa', x: 33, y: 22, w: 1, h: 1, label: "Sefa's song sheet on the memorial stone (The Flood Song)", art: 'old-sign', visibleIf: { num: 'lamps.lit', gte: 6 } },
    repairScene('opening', 'opening', REPAIR_SHELF.x, REPAIR_SHELF.y, 'the forge pickup slate with two twelves', 'slate-board',
      { all: [repairQueue.arrival, { not: repairQueue.started }] }),
    { id: 'cross-repair-queue', kind: 'fieldgame', game: 'cross-repair-queue', ...REPAIR_SHELF, w: 1, h: 1, walkThrough: true,
      label: 'the repair queue at the west shelf', art: 'slate-board', visibleIf: repairUnsettled },
    repairScene('bench', 'bench', 8, 17, 'Hesper’s two practice tickets', 'nile.tablet',
      { all: [repairUnsettled, { not: repairQueue.checked }] }),
    repairScene('permission', 'permission', 14, 16, 'Sefa’s folded copy', 'nile.slip',
      { all: [repairUnsettled, { not: repairQueue.permission }] }),
    repairScene('blanks', 'blanks', 8, 17, 'Hesper’s blank pairs', 'preserved.display-paired',
      { all: [repairUnsettled, repairQueue.checked, repairQueue.permission, { not: repairQueue.blanks }] }),
    { id: 'repair-queue-shut', kind: 'sign', ...REPAIR_GATE, w: 1, h: 1, walkThrough: true, label: 'the latched pickup yard gate', art: 'cellar-door',
      text: 'The open shelf is out of use. Check with the forge at the slate to the east.', visibleIf: { all: [repairQueue.arrival, { not: repairBranch('paired') }] } },
    { id: 'repair-queue-gate', kind: 'door', ...REPAIR_GATE, w: 1, h: 1, walkThrough: true, label: 'the open pickup yard gate', art: 'cellar-door.open',
      visibleIf: repairBranch('paired'), openIf: repairBranch('paired'), to: { map: REPAIR_YARD_ID, x: 6, y: 7 } },
    { id: 'repair-queue-paired-hours', kind: 'sign', ...REPAIR_SHELF, w: 1, h: 1, walkThrough: true, label: 'the paired ticket handoff notice', art: 'preserved.display-paired',
      text: 'Show the matching ticket at the gate at the end of the shift. The hatch keeps a public tick for the collection. Fee decisions stay at the inside bench.', visibleIf: repairBranch('paired') },
    repairScene('tray', 'relay.lift', REPAIR_SHELF.x, REPAIR_SHELF.y, 'the covered kettle tray', 'workbench',
      { all: [repairBranch('relay'), { not: repairQueue.tray }] }),
    repairScene('handover', 'relay.transfer', 11, 11, 'Hana’s return-slip stand', 'board-stand',
      { all: [repairBranch('relay'), repairQueue.tray, { not: repairQueue.stub }] }),
    repairScene('return-stub', 'relay.finish', REPAIR_SHELF.x, REPAIR_SHELF.y, 'the slate clip for Hana’s return stub', 'nile.scroll',
      { all: [repairBranch('relay'), repairQueue.stub, { not: repairQueue.receipt }] }),
    { id: 'repair-queue-relay-hours', kind: 'sign', ...REPAIR_SHELF, w: 1, h: 1, walkThrough: true, label: 'the market relay pickup notice', art: 'preserved.display-records',
      text: 'The kettle is under Hana’s counter. Pickup at the next market round. Leave new repairs at the forge. A runner brings them over after the square clears.',
      visibleIf: { all: [repairBranch('relay'), repairQueue.receipt] } },
    repairScene('appointment-rota', 'leave.rota', REPAIR_SHELF.x, REPAIR_SHELF.y, 'the apprentices’ returned slate', 'ledger',
      { all: [repairBranch('leave'), { not: repairQueue.receipt }] }),
    { id: 'repair-queue-private-hours', kind: 'sign', ...REPAIR_SHELF, w: 1, h: 1, walkThrough: true, label: 'the next private pickup hours', art: 'notice-board',
      text: 'Private pickups at the first and last market bells. Ask for another slot if you missed yours. The kettle is still on the inside shelf.',
      visibleIf: { all: [repairBranch('leave'), repairQueue.receipt] } },
    ...sceneProp('emberford.gauge', 29, 19, 'the river gauge board', 'notice-board',
      { repeat: 'board-stand', compare: 'cork-board' }),
    { ...unsetTally, visibleIf: { not: tallyHeading } },
    ...setTallies,
    ...tallyReceivers,
    ...sceneProp('emberford.repair-notice', 30, 21, 'the bridge repair notice', 'notice-board',
      { sketch: 'nile.map', direction: 'signpost' }),
    ...sceneProp('emberford.pattern-order', 9, 15, 'the smith’s sample tray', 'nile.tablet',
      { sample: 'board-stand', record: 'ledger' }),
    // The south lane has room to compare the same pieces away from the trade stands.
    { id: 'linen-clip', kind: 'scene', node: 'linen.start', x: 16, y: 24, w: 1, h: 1, walkThrough: true,
      label: 'the two cloth cuttings', art: 'nile.slip', visibleIf: { not: { flag: 'linen.started', eq: true } } },
    ...linenStand('shade', 3, 24, 'the shaded stand', 'Blue-grey, on both corners under the tree. The two cuttings were side by side with their faces turned the same way.', 'preserved.display-paired'),
    ...linenStand('open', 6, 26, 'the stand in open light', 'Both corners looked paler when the same board went into the open. The folding check still needs its own tag.', 'preserved.display-records'),
    { id: 'linen-tag', kind: 'scene', node: 'linen.tag', x: 11, y: 25, w: 1, h: 1, walkThrough: true,
      label: 'the two loose work tags', art: 'cork-board',
      visibleIf: { all: [{ objective: 'linen.o.compare' }, { not: { flagSet: 'linen.tag' } }] } },
    { id: 'linen-dye-tag', kind: 'sign', x: 11, y: 25, w: 1, h: 1, walkThrough: true, label: 'the dyer’s tag', art: 'notice-board',
      text: 'Compare the cuttings in one light. The basket slip below gives the crew a different check for the folds.',
      visibleIf: { flag: 'linen.tag', eq: 'dye' } },
    { id: 'linen-ferry-tag', kind: 'sign', x: 11, y: 25, w: 1, h: 1, walkThrough: true, label: 'the ferry crew’s tag', art: 'nile.scroll',
      text: 'Check the folds before you pack. The line slip below tells the dyer to compare the cuttings in one light.',
      visibleIf: { flag: 'linen.tag', eq: 'ferry' } },
    { id: 'linen-ready-lane', kind: 'sign', x: 16, y: 24, w: 1, h: 1, walkThrough: true, label: 'the south lane basket hook', art: 'preserved.slip',
      text: 'The cuttings went to the two stands on the south lane. Walk west for the shade and open light. The tags hang beside the lane.',
      visibleIf: { flag: 'linen.started', eq: true } },
    { id: 'hands-strap', kind: 'scene', node: 'hands.claim', x: 20, y: 22, w: 1, h: 1, walkThrough: true,
      label: 'Idris’s strap of sample tags', art: 'nile.slip', visibleIf: { not: { flag: 'hands.started', eq: true } } },
    { id: 'hands-tray', kind: 'scene', node: 'hands.receipt', x: 22, y: 19, w: 1, h: 1, walkThrough: true,
      label: 'the paper examples from the Nexus', art: 'catalogue',
      visibleIf: { all: [{ flag: 'hands.started', eq: true }, { not: { flag: 'hands.checked', eq: true } }] } },
    { id: 'hands-return', kind: 'scene', node: 'hands.review', x: 20, y: 22, w: 1, h: 1, walkThrough: true,
      label: 'Idris’s strap beside the museum entry', art: 'preserved.folder',
      visibleIf: { all: [{ objective: 'hands.o.compare' }, { not: { flagSet: 'hands.response' } }] } },
    { id: 'hands-concede', kind: 'sign', x: 20, y: 22, w: 1, h: 1, walkThrough: true,
      label: 'Idris’s tag with a new back clip', art: 'preserved.display-records',
      text: 'The short mark can guide a delivery. Turn the clip to see whom the museum named and how the workshop history describes the work. Idris left room for another tag.',
      visibleIf: { flag: 'hands.response', eq: 'concede' } },
    { id: 'hands-pair', kind: 'sign', x: 20, y: 22, w: 1, h: 1, walkThrough: true,
      label: 'Idris’s two records side by side', art: 'preserved.display-paired',
      text: 'The short tag and the museum record have a clip each. A spare clip invites the next carrier to bring another case that could change the story.',
      visibleIf: { flag: 'hands.response', eq: 'pair' } },

    { id: 'scout-turn-board', kind: 'scout-table', x: 23, y: 20, w: 1, h: 1, walkThrough: true,
      label: 'the scout’s practice cart', art: 'clerk-map' },
    { id: 'scout-brief', kind: 'scene', node: 'scout.review', x: 24, y: 20, w: 1, h: 1, walkThrough: true,
      label: 'Idris’s two scout reports', art: 'preserved.display-paired',
      visibleIf: { all: [{ objective: 'scout.o.compare' }, { not: { flagSet: 'scout.notice' } }] } },
    { id: 'scout-notice-briefed', kind: 'sign', x: 24, y: 20, w: 1, h: 1, walkThrough: true,
      label: 'the next scout’s turning notes', art: 'preserved.display-records',
      text: 'Take the turning notes. Open an unmarked gate with no turning space and write down which gate you opened. Carrier, a blocked report with these notes points you toward the other unopened gate. Look at the turn before you send the cart.',
      visibleIf: { flag: 'scout.notice', eq: 'briefed' } },
    { id: 'scout-notice-open', kind: 'sign', x: 24, y: 20, w: 1, h: 1, walkThrough: true,
      label: 'the lane keeper’s call bell', art: 'bell-rope',
      text: 'Gate slips go out as usual. Mark a visible turning space on its own line. If you see a blocked turn, leave the heavy cart here and ring for the lane keeper to walk the turn.',
      visibleIf: { flag: 'scout.notice', eq: 'open' } },
    // A Dry Step for the Washhouse. The head, tray and crossing have separate readings.
    { id: 'washhouse-intake', kind: 'scene', node: 'washhouse.intake', x: 17, y: 22, w: 1, h: 1, walkThrough: true,
      label: 'the washhouse head peg', art: 'plumb-mark', visibleIf: { not: { flag: 'washhouse.started', eq: true } } },
    { id: 'washhouse-intake-note', kind: 'sign', x: 17, y: 22, w: 1, h: 1, walkThrough: true,
      label: 'the clipped head reading', art: 'preserved.slip', text: 'Water passed the head peg this round. Walk west to compare the tray and the catch screen.',
      visibleIf: { all: [{ flag: 'washhouse.started', eq: true }, { not: { flagSet: 'washhouse.order' } }] } },
    { id: 'washhouse-tail', kind: 'scene', node: 'washhouse.tail', x: 5, y: 22, w: 1, h: 1, walkThrough: true,
      label: 'the washhouse rinse tray', art: 'flood-post',
      visibleIf: { all: [{ flag: 'washhouse.started', eq: true }, { not: { flagSet: 'washhouse.order' } }] } },
    { id: 'washhouse-screen', kind: 'scene', node: 'washhouse.screen', x: 4, y: 20, w: 1, h: 1, walkThrough: true,
      label: 'the west catch screen', art: 'board-stand',
      visibleIf: { all: [{ flag: 'washhouse.started', eq: true }, { not: { flagSet: 'washhouse.order' } }] } },
    { id: 'washhouse-board', kind: 'scene', node: 'washhouse.board', x: 7, y: 22, w: 1, h: 1, walkThrough: true,
      label: 'Hana’s washhouse order board', art: 'cork-board',
      visibleIf: { all: [{ objective: 'washhouse.o.trace' }, { not: { flagSet: 'washhouse.order' } }] } },
    { id: 'washhouse-head-again', kind: 'scene', node: 'washhouse.head-again', x: 17, y: 22, w: 1, h: 1, walkThrough: true,
      label: 'the head peg after the repair order', art: 'plumb-mark',
      visibleIf: { all: [{ objective: 'washhouse.o.order' }, { not: { flag: 'washhouse.headAfter', eq: true } }] } },
    { id: 'washhouse-clear-check', kind: 'scene', node: 'washhouse.check.clear', x: 5, y: 22, w: 1, h: 1, walkThrough: true,
      label: 'the tray after clearing the screen', art: 'flood-post',
      visibleIf: { all: [{ flag: 'washhouse.order', eq: 'clear' }, { flag: 'washhouse.headAfter', eq: true }, { not: { flag: 'washhouse.checked', eq: true } }] } },
    { id: 'washhouse-step-check', kind: 'scene', node: 'washhouse.check.step', x: 5, y: 23, w: 1, h: 1, walkThrough: true,
      label: 'the marked south side step', art: 'bridge-post',
      visibleIf: { all: [{ flag: 'washhouse.order', eq: 'step' }, { flag: 'washhouse.headAfter', eq: true }, { not: { flag: 'washhouse.checked', eq: true } }] } },
    { id: 'washhouse-clear-note', kind: 'sign', x: 5, y: 22, w: 1, h: 1, walkThrough: true, label: 'the screen crew’s recheck', art: 'preserved.display-records',
      text: 'The head peg stayed at the same mark. Water reached the tray after the clearing. The screen note has a spare line for the next round.',
      visibleIf: { all: [{ flag: 'washhouse.order', eq: 'clear' }, { flag: 'washhouse.checked', eq: true }] } },
    { id: 'washhouse-step-note', kind: 'sign', x: 5, y: 23, w: 1, h: 1, walkThrough: true, label: 'the side step and tray notice', art: 'bridge-post',
      text: 'Carriers can use the dry side step. The low step still has a run. The tray repair is on a separate slip for the next crew.',
      visibleIf: { all: [{ flag: 'washhouse.order', eq: 'step' }, { flag: 'washhouse.checked', eq: true }] } },
    // The Two-Bell Order, a buyer’s late delivery inquiry after the dispute.
    { id: 'bell-order-clerk', kind: 'scene', node: 'bell.order.clerk', x: 17, y: 9, w: 1, h: 1, walkThrough: true,
      label: 'the guild stub for Order 34', art: 'ledger', visibleIf: { objective: 'm02.o5.showdown' } },
    { id: 'bell-order-ferry', kind: 'scene', node: 'bell.order.ferry', x: 24, y: 24, w: 1, h: 1, walkThrough: true,
      label: 'the ferry strip for Order 34', art: 'nile.scroll', visibleIf: { objective: 'm02.o5.showdown' } },
    { id: 'bell-order-board', kind: 'scene', node: 'bell.order.align', x: 14, y: 24, w: 1, h: 1, walkThrough: true,
      label: 'the two order pieces on the board', art: 'preserved.display-paired',
      visibleIf: { all: [{ objective: 'bell.order.o.collect' }, { not: { objective: 'bell.order.o.align' } }] } },
    { id: 'bell-order-proof', kind: 'scene', node: 'bell.order.publish', x: 14, y: 24, w: 1, h: 1, walkThrough: true,
      label: 'the matched order and buyer’s box', art: 'preserved.display-records',
      visibleIf: { all: [{ objective: 'bell.order.o.align' }, { not: { flagSet: 'bell.order.format' } }] } },
    { id: 'bell-order-pair', kind: 'sign', x: 14, y: 24, w: 1, h: 1, walkThrough: true, label: 'the paired order proof', art: 'cork-board',
      text: 'Order 34, blue lantern caps. The guild’s deadline was the second square bell. The two bell marks came from both sides of the handover. The order has no recorded arrival time.',
      visibleIf: { flag: 'bell.order.format', eq: 'pair' } },
    { id: 'bell-order-key', kind: 'sign', x: 14, y: 24, w: 1, h: 1, walkThrough: true, label: 'the ferry key for future orders', art: 'notice-board',
      text: 'Read the two bell marks as both sides of a handover. A later order’s arrival should be marked separately. Order 34 still has an open arrival line.',
      visibleIf: { flag: 'bell.order.format', eq: 'key' } },
    // The Copy in the Square. Follow the original order, then carry the repair past the square.
    { id: 'copy-spare', kind: 'scene', node: 'copy.start', x: 28, y: 14, w: 1, h: 1, walkThrough: true, label: 'the spare market slip', art: 'nile.slip',
      visibleIf: { all: [{ flagSet: 'sd.corvan.outcome' }, { not: { flag: 'copy.started', eq: true } }] } },
    { id: 'copy-order', kind: 'scene', node: 'copy.order', x: 20, y: 9, w: 1, h: 1, walkThrough: true, label: 'the old order strip', art: 'ledger',
      visibleIf: { flag: 'copy.started', eq: true } },
    { id: 'copy-consent', kind: 'scene', node: 'copy.consent', x: 7, y: 15, w: 1, h: 1, walkThrough: true, label: 'the workshop’s chalk slip', art: 'nile.tablet',
      visibleIf: { flag: 'copy.started', eq: true } },
    { id: 'copy-anchor', kind: 'scene', node: 'copy.anchor', x: 22, y: 13, w: 1, h: 1, walkThrough: true, label: 'Sefa’s archive packet', art: 'catalogue',
      visibleIf: { flag: 'copy.started', eq: true } },
    { id: 'copy-board', kind: 'scene', node: 'copy.plan', x: 20, y: 10, w: 1, h: 1, walkThrough: true, label: 'the guild copy board', art: 'cork-board',
      visibleIf: { all: [{ objective: 'copy.o.trace' }, { not: { flagSet: 'copy.route' } }] } },
    { id: 'copy-south-handover', kind: 'scene', node: 'copy.deliver.ledger', x: 22, y: 21, w: 1, h: 1, walkThrough: true, label: 'the south-gate order table', art: 'nile.scroll',
      visibleIf: { all: [{ flag: 'copy.route', eq: 'ledger' }, { not: { flag: 'copy.delivered', eq: true } }] } },
    { id: 'copy-west-handover', kind: 'scene', node: 'copy.deliver.market', x: 11, y: 13, w: 1, h: 1, walkThrough: true, label: 'Hana’s relay slips', art: 'board-stand',
      visibleIf: { all: [{ flag: 'copy.route', eq: 'market' }, { not: { flag: 'copy.delivered', eq: true } }] } },
    { id: 'copy-south-outcome', kind: 'sign', x: 22, y: 21, w: 1, h: 1, walkThrough: true, label: 'the matched order slips', art: 'cork-board',
      text: 'Order 27. The earlier slip stays beside the dated correction. The two marks line up. Buyers who kept their slips can match them here.',
      visibleIf: { all: [{ flag: 'copy.route', eq: 'ledger' }, { flag: 'copy.delivered', eq: true }] } },
    { id: 'copy-west-outcome', kind: 'sign', x: 11, y: 13, w: 1, h: 1, walkThrough: true, label: 'Hana’s handover board', art: 'notice-board',
      text: 'The short version Hana reads aloud is at the top. The order number and the workshop name are underneath for anyone who missed the runner.',
      visibleIf: { all: [{ flag: 'copy.route', eq: 'market' }, { flag: 'copy.delivered', eq: true }] } },
    { id: 'ember-pickup-front', kind: 'scene', node: 'ember.pickup.front', x: 15, y: 20, w: 1, h: 1, walkThrough: true,
      label: 'Mara’s round-edged tray', art: 'workbench',
      visibleIf: { all: [{ flag: 'reached.emberford', eq: true }, { not: { flag: 'ember.pickup.point', eq: true } }] } },
    { id: 'ember-pickup-back', kind: 'scene', node: 'ember.pickup.back', x: 15, y: 17, w: 1, h: 1, walkThrough: true,
      label: 'the lane behind Mara’s stall', art: 'preserved.slip',
      visibleIf: { all: [{ flag: 'ember.pickup.point', eq: true }, { not: { flag: 'ember.pickup.call', eq: true } }] } },
    { id: 'ember-pickup-fix', kind: 'scene', node: 'ember.pickup.fix', x: 16, y: 19, w: 1, h: 1, walkThrough: true,
      label: 'the pickup tab and cord', art: 'preserved.slip',
      visibleIf: { all: [{ objective: 'ember.pickup.compare' }, { not: { flagSet: 'ember.pickup.layout' } }] } },
    { id: 'ember-pickup-tab', kind: 'scene', node: 'ember.pickup.tab', x: 15, y: 20, w: 1, h: 1, walkThrough: true,
      label: 'the tray at the low round tab', art: 'workbench',
      visibleIf: { all: [{ flag: 'ember.pickup.layout', eq: 'tab' }, { not: { flag: 'ember.pickup.taken', eq: true } }] } },
    { id: 'ember-pickup-voice', kind: 'scene', node: 'ember.pickup.voice', x: 15, y: 17, w: 1, h: 1, walkThrough: true,
      label: 'the rear pickup peg', art: 'preserved.slip',
      visibleIf: { all: [{ flag: 'ember.pickup.layout', eq: 'voice' }, { not: { flag: 'ember.pickup.taken', eq: true } }] } },
    { id: 'ember-pickup-tab-done', kind: 'sign', x: 15, y: 20, w: 1, h: 1, walkThrough: true,
      label: 'the tray returned to its low tab', art: 'workbench',
      text: 'The return tray rests below the round tab. A visitor can show Mara which tray they need from the front lane without speaking.',
      visibleIf: { all: [{ flag: 'ember.pickup.layout', eq: 'tab' }, { flag: 'ember.pickup.taken', eq: true }] } },
    { id: 'ember-pickup-voice-done', kind: 'sign', x: 15, y: 17, w: 1, h: 1, walkThrough: true,
      label: 'the tray returned to the rear peg', art: 'workbench',
      text: 'Mara keeps the return tray at the rear peg during her shift. She taps it when she hears the pickup call. The front counter still keeps its point-and-pass tray.',
      visibleIf: { all: [{ flag: 'ember.pickup.layout', eq: 'voice' }, { flag: 'ember.pickup.taken', eq: true }] } },
    { id: 'nile-correction-square', kind: 'sign', x: 16, y: 6, w: 1, h: 1, walkThrough: true, label: 'Oduya’s dated correction', art: 'nile.slip',
      text: 'The old claim stays beside the correction. A visitor can read both and see what changed.', visibleIf: { flag: 'nile.emberCorrection', eq: 'square' } },
    { id: 'nile-correction-talk', kind: 'sign', x: 16, y: 6, w: 1, h: 1, walkThrough: true, label: 'a copy for the market', art: 'nile.slip',
      text: 'The market will read the correction aloud. This copy keeps the words available for anyone who misses the reading.', visibleIf: { flag: 'nile.emberCorrection', eq: 'talk' } },

    { id: 'ex-blade', kind: 'exhibit', exhibit: 'OBJ-003-AE', x: 24, y: 11, w: 3, h: 1, label: 'the patterned blade', art: 'blade-on-counter' },
    { id: 'ex-ingots', kind: 'exhibit', exhibit: 'OBJ-002', x: 23, y: 15, w: 3, h: 2, label: "Sefa's catalogue (Met record)", art: 'catalogue' },
    { id: 'ex-assay', kind: 'assay', exhibit: 'AE-ASSAY', x: 30, y: 15, w: 2, h: 2, label: 'the assay table', art: 'assay' },
    { id: 'forge', kind: 'forge', x: 5, y: 17, w: 3, h: 2, label: "Hesper's anvil (forge a test billet)", art: 'anvil' },
    { id: 'sign-smith', kind: 'puzzle', puzzle: 'guild-notice', x: 23, y: 8, w: 1, h: 1, label: "the Sign-Smith's notice board", art: 'notice-board' },
    { id: 'clue-board', kind: 'board', board: 'corvan-board', x: 12, y: 10, w: 1, h: 1, label: 'the practice board', art: 'cork-board' },
    { id: 'weigh-house', kind: 'puzzle', puzzle: 'weigh-house', x: 27, y: 18, w: 1, h: 1, label: 'the Weigh-House balance', art: 'balance-scale' },
    { id: 'plaque', kind: 'puzzle', puzzle: 'founders-plaque', x: 20, y: 6, w: 1, h: 1, label: "the Founders' Plaque", art: 'plaque.trestle',
      artBy: { flag: 'puzzle.founders-plaque.method', keys: { strip: 'plaque.strip', clean: 'plaque.clean', window: 'plaque.window', repaint: 'plaque.repaint' } } },
    { id: 'survey-box', kind: 'puzzle', puzzle: 'toll-survey', x: 26, y: 9, w: 1, h: 1, label: "Clerk Venn's survey box", art: 'survey-box' },
    { id: 'ferry-slate', kind: 'puzzle', puzzle: 'ferry-message', x: 35, y: 22, w: 1, h: 1, label: 'the ferry message slate', art: 'ferry-slate' },
    { id: 'easel', kind: 'puzzle', puzzle: 'painters-frame', x: 28, y: 19, w: 1, h: 1, label: "Nell's easel", art: 'easel' },
    { id: 'bell-rope', kind: 'puzzle', puzzle: 'bell-stair', x: 23, y: 5, w: 1, h: 1, label: "Maren's bell rope", art: 'bell-rope' },
    { id: 'forecast-board', kind: 'puzzle', puzzle: 'forecast-board', x: 34, y: 16, w: 1, h: 1, label: "Noa's forecast board", art: 'forecast-board' },
    { id: 'echo-bridge', kind: 'puzzle', puzzle: 'echo-bridge', x: 29, y: 21, w: 1, h: 1, label: 'the echo stone by the bridge', art: 'echo-stone' },
    { id: 'brass-sorter', kind: 'puzzle', puzzle: 'brass-sorter', x: 11, y: 19, w: 1, h: 1, label: "Mara's brass sorter", art: 'brass-sorter' },
    { id: 'map-table', kind: 'puzzle', puzzle: 'map-table', x: 2, y: 20, w: 1, h: 1, label: "the mapmaker's table", art: 'map-table' },
    { id: 'cart-map', kind: 'puzzle', puzzle: 'tipped-cart', x: 13, y: 21, w: 1, h: 1, label: "the guild clerk's map of the tipped cart", art: 'clerk-map' },
    { id: 'cart-driver-receipt', kind: 'sign', x: 12, y: 22, w: 1, h: 1, walkThrough: true, art: 'preserved.slip',
      label: 'the driver’s receipt beside the lane map', flag: 'cart.received.driver',
      text: 'The driver collected all three accounts. Her thumbprint is beside Mara’s stall number. The stone still needs a public mark.',
      visibleIf: { all: [{ flag: 'puzzle.tipped-cart.done', eq: true }, { not: { flag: 'puzzle.tipped-cart.delivery', eq: 'lane' } }] } },
    { id: 'cart-public-route', kind: 'sign', x: 12, y: 22, w: 1, h: 1, walkThrough: true, art: 'signpost',
      label: 'the carters’ chalk detour beside the lane map', flag: 'cart.received.lane',
      text: 'A chalk line curves around the loose stone. Two barrows have left wheel marks along it. The clerk keeps Mara’s account for the driver. People passing here see the detour.',
      visibleIf: { flag: 'puzzle.tipped-cart.delivery', eq: 'lane' } },
    { id: 'cite-bridge', kind: 'puzzle', puzzle: 'song-bridge', x: 25, y: 22, w: 1, h: 1, label: 'the Citation Thread bridge post', art: 'bridge-post' },
    { id: 'lock-authors', kind: 'lock', lock: 'authors', x: 17, y: 7, w: 1, h: 1, label: 'the wooden Title Lock (EE practice)', art: 'title-lock', visibleIf: { flag: 'ee2.started', eq: true } },
    { id: 'table-authors', kind: 'label', kit: 'ee.authors', x: 15, y: 7, w: 1, h: 1, label: "Keeper Oduya's table", art: 'label-stand', visibleIf: { objective: 'ee2.o3.weigh' } },
    { id: 'thread-ledger', kind: 'thread', thread: 'blade', node: 'ledger', x: 21, y: 7, w: 1, h: 1, label: 'the guild ledger desk', art: 'ledger' },
    { id: 'thread-workshop', kind: 'thread', thread: 'blade', node: 'workshop', x: 3, y: 13, w: 1, h: 1, label: "Hesper's workshop sheet", art: 'board-stand' },
    sefaDispatchDesk('guild', 12, 8),
    { id: 'record-book', kind: 'sign', x: 13, y: 8, w: 1, h: 1, label: "the guild's public record book", art: 'ledger', flag: 'rumour.record',
      text: 'GUILD RECORD, WINTER. Test blade from Hesper\'s forge: cracked in the quench. Cause: the quench water was too cold. Action: Hesper warms the water. Three new test blades passed. This book is open to everyone.' },
    { id: 'east-well-ledger', kind: 'scene', node: 'well.records.guild', x: 14, y: 8, w: 1, h: 1, walkThrough: true,
      label: 'Noa’s two well leaves by the guild book', art: 'ledger', visibleIf: eastWellSlipAt('ledger'),
      artOpen: { key: 'preserved.display-paired', if: { flag: 'well.records.guild', eq: true } } },
    // The story (Lamp Wall): each knot the town unties lights a lamp; six open the old Guardian's cellar.
    { id: 'lamp-wall', kind: 'lamps', x: 14, y: 5, w: 1, h: 1, label: 'the Lamp Wall', art: 'lamp-wall.0' },
    { id: 'cellar-door', kind: 'door', x: 12, y: 6, w: 1, h: 1, label: 'the cellar door', art: 'cellar-door', flag: 'study.entered',
      artOpen: { key: 'cellar-door.open', if: { num: 'lamps.lit', gte: 6 } }, openIf: { num: 'lamps.lit', gte: 6 }, to: { map: 'aethelgard.study', x: 9, y: 11 },
      text: 'An old oak door in the ground, beside the guild hall. It has no lock and no handle. Under the moss, words are cut into the wood: WHEN SIX LAMPS BURN AGAIN.' },
    { id: 'corvan-wares', kind: 'shop', x: 28, y: 11, w: 1, h: 1, label: "Corvan's wares (things for your quarters)", art: 'crate-wares' },
    { id: 'ore-vein', kind: 'gather', resource: 'ore', x: 0, y: 11, w: 1, h: 1, label: 'the rusty ore vein (gather)', art: 'ore-vein' },
    { id: 'reeds-bridge', kind: 'gather', resource: 'reed', x: 30, y: 23, w: 1, h: 1, label: 'the reeds by the bridge (gather)', art: 'reeds' },
    { id: 'makers-bench', kind: 'workbench', x: 9, y: 19, w: 1, h: 1, label: "the Maker's bench (make tools)", art: 'workbench' },
    { id: 'rumour-mill', kind: 'rumours', x: 16, y: 17, w: 1, h: 1, label: 'the tea table (listen to the rumour mill)', art: 'tea-table' },
    ...CIRCULAR_REPORT_EMBERFORD,
    // Field games from the TOK lessons (src/domain/fieldgames.ts).
    { id: 'pell-doors', kind: 'fieldgame', game: 'doors', x: 25, y: 17, w: 2, h: 1, label: "Dov's lantern stall (Three Doors)", art: 'lantern-stall' },
    { id: 'odo-notice', kind: 'fieldgame', game: 'word', x: 27, y: 22, w: 1, h: 1, label: "Odo's notice board and word chest", art: 'notice-board' },
    { id: 'weigh-slate', kind: 'fieldgame', game: 'slate', x: 29, y: 18, w: 1, h: 1, label: 'the Weigh-House slate', art: 'slate-board' },
    // Field readings: a made, calibrated tool tests a claim (src/domain/readings.ts).
    { id: 'reading-rain', kind: 'reading', reading: 'rain', x: 35, y: 17, w: 1, h: 1, label: "the rain stake by Noa's board (take a reading)", art: 'rain-stake' },
    { id: 'reading-tower', kind: 'reading', reading: 'tower', x: 22, y: 6, w: 1, h: 1, label: 'the bell tower door frame (take a reading)', art: 'plumb-mark' },
    { id: 'reading-flood', kind: 'reading', reading: 'flood-post', x: 32, y: 21, w: 1, h: 1, label: 'the old flood post (copy it)', art: 'flood-post' },
    { id: 'word-tiles', kind: 'tiles', x: 12, y: 15, w: 1, h: 1, label: "Sefa's stitching table for work slips", art: 'tile-table' },
    // Secrets (Easter eggs): no art, found by searching. Lore in story.json, Journal > Lore.
    { id: 'secret-ember-myth', kind: 'secret', secret: 'ember-myth', x: 7, y: 9, w: 1, h: 1, label: 'a loose brick in the smithy wall' },
    { id: 'secret-three-coins', kind: 'secret', secret: 'three-coins', x: 19, y: 15, w: 1, h: 1, label: 'the bottom of the fountain' },
    { id: 'secret-flood-tally', kind: 'secret', secret: 'flood-tally', x: 28, y: 22, w: 1, h: 1, label: 'the stones under the footbridge' },
    // A pathway that a keepsake opens: Kip's map beside Elsbet's old map shows the forgotten ferry road.
    { id: 'ferry-road', kind: 'door', x: 39, y: 18, w: 1, h: 1, label: 'the old ferry road', art: 'road-post', visibleIf: { flag: 'clue.oldmap.folded-map', eq: true }, to: { map: 'aethelgard.ferry', x: 1, y: 5 } },
    { id: 'waystone', kind: 'waystone', place: 'Emberford market', x: 15, y: 14, w: 1, h: 1, label: 'the Waystone (save and rest)', art: 'waystone' },
    { id: 'old-sign', kind: 'sign', x: 22, y: 23, w: 1, h: 1, label: "Corvan's old sign board", art: 'old-sign', visibleIf: { flagSet: 'sd.corvan.outcome' },
      text: "Corvan's old sign board leans against the portal stone. Most of the words are scratched out. Kip says there is something on the back. In one corner of the front is a tiny gold stamp, no bigger than a thumbnail. Kip does not know the mark. Lumen does not like how it shines." },
    { id: 'rope-east', kind: 'sign', x: 31, y: 18, w: 1, h: 1, label: 'the knotted rope at the east well', flag: 'well.east.read',
      text: 'A rope with a knot for every hand of depth. The water is four knots below the summer mark.' },
    { id: 'rope-west', kind: 'sign', x: 8, y: 22, w: 1, h: 1, label: 'the knotted rope at the west well', flag: 'well.west.read',
      text: 'A rope with a knot for every hand of depth. The water is four knots below the summer mark, the same as the east well.' },
    { id: 'sign-town', kind: 'sign', x: 17, y: 21, w: 1, h: 1, label: 'the town sign',
      text: 'EMBERFORD. Guild town of Aethelgard. Forge to the west, guild hall to the north, market in the square.' },
  ],
  zones: [
    { id: 'emberford', x: 0, y: 0, w: W, h: H },
    { id: 'portal-stone', x: 18, y: 23, w: 3, h: 3, if: { flag: 'seal.found', eq: true }, to: { map: 'nexus.archive', x: 12, y: 6 } },
  ],
  lights: [
    { x: 9, y: 11.5, r: 60, color: 0xff8a3a, flicker: true },
    { x: 19.5, y: 23.5, r: 54, color: 0x8fd3ff },
    { x: 19.5, y: 13.5, r: 50, color: 0xbfe8ff },
    { x: 25.5, y: 10, r: 40, color: 0xffe0a0 },
    { x: 15.5, y: 14.5, r: 30, color: 0x8fd3ff, flicker: true },
  ],
  spawn: { x: 20, y: 21 },
};

export const REPAIR_YARD: MapDef = {
  id: REPAIR_YARD_ID,
  name: 'Emberford: the pickup yard',
  world: EMBERFORD.world,
  width: 13,
  height: 10,
  music: EMBERFORD.music,
  ambience: EMBERFORD.ambience,
  background: 0x2f6b3a,
  floor: (x, y) => x >= 4 && x <= 8 && y > 2 ? 'stone-c' : 'grass',
  stamps: [
    { stamp: 'tree', x: 1, y: 1 }, { stamp: 'crates', x: 9, y: 2 },
    { stamp: 'long-table', x: 5, y: 2 }, { stamp: 'barrel', x: 10, y: 5 },
    { stamp: 'flowers-white', x: 2, y: 7 }, { stamp: 'banners', x: 6, y: 0 },
  ],
  blocks: [[0, 0, 1, 10], [12, 0, 1, 10], [0, 0, 13, 1], [0, 9, 13, 1]],
  npcs: [],
  interactables: [
    repairScene('collect', 'paired.collect', 6, 4, 'the kettle and its checked ticket', 'preserved.display-paired',
      { all: [repairBranch('paired'), { not: repairQueue.receipt }] }),
    { id: 'repair-queue-yard-receipt', kind: 'sign', x: 6, y: 4, w: 1, h: 1, walkThrough: true,
      label: 'the hatch plate after collection', art: 'preserved.display-records', visibleIf: { flag: 'repair.queue.receipt', eq: 'paired' },
      text: 'The kettle is gone. One tick shows that the two edges matched before the hatch opened. The back of the plate is blank.' },
    { id: 'repair-queue-yard-exit', kind: 'door', x: 6, y: 8, w: 1, h: 1, label: 'the gate back to Emberford', art: 'road-post',
      to: { map: EMBERFORD.id, x: REPAIR_GATE.x + 1, y: REPAIR_GATE.y } },
  ],
  zones: [{ id: 'repair-yard', x: 0, y: 0, w: 13, h: 10 }],
  lights: [{ x: 6.5, y: 3.6, r: 55, color: 0xffd98a, flicker: true }],
  spawn: { x: 6, y: 7 },
};
