import type {
  ContentPack,
  DialogueNode,
  Condition,
  Weave,
  Hint,
} from '../domain/types';
import type { Perch } from '../domain/mothPerches';

export const mothReturns = {
  lamp: {
    actor: 'forest-naturalist',
    location: 'Fern Station, beside the field book',
    label: 'Elian’s hooded night lamp',
    art: 'forest.field-diagram',
    line: 'Elian holds the lamp where his sister always stood. “She wrote that the wing stopped shining when she left. I thought she meant it had gone.” Your moth settles on the old cuff. As he lowers the hood, its wing still pulses. The painted arrow on the book disappears.',
    options: [
      {
        id: 'edge',
        act: 'Leave a hooded gap for the watch.',
        line: 'Elian props the hood a thumb’s width open. “My sister stood on that side. From over there she could still see the arrow.” The next keeper can follow the marked edge. Some light falls on the perch.',
        receipt:
          'The narrow lamp slot lights the book’s edge. The keeper writes where she stood beside the next observation.',
      },
      {
        id: 'touch',
        act: 'Tie the direction into the cover cord.',
        line: 'Elian runs a finger over your knot, closes the hood and reaches the book again in the dark. “Now my daughter can find it even when the night insects land. I shall have to teach her the knot.”',
        receipt:
          'A knot guides a hand to the book in darkness. A new worker asks the keeper which way to read it.',
      },
    ],
  },
  desk: {
    actor: 'stage-host',
    location: 'the front foyer of the House of Performance',
    label: 'the quiet side of the velvet rail',
    art: 'stage.programme',
    line: 'The host lets the moth stand on her cuff. A child waits by the velvet rail. “At rehearsal he heard his cue. Out here the crowd swallows it. I told his mother he’d lost his nerve.” A brush of the cuff reaches a resting foot. “At the Archive you held one thing steady to find what made a difference. Here I’d try both cues. Let him choose what a pause feels like.”',
    options: [
      {
        id: 'ribbon',
        act: 'Run a cue ribbon to the waiting place.',
        line: 'One tug, then a returning tug. The child opens the door on his own count. The host holds the loose end down so it cannot pull him early.',
        receipt:
          'A ribbon reaches the waiting place. A hand at the far end can send a signal back.',
      },
      {
        id: 'pause',
        act: 'Give the waiting player the first gesture.',
        line: 'The host waits. The child raises a hand at last. In the house some people lean forward and others shuffle. The host turns so the back row can see his hand too.',
        receipt:
          'The door cue now begins with the child’s hand. The host stands sideways so the back row can see it.',
      },
    ],
  },
  case: {
    actor: 'preserved-registrar',
    location: 'the public records hall in the Preserved Archive',
    label: 'the thumbprint below a clear case',
    art: 'preserved.folder',
    line: 'The registrar catches a shine on new glass. “I signed the case clean. If somebody opened it afterwards, the night keeper takes the blame.” Your moth settles on the outside handle. Her thumb leaves a second shine beside the first while the seal stays whole.',
    options: [
      {
        id: 'seal',
        act: 'Record what the intact seal can establish.',
        line: 'She checks its two ends and signs a shorter entry. “A print on the outside. Seal intact when we looked.” The earlier print still has no name. The night keeper puts down his keys.',
        receipt:
          'The condition slip records an outside print and an intact seal at the time of inspection. It names no visitor.',
      },
      {
        id: 'copy',
        act: 'Send the keeper a separate observation slip.',
        line: 'The registrar folds her own slip into the pocket. The keeper adds his before they compare. “Mine says when I cleaned the outside. Hers says when she saw the shine.” They leave room for the next person.',
        receipt:
          'Two timed observations sit in a pocket on the case. The keeper can add another without changing either account.',
      },
    ],
  },
} as const;

export function mothReturnDialogue(): DialogueNode[] {
  return (Object.keys(mothReturns) as Perch[]).flatMap((home) => {
    const room = mothReturns[home],
      key = 'moth.return.' + home;
    return [
      {
        id: key,
        speaker: room.actor,
        text: room.line,
        options: [
          ...room.options.map((o) => ({
            text: o.act,
            next: key + '.' + o.id,
            effects: [{ setFlag: key, value: o.id }],
          })),
          { text: 'Leave the setup for another visit.' },
        ],
      },
      ...room.options.flatMap((o) => [
        { id: key + '.' + o.id, speaker: room.actor, text: o.line },
        {
          id: key + '.' + o.id + '.again',
          speaker: room.actor,
          text: o.receipt,
          options: [
            {
              text: 'Try another arrangement with the moth.',
              next: key,
              if: mothPresent(home),
            },
            { text: 'Leave this arrangement for the next visitor.' },
          ],
        },
      ]),
    ];
  });
}

export function mothPresent(home: Perch): Condition {
  return {
    all: [
      { flag: 'moth.perch.home', eq: home },
      { flag: 'lor.out', eq: 'glimmermoth' },
    ],
  };
}
const returnLessons: Record<
  Perch,
  {
    chapter: number;
    world: string;
    title: string;
    question: string;
    weave: Weave;
  }
> = {
  lamp: {
    chapter: 5,
    world: 'WORLD-06',
    title: 'The notch in the night book',
    question:
      'When a field sign vanishes, what can tell us whether the thing vanished too?',
    weave: {
      concepts: ['evidence', 'perspective', 'interpretation', 'certainty'],
      framework: ['scope', 'methods-and-tools', 'perspectives'],
      aoks: ['NAT', 'HIS'],
      subjects: ['biology', 'history', 'design-tech'],
      atl: ['research', 'thinking'],
      thinking: {
        dok: 3,
        bloom: 'analyse',
        fink: 'integration',
        solo: 'relational',
      },
    },
  },
  desk: {
    chapter: 9,
    world: 'WORLD-10',
    title: 'Who gives the first cue?',
    question:
      'When does a trial test an explanation, and when does it give a performer a new choice?',
    weave: {
      concepts: ['interpretation', 'perspective', 'explanation', 'values'],
      framework: ['methods-and-tools', 'perspectives', 'ethics'],
      aoks: ['ART', 'NAT'],
      subjects: ['theatre', 'biology'],
      atl: ['communication', 'thinking'],
      thinking: { dok: 3, bloom: 'create', fink: 'human', solo: 'relational' },
    },
  },
  case: {
    chapter: 3,
    world: 'WORLD-04',
    title: 'Outside the seal',
    question: 'How far can a visible trace carry an accusation about a person?',
    weave: {
      concepts: ['evidence', 'justification', 'responsibility', 'certainty'],
      framework: ['ethics', 'scope', 'methods-and-tools'],
      aoks: ['HIS', 'HUM'],
      subjects: ['history', 'psychology'],
      atl: ['research', 'social'],
      thinking: {
        dok: 3,
        bloom: 'evaluate',
        fink: 'caring',
        solo: 'relational',
      },
    },
  },
};
export function mothReturnContent(): Partial<ContentPack> {
  const hints: Hint[] = [];
  const missions = (Object.keys(mothReturns) as Perch[]).map((home) => {
    const r = mothReturns[home],
      lesson = returnLessons[home],
      id = 'moth.return.' + home;
    const directions = [
      'Your resting place in the Archive points to a second watch.',
      'Bring the Glimmermoth out beside you before looking for the receiver.',
      'Look for ' + r.label + ' at ' + r.location + '.',
      r.options[0].act +
        ' Or choose the other arrangement and read what the receiver does.',
    ];
    directions.forEach((text, i) =>
      hints.push({
        id: 'h.' + id + '.' + (i + 1),
        objective: id,
        depth: (i + 1) as Hint['depth'],
        text,
      }),
    );
    return {
      id: 'KG-CH' + lesson.chapter + '-MOTH-' + home.toUpperCase(),
      world: lesson.world,
      title: lesson.title,
      knowledgeQuestion: lesson.question,
      available: {
        any: [{ flag: 'moth.perch.home', eq: home }, { flagSet: id }],
      },
      objectives: [
        {
          id,
          title:
            'Bring the Glimmermoth to ' +
            r.label +
            ' and try a new arrangement.',
          essential: false,
          done: { flagSet: id },
          weave: lesson.weave,
        },
      ],
    };
  });
  return { missions, hints, dialogue: mothReturnDialogue() };
}
