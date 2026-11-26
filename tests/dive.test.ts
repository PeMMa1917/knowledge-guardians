import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { dailyPrompts, dayKey, diveDepth, judgeDive } from '../src/domain/dive';
import { Driver } from './driver';

const pack = buildPack();
const prompts = pack.divePrompts!, items = pack.diveItems!;

describe('The Deep Dive (spec 59)', () => {
  it('the same seven balanced prompts for everyone on a day', () => {
    const a = dailyPrompts(prompts, '2026-11-26'), b = dailyPrompts(prompts, '2026-11-26');
    expect(a.map((p) => p.id)).toEqual(b.map((p) => p.id));
    expect(a).toHaveLength(7);
    expect(new Set(a.map((p) => p.concept)).size).toBeGreaterThanOrEqual(4);
    expect(new Set(a.map((p) => p.aok)).size).toBeGreaterThanOrEqual(3);
    expect(dayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
  it('a fitting facet goes down; rarer goes deeper; a wrong facet costs nothing', () => {
    const pr = prompts.find((p) => p.tag === 'first-depends')!;
    const santos = items.find((i) => i.id === 'di.person.santos')!;
    expect(judgeDive(pr, santos, 0)).toMatchObject({ ok: true, metres: 10 });
    expect(judgeDive(pr, santos, 1).ok).toBe(false);
  });
  it('only found things can be used, and each prompt is answered once', () => {
    const d = new Driver();
    const day = '2026-11-26';
    const pr = dailyPrompts(prompts, day).find((p) => items.some((i) => i.kind === 'deed' && i.facets.some((f) => f.tag === p.tag)))!;
    const it = items.find((i) => i.kind === 'deed' && i.facets.some((f) => f.tag === pr.tag))!;
    const fi = it.facets.findIndex((f) => f.tag === pr.tag);
    expect(() => d.run({ type: 'DiveAnswer', day, prompt: pr.id, item: it.id, facet: fi })).toThrow(/not found/);
    const flag = 'flag' in it.if ? (it.if as { flag: string }).flag : '';
    d.run({ type: 'SetFlag', flag, value: true });
    d.run({ type: 'DiveAnswer', day, prompt: pr.id, item: it.id, facet: fi });
    expect(diveDepth(prompts, items, d.s.flags, day).answered).toBe(1);
    expect(Number(d.s.flags['dive.best'])).toBeGreaterThan(0);
    expect(() => d.run({ type: 'DiveAnswer', day, prompt: pr.id, item: it.id, facet: fi })).toThrow(/already/);
  });
});
