import type { Condition, ContentPack, Hint, Objective } from '../domain/types';
import { passageDone, passageKey, PASSAGE_LEAVES, PASSAGE_STOPS } from '../domain/specimenPassage';
import { RELAY_CASES } from './relayCases';
import exactImages from './passage-specimens.json';
import documentaryRecords from './passage-form-records.json';

type PassageSourceData = (typeof documentaryRecords)[number] & { asset?: string };
const RECORDS: PassageSourceData[] = [
  ...exactImages.map((item) => ({ ...item, dateKind: item.date, art: 'preserved.catalogue' })),
  ...documentaryRecords,
];

export const PASSAGE_GROUP = 'specimen-passage';
export const PASSAGE_GATE: Condition = { all: [
  { objective: 'sea.arrival' },
  { any: [{ objective: 'sea.finish' }, ...RELAY_CASES.map(({ objective }) => ({ objective }))] },
] };
const PARLIAMENT = 'HIS-APH-YIRRKALA-CAPTION';
const COMMUNITY = 'HIS-YIRRKALA-BUKU-HISTORY';
const bothYirrkala = (slug: string) => slug.startsWith('yirrkala-');

export const PASSAGE_CASES = RECORDS.map((item) => ({
  ...item,
  source: `HIS-PASSAGE-${item.slug}`,
  exhibit: `OBJ-PASSAGE-${item.slug}`,
  card: `card.passage.${item.slug}`,
  objective: `passage.${item.slug}.received`,
}));
export type PassageCase = (typeof PASSAGE_CASES)[number];

const deducedWeave: Record<string, Objective['weave']> = {
  span: { concepts: ['evidence', 'explanation', 'objectivity', 'responsibility'], framework: ['scope', 'methods-and-tools', 'ethics'],
    thinking: { dok: 2, bloom: 'apply', fink: 'application', solo: 'relational' }, atl: ['thinking', 'communication'], aoks: ['MAT', 'ART'], subjects: ['math-ai', 'design-tech'], minutes: 3 },
  surface: { concepts: ['evidence', 'certainty', 'interpretation', 'culture'], framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'],
    thinking: { dok: 3, bloom: 'analyse', fink: 'integration', solo: 'relational' }, atl: ['research', 'communication'], aoks: ['ART', 'HIS'], subjects: ['visual-arts', 'history'], minutes: 3 },
  edition: { concepts: ['truth', 'perspective', 'power', 'justification', 'responsibility'], framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'],
    thinking: { dok: 3, bloom: 'analyse', fink: 'human', solo: 'relational' }, atl: ['thinking', 'research', 'communication'], aoks: ['HIS', 'ART'], subjects: ['history', 'visual-arts'], minutes: 3 },
};

const objectives: Objective[] = PASSAGE_CASES.map((record) => ({
  id: record.objective, title: `Try the guide for ${record.name} at one reader’s bench.`, visible: { card: record.card }, essential: false,
  done: { all: [
    { card: record.card },
    ...PASSAGE_LEAVES.map((leaf) => ({ flag: `${passageKey(record.slug)}.${leaf}`, eq: true })),
    { flag: passageDone(record.slug), in: [...PASSAGE_STOPS] },
  ] },
  onComplete: [{ journal: `j.passage.${record.slug}` }],
  weave: deducedWeave[record.family],
}));

export const passageContent = {
  characters: [
    { id: 'passage-halen', name: 'Railkeeper Halen Dey', role: 'Shoal Shelf rail steward', sprite: 'villager-2', mode: 'fictional', talk: [{ node: 'passage.halen' }] },
    { id: 'passage-clio', name: 'Binder Clio Merrin', role: 'Shoal Shelf reference keeper', sprite: 'villager-1', mode: 'fictional', talk: [{ node: 'passage.clio' }] },
  ],
  dialogue: [
    { id: 'passage.halen', speaker: 'passage-halen', historicalLabel: 'fictional-world', text: 'My cart fits under this rail. Leave a working strip with me and I can try its mark with the next reader. I need the source number beside it. My youngest has started collecting numbers I drop.' },
    { id: 'passage.clio', speaker: 'passage-clio', historicalLabel: 'fictional-world', text: 'When the light shifts, I bring the binder out here. I keep room for two leaves and for the next question. A sailor once filed my tea order under weather.' },
  ],
  sources: [
    ...PASSAGE_CASES.map((record) => ({ id: record.source, title: `${record.institution}, ${record.catalogTitle}, ${record.accession}`,
      url: record.catalog, locator: 'Named object record and scope of the object description', supports: record.first, accessed: '2026-11-26' })),
    { id: PARLIAMENT, title: 'Parliamentary Education Office, Yirrkala petitions',
      url: 'https://peo.gov.au/understand-our-parliament/history-of-parliament/history-milestones/australian-parliament-history-timeline/events/yirrkala-petitions',
      locator: 'Paired caption and institutional account', supports: 'The caption distinguishes Dhuwa artists on 14 August from Yirritja artists on 28 August 1963. The painted designs assert Yolŋu law.', accessed: '2026-11-26' },
    { id: COMMUNITY, title: 'Buku-Larrŋgay Mulka Centre, History', url: 'https://yirrkala.com/history/',
      locator: 'Yirrkala political art and the establishment of a community-controlled art centre', supports: 'The centre describes the petitions as political action and explains its role in cultural security and intellectual sovereignty over sacred designs.', accessed: '2026-11-26' },
  ],
  exhibits: PASSAGE_CASES.map((record) => ({
    id: record.exhibit, name: record.name, art: record.art, historicalLabel: 'documented',
    dateText: record.date, dateKind: record.dateKind, altText: record.altText,
    summary: `${record.attribution}. ${record.place}. ${record.medium}. ${record.dimensions}. ${record.first} ${record.boundary}`,
    sources: bothYirrkala(record.slug) ? [record.source, PARLIAMENT, COMMUNITY] : [record.source], grantsCard: record.card,
    specimen: { key: `${record.namespace}:${record.accession.toLowerCase().replace(/[^a-z0-9./_-]+/g, '-').replace(/-$/, '')}`, accession: record.accession,
      institution: record.institution, source: record.source, objective: record.objective, ...(record.asset ? { pixelAsset: record.asset } : {}) },
  })),
  cards: PASSAGE_CASES.map((record) => ({
    id: record.card, title: `${record.name} · ${record.accession}`, text: record.first, limits: record.boundary,
    historicalLabel: 'documented', claimKind: 'observation',
    sources: bothYirrkala(record.slug) ? [record.source, PARLIAMENT, COMMUNITY] : [record.source],
  })),
  missions: [{ id: 'KG-CH8-R22', world: 'WORLD-09', title: 'Which Edge Reached the Landing',
    available: PASSAGE_GATE, stake: 'Two people on Shoal Shelf need useful guides with a number they can check. Only one can take this copy.',
    knowledgeQuestion: 'What needs to travel with the part of a record someone can use at work?', objectives,
    caseVisits: objectives.map(({ id }) => [id]) }],
  journal: PASSAGE_CASES.map((record) => ({ id: `j.passage.${record.slug}`, claimKind: 'observation',
    text: `I opened the two leaves and took a guide from the Shelter. One reader tried it against the precise context and source for ${record.accession}, ${record.name}.` })),
  hints: PASSAGE_CASES.flatMap((record) => [
    'Open the object’s public record before using its working leaves.',
    `Find the Shelter stand for ${record.accession}. Open its view and its record leaf.`,
    'The low rail takes a working strip. Clio’s binder holds both leaves. You can carry one guide at a time.',
    'Walk to the bench named on your guide, set it down and see the reader use its marks. You can put a carried copy back at its stand.',
  ].map((text, index) => ({ id: `h.passage.${record.slug}.${index + 1}`, objective: record.objective, depth: (index + 1) as Hint['depth'], text }))),
} satisfies Partial<ContentPack>;
