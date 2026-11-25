import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { brier, calibration } from '../src/domain/puzzles';
import { conceptXP } from '../src/domain/permanent';
import { Driver } from './driver';

const pack = buildPack();
const P = 'forecast-board';
const found = pack.puzzles.find((p) => p.id === P)!;
if (found.type !== 'forecast') throw new Error('not a forecast puzzle');
const rec = found;

describe('The Forecast Board (certainty)', () => {
  it('scores forecasts: lower is better, a confident miss costs most', () => {
    expect(brier([0.5, 0.5], [true, false])).toBeCloseTo(0.25);
    expect(brier([0.9], [false])).toBeCloseTo(0.81);
    expect(brier([0.7], [false])).toBeCloseTo(0.49);
    expect(calibration([70, 70, 10], [true, false, false])).toEqual([{ p: 10, days: 1, rain: 0 }, { p: 70, days: 2, rain: 1 }]);
  });
  it('the clues help: the almanac beats always 50%, and both kinds of day appear', () => {
    const rained = rec.days.map((d) => d.rain);
    expect(brier(rec.days.map((d) => d.almanac), rained)).toBeLessThan(0.25);
    expect(rec.days.some((d) => d.almanac >= 0.7 && !d.rain)).toBe(true);
  });
  it('every day needs a forecast before the reflection; any forecasts are allowed', () => {
    const d = new Driver();
    const honest = rec.reflect.findIndex((r) => r.honest);
    expect(() => d.run({ type: 'PuzzleForecast', puzzle: P, chance: 42 })).toThrow(/chances/);
    for (let i = 0; i < rec.days.length - 1; i++) d.run({ type: 'PuzzleForecast', puzzle: P, chance: 50 });
    expect(() => d.run({ type: 'PuzzleReport', puzzle: P, index: honest })).toThrow(/every day/);
    d.run({ type: 'PuzzleForecast', puzzle: P, chance: 90 });
    expect(() => d.run({ type: 'PuzzleForecast', puzzle: P, chance: 90 })).toThrow(/already/);
    d.run({ type: 'PuzzleReport', puzzle: P, index: honest });
    expect(d.s.flags[`puzzle.${P}.done`]).toBe(true);
    expect(conceptXP(d.p, pack).certainty).toBeGreaterThan(0);
  });
});
