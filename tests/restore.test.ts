import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { conceptXP } from '../src/domain/permanent';
import { peelLayer, restoreWith } from '../src/domain/puzzles';
import { Driver } from './driver';

const pack = buildPack();
const P = 'founders-plaque';
const found = pack.puzzles.find((p) => p.id === P)!;
if (found.type !== 'restore') throw new Error('not a restore puzzle');
const rec = found;
const honest = (m: string) => rec.methods.find((x) => x.id === m)!.labels.findIndex((l) => l.honest);
const dishonest = (m: string) => rec.methods.find((x) => x.id === m)!.labels.findIndex((l) => !l.honest);

function peelAll(d: Driver) { for (let i = 0; i < rec.layers.length; i++) d.run({ type: 'PuzzlePeel', puzzle: P }); }

describe("restorer's trestle (spec IT14 and EV02)", () => {
  it('shows the layers top first, one at a time, and no more than there are', () => {
    expect(peelLayer(rec, 0).text).toMatch(/^Soot/);
    expect(peelLayer(rec, 2).text).toMatch(/EMBERFORD SMITHS/);
    expect(() => peelLayer(rec, rec.layers.length)).toThrow();
  });
  it('asks the player to look under every layer before choosing', () => {
    expect(() => restoreWith(rec, 1, null, 'clean', honest('clean'))).toThrow(/every layer/);
  });
  it('checks only the label: an overclaiming or hiding label explains why', () => {
    const r = restoreWith(rec, 4, null, 'strip', dishonest('strip'));
    expect(r.ok).toBe(false);
    expect(r.text.length).toBeGreaterThan(20);
  });
  it('every method, with its honest label, gives the same credit (no hidden correct answer)', () => {
    const xp = rec.methods.map((m) => {
      const d = new Driver();
      peelAll(d);
      d.run({ type: 'PuzzleRestore', puzzle: P, method: m.id, label: dishonest(m.id) });
      expect(d.s.flags[`puzzle.${P}.method`]).toBeUndefined();
      d.run({ type: 'PuzzleRestore', puzzle: P, method: m.id, label: honest(m.id) });
      expect(d.s.flags[`puzzle.${P}.method`]).toBe(m.id);
      expect(d.s.journal).toContain('j.restore');
      return conceptXP(d.p, pack).responsibility;
    });
    expect(new Set(xp).size).toBe(1);
    expect(xp[0]).toBeGreaterThan(0);
  });
  it('a reversible method can change later; an irreversible one cannot; credit is paid once', () => {
    const d = new Driver();
    peelAll(d);
    d.run({ type: 'PuzzleRestore', puzzle: P, method: 'clean', label: honest('clean') });
    const xp = conceptXP(d.p, pack).responsibility;
    d.run({ type: 'PuzzleRestore', puzzle: P, method: 'strip', label: honest('strip') });
    expect(d.s.flags[`puzzle.${P}.method`]).toBe('strip');
    expect(conceptXP(d.p, pack).responsibility).toBe(xp);
    expect(() => d.run({ type: 'PuzzleRestore', puzzle: P, method: 'window', label: honest('window') })).toThrow(/cannot be undone/);
  });
});
