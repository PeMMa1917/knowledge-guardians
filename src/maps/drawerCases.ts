import type { Interactable } from './types';

export const EMBERFORD_DRAWER_CASES: Interactable[] = [
  { id: 'ember-bertrand', kind: 'exhibit', exhibit: 'OBJ-DRAWER-01', x: 25, y: 15, w: 1, h: 1, walkThrough: true,
    label: 'Bertrand’s original three-case example', art: 'big.drawer-cases' },
  { id: 'ember-drawer-cases', kind: 'fieldgame', game: 'drawer-cases', x: 27, y: 16, w: 1, h: 1, walkThrough: true,
    label: 'Dov’s six-lidded drawer board', art: 'drawer-board',
    visibleIf: { objective: 'm02.o1.arrive' } },
];

export const FOLD_DRAWER_CASES: Interactable[] = [
  { id: 'fold-drawer-plan', kind: 'scene', node: 'drawer.fold.plan', x: 8, y: 10, w: 1, h: 1, walkThrough: true,
    label: 'the split tally trays at the receiving rail', art: 'drawer-board',
    visibleIf: { all: [{ objective: 'coast.readings' }, { item: 'item.drawer-stencil' }] } },
  { id: 'fold-drawer-all', kind: 'scene', node: 'drawer.fold.all', x: 7, y: 11, w: 1, h: 1, walkThrough: true,
    label: 'the six-slot copy at the yard gate', art: 'fold.paired',
    visibleIf: { flag: 'drawer.fold.route', eq: 'all' } },
  { id: 'fold-drawer-readings', kind: 'scene', node: 'drawer.fold.readings', x: 11, y: 12, w: 1, h: 1, walkThrough: true,
    label: 'the runner’s partial copy and return peg', art: 'fold.strip',
    visibleIf: { flag: 'drawer.fold.route', eq: 'readings' } },
];
