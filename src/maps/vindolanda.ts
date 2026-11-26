import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const tablet: Condition = { card: 'card.vindolanda.tablet' };
const traced: Condition = { flagSet: 'vindolanda.trace' };
const folio: Condition = { item: 'item.vindolanda.folio' };
const nexusPlaced: Condition = { flagSet: 'vindolanda.nexus.layout' };
const hallPlaced: Condition = { flagSet: 'vindolanda.hall.layout' };

function scene(id: string, node: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id, kind: 'scene', node, x, y, w: 1, h: 1, label, art, visibleIf, walkThrough: true };
}

function sign(id: string, x: number, y: number, label: string, art: string, text: string, visibleIf: Condition, flag?: string): Interactable {
  return { id, kind: 'sign', x, y, w: 1, h: 1, label, art, text, visibleIf, flag, walkThrough: true };
}

export const NEXUS_VINDOLANDA: Interactable[] = [
  {
    id: 'nexus-vind-case', kind: 'scene', node: 'vindolanda.catalogue', x: 14, y: 8, w: 1, h: 1,
    label: 'the catalogue of Claudia Severa’s invitation', art: 'ledger', walkThrough: true,
  },
  scene('nexus-vind-trace', 'vindolanda.trace', 15, 9, 'the traced gap on the archive copy', 'preserved.slip', tablet),
  scene('nexus-vind-earlier', 'vindolanda.earlier', 16, 9, 'the earlier reading slip', 'preserved.context', traced),
  scene('nexus-vind-later', 'vindolanda.later', 17, 9, 'the later reading beneath the low mark', 'preserved.folder', traced),
  scene('nexus-vind-place', 'vindolanda.nexus.place', 18, 9, 'the two reading clips', 'preserved.display-paired',
    { all: [{ objective: 'vindolanda.compare' }, { not: nexusPlaced }] }),
  sign('nexus-vind-caption', 18, 9, 'the invitation facing the walkway', 'preserved.display-records',
    'A visitor can read who invited whom. Both restorations remain on the rail. One small bracket keeps the damaged verb from looking complete.',
    { flag: 'vindolanda.nexus.layout', eq: 'caption' }),
  sign('nexus-vind-editors', 18, 9, 'two edition sheets beneath the trace', 'preserved.display-paired',
    'A reader at the rail follows the low mark to the two proposed forms. The short caption below identifies the invitation, its date range and source.',
    { flag: 'vindolanda.nexus.layout', eq: 'trace' }),
];

export const METALWORKS_VINDOLANDA_YARD: Interactable[] = [
  sign('metal-vind-witness', 15, 12, 'the next-delivery witness line', 'metalworks.receipt',
    'This docket names the carrier, who takes a piece across the yard. For the new repair, the person who sees the fit signs the inner slip. The carry mark on the sleeve keeps its own line.',
    { all: [folio, { not: hallPlaced }] }, 'vindolanda.yard.repair'),
  sign('metal-vind-separate', 15, 12, 'the confirmed fit at the yard bench', 'preserved.slip',
    'The fit witness signs at the yard while the piece is on its frame. The carrier takes only the addressed note to the hall. The keeper there can request the separate approval if needed.',
    { flag: 'vindolanda.hall.layout', eq: 'separate' }, 'vindolanda.hall.readback'),
];

export const METALWORKS_VINDOLANDA_HALL: Interactable[] = [
  scene('metal-vind-fold', 'vindolanda.hall.fold', 8, 6, 'the folded address beside Bea’s delivery slips', 'preserved.folder', folio),
  scene('metal-vind-place', 'vindolanda.hall.place', 9, 7, 'the dispatch clips and the next sleeve', 'metalworks.receipt',
    { all: [{ objective: 'vindolanda.hall.compare' }, { not: hallPlaced }] }),
  sign('metal-vind-sleeve', 9, 7, 'the addressed sleeve with a separate witness line', 'preserved.display-paired',
    'At the hall, the carrier points to the outside address. Bea turns the sleeve over and shows the separate fit-witness signature. The recipient can check both names on the same sleeve.',
    { flag: 'vindolanda.hall.layout', eq: 'sleeve' }, 'vindolanda.hall.readback'),
];
