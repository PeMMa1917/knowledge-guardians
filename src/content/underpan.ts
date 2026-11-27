import type { Condition, ContentPack, DialogueNode, DialogueOption, Effect, Hint } from '../domain/types';

export const underpanOpen: Condition = { any: [
  { flagSet: 'neighbour.market-assayer' }, { flagSet: 'neighbour.market-clerk' }, { flagSet: 'underpan.cold' },
] };
const flag = (id: string): Condition => ({ flagSet: 'underpan.' + id });
export const account = (which: string): Condition => ({ flag: 'underpan.account', eq: which });
export const traced: Condition = { any: [flag('light'), flag('edge')] };
export const unsettled: Condition = { not: flag('account') };
const fen = 'fen-clove';
function beat(id: string, speaker: string, text: string, options?: DialogueOption[]): DialogueNode {
  return { id: 'underpan.' + id, speaker, text, options, historicalLabel: 'fictional-world' };
}
function result(id: string, value: string | true = true): Effect {
  return { setFlag: 'underpan.' + id, value };
}
export const underpanContent = {
  characters: [{ id: fen, name: 'Fen Clove', role: 'Night teller and former scale apprentice',
    mode: 'fictional', sprite: 'custom:tan.brown.gold.olive.headband.green',
    talk: [{ if: account('lamps'), node: 'underpan.outside' }, { if: account('shutters'), node: 'underpan.inside' },
      { if: traced, node: 'underpan.ask' }, { node: 'underpan.fen' }] }],
  dialogue: [
    beat('coin', 'narrator', 'The coin at your feet stands on edge. When you kneel, you hear someone underneath the stones whisper, “Heads, I tell them. Tails, I get another night.” Up here nobody has noticed her flipping it.', [
      { text: 'Tap once on the grate and wait.', effects: [result('cold')], next: 'underpan.knock' },
      { text: 'Let her keep her night.' },
    ]),
    beat('knock', fen, '“That isn’t heads or tails.” A bolt moves. A square of warm dark opens under the weighing pan. “Good.”'),
    beat('fen', fen, '“I used to work the scale. Every time someone upstairs says I took the flour, that thing on the wall grows another hand.” Fen puts her palms together. The shadow keeps counting. “If you go up there and tell them I’m innocent because a ghost says so, I will put you out myself.”'),
    beat('lamp', 'narrator', 'A brass lamp throws three long fingers across the plaster. You can turn the wick from here. The shadow will be out of sight until you walk back to the wall.', [
      { text: 'Turn the wick sideways.', effects: [result('wick')], next: 'underpan.wick' }, { text: 'Keep the light where it is.' },
    ]),
    beat('wick', 'narrator', 'The brass is hot enough to leave a stripe on your sleeve. A paper sound skitters across the far wall.'),
    beat('wall', 'narrator', 'In the slant light one finger ends in a torn price slip. A second comes from a nail. The third lifts its hat to you and runs along the skirting board. Fen, beside you, has both hands in her pockets.', [
      { text: 'Mark the three edges in chalk for Fen.', effects: [result('light')], next: 'underpan.chalk' },
      { text: 'Step back from the wall.' },
    ]),
    beat('chalk', fen, '“The lamp can tell us how many shadows. It can’t tell us who got paid.” She slips you a stub of chalk as short as a tooth. “That’s what I needed someone else to see.”'),
    beat('edge', 'narrator', 'Under the stair, loose receipts lift and settle with each footfall upstairs. You can reach them with your hand behind the screen. None carries a customer’s name on its outer fold.', [
      { text: 'Feel for the creases with the screen shut.', effects: [result('edge')], next: 'underpan.fold' },
      { text: 'Give the papers some room.' },
    ]),
    beat('fold', fen, 'Someone has stitched five receipts along the same crease. The flour went through five hands before Fen weighed it. At your wrist, a thing with paper feet stops trembling. “You felt it too?” she whispers.'),
    beat('ask', fen, 'Fen takes down the shutters herself. Beyond them the market is only a head’s height above you. “I’ll show them how the shadow works, or I’ll sit below and help each family read its own receipt. I can’t be in two places. Where will you stand?”', [
      { text: 'Hold the lamps for a demonstration upstairs.', if: unsettled, effects: [result('account', 'lamps')], next: 'underpan.day' },
      { text: 'Keep the shutters while the first family comes down.', if: unsettled, effects: [result('account', 'shutters')], next: 'underpan.night' },
      { text: 'Come back when the market is quieter.' },
    ]),
    beat('day', fen, 'Fen carries the lamp up the old counting stair. Someone at the back recognises a family receipt. Fen snuffs that wick. The little shadow makes a rude gesture at the unlit lamp and the crowd laughs. A woman folds her receipt and goes home with it still unread.'),
    beat('night', fen, 'The first family comes down. Fen counts across their palms behind the shutters. Outside, someone says she must have something to hide. The paper creature folds itself small enough to sit on the sill. It stays on the bright side where people can see it.'),
    beat('outside', fen, '“Most days the demonstration is five minutes. Yesterday a stranger stayed after to tell me why he’d blamed me. That took a good deal longer.” Fen has started taking a packed lunch upstairs.'),
    beat('inside', fen, 'Fen has marked the last stair with white chalk for people who come in from the sun. “Lost a whole hour on one family’s receipt. They’re coming back tomorrow. Made three cups this time.”'),
  ],
  missions: [{
    id: 'KG-CH10-UNDERPAN', title: 'The Underpan', world: 'WORLD-11', available: { flagSet: 'visited.map.market.underpan' },
    knowledgeQuestion: 'What can a demonstration settle when the people watching disagree about who bears the cost?',
    stake: 'Fen wants to earn a living upstairs again. Some families will ask for their flour back only behind a shut door.',
    objectives: [
      { id: 'underpan.separate', title: 'Follow the shadow to the opposite wall.', essential: false, done: flag('light'),
        weave: { concepts: ['explanation', 'evidence'], framework: ['scope', 'methods-and-tools'], aoks: ['NAT', 'ART', 'TEC'],
          atl: ['thinking', 'research'], subjects: ['physics', 'theatre'], minutes: 2,
          thinking: { dok: 2, bloom: 'analyse', solo: 'relational', fink: 'application' } } },
      { id: 'underpan.account', title: 'Stand with Fen while she opens the shutters.', essential: false, done: flag('account'),
        weave: { concepts: ['responsibility', 'power', 'justification'], framework: ['ethics', 'perspectives'],
          aoks: ['HUM', 'HIS', 'POL'], atl: ['social', 'communication'], subjects: ['economics', 'history'], minutes: 3,
          thinking: { dok: 3, bloom: 'evaluate', solo: 'relational', fink: 'caring' } } },
    ],
  }],
  hints: Object.entries({
    'underpan.separate': [
      'Try changing where the light falls.', 'Walk around the divider to the brass lamp.',
      'Turn the wick and cross to the far wall.', 'At the far wall, trace the three edges in chalk.',
    ],
    'underpan.account': [
      'Fen is staying under the square.', 'Try either the receipts or the light.',
      'Feel the receipt creases or mark the lit wall, then find Fen.',
      'Speak with Fen and offer to hold the lamps or the shutters. You can leave and come back.',
    ],
  }).flatMap(([objective, lines]) => lines.map((text, index) => ({
    id: 'h.' + objective + '.' + (index + 1), objective, text, depth: (index + 1) as Hint['depth'],
  }))),
} satisfies Partial<ContentPack>;
