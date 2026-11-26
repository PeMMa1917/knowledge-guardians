import { describe, expect, it } from 'vitest';
import { totalXP } from '../src/domain/permanent';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

function find(d: Driver, id: string) {
  const prop = MAPS[d.s.mapId].interactables.find((item) => item.id === id);
  if (!prop) throw new Error(`Missing ${id} in ${d.s.mapId}`);
  return prop;
}

function visit(d: Driver, id: string, ...choices: string[]) {
  const prop = find(d, id);
  if (prop.kind !== 'scene' || !prop.node || !check(prop.visibleIf, d.s)) throw new Error(`Cannot use ${id}`);
  d.walk(prop.node, choices);
}

describe('A Roof and Two Lights', () => {
  it.each([
    { start: 'Pin the stepped roof', other: 'Pin two light dots', place: 'Put both marks by Market Rail', key: 'rail' },
    { start: 'Pin two light dots', other: 'Pin the stepped roof', place: 'Put both marks by the skiff', key: 'skiff' },
  ])('uses the two marks and anchors both to the same landing before placing the $key key',
    ({ start, other, place, key }) => {
      const d = new Driver();
      d.s.mapId = 'sea.chartroom';
      const desk = find(d, 'sea-symbol-desk');
      expect(check(desk.visibleIf, d.s)).toBe(false);
      d.s.objectivesDone.push('sea.finish');
      d.s.flags['sea.followup'] = true;
      d.s.flags['sea.response'] = 'shore';
      const xp = totalXP(d.p);

      visit(d, desk.id, start, 'Clear the mark', start, 'Leave the copy');
      d.s.mapId = 'sea.harbour';
      const frame = find(d, 'sea-symbol-sight-frame');
      expect(check(frame.visibleIf, d.s)).toBe(false);
      expect(d.done('sea.symbol.compared')).toBe(false);

      d.s.mapId = 'sea.chartroom';
      visit(d, desk.id, other, 'Leave the copy');
      d.s.mapId = 'sea.harbour';
      expect(check(frame.visibleIf, d.s)).toBe(true);
      const holder = find(d, 'sea-symbol-key-holder');
      expect(check(holder.visibleIf, d.s)).toBe(false);
      d.run({ type: 'SetFlag', flag: frame.flag!, value: true });
      expect(d.done('sea.symbol.compared')).toBe(true);
      visit(d, holder.id, place);
      expect(d.done('sea.symbol.placed')).toBe(true);

      const keys = MAPS[d.s.mapId].interactables.filter((prop) =>
        prop.kind === 'sign' && prop.id.startsWith('sea-symbol-key-') && check(prop.visibleIf, d.s));
      expect(keys.map(({ id }) => id)).toEqual([`sea-symbol-key-${key}`]);
      expect(d.s.flags['sea.response']).toBe('shore');
      expect(d.s.flags['sea.followup']).toBe(true);
      expect(totalXP(d.p)).toBe(xp);
      expect(d.p.moments['mom.sea-symbol-key']).toBeTruthy();
    });
});
