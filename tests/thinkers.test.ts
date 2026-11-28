import { describe, expect, it } from 'vitest';
import { THINKERS, VIEWS, adviceLabel, meetFlags, thinkersFor, viewFlag, viewsMet } from '../src/domain/thinkers';

describe('thinkers and named views (decisions X-012, X-015)', () => {
  it('names views of truth and of ethics, each held by at least one thinker', () => {
    expect(VIEWS.filter((v) => v.family === 'truth').length).toBeGreaterThanOrEqual(3);
    expect(VIEWS.filter((v) => v.family === 'ethics').length).toBeGreaterThanOrEqual(4);
    for (const v of VIEWS) expect(thinkersFor(v.id).length, v.id).toBeGreaterThan(0);
  });
  it('gives each thinker a source, a summary and advice for every view they hold', () => {
    const ids = new Set(VIEWS.map((v) => v.id));
    for (const t of THINKERS) {
      expect(t.source.title.length, t.id).toBeGreaterThan(5);
      if (t.source.url) expect(t.source.url).toMatch(/^https:\/\//);
      expect(t.summary.length, t.id).toBeGreaterThan(40);
      for (const v of t.views) { expect(ids.has(v), `${t.id} ${v}`).toBe(true); expect(t.advice[v], `${t.id} ${v}`).toBeTruthy(); }
    }
  });
  it('includes Mika\'s examples and thinkers from more than one tradition', () => {
    const names = THINKERS.map((t) => t.id);
    for (const id of ['aristotle', 'russell', 'spinoza', 'hegel']) expect(names).toContain(id);
    expect(names).toEqual(expect.arrayContaining(['mozi', 'confucius', 'tutu']));
  });
  it('tracks the views a student meets and labels advice as imagined', () => {
    const mozi = THINKERS.find((t) => t.id === 'mozi')!;
    const flags = Object.fromEntries(meetFlags(mozi).map((f) => [f, true]));
    expect(viewsMet(flags).map((v) => v.id)).toEqual(['pragmatic', 'consequences']);
    expect(flags[viewFlag('virtue')]).toBeUndefined();
    expect(adviceLabel(mozi)).toMatch(/^Imagined advice/);
  });
});
