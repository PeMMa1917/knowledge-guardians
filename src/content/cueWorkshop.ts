import type { Condition, ContentPack, Hint, Objective } from '../domain/types';
import { CUE_ORDERS, CUE_READERS, CUE_RUNS, cueKey } from '../domain/cueWorkshop';
import records from './cue-specimens.json';

export const CUE_GROUP = 'cue-workshop';
export const CUE_GATE: Condition = { objective: 'voices.publish' };
export const CUE_CASES = records.map((record) => ({
  ...record, exhibit: `OBJ-CUE-${record.slug}`, source: `HIS-CUE-${record.slug}`, card: `card.cue.${record.slug}`,
  objective: `${cueKey(record.slug)}.checked`,
}));
export type CueCase = (typeof CUE_CASES)[number];

const objectives: Objective[] = CUE_CASES.map((record) => {
  const base = cueKey(record.slug);
  return {
    id: record.objective, title: `Set up an audible or visible cue beside the record of ${record.name}.`, essential: false,
    visible: { card: record.card }, done: { all: [
      { card: record.card },
      { any: CUE_ORDERS.map((order) => ({ all: [
        { flag: `${base}.order`, eq: order }, ...CUE_RUNS.map((run) => ({ flag: `${base}.${order}.${run}`, eq: true })),
      ] })) },
      { any: CUE_READERS.map((reader) => ({ all: [{ flag: `${base}.reader`, eq: reader }, { flag: `${base}.received`, eq: reader }] })) },
    ] },
    onComplete: [{ journal: `j.${base}` }],
    weave: {
      concepts: ['evidence', 'explanation', 'perspective', 'interpretation', 'certainty', 'responsibility'],
      framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'],
      thinking: { dok: 3, bloom: 'analyse', fink: 'application', solo: 'relational' },
      atl: ['thinking', 'communication', 'social'], aoks: ['ART', 'MAT', 'HIS'],
      subjects: ['music', 'design-tech', 'math-ai'], minutes: 4,
    },
  };
});

export const cueWorkshopContent = {
  sources: CUE_CASES.map((record) => ({
    id: record.source, title: `The Metropolitan Museum of Art, ${record.originalTitle}, ${record.accession}`,
    url: record.catalog, locator: 'Museum record, title, maker, date kind, dimensions, medium and collection view',
    supports: record.evidence, accessed: '2026-11-26',
  })),
  exhibits: CUE_CASES.map((record) => ({
    id: record.exhibit, name: record.name, historicalLabel: 'documented', art: 'voices.permission', dateText: record.date,
    dateKind: record.slug === 'accordion-tintype' ? 'Making of the photograph. The sitter and the instrument have separate histories.' : 'The collection entry dates the making of this particular instrument.',
    summary: `${record.attribution}. ${record.origin}. ${record.medium}. ${record.dimensions}. ${record.evidence}`,
    altText: record.altText, sources: [record.source], grantsCard: record.card,
    specimen: { key: `met:${record.accession.toLowerCase().replace(/[^a-z0-9./_-]+/g, '-').replace(/-$/, '')}`,
      accession: record.accession, institution: 'The Metropolitan Museum of Art', source: record.source, objective: record.objective, pixelAsset: record.asset },
  })),
  cards: CUE_CASES.map((record) => ({ id: record.card, title: `${record.name} · ${record.accession}`,
    historicalLabel: 'documented', claimKind: 'observation', sources: [record.source], text: record.evidence,
    limits: 'The statements describe the accessioned record. The timing board plays the Cue Workshop’s invented three-note signal.',
  })),
  missions: [{
    id: 'KG-CH13-R23', world: 'WORLD-14', title: 'A Cue Beyond the Door',
    available: CUE_GATE, stake: 'A worker across Glass Walk and a reader at the House need the same start line in different forms.',
    knowledgeQuestion: 'How can a receiver tell what reached them when the way they hear or see it changes?',
    objectives, caseVisits: objectives.map(({ id }) => [id]),
  }],
  journal: CUE_CASES.map((record) => ({ id: `j.${cueKey(record.slug)}`, claimKind: 'observation',
    text: `I kept the source for ${record.name} (${record.accession}) separate from the workshop cue. I ran the same timings in quiet and service noise and fitted a checked copy for a reader.` })),
  hints: CUE_CASES.flatMap((record) => [
    'The cue order can stay in place while the conditions change.',
    `Read ${record.accession} at its stand, then choose a test order at the nearby timing board.`,
    'Run in quiet and with the same work rhythm. The timing sheet records the covered notes.',
    'Take the chosen proof for the live indicator at Glass Walk or for the House’s side-seat programme. Fit it at that reader’s table.',
  ].map((text, index) => ({ id: `h.${cueKey(record.slug)}.${index + 1}`, objective: record.objective, depth: (index + 1) as Hint['depth'], text }))),
} satisfies Partial<ContentPack>;
