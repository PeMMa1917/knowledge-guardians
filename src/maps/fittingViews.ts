import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const prefix = 'fitting.views.';
const source: Condition = { card: 'card.fitting.rontgen-copy' };
const reading = (value: string): Condition => ({ flag: prefix + 'reading', eq: value });
const moved: Condition = { flag: prefix + 'moved', eq: true };
const finish: Condition = { objective: prefix + 'checked' };
const ready: Condition = { all: [{ objective: 'water.arrival' }, { item: 'item.fitting-view-packet' }] };

function station(id: string, x: number, y: number, label: string, art: string, visibleIf: Condition, node = id): Interactable {
  return { id: `fitting-${id}`, kind: 'scene', node: prefix + node, x, y, w: 1, h: 1,
    label, art: `fitting-views.${art}`, visibleIf, walkThrough: true };
}

export const METALWORKS_FITTING_RECORD: Interactable = {
  id: 'fitting-record', kind: 'exhibit', exhibit: 'OBJ-MET-RONTGEN-A606881', x: 8, y: 12, w: 1, h: 1,
  label: 'the museum record for the photograph of Röntgen’s radiograph',
  art: 'fitting-views.case', walkThrough: true, visibleIf: { objective: 'metal.arrival' },
};

export const METALWORKS_FITTING_YARD: Interactable[] = [
  station('lamp', 22, 9, 'Corra’s soft test fitting beneath the surface lamp', 'lamp', { all: [source, { not: moved }] }),
  station('lamp-record', 22, 9, 'the surface outline at the empty lamp cradle', 'surface', moved),
  { ...station('reference', 24, 11, 'the empty and known-insert reference blocks', 'standards', source),
    artOpen: { key: 'fitting-views.standards-read', if: { flag: prefix + 'reference', eq: true } } },
  station('plate', 24, 9, 'the fitting’s flat view against the corner stop', 'plate', { all: [moved, { not: { flagSet: prefix + 'reading' } }] }),
  station('turn', 24, 9, 'the flat trace and the turn stop', 'plate-face', reading('face')),
  station('side-record', 24, 9, 'the turned test fitting and the two traces', 'plate-side', reading('side')),
  station('dispatch', 23, 13, 'Corra’s single runner pocket and the two work orders', 'dispatch',
    { all: [{ objective: prefix + 'compared' }, { not: { flagSet: prefix + 'route' } }] }),
  ...(['surface', 'pair'] as const).map((route) => station(`kept-${route}`, 23, 13, 'the work record kept in the Sample Yard',
    `packet-${route}`, { flag: prefix + 'route', eq: route }, `kept.${route}`)),
];

const surface: Condition = { all: [ready, { flag: prefix + 'route', eq: 'surface' }] };
const pair: Condition = { all: [ready, { flag: prefix + 'route', eq: 'pair' }] };
const repeated: Condition = { flag: prefix + 'repeated', eq: true };
const fitted: Condition = { flag: prefix + 'fitted', eq: true };

export const WATER_FITTING_BENCHES: Interactable[] = [
  { ...station('water-repeat', 22, 10, 'the reference notch across the bridge', 'standards', pair, 'water.repeat'),
    artOpen: { key: 'fitting-views.standards-read', if: repeated } },
  ...([
    ['surface', 10, 13, 'the outer arrow on the west teaching board', surface],
    ['pair', 23, 13, 'the cutaway locator at the east practice bench', { all: [pair, repeated] }],
  ] as const satisfies readonly [string, number, number, string, Condition][]).flatMap(([route, x, y, label, available]) => [
    station(`water-fit-${route}`, x, y, label, `board-${route}`, { all: [available, { not: fitted }] }, `water.fit.${route}`),
    station(`water-use-${route}`, x, y, label, `used-${route}`, { all: [available, fitted, { not: finish }] }, `water.use.${route}`),
    station(`water-checked-${route}`, x, y, label, `checked-${route}`, { all: [available, finish] }, `water.checked.${route}`),
  ]),
];
