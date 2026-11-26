import { describe, expect, it } from 'vitest';
import { INCENTIVE_ORDER, INCENTIVE_PARTS, INCENTIVE_POLICIES, INCENTIVE_RECEIPTS, INCENTIVE_SITES,
  checkedParts, incentiveReport, type IncentivePolicy, type IncentiveTrace } from '../src/domain/civicIncentive';
import { check } from '../src/domain/rules';
import { emptyPair, parsePair, serialisePair, writeSuspend } from '../src/domain/saves';
import { CIVIC_STEPS } from '../src/maps/civic';
import { ISLAND_DOCK, ISLAND_WORKSHOP } from '../src/maps/island';
import { Driver } from './driver';

function read(d: Driver, station: IncentiveTrace) {
  const map = INCENTIVE_SITES[station] === ISLAND_WORKSHOP.id ? ISLAND_WORKSHOP : ISLAND_DOCK;
  d.s.mapId = map.id;
  const prop = map.interactables.find((spot) => spot.id === `incentive-${station}`)!;
  expect(check(prop.visibleIf, d.s), station).toBe(true);
  d.run({ type: 'CheckDispatchReceipt', trace: station });
}

function audit(d: Driver, policy: IncentivePolicy) {
  read(d, 'early-workshop');
  read(d, 'early-dock');
  expect(checkedParts(d.s.flags)).toEqual(policy === 'dispatch' ? ['rail-hook', 'bench-hook'] : []);
  d.s.mapId = ISLAND_WORKSHOP.id;
  d.run({ type: 'CallDispatchBell' });
  expect(() => d.run({ type: 'CheckDispatchKit', kit: 'rail' })).toThrow(/matched hook and foot/);
  read(d, 'late-workshop');
  if (policy === 'kits') {
    expect(checkedParts(d.s.flags)).toEqual(INCENTIVE_PARTS.rail);
    read(d, 'late-dock');
  } else {
    expect(check(ISLAND_DOCK.interactables.find((spot) => spot.id === 'incentive-late-dock')?.visibleIf, d.s)).toBe(false);
  }
  d.s.mapId = ISLAND_WORKSHOP.id;
  d.run({ type: 'CheckDispatchKit', kit: 'rail' });
  d.run({ type: 'CheckDispatchKit', kit: 'bench' });
  expect(d.s.flags[`incentive.audited.${policy}`]).toBe(true);
}

describe('Ready by the Bell', () => {
  it('keeps the four matched parts fixed while splitting or grouping the deliveries', () => {
    const manifest = Object.values(INCENTIVE_PARTS).flat().sort();
    for (const policy of INCENTIVE_POLICIES) expect(Object.values(INCENTIVE_RECEIPTS[policy]).flat().sort()).toEqual(manifest);
    expect(incentiveReport('dispatch')).toEqual({ published: 4, earlyParts: 2, earlyKits: 0, totalParts: 4, totalKits: 2 });
    expect(incentiveReport('kits')).toEqual({ published: 2, earlyParts: 0, earlyKits: 0, totalParts: 4, totalKits: 2 });
  });

  it.each(INCENTIVE_POLICIES)('carries the %s order, checks both rounds and can keep either rule', (first) => {
    const d = new Driver();
    d.s.mapId = CIVIC_STEPS.id;
    expect(() => d.run({ type: 'PublishDispatchTarget', policy: first })).toThrow(/main route/);
    d.s.objectivesDone.push('civic.finish');
    d.run({ type: 'PublishDispatchTarget', policy: first });
    expect(d.s.inventory[INCENTIVE_ORDER]).toBe(1);
    expect(d.done('civic.incentive.post')).toBe(true);
    expect(() => d.run({ type: 'PublishDispatchTarget', policy: first })).toThrow(/current handover/);
    const pair = writeSuspend(emptyPair(), { kind: 'suspend', label: 'Dispatch target', location: CIVIC_STEPS.name,
      savedAt: '2026-11-26T06:00:00Z', state: d.s });
    const parsed = parsePair(serialisePair(pair));
    if (!parsed.ok || !parsed.pair.continue) throw new Error('Could not resume the posted target');
    d.s = parsed.pair.continue.state;
    d.s.mapId = ISLAND_WORKSHOP.id;
    expect(() => d.run({ type: 'CallDispatchBell' })).toThrow(/both receiving places/);
    expect(() => d.run({ type: 'CheckDispatchReceipt', trace: 'early-dock' })).toThrow(/receiving rack/);

    audit(d, first);
    expect(d.done('civic.incentive.audit')).toBe(false);
    expect(() => d.run({ type: 'KeepDispatchTarget', policy: first })).toThrow(/both trials/);
    const other = first === 'dispatch' ? 'kits' : 'dispatch';
    d.run({ type: 'PublishDispatchTarget', policy: other });
    expect(checkedParts(d.s.flags)).toEqual([]);
    expect(d.s.inventory[INCENTIVE_ORDER]).toBe(1);
    audit(d, other);
    expect(d.done('civic.incentive.audit')).toBe(true);

    for (const policy of [first, other] as const) {
      d.s.mapId = ISLAND_WORKSHOP.id;
      d.run({ type: 'KeepDispatchTarget', policy });
      const map = policy === 'dispatch' ? ISLAND_DOCK : ISLAND_WORKSHOP;
      const opposite = map === ISLAND_DOCK ? ISLAND_WORKSHOP : ISLAND_DOCK;
      const copy = map.interactables.find((spot) => spot.id === `incentive-kept-${policy}`)!;
      expect(check(copy.visibleIf, d.s)).toBe(true);
      expect(check(opposite.interactables.find((spot) => spot.id.startsWith('incentive-kept-'))?.visibleIf, d.s)).toBe(false);
      expect(d.s.flags['incentive.readback']).toBe(false);
      d.s.mapId = map.id;
      d.run({ type: 'SetFlag', flag: copy.flag!, value: true });
      expect(d.done('civic.incentive.keep')).toBe(true);
    }
    expect(d.p.credit).toEqual({});
    expect(d.s.marks).toBe(0);
  });
});
