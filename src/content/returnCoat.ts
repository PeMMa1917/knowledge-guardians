import sites from './return-coat-sites.json';
import objects from './return-coat-keepsakes.json';
import type {
  Condition,
  ContentPack,
  DialogueOption,
  Effect,
  Objective,
  Weave,
} from '../domain/types';

type Ending = 'hook' | 'book' | 'stage';
export const coatEndings: Ending[] = ['hook', 'book', 'stage'];
const key = (id: string) => 'returned-coat.' + id;
export const coatFlag = (id: string): Condition => ({ flagSet: key(id) });
const once = (id: string): Effect => ({ setFlag: key(id), value: true });
export const coatPolicy = (name: Ending): Condition => ({
  flag: key('policy'),
  eq: name,
});
export const coatPass: Condition = {
  any: [coatFlag('lining'), coatPolicy('hook')],
};
const hearing: Condition = {
  any: [
    { all: [coatFlag('hem'), coatFlag('book')] },
    { all: [coatFlag('book'), coatFlag('lining')] },
    { all: [coatFlag('hem'), coatFlag('lining')] },
  ],
};
const endings: Record<
  Ending,
  {
    label: string;
    first: string;
    next: string;
    voices: [string, string];
    diary: string;
  }
> = {
  hook: {
    label: 'Leave the dry peg within reach from the quiet side.',
    voices: ['warden-ise', 'kip-arden'],
    first:
      'Ise takes her name book off the inside hook. “Count the coats at closing. We can afford to lose a coat.” A small hand reaches out, feels the brass and disappears. She keeps her stool turned away.',
    next: '“I still want my fare back.” Kip sticks his crooked pear to the disputed slip. “Just leave whoever wore the other one out of my argument.” The quiet side of the Nexus rack swings open.',
    diary:
      'I gave the quiet side of the cloakroom a dry peg. Kip kept his own claim on the disputed fare.',
  },
  book: {
    label: 'Put a named guarantor beside each disputed fare.',
    voices: ['warden-ise', 'scholar-sefa'],
    first:
      '“Mine first.” Ise signs on the new guarantor line. Kip takes his fare back himself. The next worker gets a dry coat by leaving a name with the clerk. Someone at the end of the queue goes home in the rain.',
    next: 'Sefa hears the little hesitation before that last person leaves. “Let me keep the book one evening,” she asks. “I know how to wait without filling the silence.” The signing desk opens for a new shift.',
    diary:
      'I opened a guarantor’s line. Kip recovered the fare, and another worker still had to decide whether to give a name.',
  },
  stage: {
    label: 'Give the wardrobe its own paid part in the show.',
    voices: ['optics-nim', 'kip-arden'],
    first:
      'Nim hangs both red coats on one actor. The first laugh buys a spool of thread. The first paid show buys a dry coat. Nobody puts a borrower’s name on the cast list. For the nights when the troupe is away the tin is still empty.',
    next: '“I could play the pear,” says Kip. “Only until the first ferry.” He pockets his fare. Nim paints an entrance mark low enough for a small person and gives the rain operator a bow.',
    diary:
      'I made wardrobe work a paid part of the show. The thread tin filled tonight. The troupe will eventually be somewhere else.',
  },
};
const duties: Record<Ending, { label: string; actor: string; line: string }> = {
  hook: {
    label: 'Pass a dry sleeve through without asking for a name.',
    actor: 'kip-arden',
    line: 'You wait for the hand to close on the cuff before you let go. A copper button comes back instead of a name. Kip drops it in the stock jar. One more coat out. One good button for the next repair.',
  },
  book: {
    label: 'Take a shift as guarantor for an uncollected coat.',
    actor: 'warden-ise',
    line: 'You sign the second line. The clerk returns a brass bit without writing anything extra about the wearer. Ise picks up the closing shift. Whoever made the guarantee will have to return if the box comes up short.',
  },
  stage: {
    label: 'Work the rain while the wardrobe keeper takes the bow.',
    actor: 'optics-nim',
    line: 'You squeeze the bulb on the keeper’s nod. Three drops, then an unexpected fourth from the wet cuff. Nim lets the keeper catch that last one. A ticket lands in the thread tin.',
  },
};
export function installReturnCoat(pack: ContentPack) {
  function node(
    id: string,
    speaker: string,
    text: string,
    options?: DialogueOption[],
    effects?: Effect[],
    next?: string,
  ) {
    pack.dialogue.push({
      id: key(id),
      speaker,
      text,
      historicalLabel: 'fictional-world',
      ...(options ? { options } : {}),
      ...(effects ? { effects } : {}),
      ...(next ? { next: key(next) } : {}),
    });
  }
  function journal(id: string, text: string) {
    const ref = 'j.' + key(id);
    pack.journal.push({ id: ref, text, claimKind: 'interpretation' });
    return { journal: ref };
  }
  function dest(
    label: string,
    id: string,
    condition?: Condition,
  ): DialogueOption {
    return {
      text: label,
      next: key(id),
      ...(condition ? { if: condition } : {}),
    };
  }
  for (const site of sites) {
    const sid = site.id;
    const props = objects.filter((x) => x.site === sid);
    const voice = site.speaker;
    const options: DialogueOption[] = [
      ...site.trials.map(([id, , label]) => dest(label, sid + '.' + id)),
      dest(
        'Decide how the next coat will reach its wearer.',
        'hearing',
        hearing,
      ),
      ...objects
        .filter((x) => x.receiver === sid)
        .map((o) => dest(o.offer, 'reply.' + o.id, coatFlag('used.' + o.id))),
      dest(
        'Hear the two people living with the arrangement.',
        sid + '.after',
        coatFlag('policy'),
      ),
      { text: 'Let the people here get on with their shift.' },
    ];
    node(
      sid + '.start',
      'narrator',
      site.opening,
      undefined,
      [
        once('opened'),
        once(sid + '.met'),
        journal(
          sid + '.met',
          'I found ' + site.name.toLowerCase() + '. ' + site.clue,
        ),
      ],
      sid + '.work',
    );
    node(sid + '.work', voice, site.returnLine, options);
    for (const [id, kind, , speaker, line, entry] of site.trials) {
      node(sid + '.' + id, speaker, line, undefined, [
        once(kind),
        once(sid + '.trial'),
        once(sid + '.tried.' + id),
        journal(sid + '.' + id, entry),
      ]);
    }
    const clue = key(sid + '.clue');
    pack.clues!.push({
      id: clue,
      name: site.name,
      text: site.clue,
      earnedViewsOnly: true,
      views: props.map((o) => ({
        keepsake: o.id,
        label: o.use,
        text: o.reading,
        effects: [
          once(o.kind),
          once('used.' + o.id),
          journal(
            'used.' + o.id,
            'I used ' +
              pack.keepsakes!.find((k) => k.id === o.id)!.name.toLowerCase() +
              '. ' +
              o.reading,
          ),
        ],
      })),
    });
    for (const o of props) {
      node('reply.' + o.id, o.speaker, o.reply, undefined, [
        once('reply.' + o.id),
        journal(
          'reply.' + o.id,
          'I carried what I found to the other end of the clothesline. ' +
            o.reply,
        ),
      ]);
    }
    node(
      sid + '.after',
      'narrator',
      'The red coat has moved since the last shift. See what happened at this end of the clothesline.',
      coatEndings.map((e) =>
        dest(duties[e].label, sid + '.after.' + e, coatPolicy(e)),
      ),
    );
    for (const e of coatEndings) {
      node(
        sid + '.after.' + e,
        voice,
        site.callbacks[e],
        undefined,
        [
          once(sid + '.worked.' + e),
          journal(
            sid + '.worked.' + e,
            'I took a later shift at ' +
              site.name.toLowerCase() +
              '. ' +
              site.callbacks[e],
          ),
        ],
        'duty.' + e,
      );
    }
    const weave: Weave = {
      concepts: site.concepts as Weave['concepts'],
      framework: site.framework as Weave['framework'],
      aoks: site.aoks as Weave['aoks'],
      subjects: site.subjects,
      atl: ['thinking', 'communication'],
      thinking: {
        bloom: 'analyse',
        dok: 2,
        solo: 'relational',
        fink: 'application',
      },
    };
    const objective = (
      suffix: string,
      title: string,
      done: Condition,
      step: Weave,
      question: string,
    ): Objective => ({
      id: key(sid + '.' + suffix),
      essential: false,
      title,
      done,
      visible: coatFlag(sid + '.met'),
      weave: step,
      kq: { id: question, action: 'coat-' + sid + '-' + suffix },
    });
    const objectives = [
      objective(
        'witness',
        'Try one account of the wet coat at ' + site.name.toLowerCase() + '.',
        coatFlag(sid + '.trial'),
        weave,
        'KQ-ROUTE-25',
      ),
      objective(
        'consequence',
        'Take a shift under the arrangement you chose.',
        { any: coatEndings.map((e) => coatFlag(sid + '.worked.' + e)) },
        {
          ...weave,
          thinking: {
            bloom: 'apply',
            dok: 2,
            solo: 'relational',
            fink: 'human',
          },
        },
        'KQ-ROUTE-07',
      ),
    ];
    // Each specific trial is credited only when the player performs that operation.
    for (const [id, , label, , , entry] of site.trials) {
      const trial = objective(
        id,
        label,
        coatFlag(sid + '.tried.' + id),
        weave,
        'KQ-ROUTE-25',
      );
      trial.visible = coatFlag(sid + '.tried.' + id);
      objectives.push(trial);
      [site.question, site.clue, label, entry].forEach((text, i) =>
        pack.hints.push({
          id: 'h.' + trial.id + '.' + (i + 1),
          objective: trial.id,
          depth: (i + 1) as 1 | 2 | 3 | 4,
          text,
        }),
      );
    }
    pack.missions.push({
      id: 'KG-RETURNED-COAT-' + sid.toUpperCase(),
      title: site.name,
      world: site.world,
      knowledgeQuestion: site.question,
      stake: site.opening,
      available: coatFlag(sid + '.met'),
      objectives,
    });
    for (const [i, o] of objectives.slice(0, 2).entries()) {
      const clues =
        i === 0
          ? [site.question, site.clue, site.trials[0][2], site.trials[1][2]]
          : [
              'Whose shift did your arrangement change?',
              'Two different kinds of clue can open the decision.',
              'Try the two different operations at the lost-property hatch in the Nexus, or carry an observation between rooms.',
              'Decide how the next wearer gets a coat. Revisit a hook and work the new shift.',
            ];
      for (const [depth, text] of clues.entries())
        pack.hints.push({
          id: 'h.' + o.id + '.' + (depth + 1),
          objective: o.id,
          depth: (depth + 1) as 1 | 2 | 3 | 4,
          text,
        });
    }
  }
  for (const rig of [
    {
      site: 'lining',
      world: 'WORLD-01',
      place: 'the coat rail',
      title: 'The sound through the sleeve',
      stake:
        'A borrower can hear the rehearsal through the coat rack. Kip thinks the drops came through the roof again.',
      question:
        'Which causes can a listener distinguish when different actions sound alike?',
    },
    {
      site: 'stage',
      world: 'WORLD-10',
      place: 'the foyer',
      title: 'The missing hand in the curtain call',
      stake:
        'The cast know whose sleeve made the rain. The person with the other half of the trick is about to go home.',
      question:
        'Who gets credit for a piece of theatre when the audience can only hear the result?',
    },
  ]) {
    const id = key('rain.' + rig.site);
    const started: Condition = { flagSet: id + '.score' };
    const o = {
      id,
      title:
        'Issue a rain programme after trying its four beats from both sides of ' +
        rig.place +
        '.',
      essential: false,
      visible: started,
      done: { flagSet: id + '.bill' },
      kq: { id: 'KQ-ROUTE-25', action: 'issue-rain-' + rig.site },
      weave: {
        concepts: ['perspective', 'explanation', 'evidence', 'responsibility'],
        framework: ['methods-and-tools', 'perspectives', 'ethics'],
        aoks: ['ART', 'NAT'],
        subjects: ['theatre', 'physics'],
        atl: ['thinking', 'communication'],
        thinking: {
          bloom: 'create',
          dok: 2,
          solo: 'relational',
          fink: 'integration',
        },
      },
    } satisfies Objective;
    const match: Objective = {
      ...o,
      id: id + '.twocauses',
      title: 'Give the same audience a tap from two different hands.',
      visible: { flagSet: id + '.kept' },
      done: { flagSet: id + '.twocauses' },
      kq: { id: 'KQ-ROUTE-25', action: 'compare-rain-' + rig.site },
      weave: {
        ...o.weave,
        thinking: {
          bloom: 'analyse',
          dok: 2,
          solo: 'relational',
          fink: 'application',
        },
      },
    };
    [
      'Can the same tap have two different causes?',
      'Keep a four-beat performance after hearing it from the stalls.',
      'Fit a tap into the same beat using a different gesture. Return to the stalls.',
      'Try catching, holding still, tipping, then holding still. Keep that bar. Try two rests, a direct drip and another rest.',
    ].forEach((text, i) =>
      pack.hints.push({
        id: 'h.' + match.id + '.' + (i + 1),
        objective: match.id,
        depth: (i + 1) as 1 | 2 | 3 | 4,
        text,
      }),
    );
    pack.missions.push({
      id: 'KG-COAT-RAIN-' + rig.site.toUpperCase(),
      title: rig.title,
      world: rig.world,
      stake: rig.stake,
      knowledgeQuestion: rig.question,
      available: started,
      objectives: [o, match],
    });
    [
      rig.question,
      'The bulb holds two drops. The open cuff can hold them for a later beat.',
      'Put four gestures on the rig, including any silences. Take a seat in the stalls and watch the same bar from the wings.',
      'Choose how the keeper will be credited. The other room can now try that exact performance.',
    ].forEach((text, i) =>
      pack.hints.push({
        id: 'h.' + id + '.' + (i + 1),
        objective: id,
        depth: (i + 1) as 1 | 2 | 3 | 4,
        text,
      }),
    );
  }
  node(
    'hearing',
    'kip-arden',
    '“I was all for telling everybody who wore both coats,” Kip says. “It’s funny. I thought the story was mine to tell because the button was mine.” Three people are still cold. Three voices travel down the pipe from the other hooks. The next ferry is almost in.',
    [
      ...coatEndings.map((e) => dest(endings[e].label, 'choose.' + e)),
      { text: 'Keep the question open while I look again.' },
    ],
  );
  for (const e of coatEndings) {
    const end = endings[e];
    node(
      'choose.' + e,
      end.voices[0],
      end.first,
      undefined,
      [{ setFlag: key('policy'), value: e }, journal('choose.' + e, end.diary)],
      'answer.' + e,
    );
    node('answer.' + e, end.voices[1], end.next);
    node('duty.' + e, duties[e].actor, duties[e].line);
  }
  const watches = [
    {
      person: 'kip-arden',
      place: 'hook',
      line: 'Kip has a needle between his teeth and two pockets sewn shut. “Practising. Pockets are harder than pears.” He takes the needle out. “I want to be the one who gets to ask the next person what fits.”',
      options: [
        [
          'Hold the hem while Kip asks.',
          'Kip asks how deep the pocket needs to be. Somebody pushes a small wooden bird through the hatch. He measures round the wings and leaves room for a thumb.',
          'I steadied the cloth while Kip asked a borrower what the pocket needed to hold.',
        ],
        [
          'Let him work out how to ask in private.',
          'You sit where the owner of the bird cannot see your face. “You can push it under the curtain,” Kip says. A wingtip appears first. He has thought of a way to ask all by himself.',
          'I gave Kip and the owner of a little wooden bird the space to choose a fitting.',
        ],
      ],
    },
    {
      person: 'warden-ise',
      place: 'book',
      line: 'Ise has a single brass bit on the windowsill. “When I was a recruit, somebody guaranteed my fare. I have forgotten her face. I remember that she made me hold the pen myself.” She turns the nib towards you.',
      options: [
        [
          'Take the pen for this shift.',
          'Ise gives you the guarantor’s book. A woman lays down an empty reel. Together you enter what it cost to mend a sleeve. Ise takes her coat off. For ten minutes she gets to be an ordinary customer.',
          'I signed for the mending shift while Ise tried the other side of the window.',
        ],
        [
          'Ask Ise to put her own fare in the margin.',
          'She writes one bit and leaves a space after “who paid”. Two apprentices argue cheerfully over who will take the next shift. Ise keeps her memory and the apprentices can still check the price.',
          'Ise put the fare she remembers in the book and left the unknown guarantor open.',
        ],
      ],
    },
    {
      person: 'optics-nim',
      place: 'stage',
      line: 'Nim has made a bed for the rain bulb in a folded coat. “I used to think every pair of eyes would know when I forgot my entrance. Last night nobody noticed until the woman running the rain gave me her hand.”',
      options: [
        [
          'Take the empty chair and watch for the hand.',
          'From the chair the hand is quite visible. The understudy and the rain keeper try again. This time they keep the gesture on purpose. The little wave becomes yours to call from the chair.',
          'I watched the pair rehearse until a private rescue became a cue the seated audience could share.',
        ],
        [
          'Offer to mind the door so they can practise alone.',
          'A family stops outside. You show them where a coat can come through while the two workers keep their rehearsal to themselves. Inside, somebody forgets the entrance and both women laugh.',
          'I kept the coat service open while Nim and the rain keeper practised without an audience.',
        ],
      ],
    },
  ];
  for (const watch of watches) {
    const id = 'watch.' + watch.place;
    node(id, watch.person, watch.line, [
      ...watch.options.map(([label], i) => dest(label, id + '.' + i)),
      { text: 'Leave the shift in their hands.' },
    ]);
    watch.options.forEach(([, line, diary], i) =>
      node(id + '.' + i, watch.person, line, undefined, [
        once(id + '.' + i),
        journal(id + '.' + i, diary),
      ]),
    );
    const i = pack.characters.findIndex((c) => c.id === watch.person);
    if (i >= 0) {
      const actor = pack.characters[i];
      pack.characters[i] = {
        ...actor,
        localGreeting: { ...actor.localGreeting, 'nexus.coat-lining': key(id) },
      };
    }
  }
  node(
    'inside',
    'narrator',
    'From inside the lining, the world sounds like somebody else’s kitchen. A spoon against a mug. A ferry rope against a post. A rail so low a child could work it.',
    [
      dest('Pull the loop and listen at the low end.', 'loop'),
      dest('Look at the stitch hidden behind the public name.', 'stitch'),
      { text: 'Leave the waiting space quiet.' },
    ],
  );
  node(
    'loop',
    'kip-arden',
    'A small voice asks if red will do. Kip sends a yellow scarf through instead. “She always says red will do when she means anything with a pocket.” The voice on the other side asks for yellow again. Kip waits for that second answer.',
    undefined,
    [
      once('lining'),
      journal(
        'loop',
        'Inside the quiet landing, I waited for the borrower to choose a colour.',
      ),
    ],
  );
  node(
    'stitch',
    'warden-ise',
    'There are three letters under the name band. Ise covers the first with her thumb. “My turn to mend. I put my initials on the inside because the last woman should get to wear a coat of her own.” She offers you the needle instead of asking you to keep a secret.',
    undefined,
    [
      once('hem'),
      journal(
        'stitch',
        'I found a mender’s mark in a place that could be mistaken for the wearer’s name.',
      ),
    ],
  );
}
