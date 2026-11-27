import { diaryEvent } from './adventureEvents';
import type { CampaignState, Effect, Weave } from './types';

export const lensBench = 'observatory.loan-loft',
  lensTheatre = 'stage.rehearsal';
export const fittings = {
  field: 'a field lens',
  close: 'a close lens',
  stage: 'a turning stage',
  sleeve: 'a lift-off sleeve',
} as const;
export type Fitting = keyof typeof fittings;
export const fittingIds = Object.keys(fittings) as Fitting[];
export const lensSamples = {
  cloth: 'the travelling curtain',
  petal: 'the pressed petal study',
  fresh: 'the fresh petal study',
  marks: 'the ruled glass',
} as const;
export type Slide = keyof typeof lensSamples;
export const windows = { centre: [3, 3], north: [3, 1], east: [5, 3], south: [3, 5], west: [1, 3] } as const;
export type Window = keyof typeof windows;
export type Frame = 'eye' | 'whole' | 'close';
export const stopNames = { broad: 'the broad doorway', slit: 'the narrow opening' } as const;
export const seatNames = {
  middle: 'the centre seat',
  wing: 'the seat in the wing',
  step: 'the step beside the curtain',
} as const;
export const drawings = { rays: 'the straight chalk rays', fronts: 'the expanding chalk fronts' } as const;
export type Stop = keyof typeof stopNames;
export type Seat = keyof typeof seatNames;
export type Drawing = keyof typeof drawings;
// Two purposely simple playhouse designs. Values are counts of four little lamps lit on a seat card.
// Independent rehearsal slips belong to the fictional theatre. Neither card measures a real historical apparatus.
const predictions = {
  broad: { rays: [4, 2, 0], fronts: [4, 2, 0] },
  slit: { rays: [4, 0, 0], fronts: [4, 2, 1] },
};
const rehearsal = {
  broad: [
    [4, 4, 4],
    [2, 1, 2],
    [0, 0, 0],
  ],
  slit: [
    [4, 3, 4],
    [2, 1, 2],
    [1, 0, 1],
  ],
};
const seatOrder: Seat[] = ['middle', 'wing', 'step'];
export const predictLamps = (stop: Stop, seat: Seat, drawing: Drawing) =>
  predictions[stop][drawing][seatOrder.indexOf(seat)];
export const seenLamps = (stop: Stop, seat: Seat) => rehearsal[stop][seatOrder.indexOf(seat)];
export const readingsAt = (s: S, stop: Stop, seat: Seat) =>
  Number(s.flags['optics.readings.' + stop + '.' + seat] || 0);
export const notices = {
  join: 'a silver thread joining the two banks',
  space: 'a little darkness between the banks',
  window: 'a second window beside the stage',
} as const;
export type Notice = keyof typeof notices;
export type Mark = 'star' | 'knot';
export type OpticRead = { slide: Slide; frame: Frame; window: Window; turn: number; cover: boolean };
type S = Pick<CampaignState, 'flags'>;
const own = (obj: object, key: unknown) => typeof key === 'string' && Object.hasOwn(obj, key);
const f = (key: string, value: string | boolean | number): Effect => ({ setFlag: 'optics.' + key, value });
export const lensWeave: Weave = {
  concepts: [
    'evidence',
    'interpretation',
    'certainty',
    'explanation',
    'objectivity',
    'perspective',
    'responsibility',
    'justification',
  ],
  framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'],
  aoks: ['NAT', 'ART', 'MAT', 'TEC'],
  subjects: ['biology', 'physics', 'visual-arts', 'theatre', 'design-tech', 'math-aa'],
  atl: ['thinking', 'research', 'communication'],
  thinking: { dok: 3, bloom: 'evaluate', fink: 'integration', solo: 'relational' },
};
function pairFrom(raw: unknown): Fitting[] {
  if (typeof raw !== 'string') return [];
  const ids = raw.split('+').filter((id) => own(fittings, id)) as Fitting[];
  return [...new Set(ids)].slice(0, 2);
}
export const lensPicks = (s: S) => pairFrom(s.flags['optics.picks']);
export const borrowed = (s: S) => pairFrom(s.flags['optics.loan']);
export const preset = (s: S, mark: Mark) => pairFrom(s.flags['optics.preset.' + mark]);
export function lensView(s: S): OpticRead {
  const p = s.flags;
  return {
    slide: own(lensSamples, p['optics.slide']) ? (p['optics.slide'] as Slide) : 'cloth',
    frame: p['optics.frame'] === 'close' ? 'close' : p['optics.frame'] === 'whole' ? 'whole' : 'eye',
    window: own(windows, p['optics.window']) ? (p['optics.window'] as Window) : 'centre',
    turn: [0, 1, 2, 3].includes(Number(p['optics.turn'])) ? Number(p['optics.turn']) : 0,
    cover: p['optics.cover'] !== false,
  };
}
export const readKey = (r: OpticRead) =>
  [r.slide, r.frame, r.frame === 'close' ? r.window : 'centre', r.turn, r.cover ? 'on' : 'off'].join('~');
export function unpackRead(raw: unknown): OpticRead | undefined {
  if (typeof raw !== 'string') return;
  const [slide, frame, win, t, cover, ...rest] = raw.split('~');
  if (
    rest.length ||
    !own(lensSamples, slide) ||
    !own(windows, win) ||
    !['eye', 'whole', 'close'].includes(frame) ||
    !['0', '1', '2', '3'].includes(t) ||
    !['on', 'off'].includes(cover)
  )
    return;
  return {
    slide: slide as Slide,
    frame: frame as Frame,
    window: win as Window,
    turn: Number(t),
    cover: cover === 'on',
  };
}
const material: Record<Slide, readonly string[]> = {
  cloth: ['.......', '..##...', '.#..#..', '..#..#.', '...#.#.', '....#..', '.......'],
  fresh: ['.......', '..###..', '.#...#.', '.#...#.', '..#.#..', '...#...', '.......'],
  petal: ['.......', '..###..', '.#.#.#.', '.#.#.#.', '..#.#..', '...#...', '.......'],
  marks: ['.......', '.#.#.#.', '.#.#.#.', '.#.#.#.', '.#.#.#.', '.#.#.#.', '.......'],
};
export interface LensTile {
  x: number;
  y: number;
  mark: 'blank' | 'edge' | 'score' | 'both';
}
/** The fixed holder and the turning sample have independent coordinates in this model. */
export function lensTiles(r: OpticRead): LensTile[] {
  const [cx, cy] = r.frame === 'close' ? windows[r.window] : [3, 3],
    radius = r.frame === 'close' ? 1 : 3;
  const tiles: LensTile[] = [];
  for (let y = cy - radius; y <= cy + radius; y++)
    for (let x = cx - radius; x <= cx + radius; x++) {
      if (r.frame === 'eye' && (x % 2 === 0 || y % 2 === 0)) continue;
      let sx = x,
        sy = y;
      for (let i = 0; i < r.turn; i++) [sx, sy] = [sy, 6 - sx];
      const edge = material[r.slide][sy][sx] === '#',
        score = r.cover && x === 3 && y >= 1 && y <= 5;
      tiles.push({ x, y, mark: edge ? (score ? 'both' : 'edge') : score ? 'score' : 'blank' });
    }
  return tiles;
}
export const tileNames = {
  blank: 'open',
  edge: 'dark edge',
  score: 'fine light line',
  both: 'dark edge under a fine light line',
};
export function opticCaption(r: OpticRead) {
  const ts = lensTiles(r);
  const edges = ts.filter((t) => t.mark === 'edge' || t.mark === 'both').length,
    lines = ts.filter((t) => t.mark === 'score' || t.mark === 'both').length;
  return (
    lensSamples[r.slide] +
    ' · ' +
    (r.frame === 'eye'
      ? 'nine locator squares'
      : r.frame === 'whole'
        ? 'whole field'
        : r.window + ' close field') +
    ' · ' +
    r.turn * 90 +
    '° · sleeve ' +
    (r.cover ? 'down' : 'up') +
    '. ' +
    edges +
    ' dark squares and ' +
    lines +
    ' squares with a fine line in ' +
    ts.length +
    '.'
  );
}
export type LensCommand = { type: 'WorkLensLoan' } & (
  | { act: 'pick'; fitting: Fitting }
  | { act: 'putMark' | 'useMark'; mark: Mark }
  | { act: 'borrow' | 'return' | 'turn' | 'cover' | 'blend' | 'travel' | 'register' | 'isolate' }
  | { act: 'slide'; slide: Slide }
  | { act: 'frame'; frame: Frame }
  | { act: 'pan'; window: Window }
  | { act: 'trace'; slot: 'amber' | 'blue' }
  | { act: 'fitCard' | 'project' | 'unroll' | 'margin' }
  | { act: 'forecast'; stop: Stop; seat: Seat; drawing: Drawing }
  | { act: 'rehearse' }
  | { act: 'entrust'; purpose: 'cue' | 'test' }
  | { act: 'print'; notice: Notice }
  | { act: 'lamp'; position: 'rear' | 'side' }
  | { act: 'listen'; person: 'porter' | 'understudy' }
);
const emptyExposure = () => [f('amber', ''), f('blue', ''), f('blend', '')];
export function lensEffects(s: CampaignState, cmd: LensCommand): Effect[] {
  const home = s.mapId === lensBench,
    street = s.mapId === lensTheatre;
  if (!home && !street)
    throw Error('The loan bench is upstairs at the Survey Depot. Its second lamp is in the rehearsal room.');
  const kit = borrowed(s),
    picks = lensPicks(s),
    r = lensView(s);
  if (cmd.act === 'pick' || cmd.act === 'putMark' || cmd.act === 'useMark' || cmd.act === 'borrow') {
    if (!home || kit.length)
      throw Error('Hand back the open loan before packing a different pair at the depot.');
    if (cmd.act === 'pick') {
      if (!own(fittings, cmd.fitting)) throw Error('Choose one of the four fittings.');
      if (!picks.includes(cmd.fitting) && picks.length === 2)
        throw Error('The smaller drawer takes two. Unhook one fitting to make space.');
      return [
        f(
          'picks',
          (picks.includes(cmd.fitting) ? picks.filter((i) => i !== cmd.fitting) : [...picks, cmd.fitting]).join(
            '+',
          ),
        ),
      ];
    }
    if (cmd.act === 'putMark' || cmd.act === 'useMark') {
      if (cmd.mark !== 'star' && cmd.mark !== 'knot') throw Error('Choose the star or the knot.');
      const pair = cmd.act === 'putMark' ? picks : preset(s, cmd.mark);
      if (pair.length !== 2) throw Error('This mark needs two fittings.');
      return cmd.act === 'putMark'
        ? [f('preset.' + cmd.mark, pair.join('+'))]
        : [f('picks', pair.join('+')), f('calledMark.' + cmd.mark, true)];
    }
    if (picks.length !== 2) throw Error('Fit two tools in the loan drawer before lifting it.');
    return [
      f('loan', picks.join('+')),
      f('everLoan', true),
      f('slide', 'cloth'),
      f('frame', 'eye'),
      f('isolatedTurn', false),
      f('isolatedCover', false),
      f('window', 'centre'),
      f('turn', 0),
      f('cover', true),
      ...emptyExposure(),
    ];
  }
  if (cmd.act === 'fitCard') {
    if (!home || !s.cards.includes('card.depot.micro') || !s.cards.includes('card.depot.micro-case'))
      throw Error('Visit the body and its reused case downstairs. Bring both readings to the two clips.');
    return [f('pairedSources', true)];
  }
  if (cmd.act === 'return') {
    if (kit.length !== 2) throw Error('The drawer is already back.');
    return [f('loan', ''), f('returned', true), ...emptyExposure()];
  }
  if (cmd.act === 'margin') {
    if (!street || !issuedLens(s) || !s.flags['optics.gridFold'] || !s.flags['optics.trialSeat'])
      throw Error(
        'Bring the four-fold grid and compare repeat slips from a seat where the two chalk drawings part.',
      );
    return [f('margins', true)];
  }
  if (cmd.act === 'project') {
    const sent = issuedLens(s);
    if (!street || !sent || kit.length !== 2)
      throw Error('Bring a borrowed pair and your sealed tracings to the curtain rail.');
    const key = kit.slice().sort().join('+');
    return [
      f('projection', key),
      f('projected.' + key, true),
      f('projectionSource', s.flags['optics.dispatch'] as string),
    ];
  }
  if (cmd.act === 'forecast' || cmd.act === 'rehearse' || cmd.act === 'entrust') {
    if (!street || !issuedLens(s))
      throw Error('Send a tracing pair to the rehearsal room before lighting its audience.');
    if (cmd.act === 'forecast') {
      if (!own(stopNames, cmd.stop) || !own(seatNames, cmd.seat) || !own(drawings, cmd.drawing))
        throw Error('Fit an opening, a seat and a chalk drawing.');
      return [
        f('forecast', cmd.stop + '~' + cmd.seat + '~' + cmd.drawing),
        f('usedModel.' + cmd.stop + '.' + cmd.seat + '.' + cmd.drawing, true),
      ];
    }
    const setup = lampSetup(s);
    if (!setup) throw Error('Pin a chalk drawing beside an opening and a seat first.');
    const { stop, seat } = setup;
    if (cmd.act === 'rehearse') {
      const count = readingsAt(s, stop, seat);
      if (count >= 3)
        throw Error(
          'All three slips are open at this seat. Move the seat or change the opening to see another set.',
        );
      return [f('readings.' + stop + '.' + seat, count + 1)];
    }
    if (cmd.purpose !== 'cue' && cmd.purpose !== 'test') throw Error('Choose who needs the chalk drawing.');
    if (
      !(['broad', 'slit'] as const).every(
        (st) =>
          readingsAt(s, st, seat) >= 2 &&
          (['rays', 'fronts'] as const).every(
            (model) => s.flags['optics.usedModel.' + st + '.' + seat + '.' + model],
          ),
      ) ||
      predictLamps('slit', seat, 'rays') === predictLamps('slit', seat, 'fronts')
    )
      throw Error(
        'At the wing or the step, try both drawings through each opening. Run at least two rehearsals at each opening before handing over the chalk.',
      );
    return [f('purpose', cmd.purpose), f('trusted.' + cmd.purpose, true), f('trialSeat', seat)];
  }
  if (cmd.act === 'print' || cmd.act === 'lamp' || cmd.act === 'listen') {
    if (!street || !issuedLens(s)) throw Error('Mayle needs a sealed pair of tracings at the rehearsal lamp.');
    if (cmd.act === 'print') {
      if (!own(notices, cmd.notice)) throw Error('Pick an entrance for the company.');
      return [
        f('notice', cmd.notice),
        f('shown.' + cmd.notice, true),
        f('showEdition', s.flags['optics.dispatch'] as string),
      ];
    }
    if (s.flags['optics.showEdition'] !== s.flags['optics.dispatch'])
      throw Error('Put this pair up for the company first.');
    if (cmd.act === 'lamp') {
      if (!['rear', 'side'].includes(cmd.position)) throw Error('Choose a lamp position.');
      return [f('lamp', cmd.position), f('lit.' + cmd.position, true)];
    }
    if (!['porter', 'understudy'].includes(cmd.person)) throw Error('Choose someone at the curtain.');
    return [f('heard.' + cmd.person, true), f('lastVoice', cmd.person)];
  }
  if (!home || kit.length !== 2) throw Error('Borrow two fittings at the depot to work the glass.');
  const need = (id: Fitting) => {
    if (!kit.includes(id))
      throw Error(
        'That movement needs ' + fittings[id] + ' in this loan. You can return the drawer and change it.',
      );
  };
  switch (cmd.act) {
    case 'slide':
      if (!own(lensSamples, cmd.slide)) throw Error('Choose a prepared study.');
      return [f('slide', cmd.slide)];
    case 'frame':
      if (cmd.frame !== 'eye' && cmd.frame !== 'close' && cmd.frame !== 'whole')
        throw Error('Choose a field size.');
      if (cmd.frame !== 'eye') need(cmd.frame === 'whole' ? 'field' : 'close');
      return [f('frame', cmd.frame)];
    case 'pan':
      if (!own(windows, cmd.window) || r.frame !== 'close')
        throw Error('Set the close lens over a part of the field first.');
      need('close');
      return [f('window', cmd.window)];
    case 'turn': {
      need('stage');
      const next = (r.turn + 1) % 4;
      return [
        f('turn', next),
        ...(r.slide === 'marks' && r.frame === 'whole' ? [f('ruledTurn.' + next, true)] : []),
      ];
    }
    case 'unroll': {
      need('stage');
      need('field');
      if (
        r.frame !== 'whole' ||
        r.slide !== 'marks' ||
        ![0, 1, 2, 3].every((t) => s.flags['optics.ruledTurn.' + t] === true)
      )
        throw Error(
          'Open the field lens on the ruled glass. Give the whole grid four quarter turns before unfolding its corners.',
        );
      return [f('gridFold', true)];
    }
    case 'cover':
      need('sleeve');
      return [f('cover', !r.cover)];
    case 'trace':
      if (cmd.slot !== 'amber' && cmd.slot !== 'blue') throw Error('Choose a tracing frame.');
      return [f(cmd.slot, readKey(r)), f('blend', '')];
    case 'blend': {
      const a = unpackRead(s.flags['optics.amber']),
        b = unpackRead(s.flags['optics.blue']);
      if (!a || !b || readKey(a) === readKey(b))
        throw Error(
          'Make two tracings with an observable change of field, study, sleeve or angle. You can keep your first frame.',
        );
      const out = [f('blend', readKey(a) + '/' + readKey(b))];
      const visibleChange = overlap(a, b).changed > 0;
      const isPetal = (slide: Slide) => slide === 'fresh' || slide === 'petal';
      if (
        isPetal(a.slide) &&
        isPetal(b.slide) &&
        a.slide !== b.slide &&
        a.window === b.window &&
        a.frame === b.frame &&
        a.turn === b.turn &&
        a.cover === b.cover &&
        visibleChange
      )
        out.push(f('compared.preparation', true));
      if (a.slide === b.slide && a.frame === b.frame && a.window === b.window) {
        if (a.turn === b.turn && a.cover !== b.cover && visibleChange)
          out.push(f('compared.sleeve.' + a.slide, true), f('isolatedCover', a.slide));
        if (a.turn !== b.turn && a.cover === b.cover && visibleChange)
          out.push(f('compared.turn.' + a.slide, true), f('isolatedTurn', a.slide));
      }
      if (a.slide === b.slide && a.turn === b.turn && a.cover === b.cover && a.frame !== b.frame)
        out.push(f('compared.field.' + a.slide, true));
      return out;
    }
    case 'register': {
      need('field');
      need('close');
      const a = unpackRead(s.flags['optics.amber']),
        b = unpackRead(s.flags['optics.blue']);
      if (
        !s.flags['optics.blend'] ||
        !a ||
        !b ||
        a.slide !== b.slide ||
        a.turn !== b.turn ||
        a.cover !== b.cover ||
        ![a.frame, b.frame].includes('whole') ||
        ![a.frame, b.frame].includes('close')
      )
        throw Error(
          'Keep the same study, angle and sleeve. Trace one whole field and one close window, then lay them together.',
        );
      const crop = a.frame === 'close' ? a : b;
      return [f('register', readKey(crop)), f('joined.field', true)];
    }
    case 'isolate': {
      need('stage');
      need('sleeve');
      if (s.flags['optics.isolatedTurn'] !== r.slide || s.flags['optics.isolatedCover'] !== r.slide)
        throw Error(
          'Compare a turn with the sleeve held still, then a sleeve lift at one angle, on this same study.',
        );
      return [f('joined.holder', true), f('isolatedStudy', r.slide)];
    }
    case 'travel': {
      const sig = s.flags['optics.blend'];
      if (typeof sig !== 'string' || !sig || sig !== s.flags['optics.amber'] + '/' + s.flags['optics.blue'])
        throw Error('Lay two different tracings over each other before sealing the envelope.');
      return [f('dispatch', sig), f('sealed', true)];
    }
  }
}
export function issuedLens(s: S) {
  const v = s.flags['optics.dispatch'];
  if (typeof v !== 'string') return;
  const [ar, br, ...extra] = v.split('/'),
    amber = unpackRead(ar),
    blue = unpackRead(br);
  if (extra.length || !amber || !blue || ar === br) return;
  return { amber, blue };
}
export function overlap(a: OpticRead, b: OpticRead) {
  const second = new Map(lensTiles(b).map((t) => [t.y * 7 + t.x, t.mark]));
  const shared = lensTiles(a).filter((t) => second.has(t.y * 7 + t.x));
  return { shared: shared.length, changed: shared.filter((t) => second.get(t.y * 7 + t.x) !== t.mark).length };
}

export function lampSetup(s: S) {
  const raw = s.flags['optics.forecast'];
  if (typeof raw !== 'string') return;
  const [stop, seat, drawing, ...tail] = raw.split('~');
  if (tail.length || !own(stopNames, stop) || !own(seatNames, seat) || !own(drawings, drawing)) return;
  return { stop: stop as Stop, seat: seat as Seat, drawing: drawing as Drawing };
}
export function stageVoices(s: S, listener: 'porter' | 'understudy') {
  const side = s.flags['optics.lamp'] === 'side';
  switch (s.flags['optics.notice']) {
    case 'join':
      return listener === 'porter'
        ? 'Mayle puts one finger on the silver bridge. “My father could wait through two acts to see a stitch of his catch light.”'
        : side
          ? 'Nim turns her shoulder. From here the bridge ends at a knot. “I can make that the place I wait for someone.”'
          : 'Nim has been walking a straight silver line. She reaches its end with one hand still out.';
    case 'space':
      return listener === 'porter'
        ? 'Mayle watches the gap pass under a hand. “Father left room for the two pieces to give when somebody lifted the hem.”'
        : side
          ? 'Nim steps into the dark from the side. The seam is suddenly a door she can open.'
          : 'Nim lets one heartbeat pass in the gap. Someone at the back begins to breathe with her.';
    default:
      return listener === 'porter'
        ? 'Mayle visits the little side frame during the entrance. She can point to the stitches without stopping the actor.'
        : side
          ? 'Nim lifts the spare lamp. “I wanted my own entrance. I didn’t know anyone would come round here to see it.”'
          : 'Nim gives the waiting hand in the small window to the youngest dresser. For once the dresser takes the first bow.';
  }
}
export function lensDiary(s: CampaignState, cmd: LensCommand) {
  const current = lensView(s),
    kit = borrowed(s),
    set = lampSetup(s),
    letters = issuedLens(s);
  const list = (ids: Fitting[]) => ids.map((k) => fittings[k]).join(' and ') || 'the empty drawer';
  let title = 'At the loan drawer',
    line = '',
    key: string = cmd.act,
    sourceIds: string[] = [];
  switch (cmd.act) {
    case 'pick':
    case 'putMark':
    case 'useMark':
    case 'borrow':
    case 'return': {
      if (cmd.act === 'pick') {
        key += '.' + cmd.fitting + '.' + lensPicks(s).join('-');
        line = 'I tried ' + list(lensPicks(s)) + ' against the two places in the felt.';
      }
      if (cmd.act === 'putMark' || cmd.act === 'useMark') {
        key += '.' + cmd.mark + '.' + preset(s, cmd.mark).join('-');
        line =
          cmd.act === 'putMark'
            ? 'I stamped the ' +
              cmd.mark +
              ' beside ' +
              list(preset(s, cmd.mark)) +
              '. I can ask for this pair again.'
            : 'I found my ' + cmd.mark + ' on the desk and fitted ' + list(lensPicks(s)) + ' from its marks.';
      }
      if (cmd.act === 'borrow') {
        key += '.' + kit.join('-');
        line = 'I signed out ' + list(kit) + '. Mayle tucked the loan tag inside the handle.';
      }
      if (cmd.act === 'return') {
        line =
          'I handed the loan drawer back with its fittings. My two stamps stayed on the desk. The company kept the tracings I had actually sent.';
      }
      break;
    }
    case 'unroll':
      title = 'All four folds come home';
      line =
        'I opened the ruled grid and followed its moving corner. Four applications of the same turn take every one of its 49 places back to itself. I can show why before putting a real curtain in the frame.';
      break;
    case 'margin':
      title = 'Two different reasons to trust a mark';
      line =
        'I bound a four-turn grid beside the dated rehearsal slips. I could prove the return of every square from how the grid turns. Extra performances could unsettle my estimate of what somebody in the wing can see.';
      break;
    case 'project':
      key += '.' + s.flags['optics.projection'] + '.' + s.flags['optics.projectionSource'];
      title = 'The fittings reach the curtain';
      line = 'I put ' + list(kit) + ' in the projection frame. ' + projection(s)!.caption;
      break;
    case 'fitCard':
      title = 'Two brass numbers on one hook';
      line =
        'I clipped the reading of the Swift body numbered 16616 beside the reused case labelled 30607. Three objectives listed inside the door belonged with the earlier adjustment. I left the date space open.';
      sourceIds = ['HIS-DEPOT-Z408A', 'HIS-DEPOT-Z408J'];
      break;
    case 'slide':
    case 'frame':
    case 'pan':
    case 'turn':
    case 'cover':
    case 'trace':
      key += '.' + (cmd.act === 'trace' ? cmd.slot + '.' : '') + readKey(current);
      title = cmd.act === 'trace' ? 'An exposure in the ' + cmd.slot + ' frame' : 'At the frosted square';
      line =
        (cmd.act === 'trace'
          ? 'I fixed what I could see on the ' + cmd.slot + ' slip. '
          : 'I moved the glass. ') + opticCaption(current);
      break;
    case 'blend':
    case 'travel':
    case 'register':
    case 'isolate': {
      const a = unpackRead(s.flags['optics.amber'])!,
        b = unpackRead(s.flags['optics.blue'])!,
        share = overlap(a, b);
      key += '.' + readKey(a) + '/' + readKey(b);
      if (cmd.act === 'blend') {
        title = 'Two tracings on one pin';
        line =
          'I laid the slips over the same grid. Of ' +
          share.shared +
          ' squares they both showed, ' +
          share.changed +
          ' changed their marks. ' +
          opticCaption(a) +
          ' ' +
          opticCaption(b);
      }
      if (cmd.act === 'travel') {
        title = 'An envelope for the understudy';
        line = 'I sent Mayle two tracings. ' + opticCaption(a) + ' Beside it I enclosed ' + opticCaption(b);
      }
      if (cmd.act === 'register') {
        title = 'The little field clicks into place';
        line =
          'I fitted my close window back into the whole view. All ' +
          share.shared +
          ' shared squares matched. The edge outside the frame had been there while I was looking through it.';
      }
      if (cmd.act === 'isolate') {
        title = 'The line that stayed with the glass';
        line =
          'I turned ' +
          lensSamples[current.slide] +
          ' with the sleeve held still, then lifted the sleeve at one angle. The light scratch travelled with the holder. The dark edge obeyed a different movement.';
      }
      break;
    }
    case 'print':
      key += '.' + cmd.notice + '.' + s.flags['optics.dispatch'];
      title = 'An entrance for the evening company';
      line =
        'From the tracings I sent, I gave Nim ' + notices[cmd.notice] + '. ' + opticCaption(letters!.amber);
      break;
    case 'lamp':
      key += '.' + cmd.position + '.' + s.flags['optics.notice'];
      title = 'Light on the curtain';
      line =
        cmd.position === 'side'
          ? 'I wheeled the lamp to the wing. The people near the seam could see where the silver thread doubled back.'
          : 'I raised the lamp at the rear. Both banks were visible to the last seats.';
      break;
    case 'listen':
      key += '.' + cmd.person + '.' + s.flags['optics.notice'] + '.' + (s.flags['optics.lamp'] || 'rear');
      title = cmd.person === 'porter' ? 'Mayle at the rail' : 'Nim in the footlights';
      line = 'I stayed beside the curtain. ' + stageVoices(s, cmd.person);
      break;
    case 'forecast':
      key += '.' + s.flags['optics.forecast'];
      title = 'Chalk reaches the seats';
      line =
        'I held ' +
        drawings[cmd.drawing] +
        ' over ' +
        stopNames[cmd.stop] +
        '. It sent ' +
        predictLamps(cmd.stop, cmd.seat, cmd.drawing) +
        ' of four marks to ' +
        seatNames[cmd.seat] +
        '.';
      break;
    case 'rehearse': {
      const { stop, seat } = set!,
        n = readingsAt(s, stop, seat);
      key += '.' + stop + '.' + seat + '.' + n;
      title = 'A slip from the audience';
      line =
        'I opened rehearsal slip ' +
        n +
        ' at ' +
        seatNames[seat] +
        '. Through ' +
        stopNames[stop] +
        ' the crew saw ' +
        seenLamps(stop, seat)[n - 1] +
        ' of the four marks.';
      break;
    }
    case 'entrust':
      key += '.' + cmd.purpose + '.' + s.flags['optics.trialSeat'];
      title = cmd.purpose === 'cue' ? 'The chalk goes to Nim' : 'A seat for the next rehearsal';
      line =
        cmd.purpose === 'cue'
          ? 'I gave Nim the drawing that could call her entrance from the wing. It can earn its keep even while we wonder how light crossed the opening.'
          : 'I left both drawings for Huygens with a chalk circle round the seat where their forecasts parted. The crew can read that seat again.';
      break;
  }
  return diaryEvent(
    'lens-loan:' + key,
    cmd.act === 'print' || cmd.act === 'entrust' ? 'choice' : 'tool',
    'lens-loan',
    title,
    line,
    { sourceIds },
    'after-break',
  );
}

export function lensTopics(action: string): Weave {
  if (action === 'margin' || action === 'unroll')
    return {
      ...lensWeave,
      concepts: ['certainty', 'explanation', 'evidence', 'justification'],
      aoks: ['NAT', 'MAT', 'ART', 'TEC'],
      subjects: ['physics', 'math-aa', 'theatre'],
      framework: ['scope', 'methods-and-tools'],
    };
  if (action === 'fitCard')
    return {
      ...lensWeave,
      concepts: ['evidence', 'interpretation', 'responsibility'],
      aoks: ['HIS', 'NAT', 'TEC'],
      subjects: ['history', 'design-tech'],
      framework: ['scope', 'methods-and-tools'],
    };
  if (['print', 'lamp', 'listen'].includes(action))
    return {
      ...lensWeave,
      concepts: ['perspective', 'values', 'interpretation', 'responsibility'],
      aoks: ['ART', 'HUM', 'TEC'],
      subjects: ['theatre', 'visual-arts'],
      framework: ['ethics', 'perspectives'],
    };
  if (['forecast', 'entrust', 'rehearse'].includes(action))
    return {
      ...lensWeave,
      concepts: ['explanation', 'truth', 'evidence', 'justification', 'certainty'],
      aoks: ['NAT', 'MAT', 'ART', 'TEC'],
      subjects: ['physics', 'math-ai', 'theatre'],
      framework: ['scope', 'methods-and-tools'],
    };
  if (['putMark', 'useMark', 'borrow', 'return', 'pick'].includes(action))
    return {
      ...lensWeave,
      concepts: ['responsibility', 'perspective'],
      aoks: ['ART', 'TEC'],
      subjects: ['design-tech', 'theatre'],
      framework: ['ethics', 'methods-and-tools'],
      thinking: { dok: 1, bloom: 'apply', fink: 'application', solo: 'unistructural' },
    };
  return {
    ...lensWeave,
    concepts: ['objectivity', 'evidence', 'interpretation', 'certainty'],
    aoks: ['NAT', 'ART', 'TEC'],
    subjects: ['biology', 'physics', 'visual-arts'],
    framework: ['scope', 'methods-and-tools'],
  };
}

const projectionNotes: Record<string, string> = {
  'close+field':
    'Nim can point to the centre patch and to its place in the whole curtain. A dresser takes one sight, a porter the other.',
  'close+sleeve':
    'Mayle shows a single patch with and without the sleeve. The close view separates the pale holder line from the dark stitch.',
  'close+stage':
    'The close lamp turns to follow one corner of the seam. Nim can trace its sweep without moving the whole curtain.',
  'field+sleeve':
    'The whole frame holds the cloth steady while the sleeve changes position. A pale bar shows in one of the two views.',
  'field+stage':
    'The company turns the entire field on the lantern. Nim crosses the rotated river from a new side.',
  'sleeve+stage':
    'Mayle fits the second view a quarter-turn away, with the sleeve in the opposite position. The earlier single changes at the bench help the company separate the two effects.',
};
export function projection(s: S) {
  const pair = issuedLens(s);
  const key = s.flags['optics.projection'];
  if (
    !pair ||
    s.flags['optics.projectionSource'] !== s.flags['optics.dispatch'] ||
    typeof key !== 'string' ||
    !Object.hasOwn(projectionNotes, key)
  )
    return;
  const source = pair.amber,
    fittings = key.split('+'),
    base = { ...source };
  const a: OpticRead = {
    ...base,
    frame: fittings.includes('field') ? 'whole' : fittings.includes('close') ? 'close' : 'eye',
    window: 'centre',
  };
  const b: OpticRead = {
    ...a,
    frame: fittings.includes('close') ? 'close' : a.frame,
    turn: (a.turn + (fittings.includes('stage') ? 1 : 0)) % 4,
    cover: fittings.includes('sleeve') ? !a.cover : a.cover,
  };
  return { first: a, second: b, caption: projectionNotes[key] };
}

export function quarterOrbit(x: number, y: number) {
  const points: [number, number][] = [[x, y]];
  for (let turn = 0; turn < 4; turn++) {
    [x, y] = [6 - y, x];
    points.push([x, y]);
  }
  return points;
}
