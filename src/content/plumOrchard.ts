import { chestWeave, PLUM_LOFT } from '../domain/plumChest';
import { specimenEquipped } from '../domain/specimenGear';
import { PERKINS_KEY } from './readingWorks';
import type {
  Condition,
  ContentPack,
  DialogueNode,
  DialogueOption,
  Hint,
  Objective,
  Weave,
} from '../domain/types';

const fen = 'plum-fen',
  snail = 'plum-tallowheel',
  louis = 'orchard-louis-braille';
export const hasPerkins = specimenEquipped(PERKINS_KEY);
export const plumFlag = (name: string): Condition => ({
  flag: 'plum.' + name,
  eq: true,
});
export const plumEdition = (which: 'road' | 'roots'): Condition => ({
  flag: 'plum.play',
  eq: which,
});
const both: Condition = { all: [plumFlag('open.plum'), plumFlag('open.moon')] };
const opened: Condition = {
  any: [plumFlag('open.plum'), plumFlag('open.moon')],
};
const spoke = (
  text: string,
  next: string,
  condition?: Condition,
  mark?: string,
): DialogueOption => ({
  text,
  next: 'plum.' + next,
  ...(condition ? { if: condition } : {}),
  ...(mark ? { effects: [{ setFlag: 'plum.' + mark, value: true }] } : {}),
});
const leave = (text: string): DialogueOption => ({ text });
function performance(
  text: string,
  next: string,
  where: 'road' | 'roots',
  part: string,
): DialogueOption {
  return {
    text,
    next: 'plum.' + next,
    if: plumEdition(where),
    effects: [
      { setFlag: 'plum.' + where + '.returned', value: true },
      { setFlag: 'plum.' + where + '.part', value: part },
    ],
  };
}
function piaCast(text: string, version: 'long' | 'short'): DialogueOption {
  return {
    text,
    next: 'plum.pia-' + version,
    if: plumFlag('translated'),
    effects: [
      { setFlag: 'plum.pia.' + version, value: true },
      { setFlag: 'plum.pia.last', value: version },
    ],
  };
}
const nodes: DialogueNode[] = [];
function say(
  id: string,
  speaker: string,
  text: string,
  options?: DialogueOption[],
) {
  nodes.push({
    id: 'plum.' + id,
    speaker,
    text,
    options,
    historicalLabel: speaker === louis ? 'reconstruction' : 'fictional-world',
    ...(speaker === louis
      ? { citationSource: 'HIS-READING-WORKS-PERKINS-PROCEDE' }
      : {}),
  });
}
say(
  'loft',
  fen,
  'The prop trunk has ordered a biscuit. “Edges first, please.” Fen Oriel puts a corner through the keyhole. Out comes a wheel with a bite missing. “That,” she tells you, “was our way to the orchard.” Something under the floor knocks three times and waits.',
  [
    spoke('Ask who gets paid in biscuit corners.', 'boots'),
    spoke('Put an ear near the floor.', 'floor'),
    leave('Take up the six-sided chest.'),
  ],
);
say(
  'boots',
  fen,
  '“Tallowheel pulled this stage for twenty springs. I hammered the wheels after school. When the village ran out of coins they paid my mother in plums. Awful currency. Lovely winter.” She catches the wheel before it falls. “Mum left me her ending. Three taps. Then this great hole where her foot should come down.”',
);
say(
  'floor',
  fen,
  '“Stand on my board.” You feel three knocks in the soles of your boots. Up on the rug you hear the band but lose the knocks. “The audience asked for an encore last night. It never crossed my mind the answer might be coming from underneath them.”',
);
say(
  'snail',
  snail,
  'Two horns the size of fiddle bows appear below the hatch. “Edges first,” Tallowheel explains. “A whole biscuit makes you look terribly keen.” She wore the theatre’s harness for years. A much smaller shell clings to the old axle. It is trying the company’s three taps all by itself.',
  [
    spoke(
      'Wait through the little shell’s own rest.',
      'wait-shell',
      { all: [opened, plumFlag('played.board')] },
      'waited',
    ),
    spoke('Ask Tallowheel why she chewed a wheel.', 'wheel-story'),
    leave('Let the little shell finish on its own.'),
  ],
);
say(
  'wheel-story',
  snail,
  '“It’s a plum-stone wheel. I thought the first one was a plum. After that I had a reputation to maintain.” Her horns fold in. “I can carry a theatre or a sleeping child. I’ve tried both together. The corners come off one of them.”',
);
say(
  'wait-shell',
  snail,
  'The little one taps back twice, slowly. Fen starts to count it in. Tallowheel puts her chin on Fen’s shoe. A full breath later, the third tap comes. “There,” says Fen. “She had a rest of her own.”',
);
say(
  'score',
  fen,
  'Two strips sit on Fen’s drum. The wheel strip fixes three taps and a rest. A second line in her mother’s hand calls the rest “a plum falling in the dark.” Fen has had the same argument about this line with every new drummer.',
  [
    spoke(
      'Match the fixed three taps to the three wheel spokes.',
      'meter',
      { all: [plumFlag('open.plum'), plumFlag('played.rim')] },
      'meter',
    ),
    spoke(
      'Let the little shell stretch the rest in its own time.',
      'breath',
      { all: [plumFlag('open.moon'), plumFlag('played.board')] },
      'breath',
    ),
    spoke(
      'Put the same rest under both readings.',
      'both-readings',
      { all: [plumFlag('meter'), plumFlag('breath')] },
      'two-meanings',
    ),
    leave('Leave the drum to the next musician.'),
  ],
);
say(
  'meter',
  fen,
  'You turn the wheel until a spoke strikes, three times. Every player coming in on the next bar can find that point together. Fen draws an open circle after the third mark. “The value is one beat. Even my uncle has to count that.”',
);
say(
  'breath',
  snail,
  'The little shell leaves a silence long enough for somebody at the back to laugh. On the next pass the hush feels like waiting for a door to open. Tallowheel lowers a horn. “You can miss somebody for longer than a beat.”',
);
say(
  'both-readings',
  fen,
  'Fen gives a single downbeat. Both drummers come in together. “I can tell them the value of a rest,” she says. “I can’t tell them what to value in it.” At the far end of the room Tallowheel has unhooked the harness. The little one keeps time after it is gone.',
);
say(
  'verse',
  fen,
  'A prop maker from the travelling orchard has sent a line in the company’s private stage language. Fen grew up singing it. “Limma, linn, lumm. If you say what each word means, you get ‘little fruit comes free’. Three pulses. Five syllables. Pia at the clearing wants to sing it herself.”',
  [
    spoke(
      'Lay “little fruit comes free” under the three knocks.',
      'literal',
      opened,
      'literal',
    ),
    spoke(
      'Try “drop, plum, drop” while Fen turns the drum.',
      'sung',
      opened,
      'sung',
    ),
    spoke(
      'Let Pia keep the meaning slip and make a choice about the song.',
      'verse-paired',
      { all: [plumFlag('literal'), plumFlag('sung')] },
      'translated',
    ),
    leave('Keep listening to the stagehands sing.'),
  ],
);
say(
  'literal',
  fen,
  'The fruit might be a damson or a cherry. This wording keeps the choice open. By the time you reach “free” the third spoke is past, and the actor holding the branch has already let go.',
);
say(
  'sung',
  fen,
  'One syllable lands on each knock. The little green prop drops into your palm on time. “Plum” adds a fruit the old words never named. Fen grins. “My mother always threw an apple.”',
);
say(
  'verse-paired',
  fen,
  'Fen rolls both scraps round the same handle. Pia can learn why the shorter line catches the falling prop. She can also change the fruit when she performs the song. From the loft someone calls, “Please change it before the pear scene.”',
);

say(
  'commission',
  fen,
  'There is room in the summer budget for one set of wheels or one set of roots. Fen wants the orchard to travel again. Tallowheel has a sleeping child under her shell. The carpenter has offered to pull a handcart. At the forest clearing a pair of pear trees already make a roof.',
  [
    {
      text: 'Set the fruit stage on wheels for the players to pull themselves.',
      if: { all: [opened, plumFlag('waited')] },
      effects: [{ setFlag: 'plum.play', value: 'road' }],
      next: 'plum.road',
    },
    {
      text: 'Build the orchard into the clearing and take the harness apart for seats.',
      if: { all: [opened, plumFlag('waited')] },
      effects: [{ setFlag: 'plum.play', value: 'roots' }],
      next: 'plum.roots',
    },
    leave('Step outside with the company’s offer still open.'),
  ],
);
say(
  'road',
  fen,
  'Fen counts the handles. “One for me.” The carpenter takes the other. Tallowheel follows out of her own accord for precisely six yards. Then she goes back for the biscuit tin. The painted wheel door now leads to the road rehearsal.',
);
say(
  'roots',
  snail,
  'Tallowheel pushes the old harness into a soft loop. The smallest audience member sinks into it up to her ears. Fen tries a line from the stage. Two pear trees answer with actual pears. The trap under the drum leads to the orchard.',
);
say(
  'cart',
  fen,
  'On the theatre road the missing fourth wheel belongs to the plum-stone drum. Use it under the cart and the drum goes quiet. Keep it in the drum and one of the players has to carry the fruit tree. Fen is short enough to see the whole show through its leaves.',
  [
    performance(
      'Put the wheel under the cart. Invite Fen to tap the beat on its rim.',
      'cart-back',
      'road',
      'wheel',
    ),
    performance(
      'Leave the wheel in the drum. Take the fruit tree on your shoulder.',
      'cart-tree',
      'road',
      'tree',
    ),
    leave('Set the handles down. Everyone can take a breath.'),
  ],
);
say(
  'cart-back',
  fen,
  'The cart rolls. The audience hears Fen’s first rim-tap before they see her come round the bend. A woman steps off her porch with two mugs. “Your mother used to make that corner squeak.” Fen tips the cart until it obliges.',
);
say(
  'cart-tree',
  fen,
  'The low note travels before the tree. Behind its leaves you can see a row of children marching in time. At the bend Fen takes your end. Her shoulder is the exact height for the smallest child to pick a plum. For once the front row gets the music last.',
);
say(
  'grove',
  snail,
  'In the clearing Tallowheel has turned the harness strap into the front row. A little girl asks when the performance starts. A snail gives three knocks back through the bench. An old man by the path hears only birds.',
  [
    performance(
      'Stand beside the path and give the start with the falling fruit.',
      'grove-back',
      'roots',
      'fruit',
    ),
    performance(
      'Ask the back row to rest their feet on the sounding plank.',
      'grove-board',
      'roots',
      'plank',
    ),
    leave('Try a seat in the pear trees for yourself.'),
  ],
);
say(
  'grove-back',
  snail,
  'The little girl puts a fallen pear in the old man’s hand for the next entrance. When it drops, he stands. Tallowheel settles over the smallest shell. Fen takes her first bow on a stage that has put down roots.',
);
say(
  'grove-board',
  snail,
  'Three knocks reach the back row through the plank. The little girl answers them. The old man has been keeping his shoes on the ground. He sets a heel beside hers in time for the encore. The smallest shell leans its whole weight into the last tap.',
);
say(
  'snail-road',
  snail,
  'Tallowheel is trying out a discarded axle ring as a biscuit cutter. The company has gone down the road without a harness. “I’m going to buy a ticket,” she says. “I’ve never seen the back of the play.”',
);
say(
  'snail-roots',
  snail,
  'The small shell is tapping under the front row. “Yesterday,” Tallowheel whispers, “I was the one who asked for an encore.” She offers you the soft middle of a biscuit and keeps the corners for herself.',
);
say(
  'home-road',
  fen,
  'Fen has cut a dent into the new wheel on purpose. “It was a rotten wheel. I miss the sound.” She practises the bend in the old tune with her thumbnail. “It’s my corner now.”',
);
say(
  'home-tree',
  fen,
  'Fen lifts her sleeve. A green leaf is printed on her shoulder from the road. “The drum sounded just the way I remember. I used to think Mum only remembered the sound.” She leaves a folded pad on the hook for whoever carries the tree tomorrow.',
);
say(
  'home-board',
  fen,
  'Fen has put a strip of polished wood across her own doorstep. “This is how the baby calls me.” Two knocks come up through the soles of her boots. She puts down her wheelwright’s rasp and taps once with a heel.',
);
say(
  'home-roots',
  fen,
  'Fen keeps the handcart drawing pinned up beside the orchard playbill. “Once I thought staying home meant giving in.” A pear hits the roof. “There’s my review.” She breaks it in two for the next drummer.',
);

say(
  'braille',
  louis,
  '“I wanted a musician to be able to write a line for the next musician.” On the Perkins volume’s record, Fen finds that the 1829 signs included dashes as well as dots. The later system changed. She brings two offcuts from her own wheel, one close pair of bumps and one ridge. “Could we tell these apart after the mould wears? My working pressure is marked on the brass band at the low table.”',
  [
    spoke(
      'Compare the separate bumps and the ridge on the fresh practice mould.',
      'fresh',
      { all: [hasPerkins, plumFlag('mould.fresh.working')] },
      'fresh',
    ),
    spoke(
      'Bring Fen the reading from the worn practice mould.',
      'worn',
      { all: [hasPerkins, plumFlag('mould.worn.working')] },
      'worn',
    ),
    spoke(
      'Give the next player the two mould states and the date of the book.',
      'credit',
      { all: [hasPerkins, plumFlag('fresh'), plumFlag('worn')] },
      'book',
    ),
    spoke(
      'Show Fen how a lighter draw finds the gap on her worn mould.',
      'light-hand',
      {
        all: [
          hasPerkins,
          plumFlag('mould.worn.working'),
          plumFlag('mould.worn.light'),
          plumFlag('mould.fresh.heavy'),
        ],
      },
      'hand',
    ),
    leave('Put the offcuts back on the tray.'),
  ],
);
say(
  'light-hand',
  fen,
  'On the worn pair the stylus drops into the fourth notch only when you ease up. A hard draw across the fresh pair masked its hollow too. Fen gives Braille a turn. He describes the ridge to her. She chalks a hand beside the notch for the next player, who may steady the tool a different way.',
);
say(
  'fresh',
  fen,
  'On the fresh impression your thumb crosses wood between the two bumps. The ridge carries it straight through. Fen can mount the two tabs in the dark. She gives you the offcuts to try the other mould.',
);
say(
  'worn',
  fen,
  'The worn mould fills the gap between the two bumps. On that impression the pair and the ridge run together. Fen turns the fresh one back towards you. “Someone looking at my ink diagram would swear they’ll never get those mixed up.”',
);
say(
  'credit',
  louis,
  'Fen threads separate edges onto the two practice tabs. The carver can now distinguish them on either mould. She dates Braille’s own first-edition design on a separate slip. Her new tabs carry her name and the day she tried them.',
);
const pia = 'plum-pia';
say(
  'pia',
  pia,
  'Pia Bosk is the actor who has to catch the pear. She has missed it forty-one times. “Forty-two if you count rehearsals with my brother. I don’t.” She reads the two versions Fen sent. Behind her, a real pear swings out of reach.',
  [
    piaCast(
      'Sing the longer line. Let Pia set her own beat for the catch.',
      'long',
    ),
    piaCast(
      'Give Pia the three-beat version. Put an apple on the branch.',
      'short',
    ),
    leave('Let Pia climb the tree first.'),
  ],
);
say(
  'pia-long',
  pia,
  'Pia crouches on “little” and keeps her palms open until “free.” A plum drops clean into them. She bows to a silent tree. “Forty-two,” she says. “The good kind this time.”',
);
say(
  'pia-short',
  pia,
  'She catches the apple on “drop.” A child points out it is a dreadful plum. Pia asks the child to name the next fruit. The old stage line gets a new last word without losing its beat.',
);
say(
  'pia-long-home',
  pia,
  'Pia’s brother has strung a hammock under the branch. In it lies the pear she missed. “Good understudy,” he says. Pia slips it into the cast photograph and puts his name under the knot.',
  [
    spoke('Rehearse a different version with Pia.', 'pia'),
    leave('Stay for the photograph.'),
  ],
);
say(
  'pia-home',
  pia,
  'Pia keeps the apple from her first performance on the window ledge. Her brother has written a tiny review on its paper. “I have eaten worse theatre.” She turns the review round so the next actor can read it.',
  [
    spoke('Try the other line at the tree.', 'pia'),
    leave('Let her keep the review.'),
  ],
);

type Job = {
  id: string;
  title: string;
  done: Condition;
  visible?: Condition;
  weave?: Weave;
  question: string;
  action: string;
  help: [string, string, string, string];
};
const listen: Weave = {
  ...chestWeave,
  aoks: ['ART', 'LAN', 'HUM'],
  subjects: ['music', 'lit-perf', 'psychology'],
  thinking: { dok: 3, bloom: 'evaluate', solo: 'relational', fink: 'human' },
};
const jobs: Job[] = [
  {
    id: 'turn',
    title: 'Open either drawer of the orchard chest.',
    done: opened,
    question: '23',
    action:
      'Turn the same solid to collect the two different neighbouring faces a catch needs.',
    help: [
      'Each carved picture has an opposite and four neighbouring sides.',
      'Trace the boot face to find which collar notch each tongue takes.',
      'With the plum on top, turn the bell towards you. Try the long notch and the sliding tongue.',
      'From the boot starting view, bring the right face forward. Set long, slide, tip the top towards you, then press the plum.',
    ],
  },
  {
    id: 'quiet',
    title: 'Find both scores hidden by Fen’s two catches.',
    done: both,
    visible: opened,
    question: '26',
    action:
      'Feel the same chest from the other side. A quiet stop and a brass stop guard different parts of the same rhythm.',
    help: [
      'The comb has a sleeve on one tooth.',
      'The boot face also carries directions for the quieter drawer.',
      'Set the moon above the comb. Shorten the collar and slide the tongue under the moon.',
      'Starting from the boot, bring the right face forward. Tip the top towards you twice. Set short, slide, tip the top towards you once more, and press the moon.',
    ],
  },
  {
    id: 'wait',
    title:
      'Play the three taps and give the little shell an answer of its own.',
    done: plumFlag('waited'),
    visible: opened,
    weave: listen,
    question: '34',
    action:
      'Leave space after a signal and see whether a second performer keeps the same timing.',
    help: [
      'One of the musicians is under the boards.',
      'The knocks reach the shell through its foot on the floor.',
      'Open either drawer. At the four-beat drum try the board and the suspended rim.',
      'At the drum knock the board three times and leave a rest. Go to Tallowheel and wait for her child.',
    ],
  },
  {
    id: 'score',
    title: 'Play the same rest for two musicians.',
    done: plumFlag('two-meanings'),
    visible: opened,
    weave: {
      ...listen,
      aoks: ['ART', 'MAT', 'LAN'],
      subjects: ['math-aa', 'music', 'lang-lit'],
    },
    question: '09',
    action:
      'Count the gap in the score and listen to the different meanings two performers give it.',
    help: [
      'A rest can have a fixed length and leave room for a feeling.',
      'Each drawer carries one reading of the score.',
      'Match the three spokes to the three taps, then let the shell stretch its rest.',
      'At the drum, play a bar of three rim taps and a rest, then three board taps and a rest. After both drawers are open, take both readings to Fen’s score.',
    ],
  },
  {
    id: 'verse',
    title: 'Fit the orchard company’s line to Fen’s drum.',
    done: plumFlag('translated'),
    visible: opened,
    weave: listen,
    question: '10',
    action:
      'Try a literal sense and a singable three-beat version. The falling fruit exposes what each version preserves.',
    help: [
      'Fen knows a line no one can fit under the wheel.',
      'One slip preserves an open choice of fruit. A second keeps the original three pulses.',
      'After opening either drawer, try both English lines at the fruit prop.',
      'Sing the long line, try “drop, plum, drop”, then ask Pia to make the performance choice.',
    ],
  },
  {
    id: 'performance',
    title:
      'Give the company’s first performance on the road or under the pear trees.',
    done: { any: [plumFlag('road.returned'), plumFlag('roots.returned')] },
    visible: plumFlag('waited'),
    weave: listen,
    question: '35',
    action:
      'Let the people pulling the cart or sitting in the clearing work out how the performance begins.',
    help: [
      'Tallowheel can carry a theatre or care for her young.',
      'Make the arrangement at the company’s tin of biscuit corners.',
      'Follow the painted wheel door or the root trap according to the company’s plan.',
      'At the road cart, choose where the wheel goes. In the clearing, cue the start with the fruit or the sounding plank. Visit Fen when the show is over.',
    ],
  },
  {
    id: 'pia',
    title: 'Rehearse Pia’s catch among the real fruit.',
    done: { any: [plumFlag('pia.long'), plumFlag('pia.short')] },
    visible: plumFlag('translated'),
    weave: listen,
    question: '24',
    action:
      'Give the receiving actor a chance to perform her own translation and change the ending.',
    help: [
      'The fruit catcher is rehearsing in the Bridge Clearing.',
      'Fen will wrap the two versions around the handle after both have been sung.',
      'Bring the longer sense or the short rhythm to Pia. Watch what happens to the fruit.',
      'At the Bridge Clearing, sing the longer line or give Pia an apple on the short beat. She keeps her own last word.',
    ],
  },
  {
    id: 'hand',
    title: 'Find the lost notch in Fen’s worn wood.',
    done: plumFlag('hand'),
    visible: hasPerkins,
    weave: {
      ...listen,
      aoks: ['ART', 'NAT'],
      subjects: ['design-tech', 'physics', 'music'],
    },
    question: '23',
    action:
      'Change the pressure on two practice impressions. Find the hollow a broad contact conceals and pass the freer grip to the next craftsperson.',
    help: [
      'The carver tests the handle as well as the wood.',
      'The little gap sits in the fourth notch.',
      'At working pressure it can disappear on the worn mould. Try a lighter hand on that surface.',
      'Try working and light on the worn mould and heavy on the fresh one. Take your grip adjustment back to Fen and Braille.',
    ],
  },
  {
    id: 'book',
    title: 'Fit two tabs Fen can read after the mould wears.',
    done: plumFlag('book'),
    visible: hasPerkins,
    weave: {
      ...listen,
      aoks: ['TEC', 'ART', 'HIS', 'LAN'],
      subjects: ['design-tech', 'music', 'history'],
    },
    question: '28',
    action:
      'Compare the same two workshop marks on a fresh and a worn mould. Keep Fen’s trial separate from Braille’s dated design.',
    help: [
      'The Perkins first edition records dots and dashes. Fen has made two marks for a different job.',
      'Bring that specific volume from the reading works and equip it. Look for Braille at the low table.',
      'Try the two offcuts on the fresh mould. Keep their positions and change to the worn mould.',
      'At the stylus table, use working pressure on both the fresh and worn moulds. Bring the two readings to Braille. Try a lighter touch to find what else the worn wood can tell you.',
    ],
  },
];
const goals: Objective[] = jobs.map((j) => ({
  id: 'plum.' + j.id,
  title: j.title,
  done: j.done,
  visible: j.visible,
  essential: false,
  weave: j.weave ?? chestWeave,
  kq: { id: 'KQ-ROUTE-' + j.question, action: j.action },
}));
const hints: Hint[] = jobs.flatMap((j) =>
  j.help.map((text, i) => ({
    id: 'h.plum.' + j.id + '.' + (i + 1),
    objective: 'plum.' + j.id,
    depth: (i + 1) as Hint['depth'],
    text,
  })),
);

export const plumContent = {
  characters: [
    {
      id: fen,
      name: 'Fen Oriel',
      role: 'Travelling percussionist and wheelwright',
      sprite: 'villager-2',
      mode: 'fictional',
      talk: [
        {
          if: {
            all: [plumEdition('road'), { flag: 'plum.road.part', eq: 'tree' }],
          },
          node: 'plum.home-tree',
        },
        {
          if: { all: [plumEdition('road'), plumFlag('road.returned')] },
          node: 'plum.home-road',
        },
        {
          if: {
            all: [
              plumEdition('roots'),
              { flag: 'plum.roots.part', eq: 'plank' },
            ],
          },
          node: 'plum.home-board',
        },
        {
          if: { all: [plumEdition('roots'), plumFlag('roots.returned')] },
          node: 'plum.home-roots',
        },
        { node: 'plum.loft' },
      ],
    },
    {
      id: snail,
      name: 'Tallowheel',
      role: 'Orchard carrier and parent of the smallest drummer',
      sprite: 'tallowheel',
      mode: 'fictional',
      talk: [
        {
          if: { all: [plumEdition('road'), plumFlag('road.returned')] },
          node: 'plum.snail-road',
        },
        {
          if: { all: [plumEdition('roots'), plumFlag('roots.returned')] },
          node: 'plum.snail-roots',
        },
        { node: 'plum.snail' },
      ],
    },
    {
      id: pia,
      name: 'Pia Bosk',
      role: 'Orchard performer and collector of fallen fruit',
      sprite: 'villager-1',
      mode: 'fictional',
      talk: [
        { if: { flag: 'plum.pia.last', eq: 'short' }, node: 'plum.pia-home' },
        {
          if: { flag: 'plum.pia.last', eq: 'long' },
          node: 'plum.pia-long-home',
        },
        { node: 'plum.pia' },
      ],
    },
    {
      id: louis,
      name: 'Louis Braille',
      role: 'Author and musician who developed a raised system for reading and writing',
      sprite: 'scholar-sefa',
      mode: 'historical',
      talk: [{ node: 'plum.braille' }],
    },
  ],
  missions: [
    {
      id: 'KG-ORCHARD-CHEST',
      world: 'WORLD-10',
      title: 'The Last Plum in the Orchestra',
      available: { flag: 'visited.map.' + PLUM_LOFT, eq: true },
      knowledgeQuestion:
        'How can two performers share a score and still have a different part in making its meaning?',
      stake:
        'A company needs a stage and its old carrier has a family to feed.',
      objectives: goals,
    },
  ],
  dialogue: nodes,
  hints,
} satisfies Partial<ContentPack>;
