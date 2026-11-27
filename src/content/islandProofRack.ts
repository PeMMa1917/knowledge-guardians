import { ISLAND_PROOF_CASES, ISLAND_PROOF_KEYS, ISLAND_PROOF_ROUTES, ISLAND_PROOF_TRIALS, islandProofFlag,
  islandProofProp, islandProofReceipt, type IslandProofCase, type IslandProofRoute } from '../domain/islandProofRack';
import { specimenEquipped } from '../domain/specimenGear';
import type { Condition, ContentPack, DialogueNode, ExhibitRecord, Hint, Mission, Weave } from '../domain/types';

const cases = {
  'paired-views': {
    title: 'Two Cards, One Cart Job',
    stake: 'Ivo needs a cart slot for the tide sheets or a wet copy that will arrive later.',
    question: 'When do two separate views represent one job?',
    method: 'Link the two known views to one job and release a cart slot.',
    trial: 'Compare how many slots the same three cards occupy with and without a shared accession.',
    hint: 'Equip this copy and try Ivo’s three-slot cart rack at the Plan Workshop.',
    checked: 'Mount the same three cards separately and then link the two fossil surfaces to one manifest job.',
    kept: 'Joss or Ivo received both view cards as one job. Their receiving tray kept the two faces separate and used the spare slot for a different delivery.',
  },
  'scale-bar': {
    title: 'A Sleeve with Room for a Name',
    stake: 'Joss needs a sleeve that fits the practice outline. Ivo can keep both prints at the staffed stand for the reader who wants to repeat the size check.',
    question: 'What can a measurement let someone do while an identification stays open?',
    method: 'Fit a sleeve from a checked scale comparison while the name cell stays open.',
    trial: 'Measure both practice prints against their own bars.',
    hint: 'Equip this copy and look for the two scale prints at the Plan Workshop.',
    checked: 'Measure the smaller and larger practice prints, each using its own bar.',
    kept: 'The two practice prints give the same model width using their own bars. The receiving sleeve and the staffed comparison keep the name cell open.',
  },
} as const;

const receiving = {
  'paired-views': {
    dock: [
      'Joss has a place for the rolled tide sheets. I’ve left two numbered pockets for the part and counterpart. Each can be seen where it belongs in the same job.',
      'Clip both view cards to one tally and slide the tide sheets into the spare slot.',
      'Joss checks off the tide sheets. Both view numbers still lead to USNM PAL 160174. The waiting carrier can take the sheets on this run.',
    ],
    margin: [
      'Ivo set two shallow envelopes on one cart tray. The margin crew needs the second view loose to read its edge. The wet copy is due after this check.',
      'Load both view envelopes as one job and put a hold on the spare slot.',
      'Ivo leaves the tide sheets for the next run. The two views can travel apart within their common tray. The rail now has a drying space reserved for the wet copy.',
    ],
  },
  'scale-bar': {
    dock: [
      'Joss has a practice sleeve with room for a model width up to 650 micrometres. Your two readings give 600 micrometres. The sleeve has a space for the accession and a separate blank name cell.',
      'Fit the checked practice print in the measured sleeve and leave the name cell open.',
      'The practice print slides into the sleeve. Joss sends it to the loading bench with the bar visible. The drop slot stays ready for the next loader. The source accession is USNM PAL 247790.',
    ],
    margin: [
      'Ivo’s reader wants to repeat the size check before choosing a sleeve. The bench has space for both paper sizes. The unassigned name cell has its own open tab.',
      'Clip both measured prints to the staffed stand and set out a blank name tab.',
      'The reader can repeat the measurement from either print. Someone must stay to turn the pages, so Joss’ll collect it next round. Ivo keeps the image scale and the taxon question on separate lines.',
    ],
  },
} as const;

type Revisit = NonNullable<NonNullable<ExhibitRecord['specimen']>['revisit']>;
export const islandSpecimenRevisits: Partial<Record<string, Revisit>> = Object.fromEntries(ISLAND_PROOF_CASES.map((id) => [
  ISLAND_PROOF_KEYS[id], { map: 'island.workshop', prop: islandProofProp(id), method: cases[id].method, hint: cases[id].hint },
]));

const equal = (id: IslandProofCase, key: string, eq: boolean | IslandProofRoute): Condition => ({ flag: islandProofFlag(id, key), eq });
const done = (id: IslandProofCase, milestone: 'checked' | 'used') => ({ objective: islandProofFlag(id, milestone) });

const weave = (id: IslandProofCase, received: boolean): Weave => ({
  concepts: received ? ['responsibility', 'justification', 'evidence', 'perspective']
    : ['evidence', 'interpretation', 'objectivity', 'certainty'],
  framework: received ? ['perspectives', 'ethics', 'methods-and-tools'] : ['scope', 'methods-and-tools'],
  atl: received ? ['thinking', 'communication', 'social'] : ['thinking', 'research'],
  aoks: ['NAT', 'MAT'], subjects: id === 'scale-bar' ? ['biology', 'math-ai', 'design-tech'] : ['biology', 'ess', 'math-ai'],
  thinking: { dok: received ? 3 : 2, bloom: received ? 'evaluate' : 'apply', fink: 'application', solo: 'relational' },
  minutes: received ? 3 : 2,
});

function scenes(id: IslandProofCase, route: IslandProofRoute): DialogueNode[] {
  const [offer, action, consequence] = receiving[id][route];
  const speaker = route === 'dock' ? 'island-dockhand' : 'island-planner';
  const response = islandProofFlag(id, `reply.${route}`);
  const served = equal(id, 'served', route);
  return [{ id: islandProofFlag(id, `receive.${route}`), speaker, historicalLabel: 'fictional-world', text: offer,
    options: [
      { text: action, next: response,
        if: { all: [specimenEquipped(ISLAND_PROOF_KEYS[id]), done(id, 'checked'), equal(id, 'plan', route), { not: { flagSet: islandProofFlag(id, 'served') } }] },
        effects: [{ setFlag: islandProofFlag(id, 'served'), value: route }] },
      { text: 'Read the kept reply.', if: served, next: response },
      { text: 'Leave the receiver at its stand.' },
    ],
  }, { id: response, speaker, text: consequence, historicalLabel: 'fictional-world' }];
}

function mission(id: IslandProofCase): Mission {
  const info = cases[id];
  return {
    id: `KG-CH14-ISLAND-PROOF-${id}`, world: 'WORLD-15', title: info.title, knowledgeQuestion: info.question, stake: info.stake,
    available: { any: [specimenEquipped(ISLAND_PROOF_KEYS[id]), done(id, 'checked')] },
    objectives: [
      { id: islandProofFlag(id, 'checked'), title: info.trial, essential: false,
        done: { all: ISLAND_PROOF_TRIALS[id].map((trial) => equal(id, `try.${trial}`, true)) }, weave: weave(id, false) },
      { id: islandProofFlag(id, 'used'), title: 'File one checked arrangement where the next keeper can use it.', essential: false,
        visible: done(id, 'checked'), done: { all: [done(id, 'checked'), { any: ISLAND_PROOF_ROUTES.map((route) => equal(id, 'served', route)) }] },
        weave: weave(id, true), onComplete: [{ giveItem: islandProofReceipt(id) }, { journal: `j.${islandProofFlag(id, 'used')}` }] },
    ],
  };
}

export const islandProofRackContent = {
  dialogue: ISLAND_PROOF_CASES.flatMap((id) => ISLAND_PROOF_ROUTES.flatMap((route) => scenes(id, route))),
  missions: ISLAND_PROOF_CASES.map(mission),
  items: ISLAND_PROOF_CASES.map((id) => ({ id: islandProofReceipt(id), name: `${cases[id].title} receipt`,
    historicalLabel: 'fictional-world', description: cases[id].kept, art: 'departure.strip' })),
  journal: ISLAND_PROOF_CASES.map((id) => ({ id: `j.${islandProofFlag(id, 'used')}`, claimKind: 'simulation', text: cases[id].kept })),
  hints: ISLAND_PROOF_CASES.flatMap((id) => {
    const info = cases[id];
    const hints = [
      ['checked', [info.hint, id === 'paired-views' ? 'The two view cards carry the same accession.' : 'Each bar represents the same distance even when it prints at a different length.', info.trial, info.checked]],
      ['used', ['The plan changes which keeper uses your evidence.', 'Pick the destination at Ivo’s workbench.',
        'Bring the equipped copy to Joss at Two-Tide Dock or Ivo at Quiet Margin.', 'Use the matching receiver and file the checked copy to leave a reply.']],
    ] as const;
    return hints.flatMap(([step, texts]) => texts.map((text, index) => ({ id: `h.${islandProofFlag(id, step)}.${index + 1}`,
      objective: islandProofFlag(id, step), depth: (index + 1) as Hint['depth'], text })));
  }),
} satisfies Partial<ContentPack>;
