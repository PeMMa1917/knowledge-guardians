import { describe, expect, it } from 'vitest';
import { CASES, SOURCES, TERMS, objections, refused } from '../src/domain/patternBook';

describe('The Pattern Book (chapter 10, C-004)', () => {
  it('keeps each people in its own case, each with a source, and no newspaper sources', () => {
    expect(new Set(CASES.map((c) => c.people)).size).toBe(CASES.length);
    const ids = new Set(SOURCES.map((s) => s.id));
    for (const c of CASES) expect(ids.has(c.source), c.id).toBe(true);
    for (const s of SOURCES) expect(s.title).not.toMatch(/news|gazette/i);
  });
  it('lets the weavers answer every term they cannot accept, in their own words', () => {
    for (const t of TERMS) for (const o of t.options.slice(1)) {
      const offer = Object.fromEntries(TERMS.map((x) => [x.id, x.options[0].id]));
      offer[t.id] = o.id;
      expect(objections(offer), `${t.id}.${o.id}`).toHaveLength(1);
    }
    expect(objections({ consent: 'council', credit: 'every', share: 'sale' })).toEqual([]);
    expect(refused({ consent: 'none', credit: 'every', share: 'sale' })).toBe(true);
  });
});
