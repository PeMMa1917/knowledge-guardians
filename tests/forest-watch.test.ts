import { describe, expect, it } from 'vitest';
import { forestWatch } from '../src/domain/forestWatch';
import { Driver } from './driver';

describe('paired forest watches', () => {
  it('keeps visible crossings, a clear beat with none, and a blocked beat distinct', () => {
    expect(forestWatch('creek', 'early')).toEqual([0, 1, 0]);
    expect(forestWatch('ridge', 'early')).toEqual([1, 2, 0]);
    expect(forestWatch('creek', 'late')).toEqual([1, 0, 2]);
    expect(forestWatch('ridge', 'late')).toEqual([0, 0, 1]);
    expect(forestWatch('creek', 'return')).toEqual([1, null, 1]);
  });

  it('only records a watch on the trail and defers a return watch until a response', () => {
    const d = new Driver();
    expect(() => d.run({ type: 'ObserveForest', site: 'creek', window: 'early' })).toThrow(/forest trail/);
    d.s.mapId = 'forest.trail';
    d.run({ type: 'SetFlag', flag: 'forest.arrived', value: true });
    expect(() => d.run({ type: 'ObserveForest', site: 'creek', window: 'return' })).toThrow(/Agree on the trail response/);
    expect(() => d.run({ type: 'ObserveForest', site: 'toString', window: 'early' })).toThrow(/outside the survey/);
    expect(d.s.flags['forest.watch.creek.return']).toBeUndefined();
  });

  it('records the selected site and watch only, leaving repeats idempotent', () => {
    const d = new Driver();
    d.s.mapId = 'forest.trail';
    d.run({ type: 'SetFlag', flag: 'forest.arrived', value: true });
    d.run({ type: 'ObserveForest', site: 'creek', window: 'early' });
    expect(d.s.flags['forest.watch.creek.early']).toBe(true);
    expect(d.s.flags['forest.watch.ridge.early']).toBeUndefined();
    expect(d.s.flags['forest.watch.creek.late']).toBeUndefined();
    const before = d.s;
    d.run({ type: 'ObserveForest', site: 'creek', window: 'early' });
    expect(d.s).toEqual(before);
  });
});
