import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const started: Condition = { flagSet: 'island.movement.started' };
const bothTakes: Condition = { all: [{ flagSet: 'island.movement.flow' }, { flagSet: 'island.movement.hold' }] };
const portableSheet: Condition = {
  all: [{ item: 'item.island.movement.sheet' }, { not: { flagSet: 'island.movement.workshop' } }],
};

function rehearsal(id: string, node: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id: 'island-movement-' + id, kind: 'scene', node: 'island.movement.' + node, x, y, w: 1, h: 1,
    label, art, visibleIf, walkThrough: true };
}

function posted(id: string, x: number, y: number, label: string, art: string, text: string, flag: string, layout: string): Interactable {
  return { id: 'island-movement-' + id, kind: 'sign', x, y, w: 1, h: 1, label, art, text, walkThrough: true,
    visibleIf: { flag, eq: layout } };
}

export const ISLAND_MOVEMENT_DOCK: Interactable[] = [
  rehearsal('flow', 'flow', 16, 10, 'the front mark for the continuous phrase', 'island.card', started),
  rehearsal('hold', 'hold', 18, 10, 'the front mark for the held phrase', 'island.signal', started),
  rehearsal('back', 'back', 21, 11, 'the view from the rear seat', 'voices.guide', bothTakes),
  posted('shared', 17, 11, 'the raised palm cue', 'island.signal',
    'The welcome pauses in one shared phrase. The high hand carries to the back row and the rail gives the box one supported count.',
    'island.movement.layout', 'shared'),
  posted('split', 17, 11, 'the sweep and separate rest cue', 'island.card',
    'The welcome keeps its long sweep. The carriers take a separate turn with the supported rest. The staging marks lead to different rows.',
    'island.movement.layout', 'split'),
];

export const ISLAND_MOVEMENT_WORKSHOP: Interactable[] = [
  rehearsal('rail', 'workshop', 19, 12, 'the rehearsal rail beside the model', 'island.card', portableSheet),
  posted('rail-shared', 19, 12, 'the shared cue on the rehearsal rail', 'island.signal',
    'The dock welcome gains a held count. The workshop marks when to call the load after it. This uses the empty-box rehearsal, not a loaded run.',
    'island.movement.workshop', 'shared'),
  posted('rail-split', 19, 12, 'the two cues on the rehearsal rail', 'island.card',
    'The show keeps its sweep. New carriers rehearse the rest cue with a partner. The route model has no measure of who can carry a working load.',
    'island.movement.workshop', 'split'),
];
