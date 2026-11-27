import { CLEAR_BAY_GAME } from '../domain/clearBay';
import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const arrived: Condition = { flag: 'preserved.arrived', eq: true };
const flag = (key: string, value: string): Condition => ({ flag: 'clearbay.' + key, eq: value });

export const COLD_CLEAR_BAY: Interactable[] = [
  { id: 'clear-bay-board', kind: 'fieldgame', game: CLEAR_BAY_GAME, x: 11, y: 12, w: 1, h: 1,
    label: 'the railing and the measured load bay', art: 'survey-box', walkThrough: true, visibleIf: arrived },
  { id: 'clear-bay-duty', kind: 'scene', node: 'clearbay.duty-book', x: 8, y: 8, w: 1, h: 1,
    label: 'Marret’s duty book with a later repair tab', art: 'ledger', walkThrough: true, visibleIf: arrived },
  { id: 'clear-bay-visitor', kind: 'scene', node: 'clearbay.visitor-note', x: 5, y: 9, w: 1, h: 1,
    label: 'Tarin’s visitor stub on the review shelf', art: 'preserved.slip', walkThrough: true, visibleIf: arrived },
  ...([
    ['north', 10, 5, 'the staffed wide rail at North', 'board-stand', 'preserved.display-paired',
      'The checked North rail takes a cart and its helper at second bell. Hand parcels wait there with the posted time.'],
    ['west', 5, 14, 'the first-bell hand relay at West', 'survey-box', 'preserved.display-records',
      'West accepts hand parcels from the first bell. The cart keeps its second-bell tag at the relay. The family’s name stays folded.'],
  ] as const).flatMap(([route, x, y, label, art, finalArt, text]): Interactable[] => [
    { id: 'clear-bay-reader-' + route, kind: 'scene', node: 'clearbay.' + route + '-reader',
      x, y, w: 1, h: 1, label, art, walkThrough: true,
      visibleIf: { all: [flag('layout', route), { not: { flagSet: 'clearbay.checked' } }] } },
    { id: 'clear-bay-marked-' + route, kind: 'sign', x, y, w: 1, h: 1, label, art: finalArt, text, walkThrough: true,
      visibleIf: flag('checked', route) },
  ]),
];
