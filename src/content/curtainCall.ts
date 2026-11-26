import type { CallStation } from '../domain/curtainCall';
import type { Condition, ContentPack, DialogueNode, Hint, Objective } from '../domain/types';

export const CURTAIN_PREFIX = 'curtain-call:';
export const CURTAIN_STATIONS = ['open', 'curtain', 'marks', 'felt'] as const;
export const callFlag = (name: string, eq: string | number | boolean = true): Condition => ({ flag: 'curtain.' + name, eq });
const all = (...conditions: Condition[]): Condition => ({ all: conditions });
const not = (condition: Condition): Condition => ({ not: condition });
const put = (name: string, value: string | number | boolean = true) => ({ setFlag: 'curtain.' + name, value });
export const CURTAIN_REWARD = {
  marks: { id: 'item.curtain.trace-board', name: 'Ethren’s tick-board', art: 'preserved.slip',
    description: 'Its three slots keep a visible count beside an unchanged call. Fit it to the demonstration rail at the Nile Workmen’s Room.' },
  felt: { id: 'item.curtain.felt', name: 'The folded latch felt', art: 'nile.scroll',
    description: 'The pad fits under a small demonstration latch. Try it at the Nile Workmen’s Room, where a latch can cover the middle tap.' },
} as const;

export const callReady = (station: CallStation): Condition =>
  station === 'open' || station === 'curtain' ? callFlag('started') : { item: CURTAIN_REWARD[station].id };

const dock = (route: 'marks' | 'felt') => callFlag('layout', route);
const read = (route: 'marks' | 'felt') => callFlag('read', route);
const pending = not({ flagSet: 'curtain.layout' });
const repeated = (station: CallStation) => callFlag(station, 3);
const both = all(callFlag('open.compared'), callFlag('curtain.compared'));

export function curtainCallEntries(game: string): string[] {
  return CURTAIN_STATIONS.flatMap((station) => game === CURTAIN_PREFIX + station ? [`curtain.run.${station}`] : []);
}

const pulses: DialogueNode[] = CURTAIN_STATIONS.map((station) => ({
  id: `curtain.run.${station}`, speaker: 'narrator', historicalLabel: 'fictional-world',
  text: 'One knock at a time. Keep the same gaps.', options: [
    ...[0, 1, 2, 3].map((total) => ({
      text: total === 3 ? 'Set the striker back at the starting mark.' : 'Tap the striker once.',
      if: all(callReady(station), total === 0
        ? { any: [not({ flagSet: 'curtain.' + station }), callFlag(station, 0)] }
        : callFlag(station, total)),
      effects: [put(station, total === 3 ? 0 : total + 1), ...(total === 2 ? [put(station + '.compared')] : [])],
    })),
    ...((station === 'felt' || station === 'marks') ? [{
      text: 'Give Leila the checked handover.',
      if: all(callReady(station), repeated(station), not({ flagSet: 'curtain.nile' })),
      effects: [put('nile', station)],
    }] : []),
  ],
}));

const subjects = ['music', 'physics', 'digital-society'];
const objectives: Objective[] = [
  { id: 'curtain.compare', title: 'Hear the same three taps from the open rail and behind the curtain.', essential: false,
    visible: callFlag('started'), done: all(callFlag('open.compared'), callFlag('curtain.compared')),
    weave: { concepts: ['evidence', 'objectivity', 'explanation', 'perspective'], framework: ['perspectives', 'methods-and-tools'],
      thinking: { dok: 2, bloom: 'analyse', fink: 'application', solo: 'relational' }, atl: ['thinking', 'communication'],
      aoks: ['NAT', 'ART'], subjects, minutes: 3 } },
  { id: 'curtain.receive', title: 'Help Ethren and hear how a caller used the change.', essential: false,
    visible: { objective: 'curtain.compare' }, done: { flagSet: 'curtain.read' },
    weave: { concepts: ['certainty', 'values', 'culture', 'power', 'responsibility'], framework: ['scope', 'perspectives', 'ethics'],
      thinking: { dok: 2, bloom: 'apply', fink: 'human', solo: 'relational' }, atl: ['social', 'communication'],
      aoks: ['HUM', 'ART'], subjects, minutes: 2 } },
  { id: 'curtain.workmen', title: 'Fit Ethren’s gift to the Workmen’s handover and check how Leila can use it.', essential: false,
    visible: { flagSet: 'curtain.gift' }, done: { flagSet: 'curtain.nile' },
    onComplete: [{ journal: 'j.curtain.workmen' }],
    weave: { concepts: ['evidence', 'objectivity', 'culture', 'responsibility'], framework: ['methods-and-tools', 'perspectives', 'ethics'],
      thinking: { dok: 2, bloom: 'apply', fink: 'integration', solo: 'relational' }, atl: ['social', 'thinking', 'communication'],
      aoks: ['NAT', 'ART', 'HUM'], subjects, minutes: 3 } },
];

const hints = [
  ['Look for Ethren’s two marked stations near the south wall.', 'Tap the same striker from each station.', 'The second tap falls at the same place each time.', 'Finish the three taps at each station. Keep what the caller heard beside what you sent.'],
  ['One support can help more than one reader.', 'Take the two readings back to Ethren.', 'A raised mark gives a parallel cue. A pad keeps the latch from covering a tap.', 'Either fix is useful. Try the changed station and listen to the person who needed it.'],
  ['The signed gift can be used in another room.', 'Take it to the demonstration rail in the Workmen’s Room.', 'Use your gift and repeat the original three knocks.', 'Carry the complete check to Leila. The working cue stays on her rail.'],
];

export const curtainContent = {
  characters: [{ id: 'curtain-ethren', name: 'Ethren Moor', role: 'A runner learning the Archive Hall’s call from the work crews',
    mode: 'fictional', sprite: 'villager-2', talk: [
      { node: 'curtain.thanks', if: { flagSet: 'curtain.read' } }, { node: 'curtain.plan', if: all(both, pending) }, { node: 'curtain.hello' },
    ] }],
  dialogue: [
    { id: 'curtain.hello', speaker: 'curtain-ethren', historicalLabel: 'fictional-world',
      text: 'At our family’s ferry, two knocks mean take the weight. The Archive crew waits for three. I heard two and pulled. Try my striker from both places before somebody calls me careless.',
      options: [{ text: 'Mark the two places and hold the same pace.', if: not(callFlag('started')), effects: [put('started')] }] },
    { id: 'curtain.plan', speaker: 'curtain-ethren', historicalLabel: 'fictional-world',
      text: 'It was three all along. The latch clicked over the middle one behind the curtain. I can raise a tick with each knock, or pad the latch where it clicks.',
      options: [
        { text: 'Set three visible ticks beside the open rail.', if: all(both, pending), effects: [put('layout', 'marks')] },
        { text: 'Slide a pad under the curtain latch.', if: all(both, pending), effects: [put('layout', 'felt')] },
      ] },
    { id: 'curtain.read.marks', speaker: 'curtain-ethren', historicalLabel: 'fictional-world',
      text: 'The latch still has its old click. I can see each tick at the open rail and stop the box until the last one. My hands know where to wait again.',
      options: [{ text: 'Wait with Ethren for the third tick.', if: dock('marks'), effects: [put('read', 'marks')] }] },
    { id: 'curtain.read.felt', speaker: 'curtain-ethren', historicalLabel: 'fictional-world',
      text: 'The latch closes on the felt now. Over here I heard all three knocks. I can wait in this quiet corner without having to ask somebody to call out my mistake.',
      options: [{ text: 'Wait with Ethren for the third tap.', if: dock('felt'), effects: [put('read', 'felt')] }] },
    { id: 'curtain.thanks', speaker: 'curtain-ethren', historicalLabel: 'fictional-world',
      text: 'You came back to see my side. I put a spare in the little chest. Take it if another keeper can use it.' },
    ...(['marks', 'felt'] as const).map((route): DialogueNode => ({
      id: `curtain.gift.${route}`, speaker: 'curtain-ethren', historicalLabel: 'fictional-world',
      text: route === 'marks' ? 'I made a second board from the offcut. Its three grooves keep their own count.'
        : 'The rest of the felt is dry. It will fit under another small latch.',
      options: [{ text: `Take ${route === 'marks' ? 'the spare tick-board' : 'the spare felt'}.`,
        if: all(read(route), not({ flagSet: 'curtain.gift' })), effects: [{ giveItem: CURTAIN_REWARD[route].id }, put('gift', route)] }],
    })),
    ...pulses,
  ],
  items: Object.values(CURTAIN_REWARD).map((item) => ({ ...item, historicalLabel: 'fictional-world' })),
  missions: [{ id: 'KG-CH1-R43', world: 'WORLD-01', title: 'The Call behind the Curtain',
    stake: 'Ethren has to carry a case with someone he cannot see. Another missed cue could make him give up the shift.',
    knowledgeQuestion: 'How do conditions at the receiving end alter what people can fairly say they heard?', objectives }],
  awards: [{ id: 'award.curtain.keeper', kind: 'badge', name: 'The Third Knock', title: 'Keeper of the Third Knock',
    earnedBy: 'Helped Ethren and used a checked cue at the Nile Workmen’s Room.', when: { objective: 'curtain.workmen' }, criteria: [] }],
  journal: [{ id: 'j.curtain.workmen', claimKind: 'observation',
    text: 'Ethren’s gift changed what a runner could use at the demonstration rail. The received signal and the original call each have a clear line.' }],
  hints: objectives.flatMap(({ id }, row) => hints[row].map((text, i) => ({
    id: `h.${id}.${i + 1}`, depth: (i + 1) as Hint['depth'], text, objective: id,
  }))),
} satisfies Partial<ContentPack>;
