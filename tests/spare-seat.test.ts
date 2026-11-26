import { expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { CIVIC_SPARE_SEAT, NILE_SPARE_SEAT } from '../src/maps/spareSeat';
import { Driver } from './driver';

const prefix = 'spare-seat.';
const warrant = 'item.spare-seat.warrant';
const props = [...NILE_SPARE_SEAT, ...CIVIC_SPARE_SEAT];

function prop(name: string) {
  return props.find((item) => item.id === prefix + name)!;
}

function visible(d: Driver, name: string) {
  return check(prop(name).visibleIf, d.s);
}

function interact(d: Driver, name: string, pick?: string) {
  const item = prop(name);
  expect(visible(d, name), name).toBe(true);
  if (item.node) d.walk(item.node, pick ? [pick] : []);
  if (item.flag) d.run({ type: 'SetFlag', flag: item.flag, value: true });
  return item.text;
}

it('keeps the two tests distinct, and opens neither the rule nor the referral from a token alone', () => {
  const d = new Driver();
  expect(visible(d, 'stand')).toBe(false);
  d.run({ type: 'SetFlag', flag: 'nile.arrived', value: true });
  d.run({ type: 'SetFlag', flag: 'civic.arrived', value: true });
  interact(d, 'stand', 'yesterday');
  expect(interact(d, 'peg')).toContain('closed loan');
  expect(visible(d, 'request')).toBe(false);
  expect(visible(d, 'post')).toBe(false);
  interact(d, 'stand', 'current request');
  expect(visible(d, 'peg')).toBe(false);
  expect(interact(d, 'request')).toContain('today’s date');
  expect(d.done(prefix + 'counterexamples')).toBe(true);
  interact(d, 'post', 'Leave the draft open');
  for (const locked of ['public', 'staffed', 'carry', 'transfer-public', 'transfer-staffed', 'desk']) {
    expect(visible(d, locked), locked).toBe(false);
  }
  expect(d.done(prefix + 'loan')).toBe(false);
});

it.each([
  ['public', 'rail for checked', 'goes back to work', 'leave', 'Keep the first', 'goes home without'],
  ['public', 'rail for checked', 'goes back to work', 'move', 'Move the stop', 'collects the large-print copy'],
  ['staffed', 'Seat the keeper', 'saves the next handback', 'leave', 'Keep the first', 'goes home without'],
  ['staffed', 'Seat the keeper', 'saves the next handback', 'move', 'Move the stop', 'collects the large-print copy'],
])('carries the %s warrant (%s) to a separate service decision', (rule, rulePick, earlyResult, plan, planPick, lateResult) => {
  const d = new Driver();
  d.run({ type: 'SetFlag', flag: 'nile.arrived', value: true });
  interact(d, 'stand', 'current request');
  interact(d, 'request');
  interact(d, 'stand', 'yesterday');
  interact(d, 'peg');
  interact(d, 'post', rulePick);
  expect(visible(d, 'carry')).toBe(false);
  expect(d.done(prefix + 'loan')).toBe(false);
  expect(interact(d, rule)).toContain(earlyResult);
  expect(d.done(prefix + 'loan')).toBe(true);
  expect(visible(d, rule === 'public' ? 'staffed' : 'public')).toBe(false);
  interact(d, 'carry', 'Take the checked');
  expect(d.s.inventory[warrant]).toBe(1);
  expect(visible(d, 'carry')).toBe(false);
  expect(visible(d, 'transfer-' + rule)).toBe(false);
  d.run({ type: 'SetFlag', flag: 'civic.arrived', value: true });
  expect(interact(d, 'transfer-' + rule)).toContain(rule === 'public' ? 'outside the rail' : 'signed request already');
  expect(interact(d, 'steps-check')).toContain('has steps');
  expect(visible(d, 'desk')).toBe(false);
  expect(interact(d, 'rail-check')).toContain('return at the second bell');
  expect(d.done(prefix + 'approaches')).toBe(true);
  interact(d, 'desk', 'Leave the service sheet');
  expect(visible(d, 'desk')).toBe(true);
  expect(visible(d, plan)).toBe(false);
  interact(d, 'desk', planPick);
  expect(d.done(prefix + 'service')).toBe(false);
  expect(interact(d, plan)).toContain(lateResult);
  expect(d.done(prefix + 'service')).toBe(true);
  expect(visible(d, plan === 'leave' ? 'move' : 'leave')).toBe(false);
});

it('does not duplicate any host location outside the planned swapped states', () => {
  for (const [id, stations] of [
    ['nile.route', NILE_SPARE_SEAT],
    ['civic.canal', CIVIC_SPARE_SEAT],
  ] as const) {
    const map = MAPS[id];
    for (const station of stations) {
      expect(map.floor(station.x, station.y)).toBeTruthy();
      expect(map.interactables.filter((candidate) =>
        !candidate.id.startsWith(prefix) && candidate.x === station.x && candidate.y === station.y,
      ), station.id).toEqual([]);
    }
  }
});
