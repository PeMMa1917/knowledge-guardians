import { elbowKey as K, elbowWeave as weave, elbowPaper } from '../domain/giantSleeve';
import { specimenEquipped } from '../domain/specimenGear';
import type { Condition, ContentPack, DialogueNode, Hint, Objective, Weave } from '../domain/types';

export const duchamp = 'model-record-maker-stoppages';
export const stoppagesSource = 'HIS-MODEL-RECORD-stoppages';
const heldCurve = specimenEquipped('moma:149.1953.a-i');
const said = (
  id: string,
  speaker: string,
  text: string,
  options: DialogueNode['options'] = [],
  citationSource?: string,
): DialogueNode => ({
  id: 'elbow.' + id,
  speaker,
  text,
  options,
  historicalLabel: speaker === duchamp ? 'imagined-alternate' : 'fictional-world',
  citationSource,
});
const to = (text: string, id: string, condition?: Condition) => ({
  text,
  next: 'elbow.' + id,
  if: condition,
});
const given = (part: string, value: string | number | boolean): Condition => ({ flag: K(part), eq: value });
const shown = (part: string): Condition => ({ flagSet: K(part) });
const pip = 'elbow-pip',
  vee = 'elbow-vee';
const lines: DialogueNode[] = [
  said(
    'pip',
    pip,
    'A paper giant sticks its arm through the loft window, feels around for the latch on the wrong side and politely knocks. Pip answers from the floor. “Come in, me.” She has the giant’s other arm tied to one shoe.',
    [
      to('Sit down where she can see you.', 'shoe'),
      to('Answer the knock.', 'knock'),
      to('Give Pip the little moon caught in her cap.', 'cap', given('performedHinge', 'chalk-dust')),
      to('Ask who drew the face on the rising moon.', 'face-moon', given('performedHinge', 'chalk')),
      to('Ask what happened when Vee opened.', 'pip-first', given('cue', 'first')),
      to('Ask what happened after Pip gave the cue.', 'pip-last', given('cue', 'last')),
    ],
  ),
  said(
    'cap',
    pip,
    'Pip turns the moon over. There is a price on it in Vee’s handwriting. “Plum ice, one small moon.” She slips it into her purse alongside the real money. “I suppose her shop will need a customer.”',
  ),
  said(
    'face-moon',
    pip,
    '“One eyebrow each,” Pip says. She takes the moon off its hook so you can see the big pencilled thumbprint in the middle. “We both held the same rubber. Couldn’t agree which eyebrow needed fixing.”',
  ),
  said(
    'shoe',
    pip,
    '“I made this show when Vee still had to stand on the flour tin to see the audience. I can work two strings from this chair. Last night she took the four-string bow, and I was proud until the clapping started.” She moves the giant’s hand back to the window. “Could we give it a hand that fits the next person, too?”',
  ),
  said(
    'knock',
    vee,
    'From the dark rafters a voice says, “Two people inside and nobody to open up. That would be our family.” A spoon on a string unlatches the door. It has a smear of plum ice on it. Someone up there has been eating the props.',
  ),
  said(
    'pip-first',
    pip,
    '“The children called her Vee. All those years I thought they came for a giant.” Pip puts two tickets on the windowsill. “Next time I want a seat where I can see her.”',
  ),
  said(
    'pip-last',
    pip,
    '“I gave a cue small enough to fit between two fingers. She saw it from the flies. Did you see her wait?” Pip folds the old printed sleeve into a cushion for the chair.',
  ),
  said(
    'vee',
    vee,
    'Vee is stirring a bucket of plum ice with a curtain rod. She lets you taste the part that froze round the edges. “If this show folds I want a shop so small I can see the face of everybody I feed. Please don’t tell Pip I’ve picked a street.”',
    [
      to('Let her hold the curtain while you take the spoon.', 'bucket'),
      to('Ask who took the giant’s last bow.', 'bow'),
      to('Bring up the downstairs performance.', 'vee-first', given('cue', 'first')),
      to('Ask about the signal from the chair.', 'vee-last', given('cue', 'last')),
    ],
  ),
  said(
    'bucket',
    vee,
    'She lets the bucket go, then grabs it again. “Sorry. Habit.” The next time she lets you take the whole weight. Up in the cloth a tiny paper hand opens too.',
  ),
  said(
    'bow',
    vee,
    '“Pip let me practise where nobody could see me. That last night she said go on. Nobody heard her say it. I can live with the audience thinking I stole a bow. I can’t stand her thinking I didn’t want it.”',
  ),
  said(
    'vee-first',
    vee,
    '“I saw Pip watching me. First time I’ve had to play a giant to somebody who knows exactly how small I am.” Vee has chalked two prices for plum ice on the rail. One is a child’s price. The other is a story.',
  ),
  said(
    'vee-last',
    vee,
    '“She opened her hand and four puppets moved. That’s her best trick.” Vee saves the scorched bit of plum for her sister. “Don’t tell her it’s the bit I like.”',
  ),
  said(
    'artist',
    duchamp,
    'A visitor sets a curved wooden offcut beside the straight cuff. “The measuring stick makes a beautiful straight arm. The trouble begins when the giant tries to scratch its nose.” He offers you the offcut.',
    [
      to('Watch what the curve does to the shadow.', 'shadow'),
      {
        text: 'Fit the template from the earned Stoppages to the prompt rail.',
        if: heldCurve,
        next: 'elbow.scratch',
        effects: [{ setFlag: K('curve'), value: true }],
      },
    ],
    stoppagesSource,
  ),
  said(
    'shadow',
    duchamp,
    'The shadow’s hand passes its face and knocks off its own hat. Pip laughs first. The visitor shows where a thread can preserve a particular fall. One straight ruler can give the end-to-end gap. A template lets another hand carry the bend.',
    [],
    stoppagesSource,
  ),
  said(
    'scratch',
    vee,
    'Vee traces your curved template onto a removable elbow slip. The giant can reach its own nose. She slips the new gesture into the rehearsal pocket. The original is still in your satchel.',
    [],
    stoppagesSource,
  ),
  said(
    'back',
    vee,
    'Tonight the cuff is lying on the floor between two chairs. The giant on the backdrop raises one wooden finger and waits. Pip and Vee both let you hear their version of the entrance.',
    [
      to('Ask what the old words leave out.', 'shoe'),
      to('Hear Vee’s stake in it.', 'bow'),
      to('See Pip after Vee’s entrance.', 'pip-first', given('cue', 'first')),
      to('Hear how Vee read Pip’s hand.', 'vee-last', given('cue', 'last')),
    ],
  ),
];
function goal(id: string, title: string, visible: Condition, done: Condition, w: Weave): Objective {
  return {
    id: 'elbow.' + id,
    title,
    visible,
    done,
    essential: false,
    weave: w,
    onComplete: [{ journal: 'j.elbow.' + id }],
  };
}
const fitting = goal(
  'fitting',
  'Send one sleeve down the hill after both companies try it.',
  { objective: 'stage.arrival' },
  shown('hung'),
  weave,
);
const lottery = goal(
  'lottery',
  'Get an honest reading for both of the giant’s hinges.',
  shown('hung'),
  shown('printed'),
  {
    ...weave,
    aoks: ['MAT', 'NAT', 'ART'],
    subjects: ['math-ai', 'physics', 'design-tech', 'theatre'],
    thinking: { dok: 3, bloom: 'evaluate', fink: 'application', solo: 'relational' },
  },
);
const curtain = goal(
  'curtain',
  'Give somebody the opening and keep the other sister in the show.',
  shown('printed'),
  shown('cue'),
  {
    ...weave,
    aoks: ['HIS', 'ART', 'MAT'],
    subjects: ['lit-perf', 'theatre', 'math-ai'],
    thinking: { dok: 4, bloom: 'create', fink: 'human', solo: 'extended' },
  },
);
const curve = goal(
  'bend',
  'Give the giant a new gesture using Duchamp’s template.',
  heldCurve,
  given('curve', true),
  {
    ...weave,
    aoks: ['ART', 'MAT'],
    subjects: ['visual-arts', 'math-aa', 'theatre'],
    thinking: { dok: 2, bloom: 'apply', fink: 'application', solo: 'relational' },
  },
);
const help: [Objective, string[]][] = [
  [
    fitting,
    [
      'Listen at the window. Two different troupes borrow the same set of sleeves.',
      'Their paper elbows bend by one centimetre either way. The two brass joints can travel to any two puppets.',
      'Fit the current pattern to the winter cast, then fit the very same pattern to the summer cast.',
      'Hang the tried sleeve from the loft. The runners take its measurements to Lantern Square.',
    ],
  ],
  [
    lottery,
    [
      'A pulley key clears one hinge and sticks in another. The two trays hold the measurements.',
      'Peg the direction you mean to inspect. Then open the packet and exchange which three slips get a treatment clip.',
      'Try a middle arrangement and one as far out as DEF with each packet. The sealed prediction stays pinned if you later change direction.',
      'Send both packet readings under the same direction. The theatre keeps the sleeve pattern that went with them.',
    ],
  ],
  [
    curtain,
    [
      'The prompt book and the repairs inside the cuff remember different performances.',
      'Down in the rehearsal room, read the print on the outside and the three knots inside.',
      'Turn the side you want the audience to see outwards. Choose which sister gives the first cue.',
      'Return to the loft. Pip and Vee have each noticed something you couldn’t see from the front.',
    ],
  ],
  [
    curve,
    [
      'A visitor in the loft tries a crooked elbow on the shadow.',
      'Earn Marcel Duchamp’s 3 Standard Stoppages at the model room on the islands.',
      'Carry and equip the work in your satchel. Show it to the visiting artist at the loft.',
      'Try the extra nose-scratch cue on the rehearsal floor. The original stays with you.',
    ],
  ],
];
export const giantContent: Partial<ContentPack> = {
  characters: [
    {
      id: pip,
      name: 'Pip Fenner',
      role: 'Puppet builder and keeper of the prompt book',
      mode: 'fictional',
      sprite: 'villager-1',
      talk: [{ node: 'elbow.pip' }],
    },
    {
      id: vee,
      name: 'Vee Fenner',
      role: 'Puppeteer and would-be ice seller',
      mode: 'fictional',
      sprite: 'villager-2',
      talk: [{ node: 'elbow.vee' }],
      localGreeting: { 'stage.rehearsal': 'elbow.back' },
    },
  ],
  dialogue: lines,
  sources: [
    {
      id: elbowPaper,
      title: 'Wasserstein and Lazar on interpreting p-values',
      url: 'https://doi.org/10.1080/00031305.2016.1154108',
      locator: 'Principles 3, 4 and 5',
      supports:
        'A p-value depends on the model and analysis, and does not measure effect size or practical importance. Selecting analyses requires disclosure. The puppet-strip lottery is an original classroom example.',
      accessed: '2026-11-27',
      mla: {
        kind: 'page',
        author: 'Wasserstein, Ronald L., and Nicole A. Lazar',
        title: 'The ASA Statement on p-Values: Context, Process, and Purpose',
        container: 'The American Statistician',
        publication: { volume: '70', issue: '2', year: '2016', pages: '129–33' },
      },
    },
  ],
  missions: [
    {
      id: 'KG-STAGE-GIANT-SLEEVE',
      world: 'WORLD-10',
      title: 'The giant who borrowed my elbow',
      knowledgeQuestion: 'What can a measuring pattern settle when two people have to share a part?',
      stake:
        'On the last night of the run, Vee took the hand in the curtain call. Pip would like to see her sister in the light and fears disappearing from her own show.',
      objectives: [fitting, curtain, curve],
    },
    {
      id: 'KG-MARKET-GIANT-LOT',
      world: 'WORLD-11',
      title: 'A brass hinge with a paper promise',
      knowledgeQuestion: 'When is an unusual result large enough to matter to someone using it?',
      stake:
        'One lift is for a practice arm. One carries the hand that greets the front row. The company can afford to fit just one tonight.',
      objectives: [lottery],
    },
  ],
  hints: help.flatMap(([g, lines]) =>
    lines.map(
      (text, i): Hint => ({
        id: 'h.' + g.id + '.' + i,
        objective: g.id,
        depth: (i + 1) as Hint['depth'],
        text,
      }),
    ),
  ),
  journal: [
    {
      id: 'j.elbow.fitting',
      text: 'I tried the same sleeve on two companies with the same average reach. Different little hands stayed in the dark.',
      claimKind: 'observation',
    },
    {
      id: 'j.elbow.lottery',
      text: 'I sent the hinge readings backstage. A draw could be just as unusual on both trays and lift the real catch on only one.',
      claimKind: 'interpretation',
    },
    {
      id: 'j.elbow.curtain',
      text: 'I gave the front row a version of the entrance. The sister waiting for her cue had seen a different part of the show.',
      claimKind: 'observation',
    },
    {
      id: 'j.elbow.bend',
      text: 'I carried Duchamp’s chance curve into a different craft and left Vee a gesture she could repeat.',
      claimKind: 'observation',
    },
  ],
};
