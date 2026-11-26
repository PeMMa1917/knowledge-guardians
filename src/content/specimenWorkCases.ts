import type { AOK, Condition, Concept, ContentPack, DialogueNode, Hint, Mission } from '../domain/types';
import type { FrameworkPart } from '../domain/learningLevels';
import authoredCases from './specimen-work-cases.json';

interface WorkTrial {
  label: string;
  art: string;
  checkedArt: string;
  action: string;
  preview: string;
  result: string;
}

interface WorkBranch {
  key: string;
  choice: string;
  delivery: string;
  art: string;
  doneArt: string;
  x: number;
  y: number;
  opening: string;
  action: string;
  result: string;
}

interface AuthoredWorkCase {
  slug: string;
  room: 'market' | 'stage';
  title: string;
  stake: string;
  knowledgeQuestion: string;
  preview: string;
  arrangeLabel: string;
  trials: [WorkTrial, WorkTrial];
  branches: [WorkBranch, WorkBranch];
  journal: string;
  concepts: Concept[];
  framework: FrameworkPart[];
  subjects: string[];
  aoks: AOK[];
  object: {
    id: string;
    institution: string;
    accession: string;
    title: string;
    displayName: string;
    date: string;
    medium: string;
    dimensions: string;
    attribution: string;
    place: string;
    catalogUrl: string;
    observation: string;
    limit: string;
    verifiedOn: string;
    dateKind: string;
    altText: string;
  };
}

const prefix = 'specimen.work';

export const SPECIMEN_WORK = (authoredCases as AuthoredWorkCase[]).map((record) => ({
  ...record,
  flag: `${prefix}.${record.slug}`,
  exhibit: `OBJ-SPECIMEN-WORK-${record.slug.toUpperCase()}`,
  source: `HIS-SPECIMEN-WORK-${record.slug.toUpperCase()}`,
  card: `card.${prefix}.${record.slug}`,
  objective: `${prefix}.${record.slug}.used`,
}));

export type SpecimenWork = (typeof SPECIMEN_WORK)[number];

export function workTrial(record: SpecimenWork, index: number): Condition {
  return { flag: `${record.flag}.trial-${index + 1}`, eq: true };
}

export function workReady(record: SpecimenWork): Condition {
  return { all: [{ card: record.card }, ...record.trials.map((_, index) => workTrial(record, index))] };
}

export function workChoice(record: SpecimenWork, key: string): Condition {
  return { flag: `${record.flag}.route`, eq: key };
}

const unplaced = (record: SpecimenWork): Condition => ({ not: { flagSet: `${record.flag}.route` } });
const unseen = (record: SpecimenWork): Condition => ({ not: { flag: record.objective, eq: true } });

const roomInfo = {
  market: { world: 'WORLD-11', mission: 'KG-CH10-R', actor: 'specimen-work-vera' },
  stage: { world: 'WORLD-10', mission: 'KG-CH9-R', actor: 'specimen-work-tobin' },
};

function dialogue(record: SpecimenWork): DialogueNode[] {
  const label = 'fictional-world';
  const nodes: DialogueNode[] = record.trials.flatMap((trial, index) => {
    const id = `${record.flag}.trial-${index + 1}`;
    return [{
      id, speaker: 'narrator', historicalLabel: label, text: trial.preview,
      options: [
        { text: trial.action, if: { card: record.card }, effects: [{ setFlag: id, value: true }], next: `${id}-result` },
        { text: 'Leave the trial where it is.' },
      ],
    }, { id: `${id}-result`, speaker: 'narrator', historicalLabel: label, claimKind: 'simulation', text: trial.result }];
  });
  const speaker = record.slug === 'reed' ? 'specimen-work-sali' : roomInfo[record.room].actor;
  nodes.push({
    id: `${record.flag}.arrange`, speaker, historicalLabel: label, text: record.preview,
    options: [...record.branches.map((branch) => ({
      text: branch.choice, if: { all: [workReady(record), unplaced(record)] },
      effects: [{ setFlag: `${record.flag}.route`, value: branch.key }],
      next: `${record.flag}.packed-${branch.key}`,
    })), { text: 'Leave both plans at the worktable.' }],
  });
  for (const branch of record.branches) {
    const node = `${record.flag}.deliver-${branch.key}`;
    nodes.push({
      id: `${record.flag}.packed-${branch.key}`, speaker: 'narrator', historicalLabel: label,
      text: `The workshop copy is ready. Outside this room, look for ${branch.delivery}.`,
    }, {
      id: node, speaker: 'narrator', historicalLabel: label, text: branch.opening,
      options: [{
        text: branch.action, if: { all: [workReady(record), workChoice(record, branch.key), unseen(record)] },
        effects: [{ setFlag: record.objective, value: true }], next: `${node}-result`,
      }, { text: 'Come back to finish the handoff.' }],
    }, { id: `${node}-result`, speaker: 'narrator', historicalLabel: label, text: branch.result });
  }
  return nodes;
}

const missions: Mission[] = (['market', 'stage'] as const).map((room) => {
  const jobs = SPECIMEN_WORK.filter((record) => record.room === room);
  const objectives: Mission['objectives'] = jobs.map((record) => ({
    id: record.objective,
    title: `Try both preparations for ${record.title.toLowerCase()} and finish the chosen handoff.`,
    visible: { card: record.card },
    essential: false,
    done: { all: [workReady(record), { flagSet: `${record.flag}.route` }, { flag: record.objective, eq: true }] },
    onComplete: [{ journal: `j.${record.flag}` }],
    weave: {
      concepts: record.concepts, framework: record.framework, aoks: record.aoks, subjects: record.subjects,
      atl: ['thinking', 'research', 'communication'],
      thinking: { dok: 2, bloom: 'apply', fink: 'application', solo: 'relational' },
      minutes: 4,
    },
  }));
  return {
    id: `${roomInfo[room].mission}30`, world: roomInfo[room].world,
    title: room === 'market' ? 'Jobs in the Sample Shed' : 'Jobs in the Prop Room',
    available: { any: jobs.map(({ card }) => ({ card })) },
    stake: room === 'market' ? 'People are waiting to use the preparations in different ways.' : 'The audience will see where a rehearsal tool makes its first impression.',
    knowledgeQuestion: 'What can a tested preparation help the next person know about the original specimen?',
    objectives, caseVisits: objectives.map(({ id }) => [id]),
  };
});

export const specimenWorkContent = {
  characters: [
    { id: 'specimen-work-vera', name: 'Vera Slade', role: 'Keeper of the Market practice shed', sprite: 'villager-2', mode: 'fictional', talk: [{ node: `${prefix}.vera` }] },
    { id: 'specimen-work-sali', name: 'Sali Finch', role: 'Keeper of the Market water trials', sprite: 'villager-1', mode: 'fictional', talk: [{ node: `${prefix}.sali` }] },
    { id: 'specimen-work-tobin', name: 'Tobin Mall', role: 'Keeper of the House prop room', sprite: 'villager-2', mode: 'fictional', talk: [{ node: `${prefix}.tobin` }] },
  ],
  dialogue: [
    { id: `${prefix}.vera`, speaker: 'specimen-work-vera', historicalLabel: 'fictional-world', text: 'The samples lying out are our own practice pieces. Look at the museum case for the handle or surface that caught your eye. Once you have read it, use the two trials beside it. I have room to prepare one order for each.' },
    { id: `${prefix}.sali`, speaker: 'specimen-work-sali', historicalLabel: 'fictional-world', text: 'The water goes down the same line in both tubes. A drop on the wrong shelf will do me no good. Try both catch sheets and find the person who can use your copy.' },
    { id: `${prefix}.tobin`, speaker: 'specimen-work-tobin', historicalLabel: 'fictional-world', text: 'I make props for people to handle. Hari has a different job out there. He needs things readers can follow from a seat. Count your practice marks before you take a plan through that door.' },
    ...SPECIMEN_WORK.flatMap(dialogue),
  ],
  sources: SPECIMEN_WORK.map(({ source, object }) => ({
    id: source,
    title: `${object.institution}, ${object.title}, ${object.accession}`,
    url: object.catalogUrl,
    locator: 'Accession record, dimensions and catalogue description',
    supports: object.observation,
    accessed: object.verifiedOn,
  })),
  exhibits: SPECIMEN_WORK.map((record) => {
    const { object } = record;
    return {
      id: record.exhibit, name: `${object.displayName} · ${object.accession}`, art: 'preserved.catalogue',
      historicalLabel: 'documented', dateText: object.date, dateKind: object.dateKind,
      summary: `${object.attribution}. ${object.place.replace(/\.$/, '')}. ${object.medium}. ${object.dimensions}.`,
      altText: object.altText,
      sources: [record.source], grantsCard: record.card,
      specimen: {
        key: object.id, accession: object.accession, institution: object.institution,
        source: record.source, objective: record.objective, pixelAsset: `specimens/${object.id.replace(':', '-')}.jpg`,
      },
    };
  }),
  cards: SPECIMEN_WORK.map(({ source, card, object }) => ({
    id: card, title: `${object.displayName} · ${object.accession}`, text: object.observation,
    historicalLabel: 'documented', claimKind: 'observation', sources: [source], limits: object.limit,
  })),
  missions,
  hints: SPECIMEN_WORK.flatMap((record) => [
    `Read the museum case for ${record.object.accession} before borrowing its practice tools.`,
    `${record.trials[0].action} Then try ${record.trials[1].label}.`,
    `Read both results, then use ${record.arrangeLabel}. Both preparations can be used.`,
    `Return through the room’s door and look for ${record.branches[0].delivery} or ${record.branches[1].delivery}. Finish the chosen handoff there.`,
  ].map((text, index) => ({ id: `h.${record.flag}.${index + 1}`, objective: record.objective, depth: (index + 1) as Hint['depth'], text }))),
  journal: SPECIMEN_WORK.map((record) => ({
    id: `j.${record.flag}`, title: record.title, claimKind: 'observation', text: record.journal,
  })),
} satisfies Partial<ContentPack>;
