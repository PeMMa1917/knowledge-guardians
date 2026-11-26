import { WARM_FIXTURES, warmHandoff, warmReceipt, warmTrace } from '../domain/warmRoom';
import type { Condition, ContentPack, Hint, Objective } from '../domain/types';
import data from './warm-room-cases.json';

export const WARM_ROOM_OPEN: Condition = { flag: 'metal.arrived', eq: true };

export const WARM_CASES = data.map((record) => ({
  ...record, stem: `warm.${record.slug}`, exhibit: `OBJ-WARM-${record.slug}`,
  card: `card.warm.${record.slug}`, source: `HIS-WARM-${record.slug}`,
  objective: `warm.${record.slug}.collected`,
  revisit: {
    map: 'aethelgard.ferry', prop: `warm-ferry-${record.slug}`,
    method: `Fit a cold-crossing test for ${record.accession}`,
    hint: `Equip ${record.title} and try the padded service tray near the old ferry landing.`,
  },
}));
export type WarmCase = (typeof WARM_CASES)[number];

const objectives: Objective[] = WARM_CASES.map((record) => ({
  id: record.objective, title: `Try both supports for ${record.accession} and collect a service receipt.`,
  done: { all: [
    ...WARM_FIXTURES.map((fixture): Condition => ({ flag: warmTrace(record.stem, fixture), eq: true })),
    { flag: warmHandoff(record.stem), in: [...WARM_FIXTURES] },
    { flag: warmReceipt(record.stem), eq: true },
  ] },
  visible: { card: record.card }, essential: false,
  weave: {
    concepts: ['evidence', 'explanation', 'objectivity', 'justification', 'perspective', 'responsibility'],
    framework: ['scope', 'methods-and-tools', 'perspectives', 'ethics'],
    atl: ['thinking', 'research', 'communication'], aoks: ['NAT', 'TEC', 'HIS'],
    subjects: ['physics', 'design-tech', 'chemistry'],
    thinking: { dok: 3, bloom: 'analyse', fink: 'application', solo: 'relational' }, minutes: 4,
  },
  onComplete: [{ journal: `j.${record.stem}` }],
}));

function hints(record: WarmCase): Hint[] {
  const levels = [
    `Find ${record.accession} in the Warm Room off the Trade Hall.`,
    `Check the record’s ${record.feature}, then open its probe board.`,
    'Run three intervals on each support. Read the body probe and the brief contact strip separately.',
    'Post the counter service or the padded carrier. Read the receipt at the matching table, then collect the copy from the stand.',
  ];
  return ([1, 2, 3, 4] as const).map((depth) => ({
    id: `h.${record.stem}.${depth}`, objective: record.objective, depth, text: levels[depth - 1],
  }));
}

type WarmRoomContent = Pick<ContentPack, 'sources' | 'exhibits' | 'cards' | 'missions' | 'journal' | 'hints'>;

export const warmRoomContent: WarmRoomContent = {
  sources: WARM_CASES.map((record) => ({
    id: record.source, title: `${record.institution}, ${record.catalogueTitle}, ${record.accession}`,
    url: record.catalogue, locator: 'Object record and collection photograph', supports: record.fact, accessed: '2026-11-26',
    mla: { kind: 'artwork', title: record.catalogueTitle, container: record.institution, workDate: record.date },
  })),
  exhibits: WARM_CASES.map((record) => ({
    id: record.exhibit, name: record.title, art: 'collection-stand', historicalLabel: 'documented', altText: record.alt,
    dateText: record.date, dateKind: 'The museum’s date or date range for the object. Where given, design and making dates have separate meanings.',
    summary: [`${record.place}.`, record.fact, record.material, record.dimensions].filter(Boolean).join(' '),
    sources: [record.source], grantsCard: record.card,
    specimen: {
      key: record.key, institution: record.institution, accession: record.accession, source: record.source,
      objective: record.objective, pixelAsset: record.pixelAsset, revisit: record.revisit,
      people: record.people.map(({ name, role }) => ({ name, role, source: record.source, detail: record.fact })),
    },
  })),
  cards: WARM_CASES.map((record) => ({
    id: record.card, title: `${record.title} · ${record.accession}`, claimKind: 'observation', historicalLabel: 'documented',
    text: record.fact, limits: record.limit, sources: [record.source],
  })),
  missions: [{
    id: 'KG-CH6-R78', title: 'The Warm Side', world: 'WORLD-07', available: WARM_ROOM_OPEN,
    stake: 'The hall counter can serve straight away. The padded carrier takes longer to fit and can reach the side table.',
    knowledgeQuestion: 'What does a reading at one surface tell the reader about warmth somewhere else?',
    objectives, caseVisits: objectives.map(({ id }) => [id]),
  }],
  journal: WARM_CASES.map((record) => ({
    id: `j.${record.stem}`, claimKind: 'simulation',
    text: `We kept the body reading and the short contact trial for ${record.accession} on separate lines. ${record.limit}`,
  })),
  hints: WARM_CASES.flatMap(hints),
};
