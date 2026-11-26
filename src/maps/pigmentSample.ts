import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const prefix = 'pigment-sample.';
const controlled: Condition = { objective: 'pigment-window.controlled' };
const compared: Condition = { objective: prefix + 'compared' };
const carried: Condition = { item: 'item.pigment-sample.swatch' };
const state = (key: string, value: string | true = true): Condition => ({ flag: prefix + key, eq: value });
const without = (condition: Condition): Condition => ({ not: condition });
const all = (...conditions: Condition[]): Condition => ({ all: conditions });
const decided: Condition = { flagSet: prefix + 'disposition' };

function scene(id: string, x: number, y: number, label: string, art: string, node: string, visibleIf: Condition): Interactable {
  return { id: prefix + id, kind: 'scene', x, y, w: 1, h: 1, label, art, node: prefix + node, visibleIf, walkThrough: true };
}

function sign(id: string, x: number, y: number, label: string, art: string, text: string, visibleIf: Condition, flag?: string): Interactable {
  return { id: prefix + id, kind: 'sign', x, y, w: 1, h: 1, label, art, text, visibleIf, flag: flag && prefix + flag, walkThrough: true };
}

export const EMBERFORD_PIGMENT_SAMPLE: Interactable[] = [
  scene('window', 34, 8, 'Nell’s sealed window strip and its loan ticket', 'pigment-sample.window', 'window', controlled),
  scene('packet', 35, 9, 'the signed R13 wrapper in a separate tray', 'pigment-sample.sleeve', 'packet',
    all(controlled, state('window'), without(state('consent')), without(decided))),
  scene('bench', 33, 11, 'the two places set out on Oduya’s swatch bench', 'preserved.display-paired', 'plan',
    all(compared, carried, without(decided))),
  sign('report', 35, 11, 'the R13 workshop report and its empty wrapper', 'pigment-sample.report',
    'The workshop found two colourants in R13. The used-up swatch left its empty wrapper and signed result. A visitor reaches for the whole strip to check its edge. Only the outline on the packing slip is left. W27 stays sealed across the path.',
    all(state('disposition', 'analysis'), without(state('posted'))), 'followed'),
  sign('viewing', 33, 12, 'the whole R13 swatch in its viewing tray', 'pigment-sample.tray',
    'A visitor sets the two-notched R13 edge under the same window light. Its margin is still here to check. The workshop slip beside it is blank. The visitor points at the violet and asks if that settles what went into the paint.',
    all(state('disposition', 'retain'), without(state('posted'))), 'followed'),
  scene('repair', 33, 11, 'the shared caption with two clips', 'board-stand', 'repair',
    all(compared, decided, state('followed'), without(state('posted')))),
  sign('labels', 33, 11, 'the separate captions for W27 and R13', 'pigment-sample.labels',
    'W27 is the sealed older loan. R13 is the later, signed workshop swatch. Follow the number on each card to see exactly what a reader can still check.',
    state('posted')),
  sign('report-filed', 35, 11, 'the numbered R13 report beside the empty wrapper', 'pigment-sample.report',
    'The reader copies “two colourants, R13” and signs beside the wrapper number. The slip preserves the material finding and the outline. The reader cannot put the original R13 edge under the lamp again. The separate W27 card shows a loan date and a colour check through glass. It carries no material result.',
    all(state('disposition', 'analysis'), state('posted')), 'reader.analysis'),
  sign('viewing-filed', 33, 12, 'the numbered R13 viewing tray and its blank report', 'pigment-sample.tray',
    'The reader repeats the edge check on intact R13 and points out both notches. The R13 card says that the workshop made no material check. The separate W27 loan card keeps the earlier window observation with its own date.',
    all(state('disposition', 'retain'), state('posted')), 'reader.retain'),
];
