import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const trained: Condition = { objective: 'm01.o6.label' };
const planned: Condition = { objective: 'fold.access.compare' };
const carried: Condition = { all: [{ objective: 'm02.o1.arrive' }, { item: 'item.door-fold' }] };

function scene(id: string, node: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id, kind: 'scene', node, x, y, w: 1, h: 1, label, art, visibleIf, walkThrough: true };
}

export const NEXUS_DOOR_FOLD: Interactable[] = [
  { id: 'nexus-fold-century', kind: 'exhibit', exhibit: 'OBJ-DOOR-01', x: 28, y: 9, w: 1, h: 1,
    label: 'Brooks’s illustrated book about government', art: 'big.door-century-book', visibleIf: trained, walkThrough: true },
  { id: 'nexus-fold-green', kind: 'exhibit', exhibit: 'OBJ-DOOR-02', x: 35, y: 9, w: 1, h: 1,
    label: 'the 1941 travel guide from the Smithsonian', art: 'big.door-green-book', visibleIf: trained, walkThrough: true },
  scene('nexus-fold-porch', 'fold.access.porch', 30, 8, 'the porch-height viewing frame', 'fold.open-door', trained),
  scene('nexus-fold-receipt', 'fold.access.receipt', 36, 10, 'Suri’s permission slip at knee height', 'fold.strip', trained),
  scene('nexus-fold-move', 'fold.access.move', 32, 9, 'the cases on two open hinges', 'fold.two-hinges', planned),
  scene('nexus-fold-front', 'fold.access.front', 30, 13, 'the paired front display', 'fold.paired',
    { flag: 'fold.access.route', eq: 'front' }),
  scene('nexus-fold-side', 'fold.access.side', 37, 10, 'the two approach displays', 'fold.two-hinges',
    { flag: 'fold.access.route', eq: 'side' }),
];

export const EMBERFORD_DOOR_FOLD: Interactable[] = [
  scene('ember-fold-station', 'fold.ember.station', 11, 16, 'Iven’s lantern-house handover', 'fold.two-hinges', carried),
  scene('ember-fold-front', 'fold.ember.front', 12, 17, 'the front pickup after the call', 'fold.paired',
    { flag: 'fold.ember.route', eq: 'front' }),
  scene('ember-fold-yard', 'fold.ember.yard', 9, 17, 'the lantern-house delivery gate', 'fold.open-door',
    { flag: 'fold.ember.route', eq: 'yard' }),
];
