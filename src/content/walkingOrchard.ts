import type { Condition, ContentPack, DialogueNode, Hint, Objective, SourceRecord } from '../domain/types';
import {
  beds,
  editionNames,
  orchardSquare,
  orchardTopics,
  orchardYard,
  type OrchardCommand,
} from '../domain/walkingOrchard';

export const grovePeople = {
  gresa: 'grove-gresa-oker',
  pella: 'courier-pella',
  wangari: 'lantern-q46795',
  paulo: 'ink-q164797',
} as const;
const { gresa, pella, wangari, paulo } = grovePeople;
export const forestGate: Condition = { objective: 'forest.arrival' };
export const civicGate: Condition = { objective: 'civic.arrival' };
const flag = (key: string): Condition => ({ flag: 'grove.' + key, eq: true });
const member = (key: string, values: string[]): Condition => ({ flag: 'grove.' + key, in: values });
export const placedGrove = member('edition', Object.keys(editionNames));
const all = (...conditions: Condition[]): Condition => ({ all: conditions });
export const underArch = all(civicGate, placedGrove, ...beds.map((b) => flag('track.' + b)));
const options = (...links: [string, string, Condition?][]): DialogueNode['options'] =>
  links.map(([text, next, gate]) => ({ text, next: 'grove.' + next, if: gate }));
function scene(
  id: string,
  speaker: string,
  text: string,
  links: DialogueNode['options'] = [],
  citation?: string,
): DialogueNode {
  return {
    id: 'grove.' + id,
    speaker,
    text,
    options: links,
    historicalLabel: speaker === wangari || speaker === paulo ? 'imagined-alternate' : 'fictional-world',
    ...(citation ? { citationSource: citation } : {}),
  };
}
const dialogue: DialogueNode[] = [
  scene(
    'gresa',
    gresa,
    'Gresa Oker has tied two boots to a tub. “Don’t laugh. My father’s old shoes have walked further since he stopped wearing them.” She turns the wheels towards the wall. “I want him to see one sapling big enough to shade his chair.”',
    options(
      [
        'Ask what she brought home from the town.',
        'gresa.home',
        member('answer', ['move', 'keep', 'invite']),
      ],
      ['Kneel beside the boots.', 'gresa.shoes'],
      ['Take the weight while she turns the cart.', 'gresa.cart'],
      ['Tell her which footprint never takes a second step.', 'gresa.mark', flag('track.kiln')],
    ),
  ),
  scene(
    'gresa.shoes',
    gresa,
    '“The soles hold better than bricks when the wall sweats. One evening the choir pulled a whole row of tubs past his window. He said he hadn’t heard those boots coming home in years.” Gresa hooks one lace twice. It keeps coming loose.',
  ),
  scene(
    'gresa.cart',
    gresa,
    'The back wheel catches the hem of her apron. Gresa comes out of it in a slow, dignified turn. She stands facing you in her rehearsal sash. “That is the first time I’ve been undressed by a tree.” The next wheel runs true.',
  ),
  scene(
    'gresa.mark',
    gresa,
    '“My shoe was there. You can say that.” She picks a little leaf out of the rim. “Whether this tree lived after we brought it up is a question for another morning.”',
  ),
  scene(
    'gresa.home',
    gresa,
    'There is a half-turn in the bootlace that Gresa’s father tied himself. She has put the new rut through the beds a handspan wider. “I came home walking beside him,” she says. “You can’t push a chair from there. You can talk.”',
  ),
  scene(
    'pella.home',
    pella,
    'At rehearsal Pella opens her mouth, then closes it. She was about to give the carter’s cue herself. Gresa comes in a shade late. The wheel clears the little step cleanly. “That is the entrance,” Pella says.',
  ),
  scene(
    'pella',
    pella,
    'Pella stands on a ladder with two glass springs. One makes the square look full. Through the other you can count the roofs on the empty street. “The light buyer leaves at sunset. Which of these am I supposed to sell her?”',
    options(
      [
        'Ask how the square changed the rehearsal.',
        'pella.home',
        member('answer', ['move', 'keep', 'invite']),
      ],
      ['Stand below and read the small dates.', 'pella.dates'],
      ['Hold the rung and let her come down.', 'pella.rung'],
      [
        'Ask if she still has the envelope with the three bells.',
        'pella.freight',
        { flag: 'courier.family', in: ['bell', 'receipt'] },
      ],
    ),
  ),
  scene(
    'pella.dates',
    pella,
    '“The old picture was the night we planted. The new picture was the morning we went looking for leaves.” She backs down one rung. “I called them both our living trees. I thought I knew what living meant.”',
  ),
  scene(
    'pella.rung',
    pella,
    'Pella gets one foot to the ground and stops. “If the buyer walks, the choir pays for another winter’s water. I’ve sung for a warm supper. Singing for twelve barrels is rather a long engagement.”',
  ),
  scene(
    'pella.freight',
    pella,
    'She pats the old envelope flat. “Nemi let the room go quiet before the bow. Bew heard our freight bell. I was there and I still needed the writing on the back to hear what he heard.”',
  ),
  scene(
    'wangari',
    wangari,
    'Wangari Maathai is sitting on the handle of the empty cart. Gresa wants her to pull. The choir wants her to count. “Who wanted these trees in the first place?” Gresa points at a window with a low chair.',
    options(
      ['Wheel the empty cart to the window first.', 'wangari.chair'],
      ['Walk alongside the nursery crew.', 'wangari.crew'],
      [
        'Remember her lamp from another town.',
        'wangari.lamp',
        { flag: 'lamplight.met.lantern-q46795', eq: true },
      ],
    ),
    'HIS-GROVE-LECTURE',
  ),
  scene(
    'wangari.chair',
    wangari,
    'The man at the window points to the glare on his soup bowl. From the parade route the awning would hide a fine row of trees. From his chair it would make lunch possible. Maathai waits while he shows Gresa where the sun will be tomorrow.',
    [],
    'HIS-GROVE-LECTURE',
  ),
  scene(
    'wangari.crew',
    wangari,
    '“In Kenya, women named the work that was getting harder for them. Those needs helped shape the work of growing trees.” A choir singer turns her sleeve inside out. She kept the watering rota there because no one had ever asked her for it.',
    [],
    'HIS-GROVE-BELT',
  ),
  scene(
    'wangari.lamp',
    wangari,
    'She folds the lamp down against its handle. “You carried that light to people before. Let somebody here put it where they need it.” Gresa puts it under a leaf, then gives it to the man at the window.',
  ),
  scene(
    'paulo',
    paulo,
    'Paulo Freire tries Pella’s paper shutters. Through one of them you can see his nose. He turns the little theatre round. Gresa, who has been its subject all morning, can at last see how it works.',
    options(
      ['Hand the grower the shutter cord.', 'paulo.cord'],
      ['Sit behind the cloth yourself.', 'paulo.seat'],
      [
        'Bring the public noticeboard into the conversation.',
        'paulo.notice',
        { flag: 'ink.q164797.delivery', in: ['first', 'second'] },
      ],
    ),
    'HIS-GROVE-DIALOGUE',
  ),
  scene(
    'paulo.cord',
    paulo,
    '“Tell me where to stand,” he says. Gresa asks him to move his hand. It was covering a hole she tied shut herself. She will lend her count. The hours of her father’s visit belong to him. Freire gives her both ends of the cord.',
  ),
  scene(
    'paulo.seat',
    paulo,
    'From the square, the cloth looks like an invitation. From this side, you can hear every person who wants you to open it. Freire asks what question you would have liked them to begin with. He waits long enough for Gresa to answer first.',
    [],
    'HIS-GROVE-DIALOGUE',
  ),
  scene(
    'paulo.notice',
    paulo,
    '“On the other board, someone could decide what happened to a message after you handed it over.” He slides a piece of paper across the sill. “Could the person who lent a count decide what happens to it here?”',
  ),
  scene(
    'gresa.square',
    gresa,
    'Gresa has brought her father’s chair on one wheel. He is walking beside it, stopping to pull weeds out of the cobbles. “It was quicker when he was in it,” she whispers. “I am trying to remember that quicker wasn’t what I wanted.”',
    options(
      ['Walk with them to the change you paid for.', 'gresa.square.walk'],
      ['Stand with her outside the lamps.', 'gresa.square.dark'],
    ),
  ),
  scene(
    'gresa.square.walk',
    gresa,
    'She catches hold of her father’s sleeve at the first bump. He shakes himself loose and offers her the weed. “All last winter I wanted him on this street,” she says. “Now I have to let him walk it.”',
  ),
  scene(
    'gresa.square.dark',
    gresa,
    '“Do you want their names?” She waits to hear your answer. “So did our first choir master. By the next morning everybody knew whose window was empty after dark.” She shifts the lantern away from the rota.',
  ),
  scene(
    'pella.square',
    pella,
    'Pella still has the buyer’s two coins in her shoe. One chimes on every step. “She paid us enough for one evening. She never said an evening for whom.” The choir has learnt to begin on the second chime.',
    options(
      ['Stand where the late crew enters.', 'pella.square.late'],
      ['Ask for the verse she cut.', 'pella.square.verse'],
    ),
  ),
  scene(
    'pella.square.late',
    pella,
    'A child pushes one tub right through a turn in the dance. Pella opens her hand and six dancers change direction. She was the only one who could give that cue. The child was the only one who could tell her when.',
  ),
  scene(
    'pella.square.verse',
    pella,
    'She sings the bar she took out. It is long enough for somebody to push a tub from one side of the square to the other. Nemi used to leave that much room for the person who wanted to come on last.',
  ),
  scene(
    'wangari.square',
    wangari,
    'Maathai and the nursery crew have come to see what survived the evening. She asks the man in the chair to choose the first stopping place. He wheels straight past his own window.',
    options(
      ['Follow him to the shared barrel.', 'wangari.square.water'],
      ['Stay until the singers finish watering.', 'wangari.square.sing'],
    ),
    'HIS-GROVE-BELT',
  ),
  scene(
    'wangari.square.water',
    wangari,
    'The barrel is warm from the sun. Gresa’s father tests its weight before pointing back towards the steps. Maathai takes one handle. “A visit will tell you some things a photograph of planting day cannot.”',
  ),
  scene(
    'wangari.square.sing',
    wangari,
    'The last singer puts her cup under the tap. “Nobody counts this little bit,” she says. Maathai waits with the cup until she has heard who filled the barrel. The count and the credit have begun in different places.',
  ),
  scene(
    'paulo.square',
    paulo,
    'Freire finds the people who usually read the town’s notices standing on a bench, trying to write one. The youngest dancer has left a blank space for someone coming off shift.',
    options(
      ['Give the dancer the first turn.', 'paulo.square.turn'],
      ['Invite the notice writer to try the late route.', 'paulo.square.late'],
    ),
    'HIS-GROVE-DIALOGUE',
  ),
  scene(
    'paulo.square.turn',
    paulo,
    'The dancer draws a wheel. “Where did it stick?” Freire asks. A carrier marks the curb the choir forgot. Now the drawing can make a demand of the people who paid for the dance.',
  ),
  scene(
    'paulo.square.late',
    paulo,
    'The writer returns with a wet cuff and a correction. Gresa dries the cuff with her apron, then gives the pen back. Freire leaves the bench empty long enough for the carrier to climb up.',
  ),
];
type Job = {
  id: string;
  title: string;
  done: Condition;
  act: OrchardCommand['act'];
  words: string;
  help: string[];
  thinking: NonNullable<NonNullable<Objective['weave']>['thinking']>;
};
const jobs: Job[] = [
  {
    id: 'tracks',
    title: 'Follow the orchard that got up and walked',
    done: all(...beds.map((b) => flag('track.' + b))),
    act: 'track',
    words:
      'I found a boot with no second step, a sneeze in a tree and a gap in a pink circle. The tubs could travel. Which ones lived was a different mystery.',
    help: [
      'The empty tubs have left marks.',
      'Walk to each of the three nursery yards.',
      'At each bed, follow its tracks.',
      'The three marks will remember the old cartway when the Civic square opens.',
    ],
    thinking: { dok: 2, bloom: 'analyse', fink: 'application', solo: 'relational' },
  },
  {
    id: 'wheel',
    title: 'Help a bare tub leave a walking footprint',
    done: member('account', ['cart', 'open']),
    act: 'account',
    words:
      'I drew a fresh line of chalk for each of four runs. Even an empty tub left the print when the boot was on the rim. The marks alone could never tell me who had been holding the handles.',
    help: [
      'At Kiln Wall a spare wheel stands in chalk.',
      'There are two loads and two places to put the boot.',
      'Push once for each pair. Leave the chalk marks side by side.',
      'Tell Pella what the cart can explain or leave the night caller unnamed. Both accounts keep the limit of the trial.',
    ],
    thinking: { dok: 3, bloom: 'evaluate', fink: 'integration', solo: 'relational' },
  },
  {
    id: 'springs',
    title: 'Catch the frost between two panes of glass',
    done: all(flag('joined.spade'), flag('joined.frost')),
    act: 'join',
    words:
      'I brought two springs up to the same date. Both began with twelve tubs. Several had no return entry after the frost. I could show what the witnesses saw and leave the rest open.',
    help: [
      'Try the nursery glass at any of the three yards.',
      'Open a dated face in each spring at all three beds.',
      'Set first spade beside first spade, then frost beside frost.',
      'The book can be missing a mark even after you have visited its bed.',
    ],
    thinking: { dok: 3, bloom: 'analyse', fink: 'integration', solo: 'relational' },
  },
  {
    id: 'shade',
    title: 'Light a pattern under the cloth before lending it',
    done: all(flag('saw.small'), flag('saw.crowd'), { flagSet: 'grove.draftWindow' }),
    act: 'reserve',
    words:
      'I saw how a few open shutters could narrow twelve slips down to a single outline. I could still take a count on loan or carry the rota closed.',
    help: [
      'There is a dark theatre in the nursery.',
      'Light the screen once with all shutters closed.',
      'Open the three shutters and try the light under cover.',
      'Fold to a permitted group of at least three, or roll the rota shut.',
    ],
    thinking: { dok: 3, bloom: 'evaluate', fink: 'human', solo: 'relational' },
  },
  {
    id: 'promise',
    title: 'Buy the square one evening',
    done: placedGrove,
    act: 'pledge',
    words:
      'I hung an observation above the square and put a promise underneath it. Someone else could accept the reading and still spend that evening differently.',
    help: [
      'The two springs give the town something to act on.',
      'Bring together the two dates and choose the pane that will travel.',
      'Choose what the grower lets you take from the rota.',
      'Give the evening to shelter, a public procession or the return crew.',
    ],
    thinking: { dok: 4, bloom: 'create', fink: 'caring', solo: 'extended' },
  },
  {
    id: 'turn',
    title: 'Bring the chair and the choir through the new square',
    done: member('answer', ['keep', 'move', 'invite']),
    act: 'answer',
    words:
      'I went through the change with the woman who tends the tubs and the woman who calls the dance. I let what they did shape who would have the next turn.',
    help: [
      'The purchased evening is waiting in the Civic Machine.',
      'At Library Dispatch, look for the wheel mark beside a pole.',
      'At the installation, walk with Gresa and with Pella.',
      'Choose who takes the next turn. You can still return to the nursery and change the evening.',
    ],
    thinking: { dok: 4, bloom: 'evaluate', fink: 'learning-to-learn', solo: 'extended' },
  },
];
const sources: [string, string, string, string, string, string?][] = [
  [
    'LECTURE',
    'Nobel Lecture',
    'https://www.nobelprize.org/prizes/peace/2004/maathai/lecture/',
    'Nobel Prize Outreach',
    'Maathai describes hearing rural Kenyan women identify local needs and how tree planting arose in response.',
    '2004',
  ],
  [
    'BELT',
    'What We Do',
    'https://www.greenbeltmovement.org/what-we-do/',
    'The Green Belt Movement',
    'The organisation explains its work in tree planting, livelihoods, community action and environmental advocacy.',
  ],
  [
    'DIALOGUE',
    'Concepts Used by Paulo Freire',
    'https://www.freire.org/concepts-used-by-paulo-freire/',
    'Freire Institute',
    'Dialogue and investigation of themes in people’s lived situations inform the invented shutter and writing scenes.',
  ],
  [
    'ROTA',
    'De-Identifying Government Datasets: Techniques and Governance',
    'https://www.nist.gov/publications/de-identifying-government-datasets-techniques-and-governance',
    'National Institute of Standards and Technology',
    'Separately sourced background on disclosure risk in released datasets. The fictional grower permissions and small-group rule are particular to this game.',
    '2023',
  ],
];
export function installWalkingOrchard(pack: ContentPack) {
  pack.dialogue.push(...dialogue);
  for (const [id, title, url, container, supports, documentDate] of sources) {
    const source: SourceRecord = {
      id: 'HIS-GROVE-' + id,
      title,
      url,
      locator: title,
      supports,
      accessed: '2026-11-28',
      mla: {
        kind: 'page',
        title,
        container,
        documentDate,
        ...(id === 'LECTURE' ? { author: 'Maathai, Wangari' } : {}),
      },
    };
    pack.sources.push(source);
  }
  pack.characters.push({
    id: gresa,
    name: 'Gresa Oker',
    role: 'Nursery carter and rehearsal alto',
    mode: 'fictional',
    sprite: 'custom:deep.auburn.green.wine.both.rose.curls.none.none',
    talk: [{ node: 'grove.gresa' }],
  });
  for (const [name, id] of Object.entries(grovePeople)) {
    const person = pack.characters.find((p) => p.id === id)!;
    person.localGreeting = {
      ...person.localGreeting,
      [orchardYard]: 'grove.' + name,
      [orchardSquare]: 'grove.' + name + '.square',
    };
  }
  for (const [id, world, title, available, group] of [
    ['the-orchard-that-got-up', 'WORLD-06', 'The orchard that got up', forestGate, jobs.slice(0, -1)],
    [
      'the-third-turn-of-the-orchard',
      'WORLD-13',
      'The third turn of the orchard',
      all(civicGate, placedGrove),
      jobs.slice(-1),
    ],
  ] as const)
    pack.missions.push({
      id,
      world,
      title,
      available,
      stake:
        world === 'WORLD-06'
          ? 'Gresa wants shade by her father’s chair. Pella needs the light buyer to pay the choir. The nursery seems to have walked out overnight.'
          : 'One evening in the square cost the town its two coins. The people who live with the new arrangement can still move it.',
      knowledgeQuestion:
        world === 'WORLD-06'
          ? 'How could two honest counts tell different stories about the same orchard?'
          : 'Whose permission can a count carry, and who gets to turn the count into a decision?',
      objectives: group.map((j) => ({
        id: 'grove.' + j.id,
        title: j.title,
        essential: false,
        visible: available,
        done: j.done,
        weave: { ...orchardTopics(j.act), thinking: j.thinking, minutes: j.id === 'springs' ? 5 : 3 },
        onComplete: [{ journal: 'j.grove.' + j.id }],
      })),
    });
  for (const j of jobs) {
    pack.journal.push({ id: 'j.grove.' + j.id, text: j.words, claimKind: 'observation' });
    j.help.forEach((text, i) =>
      pack.hints.push({
        id: 'h.grove.' + j.id + '.' + i,
        objective: 'grove.' + j.id,
        depth: (i + 1) as Hint['depth'],
        text,
      }),
    );
  }
}
