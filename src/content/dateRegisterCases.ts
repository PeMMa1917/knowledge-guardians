import { BROOKLYN_KHIPU_KEY, BROOKLYN_RETURN, dateRegisterGap, DRESDEN_CODEX_KEY, DRESDEN_RETURN, registerOrder, REGISTER_EVENT_NAMES, REGISTER_ROUTES, type RegisterEvent, type RegisterRoute } from '../domain/dateRegister';
import type { Condition, ContentPack, DialogueNode, Effect, Hint, Objective } from '../domain/types';
import objects from './date-register-specimens.json';
import returns from './date-register-returns.json';

export const DATE_REGISTER_GROUP = 'date-register';
export const DATE_REGISTER_OPEN: Condition = { objective: 'sea.finish' };

export const DATE_REGISTER_CASES = objects.map(({ eventKind, ...item }) => {
  const flag = `date-register.${item.slug}`;
  return {
    ...item, eventKind: eventKind as RegisterEvent, flag,
    source: `HIS-REG-${item.slug}`, exhibit: `OBJ-REG-${item.slug}`,
    card: `card.${flag}.object`, item: `item.${flag}.folio`,
    objective: `${flag}.filed`, civicObjective: `${flag}.civic`,
    nodes: { work: `${flag}.work`, porch: `${flag}.porch`, runner: `${flag}.runner`, civic: `${flag}.admit` },
  };
});
export type DateRegisterCase = (typeof DATE_REGISTER_CASES)[number];

export function dateRegisterStation(station: string): DateRegisterCase | RegisterRoute | 'civic' | undefined {
  if (station === 'porch' || station === 'runner' || station === 'civic') return station;
  return DATE_REGISTER_CASES.find(({ slug }) => slug === station);
}

export function dateRegisterEntries(game: string): string[] {
  const prefix = `${DATE_REGISTER_GROUP}:`;
  if (!game.startsWith(prefix)) return [];
  const station = dateRegisterStation(game.slice(prefix.length));
  if (typeof station === 'string') return DATE_REGISTER_CASES.map(({ nodes }) => nodes[station]);
  return station ? [station.nodes.work] : [];
}

const trueFlag = (flag: string): Condition => ({ flag, eq: true });
const set = (flag: string, value: string | boolean = true): Effect => ({ setFlag: flag, value });
const to = (record: DateRegisterCase, route: RegisterRoute): Condition => ({ flag: `${record.flag}.route`, eq: route });

function registerSources(record: DateRegisterCase): string[] {
  if (record.key === DRESDEN_CODEX_KEY) return ['HIS-REG-DRESDEN-ORIGIN', record.source, 'HIS-REG-DRESDEN-CUSTODY'];
  if (record.key === BROOKLYN_KHIPU_KEY) return [record.source, 'HIS-REG-KHIPU-COMPONENTS'];
  return [record.source];
}

export function registerFiled(record: DateRegisterCase): Condition {
  return trueFlag(`${record.flag}.filed`);
}

function registerNodes(record: DateRegisterCase): DialogueNode[] {
  const { card, flag, item, nodes } = record;
  const inspected: Condition = { card };
  const isCodex = record.key === DRESDEN_CODEX_KEY;
  const isKhipu = record.key === BROOKLYN_KHIPU_KEY;
  const compare: Condition = { all: [inspected, trueFlag(`${flag}.face.object`), trueFlag(`${flag}.face.event`),
    ...(isCodex ? [trueFlag(`${flag}.rail.strip`), trueFlag(`${flag}.rail.pieces`)] : []),
    ...(isKhipu ? [trueFlag(`${flag}.mount.wide`), trueFlag(`${flag}.mount.tall`)] : [])] };
  const send: Condition = { all: [compare, trueFlag(`${flag}.paired`), { not: { flagSet: `${flag}.route` } }] };
  return [
    { id: nodes.work, speaker: 'narrator', historicalLabel: 'fictional-world',
      text: 'The two folds open in this stand. The number stays at the top of each face.', options: [
        { text: 'Lift the object face.', if: inspected, effects: [set(`${flag}.face.object`), set(`${flag}.face`, 'object')] },
        { text: 'Lift the other date face.', if: inspected, effects: [set(`${flag}.face.event`), set(`${flag}.face`, 'event')] },
        { text: 'Fasten both dates by the number.', if: compare, effects: [set(`${flag}.paired`)] },
        { text: 'Take the open folio to the porch cabinet.', if: send, effects: [set(`${flag}.route`, 'porch'), { giveItem: item }] },
        { text: 'Carry the date line to the runner’s box.', if: send, effects: [set(`${flag}.route`, 'runner'), { giveItem: item }] },
        ...(isCodex ? [
          { text: 'Fit the single-strip model.', if: inspected, effects: [set(`${flag}.rail.strip`), set(`${flag}.rail`, 'strip')] },
          { text: 'Fit the two conserved-length models.', if: inspected, effects: [set(`${flag}.rail.pieces`), set(`${flag}.rail`, 'pieces')] },
        ] : []),
        ...(isKhipu ? [
          { text: 'Fit the outline wide.', if: inspected, effects: [set(`${flag}.mount.wide`), set(`${flag}.mount`, 'wide')] },
          { text: 'Fit the same outline tall.', if: inspected, effects: [set(`${flag}.mount.tall`), set(`${flag}.mount`, 'tall')] },
        ] : []),
      ] },
    ...REGISTER_ROUTES.map((route): DialogueNode => ({
      id: nodes[route], speaker: route === 'porch' ? 'register-reader-eneth' : 'register-runner-caren', historicalLabel: 'fictional-world',
      text: route === 'porch' ? record.porchReply : record.runnerReply,
      options: [{
        text: route === 'porch' ? 'Hang the open guide in the porch.' : 'File the date line in the runner’s box.',
        if: { all: [to(record, route), { item }, { not: registerFiled(record) }] },
        effects: [set(`${flag}.filed`)],
      }],
    })),
    { id: nodes.civic, speaker: 'register-clerk-elwen', historicalLabel: 'fictional-world', text: record.civicQuestion,
      options: [
        { text: 'Use the making date in the object guide.', if: { all: [registerFiled(record), { item }, to(record, 'porch'), { not: { objective: record.civicObjective } }] },
          effects: [set(`${flag}.copy`, 'object')] },
        { text: 'Use the separate dated event in the library log.', if: { all: [registerFiled(record), { item }, to(record, 'runner'), { not: { objective: record.civicObjective } }] },
          effects: [set(`${flag}.copy`, 'event')] },
      ] },
  ];
}

const objectives: Objective[] = DATE_REGISTER_CASES.map((record) => ({
    id: record.objective, title: `Leave the checked folio for ${record.title}.`, visible: { card: record.card },
    essential: false, done: registerFiled(record), onComplete: [{ journal: `j.${record.objective}` }],
    weave: {
      concepts: ['evidence', 'explanation', 'certainty', 'responsibility', 'perspective'],
      framework: ['scope', 'methods-and-tools', 'perspectives', 'ethics'],
      thinking: { dok: 2, bloom: 'apply', fink: 'human', solo: 'relational' },
      atl: ['thinking', 'research', 'communication'], aoks: ['HIS', 'ART', 'MAT'],
      subjects: ['history', 'visual-arts', 'math-ai'], minutes: 3,
    },
}));

const civicObjectives: Objective[] = DATE_REGISTER_CASES.map((record) => ({
  id: record.civicObjective, title: `Help the Civic librarian use the dated receipt for “${record.title}”.`,
  visible: { all: [{ objective: 'civic.arrival' }, registerFiled(record)] }, essential: false,
  done: { flagSet: `${record.flag}.copy` }, onComplete: [{ journal: `j.${record.civicObjective}` }],
  weave: {
    concepts: ['evidence', 'interpretation', 'perspective', 'responsibility'],
    framework: ['scope', 'perspectives', 'ethics'],
    thinking: { dok: 2, bloom: 'apply', fink: 'human', solo: 'relational' },
    atl: ['communication', 'social'], aoks: ['HIS', 'HUM'], subjects: ['history', 'digital-society'], minutes: 1,
  },
}));

export const dateRegisterContent = {
  characters: [
    { id: 'register-reader-eneth', name: 'Eneth Tarl', role: 'Keeps the Seagrass Steps source porch', sprite: 'villager-1', mode: 'fictional', talk: [{ node: 'date-register.eneth' }] },
    { id: 'register-runner-caren', name: 'Caren Oust', role: 'Carries the Seagrass Steps date roll', sprite: 'villager-2', mode: 'fictional', talk: [{ node: 'date-register.caren' }] },
    { id: 'register-clerk-elwen', name: 'Elwen Marr', role: 'Labels the sample trays at Civic Dispatch', sprite: 'villager-1', mode: 'fictional', talk: [{ node: 'date-register.elwen' }] },
  ],
  dialogue: [
    { id: 'date-register.eneth', speaker: 'register-reader-eneth', historicalLabel: 'fictional-world', text: 'The maker’s date goes by the picture. A reader can open the other face if they are asking where somebody saw it later.' },
    { id: 'date-register.caren', speaker: 'register-runner-caren', historicalLabel: 'fictional-world', text: 'This roll is for one date and a place. I need the date of that event. You can keep the other date with its source number on the fold.' },
    { id: 'date-register.elwen', speaker: 'register-clerk-elwen', historicalLabel: 'fictional-world', text: 'Here is a guide to the objects and here is our Civic register of checked events. Which work is your signed copy already fitted to do?' },
    ...DATE_REGISTER_CASES.flatMap(registerNodes),
    ...returns as DialogueNode[],
  ],
  sources: DATE_REGISTER_CASES.map((record) => ({
    id: record.source, title: `${record.institution}, ${record.title}, ${record.accession}`, url: record.url,
    locator: record.eventLocator, supports: `${record.observed} ${record.eventLine}`, accessed: '2026-11-26',
  })).concat([{
    id: 'HIS-REG-DRESDEN-ORIGIN', title: 'SLUB Dresden, Origin of the Maya Codex',
    url: 'https://www.slub-dresden.de/en/explore/manuscripts/the-dresden-maya-codex/origin',
    locator: 'Shelfmark and probable attribution of the surviving manuscript',
    supports: 'SLUB identifies this manuscript as Mscr.Dresd.R.310 and tentatively dates it to about 1300–1521. It proposes northern or northeastern Yucatán, probably based on an earlier model.', accessed: '2026-11-26',
  }, {
    id: 'HIS-REG-DRESDEN-CUSTODY', title: 'SLUB Dresden, Provenance and Acquisition of the Maya Codex',
    url: 'https://www.slub-dresden.de/en/explore/manuscripts/the-dresden-maya-codex/provenance-acquisition',
    locator: 'Reported Vienna acquisition, transfer list, and open provenance questions',
    supports: 'Götze reported acquiring the codex in Vienna in 1739. SLUB records its appearance on a 1740 transfer list and gives alternative accounts of its earlier route without settling them.', accessed: '2026-11-26',
    }, {
      id: 'HIS-REG-KHIPU-COMPONENTS', title: 'Khipu Field Guide, Khipu Sketchbook catalogue',
      url: 'https://www.khipufieldguide.com/sketchbook/index.html', locator: 'KH0043–KH0046, accession 70.177.69, X591a',
      supports: 'The researchers list four components under the same Brooklyn Museum accession and cross-reference the museum record. That grouping does not assign a meaning to the knots.', accessed: '2026-11-26',
    }]),
  exhibits: DATE_REGISTER_CASES.map((record) => ({
    id: record.exhibit, name: record.title, historicalLabel: 'documented',
    art: record.key === DRESDEN_CODEX_KEY ? 'register.codex-fold' : 'preserved.folder',
    dateText: record.date, dateKind: record.dateKind,
    summary: `${record.origin}. ${record.material}. ${record.measurement} ${record.observed}${record.key === BROOKLYN_KHIPU_KEY ? ' Brooklyn Museum photograph, CC BY 3.0.' : ''}`,
    altText: `A pixel view of ${record.alt}.`,
    sources: registerSources(record),
    grantsCard: record.card,
    specimen: { key: record.key, institution: record.institution,
      accession: record.accession, source: registerSources(record)[0], objective: record.objective, ...(record.asset ? { pixelAsset: record.asset } : {}),
      ...(record.key === DRESDEN_CODEX_KEY ? { revisit: DRESDEN_RETURN } : record.key === BROOKLYN_KHIPU_KEY ? { revisit: BROOKLYN_RETURN } : {}) },
  })),
  cards: DATE_REGISTER_CASES.map((record) => ({
    id: record.card, title: `${record.accession} · ${record.title}`, text: `${record.observed} ${record.eventLine}`,
    limits: record.limit, claimKind: 'observation', historicalLabel: 'documented', sources: registerSources(record),
  })),
  items: DATE_REGISTER_CASES.map((record) => ({
    id: record.item, name: `Signed date folio · ${record.accession}`, historicalLabel: 'fictional-world',
    description: `The ${record.dateKind.toLowerCase()} and ${REGISTER_EVENT_NAMES[record.eventKind]} stay with the number ${record.accession}.`, art: 'fold.paired',
  })),
  missions: [
    { id: 'KG-CH8-R20', title: 'The Beside Date', world: 'WORLD-09', available: DATE_REGISTER_OPEN,
      stake: 'Eneth’s visitors want to place a picture. Caren’s runner needs a date that belongs to a separate event. A hastily folded slip could lead either reader to the wrong date.',
      knowledgeQuestion: 'What changes when a date is attached to a different event in the history of one object?', objectives,
      caseVisits: objectives.map(({ id }) => [id]) },
    { id: 'KG-CH12-R29', title: 'The Borrowed Date Guide', world: 'WORLD-13', available: { all: [{ objective: 'civic.arrival' },
      { any: DATE_REGISTER_CASES.map(registerFiled) }] }, stake: 'Elwen has an object guide and an event register but one stand for each. The signed slip has to stay with what it establishes.',
      knowledgeQuestion: 'Which date answers the question a second reader brings to a record?', objectives: civicObjectives,
      caseVisits: civicObjectives.map(({ id }) => [id]) },
  ],
  journal: DATE_REGISTER_CASES.flatMap((record) => [
    { id: `j.${record.objective}`, claimKind: 'observation', text: `I checked what the two date faces for ${record.accession} describe. The reader has a guide and I have the signed source receipt.` },
    { id: `j.${record.civicObjective}`, claimKind: 'observation', text: `Civic Dispatch used the receipt for ${record.accession}. The other date stayed on the back.` },
  ]),
  hints: DATE_REGISTER_CASES.flatMap((record) => [
    { objective: record.objective, texts: [
      'Keep the exact object number beside both dates.',
      'Visit the exhibit and its two-faced stand in the Lantern House register room.',
      'Open both faces and fasten their two dates. Name the event that each face records.',
      'Leave the open guide with Eneth or carry the event line to Caren’s strip box.',
    ] },
    { objective: record.civicObjective, texts: [
      'The receipt carries the difference between the two dates.',
      'Bring the signed copy to Civic Dispatch after one of the seagrass readers has signed.',
      'Ask how Elwen would use the version the first reader signed.',
      'Fit the proven front face to Elwen’s object guide or event register.',
    ] },
  ].flatMap(({ objective, texts }) => texts.map((text, index) => ({ id: `h.${objective}.${index + 1}`, objective, depth: (index + 1) as Hint['depth'], text })))),
} satisfies Partial<ContentPack>;

export function rangeCaption(record: DateRegisterCase): string {
  const gap = dateRegisterGap(record);
  const order = registerOrder(gap);
  if (order === 'later') {
    const years = gap.first === gap.last ? `${gap.first}` : `${gap.first} to ${gap.last}`;
    return `The event follows the making bounds by ${years} calendar years. The folio keeps the published date wording.`;
  }
  if (order === 'earlier') return 'The earlier source predates the finished work. The folio keeps both dates with their own records.';
  return 'The event year touches the making bounds. A dated collection entry establishes the object was present by then. An exact making date remains open.';
}
