import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { shepardParts } from '../src/domain/puzzles';
import { conceptXP } from '../src/domain/permanent';
import { Driver } from './driver';

const pack = buildPack();
const P = 'bell-stair';
const found = pack.puzzles.find((p) => p.id === P)!;
if (found.type !== 'shepard') throw new Error('not a shepard puzzle');
const rec = found;

describe('The Endless Bell Stair (perception)', () => {
  it('every step is higher, but the last step has the notes of the first', () => {
    const a = shepardParts(0, 12, 55, 7), b = shepardParts(1, 12, 55, 7);
    b.forEach((p, k) => expect(p.f).toBeGreaterThan(a[k].f));
    expect(shepardParts(12, 12, 55, 7)).toEqual(a);
    // Loud in the middle, quiet at both ends.
    expect(a[3].amp).toBeGreaterThan(a[0].amp);
    expect(a[3].amp).toBeGreaterThan(a[6].amp);
  });
  it('listen, say what you heard, compare, then reflect', () => {
    const d = new Driver();
    const honest = rec.reflect.findIndex((r) => r.honest);
    expect(() => d.run({ type: 'PuzzleListen', puzzle: P, action: 'guess', index: 0 })).toThrow(/Listen/);
    d.run({ type: 'PuzzleListen', puzzle: P, action: 'play' });
    expect(() => d.run({ type: 'PuzzleListen', puzzle: P, action: 'compare' })).toThrow(/heard/);
    d.run({ type: 'PuzzleListen', puzzle: P, action: 'guess', index: 2 });
    expect(() => d.run({ type: 'PuzzleReport', puzzle: P, index: honest })).toThrow(/tuning glass/);
    d.run({ type: 'PuzzleListen', puzzle: P, action: 'compare' });
    d.run({ type: 'PuzzleReport', puzzle: P, index: honest });
    expect(d.s.flags[`puzzle.${P}.done`]).toBe(true);
    expect(conceptXP(d.p, pack).evidence).toBeGreaterThan(0);
  });
});
