import { diaryEvent } from './adventureEvents';
import type { CampaignState, Effect, FlagValue, Weave } from './types';

export const clockRoom = 'island.quarter-house';
export const clockDock = 'island.dock';
export const quays = ['awning', 'rail', 'slip'] as const;
export type Quay = (typeof quays)[number];
export const quayNames: Record<Quay, string> = {
  awning: 'the awning',
  rail: 'the open rail',
  slip: 'the slipway',
};
export const furniture = ['horn', 'bench', 'board'] as const;
export type Fitting = (typeof furniture)[number];
export const fittingNames: Record<Fitting, string> = {
  horn: 'portable horn',
  bench: 'dry bench',
  board: 'writing board',
};
export const cards = ['walk', 'listen', 'stamp'] as const;
export type Card = (typeof cards)[number];
export const cardNames: Record<Card, string> = {
  walk: 'cross one pier',
  listen: 'listen here',
  stamp: 'stamp the hearing',
};
export const turns = [
  {
    name: 'Lanterns down',
    colour: '#607caa',
    sound: 'One low brass knock. The outgoing skiff is already at the rail.',
  },
  {
    name: 'Kettle call',
    colour: '#d79b63',
    sound: 'The lid rings twice and the sail comes off its peg.',
  },
  {
    name: 'Chain lifted',
    colour: '#62aaa3',
    sound: 'Three links scrape over wood. A worker comes up for air.',
  },
  {
    name: 'High water',
    colour: '#5e99be',
    sound: 'A wave strikes the belly of the dock. The horn turns toward land.',
  },
  {
    name: 'The narrow shadow',
    colour: '#ae7f9f',
    sound: 'Someone folds the awning. The outer rail goes into shade.',
  },
  {
    name: 'Last tying-up',
    colour: '#8077a2',
    sound: 'The pilots tie two last turns. A teaspoon slips into a pocket.',
  },
] as const;
interface ListeningPlace {
  people: readonly string[];
  line: string;
}
const hearing = (people: string[], line: string): ListeningPlace => ({
  people,
  line,
});
const timetable: Record<Quay, ListeningPlace[]> = {
  awning: [
    hearing(['Oda', 'Ivo'], 'Ivo can copy the first note under cover. Oda asks him to save half a page.'),
    hearing(
      ['Mara', 'Tavi'],
      'Mara knows the verse by heart. Tavi can smell her kettle before he hears the bell.',
    ),
    hearing(['Oda'], 'Oda practices the breath before the missing bar. She lets that one go by.'),
    hearing([], 'The patch of dry boards is empty. A chalk slate rests against the wall.'),
    hearing(['Ivo', 'Mara'], 'Ivo fingers the edge of the patch. One of Mara’s spoons is propping it up.'),
    hearing(
      ['Tavi'],
      'Tavi takes the last dry square apart. The board comes away with a drawing on its back.',
    ),
  ],
  rail: [
    hearing(['Joss'], 'Joss counts mooring eyes with one boot on the outgoing skiff.'),
    hearing([], 'A sail covers the horn. Nobody signed the card where the pier swings away.'),
    hearing(
      ['Ivo', 'Joss'],
      'Ivo holds a page to the sail. Joss reads over his shoulder and calls the chain clear.',
    ),
    hearing(
      ['Mara', 'Tavi'],
      'The old horn reaches Mara here. Tavi holds a hand over the sheet while the spray blows through.',
    ),
    hearing(
      ['Oda', 'Joss'],
      'Oda’s four beats carry across the uncovered rail. Joss hears the third through a taut rope.',
    ),
    hearing(
      ['Joss', 'the second pilot'],
      'Both pilots can stop at last. The deck crew’s boat has already gone.',
    ),
  ],
  slip: [
    hearing(
      ['the joist painter'],
      'The painter has one hand on a wet joist. An empty hook carries a coil of blue twine.',
    ),
    hearing([], 'A ferry passes the work float. The empty cup under the steps is still warm.'),
    hearing(
      ['Siv', 'the deck crew'],
      'The crew takes its break. Siv lifts a hand toward the dry bench; she leaves her voice at the slipway.',
    ),
    hearing(
      ['Siv'],
      'Siv measures the tide on the third plank. She points to the line she can see from work.',
    ),
    hearing(
      ['the deck crew', 'the caller'],
      'Five people can read a page held low. The caller is too far below the horn to hear it.',
    ),
    hearing([], 'The plank has a wet ring where the water jug stood. The deck crew has sailed home.'),
  ],
};
type S = Pick<CampaignState, 'flags'>;
export const tideFlag = (s: S, k: string) => s.flags['tideclock.' + k];
const set = (k: string, value: FlagValue = true): Effect => ({
  setFlag: 'tideclock.' + k,
  value,
});
function bounded(v: FlagValue | undefined, high: number) {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= high ? v : 0;
}
export function clockPosition(s: S) {
  const quay = quays.find((q) => q === tideFlag(s, 'quay')) ?? 'awning';
  return {
    phase: bounded(tideFlag(s, 'phase'), 5),
    lap: bounded(tideFlag(s, 'lap'), 999999),
    quay,
    cursor: bounded(tideFlag(s, 'cursor'), 2),
  };
}
export function quayReading(phase: number, quay: Quay) {
  return timetable[quay][phase];
}
function permutation<T extends string>(
  raw: FlagValue | undefined,
  keys: readonly T[],
  fallback: readonly T[],
): T[] {
  const parts = typeof raw === 'string' ? raw.split('|') : [];
  return parts.length === keys.length && keys.every((k) => parts.includes(k))
    ? (parts as T[])
    : [...fallback];
}
export const mothOrder = (s: S) => permutation(tideFlag(s, 'order'), cards, cards);
export const planFor = (s: S, issued = false) =>
  permutation(tideFlag(s, issued ? 'issued' : 'fittings'), furniture, furniture);
export const signedFloorPlan = (s: S) => planFor(s, true).join('|') === tideFlag(s, 'issued');
export function stamped(s: S, quay: Quay, phase: number) {
  return tideFlag(s, 'stamp.' + quay + '.' + phase) === true;
}
export function allStamped(s: S) {
  return quays.flatMap((quay) =>
    turns.flatMap((_, phase) => (stamped(s, quay, phase) ? [{ quay, phase }] : [])),
  );
}
export function impression(s: S): { quay: Quay; phase: number } | null {
  const raw = tideFlag(s, 'take');
  if (typeof raw !== 'string') return null;
  const [place, rawPhase] = raw.split('|'),
    quay = quays.find((q) => q === place),
    phase = Number(rawPhase);
  return quay && /^[0-5]$/.test(rawPhase) ? { quay, phase } : null;
}
export function placeFitting(s: S, fixture: Fitting, at: Quay) {
  const order = planFor(s),
    old = order.indexOf(fixture),
    dest = quays.indexOf(at);
  [order[old], order[dest]] = [order[dest], order[old]];
  return order;
}
export function moveCard(s: S, card: Card, direction: 'earlier' | 'later') {
  const order = mothOrder(s),
    from = order.indexOf(card),
    to = Math.max(0, Math.min(2, from + (direction === 'earlier' ? -1 : 1)));
  [order[from], order[to]] = [order[to], order[from]];
  return order;
}
export const proposals = {
  crew: ['board', 'horn', 'bench'],
  pilots: ['bench', 'board', 'horn'],
} as const satisfies Record<string, readonly Fitting[]>;
export function plansRead(order: readonly Fitting[]) {
  const horn = quays[order.indexOf('horn')],
    board = quays[order.indexOf('board')],
    bench = quays[order.indexOf('bench')];
  const crew =
    bench === 'slip'
      ? 'Siv and the deck crew can sit down together at break.'
      : board === 'slip'
        ? 'Siv can point to the work marks from her own plank.'
        : 'Siv can hear a call at the slipway, but her break stays too short for the walk to a dry seat.';
  const pilots =
    horn === 'rail'
      ? 'Joss and the second pilot hear the late call without leaving the moorings.'
      : board === 'rail'
        ? 'The pilots can read the next time from the line at their boots.'
        : 'The late pilots get the bench. One stays behind to listen for the call from another pier.';
  const other =
    board === 'awning'
      ? 'Ivo can keep a dry record of both readings.'
      : horn === 'awning'
        ? 'Oda can carry the quiet bar under cover.'
        : 'Mara gets a place under cover to put down the kettle.';
  return { crew, pilots, other };
}
export const promises = {
  rest: {
    who: 'Siv',
    thing: 'bench',
    pier: 'slip',
    words: 'Sit before the break ends',
  },
  mark: {
    who: 'Joss',
    thing: 'board',
    pier: 'rail',
    words: 'Read the time with one foot on the mooring',
  },
  shelter: {
    who: 'Ivo',
    thing: 'board',
    pier: 'awning',
    words: 'Keep the hearing sheet dry',
  },
} as const;
export type PromiseKey = keyof typeof promises;
type Leaf = 'blue' | 'rust';
export function tracing(s: S, leaf: Leaf) {
  const raw = tideFlag(s, 'leaf.' + leaf);
  const order = permutation(raw, furniture, furniture);
  return raw === order.join('|') ? order : null;
}
export function plankReading(order: readonly Fitting[], key: PromiseKey) {
  const promise = promises[key];
  const distance = Math.abs(order.indexOf(promise.thing) - quays.indexOf(promise.pier));
  return distance === 0
    ? 'within reach at the same post'
    : distance === 1
      ? 'one plank away'
      : 'two planks away';
}
export function compareLeaves(s: S, key: PromiseKey) {
  const blue = tracing(s, 'blue'),
    rust = tracing(s, 'rust');
  if (!blue || !rust) throw Error('Take one blue rubbing and one rust rubbing after the walks.');
  if (blue.join('|') === rust.join('|'))
    throw Error(
      'Both leaves trace the same floor. Move a fitting, walk both shifts and take another rubbing.',
    );
  const p = promises[key];
  return (
    p.who +
    ' asks to “' +
    p.words.toLowerCase() +
    '.” On blue the ' +
    fittingNames[p.thing] +
    ' is ' +
    plankReading(blue, key) +
    '. On rust it is ' +
    plankReading(rust, key) +
    '.'
  );
}
export type TideCommand = { type: 'WorkTideClock' } & (
  | { act: 'go'; quay: Quay }
  | { act: 'wait' }
  | { act: 'listen' }
  | { act: 'stamp' }
  | { act: 'reorder'; card: Card; direction: 'earlier' | 'later' }
  | { act: 'reverse' }
  | { act: 'step' }
  | { act: 'round' }
  | { act: 'place'; fixture: Fitting; quay: Quay }
  | { act: 'proposal'; team: keyof typeof proposals }
  | { act: 'try'; team: keyof typeof proposals }
  | { act: 'trace'; leaf: Leaf }
  | { act: 'compare'; promise: PromiseKey }
  | { act: 'issue' }
  | { act: 'read'; team: keyof typeof proposals }
);
const apply = (s: S, eff: Effect[]): S => ({
  flags: {
    ...s.flags,
    ...Object.fromEntries(eff.flatMap((e) => ('setFlag' in e ? [[e.setFlag, e.value]] : []))),
  },
});
function wind(s: S): Effect[] {
  const { phase, lap } = clockPosition(s);
  return phase === 5
    ? [
        set('phase', 0),
        set('lap', Math.min(lap + 1, 999999)),
        set('quay', 'awning'),
        set('take', ''),
        set('remembered', allStamped(s).length > 0 || tideFlag(s, 'remembered') === true),
      ]
    : [set('phase', phase + 1)];
}
function take(s: S) {
  const { quay, phase } = clockPosition(s);
  return [set('take', quay + '|' + phase), set('heard.' + quay + '.' + phase)];
}
function stamp(s: S, soft: boolean) {
  const view = impression(s);
  if (!view) {
    if (soft) return [set('mothNote', 'blank')];
    throw Error('Open the listening tube at a pier first. A quiet pier can leave a print too.');
  }
  return [set('stamp.' + view.quay + '.' + view.phase), set('mothNote', 'kept')];
}
function stepMoth(s: S): Effect[] {
  const { quay, cursor } = clockPosition(s),
    order = mothOrder(s);
  const direction = tideFlag(s, 'reverse') === true ? -1 : 1;
  const card = order[cursor];
  const effects =
    card === 'walk'
      ? [set('quay', quays[(quays.indexOf(quay) + direction + 3) % 3])]
      : card === 'listen'
        ? take(s)
        : stamp(s, true);
  effects.push(set('lastCard', card), set('cursor', (cursor + 1) % 3));
  if (cursor === 2) effects.push(...wind(apply(s, effects)), set('run.' + order.join('.')));
  return effects;
}
export function tideEffects(s: CampaignState, cmd: TideCommand): Effect[] {
  if (cmd.act === 'read') {
    if (s.mapId !== clockDock || !signedFloorPlan(s))
      throw Error('Take a signed floor plan back to the island dock first.');
    return [set('read.' + cmd.team), set('readPlan.' + cmd.team, tideFlag(s, 'issued')!)];
  }
  if (s.mapId !== clockRoom) throw Error('The quarter clock is under the island pier.');
  switch (cmd.act) {
    case 'go':
      return [set('quay', cmd.quay)];
    case 'wait':
      return wind(s);
    case 'listen':
      return take(s);
    case 'stamp':
      return stamp(s, false);
    case 'reorder': {
      const old = mothOrder(s).join('|'),
        next = moveCard(s, cmd.card, cmd.direction).join('|');
      return old === next ? [] : [set('order', next), set('cursor', 0), set('changedOrder')];
    }
    case 'reverse':
      return [set('reverse', tideFlag(s, 'reverse') !== true), set('cursor', 0)];
    case 'step':
      return stepMoth(s);
    case 'round': {
      let copy: S = s;
      const effects: Effect[] = [];
      for (let n = 0; n < 18; n++) {
        const next = stepMoth(copy);
        effects.push(...next);
        copy = apply(copy, next);
      }
      return [...effects, set('automatic')];
    }
    case 'place':
      return [set('fittings', placeFitting(s, cmd.fixture, cmd.quay).join('|'))];
    case 'proposal':
      return [set('fittings', proposals[cmd.team].join('|'))];
    case 'try': {
      const [quay, phase] = cmd.team === 'crew' ? (['slip', 2] as const) : (['rail', 5] as const);
      if (!stamped(s, quay, phase))
        throw Error(
          cmd.team === 'crew'
            ? 'Visit the slipway at Chain lifted and stamp the break.'
            : 'Visit the rail at Last tying-up and stamp the late call.',
        );
      return [set('trial.' + cmd.team, planFor(s).join('|'))];
    }
    case 'trace': {
      const order = planFor(s).join('|');
      if (!(['crew', 'pilots'] as const).every((team) => tideFlag(s, 'trial.' + team) === order))
        throw Error('Try this floor with both shifts before putting the tracing paper down.');
      return [set('leaf.' + cmd.leaf, order)];
    }
    case 'compare': {
      compareLeaves(s, cmd.promise);
      return [
        set('compared', cmd.promise),
        set('compared.' + cmd.promise, tideFlag(s, 'leaf.blue') + '/' + tideFlag(s, 'leaf.rust')),
      ];
    }
    case 'issue': {
      const proposal = planFor(s).join('|');
      if (!(['crew', 'pilots'] as const).every((team) => tideFlag(s, 'trial.' + team) === proposal))
        throw Error(
          'Walk this arrangement with both shifts. Moving a fitting changes what each crew can use.',
        );
      if (tideFlag(s, 'issued') === proposal) return [];
      return [set('issued', proposal), set('read.crew', false), set('read.pilots', false)];
    }
  }
}
export function clockTopics(act: TideCommand['act']): Weave {
  if (['place', 'proposal', 'try', 'trace', 'compare', 'issue', 'read'].includes(act))
    return {
      concepts: ['values', 'power', 'responsibility', 'perspective', 'justification'],
      framework: ['ethics', 'perspectives', 'scope'],
      aoks: ['HUM', 'ART', 'POL'],
      subjects: ['design-tech', 'geography', 'global-politics'],
      atl: ['social', 'thinking'],
    };
  return {
    concepts: ['evidence', 'explanation', 'objectivity', 'interpretation'],
    framework: ['methods-and-tools', 'scope', 'perspectives'],
    aoks: ['MAT', 'HUM', 'TEC'],
    subjects: ['computer-science', 'math-ai', 'geography'],
    atl: ['research', 'thinking'],
  };
}
export function clockDiary(before: CampaignState, after: CampaignState, cmd: TideCommand) {
  const was = clockPosition(before),
    now = clockPosition(after),
    act = cmd.act;
  let title = '',
    text = '';
  if (act === 'go') {
    title = 'Across the quarter house';
    text = 'I carried the moth to ' + quayNames[cmd.quay] + '. ' + turns[now.phase].sound;
  }
  if (act === 'wait') {
    title = now.phase === 0 ? 'Back at the first lantern' : 'One tide mark later';
    text =
      now.phase === 0
        ? 'I came back under the awning. My stamps were still in my pocket.'
        : 'I waited through ' + turns[was.phase].name + ' and saw the pier at ' + turns[now.phase].name + '.';
  }
  if (act === 'listen' || act === 'stamp') {
    const view = impression(after)!;
    title = act === 'stamp' ? 'A hearing on the tide card' : 'Under the quarter clock';
    const hearing = quayReading(view.phase, view.quay);
    text =
      'I ' +
      (act === 'stamp' ? 'kept a print of' : 'listened at') +
      ' ' +
      quayNames[view.quay] +
      ' at ' +
      turns[view.phase].name +
      '. ' +
      hearing.line;
  }
  if (act === 'reorder' || act === 'reverse') {
    title = 'Three instructions under a paper wing';
    text =
      'I set the moth to ' +
      mothOrder(after)
        .map((c) => cardNames[c])
        .join(', then ') +
      '. It walks ' +
      (tideFlag(after, 'reverse') ? 'against' : 'with') +
      ' the ferry round.';
  }
  if (act === 'step' || act === 'round') {
    title = act === 'round' ? 'The moth takes a whole watch' : 'One clockwork instruction';
    text =
      act === 'round'
        ? 'I left the moth all six turns. It brought back a card from the same stops my three instructions would have visited by hand.'
        : 'I watched the moth ' +
          cardNames[mothOrder(before)[was.cursor]] +
          '. Its card carries the place and time it actually heard.';
  }
  if (act === 'place' || act === 'proposal') {
    title = 'Three fittings on the pier';
    text =
      'I set out ' +
      planFor(after)
        .map((f, i) => fittingNames[f] + ' at ' + quayNames[quays[i]])
        .join(', ') +
      '.';
  }
  if (act === 'try' || act === 'read') {
    title = cmd.team === 'crew' ? 'Siv’s walk at break' : 'The pilots at tying-up';
    text =
      'I walked the ' +
      (act === 'read' ? 'signed' : 'trial') +
      ' plan. ' +
      plansRead(planFor(after, act === 'read'))[cmd.team];
  }
  if (act === 'trace') {
    title = 'A pencil rubbing of the pier';
    text =
      'I took the ' +
      cmd.leaf +
      ' leaf from two walks. ' +
      planFor(after)
        .map((f, i) => fittingNames[f] + ' at ' + quayNames[quays[i]])
        .join(', ') +
      '.';
  }
  if (act === 'compare') {
    title = 'Two leaves under the same light';
    text = 'I held both layouts up. ' + compareLeaves(after, cmd.promise);
  }
  if (act === 'issue') {
    title = 'The floor plan reaches the island';
    text =
      'I sent the fittings after two walks with different shifts. ' + plansRead(planFor(after, true)).other;
  }
  const key = [
    'tideclock',
    act,
    was.phase,
    was.quay,
    JSON.stringify(cmd),
    planFor(after).join('-'),
    mothOrder(after).join('-'),
    now.cursor,
    tideFlag(after, 'reverse') === true,
    ...(act === 'compare' ? [tideFlag(after, 'leaf.blue'), tideFlag(after, 'leaf.rust')] : []),
  ].join(':');
  return diaryEvent(key, 'tool', 'tide-clock', title, text, {}, 'after-break');
}
