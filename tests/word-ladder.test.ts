import { describe, expect, it } from 'vitest';
import {
  APPRENTICES, END, FIFTH, PATTERNS, PREMISES, SCOPES, START, WORDS, checkStep, hasPair, holds, neighbours, testArch, validLadder, vowelCount,
} from '../src/domain/wordLadder';

describe("The Copyists' Ladder", () => {
  it('every word on the list has four letters and a vowel, which the proof needs', () => {
    expect(WORDS.size).toBeGreaterThan(500);
    for (const w of WORDS) {
      expect(w).toMatch(/^[a-z]{4}$/);
      expect(vowelCount(w)).toBeGreaterThan(0);
    }
    expect(WORDS.has(START) && WORDS.has(END)).toBe(true);
  });

  it('checks each step by the rules of the game', () => {
    expect(checkStep('ship', 'shop')).toBe('ok');
    expect(checkStep('ship', 'soop')).toBe('two-changes');
    expect(checkStep('ship', 'shiq')).toBe('not-a-word');
    expect(checkStep('ship', 'ship')).toBe('same');
    expect(checkStep('ship', 'shops')).toBe('length');
    expect(checkStep('shop', 'ship', ['ship'])).toBe('used');
    expect(neighbours('ship')).toContain('shop');
  });

  it('every ladder on the table and in the drawer is legal', () => {
    for (const a of APPRENTICES) expect(validLadder(a.ladder)).toBe(true);
    expect(validLadder(FIFTH.ladder)).toBe(true);
  });

  it('one pattern breaks on the table, one breaks on the old sheet, and one holds everywhere', () => {
    const shop = PATTERNS.find((p) => p.id === 'shop')!;
    const look = PATTERNS.find((p) => p.id === 'look')!;
    const pair = PATTERNS.find((p) => p.id === 'pair')!;
    expect(APPRENTICES.every((a) => holds(shop, a.ladder))).toBe(false);
    expect(APPRENTICES.every((a) => holds(look, a.ladder))).toBe(true);
    expect(holds(look, FIFTH.ladder)).toBe(false);
    expect([...APPRENTICES.map((a) => a.ladder), FIFTH.ladder].every((l) => holds(pair, l) && hasPair(l))).toBe(true);
  });

  it('a ladder where every word has one vowel can never reach dock (the proof, checked by search)', () => {
    const one = [...WORDS].filter((w) => vowelCount(w) === 1);
    const set = new Set(one);
    const seen = new Set([START]);
    const queue = [START];
    while (queue.length) {
      const w = queue.shift()!;
      for (const x of neighbours(w, set)) if (!seen.has(x)) { seen.add(x); queue.push(x); }
    }
    expect(seen.has(END)).toBe(false);
  });

  it('the arch stands only on the three rules, and names a loose stone or a gap', () => {
    expect(testArch(['one', 'vowel', 'ends'])).toEqual({ kind: 'stands' });
    expect(testArch(['one', 'vowel', 'ends', 'seen']).kind).toBe('loose');
    expect(testArch(['one', 'vowel'])).toMatchObject({ kind: 'gap', premise: { id: 'ends' } });
    for (const p of PREMISES) expect(p.needed ? p.gap : p.why).toBeTruthy();
    expect(SCOPES.map((s) => s.id)).toEqual(['some', 'middle']);
  });
});
