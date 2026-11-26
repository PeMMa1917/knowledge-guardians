import { BROOKLYN_KHIPU_KEY, BROOKLYN_RETURN, DRESDEN_CODEX_KEY, DRESDEN_RETURN } from '../domain/dateRegister';
import { specimenEquipped } from '../domain/specimenGear';
import type { Interactable } from './types';

const slots = [
  { prop: DRESDEN_RETURN.prop, key: DRESDEN_CODEX_KEY, x: 6, y: 11, flag: 'date-register.dresden.return', label: 'the shape clips for the manuscript',
    node: 'date-register.dresden-return.open', results: [
      ['two-frames', 'The two model frames keep the reported 182.5 and 174.3 cm lengths together. Each length stays with the 1835 conservation note.'],
      ['request', 'The new request reaches the reading desk with 1835 on the display line. A reader can ask for each conserved piece separately.'],
    ] },
  { prop: BROOKLYN_RETURN.prop, key: BROOKLYN_KHIPU_KEY, x: 9, y: 12, flag: 'date-register.khipu.return', label: 'the spare index for the cotton record',
    node: 'date-register.khipu-return.open', results: [
      ['grouped', 'One custodian entry holds accession 70.177.69. Its four study identifiers sit beneath the same number.'],
      ['linked', 'Four separate lookup cards sit side by side. Each leads to the same Brooklyn Museum accession, 70.177.69.'],
    ] },
];

export const DATE_REGISTER_RETURNS = slots.flatMap(({ prop, key, x, y, flag, label, node, results }): Interactable[] => [
  { id: prop, kind: 'scene', x, y, w: 1, h: 1, label, node, art: 'fold.paired', walkThrough: true,
    visibleIf: { all: [specimenEquipped(key), { not: { flagSet: flag } }] } },
  ...results.map(([value, text]): Interactable => ({ id: `${prop}-${value}`, kind: 'sign', x, y, w: 1, h: 1,
    label: `the checked copy at ${label}`, art: 'preserved.display-records', walkThrough: true, text,
    visibleIf: { flag, eq: value } })),
]);
