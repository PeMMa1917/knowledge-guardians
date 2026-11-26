import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const S = 'stage.frames.';
const I = 'island.frames.';
const stageStarted: Condition = { flag: S + 'started', eq: true };
const stageInstalled: Condition = { flag: S + 'installed', eq: true };
const stageServed: Condition = { flag: S + 'served', eq: true };
const islandStarted: Condition = { flagSet: I + 'reference' };
const islandInstalled: Condition = { flag: I + 'installed', eq: true };
const islandFinished: Condition = { flag: I + 'finished', eq: true };

function scene(id: string, node: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id: `frames-${id}`, kind: 'scene', node, x, y, w: 1, h: 1, label, art, visibleIf, walkThrough: true };
}

function trial(id: string, node: string, x: number, y: number, label: string, initialArt: string, checkedArt: string,
  started: Condition): Interactable[] {
  const done: Condition = { flag: node, eq: true };
  return [
    scene(id, node, x, y, label, initialArt, { all: [started, { not: done }] }),
    scene(`${id}-checked`, node + '.read', x, y, `the checked ${label.replace(/^the /, '')}`, checkedArt, { all: [started, done] }),
  ];
}

const stageLayouts = [
  ['rail', 6, 10, 'the low rail by the waiting row', 'frames.rail', 'frames.rail-mark'],
  ['folio', 20, 13, 'the staffed late bench', 'frames.folio', 'frames.folio-rest'],
] as const;

export const STAGE_REHEARSAL_FRAMES: Interactable[] = [
  scene('stage-brief', S + 'brief', 8, 11, 'the basket folio order on Edda’s table', 'frames.proof',
    { all: [{ objective: 'stage.arrival' }, { not: stageStarted }] }),
  ...trial('stage-hinge', S + 'hinge', 9, 12, 'the matching pictures on two hinges', 'frames.samples', 'frames.tested-hinges', stageStarted),
];

export const STAGE_GALLERY_FRAMES: Interactable[] = [
  ...trial('stage-reader', S + 'reader', 6, 13, 'the single still and the picture sequence at Nera’s seat',
    'frames.still', 'frames.sequence', stageStarted),
  scene('stage-plan', S + 'plan', 10, 7, 'the dated fold result and reader slip', 'frames.proof',
    { all: [{ objective: S + 'checked' }, { not: { flagSet: S + 'layout' } }] }),
  ...stageLayouts.flatMap(([mode, x, y, label, installedArt, checkedArt]) => {
    const layout: Condition = { flag: S + 'layout', eq: mode };
    return [
      scene(`stage-install-${mode}`, S + 'install.' + mode, x, y, label, 'board-stand',
        { all: [layout, { not: stageInstalled }] }),
      scene(`stage-installed-${mode}`, S + 'installed.' + mode, x, y, label, installedArt,
        { all: [layout, stageInstalled, { not: stageServed }] }),
      scene(`stage-checked-${mode}`, S + 'served.' + mode, x, y, label, checkedArt, { all: [layout, stageServed] }),
    ];
  }),
];

export const STAGE_FOYER_FRAMES: Interactable[] = stageLayouts.flatMap(([mode]) => {
  const layout: Condition = { flag: S + 'layout', eq: mode };
  return [
    scene(`stage-feedback-${mode}`, S + 'feedback.' + mode, 5, 11, 'the first reader reports at the foyer desk', 'frames.proof',
      { all: [layout, stageInstalled, { not: stageServed }] }),
    scene(`stage-receipt-${mode}`, S + 'served.' + mode, 5, 11, 'the foyer’s copy of the verified reading arrangement', 'frames.proof',
      { all: [layout, stageServed] }),
  ];
});

const islandLayouts = [
  ['fixed', 'the clipped rail at the carrier’s waiting mark', 'frames.dock-rail', 'frames.dock-rail-mark'],
  ['host', 'the folio on the staffed dock rest', 'frames.dock-rest', 'frames.dock-hook'],
] as const;

export const ISLAND_WORKSHOP_FRAMES: Interactable[] = [
  scene('island-brief', I + 'brief', 6, 8, 'Ivo’s handover pictures and blank trial slips', 'frames.proof',
    { all: [{ objective: 'island.arrival' }, { not: islandStarted }] }),
  ...(['rail', 'folio', 'local'] as const).map((source) => scene(`island-reference-${source}`, I + 'reference.' + source,
    6, 8, 'the reference clipped beside the Island trial', source === 'local' ? 'frames.dock-sequence' : 'frames.proof',
    { all: [{ flag: I + 'reference', eq: source }, { not: islandInstalled }] })),
  ...trial('island-draft', I + 'draft', 8, 8, 'the test strip beside the workshop draft', 'frames.dock-sequence', 'frames.dock-rail', islandStarted),
  ...trial('island-reader', I + 'reader', 10, 12, 'the empty basket and the two reading supports', 'frames.dock-folio', 'frames.dock-rest', islandStarted),
  scene('island-plan', I + 'plan', 6, 12, 'the crew’s two slips at the worktable', 'frames.proof',
    { all: [{ objective: I + 'checked' }, { not: { flagSet: I + 'layout' } }] }),
  ...islandLayouts.flatMap(([mode]) => {
    const layout: Condition = { flag: I + 'layout', eq: mode };
    return [
      scene(`island-return-${mode}`, I + 'return.' + mode, 6, 8, 'the carriers’ report at the original trial stand', 'frames.proof',
        { all: [layout, islandInstalled, { not: islandFinished }] }),
      scene(`island-checked-${mode}`, I + 'finished.' + mode, 6, 8, 'the checked response with the carrier’s latest request', 'frames.proof',
        { all: [layout, islandFinished] }),
    ];
  }),
];

export const ISLAND_DOCK_FRAMES: Interactable[] = islandLayouts.flatMap(([mode, label, installedArt, checkedArt]) => {
  const layout: Condition = { flag: I + 'layout', eq: mode };
  return [
    scene(`island-install-${mode}`, I + 'install.' + mode, 8, 11, label, 'board-stand',
      { all: [layout, { not: islandInstalled }] }),
    scene(`island-installed-${mode}`, I + 'installed.' + mode, 8, 11, label, installedArt,
      { all: [layout, islandInstalled, { not: islandFinished }] }),
    scene(`island-served-${mode}`, I + 'finished.' + mode, 8, 11, label, checkedArt, { all: [layout, islandFinished] }),
  ];
});
