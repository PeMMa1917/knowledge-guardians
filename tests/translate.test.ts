import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { translateLine, wordCount } from '../src/domain/puzzles';
import { conceptXP } from '../src/domain/permanent';
import { validateContent } from '../src/domain/validate';
import { Driver } from './driver';

const pack = buildPack();
const P = 'ferry-message';
const found = pack.puzzles.find((p) => p.id === P)!;
if (found.type !== 'translate') throw new Error('not a translation');
const rec = found;

describe('The Ferry Message (language)', () => {
  it('counts words, not brackets or punctuation', () => {
    expect(wordCount('From the ferry: (a note) — here.')).toBe(6);
  });
  it('word for word loses every difference; the back-check shows the drift', () => {
    const r = translateLine(rec, [0, 0, 0, 0]);
    expect(r.over).toBe(false);
    expect(r.lost.map((x) => x.id).sort()).toEqual(['carts', 'slow', 'time', 'together']);
    expect(r.back).toContain('Brakk');
    expect(r.back).toContain('Tavu');
  });
  it('long notes do not all fit; several short versions keep everything', () => {
    expect(translateLine(rec, [2, 2, 2, 2]).over).toBe(true);
    for (const picks of [[1, 1, 1, 1], [1, 2, 1, 1], [1, 1, 2, 1], [1, 1, 1, 2]]) {
      const r = translateLine(rec, picks);
      expect(r.over).toBe(false);
      expect(r.lost).toEqual([]);
    }
  });
  it('the delivery needs a full translation first, and gives interpretation credit', () => {
    const d = new Driver();
    const delivery = rec.handoffs.length - 1;
    d.run({ type: 'PuzzleTranslate', puzzle: P, picks: [0, 1, 1, 1] });
    expect(d.s.flags[`puzzle.${P}.last`]).toBe('0,1,1,1');
    expect(() => d.run({ type: 'PuzzleReport', puzzle: P, index: delivery })).toThrow(/keeps every part/);
    expect(() => d.run({ type: 'PuzzleTranslate', puzzle: P, picks: [9, 1, 1, 1] })).toThrow();
    d.run({ type: 'PuzzleTranslate', puzzle: P, picks: [1, 1, 1, 1] });
    for (let index = 0; index < rec.handoffs.length; index++) {
      d.run({type: 'PuzzleReport', puzzle: P, index});
      expect(d.s.flags[`puzzle.${P}.handoff`]).toBe(index);
    }
    expect(d.s.flags[`puzzle.${P}.done`]).toBe(true);
    expect(conceptXP(d.p, pack).interpretation).toBeGreaterThan(0);
  });
  it('the validator wants more than one good translation', () => {
    const bad = { ...pack, puzzles: pack.puzzles.map((p) => (p.id === P && p.type === 'translate' ? { ...p, budget: 28 } : p)) };
    expect(validateContent(bad).join('\n')).toMatch(/two or more translations/);
  });
});
