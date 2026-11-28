import { carriesSpecimen, PERSPECTIVE_FLAG, specimenToolId } from './specimenGear';
import { stackWindow } from '../content/stackWindows';
import { diaryEvent } from './adventureEvents';
import type { CampaignState, Effect, Weave } from './types';

export const easternCopy = 'estoo:media-2551';
export const stacksShop = 'civic.turning-stacks';
export const stacksWalk = 'voices.quay';

export const stackLeaves = {
  fort: {
    title: 'The article that points ahead',
    credit: 'Oklahoma State University treaty transcript',
    subject: 'Fort Wayne, 30 September 1809',
    source: 'HIS-EDGE-01',
    detail:
      'Article 5 makes the first tract depend on Wea consent. A reader following that clause has a second document to find.',
    limit: 'The names written under the September agreement cannot tell us who signed a later one.',
    marginal: 'I found a future tense in something I had been reading as finished.',
  },
  convention: {
    title: 'Twenty-six days later',
    credit: 'Oklahoma State University treaty transcript',
    subject: 'Convention at Vincennes, 26 October 1809',
    source: 'HIS-EDGE-05',
    detail:
      'The October text records a declaration by named Wea representatives and includes the payments agreed with the United States commissioner. Its signatures and date belong to this convention.',
    limit: 'The written declaration alone cannot recover the circumstances of every person affected.',
    marginal: 'The mark on the second page came twenty-six days after the date I had copied.',
  },
  peoria: {
    title: 'A history in the present tense',
    credit: 'Peoria Tribe of Indians of Oklahoma',
    subject: 'The Tribe’s public history',
    source: 'HIS-STACK-PEORIA',
    detail:
      'The Tribe describes Kaskaskia, Peoria, Piankashaw and Wea peoples forming a confederation in 1854. Its account also places twenty tribes in the nation’s wider history. The difference matters when a short label seems to list everyone.',
    limit: 'This present-day account and a list of signatories to one 1809 convention answer different questions.',
    marginal:
      'I left space after the four names. The people who published the history explain whom such a list can leave out.',
  },
  eastern: {
    title: 'Three signatures under one count',
    credit: 'Eastern Shawnee Tribe of Oklahoma',
    subject: 'Certificate in the Tribe’s published constitution, 17 June 1999',
    source: 'HIS-STACK-CERT',
    detail:
      'The election board recorded 115 votes for an amendment, 48 against and 6 spoiled ballots. The certificate names 270 members entitled to vote. Three board members signed the figures.',
    limit:
      'These numbers describe this election. They cannot tell us an individual voter’s reasons or stand for another Shawnee government.',
    marginal: 'The six spoiled ballots kept a place of their own when I set out the numbers.',
  },
  absentee: {
    title: 'Why a leader appears on a seal',
    credit: 'Absentee Shawnee Tribe of Indians of Oklahoma',
    subject: 'The Tribe’s own public introduction',
    source: 'HIS-EDGE-02',
    detail:
      'The Tribe explains why its logo features Tecumseh. Its account remembers his work for an alliance in which peoples could live under their own laws and leaders.',
    limit:
      'This is the publishing Tribe’s account of its own emblem. It supplies neither a verbatim speech nor a vote by another Nation.',
    marginal: 'I could now tell the listener who chose to tell this story about the emblem.',
  },
  marker: {
    title: 'Words in a public square',
    credit: 'Indiana Historical Bureau',
    subject: 'Tecumseh and Harrison marker, installed 2011',
    source: 'HIS-EDGE-03',
    detail:
      'The state marker commemorates meetings at Vincennes in 1810 and 1811 and names Tecumseh’s objection to the land cession. People can read the marker more than two centuries after the first meeting.',
    limit:
      'Its inscription was written for a public marker. The state’s wording is not a transcript of Tecumseh’s speech.',
    marginal: 'I pencilled in both times, the meetings and the much later act of marking them.',
  },
} as const;

export type Leaf = keyof typeof stackLeaves;
export type Shelf = 'window' | 'stair';
export type Visitor = 'wheel' | 'lamp';
export type Aisle = 'window' | 'stair' | 'centre';
export type Direction = 'north' | 'south' | 'east' | 'west';
export type Ballots = 'valid' | 'returned' | 'eligible';
export const leafKeys = Object.keys(stackLeaves) as Leaf[];
export const aisles: Record<Aisle, string> = {
  window: 'the window crossing',
  stair: 'the stair crossing',
  centre: 'the middle crossing',
};
export const visitors: Record<Visitor, string> = {
  wheel: 'Opal and her cabinet on wheels',
  lamp: 'Tallis with the lantern ladder',
};
export const seats: Record<Shelf, string> = { window: 'the window shelf', stair: 'the stair shelf' };
const leafAt = (v: unknown): v is Leaf => typeof v === 'string' && Object.hasOwn(stackLeaves, v);
const isAisle = (v: unknown): v is Aisle => typeof v === 'string' && Object.hasOwn(aisles, v);
const isVisitor = (v: unknown): v is Visitor => typeof v === 'string' && Object.hasOwn(visitors, v);
const directions: Record<Direction, readonly [number, number]> = {
  north: [0, -1],
  east: [1, 0],
  south: [0, 1],
  west: [-1, 0],
};
const pos = (x: number, y: number) => y * 5 + x;
export const shelfSquares: Record<Shelf, number> = { window: pos(1, 1), stair: pos(3, 3) };
const entrySquares: Record<Visitor, number> = { wheel: pos(0, 2), lamp: pos(4, 2) };
export const stackWeave: Weave = {
  concepts: [
    'evidence',
    'power',
    'culture',
    'perspective',
    'interpretation',
    'responsibility',
    'justification',
    'values',
  ],
  framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'],
  aoks: ['HIS', 'HUM', 'MAT', 'POL', 'IND', 'LAN'],
  subjects: ['history', 'global-politics', 'geography', 'math-ai', 'lang-langlit', 'design-tech'],
  atl: ['thinking', 'research', 'communication', 'social'],
  thinking: { dok: 3, bloom: 'create', fink: 'integration', solo: 'relational' },
};
export function ballotView(kind: Ballots) {
  const denominator = { valid: 163, returned: 169, eligible: 270 }[kind];
  return {
    numerator: 115,
    denominator,
    percent: (11500 / denominator).toFixed(1),
    label: {
      valid: 'votes recorded for or against',
      returned: 'ballots cast, including six spoiled',
      eligible: 'members entitled to vote',
    }[kind],
  };
}
export function stackPlan(s: Pick<CampaignState, 'flags'>) {
  const f = s.flags,
    window = f['stacks.window'],
    stair = f['stacks.stair'],
    aisle = f['stacks.aisle'],
    visitor = f['stacks.visitor'],
    square = f['stacks.square'],
    order = f['stacks.order'];
  return {
    window: leafAt(window) ? window : ('convention' as Leaf),
    stair: leafAt(stair) ? stair : ('peoria' as Leaf),
    aisle: isAisle(aisle) ? aisle : ('centre' as Aisle),
    visitor: isVisitor(visitor) ? visitor : undefined,
    square:
      typeof square === 'number' && Number.isInteger(square) && square >= 0 && square < 25 ? square : undefined,
    order: typeof order === 'string' && ['', 'w', 's', 'ws', 'sw'].includes(order) ? order : '',
  };
}
export function stackSquare(square: number, aisle: Aisle) {
  const x = square % 5,
    y = Math.floor(square / 5),
    openRow = { window: 0, centre: 2, stair: 4 }[aisle];
  if (x === 2 && y !== openRow) return 'partition';
  if (square === shelfSquares.window) return 'window shelf';
  if (square === shelfSquares.stair) return 'stair shelf';
  if (square === entrySquares.wheel) return 'wheel door';
  if (square === entrySquares.lamp) return 'lamp door';
  return 'aisle';
}
export function stepSquare(square: number, way: Direction, aisle: Aisle) {
  const [dx, dy] = directions[way],
    x = (square % 5) + dx,
    y = Math.floor(square / 5) + dy;
  if (x < 0 || x > 4 || y < 0 || y > 4 || stackSquare(pos(x, y), aisle) === 'partition') return undefined;
  return pos(x, y);
}
/** For the optional guided route and the plain-text directions. Both use the same physical grid. */
export function stackPath(from: number, to: number, aisle: Aisle): Direction[] {
  const queue = [{ square: from, via: [] as Direction[] }],
    known = new Set([from]);
  for (let i = 0; i < queue.length; i++) {
    const { square, via } = queue[i];
    if (square === to) return via;
    for (const way of Object.keys(directions) as Direction[]) {
      const next = stepSquare(square, way, aisle);
      if (next === undefined || known.has(next)) continue;
      known.add(next);
      queue.push({ square: next, via: [...via, way] });
    }
  }
  return [];
}
type Edition = { first: Leaf; second: Leaf; visitor: Visitor; aisle: Aisle };
export function stackEdition(s: Pick<CampaignState, 'flags'>): Edition | undefined {
  const raw = s.flags['stacks.edition'];
  if (typeof raw !== 'string') return;
  const [first, second, visitor, aisle, ...rest] = raw.split('~');
  if (
    rest.length ||
    !leafAt(first) ||
    !leafAt(second) ||
    first === second ||
    !isVisitor(visitor) ||
    !isAisle(aisle)
  )
    return;
  return { first, second, visitor, aisle };
}
export type StackCommand = { type: 'WorkTurningStacks' } & (
  | { act: 'shelve'; shelf: Shelf; leaf: Leaf }
  | { act: 'swing'; aisle: Aisle }
  | { act: 'enter'; visitor: Visitor }
  | { act: 'step'; way: Direction }
  | { act: 'follow'; shelf: Shelf }
  | { act: 'read' }
  | { act: 'bind' }
  | { act: 'count'; basis: Ballots }
  | { act: 'headline'; side: 'for' | 'against' }
  | { act: 'signature'; line: 'board' | 'date' }
  | { act: 'open'; edge: 'street' | 'inside' }
  | { act: 'glass'; lens: 'voices' | 'years' }
  | { act: 'reply'; voice: 'maker' | 'carrier' }
);
type S = CampaignState;
const flag = (key: string, value: string | number | boolean): Effect => ({ setFlag: 'stacks.' + key, value });
const clearWalk = () => [flag('visitor', ''), flag('square', -1), flag('order', '')];
const sourceAt = (square: number | undefined) =>
  square === shelfSquares.window ? 'window' : square === shelfSquares.stair ? 'stair' : undefined;
export function stackEffects(s: S, cmd: StackCommand): Effect[] {
  const p = stackPlan(s);
  if (cmd.act === 'open' || cmd.act === 'reply' || cmd.act === 'glass') {
    const edition = stackEdition(s);
    if (s.mapId !== stacksWalk || !edition) throw Error('Carry a bound pair to the lamp quay first.');
    const issued = s.flags['stacks.edition'];
    if (typeof issued !== 'string') throw Error('The fold is empty.');
    if (cmd.act === 'open') {
      if (!['street', 'inside'].includes(cmd.edge))
        throw Error('Open the lamp for the street or the people inside.');
      return [flag('opened', issued), flag('facing', cmd.edge), flag('opened.' + cmd.edge, true)];
    }
    if (cmd.act === 'glass') {
      if (!['voices', 'years'].includes(cmd.lens) || s.flags['stacks.opened'] !== issued)
        throw Error('Open this edition before turning its brass plate.');
      const pair = [edition.first, edition.second].sort().join('.');
      return [
        flag('glass', cmd.lens),
        flag('glassEdition', issued),
        flag('glass.' + cmd.lens, issued),
        flag('readPair.' + pair + '.' + cmd.lens, true),
      ];
    }
    if (!['maker', 'carrier'].includes(cmd.voice) || s.flags['stacks.opened'] !== issued)
      throw Error('Open this edition before hearing its visitors.');
    return [flag('heard.' + cmd.voice, issued), flag('replied', true)];
  }
  if (s.mapId !== stacksShop) throw Error('The trial floor is under the two lamps at Canal Walk.');
  switch (cmd.act) {
    case 'signature':
      if (!carriesSpecimen(s, easternCopy) || s.flags[PERSPECTIVE_FLAG] !== specimenToolId(easternCopy))
        throw Error(
          'Bring the constitutional file from the original Civic case and equip it at the signature lamp.',
        );
      if (cmd.line !== 'board' && cmd.line !== 'date') throw Error('Move the lens to a printed line.');
      return [flag('signature.' + cmd.line, true), flag('signature', cmd.line)];
    case 'shelve': {
      if (!Object.hasOwn(seats, cmd.shelf) || !leafAt(cmd.leaf)) throw Error('Choose a mounted leaf and a shelf.');
      if (p[cmd.shelf] === cmd.leaf) return [];
      const other = cmd.shelf === 'window' ? 'stair' : 'window';
      const exchange = p[other] === cmd.leaf ? [flag(other, p[cmd.shelf])] : [];
      return [...exchange, flag(cmd.shelf, cmd.leaf), ...clearWalk()];
    }
    case 'swing':
      if (!isAisle(cmd.aisle)) throw Error('Choose a crossing in the partition.');
      return p.aisle === cmd.aisle ? [] : [flag('aisle', cmd.aisle), ...clearWalk()];
    case 'enter':
      if (!isVisitor(cmd.visitor)) throw Error('Choose a visitor at one of the two doors.');
      return [flag('visitor', cmd.visitor), flag('square', entrySquares[cmd.visitor]), flag('order', '')];
    case 'step':
    case 'follow': {
      if (!p.visitor || p.square === undefined) throw Error('Invite a visitor through a door first.');
      if (cmd.act === 'step' && !Object.hasOwn(directions, cmd.way))
        throw Error('Choose a direction on the floor.');
      if (cmd.act === 'follow' && !Object.hasOwn(seats, cmd.shelf)) throw Error('Choose one of the two shelves.');
      const next = cmd.act === 'step' ? stepSquare(p.square, cmd.way, p.aisle) : shelfSquares[cmd.shelf];
      if (next === undefined) throw Error('The screen is solid here. Follow the opening, or try the marked path.');
      if (cmd.act === 'follow' && next !== p.square && !stackPath(p.square, next, p.aisle).length)
        throw Error('The passage is closed.');
      return [flag('square', next)];
    }
    case 'read': {
      const shelf = sourceAt(p.square);
      if (!p.visitor || !shelf) throw Error('Walk up to a shelf to open its leaf.');
      const marker = shelf === 'window' ? 'w' : 's';
      return [
        flag('read.' + p[shelf], true),
        flag('order', p.order.includes(marker) ? p.order : p.order + marker),
      ];
    }
    case 'count':
      if (
        !Object.hasOwn({ valid: 1, returned: 1, eligible: 1 }, cmd.basis) ||
        s.flags['stacks.read.eastern'] !== true
      )
        throw Error('Open the election certificate on a shelf first.');
      return [flag('basis', cmd.basis), flag('count.' + cmd.basis, true)];
    case 'headline':
      if (s.flags['stacks.basis'] !== 'valid' || (cmd.side !== 'for' && cmd.side !== 'against'))
        throw Error('Turn the ring to the votes recorded for or against first.');
      return [flag('headline', cmd.side), flag('headline.' + cmd.side, true)];
    case 'bind': {
      if (!p.visitor || p.order.length !== 2)
        throw Error('Let one visitor reach and read both leaves before you bind them.');
      const first = p.order === 'ws' ? p.window : p.stair,
        second = p.order === 'ws' ? p.stair : p.window;
      return [flag('edition', [first, second, p.visitor, p.aisle].join('~')), flag('bound', true)];
    }
  }
}
export function stackDiary(s: CampaignState, cmd: StackCommand) {
  const p = stackPlan(s),
    ed = stackEdition(s),
    square = p.square,
    at = sourceAt(square);
  let key: string = cmd.act,
    title = 'Under the folding roof',
    line = '',
    sources: string[] = [];
  switch (cmd.act) {
    case 'signature':
      key += '.' + cmd.line;
      title = 'The names behind the count';
      line =
        cmd.line === 'board'
          ? 'On the certificate I followed three separate lines to Mary Moss, Lena Mae Elliott and Glen Brock. Their roles on the election board told me who certified the result.'
          : 'I uncovered 17 June 1999 at the foot of the sheet. It dated this certification and the vote identified above. Another page of the constitution could have a different history.';
      sources = ['HIS-STACK-CERT'];
      break;
    case 'shelve':
      key += '.' + cmd.shelf + '.' + cmd.leaf;
      line =
        'I hung “' +
        stackLeaves[cmd.leaf].title +
        '” on ' +
        seats[cmd.shelf] +
        '. Its publisher’s line moved with it.';
      break;
    case 'swing':
      key += '.' + cmd.aisle;
      line =
        'I swung the screen until the only way across was ' +
        aisles[cmd.aisle] +
        '. Tallis could see who would have to turn back.';
      break;
    case 'enter':
      key += '.' + cmd.visitor;
      line =
        'I opened the door for ' + visitors[cmd.visitor] + '. The room looked quite different from this side.';
      break;
    case 'follow':
    case 'step':
      key += '.' + p.visitor + '.' + square;
      line =
        'I walked with ' +
        visitors[p.visitor!] +
        ' to ' +
        String.fromCharCode(65 + (square! % 5)) +
        (Math.floor(square! / 5) + 1) +
        '. We reached ' +
        stackSquare(square!, p.aisle) +
        '.';
      break;
    case 'read': {
      const l = stackLeaves[p[at!]];
      key += '.' + p[at!];
      title = l.title;
      line = l.marginal + ' The publishing credit read ' + l.credit + '.';
      sources = [l.source];
      break;
    }
    case 'count': {
      const b = ballotView(cmd.basis);
      key += '.' + cmd.basis;
      title = 'The size of the circle';
      line =
        'I lit 115 places among ' +
        b.denominator +
        ' ' +
        b.label +
        '. The ring read ' +
        b.percent +
        '%. The certificate kept the original counts alongside it.';
      sources = ['HIS-STACK-CERT'];
      break;
    }
    case 'headline':
      key += '.' + cmd.side;
      title = 'Two headlines on a swivel';
      line =
        cmd.side === 'for'
          ? 'My first line lit the 115 votes for, 70.6% of the 163 valid votes. Tallis thought the small lamps at the edge were missing until he read the reverse.'
          : 'I turned the same plate to the 48 votes against, 29.4% of the 163 valid votes. Opal could read a disagreement from the landing. Every vote stayed on the same board.';
      sources = ['HIS-STACK-CERT'];
      break;
    case 'bind':
      key += '.' + s.flags['stacks.edition'];
      title = 'An edition that opens at either end';
      line =
        'I bound “' +
        stackLeaves[ed!.first].title +
        '” before “' +
        stackLeaves[ed!.second].title +
        '”, in the order our visitor reached them. Each leaf carried its own publisher into the quay.';
      sources = [stackLeaves[ed!.first].source, stackLeaves[ed!.second].source];
      break;
    case 'open':
      key += '.' + cmd.edge + '.' + s.flags['stacks.edition'];
      title = 'Who saw the byline first?';
      line =
        cmd.edge === 'street'
          ? 'I opened the lamp outward. People by the boats could read the publisher before deciding to step inside.'
          : 'I turned the lamp in. People close to the shelf could follow the small print while the next ferry passed.';
      sources = [stackLeaves[ed!.first].source, stackLeaves[ed!.second].source];
      break;
    case 'glass':
      key += '.' + cmd.lens + '.' + s.flags['stacks.edition'];
      title = cmd.lens === 'voices' ? 'Two bylines lit together' : 'The dates in the brass windows';
      line = 'I turned the plate. ' + stackWindow(ed!.first, ed!.second)[cmd.lens];
      sources = [stackLeaves[ed!.first].source, stackLeaves[ed!.second].source];
      break;
    case 'reply':
      key += '.' + cmd.voice + '.' + s.flags['stacks.edition'];
      title = 'Who turned the brass plate?';
      line =
        cmd.voice === 'maker'
          ? 'Opal told me where she had hidden the loose pin. She wanted the lender’s names to survive the journey.'
          : 'Tallis let me put a hand on the counterweight. In the dark he had been lifting the nameplate so the child at the window could read it.';
      break;
  }
  return diaryEvent(
    'turning-stacks:' + key,
    cmd.act === 'read' || cmd.act === 'count'
      ? 'finding'
      : cmd.act === 'step' || cmd.act === 'follow'
        ? 'route'
        : 'choice',
    'turning-stacks',
    title,
    line,
    { sourceIds: sources },
  );
}
