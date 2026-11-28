/**
 * The Quiet Records Room, off Library Dispatch (chapter 12). Documented records of the study at
 * Tuskegee, Alabama (1932 to 1972), with sources (decision X-005, difficult real history). A content
 * note shows the first time the player comes in (src/content/content-notes.json).
 * Content: src/content/civic-tuskegee.json.
 */
import type { Interactable, MapDef } from './types';

const OPEN = { flagSet: 'civic.response' } as const;

export const QUIET_RECORDS_DOOR: Interactable = {
  id: 'civic-quiet-records-door', kind: 'door', x: 25, y: 4, w: 1, h: 1, label: 'the Quiet Records Room', art: 'preserved.door',
  visibleIf: OPEN, to: { map: 'civic.quiet-records', x: 7, y: 9 },
};

const W = 15;
const H = 12;
const shelf = (key: string, x: number, y: number, label: string, art: string): Interactable =>
  ({ id: `quiet-records-${key}`, kind: 'scene', node: `civic.tuskegee.${key}`, x, y, w: 1, h: 1, label, art, walkThrough: true });

export const QUIET_RECORDS: MapDef = {
  id: 'civic.quiet-records', name: 'Civic Machine: The Quiet Records Room', world: 'WORLD-13',
  width: W, height: H, spawn: { x: 7, y: 9 }, music: 'music.archive', ambience: 'study', background: 0x243a46,
  floor: (x, y) => {
    if (x < 1 || x >= W - 1 || y < 0 || y >= H) return null;
    if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
    return x === 7 ? 'civic-hall-route' : 'civic-hall-tile';
  },
  blocks: [[1, 0, W - 2, 3]], zones: [],
  stamps: [{ stamp: 'window', x: 7, y: 1 }, { stamp: 'bookshelf', x: 2, y: 3 }, { stamp: 'bookshelf', x: 11, y: 3 }],
  lights: [{ x: 7, y: 6, r: 90, color: 0xe8d6b8 }],
  npcs: [],
  interactables: [
    shelf('told', 3, 6, 'the grey folder', 'preserved.folder'),
    shelf('withheld', 7, 5, 'the second folder', 'preserved.folder'),
    shelf('after', 11, 6, 'the box with the list of names', 'preserved.display-records'),
    { id: 'quiet-records-desk', kind: 'scene', node: 'civic.tuskegee.desk', x: 7, y: 7, w: 1, h: 1, walkThrough: true,
      label: 'the blank rule line', art: 'civic.ledger', visibleIf: { not: { flagSet: 'civic.tuskegee.rule' } } },
    { id: 'quiet-records-rule', kind: 'sign', x: 7, y: 7, w: 1, h: 1, label: 'the first rule for records of studies on people', art: 'civic.notice',
      visibleIf: { flagSet: 'civic.tuskegee.rule' },
      text: 'The rule is pinned above the desk, with the three folders named under it as the reason.' },
    // The Survey Bell (chapter 12 field game), after the first rule for study records is written.
    { id: 'field-survey', kind: 'fieldgame', game: 'survey', x: 11, y: 9, w: 1, h: 1, label: 'Ade’s survey bell (The Survey Bell)', art: 'old-sign',
      visibleIf: { flagSet: 'civic.tuskegee.rule' } },
    { id: 'quiet-records-return', kind: 'door', x: 7, y: 11, w: 1, h: 1, art: 'preserved.door',
      label: 'the way back to Library Dispatch', to: { map: 'civic.dispatch', x: 25, y: 5 } },
  ],
};
