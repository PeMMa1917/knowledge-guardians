import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const linked = (flag: string): Condition => ({ flag: `linked.${flag}`, eq: true });
const nearWren: Condition = { objective: 'voices.arrival' };

function scene(id: string, x: number, y: number, label: string, art: string, visibleIf?: Condition): Interactable {
  return { id: id.replaceAll('.', '-'), kind: 'scene', node: id, x, y, w: 1, h: 1, walkThrough: true, label, art, visibleIf };
}

export const LINKED_STUDY: Interactable[] = [
  scene('linked.study.issue', 4, 5, 'the straightedge’s dated issue slip', 'preserved.catalogue'),
  scene('linked.study.trace', 14, 8, 'the nick in the old press guide', 'preserved.slip'),
  { id: 'linked-study-folio', kind: 'fieldgame', game: 'linked-study-folio', x: 6, y: 10, w: 1, h: 1,
    label: 'the two-slot field folio', art: 'preserved.folder', walkThrough: true,
    artOpen: { key: 'preserved.display-paired', if: linked('study.bound') } },
];

export const LINKED_LISTENING: Interactable[] = [
  scene('linked.voices.local', 4, 8, 'Wren’s spare reference tabs', 'preserved.slip', nearWren),
  { id: 'linked-voices-bench', kind: 'fieldgame', game: 'linked-voices-bench', x: 5, y: 10, w: 1, h: 1,
    label: 'Wren’s filing bench', art: 'preserved.folder', walkThrough: true, visibleIf: nearWren,
    artOpen: { key: 'preserved.display-paired', if: linked('voices.indexed') } },
  scene('linked.voices.date', 9, 5, 'the marked Rainbell issue drawer', 'preserved.catalogue', linked('voices.search.date')),
  scene('linked.voices.subject', 23, 12, 'the marked press-work rack', 'forest.field-diagram', linked('voices.search.subject')),
  scene('linked.voices.open', 23, 14, 'the straightedge in the working tray', 'linked-note.ruler',
    { all: [{ objective: 'linked.voices.indexed' }, { flag: 'linked.voices.layout', eq: 'open' }] }),
  scene('linked.voices.keeper', 8, 14, 'the straightedge in Wren’s cradle', 'linked-note.cradle',
    { all: [{ objective: 'linked.voices.indexed' }, { flag: 'linked.voices.layout', eq: 'keeper' }] }),
];
