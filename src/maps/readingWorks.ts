import {
  READING_ROUTES, READING_WORKS_AVAILABLE, READING_WORKS_CASES, READING_WORKS_LAST, READING_WORKS_RECEIVER,
  readingCompared, readingRoute, readingSent, readingTrial,
} from '../content/readingWorks';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

export const READING_WORKS_DOOR: Interactable = {
  id: 'copies-reading-works-door', kind: 'door', x: 23, y: 8, w: 1, h: 1,
  label: 'the Reading Workroom', art: 'preserved.door',
  visibleIf: READING_WORKS_AVAILABLE, to: { map: 'copies.reading-works', x: 11, y: 13 },
};

export const READING_WORKS_LANDING: Interactable = {
  id: 'copies-reading-works-landing', kind: 'scene', x: 24, y: 8, w: 1, h: 1,
  label: 'the workroom’s low landing board', art: 'board-stand', node: READING_WORKS_RECEIVER,
  walkThrough: true, sfx: 'sfx.page',
  visibleIf: { any: READING_WORKS_CASES.map(readingSent) },
  artBy: {
    flag: READING_WORKS_LAST,
    keys: Object.fromEntries(READING_WORKS_CASES.flatMap((entry) =>
      READING_ROUTES.map((route) => [`${entry.slug}.${route}`, `${entry.art}.${route}`]))),
  },
};

function scene(id: string, x: number, y: number, label: string, art: string, node: string, visibleIf: Condition): Interactable {
  return { id, x, y, w: 1, h: 1, kind: 'scene', label, art, node, walkThrough: true, visibleIf, sfx: 'sfx.page' };
}

function caseProps(entry: (typeof READING_WORKS_CASES)[number], x: number, y: number): Interactable[] {
  return [{
    id: `reading-works-${entry.slug}-exhibit`, kind: 'exhibit', exhibit: entry.exhibit, x, y, w: 1, h: 1,
    label: entry.title, art: entry.art,
  }, ...entry.trials.map((trial, index) => ({
    ...scene(`reading-works-${entry.slug}-trial-${index}`, x + 1 + index, y, trial.label,
      index === 0 ? 'fold.strip' : 'preserved.folder', `${entry.flag}.trial.${index}`, { card: entry.card }),
    artOpen: { key: `${entry.art}.${READING_ROUTES[index]}`, if: readingTrial(entry, index) },
  })),
  scene(`reading-works-${entry.slug}-choose`, x + 3, y, entry.pad, 'board-stand',
    `${entry.flag}.send`, { all: [readingCompared(entry), { not: readingSent(entry) }] }),
  ...READING_ROUTES.map((route) => scene(`reading-works-${entry.slug}-reply-${route}`, x + 3, y,
    `the landing setup for ${entry.accession}`, `${entry.art}.${route}`,
    `${entry.flag}.kept.${route}`, readingRoute(entry, route)))];
}

const perkins = READING_WORKS_CASES.find(({ slug }) => slug === 'perkins-procede')!;
export const READING_WORKS_PERKINS = caseProps(perkins, 12, 4);

export const READING_WORKS: MapDef = {
  id: 'copies.reading-works', name: 'City of Copies: Reading Workroom', world: 'WORLD-08',
  width: 23, height: 17, spawn: { x: 11, y: 13 }, music: 'music.archive', ambience: 'study', background: 0x2c3a48,
  floor: (x, y) => {
    if (x < 1 || x > 21 || y < 0 || y >= 16) return null;
    return y < 3 ? ['wall-top', 'wall-mid', 'wall-base'][y] : 'stone-c';
  },
  blocks: [[0, 0, 23, 3], [0, 0, 1, 17], [22, 0, 1, 17], [0, 16, 23, 1]],
  stamps: [
    { stamp: 'bookshelf', x: 2, y: 1 }, { stamp: 'window', x: 10, y: 1 }, { stamp: 'bookshelf', x: 19, y: 1 },
    { stamp: 'rug-green', x: 11, y: 7 }, { stamp: 'bench', x: 4, y: 13 }, { stamp: 'bench', x: 18, y: 13 },
  ],
  lights: [
    { x: 5, y: 5, r: 63, color: 0x9bd2d3 }, { x: 15, y: 5, r: 68, color: 0xe6d2a2 },
    { x: 5, y: 10, r: 64, color: 0xffcf9c }, { x: 15, y: 10, r: 69, color: 0xb4d3b5 },
    { x: 11, y: 13, r: 70, color: 0xf4d7ad, flicker: true },
  ],
  npcs: [
    { id: 'reading-works-vara', x: 7, y: 13, facing: 'right' },
    { id: 'reading-works-kori', x: 16, y: 13, facing: 'left' },
  ],
  zones: [],
  interactables: [
    ...READING_WORKS_CASES.filter((entry) => entry !== perkins).flatMap((entry, i) =>
      caseProps(entry, 4 + (i % 2) * 10, 5 + 5 * Math.floor(i / 2))),
    { id: 'copies-reading-works-back', kind: 'door', x: 11, y: 15, w: 1, h: 1,
      label: 'the Record Room', art: 'preserved.door', to: { map: 'copies.archive', x: 23, y: 9 } },
  ],
};
