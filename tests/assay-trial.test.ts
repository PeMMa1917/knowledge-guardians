import { describe, expect, it } from 'vitest';
import { ROUNDS, SAMPLES, TRUST, judge, reading, sameKind, tellsApart, type Test } from '../src/domain/assayTrial';

const TESTS: Test[] = ['streak', 'density'];

describe('The Assay Trial (chapter 6, C-004 and X-007)', () => {
  it('uses only known samples, and every round has a wrong-call line for the wrong answer', () => {
    for (const r of ROUNDS) {
      expect(SAMPLES[r.a] && SAMPLES[r.b], `${r.a} ${r.b}`).toBeTruthy();
      expect(judge(r, sameKind(r) ? 'same' : 'different').ok).toBe(true);
      const wrong = judge(r, sameKind(r) ? 'different' : 'same');
      expect(wrong.ok).toBe(false);
      expect(r.wrong[sameKind(r) ? 'different' : 'same']).toBeTruthy();
    }
  });
  it('fools the eye in both directions: different stones that look alike, and one stone that looks different', () => {
    expect(ROUNDS.some((r) => !sameKind(r) && SAMPLES[r.a].look.includes('yellow') && SAMPLES[r.b].look.includes('yellow'))).toBe(true);
    expect(ROUNDS.some((r) => sameKind(r) && SAMPLES[r.a].look !== SAMPLES[r.b].look)).toBe(true);
  });
  it('needs each test somewhere: one round only the streak can settle, one only the density', () => {
    const different = ROUNDS.filter((r) => !sameKind(r));
    for (const only of TESTS) {
      const other = TESTS.find((t) => t !== only)!;
      expect(different.some((r) => tellsApart(r.a, r.b, only) && !tellsApart(r.a, r.b, other)), only).toBe(true);
    }
    for (const r of ROUNDS.filter(sameKind)) for (const t of TESTS) expect(tellsApart(r.a, r.b, t)).toBe(false);
  });
  it('prints a density with its margin, and gives a reply for each answer about trust', () => {
    expect(reading('hematite', 'density')).toMatch(/5\.3 ± 0\.2/);
    expect(reading('gold', 'streak')).toBe('golden yellow');
    expect(new Set(TRUST.map((t) => t.id)).size).toBe(3);
    for (const t of TRUST) expect(t.reply.length).toBeGreaterThan(40);
  });
});
