import { cupShop, cupWeave, cupStops, stops, type CupStop } from '../domain/firstCup';
import type { Condition, ContentPack, DialogueNode, Hint, Mission, Objective } from '../domain/types';

export const cupHosts = {
  cen: 'cup-cen',
  kit: 'cup-kit',
  daniel: 'lantern-q233950',
  amos: 'cup-tversky',
} as const;
const { cen, kit, daniel, amos } = cupHosts;
const research = 'HIS-CUP-JUDGMENT';
const yes = (key: string): Condition => ({ flag: 'cup.' + key, eq: true });
function line(id: string, speaker: string, text: string, options: DialogueNode['options'] = []): DialogueNode {
  const guest = speaker === daniel || speaker === amos;
  return {
    id: 'cup.' + id,
    speaker,
    text,
    options,
    historicalLabel: guest ? 'imagined-alternate' : 'fictional-world',
    ...(guest ? { citationSource: research } : {}),
  };
}
const option = (text: string, next: string) => ({ text, next: 'cup.' + next });
const remember = (text: string, next: string, key: string, value: string | boolean) => ({
  ...option(text, next),
  effects: [{ setFlag: 'cup.' + key, value }],
});
const lines = [
  line(
    'cen',
    cen,
    'Cen Aster is rubbing a thumb over the blank on her cart. There used to be a price here, cut deep enough to find in the dark. “I could take our shop somewhere else. I can’t take that number off it.” Something taps three times under the floor.',
    [option('Get down and listen.', 'floor'), option('Put a finger in the cut.', 'cut')],
  ),
  line(
    'floor',
    kit,
    'Three taps. A pause. Another three. Kit Oriel crawls out from under the counter with a wheel nut in her teeth. “My old cue for an entrance. Nobody ever answered.” Cen taps back on the copper jug. Kit sits quite still for a moment.',
  ),
  line(
    'cut',
    cen,
    '“When I was small I could read our prices before I could read my name. I did the lettering when I bought the cart. Last week a boy counted the dents and went home before he read the chalk.” She puts a fresh stick beside your hand.',
  ),
  line(
    'kit',
    kit,
    'Kit sets four little copper cups on a rail. One tap and they all tip forward. “Same scoop. Same cocoa. Two temperatures. I can promise all three here.” She nods at the roof. A dark spot the size of a penny has appeared above it. “Which of them can you promise when it reaches the street?”',
    [
      option('Ask Kit to show the trick with the scarf.', 'scarf'),
      option('Look behind the cup on the top shelf.', 'ceiling'),
    ],
  ),
  line(
    'scarf',
    kit,
    'She slips the felt sleeve over your wrist. There is a smooth patch on the inside. “My hand always goes there. I used to think the sleeve made heat.” Cen pours a little cocoa into two identical cups and sets one in the sleeve. “Wait for the cart ride,” she says.',
  ),
  line(
    'ceiling',
    kit,
    'The square of plaster behind the cup is clean. The rest of the ceiling is brown from stove smoke. “Picture of the woman who owned the shop,” Kit says. “Took it with her. Funny how well I remember the frame.”',
  ),
  line(
    'kit.street',
    kit,
    'Kit taps her knuckles against the two dials. “Same hand. Same knock. One says we have lost a little warmth and the other says we have lost the morning. Give me something I can set both of them beside.” She puts the shade glass where you can reach it.',
  ),
  line(
    'daniel',
    daniel,
    'Daniel Kahneman tips two identical cups upside down. One has 2 written under the saucer, the other 8. “Cen let me borrow these on condition I stop guessing which one she bought first. Will you help me give each crew a fair draw?”',
    [
      remember('Turn the offers face down and draw seats.', 'draw', 'display', 'seats'),
      remember('Put the empty ticket between the numbered ones.', 'middle', 'display', 'middle'),
    ],
  ),
  line(
    'draw',
    daniel,
    'He shuffles nine seat tickets separately at each stop. Each volunteer draws once. Nobody changes seats for a second number. “A little inconvenient,” he says, and puts his own second ticket back. “Good.”',
  ),
  line(
    'middle',
    daniel,
    'He sets a saucer without a number between the others. “A person looking at an empty saucer has still seen this cart, this street and my rather expensive coat.” He hangs the coat on the other side of the door.',
  ),
  line(
    'amos',
    amos,
    'Amos Tversky has made a toy balance from two spoons. He sets three folded offers on either side. It swings level. “There. Now which person wrote eight?” Kit pokes the fulcrum. The spoons fall handle to handle.',
    [
      remember('Put a seat mark on each fold.', 'marks', 'folds', 'seats'),
      remember('Keep the whole bundle tied by crew.', 'bundle', 'folds', 'crew'),
    ],
  ),
  line(
    'marks',
    amos,
    'He marks the fold, never the person’s name. “Later we can find the offer made by this particular seat. We still won’t know why they made it unless they tell us.”',
  ),
  line(
    'bundle',
    amos,
    'He ties the mill in blue thread and the steps in grey. A single copper slips out. “Useful bundles,” he says, fishing it from under the stove. “Dangerous pockets.”',
  ),
  line(
    'daniel.return',
    daniel,
    'The first visitor has stopped far enough away to read the sign. Daniel pulls his chair aside. “I was about to tell you she was counting her pennies. From here, I can’t even see her hands.”',
    [
      remember('Move his chair behind the cart.', 'chair', 'daniel.return', 'back'),
      remember('Leave him beside the sign and lend him a cup.', 'company', 'daniel.return', 'front'),
    ],
  ),
  line(
    'chair',
    daniel,
    'From behind the cart he hears the visitor asking about the long way home. “I nearly wrote down the price as her reason.” He tears the corner off his sheet and folds it into a little chair.',
  ),
  line(
    'company',
    daniel,
    'She takes his cup and shows him a dent on the underside. She was trying to see whether it was the one she dropped as a child. Daniel sits with her until she finishes looking.',
  ),
  line(
    'amos.return',
    amos,
    'Amos has two sealed notes from the mill. Both writers asked that their offers travel with the reasons on the back. He leaves the thread uncut until the cart opens.',
    [remember('Get the mill’s permission slips out of his damp coat.', 'dry', 'tversky.return', true)],
  ),
  line(
    'dry',
    amos,
    'He lays the envelopes beside the street dial. A dark blue 2 shows through one, an 8 through the other. At the cart you can unfold either person’s reason. Somebody has drawn quite a good wheel on the flap.',
  ),
  line(
    'cen.weir',
    cen,
    'At the Old Weir, Cen has turned the till sideways. “So far the gatekeeper can see my knees and I can see her boots. Kit says that’s enough of a person to sell to. I’d rather see her face.”',
    [option('Give Cen a hand with the narrow end.', 'weirTurn'), option('Watch from the lower bank.', 'bank')],
  ),
  line(
    'weirTurn',
    cen,
    'You take the axle. Cen lifts the tray. The gatekeeper peers over the rail and says, “There you are.” Cen, who had a whole speech ready about her prices, says it back.',
  ),
  line(
    'bank',
    kit,
    'Kit’s old chalk figure is still visible on the far side of the cart. She picks up a cloth, then sits down beside a woman watching the water. The cloth stays in her hand.',
  ),
  line(
    'cen.steps',
    cen,
    'At the North Steps, the left wheel finds the little pit where a stone has worn away. Cen folds a price card under the spoke. “I had a use in mind for that card,” she says. “I like this one.”',
    [option('Hold the cart while she draws a new sign.', 'paper'), option('Ask about the last step.', 'last')],
  ),
  line(
    'paper',
    cen,
    'She draws a cup and forgets to draw the price. The first customer draws steam over it. The next draws a hand. “If I leave them long enough,” Cen says, “somebody’ll draw the whole street.”',
  ),
  line(
    'last',
    kit,
    '“I missed this step once, on my last night at the theatre.” Kit tests the edge with her heel. “Cen sat with me through the entire second act. Neither of us ever found out who got married.”',
  ),
];
const stopIds = Object.keys(stops) as CupStop[];
export function installFirstCup(pack: ContentPack) {
  pack.sources.push(
    {
      id: research,
      title: 'Judgment under Uncertainty: Heuristics and Biases',
      url: 'https://doi.org/10.1126/science.185.4157.1124',
      locator: 'Science, vol. 185, no. 4157, pp. 1124–31, 1974',
      supports: 'Tversky and Kahneman describe anchoring and adjustment in judgments under uncertainty.',
      accessed: '2026-11-27',
      mla: {
        kind: 'page',
        author: 'Tversky, Amos, and Daniel Kahneman',
        title: 'Judgment under Uncertainty: Heuristics and Biases',
        container: 'Science',
        publication: { volume: '185', issue: '4157', year: '1974', pages: '1124–31' },
      },
    },
    {
      id: 'HIS-CUP-OFFERS',
      title: '“Coherent Arbitrariness”: Stable Demand Curves Without Stable Preferences',
      url: 'https://doi.org/10.1162/00335530360535153',
      locator: 'Quarterly Journal of Economics, vol. 118, no. 1, pp. 73–106, 2003',
      supports:
        'Ariely, Loewenstein and Prelec examined how an arbitrary initial number influenced willingness to pay in their experiments. The cocoa cart has its own fictional volunteers and offers.',
      accessed: '2026-11-27',
      mla: {
        kind: 'page',
        author: 'Ariely, Dan, et al',
        title: '“Coherent Arbitrariness”: Stable Demand Curves Without Stable Preferences',
        container: 'The Quarterly Journal of Economics',
        publication: { volume: '118', issue: '1', year: '2003', pages: '73–106' },
      },
    },
  );
  pack.dialogue.push(...lines);
  const at = (id: string) => ({
    [cupShop]: 'cup.' + id,
    [cupStops.weir]: 'cup.' + id + '.return',
    [cupStops.steps]: 'cup.' + id + '.return',
  });
  const kahneman = pack.characters.find((c) => c.id === daniel)!;
  kahneman.localGreeting = { ...kahneman.localGreeting, ...at('daniel') };
  pack.characters.push(
    {
      id: amos,
      name: 'Amos Tversky',
      role: 'Psychologist working on judgement and decision-making',
      mode: 'historical',
      sprite: 'villager-2',
      talk: [{ node: 'cup.amos' }],
      localGreeting: at('amos'),
    },
    {
      id: cen,
      name: 'Cen Aster',
      role: 'Cocoa seller and former sign cutter',
      mode: 'fictional',
      sprite: 'villager-1',
      talk: [{ node: 'cup.cen' }],
      localGreeting: { [cupStops.weir]: 'cup.cen.weir', [cupStops.steps]: 'cup.cen.steps' },
    },
    {
      id: kit,
      name: 'Kit Oriel',
      role: 'Cart fitter and former theatre prompter',
      mode: 'fictional',
      sprite: 'villager-2',
      talk: [{ node: 'cup.kit' }],
      localGreeting: { [cupStops.weir]: 'cup.kit.street', [cupStops.steps]: 'cup.kit.street' },
    },
  );
  const mission: Mission = {
    id: 'KG-CH10-FIRST-CUP',
    world: 'WORLD-11',
    title: 'Who gets the first cup?',
    knowledgeQuestion: 'What can a price or a dial tell you about the person holding a cup?',
    stake:
      'Cen has one cart and two invitations. Kit can keep the jug warm on the road. Neither can promise a stranger will come close enough to read the sign.',
    objectives: [],
  };
  const prep: Objective = {
    id: 'cup.roll',
    title: 'Roll the cocoa cart out',
    essential: false,
    visible: yes('rain'),
    done: { any: [yes('visited.weir'), yes('visited.steps')] },
    weave: cupWeave,
    onComplete: [{ journal: 'j.cup.roll' }],
  };
  mission.objectives.push(prep);
  pack.missions.push(mission);
  const jobs = [
    {
      o: prep,
      entry: 'I wheeled a jug away from a shop where the old price was carved into the wood.',
      hints: [
        'Check the wheels after rain.',
        'Kit has two carafes of the same cocoa and four scoops of space.',
        'Lift all three ticket lids at either crew’s table. Each volunteer tasted the same reference cup.',
        'Fill four wells. Choose felt or bare copper, look through the rain flap and pick a stop.',
      ],
    },
  ];
  for (const [bench, place] of [
    ['mill', 'mill break room'],
    ['steps', 'step repair crew'],
  ] as const) {
    const o: Objective = {
      id: 'cup.passers.' + bench,
      title: 'Turn over the ' + place + ' tray',
      essential: false,
      visible: yes(bench + '.blank'),
      done: { all: [yes(bench + '.count.cups'), yes(bench + '.count.footsteps')] },
      weave: { ...cupWeave, thinking: { dok: 2, bloom: 'analyse', fink: 'application', solo: 'relational' } },
      onComplete: [{ journal: 'j.cup.passers.' + bench }],
    };
    mission.objectives.push(o);
    jobs.push({
      o,
      entry:
        'I put the people who turned down a tasting back into the story. There was no price to copy into their empty places.',
      hints: [
        'A runner kept a second count beneath the saucers.',
        'Open every ticket at the ' + place + '.',
        'Turn the runner’s tray over and trace the rings of the nine people who wrote an offer.',
        'Trace all the invitations as well. A missing offer and a written zero tell different stories.',
      ],
    });
  }
  for (const stop of stopIds) {
    const o: Objective = {
      id: 'cup.serve.' + stop,
      title: 'Open the cart at ' + stops[stop],
      essential: false,
      visible: { flag: 'cup.route', eq: stop },
      done: { any: [yes('served.' + stop + '.chalk'), yes('served.' + stop + '.slips')] },
      weave: cupWeave,
      onComplete: [{ journal: 'j.cup.serve.' + stop }],
    };
    const o2: Objective = {
      id: 'cup.facing.' + stop,
      title: 'Turn the cart towards the road',
      essential: false,
      visible: {
        all: [
          { flag: 'cup.route', eq: stop },
          { flag: 'cup.tversky.return', eq: true },
        ],
      },
      done: { flag: 'cup.facing.' + stop, in: ['dial', 'offers'] },
      weave: { ...cupWeave, thinking: { dok: 3, bloom: 'create', fink: 'human', solo: 'relational' } },
      onComplete: [{ journal: 'j.cup.facing.' + stop }],
    };
    pack.missions.push({
      id: 'KG-FIRST-CUP-' + stop.toUpperCase(),
      world: stop === 'weir' ? 'WORLD-12' : 'WORLD-13',
      title: stop === 'weir' ? 'A hand across the weir' : 'The worn step',
      knowledgeQuestion: 'Whose decision changes when a price becomes public?',
      stake: mission.stake,
      objectives: [o, o2],
    });
    jobs.push({
      o: o2,
      entry:
        'I turned the cart at ' +
        stops[stop] +
        ' so a traveller could see what a number measured and where the other side of the story was kept.',
      hints: [
        'The cart has two sides. Each side can show a different kind of slant.',
        'Compare the dials in the same shade. Speak with Amos to open his two mill envelopes.',
        'Open the counter and unfold the offers marked 2 and 8. Each writer let the reason travel with the number.',
        'Choose which faces the street. The other remains inside and you can turn the cart again.',
      ],
    });
    jobs.push({
      o,
      entry:
        stop === 'weir'
          ? 'I saw a whole gate crew shopping through the hands of one runner.'
          : 'I shared a break with a woman who knew every missing stone in the steps.',
      hints: [
        'Cen left room for a second pair of hands.',
        'Take the road to ' + stops[stop] + '. The cart only sets up where you sent it.',
        'Read the shop glass and the street dial. Check them against the shade reference if you wish.',
        'Give the visitors a chalk price they can see from the road, or fold their own offers out of sight.',
      ],
    });
  }
  for (const { o, entry, hints } of jobs) {
    pack.journal.push({ id: 'j.' + o.id, text: entry, claimKind: 'observation' });
    hints.forEach((text, i) =>
      pack.hints.push({ id: 'h.' + o.id + '.' + i, objective: o.id, depth: (i + 1) as Hint['depth'], text }),
    );
  }
}
