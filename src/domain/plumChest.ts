import { diaryEvent } from './adventureEvents';
import type { CampaignState, Effect, Weave } from './types';

export const PLUM_LOFT = 'stage.plum-loft';
export const chestFaces = [
  'boot',
  'plum',
  'bell',
  'root',
  'moon',
  'comb',
] as const;
export type Face = (typeof chestFaces)[number];
export type Pose = readonly [front: Face, top: Face, right: Face];
export type Turn = 'left' | 'right' | 'up' | 'down';
export type ChestMove =
  | Turn
  | 'trace'
  | 'short'
  | 'long'
  | 'slide'
  | 'press'
  | 'set-down';
export type ChestCommand = { type: 'WorkPlumChest'; move: ChestMove };
export const homePose: Pose = ['boot', 'plum', 'bell'];
export const oppositeFace: Record<Face, Face> = {
  boot: 'root',
  root: 'boot',
  plum: 'moon',
  moon: 'plum',
  bell: 'comb',
  comb: 'bell',
};
const moves: readonly ChestMove[] = [
  'left',
  'right',
  'up',
  'down',
  'trace',
  'short',
  'long',
  'slide',
  'press',
  'set-down',
];

export const faceWork: Record<Face, { detail: string }> = {
  boot: {
    detail:
      'A boot heel has worn through the varnish. Underfoot, Fen cut two grooves on purpose. Long belongs to the brass bell. Short belongs to the wooden comb.',
  },
  plum: {
    detail:
      'The plum is a spring stud. The long brass tongue reaches it from the bell face when the plum is on top. A sugared fingerprint has stuck to the hollow.',
  },
  bell: {
    detail:
      'A sliding brass tongue sits inside the bell. Its long notch must meet the plum above it. Near the lip a child has scratched a boot with wheels.',
  },
  root: {
    detail:
      'You follow a root into a tiny wooden ear. A little foot on the far end picks up the knock. It is a way to send a rhythm along the floorboards.',
  },
  moon: {
    detail:
      'The moon is a spring stud. A short wooden tongue reaches it from the comb face while the moon is on top. Several shallow scratches circle the stud.',
  },
  comb: {
    detail:
      'Comb teeth sit on a short sliding tongue. Hold the moon above the comb when you slide. One tooth has a woollen sleeve so it can move without a clack.',
  },
};
export const chestWeave: Weave = {
  concepts: [
    'evidence',
    'interpretation',
    'perspective',
    'explanation',
    'values',
    'responsibility',
  ],
  framework: ['methods-and-tools', 'perspectives', 'scope', 'ethics'],
  aoks: ['MAT', 'ART'],
  atl: ['thinking', 'communication', 'social'],
  subjects: ['math-aa', 'theatre', 'design-tech', 'music'],
  thinking: { dok: 2, bloom: 'apply', solo: 'relational', fink: 'application' },
  minutes: 4,
};

export const performanceWeave: Weave = {
  ...chestWeave,
  aoks: ['ART', 'MAT', 'LAN'],
  subjects: ['music', 'math-aa', 'theatre', 'lang-lit'],
  thinking: {
    dok: 3,
    bloom: 'analyse',
    solo: 'relational',
    fink: 'integration',
  },
};

export const craftWeave: Weave = {
  ...chestWeave,
  aoks: ['ART', 'NAT', 'TEC'],
  subjects: ['design-tech', 'physics', 'music'],
  thinking: {
    dok: 3,
    bloom: 'evaluate',
    solo: 'relational',
    fink: 'application',
  },
};

export function turnChest([front, top, right]: Pose, turn: Turn): Pose {
  switch (turn) {
    case 'left':
      return [oppositeFace[right], top, front];
    case 'right':
      return [right, top, oppositeFace[front]];
    case 'up':
      return [top, oppositeFace[front], right];
    case 'down':
      return [oppositeFace[top], front, right];
  }
}

// Opposite faces alone would also admit mirror images. Only the 24 rotations of this box are physical.
function poses() {
  const known = new Map<string, Pose>();
  const queue: Pose[] = [homePose];
  for (let index = 0; index < queue.length; index++) {
    const here = queue[index],
      key = here.join('.');
    if (known.has(key)) continue;
    known.set(key, here);
    queue.push(turnChest(here, 'up'), turnChest(here, 'right'));
  }
  return known;
}
export const chestPoses = poses();
type Flags = CampaignState['flags'];
export function chestPose(flags: Flags): Pose {
  return chestPoses.get(String(flags['plum.pose'])) ?? homePose;
}
export function chestPosition([front, top, right]: Pose) {
  return (
    'The ' +
    front +
    ' faces you. The ' +
    top +
    ' is on top and the ' +
    right +
    ' is on your right.'
  );
}
export function chestStep(flags: Flags, move: ChestMove) {
  if (!moves.includes(move))
    throw new Error('Choose a face or a working part of the chest.');
  const set = (id: string, value: string | boolean): Effect => ({
    setFlag: 'plum.' + id,
    value,
  });
  const pose = chestPose(flags),
    [front, top] = pose;
  const ring = flags['plum.ring'] === 'long' ? 'long' : 'short';
  const result = (text: string, effects: Effect[] = [], next: Pose = pose) => ({
    text,
    effects,
    pose: next,
  });
  if (
    move === 'set-down' ||
    move === 'up' ||
    move === 'down' ||
    move === 'left' ||
    move === 'right'
  ) {
    const next = move === 'set-down' ? homePose : turnChest(pose, move);
    return result(
      move === 'set-down'
        ? 'The boot faces you again. Both drawers keep their fittings.'
        : 'The chest settles on the felt. ' + chestPosition(next),
      [set('pose', next.join('.'))],
      next,
    );
  }
  if (move === 'trace')
    return result(faceWork[front].detail, [set('felt.' + front, true)]);
  if (move === 'short' || move === 'long')
    return result(
      move === 'short'
        ? 'One shallow groove passes your thumb. The collar stops at the short notch.'
        : 'Your thumb travels across two grooves. The collar stops at the long notch.',
      [set('ring', move)],
    );
  if (move === 'slide') {
    if (front !== 'bell' && front !== 'comb')
      return result(
        'There is no sliding tongue on this face. The bell has a brass one and the comb has a wooden one.',
      );
    const brass = front === 'bell',
      needed = brass ? 'plum' : 'moon',
      length = brass ? 'long' : 'short';
    if (top !== needed)
      return result(
        'The tongue slides to an empty edge. It needs the ' +
          needed +
          ' above the ' +
          front +
          '. You can turn the box back.',
      );
    if (ring !== length)
      return result(
        'The tongue grazes the socket and slips back. Its twin groove needs the ' +
          length +
          ' notch on the collar.',
      );
    return result(
      brass
        ? 'The brass tongue catches under the plum. Its spring stud lifts a little.'
        : 'The wooden tongue catches under the moon. The sleeve keeps the click quiet.',
      [set('catch.' + needed, true)],
    );
  }
  if (front !== 'plum' && front !== 'moon')
    return result(
      'The surface is solid here. The raised plum and crescent moon each have a spring underneath.',
    );
  if (flags['plum.catch.' + front] !== true)
    return result(
      'The stud moves under your finger, then springs back. Feel the ' +
        (front === 'plum' ? 'bell' : 'comb') +
        ' face for the missing tongue.',
    );
  return result(
    front === 'plum'
      ? 'The brass drawer swings out. A wheel rolls across your palm. On it the touring company plays three taps and a hush. A fourth wheel is missing.'
      : 'The quiet drawer opens. Three taps and a hush are scratched into its cradle. Inside, a tiny shell knocks the three taps back. The hush lasts as long as it wants.',
    [set('open.' + front, true)],
  );
}
export function chestEffects(s: CampaignState, cmd: ChestCommand): Effect[] {
  if (s.mapId !== PLUM_LOFT)
    throw new Error('The orchard company keeps its chest in the plum loft.');
  return chestStep(s.flags, cmd.move).effects;
}
export function chestDiary(previous: CampaignState, cmd: ChestCommand) {
  const result = chestStep(previous.flags, cmd.move);
  const key = [
    'plum',
    cmd.move,
    result.pose.join('.'),
    String(previous.flags['plum.ring'] ?? 'short'),
    result.effects.length ? 'engaged' : 'missed',
  ].join(':');
  return diaryEvent(
    key,
    'tool',
    'plum.chest',
    'Under the plum-tree stage',
    'I worked the orchard chest. ' + result.text,
    { outcome: result.effects.length ? 'checked' : 'tried' },
    { fixedToolPrefix: 'plum:' },
  );
}

export type Beat = 'rim' | 'board' | 'rest' | 'clear';
export type BeatCommand = { type: 'StrikeOrchardBeat'; beat: Beat };
const strokes: Record<Exclude<Beat, 'clear'>, string> = {
  rim: 'R',
  board: 'B',
  rest: '–',
};
const strokeName: Record<string, string> = {
  R: 'rim',
  B: 'board',
  '–': 'rest',
};
export function currentOrchardBar(flags: Flags) {
  const marks = flags['plum.bar'];
  return typeof marks === 'string' && /^[RB–]{0,4}$/.test(marks) ? marks : '';
}
export function orchardBeat(flags: Flags, beat: Beat) {
  const last = currentOrchardBar(flags);
  if (beat === 'clear')
    return {
      bar: '',
      report:
        'Fen stills the rim with her thumb. The next beat has room to start.',
    };
  if (!Object.hasOwn(strokes, beat))
    throw new Error('Choose the rim, the board or a rest.');
  const bar = (last.length === 4 ? '' : last) + strokes[beat];
  if (bar === 'BBB–')
    return {
      bar,
      report:
        'The child feels three knocks travel along the boards. In the rest it knocks back, twice. Fen waits. The third comes at its own pace.',
    };
  if (bar === 'RRR–')
    return {
      bar,
      report:
        'Three bright rim notes reach Pia in the wings. The felt under the drum keeps this call off the floor. The little shell keeps licking biscuit crumbs through the rest.',
    };
  if (bar === '––––')
    return {
      bar,
      report:
        'Four open beats. You can hear Tallowheel crunching. Fen stops tapping her foot to let the sound carry.',
    };
  const heard = bar.split('').filter((x) => x === 'B').length;
  const names = bar
    .split('')
    .map((x) => strokeName[x])
    .join(', ');
  return {
    bar,
    report:
      bar.length === 4
        ? 'Fen plays the bar back: ' +
          names +
          '. The shell feels ' +
          heard +
          ' floor ' +
          (heard === 1 ? 'knock.' : 'knocks.')
        : 'Beat ' +
          bar.length +
          ' of four. ' +
          (beat === 'rim'
            ? 'The rim rings above the felt.'
            : beat === 'board'
              ? 'The plank answers under your boot.'
              : 'Your hands stay still.'),
  };
}
export function beatEffects(s: CampaignState, cmd: BeatCommand): Effect[] {
  if (s.mapId !== PLUM_LOFT)
    throw new Error('The rim and the sounding board are in Fen’s loft.');
  const result = orchardBeat(s.flags, cmd.beat);
  const effects: Effect[] = [{ setFlag: 'plum.bar', value: result.bar }];
  if (result.bar === 'BBB–' || result.bar === 'RRR–')
    effects.push({
      setFlag: 'plum.played.' + (result.bar === 'BBB–' ? 'board' : 'rim'),
      value: true,
    });
  return effects;
}
export function beatDiary(s: CampaignState, cmd: BeatCommand) {
  const next = orchardBeat(s.flags, cmd.beat);
  return diaryEvent(
    'plum:bar:' + next.bar,
    'tool',
    'plum.drum',
    'My bar for the orchard',
    'I ' +
      (cmd.beat === 'clear'
        ? 'stilled the drum'
        : cmd.beat === 'rest'
          ? 'left a rest'
          : 'played the ' + cmd.beat) +
      '. ' +
      next.report,
    { outcome: 'checked' },
    { fixedToolPrefix: 'plum:bar:' },
  );
}
