import { CUE_BEATS, CUE_PLANS, FACINGS, FACING_SITES, type CuePlan, type Facing, type FacingSite } from '../domain/facingCue';
import type { Condition, ContentPack, DialogueNode, Effect, Hint, Objective } from '../domain/types';

export const FACING_CUE_PREFIX = 'facing-cue:';
export const FACING_CUE_ITEM = 'item.facing-cue.slip';
export const FACING_CUE_COMPARE = 'nexus.facing.compare';
export const FACING_CUE_RECEIVE = 'nexus.facing.receive';
export const FACING_CUE_TRANSFER = 'stage.facing.transfer';

const readFlag = (name: string): Condition => ({ flagSet: name });
const all = (...conditions: Condition[]): Condition => ({ all: conditions });
const not = (condition: Condition): Condition => ({ not: condition });
const done = (objective: string): Condition => ({ objective });

export const FACING_HOUSE_READY = all({ item: FACING_CUE_ITEM }, done('stage.arrival'));
export const facingCueFlag = (site: FacingSite, key: string) => `facing.${site}.${key}`;
export const facingCueBeatNode = (site: FacingSite, facing: Facing) => facingCueFlag(site, `beat.${facing}`);
export const facingCuePlan = (site: FacingSite, plan: CuePlan): Condition => ({ flag: facingCueFlag(site, 'plan'), eq: plan });
export const facingCueChecked = (site: FacingSite): Condition => readFlag(facingCueFlag(site, 'checked'));
export const facingCuePlanNode = (site: FacingSite) => facingCueFlag(site, 'place');

const value = (site: FacingSite, key: string, value: string | number | boolean): Effect => ({ setFlag: facingCueFlag(site, key), value });
const beatFlag = (site: FacingSite, facing: Facing, count: number): Condition => ({ flag: facingCueFlag(site, facing), eq: count });
const rehearsed = (site: FacingSite): Condition => all(...FACINGS.map((facing) => readFlag(facingCueFlag(site, `seen.${facing}`))));
const ready = (site: FacingSite) => site === 'house' ? FACING_HOUSE_READY : { flagSet: 'facing.nexus.started' };

const beats: DialogueNode[] = FACING_SITES.flatMap((site) => FACINGS.map((facing) => ({
  id: facingCueBeatNode(site, facing),
  speaker: 'narrator',
  historicalLabel: 'fictional-world',
  text: 'The rehearsal starts on the centre mark.',
  options: Array.from({ length: CUE_BEATS.length + 1 }, (_, count) => ({
    text: count === CUE_BEATS.length ? 'Reset at the centre mark.' : `Play beat ${count + 1}.`,
    if: all(ready(site), count ? beatFlag(site, facing, count) :
      { any: [not(readFlag(facingCueFlag(site, facing))), beatFlag(site, facing, 0)] }),
    effects: [
      value(site, facing, count < CUE_BEATS.length ? count + 1 : 0),
      ...(count === CUE_BEATS.length - 1 ? [value(site, `seen.${facing}`, true)] : []),
    ],
  })),
})));

const plans: DialogueNode[] = FACING_SITES.map((site) => ({
  id: facingCuePlanNode(site),
  speaker: 'narrator',
  historicalLabel: 'fictional-world',
  text: 'Both facing marks have been tried. Decide what to put out for the next pair.',
  options: CUE_PLANS.map((plan) => ({
    text: site === 'nexus'
      ? plan === 'shared' ? 'Hang one lamp-side cue and work the lead-in.' : 'Slide a facing card into each entrance.'
      : plan === 'shared' ? 'Keep one cue at the lamp and staff the lead-in.' : 'Turn both cards for the new entrances.',
    if: all(ready(site), rehearsed(site), not(readFlag(facingCueFlag(site, 'plan')))),
    effects: [value(site, 'plan', plan)],
  })),
}));

const nexusReceipt = (plan: CuePlan): DialogueNode => ({
  id: `facing.nexus.read.${plan}`,
  speaker: 'facing-sella',
  historicalLabel: 'fictional-world',
  text: plan === 'shared'
    ? 'You tapped in the late runner and both of us landed beside the lamp together. The other hooks stayed free. I can work that lead-in next round, if you tell Len he owes me the first bun.'
    : 'Len came through the door after I’d started. His card sent him to the lamp without anybody leaving the floor. The spare hook went to his card, so I put the coats on my knees. They have excellent posture.',
  options: [{
    text: 'Take Sella’s cue slip for the House of Performance.',
    if: all(facingCuePlan('nexus', plan), not(facingCueChecked('nexus'))),
    effects: [value('nexus', 'checked', plan), { giveItem: FACING_CUE_ITEM }],
  }],
});

export const facingCueHouseReadNode = 'facing.house.read';
const houseReceipt: DialogueNode = {
  id: facingCueHouseReadNode,
  speaker: 'stage-host',
  historicalLabel: 'fictional-world',
  text: 'The gallery is listening for the four-beat entrance.',
  options: CUE_PLANS.map((plan) => ({
    text: plan === 'shared' ? 'Take the shifted entrance with Hari’s lead-in.' : 'Send the two ushers in from their own cards.',
    if: all(FACING_HOUSE_READY, facingCuePlan('house', plan), not(facingCueChecked('house'))),
    effects: [value('house', 'checked', plan)],
  })),
};

const objectives: Objective[] = [
  { id: FACING_CUE_COMPARE, title: 'Run Sella’s four-beat entrance from both facing marks.', essential: false,
    visible: { flagSet: 'facing.nexus.started' }, done: rehearsed('nexus'),
    weave: { concepts: ['evidence', 'interpretation', 'explanation', 'perspective'], framework: ['scope', 'perspectives', 'methods-and-tools'],
      thinking: { dok: 2, bloom: 'analyse', fink: 'application', solo: 'relational' },
      atl: ['thinking', 'communication'], aoks: ['ART'], subjects: ['dance', 'lit-perf'], minutes: 2 } },
  { id: FACING_CUE_RECEIVE, title: 'Lay out an entrance and attend the first run.', essential: false,
    visible: done(FACING_CUE_COMPARE), done: facingCueChecked('nexus'),
    onComplete: [{ journal: 'j.facing.nexus' }],
    weave: { concepts: ['justification', 'values', 'responsibility', 'power'], framework: ['perspectives', 'ethics'],
      thinking: { dok: 3, bloom: 'evaluate', fink: 'human', solo: 'relational' },
      atl: ['social', 'communication', 'thinking'], aoks: ['ART', 'HUM'], subjects: ['dance', 'theatre'], minutes: 3 } },
  { id: FACING_CUE_TRANSFER, title: 'Try Sella’s cue slip where the House lamp is on the other side.', essential: false,
    visible: FACING_HOUSE_READY, done: facingCueChecked('house'), onComplete: [{ journal: 'j.facing.house' }],
    weave: { concepts: ['evidence', 'interpretation', 'explanation', 'perspective', 'responsibility'], framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'],
      thinking: { dok: 3, bloom: 'apply', fink: 'integration', solo: 'relational' },
      atl: ['thinking', 'social', 'communication'], aoks: ['ART'], subjects: ['dance', 'theatre'], minutes: 3 } },
];

const hintText = [
  ['Sella has set the same four beats on a little rehearsal board.', 'The bell and the door are opposite each other. Try facing each in turn.', 'Watch the floor mark on the second beat. The remaining beats stay on that mark.', 'Play all four beats while facing the bell, then all four while facing the door. Both readings matter.'],
  ['Two entrances can share a mark even when the movers face different ways.', 'The rehearsal board lets you put out one cue or two cards.', 'A lamp cue is easy to see together. A facing card gives an arriving runner their own turn.', 'Hang either layout, then follow the lead-in by the lamp or the paired-card pocket on the right-hand walk. Watch who arrives.'],
  ['Sella’s slip is useful at the small entrance rail in the House gallery.', 'The lamp has moved across the rehearsal floor. Try both facings from the centre again.', 'A cue tied to the lamp survives the move. The facing cards need new directions.', 'Finish both runs, staff the lamp or turn both cards, then take the gallery entrance with the new cue.'],
];

export const facingCueContent = {
  characters: [{ id: 'facing-sella', name: 'Sella Tern', role: 'Keeper of the rehearsal hooks', mode: 'fictional',
    sprite: 'villager-2', talk: [
      ...CUE_PLANS.map((plan) => ({ node: `facing.nexus.after.${plan}`, if: { flag: 'facing.nexus.checked', eq: plan } })),
      { node: 'facing.nexus.waiting', if: { flagSet: 'facing.nexus.plan' } }, { node: 'facing.nexus.intro' },
    ] }],
  dialogue: [
    { id: 'facing.nexus.intro', speaker: 'facing-sella', historicalLabel: 'fictional-world',
      text: 'It’s four beats to get the two runners through the same doorway. I shouted “left” and Len bounced off my coat hooks. He insists the hooks advanced first. Would you run the board from both entrance marks?',
      options: [{ text: 'Set the first runner on the centre mark.', if: not({ flagSet: 'facing.nexus.started' }),
        effects: [value('nexus', 'started', true)] }] },
    { id: 'facing.nexus.waiting', speaker: 'facing-sella', historicalLabel: 'fictional-world',
      text: 'I’ll meet you at the entrance you set. One run will tell us who can get through.' },
    ...CUE_PLANS.map((plan): DialogueNode => ({
      id: `facing.nexus.after.${plan}`, speaker: 'facing-sella', historicalLabel: 'fictional-world',
      text: plan === 'shared' ? 'Len did buy the bun. He took four beats to hand it over. I respect the rehearsal.'
        : 'Len donated a new hook. I have yet to see him put up anything but the coat he was already wearing.',
    })),
    ...beats, ...plans, ...CUE_PLANS.map(nexusReceipt), houseReceipt,
  ],
  items: [{
    id: FACING_CUE_ITEM, name: 'Sella’s four-beat cue slip', historicalLabel: 'fictional-world',
    art: 'preserved.slip', description: 'The four beats stay in ink. The two facing arrows and the lamp mark can move. Rehearse with it at the House of Performance gallery.',
  }],
  missions: [{ id: 'KG-CH1-FACING-CUE', world: 'WORLD-01', title: 'The Step Across the Line',
    stake: 'Sella and Len need to reach the same lamp without leaving a late runner stranded or giving up their only usher.',
    knowledgeQuestion: 'How does the position of a performer change what an audience understands a direction to mean?',
    objectives: objectives.slice(0, 2) },
  { id: 'KG-CH9-FACING-CUE', world: 'WORLD-10', title: 'Sella’s Slip at the House',
    stake: 'The gallery has moved the lamp. The ushers have to change the entrance while keeping the same welcome rhythm.',
    knowledgeQuestion: 'Which parts of a movement cue travel with a performance, and who has to do the work of translating them?',
    objectives: objectives.slice(2) }],
  journal: [
    { id: 'j.facing.nexus', claimKind: 'observation', text: 'I ran the same four beats from opposite facings. The word “left” sent the runners to different marks. Sella and I checked an entrance the next pair could actually use.' },
    { id: 'j.facing.house', claimKind: 'observation', text: 'The House lamp stood on the other side. The four beats still worked once the welcome crew checked the shared mark or turned the facing cards.' },
  ],
  hints: objectives.flatMap(({ id }, row) => hintText[row].map((text, i) => ({
    id: `h.${id}.${i + 1}`, depth: (i + 1) as Hint['depth'], text, objective: id,
  }))),
} satisfies Partial<ContentPack>;
