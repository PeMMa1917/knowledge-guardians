import { imprintPacket, INK_CHARGES, installFlag, pressFlag, pullFlag, type ImprintRoute } from '../domain/imprint';
import type { Condition, ContentPack, Hint, Objective } from '../domain/types';
import records from './copy-imprint-cases.json';

export const IMPRINT_OPEN: Condition = { objective: 'copies.revise' };
export const IMPRINT_GROUP = 'imprint-press';
const MUSEUM = 'Cleveland Museum of Art';

export const IMPRINT_CASES = records.map((record) => {
  const stem = `imprint.${record.slug}`;
  return {
    ...record, stem, card: `card.${stem}`, exhibit: `OBJ-PRINT-${record.slug}`,
    sourceId: `HIS-PRINT-${record.slug}`, objective: `${stem}.mounted-proof`,
  };
});

export type ImprintCase = (typeof IMPRINT_CASES)[number];

export const PRINT_DESTINATIONS: { route: ImprintRoute; title: string; tradeoff: string }[] = [
  { route: 'counter', title: 'Landing counter', tradeoff: 'A runner can carry one tested pull with its source and limit. Readers see it in passing.' },
  { route: 'drawer', title: 'Proof drawer', tradeoff: 'Readers can compare the tested pulls with the collection view. They have to come to the drawer.' },
];

export function sentTo(route: ImprintRoute): Condition {
  const packets = INK_CHARGES.map(({ key }) => imprintPacket(route, key));
  return { any: IMPRINT_CASES.map(({ stem }) => ({ flag: pressFlag(stem), in: packets })) };
}

export function mountedAt(route: ImprintRoute): Condition {
  return { any: IMPRINT_CASES.flatMap(({ stem }) => INK_CHARGES.map(({ key }) => {
    const packet = imprintPacket(route, key);
    return { all: [{ flag: pressFlag(stem), eq: packet }, { flag: installFlag(stem), eq: packet }] };
  })) };
}

const objectives: Objective[] = IMPRINT_CASES.map((record) => {
  const pulls = INK_CHARGES.map(({ key }): Condition => ({ flag: pullFlag(record.stem, key), eq: true }));
  return {
    id: record.objective, title: `Test the ink and mount a proof of ${record.title}.`,
    visible: { card: record.card }, essential: false,
    done: {
      all: [
        { card: record.card },
        { any: pulls.flatMap((first, i) => pulls.slice(i + 1).map((second) => ({ all: [first, second] }))) },
        {
          any: PRINT_DESTINATIONS.flatMap(({ route }) => INK_CHARGES.map(({ key }) => {
            const packet = imprintPacket(route, key);
            return { all: [{ flag: pressFlag(record.stem), eq: packet }, { flag: installFlag(record.stem), eq: packet }] };
          })),
        },
      ],
    },
    weave: {
      concepts: ['evidence', 'objectivity', 'perspective', 'interpretation', 'justification', 'responsibility'],
      framework: ['scope', 'methods-and-tools', 'perspectives', 'ethics'], atl: ['research', 'thinking', 'communication'],
      aoks: ['ART', 'TEC', 'HIS'], subjects: ['visual-arts', 'design-tech', 'history'],
      thinking: { dok: 3, bloom: 'analyse', fink: 'application', solo: 'relational' }, minutes: 5,
    },
    onComplete: [{ journal: `j.${record.stem}` }],
  };
});

function proofs(record: ImprintCase): Hint[] {
  const texts = [
    `Find the collection stand bearing ${record.accession}.`,
    'With the source in hand, use the press beside the stand and pull at two different ink charges.',
    record.focus,
    'Send one impression to the Landing counter or the tested set to the proof drawer. Follow it and mount the copy.',
  ];
  return ([1, 2, 3, 4] as const).map((depth) => ({
    id: `h.${record.stem}.${depth}`, objective: record.objective, depth, text: texts[depth - 1],
  }));
}

type ImprintContent = Pick<ContentPack, 'sources' | 'exhibits' | 'cards' | 'missions' | 'hints' | 'journal'>;

export const copyImprintContent: ImprintContent = {
  sources: IMPRINT_CASES.map((record) => ({
    id: record.sourceId, title: `${MUSEUM}, ${record.catalogueTitle}, ${record.accession}`, url: record.source,
    locator: 'Object data and collection photograph', supports: record.fact, accessed: '2026-11-26',
    mla: { kind: 'artwork', title: record.catalogueTitle, container: MUSEUM, workDate: record.date },
  })),
  exhibits: IMPRINT_CASES.map((record) => ({
    id: record.exhibit, name: record.title, dateText: record.date, historicalLabel: 'documented',
    dateKind: 'The museum’s date of making or attributed period for this particular object',
    summary: [record.context, `The museum lists ${record.material}.`, record.dimensions, record.fact].filter(Boolean).join(' '),
    sources: [record.sourceId], grantsCard: record.card, art: 'collection-stand', altText: record.alt,
    specimen: {
      key: `cma:${record.accession}`, accession: record.accession, institution: MUSEUM,
      source: record.sourceId, objective: record.objective, pixelAsset: record.asset,
    },
  })),
  cards: IMPRINT_CASES.map((record) => ({
    id: record.card, title: `${record.title} · ${record.accession}`, text: record.fact,
    limits: record.limit, historicalLabel: 'documented', claimKind: 'observation', sources: [record.sourceId],
  })),
  missions: [{
    id: 'KG-CH7-R26', world: 'WORLD-08', title: 'The Second Imprint',
    knowledgeQuestion: 'What details survive copying, and which claims still need the catalogue?',
    stake: 'The runners have room for one clear view. The drawer can keep the original view and several tests for a reader who can return.',
    available: IMPRINT_OPEN, objectives, caseVisits: objectives.map(({ id }) => [id]),
  }],
  hints: IMPRINT_CASES.flatMap(proofs),
  journal: IMPRINT_CASES.map((record) => ({
    id: `j.${record.stem}`, claimKind: 'observation',
    text: `I pulled two copies of ${record.accession} under the same source frame and changed the ink. ${record.limit}`,
  })),
};
