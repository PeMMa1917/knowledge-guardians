import type { Condition, ContentPack, DialogueNode, Hint, Objective, Weave } from '../domain/types';
import records from './fern-records.json';

const PENDING = 'fern.record.pending';
const NEMI = 'fern-record-nemi';
const LIO = 'fern-record-lio';
export const FERN_ARRIVED: Condition = { objective: 'forest.arrival' };

export const FERN_RECORDS = records.map((entry) => ({
  ...entry,
  source: `HIS-FERN-${entry.slug.toUpperCase()}`,
  exhibit: `OBJ-FERN-${entry.slug.toUpperCase()}`,
  card: `card.fern.record.${entry.slug}`,
  flag: `fern.record.${entry.slug}`,
  objective: `fern.record.${entry.slug}.used`,
  pixelAsset: `specimens/fern-${entry.slug}.jpg`,
}));
export type FernRecord = (typeof FERN_RECORDS)[number];
export type FernRoute = 'field' | 'desk';

export const fernRecordStationFree: Condition = {
  any: [{ not: { flagSet: PENDING } }, { flag: PENDING, eq: 'none' }],
};

export const fernRecordPrepared = (entry: FernRecord): Condition => ({ flag: `${entry.flag}.prepared`, eq: true });
export const fernRecordDelivered = (entry: FernRecord, route: FernRoute): Condition => ({ flag: entry.objective, eq: route });
export const fernRecordCarried = (entry: FernRecord): Condition => ({ flag: PENDING, eq: entry.slug });
export const fernRecordAtReceiver = (entry: FernRecord, route: FernRoute): Condition => ({
  all: [fernRecordCarried(entry), { flag: `${entry.flag}.route`, eq: route }],
});
export const fernRecordLast = (route: FernRoute): string => `fern.record.last.${route}`;

function routeName(route: FernRoute): string {
  return route === 'field' ? 'Lio at the Bridge Clearing' : 'Nemi at the records desk';
}

const routes: readonly FernRoute[] = ['field', 'desk'];

function keeperTalk(route: FernRoute) {
  return [
    ...FERN_RECORDS.map((entry) => ({ if: fernRecordAtReceiver(entry, route), node: `${entry.flag}.receive.${route}` })),
    { node: route === 'field' ? 'fern.record.lio' : 'fern.record.nemi' },
  ];
}

function receiverScenes(entry: FernRecord, route: FernRoute): DialogueNode[] {
  const speaker = route === 'field' ? LIO : NEMI;
  const reply = route === 'field' ? entry.fieldReply : entry.deskReply;
  const job = route === 'field' ? entry.fieldAction : entry.deskAction;
  return [{
    id: `${entry.flag}.receive.${route}`, speaker, historicalLabel: 'fictional-world',
    text: route === 'field'
      ? `Here's the low practice rail. We can put the exercise for ${entry.accession} right on it.`
      : `I have the drawer for ${entry.accession} open. Set the check beside the accession, where someone else can come back to it.`,
    options: [{
      text: job,
      next: `${entry.flag}.kept.${route}`,
      if: fernRecordAtReceiver(entry, route),
      effects: [
        { setFlag: entry.objective, value: route },
        { setFlag: PENDING, value: 'none' },
        { setFlag: fernRecordLast(route), value: entry.slug },
        { journal: `j.${entry.flag}.${route}` },
      ],
    }, { text: 'Keep carrying the frame.' }],
  }, {
    id: `${entry.flag}.kept.${route}`, speaker, historicalLabel: 'fictional-world', text: reply,
  }, {
    id: `${entry.flag}.returned.${route}`, speaker: 'narrator', historicalLabel: 'fictional-world',
    text: route === 'field'
      ? `The return hook now carries a piece of rail ribbon. At the bridge, Lio can let the next visitor use the exercise for ${entry.accession}.`
      : `A numbered tab points to the drawer for ${entry.accession}. The source record and the check stay in separate pockets at Nemi's desk.`,
    options: [{ text: 'Read the keeper’s reply.', next: `${entry.flag}.kept.${route}` }, { text: 'Leave the return slip on its hook.' }],
  }];
}

function frameScenes(entry: FernRecord): DialogueNode[] {
  const prepared = fernRecordPrepared(entry);
  return [{
    id: `${entry.flag}.frame`, speaker: 'narrator', historicalLabel: 'fictional-world',
    text: entry.action,
    options: [{ text: entry.tryAction, effects: [{ setFlag: `${entry.flag}.prepared`, value: true }], next: `${entry.flag}.send` },
      { text: 'Leave the exercise in place.' }],
  }, {
    id: `${entry.flag}.send`, speaker: 'narrator', historicalLabel: 'fictional-world',
    text: `${entry.result} Lio can use a practice copy at the clearing. Nemi can keep a check beside the exact record here.`,
    options: [
      ...routes.map((route) => ({
        text: `Make a copy for ${routeName(route)}.`,
        if: { all: [prepared, fernRecordStationFree] },
        effects: [{ setFlag: PENDING, value: entry.slug }, { setFlag: `${entry.flag}.route`, value: route }],
        next: `${entry.flag}.carry.${route}`,
      })),
      { text: 'Leave the prepared exercise here for now.' },
    ],
  }, {
    id: `${entry.flag}.wait`, speaker: 'narrator', historicalLabel: 'fictional-world',
    text: `${entry.result} You already have a frame in hand. This one will stay set until you come back.`,
  }, ...routes.map((route): DialogueNode => ({
    id: `${entry.flag}.carry.${route}`, speaker: 'narrator', historicalLabel: 'fictional-world',
    text: `The exercise copy for ${entry.accession} is addressed to ${routeName(route)}. The exhibition image stays on its stand.`,
    options: [
      { text: 'Keep it in hand.' },
      { text: 'Put the copy back on the hook.', effects: [{ setFlag: PENDING, value: 'none' }], next: `${entry.flag}.send` },
    ],
  })), ...routes.flatMap((route) => receiverScenes(entry, route))];
}

const commonWeave: Weave = {
  concepts: ['evidence', 'justification', 'responsibility'],
  framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'],
  atl: ['thinking', 'research', 'communication'],
  thinking: { dok: 2, bloom: 'apply', fink: 'application', solo: 'relational' },
  minutes: 4,
};

function weave(kind: string): Weave {
  if (kind === 'fossil') {
    return { ...commonWeave, concepts: [...commonWeave.concepts, 'certainty', 'objectivity', 'explanation'], aoks: ['NAT', 'HIS'], subjects: ['biology', 'ess', 'history'] };
  }
  if (kind === 'view') {
    return { ...commonWeave, concepts: [...commonWeave.concepts, 'interpretation', 'perspective', 'culture'], aoks: ['ART', 'HIS'], subjects: ['visual-arts', 'geography', 'history'] };
  }
  return { ...commonWeave, concepts: [...commonWeave.concepts, 'values', 'objectivity', 'perspective'], aoks: ['MAT', 'ART', 'HIS'], subjects: ['math-ai', 'design-tech', 'visual-arts'] };
}

const objectives: Objective[] = FERN_RECORDS.map((entry) => ({
  id: entry.objective, title: `Check the keeper’s reply for “${entry.title}”.`,
  visible: { card: entry.card }, essential: false, weave: weave(entry.kind),
  done: { all: [{ card: entry.card }, fernRecordPrepared(entry), { any: routes.map((route) => fernRecordDelivered(entry, route)) }] },
}));

export const fernRecordContent = {
  characters: [
    { id: NEMI, name: 'Nemi Rill', role: 'Fern Record Room cataloguer', sprite: 'villager-2', mode: 'fictional', talk: keeperTalk('desk') },
    { id: LIO, name: 'Lio Cress', role: 'Keeper of the low practice rail at Bridge Clearing', sprite: 'villager-1', mode: 'fictional', talk: keeperTalk('field') },
  ],
  dialogue: [
    { id: 'fern.record.nemi', speaker: NEMI, historicalLabel: 'fictional-world',
      text: 'Elian sent this cabinet after a reader took a collecting year for the age of the stone. That gave November quite a long month. Try one of the frames. I can keep its check here, or Lio can use a practice copy down by the bridge.' },
    { id: 'fern.record.lio', speaker: LIO, historicalLabel: 'fictional-world',
      text: 'An exercise from Nemi can go on this rail. I keep it low so a visitor can try it before I tell them what I saw. The trick is giving them enough room to show me something too.' },
    ...FERN_RECORDS.flatMap(frameScenes),
  ],
  sources: FERN_RECORDS.map((entry) => ({
    id: entry.source, title: `${entry.institution}, ${entry.title}, catalogue ${entry.accession}`,
    url: entry.kind === 'fossil' ? entry.exactSource : entry.catalogueUrl,
    locator: entry.kind === 'fossil'
      ? 'Institution-published specimen occurrence, collection event, geological context and image metadata'
      : 'Institutional object record, date, material, image and catalogue description',
    supports: entry.observation, accessed: '2026-11-26',
  })),
  exhibits: FERN_RECORDS.map((entry) => ({
    id: entry.exhibit, name: entry.title, historicalLabel: 'documented', art: 'collection-stand',
    dateText: entry.date, dateKind: entry.dateKind,
    summary: `${entry.place} ${entry.medium}. ${entry.observation}`,
    sources: [entry.source], grantsCard: entry.card, altText: entry.alt,
    specimen: {
      key: entry.key, institution: entry.institution, accession: entry.accession,
      source: entry.source, objective: entry.objective, pixelAsset: entry.pixelAsset,
    },
  })),
  cards: FERN_RECORDS.map((entry) => ({
    id: entry.card, title: `${entry.title} · ${entry.accession}`, historicalLabel: 'documented', claimKind: 'observation',
    text: entry.observation, sources: [entry.source], limits: entry.limit,
  })),
  missions: [{
    id: 'KG-CH5-R10', world: 'WORLD-06', title: 'A Room for Two Dates', available: FERN_ARRIVED,
    stake: 'Lio’s readers may carry the wrong year or a false fit out of the room. Nemi needs a source readers can find again.',
    knowledgeQuestion: 'How can one piece of evidence support different checks without changing what it shows?',
    objectives,
    caseVisits: objectives.map(({ id }) => [id]),
  }],
  journal: FERN_RECORDS.flatMap((entry) => routes.map((route) => ({
    id: `j.${entry.flag}.${route}`, claimKind: 'observation' as const,
    text: route === 'field'
      ? `I made a practice copy for ${entry.accession} and set it on Lio’s low rail. The next visitor can try the same check before hearing an account of it.`
      : `I left the check for ${entry.accession} in Nemi’s drawer. A later reader can go back to the exact record with the check beside it.`,
  }))),
  hints: FERN_RECORDS.flatMap((entry) => [
    'The picture, the piece and its catalogue can show different things.',
    `Look at ${entry.accession}. Try ${entry.frame} next to its stand.`,
    'Use the exercise copy at Lio’s low rail, or bring it to the records desk here. You can carry one at a time.',
    'After making the copy, go to the matching rail or desk and set it down. The frame at the exhibit will keep the reader’s reply.',
  ].map((text, i) => ({ id: `h.${entry.flag}.${i + 1}`, objective: entry.objective, depth: (i + 1) as Hint['depth'], text }))),
} satisfies Partial<ContentPack>;
