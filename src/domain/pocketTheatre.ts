import stops from '../content/pocket-theatre-stops.json';
import stories from '../content/pocket-theatre-cases.json';
import { diaryEvent } from './adventureEvents';
import type { CampaignState, Effect, Weave } from './types';

export interface TheatreStory {
  id: string;
  chapter: number;
  title: string;
  opening: string;
  controls: string[][];
  readings: string[];
  editions: { label: string; immediate: string; return: string }[];
  questions: string[];
  patterns: string[];
  source: string;
  margin: string;
  peer: string;
  deliveries: { label: string; reading: string }[];
  weave: Weave;
}

export const theatreStories = stories as TheatreStory[];
export const theatreById = new Map(
  theatreStories.map((story) => [story.id, story]),
);
export const theatreStops = stops;
export const theatreMap = (story: TheatreStory) =>
  theatreStops[story.chapter - 1].map;
export const theatreWorld = (story: TheatreStory) =>
  'WORLD-' + String(story.chapter + 1).padStart(2, '0');

export type Side = 0 | 1;
export type Pane = 0 | 1 | 2 | 3;
export type TheatreCommand = { type: 'WorkPocketTheatre'; story: string } & (
  | { act: 'open' | 'receive' | 'return' | 'margin' }
  | { act: 'rehearse'; side: Side | 'wait' }
  | { act: 'fit'; lever: Side; side: Side }
  | { act: 'send'; side: Side }
);
type State = Pick<CampaignState, 'flags' | 'mapId'>;
export const theatreKey = (id: string, bit: string) =>
  'pocket.' + id + '.' + bit;
const flag = (s: State, id: string, bit: string) =>
  s.flags[theatreKey(id, bit)];
export const isSide = (value: unknown): value is Side =>
  value === 0 || value === 1;
export const panes = [0, 1, 2, 3] as const;
export function fittedPane(s: State, id: string): Pane {
  const value = flag(s, id, 'pane');
  return value === 1 || value === 2 || value === 3 ? value : 0;
}
export const paneSeen = (s: State, id: string, pane: Pane) =>
  flag(s, id, 'seen.' + pane) === true;
export function edition(s: State, id: string): Side | undefined {
  const v = flag(s, id, 'sent');
  return isSide(v) ? v : undefined;
}
export function incomingSheet(s: State, story: TheatreStory) {
  const side = edition(s, story.peer);
  if (side === undefined) return;
  return {
    side,
    ...story.deliveries[side],
    from: theatreById.get(story.peer)!,
  };
}
export function returnReceipt(s: State, story: TheatreStory) {
  const side = edition(s, story.id);
  const peer = theatreById.get(story.peer)!;
  if (side === undefined || flag(s, peer.id, 'tried.' + side) !== true) return;
  return { side, peering: peer.title, reading: peer.deliveries[side].reading };
}
export const hasBegun = (s: State, id: string) =>
  flag(s, id, 'first') !== undefined;
export const hasOpened = (s: State, id: string) => flag(s, id, 'open') === true;
export function theatreEffects(s: State, c: TheatreCommand): Effect[] {
  const story = theatreById.get(c.story);
  if (!story || s.mapId !== theatreMap(story))
    throw Error('Find this suitcase in its own room.');
  const mark = (key: string, value: string | boolean | number): Effect => ({
    setFlag: theatreKey(story.id, key),
    value,
  });
  if (c.act === 'open') return [mark('open', true)];
  if (!hasOpened(s, story.id)) throw Error('Unlatch the case first.');
  switch (c.act) {
    case 'margin':
      if (
        edition(s, story.id) === undefined ||
        !panes.every((p) => paneSeen(s, story.id, p))
      )
        throw Error(
          'Try all four views and send an ending before unfolding this margin.',
        );
      return [mark('margin', true)];
    case 'receive': {
      const packet = incomingSheet(s, story);
      if (!packet)
        throw Error('The other desk has yet to send its working sheet.');
      return [mark('tried.' + packet.side, true), mark('received', true)];
    }
    case 'return': {
      const answer = returnReceipt(s, story);
      if (!answer)
        throw Error('Someone at the other desk must use the sheet you sent.');
      return [mark('answered.' + answer.side, true), mark('returned', true)];
    }
    case 'rehearse':
      if (!isSide(c.side) && c.side !== 'wait')
        throw Error('Choose a first direction or leave it open.');
      if (hasBegun(s, story.id))
        throw Error(
          'Your first direction is on the rehearsal strip. You can change the public ending.',
        );
      return [mark('first', c.side), mark('pane', 0), mark('seen.0', true)];
    case 'fit': {
      if (!hasBegun(s, story.id) || !isSide(c.lever) || !isSide(c.side))
        throw Error('Open the rehearsal before moving its scenery.');
      const old = fittedPane(s, story.id);
      const next = c.lever === 0 ? (old & 2) + c.side : (old & 1) + 2 * c.side;
      return [mark('pane', next), mark('seen.' + next, true)];
    }
    case 'send': {
      if (!isSide(c.side) || !hasBegun(s, story.id))
        throw Error('Set out one of the two public endings.');
      if (panes.filter((p) => paneSeen(s, story.id, p)).length < 3)
        throw Error(
          'Change one part of the scene while the other stays put. Then try changing the other part too.',
        );
      return [mark('sent', c.side)];
    }
  }
}
export function theatreDiary(s: CampaignState, c: TheatreCommand) {
  const story = theatreById.get(c.story);
  if (!story) return;
  let detail = '',
    text = '',
    step = 'compare';
  if (c.act === 'open') {
    text = 'I unlatched the suitcase. ' + story.opening;
    step = 'open';
  }
  if (c.act === 'rehearse') {
    detail = String(c.side);
    text =
      c.side === 'wait'
        ? 'I held the first direction open.'
        : 'I tried a first ending. ' + story.editions[c.side].immediate;
    text += ' ' + story.readings[0];
  }
  if (c.act === 'fit') {
    const pane = fittedPane(s, story.id);
    detail = String(pane);
    text = 'I set the scene again. ' + story.readings[pane];
  }
  if (c.act === 'send') {
    detail = String(c.side);
    step = 'send';
    text = 'I sent my working sheet on. ' + story.editions[c.side].immediate;
  }
  if (c.act === 'receive') {
    const packet = incomingSheet(s, story);
    if (!packet) return;
    step = 'receive';
    detail = String(packet.side);
    text =
      'I tried a working sheet from “' +
      packet.from.title +
      '”. ' +
      packet.reading;
  }
  if (c.act === 'return') {
    const receipt = returnReceipt(s, story);
    if (!receipt) return;
    step = 'return';
    detail = String(receipt.side);
    text =
      'I opened the answer from “' +
      receipt.peering +
      '”. ' +
      receipt.reading +
      ' ' +
      story.editions[receipt.side].return;
  }
  if (c.act === 'margin') {
    step = 'compare';
    text = 'I unfolded Lumen’s margin. ' + story.margin;
  }
  const key = ['pocket', story.id, c.act, detail].filter(Boolean).join(':');
  return diaryEvent(
    key,
    'tool',
    theatreKey(story.id, step),
    story.title,
    text,
    c.act === 'margin'
      ? { sourceIds: ['POCKET-READING-' + story.source.toUpperCase()] }
      : {},
    'after-break',
  );
}
