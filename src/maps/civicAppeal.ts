import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

const objective = (id: string): Condition => ({ objective: `parcel.o.${id}` });
const parcelFlag = (id: string): Condition => ({ flag: `parcel.${id}`, eq: true });
const parcelItem = (id: string): Condition => ({ item: `item.parcel.${id}` });
const both = (...all: Condition[]): Condition => ({ all });
const not = (condition: Condition): Condition => ({ not: condition });

type ParcelPlan = 'guarantee' | 'express';
const plan = (name: ParcelPlan): Condition => ({ flag: 'parcel.plan', eq: name });
const returned = parcelFlag('returned');
const delivered = objective('finish');
const first = objective('first');
const permitted = objective('appeal');
const sent = objective('plan');
const started = both({ objective: 'civic.finish' }, parcelFlag('open'));

function scene(id: string, x: number, y: number, label: string, art: string, node: string, visibleIf: Condition): Interactable {
  return { id: `parcel-${id}`, kind: 'scene', x, y, w: 1, h: 1, label, art, node: `parcel.${node}`, visibleIf, walkThrough: true };
}

function publicCopy(name: ParcelPlan, text: string): Interactable {
  return { id: `parcel-copy-${name}`, kind: 'sign', x: 22, y: 10, w: 1, h: 1,
    label: 'the public two-run parcel docket', art: 'civic.wide', text, walkThrough: true, visibleIf: both(returned, plan(name)) };
}

export const CIVIC_APPEAL_DISPATCH = [
  scene('open', 22, 10, 'Ade’s late parcel file', 'preserved.folder', 'open', both({ objective: 'civic.finish' }, not(started))),
  scene('dispatch', 22, 10, 'Ade’s parcel dispatch desk', 'civic.ledger', 'dispatch', both(objective('gather'), not(sent))),
  scene('file-guarantee', 22, 10, 'Ade’s returned parcel file', 'preserved.display-paired', 'return.guarantee',
    both(delivered, plan('guarantee'), not(returned))),
  scene('file-express', 22, 10, 'Ade’s returned parcel file', 'preserved.display-paired', 'return.express',
    both(delivered, plan('express'), not(returned))),
  publicCopy('guarantee', 'SECOND BELL AT THE COUNCIL YARD: four delivered. TERRACE SERVICE TRACK: two delivered after a check of turning room. The original appeal is under seal. The yard attendant left her desk to hold the next collection at the terrace gate.'),
  publicCopy('express', 'FIRST BELL AT THE LOWER RACK: four delivered. THIRD BELL AT THE BANK STOP: two delivered after a check of the key handover. The original appeal is under seal. The next cart kept two of its spare places for the later stop.'),
];

export const CIVIC_APPEAL_CANAL = [
  scene('rail', 7, 10, 'Velaine’s objection clipped under the handover stub', 'clue.slips', 'rail', both(started, not(parcelFlag('rail')))),
  scene('path', 18, 11, 'Tarin’s signed objection by the wheel gauge', 'preserved.slip', 'path', both(started, not(parcelFlag('path')))),
];

function permitGate(name: ParcelPlan, y: number, label: string, text: string, to: NonNullable<Interactable['to']>): Interactable {
  const openIf = both(plan(name), permitted);
  return { id: `parcel-gate-${name}`, kind: 'door', x: 22, y, w: 1, h: 1, label, text,
    visibleIf: both(sent, plan(name)), openIf, to, flag: `parcel.crossed.${name}`,
    art: 'preserved.door', artOpen: { key: 'water.waypost', if: openIf }, walkThrough: true };
}

export const WATER_APPEAL_YARD = [
  scene('first-guarantee', 19, 7, 'the staffed low parcel table', 'civic.reserve', 'first.guarantee',
    both(sent, plan('guarantee'), not(first))),
  scene('review-guarantee', 19, 7, 'Sena’s place for the return appeal', 'preserved.display-records', 'review.guarantee',
    both(first, plan('guarantee'), parcelItem('appeal'), not(permitted))),
  scene('review-express', 19, 7, 'Sena’s place for the return appeal', 'preserved.display-records', 'review.express',
    both(first, plan('express'), parcelItem('appeal'), not(permitted))),
  permitGate('guarantee', 12, 'the terrace service gate',
    'The terrace track has a wide turn for a barrow. The gate opens for a parcel run when Sena issues its permit.',
    { map: 'water.lower-channel', x: 6, y: 15 }),
  permitGate('express', 13, 'the bank service gate',
    'The bank service track leads to the after-bell stop. Sena has to sign a later parcel order before it opens.',
    { map: 'water.lower-channel', x: 26, y: 15 }),
];

export const WATER_APPEAL_WITNESSES: MapDef['npcs'] = [
  { id: 'parcel-carrier', x: 13, y: 14, facing: 'down', visibleIf: both(first, plan('guarantee'), not(permitted), not(parcelItem('appeal'))) },
  { id: 'parcel-bridge', x: 24, y: 14, facing: 'down', visibleIf: both(first, plan('express'), not(permitted), not(parcelItem('appeal'))) },
];

function finalCopy(name: ParcelPlan, x: number, y: number, label: string, text: string): Interactable {
  return { id: `parcel-delivered-${name}`, kind: 'sign', x, y, w: 1, h: 1, label, text,
    art: 'preserved.display-paired', visibleIf: both(delivered, plan(name)), walkThrough: true };
}

export const WATER_APPEAL_LOWER = [
  scene('first-express', 5, 14, 'the first-bell parcel rack', 'civic.reserve', 'first.express',
    both(sent, plan('express'), not(first))),
  scene('second-guarantee', 5, 14, 'the two held boxes at the terrace turn', 'water.fields', 'second.guarantee',
    both(permitted, plan('guarantee'), parcelFlag('crossed.guarantee'), parcelItem('permit'), not(delivered))),
  scene('second-express', 27, 14, 'the two held boxes at the third-bell bank stop', 'water.channel', 'second.express',
    both(permitted, plan('express'), parcelFlag('crossed.express'), parcelItem('permit'), not(delivered))),
  finalCopy('guarantee', 5, 14, 'the signed copy at the wide turn',
    'Two delivered to the seed carriers. The barrow took the whole turn with the boxes on board. The attendant is still on the terrace for the rest of this run.'),
  finalCopy('express', 27, 14, 'the signed copy at the third-bell stop',
    'Two delivered to the bridge crew after handover. The next cart keeps these two places. The first-bell tally stays on its dated line.'),
];
