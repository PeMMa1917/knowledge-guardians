import type { Condition, ContentPack, DialogueNode, Effect, Hint, Objective } from '../domain/types';
import { BADGE_ROOM_OPEN } from './tokBadges';

export const ORACLE_PRESS = 'oracle-press';
export const oracleFlag = (name: string, eq: boolean | string = true): Condition => ({ flag: 'oracle.' + name, eq });
const set = (name: string, value: boolean | string = true): Effect => ({ setFlag: 'oracle.' + name, value });
const all = (...conditions: Condition[]): Condition => ({ all: conditions });
const guard = (...conditions: Condition[]): Condition => all(BADGE_ROOM_OPEN, ...conditions);
const before = (name: string): Condition => ({ not: { flagSet: 'oracle.' + name } });
const objective = (id: string): Condition => ({ objective: 'oracle.' + id });

const objects = [
  ['examples', 'Compare two example packets in the same reader.', oracleFlag('run.broad'), ['evidence', 'objectivity', 'explanation']],
  ['switch', 'Run the same four slips using both reading rules.', oracleFlag('run.stamp'), ['objectivity', 'explanation', 'justification']],
  ['holdout', 'Check both sealed slips against what the readers returned.', oracleFlag('checked'), ['truth', 'certainty', 'responsibility']],
  ['brief', 'Use both fixed press briefs on the signed landing record.', all(oracleFlag('brief.direction'), oracleFlag('brief.trace')), ['interpretation', 'perspective', 'certainty']],
  ['trace', 'Lay the polished cut against the original and its job slip.', oracleFlag('trace.closed'), ['truth', 'power', 'interpretation']],
  ['custody', 'Set a notice that respects its source permissions.', { flagSet: 'oracle.consent' }, ['power', 'values', 'responsibility']],
  ['publish', 'Carry the checked result to one working reading stand.', { flagSet: 'oracle.readback' }, ['justification', 'responsibility', 'perspective']],
] as const;

const dialogues: DialogueNode[] = [
  { id: 'oracle.keeper', speaker: 'oracle-keeper', historicalLabel: 'fictional-world',
    text: 'An old press made these four calls look final. Thessa is moving the wrong queue. Keep the slips and see what changes when you switch the press.' },
  { id: 'oracle.press', speaker: 'oracle-keeper', historicalLabel: 'fictional-world',
    text: 'The reader sorts by a feature on the wrapper. The keeper’s file has the reasons. We can see where the machine does and does not belong.', options: [
      { text: 'Put the first example packet through on wrapper ink.', if: guard(before('run.narrow')), effects: [set('run.narrow')] },
      { text: 'Add the two counterexamples and keep the ink rule.', if: guard(oracleFlag('run.narrow'), before('run.broad')), effects: [set('run.broad')] },
      { text: 'Use the same packet and switch to the stamp rule.', if: guard(oracleFlag('run.broad'), before('run.stamp')), effects: [set('run.stamp')] },
      { text: 'Pin the press calls beside the two disagreements.', if: guard(objective('switch'), oracleFlag('held.rail'), oracleFlag('held.shelter'), before('checked')),
        effects: [set('checked')] },
      { text: 'Press the short direction for a walking reader.', if: guard(oracleFlag('checked'), before('brief.direction')), effects: [set('brief.direction')] },
      { text: 'Press the source account for a desk reader.', if: guard(oracleFlag('checked'), before('brief.trace')), effects: [set('brief.trace')] },
      { text: 'Put the old print and the polished cut together.', if: guard(oracleFlag('cut.log'), oracleFlag('cut.original'), before('trace.closed')),
        effects: [set('trace.closed')] },
      { text: 'Fit only the approved excerpt to a public notice.', if: guard(objective('brief'), objective('trace'), oracleFlag('permission'), before('consent')),
        effects: [set('consent', 'excerpt'), set('route', 'walk')] },
      { text: 'Send the approved excerpt to a staffed desk with its source tab.', if: guard(objective('brief'), objective('trace'), oracleFlag('permission'), before('consent')),
        effects: [set('consent', 'desk'), set('route', 'desk')] },
    ] },
  { id: 'oracle.notice.walk', speaker: 'oracle-reader', historicalLabel: 'fictional-world',
    text: 'I have a short direction from the rail now. The excerpt tells me which steps were checked. The source tab tells a future keeper who approved the copy.', options: [
      { text: 'Set the checked direction by the rail.', if: guard(oracleFlag('route', 'walk'), before('readback')), effects: [set('readback', 'walk')] },
    ] },
  { id: 'oracle.notice.desk', speaker: 'oracle-reader', historicalLabel: 'fictional-world',
    text: 'I can sit down with the checked excerpt. The source tab gets its own place. A visitor who needs the steps can ask how to get to them.', options: [
      { text: 'Bind the approved excerpt beside the source tab.', if: guard(oracleFlag('route', 'desk'), before('readback')), effects: [set('readback', 'desk')] },
    ] },
];

const objectives: Objective[] = objects.map(([id, title, done, tags]) => ({
  id: 'oracle.' + id, title, essential: false, done, onComplete: id === 'publish' ? [{ journal: 'j.oracle.publish' }] : undefined,
  weave: { concepts: [...tags],
    framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'],
    thinking: { dok: id === 'publish' ? 3 : 2, bloom: id === 'holdout' ? 'analyse' : 'apply', fink: 'application', solo: 'relational' },
    atl: ['research', 'thinking', 'communication'], aoks: ['HUM', 'TEC', 'LAN'], subjects: ['computer-science', 'digital-society'], minutes: id === 'publish' ? 3 : 2 },
}));

const hintText: Record<string, string[]> = {
  examples: ['The wrapper can matter to the sorter.', 'Begin with the two old examples at the press.', 'Try the new examples without changing the rule.', 'Keep both press runs and see which calls changed.'],
  switch: ['Keep the example packet fixed.', 'Compare ink and the outer stamp on the same four slips.', 'Change only the reader rule after the broader packet.', 'Run the stamp rule on the same packet and set its results beside the ink run.'],
  holdout: ['A receipt can be attached to a different claim.', 'Check the two sealed source slips in the cabinet.', 'One signature travelled and another stayed in the keeper’s book.', 'Clip the two checked disagreements beside the press calls.'],
  brief: ['Readers need more than one kind of help.', 'Use the two briefing inserts above the press.', 'Keep the signed check fixed while changing the press instruction.', 'Press both the walking direction and the sourced desk account.'],
  trace: ['Compare the print before and after it was shortened.', 'Find the body of the old notice and the press job slip.', 'Keep the older time and use condition visible while you lay the print beside it.', 'Lay the polished cut beside its old record. Keep the missing trial limit.'],
  custody: ['Find out which copy the keeper allowed out.', 'Read the keeper’s permission sign.', 'Compare the walking route and the staffed desk for the approved excerpt.', 'Either placement keeps the private note in its sleeve. Choose for the reader you want to help.'],
  publish: ['The permission route has an actual stand.', 'Look for the west rail or the east source desk.', 'Read the notice at the stand your layout reached.', 'Set the signed copy in that stand yourself, and see what the reader can now check.'],
};

export const oraclePressContent = {
  characters: [
    { id: 'oracle-keeper', name: 'Nerin Ashbank', role: 'Keeps the old mechanical press and its example slips', mode: 'fictional',
      sprite: 'villager-1', talk: [{ node: 'oracle.keeper' }] },
    { id: 'oracle-reader', name: 'Thessa Dovetail', role: 'Routes the maintenance crew after the bell', mode: 'fictional',
      sprite: 'villager-2', talk: [{ node: 'oracle.reader' }] },
  ],
  dialogue: [...dialogues,
    { id: 'oracle.reader', speaker: 'oracle-reader', historicalLabel: 'fictional-world',
      text: 'I need the one working route. Yesterday’s copy said “always”. The crew arrived while I was still checking the lower steps.' }],
  missions: [{ id: 'KG-CH1-R38', world: 'WORLD-01', title: 'The Press and the Keeper', available: BADGE_ROOM_OPEN,
    stake: 'Thessa must send the maintenance crew to the checked steps. The press can read a wrapper much faster than Nerin can open the old records.',
    knowledgeQuestion: 'What separate work must a keeper do before a tool’s quick output can guide other people?', objectives }],
  journal: [{ id: 'j.oracle.publish', claimKind: 'observation',
    text: 'I compared two example sets and two fixed reading rules. Then I kept the source check, the missing limit on the cut and the keeper’s permission with the notice.' }],
  hints: objectives.flatMap(({ id }) => hintText[id.slice(7)].map((text, index) =>
    ({ id: `h.${id}.${index + 1}`, objective: id, depth: (index + 1) as Hint['depth'], text }))),
} satisfies Partial<ContentPack>;
