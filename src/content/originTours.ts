import type {
  Condition,
  ContentPack,
  DialogueNode,
  Effect,
  Hint,
  Objective,
} from '../domain/types';
import {
  originFlag,
  originPlaces,
  origins,
  originWeave,
  scores,
  invitation,
  type Origin,
} from '../domain/originInstruments';

export const workDoors = (o: Origin, away = false) =>
  'origin-' + o + (away ? '-away' : '-home');
export function touringInstrument(id: string) {
  for (const o of origins)
    for (const away of [false, true])
      if (id === workDoors(o, away)) return { o, away };
}
export const keeps: Record<
  Origin,
  { item: string; verb: string; scene: string; source?: string }[]
> = {
  archive: [
    {
      item: 'nexus.public-index.slip',
      verb: 'Follow the painted surrounds to their two dated entries.',
      scene: 'dates',
      source: 'HIS-APH-YIRRKALA-CAPTION',
    },
  ],
  traveller: [
    {
      item: 'nexus.public-welcome.slip',
      verb: 'Unfold the two welcomes beside the island visitor board.',
      scene: 'welcome',
      source: 'REL-WELCOME-01',
    },
  ],
  harbour: [
    {
      item: 'item.handoff-copy',
      verb: 'Set Nellis’s receipt below the waiting crate.',
      scene: 'crate',
    },
  ],
  workshop: [
    {
      item: 'item.copies.wordclip-proof',
      verb: 'Put the two-date wrapper under a fresh ticket.',
      scene: 'wrapper',
    },
  ],
  singer: [
    {
      item: 'item.ember.circle-packet',
      verb: 'Open the earlier notice beside the separate lookout’s slip.',
      scene: 'packet',
    },
    {
      item: 'sign-splinter',
      verb: 'Hang Corvan’s old splinter over the fourth stool.',
      scene: 'splinter',
    },
  ],
};
export function itemNeeded(id: string): Condition {
  return id === 'sign-splinter'
    ? { flag: 'perspective.active', eq: id }
    : { item: id };
}
export function travellerVisible(o: Origin): Condition {
  return {
    any: [
      { flagSet: originFlag(o, 'sent') },
      ...keeps[o].map((k) => itemNeeded(k.item)),
    ],
  };
}
const memories: Record<
  Origin,
  {
    scenes: Record<string, string>;
    idle: string;
    arrival: string;
    initial: string;
    work: string;
    return: string;
    low: string;
    middle: string;
  }
> = {
  archive: {
    scenes: {
      both: 'Bela slips the model under Pens. “My brother will look there. Mina will ask for the school. Can I show you what each of them gets when the bell rings?”',
      kind: '“Models. Yes, I can feel the seam when I hold it.” Bela puts the slip on the shelf her brother built. “Mina never called it a model. She called it our gift.”',
      cross:
        'Bela keeps the slip in School gifts and slides a narrow pointer into Pens. “My brother always said there could only be one original. Wait till he opens the second drawer.”',
      unsure:
        'Bela takes the little spare label out of her mouth. “Can we leave the filing pencil down and let someone try a drawer? I would quite like to be surprised.”',
    },
    idle: 'Bela keeps a tin of bent brass hinges under the model shelf. A pencil mark beside each hinge is the height of a schoolchild who has been back to see the gift.',
    arrival:
      'Bela has travelled with the cabinet to the Cold Store. “I used to think that finding it was the end. Mina wants to know who gets the thing out again.”',
    initial: 'Find out why the model went into School gifts.',
    work: 'Fit a home for the school model and let two visitors look.',
    return: 'Take another turn with Bela in the Cold Store.',
    low: 'An empty drawer tells you where somebody looked.',
    middle:
      'Move the slip or its pointer. A visitor can open only one drawer before the bell.',
  },
  traveller: {
    scenes: {
      earliest:
        'Lio writes the two words in the margin and underlines “on record”. “My sister marched at the back. She kept the entire band together back there. Shall we let her lead once?”',
      both: 'Lio makes two labels hinged like a little brass mouth. “My sister would have pulled the lower one. She always led the music from behind.”',
      test: '“Yes. Ask the feet before we ask the dictionaries.” Lio hauls a little procession out of a travelling case. One figure has a baton and a distinctly bent knee.',
      unsure:
        'Lio knots a cord to each of the words and leaves both ends in your hand. “My sister never finished first. She was the one I watched for.”',
    },
    idle: 'Lio oils the bent knee on a little baton bearer. The hinge squeaks a note their sister would have sung while waiting for the players at the back.',
    arrival:
      'Lio has taken a job announcing arrivals at the Plan Workshop. “There were three firsts in the first five minutes. I almost lost the band announcing the boat.”',
    initial: 'Ask what the clock in Venn’s label actually measures.',
    work: 'Ring two cords at different times in Lio’s procession.',
    return: 'Help Lio place a cue where an island visitor can use it.',
    low: 'The bearer can keep the tune from the back.',
    middle:
      'Advance the clock and change which cord you pull. Look for the porter at the finish.',
  },
  harbour: {
    scenes: {
      write:
        'Tamar writes Fifthday in letters a child can see from the fruit boxes. “A board stays put. The boats keep leaving. Can we send a bit of it downriver?”',
      repeat:
        'Mara calls back “three carts”; Tamar calls back “Fifthday”. A child holds up three empty fingers. “Nobody has told them what it costs. Hand me that boat.”',
      one: '“One caller. I can do that.” Tamar inhales. The ferry bell rings halfway through their breath. “Somebody down there still has to hear me.”',
      unsure:
        'Tamar frees a little tin boat caught under a crate. “It has two holes for pegs. Can we try one crossing before we promise anybody fruit?”',
    },
    idle: 'One edge of Tamar’s tin boat has been rubbed smooth by thumbs. A new peg on its bow is painted apple red.',
    arrival:
      'Tamar is reading the arrivals book on Seagrass Steps. A child is still carrying an empty crate. “Today they want to know who saw it unloaded. Last week I would have handed them my receipt.”',
    initial: 'Trace the three carts back through the fruit seller.',
    work: 'Send a two-peg message to two different people at the quay.',
    return:
      'Find Tamar on Seagrass Steps and decide who can ask for the missing fact.',
    low: 'Two peg holes can carry only two different facts.',
    middle:
      'The loader, family and stallholder face different costs if a fact is missing.',
  },
  workshop: {
    scenes: {
      suspect:
        'Ren writes a question mark beside the wet ticket. “I can live with a suspect. Hesper wants to sit by the door. Will the next ticket stay in its clip?”',
      proven:
        'Ren writes ALWAYS in a large hand. Hesper slides a flat ticket out of the same wet packet. Ren has already signed the notice. “Give me three times round with the clips.”',
      others:
        'Hesper brings another maker’s envelope. The edges were folded in her shop. “She kept all the ticket stubs,” Ren says. “We can still ask what was different.”',
      unsure:
        '“Enough for the next concert, or enough for every concert?” Ren pokes a finger through a punched ticket. “We only have to hang them by the door tonight.”',
    },
    idle: 'Ren keeps a stack of paper tickets flat under an old brass button. One has a seat drawn on it for Hesper, near enough to the door to leave whenever she likes.',
    arrival:
      'Ren found a job in the Trade Hall as the person who keeps the samples other people throw away. “They let me keep a drawer of mistakes. Hesper asked for a ticket to the opening.”',
    initial: 'Ask Hesper which edges she saw lift off the clip.',
    work: 'Open two packets of concert tickets with one setting changed.',
    return: 'Give Ren’s ticket a job in the Trade Hall.',
    low: 'Keep one of the two switches still.',
    middle:
      'The same sheet supplies three tickets per packet. Read the smallest and largest lifts too.',
  },
  singer: {
    scenes: {
      credit:
        'Teodora puts Sefa’s chair on the fourth mark. “I can introduce the line. I want her there to hear whose voice it becomes.”',
      both: '“Three from the family, one from the hills.” She draws a chalk gap between the stools. “Can a listener hear that little bit of chalk?”',
      ask: 'Teodora leaves a stool by the door for the older singers. “You can hear someone arrive in the quiet. You can also hear how long they don’t.”',
      unsure:
        'Teodora taps a heel four times. The last tap is silent. “I love the line from the hills. Some nights I miss the line I do not remember more.”',
    },
    idle: 'Teodora carries four nesting stools. The smallest has a strip of wool under one leg so a child can sit on it without tipping.',
    arrival:
      'At the theatre Teodora has become the person who sets the seats. Sefa sits where the hill line is easy to hear. A worn fourth stool is turned toward the foyer door.',
    initial: 'Find the singer who remembers a different fourth verse.',
    work: 'Give the fourth stool two different entrances.',
    return: 'Set the first beat with Teodora at the theatre door.',
    low: 'Try a rest. The room can answer a rest.',
    middle:
      'Play a second fourth beat. Listen for the person who takes the next entrance.',
  },
};
type ArtifactScene = [string, string, string, string, string];
const readings: Record<string, ArtifactScene> = {
  dates: [
    'A reader wants one maker for both painted surrounds on the two 1963 Yirrkala petitions. Bela has the parliamentary display location on her ticket and a free hinge on the cabinet.',
    'Clip the separate dates where the reader starts.',
    '14 August leads the reader to Dhuwa artists and 28 August to Yirritja artists on the parliamentary record. Bela moves the display location to its own line.',
    'Turn the second leaf toward the Centre’s public history.',
    'The reader can follow Buku-Larrŋgay Mulka Centre’s account from Yirrkala. The dated parliamentary entries remain available when the page is turned.',
  ],
  welcome: [
    'A passenger who has eaten at a Sikh gurdwara in Fremont asks Lio whether the word welcome will help them plan a visit to Saint Meinrad. The slip carries public accounts from both places.',
    'Give the traveller the campus and prayer leaves.',
    'The traveller can plan their walk with the abbey’s tour information and check its separate prayer schedule. The community explains its own Benedictine reason for receiving guests.',
    'Put the Fremont family’s account first.',
    'The reader hears how the Sodhi family connects eating together at langar with equality. Lio keeps a different leaf for Saint Meinrad so its hosts can give their own reasons.',
  ],
  crate: [
    'The crate beside Tamar’s boot has not been opened. Nellis’s copy bears a signature for delivery and an open second line. The fruit seller would like the arrival clerk to sign for three carts as well.',
    'Pass the signature to the arrivals caller.',
    'The caller announces a delivery. A loader goes to count the carts. The empty line stays empty while the family waits.',
    'Let the dock child take the open line to the loader.',
    'The child brings back a place to look and the loader’s name. Tamar keeps the original receipt with the first witness. The count still belongs on another slip.',
  ],
  wrapper: [
    'The wrapper proof has an issue date, a later arrival and a witness’s line. Ren is about to call the date of the concert the date on which the tickets were printed.',
    'Let the receiving date sit beside the door ticket.',
    'The ticket can place a person at the door. Ren leaves the batch date with the paper maker, whose work happened earlier.',
    'Set the printing date under the clean sample.',
    'The sample card now names its printing stage. The old signed arrival still shows when the holder actually got it.',
  ],
  packet: [
    'Two notices repeating the same rumour have arrived at the theatre. The older packet includes an independent signed sighting from the upper landing. Teodora is giving three voices their places in the room.',
    'Put the copies on a single stool and seat the lookout apart.',
    'Two readers share a common line. A third speaks from a different place and names only the upper landing. The last row hears how many witnesses there were.',
    'Let the two copies echo each other before the lookout enters.',
    'The echo grows into a chorus. When the lookout takes a separate entrance the audience can hear exactly where fresh evidence begins.',
  ],
  splinter: [
    'The splinter from Corvan’s old board fits the little sign above the fourth stool. Teodora has promised “the original verse”. The hill singer has never made that claim.',
    'Cover “original” with the old wood until the host names the singer.',
    'Sefa’s village is named before anyone joins the verse. Teodora leaves room in the next programme for another version.',
    'Turn the splinter edge-on and let the missing word show.',
    'The claim stays visible while Teodora explains where she learned the line. A listener offers to ask an older singer without promising what they will remember.',
  ],
};
const sources: Record<string, [string, string]> = {
  dates: ['HIS-APH-YIRRKALA-CAPTION', 'HIS-YIRRKALA-BUKU-HISTORY'],
  welcome: ['REL-WELCOME-03', 'REL-WELCOME-01'],
};
const milestones: Record<
  Origin,
  { decision: string; first: string; second: string }
> = {
  archive: {
    decision: 'Ask Bela where a child would look first.',
    first:
      'I watched Mina open a drawer by the name of her school. The little pen model had one home. A pointer could take another reader there.',
    second:
      'I wheeled the cabinet into the Cold Store. Bela watched the first hand on its handle to see which name that reader would need.',
  },
  traveller: {
    decision: 'Tell Lio which traveller the word describes.',
    first:
      'I rang the paper gate for a runner, a musician and a porter. I could give each one a first place by changing what the cord measured.',
    second:
      'At the island workshop I hung a cue for someone who needed it. Watching from the last seat gave me a different view of the procession.',
  },
  harbour: {
    decision: 'Bring the fruit seller’s promise within earshot of Tamar.',
    first:
      'I sent three facts toward the quay on a boat with two peg holes. The carrier could tell me which promise had missed the crossing.',
    second:
      'At Seagrass Steps I decided who could ask what the receipt left open. The boat came back to my hand with a different job.',
  },
  workshop: {
    decision: 'Bring Hesper’s flat ticket back to the clips.',
    first:
      'Ren let me open packets from one sheet. When I held an edge setting still, I could see how much the other change lifted the paper.',
    second:
      'I took the first measurements to the Trade Hall. Ren let another person decide what a single surviving ticket could tell them.',
  },
  singer: {
    decision: 'Take the hill singer’s line back to the empty stool.',
    first:
      'I played three remembered verses and decided how the fourth beat should sound. Somebody else could hear an entrance in the space I left.',
    second:
      'Teodora and I set a stool at the theatre. Sefa could name her line and the family could still listen for the one they had lost.',
  },
};
export function installOriginTours(pack: ContentPack) {
  // buildPack may assemble several independent campaigns in the same process.
  const firstNeighbours = new Set<string>(
    origins.map((o) => originPlaces[o][2]),
  );
  pack.characters = pack.characters.map((c) =>
    firstNeighbours.has(c.id)
      ? { ...c, localGreeting: { ...c.localGreeting } }
      : c,
  );
  pack.dialogue = pack.dialogue.map((n) =>
    n.id.startsWith('os.')
      ? { ...n, options: n.options?.map((o) => ({ ...o })) }
      : n,
  );
  pack.missions = pack.missions.map((m) =>
    m.id.startsWith('KG-CH1-O-')
      ? { ...m, objectives: m.objectives.map((g) => ({ ...g })) }
      : m,
  );
  const node = (
    id: string,
    speaker: string,
    text: string,
    options: DialogueNode['options'] = [],
    extra: Partial<DialogueNode> = {},
  ): DialogueNode => ({
    id,
    speaker,
    text,
    options,
    historicalLabel: 'fictional-world',
    ...extra,
  });
  for (const o of origins) {
    const old = 'os.' + o,
      key = 'origin-tour.' + o,
      m = memories[o],
      [, away, who] = originPlaces[o],
      q = scores[o];
    const option = { text: q.test + '.', open: 'fieldgame:' + workDoors(o) };
    const exit = { text: 'Fold it away for now.' };
    const oldDrawer = {
      text: {
        archive: 'Ask what Bela keeps beside her hinges.',
        traveller: 'Listen to the bearer’s bent knee.',
        harbour: 'Look at the bright edge on Tamar’s boat.',
        workshop: 'Lift the brass button on the ticket pile.',
        singer: 'Look beneath the fourth stool.',
      }[o],
      next: old + '.done',
    };
    const reflect = pack.dialogue.find((n) => n.id === old + '.reflect')!;
    for (const pick of reflect.options ?? []) {
      const e = pick.effects?.find(
        (e): e is Extract<Effect, { setFlag: string }> =>
          'setFlag' in e && e.setFlag === old + '.choice',
      );
      if (!e) continue;
      pick.next = key + '.choice.' + e.value;
      pack.dialogue.push(
        node(pick.next, who, m.scenes[String(e.value)], [
          option,
          oldDrawer,
          exit,
        ]),
      );
    }
    // Older saves can still return to the original dialogue ids and use the new instrument.
    for (const suffix of ['idle', 'done']) {
      const n = pack.dialogue.find((x) => x.id === old + '.' + suffix)!;
      n.text = m.idle;
      n.options = [{ ...option, if: { flagSet: old + '.choice' } }, exit];
    }
    const lead = pack.characters.find((p) => p.id === who)!;
    lead.localGreeting = { ...lead.localGreeting, [away]: key + '.away' };
    pack.dialogue.push(
      node(key + '.away', who, m.arrival, [
        {
          text: 'Unpack the instrument we sent here.',
          if: { flagSet: originFlag(o, 'sent') },
          open: 'fieldgame:' + workDoors(o, true),
        },
        ...keeps[o].map((k) => ({
          text: k.verb,
          if: itemNeeded(k.item),
          next: key + '.' + k.scene,
        })),
        { text: 'Leave them to the next reader.' },
      ]),
    );
    for (const k of keeps[o]) {
      const [intro, a, one, b, two] = readings[k.scene];
      pack.dialogue.push(
        node(key + '.' + k.scene, who, intro, [
          {
            text: a,
            if: itemNeeded(k.item),
            next: key + '.' + k.scene + '.a',
            effects: [
              { setFlag: originFlag(o, 'book.' + k.scene), value: 'a' },
            ],
          },
          {
            text: b,
            if: itemNeeded(k.item),
            next: key + '.' + k.scene + '.b',
            effects: [
              { setFlag: originFlag(o, 'book.' + k.scene), value: 'b' },
            ],
          },
        ]),
        node(
          key + '.' + k.scene + '.a',
          who,
          one,
          [],
          sources[k.scene] ? { citationSource: sources[k.scene][0] } : {},
        ),
        node(
          key + '.' + k.scene + '.b',
          who,
          two,
          [],
          sources[k.scene] ? { citationSource: sources[k.scene][1] } : {},
        ),
      );
    }
    const mission = pack.missions.find((n) => n.id === 'KG-CH1-O-' + o)!;
    mission.stake = m.idle;
    mission.objectives[0].title = m.initial;
    mission.objectives[2].title = milestones[o].decision;
    const goal = (
      suffix: string,
      title: string,
      visible: Condition,
      flag: string,
    ): Objective => ({
      id: key + '.' + suffix,
      title,
      essential: false,
      visible,
      done: { flagSet: originFlag(o, flag) },
      weave: originWeave[o],
      kq: {
        id:
          o === 'workshop'
            ? 'KQ-NEW-003'
            : o === 'traveller'
              ? 'KQ-NEW-001'
              : o === 'singer'
                ? 'KQ-NEW-002'
                : 'KQ-NEW-006',
        action: suffix === 'pack' ? q.test : q.returnLabels[0],
      },
      onComplete: [{ journal: 'j.' + key + '.' + suffix }],
    });
    const first = goal('pack', m.work, { objective: old + '.o3' }, 'sent'),
      second = goal('tour', m.return, { objective: first.id }, 'returned');
    mission.objectives.push(first, second);
    pack.journal.push(
      {
        id: 'j.' + first.id,
        text: milestones[o].first,
        claimKind: 'observation',
      },
      {
        id: 'j.' + second.id,
        text: milestones[o].second,
        claimKind: 'interpretation',
      },
    );
    for (const [g, hints] of [
      [
        first,
        [
          m.low,
          m.middle,
          invitation[o],
          'After the trials, choose where to send the instrument. Both destinations have someone waiting.',
        ],
      ],
      [
        second,
        [
          m.arrival,
          'The initial send opens a second meeting.',
          m.return,
          'Speak to ' +
            lead.name +
            ' and unpack the instrument. Give one person the first turn.',
        ],
      ],
    ] as const)
      hints.forEach((text, i) =>
        pack.hints.push({
          id: 'h.' + g.id + '.' + i,
          depth: (i + 1) as Hint['depth'],
          objective: g.id,
          text,
        }),
      );
  }
}
