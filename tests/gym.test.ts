import { describe, expect, it } from 'vitest';
import {
  BENCH_PROMPTS, BENCH_SIZE, PRACTICE_TITLES, benchStatus, boxCounts, emptyGym, nextCard, normaliseGym, rateCard,
  toggleBenchObject, writeBenchNote, writePlan,
} from '../src/domain/gym';

describe('training gym (decision X-002)', () => {
  it('turns word cards lowest box first and never scores them', () => {
    const order = ['evidence', 'truth', 'bias'];
    let g = emptyGym();
    expect(nextCard(order, g)).toBe('evidence');
    g = rateCard(g, 'evidence', true);
    expect(nextCard(order, g)).toBe('truth');
    g = rateCard(rateCard(g, 'truth', true), 'bias', true);
    expect(boxCounts(order, g)).toEqual({ 1: 0, 2: 3, 3: 0 });
    g = rateCard(g, 'truth', false);
    expect(boxCounts(order, g)[1]).toBe(1);
    expect(g.turned).toBe(4);
  });
  it('does not show the same card twice in a row when another is waiting', () => {
    const g = emptyGym();
    expect(nextCard(['a', 'b'], g, 'a')).toBe('b');
    expect(nextCard(['a'], g, 'a')).toBe('a');
  });
  it('lets the bench hold only three objects that the student found', () => {
    const found = ['c1', 'c2', 'c3', 'c4'];
    let g = emptyGym();
    g = toggleBenchObject(g, 'bench.label', 'not-found', found);
    expect(g.benches['bench.label']).toBeUndefined();
    for (const c of found) g = toggleBenchObject(g, 'bench.label', c, found);
    expect(g.benches['bench.label'].objects).toHaveLength(BENCH_SIZE);
    g = writeBenchNote(g, 'bench.label', 'c1', 'shows', 'A date of receipt');
    g = writeBenchNote(g, 'bench.label', 'c1', 'limit', 'Not when it was made');
    expect(benchStatus(g, 'bench.label')).toBe('3 of 3 objects placed. 1 with both notes.');
    g = toggleBenchObject(g, 'bench.label', 'c1', found);
    expect(g.benches['bench.label'].notes.c1).toBeUndefined();
  });
  it('keeps plans and survives bad stored data', () => {
    const g = writePlan(emptyGym(), 'title.first', 'claim', 'Firsts matter to recorders');
    expect(normaliseGym(JSON.parse(JSON.stringify(g)))).toEqual(g);
    expect(normaliseGym({ boxes: { x: 9 }, turned: -1, benches: { b: { objects: 'no' } } })).toEqual(emptyGym());
    expect(normaliseGym(null)).toEqual(emptyGym());
  });
  it('has original prompts with distinct ids and a nudge each', () => {
    const all = [...BENCH_PROMPTS, ...PRACTICE_TITLES];
    expect(new Set(all.map((p) => p.id)).size).toBe(all.length);
    for (const p of all) expect(p.nudge.length).toBeGreaterThan(20);
  });
});
