import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { framed, judgeFrame } from '../src/domain/puzzles';
import { conceptXP } from '../src/domain/permanent';
import { Driver } from './driver';

const pack = buildPack();
const P = 'painters-frame';
const found = pack.puzzles.find((p) => p.id === P)!;
if (found.type !== 'frame') throw new Error('not a frame puzzle');
const rec = found;

describe("The Painter's Frame (the arts)", () => {
  it('an item is in the frame when its centre is inside', () => {
    expect(framed(rec, 0, 7)).toEqual(expect.arrayContaining(['crowd', 'child', 'stall']));
    expect(framed(rec, 0, 7)).not.toContain('seller');
  });
  it('each person gets a poster; a wrong frame says what is missing or extra', () => {
    expect(judgeFrame(rec, 'guild', 0, 7).ok).toBe(true);
    expect(judgeFrame(rec, 'fund', 17, 2).ok).toBe(true);
    expect(judgeFrame(rec, 'council', 19, 6).ok).toBe(true);
    const bad = judgeFrame(rec, 'guild', 10, 7);
    expect(bad.ok).toBe(false);
    expect(bad.extra).toContain('seller');
    expect(() => judgeFrame(rec, 'guild', 25, 0)).toThrow(/canvas/);
  });
  it('the reflection needs all three posters, then gives perspective credit', () => {
    const d = new Driver();
    const honest = rec.reflect.findIndex((r) => r.honest);
    d.run({ type: 'PuzzleFrame', puzzle: P, brief: 'guild', x: 0, y: 7 });
    expect(() => d.run({ type: 'PuzzleReport', puzzle: P, index: honest })).toThrow(/everyone/);
    d.run({ type: 'PuzzleFrame', puzzle: P, brief: 'fund', x: 17, y: 2 });
    d.run({ type: 'PuzzleFrame', puzzle: P, brief: 'council', x: 19, y: 6 });
    d.run({ type: 'PuzzleReport', puzzle: P, index: honest });
    expect(d.s.flags[`puzzle.${P}.done`]).toBe(true);
    expect(conceptXP(d.p, pack).perspective).toBeGreaterThan(0);
  });
});
