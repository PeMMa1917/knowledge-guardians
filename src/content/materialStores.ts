import authored from './material-store-cases.json';
import { STORE_FAMILIES, STORE_SIDES, type MaterialFixture, type StoreFamily } from '../domain/materialStores';
import { specimenEquipped, specimenReadingFlag } from '../domain/specimenGear';
import type { Condition, ContentPack, Hint, Mission, Weave } from '../domain/types';

export const MATERIAL_GAME = 'material-stores';
export const MATERIAL_GATE: Condition = { objective: 'water.arrival' };
export const MATERIAL_HUB = 'water.material-stores';
export const MATERIAL_REVISIT = { map: 'civic.canal', prop: 'material-stores-revisit' };
export const STORE_ROUTES = ['yard', 'channel'] as const;
export type StoreRoute = typeof STORE_ROUTES[number];

interface StoreObject {
  key: string;
  accession: string;
  institution: string;
  title: string;
  date: string;
  dateKind: string;
  origin: string;
  medium: string;
  dimensions: string;
  identity: string;
  url: string;
  asset: string;
  observation: string;
  limit: string;
  alt: string;
}

interface AuthoredStore {
  slug: string;
  title: string;
  task: string;
  object: StoreObject;
  fixture: MaterialFixture;
  checks: [string, string];
  notes: [string, string];
  choices: [string, string];
  responses: [string, string];
  returnAction: string;
  returnEffect: string;
}

export const MATERIAL_CASES = (authored as AuthoredStore[]).map((row) => {
  const flag = `material.store.${row.slug}`;
  return { ...row, flag, exhibit: `OBJ-MATERIAL-STORE-${row.slug.toUpperCase()}`, card: `card.${flag}`,
    source: `HIS-MATERIAL-STORE-${row.slug.toUpperCase()}`, objective: `${flag}.received`, reprise: specimenReadingFlag(row.object.key) };
});
export type MaterialCase = (typeof MATERIAL_CASES)[number];

interface Room {
  world: string;
  id: string;
  mission: string;
  title: string;
  keeper: { id: string; name: string; role: string; welcome: string };
  stake: string;
  question: string;
  instruction: string;
  weave: Weave;
}

const makeRoom = (id: StoreFamily, mission: string, title: string, room: Omit<Room, 'id' | 'title' | 'world' | 'mission'>): Room => ({
  id: `water.material-${id}`, mission: `KG-CH11-R${mission}`, world: 'WORLD-12', title, ...room,
});

export const MATERIAL_ROOMS = {
  fibres: makeRoom('fibres', '86', 'The Fibre Gallery', {
    keeper: { id: 'store-odal', name: 'Odal Mett', role: 'Textile sample keeper',
      welcome: 'The cloths belong to secured cases. You can pull on the practice strips. Set both directions under the same load before you send a copy.' },
    stake: 'The drying rack has room for one direction first. A second crew needs to know how to pull before they copy a pattern.',
    question: 'What stays comparable if two samples are prepared for different uses?',
    instruction: 'Choose each clip orientation in turn. Pull its practice strip to the marked load and record the span.',
    weave: { concepts: ['evidence', 'certainty', 'objectivity', 'responsibility'], framework: ['scope', 'methods-and-tools', 'ethics'], aoks: ['ART', 'NAT', 'HIS'], subjects: ['design-tech', 'physics', 'history'], atl: ['thinking', 'research'] },
  }),
  forms: makeRoom('forms', '87', 'The Bearing Room', {
    keeper: { id: 'store-osma', name: 'Osma Verr', role: 'Bearing Room keeper',
      welcome: 'Take a plain practice piece. I need to know where the load falls when the whole tray tips, before somebody carries it to the lower bank.' },
    stake: 'A yard tray can be checked on site. A carrier at the channel may only have the slip and the width of the support.',
    question: 'When does a local measurement justify changing how an object is handled?',
    instruction: 'Try the two model supports at the same incline. The gauge gives the distance from the load line to the edge.',
    weave: { concepts: ['evidence', 'justification', 'explanation', 'values'], framework: ['methods-and-tools', 'scope', 'perspectives'], aoks: ['NAT', 'MAT', 'HIS'], subjects: ['design-tech', 'physics', 'math-ai'], atl: ['thinking', 'communication'] },
  }),
  travel: makeRoom('travel', '88', 'The Route Gallery', {
    keeper: { id: 'store-taev', name: 'Taev Harn', role: 'Store docket keeper',
      welcome: 'At each notch, let the carrier stamp the handover. I will keep the paper with the place and purpose it actually records.' },
    stake: 'A copied heading may turn a stop in custody into a place of making and send a reader to the wrong file.',
    question: 'Which records locate the object and which locate something that happened to it?',
    instruction: 'Send the practice docket through each rail one stop at a time. Keep the two last stamp lines.',
    weave: { concepts: ['evidence', 'interpretation', 'culture', 'power', 'responsibility'], framework: ['perspectives', 'methods-and-tools', 'ethics'], aoks: ['HIS', 'HUM'], subjects: ['history', 'geography', 'global-politics'], atl: ['research', 'communication'] },
  }),
  surfaces: makeRoom('surfaces', '89', 'The Glancing Room', {
    keeper: { id: 'store-zyra', name: 'Zyra Bess', role: 'Surface copy keeper',
      welcome: 'The near face takes first light. Some joins show only when the lamp comes from the side. Find both cues before you pick what the receiver sees first.' },
    stake: 'A surface mark that disappears under a room lamp can disappear from the public account too.',
    question: 'How does a way of looking change which claim needs a closer check?',
    instruction: 'Use each practice swatch. Change the lamp angle until the marked feature is as clear as the fixture allows.',
    weave: { concepts: ['evidence', 'objectivity', 'perspective', 'explanation', 'truth'], framework: ['scope', 'perspectives', 'methods-and-tools'], aoks: ['ART', 'NAT', 'HIS'], subjects: ['visual-arts', 'physics', 'chemistry'], atl: ['thinking', 'research', 'communication'] },
  }),
} satisfies Record<StoreFamily, Room>;

export function storeRead(record: MaterialCase, side: number): Condition {
  return { flag: `${record.flag}.reading.${side}`, eq: true };
}
export function storeReady(record: MaterialCase): Condition {
  return { all: [{ card: record.card }, ...STORE_SIDES.map((side) => storeRead(record, side))] };
}
export function storeRouted(record: MaterialCase, route: StoreRoute): Condition {
  return { all: [storeReady(record), { flag: `${record.flag}.route`, eq: route }] };
}
export function storeCarry(record: MaterialCase): Condition {
  return { all: [specimenEquipped(record.object.key), { objective: record.objective }] };
}

const missions: Mission[] = STORE_FAMILIES.map((family) => {
  const room = MATERIAL_ROOMS[family];
  const cases = MATERIAL_CASES.filter(({ fixture }) => fixture.kind === family);
  const objectives: Mission['objectives'] = cases.map((record) => ({
    id: record.objective, title: `Compare both settings for ${record.title.toLowerCase()} and deliver one working copy.`,
    visible: { card: record.card }, essential: false,
    done: { any: STORE_ROUTES.map((route) => ({ all: [storeRouted(record, route), { flag: record.objective, eq: route }] })) },
    onComplete: [{ journal: `j.${record.flag}` }],
    weave: { ...room.weave, minutes: 5, thinking: { dok: 2, bloom: 'analyse', fink: 'application', solo: 'relational' } },
  }));
  return { id: room.mission, world: room.world, title: room.title, stake: room.stake, knowledgeQuestion: room.question,
    available: { any: cases.map(({ card }) => ({ card })) }, objectives, caseVisits: objectives.map(({ id }) => [id]) };
});

export const materialStoreContent = {
  sources: MATERIAL_CASES.map(({ object, source }) => ({
    id: source, title: `${object.institution}, ${object.title}, ${object.accession}`, url: object.url,
    locator: 'Catalogue identity, date, material and object account', supports: object.observation, accessed: '2026-11-26',
  })),
  exhibits: MATERIAL_CASES.map(({ object, card, exhibit, source, objective, returnAction }) => ({
    id: exhibit, name: `${object.title} · ${object.accession}`, historicalLabel: 'documented',
    art: 'preserved.catalogue', dateText: object.date, dateKind: object.dateKind,
    summary: [object.identity, object.origin, object.medium, object.dimensions].filter(Boolean).join(' · '),
    altText: object.alt, sources: [source], grantsCard: card,
    specimen: { key: object.key, accession: object.accession, institution: object.institution, source, objective, pixelAsset: object.asset,
      revisit: { ...MATERIAL_REVISIT, method: returnAction, hint: 'Equip the working copy and take it to the marked shelf at Canal Walk.' } },
  })),
  cards: MATERIAL_CASES.map(({ object, card, source }) => ({
    id: card, title: `${object.title} · ${object.accession}`, historicalLabel: 'documented', claimKind: 'observation',
    text: object.observation, limits: object.limit, sources: [source],
  })),
  characters: Object.values(MATERIAL_ROOMS).map(({ keeper }) => ({
    id: keeper.id, name: keeper.name, role: keeper.role, sprite: 'villager-2', mode: 'fictional', talk: [{ node: `${keeper.id}.welcome` }],
  })),
  dialogue: Object.values(MATERIAL_ROOMS).map(({ keeper }) => ({
    id: `${keeper.id}.welcome`, speaker: keeper.id, text: keeper.welcome, historicalLabel: 'fictional-world',
  })),
  missions,
  hints: MATERIAL_CASES.flatMap((record) => [
    `Look up the date, maker or maker’s role for ${record.object.accession} in its case.`,
    MATERIAL_ROOMS[record.fixture.kind].instruction,
    'Put both readings on the receipt. Choose a Council Yard or Lower Channel copy based on who can use it.',
    'Return to the Council Yard. Read the checked copy there or take the east stairs to the copy waiting by the channel.',
  ].map((text, i) => ({ id: `h.${record.flag}.${i + 1}`, objective: record.objective, depth: (i + 1) as Hint['depth'], text }))),
  journal: MATERIAL_CASES.map(({ flag, title, object }) => ({
    id: `j.${flag}`, text: `I put two checks on the slip for ${title.toLowerCase()}. ${object.limit}`, claimKind: 'simulation',
  })),
} satisfies Partial<ContentPack>;
