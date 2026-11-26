import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const COPIES = 'welcome.copies.';
const MARKET = 'welcome.market.';
const arrivedCopies: Condition = { objective: 'copies.arrival' };
const arrivedMarket: Condition = { objective: 'market.arrival' };
const f = (key: string, eq: boolean | string = true): Condition => ({ flag: key, eq });
const copiesDone = f(COPIES + 'received');
const marketDone = f(MARKET + 'tested');

function visit(id: string, node: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id: `welcome-${id}`, kind: 'scene', node, x, y, w: 1, h: 1, label, art, visibleIf, walkThrough: true };
}

function read(id: string, x: number, y: number, label: string, art: string, text: string, visibleIf: Condition): Interactable {
  return { id: `welcome-${id}`, kind: 'sign', x, y, w: 1, h: 1, label, art, text, visibleIf, walkThrough: true };
}

export const COPIES_WELCOME: Interactable[] = [
  visit('copies-start', COPIES + 'start', 13, 10, 'the shared bench and the folded invitation', 'copies.strip',
    { all: [arrivedCopies, { not: f(COPIES + 'started') }] }),
  visit('copies-reader', COPIES + 'reader', 4, 10, 'the visitor’s scrap by the west path', 'preserved.slip',
    { all: [f(COPIES + 'started'), { not: f(COPIES + 'reader') }] }),
  visit('copies-mender', COPIES + 'mender', 22, 8, 'the menders’ clamp tray and bench mark', 'island.card',
    { all: [f(COPIES + 'started'), { not: f(COPIES + 'mender') }] }),
  visit('copies-desk', COPIES + 'desk', 13, 10, 'the keeper’s two invitation slips', 'preserved.display-paired',
    { all: [{ objective: COPIES + 'o.read' }, { not: { flagSet: COPIES + 'plan' } }] }),
  visit('copies-check-panel', COPIES + 'check.panel', 6, 10, 'the low welcome board by the west path', 'copies.reprint',
    { all: [f(COPIES + 'plan', 'panel'), { not: copiesDone }] }),
  visit('copies-check-host', COPIES + 'check.host', 13, 11, 'the host with the two-part bench slip', 'copies.strip',
    { all: [f(COPIES + 'plan', 'host'), { not: copiesDone }] }),
  read('copies-panel', 6, 10, 'the new low welcome board', 'copies.reprint',
    'Every reader may share the bench. Bring a book to a mender before using a clamp. The tray number stays beside the small line.',
    { all: [f(COPIES + 'plan', 'panel'), copiesDone] }),
  read('copies-host', 13, 11, 'the hanging strip beside the host', 'copies.strip',
    'VELIN. We keep this bench. Every reader may share it. A host reads both lines here. The menders still check the book before using the clamp.',
    { all: [f(COPIES + 'plan', 'host'), copiesDone] }),
  visit('copies-source', COPIES + 'source', 15, 12, 'the public account of the Fremont gurdwara’s langar', 'preserved.catalogue', arrivedCopies),
];

const marketStarted: Condition = { flagSet: MARKET + 'source' };
const importedAfterVisit: Condition = { all: [marketDone, { item: 'item.welcome.scope-slip' }, f(MARKET + 'source', 'local'), { not: f(MARKET + 'late') }] };

export const MARKET_WELCOME: Interactable[] = [
  visit('market-start', MARKET + 'start', 15, 18, 'Dagny’s folded welcome board', 'preserved.folder',
    { all: [arrivedMarket, { not: marketStarted }] }),
  visit('market-bench', MARKET + 'bench', 23, 17, 'the covered rest bench behind the workshop', 'voices.lamp',
    { all: [marketStarted, { not: f(MARKET + 'bench') }] }),
  visit('market-tally', MARKET + 'tally', 20, 7, 'the clerk’s counting boundary and window slip', 'ledger',
    { all: [marketStarted, { not: f(MARKET + 'tally') }] }),
  visit('market-desk', MARKET + 'desk', 15, 18, 'the welcome desk with a strip and a rolled mat', 'preserved.display-paired',
    { all: [{ objective: MARKET + 'o.route' }, { not: { flagSet: MARKET + 'plan' } }] }),
  visit('market-check-path', MARKET + 'check.path', 29, 14, 'the public rest mat on the east rail', 'market.rest-mat',
    { all: [f(MARKET + 'plan', 'path'), { not: marketDone }] }),
  visit('market-check-guide', MARKET + 'check.guide', 23, 17, 'the guide beside the covered bench', 'preserved.display-paired',
    { all: [f(MARKET + 'plan', 'guide'), { not: marketDone }] }),
  read('market-path', 29, 14, 'the rail notice by the open rest mat', 'market.rest-mat',
    'Rest here while the weighing continues. The tally desk is private during the count. The public unit rates come to the window after it ends.',
    { all: [f(MARKET + 'plan', 'path'), marketDone] }),
  read('market-guide', 23, 17, 'the guide’s two-sided lane strip', 'preserved.display-paired',
    'REMNA. Sit at the covered bench even during the count. The guide reads the tally boundary separately and says when the public rates reach the window.',
    { all: [f(MARKET + 'plan', 'guide'), marketDone] }),
  visit('market-return', MARKET + 'return', 15, 18, 'Dagny’s pocket for the later Copies slip', 'preserved.folder', importedAfterVisit),
  visit('market-source', MARKET + 'reference', 12, 19, 'Saint Meinrad Archabbey’s public welcome and visitor guide', 'preserved.catalogue', arrivedMarket),
  visit('market-readers', MARKET + 'readers', 11, 19, 'the reader’s shelf with two separate pockets', 'preserved.display-paired',
    { all: [arrivedMarket, { card: 'card.welcome.langar' }, { card: 'card.welcome.archabbey' }, { not: f(MARKET + 'filed') }] }),
  read('market-filed', 11, 19, 'the two named sources on their own slips', 'preserved.display-records',
    'The left pocket holds Harvard Pluralism Project’s account of a Sikh meal in Fremont. The right holds Saint Meinrad Archabbey’s Benedictine visitor guide. Each names its own community’s reason for welcome.',
    f(MARKET + 'filed')),
];
