import {
  inkCases,
  inkKey,
  inkTools,
  inkWeave,
  pressNames,
  type InkCase,
  type InkTool,
} from '../domain/secondInk';
import type { ContentPack, Condition, DialogueNode, Hint, Objective, Weave } from '../domain/types';

export const inkRunner = 'moth-runner-tritta';
type InkGuest = { person: string; source: string; approach: string; action: string; late: string };
export const inkGuests: Record<string, InkGuest> = {
  coast: {
    person: 'ibn-al-haytham',
    source: 'HIS-INK-q11104',
    approach:
      'Ibn al-Haytham puts a dark sleeve over the harbour side of the lamp. An image that looked like a second opening goes out on the glass.',
    action: 'Stand where Orren’s daughter had to stand.',
    late: 'From the lower stair you see the return in the window. Ibn al-Haytham waits for the pilot’s own signal before he moves his sleeve.',
  },
  island: {
    person: 'ibn-al-haytham',
    source: 'HIS-INK-q11104',
    approach:
      'Ibn al-Haytham places a lamp at the mouth of the horn. The near post and its reflection both brighten. Joss asks if anyone has actually crossed.',
    action: 'Trace the visible path before sounding the reed.',
    late: 'The lamp can show which surface sent light back. For the reply across the water Ibn al-Haytham hands the reed to a person at the other end.',
  },
  press: {
    person: 'ink-q11621076',
    source: 'HIS-INK-q11621076',
    approach:
      'Katsushika Ōi tips the proof toward the window. You can see the little footprint in the ink. Turned against the light, the paper also has a dent.',
    action: 'Try the same light on the reverse.',
    late: 'Ōi sets the new impression in the old light. The dent takes a shadow differently. Bayette wraps the sheet before anyone can make another image of the child’s foot.',
  },
  stage: {
    person: 'ink-q11621076',
    source: 'HIS-INK-q11621076',
    approach:
      'Katsushika Ōi sends a little light under the old coat. Its hem bows before its wearer moves. Brannic is halfway through his cue before he catches himself.',
    action: 'Hold the light while the understudy takes off the coat.',
    late: 'Ōi turns the cast shadow until the coat and the player stand apart. A member of the audience changes the direction of her bow.',
  },
  nile: {
    person: 'ink-q9372',
    source: 'HIS-INK-q9372',
    approach:
      'Sima Qian puts a sheet beside the grain chest. He leaves space for two paths through one payment. Imani begins at the knot. The weigher begins at the scale.',
    action: 'Follow the sack in the carrier’s order.',
    late: 'At the knot the carrier stops. They can say who brought the sack. They ask the weigher to tell the part they could never have seen.',
  },
  council: {
    person: 'ink-q9372',
    source: 'HIS-INK-q9372',
    approach:
      'Sima Qian sits in the ordinary chair. The minute sets three names in a row. Seen from the chair, one name covers the place reserved for a fourth person.',
    action: 'Turn the minute so its bearer can read the names.',
    late: 'The bearer follows one life through the three signatures. Sima Qian leaves the next leaf for the person who has to live with the promise.',
  },
  dispatch: {
    person: 'ink-q158060',
    source: 'HIS-INK-q158060',
    approach:
      'W. E. B. Du Bois lays the arrival marks by the supper places. A person can appear three times in the count and still have only one place to sit.',
    action: 'Put each arrival beside the person who counted it.',
    late: 'Ro can now see what each mark counted. Du Bois sets an empty plate beside the one runner who still has to arrive.',
  },
  market: {
    person: 'ink-q158060',
    source: 'HIS-INK-q158060',
    approach:
      'W. E. B. Du Bois draws one column for bowls and another for the people paying. The same person appears in both. The soup changes hands even when no coin does.',
    action: 'Put the child’s song on the cook’s side of the page.',
    late: 'Sessa can see the exchange that the posted price hid. The child can decide what to do with a line of his own.',
  },
};
const condition = (k: InkCase, stem: string): Condition => ({ flagSet: inkKey(k, stem) });
const says = (
  id: string,
  speaker: string,
  text: string,
  options: DialogueNode['options'] = [],
  citationSource?: string,
): DialogueNode => ({
  id,
  speaker,
  text,
  options,
  historicalLabel: citationSource ? 'imagined-alternate' : 'fictional-world',
  ...(citationSource ? { citationSource } : {}),
});
function includeRoutes(pack: ContentPack, k: InkCase) {
  const key = 'secondink.' + k.site,
    entered: Condition = { flag: 'visited.map.' + k.room, eq: true };
  const node = (s: string) => key + '.' + s;
  const a = (text: string, phase: string, ifc?: Condition) => ({ text, next: node(phase), if: ifc });
  const opened = condition(k, 'edition');
  const guest = inkGuests[k.site];
  pack.dialogue.push(
    says(node('agate'), 'agate-vale', k.agate, [
      a('Ask whose shift this costs.', 'cost'),
      a('Listen to the old commission in the Seal’s own words.', 'letter'),
      a('Show her where the extra mark came from.', 'account', condition(k, 'answered')),
    ]),
    says(node('cost'), 'agate-vale', k.cost, [a('Find what Tritta put in her cap.', 'runner')]),
    says(node('runner'), inkRunner, k.tritta, [
      a('Follow the gold moth to its notice.', 'case'),
      a('Ask the town who is using the notice now.', 'recipient', condition(k, 'delivered')),
    ]),
    says(node('case'), k.actor, k.hook, [
      a('Look at the three slips on the table.', 'slips'),
      a('Ask Agate what she saw.', 'agate'),
    ]),
    says(node('slips'), inkRunner, k.claim),
    says(
      node('account'),
      'agate-vale',
      'Agate turns the pin over. The little filed nick is visible on the back. “You carried one of your own ways of working far enough to find where it gives out. Here. I want my mark on that as well.”',
    ),
    says(
      node('recipient'),
      k.actor,
      'The notice is in use. The gold moth opens three empty folds for the people who have had to live with it.',
      [
        ...(['exhibit', 'serve', 'entrust'] as const).map((edition) =>
          a('Look into the fold in use today.', 'after.' + edition, {
            flag: inkKey(k, 'edition'),
            eq: edition,
          }),
        ),
      ],
    ),
    ...(['exhibit', 'serve', 'entrust'] as const).map((edition) =>
      says(node('after.' + edition), k.actor, k[edition], [a('Stay and hear Agate’s price.', 'cost')]),
    ),
    says(node('letter'), 'vesper-quill', letterFor(k), [
      a('Ask the person holding the paper.', 'agate'),
    ]),
  );
  function local(id: string, phase: string) {
    const p = pack.characters.find((c) => c.id === id);
    if (!p) throw Error('Missing person for the night proof: ' + id);
    p.localGreeting = { ...p.localGreeting, [k.room]: node(phase) };
  }
  local('agate-vale', 'agate');
  local(inkRunner, 'runner');
  if (guest) {
    pack.dialogue.push(
      says(
        node('guest'),
        guest.person,
        guest.approach,
        [
          a(guest.action, 'guest.work'),
          a('Come back to the same case after a notice goes up.', 'guest.after', opened),
        ],
        guest.source,
      ),
      says(node('guest.work'), guest.person, guest.late, [], guest.source),
      says(
        node('guest.after'),
        guest.person,
        k.claim +
          ' The notice in the far aisle bears your reading. Your guest leaves the new form beside the first one.',
        [
          ...(['exhibit', 'serve', 'entrust'] as const).map((edition) =>
            a('Follow the notice to its user.', 'after.' + edition, {
              flag: inkKey(k, 'edition'),
              eq: edition,
            }),
          ),
        ],
        guest.source,
      ),
    );
    local(guest.person, 'guest');
  }
  // The register keeper keeps their original greeting and offers this commission in the same conversation.
  const keeper = pack.dialogue.find((n) => n.id === k.room + '.keeper');
  if (keeper)
    keeper.options = [
      ...(keeper.options ?? []),
      a('Ask about the notice with the missing gold corner.', 'case'),
    ];
  const make = (
    id: string,
    title: string,
    done: Condition,
    weave: Weave,
    thinking: NonNullable<Weave['thinking']>,
    hint: string[],
    note: string,
  ): Objective => {
    const objective = node(id);
    hint.forEach((line, i) =>
      pack.hints.push({
        id: 'h.' + objective + '.' + i,
        objective,
        depth: (i + 1) as Hint['depth'],
        text: line,
      }),
    );
    pack.journal.push({ id: 'j.' + objective, claimKind: 'observation', text: note });
    return {
      id: objective,
      title,
      done,
      essential: false,
      visible: entered,
      weave: { ...weave, thinking, minutes: id === 'answer' ? 5 : 3 },
      onComplete: [{ journal: 'j.' + objective }],
    };
  };
  const techniques: Record<InkTool, { title: string; hints: string[]; note: string }> = {
    slip: {
      title: 'Slide the impression of ' + k.mark,
      hints: [
        'Tritta has a proof on a bed with three pegs.',
        'Move the sheet. Keep a rubbing at the peg you used.',
        'Use another peg on the same face. The reference pin stays at notch four.',
        'Look for a mark that travels with the sheet or holds its place on the bed. Keep both rubbings.',
      ],
      note:
        'I moved the sheet with ' +
        k.mark +
        ' and kept the fixed pinhole in view. I could check what moved with the paper.',
    },
    cord: {
      title: 'Follow two cords from the ' + k.desks[0],
      hints: [
        'Each of the three desks has one loose cord.',
        'Pick a desk and pull its cord twice. The hook is an intermediate carrier.',
        'Record the person at the far end. Then go back to a different desk.',
        'Follow and keep its ending too. Compare the witnesses behind the two desk names.',
      ],
      note: 'I followed two cords past their hooks. The labels on the desks and the people who supplied the accounts gave me two different ways to count.',
    },
    bell: {
      title: 'Catch two bells in the shutters',
      hints: [
        'The shutters can show three points in a shift.',
        'Open the shutters at one bell and record who could see the work.',
        'Use a different bell on this same shift. An empty view also tells you something.',
        'Keep two views before giving anyone a public notice.',
      ],
      note:
        'I kept two bell readings from “' +
        k.title +
        '”. A person could report at one hour and be missing when the other shutter opened.',
    },
  };
  const aims = inkTools.map((t) =>
    make(
      t,
      techniques[t].title,
      condition(k, 'proof.' + t),
      inkWeave[t],
      {
        dok: t === 'bell' ? 2 : 3,
        bloom: t === 'bell' ? 'apply' : 'analyse',
        fink: t === 'cord' ? 'integration' : 'application',
        solo: t === 'bell' ? 'multistructural' : 'relational',
      },
      techniques[t].hints,
      techniques[t].note,
    ),
  );
  aims.push(
    make(
      'delivery',
      'Find the person who has to use this notice',
      condition(k, 'delivered'),
      inkWeave.serve,
      { dok: 3, bloom: 'evaluate', fink: 'caring', solo: 'relational' },
      [
        'One person needs this decision tonight.',
        'Two different front readings on one tool will support a notice.',
        'Sign for an exhibit, immediate help or the witness’s own custody.',
        'Leave the bench and find the new sign or seat in the aisle named on the seal.',
      ],
      'At “' +
        k.title +
        '” I followed a signed notice into the room and found out who had to act on it.',
    ),
    make(
      'answer',
      'Open Agate’s folded counterproof',
      condition(k, 'answered'),
      inkWeave.answer,
      { dok: 4, bloom: 'evaluate', fink: 'learning-to-learn', solo: 'extended' },
      [
        'Agate reads the ways you use in other chapters.',
        'Sign notices with one method in at least two other chapters. She can then offer a folded challenge here.',
        'Open her margin. Keep the peg or bell fixed across two sides, or trace the third cord.',
        'If four other chapter notices used that method, bring readings made by another method as well. The ordinary commission can always go out first.',
      ],
      'I used my previous investigations to try a limit on a familiar method. I answered Agate at “' +
        k.title +
        '”.',
    ),
    make(
      'transfer',
      'Unfold a different town beside this case',
      condition(k, 'compared'),
      inkWeave.answer,
      { dok: 4, bloom: 'analyse', fink: 'integration', solo: 'extended' },
      [
        'At a different register, go to the people using a signed notice.',
        'Fold their notice and keep it in the moth pocket.',
        'Here, keep the reading on the bench and leave it at that position.',
        'Unfold the old notice beside it. Both original places and observations stay on the paper.',
      ],
      'I carried a reading made for somebody else and put it beside an observation from “' +
        k.title +
        '”. The two settings limited how far I could carry the comparison.',
    ),
  );
  const goal = (id: string) => aims.find((o) => o.id === node(id))!;
  goal('delivery').visible = {
    all: [entered, { any: inkTools.map((t) => condition(k, 'proof.' + t)) }],
  };
  goal('answer').visible = { all: [entered, condition(k, 'rival.tool')] };
  goal('transfer').visible = {
    all: [entered, { flagSet: 'secondink.pocket' }, { not: { flag: 'secondink.pocket', eq: k.site } }],
  };
  // A skill tied to one counterproof is earned only by answering that method.
  // These receipts appear after the relevant encounter so unopened commissions stay short.
  for (const t of inkTools) {
    const receipt = make(
      'answer.' + t,
      'Agate’s mark on ' + pressNames[t].toLowerCase(),
      condition(k, 'answered.' + t),
      { ...inkWeave[t], framework: ['scope', 'methods-and-tools', 'perspectives'] },
      { dok: 4, bloom: 'evaluate', fink: 'learning-to-learn', solo: 'extended' },
      [
        'Look inside Agate’s folded margin.',
        'Bring the method you used to sign two notices elsewhere.',
        'Keep the original readings beside the changed condition.',
        'Answer the counterproof in Agate’s margin.',
      ],
      'I brought a second condition to ' +
        pressNames[t].toLowerCase() +
        ' at “' +
        k.title +
        '”. Agate signed the comparison with me.',
    );
    receipt.visible = condition(k, 'answered.' + t);
    aims.push(receipt);
  }
  pack.missions.push({
    id: 'second-ink-' + k.site,
    world: k.world,
    title: k.title,
    stake: k.claim,
    knowledgeQuestion: k.question,
    available: entered,
    objectives: aims,
  });
}
function letterFor(k: InkCase) {
  const notes = [
    'An old line from Vesper sits under the lamp. “One clean word from a stranger got me through a door once. I wonder sometimes how many doors I tried before I found the one it fitted.”',
    'Vesper’s pay envelope has a line ruled on the inside. “A full basket is a very short argument. The hand on the handle still has a story to tell.”',
    '“Once gave a stranger my room. Came back to find my name in the register as a person who had stayed the night.” Vesper’s writing runs right off the edge.',
    'Vesper has drawn a hand waving from a window. “We all waved at the house one night. We thought we were being particularly kind. Nobody was home.”',
    'Only six words have survived the moth. “Heard it too. Was standing where?” Vesper has left space for a drawing beside the question.',
    '“I can get a person home in time to eat.” Under that, in the same script, “Who has to stay to lock up?”',
    'A strip in Vesper’s old pocketbook says “Correct quietly.” The first word was set in type. The second was put in later by hand.',
    'Vesper has paid the fare in the margin. “You’ll need a boat before you know what the shore looks like. Keep me a seat.”',
    'Vesper once sent the theatre a second coat. “For the person who brings the first one back.” The moth has eaten the size.',
    'The old envelope once held a coin. “I thought paying settled the matter. They still had to carry a pot to my door.”',
    'A drop of old water has opened one stroke in Vesper’s name. “I used to think I had to go back and warn everyone. Some of them were the ones who warned me.”',
    'Vesper has drawn two waiting bowls. “Leave a runner a hot supper and they may come back to tell you how long the road was.”',
    'Between two printed words Vesper has left the width of one small finger. “This part belonged to the singer before it belonged to the score.”',
    '“Did the other bank answer?” Vesper has folded the slip into half a horn. It takes someone at the far end to make a sound.',
    'The seal still fits a blank corner. Under the wax a line from Vesper reads “If you ever see my name on a promise, find out who has to keep it.”',
  ];
  return notes[inkCases.findIndex((x) => x.site === k.site)];
}
export function installSecondInk(pack: ContentPack) {
  pack.characters.push({
    id: inkRunner,
    name: 'Tritta',
    role: 'Runner, cap mender and keeper of the two-tailed ink moth',
    mode: 'fictional',
    sprite: 'custom:brown.black.teal.wine.scarf.gold.curls.none.none',
    talk: [{ node: 'secondink.archive.runner' }],
  });
  for (const k of inkCases) includeRoutes(pack, k);
}
