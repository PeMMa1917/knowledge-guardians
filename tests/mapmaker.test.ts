import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { tryMap } from '../src/domain/puzzles';
import { conceptXP } from '../src/domain/permanent';
import { Driver } from './driver';

const pack = buildPack();
const P = 'map-table';
const found = pack.puzzles.find((p) => p.id === P)!;
if (found.type !== 'mapmaker') throw new Error('not a mapmaker');
const rec = found;

describe("The Mapmaker's Table (a model is not the thing)", () => {
  it('a map works when it has what the person needs; extra layers are fine; the sheet has a limit', () => {
    expect(tryMap(rec, 'efua', ['wells', 'slope']).ok).toBe(true);
    expect(tryMap(rec, 'efua', ['wells', 'slope', 'loved']).ok).toBe(true);
    const r = tryMap(rec, 'efua', ['wells', 'roads']);
    expect(r.ok).toBe(false);
    expect(r.missing).toEqual(['slope']);
    expect(() => tryMap(rec, 'efua', ['wells', 'slope', 'roads', 'names'])).toThrow(/three|3/);
  });
  it('a working map says what it left out', () => {
    expect(tryMap(rec, 'kip', ['loved', 'roads']).text).toMatch(/left out: .*wells/);
  });
  it('the reflection opens after every person has a map, and pays once', () => {
    const d = new Driver();
    expect(() => d.run({ type: 'PuzzleReport', puzzle: P, index: 2 })).toThrow(/everyone/);
    for (const a of rec.audiences) d.run({ type: 'PuzzleMap', puzzle: P, audience: a.id, layers: a.need });
    d.run({ type: 'PuzzleReport', puzzle: P, index: rec.reflect.findIndex((r) => r.honest) });
    expect(d.s.flags[`puzzle.${P}.done`]).toBe(true);
    expect(conceptXP(d.p, pack).values).toBeGreaterThan(0);
  });
});
