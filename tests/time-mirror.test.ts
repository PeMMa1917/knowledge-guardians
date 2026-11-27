import { describe, expect, it } from 'vitest';
import { REWRITE, thenAndNow } from '../src/domain/timeMirror';

describe('The Time Mirror (chapter 15, C-004)', () => {
  it('shows the first and latest entries without repeats', () => {
    expect(thenAndNow(['a', 'b', 'c', 'd', 'e'])).toEqual({ then: ['a', 'b'], now: ['d', 'e'] });
    expect(thenAndNow(['a', 'b', 'c'])).toEqual({ then: ['a', 'b'], now: ['c'] });
    expect(thenAndNow(['a'])).toEqual({ then: ['a'], now: [] });
    expect(thenAndNow([])).toEqual({ then: [], now: [] });
  });
  it('gives every way to rewrite the first entry a reply', () => {
    expect(REWRITE).toHaveLength(3);
    for (const r of REWRITE) expect(r.reply.length).toBeGreaterThan(40);
  });
});
