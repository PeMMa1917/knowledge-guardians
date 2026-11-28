import { describe, expect, it } from 'vitest';
import { FIELDS, LABELS, SOURCES, TOKENS, matches, notKept, returning } from '../src/domain/tokenDrawer';

describe('The Token Drawer (chapter 3, C-004)', () => {
  it('replies to every billet line, and marks the birth name as the line the hospital left off', () => {
    for (const f of FIELDS) expect(f.reply.length, f.id).toBeGreaterThan(30);
    expect(notKept(['number', 'date', 'name'])).toEqual(['name']);
    expect(notKept(['number', 'date', 'clothing'])).toEqual([]);
  });
  it('sends three different parents, and only their own packet opens', () => {
    for (const seed of [0, 1, 2, 5]) {
      const ps = returning(seed);
      expect(new Set(ps.map((p) => p.id)).size).toBe(3);
      for (const p of ps) expect(TOKENS.filter((t) => matches(p, t.id))).toHaveLength(1);
    }
    expect(returning(0).map((p) => p.id)).not.toEqual(returning(1).map((p) => p.id));
  });
  it('gives every token a distinct billet note and a museum source', () => {
    expect(new Set(TOKENS.map((t) => t.billet)).size).toBe(TOKENS.length);
    const ids = new Set(SOURCES.map((s) => s.id));
    for (const t of TOKENS) expect(ids.has(t.source), t.id).toBe(true);
    for (const s of SOURCES) expect(s.title).not.toMatch(/news|gazette/i);
  });
  it('replies to every label; none is marked right', () => {
    for (const l of LABELS) expect(l.reply.length).toBeGreaterThan(60);
  });
});
