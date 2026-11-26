import {
  atReturn, HANDOVER_MODES, readbackText, returnDisplay, SECOND_READING_AVAILABLE, SECOND_READING_CASES,
  SECOND_READING_ROOM, storePosition, storeReady, type ReadingPosition,
} from '../content/secondReading';
import type { Interactable, MapDef } from './types';

const witnessPositions: ReadingPosition[] = ['first', 'second'];

export const SECOND_READING_DOOR: Interactable = {
  id: 'second-reading-door', kind: 'door', x: 4, y: 15, w: 1, h: 1, art: 'preserved.door',
  label: 'the passage to the Second Reading Store', visibleIf: SECOND_READING_AVAILABLE,
  to: { map: SECOND_READING_ROOM, x: 14, y: 28 },
};

const cases = SECOND_READING_CASES.flatMap((entry, index): Interactable[] => {
  const x = 3 + index % 6 * 4;
  const y = 4 + Math.floor(index / 6) * 4;
  const lead = `second-reading-${entry.slug}`;
  return [{
    id: `${lead}-case`, kind: 'exhibit', exhibit: entry.exhibit, label: entry.title,
    x, y, w: 1, h: 1, art: entry.art,
  }, {
    id: `${lead}-bench`, kind: 'scene', label: `the practice stand for ${entry.accession}`, node: `${entry.flag}.bench`,
    x: x + 1, y, w: 1, h: 1, art: 'second-reading.bench', walkThrough: true, visibleIf: storeReady(entry),
    artBy: { flag: `${entry.flag}.position`, keys: { first: 'second-reading.first', second: 'second-reading.second' } },
  }, ...witnessPositions.map((position): Interactable => ({
    id: `${lead}-${position}`, kind: 'sign', label: `the ${position} witness strip for ${entry.accession}`,
    x: x + 1, y: y + 2, w: 1, h: 1, art: `second-reading.${position}`, walkThrough: true,
    text: position === 'first' ? entry.firstReading : entry.secondReading,
    visibleIf: { all: [storeReady(entry), storePosition(entry, position)] }, flag: `${entry.flag}.witness.${position}`, sfx: 'sfx.sparkle',
  }))];
});

export const SECOND_READING_ARCHIVE_PROPS = SECOND_READING_CASES.flatMap((entry): Interactable[] => [{
  id: entry.returnProp, x: 2, y: 8, w: 1, h: 1, kind: 'scene', node: `${entry.flag}.return`,
  label: `Olwen’s return rail for ${entry.accession}`, art: entry.art, visibleIf: atReturn(entry), walkThrough: true,
}, ...HANDOVER_MODES.map((mode): Interactable => ({
  id: `second-reading-${entry.slug}-${mode}`, kind: 'sign',
  label: mode === 'rail' ? `the runner’s public clip for ${entry.accession}` : `the witness table for ${entry.accession}`,
  x: 2, y: mode === 'rail' ? 6 : 10, w: 1, h: 1,
  art: mode === 'rail' ? 'second-reading.rail' : 'second-reading.table', walkThrough: true,
  visibleIf: returnDisplay(entry, mode), flag: `${entry.flag}.received`, sfx: 'sfx.sparkle',
  text: readbackText(entry, mode),
}))]);

const width = 28;
const height = 30;

export const SECOND_READING_STORE: MapDef = {
  id: SECOND_READING_ROOM, world: 'WORLD-16', name: 'Council of Inquiry: The Second Reading Store',
  width, height, background: 0x283145, music: 'music.archive', ambience: 'study', spawn: { x: 14, y: 28 },
  floor: (x, y) => {
    if (x < 1 || x >= width - 1 || y < 0 || y >= height) return null;
    if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
    return y === 27 || x === 14 || x === 13 ? 'council-inlay' : y % 4 === 0 ? 'council-purple' : 'council-blue';
  },
  blocks: [[1, 0, width - 2, 3]], zones: [],
  npcs: [{ id: 'second-reading-linnet', x: 10, y: 27, facing: 'right' }],
  stamps: [
    { stamp: 'window', x: 4, y: 1 }, { stamp: 'window', x: 12, y: 1 }, { stamp: 'window', x: 22, y: 1 },
    { stamp: 'bookshelf', x: 1, y: 1 }, { stamp: 'bookshelf', x: 25, y: 2 },
    { stamp: 'council-bench', x: 3, y: 27 }, { stamp: 'council-bench', x: 21, y: 27 },
  ],
  lights: [
    { x: 6, y: 6, r: 75, color: 0xf1d2a1 }, { x: 19, y: 8, r: 75, color: 0xb7dcf0 },
    { x: 7, y: 15, r: 70, color: 0xc2decf }, { x: 21, y: 16, r: 72, color: 0xf1d2a1 },
    { x: 8, y: 25, r: 68, color: 0xb7dcf0 }, { x: 20, y: 24, r: 68, color: 0xd9cbe1 },
  ],
  interactables: [...cases, {
    id: 'second-reading-return', kind: 'door', x: 14, y: 29, w: 1, h: 1, art: 'preserved.door',
    label: 'the passage back to Time Hall', to: { map: 'council.hall', x: 5, y: 15 },
  }],
};
