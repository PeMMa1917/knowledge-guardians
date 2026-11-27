import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const flag = (name: string, eq: string | boolean = true): Condition => ({ flag: `lower-rail.${name}`, eq });
const has = (name: string): Condition => ({ flagSet: `lower-rail.${name}` });
const not = (condition: Condition): Condition => ({ not: condition });
const all = (...conditions: Condition[]): Condition => ({ all: conditions });

function rail(room: 'hall' | 'weir', id: string, label: string, art: string, visibleIf: Condition, node = id): Interactable {
  const [x, y] = room === 'hall' ? [21, 5] : [10, 6];
  return {
    id: `lower-rail-${id}`, node: `lower-rail.${node}`, kind: 'scene', x, y, w: 1, h: 1,
    label, art: `lower-rail.${art}`, walkThrough: true, visibleIf, sfx: 'sfx.page',
  };
}

const hall = (id: string, label: string, art: string, when: Condition, node?: string) =>
  rail('hall', id, label, art, when, node);

const weir = (id: string, label: string, art: string, when: Condition, node?: string) =>
  rail('weir', id, label, art, when, node);

const copySeen: Condition = { flag: 'clue.scraped-label', eq: true };
const sample: Condition = { item: 'item.lower-rail' };
const late = all(sample, { flag: 'harrowmere.found', eq: true });
const undecided = not(has('design'));
const unmounted = not(has('mounted'));

export const NILE_LOWER_RAIL: Interactable[] = [
  hall('sample', 'Leila’s loose practice window', 'empty', all(copySeen, not(has('fitted')))),
  hall('covered', 'the practice line behind the lower rail', 'masked', all(copySeen, flag('fitted'), not(sample))),
  hall('early-receipt', 'Leila’s note beside the untouched old case', 'open', all(sample, undecided)),
  hall('wide-return', 'Omi’s full board beside the scraped case', 'open', all(flag('design', 'wide'), unmounted)),
  hall('hinge-return', 'Omi’s spare teaching hinge', 'empty', all(flag('design', 'hinge'), unmounted)),
  hall('wide-kept', 'the whole warning beside the old card', 'wide', flag('mounted', 'wide')),
  hall('hinge-down', 'the teaching window with the rail lowered', 'masked', all(flag('mounted', 'hinge'), flag('demo', 'down'))),
  hall('hinge-up', 'the teaching window with the rail lifted', 'hinge', all(flag('mounted', 'hinge'), flag('demo', 'up'))),
];

export const WATER_LOWER_RAIL: Interactable[] = [
  weir('watch', 'Omi’s short rack beside the crossing copy', 'empty', all(late, not(has('checked')))),
  weir('watch-tested', 'the whole crossing line on Omi’s shelf', 'open', all(late, flag('checked'), undecided), 'watch-choice'),
  weir('watch-wide', 'the whole warning fastened at the weir', 'wide', all(late, flag('design', 'wide'))),
  weir('watch-hinge', 'the working hinge on Omi’s watch shelf', 'hinge', all(late, flag('design', 'hinge'))),
];
