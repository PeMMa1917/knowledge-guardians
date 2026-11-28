import { diaryEvent } from './adventureEvents';
import {
  flowerFlag as F,
  measure,
  petalMap,
  usableContact,
  watched,
} from './petalWindow';
import type { CampaignState, Effect } from './types';

export type Roller = 'names' | 'grades' | 'hours' | 'counts';
export const rollers: Roller[] = ['names', 'grades', 'hours', 'counts'];
export const rollerName: Record<Roller, string> = {
  names: 'Painted name tags',
  grades: 'Three shade marks',
  hours: 'Two clock faces',
  counts: 'Dark-square counters',
};
export type GearCommand = { type: 'WindPetalGear' } & (
  | { action: 'fit'; roller: Roller }
  | { action: 'turn' }
  | { action: 'pull' }
  | { action: 'send'; reader: 'front' | 'wings' }
);
export const roller = (s: CampaignState): Roller =>
  rollers.find((x) => s.flags[F('gear.roller')] === x) ?? 'names';
export const flipped = (s: CampaignState, r: Roller) =>
  s.flags[F('gear.flipped.' + r)] === true;
const set = (part: string, value: string | boolean): Effect => ({
  setFlag: F('gear.' + part),
  value,
});
export const pulled = (s: CampaignState, r: Roller, face: boolean) =>
  s.flags[F('gear.pull.' + r + '.' + Number(face))] === true;
export function gearRead(r: Roller, reverse: boolean) {
  switch (r) {
    case 'names':
      return {
        face: reverse
          ? 'Two scraps of red flannel, Hem and Cuff, hang on the hooks in that order.'
          : 'Two scraps of red flannel, Cuff and Hem, hang on the hooks in that order.',
        movement: reverse
          ? 'The first puppet wears Hem. The second wears Cuff. Both remain on their own peg.'
          : 'The first puppet wears Cuff. The second wears Hem. Neither hook has a longer stride.',
        rule: 'The tags tell the dresser which costume to use. Trading their order moves no distance.',
      };
    case 'grades':
      return {
        face: reverse
          ? 'The stamps for low, middle and high carry 2, 6 and 9 dots.'
          : 'The stamps for low, middle and high carry 1, 2 and 3 dots.',
        movement: reverse
          ? 'At 2, 6 and 9 the forelegs rise low, then middle, then high. The order survives the changed spacing.'
          : 'At 1, 2 and 3 the forelegs rise low, then middle, then high. Viri can change the distance between two gestures.',
        rule: 'The stamps preserve the order. Their numbers do not establish equal distances between shade grades.',
      };
    case 'hours':
      return {
        face: reverse
          ? 'From eight o’clock, the starts read 10 and 70 minutes.'
          : 'From midnight, the starts read 490 and 550 minutes.',
        movement:
          'The two catches release sixty minutes apart on either face. The same span of ribbon runs past the curtain.',
        rule: 'Changing the clock’s origin preserves the sixty-minute difference. The quotient of the two displayed numbers changes with the clock face.',
      };
    case 'counts': {
      const hem = measure('apron', 'uv', 1).low,
        cuff = measure('sleeve', 'uv', 1).low;
      return {
        face: reverse
          ? 'In pairs of squares, Hem counts ' +
            hem / 2 +
            ' and Cuff counts ' +
            cuff / 2 +
            '.'
          : 'In single squares, Hem counts ' +
            hem +
            ' and Cuff counts ' +
            cuff +
            '.',
        movement:
          'Viri pulls three lengths of Cuff for one length of Hem. Counting in pairs keeps the same three-to-one movement.',
        rule: 'Zero means no low-return squares within the crop. Changing both counting units together keeps the ratio.',
      };
    }
  }
}
export const pairedGears = (s: CampaignState) =>
  rollers.every((r) => pulled(s, r, false) && pulled(s, r, true));
export function gearEffects(s: CampaignState, c: GearCommand): Effect[] {
  if (s.mapId !== petalMap)
    throw Error('Viri’s rolling theatre is in the glasshouse.');
  if (!s.flags[F('ending')] || !usableContact(s) || !watched(s))
    throw Error(
      'Bring the four matched slips and the two morning watches to Viri’s rolling theatre.',
    );
  const r = roller(s),
    flip = flipped(s, r);
  switch (c.action) {
    case 'fit':
      if (!rollers.includes(c.roller))
        throw Error('Fit a roller from the little drawer.');
      return [set('roller', c.roller)];
    case 'turn':
      return [set('flipped.' + r, !flip)];
    case 'pull':
      return [set('pull.' + r + '.' + Number(flip), true)];
    case 'send':
      if (c.reader !== 'front' && c.reader !== 'wings')
        throw Error('Send the rolling theatre to a member of the cast.');
      if (!pairedGears(s))
        throw Error(
          'The box has four paper rollers. Let the cast see both faces running on each of them.',
        );
      return [set('sent', c.reader)];
  }
}
export const gearHandover = {
  front:
    'Viri’s dresser sets out the name hooks in front of the curtain. The children can trade the two costumes without moving the length of the dance.',
  wings:
    'An understudy in the wings holds the sixty-minute ribbon clear of the three-to-one belt. She repeats yesterday’s interval even after the clock reader changes the starting hour.',
};
export function gearDiary(n: CampaignState, c: GearCommand) {
  const r = roller(n),
    flip = flipped(n, r),
    reading = gearRead(r, flip);
  const title = rollerName[r];
  if (c.action === 'send')
    return diaryEvent(
      'petal-gear:send.' + c.reader,
      'choice',
      'petal.gears',
      'The rolling theatre on tour',
      'I sent the rolling theatre out. ' + gearHandover[c.reader],
      {},
      'after-break',
    );
  const story =
    c.action === 'pull'
      ? reading.movement
      : c.action === 'turn'
        ? 'I turned the roller over. ' + reading.face
        : 'I fitted ' + title.toLowerCase() + ' to the little theatre.';
  return diaryEvent(
    'petal-gear:' + r + '.' + c.action + '.' + Number(flip),
    'tool',
    'petal.gears',
    title,
    story.startsWith('I ') ? story : 'I worked the handle. ' + story,
    {},
    c.action === 'pull'
      ? 'after-break'
      : { fixedToolPrefix: 'petal-gear:' + r + '.' + c.action },
  );
}
