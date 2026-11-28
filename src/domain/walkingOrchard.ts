import { diaryEvent } from './adventureEvents';
import type { CampaignState, Effect, FlagValue, Weave } from './types';

export const orchardYard = 'forest.walking-orchard';
export const orchardSquare = 'civic.grove-square';
export const beds = ['kiln', 'steps', 'bath'] as const;
export const seasons = ['ash', 'ribbon'] as const;
export const dates = ['planting', 'frost'] as const;
export type Bed = (typeof beds)[number];
export type Season = (typeof seasons)[number];
type FieldDate = (typeof dates)[number];
export const bedName: Record<Bed, string> = { kiln: 'Kiln Wall', steps: 'Bell Steps', bath: 'Old Baths' };
export const seasonName: Record<Season, string> = { ash: 'the Ash spring', ribbon: 'the Ribbon spring' };
export const dateName: Record<FieldDate, string> = { planting: 'first spade', frost: 'after frost' };
type Root = 'living' | 'lost' | 'unread';
export const rootSymbols: Record<Root, string> = { living: '✳', lost: '×', unread: '?' };
export const rootLabels: Record<Root, string> = {
  living: 'leaf seen',
  lost: 'loss recorded',
  unread: 'no later entry',
};
export const footprints: Record<Bed, { title: string; line: string; voice: string }> = {
  kiln: {
    title: 'One boot has a square heel',
    line: 'Four wheel rims cut through yesterday’s ash. Between them is the print of a boot with a square heel. The boot never takes a second step.',
    voice: 'Gresa used an old shoe to stop the barrow rolling. Four wheels could carry a bare tub too.',
  },
  steps: {
    title: 'The orchard hums in four parts',
    line: 'The tune starts halfway up the steps. A sapling turns sideways on its own. Under its leaves somebody is trying very hard not to sneeze.',
    voice: 'The late singers pulled the tubs uphill for the dance. Nobody counted leaves that night.',
  },
  bath: {
    title: 'The middle of a pink circle',
    line: 'Under a barrel there is a pink circle with one small gap. The same gap appears in a chalk ring beside the warm wall.',
    voice:
      'Pella marked room for the tubs that needed a second visit. A mark to return is still only a promise.',
  },
};
const root = (s: string): Root[] =>
  [...s].map((mark) => (mark === 'y' ? 'living' : mark === 'n' ? 'lost' : 'unread'));
const signs: Record<Season, Record<Bed, Root[]>> = {
  ash: { kiln: root('yn?y'), steps: root('?ny?'), bath: root('ny??') },
  ribbon: { kiln: root('yyny'), steps: root('?nyy'), bath: root('ny?y') },
};
export type Load = 'bare' | 'leaf';
export type Boot = 'tied' | 'hanging';
export const loads: Record<Load, string> = { bare: 'An empty tub', leaf: 'A sapling in leaf' };
export const boots: Record<Boot, string> = {
  tied: 'The square heel on the rim',
  hanging: 'The boot on its peg',
};
export function barrowPrint(load: Load, boot: Boot) {
  return {
    rims: 2,
    heels: boot === 'tied' ? 1 : 0,
    leaf: load === 'leaf',
    line:
      (boot === 'tied' ? 'Two rims and one square heel.' : 'Two rims and no heel.') +
      ' ' +
      (load === 'leaf' ? 'The leaves brush Pella’s sleeve.' : 'The empty tub rings like a little drum.'),
  };
}
export const editionNames = {
  shade: 'Keep the old baths in shade',
  parade: 'Give the tubs a road through the dance',
  return: 'Send a crew back after frost',
} as const;
export type Edition = keyof typeof editionNames;
export const delivery: Record<Edition, { built: string; gresa: string; pella: string; art: string }> = {
  shade: {
    built: 'The washhouse awning',
    gresa:
      'Gresa unties the canvas. The growers can sit under it with a tub and wait for somebody to look. The parade sees only a quiet roof.',
    pella:
      'Pella folds the long shadow around the last tub. She still has to find somebody to visit the beds she cannot see.',
    art: 'orchard.awning',
  },
  parade: {
    built: 'A road through the dancers',
    gresa:
      'Two ranks of dancers pivot. The orchard rolls between them. The boots on the wheels leave a festival photograph full of apparent walkers.',
    pella:
      'Pella finds her first good view of the three beds at once. A wagon of bare pots could have made just as splendid an entrance.',
    art: 'orchard.cart',
  },
  return: {
    built: 'The after-frost return bench',
    gresa:
      'Gresa has a dry seat and a pencil for the next visit. The tending crew can return when a growth mark actually means something.',
    pella:
      'Pella relights the welcome arch by herself. The new visits cost an evening of music. She leaves a whole verse for the people going out.',
    art: 'orchard.bench',
  },
};
type S = Pick<CampaignState, 'flags'>;
export const orchardFlag = (s: S, k: string) => s.flags['grove.' + k];
const set = (k: string, v: FlagValue = true): Effect => ({ setFlag: 'grove.' + k, value: v });
export const readBed = (s: S, season: Season, bed: Bed, date: FieldDate) =>
  orchardFlag(s, ['look', season, bed, date].join('.')) === true;
export function rootCard(s: S, season: Season, bed: Bed, date: FieldDate) {
  if (!readBed(s, season, bed, date)) return null;
  return date === 'planting'
    ? (['planted', 'planted', 'planted', 'planted'] as const)
    : [...signs[season][bed]];
}
export function seasonCount(s: S, season: Season, date: FieldDate) {
  let yes = 0,
    no = 0,
    absent = 0,
    unvisited = 0;
  for (const place of beds) {
    const marks = rootCard(s, season, place, date);
    if (!marks) {
      unvisited += 4;
      continue;
    }
    for (const mark of marks) {
      if (mark === 'living' || mark === 'planted') yes++;
      else if (mark === 'lost') no++;
      else absent++;
    }
  }
  return { yes, no, absent, unvisited, min: yes, max: yes + absent + unvisited };
}
export const countsReady = (s: S) =>
  seasons.every((y) => dates.every((d) => beds.every((b) => readBed(s, y, b, d))));
export function frostDifference(s: S) {
  const old = seasonCount(s, 'ash', 'frost'),
    now = seasonCount(s, 'ribbon', 'frost');
  return { min: now.min - old.max, max: now.max - old.min };
}
export const edition = (s: S): Edition | undefined =>
  Object.keys(editionNames).find((k) => k === orchardFlag(s, 'edition')) as Edition | undefined;
const bands = ['yard', 'hours', 'job'] as const;
export type Band = (typeof bands)[number];
export const bandNames: Record<Band, string> = {
  yard: 'part of the square',
  hours: 'working hours',
  job: 'kind of work',
};
export const requests = ['canvas', 'wheels', 'ring'] as const;
export type Request = (typeof requests)[number];
type Slip = { yard: Bed; hours: 'early' | 'late'; job: 'carry' | 'tend' };
const slips: Slip[] = beds.flatMap((yard) =>
  (['early', 'late'] as const).flatMap((hours) =>
    (['carry', 'tend'] as const).map((job) => ({ yard, hours, job })),
  ),
);
const requestsData: Record<Request, { index: number; hint: string; allow: Band[] }> = {
  canvas: {
    index: 1,
    hint: 'A grower will lend the count for the morning round. Leave the workplace behind the cloth.',
    allow: ['hours', 'job'],
  },
  wheels: {
    index: 6,
    hint: 'A carrier will lend the location. The working hours belong to the crew.',
    allow: ['yard', 'job'],
  },
  ring: {
    index: 11,
    hint: 'Someone at the baths lends a contribution to the whole-square total. Keep every detail of the rota covered.',
    allow: [],
  },
};
export const requestWords = (r: Request) => requestsData[r].hint;
export const selectedBand = (s: S, band: Band) => orchardFlag(s, 'window.' + band) === true;
export const currentRequest = (s: S) => requests.find((r) => r === orchardFlag(s, 'request')) ?? 'canvas';
export function shutterLight(s: S) {
  const request = requestsData[currentRequest(s)],
    focal = slips[request.index];
  const exposed = bands.filter((b) => selectedBand(s, b)),
    detail = exposed.filter((b) => !request.allow.includes(b));
  const count = slips.filter((record) => exposed.every((b) => record[b] === focal[b])).length;
  return { count, exposed, detail, small: count < 3 };
}
export function editionFace(s: S) {
  const raw = orchardFlag(s, 'publishedWindow');
  return typeof raw === 'string' ? raw : 'The rota stays inside the shade.';
}
export function publishedReading(s: S) {
  const pane = orchardFlag(s, 'publishedPane');
  return pane === 'poster' || pane === 'frost' || pane === 'spade'
    ? comparisonLine(s, pane)
    : 'The lantern is waiting for its pane.';
}
export type OrchardCommand = { type: 'TendWalkingOrchard' } & (
  | { act: 'peek'; season: Season; bed: Bed; date: FieldDate }
  | { act: 'track'; bed: Bed }
  | { act: 'load'; load: Load }
  | { act: 'boot'; boot: Boot }
  | { act: 'roll' }
  | { act: 'account'; story: 'cart' | 'open' }
  | { act: 'join'; comparison: 'poster' | 'frost' | 'spade' }
  | { act: 'hang'; pane: 'poster' | 'frost' | 'spade' }
  | { act: 'request'; who: Request }
  | { act: 'shutter'; band: Band }
  | { act: 'light' }
  | { act: 'reserve'; how: 'count' | 'closed' }
  | { act: 'pledge'; route: Edition }
  | { act: 'visit'; who: 'gresa' | 'pella' }
  | { act: 'answer'; route: 'move' | 'keep' | 'invite' }
);
export function comparisonLine(s: S, key: 'poster' | 'spade' | 'frost') {
  if (key === 'poster')
    return 'The old lantern shows twelve planting-night tubs. The new one shows seven witnessed leaves after frost. The five dark panes measure a change in the counting rule too.';
  if (key === 'spade') {
    const a = seasonCount(s, 'ash', 'planting'),
      b = seasonCount(s, 'ribbon', 'planting');
    return (
      'The spade-night marks give ' +
      a.yes +
      ' planted tubs in the Ash spring and ' +
      b.yes +
      ' in the Ribbon spring. A planting record ends before the frost.'
    );
  }
  const a = seasonCount(s, 'ash', 'frost'),
    b = seasonCount(s, 'ribbon', 'frost'),
    delta = frostDifference(s);
  return (
    'After frost the Ash spring leaves ' +
    a.min +
    ' to ' +
    a.max +
    ' living tubs, the Ribbon spring ' +
    b.min +
    ' to ' +
    b.max +
    '. The possible change runs from ' +
    delta.min +
    ' to +' +
    delta.max +
    '. Empty spaces in the books still have no verdict.'
  );
}
export function orchardEffects(s: CampaignState, c: OrchardCommand): Effect[] {
  const current = edition(s);
  if (c.act === 'visit' || c.act === 'answer') {
    if (s.mapId !== orchardSquare || !current)
      throw Error('Find what your promise built in the Civic square.');
    if (c.act === 'visit') return [set('visit.' + c.who, current)];
    if (!(['gresa', 'pella'] as const).every((w) => orchardFlag(s, 'visit.' + w) === current))
      throw Error('Walk through the square with Gresa and Pella. They arrived for different things.');
    return [set('answer', c.route), set('answerEdition', current)];
  }
  if (s.mapId !== orchardYard) throw Error('Try the tubs at the nursery beyond Fern Station.');
  switch (c.act) {
    case 'peek':
      return [set(['look', c.season, c.bed, c.date].join('.'))];
    case 'load':
      return [set('barrowLoad', c.load)];
    case 'boot':
      return [set('barrowBoot', c.boot)];
    case 'roll': {
      const load = orchardFlag(s, 'barrowLoad') === 'leaf' ? 'leaf' : 'bare',
        boot = orchardFlag(s, 'barrowBoot') === 'tied' ? 'tied' : 'hanging';
      return [set('rolled.' + load + '.' + boot), set('lastRoll', load + '.' + boot)];
    }
    case 'account':
      if (
        !['leaf', 'bare'].every((load) =>
          ['hanging', 'tied'].every((boot) => orchardFlag(s, 'rolled.' + load + '.' + boot) === true),
        )
      )
        throw Error(
          'Give the leafy and bare tubs a turn with the boot on its peg and on the wheel. Gresa will keep all four prints.',
        );
      return [set('account', c.story)];
    case 'track':
      return [set('track.' + c.bed)];
    case 'join':
      if (
        c.comparison !== 'poster' &&
        !seasons.every((y) =>
          beds.every((b) => readBed(s, y, b, c.comparison === 'spade' ? 'planting' : 'frost')),
        )
      )
        throw Error(
          'Light the same dated page in the three beds of both springs first. A bed with a missing entry still counts as visited.',
        );
      return [set('joined.' + c.comparison)];
    case 'hang':
      if (orchardFlag(s, 'joined.' + c.pane) !== true)
        throw Error(
          'Bring these two panes together in the nursery before putting their reading above the lamp.',
        );
      return [set('draftPane', c.pane)];
    case 'request':
      return [set('request', c.who), set('preview', false), ...bands.map((b) => set('window.' + b, false))];
    case 'shutter':
      return [set('window.' + c.band, !selectedBand(s, c.band)), set('preview', false)];
    case 'light': {
      const light = shutterLight(s);
      return [set('preview', true), set('saw.' + (light.small ? 'small' : 'crowd'))];
    }
    case 'reserve': {
      if (c.how === 'closed') return [set('draftWindow', 'The rota stays inside the shade.')];
      const view = shutterLight(s);
      if (view.detail.length)
        throw Error(
          'The person lending this count kept a shutter closed. Fold the withheld detail back or carry the rota rolled up.',
        );
      if (view.small)
        throw Error('Too few hands share this outline. Fold another shutter or carry the rota rolled up.');
      const face = view.exposed.length
        ? 'Grouped by ' + view.exposed.map((b) => bandNames[b]).join(' and ')
        : 'All hands together';
      return [
        set(
          'draftWindow',
          face + '. ' + view.count + ' matching slips. The count travels without individual rota entries.',
        ),
      ];
    }
    case 'pledge': {
      if (
        !countsReady(s) ||
        orchardFlag(s, 'joined.frost') !== true ||
        orchardFlag(s, 'joined.spade') !== true
      )
        throw Error(
          'Bring both years together at first spade and after frost before asking the town to spend its evening.',
        );
      const face = orchardFlag(s, 'draftWindow');
      if (typeof face !== 'string')
        throw Error('Roll the rota shut or choose a permitted group count for the Civic lantern.');
      const pane = orchardFlag(s, 'draftPane');
      if (pane !== 'poster' && pane !== 'frost' && pane !== 'spade')
        throw Error(
          'Hang one witnessed reading overhead. The town will see the reading and what you are asking it to do separately.',
        );
      if (current === c.route && face === editionFace(s) && pane === orchardFlag(s, 'publishedPane'))
        return [];
      return [
        set('edition', c.route),
        set('publishedWindow', face),
        set('publishedPane', pane),
        set('visit.gresa', false),
        set('visit.pella', false),
        set('answer', ''),
        set('answerEdition', ''),
      ];
    }
  }
}
const operations: Record<'roots' | 'light' | 'square', Weave> = {
  roots: {
    concepts: ['evidence', 'certainty', 'interpretation', 'objectivity', 'explanation'],
    framework: ['methods-and-tools', 'scope'],
    aoks: ['NAT', 'MAT', 'HUM'],
    subjects: ['biology', 'math-ai', 'ess'],
    atl: ['research', 'thinking'],
  },
  light: {
    concepts: ['responsibility', 'power', 'perspective', 'values', 'justification'],
    framework: ['ethics', 'perspectives', 'methods-and-tools'],
    aoks: ['HUM', 'TEC', 'POL'],
    subjects: ['digital-society', 'computer-science', 'global-politics'],
    atl: ['communication', 'social'],
  },
  square: {
    concepts: ['truth', 'culture', 'values', 'perspective', 'power', 'responsibility'],
    framework: ['ethics', 'perspectives', 'scope'],
    aoks: ['HUM', 'ART', 'POL'],
    subjects: ['geography', 'theatre', 'lang-b'],
    atl: ['communication', 'social'],
  },
};
export function orchardTopics(act: OrchardCommand['act']) {
  return operations[
    (['peek', 'track', 'join', 'load', 'boot', 'roll', 'account'] as const).some((a) => a === act)
      ? 'roots'
      : (['request', 'shutter', 'light', 'reserve'] as const).some((a) => a === act)
        ? 'light'
        : 'square'
  ];
}
export function orchardDiary(s: CampaignState, c: OrchardCommand) {
  let text = '',
    title = '';
  switch (c.act) {
    case 'peek': {
      title = 'Four tubs by ' + bedName[c.bed];
      const marks = rootCard(s, c.season, c.bed, c.date)!;
      text =
        'I opened ' +
        seasonName[c.season] +
        ' book at ' +
        bedName[c.bed] +
        ' on the ' +
        dateName[c.date] +
        ' page. The four marks read ' +
        marks.map((m) => (m === 'planted' ? 'planted' : rootLabels[m])).join(', ') +
        '.';
      break;
    }
    case 'load':
      title = 'A tub for Gresa’s barrow';
      text = 'I tried ' + loads[c.load].toLowerCase() + ' on the same wheels.';
      break;
    case 'boot':
      title = 'The shoe comes off its peg';
      text = 'I put ' + boots[c.boot].toLowerCase() + ' while the cart stood on new chalk.';
      break;
    case 'roll': {
      title = 'Two rims across the chalk';
      const line = barrowPrint(
        orchardFlag(s, 'barrowLoad') === 'leaf' ? 'leaf' : 'bare',
        orchardFlag(s, 'barrowBoot') === 'tied' ? 'tied' : 'hanging',
      ).line;
      text = 'I pushed the barrow. ' + line;
      break;
    }
    case 'account':
      title = 'What a borrowed boot can explain';
      text =
        c.story === 'cart'
          ? 'I sent the ordinary cart explanation. Even the bare tub could make that print. I still could not say who pulled last night.'
          : 'I kept the night caller’s name open. My four runs showed how a cart could leave that mark, and stopped short of naming its driver.';
      break;
    case 'track':
      title = footprints[c.bed].title;
      text = 'I followed a mark to ' + bedName[c.bed] + '. ' + footprints[c.bed].line;
      break;
    case 'join':
      title = 'Two springs on the orchard lantern';
      text = 'I held the panes together. ' + comparisonLine(s, c.comparison);
      break;
    case 'hang':
      title = 'The pane over the public lamp';
      text =
        'I set the reason above the lamp, leaving room below for the town’s decision. ' +
        comparisonLine(s, c.pane);
      break;
    case 'request':
      title = 'A count on loan';
      text = 'I let a grower set the terms before lighting any windows.';
      break;
    case 'shutter':
    case 'light': {
      title = 'Inside the counting shade';
      const l = shutterLight(s);
      text =
        'I tried the pattern under cover. ' +
        (l.small
          ? 'Fewer than three slips would make the outline. I left the individual marks inside.'
          : 'The pattern showed a group. I still needed permission to carry its details into the square.');
      break;
    }
    case 'reserve':
      title = 'The closed rota';
      text = 'I folded the copy for the Civic lamp. ' + String(orchardFlag(s, 'draftWindow'));
      break;
    case 'pledge':
      title = 'The evening I gave the orchard';
      text =
        'I promised to ' +
        editionNames[c.route].toLowerCase() +
        '. ' +
        publishedReading(s) +
        ' ' +
        editionFace(s);
      break;
    case 'visit':
      title = c.who === 'gresa' ? 'Gresa comes through the square' : 'Pella finds the last tub';
      text =
        'I waited beside the ' +
        delivery[edition(s)!].built.toLowerCase() +
        '. ' +
        delivery[edition(s)!][c.who];
      break;
    case 'answer':
      title = 'The orchard takes a second turn';
      text = 'I ' + answerCopy[c.route].diary + ' ' + afterWalk(edition(s)!, c.route);
      break;
  }
  const key =
    'walking-grove:' +
    c.act +
    ':' +
    JSON.stringify(c) +
    ':' +
    (edition(s) ?? '') +
    ':' +
    (c.act === 'roll' ? String(orchardFlag(s, 'lastRoll')) : '') +
    ':' +
    (c.act === 'pledge' || c.act === 'reserve' ? String(orchardFlag(s, 'draftWindow')) : '') +
    ':' +
    (['light', 'shutter'].includes(c.act) ? String(shutterLight(s).count) : '');
  return diaryEvent(
    key,
    'tool',
    'walking-grove',
    title,
    text,
    c.act === 'reserve' ? { sourceIds: ['HIS-GROVE-ROTA'] } : {},
    'after-break',
  );
}
export const answerCopy = {
  keep: {
    label: 'Keep the promise through one more frost',
    diary: 'kept the promise through one more frost and left room for a return.',
  },
  move: {
    label: 'Ask Gresa to take the first turn next time',
    diary: 'asked Gresa to take the first turn at the next planting. Pella gave up her key.',
  },
  invite: {
    label: 'Leave tonight’s opening in the dancers’ hands',
    diary: 'gave tonight’s opening to the dancers, who tried the turn with a real tub.',
  },
} as const;
type Turn = keyof typeof answerCopy;
const later: Record<Edition, Record<Turn, string>> = {
  shade: {
    keep: 'Gresa pushes the old chair into its shadow. “I can work with a date.” Pella hangs a hook for the frost report on the awning pole.',
    move: 'The awning key changes hands. Gresa opens the canvas early enough for a hot lunch. The choir finds her father asleep underneath and sings the opening very softly.',
    invite:
      'A dancer lifts the corner of the awning. Each person who passes can choose sun or shadow. The old man stays in his chair and conducts the feet.',
  },
  parade: {
    keep: 'Pella writes the next date in chalk on her shoe. The choir will have to keep this gap open through one more dance. Gresa draws a wheel beside it.',
    move: 'Gresa has the key to the parade gate. She moves the first tub at a carter’s walking pace. For the first eight bars the whole square has to learn her step.',
    invite:
      'The smallest dancer opens a gap just wide enough for a tub. Half the choir misses its first note and laughs. Somebody starts them again.',
  },
  return: {
    keep: 'A second frost date goes on the new bench. A carter leaves two pencils there. The choir agrees to keep a light on until the next crew is in.',
    move: 'Gresa takes the key to the return bench. Her first entry leaves room for the carrier who works past dark. Pella puts her own name down to wait.',
    invite:
      'The dancers give the bench a turn in the opening. Its hollow seat makes a splendid drum. They stop playing when the late grower arrives to write.',
  },
};
export const afterWalk = (edition: Edition, turn: Turn) => later[edition][turn];
