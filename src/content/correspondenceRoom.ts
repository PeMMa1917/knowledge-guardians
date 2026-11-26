import { specimenEquipped } from '../domain/specimenGear';
import type { Condition, ContentPack, DialogueNode, Effect, Hint, Objective, Weave } from '../domain/types';
import records from './correspondence-specimens.json';

export const CORRESPONDENCE_OPEN: Condition = { objective: 'copies.arrival' };
export const CORRESPONDENCE_KEEPER = 'correspondence-mera';
export const CORRESPONDENCE_READER = 'correspondence-ansel';
export const CORRESPONDENCE_LAST = 'correspondence.last';
export const CORRESPONDENCE_RETURN = 'correspondence.last-return';
const CURRENT = 'correspondence.current';
const LAYOUT = 'correspondence.last-layout';
const EMPTY = 'shelf';
export const CORRESPONDENCE_PLANS = ['front', 'fold'] as const;
export type CorrespondencePlan = typeof CORRESPONDENCE_PLANS[number];

export const CORRESPONDENCE_CASES = records.map((record) => ({
  ...record,
  flag: `correspondence.${record.slug}`,
  exhibit: `OBJ-CORRESPONDENCE-${record.slug.toUpperCase()}`,
  source: `HIS-CORRESPONDENCE-${record.slug.toUpperCase()}`,
  card: `card.correspondence.${record.slug}`,
  objective: `correspondence.${record.slug}.delivered`,
  revisit: {
    map: 'nexus.archive', prop: `correspondence-nexus-${record.slug}`,
    method: record.use,
    hint: 'Carry and equip this working copy at Venn’s spare letter stand on the east side of the Nexus.',
  },
}));
export type CorrespondenceCase = (typeof CORRESPONDENCE_CASES)[number];

const all = (...conditions: Condition[]): Condition => ({ all: conditions });
const not = (condition: Condition): Condition => ({ not: condition });
const flagIs = (flag: string, eq: string): Condition => ({ flag, eq });
export const letterEmpty: Condition = { any: [not({ flagSet: CURRENT }), flagIs(CURRENT, EMPTY)] };
export const letterCurrent = (record: CorrespondenceCase): Condition => flagIs(CURRENT, record.slug);
export const letterPlan = (record: CorrespondenceCase, plan: CorrespondencePlan): Condition => flagIs(`${record.flag}.layout`, plan);
export const letterDone = (record: CorrespondenceCase, plan: CorrespondencePlan): Condition => flagIs(record.objective, plan);
export const letterReturned = (record: CorrespondenceCase): Condition => ({ flag: `${record.flag}.used`, eq: true });
export const letterDisplay = (plan: CorrespondencePlan): Condition => all(letterEmpty, flagIs(LAYOUT, plan));
const answered = (record: CorrespondenceCase): Condition => ({ flag: `${record.flag}.answered`, eq: true });
const planned = (record: CorrespondenceCase): Condition => ({ any: CORRESPONDENCE_PLANS.map((plan) => letterPlan(record, plan)) });
const draftReady = (record: CorrespondenceCase): Condition => all(letterCurrent(record), not(planned(record)));
const replyReady = (record: CorrespondenceCase, plan: CorrespondencePlan): Condition =>
  all(letterCurrent(record), letterPlan(record, plan), not(answered(record)));
const fastened = (record: CorrespondenceCase, plan: CorrespondencePlan): Condition => all(letterCurrent(record), letterPlan(record, plan), answered(record));
export const correspondenceCompose: Condition = { any: CORRESPONDENCE_CASES.map(draftReady) };
export const correspondenceReply = (plan: CorrespondencePlan): Condition => ({ any: CORRESPONDENCE_CASES.map((record) => replyReady(record, plan)) });
export const correspondenceSeal: Condition = { any: CORRESPONDENCE_CASES.flatMap((record) => CORRESPONDENCE_PLANS.map((plan) => fastened(record, plan))) };

const stop = (flag: string, value: string | boolean = true): Effect => ({ setFlag: flag, value });
function fiction(id: string, text: string, speaker = CORRESPONDENCE_KEEPER): DialogueNode {
  return { id, text, speaker, historicalLabel: 'fictional-world' };
}

const methods: Record<string, { compose: string; issue: string; weave: Pick<Weave, 'subjects' | 'concepts'> }> = {
  address: {
    compose: 'Put the named reader in the address pocket. The place mark stays with the part that person will carry.',
    issue: 'This line has two names. Show me which person will handle the note and which name belongs in the sender’s line.',
    weave: { subjects: ['history', 'lang-ab-initio', 'lang-langlit'], concepts: ['culture', 'interpretation', 'responsibility', 'evidence'] },
  },
  form: {
    compose: 'Put the guide marks alongside the same opening line. A reader can follow the small clue without mistaking it for a second instruction.',
    issue: 'This looks like another order because it has another set of marks. Show me where both guides return to the same line.',
    weave: { subjects: ['classics', 'lang-b', 'visual-arts'], concepts: ['evidence', 'interpretation', 'perspective', 'objectivity'] },
  },
  meaning: {
    compose: 'Keep the everyday instruction separate from the longer rendering. Leave a tab for the condition that the shorter wording might lose.',
    issue: 'I can do what the small line says. I need to know where it stops applying before I carry it outside.',
    weave: { subjects: ['lang-b', 'lang-ab-initio', 'history'], concepts: ['certainty', 'culture', 'explanation', 'justification'] },
  },
  credit: {
    compose: 'Keep the earlier voice beside the person who copied it. Hold the two job tabs in different slots.',
    issue: 'The two attributions will fit on one strip. Show me where the new reader or translator’s work begins.',
    weave: { subjects: ['classics', 'lang-langlit', 'lang-b'], concepts: ['power', 'values', 'truth', 'responsibility'] },
  },
};

function sealResult(record: CorrespondenceCase, plan: CorrespondencePlan): string {
  return plan === 'front'
    ? `The runner’s note is signed at the short rail. ${record.answer} The keeper can unfold the source from its pocket if someone asks how the line was checked.`
    : `The paired wrapper is signed at the staffed desk. ${record.answer} Ansel leaves both forms open for the reader who comes after this round.`;
}

function caseScenes(record: CorrespondenceCase): DialogueNode[] {
  return [
    { ...fiction(`${record.flag}.take`, `We can borrow a method from ${record.accession} for today’s letter run. ${record.basis} The new note is ours. ${methods[record.kind].compose}`),
      options: [{ text: 'Take the working slip to the folding bench.', if: all(letterEmpty, not({ objective: record.objective })),
        effects: [stop(CURRENT, record.slug), stop(`${record.flag}.layout`, EMPTY), stop(`${record.flag}.answered`, false)] },
        { text: 'Rest the slip beside the object.' }] },
    { ...fiction(`${record.flag}.cancel`, 'You can rehang the working slip and free the bench for a different letter. Keep its museum record in your journal.'),
      options: [{ text: 'Rehang the practice slip.', if: letterCurrent(record), effects: [stop(CURRENT, EMPTY)] }, { text: 'Keep carrying this slip.' }] },
    ...CORRESPONDENCE_PLANS.map((plan) => fiction(`${record.flag}.${plan}`, sealResult(record, plan), CORRESPONDENCE_READER)),
    fiction(`${record.flag}.answer`, `${record.answer} Take my signed return to the centre hook. I want the next runner to know what the note actually did.`, CORRESPONDENCE_READER),
    { ...fiction(`${record.flag}.nexus`, `There is a shortened note waiting on the east stand. Your working copy of ${record.accession} gives us another way to show ${record.returnFocus}.`, 'clerk-venn'),
      options: [{ text: record.use, if: all(specimenEquipped(record.key), not(letterReturned(record))),
        effects: [stop(`${record.flag}.used`), stop(CORRESPONDENCE_RETURN, record.slug), { journal: `j.${record.flag}.nexus` }], next: `${record.flag}.nexus-read` },
        { text: 'Leave Venn’s spare stand open.' }] },
    fiction(`${record.flag}.nexus-read`, record.returnResult, 'clerk-venn'),
  ];
}

function preparedLetter(record: CorrespondenceCase, plan: CorrespondencePlan): string {
  const lines = plan === 'front'
    ? `The wrapper reads “${record.outside}” The longer line sits under the flap.`
    : `The open fold puts “${record.outside}” next to the longer line. ${record.inside}`;
  return `${lines} ${methods[record.kind].issue}`;
}

function receiveScene(plan: CorrespondencePlan): DialogueNode {
  return {
    ...fiction(`correspondence.receive-${plan}`, plan === 'front' ? 'At the short rail I can read the outer line straight away. Read it back with me before I move the next bundle.' : 'I can hold the two folds open at the desk. Point to what this reader can actually take away.', CORRESPONDENCE_READER),
    options: [
      ...CORRESPONDENCE_CASES.map((record) => ({ text: record.check, if: replyReady(record, plan),
        effects: [stop(`${record.flag}.answered`)], next: `${record.flag}.answer` })),
      { text: 'Leave the receiver’s clip open.' },
    ],
  };
}

const objectives: Objective[] = CORRESPONDENCE_CASES.map((record) => ({
  id: record.objective, title: `Deliver and check the practice letter for ${record.accession}.`, visible: { card: record.card }, essential: false,
  done: { any: CORRESPONDENCE_PLANS.map((plan) => letterDone(record, plan)) },
  weave: { ...methods[record.kind].weave, framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'], aoks: ['LAN', 'HIS', 'HUM'],
    atl: ['communication', 'research', 'social'], thinking: { dok: 3, bloom: 'apply', fink: 'integration', solo: 'relational' }, minutes: 6 },
}));

export const correspondenceRoomContent = {
  characters: [
    { id: CORRESPONDENCE_KEEPER, name: 'Mera Fletch', sprite: 'villager-2', role: 'Prepares the day’s letters at the Records Hall', mode: 'fictional',
      talk: [{ node: 'correspondence.mera' }] },
    { id: CORRESPONDENCE_READER, name: 'Ansel Dhurr', sprite: 'villager-1', role: 'Checks the names and handoffs on incoming letters', mode: 'fictional',
      talk: [{ node: 'correspondence.ansel' }] },
  ],
  dialogue: [
    fiction('correspondence.mera', 'The note said to bring the linen to the second window. A very good reader brought the window with it. Pick a reference you can use to help our next runner.'),
    fiction('correspondence.ansel', 'I can use one clear line in a hurry. Give me room to ask where it came from if I’m about to take somebody else’s bundle.', CORRESPONDENCE_READER),
    { ...fiction('correspondence.compose', 'The flap has a single fast line on its outside. The wider fold can leave two lines open on a staffed desk.'),
      options: [...CORRESPONDENCE_CASES.flatMap((record) => CORRESPONDENCE_PLANS.map((plan) => ({
        text: plan === 'front' ? 'Clip a short direction to the wrapper for the west rail.' : 'Set the paired wording on the fold for the east desk.',
        if: draftReady(record), effects: [stop(`${record.flag}.layout`, plan)], next: `${record.flag}.dispatch-${plan}`,
      }))), { text: 'Leave the folding bench open.' }] },
    ...CORRESPONDENCE_CASES.flatMap((record) => CORRESPONDENCE_PLANS.map((plan) =>
      fiction(`${record.flag}.dispatch-${plan}`, preparedLetter(record, plan), CORRESPONDENCE_READER))),
    ...CORRESPONDENCE_PLANS.map(receiveScene),
    { ...fiction('correspondence.seal', 'The receiver’s note is back. Clip their signed readback with the source so the two go to the next worker together.'),
      options: [...CORRESPONDENCE_CASES.flatMap((record) => CORRESPONDENCE_PLANS.map((plan) => ({
        text: 'Attach Ansel’s reply and seal the handoff.', if: fastened(record, plan),
        effects: [stop(record.objective, plan), stop(CURRENT, EMPTY), stop(LAYOUT, plan), stop(CORRESPONDENCE_LAST, record.slug),
          { journal: `j.${record.flag}.${plan}` }], next: `${record.flag}.${plan}`,
      }))), { text: 'Leave the outgoing hook open.' }] },
    ...CORRESPONDENCE_CASES.flatMap(caseScenes),
  ],
  sources: CORRESPONDENCE_CASES.map((record) => ({ id: record.source, title: `${record.institution}, ${record.accession}`, url: record.url,
    locator: 'Exact accession, object date, catalogue description and documentation for the named readers or makers', supports: record.fact, accessed: '2026-11-26' })),
  exhibits: CORRESPONDENCE_CASES.map((record) => ({ id: record.exhibit, name: record.title, art: record.asset ? 'collection-stand' : 'correspondence.crowther-book', historicalLabel: 'documented',
    dateText: record.date, dateKind: record.dateKind, summary: `${record.languages}. ${record.fact}`, altText: record.alt, sources: [record.source], grantsCard: record.card,
    specimen: { key: record.key, institution: record.institution, accession: record.accession, source: record.source,
      objective: record.objective, ...(record.asset ? { pixelAsset: record.asset } : {}), revisit: record.revisit } })),
  cards: CORRESPONDENCE_CASES.map((record) => ({ id: record.card, title: `${record.title} · ${record.accession}`, historicalLabel: 'documented',
    claimKind: 'observation', text: record.fact, limits: record.limit, sources: [record.source] })),
  missions: [{ id: 'KG-CH7-R42', title: 'Which Part of the Letter Travels?', world: 'WORLD-08', available: CORRESPONDENCE_OPEN,
    knowledgeQuestion: 'What does the next reader need in order to act on a letter and recover its grounds?',
    stake: 'The hall can reach a runner quickly at the west rail, or open a fuller copy at the staffed east desk. The earlier record still needs its own place.',
    objectives, caseVisits: objectives.map(({ id }) => [id]) }],
  hints: CORRESPONDENCE_CASES.flatMap((record) => [
    'Keep the source with the part a reader needs for the next action.', `Open the display for ${record.accession} and take its working slip.`,
    'Use the folding bench. Try the west rail for a short outside line or the east desk to keep both forms open.',
    'Check what Ansel heard and bring the signed reply to the centre hook. Claim the copy and equip it for Venn’s east stand in the Nexus.',
  ].map((text, index) => ({ id: `h.${record.flag}.${index + 1}`, objective: record.objective, text, depth: (index + 1) as Hint['depth'] }))),
  journal: CORRESPONDENCE_CASES.flatMap((record) => [
    { id: `j.${record.flag}.front`, claimKind: 'observation' as const,
      text: `I sent a short line to the rail with the source for ${record.accession} folded inside. The returned note tells me what Ansel could do.` },
    { id: `j.${record.flag}.fold`, claimKind: 'observation' as const,
      text: `I took both forms to the staffed desk with the source for ${record.accession}. Ansel opened the joint copy and sent back a signed reply.` },
    { id: `j.${record.flag}.nexus`, claimKind: 'observation' as const,
      text: `I carried the working copy for ${record.accession} back to the Nexus. ${record.returnResult}` },
  ]),
} satisfies Partial<ContentPack>;
