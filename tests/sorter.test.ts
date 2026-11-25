import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { runSorter, sortFruit } from '../src/domain/puzzles';
import { conceptXP } from '../src/domain/permanent';
import { Driver } from './driver';

const pack = buildPack();
const P = 'brass-sorter';
const found = pack.puzzles.find((p) => p.id === P)!;
if (found.type !== 'sorter') throw new Error('not a sorter');
const rec = found;
const fr = (id: string) => rec.fruits.find((f) => f.id === id)!;

describe('The Brass Sorter (technology: learning from examples)', () => {
  it('a colour with no examples is "unknown"; bruise marks count more than size', () => {
    expect(sortFruit([fr('c-r1')], fr('b4'))).toBe('unknown');
    expect(sortFruit([fr('c-g1'), fr('c-g2')], fr('b6'))).toBe('bruised');
    expect(sortFruit([fr('c-g1'), fr('c-g2')], fr('b5'))).toBe('market');
  });
  it("Mara's red-only examples set aside good fruit from the other two farms", () => {
    const r = runSorter(rec, rec.start);
    expect(r.right).toBeLessThan(r.total);
    expect(r.farmsHurt.sort()).toEqual(['hana', 'hill']);
  });
  it('training needs the diagnosis first, then a representative set, then the reflection', () => {
    const d = new Driver();
    expect(() => d.run({ type: 'PuzzleTrain', puzzle: P, examples: ['c-r1'] })).toThrow(/why/);
    d.run({ type: 'PuzzleDiagnose', puzzle: P, index: rec.diagnose.findIndex((x) => x.honest) });
    d.run({ type: 'PuzzleTrain', puzzle: P, examples: ['c-r1', 'c-r5', 'c-r3', 'c-r4'] });
    expect(d.s.flags[`puzzle.${P}.trained`]).toBeUndefined();
    expect(() => d.run({ type: 'PuzzleTrain', puzzle: P, examples: ['c-r1', 'c-r2', 'c-r3', 'c-r4', 'c-r5', 'c-g1', 'c-g2'] })).toThrow(/only 6/);
    d.run({ type: 'PuzzleTrain', puzzle: P, examples: ['c-r1', 'c-r3', 'c-g1', 'c-g2', 'c-y1', 'c-y2'] });
    expect(d.s.flags[`puzzle.${P}.trained`]).toBeTypeOf('string');
    d.run({ type: 'PuzzleReport', puzzle: P, index: rec.reflect.findIndex((x) => x.honest) });
    expect(d.s.flags[`puzzle.${P}.done`]).toBe(true);
    expect(conceptXP(d.p, pack).power).toBeGreaterThan(0);
  });
});
