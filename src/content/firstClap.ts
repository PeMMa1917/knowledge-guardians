// A house mechanism can establish where a sound came from. The people involved
// decide for themselves which part of the memory they wish to share.
import type { Condition, ContentPack, DialogueNode, DialogueOption, Effect, Hint } from '../domain/types';

const prefix = 'first-clap.';
export const clapHas = (id: string): Condition => ({ flagSet: prefix + id });
export const clapIs = (id: string, value: string): Condition => ({ flag: prefix + id, eq: value });
export const clapMissing = (id: string): Condition => ({ not: clapHas(id) });
const set = (id: string, value: string | true = true): Effect => ({ setFlag: prefix + id, value });
const journal = (id: string): Effect => ({ journal: 'j.' + prefix + id });
function beat(id: string, speaker: string, text: string, options?: DialogueOption[]): DialogueNode {
  return { id: prefix + id, speaker, text, options, historicalLabel: 'fictional-world' };
}
function choose(text: string, next: string, effects?: Effect[], when?: Condition): DialogueOption {
  return { text, next: prefix + next, effects, if: when };
}
const edda = 'stage-director',
  hari = 'stage-host',
  voice = 'narrator';
const ready: Condition = { all: [clapHas('asked'), clapMissing('bow')] };
const id = 'first-clap.curtain';
const notes: Record<string, string> = {
  seat: 'I sat in the side seat and took my weight off it. Its loose board made a sound like one pair of hands. It could tell me where a clap came from. It couldn’t tell me who once stayed to hear a child sing.',
  name: 'I heard why Hari always stands up at the end of a bad rehearsal. Edda asked to hear his part of the story in private.',
  light:
    'I raised the house lights on the first clap. The actors turned around. Hari finally took a bow from his own seat.',
  dark: 'I gave the last bow to the dark. Edda let the familiar board clap once, then sat beside the new singer until she could take it from there.',
};
export const firstClapContent = {
  dialogue: [
    beat(
      'dress',
      edda,
      'The empty house claps once. Edda, halfway through a bow, straightens as though someone has slapped her. “When I was nine I forgot my last verse. Mum had already gone to work. I heard that same single clap and sang it to the dark. For years I thought she’d come back.”',
      [
        choose('Wait beside her for the second clap.', 'quiet', [set('started')]),
        { text: 'Leave the rehearsal to her.' },
      ],
    ),
    beat(
      'quiet',
      edda,
      'You wait. The second clap never comes. “Hari says it’s the building. The cheaper seats do have opinions.” She rubs the back of her neck. “If you find the seat, sit in it before you decide who I was singing to.”',
    ),
    beat(
      'seat',
      voice,
      'Up in the gallery there is one seat with a little half-moon nick in the lip. When you sit, the stage vanishes behind the balcony rail. A heel mark on the armrest points out over the drop.',
      [
        choose('Settle your weight into the seat.', 'seated', [set('seat', 'down'), set('started')]),
        { text: 'Leave the seat up.' },
      ],
    ),
    beat(
      'seated',
      voice,
      'The board lies quiet. From downstage, Hari calls, “Can you see her shoes?” You can see the shoes of the person beside you. Of the stage, precisely nothing.',
      [
        choose('Stand up to see the bow.', 'rise', [set('seat', 'up'), set('heard'), journal('seat')]),
        { text: 'Stay here until I’m ready to stand.' },
      ],
    ),
    beat(
      'rise',
      voice,
      'The seat flips up behind your knees. CLAP. Edda turns toward you before you have put your hands together. Hari, across the room, is already halfway out of his own seat.',
    ),
    beat(
      'friend',
      hari,
      '“I was paid a bun to carry her mum’s laundry. I did that first. Then I came back and stood up so I could see Ed finish. The seat clapped for both of us.” He changes hands on the folded programme. “I thought she knew I stayed. She thought I went with the washing.”',
      [
        choose('Offer to walk back with him. Let Edda decide what she wants to hear.', 'ask', [
          set('started'),
          set('asked'),
          journal('name'),
        ]),
        { text: 'Keep his confidence and leave the two of them some room.' },
      ],
    ),
    beat(
      'ask',
      edda,
      'Edda puts two cups on the step. “Yes, I want to know who stayed. Ask me again when the room’s empty.” Hari sits down. During the next rehearsal they give you the lights for the bow.',
    ),
    beat(
      'light',
      edda,
      'The new singer has nearly finished. With the house lights up, she’ll see everyone who stayed. So will everybody who came to sit quietly in the dark.',
      [
        choose('Raise the house lights for the bow.', 'light-end', [set('bow', 'light'), journal('light')], ready),
        { text: 'Keep my hand off the lever for now.' },
      ],
    ),
    beat(
      'dark',
      hari,
      'The single seat can clap for the singer in the dark. She’ll hear that someone stayed. She may never know who. Hari puts the little wooden wedge in your palm.',
      [
        choose(
          'Slide the wedge out and give the bow to the dark.',
          'dark-end',
          [set('bow', 'dark'), journal('dark')],
          ready,
        ),
        { text: 'Hold the wedge until I’ve seen the lights.' },
      ],
    ),
    beat(
      'light-end',
      hari,
      'The new singer bows. Edda turns her around. A dozen faces blink back, startled to find themselves in the show. Hari stands. This time the board claps after him. One girl in the back shields her eyes with her programme. Hari angles the lamp away.',
    ),
    beat(
      'dark-end',
      edda,
      'One ridiculous wooden clap. The singer smiles toward the wrong row. Edda leaves it there. After the room empties she sits beside her and sings the verse she lost when she was nine. Hari waits until they finish before he stands.',
    ),
    beat(
      'light-return',
      edda,
      'A chalk mark at the lever says HALF LIGHT FOR THE BACK ROW. Hari has added a little drawing of himself bowing. “He says it’s a lighting diagram.” Edda hasn’t rubbed it out.',
    ),
    beat(
      'dark-return',
      hari,
      'The wedge lives under the last seat on a ribbon. The smallest actor is allowed to pull it for the next bow. Hari takes you to see the new knot. “She did it herself. My knots are too tight.”',
    ),
  ],
  missions: [
    {
      id: 'KG-CH9-FIRST-CLAP',
      world: 'WORLD-10',
      title: 'The Seat That Clapped First',
      available: clapHas('started'),
      knowledgeQuestion: 'What can repeating a sound explain about an evening remembered by two people?',
      stake:
        'Edda is about to direct a child through the same silence she remembers. Hari kept a seat that never quite lets him stay out of sight.',
      objectives: [
        {
          id: 'first-clap.measure',
          title: 'Feel what happens when the gallery seat rises.',
          essential: false,
          done: clapHas('heard'),
          weave: {
            concepts: ['evidence', 'explanation'],
            framework: ['methods-and-tools', 'scope'],
            atl: ['thinking'],
            aoks: ['ART', 'HIS', 'NAT'],
            subjects: ['theatre', 'history', 'physics'],
            minutes: 2,
            thinking: { dok: 2, bloom: 'apply', solo: 'multistructural', fink: 'application' },
          },
        },
        {
          id,
          title: 'Work the last bow with Hari and Edda.',
          essential: false,
          done: clapHas('bow'),
          weave: {
            concepts: ['interpretation', 'explanation', 'evidence', 'perspective', 'responsibility', 'values'],
            framework: ['perspectives', 'methods-and-tools', 'ethics'],
            subjects: ['theatre', 'psychology', 'physics'],
            atl: ['communication', 'thinking'],
            aoks: ['ART', 'HUM', 'NAT'],
            minutes: 5,
            thinking: { dok: 3, bloom: 'evaluate', solo: 'relational', fink: 'human' },
          },
        },
      ],
    },
  ],
  journal: Object.entries(notes).map(([key, text]) => ({
    id: 'j.' + prefix + key,
    text,
    claimKind: 'observation' as const,
  })),
  hints: [
    [
      'An empty house has an opinion about Edda’s rehearsal.',
      'Try the half-moon seat in the gallery, or find Hari’s folded programme there. You can come in by either route.',
      'Let your weight down and then stand to see the bow. Hari knows whose laundry he carried the first time the board clapped.',
      'Let the pair talk. In the rehearsal room raise the house lights, or return to the gallery and release the seat wedge. Both cue a bow.',
    ].map((text, i) => ({ id: 'h.' + prefix + (i + 1), objective: id, depth: (i + 1) as Hint['depth'], text })),
    [
      'Listen to the empty house when Edda bows.',
      'Look for the nick in the old gallery seat.',
      'Try to see the stage while sitting in that seat. Then change your height.',
      'Sit on the nicked seat and stand up to see the bow. Compare when the clap happens with where your own hands are.',
    ].map((text, i) => ({
      id: 'h.first-clap.measure.' + (i + 1),
      objective: 'first-clap.measure',
      depth: (i + 1) as Hint['depth'],
      text,
    })),
  ].flat(),
} satisfies Partial<ContentPack>;
