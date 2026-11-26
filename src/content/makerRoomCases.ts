import { benchPacket, CONSTRUCTIONS, readFlag, receivedFlag, routeFlag, WORKBENCH_BANDS, type MakerKind, type MakerRoute } from '../domain/makerRoom';
import type { Condition, ContentPack, Hint, Objective } from '../domain/types';
import records from './maker-room-cases.json';
import exact from './maker-room-exact.json';

export const MAKER_ROOM_OPEN: Condition = { flag: 'nile.returned', eq: true };
const INSTITUTION = 'Cleveland Museum of Art';
const ROUTES = ['quay', 'walk'] as const;

export const MAKER_CASES = records.map((record) => {
  const stem = `makers.${record.slug}`;
  return {
    ...record, kind: record.kind as MakerKind, stem, card: `card.${stem}`, exhibit: `OBJ-MAKER-${record.slug}`,
    source: `HIS-MAKER-${record.slug}`, sent: `${stem}.sent`, done: `${stem}.received`,
  };
});
export type MakerCase = (typeof MAKER_CASES)[number];

type MakerContent = Pick<ContentPack, 'sources' | 'cards' | 'exhibits' | 'missions' | 'hints' | 'journal'>;
export const makerExactContent = exact as MakerContent;

const initialObjectives: Objective[] = MAKER_CASES.map((record) => ({
  id: record.sent, title: `Compare two work methods for ${record.title}.`,
  visible: { card: record.card }, essential: false,
  done: {
    any: WORKBENCH_BANDS.map((cut) => ({ all: [
      ...CONSTRUCTIONS.map((build): Condition => ({ flag: readFlag(record.stem, build, cut), eq: true })),
      { flag: routeFlag(record.stem), in: ROUTES.map((route) => benchPacket(route, cut)) },
    ] })),
  },
  weave: {
    concepts: ['objectivity', 'evidence', 'interpretation', 'explanation', 'certainty', 'culture'],
    framework: ['methods-and-tools', 'scope', 'perspectives'], aoks: ['HIS', 'ART', 'TEC'],
    subjects: ['history', 'visual-arts', 'design-tech'], atl: ['research', 'thinking'],
    thinking: { dok: 3, bloom: 'analyse', fink: 'application', solo: 'relational' }, minutes: 4,
  },
}));

const laterObjectives: Objective[] = MAKER_CASES.map((record) => ({
  id: record.done, title: `Follow the checked copy of ${record.title} to its reader.`,
  visible: { objective: record.sent }, essential: false,
  done: {
    all: [{ objective: record.sent }, {
      any: ROUTES.flatMap((route) => WORKBENCH_BANDS.map((cut) => {
        const packet = benchPacket(route, cut);
        return { all: [{ flag: routeFlag(record.stem), eq: packet }, { flag: receivedFlag(record.stem), eq: packet }] };
      })),
    }],
  },
  onComplete: [{ journal: `j.${record.stem}` }],
  weave: {
    concepts: ['justification', 'perspective', 'responsibility', 'values', 'power'],
    framework: ['scope', 'perspectives', 'ethics'], aoks: ['ART', 'HUM'], subjects: ['visual-arts', 'design-tech'],
    atl: ['communication', 'social'], thinking: { dok: 3, bloom: 'evaluate', fink: 'caring', solo: 'relational' }, minutes: 3,
  },
}));

export function makerReceiver(route: MakerRoute): Condition {
  return {
    any: [
      ...MAKER_CASES.map(({ stem }): Condition => ({
        flag: routeFlag(stem), in: WORKBENCH_BANDS.map((cut) => benchPacket(route, cut)),
      })),
      ...['jiahu','disk','laguna'].map((slug): Condition => ({ flag: `makers.exact.${slug}.route`, eq: route })),
    ],
  };
}

export function makerReceiverUsed(route: MakerRoute): Condition {
  return {
    any: [
      ...MAKER_CASES.flatMap(({ stem }) => WORKBENCH_BANDS.map((cut): Condition => {
        const packet = benchPacket(route, cut);
        return { all: [{ flag: routeFlag(stem), eq: packet }, { flag: receivedFlag(stem), eq: packet }] };
      })),
      ...['jiahu','disk','laguna'].map((slug): Condition => ({
        all: [{ flag: `makers.exact.${slug}.route`, eq: route }, { flag: `makers.exact.${slug}.display`, eq: route }],
      })),
    ],
  };
}

function hintsFor(record: MakerCase): Hint[] {
  const steps = [
    [`Read the exhibit for ${record.accession} in the Makers’ Room.`,
      `Find the practice band for ${record.feature} on its bench.`,
      'Set the two builds at the same band and look below each face.',
      'Choose whether to carry the front pattern or the checked section. The other parts remain on file.'],
    ['The packet goes to the Archive of Voices when you can cross.',
      'The front pattern goes to Lamp Quay. The checked section goes to the Glass Walk.',
      'At the destination, use the copy to set the reader’s practice board.',
      `Mount both parts of the receipt for ${record.accession}. Keep the outcome with its collection source.`],
  ];
  return [record.sent, record.done].flatMap((objective, i) => ([1, 2, 3, 4] as const).map((depth) => ({
    id: `h.${objective}.${depth}`, objective, depth, text: steps[i][depth - 1],
  })));
}

export const makerRoomContent: MakerContent = {
  sources: MAKER_CASES.map((record) => ({
    id: record.source, title: `${INSTITUTION}, ${record.collectionTitle}, ${record.accession}`,
    url: record.catalogue, locator: 'Object record, dates, materials and photograph', supports: record.fact, accessed: '2026-11-26',
    mla: { kind: 'artwork', title: record.collectionTitle, container: INSTITUTION, workDate: record.date },
  })),
  exhibits: MAKER_CASES.map((record) => ({
    id: record.exhibit, name: record.title, art: 'collection-stand', historicalLabel: 'documented',
    dateText: record.date, dateKind: 'Date or period of making attributed to the accession in the collection record',
    summary: [record.place + '.', record.fact, record.dimensions].filter(Boolean).join(' '),
    sources: [record.source], grantsCard: record.card, altText: record.alt,
    specimen: {
      key: `cma:${record.accession}`, institution: INSTITUTION, accession: record.accession,
      source: record.source, objective: record.done, pixelAsset: record.image,
    },
  })),
  cards: MAKER_CASES.map((record) => ({
    id: record.card, title: `${record.title} · ${record.accession}`, historicalLabel: 'documented', claimKind: 'observation',
    sources: [record.source], text: record.fact, limits: record.limit,
  })),
  missions: [
    {
      id: 'KG-CH2-R45', world: 'WORLD-03', title: 'A Turn at the Workbench', available: MAKER_ROOM_OPEN,
      knowledgeQuestion: 'When are two kinds of work distinguishable from the marks they leave?',
      stake: 'A work crew wants a quick pattern. Someone at the archive will want to repeat how a piece is joined.',
      objectives: initialObjectives, caseVisits: initialObjectives.map(({ id }) => [id]),
    },
    {
      id: 'KG-CH13-R48', world: 'WORLD-14', title: 'What the Receiver Can Repeat',
      available: { all: [{ objective: 'voices.arrival' }, { any: initialObjectives.map(({ id }) => ({ objective: id })) }] },
      knowledgeQuestion: 'What can a reader reproduce from a surface record and what requires an independent check?',
      objectives: laterObjectives, caseVisits: laterObjectives.map(({ id }) => [id]),
    },
  ],
  hints: MAKER_CASES.flatMap(hintsFor),
  journal: MAKER_CASES.map((record) => ({
    id: `j.${record.stem}`, claimKind: 'observation',
    text: `The workbench gave me two ways to make a stand-in for the ${record.feature}. I left the tested mark with the source for ${record.accession}. ${record.limit}`,
  })),
};
