import type { Condition, ContentPack, DialogueNode, Hint, Objective, Weave } from '../domain/types';
import { easternCopy, stackWeave, stacksShop, stacksWalk } from '../domain/turningStacks';

export const stackHosts = { opal: 'stacks-opal', tallis: 'stacks-tallis' };
const yes = (k: string): Condition => ({ flag: 'stacks.' + k, eq: true });
const node = (id: string, speaker: string, text: string, options: DialogueNode['options'] = []): DialogueNode => ({
  id: 'stacks.' + id,
  speaker,
  text,
  options,
  historicalLabel: 'fictional-world',
});
const go = (text: string, next: string) => ({ text, next: 'stacks.' + next });
const { opal, tallis } = stackHosts;
const talk = [
  node(
    'opal',
    opal,
    'The suitcase sneezes. Two little brass hinges land on your boot. “The big one would have had your hat off,” says Opal. “Here. Hold my house while I find its door.” Inside the lid, six leaves hang from hooks. Every one has two names, the name on the leaf and the name of the people who published it.',
    [go('Hold the roof for her.', 'opal.roof'), go('Pick up the loose hinge.', 'opal.pin')],
  ),
  node(
    'opal.roof',
    opal,
    '“When I was little my mother worked the far ferry. I built the first one so she could see an exhibition in the time it took to unload.” Opal tests a wheel with a thumb. “I got so fond of the trick I forgot the people who had to come inside it.”',
  ),
  node(
    'opal.pin',
    opal,
    'One end of the hinge pin has a groove worn deep enough to catch a fingernail. “Tallis thinks the nameplates fell off by accident,” says Opal. “He’s hauled that cabinet up too many steps for me to tell him the whole thing today.”',
  ),
  node(
    'tallis',
    tallis,
    'Tallis carries a ladder over one shoulder, with a bright patch where his sleeve has worn through. “Left door from the water. Right door from the street. My mother can tell which way a house opens by the sound of it. This one used to say somebody else’s name every time it shut.”',
    [go('Ask to try the door from his side.', 'tallis.side'), go('Offer to carry the lamp.', 'tallis.lamp')],
  ),
  node(
    'tallis.side',
    tallis,
    '“Walk my little figure first if you like. All the model knows about me is which door I used. It can show the length of the walk. It can’t show why I stop.” He winds a strip of cloth round the ladder rail.',
  ),
  node(
    'tallis.lamp',
    tallis,
    '“It’s lighter than it looks. The bit I’m tired of carrying is telling people they’ve missed the name.” Tallis lets you take the lamp. He keeps his shoulder under the ladder.',
  ),
  node(
    'opal.street',
    opal,
    'Opal braces the far hinge with one hand. “A woman read me a date from across the water. Nobody ever read me a date from there before. Do the last two lines have enough light for you?”',
    [
      go('Look between the leaves.', 'opal.street.close'),
      go('Ask why the names have their own hooks.', 'opal.street.name'),
    ],
  ),
  node(
    'opal.street.close',
    opal,
    'The cord runs under both leaves. Either may move first. Each carries its own little brass strip. Opal has filed the screws almost flush so no hand will catch on them.',
  ),
  node(
    'opal.street.name',
    opal,
    '“You can cite the place that keeps a treaty transcript. You can cite a Nation when it tells its own history. If the hinges force those credits under one name, putting the right date back won’t mend it.”',
  ),
  node(
    'tallis.street',
    tallis,
    'Tallis has chalked a small circle on the quay at the height of a child’s eye when the ferry is full. “Three winters I thought that circle was where I’d dropped a coin. My sister brought her little girl down here and showed me what I’d missed.”',
  ),
];
type Job = {
  id: string;
  title: string;
  done: Condition;
  entry: string;
  hints: [string, string, string, string];
  weave?: Weave;
  visible?: Condition;
  quay?: boolean;
};
const jobs: Job[] = [
  {
    id: 'stacks.bound',
    title: 'Walk to two shelves and bind the leaves in the order you found them.',
    done: yes('bound'),
    entry: 'I sent a walking order and two separately credited pages down to the boats.',
    hints: [
      'Listen for the little brass hinges on Canal Walk.',
      'Open the wheel door or the lamp door to put a visitor on the floor.',
      'Cross the screen through its opening. Use a marked path whenever you like.',
      'Open a leaf at B2 and one at D4. Bind them after the same visitor has read both.',
    ],
  },
  {
    id: 'stacks.counts',
    title: 'Resize the circle around the election board’s count.',
    done: { all: ['eligible', 'returned', 'valid'].map((b) => yes('count.' + b)) },
    entry: 'I could change the proportion on a lamp without changing a single mark on the certificate.',
    hints: [
      'Look for the leaf with three signatures.',
      'Hang that leaf on a shelf and reach it with either visitor.',
      'Open it to find the counting lamp. Six spoiled ballots have their own place in the return.',
      'Try all three circles. Watch what happens to 115 when the group around it changes.',
    ],
    weave: { ...stackWeave, thinking: { dok: 2, bloom: 'analyse', fink: 'application', solo: 'relational' } },
  },
  {
    id: 'stacks.reply',
    quay: true,
    visible: yes('bound'),
    title: 'Find who kept the brass plate from falling at the quay.',
    done: yes('replied'),
    entry:
      'I heard what one set of hands had been doing behind the brass plate while the audience watched the front.',
    hints: [
      'An edition can travel while the model is still on the bench.',
      'Follow the rope stairs to Lamp Quay. The travelling case is by the water.',
      'Turn the lamp out to the boats or in over the bench. Each position has a different cost.',
      'Sit with Opal or steady Tallis’s ladder. You can hear them both, in either order.',
    ],
  },
  {
    id: 'stacks.headlines',
    title: 'Turn the same 163 lights to tell the two sides of the count.',
    done: { all: [yes('headline.for'), yes('headline.against')] },
    visible: yes('read.eastern'),
    entry: 'Tallis saw support first and Opal saw dissent first. Both could still find all 163 valid votes.',
    hints: [
      'Find the case with three names under its count.',
      'Choose the votes recorded for or against. The 6 spoiled ballots have a separate line.',
      'Each brass face gives one group the first line.',
      'Light the 115 votes for, then the 48 against, or turn the plate the other way round. Both use 163.',
    ],
    weave: { ...stackWeave, thinking: { dok: 2, bloom: 'analyse', fink: 'human', solo: 'relational' } },
  },
  {
    id: 'stacks.signatures',
    title: 'Trace the election board and the date at the foot of its page.',
    visible: { any: [yes('signature.board'), yes('signature.date')] },
    done: { all: [yes('signature.board'), yes('signature.date')] },
    entry:
      'I could put a date and three names to the work of certifying the result. The certificate tells me who signed, even though it cannot tell me how those individuals voted.',
    hints: [
      'At the North Steps, find the constitutional file after posting the Civic dispatch.',
      'Take the file and carry its perspective into the suitcase at Canal Walk.',
      'Look by the small lamp beside the floor model.',
      'Travel between the names and the date by sliding the signature lamp.',
    ],
  },
];
export function installTurningStacks(pack: ContentPack) {
  const constitution = pack.exhibits.find((record) => record.id === 'OBJ-EDGE-EASTERN')!;
  constitution.dateText = 'Published constitutional copy including the election certificate dated 17 June 1999';
  constitution.dateKind =
    'The board dated the certificate for this amendment on PDF page 16. Other pages have their own history.';
  constitution.sources = [...constitution.sources, 'HIS-STACK-CERT'];
  constitution.art = 'stacks.cert';
  constitution.altText =
    'A pale certificate beneath the edge of its constitutional cover. Three distinct signature lines and a date line sit below a short block of text.';
  constitution.specimen = {
    key: easternCopy,
    institution: 'Eastern Shawnee Tribe of Oklahoma',
    accession: 'Published constitutional PDF, media 2551, certificate on page 16',
    source: 'HIS-STACK-CERT',
    objective: 'record.edge.civic.post',
    revisit: {
      map: stacksShop,
      prop: 'stacks-signature',
      method: 'Follow the certifying names and the election date on the same page',
      hint: 'Equip the constitutional copy at the signature lamp inside the suitcase on Canal Walk. Choose which line to throw onto the roof.',
    },
  };
  pack.characters.push(
    {
      id: opal,
      name: 'Opal Fenn',
      role: 'Travelling cabinetmaker and ferry daughter',
      mode: 'fictional',
      sprite: 'villager-1',
      talk: [{ node: 'stacks.opal' }],
      localGreeting: { [stacksWalk]: 'stacks.opal.street' },
    },
    {
      id: tallis,
      name: 'Tallis Vale',
      role: 'Lamp tender, uncle and show rigger',
      mode: 'fictional',
      sprite: 'villager-2',
      talk: [{ node: 'stacks.tallis' }],
      localGreeting: { [stacksWalk]: 'stacks.tallis.street' },
    },
  );
  pack.dialogue.push(...talk);
  pack.sources.push(
    {
      id: 'HIS-STACK-PEORIA',
      title: 'Peoria Tribe of Indians of Oklahoma, History',
      url: 'https://peoriatribe.com/204/History',
      locator: 'Opening history and the section on the wider Peoria Nation',
      supports:
        'The Tribe describes a confederation formed in 1854 by Kaskaskia, Peoria, Piankashaw and Wea peoples and separately names a wider history involving twenty tribes.',
      accessed: '2026-11-27',
      mla: {
        kind: 'page',
        author: 'Peoria Tribe of Indians of Oklahoma',
        title: 'History',
        container: 'Peoria Tribe of Indians of Oklahoma',
        showAccessDate: true,
      },
    },
    {
      id: 'HIS-STACK-CERT',
      title: 'Eastern Shawnee Tribe of Oklahoma, Certificate of Results of Election, 17 June 1999',
      url: 'https://www.estoo-nsn.gov/media/2551',
      locator:
        'Constitution of the Eastern Shawnee Tribe of Oklahoma, PDF page 16, certificate signed and dated 17 June 1999',
      supports:
        'Election board members Mary Moss, Lena Mae Elliott and Glen Brock signed the counts of 115 for, 48 against and 6 spoiled. The certificate identifies 270 members entitled to vote.',
      accessed: '2026-11-27',
      mla: {
        kind: 'page',
        author: 'Eastern Shawnee Tribe of Oklahoma, Election Board',
        title: 'Certificate of Results of Election',
        container: 'Constitution of the Eastern Shawnee Tribe of Oklahoma',
        documentDate: '17 June 1999',
        showAccessDate: true,
      },
    },
  );
  const readings: { pair: string; title: string; entry: string; find: string }[] = [
    {
      pair: 'absentee.eastern',
      title: 'Put two governments’ own bylines back on the same lamp.',
      entry:
        'One Tribe chose the figure on its emblem. Another Tribe published its constitutional file. Their names and dates now go home on different strips.',
      find: 'Hang the emblem and the certificate.',
    },
    {
      pair: 'convention.peoria',
      title: 'Make room for the people named in two different centuries.',
      entry:
        'I followed the Wea name between an 1809 convention and the Peoria Tribe’s account of 1854. The two records name people in different circumstances.',
      find: 'Mount the October convention with the Peoria Tribe’s history.',
    },
    {
      pair: 'absentee.marker',
      title: 'Set the marker and the emblem where the ferry can see both credits.',
      entry:
        'A state marker and the Tribe’s account remember Tecumseh for different audiences. I gave each publisher a line and kept the installation date with the stone.',
      find: 'Open the leaf about the emblem and the leaf about the public square.',
    },
    {
      pair: 'convention.fort',
      title: 'Find the twenty-six days hidden in the double window.',
      entry:
        'I left the first agreement open at its forward-pointing clause. A separate set of named representatives and a later date stayed with the second text.',
      find: 'Pair the September article and the October convention.',
    },
  ];
  const allJobs = [
    ...jobs,
    ...readings.map(
      ({ pair, title, entry, find }): Job => ({
        id: 'stacks.readPair.' + pair,
        title,
        entry,
        quay: true,
        visible: { any: ['voices', 'years'].map((lens) => yes('readPair.' + pair + '.' + lens)) },
        done: { all: ['voices', 'years'].map((lens) => yes('readPair.' + pair + '.' + lens)) },
        hints: [
          find,
          'Take one visitor through both shelves, in either order. Bind the leaves and use the rope stairs.',
          'At the quay, turn the light to either audience. The little plate can hold two kinds of heading.',
          'Turn the plate to the publishers, then to the dates, or try them in reverse. Read what changes in the window.',
        ],
      }),
    ),
  ];
  const goals: Objective[] = allJobs.map((j) => ({
    id: j.id,
    title: j.title,
    essential: false,
    visible: j.visible ?? { any: [{ flag: 'stacks.visitor', in: ['wheel', 'lamp'] }, yes('bound')] },
    done: j.done,
    weave: { ...(j.weave ?? stackWeave), minutes: j.id === 'stacks.bound' ? 8 : 4 },
    onComplete: [{ journal: 'j.' + j.id }],
  }));
  pack.missions.push(
    {
      id: 'KG-CH12-TURNING-STACKS',
      world: 'WORLD-13',
      title: 'The house with six names',
      knowledgeQuestion: 'How can the order in which we meet two sources change whose authority we hear?',
      stake:
        'Opal’s last show left a nameplate on the pavement. A house that carries dates and sources together could reopen for the ferry crowd.',
      objectives: goals.filter((_, i) => !allJobs[i].quay),
    },
    {
      id: 'KG-CH13-QUAY-LAMP',
      world: 'WORLD-14',
      title: 'Light for the last boat',
      knowledgeQuestion: 'Who can check a public claim when the person who lights it stands on only one side?',
      stake:
        'Tallis can light the heading for the ferry or the small print for the close reader. The audience at the other end will have to wait.',
      objectives: goals.filter((_, i) => allJobs[i].quay),
    },
  );
  for (const j of allJobs) {
    pack.journal.push({ id: 'j.' + j.id, text: j.entry, claimKind: 'interpretation' });
    j.hints.forEach((text, i) =>
      pack.hints.push({ id: 'h.' + j.id + '.' + i, objective: j.id, depth: (i + 1) as Hint['depth'], text }),
    );
  }
}
