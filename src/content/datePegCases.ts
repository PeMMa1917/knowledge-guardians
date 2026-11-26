import { datePegs, pegWindow, pegYear, sharedWindow } from '../domain/datePeg';
import type { Condition, ContentPack, DialogueNode, Hint, Objective } from '../domain/types';
import pairs from './date-peg-specimens.json';

export const DATE_PEG_GROUP = 'date-peg';
export const DATE_PEG_MARKET = 'market';
export const DATE_PEG_DOCK = 'dock';
export const DATE_PEG_MISSION = 'KG-CH8-R19';
export type DatePegRoute = typeof DATE_PEG_MARKET | typeof DATE_PEG_DOCK;
const INSTITUTION = 'The Cleveland Museum of Art';
const ANNEX_OPEN: Condition = { objective: 'sea.finish' };

export const DATE_PEG_CASES = pairs.map(({ slug, objects, ...caseInfo }) => {
  const docs = objects.map((record) => ({
    ...record,
    exhibit: `OBJ-DATE-CMA-${record.accession}`,
    source: `HIS-DATE-CMA-${record.accession}`,
    card: `card.date-peg.cma.${record.accession}`,
  }));
  const flag = `date-peg.${slug}`;
  return {
    ...caseInfo, slug, docs, flag, pegs: datePegs(docs[0], docs[1]),
    common: sharedWindow(docs[0], docs[1]),
    objective: `${flag}.filed`, item: `item.${flag}.proof`,
    nodes: { board: `${flag}.set-board`, market: `${flag}.market`, dock: `${flag}.dock` },
  };
});
export type DatePegCase = (typeof DATE_PEG_CASES)[number];

export function datePegStation(station: string): DatePegCase | DatePegRoute | undefined {
  if (station === DATE_PEG_MARKET || station === DATE_PEG_DOCK) return station;
  return DATE_PEG_CASES.find(({ slug }) => slug === station);
}

/** The dialogue effects called by the buttons in a physical date-peg station. */
export function datePegEntries(game: string): string[] {
  const prefix = `${DATE_PEG_GROUP}:`;
  if (!game.startsWith(prefix)) return [];
  const station = datePegStation(game.slice(prefix.length));
  if (typeof station === 'string') return DATE_PEG_CASES.map(({ nodes }) => nodes[station]);
  return station ? [station.nodes.board] : [];
}

export function datePegRecords(record: DatePegCase): Condition {
  return { all: record.docs.map(({ card }) => ({ card })) };
}

function routeReady(record: DatePegCase): Condition {
  return {
    all: [
      datePegRecords(record),
      { flag: `${record.flag}.tried.0`, eq: true },
      { flag: `${record.flag}.tried.1`, eq: true },
      { not: { flagSet: `${record.flag}.route` } },
    ],
  };
}

export function datePegProof(record: DatePegCase, route: DatePegRoute): Condition {
  return { all: [{ item: record.item }, { flag: `${record.flag}.route`, eq: route }] };
}

const datePegOptions = (record: DatePegCase): DialogueNode[] => [
  {
    id: record.nodes.board, speaker: 'narrator', historicalLabel: 'fictional-world',
    text: 'Two tracks and a shared peg are cut into this bench. The narrow slot holds one guide. The wide slot can hold two records together.',
    options: [
      ...record.pegs.map((year, index) => ({
        text: `Move the brass peg to ${pegYear(year)}.`,
        if: datePegRecords(record),
        effects: [{ setFlag: `${record.flag}.tried.${index}`, value: true }, { setFlag: `${record.flag}.year`, value: year }],
      })),
      {
        text: 'Take the wide dated guide to the market bench.', if: routeReady(record),
        effects: [{ setFlag: `${record.flag}.route`, value: DATE_PEG_MARKET }, { giveItem: record.item }],
      },
      {
        text: 'Take the pocket source guide to the dock roll.', if: routeReady(record),
        effects: [{ setFlag: `${record.flag}.route`, value: DATE_PEG_DOCK }, { giveItem: record.item }],
      },
    ],
  },
  ...([DATE_PEG_MARKET, DATE_PEG_DOCK] as const).map((route): DialogueNode => ({
    id: record.nodes[route], speaker: route === DATE_PEG_MARKET ? 'peg-reader-irven' : 'peg-receiver-mireth',
    text: route === DATE_PEG_MARKET ? record.marketReply : record.dockReply,
    historicalLabel: 'fictional-world',
    options: [{
      text: route === DATE_PEG_MARKET ? 'Pass the checked dates to Irven.' : 'Slip the dated copy into Mireth’s roll.',
      if: datePegProof(record, route),
      effects: [{ takeItem: record.item }, { setFlag: `${record.flag}.received`, value: route }],
    }],
  })),
];

const objectives: Objective[] = DATE_PEG_CASES.map((record) => ({
  id: record.objective, title: `Bring the checked dates for ${record.title.toLowerCase()} to a reader.`,
  visible: { any: record.docs.map(({ card }) => ({ card })) }, essential: false,
  done: { flagSet: `${record.flag}.received` }, onComplete: [{ journal: `j.${record.objective}` }],
  weave: {
    concepts: ['evidence', 'certainty', 'explanation', 'responsibility'],
    framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'],
    thinking: { dok: 2, bloom: 'apply', fink: 'human', solo: 'relational' },
    atl: ['thinking', 'communication', 'research'], aoks: ['HIS', 'MAT', 'ART'],
    subjects: ['history', 'visual-arts', 'math-ai'], minutes: 4,
  },
}));

export const datePegContent = {
  characters: [
    { id: 'peg-reader-irven', name: 'Irven Doss', role: 'Keeps the Seagrass Steps market bench', sprite: 'villager-1',
      mode: 'fictional', talk: [{ node: 'date-peg.irven' }] },
    { id: 'peg-receiver-mireth', name: 'Mireth Teve', role: 'Keeps the covered dock roll', sprite: 'villager-2',
      mode: 'fictional', talk: [{ node: 'date-peg.mireth' }] },
  ],
  dialogue: [
    {
      id: 'date-peg.irven', speaker: 'peg-reader-irven', historicalLabel: 'fictional-world',
      text: 'I can make room for two date lines. I want visitors to look between them without taking up the plank where the fish baskets turn.'
    },
    {
      id: 'date-peg.mireth', speaker: 'peg-receiver-mireth', historicalLabel: 'fictional-world',
      text: 'Salt gets into everything. My sleeve only keeps one sheet dry at a time. Mark the source on both sides, please.'
    },
    ...DATE_PEG_CASES.flatMap(datePegOptions),
  ],
  sources: DATE_PEG_CASES.flatMap(({ docs }) => docs.map((record) => ({
    id: record.source, title: `${INSTITUTION}, ${record.title}, ${record.accession}`, url: record.record,
    locator: `Collection image, object facts and dates. The collection API lists the inclusive search limits (${pegWindow(record)}).`,
    supports: record.observed, accessed: '2026-11-26',
  }))),
  exhibits: DATE_PEG_CASES.flatMap(({ docs, objective }) => docs.map((record) => ({
    id: record.exhibit, name: record.title, historicalLabel: 'documented', art: 'preserved.folder',
    dateText: record.date, dateKind: 'Date of making as given by the collection',
    summary: `${record.origin}. ${record.material}. ${record.measurements} ${record.observed}`,
    altText: `A pixel view of ${record.alt}.`, sources: [record.source], grantsCard: record.card,
    specimen: {
      key: `cma:${record.accession}`, institution: INSTITUTION, accession: record.accession,
      source: record.source, objective, pixelAsset: record.asset,
    },
  }))),
  cards: DATE_PEG_CASES.flatMap(({ docs }) => docs.map((record) => ({
    id: record.card, title: `${record.accession} · ${record.title}`,
    text: `${record.observed} The catalogue gives ${record.date}.`, limits: record.limit,
    claimKind: 'observation', historicalLabel: 'documented', sources: [record.source],
  }))),
  items: DATE_PEG_CASES.map((record) => ({
    id: record.item, name: `Dated guide · ${record.title}`,
    description: `A checked Lantern House guide, signed with ${record.docs.map(({ accession }) => accession).join(' and ')}. The print and its source numbers travel together.`,
    historicalLabel: 'fictional-world', art: 'fold.paired',
  })),
  missions: [{
    id: DATE_PEG_MISSION, title: 'Two Dates at a Peg', world: 'WORLD-09', available: ANNEX_OPEN,
    stake: 'Two harbour readers are waiting for the dates behind their borrowed pictures. A single year will fit the peg. The records can tell us more.',
    knowledgeQuestion: 'What survives when we reduce an uncertain date to a single year?', objectives,
    caseVisits: objectives.map(({ id }) => [id]),
  }],
  journal: DATE_PEG_CASES.map((record) => ({
    id: `j.${record.objective}`, claimKind: 'observation',
    text: `I tried two positions on the date peg for ${record.docs.map(({ accession }) => accession).join(' and ')}. The signed guide kept the two records distinct when I passed it to a reader.`,
  })),
  hints: DATE_PEG_CASES.flatMap((record) => [
    'The stamp dates a catalogue piece. Keep the date with its source number.',
    'Inspect both collection pieces beside one date bench in the Lantern House annex.',
    'Move the brass peg to two different years and see which date strips cross it.',
    'Take the wide guide to Irven at the market bench, or bring the pocket guide to Mireth at the dock roll.',
  ].map((text, index) => ({ id: `h.${record.flag}.${index + 1}`, objective: record.objective, depth: (index + 1) as Hint['depth'], text }))),
} satisfies Partial<ContentPack>;
