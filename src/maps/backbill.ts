import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const E = 'backbill.emberford.';
const C = 'backbill.copies.';
const S = 'backbill.stage.';
const flag = (key: string, eq: boolean | string = true): Condition => ({ flag: key, eq });
const proof: Condition = { item: 'item.backbill.proof' };
const handled: Condition = { flagSet: E + 'handled' };
const entered: Condition = flag(E + 'started');
const copiesArrival: Condition = { objective: 'copies.arrival' };
const pressStarted: Condition = { flagSet: C + 'source' };
const stageArrival: Condition = { objective: 'stage.arrival' };
const prepared: Condition = { flagSet: S + 'prepared' };
const installed: Condition = flag(S + 'installed');
const served: Condition = flag(S + 'served');

function billProp(id: string, x: number, y: number, label: string, art: string, visibleIf: Condition,
  action: { kind: 'scene'; node: string } | { kind: 'clue'; clue: string } | { kind: 'sign'; text: string }): Interactable {
  return { id: `backbill-${id}`, x, y, w: 1, h: 1, label, art, visibleIf, walkThrough: true, ...action };
}

function scene(id: string, node: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return billProp(id, x, y, label, art, visibleIf, { kind: 'scene', node });
}

export const EMBERFORD_BACKBILL: Interactable[] = [
  scene('emberford-start', E + 'start', 24, 17, 'Kip’s market playbill at the old frame', 'easel',
    { all: [flag('reached.emberford'), { not: entered }] }),
  billProp('emberford-clue', 24, 17, 'the loosened playbill fragment', 'stage.programme', entered,
    { kind: 'clue', clue: E + 'bill' }),
  scene('emberford-record', E + 'record', 25, 18, 'the envelope for the Print Workshop', 'preserved.folder',
    { all: [flag('clue.backbill.emberford.bill.read'), { not: handled }] }),
  billProp('emberford-dispatched', 25, 18, 'the playbill’s duplicate wrapper', 'copies.strip', handled,
    { kind: 'sign', text: 'Emberford market players. Bill 12. The front is here. The signed division belongs with the printer’s own copy.' }),
];

export const COPIES_PRESS_BACKBILL: Interactable[] = [
  scene('copies-start', C + 'start', 6, 10, 'Lark’s bundle of playbills', 'preserved.folder',
    { all: [copiesArrival, { not: pressStarted }] }),
  billProp('copies-proof', 14, 8, 'the clipped print on Lark’s light rest', 'copies.reprint', pressStarted,
    { kind: 'clue', clue: C + 'proof' }),
  scene('copies-seal', C + 'seal', 5, 10, 'Lark’s proof clamp and signed copy', 'copies.press',
    { all: [{ objective: C + 'o.check' }, { not: proof }] }),
  billProp('copies-covered', 5, 10, 'the filed proof with its signed division', 'preserved.display-paired', proof,
    { kind: 'sign', text: 'Bill 12. Standard seat, three marks. For this run, two marks to the company and one to the hall lamps. Lark’s signed proof went with the Guardian.' }),
];

export const COPIES_ARCHIVE_BACKBILL: Interactable[] = [
  scene('copies-ledger', C + 'ledger', 15, 7, 'the signed playbill division in the Record Room drawer', 'ledger', pressStarted),
];

function display(layout: 'folded' | 'whole', x: number, y: number, art: string, place: string, text: string): Interactable[] {
  const chosen = flag(S + 'layout', layout);
  return [
    scene(`stage-mount-${layout}`, S + 'mount.' + layout, x, y, `the hanging pegs ${place}`, 'stage.waypost',
      { all: [chosen, { not: installed }] }),
    scene(`stage-serve-${layout}`, S + 'serve.' + layout, x, y, `the newly mounted playbill ${place}`, art,
      { all: [chosen, installed, { not: served }] }),
    billProp(`stage-notice-${layout}`, x, y, `the checked playbill ${place}`, art, { all: [chosen, served] }, { kind: 'sign', text }),
  ];
}

export const STAGE_FOYER_BACKBILL = display('folded', 10, 10, 'stage.programme', 'by the foyer hook',
  'Standard seat, three marks. The arrow points to the pocket beneath this price. The signed sheet there gives two marks to the players and one to the hall lamps for Bill 12.');

export const STAGE_GALLERY_BACKBILL: Interactable[] = [
  scene('stage-prep', S + 'prep', 16, 10, 'Hari’s empty playbill rack', 'preserved.folder',
    { all: [stageArrival, { not: prepared }] }),
  scene('stage-local', S + 'local', 19, 10, 'Hari’s drawer with the house sheets', 'ledger',
    { all: [flag(S + 'local-start'), { not: prepared }] }),
  scene('stage-layout', S + 'layout', 16, 10, 'Hari’s rack and two sets of hanging pegs', 'preserved.display-paired',
    { all: [prepared, { not: installed }] }),
  ...display('whole', 18, 10, 'preserved.display-records', 'by the waiting bench',
    'Bill 12. Standard seat, three marks. Both the box price and the signed division are in this frame. Two marks go to the players and one to the hall lamps.'),
  scene('stage-return', S + 'return', 16, 10, 'Hari’s rack with room for another checked sheet', 'preserved.folder',
    { all: [served, proof, { not: flag(S + 'recognized') }] }),
];
