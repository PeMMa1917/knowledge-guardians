import type { Condition, ContentPack, Hint, Objective } from '../domain/types';
import objects from './model-records.json';

export const MODEL_RECORD_GROUP = 'model-record';
export const MODEL_RECORD_OPEN: Condition = { objective: 'island.arrival' };
export const MODEL_RECORDS = objects.map((record) => ({ ...record,
  flag: `model-record.${record.slug}`, objective: `model-record.${record.slug}.handed`,
  exhibit: `OBJ-MODEL-RECORD-${record.slug}`, card: `card.model-record.${record.slug}`, sourceId: `HIS-MODEL-RECORD-${record.slug}`,
  actor: `model-record-maker-${record.slug}`,
}));
export type ModelRecord = typeof MODEL_RECORDS[number];
export const MODEL_DESTINATIONS = ['near', 'study'] as const;
export type ModelDestination = typeof MODEL_DESTINATIONS[number];

const objectives: Objective[] = MODEL_RECORDS.map((record) => ({
  id: record.objective, title: `Hand over a checked model for ${record.accession}.`, essential: false,
  visible: { card: record.card },
  done: { all: [{ card: record.card }, { flag: `${record.flag}.trial.0`, eq: true }, { flag: `${record.flag}.trial.1`, eq: true },
    { any: MODEL_DESTINATIONS.map((route) => ({ all: [{ flag: `${record.flag}.send`, eq: route }, { flag: `${record.flag}.received`, eq: route }] })) }] },
  onComplete: [{ journal: `j.${record.objective}` }],
  weave: { concepts: ['evidence', 'explanation', 'interpretation', 'perspective', 'objectivity', 'values', 'responsibility'],
    atl: ['thinking', 'research', 'communication'], aoks: record.slug === 'moniac' ? ['MAT', 'HUM', 'TEC']
      : record.slug === 'theseus' ? ['MAT', 'NAT', 'TEC'] : ['MAT', 'ART', 'HIS'],
    subjects: record.slug === 'moniac' ? ['math-ai', 'economics', 'design-tech']
      : record.slug === 'theseus' ? ['computer-science', 'design-tech', 'physics'] : ['math-aa', 'visual-arts', 'history'],
    framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'],
    thinking: { dok: 3, bloom: 'analyse', fink: 'integration', solo: 'relational' }, minutes: 4 },
}));

export const BETTY_SHANNON = 'model-record-maker-betty-shannon';

export const modelRecordsContent = {
  characters: [...MODEL_RECORDS.map((record) => ({ id: record.actor, name: record.maker, role: record.role, sprite: 'villager-1',
    mode: 'historical' as const, talk: [{ node: `${record.flag}.maker` }] })),
    { id: BETTY_SHANNON, name: 'Betty Shannon', role: 'Bell Labs technician and maze circuit builder', sprite: 'villager-2',
      mode: 'historical', talk: [{ node: 'model-record.theseus.wiring' }] }],
  dialogue: [...MODEL_RECORDS.map((record) => ({ id: `${record.flag}.maker`, speaker: record.actor, historicalLabel: 'reconstruction' as const, text: record.line })),
    { id: 'model-record.theseus.wiring', speaker: BETTY_SHANNON, historicalLabel: 'reconstruction',
      text: 'The boards on top set the problem. Follow my wiring below and you can see where a turn gets saved. Give the next repairer a way to tell those two jobs apart.' }],
  sources: MODEL_RECORDS.map((record) => ({ id: record.sourceId, title: `${record.institution}, ${record.title}`, url: record.source,
    locator: record.manufacturer ? 'Catalogue creation fields for maker, inventor, place and date. Teaching use in the public description.'
      : 'Museum object entry, named maker, acquisition identifier, materials and date',
    supports: record.about, accessed: '2026-11-26',
    mla: { kind: 'artwork' as const, title: record.title, container: record.institution, workDate: record.date.split(' · ')[0] } })),
  cards: MODEL_RECORDS.map((record) => ({ id: record.card, title: `${record.accession} · ${record.title}`, historicalLabel: 'documented',
    claimKind: 'observation', sources: [record.sourceId], text: record.about, limits: record.limit })),
  exhibits: MODEL_RECORDS.map((record) => ({ id: record.exhibit, name: record.title, art: record.art, historicalLabel: 'documented',
    dateKind: record.dateKind, dateText: record.date, summary: record.about, sources: [record.sourceId], grantsCard: record.card,
    altText: record.slug === 'moniac' ? 'Original pixel drawing of a tall reservoir model with three glass-coloured tanks, narrow routes and a wooden support frame.'
      : record.slug === 'theseus' ? 'Original pixel drawing of a square maze board with low partitions, a small magnetically moved mouse and a housing below the board.'
      : 'Original pixel drawing of a long open box with three flat, narrow compartments and separate plain wood outlines.',
    specimen: { key: record.key, accession: record.accession, institution: record.institution, source: record.sourceId,
      objective: record.objective, revisit: record.revisit,
      people: [{ name: record.maker, role: record.role, detail: record.about, source: record.sourceId },
        ...(record.manufacturer ? [{ name: record.manufacturer, role: 'Maker',
          detail: 'The collection’s making record names the company and gives London and 1949.', source: record.sourceId }] : []),
        ...(record.slug === 'theseus' ? [{ name: 'Mary Elizabeth “Betty” Moore Shannon', role: 'Bell Labs technician and maze circuit builder',
          detail: 'The MIT Museum credits her with most of the wiring for the maze circuit, which was built at the Shannons’ home.', source: record.sourceId }] : [])] },
  })),
  missions: [{ id: 'KG-CH14-R23', world: 'WORLD-15', title: 'What the Model Keeps', available: MODEL_RECORD_OPEN,
    stake: 'The next reader needs a working test and its boundary before using it to make a different decision.',
    knowledgeQuestion: 'What result survives when we change how a model represents it?', objectives,
    caseVisits: objectives.map(({ id }) => [id]),
  }],
  journal: MODEL_RECORDS.map((record) => ({ id: `j.${record.objective}`, claimKind: 'simulation',
    text: `I ran both model trials beside ${record.accession}. I left one reader a usable copy and kept the trace of what each trial held steady.` })),
  hints: MODEL_RECORDS.flatMap((record) => ['Open the exact collection case first.',
    `Use the two controls beside ${record.accession}. Notice what both trials keep the same.`,
    'Send a copy to the scale or the study table. Each reader needs something different from it.',
    'Finish both trials, choose a destination, visit its stand in the Plan Workshop and hand over the model guide.',
  ].map((text, i) => ({ id: `h.${record.objective}.${i + 1}`, objective: record.objective, depth: (i + 1) as Hint['depth'], text }))),
} satisfies Partial<ContentPack>;
