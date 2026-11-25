import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { tiltOf, weighRound } from '../src/domain/puzzles';

const pack = buildPack();
const rec = pack.puzzles.find((p) => p.id === 'weigh-house')!;

describe('Weigh-House balance bench', () => {
  it('tilts toward the heavier pan', () => {
    expect(tiltOf(5, 3)).toBe(-1);
    expect(tiltOf(5, 7)).toBe(1);
    expect(tiltOf(5, 5)).toBe(0);
  });
  it('accepts a level beam made with trusted weights only', () => {
    expect(weighRound(rec, 0, 0, ['g5', 'g2']).ok).toBe(true);
    expect(weighRound(rec, 0, 0, ['g5']).text).toMatch(/heavier\. Add/);
    expect(weighRound(rec, 0, 0, ['g5', 'g2', 'g1']).text).toMatch(/Take some off/);
  });
  it("never counts the seller's own weight, even when the pans balance", () => {
    const r = weighRound(rec, 2, 2, ['s5', 'g1']);
    expect(r.ok).toBe(false);
    expect(r.tilt).toBe(0);
    expect(r.text).toMatch(/seller/);
    expect(weighRound(rec, 2, 2, ['g5', 'g1']).solved).toBe(true);
  });
  it('rounds go in order and each weight goes on once', () => {
    expect(() => weighRound(rec, 0, 1, ['g2', 'g3'])).toThrow();
    expect(() => weighRound(rec, 0, 0, ['g5', 'g5'])).toThrow();
  });
});
