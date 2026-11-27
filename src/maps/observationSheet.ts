import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const recorded = (field: string): Condition => ({ flag: `forest.hands.${field}`, eq: true });
const arrived: Condition = { objective: 'forest.arrival' };
const equipped: Condition = { all: [
  { flag: 'keepsake.observer-notebook', eq: true }, { flag: 'perspective.active', eq: 'observer-notebook' },
] };
const stageReady: Condition = { all: [equipped, { objective: 'forest.hands.kept' }, { objective: 'stage.arrival' }] };

function station(id: string, node: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id, kind: 'scene', node, x, y, w: 1, h: 1, label, art, visibleIf, walkThrough: true, sfx: 'sfx.page' };
}

export const FOREST_SHEET_STATION = [
  station('forest-hands-board', 'forest.hands.board', 13, 9, 'Elian’s two-place practice frame', 'forest.field-diagram', arrived),
  {
    ...station('forest-hands-front', 'forest.hands.front', 6, 8, 'the open end of the practice frame', 'forest.guide-level', recorded('started')),
    artOpen: { key: 'preserved.slip', if: recorded('front') },
  },
  {
    ...station('forest-hands-side', 'forest.hands.side', 19, 8, 'the recorder’s sliding bench', 'forest.guide-rise', recorded('started')),
    artOpen: { key: 'preserved.display-paired', if: recorded('recheck') },
  },
];

export const FOREST_SHEET_CLEARING = {
  ...station('forest-hands-receiver', 'forest.hands.receiver', 13, 8, 'Ayla’s next-watch sheet', 'preserved.folder',
    { objective: 'forest.hands.context' }),
  artBy: { flag: 'forest.hands.layout', keys: { separate: 'preserved.display-paired', relay: 'preserved.slip' } },
};

export const STAGE_SHEET_REHEARSAL = {
  ...station('stage-hands-prompt', 'stage.hands.prompt', 10, 9, 'the first call at the prompt gap', 'stage.cues', stageReady),
  artOpen: { key: 'preserved.slip', if: { flag: 'stage.hands.prompt', eq: true } },
};

export const STAGE_SHEET_GALLERY = [
  {
    ...station('stage-hands-floor', 'stage.hands.floor', 16, 11, 'the low pin visible from the gallery', 'stage.move', stageReady),
    artOpen: { key: 'preserved.slip', if: { flag: 'stage.hands.floor', eq: true } },
  },
  {
    ...station('stage-hands-plan', 'stage.hands.plan', 12, 7, 'Hari’s call and confirmation clips', 'preserved.folder',
      { all: [stageReady, { objective: 'stage.hands.compare' }] }),
    artBy: { flag: 'stage.hands.used', keys: { helper: 'preserved.display-paired', caller: 'stage.cues' } },
  },
];
