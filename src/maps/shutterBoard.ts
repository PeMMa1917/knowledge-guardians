import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

const scope = 'nexus.shutter.';
const flag = (name: string, eq: boolean | string): Condition => ({ flag: scope + name, eq });
const pending = (name: string): Condition => ({ not: { flagSet: scope + name } });
const found = flag('found', true);
const pin: Condition = { item: 'item.nexus.shutter-pin' };

function scene(name: string, x: number, y: number, label: string, art: string, visibleIf?: Condition): Interactable {
  return { id: `shutter-${name}`, kind: 'scene', node: scope + name, x, y, w: 1, h: 1,
    label, art, visibleIf, walkThrough: true };
}

function sign(id: string, x: number, y: number, label: string, text: string, art: string, visibleIf: Condition): Interactable {
  return { id: `shutter-${id}`, kind: 'sign', x, y, w: 1, h: 1, label, text, art, visibleIf, walkThrough: true };
}

export const SHUTTER_VISITORS: MapDef['npcs'] = [
  { id: 'shutter-tavin', x: 4, y: 17, facing: 'right', visibleIf: found },
  { id: 'shutter-merra', x: 17, y: 17, facing: 'left', visibleIf: found },
];
export const NEXUS_SHUTTERS: Interactable[] = [
  scene('recess', 5, 16, 'the worn mark beside the west bench', 'preserved.slip', pending('recess')),
  scene('draft', 7, 16, 'the thread by the upright', 'board-stand', { all: [flag('recess', true), pending('found')] }),
  { id: 'shutter-hatch', kind: 'door', x: 8, y: 16, w: 1, h: 1, label: 'the hidden service hatch', art: 'preserved.door',
    visibleIf: found, walkThrough: true, to: { map: 'nexus.two-shutters', x: 9, y: 10 } },
  { ...scene('fit', 15, 17, 'the arrivals desk’s pin fitting', 'preserved.folder', pin),
    artBy: { flag: scope + 'layout', keys: { low: 'forest.guide-level', quiet: 'preserved.display-records' } } },
  sign('tray-rest', 4, 18, 'the open tray rest', 'A level rest supports the tray here. The turning space stays clear.', 'forest.guide-level', flag('layout', 'low')),
  sign('quiet-seat', 16, 18, 'the screened reading seat', 'The screening leaves a quiet place for two pages. The ordinary returns route stays clear.', 'preserved.display-records', flag('layout', 'quiet')),
];

const openQuiet = flag('active', 'quiet');
const openLow = flag('active', 'low');
export const TWO_SHUTTER_ROOM: MapDef = {
  id: 'nexus.two-shutters', name: 'The Nexus: The Two Shutter Room', world: 'WORLD-01',
  width: 19, height: 14, background: 0x251c36, spawn: { x: 9, y: 10 }, music: 'music.archive', ambience: 'study',
  floor: (x, y) => {
    if (x < 1 || x > 17 || y < 0 || y > 13) return null;
    if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
    return 'stone-c';
  },
  blocks: [[1, 0, 17, 3]], zones: [],
  npcs: [{ id: 'shutter-ilin', x: 9, y: 6, facing: 'down' }],
  stamps: [
    { stamp: 'window', x: 5, y: 1 }, { stamp: 'window', x: 13, y: 1 },
    { stamp: 'bench', x: 2, y: 10 }, { stamp: 'bench', x: 14, y: 10 },
    { stamp: 'rug-green', x: 8, y: 9 },
  ],
  lights: [
    { x: 5, y: 5, r: 65, color: 0x91c5c8 }, { x: 13, y: 5, r: 65, color: 0xc4a3ea },
    { x: 9, y: 8, r: 72, color: 0xe9bb76 },
  ],
  interactables: [
    { id: 'shutter-room-exit', kind: 'door', x: 9, y: 13, w: 1, h: 1, label: 'the stairs out to the Nexus',
      art: 'preserved.door', to: { map: 'nexus.archive', x: 7, y: 17 } },
    scene('guide', 6, 8, 'Ilin’s four-step guide', 'preserved.catalogue'),
    { id: 'shutter-board', kind: 'fieldgame', game: 'shutter-board', x: 9, y: 8, w: 1, h: 1,
      label: 'the board with three working mirrors', art: 'nexus.viewer-sheet', walkThrough: true },
    sign('quiet-dark', 13, 5, 'the dark upper shutter', 'The upper line is dark. Check which way the high mirror turns the light.', 'preserved.folder', { not: openQuiet }),
    scene('quiet.check', 13, 5, 'the lit upper shutter', 'preserved.display-records', openQuiet),
    sign('low-dark', 5, 5, 'the dark lower shutter', 'The lower line is dark. This rest has a wide approach for arriving trays.', 'preserved.folder', { not: openLow }),
    scene('low.check', 5, 5, 'the lit lower shutter', 'forest.guide-level', openLow),
  ],
};
