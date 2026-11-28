import { diaryEvent } from './adventureEvents';
import { check } from './rules';
import { specimenEquipped } from './specimenGear';
import { KUNIT_KEY } from '../content/turningTable';
import type { CampaignState, Effect, FlagValue, Weave } from './types';

export const namesLane = 'sea.the-last-oven';
export const namesQuay = 'water.letter-quay';
export const landings = ['ebb', 'flood'] as const;
export const scales = ['door', 'block', 'district'] as const;
export const releases = ['window', 'walk', 'district'] as const;
export const sources = {
  names: 'HIS-RIVER-NAMES-IHT',
  plan: 'HIS-RIVER-NAMES-KITIKMEOT',
  partners: 'HIS-RIVER-NAMES-BARTLETT',
} as const;
export type Water = (typeof landings)[number];
export type Scale = (typeof scales)[number];
export type Release = (typeof releases)[number];
export type TextLeaf = keyof typeof sources;
export const nameForms = ['pin', 'thread', 'paired'] as const;
export type NameForm = (typeof nameForms)[number];
export type Reader = 'emlet' | 'rialla';
export type RiverCommand = { type: 'WalkRiverNames' } & (
  | { act: 'step'; cell: number }
  | { act: 'water'; water: Water }
  | { act: 'map'; scale: Scale }
  | { act: 'walk' | 'back' | 'clear' | 'simulate' | 'reverse' | 'touch' | 'carry' | 'warmfin' }
  | { act: 'receive' }
  | { act: 'hear'; reader: Reader }
  | { act: 'leaf'; leaf: TextLeaf }
  | { act: 'release'; release: Release }
  | { act: 'council'; turn: 'neighbour' | 'pair' }
  | { act: 'offer'; form: NameForm }
  | { act: 'portion'; share: 'bread' | 'post' | 'guide' }
);
const prefix = 'rivernames.';
export const riverFlag = (s: Pick<CampaignState, 'flags'>, key: string) => s.flags[prefix + key];
const set = (key: string, value: FlagValue): Effect => ({ setFlag: prefix + key, value });
const here = (s: CampaignState, map: string) => {
  if (s.mapId !== map)
    throw new Error(
      map === namesLane
        ? 'Take this to the old bread oven at Seagrass Steps.'
        : 'Take the sealed packet to the Water Commons letter quay.',
    );
};
export const places = [
  'Wicker Loft',
  'North Pump',
  'Roof Garden',
  'Ferry Loft',
  'Rope Store',
  'West Stile',
  'Larch Door',
  'Mending Yard',
  'Tallow Door',
  'East Rail',
  'Reed Stair',
  'Stone Lip',
  'Old Oven',
  'Saffron Door',
  'Laundry',
  'West Rope',
  'Lower Walk',
  'Ferry Ring',
  'Red Window',
  'Dry Dock',
] as const;
export const westRope = 15;
export const deliveryDoor: Record<Water, number> = { ebb: 12, flood: 18 };
const blocked: Record<Water, number[]> = { ebb: [0, 4, 9], flood: [0, 4, 9, 10, 11, 12] };
const addressBook: Record<Water, number[]> = { ebb: [6, 8, 12, 13, 19], flood: [6, 8, 13, 19] };
export function season(s: Pick<CampaignState, 'flags'>): Water {
  return riverFlag(s, 'water') === 'flood' ? 'flood' : 'ebb';
}
export function scaleOf(s: Pick<CampaignState, 'flags'>): Scale {
  const value = riverFlag(s, 'scale');
  return value === 'district' || value === 'block' ? value : 'door';
}
export function walked(s: Pick<CampaignState, 'flags'>, water = season(s)): number[] {
  const entry = riverFlag(s, 'trace.' + water);
  return typeof entry === 'string' && entry.length ? entry.split(',').map(Number) : [westRope];
}
export const cellAt = (cell: number) => ({ col: cell % 5, row: Math.floor(cell / 5) });
export const neighbours = (a: number, b: number) =>
  Math.abs(cellAt(a).col - cellAt(b).col) + Math.abs(cellAt(a).row - cellAt(b).row) === 1;
export function walkResult(trace: readonly number[], water: Water) {
  const obstruction = trace.find((cell) => blocked[water].includes(cell));
  if (obstruction !== undefined)
    return {
      arrived: false,
      text:
        water === 'flood'
          ? 'Water covers ' +
            places[obstruction] +
            '. Rialla pulls her boot free. The packet stays dry inside her coat.'
          : 'A locked rail at ' +
            places[obstruction] +
            ' stops Emlet. He keeps the loaf for another walk.',
    };
  const end = trace[trace.length - 1];
  if (end !== deliveryDoor[water])
    return {
      arrived: false,
      text:
        'The thread runs out at ' +
        places[end] +
        '. ' +
        (water === 'ebb'
          ? 'Emlet smells bread further along, by the old brick arch.'
          : 'Rialla can still see the red public shutter by the landing.'),
    };
  return {
    arrived: true,
    text:
      water === 'ebb'
        ? 'Emlet reaches the burnt oven. A warm loaf comes up through the brick arch. The window is the mouth of a boat below.'
        : 'Rialla reaches the red shutter. The same oven boat is moored against it. This is where her sister takes the letters at high water.',
  };
}
export function readersInBlock(water: Water, scale: Scale, centre = 13) {
  const p = cellAt(centre);
  return addressBook[water].filter((id) => {
    const a = cellAt(id);
    if (scale === 'door') return id === centre;
    if (scale === 'district') return true;
    return (
      Math.floor(a.col / 2) === Math.floor(p.col / 2) && Math.floor(a.row / 2) === Math.floor(p.row / 2)
    );
  });
}
// Public shutters show which addresses receive household bread at each tide. A small block
// can contain two receiving doors at ebb and a single receiving door after the boat moves.
/** Read only the current water and occupied stitches. The skate can find a dry next footfall;
 * it cannot tell whether anybody has agreed to put the walk in the post.
 */
export function warmfinTrail(s: Pick<CampaignState, 'flags'>) {
  const water = season(s),
    thread = walked(s),
    last = thread[thread.length - 1];
  if (thread.some((loc) => blocked[water].includes(loc)))
    return (
      'The little skate rests beside the wet stitch. Lift the thread back past ' +
      places[thread.find((loc) => blocked[water].includes(loc))!] +
      '.'
    );
  if (last === deliveryDoor[water])
    return 'The skate is curled at the end of the thread. Take the walk with its owner.';
  const visited = new Set(thread),
    paths: number[][] = [[last]];
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i],
      tail = path[path.length - 1];
    for (let cell = 0; cell < places.length; cell++) {
      if (visited.has(cell) || blocked[water].includes(cell) || !neighbours(tail, cell)) continue;
      const extended = [...path, cell];
      visited.add(cell);
      if (cell === deliveryDoor[water])
        return (
          'A ripple turns towards ' +
          places[extended[1]] +
          '. The skate follows warm bricks. The walker still chooses where a letter may go.'
        );
      paths.push(extended);
    }
  }
  return 'The skate circles behind the last loop. Lift a stitch to give it a way through.';
}
export const postLegends: Record<Release, string> = {
  window: 'Hang the red service shutter',
  walk: 'Keep a guided walk at the rope',
  district: 'Stamp the district sack',
};
export const publication: Record<Release, string> = {
  window:
    'The crescent of the red shutter goes up. Emlet can leave the bread with a porter at either tide. A neighbour who works past closing time taps the shutter and gets no answer.',
  walk: 'Rialla puts a brass thimble in the tin at the West Rope. A walker can take it to a guide. The boat family can change the way in person. When the guide sits down for supper the next walker waits.',
  district:
    'The sack leaves with only the district stamp. Three neighbours split the last walk. The boat can change its mooring in peace. One letter makes two extra crossings before it finds the right hand.',
};
export function editionOf(s: Pick<CampaignState, 'flags'>): Release | undefined {
  const edition = riverFlag(s, 'edition');
  return releases.find((e) => e === edition);
}
export function sealedWalks(s: Pick<CampaignState, 'flags'>) {
  return landings
    .map((w) => {
      const kept = riverFlag(s, 'signed.' + w);
      return typeof kept === 'string'
        ? (w === 'ebb' ? 'Low water' : 'High water') +
            ' · ' +
            kept
              .split(',')
              .map((i) => places[Number(i)])
              .join(' → ')
        : '';
    })
    .filter(Boolean);
}
export function contributors(s: Pick<CampaignState, 'flags'>) {
  return ['emlet', 'rialla'].filter((reader) => riverFlag(s, 'heard.' + reader) === true);
}
export function finePrint(s: Pick<CampaignState, 'flags'>) {
  const water = season(s),
    scale = scaleOf(s),
    candidates = readersInBlock(water, scale);
  return (
    (water === 'ebb' ? 'Low water' : 'High water') +
    ' · ' +
    candidates.length +
    ' possible receiving ' +
    (candidates.length === 1 ? 'door' : 'doors') +
    '. ' +
    candidates.map((i) => places[i]).join(', ') +
    '.'
  );
}
export const readerLines: Record<Reader, string> = {
  emlet:
    '“Warm Mouth is where the bow brings up a crust. Put your finger there at low tide. Tonight that dot would send my flour straight into the water.” Emlet asks to keep a public shutter for meals.',
  rialla:
    '“I sort the letters. That does not give me the right to mark where my sister sleeps.” Rialla will walk a visitor in herself. She offers the district stamp for sacks anyone can read.',
};
export const proposalNames: Record<NameForm, string> = {
  pin: 'One brass pin at the oven',
  thread: 'A route kept by its walkers',
  paired: 'Two labelled tide slips',
};
export const proposalReadings: Record<NameForm, Record<Reader, string>> = {
  pin: {
    emlet:
      'Emlet presses the pin into the oven on the low-water sheet. “I can stamp this morning’s delivery against that brick.” He writes the hour alongside it.',
    rialla:
      'Rialla lifts the pin from the high-water sheet. “That is where I used to knock. Leave his morning pin in his own account.” She slips the blank high-water sheet back to you.',
  },
  thread: {
    emlet:
      'Emlet stitches a crust-coloured thread up to the low-water arch. “Leave an end loose. She has to tie the other one herself.”',
    rialla:
      'Rialla carries the loose end to the red shutter. She ties an eye in the thread so whoever makes tomorrow’s round can move it.',
  },
  paired: {
    emlet:
      'Emlet writes the name above his low-water walk. He draws a heel mark where the first packet touched the brick and leaves room for another date.',
    rialla:
      'Rialla signs the second slip at the red shutter. She fastens both with a swivel so a reader can keep the names together and turn them independently.',
  },
};
export function proposed(s: Pick<CampaignState, 'flags'>): NameForm | undefined {
  const form = riverFlag(s, 'joint');
  return nameForms.find(
    (v) =>
      v === form &&
      riverFlag(s, 'pencil.' + v + '.emlet') === riverFlag(s, 'kept.ebb') &&
      riverFlag(s, 'pencil.' + v + '.rialla') === riverFlag(s, 'kept.flood'),
  );
}
export const sourceWords: Record<TextLeaf, string> = {
  names:
    'The Inuit Heritage Trust gathers Inuit place names in Nunavut. A name can carry a route, an event or a warning. Recording a name and having it officially recognized are different steps. Its 2014 update of “Nunavut, Where We Live and Travel” records a particular stage of the work.',
  plan: 'Pitquhirnikkut Ilihautiniq, the Kitikmeot Heritage Society, describes an Inuinnaqtun language plan it began bringing together in 2022. Immersion, mentoring and locally developed reference materials do different work. A dot on a chart cannot take a learner on that walk.',
  partners:
    'In their 2012 paper, Cheryl Bartlett, Murdena Marshall and Albert Marshall describe co-learning and Two-Eyed Seeing in a Mi’kmaw context. They name an ongoing role for willing, knowledgeable participants in guiding the work. A publisher cannot appoint itself to fill that role for others.',
};
export const portions = {
  bread:
    'Emlet gives the downstairs workers the first warm bag. The letter crew keeps a loaf back for the person who ferries the sack.',
  post: 'A letter gets its second crossing before the basket opens. An old woman reads the crooked signature aloud. Her grandson finally hears who sent it.',
  guide:
    'Rialla teaches the relief walker to ask where the boat tied up today. Her sister eats while someone else takes the next visitor. The queue moves more slowly on the first walk.',
};
export function riverEffects(s: CampaignState, c: RiverCommand): Effect[] {
  if (c.act === 'receive' || c.act === 'portion' || c.act === 'council') {
    here(s, namesQuay);
    const edition = editionOf(s);
    if (!edition || riverFlag(s, 'packet') !== edition)
      throw new Error('Carry the signed edition from the old oven first.');
    if (c.act === 'receive') return [set('received', edition), set('everReceived', true)];
    if (riverFlag(s, 'received') !== edition)
      throw new Error('Walk to the waiting household with this edition first.');
    if (c.act === 'council') {
      if (c.turn !== 'neighbour' && c.turn !== 'pair')
        throw new Error('Invite a reader or two to the table.');
      if (!riverFlag(s, 'source.partners') || !riverFlag(s, 'portion'))
        throw new Error(
          'Unfold the three authors’ account and stay for one round before offering a seat.',
        );
      return [set('council.sat', true), set('council.turn', c.turn)];
    }
    if (!Object.hasOwn(portions, c.share)) throw new Error('Choose a place on the round.');
    return [set('portion', c.share), set('fromEdition', edition), set('everPortioned', true)];
  }
  if (c.act !== 'leaf' || s.mapId !== namesQuay) here(s, namesLane);
  const water = season(s),
    path = walked(s, water),
    last = path[path.length - 1];
  switch (c.act) {
    case 'water':
      if (!landings.includes(c.water)) throw new Error('Pull the rope for an available tide.');
      return [set('water', c.water)];
    case 'step':
      if (
        !Number.isInteger(c.cell) ||
        c.cell < 0 ||
        c.cell >= places.length ||
        !neighbours(last, c.cell)
      )
        throw new Error('Lay the thread on the next square beside its end.');
      if (path.includes(c.cell)) throw new Error('Lift a stitch to change the existing trace.');
      return [set('trace.' + water, [...path, c.cell].join(','))];
    case 'warmfin':
      return [set('skate.helped', true)];
    case 'back':
      if (path.length === 1) throw new Error('The thread is already at the West Rope.');
      return [set('trace.' + water, path.slice(0, -1).join(','))];
    case 'clear':
      return [set('trace.' + water, String(westRope))];
    case 'walk': {
      const result = walkResult(path, water);
      if (path.length < 2) throw new Error('Lay at least one stitch from the West Rope.');
      return [
        set('last.' + water, path.join(',')),
        set('arrived.' + water, result.arrived),
        ...(result.arrived
          ? [set('walked.' + water, true), set('kept.' + water, path.join(','))]
          : [set('retried', true)]),
      ];
    }
    case 'hear':
      if (!Object.hasOwn(readerLines, c.reader)) throw new Error('Meet a reader by the water.');
      if (!riverFlag(s, 'walked.' + (c.reader === 'emlet' ? 'ebb' : 'flood')))
        throw new Error(
          c.reader === 'emlet'
            ? 'Bring Emlet a walk to his low-water delivery.'
            : 'Bring Rialla the high-water delivery thread.',
        );
      return [
        set('heard.' + c.reader, true),
        ...(c.reader === 'emlet' ? [{ addCard: 'card.river-names.iht' }] : []),
      ];
    case 'offer': {
      if (!nameForms.includes(c.form)) throw new Error('Choose a mark you can pass to a walker.');
      const who = water === 'ebb' ? 'emlet' : 'rialla';
      if (!riverFlag(s, 'heard.' + who))
        throw new Error('Walk this tide with the person who will sign it first.');
      const other = who === 'emlet' ? 'rialla' : 'emlet';
      const effects: Effect[] = [set('pencil.' + c.form + '.' + who, riverFlag(s, 'kept.' + water))];
      if (c.form === 'pin' && who === 'rialla') effects.push(set('refusedPin', true));
      if (
        c.form !== 'pin' &&
        riverFlag(s, 'pencil.' + c.form + '.' + other) ===
          riverFlag(s, 'kept.' + (water === 'ebb' ? 'flood' : 'ebb')) &&
        riverFlag(s, 'kept.' + (water === 'ebb' ? 'flood' : 'ebb'))
      )
        effects.push(set('joint', c.form), set('everJoint', true));
      return effects;
    }
    case 'map':
      if (!scales.includes(c.scale)) throw new Error('Turn the map to a marked scale.');
      return [set('scale', c.scale)];
    case 'simulate': {
      const scale = scaleOf(s),
        amount = readersInBlock(water, scale).length;
      return [
        set('read.' + water + '.' + scale, amount),
        set(
          'compared.' + scale,
          Boolean(riverFlag(s, 'read.' + (water === 'ebb' ? 'flood' : 'ebb') + '.' + scale)),
        ),
      ];
    }
    case 'leaf':
      if (!Object.hasOwn(sources, c.leaf)) throw new Error('Unfold a named source.');
      return [set('source.' + c.leaf, true)];
    case 'reverse':
    case 'touch': {
      if (!check(specimenEquipped(KUNIT_KEY), s))
        throw new Error('Bring Kunit’s earned coast piece to the two hand stops.');
      const facing = riverFlag(s, 'reversed') === true;
      if (c.act === 'reverse') return [set('reversed', !facing)];
      return [
        set(facing ? 'felt.far' : 'felt.near', true),
        ...(riverFlag(s, facing ? 'felt.near' : 'felt.far') ? [set('felt.both', true)] : []),
      ];
    }
    case 'release': {
      if (!releases.includes(c.release))
        throw new Error('Choose a mark that the next person can actually use.');
      if (contributors(s).length < 2)
        throw new Error('Let each walker check the address at their own tide.');
      if (!proposed(s))
        throw new Error(
          'Pass a thread or a pair of tide slips to both walkers. Keep the mark they can sign together.',
        );
      if (!riverFlag(s, 'compared.block'))
        throw new Error(
          'Try the block stamp at both tides. An empty house can change what the public mark gives away.',
        );
      if (
        c.release === 'district' &&
        (scaleOf(s) !== 'district' || !riverFlag(s, 'read.' + water + '.district'))
      )
        throw new Error('Try the district stamp with a reader before letting the sack go.');
      return [
        set('edition', c.release),
        set('issued.' + c.release, true),
        set('packet', ''),
        set('received', ''),
        set('portion', ''),
        set('signedForm', proposed(s)!),
        set('signed.ebb', riverFlag(s, 'kept.ebb')),
        set('signed.flood', riverFlag(s, 'kept.flood')),
        set('applied', true),
      ];
    }
    case 'carry': {
      const edition = editionOf(s);
      if (!edition) throw new Error('Agree with both walkers about the mark that can leave.');
      return [set('packet', edition)];
    }
  }
}
export const riverTopics: Record<'walk' | 'map' | 'rights' | 'reading', Weave> = {
  walk: {
    concepts: ['evidence', 'explanation', 'perspective', 'interpretation'],
    framework: ['scope', 'methods-and-tools'],
    aoks: ['HUM', 'NAT', 'MAT'],
    subjects: ['geography', 'physics', 'math-ai'],
    atl: ['thinking', 'research'],
  },
  map: {
    concepts: ['certainty', 'objectivity', 'evidence', 'power'],
    framework: ['methods-and-tools', 'ethics', 'scope'],
    aoks: ['MAT', 'HUM', 'TEC'],
    subjects: ['math-ai', 'geography', 'digital-society'],
    atl: ['thinking', 'research'],
  },
  rights: {
    concepts: ['power', 'responsibility', 'values', 'justification', 'culture'],
    framework: ['ethics', 'perspectives'],
    aoks: ['HUM', 'LAN', 'POL'],
    subjects: ['anthropology', 'global-politics', 'lang-langlit'],
    atl: ['communication', 'social'],
  },
  reading: {
    concepts: ['truth', 'culture', 'interpretation', 'perspective'],
    framework: ['scope', 'perspectives', 'methods-and-tools'],
    aoks: ['HIS', 'IND', 'LAN'],
    subjects: ['history', 'geography', 'lang-b'],
    atl: ['communication', 'research'],
  },
};
export function riverTopic(act: RiverCommand['act']): keyof typeof riverTopics {
  if (['map', 'simulate'].includes(act)) return 'map';
  if (['council', 'offer', 'hear', 'release', 'carry', 'receive', 'portion'].includes(act))
    return 'rights';
  if (['leaf', 'touch', 'reverse'].includes(act)) return 'reading';
  return 'walk';
}
export const tactileReading = (reversed: boolean) =>
  reversed
    ? 'At the far stop the raised bow is under my right hand. The notch still lies beside the smooth edge.'
    : 'At the near stop the raised bow is under my left hand. The notch lies beside the smooth edge.';
export function riverDiary(s: CampaignState, c: RiverCommand) {
  const water = season(s),
    path = walked(s),
    edition = editionOf(s);
  let detail: string,
    tag: string = c.act,
    sourceIds: string[] = [];
  switch (c.act) {
    case 'step':
      detail = 'I laid the thread at ' + places[c.cell] + '.';
      tag += '.' + water + '.' + c.cell;
      break;
    case 'back':
    case 'clear':
      detail = 'I lifted the thread back to ' + places[path.at(-1)!] + '.';
      tag += '.' + water + '.' + path.at(-1);
      break;
    case 'warmfin':
      detail = 'I called the oven skate. ' + warmfinTrail(s);
      tag += '.' + water + '.' + path.join('-');
      break;
    case 'water':
      detail =
        'I pulled the rope to ' +
        (water === 'ebb' ? 'low' : 'high') +
        ' water and found my thread for that tide.';
      tag += '.' + water;
      break;
    case 'walk':
      detail =
        'I took the packet along ' +
        path.map((i) => places[i]).join(', ') +
        '. ' +
        walkResult(path, water).text;
      tag += '.' + water + '.' + path.join('-');
      break;
    case 'hear':
      detail = 'I listened at the end of our walk. ' + readerLines[c.reader];
      tag += '.' + c.reader;
      break;
    case 'offer': {
      const who = water === 'ebb' ? 'emlet' : 'rialla';
      detail = 'I put the pencil back in the walker’s hand. ' + proposalReadings[c.form][who];
      tag += '.' + c.form + '.' + who;
      break;
    }
    case 'map':
      detail = 'I set the stamp to one ' + scaleOf(s) + '.';
      tag += '.' + scaleOf(s);
      break;
    case 'simulate':
      detail = 'I asked what the mark disclosed to somebody on the quay. ' + finePrint(s);
      tag += '.' + water + '.' + scaleOf(s);
      break;
    case 'leaf':
      detail = 'I unfolded a separate source leaf. ' + sourceWords[c.leaf];
      tag += '.' + c.leaf;
      sourceIds = [sources[c.leaf]];
      break;
    case 'reverse':
      detail = 'I turned my own practice rack and left its neighbour fixed.';
      tag += '.' + Boolean(riverFlag(s, 'reversed'));
      break;
    case 'touch':
      detail =
        'I brought Kunit’s coast piece to the two stops and tested our invented rack. ' +
        tactileReading(Boolean(riverFlag(s, 'reversed')));
      tag += '.' + Boolean(riverFlag(s, 'reversed'));
      sourceIds = ['HIS-KUNIT-HOLM'];
      break;
    case 'release':
      detail = 'I sealed the two walkers’ edition. ' + publication[c.release];
      tag += '.' + c.release;
      break;
    case 'carry':
      detail =
        'I carried the signed packet to the Water Commons. Its cover reads “' +
        postLegends[edition!] +
        '”.';
      tag += '.' + edition;
      break;
    case 'receive':
      detail =
        'I took the packet to the household on the other quay. ' +
        publication[edition!] +
        ' ' +
        sealedWalks(s).join('. ') +
        '.';
      tag += '.' + edition;
      break;
    case 'council':
      detail =
        c.turn === 'neighbour'
          ? 'I gave the next reading to the neighbour who carries the basket up the steps. She drew a landing for deliveries made after the shutters close.'
          : 'I left two stools with the river pilot and the downstairs neighbour. They are testing the new landing on separate rounds before they hang another public mark.';
      tag += '.' + c.turn;
      break;
    case 'portion':
      detail = 'I stayed while the first basket went round. ' + portions[c.share];
      tag += '.' + edition + '.' + c.share;
      break;
  }
  return diaryEvent(
    'river-names:' + riverTopic(c.act) + ':' + tag,
    'tool',
    'river-names.' + c.act,
    'The oven with two addresses',
    detail,
    { sourceIds },
    'after-break',
  );
}
