import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const metalReady: Condition = { objective: 'metal.finish' };
const activeFrame: Condition = { flag: 'perspective.active', eq: 'two-face-frame' };
const compared: Condition = { objective: 'plate.metal.compare' };
const loan: Condition = { flag: 'plate.metal.route', eq: 'loan' };
const pair: Condition = { flag: 'plate.metal.route', eq: 'pair' };
const returned: Condition = { flag: 'plate.council.returned', eq: true };
const away: Condition = { all: [loan, { not: returned }] };
const used: Condition = { objective: 'plate.council.checked' };

const councilReady: Condition = { all: [{ objective: 'council.arrival' }, { objective: 'plate.metal.checked' }] };
const councilTest: Condition = {
  all: [councilReady, activeFrame, { card: 'card.plate.bete' }, { not: { flagSet: 'plate.council.test' } }],
};
const placedAt = (place: 'rail' | 'bench'): Condition => ({ flag: 'plate.council.place', eq: place });

function scene(id: string, node: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id, kind: 'scene', node: `plate.${node}`, x, y, w: 1, h: 1, label, art, visibleIf, walkThrough: true };
}

function notice(id: string, x: number, y: number, label: string, art: string, text: string, visibleIf: Condition): Interactable {
  return { id, kind: 'sign', x, y, w: 1, h: 1, label, art, text, visibleIf, walkThrough: true };
}

export const METALWORKS_PLATE_YARD: Interactable[] = [
  {
    ...scene('metal-plate-turn', 'metal.original', 13, 6, 'Bea’s hinged plate with two slots', 'plate.front',
      { all: [metalReady, activeFrame, { not: away }] }),
    artBy: { flag: 'plate.metal.face', keys: { front: 'plate.front', back: 'plate.back' } },
  },
  notice('metal-plate-flat', 13, 6, 'the flat example on the loan rack', 'plate.print',
    'Bea set the original aside for the Council loan. This temporary print lets the next apprentice match the three front marks. The hinge and fitting grooves are on the plate itself.',
    away),
  {
    ...scene('metal-plate-print', 'metal.print', 16, 6, 'the first impression tray', 'plate.print',
      { all: [metalReady, activeFrame, { not: { flagSet: 'plate.metal.route' } }] }),
    artOpen: { key: 'plate.case-set', if: { flag: 'plate.metal.print', eq: true } },
  },
  notice('metal-plate-returned', 16, 6, 'the signed return beside the turning bench', 'plate.back',
    'The old plate is back on the hinge. A learner feels the two grooves with the frame while Bea copies the Council check into the repair file.',
    returned),
];

export const METALWORKS_PLATE_HALL: Interactable[] = [
  { id: 'metal-plate-foumban', kind: 'exhibit', exhibit: 'OBJ-PLATE-FOUMBAN', x: 4, y: 6, w: 1, h: 1,
    label: 'the Foumban case with the signing date', art: 'plate.case-fold', walkThrough: true, visibleIf: metalReady },
  scene('metal-plate-pack', 'metal.pack', 19, 5, 'Bea’s cradle and paper sleeve', 'plate.frame',
    { all: [compared, { not: { flagSet: 'plate.metal.route' } }] }),
  scene('metal-plate-loan-receipt', 'metal.loan-receipt', 20, 13, 'the carrier’s signed loan receipt', 'plate.case-fold', loan),
  scene('metal-plate-pair-receipt', 'metal.pair-receipt', 20, 13, 'the carrier’s signed print receipt', 'plate.case-set', pair),
];

export const COUNCIL_PLATE_GALLERY: Interactable[] = [
  { id: 'council-plate-bete', kind: 'exhibit', exhibit: 'OBJ-PLATE-BETE', x: 16, y: 5, w: 1, h: 1,
    label: 'the catalogue for Frédéric Bruly Bouabré’s boards', art: 'plate.case-set', visibleIf: councilReady, walkThrough: true },
  scene('council-plate-cradle', 'council.loan', 14, 9, 'the cradle for Plate Eleven', 'plate.back', { all: [loan, councilTest] }),
  scene('council-plate-prints', 'council.pair', 6, 12, 'the tray with both prints of Plate Eleven', 'plate.case-set', { all: [pair, councilTest] }),
  scene('council-plate-place', 'council.place', 17, 16, 'Essi’s unused bracket beside the rail', 'plate.frame',
    { all: [activeFrame, { objective: 'plate.council.compare' }, { not: { flagSet: 'plate.council.place' } }] }),
  { ...scene('council-plate-rail', 'council.rail-use', 23, 15, 'the public chart outside the rail', 'plate.case-set', placedAt('rail')),
    artOpen: { key: 'preserved.display-paired', if: used } },
  scene('council-plate-loan-bench', 'council.bench-loan', 11, 16, 'Essi’s fitting bench', 'plate.back',
    { all: [loan, placedAt('bench'), { not: used }] }),
  notice('council-plate-bench-record', 11, 16, 'the signed fitting left on the bench', 'plate.case-fold',
    'Essi’s check names both slots and the day-14 repair tab. The plate went home after the fitting. A learner can take this record to Bea’s workshop to try the fit again.',
    { all: [loan, placedAt('bench'), used] }),
  { ...scene('council-plate-pair-bench', 'council.bench-pair', 11, 16, 'Essi’s fitting request and both prints', 'plate.case-set', { all: [pair, placedAt('bench')] }),
    artOpen: { key: 'plate.case-fold', if: used } },
];
