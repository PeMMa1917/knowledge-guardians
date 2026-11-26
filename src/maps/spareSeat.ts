import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const prefix = 'spare-seat.';
const flag = (name: string, value: string | true = true): Condition => ({ flag: prefix + name, eq: value });
const done = (name: string): Condition => ({ objective: prefix + name });
const all = (...conditions: Condition[]): Condition => ({ all: conditions });
const not = (condition: Condition): Condition => ({ not: condition });
const nile = { flag: 'nile.arrived', eq: true } as const;
const warrant: Condition = { item: 'item.spare-seat.warrant' };
const civic = all({ flag: 'civic.arrived', eq: true }, warrant);

function scene(id: string, x: number, y: number, label: string, art: string, node: string, visibleIf: Condition): Interactable {
  return { id: prefix + id, kind: 'scene', x, y, w: 1, h: 1, label, art, node: prefix + node, visibleIf, walkThrough: true };
}

function sign(id: string, x: number, y: number, label: string, art: string, text: string, visibleIf: Condition, read: string): Interactable {
  return { id: prefix + id, kind: 'sign', x, y, w: 1, h: 1, label, art, text, visibleIf, flag: prefix + read, walkThrough: true };
}

export const NILE_SPARE_SEAT: Interactable[] = [
  { ...scene('stand', 2, 6, 'the spare reading stand and its two loan tabs', 'board-stand', 'test', nile),
    artBy: { flag: prefix + 'tab', keys: { peg: 'nile.tablet', request: 'nile.scroll' } } },
  sign('peg', 2, 8, 'the blue peg beside its handback line', 'nile.tablet',
    'The peg matches yesterday’s closed loan. The tray holds no current request from this bearer. The peg traces a handback. It gives no reason to promise a stand today.',
    flag('tab', 'peg'), 'seen.peg'),
  sign('request', 2, 8, 'the current request in the empty peg slot', 'nile.scroll',
    'Elos’s request has today’s date and the keeper’s check mark. The last blue peg still hangs on the returned stand. An empty slot can belong to someone with a current request.',
    flag('tab', 'request'), 'seen.request'),
  scene('post', 5, 11, 'the draft loan promise on Marek’s rail', 'preserved.slip', 'post',
    all(done('counterexamples'), not({ flagSet: prefix + 'rule' }))),
  sign('public', 5, 11, 'the new public request rail', 'preserved.display-records',
    'Today’s checked requests go here in order. Elos takes the spare stand. Neral’s request never reached the rail. She leaves word for Marek and goes back to work.',
    flag('rule', 'public'), 'checked'),
  sign('staffed', 6, 11, 'the keeper’s staffed check station', 'preserved.display-paired',
    'The keeper lends the stand to Elos and hears Neral’s request before she returns to work. He saves the next handback for her. Readers who arrive between checks have to wait for him.',
    flag('rule', 'staffed'), 'checked'),
  scene('carry', 4, 11, 'the checked loan warrant on the copying hook', 'nile.slip', 'carry',
    all(done('loan'), not(warrant))),
];

export const CIVIC_SPARE_SEAT: Interactable[] = [
  sign('transfer-public', 22, 9, 'Lin’s reading of the public request rail', 'civic.ledger',
    'Your rail made a current request easy to check in the archive. Lin keeps that idea in the service book. A request can be in order while its holder is still outside the rail. Walk both approaches before she posts the trial.',
    all(civic, flag('rule', 'public'), not(flag('civic.open'))), 'civic.open'),
  sign('transfer-staffed', 22, 9, 'Lin’s reading of the staffed loan check', 'civic.notice',
    'Your staffed check let a reader speak when their record was missing. Lin has a different problem. She has the signed request already. Walk both approaches and find what a second check could change.',
    all(civic, flag('rule', 'staffed'), not(flag('civic.open'))), 'civic.open'),
  scene('desk', 22, 9, 'the Canal Walk practice service stand', 'board-stand', 'desk',
    all(civic, done('approaches'), not({ flagSet: prefix + 'plan' }))),
  sign('steps-check', 21, 10, 'the signed request at the present stop', 'civic.ledger',
    'Siven asked for the cart’s large-print copy. Lin’s log confirms the request and the first-bell place. Siven’s route card ends at the lower rail. The last stretch to this stop has steps.',
    all(civic, flag('civic.open'), not(flag('plan', 'leave'))), 'civic.steps'),
  sign('rail-check', 24, 10, 'the lower rail and the handover record', 'civic.notice',
    'The trial cart can stop on level ground here. The rail keeper has to finish a handover first. Siven can reach the rail and return at the second bell. The other borrower can arrive only at the first bell.',
    all(civic, flag('civic.open'), not(flag('plan', 'move'))), 'civic.rail'),
  sign('leave', 21, 10, 'the first-bell service notice with an open referral', 'preserved.display-records',
    'The first-bell borrower takes their parcel. Lin copies Siven’s request onto the staffed follow-up rail and leaves the request open. Siven goes home without the large-print copy today.',
    all(civic, flag('plan', 'leave')), 'civic.checked'),
  sign('move', 24, 10, 'the cart’s new second-bell rail stop', 'preserved.display-paired',
    'Siven collects the large-print copy at the lower rail after handover. The other borrower misses today’s only stop. Lin holds their parcel for tomorrow. Both requests stay dated in the service book.',
    all(civic, flag('plan', 'move')), 'civic.checked'),
];
