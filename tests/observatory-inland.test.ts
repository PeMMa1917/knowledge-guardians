import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const keeper = 'coast-fold-keeper';

function visible(d: Driver, ...ids: string[]): string[] {
  return MAPS[d.s.mapId].interactables
    .filter((prop) => ids.includes(prop.id) && check(prop.visibleIf, d.s))
    .map((prop) => prop.id);
}

/** Exercise the flag and destination attached to the actual scene prop. */
function useProp(d: Driver, id: string): void {
  const prop = MAPS[d.s.mapId].interactables.find((item) => item.id === id);
  if (!prop || !check(prop.visibleIf, d.s) || !check(prop.openIf, d.s)) throw new Error(`Cannot use ${id}`);
  if (prop.flag) d.run({ type: 'SetFlag', flag: prop.flag, value: true });
  if (prop.to) {
    d.s.mapId = prop.to.map;
    d.s.pos = { x: prop.to.x, y: prop.to.y };
  }
}

function arrive(): Driver {
  const d = new Driver();
  d.s.objectivesDone.push('preserved.publish');
  d.s.mapId = 'observatory.station';
  d.run({ type: 'SetFlag', flag: 'coast.arrived', value: true });
  useProp(d, 'coast-fold-path');
  return d;
}

function readTallies(d: Driver): void {
  useProp(d, 'coast-fold-stair-log');
  useProp(d, 'coast-fold-cart-log');
}

describe('One Yard, Two Ways', () => {
  it('allows exploration and returning to the headland before any harbour notice', () => {
    const d = arrive();
    expect(d.s.mapId).toBe('observatory.inland');
    d.talk(keeper, 'Where do you count');
    expect(d.s.flags['node.coast.fold.measure']).toBe(true);
    useProp(d, 'coast-fold-stair-log');
    expect(d.e.talkEntry(keeper, d.s)).toBe('coast.fold.hello');
    useProp(d, 'coast-fold-cart-log');
    expect(d.e.talkEntry(keeper, d.s)).toBe('coast.fold.wait');
    expect(visible(d, 'coast-fold-stair', 'coast-fold-cart')).toEqual([]);
    expect(d.e.visibleOptions('coast.fold.plan', d.s).map(({ option }) => option.text))
      .toEqual(['Leave the chalk here for now.']);
    useProp(d, 'coast-fold-return');
    expect(d.s.mapId).toBe('observatory.station');
    expect(d.s.flags['coast.notice']).toBeUndefined();
  });

  it.each(['signal', 'runner'].flatMap((notice) => [
    [notice, 'stair', 'Paint a stair outline', 7, 11] as const,
    [notice, 'cart', 'Draw a wheel', 18, 10] as const,
  ]))('keeps the %s notice and opens the %s handover on its own route',
  (notice, route, choice, x, y) => {
    const d = arrive();
    d.run({ type: 'SetFlag', flag: 'coast.notice', value: notice });
    expect(d.e.talkEntry(keeper, d.s)).toBe('coast.fold.hello');
    readTallies(d);
    useProp(d, 'coast-fold-old-sheet');
    d.talk(keeper, 'Why did two old sheets', 'Clip a slip under each heading');
    expect(d.s.flags['node.coast.fold.old-names']).toBe(true);
    expect(visible(d, 'coast-fold-old-sheet', 'coast-fold-endpoints')).toEqual(['coast-fold-endpoints']);
    expect(d.s.flags['coast.fold.route']).toBeUndefined();

    const originalCredit = { ...d.p.credit };
    d.talk(keeper, choice);
    expect(visible(d, 'coast-fold-stair', 'coast-fold-cart')).toEqual([`coast-fold-${route}`]);
    expect(visible(d, 'coast-fold-stair-board', 'coast-fold-cart-board')).toEqual([`coast-fold-${route}-board`]);
    expect(d.done('coast.fold.handover')).toBe(false);

    useProp(d, 'coast-fold-return');
    useProp(d, 'coast-headland-return');
    expect(visible(d, 'coast-fold-harbour-stair', 'coast-fold-harbour-cart')).toEqual([]);
    useProp(d, 'coast-headland-path');
    useProp(d, 'coast-fold-path');
    useProp(d, `coast-fold-${route}`);
    expect(d.s.mapId).toBe('observatory.harbour');
    expect(d.s.pos).toEqual({ x, y });
    expect(visible(d, 'coast-fold-harbour-stair', 'coast-fold-harbour-cart')).toEqual([`coast-fold-harbour-${route}`]);
    useProp(d, `coast-fold-harbour-${route}`);
    expect(d.done('coast.fold.handover')).toBe(true);
    expect(d.s.journal).toContain('j.coast.fold');
    expect(d.p.credit).toEqual(originalCredit);
    expect(d.s.flags['coast.notice']).toBe(notice);
    expect(d.s.flags['coast.updated']).toBeUndefined();
  });
});
