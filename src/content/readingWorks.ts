import type { Condition, ContentPack, DialogueNode, Hint, Objective, SourceRecord, Weave } from '../domain/types';
import { specimenEquipped } from '../domain/specimenGear';
import data from './reading-works.json';

export const READING_WORKS_AVAILABLE: Condition = { objective: 'copies.arrival' };
export const READING_WORKS_RECEIVER = 'reading-works.receiver';
export const READING_WORKS_LAST = 'reading-works.last-installed';
const VARA = 'reading-works-vara';
const KORI = 'reading-works-kori';
export const PERKINS_KEY = 'perkins:procede-1829';
export const PERKINS_REVISIT = {
  map: 'preserved.archive', prop: 'perkins-cold-impression',
  method: 'Fit a raised stop that lets a reader find the maker credit on the right record',
  hint: 'Return to the Cold Store with the Perkins working copy equipped. Use the two author slips beside the east bench.',
};

export const READING_WORKS_CASES = data.map((entry) => ({
  ...entry,
  flag: `reading-works.${entry.slug}`,
  exhibit: `OBJ-READING-WORKS-${entry.slug.toUpperCase()}`,
  sourceId: `HIS-READING-WORKS-${entry.slug.toUpperCase()}`,
  card: `card.reading-works.${entry.slug}`,
  objective: `reading-works.${entry.slug}.used`,
  art: `reading-works.${entry.slug}`,
}));
type ReadingCase = (typeof READING_WORKS_CASES)[number];
type ReadingRoute = 'first' | 'second';

export const READING_ROUTES: readonly ReadingRoute[] = ['first', 'second'];
export const readingTrialFlag = (entry: ReadingCase, index: number) => `${entry.flag}.trial.${index}`;
export const readingRoute = (entry: ReadingCase, route: ReadingRoute): Condition => ({ flag: `${entry.flag}.route`, eq: route });
export const readingTrial = (entry: ReadingCase, index: number): Condition => ({ flag: readingTrialFlag(entry, index), eq: true });
export const readingSent = (entry: ReadingCase): Condition => ({ flagSet: `${entry.flag}.route` });
export const readingCompared = (entry: ReadingCase): Condition => ({ all: entry.trials.map((_, index) => readingTrial(entry, index)) });

const roomSpeaker = (entry: ReadingCase) => ['access', 'composition'].includes(entry.kind) ? KORI : VARA;
const unused = (entry: ReadingCase): Condition => ({ not: { objective: entry.objective } });

const checks: Record<string, SourceRecord> = {
  idrisi: {
    id: 'HIS-READING-WORKS-IDRISI-MANIFEST', title: 'Bodleian digital manifest for MS. Pococke 375',
    url: 'https://iiif.bodleian.ox.ac.uk/iiif/manifest/ced0d8bd-1019-4af2-9086-e411115f1507.json',
    locator: 'Description and canvas labelled fol. 3b-4a', supports: 'The 1553 date and the position of this spread in the exact copy.',
    accessed: '2026-11-26',
  },
  braille: {
    id: 'HIS-READING-WORKS-BRAILLE-MIGEL', title: 'Migel Library digitisation record for HV1669 .B73 1829',
    url: 'https://archive.org/metadata/procdpourcrirele00loui', locator: 'Contributed title, date, call number and notes',
    supports: 'The catalogued item is a facsimile of the dated work. The scan notes identify the book as photocopied.',
    accessed: '2026-11-26',
  },
  muybridge: {
    id: 'HIS-READING-WORKS-MUYBRIDGE-PLATE', title: 'Library of Congress scan LC-DIG-ppmsca-23778',
    url: 'https://tile.loc.gov/storage-services/service/pnp/ppmsca/23700/23778v.jpg', locator: 'Printed caption and interval note below the frames',
    supports: 'The date, subject, track and intervals stated by the print.',
    accessed: '2026-11-26',
  },
  next: {
    id: 'HIS-READING-WORKS-CERN', title: 'CERN’s short history of the Web',
    url: 'https://home.cern/science/computing/birth-web/short-history-web', locator: 'The note identifying the machine in the server photograph',
    supports: 'CERN identifies Tim Berners-Lee’s NeXT machine as the first Web server.',
    accessed: '2026-11-26',
  },
};
const idrisiHistory: SourceRecord = {
  id: 'HIS-READING-WORKS-IDRISI-HISTORY', title: 'Encyclopaedia Britannica, al-Sharīf al-Idrīsī',
  url: 'https://www.britannica.com/biography/al-Sharif-al-Idrisi',
  locator: 'Account of the completion of the geography',
  supports: 'The geography was completed in January 1154.',
  accessed: '2026-11-26',
};
const idrisiScribe: SourceRecord = {
  id: 'HIS-READING-WORKS-IDRISI-SCRIBE', title: 'Fihrist manuscript description for MS. Pococke 375',
  url: 'https://www.fihrist.org.uk/catalog/manuscript_1554', locator: 'Naskh hand, origin dates and acquisition',
  supports: 'Fihrist names the scribe ʻAlī ibn Ḥasan al-Ḥūfī al-Qāsimī and gives 1692 for the Bodleian purchase. Its origin fields put 960 AH alongside a Gregorian date of 1533.',
  accessed: '2026-11-26',
};
const sourceIds = (entry: ReadingCase) => {
  const supporting = checks[entry.slug];
  const ids = supporting ? [entry.sourceId, supporting.id] : [entry.sourceId];
  if (entry.slug === 'idrisi') ids.push(idrisiHistory.id, idrisiScribe.id);
  return ids;
};

function caseScenes(entry: ReadingCase): DialogueNode[] {
  const speaker = roomSpeaker(entry);
  return [
    ...entry.trials.flatMap((trial, index): DialogueNode[] => [{
      id: `${entry.flag}.trial.${index}`, speaker, historicalLabel: 'fictional-world', text: trial.before,
      options: [{
        text: trial.action, if: { not: readingTrial(entry, index) },
        effects: [{ setFlag: readingTrialFlag(entry, index), value: true }],
        next: `${entry.flag}.after.${index}`,
      }, { text: 'Leave the model in place.' }],
    }, { id: `${entry.flag}.after.${index}`, speaker: 'narrator', historicalLabel: 'fictional-world', text: trial.after }]),
    {
      id: `${entry.flag}.send`, speaker, historicalLabel: 'fictional-world', text: entry.send,
      options: [
        ...READING_ROUTES.map((route, index) => ({
          text: entry.routes[index].action, next: `${entry.flag}.selected.${route}`,
          if: { all: [readingCompared(entry), { not: readingSent(entry) }] },
          effects: [{ setFlag: `${entry.flag}.route`, value: route }],
        })),
        { text: 'Leave both setups here for now.' },
      ],
    },
    ...READING_ROUTES.flatMap((route, index): DialogueNode[] => {
      const action = entry.routes[index];
      return [{
        id: `${entry.flag}.selected.${route}`, speaker, historicalLabel: 'fictional-world',
        text: 'I’ll meet the arrangement at the far end of the Landing. Look for the low board past the lending hall.',
      }, {
        id: `${entry.flag}.receive.${route}`, speaker, historicalLabel: 'fictional-world', text: action.setup,
        options: [{
          text: action.use, next: `${entry.flag}.reply.${route}`, if: { all: [readingRoute(entry, route), unused(entry)] },
          effects: [
            { setFlag: entry.objective, value: route },
            { setFlag: READING_WORKS_LAST, value: `${entry.slug}.${route}` },
            { journal: `j.${entry.flag}.${route}` },
          ],
        }, { text: 'Keep the setup waiting.' }],
      }, {
        id: `${entry.flag}.reply.${route}`, speaker, historicalLabel: 'fictional-world', text: action.reply,
      }, {
        id: `${entry.flag}.kept.${route}`, speaker, historicalLabel: 'fictional-world',
        text: action.setup,
        options: [{ text: 'Read the landing reply.', if: { objective: entry.objective }, next: `${entry.flag}.reply.${route}` },
          { text: 'Leave the setup card in place.' }],
      }];
    }),
  ];
}

const common: Pick<Weave, 'framework' | 'atl' | 'thinking' | 'minutes'> = {
  framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'],
  atl: ['research', 'thinking', 'communication', 'social'],
  thinking: { dok: 2, bloom: 'apply', fink: 'integration', solo: 'relational' },
  minutes: 4,
};
const weave: Record<string, Omit<Weave, keyof typeof common>> = {
  map: { concepts: ['perspective', 'culture', 'interpretation', 'justification', 'evidence'], aoks: ['HIS', 'MAT', 'TEC'], subjects: ['geography', 'history', 'math-ai'] },
  access: { concepts: ['values', 'responsibility', 'power', 'perspective', 'culture'], aoks: ['LAN', 'ART', 'TEC'], subjects: ['lang-langlit', 'design-tech', 'music'] },
  composition: { concepts: ['values', 'responsibility', 'culture', 'explanation', 'evidence'], aoks: ['LAN', 'HIS', 'TEC'], subjects: ['lang-langlit', 'design-tech', 'history'] },
  motion: { concepts: ['evidence', 'objectivity', 'explanation', 'certainty', 'interpretation'], aoks: ['ART', 'NAT', 'MAT'], subjects: ['film', 'physics', 'math-ai'] },
  network: { concepts: ['responsibility', 'power', 'truth', 'evidence', 'justification'], aoks: ['TEC', 'HIS', 'HUM'], subjects: ['computer-science', 'history', 'design-tech'] },
};

const objectives: Objective[] = READING_WORKS_CASES.map((entry) => ({
  id: entry.objective, title: `Use the landing setup for ${entry.title}.`,
  essential: false, visible: { card: entry.card },
  done: { all: [{ card: entry.card }, readingCompared(entry), { flagSet: entry.objective }] },
  weave: { ...common, ...weave[entry.kind] },
}));

export const readingWorksContent = {
  characters: [
    { id: VARA, name: 'Vara Edge', role: 'Landing’s model keeper', sprite: 'villager-2', mode: 'fictional',
      talk: [{ node: 'reading-works.vara' }] },
    { id: KORI, name: 'Kori Linn', role: 'Proof reader for the return boxes', sprite: 'villager-1', mode: 'fictional',
      talk: [{ node: 'reading-works.kori' }] },
  ],
  dialogue: [
    { id: 'reading-works.vara', speaker: VARA, historicalLabel: 'fictional-world',
      text: 'One visitor read the paper upside down and still beat me to the pier. We can work with that. Try the shelves, then bring a working setup to the landing.' },
    { id: 'reading-works.kori', speaker: KORI, historicalLabel: 'fictional-world',
      text: 'Someone painted my box marker a different colour. My fingers didn’t get the memo. I keep two shapes for this job. Try them beside the low ledge.' },
    { id: READING_WORKS_RECEIVER, speaker: VARA, historicalLabel: 'fictional-world',
      text: 'Here are the setups from the workroom. Pick one to use with the reader who’s waiting. I’ll leave their replies beside the source cases.',
      options: [
        ...READING_WORKS_CASES.flatMap((entry) => READING_ROUTES.map((route) => ({
          text: `Try ${entry.pad}.`, if: { all: [readingRoute(entry, route), unused(entry)] },
          next: `${entry.flag}.receive.${route}`,
        }))),
        { text: 'Leave the board for the next visitor.' },
      ],
    },
    { id: 'reading-works.perkins.cold', speaker: 'preserved-registrar', historicalLabel: 'fictional-world',
      text: 'One loose slip here names the author of our reading instructions. The other names the person who made this later copy. I can tell their print apart, but two notes in the same slot are hard to locate by touch. You have a working example with its credit separate. Can we give each slip its own raised stop?',
      options: [{
        text: 'Lift the credit slip and fit a raised stop to each of the two pockets.',
        if: { all: [specimenEquipped(PERKINS_KEY), { not: { flagSet: 'reading-works.perkins.cold.used' } }] },
        effects: [{ setFlag: 'reading-works.perkins.cold.used', value: true }, { journal: 'j.reading-works.perkins.cold' }],
        next: 'reading-works.perkins.cold-reply',
      }, { text: 'Leave the pockets as they are.' }],
    },
    { id: 'reading-works.perkins.cold-reply', speaker: 'preserved-registrar', historicalLabel: 'fictional-world',
      text: 'The next reader can find the author at the long stop and the copyist at the short one. Each name has a place of its own without erasing the later work.',
    },
    ...READING_WORKS_CASES.flatMap(caseScenes),
  ],
  sources: [...READING_WORKS_CASES.map((entry) => ({
    id: entry.sourceId, title: `${entry.institution}, ${entry.accession}`,
    url: entry.source, locator: entry.locator, supports: entry.observation, accessed: '2026-11-26',
  })), ...Object.values(checks), idrisiHistory, idrisiScribe],
  exhibits: READING_WORKS_CASES.map((entry) => ({
    id: entry.exhibit, name: entry.title, historicalLabel: 'documented', art: entry.art,
    dateText: entry.date, dateKind: entry.dateKind, summary: entry.observation, altText: entry.alt,
    sources: sourceIds(entry), grantsCard: entry.card,
    ...(entry.slug === 'braille' ? {} : { specimen: {
      key: entry.key, institution: entry.institution, accession: entry.accession, source: entry.sourceId, objective: entry.objective,
      ...(entry.key === PERKINS_KEY ? { revisit: PERKINS_REVISIT } : {}),
    } }),
  })),
  cards: READING_WORKS_CASES.map((entry) => ({
    id: entry.card, title: entry.title, historicalLabel: 'documented', claimKind: 'observation',
    text: entry.observation, limits: entry.limit, sources: sourceIds(entry),
  })),
  missions: [{
    id: 'KG-CH7-R22', world: 'WORLD-08', title: 'The Reader Across the Landing',
    stake: 'A reader may find a mark and still miss the way to the notice or the way to check it.',
    knowledgeQuestion: 'How does changing the form of a record change who can act on it?',
    available: READING_WORKS_AVAILABLE, objectives, caseVisits: objectives.map(({ id }) => [id]),
  }],
  hints: READING_WORKS_CASES.flatMap((entry) => [
    'Try both ways of using the model beside the dated item.',
    `Open the exhibit, then use both model stands beside ${entry.pad}.`,
    'Once you’ve done both trials, set one arrangement and visit the board at the far end of the Landing.',
    'Use the selected arrangement with the reader there. The keeper puts the reply back beside its exhibit.',
  ].map((text, i) => ({ id: `h.${entry.flag}.${i + 1}`, objective: entry.objective, depth: (i + 1) as Hint['depth'], text }))),
  journal: [...READING_WORKS_CASES.flatMap((entry) => READING_ROUTES.map((route, index) => ({
    id: `j.${entry.flag}.${route}`, claimKind: 'observation' as const,
    text: `After both checks, I chose “${entry.routes[index].action}”. I used the arrangement with the reader at the Landing and kept their reply.`,
  }))), { id: 'j.reading-works.perkins.cold', claimKind: 'observation',
    text: 'I brought the Perkins working copy to the Cold Store and fitted the two raised stops. A reader can find the author and copyist slips independently.' }],
} satisfies Partial<ContentPack>;
