/**
 * WORLD-01 The Nexus: the recruitment archive hall (spec 5.3, 6.2).
 * A stone hall floating in a starry void. 40 x 20 tiles.
 * West part (x 1-24): the archive hall with the three 'first' exhibits.
 * East wing (x 26-38): the Hall of Firsts, an optional side quest with
 * plaques, each about one person shown with their own place and people, from many periods.
 */
import type { Condition } from '../domain/types';
import { FIRST_BENCH_EPILOGUE } from './afterCouncil';
import type { MapDef } from './types';
import { sceneProp } from './sceneProps';
import { NEXUS_VINDOLANDA } from './vindolanda';
import { NEXUS_DOOR_FOLD } from './doorFold';
import { NEXUS_CITATION_RAIL } from './citationRail';
import { NEXUS_SAME_RED } from './sameRed';

const W = 40, H = 20;
const strokeRequested: Condition = { flag: 'nexus.stroke.requested', eq: true };
const strokeUnposted: Condition = { not: { flagSet: 'nexus.stroke.display' } };
const guideUnhung: Condition = { not: { flagSet: 'nexus.guide.layout' } };
const guideTrial: Condition = { all: [{ flag: 'nexus.guide.started', eq: true }, guideUnhung] };
const guideSides: Condition = { flag: 'nexus.guide.layout', eq: 'sides' };
const restTogether: Condition = { flag: 'nexus.rest.layout', eq: 'together' };
const restCirculate: Condition = { flag: 'nexus.rest.layout', eq: 'circulate' };
const restTablePlaced: Condition = { flag: 'nexus.rest.table', eq: true };
const restPortablePlaced: Condition = { flag: 'nexus.rest.mobile', eq: true };
const restPairPlaced: Condition = { flag: 'nexus.rest.pair', eq: true };
const ribbonSingle: Condition = { flag: 'nexus.ribbon.layout', eq: 'single' };
const ribbonSplit: Condition = { flag: 'nexus.ribbon.layout', eq: 'split' };
const ribbonRead: Condition = { flag: 'nexus.ribbon.read', eq: true };
const printUnsent: Condition = { not: { flagSet: 'nexus.print.edition' } };
const packWaiting: Condition = { not: { flagSet: 'nexus.pack.tag' } };
const packTried: Condition = { flag: 'nexus.pack.tried', eq: true };
const packSent: Condition = { flagSet: 'nexus.pack.sent' };
const packLayouts = ['kits', 'outer'] as const;
const packReaders = ['route', 'tally'] as const;
const handleUnfitted: Condition = { not: { flagSet: 'nexus.handle.method' } };
const handlePaused: Condition = { flag: 'nexus.handle.paused', eq: true };
const handleDone: Condition = { flag: 'nexus.handle.done', eq: true };
const handleMethods = ['paired', 'mended'] as const;
const gaugeLogged: Condition = { flag: 'lost.gauge.logged', eq: true };
const gaugeThread: Condition = { item: 'tool.provenance-thread' };
const gaugeEntry: Condition = { flag: 'thread.lost-gauge.entry', eq: true };
const gaugePouch: Condition = { item: 'item.folding-gauge' };
const gaugeResolved: Condition = { flagSet: 'lost.gauge.resolved' };
const gaugeUsed: Condition = { flag: 'lost.gauge.used', eq: true };
const gaugeReceipted: Condition = { flag: 'lost.gauge.receipt', eq: true };
const gaugeShelf = { x: 3, y: 6, w: 1, h: 1, walkThrough: true };
const viewerPatent: Condition = { flag: 'inspected.OBJ-001-A', eq: true };
const viewerUnposted: Condition = { not: { flagSet: 'nexus.viewer.response' } };
const viewerFinished: Condition = { flag: 'nexus.viewer.done', eq: true };

const printStages: [stage: string, label: string, visible: Condition][] = [
  ['setup', 'the two ferry-print proofs', { not: { flagSet: 'nexus.print.fit' } }],
  ['edge', 'the print with a red mark out in the water', { flag: 'nexus.print.fit', eq: 'edge' }],
  ['pinned', 'the print lined up on its two pins', { all: [{ flag: 'nexus.print.fit', eq: 'pins' }, printUnsent] }],
  ['joined', 'the joined ferry proof on the carrier’s board', { flag: 'nexus.print.edition', eq: 'joined' }],
  ['layers', 'the separate layers of the ferry print', { flag: 'nexus.print.edition', eq: 'layers' }],
];

const ribbonStages: [stage: string, label: string, visible: Condition][] = [
  ['setup', 'the keeper’s folded date ribbon between the cases', { not: { flagSet: 'nexus.ribbon.layout' } }],
  ['single', 'the ribbon with a grant peg and an object sleeve', { all: [ribbonSingle, { not: ribbonRead }] }],
  ['split', 'the separate registry and object rails', { all: [ribbonSplit, { not: ribbonRead }] }],
  ['marked', 'the shared rail with a tab between the two records', { all: [ribbonSingle, ribbonRead] }],
  ['bridged', 'the two date rails with a shared comparison bar', { all: [ribbonSplit, ribbonRead] }],
];

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
    { id: 'nima-fenner', x: 4, y: 5, facing: 'left', visibleIf: { not: { flag: 'preserved.arrived', eq: true } } },
    // Origin side quests (spec 35.1): each giver appears only for that origin.
    { id: 'cataloguer-bela', x: 6, y: 12, facing: 'down', visibleIf: { origin: 'archive' } },
    { id: 'translator-lio', x: 24, y: 13, facing: 'right', visibleIf: { origin: 'traveller' } },
  ],
  interactables: [
    ...NEXUS_VINDOLANDA,
    ...NEXUS_DOOR_FOLD,
    ...NEXUS_CITATION_RAIL,
    ...NEXUS_SAME_RED,
    { id: 'hesper-checked-bench', kind: 'scene', node: 'hesper.nexus.bench', x: 20, y: 10, w: 1, h: 1,
      label: 'Hesper’s reserved repair bench', art: 'nexus.viewer-sheet', walkThrough: true,
      visibleIf: { all: [{ objective: 'm02.o8.ise' }, { flag: 'hesper.visitArrangement', eq: 'bench' }] } },
    { id: 'hesper-checked-drawer', kind: 'scene', node: 'hesper.nexus.drawer', x: 21, y: 14, w: 1, h: 1,
      label: 'the return drawer for Hesper’s scrap', art: 'preserved.folder', walkThrough: true,
      visibleIf: { all: [{ objective: 'm02.o8.ise' }, { objective: 'm02.o6.hesper' }, { not: { flag: 'hesper.visitArrangement', eq: 'bench' } }] } },
    { id: 'hearth-spot', kind: 'fieldgame', game: 'hearth', x: 14, y: 10, w: 1, h: 1, label: 'the hearth where your friends gather', art: 'lantern-stall' },
    { id: 'cross-lintel', kind: 'fieldgame', game: 'cross-lintel', x: 34, y: 4, w: 1, h: 1, label: 'old words cut over an arch (a crossing)', art: 'old-sign' },
    { id: 'loyalty-kip', kind: 'fieldgame', game: 'loyalty-kip', x: 3, y: 14, w: 1, h: 1, label: "Kip's family map on a reading table (The Famous Ancestor)", art: 'ledger', visibleIf: { flag: 'study.letter', eq: true } },
    { id: 'nexus-viewer-wait', kind: 'scene', x: 9, y: 8, w: 1, h: 1, walkThrough: true,
      label: 'the hinged drawing reader beside the patent', art: 'nexus.viewer-sheet', node: 'nexus.viewer.wait',
      visibleIf: { not: viewerPatent } },
    { id: 'nexus-viewer-start', kind: 'scene', x: 9, y: 8, w: 1, h: 1, walkThrough: true,
      label: 'the hinged drawing reader beside the patent', art: 'nexus.viewer-sheet', node: 'nexus.viewer.start',
      visibleIf: { all: [viewerPatent, viewerUnposted, { not: { flagSet: 'nexus.viewer.view' } }] } },
    ...(['detail', 'sheet'] as const).map((view) => ({
      id: `nexus-viewer-preview-${view}`, kind: 'scene' as const, x: 9, y: 8, w: 1, h: 1, walkThrough: true,
      label: `the ${view === 'detail' ? 'close view' : 'full sheet'} on the drawing reader`, art: `nexus.viewer-${view}`,
      node: `nexus.viewer.${view}-view`, visibleIf: { all: [viewerUnposted, { flag: 'nexus.viewer.view', eq: view }] },
    })),
    ...(['detail', 'sheet'] as const).flatMap((view) => {
      const position = { x: view === 'detail' ? 7 : 10, y: 9, w: 1, h: 1, walkThrough: true, kind: 'scene' as const };
      const response: Condition = { flag: 'nexus.viewer.response', eq: view };
      const label = view === 'detail' ? 'the cutaway by the repair queue' : 'the copy at the records counter';
      return [
        { ...position, id: `nexus-viewer-${view}`, label, art: `nexus.viewer-${view}`, node: `nexus.viewer.read-${view}`,
          visibleIf: { all: [response, { not: viewerFinished }] } },
        { ...position, id: `nexus-viewer-fixed-${view}`, label, art: `nexus.viewer-fixed-${view}`, node: `nexus.viewer.seen-${view}`,
          visibleIf: { all: [response, viewerFinished] } },
      ];
    }),
    { id: 'nexus-arrival-view', kind: 'scene', x: 14, y: 18, w: 1, h: 1, walkThrough: true,
      label: 'the open notebook on the reading bench', art: 'ledger', node: 'cold.arrival-view',
      visibleIf: { flag: 'nexus.arrival.note', eq: 'view' } },
    { id: 'nexus-arrival-reference', kind: 'scene', x: 11, y: 17, w: 1, h: 1, walkThrough: true,
      label: 'the numbered slip by the entrance plan', art: 'nile.map', node: 'cold.arrival-reference',
      visibleIf: { flag: 'nexus.arrival.note', eq: 'reference' } },
    { id: 'nexus-guide-start', kind: 'scene', x: 9, y: 17, w: 1, h: 1, walkThrough: true,
      label: 'the spare arrow by the entrance', art: 'signpost', node: 'nexus.guide.start',
      visibleIf: { not: { flag: 'nexus.guide.started', eq: true } } },
    { id: 'nexus-guide-door-trial', kind: 'scene', x: 8, y: 13, w: 1, h: 1, walkThrough: true,
      label: 'the entrance guide’s place at the turn', art: 'board-stand', node: 'nexus.guide.door-trial', visibleIf: guideTrial },
    { id: 'nexus-guide-case-trial', kind: 'scene', x: 16, y: 13, w: 1, h: 1, walkThrough: true,
      label: 'the clerk’s place at the turn', art: 'board-stand', node: 'nexus.guide.case-trial', visibleIf: guideTrial },
    { id: 'nexus-guide-mount', kind: 'scene', x: 12, y: 13, w: 1, h: 1, walkThrough: true,
      label: 'the guide’s stand at the turn', art: 'signpost', node: 'nexus.guide.mount', visibleIf: guideTrial },
    { id: 'nexus-guide-landmark', kind: 'scene', x: 12, y: 13, w: 1, h: 1, walkThrough: true,
      label: 'the shared sketch of the three cases', art: 'nile.map', node: 'nexus.guide.landmark',
      visibleIf: { flag: 'nexus.guide.layout', eq: 'landmark' } },
    { id: 'nexus-guide-door-board', kind: 'scene', x: 8, y: 13, w: 1, h: 1, walkThrough: true,
      label: 'the direction for visitors entering the hall', art: 'coast.signal', node: 'nexus.guide.door-board', visibleIf: guideSides },
    { id: 'nexus-guide-case-board', kind: 'scene', x: 16, y: 13, w: 1, h: 1, walkThrough: true,
      label: 'the direction for visitors coming back from the desk', art: 'coast.signal', node: 'nexus.guide.case-board', visibleIf: guideSides },
    ...sceneProp('nexus.entrance-guide', 13, 17, 'the entrance guide stand', 'board-stand',
      { record: 'ledger', use: 'nile.slip' }),
    ...sceneProp('nexus.loan-slip', 11, 8, 'the model loan slip', 'nile.slip',
      { alias: 'nile.scroll', number: 'ledger' }),
    { id: 'nexus-seal-case', kind: 'scene', x: 10, y: 7, w: 1, h: 1, walkThrough: true,
      label: 'the two checks by the model case', art: 'preserved.display-paired', node: 'nexus.seal.paired',
      visibleIf: { all: [
        { flag: 'label.nexus.handling-seal.holds', eq: true }, { flag: 'label.nexus.handling-seal.criterion', eq: 'paired' },
      ] } },
    { id: 'nexus-seal-desk', kind: 'scene', x: 21, y: 9, w: 1, h: 1, walkThrough: true,
      label: 'the separate docket and build records', art: 'ledger', node: 'nexus.seal.docket',
      visibleIf: { all: [
        { flag: 'label.nexus.handling-seal.holds', eq: true }, { flag: 'label.nexus.handling-seal.criterion', eq: 'docket' },
      ] } },
    ...sceneProp('nexus.translation-slip', 15, 8, 'the two translators’ proofs', 'nile.slip',
      { date: 'ledger', gloss: 'nile.scroll' }),
    ...sceneProp('nexus.route-board', 18, 14, 'the visitors’ route board', 'cork-board',
      { objects: 'nile.map', sources: 'ledger' }),
    { id: 'nexus-stroke-brief', kind: 'scene', x: 18, y: 17, w: 1, h: 1, label: 'the bench request from the clerk and the carrier',
      art: 'preserved.slip', walkThrough: true, node: 'nexus.stroke.brief',
      visibleIf: { all: [{ flag: 'talked.ise', eq: true }, { not: strokeRequested }] } },
    { id: 'nexus-stroke-layout', kind: 'scene', x: 18, y: 17, w: 1, h: 1, label: 'the stand for the four bench strips',
      art: 'board-stand', walkThrough: true, node: 'nexus.stroke.layout',
      visibleIf: { all: [strokeRequested, strokeUnposted] } },
    { id: 'nexus-stroke-ledger', kind: 'scene', x: 14, y: 15, w: 1, h: 1, label: 'the two-surface comparison by the ledger',
      art: 'preserved.display-paired', walkThrough: true, node: 'nexus.stroke.ledger',
      visibleIf: { flag: 'nexus.stroke.display', eq: 'ledger' } },
    { id: 'nexus-stroke-carrier', kind: 'scene', x: 18, y: 15, w: 1, h: 1, label: 'the two-surface comparison by the bundles',
      art: 'copies.strip', walkThrough: true, node: 'nexus.stroke.carrier',
      visibleIf: { flag: 'nexus.stroke.display', eq: 'carrier' } },
    { id: 'nexus-rest-counter', kind: 'scene', x: 21, y: 10, w: 1, h: 1, walkThrough: true,
      label: 'the tray of loan counters', art: 'nexus.loan-counters', node: 'nexus.rest.counter' },
    { id: 'nexus-rest-request', kind: 'scene', x: 23, y: 12, w: 1, h: 1, walkThrough: true,
      label: 'the waiting requests by the low table', art: 'preserved.slip', node: 'nexus.rest.request' },
    { id: 'nexus-rest-bench', kind: 'scene', x: 24, y: 17, w: 1, h: 1, walkThrough: true,
      label: 'the two spare reading rests', art: 'nexus.reading-rests', node: 'nexus.rest.bench',
      visibleIf: { all: [{ flag: 'nexus.rest.counted', eq: true }, { flag: 'nexus.rest.waiting', eq: true },
        { not: { flagSet: 'nexus.rest.layout' } }] } },
    { id: 'nexus-rest-pair-slot', kind: 'scene', x: 24, y: 11, w: 1, h: 1, walkThrough: true,
      label: 'the low table ready for two rests', art: 'board-stand', node: 'nexus.rest.pair-slot',
      visibleIf: { all: [restTogether, { not: restPairPlaced }] } },
    { id: 'nexus-rest-pair-ready', kind: 'scene', x: 24, y: 11, w: 1, h: 1, walkThrough: true,
      label: 'the books resting together on the low table', art: 'nexus.reading-rests', node: 'nexus.rest.pair-ready',
      visibleIf: { all: [restTogether, restPairPlaced] } },
    { id: 'nexus-rest-fixed-slot', kind: 'scene', x: 24, y: 11, w: 1, h: 1, walkThrough: true,
      label: 'the low table ready for a fixed rest', art: 'board-stand', node: 'nexus.rest.fixed-slot',
      visibleIf: { all: [restCirculate, { not: restTablePlaced }] } },
    { id: 'nexus-rest-fixed-ready', kind: 'scene', x: 24, y: 11, w: 1, h: 1, walkThrough: true,
      label: 'the fixed rest on the low table', art: 'nexus.reading-rest', node: 'nexus.rest.fixed-ready',
      visibleIf: { all: [restCirculate, restTablePlaced] } },
    { id: 'nexus-rest-mobile-slot', kind: 'scene', x: 19, y: 10, w: 1, h: 1, walkThrough: true,
      label: 'the return hook for a portable rest', art: 'board-stand', node: 'nexus.rest.mobile-slot',
      visibleIf: { all: [restCirculate, { not: restPortablePlaced }] } },
    { id: 'nexus-rest-mobile-ready', kind: 'scene', x: 19, y: 10, w: 1, h: 1, walkThrough: true,
      label: 'the portable rest at the return hook', art: 'nexus.reading-rest', node: 'nexus.rest.mobile-ready',
      visibleIf: { all: [restCirculate, restPortablePlaced] } },
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
    { id: 'copies-door', kind: 'door', x: 21, y: 14, w: 1, h: 1, label: 'the passage to the City of Copies', art: 'copies.waypost',
      walkThrough: true, visibleIf: { objective: 'metal.finish' }, flag: 'copies.arrived',
      to: { map: 'copies.archive', x: 12, y: 12 } },
    { id: 'sea-door', kind: 'door', x: 20, y: 13, w: 1, h: 1, label: 'the passage to the Cartographers’ Sea', art: 'sea.waypost',
      walkThrough: true, visibleIf: { objective: 'copies.revise' }, flag: 'sea.arrived',
      to: { map: 'sea.harbour', x: 12, y: 12 } },
    { id: 'stage-door', kind: 'door', x: 19, y: 12, w: 1, h: 1, label: 'the passage to the House of Performance', art: 'stage.waypost',
      walkThrough: true, visibleIf: { objective: 'sea.finish' }, flag: 'stage.arrived',
      to: { map: 'stage.foyer', x: 12, y: 12 } },
    { id: 'market-door', kind: 'door', x: 22, y: 10, w: 1, h: 1, label: 'the passage to the Market of Measures', art: 'market.waypost',
      walkThrough: true, visibleIf: { objective: 'stage.finish' }, flag: 'market.arrived',
      to: { map: 'market.square', x: 17, y: 19 } },
    { id: 'water-door', kind: 'door', x: 25, y: 11, w: 1, h: 1, label: 'the passage to the Water Commons', art: 'water.waypost',
      walkThrough: true, visibleIf: { objective: 'market.finish' }, flag: 'water.arrived',
      to: { map: 'water.gatehouse', x: 12, y: 12 } },
    { id: 'civic-door', kind: 'door', x: 28, y: 11, w: 1, h: 1, label: 'the passage to the Civic Machine', art: 'civic.waypost',
      walkThrough: true, visibleIf: { objective: 'water.finish' }, flag: 'civic.arrived',
      to: { map: 'civic.dispatch', x: 12, y: 12 } },
    { id: 'voices-door', kind: 'door', x: 31, y: 11, w: 1, h: 1, label: 'the passage to the Archive of Voices', art: 'voices.waypost',
      walkThrough: true, visibleIf: { objective: 'civic.finish' }, flag: 'voices.arrived',
      to: { map: 'voices.listening', x: 12, y: 12 } },
    { id: 'island-door', kind: 'door', x: 34, y: 11, w: 1, h: 1, label: 'the passage to the Island of Models', art: 'island.waypost',
      walkThrough: true, visibleIf: { objective: 'voices.finish' }, flag: 'island.arrived',
      to: { map: 'island.workshop', x: 12, y: 12 } },
    { id: 'council-door', kind: 'door', x: 37, y: 11, w: 1, h: 1, label: 'the passage to the Council of Inquiry', art: 'council.waypost',
      walkThrough: true, visibleIf: { objective: 'island.finish' }, flag: 'council.arrived',
      to: { map: 'council.hall', x: 12, y: 12 } },
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
    { id: 'nexus-gauge-case', kind: 'scene', node: 'lost.gauge.inspect', x: 2, y: 6, w: 1, h: 1, walkThrough: true,
      label: 'the notched brass gauge in the found tray', art: 'lost-gauge.found', visibleIf: { all: [{ not: gaugePouch }, { not: gaugeResolved }] } },
    { ...gaugeShelf, id: 'nexus-gauge-intake', kind: 'scene', node: 'lost.gauge.intake',
      label: 'the open found book', art: 'ledger', visibleIf: { not: gaugeLogged } },
    { ...gaugeShelf, id: 'nexus-gauge-wait', kind: 'scene', node: 'lost.gauge.waiting',
      label: 'the open owner line in the found book', art: 'lost-gauge.stub', visibleIf: { all: [gaugeLogged, { not: gaugeThread }] } },
    { ...gaugeShelf, id: 'nexus-gauge-thread', kind: 'thread', thread: 'lost-gauge', node: 'entry',
      label: 'the blue-tie intake record', art: 'lost-gauge.stub', visibleIf: { all: [gaugeLogged, gaugeThread, { not: gaugeEntry }] } },
    { ...gaugeShelf, id: 'nexus-gauge-carry', kind: 'scene', node: 'lost.gauge.carry',
      label: 'the padded pouch and sign-out book', art: 'lost-gauge.pouch',
      visibleIf: { all: [gaugeLogged, gaugeThread, gaugeEntry, { not: gaugePouch }, { not: gaugeResolved }] } },
    { ...gaugeShelf, id: 'nexus-gauge-awaiting', kind: 'scene', node: 'lost.gauge.awaiting',
      label: 'the sign-out stub under the blue tie', art: 'lost-gauge.stub',
      visibleIf: { all: [{ any: [gaugePouch, gaugeResolved] }, { not: gaugeUsed }] } },
    { ...gaugeShelf, id: 'nexus-gauge-receipt', kind: 'scene', node: 'lost.gauge.receipt',
      label: 'Aster’s return receipt beside the found book', art: 'lost-gauge.receipt', visibleIf: { all: [gaugeUsed, { not: gaugeReceipted }] } },
    ...(['owner', 'loan'] as const).map((mode) => ({
      ...gaugeShelf, id: `nexus-gauge-closed-${mode}`, kind: 'scene' as const, node: `lost.gauge.closed-${mode}`,
      label: mode === 'owner' ? 'the checked return in the found book' : 'the checked return and separate loan line',
      art: mode === 'owner' ? 'lost-gauge.closed' : 'lost-gauge.loan-note',
      visibleIf: { all: [gaugeReceipted, { flag: 'lost.gauge.resolved', eq: mode }] },
    })),
    { id: 'nexus-handle-case', kind: 'scene', x: 5, y: 17, w: 1, h: 1, walkThrough: true,
      label: 'Kip’s case with a split handle', art: 'nexus.handle-torn', node: 'nexus.handle.start',
      visibleIf: { all: [handleUnfitted, { not: handlePaused }] } },
    { id: 'nexus-handle-resting', kind: 'scene', x: 5, y: 17, w: 1, h: 1, walkThrough: true,
      label: 'Kip’s case waiting for a handle', art: 'nexus.handle-torn', node: 'nexus.handle.wait',
      visibleIf: { all: [handleUnfitted, handlePaused] } },
    ...handleMethods.flatMap((method) => {
      const fitted: Condition = { flag: 'nexus.handle.method', eq: method };
      const position = { kind: 'scene' as const, x: 16, y: 16, w: 1, h: 1, walkThrough: true };
      const label = method === 'paired' ? 'the workshop case with two cord loops' : 'the workshop case with the stitched handle';
      return [
        { ...position, id: `nexus-handle-${method}-bench`, label, art: `nexus.handle-${method}`, node: `nexus.handle.${method}-bench`,
          visibleIf: { all: [fitted, { not: handleDone }] } },
        { ...position, id: `nexus-handle-${method}-case`, label, art: `nexus.handle-${method}-ready`, node: `nexus.handle.${method}-case`,
          visibleIf: { all: [fitted, handleDone] } },
      ];
    }),
    { id: 'nexus-pack-prep', kind: 'scene', x: 4, y: 6, w: 1, h: 1, walkThrough: true,
      label: 'the packing table with six sketches and two source slips', art: 'nexus.pack-prep', node: 'nexus.pack.prep',
      visibleIf: { all: [packWaiting, { any: [{ not: { flagSet: 'nexus.pack.layout' } }, { flag: 'nexus.pack.layout', eq: 'open' }] }] } },
    ...packLayouts.flatMap((layout) => {
      const arranged: Condition = { flag: 'nexus.pack.layout', eq: layout };
      const label = layout === 'kits' ? 'the crate with a source slip inside each wallet'
        : 'the crate with both source slips under the outer lid';
      const rack = { kind: 'scene' as const, x: 6, y: 6, w: 1, h: 1, walkThrough: true, art: `nexus.pack-${layout}` };
      return [
        { ...rack, id: `nexus-pack-${layout}`, label, node: 'nexus.pack.trial',
          visibleIf: { all: [packWaiting, arranged, { not: packTried }] } },
        { ...rack, id: `nexus-pack-ready-${layout}`, label: 'the opened trial wallet beside the dispatch crate',
          art: `nexus.pack-tested-${layout}`, node: 'nexus.pack.ready',
          visibleIf: { all: [packWaiting, arranged, packTried] } },
      ];
    }),
    ...packReaders.map((reader) => ({
      id: `nexus-pack-dock-${reader}`, kind: 'scene' as const, x: 8, y: 5, w: 1, h: 1, walkThrough: true,
      label: reader === 'route' ? 'the runner’s tag with the wallet groups' : 'the clerk’s tag with two tally lines',
      art: reader === 'route' ? 'nexus.pack-kits-route' : 'nexus.pack-tally',
      artBy: reader === 'route' ? { flag: 'nexus.pack.layout', keys: { outer: 'nexus.pack-outer-route' } } : undefined,
      node: `nexus.pack.dock-${reader}`,
      visibleIf: { all: [{ flag: 'nexus.pack.tag', eq: reader }, { not: packSent }] },
    })),
    ...packLayouts.flatMap((layout) => packReaders.map((reader) => ({
      id: `nexus-pack-${layout}-${reader}`, kind: 'scene' as const, x: 8, y: 5, w: 1, h: 1, walkThrough: true,
      label: reader === 'route' ? 'the runner’s checked group tag' : 'the clerk’s checked tally',
      art: reader === 'route' ? `nexus.pack-${layout}-route` : 'nexus.pack-tally',
      node: `nexus.pack.${layout}-${reader}`, visibleIf: { flag: 'nexus.pack.sent', eq: `${layout}-${reader}` },
    }))),
    ...printStages.map(([stage, label, visibleIf]) => ({
      id: `nexus-print-${stage}`, kind: 'scene' as const, x: 5, y: 11, w: 1, h: 1, walkThrough: true,
      label, art: `nexus.print-${stage}`, node: `nexus.print.${stage}`, visibleIf,
    })),
    { id: 'ex-a', kind: 'exhibit', exhibit: 'OBJ-001-A', x: 8, y: 7, w: 1, h: 1, label: 'the patent drawing', art: 'pedestal.patent' },
    { id: 'ex-b', kind: 'exhibit', exhibit: 'OBJ-001-B', x: 12, y: 7, w: 2, h: 1, label: 'the workshop model', art: 'pedestal.model' },
    { id: 'ex-c', kind: 'exhibit', exhibit: 'OBJ-001-C', x: 17, y: 7, w: 1, h: 1, label: 'the Biro pen record', art: 'pedestal.biro' },
    ...ribbonStages.map(([stage, label, visibleIf]) => ({
      id: `nexus-ribbon-${stage}`, kind: 'scene' as const, x: 16, y: 5, w: 1, h: 1, walkThrough: true,
      label, art: `nexus.ribbon-${stage}`, node: `nexus.ribbon.${stage}`, visibleIf,
    })),
    { id: 'bench', kind: 'bench', x: 19, y: 16, w: 3, h: 2, label: 'the workshop bench (marking test)' },
    { id: 'label-pen', kind: 'label', kit: 'pen', x: 10, y: 15, w: 1, h: 1, label: 'the label stand', art: 'label-stand' },
    ...FIRST_BENCH_EPILOGUE,
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
