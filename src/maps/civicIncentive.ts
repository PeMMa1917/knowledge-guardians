import type { Condition } from '../domain/types';
import type { IncentivePolicy, IncentiveTrace } from '../domain/civicIncentive';
import type { Interactable } from './types';

const ready: Condition = { objective: 'civic.finish' };
const policyIs = (policy: IncentivePolicy): Condition => ({ flag: 'incentive.policy', eq: policy });
const phaseIs = (phase: 'early' | 'late' | 'audited'): Condition => ({ flag: 'incentive.phase', eq: phase });
const order: Condition = { item: 'item.incentive.manifest' };

function field(spot: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  const id = `incentive-${spot}`;
  return { id, kind: 'fieldgame', game: id, x, y, w: 1, h: 1, label, art, walkThrough: true, visibleIf };
}

export const CIVIC_INCENTIVE_BOARD = field('board', 13, 11, 'Lin’s target board', 'civic.ledger', ready);

function trace(spot: IncentiveTrace, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  const base = field(spot, x, y, label, art, { all: [order, visibleIf] });
  if (spot.startsWith('early')) base.artBy = { flag: 'incentive.policy', keys: { dispatch: 'crate-wares', kits: 'civic.ledger' } };
  return base;
}

function standing(policy: IncentivePolicy, x: number, y: number, label: string, art: string, text: string): Interactable {
  return { id: `incentive-kept-${policy}`, kind: 'sign', x, y, w: 1, h: 1, label, art, text, walkThrough: true,
    visibleIf: { all: [phaseIs('audited'), { flag: 'incentive.standing', eq: policy }] }, flag: 'incentive.readback' };
}

export const ISLAND_INCENTIVE_WORKSHOP: Interactable[] = [
  field('audit', 16, 11, 'Ivo’s trace table and second bell', 'island.plan', order),
  trace('early-workshop', 14, 11, 'the first-bell rail shelf', 'preserved.slip', phaseIs('early')),
  trace('late-workshop', 18, 11, 'the rail shelf at second bell', 'crate-wares', phaseIs('late')),
  standing('kits', 18, 11, 'the paired-kit arrival board', 'preserved.display-paired',
    'The keeper closes one receipt for each matched kit at the receiving bell. Workers check both marks at the rack. The rail crew gets a full pair together. The first-bell hooks stay on the cart until that round.'),
];

export const ISLAND_INCENTIVE_DOCK: Interactable[] = [
  trace('early-dock', 6, 9, 'the first-bell bench rack', 'preserved.slip', phaseIs('early')),
  trace('late-dock', 6, 9, 'the complete bench kit on the late rack', 'crate-wares', { all: [phaseIs('late'), policyIs('kits')] }),
  standing('dispatch', 6, 9, 'the early hook rack and close-of-round tally', 'island.landing',
    'The dock keeps its early hook rack. The early line counts separate dispatch tags. The second line names each working kit after its foot reaches the matching hook. A crew can begin its setup at first bell and check the complete pair later.'),
];
