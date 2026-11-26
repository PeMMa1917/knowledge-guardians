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

export const YIRRKALA_REFERRAL_OPEN: Condition = { any: PASSAGE_CASES.filter(({ slug }) => bothYirrkala(slug))
  .map(({ objective }) => ({ objective })) };
export const YIRRKALA_REFERRAL_ROUTE = 'passage.yirrkala.referral.route';
const yirrkalaReferral = 'passage.yirrkala.referral';

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
    { id: `${yirrkalaReferral}.start`, speaker: 'passage-halen', historicalLabel: 'fictional-world',
      text: 'A teacher left one slip with two requests. They want the dates and makers of the Yirrkala petitions for a class notice. They also ask if the class can trace the painted borders. Put the lookup on its own slip so we can help with it today.',
      options: [{ text: 'Separate the lookup from the reproduction request.', next: `${yirrkalaReferral}.lookups` }] },
    { id: `${yirrkalaReferral}.lookups`, speaker: 'passage-halen', historicalLabel: 'fictional-world', citationSource: PARLIAMENT,
      text: 'One locator for the Dhuwa artists of Yirrkala and their petition presented on 14 August 1963. One for the Yirritja artists of Yirrkala and theirs on 28 August. Keep both lines on the lookup slip.',
      options: [{ text: 'Put the reproduction question on a separate referral slip.', next: `${yirrkalaReferral}.place` }] },
    { id: `${yirrkalaReferral}.place`, speaker: 'passage-clio', historicalLabel: 'fictional-world', citationSource: COMMUNITY,
      text: 'Buku-Larrŋgay Mulka Centre explains why Yolŋu artists sought community control, including care over sacred designs. I’ll point the teacher to its public guidance and leave the copying question open. The public lookups can go up at once. If you bring them to me instead, I can walk the teacher through the two records when I finish my shelf turn.',
      options: [
        { text: 'Pin both locators at the walk-up rail and keep the referral open.', next: `${yirrkalaReferral}.placed`,
          effects: [{ setFlag: YIRRKALA_REFERRAL_ROUTE, value: 'rail' }] },
        { text: 'Bring both slips to Clio for the reading turn.', next: `${yirrkalaReferral}.placed`,
          effects: [{ setFlag: YIRRKALA_REFERRAL_ROUTE, value: 'desk' }] },
      ] },
    { id: `${yirrkalaReferral}.placed`, speaker: 'passage-clio', historicalLabel: 'fictional-world',
      text: 'Check how the teacher used the lookup when you come by.' },
    { id: `${yirrkalaReferral}.rail`, speaker: 'passage-halen', historicalLabel: 'fictional-world', citationSource: COMMUNITY,
      text: 'The teacher took the two locators from this rail while I was unloading. They could start the class notice straightaway. I left a pointer to the Centre’s guidance in the referral pocket. The slip still asks who can give permission to trace the designs.',
      effects: [{ setFlag: `${yirrkalaReferral}.read`, value: 'rail' }] },
    { id: `${yirrkalaReferral}.desk`, speaker: 'passage-clio', historicalLabel: 'fictional-world', citationSource: COMMUNITY,
      text: 'The teacher waited for my reading turn. We found the Dhuwa and Yirritja records together and kept each presenter on a separate line from the artists. The teacher took both locators. I showed them the Centre’s account and left the copying question open.',
      effects: [{ setFlag: `${yirrkalaReferral}.read`, value: 'desk' }] },
  ],
  sources: [
    ...PASSAGE_CASES.map((record) => ({ id: record.source, title: `${record.institution}, ${record.catalogTitle}, ${record.accession}`,
      url: record.catalog, locator: 'Named object record and scope of the object description', supports: record.first, accessed: '2026-11-26' })),
    { id: PARLIAMENT, title: 'Parliamentary Education Office, Yirrkala petitions',
      url: 'https://peo.gov.au/understand-our-parliament/history-of-parliament/history-milestones/australian-parliament-history-timeline/events/yirrkala-petitions',
      mla: { kind: 'page', title: 'Yirrkala Petitions', container: 'Parliamentary Education Office' },
      locator: 'Paired caption and institutional account', supports: 'The caption distinguishes Dhuwa artists on 14 August from Yirritja artists on 28 August 1963. The painted designs assert Yolŋu law.', accessed: '2026-11-26' },
    { id: COMMUNITY, title: 'Buku-Larrŋgay Mulka Centre, History', url: 'https://yirrkala.com/history/',
      mla: { kind: 'page', title: 'History', container: 'Buku-Larrŋgay Mulka Centre' },
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
    caseVisits: objectives.map(({ id }) => [id]) },
  { id: 'KG-CH8-R24', world: 'WORLD-09', title: 'The Address for the Question', available: YIRRKALA_REFERRAL_OPEN,
    knowledgeQuestion: 'What can a public record help a reader find, and whose authority governs how it can be reused?',
    objectives: [{ id: yirrkalaReferral, title: 'Give the visitor both public locators and check their reply.', essential: false,
      done: { flagSet: `${yirrkalaReferral}.read` }, onComplete: [{ journal: `j.${yirrkalaReferral}` }],
      weave: { concepts: ['culture', 'power', 'responsibility', 'interpretation'], framework: ['scope', 'perspectives', 'ethics'],
        thinking: { dok: 2, bloom: 'apply', fink: 'caring', solo: 'relational' }, atl: ['research', 'communication'],
        aoks: ['HIS', 'IND', 'POL'], subjects: ['history', 'global-politics', 'visual-arts'], minutes: 3 } }] }],
  journal: [...PASSAGE_CASES.map((record) => ({ id: `j.passage.${record.slug}`, claimKind: 'observation' as const,
    text: `I opened the two leaves and took a guide from the Shelter. One reader tried it against the precise context and source for ${record.accession}, ${record.name}.` })),
    { id: `j.${yirrkalaReferral}`, claimKind: 'observation',
      text: 'The teacher found both Yirrkala records on named lines. The copying inquiry stayed open with a pointer to the community-controlled Buku-Larrŋgay Mulka Centre.' }],
  hints: [...PASSAGE_CASES.flatMap((record) => [
    'Open the object’s public record before using its working leaves.',
    `Find the Shelter stand for ${record.accession}. Open its view and its record leaf.`,
    'The low rail takes a working strip. Clio’s binder holds both leaves. You can carry one guide at a time.',
    'Walk to the bench named on your guide, set it down and see the reader use its marks. You can put a carried copy back at its stand.',
  ].map((text, index) => ({ id: `h.passage.${record.slug}.${index + 1}`, objective: record.objective, depth: (index + 1) as Hint['depth'], text }))),
    ...[
      'A teacher left a two-part request at the Shoal Shelf Reading Shelter.',
      'Find its clip on the west side of the central path near the door.',
      'Give the public lookup and the reproduction question separate slips.',
      'Choose the walk-up rail or Clio’s reading turn. Read the teacher’s reply at the rail or by the east bench.',
    ].map((text, index) => ({ id: `h.${yirrkalaReferral}.${index + 1}`, objective: yirrkalaReferral, depth: (index + 1) as Hint['depth'], text }))],
} satisfies Partial<ContentPack>;
