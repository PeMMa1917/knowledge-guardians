import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

const arrived: Condition = { objective: 'forest.arrival' };
const compared: Condition = { objective: 'forest.hook.compare' };
const readback: Condition = { objective: 'forest.hook.readback' };
const selected = (plan: string): Condition => ({ flag: 'forest.hook.plan', eq: plan });
const received = (plan: string): Condition => ({ flag: 'forest.hook.used', eq: plan });
const waiting = (plan: string): Condition => ({ all: [compared, selected(plan), { not: readback }] });

function scene(name: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id: `forest-hook-${name}`, kind: 'scene', node: `forest.hook.${name}`,
    x, y, w: 1, h: 1, label, art, visibleIf, walkThrough: true };
}

function notice(name: string, x: number, y: number, label: string, art: string, text: string, visibleIf: Condition): Interactable {
  return { id: `forest-hook-${name}`, kind: 'sign', x, y, w: 1, h: 1, label, art, text, visibleIf, walkThrough: true };
}

export const HOOK_KEEPER: MapDef['npcs'][number] = {
  id: 'forest-hook-sorell', x: 18, y: 13, facing: 'left', visibleIf: arrived,
};

export const HOOK_STATION = [
  scene('tirren', 21, 8, 'Tirren’s signed slip by the basket', 'preserved.slip', arrived),
  scene('receive.voice', 20, 7, 'the signed account pocket at the station bench', 'preserved.folder', waiting('voice')),
  notice('bench-signed', 20, 7, 'Tirren’s and Sorell’s signed accounts', 'preserved.display-records',
    'Tirren kept his words about the approach. Sorell kept her words about the peg. Both marks point to the same empty hook and lower bracket.',
    received('voice')),
  notice('bench-fold', 20, 7, 'the unfolded copy at the station bench', 'preserved.display-paired',
    'The two signed stories open beneath the bracket direction. Tirren’s words name the west stones. Sorell’s own line records why she remembers shifting the slate.',
    received('fold')),
];

export const HOOK_TRAIL = [
  scene('high', 6, 13, 'the empty hook as seen from the west stones', 'forest.waypost', arrived),
  scene('low', 8, 13, 'the lower bracket behind the end of the rail', 'preserved.slip',
    { all: [arrived, { flag: 'forest.hook.high', eq: true }] }),
  scene('receive.route', 9, 13, 'the trail rail for the short direction', 'preserved.slip', waiting('route')),
  scene('receive.fold', 9, 13, 'the trail rail for the folded direction', 'preserved.folder', waiting('fold')),
  notice('rail-direction', 9, 13, 'the short direction for the west stones', 'forest.waypost',
    'Enter from the west stones. Find the blue arrow below the rail. Follow the laid stones. Both signed slips are at the clearing bench.',
    received('route')),
  notice('rail-fold', 9, 13, 'the folded direction for the west stones', 'preserved.display-paired',
    'The outside gives the arrow’s new place. The fold at the station bench keeps who spoke and where each person was standing.',
    received('fold')),
];

export const HOOK_CLEARING = [
  scene('dispatch', 16, 13, 'the packing bench for the two trail accounts', 'preserved.folder',
    { all: [compared, { not: { flagSet: 'forest.hook.plan' } }] }),
  notice('clearing-signed', 16, 13, 'the paired accounts at the clearing bench', 'preserved.display-records',
    'One slip begins at the west stones. The other begins with a rattling peg. Each carries its speaker’s name and leads back to the lower bracket.',
    received('route')),
];
