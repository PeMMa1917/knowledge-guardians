// The Spare Moon is a fictional night house in the Nexus. Its bell has two callers.
import type {
  CharacterRecord,
  Condition,
  ContentPack,
  DialogueNode,
  DialogueOption,
  Effect,
  Hint,
} from '../domain/types';

const key = (id: string) => 'spare-moon.' + id;
export const moonHas = (id: string): Condition => ({ flagSet: key(id) });
export const moonIs = (id: string, eq: string): Condition => ({ flag: key(id), eq });
export const moonMissing = (id: string): Condition => ({ not: moonHas(id) });
const mark = (id: string, value: string | true = true): Effect => ({ setFlag: key(id), value });
const remember = (id: string): Effect => ({ journal: 'j.spare-moon.' + id });
const AUDA = 'auda-wick',
  NOLL = 'noll-wick',
  KET = 'ket-ribble';
const leave: DialogueOption = { text: 'Give me a minute.' };

function scene(id: string, speaker: string, text: string, options?: DialogueOption[]): DialogueNode {
  return { id: key(id), speaker, text, historicalLabel: 'fictional-world', options };
}
function act(text: string, next: string, effects?: Effect[], condition?: Condition): DialogueOption {
  return { text, next: key(next), effects, if: condition };
}
function person(
  id: string,
  name: string,
  role: string,
  sprite: string,
  entries: [string, Condition?][],
): CharacterRecord {
  return {
    id,
    name,
    role,
    sprite,
    mode: 'fictional',
    talk: entries.map(([node, condition]) => ({ node: key(node), if: condition })),
  };
}

export const moonLatch: Condition = {
  any: ['knot', 'shutter', 'touch', 'flour', 'played.nexus.bell-loft'].map(moonHas),
};
export const nollKitchenShift: Condition = { all: [{ objective: 'm02.o1.arrive' }, moonMissing('noll')] };
const house = moonHas('house');
const canSettle: Condition = { all: [house, moonMissing('night')] };
const history = moonHas('thimble');
const dialogue: DialogueNode[] = [
  scene(
    'empty-peg',
    'narrator',
    'Two muddy boots are gone from the loft. A streak of flour crosses the floor to the painted moon. Noll’s bow still hangs from its peg. The moon lifts if you slip the tip underneath.',
    [act('Use the bow to follow the flour down the stairs.', 'away', [mark('flour'), remember('flour')]), leave],
  ),
  scene(
    'away',
    'narrator',
    'Warm yeast, hot metal, then the smell of scorching. A voice below says, “I said turn the rolls, Noll. I did not say turn them into little rocks.”',
  ),
  scene(
    'kitchen',
    NOLL,
    'Noll has flour in both eyebrows. “I decided to take breakfast down. Then the host handed me an apron. This one eats the entire top octave of my fiddle.” He has set a plate by the door in case his sister comes.',
  ),
  scene(
    'shade',
    KET,
    '“Corvan sold you one of my paper moons? Good. His first one came out shaped like an onion.” She turns the shade in her hands. “Who are you keeping a light for?”',
    [
      act('For the next person at my door.', 'shade-door', [mark('shade', 'door'), remember('shade-door')]),
      act('For me. I want somewhere I can close the door.', 'shade-me', [
        mark('shade', 'me'),
        remember('shade-me'),
      ]),
      { text: 'I’m still finding a place for it.' },
    ],
  ),
  scene(
    'shade-door',
    KET,
    '“Put it low. You notice a low window first when you’ve walked a long way.” She folds a second little moon from a flour wrapper for her own door.',
  ),
  scene(
    'shade-me',
    KET,
    '“Then hang it where it makes the ceiling look like butter. Best light in the world for reading in bed.” She tilts her own lamp a little toward her chair.',
  ),

  scene(
    'auda',
    AUDA,
    '“Hold this.” Auda puts the bell rope in your palm. Something on the other end gives two small tugs. Both her hands are in sight. “My mum used to do that when she wanted the last boat held. She lives three days upriver now. I had breakfast with her on Tuesday.”',
    [
      act('Hold the wool knot while she lets go.', 'knot', [mark('knot'), remember('knot')]),
      act('Ask why she came back up here.', 'auda-past'),
      leave,
    ],
  ),
  scene(
    'knot',
    AUDA,
    'The high bell hangs still. The wool kicks against your thumb. “Two cords in one sleeve,” Auda murmurs. “Somebody down there can move the small one.” She takes her hand away before you do. Behind the painted moon, a latch lifts.',
  ),
  scene(
    'auda-past',
    AUDA,
    '“When I was eight I told a whole boat we had eleven beds. I counted eleven rings. When they came up the stairs, Mum had one bed and ten people offering blankets. I’ve kept the numbers since.” She rubs the pale band where her thimble used to sit.',
  ),
  scene(
    'noll',
    NOLL,
    'Noll is sawing a fiddle bow across one stretched bootlace. “Save your sympathy for the boot. Listen. The top bell comes back on the beat. Something underneath keeps coming in early.” He stops playing. A bit of blue wool jumps against the wall.',
    [
      act('Steady the shutter and pluck the bootlace.', 'shutter', [mark('shutter'), remember('shutter')]),
      act('Let him play the last bar.', 'noll-past'),
      leave,
    ],
  ),
  scene(
    'shutter',
    NOLL,
    'The shutter falls silent under your hand. Two little knocks still lift the blue wool. Noll misses his next note altogether. “Oh. Somebody waited for me to stop.” His bow slips under the painted moon and catches the latch.',
  ),
  scene(
    'noll-past',
    NOLL,
    '“I used to play over the little knocks. Visitors tipped better when the sad bit went on uninterrupted.” He tunes the bootlace again. “The bit I remember best now is somebody trying to get through it.”',
  ),
  scene(
    'moth',
    'narrator',
    'A Glimmermoth lands on the painted moon. Its wings go dark on the gilt crescent. They shine along the bare lower lip, where a thousand thumbs have rubbed the wood white.',
    [
      act('Run your thumb underneath the bright edge.', 'touch', [mark('touch'), remember('touch')]),
      { text: 'Sit and watch it for a while.' },
    ],
  ),
  scene(
    'touch',
    'narrator',
    'The edge fits your hand. The moon tips outward, like a shop sign turning from CLOSED to OPEN. Behind it somebody has been oiling the hinges. A scrap of blue wool flutters on the stair.',
  ),
  scene(
    'thimble',
    'narrator',
    'A child’s brass thimble hangs inside the little bell. A fish with ridiculous eyelashes is punched into the rim. On the back, in smaller letters, someone added “Auda made the fish. Noll did the lashes.”',
    [
      act('Turn the fish toward the light and put the thimble back.', 'thimble-back', [
        mark('thimble'),
        remember('thimble'),
      ]),
      leave,
    ],
  ),
  scene(
    'thimble-back',
    'narrator',
    'The fish winks once as the thimble turns. An empty hook the same size hangs from Auda’s tool belt.',
  ),
  scene(
    'host',
    KET,
    'A woman in one stocking is ringing the wall with her big toe. The other foot is inside a boot with a loaf rising in it. “Clean boot,” she says. “Door sticks. Welcome to the Spare Moon. Tug means I’ve a place to offer. The hall’s been counting people wanting one. Little difference. About a houseful.”',
    [
      act('Take a watch. Let her get the dough out of her boot.', 'watch', [mark('house'), remember('host')]),
      { text: 'Leave her to the baking for now.' },
    ],
  ),
  scene(
    'watch',
    KET,
    '“Pick what happens when a stranger arrives tonight. Ring the brass fish and the whole street can offer beds. Slip the blue cord and only our hosts feel it. Or open my old bakehouse bench to whoever walks in. I can move the flour.” She sniffs. “I had better move that boot.”',
  ),
  scene(
    'board',
    KET,
    '“Three offers upstairs could all be the same spare bed. One shut door downstairs can look a lot like an empty house. Come and see what we can actually give somebody.” She shows you the fish bell, the blue cord and the hinged flour bench.',
  ),
  scene(
    'offer-bell',
    AUDA,
    'Through the open brass mouth you can hear the street. Anyone can answer it. Anyone can also hear a stranger ask for a bed. Auda has taken off her clerk’s badge.',
    [
      act('Ring the brass fish into the street.', 'ring', [mark('night', 'bell'), remember('bell')], canSettle),
      leave,
    ],
  ),
  scene(
    'ring',
    AUDA,
    'Three windows fly open. One man brings a pillow before he remembers to ask a name. A woman on the stair hears the whole street listening and slips away. Auda gives the pillow to the man to hold. She goes after the woman alone.',
  ),
  scene(
    'offer-cord',
    NOLL,
    'Five loops of blue cord run to five households. A host can answer without identifying a guest. Beyond the fifth loop the cord comes to a clean end.',
    [
      act(
        'Pass the blue cord quietly around the hosts’ wrists.',
        'hush',
        [mark('night', 'cord'), remember('cord')],
        canSettle,
      ),
      leave,
    ],
  ),
  scene(
    'hush',
    NOLL,
    'A bricklayer feels a tug and turns his key without pausing his card game. A guest goes in with her coat still over her face. On the stair someone new waits for a bell nobody is going to ring. Noll nudges the door ajar with his boot.',
  ),
  scene(
    'offer-bench',
    KET,
    'The bench folds down into one good bed. Anybody who can reach it can sleep there. Ket’s flour chest has nowhere else to go tonight.',
    [
      act(
        'Swing down the flour bench and light the window.',
        'hearth',
        [mark('night', 'bench'), remember('bench')],
        canSettle,
      ),
      leave,
    ],
  ),
  scene(
    'hearth',
    KET,
    'The first person in takes off both boots and is asleep before Ket can finish “clean sheet”. The next is still on the step. Ket sits with him, both elbows deep in a bowl. “Since neither of us is going anywhere, do you know how to knead?”',
  ),
  scene(
    'auda-later',
    AUDA,
    'Auda weighs a bundle of undelivered letters. “I know which homes opened. I’d like to see the ones that couldn’t. First I owe the night clerk an honest set of figures.” She folds a letter, unfolds it, then folds it smaller.',
    [
      act(
        'Sit beside her while she signs the correction.',
        'auda-desk',
        [mark('auda', 'desk'), remember('auda-desk')],
        moonMissing('auda'),
      ),
      act(
        'Show her the little fish. Offer to cover her desk until the mail goes.',
        'auda-road',
        [mark('auda', 'road'), remember('auda-road')],
        { all: [history, moonMissing('auda')] },
      ),
      leave,
    ],
  ),
  scene(
    'auda-desk',
    AUDA,
    'She signs in ink, including the row where she used to sleep as a child. Then she rules a new column and leaves it blank. “If we don’t know where they went, we can write that.” Her letter goes with the next carrier.',
  ),
  scene(
    'auda-road',
    AUDA,
    '“Noll did those lashes with a bent nail.” She takes the thimble off the bell, ties on a spare and slips the fish into her pocket. “I can sign my own correction and deliver it.” She heads for the Emberford coach.',
  ),
  scene(
    'desk-return',
    AUDA,
    'A kettle warms the desk. Someone has spilled tea on Auda’s new ledger. She’s laughing. “Yesterday I’d have made them copy the whole page. Today I know who to ask about the missing line.”',
  ),
  scene(
    'road-return',
    AUDA,
    'Auda has mud to the knees and an answer written on a crust of bread. “Della had no paper. Says she lent the blanket even though she couldn’t spare a bed. I nearly ate the evidence.” The fish thimble is warm from her pocket.',
  ),
  scene(
    'noll-later',
    NOLL,
    '“I wrote a tune that leaves a whole bar empty.” Noll tries it. Through the gap you hear a latch click. “I keep filling that bit in if I think anybody’s listening.”',
    [
      act(
        'Keep the empty bar for him in the noisy hall.',
        'noll-hall',
        [mark('noll', 'hall'), remember('noll-hall')],
        moonMissing('noll'),
      ),
      act(
        'Draw a stool up by Ket. Listen together behind the moon.',
        'noll-home',
        [mark('noll', 'home'), remember('noll-home')],
        moonMissing('noll'),
      ),
      leave,
    ],
  ),
  scene(
    'noll-hall',
    NOLL,
    'You lift the bow for one silent beat. Somebody in the hall gives the missing note a magnificent sneeze. Noll bows to the sneezer. Tomorrow he’s bringing the fiddle to the archive entrance.',
  ),
  scene(
    'noll-home',
    NOLL,
    'Ket taps the bench in the gap. A second tap answers. Noll puts the fiddle under his chin again. “I’ll play here. You can join in even if you don’t know the song.”',
  ),
  scene(
    'hall-return',
    NOLL,
    'Two children at the archive entrance have taken to conducting the rests. Noll watches their hands. They keep him waiting a scandalously long time. For once, he lets them.',
  ),
  scene(
    'home-return',
    NOLL,
    'Under the painted moon Noll teaches a sleepless child the tune on two spoons. Each time a host answers the cord they leave that beat for the bell.',
  ),
  scene(
    'ket-bell',
    KET,
    'A whole basket of borrowed pillowcases, and one still has a head in it. Ket hangs a curtain inside the public door. “They can hear it. They don’t have to see who comes in.”',
  ),
  scene(
    'ket-cord',
    KET,
    'Ket is threading a sixth loop through her sleeve. The new guest holds the other end. “Told me my circle of friends was very exclusive. Fair comment.”',
  ),
  scene(
    'ket-bench',
    KET,
    'Ket has baked rolls in the shape of shoes. The person who slept on her flour bench is selling them beside the window so that she can afford a second sack chest.',
  ),
];

const objective = 'spare-moon.keep-watch';
const hintLines = [
  'Look for the little brass fish beside the place you first entered the Archive Hall.',
  'There is more than one way into the night house. Talk to either Wick upstairs, or watch the moth on the sign.',
  'The great hall bell and the smaller callers can move separately. Try Noll’s bootlace, Auda’s knot or the underside of the crescent.',
  'Enter the stair behind the moon, take a watch with Ket, then use the brass fish, blue cord or flour bench in her room. You can stay for the family’s stories afterward.',
];
const memories: Record<string, string> = {
  flour:
    'I found Noll’s bootprints in a dusting of flour. He had gone down to help with breakfast while I was in Emberford. His bow let me follow.',
  'shade-door':
    'I told Ket I wanted the crescent lamp to welcome the next traveller. She folded another crescent for her own door.',
  'shade-me': 'I told Ket I wanted somewhere quiet to read. She turned the lamplight toward her own chair.',

  knot: 'I held Auda’s bell rope. The wool jumped in my hand while the high bell stayed still. Someone was answering from below.',
  shutter:
    'I steadied the shutter while Noll plucked a bootlace. A knock came back early, then waited when we stopped.',
  touch:
    'I watched a Glimmermoth find the bare wood on a painted moon. My thumb found a latch where other hands had worn it smooth.',
  thimble:
    'I turned a tiny brass fish over in the lamplight. Auda made the fish and Noll gave it eyelashes. I left it hanging where it could ring.',
  host: 'Ket let me take a watch at the Spare Moon. The hall had counted offers of beds as people asking for one. I met the person on the other end of that number.',
  bell: 'I rang for the whole street. A man came down with a pillow. A woman left when she heard all those windows open. Auda followed her.',
  cord: 'I passed the blue cord. One guest found a door without giving a name. Another had never been told to wait for a tug.',
  bench:
    'I helped Ket turn her flour bench into a bed. One traveller slept. The next kneaded bread beside her. There was still only one bed.',
  'auda-desk':
    'I sat with Auda while she signed the row that used to count her own family. She stayed to take the next watch.',
  'auda-road':
    'I covered the desk while Auda took her correction to Emberford in person. She carried the fish thimble in her pocket.',
  'noll-hall':
    'I held a silence open in Noll’s tune. He took his fiddle to the hall to see who else would fill it.',
  'noll-home':
    'I listened with Ket while Noll played. The guests could join his song on the furniture. He stayed to teach it.',
};

export const spareMoonContent = {
  characters: [
    person(AUDA, 'Auda Wick', 'Bell keeper and occasional letter carrier', 'smith-hesper', [
      ['road-return', moonIs('auda', 'road')],
      ['desk-return', moonIs('auda', 'desk')],
      ['auda-later', moonHas('night')],
      ['auda'],
    ]),
    person(NOLL, 'Noll Wick', 'Fiddler at the night landing', 'player-c', [
      ['hall-return', moonIs('noll', 'hall')],
      ['home-return', moonIs('noll', 'home')],
      ['noll-later', moonHas('night')],
      ['kitchen', nollKitchenShift],
      ['noll'],
    ]),
    person(KET, 'Ket Ribble', 'Baker and host of the Spare Moon', 'villager-2', [
      ['ket-bell', moonIs('night', 'bell')],
      ['ket-cord', moonIs('night', 'cord')],
      ['ket-bench', moonIs('night', 'bench')],
      ['board', house],
      ['host'],
    ]),
  ],
  dialogue,
  journal: Object.entries(memories).map(([id, text]) => ({
    id: 'j.spare-moon.' + id,
    text,
    claimKind: 'observation' as const,
  })),
  missions: [
    {
      id: 'KG-CH1-SPARE-MOON',
      world: 'WORLD-01',
      title: 'The Spare Moon',
      available: moonHas('entered'),
      stake:
        'Auda’s figures may close the night house where she once slept. Ket still has to find somebody a bed tonight.',
      knowledgeQuestion: 'Who can tell us what a count of signals actually measures?',
      objectives: [
        {
          id: objective,
          title: 'Take a watch at the Spare Moon and decide how a stranger can find a bed.',
          essential: false,
          done: { all: [moonLatch, moonHas('night')] },
          weave: {
            concepts: ['evidence', 'explanation', 'interpretation', 'perspective', 'values', 'responsibility'],
            framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'],
            atl: ['thinking', 'social'],
            aoks: ['ART', 'HUM', 'MAT', 'POL'],
            subjects: ['music', 'math-ai', 'global-politics'],
            minutes: 6,
            thinking: { dok: 3, bloom: 'evaluate', fink: 'human', solo: 'relational' },
          },
        },
      ],
    },
  ],
  hints: hintLines.map((text, i) => ({
    id: 'h.spare-moon.' + (i + 1),
    objective,
    depth: (i + 1) as Hint['depth'],
    text,
  })),
} satisfies Partial<ContentPack>;
