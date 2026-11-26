import type { ContentPack, Hint, Objective } from '../domain/types';
import { JOINED_CLOTH_MAP, JOINED_CLOTH_PROP, JOINED_CLOTH_SOURCE } from '../domain/joinedCloth';
import { RELAY_CLIPS, RELAY_WEATHER } from '../domain/specimenRelay';
import records from './relay-specimens.json';

export const RELAY_GROUP = 'specimen-relay';
export const RELAY_CASES = records.map((record) => ({
  ...record,
  key: `relay.${record.slug}`,
  source: `HIS-${record.namespace}-${record.accession}`,
  exhibit: `OBJ-${record.namespace}-${record.accession}`,
  card: `card.relay.${record.slug}`,
  objective: `relay.${record.slug}.received`,
}));
export type RelayCase = (typeof RELAY_CASES)[number];

const objectives: Objective[] = RELAY_CASES.map((record) => ({
  id: record.objective,
  title: `Reunite the two clips for ${record.name}.`,
  visible: { card: record.card },
  essential: false,
  done: { all: [
    { card: record.card }, { flag: `${record.key}.checked`, eq: true },
    { any: RELAY_CLIPS.map((clip) => ({ all: [
      ...RELAY_WEATHER.map((weather) => ({ flag: `${record.key}.trial.${clip}.${weather}`, eq: true })),
      { any: [
        { flag: `${record.key}.sent`, eq: `trace-${clip}` },
        { all: [{ flag: `${record.key}.sent`, eq: `bell-${clip}` }, { flag: `${record.key}.callback`, eq: true }] },
      ] },
    ] })) },
  ] },
  onComplete: [{ journal: `j.${record.key}` }],
  weave: {
    concepts: ['evidence', 'interpretation', 'certainty', 'responsibility'],
    framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'],
    thinking: { dok: 3, bloom: 'evaluate', fink: 'integration', solo: 'relational' },
    atl: ['communication', 'thinking', 'research'],
    aoks: ['HIS', 'ART'],
    subjects: ['history', 'design-tech', 'visual-arts'],
    minutes: 4,
  },
}));

export const relayContent = {
  sources: RELAY_CASES.map((record) => ({
    id: record.source,
    title: `${record.institution}, ${record.title}, ${record.accession}`,
    url: record.catalogUrl,
    locator: 'Collection record, attribution, materials, dimensions, and date',
    supports: record.observation,
    accessed: '2026-11-26',
  })),
  exhibits: RELAY_CASES.map((record) => ({
    id: record.exhibit,
    name: record.name,
    historicalLabel: 'documented',
    art: 'preserved.catalogue',
    dateText: record.date,
    dateKind: record.date.startsWith('Cast')
      ? 'Making of this plaster cast. The represented form has its own history.'
      : 'Making of the object, with the qualification given in the catalogue.',
    summary: `${record.attribution}. ${record.place}. ${record.medium}. ${record.dimensions}. ${record.observation}`,
    altText: record.altText,
    sources: [record.source],
    grantsCard: record.card,
    specimen: {
      key: `${record.namespace.toLowerCase()}:${record.accession}`,
      accession: record.accession,
      institution: record.institution,
      source: record.source,
      objective: record.objective,
      pixelAsset: record.asset,
      ...(record.source === JOINED_CLOTH_SOURCE ? {
        revisit: { map: JOINED_CLOTH_MAP, prop: JOINED_CLOTH_PROP,
          method: 'Compare a shared beam and independent supports under the same model packet.',
          hint: 'Equip the working copy and find the two-panel test frame at the east end of Two-Tide Dock.' },
      } : {}),
    },
  })),
  cards: RELAY_CASES.map((record) => ({
    id: record.card,
    title: `${record.accession} · ${record.name}`,
    text: record.detail,
    historicalLabel: 'documented',
    claimKind: 'observation',
    sources: [record.source],
    limits: record.date.startsWith('Cast')
      ? 'These details describe the accessioned cast. They cannot date the object it represents.'
      : 'These details describe this accession. Keep the place, date qualifier and other dimensions with its own record.',
  })),
  missions: [{
    id: 'KG-CH8-R21', world: 'WORLD-09', title: 'One Clip Before the Bell',
    stake: 'Sora can start from one clip before the harbour bell. Renna can keep the full record together at Lantern House after the bell.',
    knowledgeQuestion: 'What can someone do safely with the first part of an interrupted message?',
    available: { objective: 'sea.arrival' },
    objectives,
    caseVisits: objectives.map(({ id }) => [id]),
  }],
  journal: RELAY_CASES.map((record) => ({
    id: `j.${record.key}`, claimKind: 'observation',
    text: record.creditClip?.journal ?? `I tested a clear run and a gust before visiting the receiving table. I tied the detail back to ${record.institution} record ${record.accession}, ${record.name}.`,
  })),
  hints: RELAY_CASES.flatMap((record) => [
    'The two clips give the receiver different ways to start.',
    `Read ${record.accession} in the Lantern House relay room before touching its cord.`,
    'Thread one clip first. Run still air and a gust with the same order and see which catch closes.',
    'Ring the harbour bell for a first clip that can be checked with a callback, or send both clips to Renna’s late tray.',
  ].map((text, index) => ({ id: `h.${record.key}.${index + 1}`, objective: record.objective, depth: (index + 1) as Hint['depth'], text }))),
} satisfies Partial<ContentPack>;
