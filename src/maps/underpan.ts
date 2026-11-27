import { account, underpanOpen } from '../content/underpan';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

function scene(id: string, x: number, y: number, label: string, art: string, visibleIf?: Condition): Interactable {
  return { id: 'underpan-' + id, kind: 'scene', node: 'underpan.' + id, x, y, w: 1, h: 1,
    walkThrough: true, label, art, visibleIf };
}
const lamp = { flagSet: 'underpan.wick' };
const upstairs = { id: 'fen-clove', x: 14, y: 7, facing: 'down' } as const;
export const UNDERPAN_SQUARE_FEN = { ...upstairs, visibleIf: account('lamps') };
export const UNDERPAN_SQUARE: Interactable[] = [
  scene('coin', 18, 10, 'the coin standing on edge', 'underpan.coin', { not: underpanOpen }),
  { id: 'underpan-grate', kind: 'door', x: 18, y: 10, w: 1, h: 1, walkThrough: true,
    label: 'the loose grate under the weighing pan', art: 'underpan.grate', visibleIf: underpanOpen,
    to: { map: 'market.underpan', x: 9, y: 10 } },
  { id: 'underpan-show', kind: 'sign', x: 13, y: 7, w: 1, h: 1, walkThrough: true,
    label: 'Fen’s demonstration lamp', art: 'moon.flood', visibleIf: account('lamps'),
    text: 'Five hand shapes fit on the plaster. There are only three lamps. Fen leaves a piece of chalk here for anyone who sees another.' },
  { id: 'underpan-quiet', kind: 'sign', x: 18, y: 9, w: 1, h: 1, walkThrough: true,
    label: 'the creature keeping watch at the grate', art: 'underpan.runner', visibleIf: account('shutters'),
    text: 'A paper foot taps the curb each time someone comes up into daylight. The feet never keep count of who goes down.' },
];
export const UNDERPAN: MapDef = {
  id: 'market.underpan', name: 'Market of Measures: The Underpan', world: 'WORLD-11',
  width: 18, height: 14, spawn: { x: 9, y: 10 }, background: 0x2d2536, music: 'music.archive', ambience: 'study',
  floor: (x, y) => x < 1 || x > 16 || y < 0 || y > 12 ? null
    : y < 3 ? ['wall-top', 'wall-mid', 'wall-base'][y] : y === 8 ? 'market-lane' : 'stone-c',
  blocks: [[0, 0, 18, 3], [0, 0, 1, 14], [17, 0, 1, 14], [0, 13, 18, 1], [6, 6, 6, 1]], zones: [],
  npcs: [{ id: 'fen-clove', x: 13, y: 8, facing: 'left', visibleIf: { not: account('lamps') } }],
  stamps: [{ stamp: 'window', x: 12, y: 1 }, { stamp: 'crates', x: 2, y: 4 }],
  lights: [{ x: 5, y: 9, r: 61, color: 0xffcb77 }, { x: 14, y: 5, r: 38, color: 0xa3aad0 }],
  interactables: [
    { id: 'underpan-leave', kind: 'door', x: 9, y: 12, w: 1, h: 1, label: 'the steps out to Lantern Square',
      art: 'underpan.grate', to: { map: 'market.square', x: 18, y: 11 } },
    scene('lamp', 4, 9, 'the lamp on its brass swivel', 'moon.flood'),
    scene('wall', 13, 4, 'the three hands on the plaster', 'underpan.runner', lamp),
    { id: 'underpan-faint', kind: 'sign', x: 13, y: 4, w: 1, h: 1, walkThrough: true,
      label: 'a flicker behind white plaster', art: 'underpan.shadow', visibleIf: { not: lamp },
      text: 'The marks overlap. A brass rail leads back around the divider toward the lamp. Something smaller scuffs the skirting board.' },
    scene('edge', 6, 10, 'the receipts under the stair', 'nile.scroll'),
    { id: 'underpan-counting-stair', kind: 'door', x: 13, y: 5, w: 1, h: 1, label: 'the old stair to Fen’s demonstration',
      art: 'underpan.grate', visibleIf: account('lamps'), to: { map: 'market.square', x: 14, y: 8 } },
  ],
};
