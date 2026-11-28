import { lensBench, lensTheatre, lensTopics } from '../domain/lensLoan';
import type {
  Condition,
  ContentPack,
  DialogueNode,
  Hint,
  Objective,
  SourceRecord,
  Weave,
} from '../domain/types';

export const lensPeople = {
  mayle: 'depot-visitor-mayle',
  nim: 'optics-nim',
  cajal: 'ink-q150526',
  huygens: 'lantern-q39599',
} as const;
const { mayle, nim, cajal, huygens } = lensPeople;
const cajalSource = 'HIS-OPTICS-CAJAL',
  waveSource = 'HIS-OPTICS-WAVE',
  slideSource = 'HIS-OPTICS-SLIDE';
const yes = (key: string): Condition => ({ flag: 'optics.' + key, eq: true });
const there = (key: string): Condition => ({ flagSet: 'optics.' + key });
const go = (text: string, id: string, when?: Condition) => ({ text, next: 'optics.' + id, if: when });
const cajalReadings: Record<string, string> = { 'cajal.draw': 'HIS-OPTICS-LIFE', 'cajal.petal': slideSource };
const node = (
  id: string,
  speaker: string,
  text: string,
  options: DialogueNode['options'] = [],
): DialogueNode => ({
  id: 'optics.' + id,
  speaker,
  text,
  options,
  historicalLabel: speaker === cajal || speaker === huygens ? 'imagined-alternate' : 'fictional-world',
  ...(speaker === cajal
    ? { citationSource: cajalReadings[id] ?? cajalSource }
    : speaker === huygens
      ? { citationSource: waveSource }
      : {}),
});
const lines = [
  node(
    'nim',
    nim,
    'A silver river runs the length of the curtain. Halfway across, the thread breaks. Nim is crouched behind it with the loose end between her teeth. “They gave me my first entrance. Someone stitched the way across before I was born. I can’t find it.”',
    [
      go('Take the weight of the hem.', 'nim.hem'),
      go('Offer her the loose thread.', 'nim.thread'),
      go('Fit the little window into the big one beside her.', 'nim.crop', yes('joined.field')),
    ],
  ),
  node(
    'nim.hem',
    nim,
    'The cloth falls away from a second line, very small, stitched into its back. “All week I’ve been asking them how I should cross. Nobody asked whether I wanted the part.” She leans on your shoulder, then laughs. “I do. Terribly. Can you hold it one more minute?”',
  ),
  node(
    'nim.thread',
    nim,
    'She pulls once. A star on the other bank winks. “There! Oh. That was my hand.” She winds the loose end round a button. “Could you see what moved while I wasn’t touching it?”',
  ),
  node(
    'nim.crop',
    nim,
    'Nim puts a thimble where your close view fits. She can pick up the seam here without pretending it runs all the way to the bank. “I’ll decide the rest with my feet.”',
  ),
  node(
    'mayle',
    mayle,
    'Mayle has arrived with the company’s curtain in the same barrow she uses for cases. She draws two boxes in the dust. “My father stitched the river. Everybody wants his autograph and I’ve no idea which bit is his.” Her porter’s stamp has a knot on one face and a star on the other.',
    [
      go('Make a little room on the barrow.', 'mayle.barrow'),
      go('Ask about the stamp.', 'mayle.stamp'),
      go('Bring the two number plates together.', 'mayle.case', yes('pairedSources')),
    ],
  ),
  node(
    'mayle.barrow',
    mayle,
    'There are four recesses upstairs and two hooks in the barrow. “Small enough for me to carry alone. That was the point when I made it. Now there are four of us and everybody politely leaves it to me.” She lets you lift your end.',
  ),
  node(
    'mayle.stamp',
    mayle,
    '“The knot was my first signature. My father hadn’t time to teach me letters before the boats went. The star’s mine too. I can remember two good ways to pack a box.”',
  ),
  node(
    'mayle.case',
    mayle,
    'Mayle sticks a new loop inside the borrowed drawer for each reading. “Downstairs I gave the runner a number. Up here I can show what went wrong when I put it on the lid.”',
  ),
  node(
    'cajal',
    cajal,
    'Santiago Ramón y Cajal works a pencil down the page until its edge is broad enough for a shadow. “On paper I can leave a little air between two dark lines. The next person can ask how much of that air was in the glass.” He moves his elbow so you can look.',
    [
      go('Look at the two petal studies with him.', 'cajal.petal'),
      go('Ask for the pencil instead.', 'cajal.draw'),
      go(
        'Lay your matched fresh and pressed tracings under his page.',
        'cajal.return',
        yes('compared.preparation'),
      ),
    ],
  ),
  node(
    'cajal.petal',
    cajal,
    'A thin ridge lies along the pressed study. The fresh study came from the same design before the paper folded it. “Keep the angle. Keep the field. One different way of making a study is quite enough to give a draughtsman work.”',
  ),
  node(
    'cajal.draw',
    cajal,
    '“I wanted to draw long before I wanted to sit at a microscope.” He gives you the pencil. Its narrow side makes the line look certain. Turn it in your fingers and the same line widens.',
  ),
  node(
    'cajal.return',
    cajal,
    'Cajal places a little bracket round the new dark crease. “Keep the two sheets together. Your next reader can see why you left the crease out of the first drawing.” He inclines the page toward Nim. She can still use the crease in her entrance.',
  ),
  node(
    'huygens',
    huygens,
    'Christiaan Huygens stands an empty frame on its edge. A draught ripples the cloth inside. “We have a good entrance for someone in the middle seat. I should like to know whether our drawing has promised the same thing to someone in the wing.”',
    [go('Hold the frame for him.', 'huygens.paper'), go('Take a chalk board to a seat.', 'huygens.seat')],
  ),
  node(
    'huygens.paper',
    huygens,
    'He sweeps an arc through the dots of an earlier front. “A little wave spreads from each point. Another drawing sends a ruler straight through the doorway. In a wide opening a seat can pay for either drawing and see the same show.”',
  ),
  node(
    'huygens.seat',
    huygens,
    '“Choose where somebody would actually sit. Try a narrower opening. Ask that person again on another run.” Nim folds the first empty slip very neatly.',
  ),
  node(
    'nim.street',
    nim,
    'Nim is taking her first bow with the curtain still shut. She catches you looking. “I practise the end. It makes me a little less afraid of the beginning.”',
    [
      go('Stand where the youngest dresser stands.', 'nim.wing'),
      go('Give her the drawing she can use for a cue.', 'nim.chalk', yes('trusted.cue')),
    ],
  ),
  node(
    'nim.wing',
    nim,
    'The wing has a sight line all its own. A hand, a lamp, the tip of one shoe. The river in the centre cannot be seen. Someone who knows the cue could give a whole performance from here.',
  ),
  node(
    'nim.chalk',
    nim,
    'Nim rubs one forecast into the wing floor at shoe height. “If I see two glints I step there. People can keep arguing about what light is while I do it.” She writes Mayle’s name underneath.',
  ),
  node(
    'mayle.street',
    mayle,
    'The porter has put a mending basket out in the audience. “They always take my hands for granted backstage. I want to see what someone sees from here.”',
    [
      go('Sit through her father’s river.', 'mayle.audience'),
      go('Point out the sleeve scratch in the tracing.', 'mayle.scratch', yes('joined.holder')),
    ],
  ),
  node(
    'mayle.audience',
    mayle,
    'Mayle has mended the silver cloth often enough to recognise three different hands in it. None of that tells her where her father stood to see the show. She takes the seat next to yours.',
  ),
  node(
    'mayle.scratch',
    mayle,
    '“It stayed put when the cloth turned. It lifted with the sleeve. Father never sewed that line.” Mayle threads her needle with blue and begins a new mark in the lining, her own.',
  ),
  node(
    'cajal.street',
    cajal,
    'Cajal has slipped his drawing among the scenery notes. A dotted contour means another look is needed. A dresser has borrowed that contour for a border. “A useful line has acquired another occupation.”',
    [go('Keep the two slips outside the border.', 'cajal.margin')],
  ),
  node(
    'cajal.margin',
    cajal,
    'From his seat you can see the whole river and hardly a single stitch. He keeps both tracings beside the programme. The next page has space for a different view.',
  ),
  node(
    'huygens.street',
    huygens,
    'Huygens has drawn two routes for the footlights. On the broad doorway cards the routes light the same seats. From the step beside the curtain the lamp looks quite different.',
    [
      go('Leave him a second set of rehearsal slips.', 'huygens.test', yes('trusted.test')),
      go('Invite him to stay for the entrance.', 'huygens.bow'),
    ],
  ),
  node(
    'huygens.test',
    huygens,
    'Huygens pins both drawings above one marked seat. “A useful place to stand. If every seat agreed with both, we could get a runner on stage with either of them and go home none the wiser.”',
  ),
  node(
    'huygens.bow',
    huygens,
    'He folds the chalk sheet to fit his pocket and keeps the crease away from the seat numbers. “This seat has been good to my drawing. I owe it a performance.”',
  ),
];
const refs: SourceRecord[] = [
  [
    cajalSource,
    'The Structure and Connexions of Neurons',
    'NobelPrize.org',
    'https://www.nobelprize.org/prizes/medicine/1906/cajal/lecture/',
    'Ramón y Cajal, Santiago',
    'The 1906 Nobel lecture concerns observations, structure and connections of nerve cells. Its drawings inform the fictional pencil conversation.',
  ],
  [
    'HIS-OPTICS-LIFE',
    'Santiago Ramón y Cajal – Biographical',
    'NobelPrize.org',
    'https://www.nobelprize.org/prizes/medicine/1906/cajal/biographical/',
    '',
    'The account records his early wish to be an artist.',
  ],
  [
    waveSource,
    'Huygens’s Principle',
    'University Physics Volume 3, OpenStax',
    'https://openstax.org/books/university-physics-volume-3/pages/1-6-huygenss-principle',
    'Ling, Samuel J., et al.',
    'New wave fronts can be constructed from secondary wavelets. The playhouse lamps are a simplified fictional rehearsal.',
  ],
  [
    slideSource,
    'Studying Cells',
    'Biology 2e, OpenStax',
    'https://openstax.org/books/biology-2e/pages/4-1-studying-cells',
    'Clark, Mary Ann, et al.',
    'The discussion of microscopes explains preparation and how imaging methods change what can be observed. The paired petal grids are a drawn model.',
  ],
].map(([id, title, container, url, author, supports]) => ({
  id,
  title,
  url,
  locator: title,
  supports,
  accessed: '2026-11-27',
  mla: { kind: 'page', title, container, ...(author ? { author } : {}) },
}));
type Job = {
  id: string;
  title: string;
  visible: Condition;
  done: Condition;
  act: string;
  entry: string;
  hints: [string, string, string, string];
  thinking?: Weave['thinking'];
};
const homeJobs: Job[] = [
  {
    id: 'borrow',
    title: 'Take two fittings upstairs',
    visible: { flag: 'coast.arrived', eq: true },
    done: yes('everLoan'),
    act: 'borrow',
    entry: 'I lifted one end of Mayle’s drawer. She could carry two tools at once.',
    hints: [
      'Listen for a rattle above the Survey Depot.',
      'The stairs open beside the depot’s case tables.',
      'Four fittings hang above a two-place drawer.',
      'Pick any two fittings and lift the drawer. You can give them back.',
    ],
  },
  {
    id: 'sources',
    title: 'Give the lid and the body their own clips',
    visible: { any: [yes('everLoan'), { card: 'card.depot.micro' }, { card: 'card.depot.micro-case' }] },
    done: yes('pairedSources'),
    act: 'fitCard',
    entry:
      'At the barrow I gave a reused wooden case and the older Swift instrument their own identity readings.',
    hints: [
      'A number inside a lid can long outlast the instrument.',
      'Follow the stairs down to the depot’s identity table.',
      'Inspect both the Swift body 16616 and the wooden case marked 30607.',
      'Return to the loft. Clip both catalogue readings beside the loan drawer.',
    ],
  },
  {
    id: 'presets',
    title: 'Find a pair by each of Mayle’s stamps',
    visible: yes('everLoan'),
    done: { all: [yes('calledMark.knot'), yes('calledMark.star')] },
    act: 'useMark',
    entry: 'Mayle read both of my packings from marks she could find by touch.',
    hints: [
      'Mayle’s stamp has two faces.',
      'Hand the drawer back before changing a choice.',
      'Pick two fittings and stamp the knot. Save a pair at the star too.',
      'Recall each mark. You can take the pairs out in any order.',
    ],
  },
  {
    id: 'registration',
    title: 'Find where a small window fits',
    visible: yes('everLoan'),
    done: yes('joined.field'),
    act: 'register',
    entry: 'I put a close view back into the part of the whole field where it belonged.',
    hints: [
      'Nim holds a thimble where the seam disappears.',
      'Borrow a field lens and a close lens together.',
      'Keep one study and sleeve setting. Trace the whole view, then trace a close window.',
      'Lay the two tracings together. Fit the little window back into the field.',
    ],
  },
  {
    id: 'scratch',
    title: 'Find which line belongs to the holder',
    visible: yes('everLoan'),
    done: yes('joined.holder'),
    act: 'isolate',
    entry: 'Mayle could put her finger on a line that belonged to the holder.',
    hints: [
      'Some marks have never touched the cloth.',
      'Borrow the turning stage and the lift-off sleeve. Try the curtain.',
      'Trace two different angles with the sleeve still. Lay them together. Then compare sleeve up and down at one angle.',
      'Keep the same study. When both comparisons show a changed mark, separate the holder from the cloth.',
    ],
  },
  {
    id: 'crease',
    title: 'Find what folding did to the petal',
    visible: yes('everLoan'),
    done: yes('compared.preparation'),
    act: 'blend',
    entry:
      'Cajal left the two petal tracings together so a second reader could see the contribution of the fold.',
    hints: [
      'A line through the petal appears only after preparation.',
      'Choose the fresh petal and trace it in amber.',
      'Keep the same angle, sleeve and view. Switch to the pressed study for blue.',
      'Lay the slips together. If your close window missed the centre, try the locators or the whole field.',
    ],
  },
  {
    id: 'send',
    title: 'Send the understudy two tracings',
    visible: yes('everLoan'),
    done: yes('sealed'),
    act: 'travel',
    entry: 'I rolled two tracings around one pin. The address on the envelope led to the rehearsal wing.',
    hints: [
      'Nim has one entrance and several ways to see the cloth.',
      'The amber and blue frames can hold different studies, angles or fields.',
      'Trace one reading. Change something, make a second reading and lay them together.',
      'Seal the pair. Once you have visited the House of Performance, its service stair opens to the rehearsal room.',
    ],
  },
  {
    id: 'fold',
    title: 'Find where every corner comes home',
    visible: yes('everLoan'),
    done: yes('gridFold'),
    act: 'unroll',
    entry: 'I found a reason for every square to return to its place after four turns.',
    hints: [
      'A corner can keep its place in more than one way.',
      'Borrow a field lens with a turning stage. Place the ruled glass in the whole field.',
      'Give the glass four quarter turns. Open the four-fold corner.',
      'Pick a starting square and follow its route. The pair of turns written underneath works for every square.',
    ],
  },
];
const stageJobs: Job[] = [
  {
    id: 'entrance',
    title: 'Give the river an entrance',
    visible: yes('sealed'),
    done: { any: ['join', 'space', 'window'].map((k) => yes('shown.' + k)) },
    act: 'print',
    entry: 'I put our chosen entrance where a dresser and a porter could see it from different seats.',
    hints: [
      'The ball of silver thread stops at the curtain.',
      'Follow the loft’s light stair to the rehearsal room.',
      'Find the curtain rail and read the two slips that arrived.',
      'Hang the bridge, the gap or the second window. You can try another entrance later.',
    ],
  },
  {
    id: 'project',
    title: 'Take your own two fittings into the wings',
    visible: yes('sealed'),
    done: there('projection'),
    act: 'register',
    entry:
      'I fitted the travelling loan to the company lantern. My choice of tools changed which part of the cloth the audience could see.',
    hints: [
      'The company built a lantern with two empty sockets.',
      'Borrow a pair at the depot and keep the drawer when you take the wing stair.',
      'At the curtain rail, fit the travelling pair to the projector.',
      'Open the projector. Compare both positions. You can hand the fittings back here.',
    ],
  },
  {
    id: 'audience',
    title: 'Stay for Nim and Mayle',
    visible: there('notice'),
    done: { all: [yes('heard.porter'), yes('heard.understudy')] },
    act: 'listen',
    entry: 'I stayed long enough to see what the same entrance gave two people who had worked on it.',
    hints: [
      'Mayle brought her basket into the audience.',
      'A light behind the curtain and one in the wing show different details.',
      'At the curtain rail, give the audience one of the three entrances.',
      'Read Mayle’s response and Nim’s. Move the lamp and try the entrance again.',
    ],
  },
  {
    id: 'margins',
    title: 'Give the proof and the audience their own margins',
    visible: yes('gridFold'),
    done: yes('margins'),
    act: 'margin',
    entry: 'I took one proof for the grid and several revisable observations to the people lighting the wing.',
    hints: [
      'Nim brought two margins for the lamp programme.',
      'Unfold the four-turn ruled grid at the loan loft.',
      'In rehearsal, try both chalk drawings at the wing or step. Repeat the observations and entrust your chalk.',
      'Bind the grid fold beside the rehearsal slips. Huygens and Nim have room for two different kinds of confidence.',
    ],
    thinking: { dok: 4, bloom: 'create', fink: 'integration', solo: 'extended' },
  },
  {
    id: 'drawings',
    title: 'Find a seat that can tell the chalk drawings apart',
    visible: yes('sealed'),
    done: { any: [yes('trusted.cue'), yes('trusted.test')] },
    act: 'entrust',
    entry:
      'I found a seat where competing drawings gave different forecasts, and decided whose job the chalk should do next.',
    hints: [
      'At the centre both routes sometimes make the same promise.',
      'Look at the wing or the step. Bring each chalk drawing to the broad doorway and to the slit.',
      'Open at least two different rehearsal slips at each opening for the same seat. You can compare the forecast with all three slips.',
      'Give the resulting drawing to Nim as an entrance cue, or leave the competing forecasts for another rehearsal.',
    ],
    thinking: { dok: 4, bloom: 'evaluate', fink: 'integration', solo: 'extended' },
  },
];
export function installLensLoan(pack: ContentPack) {
  pack.sources.push(...refs);
  pack.dialogue.push(...lines);
  pack.characters.push({
    id: nim,
    name: 'Nim Eave',
    role: 'Understudy and former wardrobe runner',
    mode: 'fictional',
    sprite: 'villager-1',
    talk: [{ node: 'optics.nim' }],
  });
  for (const [key, id] of Object.entries(lensPeople)) {
    const c = pack.characters.find((c) => c.id === id)!;
    c.localGreeting = {
      ...c.localGreeting,
      [lensBench]: 'optics.' + key,
      [lensTheatre]: 'optics.' + key + '.street',
    };
  }
  for (const [index, rows] of [homeJobs, stageJobs].entries()) {
    const goals: Objective[] = rows.map((j) => ({
      id: 'optics.' + j.id,
      title: j.title,
      essential: false,
      visible: j.visible,
      done: j.done,
      weave: {
        ...lensTopics(j.act),
        ...(j.thinking ? { thinking: j.thinking } : {}),
        minutes: j.id === 'drawings' ? 5 : 2,
      },
      onComplete: [{ journal: 'j.optics.' + j.id }],
    }));
    pack.missions.push({
      id: 'KG-OPTICS-' + (index ? 'CURTAIN' : 'BORROW'),
      world: index ? 'WORLD-10' : 'WORLD-05',
      title: index ? 'Where the understudy waits' : 'The drawer with two places',
      knowledgeQuestion: index
        ? 'When does a model useful for a performance also give us grounds for explaining what happened?'
        : 'How can a reader tell which marks belong to the specimen, the tools or the preparation?',
      stake: index
        ? 'Nim gets one entrance. Her first audience includes the porter whose father stitched the scenery.'
        : 'Mayle is carrying her father’s last piece of scenery to a company that wants to follow a break in the thread.',
      objectives: goals,
    });
  }
  for (const j of [...homeJobs, ...stageJobs]) {
    pack.journal.push({ id: 'j.optics.' + j.id, text: j.entry, claimKind: 'observation' });
    j.hints.forEach((text, i) =>
      pack.hints.push({
        id: 'h.optics.' + j.id + '.' + i,
        objective: 'optics.' + j.id,
        depth: (i + 1) as Hint['depth'],
        text,
      }),
    );
  }
}
