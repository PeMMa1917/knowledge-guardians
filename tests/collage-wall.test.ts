import { describe, expect, it } from 'vitest';
import { ALL_PAIRS, ASKS, CARDS, JOINS_TO_STEP_BACK, SOURCES, join, joinKey } from '../src/domain/collageWall';

describe('The Collage Wall (chapter 13, C-004)', () => {
  it('has a join for every pair of cards, the same in either order', () => {
    expect(ALL_PAIRS).toHaveLength(6);
    for (const [a, b] of ALL_PAIRS) {
      expect(join(a, b), joinKey(a, b)).toBeTruthy();
      expect(join(b, a)).toBe(join(a, b));
    }
    expect(join('poem', 'poem')).toBeNull();
    expect(JOINS_TO_STEP_BACK).toBeLessThanOrEqual(ALL_PAIRS.length);
  });
  it('gives every card a source, and no source title names a newspaper', () => {
    const ids = new Set(SOURCES.map((s) => s.id));
    for (const c of CARDS) expect(ids.has(c.source), c.id).toBe(true);
    for (const s of SOURCES) {
      expect(s.url).toMatch(/^https:\/\//);
      expect(s.title).not.toMatch(/news|gazette/i);
    }
  });
  it('replies to every answer, including none of them', () => {
    expect(ASKS.map((a) => a.id)).toEqual([...CARDS.map((c) => c.id), 'none']);
    for (const a of ASKS) expect(a.reply.length).toBeGreaterThan(60);
  });
});
