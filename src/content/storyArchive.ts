import type { AOK, Concept, Condition, ContentPack, DialogueNode, Hint, Mission } from '../domain/types';
import type { FrameworkPart } from '../domain/learningLevels';
import { BOTH_FRAME_VIEWS } from '../domain/storyFrames';
import archive from './story-archive.json';

interface FrameStamp {
  name: string;
  label: string;
  art: string;
  text: string;
  action: string;
}

interface FrameVariant {
  key: string;
  control: string;
  title: string;
  lines: [string, string];
  destination: string;
  x: number;
  y: number;
  opening: string;
  action: string;
  result: string;
}

interface FrameRecord {
  key: 'board' | 'cycle';
  exhibit: string;
  name: string;
  identity: string;
  title: string;
  stake: string;
  prompt: string;
  date: string;
  place: string;
  dateKind: string;
  art: string;
  alt: string;
  summary: string;
  observation: string;
  limit: string;
  sources: [string, string];
  stamps: [FrameStamp, FrameStamp];
  variants: [FrameVariant, FrameVariant];
  journal: string;
  concepts: Concept[];
  framework: FrameworkPart[];
  disciplines: string[];
  aoks: AOK[];
}

export const STORY_FRAME_GROUP = 'story-frames';

export const STORY_FRAMES = (archive.cases as FrameRecord[]).map((record) => ({
  ...record,
  flag: `story.frame.${record.key}`,
  card: `card.story.frame.${record.key}`,
  objective: `story.frame.${record.key}.read`,
  specimen: record.key === 'board'
    ? { key: 'brooklyn:76.20.4', institution: 'Brooklyn Museum', accession: '76.20.4' }
    : { key: 'hpmm:1105-0001', institution: 'Hiroshima Peace Memorial Museum', accession: '1105-0001' },
}));

export type StoryFrame = (typeof STORY_FRAMES)[number];

export const frameStamp = (record: StoryFrame, name: string): Condition => ({ flag: `${record.flag}.stamp.${name}`, eq: true });
export const frameReady = (record: StoryFrame): Condition => ({ all: [
  { card: record.card }, ...record.stamps.map(({ name }) => frameStamp(record, name)),
] });
export const frameViewed = (record: StoryFrame): Condition => ({ flag: `${record.flag}.views`, eq: BOTH_FRAME_VIEWS });
export const frameLayout = (record: StoryFrame, layout: string): Condition => ({ flag: `${record.flag}.ready`, eq: layout });
export const frameAvailable = (record: StoryFrame): Condition => ({ not: { flagSet: `${record.flag}.ready` } });

const greeting: DialogueNode = {
  id: 'story.frame.keeper', speaker: 'story-frame-keeper', historicalLabel: 'fictional-world',
  text: 'A clear caption lets a reader go back to the person or record that supports it. Use the two clip boards after you’ve read the object record. The frame has room for two different orders. Keep a source with each line you move.',
};

function frameDialogue(record: StoryFrame): DialogueNode[] {
  return [
    ...record.stamps.map((stamp): DialogueNode => ({
      id: `${record.flag}.stamp.${stamp.name}`, speaker: 'narrator', historicalLabel: 'fictional-world', text: stamp.text,
      options: [{ text: stamp.action, if: { all: [{ card: record.card }, { not: frameStamp(record, stamp.name) }] },
        effects: [{ setFlag: `${record.flag}.stamp.${stamp.name}`, value: true }] }, { text: 'Leave the papers in their clip.' }],
    })),
    ...record.variants.flatMap((variant): DialogueNode[] => {
      const stage = `${record.flag}.read.${variant.key}`;
      return [{ id: stage, speaker: 'narrator', text: variant.opening, historicalLabel: 'fictional-world', options: [
        { text: variant.action,
          if: { all: [frameReady(record), frameViewed(record), frameLayout(record, variant.key), { not: { flagSet: record.objective } }] },
          effects: [{ setFlag: record.objective, value: variant.key }], next: `${stage}-done` },
        { text: 'Leave the caption for the next visit.' },
      ] }, { id: `${stage}-done`, speaker: 'narrator', historicalLabel: 'fictional-world', text: variant.result }];
    }),
  ];
}

const mission: Mission = {
  id: 'KG-CH9-R40', world: 'WORLD-10', title: 'The Story Archive',
  available: { objective: 'stage.arrival' },
  stake: 'Visitors want to see where a caption’s details came from and where to look for more.',
  knowledgeQuestion: 'What responsibilities travel with a caption when it carries someone else’s account?',
  caseVisits: STORY_FRAMES.map(({ objective }) => [objective]),
  objectives: STORY_FRAMES.map((record) => ({
    id: record.objective, title: record.title, essential: false, visible: { card: record.card },
    done: { all: [frameReady(record), frameViewed(record), { flagSet: `${record.flag}.ready` }, { flagSet: record.objective }] },
    onComplete: [{ journal: `j.${record.flag}` }],
    weave: { concepts: record.concepts, framework: record.framework, atl: ['research', 'thinking', 'communication'],
      subjects: record.disciplines, aoks: record.aoks, minutes: 5,
      thinking: { dok: 3, bloom: 'analyse', fink: 'integration', solo: 'relational' } },
  })),
};

export const storyArchiveContent = {
  sources: archive.sources,
  characters: [{ id: 'story-frame-keeper', name: 'Oriel March', role: 'Story Archive caption keeper', sprite: 'villager-2', mode: 'fictional', talk: [{ node: greeting.id }] }],
  exhibits: STORY_FRAMES.map((record) => ({
    id: record.exhibit, name: record.name, art: record.art, historicalLabel: 'documented', dateText: record.date,
    dateKind: record.dateKind, summary: `${record.place} ${record.summary}`, altText: record.alt,
    sources: record.sources, grantsCard: record.card,
    specimen: { ...record.specimen, objective: record.objective, source: record.sources[0] },
  })),
  cards: STORY_FRAMES.map((record) => ({ id: record.card, title: record.name, text: record.observation,
    limits: record.limit, sources: record.sources, claimKind: 'observation', historicalLabel: 'documented' })),
  dialogue: [greeting, ...STORY_FRAMES.flatMap(frameDialogue)],
  missions: [mission],
  hints: STORY_FRAMES.flatMap((record) => [
    `Find ${record.specimen.accession} in the Story Archive.`,
    `Place the two separate papers in their clips beside the exhibit.`,
    `Try both sides of the caption frame, then send one to the Gallery.`,
    `Read the chosen caption with its visitor at ${record.variants[0].destination} or ${record.variants[1].destination}.`,
  ].map((text, index) => ({ id: `h.${record.flag}.${index + 1}`, objective: record.objective, depth: (index + 1) as Hint['depth'], text }))),
  journal: STORY_FRAMES.map((record) => ({ id: `j.${record.flag}`, title: record.title, claimKind: 'observation', text: record.journal })),
} satisfies Partial<ContentPack>;
