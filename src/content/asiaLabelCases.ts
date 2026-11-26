import type { Condition, ContentPack, DialogueNode, Hint, Objective } from '../domain/types';
import records from './asia-label-cases.json';
import story from './asia-label-cases-story.json';

export const LABEL_LOFT_ACCESS: Condition = { objective: 'island.finish' };
export const LABEL_LOFT_READY: Condition = { objective: 'asia.loft.compare' };
export const LABEL_LOFT_COPY = 'asia.loft.copy';
export const LABEL_LOFT_COPY_METHODS = story.dockCopy.methods;

export const LABEL_LOFT_CASES = records.map((record) => {
  const stem = `asia.loft.${record.slug}`;
  return {
    ...record, stem, source: `HIS-LOFT-${record.slug}`, exhibit: `OBJ-LOFT-${record.slug}`,
    card: `card.loft.${record.slug}`, objective: `${stem}.turned`,
    frontSeen: { flag: `${stem}.front`, eq: true } satisfies Condition,
    reverseSeen: { flag: `${stem}.reverse`, eq: true } satisfies Condition,
  };
});

type LabelCase = (typeof LABEL_LOFT_CASES)[number];

function proofFrom(method: string): Condition {
  return { any: LABEL_LOFT_CASES.filter((record) => record.method === method).map(({ objective }) => ({ objective })) };
}

const methods = [...new Set(LABEL_LOFT_CASES.map((record) => record.method))];
const compared: Condition = {
  any: methods.flatMap((first, index) =>
    methods.slice(index + 1).map((second) => ({ all: [proofFrom(first), proofFrom(second)] }))),
};

const copyDialogue: DialogueNode[] = [
  {
    id: LABEL_LOFT_COPY, speaker: 'label-loft-keeper', historicalLabel: 'fictional-world',
    text: story.dockCopy.draft,
    options: [
      ...LABEL_LOFT_COPY_METHODS.map(({ method, action }) => ({
        text: action, if: { all: [compared, proofFrom(method)] },
        effects: [{ setFlag: LABEL_LOFT_COPY, value: method }], next: `${LABEL_LOFT_COPY}.${method}`,
      })),
      { text: story.dockCopy.waiting, if: { not: compared } },
      { text: story.dockCopy.keep, if: compared },
    ],
  },
  ...LABEL_LOFT_COPY_METHODS.map(({ method, response }) => ({
    id: `${LABEL_LOFT_COPY}.${method}`, speaker: 'label-loft-keeper', historicalLabel: 'fictional-world' as const,
    text: response,
  })),
];

const allCases: Objective[] = LABEL_LOFT_CASES.map((record) => ({
  id: record.objective,
  title: `Turn both faces of the ${record.title} strip.`,
  visible: { card: record.card }, essential: false,
  done: { all: [{ card: record.card }, record.frontSeen, record.reverseSeen] },
  weave: {
    concepts: ['evidence', 'certainty', 'interpretation'],
    framework: ['scope', 'methods-and-tools'],
    atl: ['research', 'thinking'], aoks: ['HIS', 'ART'],
    subjects: ['history', 'visual-arts'],
    thinking: { dok: 2, bloom: 'apply', fink: 'application', solo: 'relational' }, minutes: 2,
  },
}));

function caseDialogue(record: LabelCase): DialogueNode[] {
  const reader = 'label-loft-keeper';
  return [
    {
      id: `${record.stem}.front`, speaker: reader,
      text: record.fact, historicalLabel: 'documented', claimKind: 'observation',
      citationSource: record.source,
      options: [{
        text: record.front, if: { card: record.card },
        effects: [{ setFlag: record.frontSeen.flag, value: true }],
        next: `${record.stem}.front.result`,
      }],
    },
    {
      id: `${record.stem}.front.result`, speaker: reader,
      text: record.frontResult, historicalLabel: 'fictional-world', claimKind: 'simulation',
    },
    {
      id: `${record.stem}.reverse`, speaker: reader,
      text: record.limit, historicalLabel: 'documented', claimKind: 'interpretation',
      citationSource: record.source,
      options: [{
        text: record.reverse, if: record.frontSeen,
        effects: [{ setFlag: record.reverseSeen.flag, value: true }],
        next: `${record.stem}.reverse.result`,
      }],
    },
    {
      id: `${record.stem}.reverse.result`, speaker: reader,
      text: record.reverseResult, historicalLabel: 'fictional-world', claimKind: 'simulation',
    },
  ];
}

function caseHints(record: LabelCase): Hint[] {
  return [
    `Find the display marked ${record.accession}.`,
    `Check the museum view for the ${record.title}, then stand by the strip at its right.`,
    record.front,
    `Once the strip turns, walk to its other face. ${record.reverse}`,
  ].map((text, index) => ({
    id: `h.${record.stem}.${index + 1}`, objective: record.objective,
    depth: (index + 1) as Hint['depth'], text,
  }));
}

type LoftContent = Pick<ContentPack, 'characters' | 'dialogue' | 'sources' | 'exhibits' | 'cards' | 'missions' | 'journal' | 'hints'>;

export const asiaLabelContent: LoftContent = {
  characters: story.characters as LoftContent['characters'],
  dialogue: [...story.dialogue as LoftContent['dialogue'], ...copyDialogue, ...LABEL_LOFT_CASES.flatMap(caseDialogue)],
  sources: LABEL_LOFT_CASES.map((record) => ({
    id: record.source, title: `${record.institution}, ${record.catalogueTitle}, ${record.accession}`,
    url: record.catalogue, locator: 'Collection entry and selected photograph',
    supports: record.fact, accessed: '2026-11-26',
    mla: { kind: 'artwork', title: record.catalogueTitle, container: record.institution, workDate: record.date },
  })),
  exhibits: LABEL_LOFT_CASES.map((record) => ({
    id: record.exhibit, name: record.title, art: 'collection-stand',
    historicalLabel: 'documented', dateText: record.date, dateKind: record.datedAs,
    summary: [record.context, `Materials recorded as ${record.material}.`, `${record.dimensions}.`, record.fact].join(' '),
    sources: [record.source], grantsCard: record.card, altText: record.alt,
    specimen: {
      key: `${record.namespace}:${record.accession.toLowerCase()}`, institution: record.institution,
      accession: record.accession, source: record.source, objective: record.objective, pixelAsset: record.image,
    },
  })),
  cards: LABEL_LOFT_CASES.map((record) => ({
    id: record.card, title: `${record.title} · ${record.accession}`,
    historicalLabel: 'documented', claimKind: 'observation',
    sources: [record.source], text: record.fact, limits: record.limit,
  })),
  missions: [{
    id: 'KG-CH14-R22', world: 'WORLD-15', title: 'A Slip for Both Berths',
    stake: 'Nellin has one shift to get the corrected trial figures to passing crews or show visitors how the two figures were obtained.',
    knowledgeQuestion: 'What should a record carry when it moves from the person who made it to the person who uses it?',
    available: LABEL_LOFT_ACCESS,
    caseVisits: LABEL_LOFT_CASES.map((entry) => [entry.objective,
      LABEL_LOFT_CASES.find(({ method }) => method !== entry.method)!.objective]),
    objectives: [
      {
        id: 'asia.loft.compare', title: 'Turn two kinds of case strip. Use one method to prepare the dock copy.',
        visible: { flag: 'asia.loft.entered', eq: true }, essential: false, done: { flagSet: LABEL_LOFT_COPY },
        weave: {
          concepts: ['evidence', 'objectivity', 'interpretation', 'explanation', 'certainty', 'culture'],
          framework: ['scope', 'methods-and-tools', 'perspectives'],
          atl: ['thinking', 'research'], aoks: ['HIS', 'ART', 'MAT'], subjects: ['history', 'visual-arts', 'math-ai'],
          thinking: { dok: 3, bloom: 'analyse', fink: 'integration', solo: 'relational' }, minutes: 5,
        },
      },
      {
        id: 'asia.loft.outcome', title: 'Open a reading bay and pin its copy to the Quiet Margin rack.',
        visible: LABEL_LOFT_READY, essential: false,
        done: { flag: 'asia.loft.published', in: ['rail', 'bench'] },
        weave: {
          concepts: ['responsibility', 'perspective', 'power', 'values', 'justification'],
          framework: ['perspectives', 'methods-and-tools', 'ethics'],
          atl: ['communication', 'social', 'thinking'], aoks: ['HUM', 'MAT'], subjects: ['design-tech', 'global-politics'],
          thinking: { dok: 3, bloom: 'evaluate', fink: 'caring', solo: 'relational' }, minutes: 4,
        },
      },
      ...allCases,
    ],
  }],
  journal: story.journal as LoftContent['journal'],
  hints: [...story.hints as LoftContent['hints'], ...LABEL_LOFT_CASES.flatMap(caseHints)],
};
