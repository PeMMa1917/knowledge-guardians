import { specimenEquipped } from '../domain/specimenGear';
import type { Condition, ContentPack, DialogueNode, Effect, FlagValue, Hint, Objective } from '../domain/types';

export const BIRO_RETURN = {
  key: 'smg:1949-174/2', map: 'aethelgard.emberford', prop: 'travelling-tally-bench', flag: 'publication.tally',
  objective: 'publication.tally.used', method: 'Separate a writing result from its makers’ different contributions',
  hint: 'Equip the Bíró pen and try both supports at Hesper’s strip bench by the forge. Follow the writing rest to Della or Idris after you send it.',
} as const;
export const GREEN_RETURN = {
  key: 'smithsonian-nmaahc:2015.97.42', map: 'aethelgard.ferry', prop: 'second-bell-board', flag: 'publication.shelter',
  objective: 'publication.shelter.used', method: 'Verify that a listed service is available at the time of arrival',
  hint: 'Equip the 1941 Green-Book and visit Tova’s shelter board by the landing. Once you send the update, find it by the road or at Enna’s desk.',
} as const;

export function addPublicationReturns(pack: ContentPack) {
  pack.exhibits = pack.exhibits.map((exhibit) => {
    const { specimen } = exhibit;
    if (!specimen || specimen.revisit) return exhibit;
    const station = [BIRO_RETURN, GREEN_RETURN].find(({ key }) => key === specimen.key);
    if (!station) return exhibit;
    const { map, prop, method, hint } = station;
    return { ...exhibit, specimen: { ...specimen, revisit: { map, prop, method, hint } } };
  });
}

const pen = BIRO_RETURN.flag;
const guide = GREEN_RETURN.flag;
const at = (key: string, value: FlagValue = true): Condition => ({ flag: key, eq: value });
const set = (key: string, value: FlagValue = true): Effect => ({ setFlag: key, value });
const openPlan = (key: string): Condition => ({ not: { flagSet: `${key}.plan` } });
export const penReady: Condition = { all: [specimenEquipped(BIRO_RETURN.key), openPlan(pen)] };
export const guideReady: Condition = { all: [specimenEquipped(GREEN_RETURN.key), openPlan(guide)] };
export const guideStarted: Condition = { all: [guideReady, at(`${guide}.started`)] };
const evidence = { pen: [at(`${pen}.fixed`, 6), at(`${pen}.strap`, 4)],
  guide: [at(`${guide}.old`), at(`${guide}.confirmed`)] };

function node(id: string, speaker: string, text: string, options?: DialogueNode['options']): DialogueNode {
  return { id, speaker, text, options, historicalLabel: 'fictional-world' };
}

const dialogue: DialogueNode[] = [
  node(`${pen}.bench`, 'smith-hesper', 'We want one writing rest for the tally. The museum credits László József Bíró for developing the pen, Georg Bíró for helping with the ink, and the Miles Martin Pen Company for making this example. Our trial uses the same practice pen, paper and six strokes each time. Move the support and see what changes.', [
    { text: 'Pin one strip to the flat rest and make six strokes.', if: penReady,
      effects: [set(`${pen}.fixed`, 6)], next: `${pen}.fixed` },
    { text: 'Lay the other strip across the rolled carrying strap and make six strokes.', if: penReady,
      effects: [set(`${pen}.strap`, 4)], next: `${pen}.strap` },
    { text: 'Give the flat rest to Della’s writing rail.', if: { all: [penReady, ...evidence.pen] },
      effects: [set(`${pen}.plan`, 'rail')], next: `${pen}.rail-order` },
    { text: 'Send the flat rest to Idris for the rounds.', if: { all: [penReady, ...evidence.pen] },
      effects: [set(`${pen}.plan`, 'rounds')], next: `${pen}.rounds-order` },
    { text: 'Leave the strips on the bench.' },
  ]),
  node(`${pen}.fixed`, 'narrator', 'All six lines meet the edge of the flat rest. Della can count them without guessing at any gap. The strip shows how this trial went with a steady support.'),
  node(`${pen}.strap`, 'narrator', 'Four lines reach the edge. Two stop early where the rolled strap moves under the strip. The ink and pen stayed the same. Watch which part of the writing arrangement the result can support.'),
  node(`${pen}.rail-order`, 'smith-hesper', 'Della can open the rail to anyone bringing a tally. Carry the rest to her stall. Idris will bring his totals back in words at the end of the round.'),
  node(`${pen}.rounds-order`, 'smith-hesper', 'Idris can put the rest against a wall at each stop. Carry it to the south road and see what happens when he has a firm edge. Della can still count at her stall when he brings it back.'),
  node(`${pen}.rail`, 'baker-della', 'A flour runner has put six figures on this strip and wants to check their total. I need the flat rest to stay here while she goes back for her next tray.', [
    { text: 'Fit the rest to Della’s rail and let the runner finish her line.', if: { all: [at(`${pen}.plan`, 'rail'), { not: { flagSet: `${pen}.receipt` } }] },
      effects: [set(`${pen}.receipt`, 'rail')], next: `${pen}.rail-result` },
  ]),
  node(`${pen}.rail-result`, 'baker-della', 'She finished her tally. I’ll leave the rail free for the next runner, with both strips clipped beside it. Idris can read his road totals to me when he gets back.'),
  node(`${pen}.rounds`, 'porter-idris', 'I have a wall to lean on at each stop. See if this rest fits the bag before we put it against the stone. I can carry one rest on my rounds.', [
    { text: 'Seat the rest against the low wall and hand Idris the next strip.', if: { all: [at(`${pen}.plan`, 'rounds'), { not: { flagSet: `${pen}.receipt` } }] },
      effects: [set(`${pen}.receipt`, 'rounds')], next: `${pen}.rounds-result` },
  ]),
  node(`${pen}.rounds-result`, 'porter-idris', 'Six lines with the rest braced. I can write the totals at my next two stops and leave each crew its own strip. Della has the old rail until I bring this rest home.'),
  node(`${guide}.board`, 'ferry-tova', 'Victor Hugo Green’s 1941 directory helped Black travellers find businesses that served them under Jim Crow. This copy carries James A. Jackson’s presentation line on its cover. Our old ferry listing gives a lead to a dry waiting room. Find out when it can take callers and what Enna agrees to share.', [
    { text: 'Put a clip on the dry-room entry and follow its lead.', if: { all: [guideReady, { not: at(`${guide}.started`) }] },
      effects: [set(`${guide}.started`)], next: `${guide}.follow` },
    { text: 'Post the current room and opening bell for independent callers.', if: { all: [guideStarted, ...evidence.guide] },
      effects: [set(`${guide}.plan`, 'public')], next: `${guide}.public-order` },
    { text: 'Send the current notice to Enna for a staffed handover.', if: { all: [guideStarted, ...evidence.guide] },
      effects: [set(`${guide}.plan`, 'staffed')], next: `${guide}.staffed-order` },
    { text: 'Keep the guide folded.' },
  ]),
  node(`${guide}.follow`, 'ferry-tova', 'The old entry can tell us where to ask. Find its dated copy near the road board, then show Enna the entry by her kitchen bench.'),
  node(`${guide}.old`, 'narrator', 'The approved public name of the place is Dry Room. This dated version lists the first bell. The posting still carries the old marks. Check what a caller can rely on today.', [
    { text: 'Clip the dated entry with its first-bell mark still visible.', if: guideStarted, effects: [set(`${guide}.old`)] },
  ]),
  node(`${guide}.permission`, 'ferry-cook', 'The room is free from the second bell now. You can share its public name and that bell. Leave my private doorway off the copy. At the desk I can also tell callers whether the room cleared a little early.', [
    { text: 'File the second-bell update and keep the private doorway off the copy.', if: { all: [guideStarted, at(`${guide}.old`)] },
      effects: [set(`${guide}.confirmed`)] },
  ]),
  node(`${guide}.public-order`, 'ferry-tova', 'A caller can reach the dry room from the road before we come off the boat. Put the public copy on the board. Everyone will plan around the confirmed second bell.'),
  node(`${guide}.staffed-order`, 'ferry-tova', 'Enna can take a caller early if the room clears. Leave the dated update at the side table where she can speak to the first person waiting. The road board will point callers to her desk.'),
  node(`${guide}.public`, 'narrator', 'A walker is reading the old copy. They can choose their own way from here once the room name and the current bell face the road.', [
    { text: 'Turn the current public notice toward the road.', if: { all: [at(`${guide}.plan`, 'public'), { not: { flagSet: `${guide}.receipt` } }] },
      effects: [set(`${guide}.receipt`, 'public')], next: `${guide}.public-result` },
  ]),
  node(`${guide}.public-result`, 'narrator', 'The walker follows the public notice and comes back at the second bell without waiting for a host. The first-bell copy stays filed and the private doorway has no public line.'),
  node(`${guide}.staffed`, 'ferry-cook', 'The room has just cleared. A caller is beside the desk and can get in before the second bell. Clip the dated update here so I can tell the next person what changed.', [
    { text: 'Clip the update at Enna’s desk and let her lead the waiting caller.', if: { all: [at(`${guide}.plan`, 'staffed'), { not: { flagSet: `${guide}.receipt` } }] },
      effects: [set(`${guide}.receipt`, 'staffed')], next: `${guide}.staffed-result` },
  ]),
  node(`${guide}.staffed-result`, 'ferry-cook', 'Our waiting caller is inside while the room is free. I’ll stay at the table for the next visitor. Keep my private doorway off that road board, please.'),
];

const penGoal: Objective = {
  id: BIRO_RETURN.objective, title: 'Test two supports and leave a working writing rest with the reader who needs it.', essential: false,
  visible: { any: [specimenEquipped(BIRO_RETURN.key), { flagSet: `${pen}.plan` }] },
  done: { all: [...evidence.pen, { any: ['rail', 'rounds'].map((route) => ({ all: [at(`${pen}.plan`, route), at(`${pen}.receipt`, route)] })) }] },
  onComplete: [{ journal: 'j.publication.tally' }],
  weave: { concepts: ['evidence', 'interpretation', 'explanation', 'responsibility'], framework: ['scope', 'methods-and-tools', 'perspectives'],
    aoks: ['NAT', 'HIS', 'TEC'], subjects: ['design-tech', 'physics', 'history'], atl: ['research', 'thinking', 'communication'],
    thinking: { dok: 3, bloom: 'analyse', fink: 'application', solo: 'relational' }, minutes: 4 },
};
const greenGoal: Objective = {
  id: GREEN_RETURN.objective, title: 'Check the dated entry with its host and see how the next caller uses the update.', essential: false,
  visible: { any: [specimenEquipped(GREEN_RETURN.key), { flagSet: `${guide}.plan` }] },
  done: { all: [...evidence.guide, { any: ['public', 'staffed'].map((route) => ({ all: [at(`${guide}.plan`, route), at(`${guide}.receipt`, route)] })) }] },
  onComplete: [{ journal: 'j.publication.shelter' }],
  weave: { concepts: ['evidence', 'culture', 'certainty', 'power', 'values', 'responsibility'], framework: ['scope', 'methods-and-tools', 'perspectives', 'ethics'],
    aoks: ['HIS', 'HUM', 'POL'], subjects: ['history', 'global-politics', 'anthropology'], atl: ['research', 'communication', 'social'],
    thinking: { dok: 3, bloom: 'evaluate', fink: 'human', solo: 'relational' }, minutes: 5 },
};

function hints(objective: Objective, lines: string[]): Hint[] {
  return lines.map((text, index) => ({ id: `h.${objective.id}.${index + 1}`, objective: objective.id, depth: (index + 1) as Hint['depth'], text }));
}

export const publicationReturnContent = {
  missions: [
    { id: 'KG-CH1-R-publication-tally', world: 'WORLD-02', title: 'The Travelling Tally',
      stake: 'Della wants a dependable rail at her stall and Idris needs a place to mark totals on the road. Hesper has one writing rest.',
      knowledgeQuestion: 'What can changing only the support tell you about a working writing arrangement?', objectives: [penGoal] },
    { id: 'KG-CH1-R-publication-shelter', world: 'WORLD-02', title: 'The Second Bell',
      stake: 'Someone on the old road will wait outside if Tova sends the wrong time to the dry room.',
      knowledgeQuestion: 'What can a directory establish about a service someone needs now?', objectives: [greenGoal] },
  ],
  dialogue,
  journal: [
    { id: 'j.publication.tally', claimKind: 'observation', text: 'I got six full strokes with the flat support and four with the strap, using the same practice pen. The test helped one crew use the rest. The museum record kept the inventor, ink collaborator and manufacturer on separate lines.' },
    { id: 'j.publication.shelter', claimKind: 'observation', text: 'The older listing gave me a place to check. Enna gave me the current bell and the words I could share. I used those details to help a caller without printing her private doorway.' },
  ],
  hints: [
    ...hints(penGoal, [BIRO_RETURN.hint, 'Hesper has the practice pen and matching strips. Move one support at a time.',
      'Compare six strokes on the flat rest with six across the carrying strap.', 'Choose Della’s rail or Idris’s rounds. Fit the rest at that crew’s receiving spot and see who writes with it.']),
    ...hints(greenGoal, [GREEN_RETURN.hint, 'The old listing is by the road. Follow the entry to Enna’s permission slip near her kitchen.',
      'Keep the old timing as a dated record. Confirm the present bell and what Enna will let you publish.',
      'Tova can post the confirmed timing or send it to Enna for a staffed handover. Finish at the chosen receiving spot.']),
  ],
} satisfies Partial<ContentPack>;
