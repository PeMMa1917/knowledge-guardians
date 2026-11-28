import { supperWeave } from '../domain/supperShadow';
import { islandProofReceipt } from '../domain/islandProofRack';
import type {
  Condition,
  ContentPack,
  DialogueNode,
  DialogueOption,
  Hint,
  Objective,
  Weave,
} from '../domain/types';

const seen = (name: string): Condition => ({
  flag: 'supper.' + name,
  eq: true,
});
const marked = (name: string) => ({ setFlag: 'supper.' + name, value: true });
const earned = (id: string): Condition => ({ objective: 'supper.' + id });
const inPocket = (item: string): Condition => ({ item });
export const supperOutcome = (
  route: 'hall' | 'kitchen' | 'booth',
): Condition => ({ flag: 'supper.edition', eq: route });
const lines: DialogueNode[] = [];
function scene(
  id: string,
  speaker: string,
  text: string,
  options?: DialogueOption[],
) {
  lines.push({
    id: 'supper.' + id,
    speaker,
    text,
    historicalLabel:
      speaker === 'ibn-al-haytham' ? 'reconstruction' : 'fictional-world',
    options,
  });
}
const pick = (
  text: string,
  next: string,
  condition?: Condition,
): DialogueOption => ({ text, next: 'supper.' + next, if: condition });
const handle = (
  text: string,
  next: string,
  mark: string,
  condition?: Condition,
): DialogueOption => ({
  ...pick(text, next, condition),
  effects: [marked(mark)],
});
const otla = 'otla-rusk';
const kip = 'kip-arden';
const min = 'copies-lendingkeeper';

scene(
  'welcome',
  otla,
  '“Who ate my shadow’s supper?” Otla sings the start of a skipping rhyme, then stops. “It used to be funny. My brother took a covered bowl through that hatch on Thursday. Someone drew two shadows on the cloth. Now they call him the twice-fed man. He won’t come in.” She unhooks two wooden spoons. Their varnish has worn away where children held them.',
  [
    pick('Ask what Otla actually saw.', 'otla'),
    pick('Turn over the rhyme on the curtain.', 'rhyme'),
    { text: 'Take the spoons to the lamp stand.' },
  ],
);
scene(
  'otla',
  otla,
  '“I was in the kitchen. I saw one bowl going through the hatch. After that I saw the bottom of the soup pot. A boy laughed. I joined in. My brother heard me through the wall.” She tugs at a loose thread. “I could apologise in his own doorway. Someone else would still have to untie the cord in here.”',
);
scene(
  'rhyme',
  kip,
  '“One for the walker, one for his shade.” Kip looks at the floor. “I taught that to the little ones. They kept the tune and put his name in it. I can take back my line. I can’t make twenty children forget a tune.”',
);
scene(
  'book',
  kip,
  'Kip wants a statement in the Guardian Journal. “I counted two. That much I know.” He taps the drawing with his thumb. Otla taps the hatch. The ink over the word ‘people’ is still wet.',
  [
    handle(
      'Open my journal at the hatch. Ask where Kip stood.',
      'book-hatch',
      'book.hatch',
      inPocket('item.journal'),
    ),
    handle(
      'Set the drawing beside my field note. Ask who added the noun.',
      'book-ink',
      'book.ink',
      inPocket('item.journal'),
    ),
    { text: 'Come back to the page later.' },
  ],
);
scene(
  'book-hatch',
  kip,
  '“Here, outside. A curtain between us. I saw two spoon-shaped edges move. I never saw a hand. Will you put that down with my name? I want her to know which part was mine.”',
);
scene(
  'book-ink',
  otla,
  '“I added ‘people’ after supper. Kip only wrote ‘two’. I read it back so often I remembered it in his voice.” She signs the margin herself. Kip pulls his stool a little closer. “I can check who wrote that word,” he says. “I still think whoever waited out on the step ought to get first serving. That’s how I want supper run.”',
);
scene(
  'pen',
  otla,
  'Two pencilled edges cross at the fold in the cloth. Otla lends you a piece of thin paper. A name runs over its bottom edge. “People keep tracing that as well.”',
  [
    handle(
      'Use the Field Annotation Pen to follow just the two outlines.',
      'pen-edge',
      'pen.edge',
      inPocket('tool.annotation-pen'),
    ),
    handle(
      'Lift the tracing. Put a separate dot where the name starts.',
      'pen-name',
      'pen.name',
      inPocket('tool.annotation-pen'),
    ),
    { text: 'Leave the original cloth on its hooks.' },
  ],
);
scene(
  'pen-edge',
  'narrator',
  'Both edges fit on the new sheet. There is room around them where the cloth shows different shades. Your pen cannot carry those shades over as two lines. The old sheet can still be read under the tracing.',
);
scene(
  'pen-name',
  otla,
  'The name crosses a crease absent from the older tracing. “I ironed this cloth after the fair,” Otla says. “That bit of ink came later.” She takes the pen from the working copy and puts her initials beside the addition.',
);
scene(
  'seal',
  'warden-ise',
  'Ise sets out two pats of warm wax. Otla’s supper note has a chipped circle beside her brother’s name. Light catches the chip in the ring from the back of Corvan’s sign.',
  [
    handle(
      'Ask Ise to return the ring she pocketed at the Archive.',
      'seal-pocket',
      'seal.returned',
      {
        all: [
          inPocket('item.gold-seal'),
          { flag: 'ise.saw.seal', eq: true },
          { not: seen('seal.returned') },
        ],
      },
    ),
    handle(
      'Press the ring with the chip toward the wick.',
      'seal-straight',
      'seal.straight',
      inPocket('item.gold-seal'),
    ),
    handle(
      'Turn the ring a quarter turn and press the second pat.',
      'seal-turn',
      'seal.turn',
      inPocket('item.gold-seal'),
    ),
    { text: 'Put the gold seal back in my pocket.' },
  ],
);
scene(
  'seal-pocket',
  'warden-ise',
  '“I thought you would ask what I knew. I knew nothing and hoped I could find out before you asked again.” Ise puts the ring back in your hand. “There. Now I can say it with the thing in plain sight.”',
);
scene(
  'seal-straight',
  'warden-ise',
  'The fresh wax has a tiny tongue beside the wick, where the ring has a nick. It matches the shape on the note. “I can make the same mark as the one by his name.” Ise opens her palm. “You just watched me do it.”',
);
scene(
  'seal-turn',
  otla,
  'The tongue turns with the ring. Otla puts both wax pats in a jar. “He might have stamped the first one. So might whoever lent him the ring. I promised to give him back his name. That part hasn’t come out of the wax.”',
);
scene(
  'map',
  kip,
  'The singers say Otla’s brother took a second bowl on his way back from Corvan’s stall. Kip has marked the order of that old relief delivery on the back of your Emberford town map. One stop is missing from his sketch.',
  [
    handle(
      'Lay the market corner against the forge on the delivery sketch.',
      'map-market',
      'map.market',
      inPocket('item.town-map'),
    ),
    handle(
      'Follow the folded edge on foot from Kip’s marked stall to the window.',
      'map-window',
      'map.window',
      inPocket('item.town-map'),
    ),
    { text: 'Fold the map along the old crease.' },
  ],
);
scene(
  'map-market',
  kip,
  'The two routes share the corner with the awning. One goes straight to the baker. The longer route takes in the forge first. The same corner can appear twice in a traveller’s telling of one errand. Kip has left the space for a stop open.',
);
scene(
  'map-window',
  min,
  'On the floor route you can see the bell from the stall. At the turn the screen hides the window. Mina shifts the cork marker to the last place you could actually see. “Keep the rest as someone’s journey. We have no view of the hand at the hatch from here.”',
);
scene(
  'deputy',
  otla,
  'You set the Sill Bridge claim slip beside an untouched bowl. The bridge kept the handoff and the time in different boxes. Otla’s brother draws a dot only in the space that lets her take his bowl to the back step tonight. “Tomorrow I might come in,” he says.',
  [
    handle(
      'Clip his mark to tonight’s carrier tag. Leave tomorrow open.',
      'deputy-done',
      'deputy',
      inPocket('item.sill.claim-slip'),
    ),
    { text: 'Leave him the pen.' },
  ],
);
scene(
  'deputy-done',
  otla,
  '“He asked me to knock twice and go. First time I’ve heard him ask for anything since Thursday.” Otla ties a length of red yarn to the bowl handle. A public demonstration can go ahead while supper goes by the back lane.',
);
scene(
  'pair',
  min,
  'Mina pulls the Island cart receipt from your sack. The two fossil views travelled under one accession. Two paper bags hang here, one with the inside of a ladle bowl and one with its underside. A chipped star beside the rivet appears in both. Otla wants to enter the number of ladles returned.',
  [
    handle(
      'Nest the two bags under one rivet number. Keep both faces visible.',
      'pair-done',
      'pair',
      inPocket(islandProofReceipt('paired-views')),
    ),
    { text: 'Let Mina hold them separately for now.' },
  ],
);
scene(
  'pair-done',
  min,
  'With the bags nested, one hook is free for the missing lid. “That chip is evidence for one ladle with two faces. It wouldn’t help us count mouths.” Mina hangs a second empty bowl so the carrier can eat too.',
);
scene(
  'scale',
  otla,
  'The Island sleeve receipt has an unfilled name cell and a checked width. Otla wants fresh paper sleeves for her spoons. On a small drawing four divisions are marked, each two centimetres. On a large drawing two divisions are marked, each four centimetres. The picture sizes disagree the moment you put one on the other.',
  [
    handle(
      'Fold the four little marks onto the eight-centimetre sleeve.',
      'scale-small',
      'scale.small',
      inPocket(islandProofReceipt('scale-bar')),
    ),
    handle(
      'Fold the two large marks onto the same sleeve.',
      'scale-large',
      'scale.large',
      inPocket(islandProofReceipt('scale-bar')),
    ),
    { text: 'Put the drawings back under the clip.' },
  ],
);
scene(
  'scale-small',
  otla,
  'Four folds of two fit the sleeve. The spoon’s maker line has a loose flap. Otla ties it back. “We can cut the paper this afternoon. Leave the name for someone who saw a spoon being made.”',
);
scene(
  'scale-large',
  min,
  'Two folds of four reach the same seam. The larger image had made the bowl look wider. In the actual sleeve the lip clears both working marks. Mina makes the new one short enough to leave the chip showing.',
);
scene(
  'curtain',
  otla,
  'There is a queue outside the supper hatch. Her brother is sitting on the back step. Otla puts her hand on the bell cord. “I can show the whole queue how the two outlines happen. He’d hear that rhyme again. Or we can shut the curtain and offer him the first look. The queue would go home with the old drawing.”',
  [
    {
      text: 'Untie the bell. Let the people who repeated the rhyme work the lamps.',
      if: earned('trace'),
      effects: [{ setFlag: 'supper.edition', value: 'hall' }],
      next: 'supper.outside',
    },
    {
      text: 'Draw the kitchen curtain. Let him decide who comes to the first rehearsal.',
      if: earned('trace'),
      effects: [{ setFlag: 'supper.edition', value: 'kitchen' }],
      next: 'supper.inside',
    },
    {
      text: 'Rig both shutters for one visitor at a time. Keep the family name inside the seam.',
      if: earned('light'),
      effects: [{ setFlag: 'supper.edition', value: 'booth' }],
      next: 'supper.booth',
    },
    handle(
      'Test the rhyme’s claim that two outlines always need two spoons.',
      'rhyme-rule',
      'counterexample',
      earned('trace'),
    ),
    handle(
      'Look for Thursday’s rail position on the old cloth.',
      'moved',
      'thursday',
      earned('moved'),
    ),
    { text: 'Leave the bell where it is. The lamps still work.' },
  ],
);
scene(
  'rhyme-rule',
  kip,
  'Kip props up the single spoon in front of both side lamps. “One good try wipes out my ‘always’. I could show you two spoons at the middle lamp a hundred times and it wouldn’t bring that word back.” He scratches ‘always’ off his verse.',
);
scene(
  'moved',
  otla,
  '“Now those two chalk pictures come apart. We could tell your two setups apart today.” Otla draws her finger along the curtain rail. “Nobody chalked the rail position on Thursday. I don’t get to use today’s answer to put a second person in my kitchen.” She slides the spoon bar back into your hand.',
);
scene(
  'outside',
  kip,
  'The cord brushes Kip’s nose. He sneezes straight through the first line of the rhyme. Several children lose the tune. “Good,” he says, surprised. “Now I can start it a different way.” The bell stair leads to their rehearsal at the landing.',
);
scene(
  'inside',
  otla,
  'Otla shuts the hatch. A moment later something taps twice on the other side. She raises one corner of the cloth. A hand pushes an empty spoon under it. The back stair leads to the printing kitchen.',
);
scene(
  'booth',
  min,
  'Mina puts a spoon in the slot on the unlit landing and passes the shutter cord through its handle. A visitor on the far side can reproduce the two outlines alone. The bowls are getting cold while she fits it. No one has to stand there and tell Thursday’s story.',
);
scene(
  'booth-reader',
  min,
  'A kitchen porter tries to turn both shutters at once. The chalk outline holds steady. The bright edges go grey. “Two pictures that look the same in chalk can be different as soon as the light comes up.” She asks who made the cloth. The family name is inside a seam. She leaves it there.',
  [
    handle(
      'Leave both shutter pulls within reach for the next visitor.',
      'booth-return',
      'read.booth',
      supperOutcome('booth'),
    ),
  ],
);
scene(
  'booth-return',
  min,
  'The porter comes back with a stool from the yard. Now someone shorter can try the shutters. Otla takes a bowl out to her. They eat together on the landing without opening the seam.',
);
scene(
  'hall-reader',
  kip,
  'The smallest child is holding both spoons. “If I’m the one singing, can he sing back?” Nobody asks her to name him. Kip holds out the second lamp. You can hear Otla’s brother whistling in the lane.',
  [
    handle(
      'Hold the cloth while the child tries both endings of the tune.',
      'hall-return',
      'read.hall',
      supperOutcome('hall'),
    ),
  ],
);
scene(
  'hall-return',
  kip,
  'She makes both outlines with one spoon and beats time with the other. The queue leaves with a demonstration they can try at home. Otla’s brother finishes his soup out of sight. Kip stays to untangle the bell cord.',
);
scene(
  'kitchen-reader',
  otla,
  'Her brother has drawn a second place at the table. “For the boy who heard me laugh,” she says. “He can come in himself. He doesn’t have to bring the whole queue.” A printer is waiting outside with clean type.',
  [
    handle(
      'Keep the type in its case and let them set the table.',
      'kitchen-return',
      'read.kitchen',
      supperOutcome('kitchen'),
    ),
  ],
);
scene(
  'kitchen-return',
  otla,
  'The printer waits through one slow bowl of soup. The boy asks if he can take the shadows to school in the morning. Her brother puts the wooden spoon in his hand. What he may tell about the meal is still theirs to decide.',
);
scene(
  'market-later',
  'merchant-corvan',
  'At the striped stall, Corvan hangs a pair of spoons with their bowls turned away from the street. “Someone sold me a rhyme. I had it painted on my shutter. Can I do anything besides scrape it off?”',
  [
    pick(
      'Teach him the two-lamp counterexample the children saw.',
      'market-show',
      seen('read.hall'),
    ),
    pick(
      'Carry his invitation back folded, with room for an answer.',
      'market-letter',
      seen('read.kitchen'),
    ),
    pick(
      'Let him try the change in brightness at his own shutter.',
      'market-booth',
      seen('read.booth'),
    ),
    pick(
      'Show him both wax impressions from the same ring.',
      'market-ring',
      earned('impression'),
    ),
    { text: 'Leave the shutter down for now.' },
  ],
);
scene(
  'market-show',
  'merchant-corvan',
  'Corvan pulls the shutter down just far enough to make a stage. Two shadows travel up the painted rhyme. A passer-by stops to move a lamp. “I was going to put CORRECTION on it in gold,” he says. “This is cheaper. They’re staying longer, too.”',
);
scene(
  'market-letter',
  'merchant-corvan',
  'He starts a very handsome invitation. Halfway down he stops, tears off the shop crest, and writes the hour he is actually here. “Somebody has to be behind the counter when an answer comes.” He leaves the envelope unsealed.',
);
scene(
  'market-booth',
  'merchant-corvan',
  'Corvan threads the shutter cord through a battered spoon. A child takes his place on the stool and he lets her hold it on her own. “That’s the first thing on this stall that I don’t have to sell somebody.”',
);
scene(
  'market-ring',
  'merchant-corvan',
  'Corvan sets the two prints beside his old sign. “I thought that little bite would tell me who did it.” He traces it with his nail. “All it tells me now is where to start asking.” He leaves the prints out for the next shift.',
);

scene(
  'tea',
  kip,
  'The bench by the side door is just big enough for two. Steam comes through the lid of your Ember tea. Kip is still twisting the bell cord round his finger. Outside, the porter has settled on an empty crate for her wait.',
  [
    {
      text: 'Open my one cup of Ember tea here and share it with Kip.',
      if: { all: [inPocket('item.tea'), { not: { flagSet: 'supper.tea' } }] },
      effects: [
        { takeItem: 'item.tea' },
        { setFlag: 'supper.tea', value: 'kip' },
      ],
      next: 'supper.tea-kip',
    },
    {
      text: 'Give the waiting porter my one cup of Ember tea.',
      if: { all: [inPocket('item.tea'), { not: { flagSet: 'supper.tea' } }] },
      effects: [
        { takeItem: 'item.tea' },
        { setFlag: 'supper.tea', value: 'porter' },
      ],
      next: 'supper.tea-porter',
    },
    pick('Sit beside Kip again.', 'tea-kip', { flag: 'supper.tea', eq: 'kip' }),
    pick('Look out at the porter’s crate.', 'tea-porter', {
      flag: 'supper.tea',
      eq: 'porter',
    }),
    { text: 'Keep the tea for the road.' },
  ],
);
scene(
  'tea-kip',
  kip,
  'Kip unwinds the cord before he takes the cup. “I was going to get him to laugh at the rhyme. That would have made it all right for me. Hadn’t thought what it would make all right for him.” He hands back the lid.',
);
scene(
  'tea-porter',
  min,
  'The porter folds both hands around the cup. She pulls the crate over so Otla’s brother has room to sit beside her. From inside, Mina sees two shadows sharing a single drink. She keeps the moment to herself.',
);
scene(
  'after-hall',
  otla,
  'Otla is washing two bowls in the same water. “He ate on the step, in the end. I wanted him in here where I could see him. I’m glad he had the choice.” The ladle clinks against the basin. “That new rhyme is terrible. He knows three verses already.”',
);
scene(
  'after-kitchen',
  otla,
  'Otla has forgotten to take the extra place away. “I kept expecting him to say something about that laugh. He asked if I still put mustard in the soup. It took me all evening to realise that was his answer.”',
);
scene(
  'after-booth',
  otla,
  'Otla tries the shutter herself when the visitors have gone. “I thought I was giving people somewhere to do it alone. That porter’s stool means she was thinking about who came next.” She wipes the seat before hanging up her apron.',
);
scene(
  'waiting',
  otla,
  'Otla keeps one finger on the cord. “I held a spoon and the cloth held two. Neither of us need lie to give two different answers. When you pull that cord, help people see which question they were answering.”',
);
scene(
  'optics',
  'ibn-al-haytham',
  'On the observatory roof you held the view still and changed its frame. Here it is the lamp you can move. Pin one spoon in place. Open only the left lamp and mark the shadow. Then open only the right. Before you open both, leave a peg where each separate trial tells you an edge will fall.',
  [
    handle(
      'Mark where the left shutter sent the shadow.',
      'optics-left',
      'prediction.left',
      seen('1.left.lit'),
    ),
    handle(
      'Mark where the right shutter sent the shadow.',
      'optics-right',
      'prediction.right',
      seen('1.right.lit'),
    ),
    handle(
      'Overlay both pegs on the lit curtain and look between them.',
      'optics-both',
      'prediction.checked',
      {
        all: [
          seen('prediction.left'),
          seen('prediction.right'),
          seen('1.sides.lit'),
        ],
      },
    ),
    { text: 'Go to the lamps and try it.' },
  ],
);
scene(
  'optics-left',
  'narrator',
  'The left lamp alone puts the outline four spaces right of centre. You leave a peg in that hole on the rail.',
);
scene(
  'optics-right',
  'narrator',
  'The right lamp alone puts the outline four spaces left of centre. A loose brass pin fits the second hole.',
);
scene(
  'optics-both',
  kip,
  'Both edges meet the pegs. Kip puts his palm flat against the unmarked space between them. “The two single trials gave me a reason to expect two. I’d have guessed the shades were just as black. I was half right.”',
);

const all = (...names: string[]): Condition => ({ all: names.map(seen) });
const learn: Weave = {
  ...supperWeave,
  concepts: [
    'perspective',
    'power',
    'responsibility',
    'values',
    'justification',
    'evidence',
  ],
  framework: ['perspectives', 'ethics', 'scope'],
  aoks: ['HIS', 'HUM', 'ART', 'LAN'],
  subjects: ['lang-lit', 'psychology', 'theatre', 'history'],
  thinking: { dok: 3, bloom: 'evaluate', fink: 'human', solo: 'relational' },
};
const jobs: [string, string, Condition, Weave, string[]][] = [
  [
    'trace',
    'Find two ways to cast the two chalk outlines on Otla’s cloth.',
    all('1.sides.chalk', '2.centre.chalk'),
    supperWeave,
    [
      'Look behind the supper hatch at the landing.',
      'The two marked places are equally far from the middle.',
      'Try moving the light as well as changing the bar. Compare the chalk outlines.',
      'Trace one spoon with the two side lamps. Then trace the pair with just the middle lamp.',
    ],
  ],
  [
    'light',
    'Read the brightness that the tracing lost.',
    { all: [earned('trace'), all('1.sides.lit', '2.centre.lit')] },
    supperWeave,
    [
      'Chalk outlines preserve the edge.',
      'Look through the cloth while the light is on.',
      'Repeat the two setups that fitted the chalk. Turn the tracing off.',
      'Show the lamplight for one spoon with two side lamps and for two spoons with the middle lamp.',
    ],
  ],
  [
    'moved',
    'Slide the bar and find where the two matching chalk readings part ways.',
    {
      all: [earned('trace'), all('1.sides.chalk.near', '2.centre.chalk.near')],
    },
    supperWeave,
    [
      'Try another stop on the spoon rail.',
      'The chalk on the original curtain has no record of how far the spoons were from it.',
      'Open the back of the curtain and move the bar. Compare the same two setups on that stop.',
      'At the near stop, trace one spoon with both side lamps and two spoons with the middle lamp. Show Otla where they parted.',
    ],
  ],
  [
    'counter',
    'Try the word “always” against the same two chalk marks.',
    seen('counterexample'),
    supperWeave,
    [
      'Kip’s rhyme makes a claim about every pair of marks.',
      'Go to the curtain cord once both arrangements work.',
      'The second arrangement can produce the same edges with one less spoon.',
      'Ask to test the word “always”. Kip holds up the two outlines from the one-spoon run.',
    ],
  ],
  [
    'thursday',
    'Check whether the new lamp test tells Otla who was in the kitchen on Thursday.',
    seen('thursday'),
    { ...learn, aoks: ['NAT', 'HIS'], subjects: ['physics', 'history'] },
    [
      'Look at what the family actually kept.',
      'The experiment predicts where the shadows go at each stop.',
      'Is the old position recorded on the curtain?',
      'After both near-stop casts, ask Otla about Thursday’s rail position at the bell cord.',
    ],
  ],
  [
    'prediction',
    'Follow two separate light paths with the observatory visitor.',
    seen('prediction.checked'),
    supperWeave,
    [
      'Use the visitor’s peg rail beside the shutter.',
      'Keep just one spoon hanging. Test each lamp by itself.',
      'Mark each single-lamp position on the rail. Look at the two together.',
      'Show each side lamp separately on the lit curtain. Mark both pegs, then use both side lamps and overlay the pegs.',
    ],
  ],
  [
    'witness',
    'Separate what Kip saw from what Otla supplied.',
    all('book.hatch', 'book.ink'),
    learn,
    [
      'Try the Guardian Journal at the kitchen stool.',
      'Kip and Otla wrote at different times.',
      'Ask where the witness stood and who wrote the noun.',
      'Use both pages at Kip’s stool. Keep the position and the later ink apart.',
    ],
  ],
  [
    'pen',
    'Trace the edges and date the name by its crease.',
    all('pen.edge', 'pen.name'),
    learn,
    [
      'Look by the hem of the curtain.',
      'The edges and the ink cross different folds.',
      'Take out the pen and lift its sheet.',
      'Trace the edges with the Field Annotation Pen and then mark where the name starts.',
    ],
  ],
  [
    'impression',
    'Press Corvan’s ring in two positions to check what its mark can identify.',
    all('seal.straight', 'seal.turn'),
    learn,
    [
      'Ise has warm wax in the supper room.',
      'A chip in a metal edge leaves its inverse in soft wax.',
      'Try another orientation with the same ring.',
      'At the wax pats, press with the chip toward the wick. Turn it a quarter turn for the second pat.',
    ],
  ],
  [
    'walk',
    'Find where Kip’s marked route disappears from view.',
    all('map.market', 'map.window'),
    learn,
    [
      'Find the delivery sketch at the end of the floor map.',
      'The copied route has one turn behind the awning.',
      'Lay out the market corner. Walk as far as its window.',
      'Use both sides of your Emberford town map at Kip’s marked floor route.',
    ],
  ],
  [
    'proxy',
    'Let a person set the limits on tonight’s supper delivery.',
    seen('deputy'),
    learn,
    [
      'A marked bowl is waiting by the back step.',
      'At Sill Bridge a time and an authorised person went on separate lines.',
      'The brother’s mark only applies to this evening.',
      'Use the Sill claim slip at the covered bowl and clip his mark to tonight’s carrier tag.',
    ],
  ],
  [
    'faces',
    'Release a hook by checking two views of a single ladle.',
    seen('pair'),
    supperWeave,
    [
      'Mina is at the rack of ladle bags.',
      'The two bags show different faces, each beside the same chipped rivet.',
      'Try the receipt from the Island’s paired-views cart job.',
      'Nest the bags under one rivet number with both faces available.',
    ],
  ],
  [
    'width',
    'Fit a sleeve from two differently scaled drawings.',
    all('scale.small', 'scale.large'),
    supperWeave,
    [
      'Otla has two drawings by the paper sleeves.',
      'Each picture has its own reference bar.',
      'Fold the large and small divisions separately against the same sleeve.',
      'Bring the Island scale-bar receipt. Try four two-centimetre divisions, then two four-centimetre divisions.',
    ],
  ],
  [
    'supper',
    'Hear what happens to someone at the other side of the curtain.',
    { any: [seen('read.hall'), seen('read.kitchen'), seen('read.booth')] },
    learn,
    [
      'Use the curtain cord after the chalk comparison.',
      'Both the public bell and the kitchen curtain have a visitor.',
      'Go through the route your choice opened.',
      'Meet the child at the bell stair, Otla in the printing kitchen, or the porter at the single-visitor booth.',
    ],
  ],
];
const visibleWhen: Record<string, Condition> = {
  witness: inPocket('item.journal'),
  pen: inPocket('tool.annotation-pen'),
  impression: inPocket('item.gold-seal'),
  walk: inPocket('item.town-map'),
  proxy: inPocket('item.sill.claim-slip'),
  light: earned('trace'),
  supper: earned('trace'),
  faces: inPocket(islandProofReceipt('paired-views')),
  width: inPocket(islandProofReceipt('scale-bar')),
  moved: earned('trace'),
  counter: earned('trace'),
  thursday: earned('moved'),
  prediction: { flag: 'thinker.haytham.test.tube', eq: true },
};
const knowledgeUses: Record<string, [string, string]> = {
  counter: [
    '003',
    'Try an exception in the theatre before using an always-rule at the hatch.',
  ],
  thursday: [
    '005',
    'Bring the new experimental result back to an incomplete record of an earlier event.',
  ],
  moved: [
    '005',
    'Change the position of the bar to separate competing explanations, then locate the limit on applying this new test to Thursday.',
  ],
  trace: ['003', 'Make the same two edges with different spoons and lamps.'],
  light: [
    '005',
    'Try both lit arrangements to locate the missing information in the tracing.',
  ],
  witness: [
    '002',
    'Separate the author of the word “people” from the person who counted shapes.',
  ],
  pen: [
    '002',
    'Lift the tracing to see which addition belongs to a different moment.',
  ],
  impression: [
    '005',
    'Repeat a chipped mark to find what the impression can identify.',
  ],
  walk: [
    '005',
    'Check which part of the delivery a witness could see from the stall.',
  ],
  proxy: ['006', 'Ask the person receiving help to set the terms for tonight.'],
  faces: [
    '003',
    'Nest the two views at their matching rivet to assess the unit being counted.',
  ],
  width: ['003', 'Measure against two scales before cutting a sleeve.'],
  prediction: [
    '003',
    'Combine predictions from independent lamp trials and compare them with both lamps together.',
  ],
  supper: [
    '004',
    'Carry a response to the people who have to live with it, then hear their reply.',
  ],
};
const applied = new Set(['pen', 'walk', 'proxy', 'faces', 'width']);
const goals: Objective[] = jobs.map(([id, title, done, weave]) => ({
  id: 'supper.' + id,
  title,
  done,
  weave: applied.has(id)
    ? {
        ...weave,
        thinking: {
          dok: 2,
          bloom: 'apply',
          fink: 'application',
          solo: 'relational',
        },
      }
    : weave,
  visible: visibleWhen[id],
  essential: false,
  kq: { id: 'KQ-NEW-' + knowledgeUses[id][0], action: knowledgeUses[id][1] },
}));
const hints: Hint[] = jobs.flatMap(([id, , , , clues]) =>
  clues.map((text, i) => ({
    id: 'h.supper.' + id + '.' + (i + 1),
    objective: 'supper.' + id,
    depth: (i + 1) as Hint['depth'],
    text,
  })),
);
export const supperContent = {
  characters: [
    {
      id: otla,
      name: 'Otla Rusk',
      role: 'Supper cook and keeper of the shadow curtain',
      sprite: 'villager-2',
      mode: 'fictional',
      talk: [
        ...(['hall', 'kitchen', 'booth'] as const).map((route) => ({
          if: { all: [supperOutcome(route), seen('read.' + route)] },
          node: 'supper.after-' + route,
        })),
        { if: earned('trace'), node: 'supper.waiting' },
        { node: 'supper.welcome' },
      ],
    },
  ],
  dialogue: lines,
  missions: [
    {
      id: 'KG-COPIES-SUPPER',
      world: 'WORLD-08',
      title: 'Supper for a Shadow',
      available: { flag: 'visited.map.copies.supper-room', eq: true },
      knowledgeQuestion:
        'What can an old tracing settle when different events leave the same outline?',
      stake:
        'Otla’s brother has stopped eating with the people who sing his name.',
      objectives: goals,
    },
  ],
  hints,
} satisfies Partial<ContentPack>;
