import { PACKING_POSITIONS, postedTag, receiptTag, tagFlag } from '../domain/ferryPacking';
import type { Condition, ContentPack, Hint, Objective } from '../domain/types';
import data from './ferry-packing-cases.json';

export const FERRY_PACKING_OPEN: Condition = { flag: 'clue.oldmap.folded-map', eq: true };

export const FERRY_PACKING_CASES = data.map((record) => ({
  ...record, stem: `ferry.pack.${record.slug}`,
  exhibit: `OBJ-FERRY-PACK-${record.slug}`, card: `card.ferry.pack.${record.slug}`,
  source: `HIS-FERRY-PACK-${record.slug}`, objective: `ferry.pack.${record.slug}.posted`,
  revisit: {
    map: 'nexus.archive', prop: `ferry-packing-return-${record.slug}`,
    method: `Fit the receiving hook to ${record.accession}`,
    hint: `Equip ${record.title} and take it to the receiving hook just south of the label stand in the Nexus.`,
  },
}));
export type FerryPackingCase = (typeof FERRY_PACKING_CASES)[number];

const objectives: Objective[] = FERRY_PACKING_CASES.map((record) => ({
  id: record.objective, title: `Try both tag placements for “${record.title}” and collect the handoff receipt.`,
  done: {
    all: [...PACKING_POSITIONS.map((position): Condition => ({ flagSet: tagFlag(record.stem, position) })),
      { flag: postedTag(record.stem), in: [...PACKING_POSITIONS] }, { flag: receiptTag(record.stem), eq: true }],
  },
  visible: { card: record.card }, essential: false,
  weave: {
    concepts: ['evidence', 'explanation', 'certainty', 'perspective', 'values', 'responsibility'],
    framework: ['scope', 'methods-and-tools', 'perspectives', 'ethics'],
    atl: ['thinking', 'research', 'communication'], aoks: ['HIS', 'TEC'],
    subjects: ['history', 'design-tech', 'math-ai'],
    thinking: { dok: 3, bloom: 'analyse', fink: 'application', solo: 'relational' }, minutes: 4,
  },
  onComplete: [{ journal: `j.${record.stem}` }],
}));

function hints(record: FerryPackingCase): Hint[] {
  const lines = [
    `Open the collection stand for ${record.accession} in the packing room off the old ferry road.`,
    `Use the practice hook beside the stand. Notice the copy’s ${record.feature} and separate the source tag from the handling test.`,
    'Move the same tag from hook to spray to reading table twice, once outside and once inside. Compare what can be read and when.',
    'Post an outside claim to Tova’s queue or a protected one to Wenna’s table. Check the corresponding receipt, then return to the collection stand for the earned copy.',
  ];
  return ([1, 2, 3, 4] as const).map((depth) => ({
    id: `h.${record.stem}.${depth}`, objective: record.objective, depth, text: lines[depth - 1],
  }));
}

type FerryPackingContent = Pick<ContentPack, 'sources' | 'exhibits' | 'cards' | 'missions' | 'journal' | 'hints'>;

export const ferryPackingContent: FerryPackingContent = {
  sources: FERRY_PACKING_CASES.map((record) => ({
    id: record.source, title: `${record.institution}, ${record.catalogueTitle}, ${record.accession}`,
    url: record.catalogue, locator: 'Object record and collection photograph', supports: record.fact, accessed: '2026-11-26',
    mla: { kind: 'artwork', title: record.catalogueTitle, container: record.institution, workDate: record.date },
  })),
  exhibits: FERRY_PACKING_CASES.map((record) => ({
    id: record.exhibit, name: record.title, art: 'collection-stand', historicalLabel: 'documented',
    dateText: record.date, dateKind: 'The museum’s date or date range for the object or its accession group.',
    summary: [`${record.place}.`, record.fact, record.material, record.dimensions].filter(Boolean).join(' '),
    sources: [record.source], grantsCard: record.card, altText: record.alt,
    specimen: {
      key: record.key, institution: record.institution, accession: record.accession,
      source: record.source, objective: record.objective, pixelAsset: record.pixelAsset, revisit: record.revisit,
      people: record.people.map(({ name, role }) => ({ name, role, source: record.source, detail: record.fact })),
    },
  })),
  cards: FERRY_PACKING_CASES.map((record) => ({
    id: record.card, title: `${record.title} · ${record.accession}`, claimKind: 'observation', historicalLabel: 'documented',
    text: record.fact, limits: record.limit, sources: [record.source],
  })),
  missions: [{
    id: 'KG-CH1-R58', world: 'WORLD-02', title: 'A Name on the Load', available: FERRY_PACKING_OPEN,
    stake: 'Tova must sort claims while carriers are still there. Wenna can wait to open a protected tag if it keeps the author on the record.',
    knowledgeQuestion: 'How does placing a claim label change who can read it, when, and with how much confidence?',
    objectives, caseVisits: objectives.map(({ id }) => [id]),
  }],
  journal: FERRY_PACKING_CASES.map((record) => ({
    id: `j.${record.stem}`, claimKind: 'observation',
    text: `We tried a quick view and a protected read on a ferry model associated with ${record.accession}. ${record.limit}`,
  })),
  hints: FERRY_PACKING_CASES.flatMap(hints),
};
