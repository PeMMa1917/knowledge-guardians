import type { Condition, ContentPack, DialogueNode, Hint, Objective, Weave } from '../domain/types';
import data from './reference-line-specimens.json';

export const REFERENCE_LINE_AVAILABLE: Condition = { objective: 'metal.arrival' };
export const REFERENCE_LAYOUT = 'reference-line.installed-layout';
export const REFERENCE_MATCHED = 'reference-line.public-support-aligned';
export const REFERENCE_LAST = 'reference-line.last-checked';
const CURRENT = 'reference-line.pending';
const DEVA = 'reference-line-deva';
const NOLL = 'reference-line-noll';

export const REFERENCE_CASES = data.map((entry) => ({
  ...entry,
  flag: `reference-line.${entry.slug}`,
  exhibit: `OBJ-REFERENCE-LINE-${entry.slug.toUpperCase()}`,
  source: `HIS-REFERENCE-LINE-${entry.slug.toUpperCase()}`,
  card: `card.reference-line.${entry.slug}`,
  objective: `reference-line.${entry.slug}.used`,
  asset: `specimens/line-${entry.slug}.jpg`,
}));
export type ReferenceCase = (typeof REFERENCE_CASES)[number];
export type ReferenceLayout = 'compact' | 'paired';
export const REFERENCE_LAYOUTS: readonly ReferenceLayout[] = ['compact', 'paired'];

export const referenceBenchFree: Condition = { any: [{ not: { flagSet: CURRENT } }, { flag: CURRENT, eq: 'none' }] };
export const referenceInHand = (entry: ReferenceCase): Condition => ({ flag: CURRENT, eq: entry.slug });
export const referenceChosen = (entry: ReferenceCase, mode: ReferenceLayout): Condition => ({ flag: `${entry.flag}.route`, eq: mode });
export const referenceProcessed = (entry: ReferenceCase, mode: ReferenceLayout): Condition => ({ flag: entry.objective, eq: mode });
export const referenceMounted = (entry: ReferenceCase): Condition => ({ flag: `${entry.flag}.mounted`, eq: true });
export const referenceMatched = (entry: ReferenceCase): Condition => ({ flag: `${entry.flag}.matched`, eq: true });
export const referenceCompactLane: Condition = { flag: REFERENCE_LAYOUT, eq: 'compact' };
export const referencePairedLane: Condition = { all: [
  { flag: REFERENCE_LAYOUT, eq: 'paired' }, { flag: REFERENCE_MATCHED, eq: true },
] };

const stillToUse = (entry: ReferenceCase): Condition => ({ not: { flagSet: entry.objective } });
const liveMount = (entry: ReferenceCase, mode: ReferenceLayout): Condition => ({
  all: [referenceInHand(entry), referenceChosen(entry, mode), referenceMounted(entry), stillToUse(entry)],
});

function finish(entry: ReferenceCase, mode: ReferenceLayout) {
  return {
    next: `${entry.flag}.reply.${mode}`,
    effects: [
      { setFlag: entry.objective, value: mode },
      { setFlag: CURRENT, value: 'none' },
      { setFlag: REFERENCE_LAST, value: entry.slug },
      { journal: `j.${entry.flag}.${mode}` },
    ],
  };
}

function caseScenes(entry: ReferenceCase): DialogueNode[] {
  return [{
    id: `${entry.flag}.order`, speaker: DEVA, historicalLabel: 'fictional-world',
    text: `The pattern shop can send a teaching model for ${entry.accession} to the Sample Yard. Choose a single support for one repeatable check. A pair will need someone to align the first support publicly before readers can see the second. The exhibit stays here.`,
    options: [
      { text: 'Order one fixed support for the narrow lane.', if: { all: [referenceBenchFree, stillToUse(entry)] },
        next: `${entry.flag}.order.kept`, effects: [{ setFlag: CURRENT, value: entry.slug }, { setFlag: `${entry.flag}.route`, value: 'compact' }] },
      { text: 'Order two supports for the shared lane.', if: { all: [referenceBenchFree, stillToUse(entry)] },
        next: `${entry.flag}.order.kept`, effects: [{ setFlag: CURRENT, value: entry.slug }, { setFlag: `${entry.flag}.route`, value: 'paired' }] },
      { text: 'Leave the model here for now.' },
    ],
  }, {
    id: `${entry.flag}.order.kept`, speaker: DEVA, historicalLabel: 'fictional-world',
    text: 'Look for the testing lane at the east side of the Sample Yard. Noll can fit this model to the footmarks there.',
  }, {
    id: `${entry.flag}.cancel`, speaker: DEVA, historicalLabel: 'fictional-world',
    text: 'The order is still in your hand. You can put it back on the hook and free the lane for someone else.',
    options: [{ text: 'Put back the unmounted order.', if: { all: [referenceInHand(entry), { not: referenceMounted(entry) }] },
      effects: [{ setFlag: CURRENT, value: 'none' }] }, { text: 'Keep the order.' }],
  }, {
    id: `${entry.flag}.mount.kept`, speaker: DEVA, historicalLabel: 'fictional-world',
    text: 'Noll has set the model down in the testing lane. You can return there to keep working. The other model stands are ready when this test is done.',
  }, ...REFERENCE_LAYOUTS.flatMap((mode): DialogueNode[] => {
    const compact = mode === 'compact';
    return [{
      id: `${entry.flag}.install.${mode}`, speaker: NOLL, historicalLabel: 'fictional-world',
      text: compact
        ? `Here are the narrow footmarks for the model of ${entry.accession}. One carrier can follow the line right through after we lower the stop.`
        : `The two supports for ${entry.accession} go on different sides of the screen. Leave the shared lane shut until the first mark can guide the next person.`,
      options: [{
        text: compact ? 'Set down the fixed stop and open the narrow lane.' : 'Set down both supports by their footmarks.',
        if: { all: [referenceInHand(entry), referenceChosen(entry, mode), { not: referenceMounted(entry) }] },
        effects: [
          { setFlag: `${entry.flag}.mounted`, value: true },
          { setFlag: REFERENCE_LAYOUT, value: mode },
          { setFlag: REFERENCE_MATCHED, value: false },
        ],
        next: `${entry.flag}.installed.${mode}`,
      }, { text: 'Keep the order in hand.' }],
    }, {
      id: `${entry.flag}.installed.${mode}`, speaker: NOLL, historicalLabel: 'fictional-world',
      text: compact ? 'Take the upper lane. The lower gate stays shut so the next carrier can pass.' :
        'The upper lane is occupied. Set the first reference beside the lower gate. You can take the second check from inside that lane.',
    }, {
      id: `${entry.flag}.check.${mode}`, speaker: NOLL, historicalLabel: 'fictional-world',
      text: compact
        ? `The narrow lane has room for the first check on ${entry.accession}. There is a clear place to put one reference down.`
        : `We’ve repeated one check. The second support for ${entry.accession} has its own place. Someone else can use both after you leave.`,
      options: [{
        text: compact ? entry.nearAction : entry.farAction,
        if: compact ? liveMount(entry, mode) : { all: [liveMount(entry, mode), referenceMatched(entry)] },
        ...finish(entry, mode),
      }, { text: 'Leave the model here for now.' }],
    }, {
      id: `${entry.flag}.reply.${mode}`, speaker: NOLL, historicalLabel: 'fictional-world',
      text: compact ? entry.near : entry.far,
    }];
  }), {
    id: `${entry.flag}.match`, speaker: NOLL, historicalLabel: 'fictional-world',
    text: 'The second support is ready beyond the low gate. Let’s line the first one up from this side so someone inside can find the same starting mark.',
    options: [{
      text: entry.nearAction,
      if: { all: [liveMount(entry, 'paired'), { not: referenceMatched(entry) }] },
      effects: [
        { setFlag: `${entry.flag}.matched`, value: true },
        { setFlag: REFERENCE_MATCHED, value: true },
      ],
      next: `${entry.flag}.matched`,
    }, { text: 'Leave the lower gate closed for now.' }],
  }, {
    id: `${entry.flag}.matched`, speaker: NOLL, historicalLabel: 'fictional-world',
    text: 'The first support holds its mark, so the lower gate can swing. Take the wide lane and set the second support where the next reader can find it.',
  }];
}

const kinds: Record<string, Pick<Weave, 'concepts' | 'aoks' | 'subjects'>> = {
  fossil: { concepts: ['evidence', 'justification', 'certainty', 'explanation', 'objectivity'], aoks: ['NAT', 'MAT'], subjects: ['biology', 'ess', 'math-ai'] },
  plant: { concepts: ['evidence', 'responsibility', 'objectivity', 'power', 'perspective'], aoks: ['NAT', 'HIS', 'MAT'], subjects: ['biology', 'geography', 'history'] },
  work: { concepts: ['evidence', 'culture', 'values', 'interpretation', 'responsibility'], aoks: ['ART', 'MAT', 'HIS'], subjects: ['design-tech', 'visual-arts', 'math-ai'] },
  view: { concepts: ['truth', 'perspective', 'culture', 'interpretation', 'justification'], aoks: ['ART', 'HIS', 'MAT'], subjects: ['film', 'visual-arts', 'history'] },
};

const objectives: Objective[] = REFERENCE_CASES.map((entry) => ({
  id: entry.objective, title: `Use a workshop model for ${entry.accession}.`, essential: false, visible: { card: entry.card },
  done: { all: [{ card: entry.card }, referenceMounted(entry), { any: [
    referenceProcessed(entry, 'compact'), { all: [referenceProcessed(entry, 'paired'), referenceMatched(entry)] },
  ] }] },
  weave: {
    ...kinds[entry.kind], framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'],
    atl: ['research', 'thinking', 'communication'], thinking: { dok: 2, bloom: 'apply', fink: 'application', solo: 'relational' }, minutes: 5,
  },
}));

export const referenceLineContent = {
  characters: [
    { id: DEVA, name: 'Deva Tern', mode: 'fictional', sprite: 'villager-2', role: 'Keeper of the Trade Hall pattern shop', talk: [{ node: 'reference-line.deva' }] },
    { id: NOLL, name: 'Noll Vane', mode: 'fictional', sprite: 'villager-1', role: 'Keeper of the two testing lanes', talk: [{ node: 'reference-line.noll' }] },
  ],
  dialogue: [
    { id: 'reference-line.deva', speaker: DEVA, historicalLabel: 'fictional-world',
      text: 'Last week a carrier used the length of a mount for the length of its picture. The mount fitted beautifully. The picture had other plans. Open a case, then order one model setup to try with Noll.' },
    { id: 'reference-line.noll', speaker: NOLL, historicalLabel: 'fictional-world',
      text: 'One fixed stop leaves room to pass. Two supports let another person repeat a different check, and they take the long lane. Bring the order from Deva’s pattern shop.' },
    ...REFERENCE_CASES.flatMap(caseScenes),
  ],
  sources: REFERENCE_CASES.map((entry) => ({
    id: entry.source, title: `${entry.institution}, catalogue ${entry.accession}`,
    url: entry.kind === 'fossil' || entry.kind === 'plant' ? entry.exactSource : entry.catalogueUrl,
    locator: 'Exact collection record, item dates, description and image reference',
    supports: entry.observation, accessed: '2026-11-26',
  })),
  exhibits: REFERENCE_CASES.map((entry) => ({
    id: entry.exhibit, name: entry.title, dateText: entry.date, dateKind: entry.dateKind, historicalLabel: 'documented',
    art: 'collection-stand', altText: entry.alt, summary: entry.observation, sources: [entry.source], grantsCard: entry.card,
    specimen: { key: entry.key, accession: entry.accession, institution: entry.institution, source: entry.source,
      objective: entry.objective, pixelAsset: entry.asset },
  })),
  cards: REFERENCE_CASES.map((entry) => ({
    id: entry.card, title: entry.title, text: entry.observation, limits: entry.limit, sources: [entry.source],
    historicalLabel: 'documented', claimKind: 'observation',
  })),
  missions: [{
    id: 'KG-CH6-R12', world: 'WORLD-07', title: 'A Line That Travels',
    knowledgeQuestion: 'What can another person check by returning to the same starting mark?',
    stake: 'A carrier can make a repeatable comparison only if the lane keeps the right mark with the thing examined.',
    available: REFERENCE_LINE_AVAILABLE, objectives, caseVisits: objectives.map(({ id }) => [id]),
  }],
  hints: REFERENCE_CASES.flatMap((entry) => [
    'Keep a fixed starting mark with the model.',
    `Open case ${entry.accession}. Order either setup on the model stand beside it.`,
    'Take the order to the testing lane off the Sample Yard. A single stop opens the upper lane. Align the first support outside the lower gate to open the shared lane.',
    'Walk behind the open gate and make the check there. The model’s stand at the Trade Hall keeps the reply.',
  ].map((text, i) => ({ id: `h.${entry.flag}.${i + 1}`, objective: entry.objective, depth: (i + 1) as Hint['depth'], text }))),
  journal: REFERENCE_CASES.flatMap((entry) => REFERENCE_LAYOUTS.map((mode) => ({
    id: `j.${entry.flag}.${mode}`, claimKind: 'observation' as const,
    text: mode === 'compact'
      ? `I opened the narrow lane and used one fixed reference for ${entry.accession}. I kept Noll’s reply at the case.`
      : `I aligned the first support before going into the shared lane. I left a second check for ${entry.accession} on the far side.`,
  }))),
} satisfies Partial<ContentPack>;
