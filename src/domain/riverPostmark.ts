import { diaryEvent } from './adventureEvents';
import {
  landings,
  namesLane,
  namesQuay,
  places,
  deliveryDoor,
  riverFlag,
  type Water,
} from './riverNames';
import type { CampaignState, Effect, FlagValue } from './types';
export const pieces = ['word', 'gesture', 'address'] as const;
export type Piece = (typeof pieces)[number];
export const pieceNames: Record<Piece, string> = {
  word: 'Spoken name',
  gesture: 'Hand sign',
  address: 'Public landing',
};
export const receivers = ['stranger', 'neighbour', 'apprentice'] as const;
export type Listener = (typeof receivers)[number];
export const listenerNames: Record<Listener, string> = {
  stranger: 'A visitor on her first crossing',
  neighbour: 'A neighbour who knows both signs',
  apprentice: 'The relief walker who came with me',
};
export type MarkCommand = { type: 'FoldRiverPostmark' } & (
  | { work: 'press'; piece: Piece }
  | { work: 'learn'; water: Water }
  | { work: 'listen'; person: Listener; water: Water }
  | { work: 'send' }
);
type S = Pick<CampaignState, 'flags' | 'mapId'>;
const prefix = 'postmark.';
export const markFlag = (s: S, key: string) => s.flags[prefix + key];
const set = (key: string, value: FlagValue): Effect => ({ setFlag: prefix + key, value });
const puncture = (bit: Piece) => 1 << pieces.indexOf(bit);
export function letterMask(s: S): number {
  const value = markFlag(s, 'mask');
  return typeof value === 'number' ? value : puncture('word');
}
export const onSlip = (mask: number, bit: Piece) => Boolean(mask & puncture(bit));
export const handMark = (water: Water) =>
  water === 'ebb' ? 'knuckles brush the heel of an open hand' : 'two fingers hook around a thumb';
export function stampedText(mask: number, water: Water) {
  return (
    [
      onSlip(mask, 'word') ? '“Warm Mouth”' : '',
      onSlip(mask, 'gesture') ? handMark(water) : '',
      onSlip(mask, 'address') ? places[deliveryDoor[water]] : '',
    ]
      .filter(Boolean)
      .join(' · ') || 'Empty slip'
  );
}
export function unpacked(s: S, water: Water, person: Listener) {
  const mask = Number(markFlag(s, 'sealed') || 0);
  const known =
    person === 'neighbour' || (person === 'apprentice' && markFlag(s, 'learned.' + water) === true);
  const name = onSlip(mask, 'word');
  const canPlace = onSlip(mask, 'address') || (onSlip(mask, 'gesture') && known);
  const candidates = canPlace ? [deliveryDoor[water]] : landings.map((w) => deliveryDoor[w]);
  const sight = stampedText(mask, water);
  const meaning = canPlace ? places[candidates[0]] : 'either landing';
  const origin = onSlip(mask, 'address')
    ? 'The public landing is written out.'
    : onSlip(mask, 'gesture')
      ? known
        ? 'This reader has learned what that hand does on this walk.'
        : 'This reader has the hand shape without the route it belongs to.'
      : 'The same written name goes to two places.';
  const voice =
    person === 'apprentice' && known && onSlip(mask, 'gesture')
      ? 'The relief walker puts a palm down to show where they stood together.'
      : '';
  return {
    name,
    canPlace,
    candidates,
    sight,
    meaning,
    text:
      listenerNames[person] +
      '. ' +
      sight +
      '. I could recover ' +
      meaning +
      '. ' +
      origin +
      (name ? ' The local spoken name survives in the fold.' : ' There is no name on this copy.') +
      (voice ? ' ' + voice : ''),
  };
}
export function markEffects(s: S, c: MarkCommand): Effect[] {
  if (c.work === 'listen') {
    if (s.mapId !== namesQuay)
      throw new Error('Open the folded postmark beside the readers at the Water Commons.');
    if (!markFlag(s, 'sealed')) throw new Error('Send a fold from the oven at Seagrass Steps.');
    if (!receivers.includes(c.person) || !landings.includes(c.water))
      throw new Error('Invite a reader to an available tide.');
    const result = unpacked(s, c.water, c.person),
      mask = Number(markFlag(s, 'sealed'));
    const effects: Effect[] = [
      set('heard.' + c.water + '.' + c.person, mask),
      set('last.reader', c.person),
      set('last.water', c.water),
    ];
    if (mask === puncture('word') && !result.canPlace) effects.push(set('thin.' + c.water, true));
    if (onSlip(mask, 'word') && onSlip(mask, 'gesture') && !onSlip(mask, 'address')) {
      if (c.person === 'stranger' && !result.canPlace) effects.push(set('unread.' + c.water, true));
      if (c.person === 'apprentice' && result.canPlace) effects.push(set('understood.' + c.water, true));
    }
    return effects;
  }
  if (s.mapId !== namesLane) throw new Error('Set this fold at Pendlow’s oven.');
  switch (c.work) {
    case 'press':
      if (!pieces.includes(c.piece)) throw new Error('Fit one of the three stamps.');
      return [set('mask', letterMask(s) ^ puncture(c.piece))];
    case 'learn':
      if (
        !landings.includes(c.water) ||
        !riverFlag(s, 'heard.' + (c.water === 'ebb' ? 'emlet' : 'rialla'))
      )
        throw new Error('Take the original walker’s delivery and hand them the parcel first.');
      return [set('learned.' + c.water, true)];
    case 'send': {
      const mask = letterMask(s);
      if (!mask) throw new Error('Give the empty slips something they can carry.');
      if (!riverFlag(s, 'applied'))
        throw new Error('Ask both walkers to sign the river edition before you send the fold.');
      return [set('sealed', mask), set('sent', true), set('last.reader', ''), set('last.water', '')];
    }
  }
}
export function markDiary(s: S, c: MarkCommand) {
  let key: string = c.work,
    text: string;
  switch (c.work) {
    case 'press':
      key += '.' + c.piece + '.' + letterMask(s);
      text =
        'I ' +
        (onSlip(letterMask(s), c.piece) ? 'put ' : 'lifted ') +
        pieceNames[c.piece].toLowerCase() +
        ' on the postmark. The two slips now read ' +
        landings.map((w) => stampedText(letterMask(s), w)).join(' / ') +
        '.';
      break;
    case 'learn':
      key += '.' + c.water;
      text =
        'I stood with the relief walker while ' +
        (c.water === 'ebb' ? 'Emlet' : 'Rialla') +
        ' showed how ' +
        handMark(c.water) +
        ' fits the walk to ' +
        places[deliveryDoor[c.water]] +
        '. The stamp alone could never make that introduction.';
      break;
    case 'send':
      key += '.' + markFlag(s, 'sealed');
      text =
        'I pressed the fold for the other quay. One slip reads ' +
        stampedText(letterMask(s), 'ebb') +
        ' and the other reads ' +
        stampedText(letterMask(s), 'flood') +
        '.';
      break;
    case 'listen':
      key += '.' + c.person + '.' + c.water + '.' + markFlag(s, 'sealed');
      text = 'I opened a slip with its next reader. ' + unpacked(s, c.water, c.person).text;
      break;
  }
  return diaryEvent(
    'river-names:reading:postmark.' + key,
    'tool',
    'rivernames.postmark',
    'The words the foil could carry',
    text,
    {},
    'after-break',
  );
}
export const transmissionDone = {
  all: [
    'thin.ebb',
    'thin.flood',
    'unread.ebb',
    'unread.flood',
    'understood.ebb',
    'understood.flood',
  ].map((k) => ({ flag: prefix + k, eq: true })),
};
