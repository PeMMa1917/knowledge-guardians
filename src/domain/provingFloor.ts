/**
 * The Proving Floor: a trial section where a wrong step restarts the section
 * (Mika 2026-11-27, decision X-007, docs/audit/DECISIONS.md).
 *
 * Under Emberford's bell tower is the guild's old proving floor. Each section shows three example tiles
 * that follow a hidden rule. The player crosses four rows, stepping on one tile in each row. A tile that
 * breaks the rule cracks, and the section starts again with a new floor. Finished sections stay finished.
 *
 * The failure comes from play: the floor tests the player's guessed rule on new cases. It is never a
 * judgement about a TOK question, and a restart never removes credit, items or saves (OPEN-001).
 * The TOK idea is induction: a rule guessed from a few examples must survive new cases, and more than one
 * rule can fit the same examples. The last section is built so that two rules fit its examples.
 * Pure rules, no DOM.
 */

export const SHAPES = ['circle', 'square', 'triangle'] as const;
export const COLOURS = ['gold', 'blue', 'red'] as const;
export type Shape = typeof SHAPES[number];
export type Colour = typeof COLOURS[number];
export interface Tile { shape: Shape; colour: Colour; count: 1 | 2 | 3 }

export interface Section {
  id: string;
  title: string;
  intro: string;
  examples: Tile[];
  /** The floor's real rule. */
  rule: (t: Tile) => boolean;
  /** Said after a crack, to help without giving the rule away. */
  crack: string;
  /** Said when the section is crossed. */
  crossed: string;
  /** Optional fixed first row, used to test a rival rule that also fits the examples. */
  firstRow?: Tile[];
}

export const ROWS = 4;

export const SECTIONS: readonly Section[] = [
  {
    id: 'gold', title: 'The first span',
    intro: 'Three worn tiles by the door all held a guild apprentice. What do they share? Step only on tiles that share it.',
    examples: [{ shape: 'circle', colour: 'gold', count: 1 }, { shape: 'square', colour: 'gold', count: 2 }, { shape: 'triangle', colour: 'gold', count: 3 }],
    rule: (t) => t.colour === 'gold',
    crack: 'The tile cracks, and the floor resets. Look again at the three tiles by the door. What changes between them, and what never changes?',
    crossed: 'The span holds. Shape changed and number changed, but one thing stayed the same each time.',
  },
  {
    id: 'pairs', title: 'The second span',
    intro: 'New tiles by the second door. Their shapes differ and their colours differ.',
    examples: [{ shape: 'circle', colour: 'gold', count: 2 }, { shape: 'square', colour: 'blue', count: 2 }, { shape: 'triangle', colour: 'red', count: 2 }],
    rule: (t) => t.count === 2,
    crack: 'Crack. The floor resets with new tiles. Something was the same on all three examples. Was it the shape, the colour, or something else?',
    crossed: 'The span holds. The rule was in the number of marks, not in how they looked.',
  },
  {
    id: 'rival', title: 'The last span',
    intro: 'Three tiles by the last door. Look carefully: more than one thing is the same on all of them.',
    examples: [{ shape: 'circle', colour: 'gold', count: 1 }, { shape: 'square', colour: 'gold', count: 1 }, { shape: 'triangle', colour: 'gold', count: 1 }],
    rule: (t) => t.count === 1,
    crack: 'Crack. Every example was gold and every example had one mark. Both rules fit what you saw, and the floor follows only one of them. Only a new case could tell them apart. Now you have that case.',
    crossed: 'The span holds. Two rules fitted the same examples. The new tiles showed which one the floor was really following.',
    // A gold tile with two marks and a blue tile with one mark: each rival rule picks a different tile.
    firstRow: [{ shape: 'square', colour: 'gold', count: 2 }, { shape: 'circle', colour: 'blue', count: 1 }, { shape: 'triangle', colour: 'red', count: 3 }],
  },
];

export const IDEA = 'Guessing a rule from a few examples is induction. The guess has to survive new cases. More than one rule can fit the same examples, and only a new case can tell them apart.';

/** A small seeded random generator, so a floor can be rebuilt the same way in tests. */
export function rng(seed: number): () => number {
  let a = seed >>> 0 || 1;
  return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 2 ** 32; };
}

const ALL: Tile[] = SHAPES.flatMap((shape) => COLOURS.flatMap((colour) => ([1, 2, 3] as const).map((count) => ({ shape, colour, count }))));

/** Build the rows of a section: each row has exactly one tile that follows the rule, in a random place. */
export function buildFloor(section: Section, seed: number): Tile[][] {
  const r = rng(seed);
  const pick = (from: Tile[]) => from[Math.floor(r() * from.length)];
  const good = ALL.filter(section.rule), bad = ALL.filter((t) => !section.rule(t));
  const rows: Tile[][] = [];
  for (let i = 0; i < ROWS; i++) {
    if (i === 0 && section.firstRow) { rows.push(section.firstRow.slice()); continue; }
    const row = [pick(bad), pick(bad)];
    row.splice(Math.floor(r() * 3), 0, pick(good));
    rows.push(row);
  }
  return rows;
}

export interface TrialState {
  /** Index of the current section. Equal to SECTIONS.length when all are crossed. */
  section: number;
  row: number;
  attempt: number;
  /** Cracks so far, for the player's interest. Never a penalty. */
  cracks: number;
  floor: Tile[][];
}

export function startTrial(seed: number): TrialState {
  return { section: 0, row: 0, attempt: 0, cracks: 0, floor: buildFloor(SECTIONS[0], seed) };
}

export type StepResult = 'held' | 'crossed' | 'cracked' | 'finished';

/** Step on tile `index` of the current row. A crack restarts this section only, with a new floor. */
export function step(s: TrialState, index: number, seed: number): { state: TrialState; result: StepResult } {
  const section = SECTIONS[s.section];
  const tile = s.floor[s.row]?.[index];
  if (!section || !tile) return { state: s, result: 'held' };
  if (!section.rule(tile)) {
    const attempt = s.attempt + 1;
    return { state: { ...s, row: 0, attempt, cracks: s.cracks + 1, floor: buildFloor(section, seed + 97 * attempt + 13 * s.section) }, result: 'cracked' };
  }
  if (s.row + 1 < ROWS) return { state: { ...s, row: s.row + 1 }, result: 'held' };
  const next = s.section + 1;
  if (next >= SECTIONS.length) return { state: { ...s, section: next, row: 0 }, result: 'finished' };
  return { state: { ...s, section: next, row: 0, attempt: 0, floor: buildFloor(SECTIONS[next], seed + 1000 * next) }, result: 'crossed' };
}

export function tileWords(t: Tile): string {
  const shape = t.count === 1 ? t.shape : `${t.shape}s`;
  return `${t.count} ${t.colour} ${shape}`;
}
