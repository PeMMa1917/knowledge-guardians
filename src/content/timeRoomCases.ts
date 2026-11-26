import { STANDARDS, timeChoice, trialFlag, type InstrumentType } from '../domain/timeRoom';
import type { Condition, ContentPack, Hint, Objective } from '../domain/types';
import data from './time-room-cases.json';

export const TIME_ROOM_OPEN: Condition = { flag: 'study.letter', eq: true };

export const TIME_CASES = data.map((record) => ({
  ...record, kind: record.kind as InstrumentType, stem: `time.${record.slug}`,
  exhibit: `OBJ-TIME-${record.slug}`, card: `card.time.${record.slug}`,
  source: `HIS-TIME-${record.slug}`, objective: `time.${record.slug}.posted`,
  revisit: {
    map: 'aethelgard.study', prop: `time-return-${record.slug}`,
    method: `Set a fresh reference from ${record.title}`,
    hint: `Bring the equipped ${record.title} copy to the clock table in Elsbet’s Study.`,
  },
}));
export type TimeCase = (typeof TIME_CASES)[number];

const objectives: Objective[] = TIME_CASES.map((record) => ({
  id: record.objective, title: `Run both practice checks for ${record.title} and post a cue.`,
  done: {
    all: [...STANDARDS.map((standard): Condition => ({ flag: trialFlag(record.stem, standard), eq: true })),
      { flag: timeChoice(record.stem), in: ['arrival', 'relay'] }],
  },
  visible: { card: record.card }, essential: false,
  weave: {
    concepts: ['evidence', 'objectivity', 'explanation', 'perspective', 'certainty', 'responsibility'],
    framework: ['scope', 'methods-and-tools', 'perspectives', 'ethics'],
    atl: ['thinking', 'research', 'communication'], aoks: ['MAT', 'HIS', 'TEC'], subjects: ['math-ai', 'history', 'design-tech', 'physics'],
    thinking: { dok: 3, bloom: 'analyse', fink: 'application', solo: 'relational' }, minutes: 4,
  },
  onComplete: [{ journal: `j.${record.stem}` }],
}));

function hints(record: TimeCase): Hint[] {
  const lines = [
    `Open the collection stand for ${record.accession} in the Time Room.`,
    `Check its ${record.feature}, then try the practice device beside it.`,
    'Make three reference steps after matching the first mark. Then repeat with matched pace.',
    'Post a first cue for the runner or a running record for the keeper. The exhibit can then give you a copy for Elsbet’s Study.',
  ];
  return ([1,2,3,4] as const).map((depth) => ({ id: `h.${record.stem}.${depth}`, objective: record.objective, depth, text: lines[depth - 1] }));
}

type TimeContent = Pick<ContentPack, 'sources' | 'exhibits' | 'cards' | 'missions' | 'journal' | 'hints'>;

export const timeRoomContent: TimeContent = {
  sources: TIME_CASES.map((record) => ({
    id: record.source, title: `${record.institution}, ${record.catalogueTitle}, ${record.accession}`,
    url: record.catalogue, locator: 'Object record and collection view', supports: record.fact, accessed: '2026-11-26',
    mla: { kind: 'artwork', title: record.catalogueTitle, container: record.institution, workDate: record.date },
  })),
  exhibits: TIME_CASES.map((record) => ({
    id: record.exhibit, name: record.title, art: 'collection-stand', historicalLabel: 'documented',
    dateText: record.date, dateKind: 'The museum’s date for the case, assembled object or catalogue piece.',
    summary: [`${record.place}.`, record.fact, record.material, record.dimensions].filter(Boolean).join(' '),
    sources: [record.source], grantsCard: record.card, altText: record.alt,
    specimen: {
      key: record.key, institution: record.institution, accession: record.accession,
      source: record.source, objective: record.objective, pixelAsset: record.pixelAsset, revisit: record.revisit,
      people: record.people.map(({ name, role }) => ({ name, role, source: record.source, detail: record.fact })),
    },
  })),
  cards: TIME_CASES.map((record) => ({
    id: record.card, title: `${record.title} · ${record.accession}`, claimKind: 'observation', historicalLabel: 'documented',
    text: record.fact, limits: record.limit, sources: [record.source],
  })),
  missions: [{
    id: 'KG-CH1-R52', world: 'WORLD-02', title: 'When the Two Clocks Agree', available: TIME_ROOM_OPEN,
    stake: 'A runner needs one reliable cue. The keeper needs intervals they can repeat after the first bell.',
    knowledgeQuestion: 'What can a first agreement and a maintained pace each let a reader claim?',
    objectives, caseVisits: objectives.map(({ id }) => [id]),
  }],
  journal: TIME_CASES.map((record) => ({
    id: `j.${record.stem}`, claimKind: 'observation',
    text: `I compared a common first mark with a common pace on a practice model for ${record.accession}. ${record.limit}`,
  })),
  hints: TIME_CASES.flatMap(hints),
};
