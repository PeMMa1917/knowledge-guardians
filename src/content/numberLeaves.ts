import type { Condition, ContentPack, Hint, Objective } from '../domain/types';
import authored from './number-leaves.json';

export const NUMBER_LEAF_GROUP = 'number-leaves';
export const NUMBER_LEAF_ACCESS: Condition = { objective: 'm01.o2.inspect' };
const returns = {
  ishango: { map: 'nexus.archive', prop: 'number-leaf-return-ishango', method: 'See the groups behind the runner’s sum.', hint: 'Bring the bone to the number slip in the Archive Hall.' },
  plimpton: { map: 'nexus.archive', prop: 'number-leaf-return-plimpton', method: 'Test the square behind the workshop’s frame.', hint: 'Bring the tablet to the old frame beside the east collection wall.' },
  bakhshali: { map: 'nexus.archive', prop: 'number-leaf-return-bakhshali', method: 'Reveal the empty place in a crowded receipt.', hint: 'Bring the manuscript to the receipt slots by the catalogue passage.' },
};
export const NUMBER_LEAVES = authored.map((entry) => ({ ...entry, exhibit: `OBJ-NUMBER-LEAF-${entry.slug}`,
  card: `card.number-leaf.${entry.slug}`, flag: `number-leaf.${entry.slug}`, source: `HIS-NUMBER-LEAF-${entry.slug}`,
  objective: `number-leaf.${entry.slug}.filed`, revisit: returns[entry.slug as keyof typeof returns],
}));
export type NumberLeaf = typeof NUMBER_LEAVES[number];
export const NUMBER_LEAF_ROUTES = ['method', 'context'] as const;
export type NumberLeafRoute = typeof NUMBER_LEAF_ROUTES[number];

const challenges: Record<string, [string, string]> = {
  ishango: ['Line up the paired notch counts.', 'Count the same six groups without the joins.'],
  plimpton: ['Balance the square areas for the small frame.', 'Repeat the area check for the longer frame.'],
  bakhshali: ['Fit the spare mark between the two digits.', 'Set a separate date tab against the three samples of birch bark.'],
};
const objectives: Objective[] = NUMBER_LEAVES.map((entry) => ({
  id: entry.objective, title: `Give a reader the checked slip for ${entry.accession}.`, essential: false,
  visible: { card: entry.card },
  done: { all: [{ card: entry.card }, { flag: `${entry.flag}.trial.a`, eq: true }, { flag: `${entry.flag}.trial.b`, eq: true },
    { any: NUMBER_LEAF_ROUTES.map((route) => ({ all: [
      { flag: `${entry.flag}.sent`, eq: route }, { flag: `${entry.flag}.filed`, eq: route },
    ] })) }] },
  weave: { concepts: ['evidence', 'interpretation', 'certainty', 'explanation', 'justification', 'perspective', 'culture', 'responsibility'],
    framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'],
    thinking: { dok: 2, bloom: 'analyse', fink: 'integration', solo: 'relational' }, atl: ['thinking', 'communication', 'research'],
    aoks: ['MAT', 'HIS'], subjects: ['math-aa', 'math-ai', 'history'], minutes: 4 },
  onComplete: [{ journal: `j.${entry.objective}` }],
}));

const nextGoal: Objective = { id: 'number-leaf.market.used', title: 'Check where the Market uses the reference.', essential: false,
  visible: { any: NUMBER_LEAVES.map(({ objective }) => ({ objective })) }, done: { flagSet: 'number-leaf.market.used' },
  weave: { concepts: ['values', 'responsibility', 'explanation', 'power', 'evidence'], framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'],
    thinking: { dok: 3, bloom: 'apply', fink: 'integration', solo: 'extended' }, atl: ['social', 'research', 'communication'],
    aoks: ['MAT', 'HUM', 'HIS'], subjects: ['math-ai', 'economics', 'history'], minutes: 3 },
  onComplete: [{ journal: 'j.number-leaf.market' }],
};

const BARK_DEBATE = 'HIS-NUMBER-LEAF-bark-context';
const PLIMPTON_CONTEXT = 'HIS-NUMBER-LEAF-plimpton-context';
function sourceLinks(record: NumberLeaf) {
  return record.slug === 'bakhshali' ? [record.source, BARK_DEBATE]
    : record.slug === 'plimpton' ? [record.source, PLIMPTON_CONTEXT] : [record.source];
}

export const numberLeafContent = {
  characters: [
    { id: 'number-leaf-lella', name: 'Lella Sorn', role: 'Teaches new runners on the low practice boards', mode: 'fictional',
      sprite: 'villager-2', talk: [{ node: 'number-leaf.lella' }] },
    { id: 'number-leaf-omrin', name: 'Omrin Fenn', role: 'Keeps the finding desk and its corrections', mode: 'fictional',
      sprite: 'villager-1', talk: [{ node: 'number-leaf.omrin' }] },
  ],
  dialogue: [
    { id: 'number-leaf.lella', speaker: 'number-leaf-lella', historicalLabel: 'fictional-world',
      text: 'One runner copied my total without the bags that gave it meaning. We caught it before the handoff. Try your marks on the board before I put another copy in their hands.' },
    { id: 'number-leaf.omrin', speaker: 'number-leaf-omrin', historicalLabel: 'fictional-world',
      text: 'Readers ask for the first page, the first use and sometimes the first thought. Give me one thing you can name. I can leave space on the slip for the rest.' },
  ],
  sources: [...NUMBER_LEAVES.map((entry) => ({ id: entry.source, title: `${entry.institution}, ${entry.title}`,
    url: entry.url, locator: 'Object identification, place, dates and description', supports: entry.observation, accessed: '2026-11-26',
  })), { id: PLIMPTON_CONTEXT, title: 'Columbia University Libraries, interpreting Plimpton 322',
      url: 'https://online-exhibitions.library.columbia.edu/exhibits/show/jewels/themes/science/158', locator: 'Exhibit 158 commentary',
      supports: 'Columbia discusses a mathematical reading of the entries and Eleanor Robson’s proposed pedagogical context.', accessed: '2026-11-26' },
    { id: BARK_DEBATE, title: 'Plofker and colleagues, a response to the Bakhshali dating', url: 'https://doi.org/10.18732/H2XT07',
      locator: 'History of Science in South Asia, volume 5, pages 134–150',
      supports: 'Several historians of mathematics question how the three sample dates should be used to date the writing and the manuscript.', accessed: '2026-11-26' },
  ],
  cards: NUMBER_LEAVES.map((entry) => ({ id: entry.card, title: `${entry.accession} · the marks and their limits`, historicalLabel: 'documented',
    claimKind: 'observation', sources: sourceLinks(entry), text: entry.observation, limits: entry.limit })),
  exhibits: NUMBER_LEAVES.map((entry) => ({ id: entry.exhibit, name: entry.title, historicalLabel: 'documented', art: entry.art,
    dateText: entry.date, dateKind: entry.dateKind, summary: entry.observation, altText: entry.alt,
    sources: sourceLinks(entry), grantsCard: entry.card,
    specimen: { key: entry.key, institution: entry.institution, accession: entry.accession, source: entry.source, objective: entry.objective, revisit: entry.revisit },
  })),
  missions: [{ id: 'KG-CH1-R37', world: 'WORLD-01', available: NUMBER_LEAF_ACCESS, title: 'The Ledger with No Name',
    knowledgeQuestion: 'What can we find out from a mark when its maker left no instructions?',
    stake: 'The runners are in a hurry for a method they can repeat. The desk needs a finding slip that leaves uncertainties where the next reader can see them.',
    objectives, caseVisits: objectives.map(({ id }) => [id]),
  }, { id: 'KG-CH10-R31', world: 'WORLD-11', available: { flag: 'market.arrived', eq: true },
    title: 'The Market Borrows a Reference', knowledgeQuestion: 'How far can we carry a checked method into a different task?',
    stake: 'The market wants people to be able to run the check again and see what the source actually records.', objectives: [nextGoal],
  }],
  journal: [...NUMBER_LEAVES.map((entry) => ({ id: `j.${entry.objective}`, claimKind: 'observation' as const,
    text: `I tried two checks beside ${entry.accession}. The reader used our slip and left a way back to the exact object.` })),
    { id: 'j.number-leaf.market', claimKind: 'simulation', text: 'I watched the market use the checked method or the limited source note. I kept the specimen’s own number where a reader could look it up again.' }],
  hints: [...NUMBER_LEAVES.flatMap((entry) => [
    'Keep the mark and the use it might have had on different lines.',
    `Open the case for ${entry.accession} and go to its practice board.`,
    ...challenges[entry.slug],
  ].map((text, i) => ({ id: `h.${entry.objective}.${i + 1}`, objective: entry.objective, depth: (i + 1) as Hint['depth'],
    text: i === 3 ? `${text} Take the copy to the guide rack or the finding desk.` : text }))), ...[
    'A market reader wants to reuse a check from the Nexus.',
    'Try a case in the ledger room. Give its slip to the matched reader, then visit the Lantern Square market.',
    'Find the numbered-reference clip near the waystone. Decide whether the market needs the short method or a fuller source note first.',
    'Select the carrying position for a check you have finished. The next reader will find the method and source where you leave them.',
  ].map((text, i) => ({ id: `h.${nextGoal.id}.${i + 1}`, objective: nextGoal.id, depth: (i + 1) as Hint['depth'], text }))],
} satisfies Partial<ContentPack>;
