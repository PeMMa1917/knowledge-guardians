import { diaryEvent } from './adventureEvents';
import {
  activeFriend,
  creatureTrails,
  nightByFriend,
  nightEdition,
  nightFriendFlag,
  nightFriends,
  trailMark,
  type NightFriend,
} from './nightRegister';
import type { CampaignState, Effect, FlagValue, Weave } from './types';

export const houseRoom = 'nexus.middle-door',
  housePorch = 'nexus.new-landing';
export const houseSites = {
  cart: 'aethelgard.emberford',
  light: 'sea.harbour',
  table: 'voices.listening',
} as const;
export const housePlaces = {
  cart: 'Emberford’s coal yard',
  light: 'the Seagrass harbour stair',
  table: 'the Listening Room',
} as const;
export const chairs = ['mat', 'sill', 'hearth'] as const;
export type Chair = (typeof chairs)[number];
export const chairNames: Record<Chair, string> = {
  mat: 'The rug by the door',
  sill: 'The patched window sill',
  hearth: 'The warm brick',
};
const S = (k: string, v: FlagValue = true): Effect => ({ setFlag: 'middlehouse.' + k, value: v });
type State = Pick<CampaignState, 'mapId' | 'flags'>;
export const houseFlag = (s: State, k: string) => s.flags['middlehouse.' + k];
export const seatOf = (s: State, f: NightFriend) => chairs.find((k) => houseFlag(s, 'seat.' + k) === f.id);
export function houseGuest(s: State, k: Chair): NightFriend | undefined {
  const f = nightByFriend.get(String(houseFlag(s, 'seat.' + k) ?? ''));
  return f && s.flags[nightFriendFlag(f)] === true ? f : undefined;
}
export const inRoom = (s: State, f: NightFriend) => activeFriend(s)?.id !== f.id;
export const household = (s: State) =>
  chairs.flatMap((seat) => {
    const f = houseGuest(s, seat);
    return f ? [{ seat, f, here: inRoom(s, f) }] : [];
  });
export const knownGuests = (s: State) => nightFriends.filter((f) => s.flags[nightFriendFlag(f)] === true);
export function guestRecord(s: State, f: NightFriend) {
  const pair = creatureTrails.get(f.id)!;
  const carried = pair.flatMap((w) => {
    const edition = nightEdition(s, trailMark(f, w));
    return edition ? [edition] : [];
  });
  return {
    bond: s.flags['night.bond.' + f.id] === 'courier' ? 'courier' : 'scout',
    carried,
    site: f.site.title,
  };
}
// Passage ends face north, east, south and west. A door only joins its neighbour if both ends meet.
export const turns = ['north', 'east', 'south', 'west'] as const;
export type Face = (typeof turns)[number];
export const floorNames = [
  'Coat hooks',
  'The song loft',
  'Glass roof',
  'Front mat',
  'Squeaking hinge',
  'Tea table',
  'Quiet bunk',
  'Back garden',
  'Pantry',
] as const;
const base = [3, 11, 6, 7, 15, 7, 9, 14, 12];
export const defaultFloor = '110110030';
export function tidyFloor(value: unknown) {
  return typeof value === 'string' && /^[0-3]{9}$/.test(value) ? value : undefined;
}
export const sketch = (s: State) => tidyFloor(houseFlag(s, 'sketch')) ?? defaultFloor;
export const issuedHouse = (s: State) => tidyFloor(houseFlag(s, 'floor'));
export function openings(floor: string, cell: number) {
  const rot = Number(floor[cell]),
    mask = base[cell];
  return turns.filter((_, i) => (mask & (1 << (i - rot + 4) % 4)) !== 0);
}
export function nextTile(floor: string, cell: number, face: Face) {
  const x = cell % 3,
    y = Math.floor(cell / 3),
    dx = [0, 1, 0, -1],
    dy = [-1, 0, 1, 0],
    dir = turns.indexOf(face),
    u = x + dx[dir],
    v = y + dy[dir];
  if (u < 0 || u > 2 || v < 0 || v > 2 || !openings(floor, cell).includes(face)) return undefined;
  const to = v * 3 + u;
  return openings(floor, to).includes(turns[(dir + 2) % 4]) ? to : undefined;
}
export type Traveller = 'foot' | 'wheel';
export const destinations = {
  tea: { cell: 5, edge: 'east' },
  loft: { cell: 1, edge: 'north' },
  garden: { cell: 7, edge: 'south' },
} as const;
export type Destination = keyof typeof destinations;
export const destinationNames: Record<Destination, string> = {
  tea: 'tea at the end of the table',
  loft: 'the song loft',
  garden: 'the back garden',
};
export function reached(floor: string, cell: number) {
  return (Object.keys(destinations) as Destination[]).find(
    (k) => destinations[k].cell === cell && openings(floor, cell).includes(destinations[k].edge),
  );
}
export function stepTile(floor: string, cell: number, face: Face, visitor: Traveller) {
  const to = nextTile(floor, cell, face);
  // The central hinge is a raised sill. The handcart can pass it north/south along its grain.
  return to !== undefined &&
    visitor === 'wheel' &&
    (to === 4 || cell === 4) &&
    (face === 'west' || face === 'east')
    ? undefined
    : to;
}
export function floorReach(floor: string, visitor: Traveller, start = 3) {
  const paths = new Map<number, Face[]>([[start, []]]),
    todo = [start];
  for (let i = 0; i < todo.length; i++)
    for (const face of turns) {
      const here = todo[i],
        to = stepTile(floor, here, face, visitor);
      if (to !== undefined && !paths.has(to)) {
        paths.set(to, [...paths.get(here)!, face]);
        todo.push(to);
      }
    }
  return paths;
}
export function sight(floor: string, cell: number) {
  const seen = new Set([cell]);
  for (const face of turns) {
    let pos = cell,
      next: number | undefined;
    while ((next = nextTile(floor, pos, face)) !== undefined) {
      seen.add(next);
      pos = next;
    }
  }
  return [...seen].sort((a, b) => a - b);
}
export function spin(floor: string, cell: number, by: 1 | -1) {
  if (!Number.isInteger(cell) || cell < 0 || cell > 8) throw Error('Choose one of the nine room tiles.');
  return floor.slice(0, cell) + ((Number(floor[cell]) + by + 4) % 4) + floor.slice(cell + 1);
}
function cartPath(s: State) {
  const raw = houseFlag(s, 'cart.path');
  return typeof raw === 'string' && /^3[0-8]*$/.test(raw) ? raw : '3';
}
export const cartPosition = (s: State) => Number(cartPath(s).slice(-1));
export const lanternPosition = (s: State) => {
  const v = houseFlag(s, 'light.cell');
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < 9 ? v : 3;
};
export const plans = {
  tea: 'Carry supper through the east door',
  loft: 'Hold the loft open for a late singer',
  garden: 'Leave the garden free for somebody coming alone',
} as const;
export const trialWords: Record<Destination, string> = {
  tea: 'Tover sets the full pot down without spilling a mouthful. The cart still takes the long way to do it.',
  loft: 'The sheet music arrives flat. One wheel catches the last note hanging from a peg. Tover puts it back before anybody can hear.',
  garden: 'On the garden flags you can set the kettle down and turn the cart without asking anybody to move.',
};
const finale: Record<Destination, Record<Destination, string>> = {
  tea: {
    tea: 'Tover places three bowls by the east door. The singer takes hers into the hall so the late stranger has company.',
    loft: 'Supper goes up in two trips. Tover eats the heel of the loaf on the landing. The late singer finds her soup still hot.',
    garden:
      'They carry the kettle out together. The guest who wanted to sit alone chooses the chair nearest the gate.',
  },
  loft: {
    tea: 'The singer comes down carrying the last page in her sleeve. Tover holds a place at supper until her verse is done.',
    loft: 'Neska gives the late singer a place at the front. She leaves her first note silent for the crew still folding the chairs.',
    garden:
      'From the garden the new verse sounds different. Yilka leaves the back door ajar just far enough for the singer to hear an answer.',
  },
  garden: {
    tea: 'A quiet visitor puts two spoons down at the tea table. It was the noise of having to ask that kept him away the first evening.',
    loft: 'The garden visitor has brought a song in a paper bag. Nobody asks him to sing it. Neska puts the bag on its own music stand.',
    garden:
      'The garden chairs face three different things. One looks out, one looks in and one looks directly at the neighbour who moved it.',
  },
};
export const homeEnding = (first: Destination, later: Destination) => finale[first][later];
export function postedWelcome(s: State) {
  const m = fieldMemo(s);
  if (!m.floor || m.spot === undefined || !m.r) return '';
  const path = houseFlag(s, 'cart.record');
  const distance = typeof path === 'string' ? paceCount([...path].map(Number), townSeam(s)) : undefined;
  return (
    'The handcart reached ' +
    destinationNames[m.r] +
    (distance === undefined ? '' : ' in ' + distance + ' paces') +
    '. ' +
    lightingLine(m.floor, m.spot)
  );
}
export function membership(s: State) {
  const field = [houseFlag(s, 'ever.cart'), houseFlag(s, 'ever.light')].filter((v) => v === true).length;
  if (houseFlag(s, 'ever.table') === true) return 'Keeper of the middle door';
  if (field === 2) return 'Neighbour with two keys';
  if (field === 1) return 'House runner';
  if (issuedHouse(s)) return 'Keeper of a spare seat';
  return 'A guest at the door';
}
function sampleSight(s: State, floor: string) {
  const shots = houseFlag(s, 'light.shots');
  return typeof shots === 'string'
    ? shots
        .split('|')
        .filter((x) => /^[0-8]$/.test(x))
        .map(Number)
        .filter((n) => floorReach(floor, 'foot').has(n))
    : [];
}
export const pastLamps = (s: State) => {
  const floor = issuedHouse(s);
  return floor ? sampleSight(s, floor) : [];
};
export const lightPeople = [
  { cell: 1, who: 'Neska and the late singer' },
  { cell: 5, who: 'Tover at the east table' },
  { cell: 7, who: 'Yilka at the back gate' },
] as const;
export function lightingLine(floor: string, place: number) {
  const people = lightPeople.filter((person) => sight(floor, place).includes(person.cell));
  return (
    (people.length
      ? people.map((p) => p.who).join(' · ') + ' can see the unshaded lamp.'
      : 'The three far stops are around a corner from here.') +
    ' Somebody hidden behind a turn still has a place in the house.'
  );
}
export function fieldMemo(s: State): {
  r: Destination | undefined;
  spot: number | undefined;
  floor: string | undefined;
} {
  const r = houseFlag(s, 'cart.stop'),
    spot = houseFlag(s, 'light.filed'),
    floor = issuedHouse(s);
  return {
    r: r === 'tea' || r === 'loft' || r === 'garden' ? r : undefined,
    spot: typeof spot === 'number' && spot >= 0 && spot <= 8 ? spot : undefined,
    floor,
  };
}
export type HouseCommand = { type: 'FitMiddleDoor' } & (
  | { act: 'seat'; guest: string; chair: Chair }
  | { act: 'clear'; chair: Chair }
  | { act: 'hear'; chair: Chair }
  | { act: 'route-note'; to: Destination }
  | { act: 'lamp-note'; to: Destination }
  | { act: 'unfold' }
  | { act: 'seam'; seam: Seam }
  | { act: 'measure'; visitor: Traveller; to: Destination }
  | { act: 'turn'; cell: number; by: 1 | -1 }
  | { act: 'template'; layout: 'lunch' | 'song' | 'green' }
  | { act: 'chalk'; visitor: Traveller }
  | { act: 'issue'; purpose: Destination }
  | { act: 'step'; face: Face }
  | { act: 'undo' }
  | { act: 'restart' }
  | { act: 'park' }
  | { act: 'place'; cell: number }
  | { act: 'light' }
  | { act: 'file' }
  | { act: 'table'; who: Destination }
);
export type Seam = 'folded' | 'stretched';
export const floorSeam = (s: State): Seam =>
  houseFlag(s, 'sketchSeam') === 'stretched' ? 'stretched' : 'folded';
export const townSeam = (s: State): Seam => (houseFlag(s, 'seam') === 'stretched' ? 'stretched' : 'folded');
// Each doorway keeps its neighbours. Stretching the east seam adds three paces to each crossing of that seam.
export function paceCount(cells: readonly number[], seam: Seam) {
  return cells.slice(1).reduce((total, current, index) => {
    const previous = cells[index],
      eastSeam =
        Math.floor(previous / 3) === Math.floor(current / 3) && Math.min(previous % 3, current % 3) === 1;
    return total + (seam === 'stretched' && eastSeam ? 4 : 1);
  }, 0);
}
export function measureWalk(floor: string, visitor: Traveller, to: Destination, seam: Seam) {
  const { cell, edge } = destinations[to],
    path = floorReach(floor, visitor).get(cell);
  if (!path || !openings(floor, cell).includes(edge)) return undefined;
  const cells = [3];
  for (const face of path) cells.push(stepTile(floor, cells[cells.length - 1], face, visitor)!);
  return { steps: path.length, paces: paceCount(cells, seam), cells };
}
export function measureLine(floor: string, visitor: Traveller, to: Destination, seam: Seam) {
  const walk = measureWalk(floor, visitor, to, seam),
    who = visitor === 'foot' ? 'shoe' : 'cart';
  if (!walk) return 'There is no open ' + who + ' route to ' + destinationNames[to] + ' on this drawing.';
  return (
    'The ' +
    who +
    ' goes through ' +
    walk.steps +
    ' doors in ' +
    walk.paces +
    ' paces to ' +
    destinationNames[to] +
    '. The east seam is ' +
    seam +
    '.'
  );
}
export const modelFloors = { lunch: '021100111', song: '131100121', green: '121300211' };
export function houseNote(s: State, chair: Chair) {
  const f = nightByFriend.get(String(houseFlag(s, 'note.' + chair) ?? ''));
  return f && s.flags[nightFriendFlag(f)] === true ? f : undefined;
}
export function cardStep(s: State, to: Destination) {
  const floor = issuedHouse(s);
  if (!floor) return undefined;
  const dest = destinations[to],
    route = floorReach(floor, 'wheel', cartPosition(s));
  return openings(floor, dest.cell).includes(dest.edge) ? route.get(dest.cell) : undefined;
}
export function cardHook(s: State, to: Destination) {
  const f = issuedHouse(s);
  if (!f) return undefined;
  const floor = floorReach(f, 'foot');
  return [...floor.keys()]
    .filter((cell) => sight(f, cell).includes(destinations[to].cell))
    .sort((a, b) => floor.get(b)!.length - floor.get(a)!.length || a - b)[0];
}
const seatsOn = ['nexus.archive', houseRoom, housePorch];
export function houseEffects(s: CampaignState, c: HouseCommand): Effect[] {
  if (c.act === 'seat' || c.act === 'clear' || c.act === 'hear') {
    if (!seatsOn.includes(s.mapId)) throw Error('The house mats are in your quarters and on the landing.');
    if (c.act === 'clear') return [S('seat.' + c.chair, '')];
    if (c.act === 'hear') {
      const f = houseGuest(s, c.chair);
      if (!f || !inRoom(s, f))
        throw Error('A resident can leave a place ready while they are out. Come back when they are home.');
      return [
        S('visit.' + f.id, c.chair),
        S('heardGuest', f.id),
        S('note.' + c.chair, f.id),
        ...(c.chair === 'hearth'
          ? [S('foldedFloor', issuedHouse(s) ?? ''), S('foldedSeam', townSeam(s))]
          : []),
      ];
    }
    const f = nightByFriend.get(c.guest);
    if (!f || s.flags[nightFriendFlag(f)] !== true)
      throw Error('Meet a creature at its own register before offering it a place at home.');
    const previous = seatOf(s, f);
    return [
      ...(previous && previous !== c.chair ? [S('seat.' + previous, '')] : []),
      S('seat.' + c.chair, f.id),
    ];
  }
  if (c.act === 'unfold') {
    if (s.mapId !== houseRoom) throw Error('Unfold the hearth sheet on the nine door tiles downstairs.');
    const old = tidyFloor(houseFlag(s, 'foldedFloor'));
    if (!old || !houseNote(s, 'hearth'))
      throw Error('Sit with a resident on the warm brick after sending a floor to the street.');
    return [
      S('sketch', old),
      S('sketchSeam', houseFlag(s, 'foldedSeam') === 'stretched' ? 'stretched' : 'folded'),
    ];
  }
  if (c.act === 'route-note') {
    if (s.mapId !== houseSites.cart || !houseNote(s, 'mat') || !issuedHouse(s))
      throw Error('Take a mat resident’s thread to the Emberford yard.');
    return [S('askedRoute', c.to)];
  }
  if (c.act === 'lamp-note') {
    if (s.mapId !== houseSites.light || !houseNote(s, 'sill') || !issuedHouse(s))
      throw Error('Take a sill resident’s tracing to the harbour hooks.');
    const hook = cardHook(s, c.to);
    if (hook === undefined)
      throw Error('The visitor’s place is outside the view of every reachable hook on this floor.');
    return [S('light.cell', hook), S('askedHook', c.to)];
  }
  if (
    c.act === 'turn' ||
    c.act === 'template' ||
    c.act === 'chalk' ||
    c.act === 'issue' ||
    c.act === 'seam' ||
    c.act === 'measure'
  ) {
    if (s.mapId !== houseRoom) throw Error('Lay the nine door tiles on the house plan downstairs.');
    const plan = sketch(s);
    if (c.act === 'seam') return [S('sketchSeam', c.seam)];
    if (c.act === 'measure') {
      const result = measureWalk(plan, c.visitor, c.to, floorSeam(s));
      if (!result) throw Error('The tape stops where the two doors fail to join. Try another outside stop.');
      const identity = plan + '.' + c.visitor + '.' + c.to,
        other = floorSeam(s) === 'folded' ? 'stretched' : 'folded';
      return [
        S('tape.' + floorSeam(s), identity),
        ...(houseFlag(s, 'tape.' + other) === identity ? [S('pairedTape', identity)] : []),
      ];
    }
    if (c.act === 'turn') return [S('sketch', spin(plan, c.cell, c.by))];
    if (c.act === 'template') return [S('sketch', modelFloors[c.layout])];
    if (c.act === 'chalk') return [S('walk.' + c.visitor, plan)];
    if (houseFlag(s, 'walk.foot') !== plan || houseFlag(s, 'walk.wheel') !== plan)
      throw Error('Walk this plan with the flat shoe and the handcart before sending it out.');
    const step = floorReach(plan, 'wheel'),
      exit = Object.keys(destinations).some((k) => {
        const d = destinations[k as Destination];
        return step.has(d.cell) && openings(plan, d.cell).includes(d.edge);
      });
    if (!exit)
      throw Error('The cart needs one open place to stop. Turn a tile or try a neighbour’s starting floor.');
    if (!openings(plan, 3).includes('west'))
      throw Error('Give the front mat an opening on the west, where people enter from the street.');
    if (issuedHouse(s) === plan && townSeam(s) === floorSeam(s) && houseFlag(s, 'purpose') === c.purpose)
      return [];
    return [
      S('floor', plan),
      S('seam', floorSeam(s)),
      S('purpose', c.purpose),
      S('cart.path', '3'),
      S('cart.stop', ''),
      S('light.cell', 3),
      S('light.shots', ''),
      S('light.filed', -1),
      S('table.end', ''),
    ];
  }
  const floor = issuedHouse(s);
  if (!floor) throw Error('Bring a floor from the little inn in the Nexus.');
  if (c.act === 'step' || c.act === 'undo' || c.act === 'restart' || c.act === 'park') {
    if (s.mapId !== houseSites.cart) throw Error('Take the real handcart to the Emberford coal yard.');
    const path = cartPath(s),
      cell = cartPosition(s);
    if (c.act === 'restart') return [S('cart.path', '3')];
    if (c.act === 'undo') return [S('cart.path', path.length > 1 ? path.slice(0, -1) : '3')];
    if (c.act === 'park') {
      const stop = reached(floor, cell);
      if (!stop) throw Error('Push to the tea table, loft or garden where a doorway opens to the street.');
      return [S('cart.stop', stop), S('ever.cart'), S('cart.record', path)];
    }
    const next = stepTile(floor, cell, c.face, 'wheel');
    if (next === undefined)
      throw Error(
        nextTile(floor, cell, c.face) === undefined
          ? 'The two door ends do not meet here. Back up or try another side.'
          : 'The wheel catches the raised grain in the middle sill. The flat shoe could pass here.',
      );
    // Remove loops as the cart retraces a visited square. The chalk always fits on the nine-tile board.
    const visited = path.indexOf(String(next));
    return [S('cart.path', visited >= 0 ? path.slice(0, visited + 1) : path + next)];
  }
  if (c.act === 'place' || c.act === 'light' || c.act === 'file') {
    if (s.mapId !== houseSites.light) throw Error('Take the unshaded lantern to the harbour stair.');
    if (c.act === 'place') {
      if (!floorReach(floor, 'foot').has(c.cell))
        throw Error('That hook is behind a closed passage on this floor.');
      return [S('light.cell', c.cell)];
    }
    const pos = lanternPosition(s),
      shots = sampleSight(s, floor);
    if (c.act === 'light') return [S('light.shots', [...new Set([...shots, pos])].join('|'))];
    if (!shots.includes(pos) || new Set(shots.map((p) => sight(floor, p).join(','))).size < 2)
      throw Error(
        'Light two hooks with different lines of sight. Then stand at a hook you have actually tried.',
      );
    return [S('light.filed', pos), S('ever.light')];
  }
  if (s.mapId !== houseSites.table) throw Error('Find the open-house gathering in the Listening Room.');
  const { r, spot } = fieldMemo(s);
  if (!r || spot === undefined)
    throw Error('The gathering needs an actual cart stop and a tried lamp from the current plan.');
  const first = houseFlag(s, 'purpose');
  if (first !== 'tea' && first !== 'loft' && first !== 'garden')
    throw Error('The slip is missing the reason this floor was sent.');
  return [
    S('porchJourney', postedWelcome(s)),
    S('table.end', c.who),
    S('ever.table'),
    S('houseEcho', homeEnding(first, c.who)),
    S('porchStop', r),
    S('porchLamp', lightingLine(floor, spot)),
    S('porchFloor', floor),
  ];
}

export function roomGuestLine(s: State, f: NightFriend, seat: Chair) {
  const { carried, bond } = guestRecord(s, f),
    pair = creatureTrails.get(f.id)!;
  if (seat === 'mat')
    return (
      f.name +
      ' keeps a place for you at the door. ' +
      f.family.sign +
      ' Back at ' +
      f.site.title +
      ', ' +
      (bond === 'scout'
        ? 'you asked this scout to find a place you had not tried.'
        : 'you asked this courier to keep a working copy to carry onward.')
    );
  if (seat === 'sill')
    return carried[0]
      ? f.name + ' holds the view you took together of ' + carried[0].work.title + '. ' + f.family.limit
      : f.name +
          ' faces the glass as if it were the working frame at ' +
          f.site.title +
          '. ' +
          f.family.job +
          '. Its two-work trail still has a page to find.';
  if (carried.length === 2)
    return (
      f.name +
      ' has brought both of its readings to the brick. On one face is ' +
      carried[0].work.title +
      '. On the other is ' +
      carried[1].work.title +
      '. ' +
      f.family.limit
    );
  return carried.length
    ? f.name +
        ' keeps one reading beside the warm brick. ' +
        carried[0].work.title +
        ' is the one you saw together. Space remains for another.'
    : f.name +
        ' waits on the brick. A crease has worn into the rug. Its two-work trail leads back to ' +
        pair[0].site.title +
        ' and another register. The far work can stay a surprise.';
}
const topics: Record<'home' | 'plan' | 'town' | 'lamp' | 'meeting', Weave> = {
  home: {
    concepts: ['perspective', 'culture', 'responsibility', 'values'],
    framework: ['perspectives', 'ethics'],
    aoks: ['ART', 'HUM'],
    subjects: ['theatre', 'psychology'],
    atl: ['social', 'self-management'],
  },
  plan: {
    concepts: ['interpretation', 'evidence', 'explanation', 'objectivity', 'certainty'],
    framework: ['scope', 'methods-and-tools'],
    aoks: ['MAT', 'ART', 'HUM'],
    subjects: ['math-aa', 'design-tech', 'geography'],
    atl: ['thinking', 'research'],
  },
  town: {
    concepts: ['evidence', 'responsibility', 'justification', 'perspective', 'objectivity'],
    framework: ['methods-and-tools', 'ethics', 'perspectives'],
    aoks: ['MAT', 'HUM'],
    subjects: ['physics', 'design-tech', 'geography'],
    atl: ['thinking', 'communication'],
  },
  lamp: {
    concepts: ['perspective', 'explanation', 'interpretation', 'objectivity', 'evidence'],
    framework: ['perspectives', 'scope', 'methods-and-tools'],
    aoks: ['NAT', 'ART', 'HUM'],
    subjects: ['physics', 'visual-arts', 'geography'],
    atl: ['research', 'thinking'],
  },
  meeting: {
    concepts: ['values', 'power', 'responsibility', 'culture', 'truth', 'justification'],
    framework: ['ethics', 'perspectives', 'scope'],
    aoks: ['HUM', 'ART', 'POL'],
    subjects: ['global-politics', 'business', 'theatre'],
    atl: ['social', 'communication'],
  },
};
export function houseTopics(act: HouseCommand['act']) {
  return topics[
    act === 'seat' || act === 'hear' || act === 'clear'
      ? 'home'
      : ['turn', 'template', 'chalk', 'issue', 'unfold', 'seam', 'measure'].includes(act)
        ? 'plan'
        : ['step', 'undo', 'restart', 'park', 'route-note'].includes(act)
          ? 'town'
          : act === 'table'
            ? 'meeting'
            : 'lamp'
  ];
}
type FloorUse = { visitor: Traveller; floor: string };
export function chalkAccount({ visitor, floor }: FloorUse) {
  const paths = floorReach(floor, visitor);
  const ends = (Object.keys(destinations) as Destination[]).flatMap((k) => {
    const { cell, edge } = destinations[k],
      steps = paths.get(cell);
    return steps && openings(floor, cell).includes(edge)
      ? [destinationNames[k] + ' in ' + steps.length + (steps.length === 1 ? ' move' : ' moves')]
      : [];
  });
  return (
    'From the mat ' +
    (visitor === 'wheel' ? 'the handcart' : 'the flat shoe') +
    ' can reach ' +
    (ends.join(' · ') || 'the inside of the house only') +
    '.'
  );
}
export function houseDiary(s: CampaignState, c: HouseCommand) {
  let title = '',
    line = '',
    key = '';
  switch (c.act) {
    case 'seat': {
      const f = nightByFriend.get(c.guest)!;
      title = 'A place for ' + f.name;
      line =
        'I put ' +
        f.name +
        '’s things on ' +
        chairNames[c.chair].toLowerCase() +
        '. ' +
        (inRoom(s, f)
          ? 'I heard a little movement once I took my hand away.'
          : 'The place was waiting while we were out together.');
      key = f.id + '-' + c.chair;
      break;
    }
    case 'clear':
      title = 'An empty place on purpose';
      line =
        'I cleared ' + chairNames[c.chair].toLowerCase() + '. The resident still knows me and can come back.';
      key = c.chair;
      break;
    case 'hear': {
      const f = houseGuest(s, c.chair)!;
      title = f.name + ' comes home';
      line = 'I sat down next to ' + f.name + '. ' + roomGuestLine(s, f, c.chair);
      key = f.id + '-' + c.chair + '-' + guestRecord(s, f).carried.length;
      break;
    }
    case 'route-note': {
      const r = cardStep(s, c.to),
        f = houseNote(s, 'mat')!;
      title = f.name + '’s thread on the cart';
      line =
        'I traced ' +
        f.name +
        '’s thread towards ' +
        destinationNames[c.to] +
        '. ' +
        (r === undefined
          ? 'That stop has no connected route for these wheels.'
          : r.length
            ? 'The next turn was ' + r[0] + '.'
            : 'The cart was already there.');
      key = issuedHouse(s) + c.to + cartPosition(s) + f.id;
      break;
    }
    case 'lamp-note': {
      const f = houseNote(s, 'sill')!;
      title = 'A sightline from ' + f.name;
      line =
        'I tried the hook on ' +
        f.name +
        '’s tracing for ' +
        destinationNames[c.to] +
        '. I still had to light the lamp to find out who could see it.';
      key = issuedHouse(s) + c.to + f.id;
      break;
    }
    case 'unfold':
      title = 'The floor somebody kept warm';
      line =
        'I opened the old floor a hearth resident had folded. The neighbours could still use the last plan I sent while I worked on this one.';
      key = sketch(s);
      break;
    case 'seam':
      title = 'An extra length of corridor';
      line =
        'I ' +
        (c.seam === 'stretched' ? 'pulled out' : 'folded in') +
        ' the east seam. The doors still faced the same neighbours.';
      key = sketch(s) + c.seam;
      break;
    case 'measure':
      title = 'A tape between two doorframes';
      line =
        'I laid a tape along a particular route. ' + measureLine(sketch(s), c.visitor, c.to, floorSeam(s));
      key = sketch(s) + floorSeam(s) + c.visitor + c.to;
      break;
    case 'turn':
      title = 'A hinge moves under the inn';
      line =
        'I turned ' +
        floorNames[c.cell] +
        '. Its doors now open ' +
        openings(sketch(s), c.cell).join(' and ') +
        '.';
      key = c.cell + '-' + sketch(s);
      break;
    case 'template':
      title = 'A neighbour unrolls the floor';
      line =
        'I unfolded ' +
        (
          {
            lunch: 'Tover’s supper floor',
            song: 'Neska’s entrance for a late singer',
            green: 'Yilka’s quiet garden floor',
          } as const
        )[c.layout] +
        '. The rooms could still turn under my hand.';
      key = c.layout;
      break;
    case 'chalk':
      title = 'A path in two kinds of chalk';
      line =
        'I laid down ' +
        (c.visitor === 'wheel' ? 'the wheel' : 'the shoe') +
        ' and followed the connected openings. ' +
        chalkAccount({ visitor: c.visitor, floor: sketch(s) });
      key = sketch(s) + c.visitor;
      break;
    case 'issue':
      title = 'The floor goes out to three neighbours';
      line =
        'I pressed my plan into wax. I asked the guild to ' +
        plans[c.purpose].toLowerCase() +
        '. The wheel and the light still had to make the journey.';
      key = issuedHouse(s) + townSeam(s) + c.purpose;
      break;
    case 'step':
    case 'restart':
    case 'undo':
      title = 'Chalk on the cartwheels';
      line =
        'I ' +
        (c.act === 'restart'
          ? 'rolled the kettle back to the mat'
          : c.act === 'undo'
            ? 'pulled in the last chalk line'
            : 'pushed the cart ' + c.face) +
        ' and stopped at ' +
        floorNames[cartPosition(s)] +
        '.';
      key = issuedHouse(s) + cartPath(s);
      break;
    case 'park': {
      const stop = fieldMemo(s).r!;
      title = 'The kettle comes to rest';
      line = 'I drew the wheels to a stop at ' + destinationNames[stop] + '. ' + trialWords[stop];
      key = issuedHouse(s) + stop;
      break;
    }
    case 'place':
    case 'light':
    case 'file': {
      title = c.act === 'file' ? 'The lamp the harbour keeps' : 'One lamp and a corner';
      line =
        'I ' +
        (c.act === 'file'
          ? 'left the harbour lamp at '
          : c.act === 'place'
            ? 'hung the shutter at '
            : 'opened the lamp at ') +
        floorNames[lanternPosition(s)] +
        '. ' +
        (c.act === 'place'
          ? 'The shutter was still in my hand.'
          : lightingLine(issuedHouse(s)!, lanternPosition(s)));
      key = issuedHouse(s) + String(lanternPosition(s));
      break;
    }
    case 'table':
      title = 'Somebody lives on the new landing';
      line =
        'I gave the next evening to ' +
        destinationNames[c.who] +
        '. ' +
        postedWelcome(s) +
        ' ' +
        String(houseFlag(s, 'houseEcho'));
      key =
        issuedHouse(s) +
        String(houseFlag(s, 'purpose')) +
        c.who +
        String(houseFlag(s, 'porchStop')) +
        String(fieldMemo(s).spot);
      break;
  }
  return diaryEvent(
    'middlehouse:' + c.act + ':' + key,
    'tool',
    'middlehouse',
    title,
    line,
    {},
    'after-break',
  );
}
