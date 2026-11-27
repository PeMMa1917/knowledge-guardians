import authored from './work-schedule-specimens.json';
import { specimenEquipped, specimenReadingFlag } from '../domain/specimenGear';
import type { Condition, ContentPack, Hint, Mission, Weave } from '../domain/types';
import type { ScheduleFixture, SchedulePriority } from '../domain/workSchedule';

export const SCHEDULE_GAME = 'work-schedule';
export const SCHEDULE_GATE: Condition = { objective: 'forest.arrival' };
export const SCHEDULE_HUB = 'forest.work-schedule';
export const SCHEDULE_REVISIT = { map: 'copies.archive', prop: 'work-schedule-copies-shelf' };
export const SCHEDULE_ROUTES = ['source', 'practice'] as const;
export const SCHEDULE_ROOMS = ['cloth', 'vessels', 'hardware', 'paper'] as const;
export type ScheduleRoom = typeof SCHEDULE_ROOMS[number];

interface ScheduleObject {
  key: string;
  accession: string;
  institution: string;
  title: string;
  date: string;
  dateKind: string;
  artist: string;
  place: string;
  medium: string;
  dimensions: string;
  catalogue: string;
  pixelAsset: string;
  observation: string;
  limit: string;
  altText: string;
}

interface AuthoredScheduleCase {
  slug: string;
  room: ScheduleRoom;
  title: string;
  task: string;
  fixture: ScheduleFixture;
  jobs: [string, string, string];
  notes: [string, string];
  choices: [string, string];
  outcomes: [string, string];
  revisit: [string, string];
  object: ScheduleObject;
}

export const SCHEDULE_CASES = (authored as AuthoredScheduleCase[]).map((record) => {
  const flag = `forest.schedule.${record.slug}`;
  return { ...record, flag, exhibit: `OBJ-WORK-SCHEDULE-${record.slug.toUpperCase()}`, source: `HIS-WORK-SCHEDULE-${record.slug.toUpperCase()}`,
    card: `card.${flag}`, objective: `${flag}.placed`, reprise: specimenReadingFlag(record.object.key) };
});
export type ScheduleCase = (typeof SCHEDULE_CASES)[number];

interface Workroom {
  map: string;
  mission: string;
  title: string;
  actor: string;
  name: string;
  role: string;
  welcome: string;
  question: string;
  stake: string;
  weave: Weave;
}

export const SCHEDULE_DETAILS = {
  cloth: {
    map: 'forest.schedule-cloth', mission: 'KG-CH5-R86', title: 'Cloth and Fold Room',
    actor: 'schedule-eome', name: 'Eome Rann', role: 'Cloth room keeper',
    welcome: 'A source tab takes time. A working fold takes time too. Put one before the stand and arrange for somebody to add the other when the first readers pass.',
    question: 'What should a person learn first when a full description takes longer to prepare?',
    stake: 'An early reader needs to find the recorded origin. A workshop visitor needs a fold they can use without losing the other evidence.',
    weave: { concepts: ['evidence', 'culture', 'perspective', 'responsibility'], framework: ['scope', 'perspectives', 'ethics'],
      atl: ['research', 'communication'], aoks: ['ART', 'HIS'], subjects: ['history', 'visual-arts', 'design-tech'] },
  },
  vessels: {
    map: 'forest.schedule-vessels', mission: 'KG-CH5-R87', title: 'Vessel and Tray Room',
    actor: 'schedule-enel', name: 'Enel Fray', role: 'Vessel room keeper',
    welcome: 'The first board can hold one useful check by opening. Move the plain outline and the accession slip on your rail to see which can reach that board in time.',
    question: 'How much can a person act on from a narrower but properly described piece of evidence?',
    stake: 'The first tray can reach people at the station or a practice handler on the trail. Each will need a later supplement.',
    weave: { concepts: ['evidence', 'certainty', 'justification', 'values'], framework: ['scope', 'methods-and-tools', 'perspectives'],
      atl: ['thinking', 'communication'], aoks: ['NAT', 'HIS', 'MAT'], subjects: ['design-tech', 'history', 'math-ai'] },
  },
  hardware: {
    map: 'forest.schedule-hardware', mission: 'KG-CH5-R88', title: 'Working Parts Room',
    actor: 'schedule-karth', name: 'Karth Merrow', role: 'Working parts keeper',
    welcome: 'Move a test before you claim a whole method. The pieces in the case stand still. Try to deliver a model somebody can handle or give the checker a good record to start from.',
    question: 'What can a person rely on when timing forces work and verification into separate steps?',
    stake: 'A work crew needs a useful model. A catalogue reader needs a bounded claim whose evidence remains possible to check.',
    weave: { concepts: ['evidence', 'explanation', 'objectivity', 'responsibility'], framework: ['methods-and-tools', 'scope', 'ethics'],
      atl: ['thinking', 'research', 'self-management'], aoks: ['TEC', 'HIS', 'NAT'], subjects: ['design-tech', 'physics', 'history'] },
  },
  paper: {
    map: 'forest.schedule-paper', mission: 'KG-CH5-R89', title: 'Marks and Paper Room',
    actor: 'schedule-veira', name: 'Veira Thorn', role: 'Proof sheet keeper',
    welcome: 'The first press pulls either a name or a mark. The wait can leave someone with only half a story. Try the two schedules and give the later proof its own place.',
    question: 'How can an institution show whose role and what material evidence will be available by a particular time?',
    stake: 'A source can be lost when the early public sheet and the later working copy circulate without a link.',
    weave: { concepts: ['evidence', 'truth', 'interpretation', 'power', 'perspective'], framework: ['perspectives', 'methods-and-tools', 'ethics'],
      atl: ['communication', 'research', 'thinking'], aoks: ['ART', 'HIS', 'LAN'], subjects: ['history', 'visual-arts', 'design-tech'] },
  },
} satisfies Record<ScheduleRoom, Workroom>;

export function scheduleReady(record: ScheduleCase): Condition {
  return { all: [{ card: record.card }, ...SCHEDULE_ROUTES.map((branch): Condition =>
    ({ flag: `${record.flag}.tested.${branch}`, eq: true }))] };
}
export function scheduleDelivery(record: ScheduleCase, route: SchedulePriority): Condition {
  return { all: [scheduleReady(record), { flag: `${record.flag}.sent`, eq: route }] };
}
export function scheduleCarry(record: ScheduleCase): Condition {
  return { all: [specimenEquipped(record.object.key), { objective: record.objective }] };
}

const missions: Mission[] = SCHEDULE_ROOMS.map((room) => {
  const info = SCHEDULE_DETAILS[room];
  const entries = SCHEDULE_CASES.filter((record) => record.room === room);
  const objectives = entries.map((record): Mission['objectives'][number] => ({
    id: record.objective, title: `Run both opening schedules for ${record.title.toLowerCase()} and use one at its receiving stand.`,
    visible: { card: record.card }, essential: false,
    done: { any: SCHEDULE_ROUTES.map((route) => ({ all: [scheduleDelivery(record, route), { flag: record.objective, eq: route }] })) },
    onComplete: [{ journal: `j.${record.flag}` }],
    weave: { ...info.weave, minutes: 6, thinking: { dok: 3, bloom: 'analyse', fink: 'application', solo: 'relational' } },
  }));
  return { id: info.mission, world: 'WORLD-06', title: info.title, stake: info.stake, knowledgeQuestion: info.question,
    objectives, caseVisits: objectives.map(({ id }) => [id]), available: { any: entries.map(({ card }) => ({ card })) } };
});

export const workScheduleContent = {
  sources: SCHEDULE_CASES.map(({ source, object }) => ({
    id: source, title: `${object.institution}, ${object.title}, ${object.accession}`, url: object.catalogue,
    locator: 'Object identity, date, artist and catalogue description', supports: object.observation, accessed: '2026-11-26',
  })),
  exhibits: SCHEDULE_CASES.map((record) => {
    const { object } = record;
    return { id: record.exhibit, name: `${object.title} · ${object.accession}`, historicalLabel: 'documented', art: 'preserved.catalogue',
      dateText: object.date, dateKind: object.dateKind, summary: [object.artist, object.place, object.medium, object.dimensions].join(' · '),
      altText: object.altText, sources: [record.source], grantsCard: record.card,
      specimen: { key: object.key, institution: object.institution, accession: object.accession,
        source: record.source, objective: record.objective, pixelAsset: object.pixelAsset,
        revisit: { ...SCHEDULE_REVISIT, method: record.revisit[0], hint: 'Equip the object and take it to the late-proof shelf in the City of Copies Record Room.' } },
    };
  }),
  cards: SCHEDULE_CASES.map(({ source, card, object }) => ({
    id: card, title: `${object.title} · ${object.accession}`, text: object.observation, limits: object.limit,
    historicalLabel: 'documented', claimKind: 'observation', sources: [source],
  })),
  characters: Object.values(SCHEDULE_DETAILS).map(({ actor, name, role }) => ({
    id: actor, name, role, sprite: 'villager-1', mode: 'fictional', talk: [{ node: `${actor}.welcome` }],
  })),
  dialogue: Object.values(SCHEDULE_DETAILS).map(({ actor, welcome }) => ({
    id: `${actor}.welcome`, speaker: actor, text: welcome, historicalLabel: 'fictional-world',
  })),
  missions,
  hints: SCHEDULE_CASES.flatMap((record) => [
    `Read the case for ${record.object.accession} and look at the roles and date it gives.`,
    'Move one evidence job ahead of opening the stand and the other after it. Use the bell to see when somebody can use the first part.',
    'Try both schedules before choosing a receipt. In either schedule a second piece of evidence arrives after the first.',
    'Finish the source receipt at Fern Station or the practice receipt on Listening Trail.',
  ].map((text, i) => ({ id: `h.${record.flag}.${i + 1}`, objective: record.objective, depth: (i + 1) as Hint['depth'], text }))),
  journal: SCHEDULE_CASES.map((record) => ({
    id: `j.${record.flag}`, text: `I prepared two opening schedules for ${record.title.toLowerCase()}. ${record.object.limit}`, claimKind: 'simulation',
  })),
} satisfies Partial<ContentPack>;
