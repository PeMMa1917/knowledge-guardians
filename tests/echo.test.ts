import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { echoDelay, echoDistance, readTimes, timeStats } from '../src/domain/puzzles';
import { conceptXP } from '../src/domain/permanent';
import { Driver } from './driver';

const pack = buildPack();
const P = 'echo-bridge';
const rec = pack.puzzles.find((p) => p.id === P)!;

describe('The Echo Bridge (systematic error)', () => {
  it('works out distance from a there-and-back time', () => {
    expect(echoDelay(rec)).toBeCloseTo(0.4956, 3);
    expect(echoDistance(495.6, 343)).toBeCloseTo(85, 0);
    expect(timeStats([700, 650, 750])).toEqual({ mean: 700, spread: 100 });
    expect(readTimes('700,abc,10,650')).toEqual([700, 650]);
  });
  it('a reaction delay in every time makes every estimate too far; taking it away fixes it', () => {
    const echoes = [700, 690, 720], reacts = [210, 200, 220];
    const first = echoDistance(timeStats(echoes).mean, 343), fixed = echoDistance(timeStats(echoes).mean - timeStats(reacts).mean, 343);
    expect(first).toBeGreaterThan(110);
    expect(Math.abs(fixed - 85)).toBeLessThan(5);
  });
  it('keeps sensible times only, and the reflection opens after three of each', () => {
    const d = new Driver();
    d.run({ type: 'PuzzleTime', puzzle: P, kind: 'echo', ms: 20 });
    expect(d.s.flags[`puzzle.${P}.echo`]).toBeUndefined();
    for (const ms of [700, 690, 720]) d.run({ type: 'PuzzleTime', puzzle: P, kind: 'echo', ms });
    expect(() => d.run({ type: 'PuzzleReport', puzzle: P, index: 2 })).toThrow(/reaction/);
    for (const ms of [210, 200, 220]) d.run({ type: 'PuzzleTime', puzzle: P, kind: 'react', ms });
    if (rec.type !== 'echo') throw new Error('not echo');
    d.run({ type: 'PuzzleReport', puzzle: P, index: rec.reflect.findIndex((r) => r.honest) });
    expect(d.s.flags[`puzzle.${P}.done`]).toBe(true);
    expect(conceptXP(d.p, pack).certainty).toBeGreaterThan(0);
  });
});
