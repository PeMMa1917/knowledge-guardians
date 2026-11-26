import {
  DISPATCH_PLANS, DISPATCH_STATS_OPEN, dispatchParcelRead, dispatchPlan, dispatchProofDone,
} from '../content/dispatchStats';
import type { Interactable } from './types';

const sortingBoard: Interactable = {
  id: 'dispatch-stats-board', kind: 'scene', node: 'dispatch-stats.board', x: 17, y: 18, w: 1, h: 1,
  label: 'the dispatch board with two weather shutters', art: 'board-stand', walkThrough: true, sfx: 'sfx.metal', visibleIf: DISPATCH_STATS_OPEN,
  artBy: { flag: 'dispatch-stats.view', keys: { bright: 'copies.strip', wet: 'water.split', all: 'nexus.pack-tally' } },
};

export const NEXUS_DISPATCH_STATS: Interactable[] = [
  sortingBoard,
  ...DISPATCH_PLANS.flatMap((plan): Interactable[] => {
    const slip = plan === 'slip';
    const bench = { kind: 'scene', x: 20, y: 19, w: 1, h: 1, walkThrough: true, sfx: 'sfx.page' } as const;
    return [
      { ...bench, id: `dispatch-stats-receive-${plan}`, node: `dispatch-stats.receive-${plan}`,
        label: slip ? 'Orla’s whole-shift slip at the receiving desk' : 'Orla’s staffed wet and bright rail',
        art: slip ? 'ledger' : 'preserved.display-paired', visibleIf: { all: [dispatchPlan(plan), { not: dispatchParcelRead }] } },
      { ...bench, id: `dispatch-stats-fitted-${plan}`, node: `dispatch-stats.fitted-${plan}`,
        label: slip ? 'the posted shift slip with W-2’s receipt' : 'the staffed two-lane rail with W-2’s receipt',
        art: slip ? 'preserved.display-records' : 'preserved.display-paired',
        artOpen: { key: slip ? 'nexus.pack-tally' : 'water.split', if: dispatchProofDone },
        visibleIf: { all: [dispatchPlan(plan), dispatchParcelRead] } },
    ];
  }),
];
