import { describe, expect, it } from 'vitest';
import { DEFAULT_KEYS, PRESETS, actionFor, assignKey, normaliseKeys } from '../src/app/keymap';

describe('key remapping (spec 21.6)', () => {
  it('maps a letter and swaps on a clash, so no key does two jobs', () => {
    const m = assignKey(DEFAULT_KEYS, 'interact', 'd');
    expect(m.interact).toBe('D');
    expect(m.right).toBe('E');
    expect(new Set(Object.values(m)).size).toBe(Object.values(m).length);
  });
  it('ignores keys that are not letters', () => {
    expect(assignKey(DEFAULT_KEYS, 'up', 'ArrowUp')).toBe(DEFAULT_KEYS);
    expect(assignKey(DEFAULT_KEYS, 'up', '1')).toBe(DEFAULT_KEYS);
  });
  it('repairs bad stored maps', () => {
    expect(normaliseKeys(undefined)).toEqual(DEFAULT_KEYS);
    expect(normaliseKeys({ up: 'z' })).toEqual({ ...DEFAULT_KEYS, up: 'Z' });
    expect(normaliseKeys({ up: 'A' })).toEqual(DEFAULT_KEYS); // clash with left
    expect(normaliseKeys({ up: '%' as any })).toEqual(DEFAULT_KEYS);
  });
  it('finds the action for a key, any case', () => {
    expect(actionFor(DEFAULT_KEYS, 'j')).toBe('journal');
    expect(actionFor(DEFAULT_KEYS, 'X')).toBeNull();
  });
  it('every preset is valid', () => {
    for (const p of PRESETS) expect(normaliseKeys(p.keys)).toEqual(p.keys);
  });
});

describe('talk sounds (voice.ts)', () => {
  it('gives each character a stable voice, and plans a short babble', async () => {
    const { voiceFor, blipPlan } = await import('../src/app/voice');
    expect(voiceFor('warden-ise')).toEqual(voiceFor('warden-ise'));
    expect(voiceFor('warden-ise')).not.toEqual(voiceFor('clerk-venn'));
    const plan = blipPlan('Three exhibits, two colleagues, one label to repair. Take your time.', 60);
    expect(plan.length).toBeGreaterThan(5);
    expect(plan.length).toBeLessThanOrEqual(18);
    expect(blipPlan('', 60)).toEqual([]);
  });
});
