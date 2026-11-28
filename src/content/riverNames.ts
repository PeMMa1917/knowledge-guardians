import { transmissionDone } from '../domain/riverPostmark';
import { namesLane, namesQuay, riverTopics, sourceWords, sources } from '../domain/riverNames';
import type { Condition, ContentPack, DialogueNode, Hint, Objective, Weave } from '../domain/types';

export const riverPeople = {
  emlet: 'river-emlet',
  rialla: 'river-rialla',
  pendlow: 'river-pendlow',
} as const;
const prefix = 'rivernames.';
const flag = (key: string, value: string | boolean | number = true): Condition => ({
  flag: prefix + key,
  eq: value,
});
const seen = (map: string): Condition => ({ flag: 'visited.map.' + map, eq: true });
const all = (...terms: Condition[]): Condition => ({ all: terms });
const choose = (text: string, next: string, condition?: Condition) => ({
  text,
  next: prefix + next,
  if: condition,
});
function line(
  id: string,
  who: keyof typeof riverPeople,
  text: string,
  options: DialogueNode['options'] = [],
  citationSource?: string,
): DialogueNode {
  return {
    id: prefix + id,
    speaker: riverPeople[who],
    text,
    options,
    historicalLabel: 'fictional-world',
    citationSource,
  };
}
const lines = [
  line(
    'emlet',
    'emlet',
    'A bite of fresh bread has gone from the corner of your letter. Emlet slips his thumb into the mark. “Too small to be mine. That settles my defence.” He has been kneeling all morning beside a burnt oven. The bricks are warm.',
    [
      choose('Break the crust and give him half.', 'emlet.share'),
      choose('Hold the envelope against the brick.', 'emlet.oven'),
      choose('Show Emlet his low-water thread.', 'emlet.low', flag('walked.ebb')),
    ],
  ),
  line(
    'emlet.share',
    'emlet',
    'He puts the bigger half back in your hand. “I used to bring a loaf here for a woman who never answered me. The day I stopped coming, she knocked on my door with the heels of seven loaves. She had been saving mine for me.”',
  ),
  line(
    'emlet.oven',
    'emlet',
    'The ink has run only downwards. “Most days the bailiff files my bakery under Ruins. That saves me a good deal on advertising.” Emlet looks under the arch. Someone down there is beating three eggs against a bowl.',
  ),
  line(
    'emlet.low',
    'emlet',
    'Emlet finds a little lozenge of mud where his last stitch touched the arch. “That was her boat coming up to meet me. I thought I had made the walk all by myself.”',
  ),
  line(
    'rialla',
    'rialla',
    'Rialla has painted an eye on the stamp handle. “It can watch the queue while I go home.” She has her coat on already. A patient child in a flour bag is asleep against her knees.',
    [
      choose('Sit with the child a moment.', 'rialla.child'),
      choose('Turn the stamp over before she uses it.', 'rialla.stamp'),
      choose('Tell her about the second shore.', 'rialla.high', flag('walked.flood')),
    ],
  ),
  line(
    'rialla.child',
    'rialla',
    '“He only sleeps if the boat is tied up. I leave a basket of undelivered parcels beside him. Then people think we are at work and let us sit.” She draws the flour bag closer when the wind comes through the wall.',
  ),
  line(
    'rialla.stamp',
    'rialla',
    '“The council wants one brass dot. Here is where Emlet brings the bread. There is where I receive the letters. See this little space in between? That is where my sister lives.” She lays her palm over it.',
  ),
  line(
    'rialla.high',
    'rialla',
    '“When I was small, I called both those places Warm Mouth. Emlet swore one of us had it wrong. We were speaking the names at different hours.” She unscrews the eye from the stamp. With one dry thumb it makes a decent swivel.',
  ),
  line(
    'pendlow',
    'pendlow',
    'Pendlow steers her oven with a peel in one hand. At the top of her apron she has stitched a tiny pillow. A silver skate lies on it, its fins powdered with flour. “Lost its family to a baker. Or found one. Depends who you ask.”',
    [
      choose('Make a warm place for the skate.', 'pendlow.skate'),
      choose('Ask what can go on the public map.', 'pendlow.home'),
      choose('Let her see the mark the walkers changed.', 'pendlow.joint', flag('everJoint')),
    ],
  ),
  line(
    'pendlow.skate',
    'pendlow',
    'Pendlow puts the skate against your cuff. It swims along the line of warm air from her oven. “Ask it where the heat is if you get lost. It cannot tell you whose house you’re outside. In fairness, neither can a loaf.”',
  ),
  line(
    'pendlow.home',
    'pendlow',
    '“Everybody knows where to knock for a hot meal. That is how I like it. After supper I put up a curtain. Last spring someone printed the place where I sleep. They had meant to send thanks.”',
  ),
  line(
    'pendlow.joint',
    'pendlow',
    'She wipes both sets of footprints clean of crumbs. “Good. A person can move one without having to scrape the other off.” She gives you the bit of crust she bit from your letter and looks almost solemn.',
  ),
  line(
    'emlet.return',
    'emlet',
    'Emlet has a strip of sealing wax on the back of his neck. He thought the child had put it there for luck. She was posting him home.',
    [
      choose('Ask who waited outside the shutter.', 'emlet.return.window', flag('received', 'window')),
      choose('Stay while the guide eats.', 'emlet.return.walk', flag('received', 'walk')),
      choose('Touch the twice-crossed stamp.', 'emlet.return.district', flag('received', 'district')),
    ],
  ),
  line(
    'emlet.return.window',
    'emlet',
    '“The last shift missed us.” Emlet knocks from the inside. A hand on the other side knocks back. “I could leave a soup pot here. She’d still have to find someone for the letter.”',
  ),
  line(
    'emlet.return.walk',
    'emlet',
    'He opens his mouth to hurry the guide. Then he sees Rialla eating the first hot thing she has had all day. “Shall I walk one?” She gives him her thimble.',
  ),
  line(
    'emlet.return.district',
    'emlet',
    'Two blue stamps overlap on the letter. “Nine people knew how to get that here. Two people knew when. Next time I shall bring one of those two a chair.”',
  ),
  line(
    'rialla.return',
    'rialla',
    '“It is quite a talent to be filed under Ruins and still owe the flour man.” Rialla leans her stamp against a bollard. “Come listen to what people had to do for the packet.”',
    [
      choose('Look for a coat with a flour thumb.', 'rialla.bread', flag('portion', 'bread')),
      choose('Wait for someone to read the signature.', 'rialla.post', flag('portion', 'post')),
      choose('Give the relief walker a minute.', 'rialla.guide', flag('portion', 'guide')),
    ],
  ),
  line(
    'rialla.bread',
    'rialla',
    '“I had written ‘delivered’ when the first bag went down the steps. That coat only got its share when the runner came back. I am adding a second time.”',
  ),
  line(
    'rialla.post',
    'rialla',
    'Rialla holds the grandmother’s letter at her shoulder so the boy can see the old way of joining the letters. “He knows who to write to now. I would not have seen that in a count of envelopes.”',
  ),
  line(
    'rialla.guide',
    'rialla',
    'The new guide takes a wrong turn, finds his own boot print and comes back laughing. “My father used to call that signing a street.” Rialla moves her own stool by the river.',
  ),
  line(
    'pendlow.return',
    'pendlow',
    'Pendlow has tied her boat with a bow that a child could undo. “I have to be able to move it. Ask me here tomorrow and I will tell you where the river put my door.”',
    [
      choose('Ask who ought to hold the pencil next time.', 'pendlow.council', flag('source.partners')),
      choose('Give back the bit of crust.', 'pendlow.bit'),
    ],
  ),
  line(
    'pendlow.council',
    'pendlow',
    '“I can tell you what our house permits. Ask Rialla about the walk. Ask the people at the other quay about the stairs.” Pendlow hands the pencil to the neighbour who will have to climb them. The council sets another place.',
  ),
  line(
    'pendlow.bit',
    'pendlow',
    '“You kept that?” Pendlow sets the crumb under the old oven brick. The little skate noses it away. For a moment the quay smells exactly like coming home.',
  ),
];
type Goal = {
  id: string;
  title: string;
  gate: Condition;
  done: Condition;
  topic: keyof typeof riverTopics;
  thinking: NonNullable<Weave['thinking']>;
  memory: string;
  hints: [string, string, string, string];
};
const lane = seen(namesLane),
  quay = seen(namesQuay);
const goals: Goal[] = [
  {
    id: 'walks',
    title: 'Deliver at two tides',
    gate: lane,
    done: all(flag('walked.ebb'), flag('walked.flood')),
    topic: 'walk',
    thinking: { dok: 2, bloom: 'apply', fink: 'application', solo: 'multistructural' },
    memory:
      'I took the same packet to two different landings. At each arrival the oven boat met my thread.',
    hints: [
      'Where would a boat oven go as the water rises?',
      'Lay adjacent stitches from the West Rope. The old oven receives bread at low water and the red shutter at high water.',
      'Call the little skate if a stitch runs wet. It shows a dry next step or where to undo a stitch.',
      'Try West Rope, Reed Stair, Stone Lip, Old Oven at low water. At high water take Lower Walk, Ferry Ring, Red Window. Walk each thread with its owner.',
    ],
  },
  {
    id: 'pencils',
    title: 'Leave the pencil with both walkers',
    gate: lane,
    done: flag('everJoint'),
    topic: 'rights',
    thinking: { dok: 3, bloom: 'create', fink: 'human', solo: 'relational' },
    memory:
      'Emlet and Rialla each changed the same proposal at their own tide. The resulting address had room for both of their accounts.',
    hints: [
      'Listen to each walker after their delivery.',
      'Put a proposal on the table at low water and see what Emlet does to it.',
      'At high water ask Rialla about the same proposal. A single dot can survive as one morning’s evidence.',
      'Offer a loose thread to both, or ask them to swivel a pair of tide slips. Their signatures belong to the walks they made.',
    ],
  },
  {
    id: 'smallblock',
    title: 'Find who is left inside the stamp',
    gate: lane,
    done: flag('compared.block'),
    topic: 'map',
    thinking: { dok: 3, bloom: 'analyse', fink: 'integration', solo: 'relational' },
    memory:
      'I kept the same block on the stamp. A high-water reading left one possible door where at low water I had counted two.',
    hints: [
      'Rialla can hide a name and still publish a recognisable address.',
      'Set the stamp to the block and try it with someone on the quay.',
      'Keep the same block. Pull the rope to the other tide and ask again.',
      'At low water the block held the old oven and Saffron Door. At high water only Saffron Door receives household bread there.',
    ],
  },
  {
    id: 'placename',
    title: 'Carry a name from a dot to a walk',
    gate: lane,
    done: all(flag('source.names'), flag('source.plan'), flag('refusedPin'), flag('everJoint')),
    topic: 'reading',
    thinking: { dok: 3, bloom: 'analyse', fink: 'integration', solo: 'relational' },
    memory:
      'I set the Inuit Heritage Trust place-name programme beside the Kitikmeot Heritage Society’s account of language work, then took a locally refused pin back to our two walkers.',
    hints: [
      'Unfold the two separate northern source leaves.',
      'Try the brass pin with the high-water walker. She can keep one person’s placement in their own account.',
      'Try a mark she can change. Pass it to the other walker too.',
      'Compare what the fictional route lets its owners do with what the two named organisations say about their own work.',
    ],
  },
  {
    id: 'mapmakers',
    title: 'Give both mapmakers a hand on the public layer',
    gate: all(lane, flag('source.names')),
    done: all(flag('source.names'), flag('everJoint'), flag('compared.block'), flag('applied')),
    topic: 'reading',
    thinking: { dok: 4, bloom: 'create', fink: 'integration', solo: 'extended' },
    memory:
      'I traced the setting of the Inuit Heritage Trust’s map work and then gave our two fictional local mapmakers control of their contributions. The signed service address left the sleeping place off the public layer.',
    hints: [
      'The place names leaf distinguishes documentation from a later official decision.',
      'Walk the low and high rounds. Let both participants change the proposed geometry.',
      'Test what information the block and the tide reveal even with the name removed.',
      'Post one of the arrangements the walkers agreed to. The fictional town governs its own mark.',
    ],
  },
  {
    id: 'partners',
    title: 'Give the return council its own seat',
    gate: all(quay, flag('everReceived')),
    done: all(flag('source.partners'), flag('everJoint'), flag('council.sat')),
    topic: 'rights',
    thinking: { dok: 4, bloom: 'evaluate', fink: 'learning-to-learn', solo: 'extended' },
    memory:
      'I brought the credited co-learning account to the other quay and heard Pendlow give the returning neighbour the pencil. The people who made the first address could not sign for the people receiving it.',
    hints: [
      'The source fold names three authors and their setting.',
      'Let both walkers shape a local edition. Take that edition to the other quay.',
      'There, ask the neighbour who has to carry the next basket to revise your first round.',
      'Invite that person to the table. Their decision applies to this fictional quay. The authors’ account keeps its own place and attribution.',
    ],
  },
  {
    id: 'rack',
    title: 'Feel the other end with Kunit’s coast piece',
    gate: all(lane, { objective: 'turning.kunit.received' }),
    done: flag('felt.both'),
    topic: 'reading',
    thinking: { dok: 3, bloom: 'apply', fink: 'application', solo: 'relational' },
    memory:
      'I used Kunit’s earned Tunumiit coast piece beside our original rack. My left and right changed when I turned the rack. The neighbouring notch stayed in the same relation to the smooth edge.',
    hints: [
      'The coast piece has its own quest at Lantern House.',
      'Earn the coast piece, put it in your satchel and equip it.',
      'Visit the two hand stops beside the lane thread. Feel the near end.',
      'Turn the rack and feel the far end. The trial is about this local model. The real source credits Kunit of Umivik.',
    ],
  },
  {
    id: 'issue',
    title: 'Choose a public address the walkers can use',
    gate: all(lane, flag('everJoint')),
    done: flag('applied'),
    topic: 'rights',
    thinking: { dok: 3, bloom: 'evaluate', fink: 'caring', solo: 'relational' },
    memory:
      'I chose how a stranger could get something delivered and who had to give their time or disclose a place to make that work.',
    hints: [
      'Compare what the same block reveals at both tides.',
      'Ask each walker to sign a thread or a pair of slips.',
      'A red shutter can be open to everybody. A guide can keep a changing route by invitation.',
      'For a district sack, also take a district-scale reading. Any arrangement can be revised. Carry the sealed packet to the Water Commons.',
    ],
  },
  {
    id: 'postmark',
    title: 'Hear what travelled with the folded word',
    gate: all(quay, flag('applied')),
    done: all(flag('source.plan'), transmissionDone),
    topic: 'reading',
    thinking: { dok: 4, bloom: 'evaluate', fink: 'integration', solo: 'extended' },
    memory:
      'Two slips carried the same words. After I added the hand sign, a reader who had walked each route could recover both destinations. A visitor holding exactly the same fold still needed someone to interpret it. The regional language plan I read named work that a paper record alone could not do.',
    hints: [
      'At the oven’s little press, an apprentice can walk beside Emlet and Rialla at their respective tides.',
      'Send the spoken name on its own. At the receiving foil try a low and a high slip. Both point to two possible landings.',
      'Back at the oven add the hand sign and leave the public address off. Send that fold.',
      'At the receiving foil let the apprentice and a first-time visitor read both tides. The Kitikmeot Heritage Society source leaf explains its own work with immersion, mentoring and reference resources.',
    ],
  },
  {
    id: 'quay',
    title: 'Stay for the first round at the other quay',
    gate: all(quay, flag('applied')),
    done: flag('everPortioned'),
    topic: 'rights',
    thinking: { dok: 4, bloom: 'create', fink: 'caring', solo: 'extended' },
    memory:
      'I followed the address to another quay. The arrangement made a different person wait, deliver or offer a hand.',
    hints: [
      'Seal and carry the packet from the oven.',
      'Look for the forwarding door at the Old Weir.',
      'Visit the receiving place for your edition.',
      'Decide where the first basket or the guide’s first break will go. Listen for the people who still have work to do.',
    ],
  },
];
export function installRiverNames(pack: ContentPack) {
  pack.dialogue.push(...lines);
  for (const [id, name, role, sprite] of [
    [
      'emlet',
      'Emlet Garth',
      'Bread runner, retired postman and part-time flour buyer',
      'custom:brown.grey.woad.sand.scarf.gold.bun.lightframes.none',
    ],
    [
      'rialla',
      'Rialla Mallow',
      'Letter sorter, boat pilot and Pendlow’s sister',
      'custom:brown.black.teal.wine.scarf.gold.curls.none.none',
    ],
    [
      'pendlow',
      'Pendlow Mallow',
      'Boat baker, mooring keeper and carer for the oven skate',
      'custom:tan.black.teal.sand.scarf.gold.covered.none.none',
    ],
  ] as const)
    pack.characters.push({
      id: riverPeople[id],
      name,
      role,
      sprite,
      mode: 'fictional',
      talk: [{ node: prefix + id }],
      localGreeting: { [namesLane]: prefix + id, [namesQuay]: prefix + id + '.return' },
    });
  pack.sources.push(
    {
      id: sources.names,
      title: 'Traditional Place Names Program',
      url: 'https://www.ihti.ca/traditional-place-names',
      locator: 'Programme goals and the 2014 update of Nunavut, Where We Live and Travel',
      supports:
        'The Inuit Heritage Trust distinguishes documenting, making available and formally recognizing names. It identifies the named 2014 map update and the work of Elders, language experts and other contributors.',
      accessed: '2026-11-28',
      mla: {
        kind: 'page',
        author: 'Inuit Heritage Trust',
        title: 'Traditional Place Names Program',
        container: 'Inuit Heritage Trust',
      },
    },
    {
      id: sources.plan,
      title: 'Inuinnaqtun Language Development Plan',
      url: 'https://www.kitikmeotheritage.ca/inuinnaqtunlanguageplan',
      locator: 'Beginning the plan in 2022 and its areas of work',
      supports:
        'The Kitikmeot Heritage Society describes immersion, mentor-apprentice work, grammar and dictionary resources among its regionally led activities.',
      accessed: '2026-11-28',
      mla: {
        kind: 'page',
        author: 'Pitquhirnikkut Ilihautiniq',
        title: 'Inuinnaqtun Language Development Plan',
        container: 'Kitikmeot Heritage Society',
      },
    },
    {
      id: sources.partners,
      title: 'Two-Eyed Seeing and other lessons learned within a co-learning journey',
      url: 'https://doi.org/10.1007/s13412-012-0086-8',
      locator: 'Abstract, pp. 331–340, published 16 August 2012',
      supports:
        'Bartlett and the Marshalls discuss co-learning, Two-Eyed Seeing and a council of willing and knowledgeable participants. The game’s river, characters and decisions are original fiction.',
      accessed: '2026-11-28',
      mla: {
        kind: 'page',
        author: 'Bartlett, Cheryl, et al.',
        title:
          'Two-Eyed Seeing and Other Lessons Learned within a Co-Learning Journey of Bringing Together Indigenous and Mainstream Knowledges and Ways of Knowing',
        container: 'Journal of Environmental Studies and Sciences',
        publication: { volume: '2', issue: '4', year: '2012', pages: '331–40' },
      },
    },
  );
  pack.cards.push({
    id: 'card.river-names.iht',
    title: 'Nunavut, Where We Live and Travel, 2014 update',
    historicalLabel: 'documented',
    claimKind: 'observation',
    sources: [sources.names],
    text: sourceWords.names,
    limits:
      'This public programme identifies a particular digital edition. The two fictional oven landings belong to the game.',
  });
  for (const district of ['sea', 'water'] as const) {
    const selected = goals.filter(
      (g) => ['partners', 'quay', 'postmark'].includes(g.id) === (district === 'water'),
    );
    const objectives = selected.map((g): Objective => {
      const id = prefix + g.id;
      pack.journal.push({ id: 'j.' + id, text: g.memory, claimKind: 'interpretation' });
      pack.hints.push(
        ...g.hints.map(
          (text, i): Hint => ({
            id: 'h.' + id + '.' + (i + 1),
            objective: id,
            depth: (i + 1) as Hint['depth'],
            text,
          }),
        ),
      );
      return {
        id,
        title: g.title,
        visible: g.gate,
        essential: false,
        done: g.done,
        onComplete: [{ journal: 'j.' + id }],
        weave: { ...riverTopics[g.topic], thinking: g.thinking, minutes: g.id === 'quay' ? 5 : 3 },
      };
    });
    pack.missions.push({
      id: 'KG-RIVER-NAMES-' + district,
      world: district === 'sea' ? 'WORLD-09' : 'WORLD-12',
      title: district === 'sea' ? 'The oven with two addresses' : 'The letter that ate its envelope',
      available: district === 'sea' ? lane : quay,
      stake:
        district === 'sea'
          ? 'Fresh bread is coming from an oven that burnt down nine winters ago. A public address could feed the queue and put a stranger at Pendlow’s sleeping door.'
          : 'The first edition has arrived. Someone still has to deliver a meal, fetch the letter and give the guide time for supper.',
      knowledgeQuestion:
        district === 'sea'
          ? 'Who can decide what a name makes visible?'
          : 'How far can one group’s agreement speak for people at another landing?',
      objectives,
    });
  }
}
