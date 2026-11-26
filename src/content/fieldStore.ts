import { specimenEquipped } from '../domain/specimenGear';
import type { Condition, ContentPack, DialogueNode, Hint, Objective, Weave } from '../domain/types';
import records from './field-store-specimens.json';

export const FIELD_STORE_OPEN: Condition = { objective: 'water.arrival' };
export const FIELD_STORE_LAST = 'field-store.last-visit';
const ORDER = 'field-store.current';
const AVEN = 'field-store-aven';
type Route = 'time' | 'place';

export const FIELD_STORE_CASES = records.map((entry) => ({
  ...entry,
  flag: `field-store.${entry.slug}`,
  objective: `field-store.${entry.slug}.tested`,
  exhibit: `OBJ-FIELD-STORE-${entry.slug.toUpperCase()}`,
  source: `HIS-FIELD-STORE-${entry.slug.toUpperCase()}`,
  card: `card.field-store.${entry.slug}`,
  asset: `specimens/field-${entry.slug}.jpg`,
  revisit: {
    map: 'observatory.inland',
    prop: `field-store-fold-${entry.slug}`,
    method: entry.revisitAction,
    hint: 'Take this working copy to the folded rain log at the south end of Marl Fold.',
  },
}));
export type FieldStoreCase = (typeof FIELD_STORE_CASES)[number];
export const FIELD_ROUTES: readonly Route[] = ['time', 'place'];
export const fieldFree: Condition = { any: [{ not: { flagSet: ORDER } }, { flag: ORDER, eq: 'none' }] };
export const fieldCurrent = (entry: FieldStoreCase): Condition => ({ flag: ORDER, eq: entry.slug });
export const fieldFirst = (entry: FieldStoreCase): Condition => ({ flag: `${entry.flag}.first`, eq: true });
export const fieldDone = (entry: FieldStoreCase): Condition => ({ objective: entry.objective });
export const fieldRoute = (entry: FieldStoreCase, route: Route): Condition => ({ flag: `${entry.flag}.route`, eq: route });
export const fieldRead = (entry: FieldStoreCase, route: Route): Condition => ({ flag: entry.objective, eq: route });
export const fieldRevisited = (entry: FieldStoreCase): Condition => ({ flag: `${entry.flag}.fold`, eq: true });

const unfinished = (entry: FieldStoreCase): Condition => ({ not: fieldDone(entry) });
const inUse = (entry: FieldStoreCase, route: Route): Condition => ({ all: [fieldCurrent(entry), fieldRoute(entry, route), unfinished(entry)] });
export const atFieldBench = (route: Route, first: boolean): Condition => ({
  any: FIELD_STORE_CASES.map((entry) => ({ all: [inUse(entry, route), first ? { not: fieldFirst(entry) } : fieldFirst(entry)] })),
});

type Exercise = { first: string; time: string; place: string; weave: Pick<Weave, 'concepts' | 'aoks' | 'subjects'> };
const exercises: Record<string, Exercise> = {
  sheet: {
    first: 'The dry practice window reveals two complete leaf outlines.',
    time: 'After the later model bell, a shade screen covers one outline. The origin stayed fixed. The change records what the next observer could see.',
    place: 'At the other site, three leaf outlines are visible at the same bell. The first window keeps its own place.',
    weave: { concepts: ['evidence', 'explanation', 'objectivity', 'perspective'], aoks: ['NAT', 'MAT'], subjects: ['biology', 'geography', 'math-ai'] },
  },
  shore: {
    first: 'The model grid shows three visible patches beside the near water mark.',
    time: 'At the later bell one edge sits under the wave line. The grid shows which area could be checked both times.',
    place: 'The neighbouring bay shows a different patch pattern at the same bell. Both grids use the same little squares. Each keeps its own water mark.',
    weave: { concepts: ['evidence', 'justification', 'responsibility', 'certainty'], aoks: ['NAT', 'MAT'], subjects: ['biology', 'ess', 'math-ai'] },
  },
  shell: {
    first: 'The low practice surface shows the outside of the sample from one set of footmarks.',
    time: 'The later lamp shows another feature on that same side. The change belongs to the view the lamp lets us check.',
    place: 'The post across the tray shows a feature from a second side at the same bell. Both views belong to the same reference.',
    weave: { concepts: ['evidence', 'interpretation', 'perspective', 'objectivity'], aoks: ['NAT', 'MAT', 'ART'], subjects: ['biology', 'design-tech', 'visual-arts'] },
  },
  fossil: {
    first: 'The practice tray keeps the recovery clip beside the part of the surface in view.',
    time: 'A later study marks an extra part of that same face. The recovery date stayed with the earlier visit. The later examination has its own date.',
    place: 'The sample window beside it shows another face at the same bell. It needs its own reference. The record of the first recovery stays intact.',
    weave: { concepts: ['certainty', 'truth', 'explanation', 'evidence'], aoks: ['NAT', 'HIS'], subjects: ['ess', 'biology', 'history'] },
  },
  made: {
    first: 'The practice display registers one outline against the left peg.',
    time: 'At the second bell, the same outline sits under a changed light. A newly visible mark belongs to this reading and its conditions.',
    place: 'The view beside it catches an edge that the first view hid. The positions share a bell and each has a separate sightline.',
    weave: { concepts: ['culture', 'values', 'interpretation', 'perspective', 'evidence'], aoks: ['ART', 'HIS', 'MAT'], subjects: ['history', 'visual-arts', 'design-tech'] },
  },
  print: {
    first: 'The fixed practice aperture keeps the edge of one view visible.',
    time: 'At the next bell another line could be traced on the same sheet. The date of the tracing stays separate from the print.',
    place: 'The other position can show a boundary the first view leaves out. Each trace carries its own position.',
    weave: { concepts: ['evidence', 'power', 'culture', 'responsibility', 'perspective'], aoks: ['ART', 'HIS'], subjects: ['film', 'visual-arts', 'history'] },
  },
};

function caseScenes(entry: FieldStoreCase): DialogueNode[] {
  const exercise = exercises[entry.kind];
  const notice = (id: string, text: string): DialogueNode => ({ id: `${entry.flag}.${id}`, speaker: AVEN, historicalLabel: 'fictional-world', text });
  return [{
    ...notice('choose', `I can work with ${entry.anchor} from ${entry.accession}. We can use the left tray to hold our place for a later model bell. The two posts on the right keep one bell while we change position.`),
    options: [
      { text: 'Hold the place for a later model bell.', if: fieldFree, effects: [
        { setFlag: ORDER, value: entry.slug }, { setFlag: `${entry.flag}.route`, value: 'time' },
      ], next: `${entry.flag}.sent.time` },
      { text: 'Hold the bell and try a second position.', if: fieldFree, effects: [
        { setFlag: ORDER, value: entry.slug }, { setFlag: `${entry.flag}.route`, value: 'place' },
      ], next: `${entry.flag}.sent.place` },
      { text: 'Leave it at the case.' },
    ],
  },
  notice('sent.time', 'Take the reference to the left tray below the cases. The same notch stays in use when you advance the model bell.'),
  notice('sent.place', 'Start at the near post on the right. Then take the same bell slip to the far post.'),
  {
    ...notice('cancel', 'This is the one reference in use. Put it back to give another case a turn.'),
    options: [
      { text: 'Return the reference to its hook.', if: fieldCurrent(entry), effects: [
        { setFlag: ORDER, value: 'none' }, { setFlag: `${entry.flag}.first`, value: false },
      ] },
      { text: 'Keep the reference in hand.' },
    ],
  },
  notice('first.time', `${exercise.first} Leave the location clip in the notch. Advance the bell on this tray for the second view.`),
  notice('first.place', `${exercise.first} Carry that bell slip to the far post. The second view needs its own location.`),
  notice('reply.time', `${exercise.time} The practice report keeps ${entry.anchor} beside its named place and both model times.`),
  notice('reply.place', `${exercise.place} The practice report keeps ${entry.anchor} next to the two marked positions.`),
  {
    id: `${entry.flag}.fold`, speaker: 'coast-fold-keeper', historicalLabel: 'fictional-world',
    text: `The old Fold tallies can tell someone what our crews saw in the dry. Your working copy of ${entry.accession} gives the new sheet a reference we can find again.`,
    options: [{
      text: entry.revisitAction,
      if: { all: [specimenEquipped(entry.key), { not: fieldRevisited(entry) }] },
      effects: [{ setFlag: `${entry.flag}.fold`, value: true }, { setFlag: FIELD_STORE_LAST, value: entry.slug },
        { journal: `j.${entry.flag}.fold` }],
      next: `${entry.flag}.fold-reply`,
    }, { text: 'Leave the rainy-day pocket open.' }],
  },
  {
    id: `${entry.flag}.fold-reply`, speaker: 'coast-fold-keeper', historicalLabel: 'fictional-world',
    text: entry.revisitReply,
  }];
}

function benchScene(route: Route, first: boolean): DialogueNode {
  const site = route === 'time' ? 'the fixed tray' : first ? 'the near post' : 'the far post';
  const verb = route === 'time' && !first ? 'Advance the model bell with' : first ? 'Set' : 'Use the same bell slip with';
  return {
    id: `field-store.bench.${route}.${first ? 'first' : 'second'}`, speaker: AVEN, historicalLabel: 'fictional-world',
    text: route === 'time' && !first ? 'The place clip is still in its notch. The model bell can move on.' :
      route === 'place' && !first ? 'Here is the second position. The carried bell slip belongs to both posts.' :
      `Mark the first view at ${site}. The practice tray uses a copy.`,
    options: [
      ...FIELD_STORE_CASES.map((entry) => ({
        text: `${verb} ${entry.anchor}.`,
        if: { all: [inUse(entry, route), first ? { not: fieldFirst(entry) } : fieldFirst(entry)] },
        next: first ? `${entry.flag}.first.${route}` : `${entry.flag}.reply.${route}`,
        effects: first
          ? [{ setFlag: `${entry.flag}.first`, value: true }]
          : [{ setFlag: entry.objective, value: route }, { setFlag: ORDER, value: 'none' }, { journal: `j.${entry.flag}.${route}` }],
      })),
      { text: 'Leave the work in place.' },
    ],
  };
}

const objectives: Objective[] = FIELD_STORE_CASES.map((entry) => ({
  id: entry.objective, title: `Finish a practice comparison for ${entry.accession}.`,
  visible: { card: entry.card }, essential: false,
  done: { all: [{ card: entry.card }, fieldFirst(entry), { any: FIELD_ROUTES.map((route) => fieldRead(entry, route)) }] },
  weave: { ...exercises[entry.kind].weave, atl: ['thinking', 'research', 'communication'],
    framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'],
    thinking: { dok: 3, bloom: 'analyse', fink: 'application', solo: 'relational' }, minutes: 4 },
}));

export const fieldStoreContent = {
  characters: [{
    id: AVEN, name: 'Aven Beck', role: 'Keeper of the Commons’ practice trays', sprite: 'villager-2', mode: 'fictional',
    talk: [{ node: 'field-store.aven' }],
  }],
  dialogue: [{
    id: 'field-store.aven', speaker: AVEN, historicalLabel: 'fictional-world',
    text: 'I got two reports headed Wet Ground. One meant the stair at dawn. The other meant the far gate at closing. At least the envelopes agreed. Try one of these records to put the place and the watch back where they belong.',
  }, ...FIELD_STORE_CASES.flatMap(caseScenes), ...FIELD_ROUTES.flatMap((route) => [benchScene(route, true), benchScene(route, false)])],
  sources: FIELD_STORE_CASES.map((entry) => ({
    id: entry.source, title: `${entry.institution}, ${entry.accession}`,
    url: ['made', 'print'].includes(entry.kind) ? entry.catalogueUrl : entry.exactSource,
    locator: 'Exact catalogue record, description, item date and image metadata',
    supports: entry.observation, accessed: '2026-11-26',
  })),
  exhibits: FIELD_STORE_CASES.map((entry) => ({
    id: entry.exhibit, name: entry.title, historicalLabel: 'documented', art: 'collection-stand',
    dateText: entry.date, dateKind: entry.dateKind, summary: entry.observation, altText: entry.alt,
    sources: [entry.source], grantsCard: entry.card,
    specimen: { key: entry.key, institution: entry.institution, accession: entry.accession, source: entry.source,
      objective: entry.objective, pixelAsset: entry.asset, revisit: entry.revisit },
  })),
  cards: FIELD_STORE_CASES.map((entry) => ({
    id: entry.card, title: entry.title, historicalLabel: 'documented', claimKind: 'observation',
    text: entry.observation, limits: entry.limit, sources: [entry.source],
  })),
  missions: [{
    id: 'KG-CH11-R26', world: 'WORLD-12', title: 'The Place and the Bell',
    available: FIELD_STORE_OPEN, objectives, caseVisits: objectives.map(({ id }) => [id]),
    knowledgeQuestion: 'What can we compare when one condition changes and another stays put?',
    stake: 'A wet-day team needs the place and conditions of a reading before it can use that reading for the next walk.',
  }],
  hints: FIELD_STORE_CASES.flatMap((entry) => [
    'Keep one fixed reference while you change the other condition.',
    `Inspect ${entry.accession}. The reference station sits next to its case.`,
    'Take the left tray for a later bell at a fixed spot. On the right, visit both posts with the same bell slip.',
    'Make the second view, return to claim the working copy and equip it in the bag. Its repeat check is at the south end of Marl Fold.',
  ].map((text, index) => ({ id: `h.${entry.flag}.${index + 1}`, objective: entry.objective, depth: (index + 1) as Hint['depth'], text }))),
  journal: FIELD_STORE_CASES.flatMap((entry) => [
    { id: `j.${entry.flag}.time`, claimKind: 'observation' as const,
      text: `I kept the practice place fixed for ${entry.accession} and looked again at the next model bell.` },
    { id: `j.${entry.flag}.place`, claimKind: 'observation' as const,
      text: `I held one model bell and checked two positions with the reference for ${entry.accession}.` },
    { id: `j.${entry.flag}.fold`, claimKind: 'observation' as const,
      text: `I used the working copy for ${entry.accession} on the earlier Marl Fold board. ${entry.revisitReply}` },
  ]),
} satisfies Partial<ContentPack>;
