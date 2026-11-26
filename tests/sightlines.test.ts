import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { judgeSight, sightBlock } from '../src/domain/puzzles';
import { conceptXP } from '../src/domain/permanent';
import { Driver } from './driver';

const pack = buildPack();
const P = 'tipped-cart';
const found = pack.puzzles.find((p) => p.id === P)!;
if (found.type !== 'sightlines') throw new Error('not sightlines');
const rec = found;
const could = (w: string, i: number) => {
  const wi = rec.witnesses.find((x) => x.id === w)!; const sp = rec.spots.find((s) => s.id === wi.claims[i].spot)!;
  return !sightBlock(rec.blocks, wi.x, wi.y, sp.x, sp.y);
};

describe('The Tipped Cart (sightlines)', () => {
  it('a block between two cells stops the view; an open line does not', () => {
    const b = [{ x: 2, y: 0, w: 1, h: 1, label: 'A wall', kind: 'crates' as const }];
    expect(sightBlock(b, 0, 0, 4, 0)?.label).toBe('A wall');
    expect(sightBlock(b, 0, 1, 4, 1)).toBeNull();
  });
  it('the map decides; a wrong sort asks the player to look again', () => {
    const r = judgeSight(rec, 'hana', 1, true);
    expect(could('hana', 1)).toBe(false);
    expect(r.ok).toBe(false);
    expect(r.text).toMatch(/Look again/);
    expect(judgeSight(rec, 'hana', 1, false).text).toMatch(/one source/);
  });
  it('the report opens only after every claim is sorted, and only the fair report finishes it', () => {
    const d = new Driver();
    expect(() => d.run({ type: 'PuzzleReport', puzzle: P, index: 1 })).toThrow(/Sort every claim/);
    for (const w of rec.witnesses) w.claims.forEach((_, i) => d.run({ type: 'PuzzleSight', puzzle: P, witness: w.id, claim: i, saw: could(w.id, i) }));
    const bad = rec.reports.findIndex((r) => !r.honest), good = rec.reports.findIndex((r) => r.honest);
    d.run({ type: 'PuzzleReport', puzzle: P, index: bad });
    expect(d.s.flags[`puzzle.${P}.done`]).toBeUndefined();
    d.run({ type: 'PuzzleReport', puzzle: P, index: good });
    expect(d.s.flags[`puzzle.${P}.done`]).toBe(true);
    expect(conceptXP(d.p, pack).perspective).toBeGreaterThan(0);
    expect(d.s.journal).toContain('j.sight');
  });
});
