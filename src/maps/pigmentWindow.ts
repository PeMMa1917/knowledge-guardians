import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const prefix = 'pigment-window.';
const arrived: Condition = { flag: 'reached.emberford', eq: true };
const controlled: Condition = { objective: prefix + 'controlled' };
const carried: Condition = { item: 'item.pigment-window.strip' };
const state = (key: string, value: string | true = true): Condition => ({ flag: prefix + key, eq: value });

function scene(id: string, x: number, y: number, label: string, art: string, node: string, visibleIf: Condition): Interactable {
  return { id: prefix + id, kind: 'scene', x, y, w: 1, h: 1, label, art, node: prefix + node, visibleIf, walkThrough: true };
}

function sign(id: string, x: number, y: number, label: string, art: string, text: string, visibleIf: Condition, flag?: string): Interactable {
  return { id: prefix + id, kind: 'sign', x, y, w: 1, h: 1, label, art, text, visibleIf, flag: flag && prefix + flag, walkThrough: true };
}

export const EMBERFORD_PIGMENT_WINDOW: Interactable[] = [
  { ...scene('stand', 32, 8, 'the reed-violet frame with two sliding lamps', 'same-red.exhibit', 'try', arrived),
    artBy: { flag: prefix + 'display', keys: { warm: 'voices.lamp', cool: 'same-red.exhibit', start: 'preserved.display-paired', later: 'preserved.display-records' } } },
  sign('warm', 32, 9, 'the intact strip under the warm lamp', 'voices.lamp',
    'Practice brightness 3. The intact strip has the same corner cut it had before. This reading belongs to the warm lamp.', state('display', 'warm'), 'seen.warm'),
  sign('cool', 32, 9, 'the same strip under the cool lamp', 'same-red.exhibit',
    'Practice brightness 5. The corner cut marks the same intact strip. Changing the lamp changed the reading.', state('display', 'cool'), 'seen.cool'),
  sign('start', 32, 9, 'the starting pair under one fixed cool lamp', 'preserved.display-paired',
    'Start of the model interval. Covered strip 5. Open strip 5. Both measurements use the same cool lamp and scale.', state('display', 'start'), 'seen.start'),
  sign('later', 32, 9, 'the custody pair with the lamp still fixed', 'preserved.display-records',
    'End of the model interval. Covered strip 5. Open strip 2. The cool lamp and scale stayed fixed. The model shows less colour stability for the open strip in these conditions. Its chemistry needs a separate test.', state('display', 'later'), 'seen.later'),
  scene('carry', 32, 12, 'the paired pigment proof waiting to travel', 'preserved.display-paired', 'take',
    { all: [controlled, { not: carried }] }),
  sign('carry-done', 32, 12, 'the peg where the paired proof was collected', 'preserved.display-paired',
    'The working copy is in your bag. Bring it to the keeper at the Lending Hall Landing.', carried),
];

export const LANDING_PIGMENT_WINDOW: Interactable[] = [
  scene('copy', 8, 10, 'the print proof for the outdoor approach', 'preserved.display-paired', 'copy',
    { all: [controlled, carried, { not: { flagSet: prefix + 'placement' } }] }),
  sign('lamp', 7, 10, 'the fixed-lamp proof beside the covered rail', 'voices.lamp',
    'The next reader holds both strips under this lamp. They can compare the reported 5 and 2 here. A person on the outdoor path needs to step into the rail to repeat it.',
    state('placement', 'lamp'), 'received'),
  sign('hatch', 9, 10, 'the proof marked with a hatch beside the outside path', 'preserved.display-records',
    'A runner finds the right patch by its hatch from the outdoor path. The small caption directs people to the covered rail for a comparable colour reading.',
    state('placement', 'hatch'), 'received'),
];
