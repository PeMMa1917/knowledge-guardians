import { COAST_COPY_DESK, COAST_COPY_READER, COAST_COPY_POCKET, coastCopyAvailable, coastCopyIs, coastCopyReady, coastCopyLayouts } from '../content/coastCopy';
import type { Interactable } from './types';

export const COAST_COPY_LISTENING: Interactable = {
  id: COAST_COPY_DESK, kind: 'fieldgame', game: COAST_COPY_DESK, x: 8, y: 5, w: 1, h: 1,
  label: 'Wren’s rubbing table', art: 'preserved.slip', walkThrough: true, visibleIf: coastCopyReady,
  artOpen: { key: 'voices.paired', if: { any: [coastCopyIs('layout', 'sleeve'), coastCopyIs('layout', 'pockets')] } },
};

export const COAST_COPY_WALK: Interactable[] = [
  {
    id: COAST_COPY_READER, kind: 'fieldgame', game: COAST_COPY_READER, x: 19, y: 13, w: 1, h: 1,
    label: 'Eren’s copy bench', art: 'voices.permission', walkThrough: true,
    visibleIf: { all: [coastCopyAvailable, { flagSet: 'coast-copy.trial' }] },
    artOpen: { key: 'voices.paired', if: { any: [coastCopyIs('received', 'sleeve'), coastCopyIs('received', 'pockets')] } },
  },
  {
    id: COAST_COPY_POCKET, kind: 'fieldgame', game: COAST_COPY_POCKET, x: 25, y: 8, w: 1, h: 1,
    label: 'the courier pocket tabbed BR-17', art: 'voices.permission', walkThrough: true,
    visibleIf: { all: [coastCopyIs('layout', 'pockets'), coastCopyIs('bench-tab')] },
  },
  {
    id: 'coast-copy-sleeve-receipt', kind: 'sign', x: 21, y: 13, w: 1, h: 1,
    label: 'the two-leaf sleeve at the bench', art: 'voices.paired', walkThrough: true,
    visibleIf: coastCopyIs('received', 'sleeve'), text: coastCopyLayouts.sleeve.receipt,
  },
  {
    id: 'coast-copy-pockets-receipt', kind: 'sign', x: 21, y: 13, w: 1, h: 1,
    label: 'the shared tab on the bench and in the courier pocket', art: 'preserved.catalogue', walkThrough: true,
    visibleIf: coastCopyIs('received', 'pockets'), text: coastCopyLayouts.pockets.receipt,
  },
];
