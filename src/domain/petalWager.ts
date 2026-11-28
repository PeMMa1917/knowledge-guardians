import { diaryEvent } from './adventureEvents';
import { flowerAfterMap, flowerEnding, flowerFlag as F } from './petalWindow';
import type { CampaignState, Effect } from './types';

export const hours = ['noon', 'dusk'] as const;
export type Hour = (typeof hours)[number];
export const ribbons = ['window', 'cuff', 'open'] as const;
export type Ribbon = (typeof ribbons)[number];
export const moves = ['wait', 'echo', 'cross'] as const;
export type DanceMove = (typeof moves)[number];
export type WagerCommand = { type: 'DrawPetalRibbon'; hour: Hour } & (
  | { action: 'pin'; ribbon: Ribbon }
  | { action: 'release' }
  | { action: 'dance'; move: DanceMove }
);
export const lateWatches = {
  noon: {
    time: '12:20',
    left: 'Hem',
    right: 'Cuff',
    first: 'right',
    line: 'A bee settles on Cuff by the door. The wiremaker has to turn round to see the landing at all.',
  },
  dusk: {
    time: '17:10',
    left: 'Cuff',
    right: 'Hem',
    first: 'right',
    line: 'A bee lands on Hem beside the door. The garden watcher lifts the bench cover so the child at the back can see it.',
  },
} as const;
export const ribbonNames: Record<Ribbon, string> = {
  window: 'The first bee will land on the window side.',
  cuff: 'The first bee will land on Cuff.',
  open: 'Leave space for a landing in either place.',
};
export const danceNames: Record<DanceMove, string> = {
  wait: 'Hold the wing still for a count',
  echo: 'Repeat the landing with the other hand',
  cross: 'Let the silk bee cross to the other flower',
};
export const danceAfter: Record<DanceMove, string> = {
  wait: 'The held wing gives the back row a chance to find the real landing before the silk one moves.',
  echo: 'Two copper wings take the same small step a beat apart. A child in the gallery repeats it with one finger.',
  cross:
    'The wire draws a second journey across the first. Viri hangs a silk thread on it so the audience can follow the dancer’s invention.',
};
const part = (h: Hour, key: string) => F('ribbon.' + h + '.' + key);
export function pinned(s: CampaignState, h: Hour) {
  return ribbons.find((r) => s.flags[part(h, 'pinned')] === r);
}
export function opened(s: CampaignState, h: Hour) {
  return s.flags[part(h, 'opened')] === true;
}
export function lastDance(s: CampaignState, h: Hour) {
  return moves.find((m) => s.flags[part(h, 'dance')] === m);
}
export function replyToRibbon(h: Hour, r: Ribbon) {
  const w = lateWatches[h];
  if (r === 'open')
    return 'The blank ribbon made no prediction to check. Elian adds a new sighting to the book.';
  if (r === 'cuff' && w.right === 'Cuff')
    return 'This opening fits the Cuff ribbon once. The other flower has had landings too. Viri leaves the later appointment in the book.';
  return r === 'cuff'
    ? 'The landing was on Hem. Elian cuts a notch in the Cuff ribbon to keep this exception on the record.'
    : 'The first landing was by the door. Elian takes down the promise that the window will get the first visit every time.';
}
const set = (setFlag: string, value: string | boolean): Effect => ({
  setFlag,
  value,
});
export function wagerEffects(s: CampaignState, c: WagerCommand): Effect[] {
  const e = flowerEnding(s);
  if (!e || s.mapId !== flowerAfterMap(e))
    throw Error(
      'Follow the performance to its audience before opening a later watch.',
    );
  if (!hours.includes(c.hour)) throw Error('Choose a dated watch.');
  const h = c.hour;
  switch (c.action) {
    case 'pin':
      if (!ribbons.includes(c.ribbon))
        throw Error('Choose a ribbon for the bill.');
      if (opened(s, h))
        throw Error('The first public ribbon stays beside this opened watch.');
      return [set(part(h, 'pinned'), c.ribbon)];
    case 'release':
      if (!pinned(s, h))
        throw Error(
          'Hang a ribbon, or reserve the blank one, while the watch is still folded.',
        );
      return [set(part(h, 'opened'), true)];
    case 'dance':
      if (!opened(s, h) || !moves.includes(c.move))
        throw Error('Unfold the watch before choreographing a response.');
      return [set(part(h, 'dance'), c.move)];
  }
}
export function wagerDiary(n: CampaignState, c: WagerCommand) {
  const h = c.hour,
    r = pinned(n, h);
  if (!r) return;
  const w = lateWatches[h],
    key = 'petal-ribbon:' + h + '.' + c.action;
  if (c.action === 'pin')
    return diaryEvent(
      key + '.' + r,
      'choice',
      'petal.ribbon',
      'A ribbon for the ' + w.time + ' curtain',
      'Before seeing the landing, I chose the ribbon: ' + ribbonNames[r],
      {},
      'after-break',
    );
  if (c.action === 'release')
    return diaryEvent(
      key + '.' + r,
      'tool',
      'petal.ribbon',
      'The ' + w.time + ' landing',
      'I opened the dated watch. ' + w.line + ' ' + replyToRibbon(h, r),
      {},
      'after-break',
    );
  return diaryEvent(
    key + '.' + c.move,
    'choice',
    'petal.ribbon',
    'What the dancer did with a real landing',
    'I asked Viri to ' +
      danceNames[c.move].toLowerCase() +
      '. ' +
      danceAfter[c.move],
    {},
    'after-break',
  );
}
