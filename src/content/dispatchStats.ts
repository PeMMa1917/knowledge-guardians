import type { Condition, ContentPack, DialogueNode, Effect, Hint, Objective, Weave } from '../domain/types';

const ORLA = 'dispatch-stats-orla';
const FLAG = 'dispatch-stats';
export const DISPATCH_STATS_OPEN: Condition = { flag: 'talked.ise', eq: true };
export const DISPATCH_STATS_OBJECTIVES = {
  mix: `${FLAG}.mix-checked`, parcel: `${FLAG}.parcel-checked`, stamps: `${FLAG}.stamp-ledgers`,
} as const;
export const DISPATCH_VIEWS = ['bright', 'wet', 'all'] as const;
export type DispatchView = typeof DISPATCH_VIEWS[number];
export const DISPATCH_PLANS = ['slip', 'rail'] as const;
export type DispatchPlan = typeof DISPATCH_PLANS[number];
type Loads = { oak: { onTime: number; total: number }; ash: { onTime: number; total: number } };

const bright: Loads = { oak: { onTime: 9, total: 10 }, ash: { onTime: 17, total: 20 } };
const wet: Loads = { oak: { onTime: 6, total: 10 }, ash: { onTime: 1, total: 2 } };
function joinLoads(label: keyof Loads) {
  return { onTime: bright[label].onTime + wet[label].onTime, total: bright[label].total + wet[label].total };
}
export const DISPATCH_LOADS: Record<DispatchView, Loads> = { bright, wet, all: { oak: joinLoads('oak'), ash: joinLoads('ash') } };

export const STAMP_BATCHES = ['rare', 'common'] as const;
type Batch = typeof STAMP_BATCHES[number];
const loadBatch = { rare: { extra: 10, total: 1000 }, common: { extra: 500, total: 1000 } };

export function stampCounts(batch: Batch) {
  const { extra, total } = loadBatch[batch];
  const correctlyStamped = extra * 9 / 10;
  const unnecessarilyStamped = (total - extra) / 10;
  return { extra, total, correctlyStamped, unnecessarilyStamped, allStamped: correctlyStamped + unnecessarilyStamped };
}

const flag = (name: string) => `${FLAG}.${name}`;
const yes = (name: string): Condition => ({ flag: flag(name), eq: true });
const value = (name: string, eq: string): Condition => ({ flag: flag(name), eq });
const has = (name: string): Condition => ({ flagSet: flag(name) });
const not = (condition: Condition): Condition => ({ not: condition });
const all = (...conditions: Condition[]): Condition => ({ all: conditions });
const ready = (id: string): Condition => ({ objective: id });
const write = (name: string, result: boolean | string = true): Effect => ({ setFlag: flag(name), value: result });
export const dispatchPlan = (plan: DispatchPlan) => value('plan', plan);
export const dispatchParcelRead = yes('receipt');
export const dispatchProofDone = yes('stamp-parcel');
export const dispatchPlanPending = not(has('plan'));

function describeLoads(view: DispatchView): string {
  const { oak, ash } = DISPATCH_LOADS[view];
  return `Oak: ${oak.onTime} of ${oak.total} on time. Ash: ${ash.onTime} of ${ash.total} on time.`;
}

const viewLabels: Record<DispatchView, string> = {
  bright: 'Slide the bright-day loads forward.', wet: 'Slide the wet loads forward.', all: 'Pull both shutters up and read the whole shift.',
};
const viewReadback: Record<DispatchView, string> = {
  bright: 'Oak kept a bigger share on time in bright conditions.',
  wet: 'Oak also kept a bigger share on time in wet conditions. Ash carried only two of the wet loads.',
  all: 'Together, Ash kept a bigger share on time. Ash carried mostly bright loads. Half of Oak’s loads were wet. Keep these totals for that whole shift.',
};
const crewPlans: Record<DispatchPlan, { option: string; text: string; outcome: string }> = {
  slip: {
    option: 'Hang the whole-shift slip. Keep the weather counts underneath.',
    text: 'I can staff the counter from the whole-shift slip. It describes yesterday’s mix. I kept the separate weather counts behind the clip. The courier is asking whether this wet Ash parcel made the bell. Pull its receipt for me.',
    outcome: 'The desk stays open for a quick shift count. The weather counts remain on the inner clip. Ash parcel W-2 has its own receipt beside the slip.',
  },
  rail: {
    option: 'Staff the two-lane rail. Keep the shift total in the back pocket.',
    text: 'I can show a wet-day runner the wet lane now. Both counts stay by their own weather marks. The courier is already asking whether this wet Ash parcel made the bell. Pull its receipt for me.',
    outcome: 'The runner can check the wet and bright lanes separately. The overnight mix stays in the back pocket. Ash parcel W-2 has its own receipt at the staffed rail.',
  },
};

const readingScenes: DialogueNode[] = DISPATCH_VIEWS.map((view) => ({
  id: flag(view), speaker: ORLA, historicalLabel: 'fictional-world',
  text: `${describeLoads(view)} ${viewReadback[view]}`,
  options: [{ text: 'Return to the sorting board.', next: flag('board') }, { text: 'Leave the shutter in place.' }],
}));

const receivers: DialogueNode[] = DISPATCH_PLANS.flatMap((plan) => [
  { id: flag(`receive-${plan}`), speaker: ORLA, historicalLabel: 'fictional-world', text: crewPlans[plan].text,
    options: [{ text: 'Pull and match the wet Ash W-2 receipt.', if: all(dispatchPlan(plan), not(dispatchParcelRead)),
      effects: [write('receipt')], next: flag('receipt') }, { text: 'Leave W-2 on the clip.' }] },
  { id: flag(`fitted-${plan}`), speaker: ORLA, historicalLabel: 'fictional-world', text: crewPlans[plan].outcome,
    options: [{ text: 'Open the practice warning-stamp drawer.', next: flag('stamps') }, { text: 'Leave the receiving desk.' }] },
]);

const stampViews: DialogueNode[] = STAMP_BATCHES.map((batch) => {
  const result = stampCounts(batch);
  return {
    id: flag(`stamp-${batch}`), speaker: ORLA, historicalLabel: 'fictional-world',
    text: `Of ${result.total} practice parcels, ${result.extra} need a new seal. The die marked ${result.correctlyStamped} of those and also marked ${result.unnecessarilyStamped} parcels that were already sound. So ${result.correctlyStamped} of the ${result.allStamped} stamped parcels need work. ${batch === 'rare' ? 'Most of the marked parcels are sound on this rack.' : 'Most of the marked parcels need work on this rack.'}`,
    options: [{ text: 'Return to the stamp drawer.', next: flag('stamps') }, { text: 'Leave this ledger open.' }],
  };
});

const objectiveWeave = (minutes: number): Weave => ({
  concepts: ['evidence', 'interpretation', 'certainty', 'objectivity', 'justification', 'responsibility'],
  framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'], atl: ['thinking', 'research', 'communication'],
  aoks: ['MAT', 'HUM'], subjects: ['math-ai', 'economics', 'design-tech'], minutes,
  thinking: { dok: 3, bloom: 'analyse', fink: 'application', solo: 'relational' },
});

const record = (name: string): Effect[] => [{ journal: `j.${flag(name)}` }];

const objectives: Objective[] = [
  { id: DISPATCH_STATS_OBJECTIVES.mix, title: 'Try the bright shutter, wet shutter and full shift view.', essential: false,
    done: all(...DISPATCH_VIEWS.map((view) => yes(`saw-${view}`))), weave: objectiveWeave(2), onComplete: record('mix') },
  { id: DISPATCH_STATS_OBJECTIVES.parcel, title: 'Bring a usable count to Orla and check W-2’s own receipt.', essential: false,
    visible: ready(DISPATCH_STATS_OBJECTIVES.mix), done: dispatchParcelRead, weave: objectiveWeave(2), onComplete: record('parcel') },
  { id: DISPATCH_STATS_OBJECTIVES.stamps, title: 'Apply the same warning die to both practice ledgers.', essential: false,
    visible: dispatchParcelRead, done: all(...STAMP_BATCHES.map((batch) => yes(`stamped-${batch}`))), weave: objectiveWeave(2), onComplete: record('stamps') },
];

const hints = [
  ['One board shows yesterday’s loads through two shutters.', 'Start beside the south workshop. Try each shutter and the view with both open.',
    'Keep the counts beside the number of loads they apply to.', 'The wet and bright shutters each favour Oak. The full-shift view favours Ash, whose loads were mostly bright.'],
  ['Pick a useful view for a reader at the south receiving desk.', 'One view is quick for staffing, the other keeps the two weather conditions ready for a caller.',
    'The runner wants just one wet parcel by its number, W-2.', 'Pull the receiving receipt for W-2. It gives its own arrival even when the group count could not.'],
  ['The same warning die can mean different things on different practice racks.', 'Open Orla’s stamp drawer from the fitted receiving desk.',
    'Run the die on the rack where repairs are rare and on the rack where they are common.', 'Compare how many of the stamped parcels needed a seal. If you want to check a particular mark, pull practice parcel P-42 and read the separate seal slip.'],
];

export const dispatchStatsContent = {
  characters: [{ id: ORLA, name: 'Orla Pennant', role: 'Keeps the Archive dispatch rails', sprite: 'villager-2', mode: 'fictional', talk: [{ node: flag('board') }] }],
  dialogue: [
    { id: flag('board'), speaker: ORLA, historicalLabel: 'fictional-world',
      text: 'The crew hung a winner’s ribbon on Ash. Oak’s runner put it on the wet rack instead. I put it in my pocket. Try the shutters before we make the next shift read either tag.',
      options: [
        ...DISPATCH_VIEWS.map((view) => ({ text: viewLabels[view],
          effects: [write(`saw-${view}`), write('view', view)], next: flag(view) })),
        ...DISPATCH_PLANS.map((plan) => ({ text: crewPlans[plan].option,
          if: all(ready(DISPATCH_STATS_OBJECTIVES.mix), dispatchPlanPending), effects: [write('plan', plan)] })),
        { text: 'Leave the sorting board.' },
      ] },
    ...readingScenes, ...receivers, ...stampViews,
    { id: flag('receipt'), speaker: ORLA, historicalLabel: 'fictional-world',
      text: 'Wet rack, Ash W-2. The signed receipt is one notch before the bell. Its partner arrived late. The wet count has room for both. I’ll clip this receipt where the courier can point to their own box.' },
    { id: flag('stamps'), speaker: ORLA, historicalLabel: 'fictional-world',
      text: 'The new warning die picks up nine in ten parcels that need a seal. It also marks one in ten sound parcels. Run it on both practice racks before anyone tries using the mark as a verdict.',
      options: [
        ...STAMP_BATCHES.map((batch) => ({ text: batch === 'rare' ? 'Run the die on the rack with few repairs.' : 'Run the same die on the rack with many repairs.',
          effects: [write(`stamped-${batch}`)], next: flag(`stamp-${batch}`) })),
        { text: 'Pull a marked parcel and unfold its seal slip.',
          if: all(ready(DISPATCH_STATS_OBJECTIVES.stamps), not(dispatchProofDone)), effects: [write('stamp-parcel')], next: flag('stamp-proof') },
        { text: 'Read the checked seal slip.', if: dispatchProofDone, next: flag('stamp-proof') },
        { text: 'Close the practice drawer.' },
      ] },
    { id: flag('stamp-proof'), speaker: ORLA, historicalLabel: 'fictional-world',
      text: 'The die marked P-42 on the rack with few repairs. Its separate seal slip shows the seal held. Put P-42 back in the sound pocket. I’ll leave the warning mark on its sleeve to show what the two checks did.' },
  ],
  journal: [
    { id: `j.${flag('mix')}`, claimKind: 'observation', text: 'I tried both weather shutters. Oak brought a bigger share on time in each one. The full shift put Ash ahead because it carried mostly bright loads.' },
    { id: `j.${flag('parcel')}`, claimKind: 'observation', text: 'I pulled the signed receipt for W-2. One wet Ash parcel reached the bell and the other missed it. The receipt told me which was W-2.' },
    { id: `j.${flag('stamps')}`, claimKind: 'simulation', text: 'I kept the warning die the same on both racks. When extra seals were rare, only 9 of 108 marks pointed to needed work. On the other rack, 450 of 500 did.' },
  ],
  missions: [{ id: 'KG-CH1-R44', world: 'WORLD-01', title: 'The Ribbon on the Wrong Rack', available: DISPATCH_STATS_OPEN,
    knowledgeQuestion: 'Which loads does a count actually describe?',
    stake: 'Orla needs a useful dispatch count without letting a group number decide whether one parcel made its bell.', objectives }],
  hints: objectives.flatMap(({ id }, row) => hints[row].map((hint, index) => ({ id: `h.${id}.${index + 1}`, objective: id,
    depth: (index + 1) as Hint['depth'], text: hint }))),
} satisfies Partial<ContentPack>;
