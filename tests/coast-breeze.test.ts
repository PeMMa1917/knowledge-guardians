import { describe, expect, it } from 'vitest';
import { BREEZE_CHECK, BREEZE_CHECKS, BREEZE_FOLLOW, BREEZE_MOMENTS, BREEZE_PLAN, breezeMoment, breezeReading,
  breezeReceiptFlag, breezeTraceFlag, nextBreezeMoment } from '../src/domain/coastBreeze';
import { check } from '../src/domain/rules';
import { BREEZE_ARCHIVE, BREEZE_HARBOUR, BREEZE_HEADLAND } from '../src/maps/coastBreeze';
import { OBSERVATORY_ARCHIVE, OBSERVATORY_HARBOUR, OBSERVATORY_STATION } from '../src/maps/observatory';
import { artKeys } from '../src/ui/illustrations';
import { Driver } from './driver';

function observe(d: Driver, flag: string) {
  d.run({ type: 'SetFlag', flag, value: true });
}

function arrive(d: Driver) {
  observe(d, 'coast.arrived');
  observe(d, 'coast.detector.checked.wide');
  observe(d, 'coast.detector.checked.amplified');
  d.run({ type: 'SetFlag', flag: 'coast.detector.handoff', value: 'ramp' });
  expect(check(BREEZE_HEADLAND.visibleIf, d.s)).toBe(false);
  observe(d, 'coast.detector.received');
  expect(check(BREEZE_HEADLAND.visibleIf, d.s)).toBe(true);
}

describe('A Second Look at the Step', () => {
  it('keeps the rim and available phase order fixed while location and time produce different exact traces', () => {
    expect(BREEZE_MOMENTS.map(nextBreezeMoment)).toEqual(['gust', 'eased', 'again', 'again']);
    expect(breezeMoment(undefined, 'still')).toBe('still');
    expect(breezeMoment('eased', 'still')).toBe('eased');
    expect(BREEZE_MOMENTS.map((moment) => breezeReading('headland', moment).step)).toEqual([3, 1, 3, 1]);
    expect(BREEZE_MOMENTS.map((moment) => breezeReading('archive', moment).step)).toEqual([3, 3, 3, 3]);
    expect(BREEZE_MOMENTS.map((moment) => breezeReading('harbour', moment))).toEqual(
      BREEZE_MOMENTS.map((moment) => breezeReading('headland', moment)));
    for (const station of ['headland', 'archive', 'harbour'] as const) {
      expect(BREEZE_MOMENTS.map((moment) => breezeReading(station, moment).rim)).toEqual([1, 1, 1, 1]);
    }
  });

  it('puts each stand on a distinct interactive floor tile with a supported receiving picture', () => {
    const art = new Set(artKeys());
    for (const [map, stand] of [[OBSERVATORY_STATION, BREEZE_HEADLAND], [OBSERVATORY_ARCHIVE, BREEZE_ARCHIVE], [OBSERVATORY_HARBOUR, BREEZE_HARBOUR]] as const) {
      expect(map.interactables).toContain(stand);
      expect(map.floor(stand.x, stand.y)).toBeTruthy();
      expect(map.interactables.filter(({ x, y }) => x === stand.x && y === stand.y)).toEqual([stand]);
      expect(art.has(stand.art!)).toBe(true);
      if (stand.artOpen) expect(art.has(stand.artOpen.key)).toBe(true);
    }
  });

  it.each([['archive', 'harbour'], ['harbour', 'archive']] as const)('allows the %s comparison first, surviving a retest and a later %s receipt', (first, other) => {
    const d = new Driver();
    const stand = { archive: BREEZE_ARCHIVE, harbour: BREEZE_HARBOUR };
    expect(check(BREEZE_HEADLAND.visibleIf, d.s)).toBe(false);
    arrive(d);
    const credit = { ...d.p.credit };
    for (const entry of Object.values(stand)) expect(check(entry.visibleIf, d.s)).toBe(false);
    observe(d, breezeTraceFlag('headland', 'still'));
    observe(d, breezeTraceFlag('headland', 'again'));
    expect(d.done(BREEZE_CHECK)).toBe(false);
    observe(d, breezeTraceFlag('headland', 'gust'));
    expect(d.done(BREEZE_CHECK)).toBe(true);
    expect(d.done(BREEZE_FOLLOW)).toBe(false);
    for (const plan of [first, other]) {
      d.run({ type: 'SetFlag', flag: BREEZE_PLAN, value: plan });
      expect(check(stand[plan].visibleIf, d.s)).toBe(true);
      if (plan === first) expect(check(stand[other].visibleIf, d.s)).toBe(false);
      observe(d, breezeTraceFlag(plan, 'still'));
      expect(check(stand[plan].artOpen?.if, d.s)).toBe(false);
      for (const moment of BREEZE_CHECKS[plan]) observe(d, breezeTraceFlag(plan, moment));
      if (plan === first) expect(d.done(BREEZE_FOLLOW)).toBe(false);
      observe(d, breezeReceiptFlag(plan));
      expect(check(stand[plan].artOpen?.if, d.s)).toBe(true);
      expect(d.done(BREEZE_FOLLOW)).toBe(true);
    }
    expect(check(stand[first].visibleIf, d.s)).toBe(true);
    expect(d.s.journal.filter((id) => id === 'j.coast.breeze.follow')).toHaveLength(1);
    expect(d.p.credit).toEqual(credit);
  });
});
