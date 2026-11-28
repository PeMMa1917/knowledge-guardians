import type { Condition, ContentPack, DialogueNode, Hint, Objective } from '../domain/types';
import { clockDock, clockRoom, clockTopics } from '../domain/tideClock';

export const quarterPeople = {
  matel: 'quarter-matel',
  ada: 'ink-q7259',
} as const;
const { matel, ada } = quarterPeople;
const flag = (key: string): Condition => ({
  flag: 'tideclock.' + key,
  eq: true,
});
const setFlag = (key: string): Condition => ({ flagSet: 'tideclock.' + key });
const both = (...conditions: Condition[]): Condition => ({ all: conditions });
export const pierOpen: Condition = both(
  { objective: 'island.arrival' },
  { flag: 'wire.everReceived', eq: true },
);
const choice = (text: string, id: string, condition?: Condition) => ({
  text,
  next: 'quarter.' + id,
  if: condition,
});
function node(
  id: string,
  speaker: string,
  text: string,
  options: DialogueNode['options'] = [],
  citation?: string,
): DialogueNode {
  return {
    id: 'quarter.' + id,
    speaker,
    text,
    options,
    historicalLabel: speaker === ada ? 'imagined-alternate' : 'fictional-world',
    ...(citation ? { citationSource: citation } : {}),
  };
}
const dialogue = [
  node(
    'matel',
    matel,
    'Matel Mear is sewing little copper feet to a paper moth. One foot is upside down. “Good. That’ll make it walk my round backwards.” Beneath her stool the tide clock gives a small cough. “Don’t tell it we noticed.”',
    [
      choice('Hold the lantern while she turns the foot.', 'matel.lantern'),
      choice('Put a finger on the gap in the clock.', 'matel.gap'),
      choice('Show her what the flood left on the brass.', 'matel.print', flag('remembered')),
    ],
  ),
  node(
    'matel.lantern',
    matel,
    '“Siv drew this creature on my first wage envelope. I had been stamping what the dock looked like after everyone had gone. She drew me a pair of ears. I folded it into a moth so I could give it some feet.” Her hand is shaking. She lets you make the last stitch.',
  ),
  node(
    'matel.gap',
    matel,
    'The hand skips a tooth. The wet plank under your thumb turns pale. “That is the quarter I lost. A pilot and a deckhand each came looking for me. I told them both I’d been here all day. I had. They never had a free moment at the same time.”',
  ),
  node(
    'matel.print',
    matel,
    'Matel tips the clock into the light and the same hour falls out empty. She rubs your stamped brass with her sleeve. “Yours kept their time. Mine only kept the names of the people who could find me.”',
  ),
  node(
    'ada',
    ada,
    'Ada Lovelace slides three copper feet along a strip. “I can wind this little thing for an entire watch. First I should like to see what it does when it stamps before it has listened.” Matel lays a clean pad beside her.',
    [
      choice('Put the stamp at the head of the strip.', 'ada.blank'),
      choice('Ask what else a strip of instructions might carry.', 'ada.symbols'),
      choice('Bring back the card from a full watch.', 'ada.watch', flag('automatic')),
    ],
    'HIS-QUARTER-LOVELACE',
  ),
  node(
    'ada.blank',
    ada,
    '“Suppose its ear is empty.” She lets the stamp fall with a loud clack. “A perfectly obedient foot.” There is no print. Matel draws a small square around the clean place so nobody can fill it in later and call it a hearing.',
  ),
  node(
    'ada.symbols',
    ada,
    'She taps the foot marked LISTEN. “A mark can stand for a note or a move. Somebody must specify what operation the mark permits.” Matel takes the foot away and taps the same rhythm on the table. The moth sits absolutely still.',
    [],
    'HIS-QUARTER-NOTES',
  ),
  node(
    'ada.watch',
    ada,
    '“May I see the times?” She reads the card from the bottom. “This tells us what the strip sent the moth to hear. The people it passed elsewhere could tell us something quite different.” Her fingertip stops on a quiet plank.',
  ),
  node(
    'matel.dock',
    matel,
    'The new plan is under a sheet of glass. Matel is eating her bread with her feet in the water. At the far end of the dock she can see Joss crawl through a coil of rope. “We each found a way to get here. He hasn’t tried mine yet.”',
    [
      choice('Take the early walk.', 'matel.early', flag('read.crew')),
      choice('Leave a lamp at the last mooring.', 'matel.late', flag('read.pilots')),
      choice('Sit on the steps beside her.', 'matel.rest'),
    ],
  ),
  node(
    'matel.early',
    matel,
    '“When Siv finished that first break she carried her bread out again. She wanted to show me where my clock had left her. Think of it. Another job she had to do just so I could see her first one.” Matel folds the plan small enough to fit a pocket.',
  ),
  node(
    'matel.late',
    matel,
    '“Joss kept one foot in the boat until he saw that lamp. I thought it meant he was in a hurry. He was holding the boat so I could step down when I was ready.” She leaves her own lamp on the last post.',
  ),
  node(
    'matel.rest',
    matel,
    '“That bread was supposed to last until the second tide.” She breaks it open and finds a teaspoon baked into the middle. On the roof, Mara has just discovered she can stir tea with a piece of crust.',
  ),
  node(
    'ada.dock',
    ada,
    'Lovelace gathers the spent instruction cards. Siv has written on the back of one. Joss has made a sketch on another. She puts them in a fresh envelope so their words will survive the next turn.',
    [
      choice('Give the envelope to the deck crew.', 'ada.crew', flag('read.crew')),
      choice('Hold it for the late pilots.', 'ada.pilots', flag('read.pilots')),
    ],
    'HIS-QUARTER-LOVELACE',
  ),
  node(
    'ada.crew',
    ada,
    '“If all we kept were the motions of those three feet, we would know what they did. Siv’s reason for asking us to move a bench belongs in the envelope too.” The deckhand initials the fold herself.',
  ),
  node(
    'ada.pilots',
    ada,
    'Joss lays a hand over the little sketch while the ferry comes in. Lovelace waits beside him. When he lifts his hand, there is a new pencil mark where the next mooring ought to be.',
  ),
];
type Job = {
  id: string;
  title: string;
  condition: Condition;
  finish: Condition;
  line: string;
  hints: [string, string, string, string];
  thinking: NonNullable<NonNullable<Objective['weave']>['thinking']>;
  act: Parameters<typeof clockTopics>[0];
};
const jobs: Job[] = [
  {
    id: 'watch',
    title: 'Keep a print through the missing quarter',
    condition: pierOpen,
    finish: flag('remembered'),
    line: 'The first hour came round again. The hearing I stamped on brass stayed in my pocket.',
    act: 'stamp',
    thinking: {
      dok: 2,
      bloom: 'apply',
      fink: 'application',
      solo: 'multistructural',
    },
    hints: [
      'The hand comes back after six marks.',
      'Matel keeps a loose pad and a stamped brass card.',
      'Walk to a pier, open the listening tube, then stamp the hearing.',
      'Wait until Lanterns down comes round again. Reopen your brass card.',
    ],
  },
  {
    id: 'moth',
    title: 'Give the paper moth a watch of its own',
    condition: pierOpen,
    finish: both(flag('automatic'), flag('changedOrder')),
    line: 'I changed the moth’s instructions and let it keep a whole watch. Its card showed me the piers I had sent it past.',
    act: 'round',
    thinking: {
      dok: 3,
      bloom: 'analyse',
      fink: 'learning-to-learn',
      solo: 'relational',
    },
    hints: [
      'The moth follows its feet in order.',
      'Look at the named foot marked next. Try one foot on its own.',
      'Move one instruction earlier or later. Listening and stamping can happen on different piers.',
      'Wind six turns. Read the place and time actually stamped on the card.',
    ],
  },
  {
    id: 'plan',
    title: 'Leave a floor plan two shifts can use',
    condition: pierOpen,
    finish: setFlag('issued'),
    line: 'I walked the same arrangement with people who came off shift at different times. I sent their floor plan upstairs.',
    act: 'issue',
    thinking: {
      dok: 4,
      bloom: 'create',
      fink: 'integration',
      solo: 'extended',
    },
    hints: [
      'Two different crews know different hours of the dock.',
      'Stamp the slipway at Chain lifted and the open rail at Last tying-up.',
      'Use either proposal or exchange fittings. Walk the same layout with both crews.',
      'Send the walked plan to the dock. Both shifts can show you what changed.',
    ],
  },
  {
    id: 'leaves',
    title: 'Hold two walks against the pier light',
    condition: pierOpen,
    finish: {
      all: [{ flagSet: 'tideclock.compared.mark' }, { flagSet: 'tideclock.compared.shelter' }],
    },
    line: 'Joss needs the writing board beside the mooring. Ivo needs a dry page under the awning. I carried both of their requests in the same tracing book.',
    act: 'compare',
    thinking: { dok: 3, bloom: 'evaluate', fink: 'caring', solo: 'relational' },
    hints: [
      'There is tracing paper beside the fittings.',
      'Walk one layout with both shifts. Rub the blue leaf.',
      'Move the writing board, take both walks again and rub the rust leaf.',
      'Compare the two leaves for Joss, then for Ivo. One board has to serve two requests.',
    ],
  },
  {
    id: 'after',
    title: 'See where the bench went after the tide',
    condition: both(pierOpen, setFlag('issued')),
    finish: both(flag('read.crew'), flag('read.pilots')),
    line: 'Upstairs I took the break with Siv and stayed for Joss. They used two different parts of the same plan.',
    act: 'read',
    thinking: { dok: 3, bloom: 'evaluate', fink: 'human', solo: 'relational' },
    hints: [
      'The signed plan is back in the open air.',
      'Take the pier steps out of the quarter house.',
      'Visit the glass plan on the dock. Take the early walk and the late one.',
      'Matel keeps the two accounts beside the boat. You can take another arrangement downstairs.',
    ],
  },
];
export function installQuarterClock(pack: ContentPack) {
  pack.dialogue.push(...dialogue);
  pack.sources.push(
    {
      id: 'HIS-QUARTER-LOVELACE',
      title: 'Ada Lovelace',
      url: 'https://www.computerhistory.org/babbage/adalovelace/',
      locator: 'Ada Lovelace, The Babbage Engine',
      supports:
        'The museum describes her notes, attention to symbolic operations and discussion of music. The pier, its clock and conversations are fictional.',
      accessed: '2026-11-28',
      mla: {
        kind: 'page',
        title: 'Ada Lovelace',
        container: 'The Babbage Engine, Computer History Museum',
      },
    },
    {
      id: 'HIS-QUARTER-NOTES',
      title: 'Notes by the Translator, Note A',
      url: 'https://www.fourmilab.ch/babbage/sketch.html',
      locator: '1843 translation and appended Note A',
      supports:
        'The note discusses the possibility of operations on symbols for musical relations, subject to representability. The moth is an original imaginary machine.',
      accessed: '2026-11-28',
      mla: {
        kind: 'page',
        author: 'Lovelace, Ada Augusta',
        title: 'Notes by the Translator',
        container: 'Sketch of the Analytical Engine',
        documentDate: '1843',
      },
    },
  );
  pack.characters.push({
    id: matel,
    name: 'Matel Mear',
    role: 'Tide clock keeper and former sail patcher',
    mode: 'fictional',
    sprite: 'custom:brown.grey.woad.sand.scarf.gold.bun.lightframes.none',
    talk: [{ node: 'quarter.matel' }],
  });
  for (const [id, lo, hi] of [
    [ada, 'quarter.ada', 'quarter.ada.dock'],
    [matel, 'quarter.matel', 'quarter.matel.dock'],
  ]) {
    const npc = pack.characters.find((p) => p.id === id)!;
    npc.localGreeting = {
      ...npc.localGreeting,
      [clockRoom]: lo,
      [clockDock]: hi,
    };
  }
  pack.missions.push({
    id: 'the-quarter-that-comes-back',
    world: 'WORLD-15',
    title: 'The quarter that comes back',
    available: pierOpen,
    stake:
      'Matel promised Siv and Joss a dry place to stop. The clock gives her the hour back every time. The two crews keep missing one another.',
    knowledgeQuestion:
      'What can an account of a whole day still leave out when it was made by following the same instructions?',
    objectives: jobs.map((j) => ({
      id: 'quarter.' + j.id,
      title: j.title,
      essential: false,
      visible: j.condition,
      done: j.finish,
      weave: {
        ...clockTopics(j.act),
        thinking: j.thinking,
        minutes: j.id === 'plan' ? 6 : 3,
      },
      onComplete: [{ journal: 'j.quarter.' + j.id }],
    })),
  });
  for (const job of jobs) {
    pack.journal.push({
      id: 'j.quarter.' + job.id,
      text: job.line,
      claimKind: 'observation',
    });
    job.hints.forEach((text, i) =>
      pack.hints.push({
        id: 'h.quarter.' + job.id + '.' + i,
        objective: 'quarter.' + job.id,
        depth: (i + 1) as Hint['depth'],
        text,
      }),
    );
  }
}
