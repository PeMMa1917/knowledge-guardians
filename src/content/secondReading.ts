import type { Condition, ContentPack, DialogueNode, Hint, Mission, Objective, Weave } from '../domain/types';
import records from './second-reading-records.json';
import { specimenEquipped } from '../domain/specimenGear';

export const SECOND_READING_AVAILABLE: Condition = { flag: 'council.arrived', eq: true };
export const SECOND_READING_ROOM = 'council.second-reading';
export const SECOND_READING_ARCHIVE = 'observatory.archive';
export const SECOND_READING_CURRENT = 'second-reading.rail.current';

export const SECOND_READING_CASES = records.map((record) => {
  const flag = `second-reading.${record.slug}`;
  return {
    ...record, flag, source: `HIS-SECOND-READING-${record.slug.toUpperCase()}`,
    exhibit: `OBJ-SECOND-READING-${record.slug.toUpperCase()}`, card: `card.${flag}`,
    art: `${flag}.case`, objective: `${flag}.checked`, returnObjective: `${flag}.returned`,
    returnProp: `second-reading-${record.slug}-return`,
  };
});

export type SecondReadingCase = (typeof SECOND_READING_CASES)[number];
export type ReadingPosition = 'first' | 'second';
export type Handover = 'rail' | 'table';

export const storeReady = (entry: SecondReadingCase): Condition => ({ card: entry.card });
export const storePosition = (entry: SecondReadingCase, position: ReadingPosition): Condition => ({
  flag: `${entry.flag}.position`, eq: position,
});
export const storeWitness = (entry: SecondReadingCase, position: ReadingPosition): Condition => ({
  flag: `${entry.flag}.witness.${position}`, eq: true,
});
export const atReturn = (entry: SecondReadingCase): Condition => ({
  all: [{ objective: entry.objective }, specimenEquipped(entry.key)],
});
export const returnDisplay = (entry: SecondReadingCase, mode: Handover): Condition => ({
  all: [{ flag: SECOND_READING_CURRENT, eq: entry.slug }, { flag: `${entry.flag}.placement`, eq: mode }],
});

const storekeeper = 'second-reading-linnet';
const archivist = 'coast-olwen-veer';
const viewPositions: ReadingPosition[] = ['first', 'second'];
export const HANDOVER_MODES: Handover[] = ['rail', 'table'];

function receiverUse(entry: SecondReadingCase, mode: Handover) {
  return mode === 'rail'
    ? `A runner takes this comparison at the rail without waiting. Both positions and the limit stay on the copy for a later repeat. ${entry.limit}`
    : `Olwen leaves the model open at the staffed table. A waiting reader repeats both positions with a witness. The desk keeps a place for people who cannot wait. ${entry.limit}`;
}

export function readbackText(entry: SecondReadingCase, mode: Handover): string {
  const action = mode === 'rail' ? entry.hang : entry.desk;
  return `${action} ${receiverUse(entry, mode)}`;
}

function caseDialogue(entry: SecondReadingCase): DialogueNode[] {
  return [{
    id: `${entry.flag}.bench`, speaker: storekeeper, historicalLabel: 'reconstruction',
    text: 'These are study pieces. I can set the table while you stand at the witness side. Keep each reading on its own hook.',
    options: viewPositions.map((position) => ({
      text: position === 'first' ? entry.firstAction : entry.secondAction,
      effects: [{ setFlag: `${entry.flag}.position`, value: position }],
    })),
  }, {
    id: `${entry.flag}.return`, speaker: archivist, historicalLabel: 'reconstruction',
    text: entry.returnEvidence,
    options: [...HANDOVER_MODES.map((mode) => ({
      text: mode === 'rail' ? entry.hang : entry.desk,
      if: atReturn(entry),
      effects: [{ setFlag: SECOND_READING_CURRENT, value: entry.slug },
        { setFlag: `${entry.flag}.placement`, value: mode }],
    })), { text: 'Hold the loan here while the readers finish.' }],
  }];
}

function caseObjectives(entry: SecondReadingCase): Objective[] {
  const archivePractice: Weave = {
    concepts: ['perspective', 'responsibility', 'justification', 'values'], atl: ['communication', 'social', 'thinking'],
    aoks: ['HIS', 'NAT'], subjects: ['history', 'physics'],
    framework: ['perspectives', 'ethics', 'methods-and-tools'],
    thinking: { dok: 3, bloom: 'evaluate', fink: 'human', solo: 'relational' }, minutes: 4,
  };
  return [{
    id: entry.objective, title: `Check both positions for ${entry.title}`,
    visible: storeReady(entry), done: { all: [storeReady(entry), ...viewPositions.map((position) => storeWitness(entry, position))] },
    essential: false,
    onComplete: [{ journal: `j.${entry.flag}.checked` }],
    weave: {
      concepts: ['evidence', 'certainty', 'objectivity', 'explanation', 'interpretation'],
      atl: ['research', 'thinking'],
      aoks: ['NAT', 'HIS'], subjects: ['physics', 'history'],
      framework: ['scope', 'methods-and-tools'],
      thinking: { dok: 2, bloom: 'analyse', fink: 'application', solo: 'relational' }, minutes: 5,
    },
  }, {
    id: entry.returnObjective, title: `Put ${entry.title} to work in the Bell Archive`,
    visible: { objective: entry.objective },
    done: { all: [{ objective: entry.objective }, { flag: `${entry.flag}.received`, eq: true }] },
    onComplete: [{ journal: `j.${entry.flag}.returned` }],
    essential: false, weave: archivePractice,
  }];
}

function caseHints(entry: SecondReadingCase): Hint[] {
  const trials = [
    'Keep the object card and the practice reading on separate hooks.',
    'Set a practice position. Check its witness card two steps below the bench.',
    'Repeat from the other practice position. The second witness card needs its own visit.',
    `Read the case for ${entry.accession}. Try each action at its neighbouring bench and walk to the result after each one. Reopen the case to request the loan.`,
  ];
  const returns = [
    'The Bell Archive has a new use for the finished comparison.',
    'Carry and equip the object. Follow the return path for it from the Nexus collection room.',
    'Olwen’s west-side rail leads to a handover. The result will be waiting at the hanging or the staffed table.',
    `Equip ${entry.accession}. In the Bell Archive use the west trial rail. Put the comparison on the public clip or the staffed table, then read that placement.`,
  ];
  return [trials, returns].flatMap((lines, index) => lines.map((text, step) => ({
    id: `h.${entry.flag}.${index + 1}.${step + 1}`,
    objective: index === 0 ? entry.objective : entry.returnObjective, depth: (step + 1) as Hint['depth'], text,
  })));
}

const caseMission: Mission = {
  id: 'second-reading', world: 'WORLD-16', title: 'The Second Reading Store',
  knowledgeQuestion: 'How far can we carry a reading away from the place and method that made it?',
  stake: 'Linnet has one busy public rail and one staffed table. A runner may miss the next bell if every loan needs a private session.',
  available: SECOND_READING_AVAILABLE,
  caseVisits: SECOND_READING_CASES.map((entry) => [entry.objective, entry.returnObjective]),
  objectives: SECOND_READING_CASES.flatMap(caseObjectives),
};

export const secondReadingContent: Partial<ContentPack> = {
  characters: [{
    id: storekeeper, name: 'Linnet Rull', role: 'Council loan steward and former harbour bell runner',
    sprite: 'clerk-venn', mode: 'fictional', talk: [{ node: 'second-reading.welcome' }],
  }],
  dialogue: [{
    id: 'second-reading.welcome', speaker: storekeeper, historicalLabel: 'fictional-world',
    text: 'My old shift could carry one frame before the bell. Olwen can spare a longer check on the table. Pick a case and try its two positions. We’ll send the part that travels with its limit still attached.',
    options: [{ text: 'Follow the witness strips.' }, { text: 'Keep the borrowing shelves free for now.' }],
  }, ...SECOND_READING_CASES.flatMap(caseDialogue)],
  missions: [caseMission],
  exhibits: SECOND_READING_CASES.map((entry) => ({
    id: entry.exhibit, name: entry.title, art: entry.art, historicalLabel: 'documented',
    dateText: entry.date, dateKind: entry.dateKind, summary: entry.summary, sources: [entry.source],
    grantsCard: entry.card, altText: `Original study schematic for ${entry.title}. The exact museum record has the object description.`,
    specimen: {
      key: entry.key, institution: entry.institution, accession: entry.accession, source: entry.source,
      objective: entry.objective,
      revisit: {
        map: SECOND_READING_ARCHIVE, prop: entry.returnProp,
        method: 'Replay the object comparison for a different audience.',
        hint: 'Equip the object and take it to Olwen’s west rail in the Bell Archive.',
      },
    },
  })),
  sources: SECOND_READING_CASES.map((entry) => ({
    id: entry.source, title: `${entry.institution}, ${entry.title} (${entry.accession})`, url: entry.url,
    locator: 'Exact object identifier, date and public catalogue description', supports: entry.summary, accessed: '2026-11-26',
    mla: { kind: 'page', title: entry.title, container: entry.institution, showAccessDate: true },
  })),
  cards: SECOND_READING_CASES.map((entry) => ({
    id: entry.card, title: `${entry.accession} · ${entry.title}`, text: entry.summary,
    sources: [entry.source], historicalLabel: 'documented', claimKind: 'observation', limits: entry.limit,
  })),
  hints: SECOND_READING_CASES.flatMap(caseHints),
  journal: SECOND_READING_CASES.flatMap((entry) => [{
    id: `j.${entry.flag}.checked`, claimKind: 'simulation' as const, text: `${entry.firstReading} ${entry.secondReading}`,
  }, {
    id: `j.${entry.flag}.returned`, claimKind: 'simulation' as const,
    text: `The Bell Archive received the dated comparison for ${entry.accession}. ${entry.limit}`,
  }]),
};
