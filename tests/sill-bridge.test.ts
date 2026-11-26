import { describe, expect, it } from 'vitest';
import { advanceSillClock, SILL_CHECKED, SILL_FERRY_CHECK, SILL_FERRY_RECEIPT, SILL_HANDOVER,
  SILL_PHASES, SILL_PLAN, SILL_RECEIPT, sillClockFlag, sillPhase, sillTrace } from '../src/domain/sillBridge';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { FERRY_SILL_BRIDGE, SILL_BRIDGE, SILL_RECEIVING } from '../src/maps/sillBridge';
import { artKeys } from '../src/ui/illustrations';
import { Driver } from './driver';

const prop = (id: string) => [...SILL_BRIDGE.interactables, ...SILL_RECEIVING.interactables, ...FERRY_SILL_BRIDGE].find((entry) => entry.id === id)!;

describe('The Queue at Sill Bridge', () => {
  it('keeps before, at and after the second ring distinct on the same wheel', () => {
    expect(SILL_PHASES.map(advanceSillClock)).toEqual([1, 2, 3, 3]);
    expect(sillPhase(undefined)).toBe(0);
    expect(sillPhase(9)).toBe(0);
    expect(SILL_PHASES.map((phase) => sillTrace('bridge', phase))).toEqual(['accepted', 'accepted', 'closed', undefined]);
    expect(SILL_PHASES.map((phase) => sillTrace('ferry', phase))).toEqual([undefined, undefined, 'closed', 'accepted']);
  });

  it('has an early branch entrance and usable floor and art at both receiving positions', () => {
    const entrance = MAPS['aethelgard.emberford'].interactables.find(({ id }) => id === 'sill-bridge-entry')!;
    const d = new Driver();
    expect(check(entrance.visibleIf, d.s)).toBe(false);
    d.run({ type: 'Reach', zone: 'emberford' });
    expect(check(entrance.visibleIf, d.s)).toBe(true);
    expect(entrance.to).toEqual({ map: SILL_BRIDGE.id, ...SILL_BRIDGE.spawn });
    const deck = Array.from({ length: 3 }, (_, offset) => SILL_BRIDGE.floor(11 + offset, 8));
    expect(deck).toEqual(['water-bridge', 'water-bridge', 'water-bridge']);
    expect(SILL_BRIDGE.floor(12, 10)).toBeNull();
    expect(SILL_RECEIVING.floor(8, 6)).toBeNull();
    const art = new Set(artKeys());
    for (const entry of [entrance, ...SILL_BRIDGE.interactables, ...SILL_RECEIVING.interactables, ...FERRY_SILL_BRIDGE]) {
      expect(art.has(entry.art!)).toBe(true);
      if (entry.artOpen) expect(art.has(entry.artOpen.key)).toBe(true);
      if (entry.to) expect(MAPS[entry.to.map].floor(entry.to.x, entry.to.y)).toBeTruthy();
    }
  });

  it.each([
    ['deputy', 'Take René’s signature', 'Hand Leïla the claim', 'Clip the checked ferry time to Leïla'],
    ['public', 'Put up a second-turn arrow', 'Hand René the parcel', 'Clip the checked ferry time to René'],
  ] as const)('serves the %s route only through its own passage, matching receipt and independent ferry time', (route, post, take, clip) => {
    const d = new Driver();
    d.run({ type: 'Reach', zone: 'emberford' });
    d.walk('sill.east-peg', ['Swing the return basket']);
    expect(d.e.visibleOptions('sill.west-peg', d.s).map((entry) => entry.option.text)).not.toContainEqual(expect.stringContaining('Hang the practice ticket'));
    d.walk('sill.take-ticket', ['Take a dry practice ticket', 'Lift the translation slip']);
    d.walk('sill.west-peg', ['Hang the practice ticket']);
    const set = (key: string, value: boolean | string | number) => d.run({ type: 'SetFlag', flag: key, value });
    set(sillClockFlag('bridge', 'closed'), 2);
    expect(d.done(SILL_CHECKED)).toBe(false);
    expect(d.e.visibleOptions('sill.access-ledger', d.s).map((entry) => entry.option.text)).not.toContainEqual(expect.stringContaining('Read back both checks'));
    set(sillClockFlag('bridge', 'accepted'), 0);
    expect(d.done(SILL_CHECKED)).toBe(true);
    d.walk('sill.access-ledger', ['Read back both checks', 'Leave this claim']);
    expect(d.s.flags[SILL_PLAN]).toBeUndefined();
    d.walk('sill.access-ledger', ['Read back both checks', post]);
    expect(d.s.flags[SILL_PLAN]).toBe(route);
    const other = route === 'deputy' ? 'public' : 'deputy';
    expect(check(prop(`sill-${route}-door`).visibleIf, d.s)).toBe(true);
    expect(check(prop(`sill-${other}-door`).visibleIf, d.s)).toBe(false);
    expect(check(prop(`sill-${route}-receipt`).visibleIf, d.s)).toBe(false);
    set(prop(`sill-${route}-door`).flag!, true);
    expect(check(prop(`sill-${route}-receipt`).visibleIf, d.s)).toBe(true);
    expect(check(prop(`sill-${other}-receipt`).visibleIf, d.s)).toBe(false);
    d.walk(`sill.receiving.${route}`, ['Leave the receipt']);
    expect(d.done(SILL_HANDOVER)).toBe(false);
    expect(check(prop('sill-ferry-wheel').visibleIf, d.s)).toBe(false);
    d.walk(`sill.receiving.${route}`, [take]);
    expect(d.s.flags[SILL_RECEIPT]).toBe(route);
    expect(d.done(SILL_HANDOVER)).toBe(true);
    expect(check({ item: 'item.sill.claim-slip' }, d.s)).toBe(true);
    d.run({ type: 'Reach', zone: 'ferry' });
    expect(check(prop('sill-ferry-wheel').visibleIf, d.s)).toBe(true);
    set(sillClockFlag('ferry', 'closed'), 2);
    expect(d.done(SILL_FERRY_CHECK)).toBe(false);
    expect(check(prop(`sill-ferry-${route}`).visibleIf, d.s)).toBe(false);
    set(sillClockFlag('ferry', 'accepted'), 3);
    expect(d.done(SILL_FERRY_CHECK)).toBe(true);
    expect(check(prop(`sill-ferry-${route}`).visibleIf, d.s)).toBe(true);
    expect(check(prop(`sill-ferry-${other}`).visibleIf, d.s)).toBe(false);
    d.walk(`sill.ferry.${route}`, [clip]);
    expect(d.s.flags[SILL_FERRY_RECEIPT]).toBe(route);
    expect(d.done('sill.ferry.served')).toBe(true);
    expect(d.s.journal).toContain('j.sill.ferry');
    expect(d.p.credit).toEqual({});
  });
});
