import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { chordFigure, panes } from '../src/domain/puzzles';
import { conceptXP } from '../src/domain/permanent';
import { Driver } from './driver';

const pack = buildPack();
const P = 'round-window';
const found = pack.puzzles.find((p) => p.id === P)!;
if (found.type !== 'conjecture') throw new Error('not a conjecture');
const rec = found;

describe('The Unfinished Round Window (a pattern is not a proof)', () => {
  it('counts panes: 1, 2, 4, 8, 16, then 31 and 57', () => {
    expect([1, 2, 3, 4, 5, 6, 7].map(panes)).toEqual([1, 2, 4, 8, 16, 31, 57]);
  });
  it('the window is in general position, so 1 + chords + crossings = panes', () => {
    const f = chordFigure(rec.angles);
    expect(f.general).toBe(true);
    expect(1 + f.chords + f.crossings).toBe(31);
    // A regular hexagon is not: three long diagonals meet in the centre (30 panes).
    expect(chordFigure([0, 60, 120, 180, 240, 300]).general).toBe(false);
  });
  it('asks for a prediction before the sixth point, never grades it, then needs a workshop delivery', () => {
    const d = new Driver();
    for (let i = 0; i < 5; i++) d.run({ type: 'PuzzleAddPoint', puzzle: P });
    expect(() => d.run({ type: 'PuzzleAddPoint', puzzle: P })).toThrow(/prediction/);
    expect(() => d.run({ type: 'PuzzleReport', puzzle: P, index: 2 })).toThrow();
    const o = d.run({ type: 'PuzzlePredict', puzzle: P, index: 0 });
    expect(o.events.find((e) => e.kind === 'puzzle')).toMatchObject({ ok: true });
    d.run({ type: 'PuzzleAddPoint', puzzle: P });
    for (let index = 0; index < rec.handoffs.length; index++) {
      d.run({type: 'PuzzleReport', puzzle: P, index});
      expect(d.s.flags[`puzzle.${P}.handoff`]).toBe(index);
    }
    expect(d.s.flags[`puzzle.${P}.done`]).toBe(true);
    expect(conceptXP(d.p, pack).certainty).toBeGreaterThan(0);
  });
});
