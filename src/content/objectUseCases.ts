import authored from './object-use-cases.json';
import type { AOK, Condition, ContentPack, Hint, Mission, Weave } from '../domain/types';
import { TRIAL_SIDES, type WorkshopBench } from '../domain/objectUse';

export const OBJECT_USE_GROUP = 'object-use';
export const OBJECT_USE_ROOMS = ['packing', 'exchange', 'joinery', 'trace'] as const;
export type ObjectUseRoom = typeof OBJECT_USE_ROOMS[number];
export type ObjectUseHost = 'market' | 'stage';
export const DELIVERY_ROUTES = ['near', 'wide'] as const;
export type DeliveryRoute = typeof DELIVERY_ROUTES[number];

interface AuthoredJob {
  key: string;
  room: ObjectUseRoom;
  title: string;
  problem: string;
  action: string;
  bench: WorkshopBench;
  bets: [string, string];
  results: [string, string];
  object: {
    id: string;
    institution: string;
    accession: string;
    title: string;
    date: string;
    dateKind: string;
    medium: string;
    dimensions: string;
    attribution: string;
    place: string;
    catalogUrl: string;
    observation: string;
    limit: string;
    verifiedOn: string;
    altText: string;
  };
}

export const OBJECT_USE_CASES = (authored as AuthoredJob[]).map((job) => ({
  ...job,
  flag: `object.use.${job.key}`,
  exhibit: `OBJ-OBJECT-USE-${job.key.toUpperCase()}`,
  objective: `object.use.${job.key}.received`,
  source: `HIS-OBJECT-USE-${job.key.toUpperCase()}`,
  card: `card.object.use.${job.key}`,
}));

export type ObjectUseCase = (typeof OBJECT_USE_CASES)[number];

interface RoomDetails {
  host: ObjectUseHost;
  room: string;
  world: string;
  chapter: string;
  mission: string;
  title: string;
  keeper: {
    id: string;
    name: string;
    role: string;
    introduction: string;
  };
  stakes: string;
  why: string;
  stations: [string, string];
  weave: Weave & { aoks: AOK[] };
}

export const OBJECT_USE_DETAILS: Record<ObjectUseRoom, RoomDetails> = {
  packing: {
    host: 'market', room: 'market.packing-loft', world: 'WORLD-11', chapter: 'market.arrival', mission: 'KG-CH10-R81',
    title: 'The Packing Loft',
    keeper: { id: 'object-use-aven', name: 'Aven Bragg', role: 'Packing Loft keeper',
      introduction: 'I trust a gap I can see. Turn the template before you write its slip. If one view needs extra room, tell the shelf keeper before the other trays arrive.' },
    stakes: 'The next handler needs either a quick, safe outline to move or enough room to compare the record from both sides.',
    why: 'When can a measurement help someone make a decision without fully describing an object?',
    stations: ['Aven’s checked drawer', 'the loft’s wide shelf'],
    weave: { concepts: ['evidence', 'objectivity', 'responsibility', 'certainty'], framework: ['methods-and-tools', 'scope', 'ethics'], aoks: ['MAT', 'HIS'], atl: ['thinking', 'research'], subjects: ['math-ai', 'design-tech', 'history'] },
  },
  exchange: {
    host: 'market', room: 'market.exchange-bench', world: 'WORLD-11', chapter: 'market.arrival', mission: 'KG-CH10-R82',
    title: 'The Exchange Bench',
    keeper: { id: 'object-use-veya', name: 'Veya Pike', role: 'Exchange Bench keeper',
      introduction: 'Some people count packets. I count anything somebody might leave behind. Slide both tally strips through the gate before you tell me what will travel.' },
    stakes: 'A short count moves the queue more quickly. A long count lets a recipient notice a missing part.',
    why: 'What changes when two people count the same things under different definitions?',
    stations: ['Veya’s gate desk', 'the return-count shelf'],
    weave: { concepts: ['evidence', 'justification', 'power', 'values'], framework: ['perspectives', 'methods-and-tools', 'ethics'], aoks: ['HIS', 'HUM', 'MAT'], atl: ['thinking', 'communication', 'research'], subjects: ['economics', 'business', 'math-ai', 'history'] },
  },
  joinery: {
    host: 'stage', room: 'stage.joinery-bay', world: 'WORLD-10', chapter: 'stage.arrival', mission: 'KG-CH9-R81',
    title: 'The Joinery Bay',
    keeper: { id: 'object-use-coru', name: 'Coru Tern', role: 'Joinery Bay keeper',
      introduction: 'One clean line reaches the distant seat. Two lines help somebody ask about the join. Move the overlay slowly enough to see the gap close.' },
    stakes: 'The first audience can miss small features. The handling bench can compare details if there is space to lay them out.',
    why: 'What does a particular viewpoint make possible, and what details does it leave someone else to check?',
    stations: ['Coru’s seat-facing rail', 'the two-part handling bench'],
    weave: { concepts: ['evidence', 'interpretation', 'perspective', 'culture', 'responsibility'], framework: ['perspectives', 'methods-and-tools', 'ethics'], aoks: ['ART', 'HIS'], atl: ['research', 'thinking', 'communication'], subjects: ['visual-arts', 'design-tech', 'history', 'film'] },
  },
  trace: {
    host: 'stage', room: 'stage.trace-gallery', world: 'WORLD-10', chapter: 'stage.arrival', mission: 'KG-CH9-R82',
    title: 'The Trace Gallery',
    keeper: { id: 'object-use-sivra', name: 'Sivra Pell', role: 'Trace Gallery keeper',
      introduction: 'A good cue gets someone moving. A longer sheet lets them see what came later. These timing strips are ours. The things in the cases inspired them.' },
    stakes: 'A quick reader needs a legible start. A visitor who missed it needs a fuller trace they can review.',
    why: 'How much can a practice model tell us about an instrument or a possible use?',
    stations: ['Sivra’s first cue rail', 'the listening drawer'],
    weave: { concepts: ['evidence', 'explanation', 'interpretation', 'certainty', 'objectivity'], framework: ['scope', 'perspectives', 'methods-and-tools'], aoks: ['ART', 'NAT', 'HIS'], atl: ['thinking', 'communication', 'research'], subjects: ['music', 'physics', 'history', 'math-ai'] },
  },
};

export function specimenUseAsset(record: ObjectUseCase): string {
  return `specimens/${record.object.id.replace(':', '-')}.jpg`;
}

export function objectUseReady(record: ObjectUseCase): Condition {
  return { all: [{ card: record.card }, ...TRIAL_SIDES.map((side): Condition => ({ flag: `${record.flag}.trial.${side}`, eq: true }))] };
}

export function objectUseDelivery(record: ObjectUseCase, route: DeliveryRoute): Condition {
  return { all: [objectUseReady(record), { flag: `${record.flag}.route`, eq: route }] };
}

const missions: Mission[] = OBJECT_USE_ROOMS.map((room) => {
  const plan = OBJECT_USE_DETAILS[room];
  const records = OBJECT_USE_CASES.filter((job) => job.room === room);
  const objectives = records.map((job): Mission['objectives'][number] => ({
    id: job.objective,
    title: `Test the two ways to prepare ${job.title.toLowerCase()} and finish its handoff.`,
    visible: { card: job.card }, essential: false,
    done: { any: DELIVERY_ROUTES.map((route) => ({ all: [objectUseDelivery(job, route), { flag: job.objective, eq: route }] })) },
    onComplete: [{ journal: `j.${job.flag}` }],
    weave: { ...plan.weave, minutes: 5, thinking: { dok: 2, bloom: 'apply', fink: 'application', solo: 'relational' } },
  }));
  return { id: plan.mission, world: plan.world, title: plan.title, stake: plan.stakes,
    knowledgeQuestion: plan.why, available: { any: records.map(({ card }) => ({ card })) },
    objectives, caseVisits: objectives.map(({ id }) => [id]) };
});

const HINTS: Record<WorkshopBench['kind'], string> = {
  clearance: 'Turn the outline both ways and measure each margin. A minus figure means there is a catch in that orientation.',
  tally: 'Move the tally strip to each register and keep both of the readings. Each strip says what it counts.',
  seam: 'Move the overlay to a mark, record the line, then use the other mark.',
  pulse: 'Use each practice window. Put the left edge of the shutter at the indicated start and trace each group.',
};

export const objectUseContent = {
  characters: OBJECT_USE_ROOMS.map((key) => {
    const { keeper } = OBJECT_USE_DETAILS[key];
    return { id: keeper.id, name: keeper.name, role: keeper.role,
      sprite: 'villager-2', mode: 'fictional', talk: [{ node: `${keeper.id}.room` }] };
  }),
  dialogue: OBJECT_USE_ROOMS.map((key) => {
    const { keeper } = OBJECT_USE_DETAILS[key];
    return { id: `${keeper.id}.room`, speaker: keeper.id, historicalLabel: 'fictional-world', text: keeper.introduction };
  }),
  sources: OBJECT_USE_CASES.map(({ source, object }) => ({
    id: source, title: `${object.institution}, ${object.title}, ${object.accession}`,
    url: object.catalogUrl, locator: 'Collection record, accession, date, material and object description',
    supports: object.observation, accessed: object.verifiedOn,
  })),
  exhibits: OBJECT_USE_CASES.map((record) => {
    const { object } = record;
    return {
      id: record.exhibit, name: `${object.title} · ${object.accession}`, art: 'preserved.catalogue',
      historicalLabel: 'documented', dateText: object.date, dateKind: object.dateKind,
      summary: `${object.attribution.replace(/\.$/, '')}. ${object.place.replace(/\.$/, '')}. ${object.medium.replace(/\.$/, '')}. ${object.dimensions.replace(/\.$/, '')}.`,
      altText: object.altText, sources: [record.source], grantsCard: record.card,
      specimen: {
        key: object.id, accession: object.accession, institution: object.institution,
        source: record.source, objective: record.objective, pixelAsset: specimenUseAsset(record),
      },
    };
  }),
  cards: OBJECT_USE_CASES.map(({ source, card, object }) => ({
    id: card, title: `${object.title} · ${object.accession}`, text: object.observation,
    historicalLabel: 'documented', claimKind: 'observation', sources: [source], limits: object.limit,
  })),
  missions,
  hints: OBJECT_USE_CASES.flatMap((record) => [
    `Read the collection record for ${record.object.accession} beside the tool.`,
    HINTS[record.bench.kind],
    'Use both readings to choose which copy to send. Each carries the catalogue reference.',
    `Back outside this room, find ${OBJECT_USE_DETAILS[record.room].stations.join(' or ')}. Complete the handoff at the selected place.`,
  ].map((text, i) => ({ id: `h.${record.flag}.${i + 1}`, objective: record.objective, depth: (i + 1) as Hint['depth'], text }))),
  journal: OBJECT_USE_CASES.map((record) => ({
    id: `j.${record.flag}`, text: `I finished the handoff for ${record.title.toLowerCase()}. ${record.object.limit}`, claimKind: 'simulation',
  })),
} satisfies Partial<ContentPack>;
