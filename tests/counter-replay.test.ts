import { describe, expect, it } from 'vitest';
import { COUNTER_ORDERS, replayCounter } from '../src/domain/counterReplay';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

describe('The watch and relay counters', () => {
  it.each(['forest', 'water'] as const)('keeps the same %s source records after both delivery orders', (which) => {
    const reports = COUNTER_ORDERS.map((order) => replayCounter(which, order, 3));
    const [outbound, returnRun] = reports;
    expect(outbound.deliveries.map(({ courier }) => courier)).not.toEqual(returnRun.deliveries.map(({ courier }) => courier));
    expect(outbound.marks).toEqual(returnRun.marks);
    for (const report of reports) {
      expect(report.deliveries).toHaveLength(3);
      expect(report.deliveries.filter(({ duplicate }) => duplicate)).toHaveLength(1);
      expect(report.marks.some(({ value }) => value === 0)).toBe(true);
      expect(report.marks.some(({ value }) => value === null)).toBe(true);
      expect(report.unique).toBe(2);
    }
  });

  it('accepts the first copy of a source, even when its carrier arrives before the observer', () => {
    const forest = replayCounter('forest', 'return', 1);
    expect(forest.deliveries[0]).toMatchObject({ courier: 'Bridge runner', duplicate: false });
    expect(forest.marks.map(({ value }) => value)).toEqual([null, 1, null]);
    const water = replayCounter('water', 'return', 2);
    expect(water.deliveries[0]).toMatchObject({ courier: 'Council scribe Sena', duplicate: false });
    expect(water.deliveries[1]).toMatchObject({ courier: 'Weirkeeper Omi', duplicate: true });
    expect(water.marks.map(({ value }) => value)).toEqual([0, null, null]);
    expect(replayCounter('water', 'return', 3).marks.map(({ value }) => value)).toEqual([0, 0, null]);
  });
});

function write(d: Driver, flag: string, value: boolean | string = true) {
  d.run({ type: 'SetFlag', flag, value });
}

function object(map: string, id: string) {
  const prop = MAPS[map].interactables.find((it) => it.id === id);
  if (!prop) throw new Error(`Missing ${id} in ${map}`);
  return prop;
}

function read(d: Driver, map: string, id: string) {
  const prop = object(map, id);
  if (!prop.flag || !check(prop.visibleIf, d.s)) throw new Error(`Cannot read ${id}`);
  d.s.mapId = map;
  write(d, prop.flag);
}

function compare(d: Driver, prefix: string) {
  write(d, `${prefix}.trial.outbound`);
  expect(d.done(`${prefix}.compare`)).toBe(false);
  write(d, `${prefix}.trial.return`);
  expect(d.done(`${prefix}.compare`)).toBe(false);
  write(d, `${prefix}.source-view`);
  expect(d.done(`${prefix}.compare`)).toBe(true);
}

describe('Reversible displays in Forest and Water', () => {
  it.each([
    { initial: 'marker', next: 'ledger', startForest: 'forest.trail', nextForest: 'forest.community', startWater: 'water.lower-channel', nextWater: 'water.council' },
    { initial: 'ledger', next: 'marker', startForest: 'forest.community', nextForest: 'forest.trail', startWater: 'water.council', nextWater: 'water.lower-channel' },
  ])('lets the player move the $initial without losing the two observed source records', ({ initial, next, startForest, nextForest, startWater, nextWater }) => {
    const d = new Driver();
    d.s.objectivesDone.push('forest.compare', 'water.arrival');
    const waterBench = object('water.council', 'water-counter-bench');
    expect(check(waterBench.visibleIf, d.s)).toBe(false);
    read(d, 'forest.trail', 'forest-counter-screen-slip');
    read(d, 'forest.trail', 'forest-counter-ridge-slip');
    compare(d, 'forest.counter');
    write(d, 'forest.counter.layout', initial);
    expect(d.done('forest.counter.finish')).toBe(false);
    read(d, startForest, `forest-counter-${initial}`);
    expect(d.done('forest.counter.finish')).toBe(true);
    expect(check(waterBench.visibleIf, d.s)).toBe(true);
    write(d, 'forest.counter.layout', next);
    expect(check(object(startForest, `forest-counter-${initial}`).visibleIf, d.s)).toBe(false);
    read(d, nextForest, `forest-counter-${next}`);
    expect(d.s.flags['forest.counter.seen.marker']).toBe(true);
    expect(d.s.flags['forest.counter.seen.ledger']).toBe(true);

    read(d, 'water.gatehouse', 'water-counter-upper-slip');
    read(d, 'water.lower-channel', 'water-counter-lower-slip');
    compare(d, 'water.counter');
    write(d, 'water.counter.layout', initial);
    expect(d.done('water.counter.finish')).toBe(false);
    read(d, startWater, `water-counter-${initial}`);
    expect(d.done('water.counter.finish')).toBe(true);
    write(d, 'water.counter.layout', next);
    expect(check(object(startWater, `water-counter-${initial}`).visibleIf, d.s)).toBe(false);
    read(d, nextWater, `water-counter-${next}`);
    expect(d.s.flags['water.counter.seen.marker']).toBe(true);
    expect(d.s.flags['water.counter.seen.ledger']).toBe(true);
    expect(d.s.flags['water.counter.trial.outbound']).toBe(true);
    expect(d.s.flags['water.counter.trial.return']).toBe(true);
    expect(d.s.flags['perspective.active']).toBeUndefined();
    expect(d.done('water.finish')).toBe(false);
    expect(d.done('forest.finish')).toBe(false);
  });
});
