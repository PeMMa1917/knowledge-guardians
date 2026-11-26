import type { Condition, ContentPack, Hint, Objective } from '../domain/types';
import { SIDES } from '../domain/lanternWeave';
import records from './lantern-weave-specimens.json';

const CMA = 'Cleveland Museum of Art';
export const LANTERN_WEAVE_OPEN: Condition = { objective: 'm01.o2.inspect' };
export const LANTERN_WEAVE = 'lantern-weave';
export const LANTERN_LEAVES = records.map((record) => ({ ...record,
  exhibit: `OBJ-LANTERN-CMA-${record.accession}`, card: `card.lantern-weave.${record.slug}`,
  catalogue: `HIS-LANTERN-CMA-${record.accession}`, flag: `lantern.weave.${record.slug}`,
  objective: `lantern.weave.${record.slug}.hung`,
}));
export type LanternLeaf = typeof LANTERN_LEAVES[number];
export const DISPLAY_ROUTES = ['window', 'table'] as const;
export type LanternRoute = typeof DISPLAY_ROUTES[number];

const objectives: Objective[] = LANTERN_LEAVES.map((record) => ({
  id: record.objective,
  title: `Set a viewing copy of ${record.accession} where a reader can use it.`,
  visible: { card: record.card }, essential: false,
  done: { all: [{ card: record.card }, ...SIDES.map((side) => ({ flag: `${record.flag}.read.${side}`, eq: true })),
    { any: DISPLAY_ROUTES.map((route) => ({ all: [
      { flag: `${record.flag}.sent`, eq: route }, { flag: `${record.flag}.hung`, eq: route },
    ] })) }] },
  onComplete: [{ journal: `j.${record.objective}` }],
  weave: {
    concepts: ['evidence', 'interpretation', 'explanation', 'perspective', 'responsibility', 'culture', 'objectivity', 'values'],
    framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'],
    thinking: { dok: 2, bloom: 'analyse', fink: 'human', solo: 'relational' },
    minutes: 4, atl: ['thinking', 'communication', 'research'], aoks: ['ART', 'HIS', 'TEC'],
    subjects: ['visual-arts', 'history', 'film', 'design-tech'],
  },
}));
const transfer: Objective = {
  id: 'lantern.weave.copies.used', title: 'Hang the press queue’s two-part notice.', essential: false,
  visible: { any: LANTERN_LEAVES.map(({ objective }) => ({ objective })) },
  done: { all: [{ flag: 'lantern.weave.copies.trial.flow', eq: true }, { flag: 'lantern.weave.copies.trial.review', eq: true },
    { flagSet: 'lantern.weave.copies.notice' }] }, onComplete: [{ journal: 'j.lantern.weave.copies.used' }],
  weave: { concepts: ['perspective', 'explanation', 'justification', 'power', 'values', 'responsibility', 'culture', 'certainty', 'objectivity'],
    framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'], thinking: { dok: 3, bloom: 'create', fink: 'integration', solo: 'extended' },
    minutes: 3, atl: ['thinking', 'communication'], aoks: ['ART', 'TEC', 'LAN'], subjects: ['film', 'lang-langlit', 'design-tech'] },
};

export const lanternWeaveContent = {
  characters: [
    { id: 'lantern-weave-nell', name: 'Nell Quinter', mode: 'fictional', role: 'Sets pictures for the daylight queue', sprite: 'villager-2', talk: [{ node: 'lantern.weave.nell' }] },
    { id: 'lantern-weave-hem', name: 'Hem Valech', mode: 'fictional', role: 'Tends the deep table’s shade and source drawers', sprite: 'villager-1', talk: [{ node: 'lantern.weave.hem' }] },
  ],
  dialogue: [
    { id: 'lantern.weave.nell', speaker: 'lantern-weave-nell', historicalLabel: 'fictional-world', text: 'My queue bends around the window. People get half a breath with each picture. Leave one edge clear so I can show them where to start.' },
    { id: 'lantern.weave.hem', speaker: 'lantern-weave-hem', historicalLabel: 'fictional-world', text: 'A child brought me a picture of a world with only three trees. Then we took the frame off. I have room for the whole sheet, when you can spare it.' },
  ],
  sources: LANTERN_LEAVES.map((record) => ({
    id: record.catalogue, title: `${CMA}, ${record.title}, ${record.accession}`, url: record.source,
    locator: 'Collection image, date, making technique and attribution', supports: record.observation, accessed: '2026-11-26',
  })),
  exhibits: LANTERN_LEAVES.map((record) => ({
    id: record.exhibit, name: `${record.title} · ${record.accession}`, historicalLabel: 'documented', art: 'collection-stand',
    dateText: record.date, dateKind: record.dateKind, summary: `${record.makerAndPlace}. ${record.medium}. ${record.observation}`,
    altText: `${record.title}. ${record.left} ${record.right}`, sources: [record.catalogue], grantsCard: record.card,
    specimen: { key: `cma:${record.accession}`, accession: record.accession, institution: CMA, source: record.catalogue, objective: record.objective, pixelAsset: record.asset },
  })),
  cards: LANTERN_LEAVES.map((record) => ({
    id: record.card, title: `${record.accession} · ${record.title}`, historicalLabel: 'documented', claimKind: 'observation',
    sources: [record.catalogue], text: `${record.left} ${record.right} ${record.observation}`, limits: record.limit,
  })),
  missions: [
    { id: 'KG-CH1-R36', world: 'WORLD-01', title: 'A Light Between the Frames',
      stake: 'Nell’s daylight queue needs a first place to look. Hem’s table wants every edge and a way back to the record.',
      knowledgeQuestion: 'How does changing the visible part of an image change what readers can reasonably take from it?',
      available: LANTERN_WEAVE_OPEN, objectives, caseVisits: objectives.map(({ id }) => [id]) },
    { id: 'KG-CH7-R21', world: 'WORLD-08', title: 'The Press Queue’s Second Sheet',
      stake: 'The press queue needs a direction it can see quickly. The waiting reader needs a date line she can check.',
      knowledgeQuestion: 'How does where a public record is placed affect who can check it?',
      available: { objective: 'copies.revise' }, objectives: [transfer] },
  ],
  journal: [
    ...LANTERN_LEAVES.map((record) => ({ id: `j.${record.objective}`, claimKind: 'observation' as const,
      text: `I moved the lantern across ${record.title} and saw a different part of the print through each opening. I helped our reader make one part easier to see, put its limits on the guide and left ${record.accession} where the next keeper can find it.` })),
    { id: 'j.lantern.weave.copies.used', claimKind: 'simulation', text: 'At the print workshop I put a short direction and its source in two places people could actually reach. Now the reader at the back of the queue can see who made the claim.' },
  ],
  hints: [
    ...LANTERN_LEAVES.flatMap((record) => [
      'Find a place to start in the image and another place the first crop leaves out.',
      `Open the exhibit for ${record.accession}. Its lantern arm waits on the next tile.`,
      'Slide the lantern across the image and trace both marked details. The wide sheet helps you see them in relation.',
      'Keep a window cut or a full table sheet. Walk it to that reader’s viewing stand outside the room and hang the copy.',
    ].map((text, i) => ({ id: `h.${record.objective}.${i + 1}`, objective: record.objective, depth: (i + 1) as Hint['depth'], text }))),
    ...[
      'Two readers at the press stop in different places.',
      'Use the hook by the south side of the Print Workshop after you have hung any Nexus picture.',
      'Bring a workshop guide in from the Nexus. See where the source goes when you hang the short or long notice first.',
      'Choose either hook, then try it twice so you can see the copy from both positions.',
    ].map((text, i) => ({ id: `h.${transfer.id}.${i + 1}`, objective: transfer.id, depth: (i + 1) as Hint['depth'], text })),
  ],
} satisfies Partial<ContentPack>;
