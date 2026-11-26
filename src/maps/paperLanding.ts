import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const phase = 'paper.landing.phase';
const order = 'paper.landing.order';
const fixed: Condition = { flagSet: order };
const rehearsing: Condition = { all: [{ flagSet: phase }, { not: fixed }] };
const completePass: Condition = { flag: phase, in: ['trail', 'arrival'] };
const readyForCold: Condition = { all: [{ item: 'item.paper-landing-proof' }, { flag: 'preserved.arrived', eq: true }] };
const compared: Condition = { objective: 'paper.landing.compare' };
const checked: Condition = { objective: 'paper.landing.checked' };
const hung: Condition = { flag: 'paper.landing.hung', eq: true };

function scene(id: string, x: number, y: number, label: string, art: string, visibleIf: Condition, node = id): Interactable {
  return { id: `paper-${id}`, kind: 'scene', x, y, w: 1, h: 1, label, art, walkThrough: true, visibleIf, node: `paper.landing.${node}` };
}

export const SEA_PAPER_LANDING: Interactable[] = [
  {
    ...scene('board', 7, 12, 'Sora’s cut-paper play by the practice rail', 'paper-landing.near', { objective: 'sea.finish' }),
    artBy: { flag: phase, keys: {
      'near-tagged': 'paper-landing.near-tagged', 'far-unmarked': 'paper-landing.far',
      trail: 'paper-landing.trail', arrival: 'paper-landing.arrival',
    } },
  },
  scene('peg', 6, 11, 'the removable position peg', 'paper-landing.peg',
    { all: [rehearsing, { flag: phase, in: ['near', 'far-unmarked'] }] }),
  scene('wheel', 6, 13, 'the tide wheel on the paper play', 'paper-landing.wheel',
    { all: [rehearsing, { flag: phase, in: ['near', 'near-tagged'] }] }),
  scene('press', 11, 11, 'the impression press beside Sora’s pocket', 'paper-landing.press', { all: [rehearsing, completePass] }),
  ...(['trail', 'arrival'] as const).map((mode) => scene(`sea-kept-${mode}`, 11, 11,
    'the harbour’s copy of the paper play', `paper-landing.proof-${mode}`, { flag: order, eq: mode }, `kept.${mode}`)),
];

export const COLD_PAPER_LANDING: Interactable[] = [
  ...(['trail', 'arrival'] as const).flatMap((mode) => {
    const reading: Condition = { flag: order, eq: mode };
    const x = mode === 'trail' ? 6 : 22;
    const y = mode === 'trail' ? 13 : 11;
    return [
      scene(`cold-open-${mode}`, 15, 13, 'Aster’s separate practice dispatch desk', `paper-landing.proof-${mode}`,
        { all: [readyForCold, reading, { not: { flagSet: 'paper.landing.cold' } }] }, `cold.${mode}`),
      scene(`cold-plan-${mode}`, 15, 13, 'the practice desk’s checked transfer slip', `paper-landing.proof-${mode}`,
        { all: [readyForCold, reading, compared, { not: { flagSet: 'paper.landing.layout' } }] }, `plan.${mode}`),
      scene(`cold-fit-${mode}`, x, y, mode === 'trail' ? 'the former collection rail' : 'the rail at the current desk',
        'paper-landing.empty-clip', { all: [{ flag: 'paper.landing.layout', eq: mode }, { not: hung }] }, `fit.${mode}`),
      scene(`cold-use-${mode}`, x, y, 'a reader trying the new dispatch copy', `paper-landing.ticket-${mode}`,
        { all: [{ flag: 'paper.landing.layout', eq: mode }, hung, { not: checked }] }, `use.${mode}`),
      scene(`cold-checked-${mode}`, x, y, 'the dispatch copy with a reader’s handover mark', `paper-landing.checked-${mode}`,
        { all: [{ flag: 'paper.landing.layout', eq: mode }, checked] }, `checked.${mode}`),
    ];
  }),
  scene('receipt', 18, 12, 'the Cold Store practice dispatch receipts', 'paper-landing.receipt',
    { all: [readyForCold, { flagSet: 'paper.landing.cold' }] }),
];
