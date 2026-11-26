/** A fictional market square, with different jobs on the same set of lanes. */
import type { Condition } from '../domain/types';
import { MARKET_ACCESSIONS } from './pairedAccessions';
import { MARKET_KETTLE } from './ferryKettle';
import type { Interactable, MapDef } from './types';
import { MARKET_WELCOME } from './welcome';

const width = 35;
const height = 24;
const paving = ['market-paving-a', 'market-paving-b', 'market-paving-c', 'market-paving-d'] as const;

function floor(x: number, y: number): string | null {
  if (x < 1 || y < 0 || x >= width - 1 || y >= height) return null;
  if (x <= 2 || x >= width - 3 || y <= 1) return 'market-edge';
  const centreLane = x >= 15 && x <= 18;
  const crossLane = y >= 11 && y <= 12;
  if (centreLane || crossLane) return 'market-lane';
  return paving[(x * 7 + y * 11 + (x * y) % 5) % paving.length];
}

function sheet(id: string, x: number, y: number, label: string, art: string, text: string,
  options: { flag?: string; visibleIf?: Condition } = {}): Interactable {
  return { id, kind: 'sign', x, y, w: 1, h: 1, label, art, text, walkThrough: true, ...options };
}

export const MARKET_SQUARE: MapDef = {
  id: 'market.square', name: 'Market of Measures: Lantern Square', world: 'WORLD-11',
  width, height, music: 'music.town', ambience: 'town', background: 0x2e4149,
  floor, spawn: { x: 17, y: 19 }, blocks: [], zones: [],
  npcs: [
    { id: 'market-assayer', x: 15, y: 6, facing: 'down' },
    { id: 'market-clerk', x: 20, y: 8, facing: 'down' },
    // Rook Tamsin, the Sceptic (spec 15.9), joins here (docs/STORY_BIBLE.md, chapter 10).
    { id: 'rook-tamsin', x: 11, y: 17, facing: 'right', visibleIf: { all: [{ objective: 'market.compare' }, { not: { flag: 'rook.joined', eq: true } }] } },
  ],
  stamps: [
    { stamp: 'market-office', x: 13, y: 1 }, { stamp: 'market-workshop', x: 25, y: 2 },
    { stamp: 'market-home', x: 3, y: 2 }, { stamp: 'market-home', x: 3, y: 15 }, { stamp: 'market-home', x: 29, y: 15 },
    { stamp: 'market-wick-stall', x: 6, y: 8 }, { stamp: 'market-display-stall', x: 23, y: 8 },
    { stamp: 'market-repair-stall', x: 23, y: 14 }, { stamp: 'market-scale-stand', x: 15, y: 8 },
    { stamp: 'market-bench', x: 10, y: 16 }, { stamp: 'market-bench', x: 28, y: 10 },
    { stamp: 'market-lamp', x: 11, y: 5 }, { stamp: 'market-lamp', x: 19, y: 4 },
    { stamp: 'market-lamp', x: 6, y: 20 }, { stamp: 'market-lamp', x: 23, y: 20 },
    { stamp: 'market-planter', x: 7, y: 3 }, { stamp: 'market-planter', x: 10, y: 13 },
    { stamp: 'market-planter', x: 29, y: 7 }, { stamp: 'market-planter', x: 29, y: 20 },
    { stamp: 'crates', x: 3, y: 9 }, { stamp: 'barrel', x: 29, y: 12 }, { stamp: 'crates', x: 6, y: 13 },
  ],
  interactables: [
    ...MARKET_WELCOME,
    ...MARKET_ACCESSIONS,
    ...MARKET_KETTLE,
    { id: 'cross-goat', kind: 'fieldgame', game: 'cross-goat', x: 8, y: 16, w: 1, h: 1, label: 'a goat eating price slips (a crossing)', art: 'board-stand' },
    { id: 'cross-patron', kind: 'fieldgame', game: 'cross-patron', x: 13, y: 10, w: 1, h: 1, label: 'the shrine of the Lady of Fair Measure (a crossing)', art: 'old-sign' },
    { id: 'market-nexus-return', kind: 'door', x: 17, y: 22, w: 1, h: 1, label: 'the crossing back to the Nexus',
      art: 'preserved.door', to: { map: 'nexus.archive', x: 21, y: 13 } },
    { id: 'market-waystone', kind: 'waystone', x: 19, y: 20, w: 1, h: 1, label: 'the Lantern Square Waystone',
      place: 'Lantern Square', art: 'waystone' },
    { id: 'market-scale', kind: 'market-scale', x: 16, y: 9, w: 1, h: 1, label: 'the test scale' },
    sheet('market-directory', 14, 19, 'the Lantern Square directory', 'market.waypost',
      'The standards office is straight ahead. The wick workshop is northeast. The display stalls are on the east lane, and the practice purse is beside the house to the west.'),
    sheet('market-comparison-note', 12, 8, 'the checked balance comparison', 'preserved.display-records',
      'Gross includes the basket. Net counts dry fibre. Gross grams per credit are A 120 and B 90. Net grams per credit are A 75 and B 80.',
      { visibleIf: { flagSet: 'market.comparison' } }),
    sheet('market-grade-sorting', 27, 8, 'the workshop’s grading slip', 'metalworks.receipt',
      'The wick bench keeps today’s full wick-length pieces in its tally. Dry short fibre can still be useful for another job.',
      { flag: 'market.grade.sorting' }),
    sheet('market-grade-display', 22, 12, 'the stall’s grading slip', 'metalworks.receipt',
      'The display stall calls a batch “even” when its shade looks uniform under the front lamp. This rule records appearance.',
      { flag: 'market.grade.display' }),
    sheet('market-practice-purse', 8, 18, 'the house practice purse', 'preserved.folder',
      'The house practice purse holds eight credits. The practice sale uses whole lots. Lot A costs eight and Lot B costs ten.',
      { flag: 'market.purse.read' }),
    sheet('market-pickup-carrier', 24, 17, 'the lamp carrier at the low rest', 'workbench',
      'The unlit practice lamp fills both my hands. I can see the low rest from this lane. The board over it is too high to see past the hood. Show or tell me where to set it down.',
      { flag: 'market.pickup.carrier', visibleIf: { all: [{ flag: 'market.arrived', eq: true }, { not: { flagSet: 'market.pickup.layout' } }] } }),
    sheet('market-pickup-clerk', 21, 7, 'Dagny’s two repair pockets', 'preserved.folder',
      'The intake tick tells me the lamp arrived. A separate check slip goes with it when it is ready to collect. Match the slip to the lamp tag before moving anything into the collection pocket.',
      { flag: 'market.pickup.desk', visibleIf: { all: [{ flag: 'market.arrived', eq: true }, { not: { flag: 'market.pickup.intake', eq: true } }] } }),
    { id: 'market-pickup-plan', kind: 'scene', node: 'market.pickup.plan', x: 22, y: 14, w: 1, h: 1, walkThrough: true,
      label: 'the repair counter’s marker rail', art: 'preserved.slip',
      visibleIf: { all: [{ objective: 'market.pickup.scope' }, { not: { flagSet: 'market.pickup.layout' } }] } },
    sheet('market-pickup-ember-marker', 22, 14, 'the rail with Mara’s fitting', 'metalworks.receipt',
      'Mara’s round tab fits this rail. Her tray used one mark for a pickup. This counter tracks the same lamp through intake and the checked handback.',
      { visibleIf: { all: [{ flag: 'market.pickup.source', eq: 'ember' }, { flagSet: 'market.pickup.layout' }] } }),
    sheet('market-pickup-local-marker', 22, 14, 'the rail with Dagny’s fitting', 'metalworks.receipt',
      'Dagny’s spare is in the rail. Follow the lamp’s loop mark from the intake tick to the ready slip by her desk.',
      { visibleIf: { all: [{ flag: 'market.pickup.source', eq: 'local' }, { flagSet: 'market.pickup.layout' }] } }),
    { id: 'market-pickup-shelf', kind: 'scene', node: 'market.pickup.shelf', x: 24, y: 17, w: 1, h: 1, walkThrough: true,
      label: 'the low marked intake rest', art: 'workbench',
      visibleIf: { all: [{ flag: 'market.pickup.layout', eq: 'shelf' }, { not: { flag: 'market.pickup.intake', eq: true } }] } },
    { id: 'market-pickup-attendant', kind: 'scene', node: 'market.pickup.attendant', x: 24, y: 18, w: 1, h: 1, walkThrough: true,
      label: 'the staffed lamp handoff', art: 'workbench',
      visibleIf: { all: [{ flag: 'market.pickup.layout', eq: 'attendant' }, { not: { flag: 'market.pickup.intake', eq: true } }] } },
    sheet('market-pickup-shelf-proof', 24, 17, 'the lamp on the low intake rest', 'crate-wares',
      'The practice lamp is at the round tab on the low rest. The intake tick marks its arrival. The separate collection pocket waits by Dagny’s desk.',
      { visibleIf: { all: [{ flag: 'market.pickup.layout', eq: 'shelf' }, { flag: 'market.pickup.intake', eq: true }] } }),
    sheet('market-pickup-attendant-proof', 24, 18, 'the lamp passed by the attendant', 'crate-wares',
      'The attendant has taken the practice lamp and confirmed its arrival aloud. The live handoff took a worker. The collection pocket waits by Dagny’s desk.',
      { visibleIf: { all: [{ flag: 'market.pickup.layout', eq: 'attendant' }, { flag: 'market.pickup.intake', eq: true }] } }),
    { id: 'market-pickup-release', kind: 'scene', node: 'market.pickup.release', x: 21, y: 7, w: 1, h: 1, walkThrough: true,
      label: 'Dagny’s tagged handback', art: 'preserved.folder',
      visibleIf: { all: [{ objective: 'market.pickup.accepted' }, { not: { flag: 'market.pickup.collected', eq: true } }] } },
    sheet('market-pickup-ready', 21, 7, 'the checked lamp in the collection pocket', 'preserved.folder',
      'The ready slip and lamp tag carry the same loop mark. The intake tick stays with the day’s arrivals. This pocket is for the handback.',
      { visibleIf: { flag: 'market.pickup.collected', eq: true } }),
    sheet('market-buyer-note', 25, 18, 'the buyer’s receipt question', 'preserved.slip',
      'I saw the lower price per gram and brought eight credits. The whole lot on that line costs ten. Where can I see both figures?',
      { flag: 'market.feedback.receipt', visibleIf: { flagSet: 'market.response' } }),
    sheet('market-result-window', 17, 6, 'the household queue notice', 'market.window',
      'Household queue. Compare net fibre per credit on the upper line. Whole baskets stay on the delivery line. Ask the standards desk where each figure came from.',
      { visibleIf: { flag: 'market.response', eq: 'window' } }),
    sheet('market-result-desk', 20, 11, 'the trade desk slips', 'ledger',
      'Trade desk. Follow each slip to its scale reading and its own shop’s grade rule. Keep the quoted price with the lot letter.',
      { visibleIf: { flag: 'market.response', eq: 'desk' } }),
    sheet('market-revised', 21, 14, 'the whole-lot price notice', 'market.window',
      'Today’s trial quotes stay with the unit rates. A costs eight and gives 75 net grams per credit. B costs ten and gives 80 net grams per credit. The eight-credit purse reaches A under the whole-lot rule.',
      { visibleIf: { flag: 'market.revised', eq: true } }),
    sheet('market-access-key', 12, 18, 'the larger measure sheet', 'preserved.display-records',
      'The large sheet gives gross weight, net fibre, the grade rule and the whole-lot price their own lines. The figures keep their unit labels.',
      { visibleIf: { flag: 'market.access-key', eq: true } }),
    sheet('market-wick-note', 28, 8, 'the wick-length tally', 'preserved.display-records',
      'The same length guide on both lots gave 480 grams for A and 760 grams for B. Shade, strength and burning have their own questions.',
      { visibleIf: { flag: 'market.wick-note', eq: true } }),
  ],
  lights: [
    { x: 11, y: 6, r: 69, color: 0xffd995 }, { x: 17, y: 7, r: 80, color: 0xd8e5cd },
    { x: 26, y: 10, r: 65, color: 0xf7c9a1 }, { x: 7, y: 18, r: 61, color: 0xffd5a4 },
    { x: 23, y: 20, r: 64, color: 0xf1bf99 }, { x: 17, y: 20, r: 57, color: 0xc2d2db },
  ],
};
