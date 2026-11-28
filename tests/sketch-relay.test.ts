import { describe, expect, it } from 'vitest';
import { KEYS, PARTS, PICK, allThrough, harbourReads, reading, relay, type KeyId } from '../src/domain/sketchRelay';

/** Every way to choose PICK marks from the parts. */
function choices(n = PICK, from = PARTS.map((p) => p.id)): string[][] {
  if (n === 0) return [[]];
  return from.flatMap((id, i) => choices(n - 1, from.slice(i + 1)).map((rest) => [id, ...rest]));
}
const best = (keys: KeyId[]) => choices().some((c) => allThrough(relay(c, keys).at(-1)!, keys));

describe('The Sketch Relay (chapter 7, C-004)', () => {
  it('drops the least bold mark at each tower', () => {
    const stages = relay(['lightning', 'arrow', 'cloud', 'boat', 'hand'], []);
    expect(stages.at(-1)).toEqual(['lightning', 'arrow', 'cloud']);
  });
  it('cannot carry the whole message with no key, or with any one key', () => {
    expect(best([])).toBe(false);
    for (const k of KEYS) expect(best([k.id]), k.id).toBe(false);
  });
  it('can carry it with two keys, and the arrow key is one of them', () => {
    const pairs = KEYS.flatMap((a, i) => KEYS.slice(i + 1).map((b) => [a.id, b.id] as KeyId[]));
    const working = pairs.filter(best);
    expect(working.length).toBeGreaterThan(0);
    for (const p of working) expect(p).toContain('arrow');
  });
  it('turns the arrow around when nobody agreed what it means', () => {
    expect(reading(['lightning', 'arrow'], []).west).toBe('reversed');
    expect(harbourReads(['lightning', 'arrow'], [])).toContain('Go east');
    expect(harbourReads([], [])).toMatch(/Nobody/);
  });
});
