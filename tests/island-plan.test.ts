import { describe, expect, it } from 'vitest';
import { islandPlan } from '../src/domain/islandPlan';
import { Driver } from './driver';

describe('Island of Models planning table', () => {
  it.each([
    ['high', 'ridge', 4, 2, 36, 2],
    ['high', 'ferry', 4, 2, 24, 4],
    ['high', 'marsh', 2, 4, 40, 12],
    ['low', 'ridge', 4, 2, 36, 2],
    ['low', 'ferry', 2, 4, 48, 8],
    ['low', 'marsh', 2, 4, 40, 12],
  ])('models the eight-crate order for %s landing and the %s route', (landing, route, capacity, circuits, minutes, crossings) => {
    expect(islandPlan(landing, route)).toEqual({ capacity, circuits, minutes, crossings });
  });

  it('needs the update before running the lower landing and retains high-landing comparisons', () => {
    const d = new Driver();
    const lower = () => d.run({ type: 'RunIslandPlan', route: 'ferry', landing: 'low' });
    expect(lower).toThrow(/planning table/);
    d.s.mapId = 'island.workshop';
    d.run({ type: 'SetFlag', flag: 'island.arrived', value: true });
    expect(lower).toThrow(/lower landing update/);
    d.run({ type: 'RunIslandPlan', route: 'ferry', landing: 'high' });
    d.run({ type: 'SetFlag', flag: 'island.lower.read', value: true });
    lower();
    expect(d.s.flags['island.plan.high.ferry']).toBe(true);
    expect(d.s.flags['island.plan.low.ferry']).toBe(true);
    const completed = d.s;
    lower();
    expect(d.s).toEqual(completed);
  });
});
