import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const scope = 'copies.wordclip.';
const flag = (name: string, eq: string | boolean = true): Condition => ({ flag: scope + name, eq });
const objective = (name: string): Condition => ({ objective: scope + name });
const unset = (name: string): Condition => ({ not: { flagSet: scope + name } });
const ready = (...all: Condition[]): Condition => ({ all });
const proof: Condition = { item: 'item.copies.wordclip-proof' };

function scene(name: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id: `wordclip-${name}`, kind: 'scene', node: scope + name, x, y, w: 1, h: 1,
    label, art, visibleIf, walkThrough: true };
}

function receiver(route: 'records' | 'landing', x: number, y: number, label: string): Interactable {
  return scene(`receive.${route}`, x, y, label, 'preserved.folder', ready(proof, flag('route', route), unset('delivered')));
}

function result(route: 'records' | 'landing', x: number, y: number, label: string, text: string): Interactable {
  return { id: `wordclip-finished-${route}`, kind: 'sign', x, y, w: 1, h: 1, label, text,
    visibleIf: flag('delivered', route), art: 'preserved.display-paired', walkThrough: true };
}

export const WITNESS_CLIP_ARCHIVE = [
  scene('start', 17, 12, 'the waiting wrapper clip', 'preserved.slip', ready({ objective: 'copies.revise' }, unset('started'))),
  scene('version', 17, 8, 'the one-punch and two-punch wrappers', 'preserved.catalogue', flag('started')),
  receiver('records', 17, 6, 'the two empty wrapper slots'),
  result('records', 17, 6, 'the two dated wrapper slots',
    'One punch at the first bell. Two punches and a blue pocket at the second. The arrival signature belongs to the second slot. Both dated forms can be requested here.'),
];

export const WITNESS_CLIP_PRESS = [
  scene('gloss', 14, 9, 'the plain guard leaf and its clipped explanation', 'preserved.display-records', flag('started')),
  scene('bind', 20, 10, 'the bench for binding the wrapper proof', 'copies.press', ready(objective('gather'), unset('route'))),
];

export const WITNESS_CLIP_LANDING = [
  scene('witness', 18, 8, 'the signed arrival slip with one blank line', 'copies.strip', flag('started')),
  receiver('landing', 10, 9, 'the reader’s open-page rail'),
  result('landing', 10, 9, 'the proof open at the first written page',
    'The protective leaf lies back. The first written page and its number lie open at the rail. The signed arrival and its date remain in the lower fold.'),
];
