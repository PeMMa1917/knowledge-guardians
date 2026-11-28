import { describe, expect, it } from 'vitest';
import { CLAIMS, KEEP, OTHERS, TOKENS, clashes, kept, largest, spent } from '../src/domain/valueFair';

describe('The Value Fair (chapter 10, C-004)', () => {
  it('lets the two keepers spend all their tokens and keep different rules', () => {
    for (const o of OTHERS) expect(spent(o.bids), o.who).toBe(TOKENS);
    expect(kept(OTHERS[0].bids)).not.toEqual(kept(OTHERS[1].bids));
  });
  it(`keeps a claim only with at least ${KEEP} tokens`, () => {
    expect(kept({ scale: KEEP, local: KEEP - 1 })).toEqual(['scale']);
  });
  it('names a clash when two kept rules disagree, and finds the largest pile', () => {
    expect(clashes({ scale: 3, local: 3 })).toHaveLength(1);
    expect(clashes({ posted: 5, records: 5 })).toEqual([]);
    expect(largest({ posted: 2, records: 5 })).toBe('records');
    expect(largest({})).toBeNull();
    expect(CLAIMS.length * KEEP).toBeGreaterThan(TOKENS);
  });
});
