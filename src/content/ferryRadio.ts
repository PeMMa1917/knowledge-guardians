import type { Condition, ContentPack, DialogueNode, Hint, Objective, SourceRecord } from '../domain/types';
import { radioDock, radioLoft, wireTopics } from '../domain/ferryRadio';
export const radioPeople = { oda: 'wire-oda', tavi: 'wire-tavi', dubois: 'ink-q158060' } as const;
const { oda, tavi, dubois } = radioPeople;
const yes = (key: string): Condition => ({ flag: 'wire.' + key, eq: true });
const done = (id: string): Condition => ({ objective: 'wire.' + id });
const heard = (id: string) => yes('heard.' + id + '.open');
const choice = (text: string, next: string, guard?: Condition) => ({ text, next: 'wire.' + next, if: guard });
function node(
  id: string,
  speaker: string,
  text: string,
  options: DialogueNode['options'] = [],
  citation?: string,
): DialogueNode {
  return {
    id: 'wire.' + id,
    speaker,
    text,
    options,
    historicalLabel: speaker === dubois ? 'imagined-alternate' : 'fictional-world',
    ...(citation ? { citationSource: citation } : {}),
  };
}
const talk = [
  node(
    'oda',
    oda,
    '“If you hear a kettle fall, keep listening.” Oda winds the ferry hymn backward through a narrow gap in her wedding ring. Rain ticks on the roof. The falling lid has played on two separate nights. The missing singer took that kettle with her when she left.',
    [
      choice('Hold out your hand for the end of the spool.', 'oda.spool'),
      choice('Ask what she told the waiting ferry.', 'oda.ferry'),
      choice('Play the two breaths against each other.', 'oda.seam', yes('reuse')),
    ],
  ),
  node(
    'oda.spool',
    oda,
    'Oda puts the loose end over your thumb. “My wife asked for a summer of quiet. I said the show could manage a season without her.” Around your thumb the spool jumps. “It was only supposed to manage one Friday.”',
  ),
  node(
    'oda.ferry',
    oda,
    '“I told them to send their last word on a slip. When half a boat sent one, I took that as permission to keep the verse. I never thought to ask which half.”',
  ),
  node(
    'oda.seam',
    oda,
    'She lets the two kettle lids fall together once. Then she takes the ring off the spool. “Can you leave me four beats before anyone sings? I want enough room to say whose recording they have been hearing.”',
  ),
  node(
    'tavi',
    tavi,
    'A tiny paper moth is chewing the varnish off the tuning wheel. Tavi Pell puts a teaspoon under its feet. “It finds the warm coil before I do. I used to leave a whole shift out because I thought a silent winding meant an empty pier.”',
    [
      choice('Rest the moth on the roof winding.', 'tavi.moth'),
      choice('Hand him the slip with no word on it.', 'tavi.shift', heard('siv')),
      choice('Play the painter’s two answers in order.', 'tavi.paint', yes('paired.joist')),
    ],
  ),
  node(
    'tavi.moth',
    tavi,
    '“Wood, roofward. Hear that little hum?” He taps the dial beside the moth. “It has found a perfectly good warm seat. Nobody ever connected that coil to a receiver.”',
  ),
  node(
    'tavi.shift',
    tavi,
    '“Siv taught me to splice my first rope. I sent the call while the tow was turning. I can go back at break or when they tie up. A different minute gives me a different crew.”',
  ),
  node(
    'tavi.paint',
    tavi,
    'He writes “home” on a scrap and covers it with his thumb. “I was going to print that she changed her mind. We put the word in her ear before it came back out.” He hands you both takes.',
  ),
  node(
    'dubois',
    dubois,
    'W. E. B. Du Bois slides a black strip between two rows of coloured tickets. “Before somebody draws me a line through these people, I should like to meet the man who chose to count them at the roof.” Tavi offers his ink-stained hands.',
    [
      choice('Give the two stops a row apiece.', 'dubois.rows'),
      choice('Ask whose names belong on a picture.', 'dubois.names'),
      choice('Set the equal-share reel beside the broadcast count.', 'dubois.return', yes('reweighed')),
    ],
    'HIS-WIRE-PARIS',
  ),
  node(
    'dubois.rows',
    dubois,
    'He moves a red ticket from one row to the other. “Look at what changed before you touch the ink. Did a singer get louder, or did a different audience send the slips?” He gives the ticket back to Tavi so the real count survives the demonstration.',
    [],
    'HIS-WIRE-SAMPLING',
  ),
  node(
    'dubois.names',
    dubois,
    '“An exhibition may carry one famous name on its door. The wall has room for the students and other hands who made its pictures.” He leaves Oda space in the programme for the keepers of both reels.',
    [],
    'HIS-WIRE-PORTRAITS',
  ),
  node(
    'dubois.return',
    dubois,
    'He rolls the two strips through the same pair of slots. The roof has lost five points. So has the rail. The mixed count has climbed. “A clear picture owes you the ground on which those people came together.”',
    [],
    'HIS-WIRE-SAMPLING',
  ),
  node(
    'oda.dock',
    oda,
    'At the island horn Oda waits with her hand over the switch. For the first time the crowd can hear the boats without her wife’s recorded kettle underneath them.',
    [
      choice('Offer to take the microphone.', 'oda.cover'),
      choice('Wait four beats beside her.', 'oda.wait'),
      choice('Ask her to show you the reel she is keeping.', 'oda.after', yes('filed')),
    ],
  ),
  node(
    'oda.cover',
    oda,
    'She almost lets go. “Keep a hand on the stand. I want the first word to be mine. The rest of the tune can belong to the ferry.”',
  ),
  node(
    'oda.wait',
    oda,
    'After the fourth beat she names her wife, the earlier recording and the singer’s request for quiet. Someone at the back tries to clap and stops. Oda meets their eyes. “You can clap. She did make a lovely row with that kettle.”',
  ),
  node(
    'oda.after',
    oda,
    'The spool in her pocket is blank. “Next season she may want this back. I saved enough room for an answer and bought a new kettle for myself.”',
  ),
  node(
    'dubois.dock',
    dubois,
    'Du Bois has one foot on the gangway and a ticket at each end of his stick. He wants a line that will still make sense after the ferry has left this audience behind.',
    [
      choice('Read him the invitation for the next shift.', 'dubois.shift', yes('filed')),
      choice('Leave both groups on his ticket.', 'dubois.dockrows'),
    ],
    'HIS-WIRE-PARIS',
  ),
  node(
    'dubois.shift',
    dubois,
    '“Keep the time at which you called. The next reader will need to know who was working then.” He marks a place for the names of those who designed the next hearing.',
    [],
    'HIS-WIRE-SAMPLING',
  ),
  node(
    'dubois.dockrows',
    dubois,
    'He clips the covered and open rows side by side. The ferry lifts a little and the red slips slide under their thumb. Joss catches both ends before one whole row goes into the water.',
    [],
    'HIS-WIRE-PORTRAITS',
  ),
];
const sources: SourceRecord[] = [
  [
    'HIS-WIRE-PARIS',
    'Du Bois in Paris – Exposition Universelle, 1900',
    'Inside Adams, Library of Congress',
    'Terrell, Ellen',
    'https://blogs.loc.gov/inside_adams/2015/02/du-bois-in-paris-exposition-universelle-1900/',
    'The published account identifies the display, chart sets, maps and contributions. The ferry and its listeners are original.',
  ],
  [
    'HIS-WIRE-PORTRAITS',
    'W. E. B. Du Bois’s Data Portraits: Visualizing Black America',
    'Princeton Architectural Press',
    '',
    'https://papress.com/products/w-e-b-du-boiss-data-portraits-visualizing-black-america',
    'The publication credits the visual studies made for the Paris exhibition to Du Bois and the Atlanta University team.',
  ],
  [
    'HIS-WIRE-SAMPLING',
    'Data, Sampling, and Variation in Data and Sampling',
    'Introductory Statistics 2e, OpenStax',
    'Illowsky, Barbara, and Susan Dean',
    'https://openstax.org/books/introductory-statistics-2e/pages/1-2-data-sampling-and-variation-in-data-and-sampling',
    'Sampling designs and limits of convenience samples. Both ferry nights use explicitly fictional counts.',
  ],
].map(([id, title, container, author, url, supports]) => ({
  id,
  title,
  url,
  locator: title,
  supports,
  accessed: '2026-11-28',
  mla: { kind: 'page', title, container, ...(author ? { author } : {}) },
}));
type Job = {
  id: string;
  title: string;
  start: Condition;
  finish: Condition;
  diary: string;
  hints: [string, string, string, string];
  thinking: NonNullable<NonNullable<Objective['weave']>['thinking']>;
};
const loft: Condition = { objective: 'sea.arrival' },
  island: Condition = { objective: 'island.arrival' };
const jobs: Job[] = [
  {
    id: 'voice',
    title: 'Find the two sounds in Oda’s missing verse',
    start: loft,
    finish: yes('reuse'),
    diary: 'I heard the falling lid and matched the two takes. Oda had been keeping an old promise on the air.',
    hints: [
      'A familiar sound has come back to the ferry.',
      'Try the reed winding under the roof and the wood winding over water.',
      'Leave your first question open at both windings. The two listeners remember a falling lid.',
      'At the splice, line up Tuesday’s and Friday’s takes. Listen to what repeats behind the voice.',
    ],
    thinking: { dok: 2, bloom: 'analyse', fink: 'human', solo: 'relational' },
  },
  {
    id: 'leading',
    title: 'Hear what one word does to the painter’s answer',
    start: loft,
    finish: yes('paired.joist'),
    diary: 'I kept the roof painter’s first words beside the answer that followed my own suggestion.',
    hints: [
      'A joist on the roof gives a bright ring.',
      'Turn the glass winding toward the roof and leave the last word open.',
      'Ask that same painter again with “home” already in the question.',
      'Tavi can play both takes back. Notice who first put the word in the recording.',
    ],
    thinking: { dok: 3, bloom: 'analyse', fink: 'application', solo: 'relational' },
  },
  {
    id: 'crowd',
    title: 'Hold the audience still while the song runs',
    start: loft,
    finish: yes('reweighed'),
    diary:
      'I rolled both stop tapes and tried the same mix on both nights. The crowd had changed before the ink dried.',
    hints: [
      'The two colours belong to different places on the boat.',
      'Pin both nights together, then pin the roof and the rail separately.',
      'Give each stop half the space on both nights. This is a new comparison with a fixed audience mix.',
      'Keep all four frames and bind them. Du Bois will look at the two versions with you.',
    ],
    thinking: { dok: 3, bloom: 'evaluate', fink: 'integration', solo: 'extended' },
  },
  {
    id: 'issue',
    title: 'Put an ending on the ferry wire',
    start: loft,
    finish: yes('editionMade'),
    diary: 'I chose a public voice, a frame and a use for the last bar. A new edition went across the water.',
    hints: [
      'The island can receive one edition at a time.',
      'A listener needs to have offered an open-line reading. Look at how they want it credited.',
      'Align both kettle takes and pin the audience frame you want to send.',
      'Choose whether to make a chorus, leave the bar empty or move a horn. A later edition can change the performance.',
    ],
    thinking: { dok: 3, bloom: 'create', fink: 'caring', solo: 'relational' },
  },
  {
    id: 'return',
    title: 'Stay for the second bank’s answer',
    start: { all: [island, done('issue')] },
    finish: yes('everReceived'),
    diary: 'The edition reached the island while the two ferries were tying up.',
    hints: [
      'The island hears what the earlier ferry sent.',
      'Joss keeps an open receiving horn on the dock.',
      'If the horn is waiting, check the edition and its credit at the ferry studio.',
      'Unroll the programme and listen from the gangway and the microphone.',
    ],
    thinking: { dok: 2, bloom: 'apply', fink: 'caring', solo: 'multistructural' },
  },
  {
    id: 'shift',
    title: 'Make room for a crew the first call missed',
    start: { all: [island, done('return')] },
    finish: yes('filed'),
    diary:
      'I made time for a shift that was missing from the slips and left the new hearing beside the old figures.',
    hints: [
      'One quiet receiver belongs to people who were working.',
      'Try the reed winding toward the water with an open question. Keep Siv’s voice at the studio.',
      'Bring the four audience frames to the island, hear the runner and the singer, and choose a time for the slipway.',
      'File the edition with the time of the second hearing. Return to Oda or Du Bois to hear what they kept.',
    ],
    thinking: { dok: 4, bloom: 'create', fink: 'learning-to-learn', solo: 'extended' },
  },
];
export function installFerryRadio(pack: ContentPack) {
  pack.dialogue.push(...talk);
  pack.sources.push(...sources);
  pack.characters.push(
    {
      id: oda,
      name: 'Oda Kett',
      role: 'Ferry singer and sound archivist',
      mode: 'fictional',
      sprite: 'villager-2',
      talk: [{ node: 'wire.oda' }],
    },
    {
      id: tavi,
      name: 'Tavi Pell',
      role: 'Retired splice runner and keeper of the receiving wheel',
      mode: 'fictional',
      sprite: 'villager-1',
      talk: [{ node: 'wire.tavi' }],
    },
  );
  for (const [id, home, away] of [
    [oda, 'wire.oda', 'wire.oda.dock'],
    [dubois, 'wire.dubois', 'wire.dubois.dock'],
  ]) {
    const c = pack.characters.find((c) => c.id === id)!;
    c.localGreeting = { ...c.localGreeting, [radioLoft]: home, [radioDock]: away };
  }
  for (const [i, rows] of [jobs.slice(0, 4), jobs.slice(4)].entries()) {
    pack.missions.push({
      id: i ? 'KG-CH14-RADIO' : 'KG-CH08-RADIO',
      world: i ? 'WORLD-15' : 'WORLD-09',
      title: i ? 'Four beats of quiet' : 'The last word on the water',
      available: i ? { all: [island, done('issue')] } : loft,
      knowledgeQuestion: i
        ? 'What does a public account owe to people who could never answer its first call?'
        : 'What can change when the same two stops are heard as a single audience?',
      stake: i
        ? 'Oda has promised her missing singer a summer of quiet. Joss needs the next shift to hear its own place in the programme.'
        : 'Two ferries have heard the same absent singer. Oda is the only one who knows when the last verse was recorded.',
      objectives: rows.map(
        (j): Objective => ({
          id: 'wire.' + j.id,
          title: j.title,
          essential: false,
          visible: j.start,
          done: j.finish,
          weave: { ...wireTopics(j.id), thinking: j.thinking, minutes: j.id === 'shift' ? 5 : 3 },
          onComplete: [{ journal: 'j.wire.' + j.id }],
        }),
      ),
    });
  }
  for (const j of jobs) {
    pack.journal.push({ id: 'j.wire.' + j.id, text: j.diary, claimKind: 'observation' });
    j.hints.forEach((text, i) =>
      pack.hints.push({
        id: 'h.wire.' + j.id + '.' + i,
        objective: 'wire.' + j.id,
        depth: (i + 1) as Hint['depth'],
        text,
      }),
    );
  }
}
