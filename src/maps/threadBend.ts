import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const scope = 'sea.threadbend.';
const flag = (name: string, eq: string | boolean = true): Condition => ({ flag: scope + name, eq });
const unset = (name: string): Condition => ({ not: { flagSet: scope + name } });
const ready = (...all: Condition[]): Condition => ({ all });
const guide: Condition = { item: 'item.sea.threadbend-guide' };

function scene(name: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id: `threadbend-${name}`, kind: 'scene', node: scope + name, x, y, w: 1, h: 1,
    label, art, visibleIf, walkThrough: true };
}

function receiver(type: 'letter' | 'tray', x: number, y: number, label: string): Interactable {
  return scene(`receive.${type}`, x, y, label, 'preserved.folder', ready(guide, flag('choice', type), unset('placed')));
}

function result(type: 'letter' | 'tray', x: number, y: number, label: string, text: string, art: string): Interactable {
  return { id: `threadbend-result.${type}`, kind: 'sign', x, y, w: 1, h: 1, label, text,
    visibleIf: flag('placed', type), art, walkThrough: true };
}

export const THREAD_BEND_CHARTROOM = [
  scene('story', 10, 9, 'the account of Ariadne beside the wooden model', 'preserved.catalogue', { objective: 'sea.finish' }),
  { ...scene('pin', 14, 10, 'the practice cord at the fixed starting peg', 'departure.peg', flag('started')),
    artOpen: { key: 'departure.peg-marked', if: { flagSet: scope + 'set' } } },
  scene('inner', 11, 11, 'the model’s nearer turn and two-notched gap', 'sea.margin', flag('set', 'inner')),
  scene('outer', 19, 10, 'the model’s farther turn and four-notched gap', 'preserved.display-records', flag('set', 'outer')),
  scene('bind', 20, 12, 'Renna’s clips for the next checked guide', 'preserved.folder',
    ready({ objective: scope + 'compare' }, unset('choice'))),
];

export const THREAD_BEND_HARBOUR = [
  receiver('letter', 13, 9, 'the messenger’s envelope hook'),
  result('letter', 13, 9, 'the envelope-only guide at the west hook',
    'The messenger cleared the nearer turn with one envelope. The tray is waiting for the crew’s ordinary turn. The load limit stays beside the peg mark.', 'sea.margin'),
  receiver('tray', 19, 12, 'the tray crew’s handoff table'),
  result('tray', 19, 12, 'the checked guide at the tray crew’s table',
    'The tray cleared the wider posts after two bends. The envelope goes with the next handoff. The tray mark and both bends stay beside the peg mark.', 'preserved.display-paired'),
];
