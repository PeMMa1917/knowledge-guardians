import type { CampaignState, Effect, Weave } from './types';
import { diaryEvent } from './adventureEvents';

export const origins = [
  'archive',
  'traveller',
  'harbour',
  'workshop',
  'singer',
] as const;
export type Origin = (typeof origins)[number];
export const originPlaces = {
  archive: ['nexus.archive', 'preserved.archive', 'cataloguer-bela'],
  traveller: ['nexus.archive', 'island.workshop', 'translator-lio'],
  harbour: ['aethelgard.emberford', 'sea.harbour', 'runner-tamar'],
  workshop: ['aethelgard.emberford', 'metalworks.records', 'apprentice-ren'],
  singer: ['aethelgard.emberford', 'stage.foyer', 'singer-teodora'],
} as const;
export const originWeave: Record<Origin, Weave> = {
  archive: {
    concepts: ['power', 'evidence', 'values', 'interpretation'],
    framework: ['methods-and-tools', 'perspectives'],
    aoks: ['HIS', 'HUM'],
    subjects: ['history', 'digital-society', 'anthropology'],
    atl: ['research', 'communication'],
    thinking: {
      dok: 3,
      bloom: 'analyse',
      fink: 'integration',
      solo: 'relational',
    },
  },
  traveller: {
    concepts: ['perspective', 'culture', 'objectivity', 'interpretation'],
    framework: ['scope', 'perspectives'],
    aoks: ['HUM', 'MAT', 'ART'],
    subjects: ['lang-b', 'math-ai', 'theatre'],
    atl: ['communication', 'thinking'],
    thinking: { dok: 3, bloom: 'evaluate', fink: 'human', solo: 'relational' },
  },
  harbour: {
    concepts: ['responsibility', 'justification', 'power', 'truth'],
    framework: ['ethics', 'methods-and-tools'],
    aoks: ['HUM', 'HIS'],
    subjects: ['lang-langlit', 'economics', 'history'],
    atl: ['social', 'communication'],
    thinking: {
      dok: 3,
      bloom: 'create',
      fink: 'application',
      solo: 'relational',
    },
  },
  workshop: {
    concepts: ['certainty', 'evidence', 'explanation', 'objectivity'],
    framework: ['methods-and-tools', 'scope'],
    aoks: ['NAT', 'MAT', 'ART'],
    subjects: ['physics', 'design-tech', 'visual-arts'],
    atl: ['thinking', 'research'],
    thinking: {
      dok: 3,
      bloom: 'analyse',
      fink: 'application',
      solo: 'relational',
    },
  },
  singer: {
    concepts: ['culture', 'perspective', 'interpretation', 'responsibility'],
    framework: ['ethics', 'perspectives', 'methods-and-tools'],
    aoks: ['ART', 'HIS'],
    subjects: ['music', 'history', 'lit-perf'],
    atl: ['social', 'communication'],
    thinking: { dok: 3, bloom: 'create', fink: 'caring', solo: 'relational' },
  },
};
export type InstrumentCommand =
  | {
      type: 'WorkOriginInstrument';
      origin: Origin;
      action: 'set';
      control: number;
      value: number;
    }
  | { type: 'WorkOriginInstrument'; origin: Origin; action: 'try' }
  | {
      type: 'WorkOriginInstrument';
      origin: Origin;
      action: 'send' | 'return';
      side: 0 | 1;
    };
export type Control = { label: string; positions: readonly string[] };
export interface Score {
  title: string;
  setup: string;
  controls: readonly Control[];
  test: string;
  send: [string, string];
  arrives: [string, string];
  returnLabels: [string, string];
  returnLines: [string, string];
}
export const scores: Record<Origin, Score> = {
  archive: {
    title: 'Bela’s cabinet of one',
    setup:
      'Inside the cabinet is the only slip for the little pen model. File it once. A second drawer can hold a pointer. Each visitor has time to open just one drawer before the bell.',
    controls: [
      {
        label: 'File the original slip',
        positions: ['School gifts', 'Pens', 'Models'],
      },
      {
        label: 'Hinge a pointer',
        positions: ['No pointer', 'School gifts', 'Pens', 'Models'],
      },
      {
        label: 'Invite a visitor',
        positions: [
          'Mina, who remembers giving it',
          'Sol, who needs a pen model',
          'Bela’s brother, who makes models',
        ],
      },
    ],
    test: 'Open the visitor’s drawer',
    send: [
      'Put the cabinet in the reading room',
      'Wheel the cabinet out to the school steps',
    ],
    arrives: [
      'Mina brings her brother into the reading room for the first time. The school party has already gone past.',
      'The school party calls the makers over to their steps. The quiet reader has to ask someone to bring the cabinet back.',
    ],
    returnLabels: [
      'Reserve the first drawer for a visitor who knows the giver',
      'Give a model maker the first turn',
    ],
    returnLines: [
      'The first reader follows a person’s name. Bela leaves the thing’s name on a second tab for the next shift.',
      'The maker fits the little model into a family of objects. The gift stays on the card for a reader who starts from the school.',
    ],
  },
  traveller: {
    title: 'Lio and the leader who arrived last',
    setup:
      'Three figures are waiting behind the paper gate. The banner bearer carries the tune for the others. A runner leaves early to clear the path. The porter waits for a passenger and uses a short cut. Advance the procession and pull one cord.',
    controls: [
      {
        label: 'Move the town clock',
        positions: [
          'Before the gate opens',
          'After the second bell',
          'At the finish',
        ],
      },
      {
        label: 'Hang a cord on the disputed word',
        positions: ['First away', 'Leading the tune', 'First home'],
      },
    ],
    test: 'Pull that cord on the paper gate',
    send: [
      'Post the gate cue at the platform',
      'Pin the music cue to the bandstand',
    ],
    arrives: [
      'The platform caller can announce departure. The musicians keep turning round to find their leader.',
      'The little band finds its leader. A late passenger must still ask who has already set out.',
    ],
    returnLabels: [
      'Raise the traveller’s departure pennant',
      'Turn the conductor’s stand toward the back',
    ],
    returnLines: [
      'A passenger sees who left from the workshop first. Lio gives the band a separate place to ask for its cue.',
      'The conductor can be seen from the last seat. Lio leaves the departure time with the boarding clerk.',
    ],
  },
  harbour: {
    title: 'Tamar’s one-breath boat',
    setup:
      'A child is waiting with an empty apple crate. Tamar has one brass tally boat, two peg holes and three facts to send across the harbour. A second runner will have to carry whatever does not fit.',
    controls: [
      {
        label: 'Bow hole',
        positions: ['Three carts', 'Fifthday', 'Price unconfirmed'],
      },
      {
        label: 'Stern hole',
        positions: ['Three carts', 'Fifthday', 'Price unconfirmed'],
      },
      {
        label: 'Who receives the boat?',
        positions: ['The loader', 'The family at the quay', 'The stallholder'],
      },
    ],
    test: 'Float the tally boat across',
    send: [
      'Send the second runner to the landing',
      'Keep a reader beside the market board',
    ],
    arrives: [
      'A runner reaches the boats while people at the market wait for a reply. Tamar pays the runner with the last apple in her pocket.',
      'A reader stays with the notice. The quay has to send someone uphill, but families in the market can check a missing fact.',
    ],
    returnLabels: [
      'Give the dock child a turn as reader',
      'Send a second boat to the stallholder',
    ],
    returnLines: [
      'The child asks what the empty peg hole means. Tamar leaves the question beside the signed receipt.',
      'The two boats return on different tides. The stallholder keeps the dates apart before making a new promise.',
    ],
  },
  workshop: {
    title: 'Ren’s folded tickets',
    setup:
      'The paper tickets for the roof concert keep curling out of their clips. Hesper has saved pieces from the same sheet. Set two conditions and open a packet of three numbered tickets. Each lift is the gap below the edge in millimetres.',
    controls: [
      { label: 'Paper at the start', positions: ['Dry', 'Damp'] },
      { label: 'Mounting edge', positions: ['Flat', 'Folded'] },
    ],
    test: 'Release the clips and read three edges',
    send: [
      'Send the least curled tickets with today’s audience',
      'Keep one ticket from every packet for the next maker',
    ],
    arrives: [
      'Most of the audience gets in before the rain. The next maker has only the written measurements.',
      'The next maker can put the strips back beside their measurements. Ren has to write replacement tickets by hand.',
    ],
    returnLabels: [
      'Use the spare ticket to test another sheet',
      'Put the old ticket in the front window',
    ],
    returnLines: [
      'The next sheet curls differently. Ren adds its batch name to the slip. The audience can still use the first tickets.',
      'Hesper puts the worn concert ticket in the window with the first batch number. A passer-by can inspect one edge and ask for the other three packets.',
    ],
  },
  singer: {
    title: 'The fourth stool',
    setup:
      'Three family lines sit on three stools. The fourth stool creaks in the quiet. A singer from the hills has brought a different ending. Set the fourth beat and decide who will breathe in after it.',
    controls: [
      {
        label: 'Fourth beat',
        positions: [
          'Hold a rest',
          'Bring in the hill line',
          'Hum the remembered cadence',
        ],
      },
      {
        label: 'Next entrance',
        positions: ['Teodora alone', 'Invite Sefa', 'Let the room answer'],
      },
    ],
    test: 'Play the four stools',
    send: [
      'Take the fourth stool to the doorway',
      'Set it among the circle seats',
    ],
    arrives: [
      'The fourth stool faces an empty doorway. A late singer hears that someone waited for them. The circle loses a seat.',
      'Inside the circle, three people share the last breath. Someone outside can hear the tune but cannot tell whose part is missing.',
    ],
    returnLabels: [
      'Give a late singer the first entrance',
      'Start with one full beat of shared quiet',
    ],
    returnLines: [
      'A hill singer calls their own line across the foyer. Teodora answers with the cadence she remembers and leaves its words open.',
      'Four people sit down and nobody fills the fourth beat. When a child starts humming, Teodora asks whose tune they brought with them.',
    ],
  },
};
export const originFlag = (o: Origin, key: string) =>
  'origin-work.' + o + '.' + key;
const mark = (
  o: Origin,
  k: string,
  value: string | number | boolean,
): Effect => ({ setFlag: originFlag(o, k), value });
export const prior = (s: CampaignState, o: Origin) =>
  s.flags['os.' + o + '.choice'];
const defaults: Record<Origin, Record<string, number[]>> = {
  archive: {
    both: [1, 1, 0],
    kind: [2, 0, 2],
    cross: [0, 2, 1],
    unsure: [0, 0, 0],
  },
  traveller: { earliest: [0, 0], both: [1, 1], test: [2, 2], unsure: [0, 1] },
  harbour: {
    write: [0, 1, 0],
    repeat: [0, 2, 1],
    one: [1, 2, 2],
    unsure: [0, 0, 1],
  },
  workshop: { suspect: [1, 0], proven: [1, 1], others: [0, 1], unsure: [0, 0] },
  singer: { credit: [1, 1], both: [1, 0], ask: [0, 2], unsure: [2, 0] },
};
export function positions(s: CampaignState, o: Origin): number[] {
  const initial =
    defaults[o][String(prior(s, o))] ?? scores[o].controls.map(() => 0);
  return scores[o].controls.map((c, i) => {
    const value = s.flags[originFlag(o, 'slot.' + i)];
    return typeof value === 'number' &&
      Number.isInteger(value) &&
      value >= 0 &&
      value < c.positions.length
      ? value
      : initial[i];
  });
}
const lift = [
  [0, 1, 1],
  [1, 2, 1],
  [3, 4, 2],
  [6, 5, 7],
] as const;
const stems = ['Tap of the heel', 'Knock at the door', 'Hand on the rail'];
export function impression(
  o: Origin,
  v: number[],
): { line: string; marks: string[]; signature: string } {
  const [a, b, c] = v;
  switch (o) {
    case 'archive': {
      const place = scores.archive.controls[0].positions;
      const at = place[c];
      const path = c === a ? 'original' : b === c + 1 ? 'pointer' : 'empty';
      return {
        signature: 'visitor.' + c + '.' + path,
        marks: place.map(
          (name, i) =>
            name +
            ' · ' +
            (i === a
              ? 'one original slip'
              : b === i + 1
                ? 'pointer to ' + place[a]
                : 'empty drawer'),
        ),
        line:
          path === 'original'
            ? 'The visitor opens ' +
              at +
              ' and lifts the original slip. A pencilled school name sits on its reverse.'
            : path === 'pointer'
              ? 'The visitor opens ' +
                at +
                ' and follows the pointer to ' +
                place[a] +
                '. There is a single slip at the end of the trail.'
              : 'The visitor opens ' +
                at +
                ' and finds nothing. The model is still in the catalogue. This person goes home without finding it.',
      };
    }
    case 'traveller': {
      const current = [
        [
          'Runner waits',
          'Bearer holds the baton',
          'Porter waits with a passenger',
        ],
        [
          'Runner has left',
          'Bearer gives the tune',
          'Porter takes the short lane',
        ],
        [
          'Runner arrives second',
          'Bearer arrives third with the tune',
          'Porter arrived first',
        ],
      ][a];
      const answers = [
        [
          'The gate is still shut. Nobody has departed.',
          'The bearer already has the baton. The procession has yet to move.',
          'The finishing ribbon is intact.',
        ],
        [
          'The runner left before the second bell.',
          'The bearer leads the music from behind the runner.',
          'The porter has taken the short lane. The finish remains open.',
        ],
        [
          'The runner still holds the earliest departure time.',
          'The bearer led the tune and crossed last.',
          'The porter arrived first after leaving last.',
        ],
      ][a];
      return {
        signature: 'bell.' + a + '.cord.' + b,
        marks: current,
        line: answers[b],
      };
    }
    case 'harbour': {
      const names = scores.harbour.controls[0].positions;
      const need = [0, 2, 1][c],
        carried = [...new Set([a, b])];
      const voice = [
        'The loader needs to count carts.',
        'The child needs to know whether they can afford fruit.',
        'The stallholder needs a day to open.',
      ][c];
      const detail = [
        'Three carts fit in the chalk spaces.',
        'Fifthday goes on the door.',
        'The price is still open. Nobody has promised free fruit.',
      ];
      return {
        signature:
          'dock.' + c + '.' + (carried.includes(need) ? 'received' : 'missing'),
        marks: [
          'Bow · ' + names[a],
          'Stern · ' + names[b],
          ...names
            .filter((_, i) => !carried.includes(i))
            .map((n) => 'Still ashore · ' + n),
        ],
        line:
          voice +
          ' ' +
          (carried.includes(need)
            ? detail[need]
            : 'The peg they need is missing. They send a question back across the water.'),
      };
    }
    case 'workshop': {
      const values = lift[a * 2 + b];
      return {
        signature: 'packet.' + a + '.' + b,
        marks: values.map(
          (n, i) => 'Ticket ' + String(i + 1) + ' · ' + n + ' mm',
        ),
        line:
          (a ? 'Damp' : 'Dry') +
          ' paper, ' +
          (b ? 'folded' : 'flat') +
          ' edge. The three lifts are ' +
          values.join(', ') +
          ' mm. Ren keeps all three on the packet, including the one nearest the clip.',
      };
    }
    case 'singer': {
      const fourth = [
        'One beat of rest',
        'Hill visitor · named line',
        'Family cadence · no words',
      ][a];
      const answer = [
        [
          'Teodora lets a whole breath pass.',
          'Sefa waits for a cue. “I can bring you our line tomorrow.”',
          'The room leaves the fourth beat empty with her.',
        ],
        [
          'Teodora introduces the hill line before she borrows it.',
          'Sefa gives her hill village’s version in her own voice.',
          'Three people join in at different places. Teodora puts Sefa’s name above the stool.',
        ],
        [
          'Teodora remembers the fall in the tune. The missing words stay missing.',
          'Sefa answers the wordless cadence with a recognisably different hill ending.',
          'A child finds the last note before Teodora does. Nobody has the grandmother’s missing words.',
        ],
      ][a][b];
      return {
        signature: 'fourth.' + a + '.voice.' + b,
        marks: [...stems, fourth],
        line: answer,
      };
    }
  }
}
export const trials = (s: CampaignState, o: Origin) =>
  Object.keys(s.flags)
    .filter((k) => k.startsWith(originFlag(o, 'heard.')) && s.flags[k] === true)
    .map((k) => k.slice(originFlag(o, 'heard.').length));
export function readyToSend(s: CampaignState, o: Origin): boolean {
  const t = trials(s, o);
  switch (o) {
    case 'archive':
    case 'harbour':
      return new Set(t.map((k) => k.split('.')[1])).size >= 2;
    case 'traveller':
      return (
        new Set(t.map((k) => k.split('.')[1])).size >= 2 &&
        new Set(t.map((k) => k.split('.')[3])).size >= 2
      );
    case 'workshop':
      return t.some((k) =>
        t.some(
          (j) =>
            k !== j &&
            (k.split('.')[1] === j.split('.')[1] ||
              k.split('.')[2] === j.split('.')[2]),
        ),
      );
    case 'singer':
      return new Set(t.map((k) => k.split('.')[1])).size >= 2;
  }
}
export const invitation: Record<Origin, string> = {
  archive: 'Invite two different visitors to open a drawer.',
  traveller: 'Try two cords at different moments in the procession.',
  harbour: 'Give two different people a crossing with the tally boat.',
  workshop: 'Compare two packets with just one setting changed.',
  singer: 'Play two different fourth beats, listening to whoever enters next.',
};
export function instrumentEffects(
  s: CampaignState,
  cmd: InstrumentCommand,
): Effect[] {
  const o = cmd.origin,
    score = scores[o];
  if (!score || s.player.origin !== o || !prior(s, o))
    throw Error(
      'Speak with your old neighbour and settle on a first arrangement.',
    );
  const place = originPlaces[o][cmd.action === 'return' ? 1 : 0];
  if (s.mapId !== place)
    throw Error('Find the keeper at the working instrument.');
  if ((cmd.action === 'return' || cmd.action === 'send') && cmd.side !== 0 && cmd.side !== 1)
    throw Error('Choose a receiver on this instrument.');
  if (cmd.action === 'return') {
    if (!s.flags[originFlag(o, 'sent')])
      throw Error('Send the instrument on its first journey.');
    return [mark(o, 'returned', cmd.side === 0 ? 'first' : 'second'),
      mark(o, 'replyEdition', String(s.flags[originFlag(o, 'sent')]) + ':' + String(s.flags[originFlag(o, 'edition')]))];
  }
  if (cmd.action === 'send') {
    if (!readyToSend(s, o)) throw Error(invitation[o]);
    if (s.flags[originFlag(o, 'last')] !== positions(s, o).join('.'))
      throw Error('Run this arrangement before you pack it.');
    return [
      mark(o, 'sent', cmd.side === 0 ? 'first' : 'second'),
      mark(o, 'edition', positions(s, o).join('.')),
    ];
  }
  if (cmd.action === 'set') {
    const control = score.controls[cmd.control];
    if (
      !control ||
      !Number.isInteger(cmd.value) ||
      !control.positions[cmd.value]
    )
      throw Error('This stop is outside the instrument.');
    return [mark(o, 'slot.' + cmd.control, cmd.value)];
  }
  const v = positions(s, o),
    read = impression(o, v);
  return [
    mark(o, 'heard.' + read.signature, true),
    mark(o, 'last', v.join('.')),
  ];
}
export function originInstrumentDiary(
  s: CampaignState,
  cmd: InstrumentCommand,
) {
  const o = cmd.origin,
    q = scores[o],
    v = positions(s, o),
    result = impression(o, v);
  if (cmd.action === 'set')
    return diaryEvent(
      'origin-work:' + o + '.set.' + cmd.control + '.' + cmd.value,
      'tool',
      o,
      q.controls[cmd.control].label,
      'I set ' +
        q.controls[cmd.control].label.toLowerCase() +
        ' to ' +
        q.controls[cmd.control].positions[cmd.value] +
        '.',
      {},
      { fixedToolPrefix: 'origin-work:' + o + '.set.' },
    );
  if (cmd.action === 'try')
    return diaryEvent(
      'origin-work:' + o + '.try.' + v.join('.'),
      'tool',
      o,
      q.title,
      'I worked the instrument. ' + result.line,
      {},
      { fixedToolPrefix: 'origin-work:' + o + '.try.' },
    );
  const away = cmd.action === 'return';
  return diaryEvent(
    'origin-work:' + o + '.' + cmd.action + '.' + cmd.side,
    'choice',
    o,
    away ? q.returnLabels[cmd.side] : q.send[cmd.side],
    'I chose where the next person would begin. ' +
      (away ? q.returnLines[cmd.side] : q.arrives[cmd.side]),
    {},
    'after-break',
  );
}
