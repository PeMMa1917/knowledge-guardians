import type { ContentPack, Hint, Objective } from '../domain/types';
import { BEATER_KEY, BEATER_PRESS_MAP, BEATER_PRESS_PROP } from '../domain/beaterProof';
import objects from './clearance-specimens.json';

const COLLECTION = 'Cleveland Museum of Art';
const ARCHIVE = 'https://clevelandart.org/art';
export const CLEARANCE_GROUP = 'collection-clearance';

export const CLEARANCE_CASES = objects.map((record) => ({
  ...record,
  source: `HIS-CMA-${record.accession}`,
  exhibit: `OBJ-CMA-${record.accession}`,
  card: `card.cma.${record.slug}`,
  flag: `clearance.${record.slug}`,
  objective: `clearance.${record.slug}.heard`,
}));
export type ClearanceCase = (typeof CLEARANCE_CASES)[number];

const objectives: Objective[] = CLEARANCE_CASES.map((record) => ({
  id: record.objective,
  title: `Hear what a viewer says about “${record.catalogueTitle}”.`,
  visible: { card: record.card },
  essential: false,
  done: { all: [
    { card: record.card },
    { flag: `${record.flag}.tested.near`, eq: true },
    { flag: `${record.flag}.tested.wide`, eq: true },
    { any: (['near', 'wide'] as const).map((rail) => ({ all: [
      { flag: `${record.flag}.route`, eq: rail }, { flagSet: `${record.flag}.proof.${rail}` }, { flag: `${record.flag}.read`, eq: rail },
    ] })) },
  ] },
  onComplete: [{ journal: `j.${record.flag}` }],
  weave: {
    concepts: ['evidence', 'truth', 'justification', 'explanation', 'interpretation', 'perspective', 'objectivity', 'responsibility', 'culture', 'values'],
    framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'],
    thinking: { dok: 2, bloom: 'apply', fink: 'human', solo: 'relational' },
    atl: ['thinking', 'communication'],
    aoks: ['ART', 'HIS', 'MAT'],
    subjects: ['design-tech', 'history', 'visual-arts', 'math-ai'],
    minutes: 3,
  },
}));

export const clearanceContent = {
  characters: [
    { id: 'clearance-reader-tavi', name: 'Tavi Orrel', role: 'Reader at the Cold Store low rail', sprite: 'villager-2', mode: 'fictional', talk: [{ node: 'clearance.tavi' }] },
    { id: 'clearance-reader-jase', name: 'Jase Milden', role: 'Reader at the Cold Store wide rail', sprite: 'villager-1', mode: 'fictional', talk: [{ node: 'clearance.jase' }] },
  ],
  dialogue: [
    { id: 'clearance.tavi', speaker: 'clearance-reader-tavi', historicalLabel: 'fictional-world', text: 'I can read a guide at this rail while I sit. Pick one I can read here. If you need to fold the drawing smaller, can I keep the number on the edge?' },
    { id: 'clearance.jase', speaker: 'clearance-reader-jase', historicalLabel: 'fictional-world', text: 'A large view can still hide a small feature. Let me know which side you traced. I’ll wait until the lane beside this frame is clear.' },
  ],
  sources: CLEARANCE_CASES.map((record) => ({
    id: record.source,
    title: `${COLLECTION}, ${record.catalogueTitle}, ${record.accession}`,
    url: `${ARCHIVE}/${record.accession}`,
    locator: 'Collection record, date, material, measurements and object description',
    supports: record.observation,
    accessed: '2026-11-26',
  })),
  exhibits: CLEARANCE_CASES.map((record) => ({
    id: record.exhibit,
    name: record.title,
    historicalLabel: 'documented',
    art: 'collection-stand',
    dateText: record.date,
    dateKind: 'Date of making as given in the collection record',
    summary: `${record.place} ${record.material}. ${record.measurements}. ${record.observation}`,
    altText: `Pixel view of ${record.catalogueTitle} from the ${COLLECTION} collection image, record ${record.accession}.`,
    sources: [record.source],
    grantsCard: record.card,
    specimen: {
      key: `cma:${record.accession}`, accession: record.accession, institution: COLLECTION,
      source: record.source, objective: record.objective, pixelAsset: `specimens/cma-${record.accession}.jpg`,
      ...(`cma:${record.accession}` === BEATER_KEY ? {
        revisit: { map: BEATER_PRESS_MAP, prop: BEATER_PRESS_PROP,
          method: 'Compare two local proof faces at the same stop.',
          hint: 'Equip the Hawaiian tapa cloth beater and look for the plain two-face block in the Reconstruction Workroom.' },
      } : {}),
    },
  })),
  cards: CLEARANCE_CASES.map((record) => ({
    id: record.card,
    title: `${record.accession} · ${record.catalogueTitle}`,
    historicalLabel: 'documented',
    claimKind: 'observation',
    sources: [record.source],
    text: `${record.observation} The model uses the ${record.edge} reported at ${record.span} cm.`,
    limits: record.limit,
  })),
  missions: [{
    id: 'KG-CH3-R21',
    world: 'WORLD-04',
    title: 'The Gallery with Two Rails',
    stake: 'A reader can miss a small feature at either rail if the guide hides the scale or the measured edge.',
    knowledgeQuestion: 'What can a drawn outline let someone check about the object it represents?',
    available: { objective: 'preserved.publish' },
    objectives,
    caseVisits: objectives.map(({ id }) => [id]),
  }],
  journal: CLEARANCE_CASES.map((record) => ({
    id: `j.${record.flag}`,
    claimKind: 'observation',
    text: `I tried two rails for the drawing of ${record.title}. I checked who could use the result and kept its measured edge with the source.`,
  })),
  hints: CLEARANCE_CASES.flatMap((record) => [
    'Keep one edge of the object with the drawing.',
    `Open the exhibit for ${record.accession} and use its frame stand.`,
    'Try the low rail and the wide rail. Leave the drawing by the people who can use it.',
    'Fit both rails, hang the guide and visit its reader. Choose which slip to keep beside the guide, then record the reply.',
  ].map((text, index) => ({ id: `h.${record.flag}.${index + 1}`, objective: record.objective, depth: (index + 1) as Hint['depth'], text }))),
} satisfies Partial<ContentPack>;
