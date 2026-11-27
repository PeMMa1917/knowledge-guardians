import type { ContentPack, Hint, Objective } from '../domain/types';

const rack: Objective = {
  id: 'parcel.rack', title: 'Find out how the seal slips were sorted.', essential: false,
  done: { all: [{ flagSet: 'parcel.keeper' }, { flagSet: 'parcel.spring' }] },
  weave: { concepts: ['evidence', 'certainty', 'explanation', 'objectivity'], framework: ['scope', 'methods-and-tools'],
    atl: ['research', 'thinking'], aoks: ['MAT', 'HUM', 'TEC'], subjects: ['math-ai', 'psychology'], minutes: 3,
    thinking: { dok: 2, bloom: 'analyse', fink: 'application', solo: 'relational' } },
  onComplete: [{ journal: 'j.parcel.rack' }],
};
const roll: Objective = {
  id: 'parcel.roll', title: 'Reopen the claim on the torn wrapper.', essential: false,
  done: { all: [{ flagSet: 'parcel.named' }, { flagSet: 'parcel.pairs' }] },
  weave: { concepts: ['interpretation', 'perspective', 'justification', 'evidence'], framework: ['methods-and-tools', 'perspectives'],
    atl: ['research', 'thinking'], aoks: ['MAT', 'HUM', 'LAN'], subjects: ['math-ai', 'psychology'], minutes: 3,
    thinking: { dok: 2, bloom: 'apply', fink: 'integration', solo: 'relational' } },
  onComplete: [{ journal: 'j.parcel.roll' }],
};
const reply: Objective = {
  id: 'parcel.reply', title: 'Make room for the second claimant.', essential: false,
  visible: { all: [{ objective: rack.id }, { objective: roll.id }] },
  done: { all: [{ objective: rack.id }, { objective: roll.id }, { flag: 'parcel.reply', in: ['desk', 'token'] }] },
  weave: { concepts: ['power', 'values', 'responsibility', 'justification'], framework: ['ethics', 'perspectives'],
    atl: ['communication', 'social'], aoks: ['MAT', 'HUM', 'POL'], subjects: ['math-ai', 'global-politics'], minutes: 2,
    thinking: { dok: 3, bloom: 'evaluate', fink: 'caring', solo: 'relational' } },
};
const hints = {
  [rack.id]: ['One seal. Two ways of opening a drawer.', 'Find the brass seal rack along the west side of the Ledger Room.',
    'Pin any drawer. Lella can see the contents. The spring opens a drawer by position.', 'Pull both handles. Count the slips that show the seal before a runner can move.'],
  [roll.id]: ['A second runner kept the same kind of tag.', 'Find the torn queue roll on the east side of the Ledger Room.',
    'Anchor the thread at Lella’s tag. Then let it run through the whole row.', 'Try both searches on the torn roll. The spare roll lets you see a different pair.'],
  [reply.id]: ['Someone is still waiting on the stair.', 'Compare both drawer rules and both searches on the torn roll.',
    'Bring your reading to the little return slot on the south wall.', 'Leave two unmarked tokens or pull up a chair. You can change the arrangement here later.'],
};
export const parcelLedgerContent = {
  dialogue: [
    { id: 'parcel.lella.desk', speaker: 'number-leaf-lella', historicalLabel: 'fictional-world',
      text: 'See that ring on the floor? My lamp leaked wax. I kept saying I could work the whole queue alone. Omrin took the wick out of my hand when it burned low. I let him.' },
    { id: 'parcel.omrin.desk', speaker: 'number-leaf-omrin', historicalLabel: 'fictional-world',
      text: 'That runner could describe the tear down to the bit of green thread. I would have sworn nobody else had handled it. Lella, will you sit with me again tomorrow?' },
    { id: 'parcel.lella.token', speaker: 'number-leaf-lella', historicalLabel: 'fictional-world',
      text: 'One of the tokens came back with a bit of bread wrapped round it. Someone noticed we missed supper. I left the other token on its hook. They can take their time.' },
    { id: 'parcel.omrin.token', speaker: 'number-leaf-omrin', historicalLabel: 'fictional-world',
      text: 'I used to call out the name and count the footsteps. There were none yesterday. Today I heard two sets stop outside. Can you sit here while I unlock it?' },
  ],
  missions: [{ id: 'KG-CH1-R99', world: 'WORLD-01', title: 'Two People for One Parcel',
    knowledgeQuestion: 'When does the way we searched change what a match can tell us?',
    available: { flagSet: 'parcel.open' },
    stake: 'The counter has closed one claim. Someone outside is still holding a piece of its wrapper.',
    objectives: [rack, roll, reply] }],
  journal: [
    { id: 'j.parcel.rack', claimKind: 'simulation', text: 'I heard six clicks each time. The spring let two seals fall straight into the tray. Lella had kept every seal hidden. I could finally tell why the two ledgers disagreed.' },
    { id: 'j.parcel.roll', claimKind: 'observation', text: 'I stretched the thread from Lella’s tag and found nobody. Then I ran it between the runners. Two moons lined up. Omrin took his hand off the CLOSED stamp.' },
  ],
  hints: Object.entries(hints).flatMap(([objective, lines]) => lines.map((text, i) =>
    ({ id: `h.${objective}.${i + 1}`, objective, depth: (i + 1) as Hint['depth'], text }))),
} satisfies Partial<ContentPack>;
