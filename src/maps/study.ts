/**
 * WORLD-02 Aethelgard: the old Guardian's study, under the Emberford guild hall.
 * Guardian Elsbet Varro kept Emberford before the player. She left ten years ago.
 * The cellar door opens when six lamps on the Lamp Wall are lit again.
 * Every object here is a clue. A keepsake shows a new view of it (src/content/story.json).
 * 20 x 14 tiles. Fictional world.
 */
import type { MapDef, Interactable } from './types';
import { SHELF_ROOM_DOOR } from './shelfRoom';
import { LINKED_STUDY } from './linkedNotes';
import { TIME_ROOM_DOOR, TIME_STUDY_RETURNS } from './timeRoom';

const W = 20, H = 14;

function floor(x: number, y: number): string | null {
  if (x < 1 || x > W - 2 || y < 0 || y > H - 2) return null;
  if (y <= 2) return y === 0 ? 'wall-top' : y === 1 ? 'wall-mid' : 'wall-base';
  if (y === 3) return x === 1 ? 'stone-tl' : x === W - 2 ? 'stone-tr' : 'stone-t';
  if (y === H - 2) return x === 1 ? 'stone-bl' : x === W - 2 ? 'stone-br' : 'stone-b';
  if (x === 1) return 'stone-l';
  if (x === W - 2) return 'stone-r';
  return 'stone-c';
}

/** The letter shows after a pathway (desk, clock, hearth), four keepsake views, or ten objects read closely. */
export const LETTER_IF = { any: [{ flag: 'study.desk', eq: true }, { flag: 'study.clock', eq: true }, { flag: 'study.rubbing', eq: true }, { num: 'study.views', gte: 4 }, { num: 'study.read', gte: 10 }] } as const;

const clue = (id: string, x: number, y: number, label: string, w = 1): Interactable =>
  ({ id: `clue-${id}`, kind: 'clue', clue: id, x, y, w, h: 1, label, art: `clue.${id}` });

export const STUDY: MapDef = {
  id: 'aethelgard.study',
  name: "Emberford: the old Guardian's study",
  world: 'WORLD-02',
  width: W, height: H,
  music: 'music.box',
  ambience: 'study',
  background: 0x15100c,
  floor,
  stamps: [
    { stamp: 'bookshelf', x: 2, y: 0 },
    { stamp: 'bookshelf', x: 10, y: 0 },
    { stamp: 'rug-green', x: 8, y: 8 },
    { stamp: 'plant-tall', x: 18, y: 6 },
    { stamp: 'crates', x: 16, y: 11 },
  ],
  blocks: [[0, 0, 1, H], [W - 1, 0, 1, H], [1, 0, W - 2, 3], [0, H - 1, W, 1]],
  npcs: [],
  interactables: [
    SHELF_ROOM_DOOR,
    ...LINKED_STUDY,
    TIME_ROOM_DOOR,
    ...TIME_STUDY_RETURNS,
    clue('painting', 5, 3, "Elsbet's painting"),
    clue('clock', 7, 3, 'the stopped clock'),
    clue('roundwin', 9, 3, 'the small round window'),
    clue('caseboard', 12, 3, "Elsbet's clue board"),
    clue('floodmark', 14, 3, 'the flood line on the wall'),
    clue('hearth', 16, 3, 'the cold hearth', 2),
    clue('glass', 18, 4, "Elsbet's weather glass"),
    { id: 'clue-letter', kind: 'clue', clue: 'letter', x: 15, y: 5, w: 1, h: 1, label: "Elsbet's letter", art: 'clue.letter', visibleIf: LETTER_IF as never },
    clue('cabinet', 2, 4, 'the music cabinet'),
    clue('slips', 2, 7, 'a drawer of survey slips'),
    clue('bucket', 2, 10, 'an old well bucket'),
    clue('drafts', 4, 9, 'drafts of notices'),
    clue('desk', 6, 6, "Elsbet's desk", 2),
    clue('journal', 8, 6, "Elsbet's journal"),
    clue('cards', 5, 6, 'a box of index cards'),
    clue('oldmap', 11, 7, "Elsbet's map", 2),
    clue('margin', 13, 7, 'a page of margin notes'),
    clue('scales', 11, 10, "Elsbet's balance"),
    clue('jar', 13, 10, 'a jar of paper slips'),
    clue('stove', 16, 8, 'the little stove'),
    clue('corner', 18, 11, 'the dark corner'),
    { id: 'secret-practice-notes', kind: 'secret', secret: 'practice-notes', x: 9, y: 9, w: 1, h: 1, label: 'a lumpy corner of the rug' },
    { id: 'undercroft-hatch', kind: 'door', x: 5, y: 11, w: 1, h: 1, label: 'a hatch in the floor (the records vault)', art: 'cellar-door', flag: 'undercroft.found',
      visibleIf: { flag: 'study.letter', eq: true }, to: { map: 'aethelgard.undercroft', x: 3, y: 5 } },
    { id: 'study-stairs', kind: 'door', x: 9, y: 12, w: 2, h: 1, label: 'the stairs up to Emberford', art: 'study-stairs', to: { map: 'aethelgard.emberford', x: 12, y: 7 } },
  ],
  zones: [{ id: 'study', x: 0, y: 0, w: W, h: H }],
  lights: [
    { x: 7, y: 6.5, r: 46, color: 0xffd98a, flicker: true },
    { x: 17, y: 4, r: 40, color: 0xff9a4a },
    { x: 10, y: 3.5, r: 30, color: 0xbfe8ff },
    { x: 10, y: 12, r: 36, color: 0xffe0a0 },
  ],
  spawn: { x: 9, y: 11 },
};
