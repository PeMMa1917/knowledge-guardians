import {
  flowerWeave,
  flowerFlag as F,
  petalPaper,
  petalSight,
  type Flower,
} from '../domain/petalWindow';
import type {
  Condition,
  ContentPack,
  DialogueNode,
  Effect,
  Hint,
  Objective,
  SourceRecord,
  Weave,
} from '../domain/types';

export const petalExtras = [
  {
    id: 'gauge',
    item: 'item.rain-gauge',
    name: 'the drain catching the glass roof',
    art: 'petal.glass',
    requires: 'craft.rain-gauge.calibrated',
  },
  {
    id: 'line',
    item: 'item.plumb-line',
    name: 'the flower crop hanging on a slant',
    art: 'petal.crop',
    requires: 'craft.plumb-line.calibrated',
  },
  {
    id: 'pen',
    item: 'item.reed-pen',
    name: 'the poster with room for one more mark',
    art: 'preserved.slip',
    requires: 'craft.reed-pen.calibrated',
  },
  {
    id: 'swatch',
    item: 'item.pigment-sample.swatch',
    name: 'the upright easel with Nell’s intact wrapper clip',
    art: 'petal.crop',
  },
  {
    id: 'pin',
    item: 'item.nexus.shutter-pin',
    name: 'the little hinge behind the ink roller',
    art: 'petal.glass',
  },
  {
    id: 'words',
    item: 'item.forest.account-copy.words',
    name: 'the listening pocket inside Viri’s coat',
    art: 'preserved.slip',
  },
  {
    id: 'lines',
    item: 'item.forest.account-copy.lines',
    name: 'the separate windows on the usher’s tally',
    art: 'preserved.display-paired',
  },
  {
    id: 'whistle',
    item: 'item.notched-whistle',
    name: 'the silent timing notch beside the garden bench',
    art: 'forest.waypost',
  },
] as const;
export type PetalExtra = (typeof petalExtras)[number];
export const extraCondition = (x: PetalExtra): Condition =>
  'requires' in x
    ? { all: [{ item: x.item }, { flag: x.requires, eq: true }] }
    : { item: x.item };
const f = (name: string): Condition => ({ flag: F(name), eq: true });
const on = (name: string): Effect => ({ setFlag: F(name), value: true });
const route = (name: string): Condition => ({ flag: F('ending'), eq: name });
const node = (
  id: string,
  speaker: string,
  text: string,
  options: DialogueNode['options'] = [],
): DialogueNode => ({
  id: 'petal.' + id,
  speaker,
  text,
  options,
  historicalLabel: 'fictional-world',
});
const opt = (
  text: string,
  next: string,
  condition?: Condition,
  effects?: Effect[],
) => ({ text, next: 'petal.' + next, if: condition, effects });
const person = 'petal-dancer';
const lines: DialogueNode[] = [
  node(
    'viri',
    person,
    'A woman in a coat with twenty-seven fingers catches your sleeve. Most of the fingers are painted wire. “When I bend my thumb, that bee washes its face. Took me a winter to get that right. Now someone has put up a bill saying the live bees learned it from me.” She pulls the sticky bill off your back. “I did want you to come.”',
    [
      opt('Let her put a bee on your thumb.', 'thumb'),
      opt('Turn the bill over.', 'back'),
      opt('Follow the light moving under her cuff.', 'cuff'),
      opt('Ask how the company did on silk.', 'silk', route('silk')),
      opt('Sit on the bare stage with her.', 'garden', route('garden')),
    ],
  ),
  node(
    'thumb',
    person,
    'Viri eases a copper wing over your knuckle. “Give it a scratch behind the ear.” The wire bee calmly brushes its eyes. A little boy laughs before you do. “That was Mum’s gesture,” Viri says, catching the wing when it falls. “I make a living showing people how closely she watched.”',
  ),
  node(
    'back',
    'forest-naturalist',
    'Elian’s pencil has gone through the bill: THE BEES READ OUR ARROW. Under READ there is a little tear. “I watched three land. I never saw an arrow go in one ear and come out the other. But I did lend her the pencil.”',
  ),
  node(
    'cuff',
    person,
    'Two yellow marks lie side by side on the coat. Hem and Cuff. “My mum could tell the plants apart by the crooked stitch behind Cuff. I thought that was cheating. Now I am a grown woman arguing with daylight.” She rolls the panes out onto the bench.',
  ),
  node(
    'silk',
    person,
    '“The little boy in the front row got the trick. He wanted to know how Mum had made the legs. Nobody has asked me that in years.” Viri makes a tiny bow with one knuckle.',
  ),
  node(
    'garden',
    person,
    'Viri kneels by the seats and cups her fingers around a bit of shade. “I used to think a full minute without a gesture was a minute of my life gone. There was one child this morning who wanted me to wait longer.”',
  ),
  node(
    'elian',
    'forest-naturalist',
    'Elian is winding two tiny mornings onto a single brass axle. “Left of the window, right of the door. I wrote both down. I forgot to say I had breakfast between them. Can you put that hour back?”',
    [
      opt('Find the times etched in the two rims.', 'watch-times'),
      opt('Ask what a purple square feels like to a bee.', 'colour'),
      opt('Put a dry finger on the little square of glass.', 'glass'),
    ],
  ),
  node(
    'watch-times',
    'forest-naturalist',
    '“Eight ten. Nine ten. An hour between starts. Same ledge, ninety seconds each. A bee had its own morning all that time.” Elian hooks the later loop over a peg. “The one that landed twice on the window side may not even be the same visitor.”',
  ),
  node(
    'colour',
    'forest-naturalist',
    '“Purple is the ink I had. I can tell you which way the needle moved. If I tell you what it feels like to have a bee’s eyes, remind me who holds the ink bottle.”',
  ),
  node(
    'glass',
    'forest-naturalist',
    'The bright squares go blank when Elian winds the handle too far. Two different returns have both hit the ceiling. Elian taps the stop with a nail. “That is a real mark. It is also the end of what this setting can tell you.”',
  ),
  node(
    'plate',
    person,
    'Viri lowers the 1771 Cleveland impression to the coat. The young leaves rise between the insects like places in a dance. “What if each little body stayed in that shape just long enough for someone to draw it? What if the artist had to come back?”',
    [
      opt(
        'Hinge the artist credit to the earlier end of the ribbon.',
        'artist',
        undefined,
        [on('plate.artist')],
      ),
      opt(
        'Slide the 1771 edition mark to its own stop.',
        'edition',
        undefined,
        [on('plate.edition')],
      ),
      opt(
        'Bring the two stops together for the next performer.',
        'wait',
        { all: [f('plate.artist'), f('plate.edition')] },
        [on('plate.met')],
      ),
    ],
  ),
  node(
    'artist',
    person,
    '“Maria Sibylla Merian. A person who looked and drew. The museum credits her with this composition.” Viri hangs a piece of fine wire under the name. “I can carry an old gesture in a new hand too.”',
  ),
  node(
    'edition',
    'forest-naturalist',
    'Elian knots the date well beyond the artist’s lifetime. “A hand-coloured engraving, Cleveland accession 1955.320. The museum dates this impression to 1771. It gives us no morning on which all these bodies sat for it together.”',
  ),
  node(
    'wait',
    person,
    'A brush taps the far side of the glass. Someone has been waiting for you to give the drawing and the edition their own dates. Viri opens the door to the narrow bench.',
  ),
  node(
    'artist-room',
    'petal-merian',
    'Merian sets a blank corner of paper on the bench. “Leave me room to come back. If you make every change share one instant, there is nowhere on the page for waiting.” She meets Viri’s copper bee at eye level. “What will change between this drawing and your next?”',
    [
      opt(
        'Uncoil the silk legs over three successive moments.',
        'gestures',
        undefined,
        [on('plate.gestures')],
      ),
      opt(
        'Frame all three moments on one reversible sheet.',
        'page',
        undefined,
        [on('plate.page')],
      ),
    ],
  ),
  node(
    'second-bench',
    'petal-merian',
    'Merian has left a space in the programme where everyone else has written “next”. “A page need not tell a reader where to begin. A living dancer has to begin somewhere.” She holds the Cleveland impression so two insect forms are visible together. “Which kind of beginning would you lend these people?”',
    [
      opt(
        'Let the audience open the whole sheet before the dancers enter.',
        'sheet-first',
        undefined,
        [on('plate.return.sheet')],
      ),
      opt(
        'Bring the dancer out first and give the sheet to the back row.',
        'hand-first',
        undefined,
        [on('plate.return.hand')],
      ),
    ],
  ),
  node(
    'sheet-first',
    person,
    'A child starts with the little form farthest from the stem. “I always thought they would look where I pointed,” Viri whispers. The wire bees wait for the page to close before they move.',
  ),
  node(
    'hand-first',
    'petal-merian',
    'In the back row two people find the next position before it appears on stage. They lean forward to see the dancer choose a different one. Merian folds the edge of the programme there.',
  ),
  node(
    'gestures',
    person,
    '“Mum used to make me hold the first position until my feet itched. I thought that was the boring part.” Viri pauses halfway through lifting the wire leg. The pause has a shape of its own.',
  ),
  node(
    'page',
    'petal-merian',
    'She folds the sheet to hide two positions. The third looks like a portrait. She unfolds it. The same little leg has become a passage of time. Viri asks to take that fold onto the stage.',
  ),
];
// Each tool opens a different small job. Its second visitor remembers how the Guardian used it.
const tasks: Record<
  Exclude<PetalExtra['id'], 'pin'>,
  [string, string, string, string, string, string]
> = {
  gauge: [
    'Viri has put one cup under the glass roof and one out by the wall. After the same shower they stand at nine and three. She wants to promise the children nine cups everywhere.',
    'Set your checked gauge beside the sheltered cup.',
    'Your gauge catches nine under the drain. The open cup still holds three. Viri draws the roof over the nine on her poster.',
    'Set it in the open beside the other cup.',
    'Both cups in the open catch three. The nine still belongs to the roof catchment. Elian marks the open wall as the comparison place.',
    'Does the roof gather water for just one cup?',
  ],
  line: [
    'Hem’s frame leans over Cuff. In the projected crop a dark strip of wood looks like a fifth low square. Viri wants that extra square on her sleeve.',
    'Drop the plumb line at the window edge.',
    'The thread crosses the slanted frame. Viri lifts the wood clear of the crop. The extra square goes with it.',
    'Hang the thread at the stage end.',
    'A strip of the frame still falls inside the crop. The understudy leaves a border mask on that side and compares the same inner square in each print.',
    'Where did the edge of the sample move?',
  ],
  pen: [
    'The bill says BEES READ OUR ARROW. Your checked reed makes a thin stroke without covering a letter. Viri holds the bill as if it were still wet.',
    'Hinge a question mark after READ.',
    'The ink stays on the hinge. Viri can lift it to show the original claim and fold it down when the audience asks what the landing showed.',
    'Draw a bracket from LANDINGS to the two watch times.',
    'The sightings keep their hours. Viri sets the stage arrows on a second line under her own name.',
    'Whose claim did the small mark change?',
  ],
  swatch: [
    'Nell’s loose R13 swatch is still whole in its signed wrapper. The easel has a slot that takes it without cutting it. A slip beside the window says it may be viewed intact.',
    'Set the whole wrapper at the edge of the window.',
    'Viri uses the signed swatch as a stage colour reference and returns it intact. Its violet appearance gives her no measurement of either flower’s UV return.',
    'Put a blank backing behind the wrapper.',
    'Viri can see where Nell’s real swatch ends and the theatre’s printing begins. She leaves a gap between them in the next poster.',
    'Which surface did the player actually see?',
  ],
  words: [
    'The lamp crew’s copy says where they heard wings. The field is thick with green and Elian has nearly entered the line as a visitor landing.',
    'Give the usher the quoted line before the bell.',
    'The usher reads the crew’s own words aloud. Viri waits with an empty hand. An audience can now hear a report of wings without seeing an invented landing.',
    'Keep the line for the silent curtain.',
    'The crew’s place and words come back after the last sighting. One listener returns to the reeds to listen there.',
    'What did the crew have access to?',
  ],
  lines: [
    'A heard-and-seen card lies across the usher’s tally. Viri can fit two spaces on the public bill if she makes the title smaller.',
    'Use the two lines for this morning’s hearing and sighting.',
    'The audience hears three taps in the dark and sees only one silk visitor. The usher leaves the unobserved landings blank.',
    'Turn the card around for the next usher.',
    'One heading faces the rail, the other the wings. The two ushers compare what each could record before the seats turn over.',
    'When did the two lines need separate witnesses?',
  ],
  whistle: [
    'Liri’s notched whistle lies by the quiet seats. A boy has already filled his lungs. Viri rests a finger against the mouthpiece and raises the carved end.',
    'Use the notch as a silent start signal.',
    'Elian begins the next ninety seconds when the marked end rises. The garden hears no added call. The waiting child gets to lower the signal.',
    'Give the silent finish signal to the back row.',
    'The last watcher puts down the notch. This time Viri stops her wire bees when the youngest watcher finishes, including the round with no landing.',
    'Who controlled the end of the watch?',
  ],
};
for (const x of petalExtras)
  if (x.id !== 'pin') {
    const [opening, one, first, two, second] = tasks[x.id];
    lines.push(
      node('tool.' + x.id, person, opening, [
        opt(one, 'tool.' + x.id + '.first', extraCondition(x), [
          { setFlag: F('tool.' + x.id), value: 'first' },
        ]),
        opt(two, 'tool.' + x.id + '.second', extraCondition(x), [
          { setFlag: F('tool.' + x.id), value: 'second' },
        ]),
      ]),
      node('tool.' + x.id + '.first', 'narrator', first),
      node('tool.' + x.id + '.second', 'narrator', second),
    );
  }
export const petalSourceRecords: SourceRecord[] = [
  {
    id: petalPaper,
    title: 'Variation in the ultraviolet patterns of silverweed petals',
    url: 'https://doi.org/10.1086/671803',
    locator: 'Abstract and results, thirteen sampled populations',
    supports:
      'The fraction of the petal area absorbing ultraviolet varied among the sampled silverweed plants. The game crops, detector units and visits are simulated.',
    accessed: '2026-11-27',
    mla: {
      kind: 'page',
      author: 'Koski, Matthew H., and Tia-Lynn Ashman',
      title:
        'Quantitative Variation, Heritability, and Trait Correlations for Ultraviolet Floral Traits in Argentina anserina (Rosaceae): Implications for Floral Evolution',
      container:
        'International Journal of Plant Sciences, vol. 174, no. 8, 2013, pp. 1109–1120',
    },
  },
  {
    id: petalSight,
    title: 'Animal colour vision and ultraviolet',
    url: 'https://askabiologist.asu.edu/colors-animals-see',
    locator: 'Animal colour range table and ultraviolet explanation',
    supports:
      'Bees can detect ultraviolet. A human-readable false-colour print uses a convention chosen by its maker.',
    accessed: '2026-11-27',
    mla: {
      kind: 'page',
      title: 'Colors Animals See',
      container: 'Ask A Biologist, Arizona State University',
    },
  },
];
const pair = (band: string): Condition => ({
  all: (['apron', 'sleeve'] as Flower[]).map((x) =>
    f('reading.' + band + '.1.' + x),
  ),
});
const entry = (
  id: string,
  title: string,
  done: Condition,
  weave: Weave,
  kq?: Objective['kq'],
): Objective => ({
  id: 'petal.' + id,
  title,
  essential: false,
  visible: { flag: 'visited.map.forest.petal-house', eq: true },
  done,
  weave,
  ...(kq && { kq }),
  onComplete: [{ journal: 'j.petal.' + id }],
});
const goals = [
  entry(
    'windows',
    'Keep Hem and Cuff in each light with the handle at one.',
    { all: [pair('day'), pair('uv')] },
    flowerWeave,
  ),
  entry(
    'ceiling',
    'Run both pale returns into the upper stop, then recover their detail.',
    { all: [f('recovered.apron'), f('recovered.sleeve')] },
    {
      ...flowerWeave,
      thinking: {
        dok: 2,
        bloom: 'apply',
        fink: 'application',
        solo: 'multistructural',
      },
    },
    { id: 'KQ-NEW-003', action: 'recover detail beyond the clipped reading' },
  ),
  entry(
    'ledge',
    'Open each ninety-second morning on the sliding ledge.',
    { all: [f('watch.left'), f('watch.right')] },
    {
      ...flowerWeave,
      subjects: ['biology', 'math-ai', 'psychology'],
      aoks: ['NAT', 'MAT', 'HUM'],
    },
  ),
  entry(
    'curtain',
    'Give the company a way to perform its own part of the story.',
    { flagSet: F('ending') },
    {
      ...flowerWeave,
      framework: ['scope', 'ethics', 'perspectives'],
      thinking: { dok: 3, bloom: 'create', fink: 'caring', solo: 'relational' },
    },
  ),
  entry(
    'encore',
    'Find the next audience and put the performance in their hands.',
    { flagSet: F('answered') },
    {
      ...flowerWeave,
      thinking: {
        dok: 3,
        bloom: 'evaluate',
        fink: 'human',
        solo: 'relational',
      },
    },
  ),
  entry(
    'ribbons',
    'Pin a reading before each late watch opens. Give the same landings a second life on stage.',
    {
      all: [
        { flagSet: F('ribbon.noon.dance') },
        { flagSet: F('ribbon.dusk.dance') },
      ],
    },
    {
      ...flowerWeave,
      framework: ['scope', 'methods-and-tools', 'perspectives'],
      thinking: {
        dok: 3,
        bloom: 'create',
        fink: 'integration',
        solo: 'extended',
      },
    },
    {
      id: 'KQ-NEW-005',
      action: 'test a prediction against two unopened field watches',
    },
  ),
  entry(
    'gears',
    'Turn each roller over and hand the working theatre to its next operator.',
    { flagSet: F('gear.sent') },
    {
      ...flowerWeave,
      aoks: ['MAT', 'ART', 'NAT'],
      subjects: ['math-ai', 'physics', 'dance', 'design-tech'],
      thinking: {
        dok: 3,
        bloom: 'analyse',
        fink: 'application',
        solo: 'relational',
      },
    },
  ),
  entry(
    'second-page',
    'Meet Merian again with the earned engraving and try the company’s second opening.',
    { any: [f('plate.return.sheet'), f('plate.return.hand')] },
    {
      ...flowerWeave,
      subjects: ['lit-perf', 'history', 'visual-arts'],
      aoks: ['ART', 'HIS'],
    },
  ),
  entry(
    'plate',
    'Fit the artist credit and the edition to their dates, then show time with Merian.',
    { any: [f('plate.gestures'), f('plate.page')] },
    {
      ...flowerWeave,
      subjects: ['history', 'dance', 'biology', 'visual-arts'],
      aoks: ['HIS', 'NAT', 'ART'],
    },
  ),
];
const support = [
  [
    'The light reaches two crops through the same window.',
    'Each pane has a handle. The first catch keeps the returns apart.',
    'In daylight, keep a slip for Hem and one for Cuff.',
    'Use gain one and take both slips again with the ultraviolet pane.',
  ],
  [
    'Elian says a white square can be a very loud silence.',
    'Some prints stop changing above one hundred.',
    'Try both crops in UV at gain four. Read the row numbers.',
    'Compare those slips with both crops in UV at gain one.',
  ],
  [
    'Breakfast happened between the two watches.',
    'The room has a ledge and two sliding labels.',
    'Unroll the morning with Hem beside the window.',
    'Slide Hem over to the door and open the later watch. Compare both rolls and their times.',
  ],
  [
    'Viri needs four slips and two bits of morning.',
    'The window and the ledge supply different parts of the show.',
    'Take the four slips at gain one and open both ledge watches.',
    'At the copper glove choose a silk performance or the open garden. The company can rehearse either again.',
  ],
  [
    'Listen for someone repeating the last line.',
    'A silk show goes to Edda. A garden show grows in Bridge Clearing.',
    'Follow the little door that appears in the glasshouse when the show opens.',
    'Find the usher or garden seats and offer the second performer or watcher a turn.',
  ],
  [
    'Look beside the seats in the second town.',
    'Two unopened watches have different flowers in the window position.',
    'Pin a reading before opening the sleeve. An empty ribbon lets the company watch without a prediction.',
    'After each opening use the landing to make a gesture. Both the checked ribbon and the new performance survive.',
  ],
  [
    'The rolling theatre opens after the first performance.',
    'The drawer has four different rollers. Each has a second face.',
    'Fit a roller, pull the handle, turn it over and pull again. The rules describe what survived.',
    'After doing this with all four rollers, hand the hooks to the front row or send the ribbons backstage.',
  ],
  [
    'Viri can take the printed sheet on tour.',
    'Meet the artist in the glasshouse, then open either the silk or garden show.',
    'Wear the earned Cleveland impression to visit the audience.',
    'Find the artist at her second bench. Let the audience begin with the page or begin with the dancer.',
  ],
  [
    'There is room on the old ribbon for more than one date.',
    'Bring the Cleveland engraving from the Metalworks reference line.',
    'Pin the artist credit and the date of this particular printing on their own stops.',
    'Meet Merian at the ribbon and try the moving gesture or the folded page.',
  ],
];
export const petalContent: Partial<ContentPack> = {
  characters: [
    {
      id: person,
      name: 'Viri',
      role: 'Dancer, wireworker and keeper of her mother’s gestures',
      mode: 'fictional',
      sprite: 'villager-2',
      talk: [{ node: 'petal.viri' }],
    },
    {
      id: 'petal-merian',
      name: 'Maria Sibylla Merian',
      role: 'Artist and naturalist',
      mode: 'historical',
      sprite: 'scholar-sefa',
      localGreeting: {
        'forest.community': 'petal.second-bench',
        'stage.rehearsal': 'petal.second-bench',
      },
      talk: [{ node: 'petal.artist-room' }],
    },
  ],
  dialogue: lines.map((n) => {
    const source: Record<string, string> = {
      'petal.colour': petalSight,
      'petal.edition': 'HIS-REFERENCE-LINE-SURINAME-ENGRAVING',
      'petal.artist': 'HIS-REFERENCE-LINE-SURINAME-ENGRAVING',
    };
    return source[n.id] ? { ...n, citationSource: source[n.id] } : n;
  }),
  sources: petalSourceRecords,
  missions: [
    {
      id: 'KG-FOREST-PETAL-HOUSE',
      world: 'WORLD-06',
      title: 'The yellow dress with twenty-seven fingers',
      knowledgeQuestion:
        'When can a picture of a difference explain what another creature will do?',
      stake:
        'Viri’s little company lives on her mother’s gestures. An invented claim about wild bees is bringing in its first proper audience.',
      objectives: goals,
    },
  ],
  hints: goals.flatMap((g, i) =>
    support[i].map(
      (text, j): Hint => ({
        id: 'h.' + g.id + '.' + j,
        depth: (j + 1) as Hint['depth'],
        objective: g.id,
        text,
      }),
    ),
  ),
  journal: [
    'I took two daylight slips that matched. The UV pane showed a different distribution on the same two crops.',
    'I ran the printer into its upper stop. I needed the quieter setting to get the detail back.',
    'I unrolled two mornings. The flower and the hour had both changed places in the second account.',
    'I helped Viri decide what the first audience would see and who could choose their next move.',
    'I gave someone else a working part in the next performance.',
    'I filed the two later watches beside the ribbons we pinned before opening them. Viri made a gesture with each landing.',
    'I worked four rollers on both faces. A change of counting units kept a ratio. Changing the starting point of a clock kept the interval.',
    'I carried the same impression to another audience. The page let them begin in one of several places. The dancer could enter the stage only once in each opening.',
    'I held the 1771 impression beside the earlier artist credit and tried giving several moments a place in one composition.',
  ].map((text, i) => ({
    id: 'j.' + goals[i].id,
    text,
    claimKind: 'interpretation',
  })),
};
