import { describe, expect, it } from 'vitest';
import { forestWatch } from '../src/domain/forestWatch';
import { check } from '../src/domain/rules';
import { FOREST_STATION } from '../src/maps/forest';
import { Driver } from './driver';

function displayed(d: Driver, id: string): boolean {
  const prop = FOREST_STATION.interactables.find((entry) => entry.id === `forest-gap-${id}`);
  if (!prop) throw new Error(`Unknown forest reader prop ${id}`);
  return check(prop.visibleIf, d.s);
}

function start() {
  const d = new Driver();
  d.s.mapId = FOREST_STATION.id;
  d.s.objectivesDone.push('forest.finish');
  d.s.flags['forest.watch.ridge.return'] = true;
  d.s.flags['forest.watch.creek.return'] = true;
  return d;
}

describe('The Missing Square', () => {
  it('recovers the view notes independently from the existing clear and blocked beats', () => {
    expect(forestWatch('ridge', 'return')[0]).toBe(0);
    expect(forestWatch('creek', 'return')[1]).toBeNull();
    const initial = new Driver();
    expect(displayed(initial, 'clear')).toBe(false);
    expect(displayed(initial, 'blocked')).toBe(false);
    expect(displayed(initial, 'press')).toBe(false);

    const d = start();
    expect(displayed(d, 'clear')).toBe(true);
    expect(displayed(d, 'blocked')).toBe(true);
    d.walk('forest.gap.register.blocked', ['Clip the report']);
    expect(displayed(d, 'press')).toBe(false);
    d.walk('forest.gap.register.clear', ['Clip the ridge']);
    expect(d.done('forest.gap.o.recover')).toBe(true);
    expect(displayed(d, 'press')).toBe(true);
  });

  it.each([
    ['table', 'Set the two records', 'Put “No count', 'cells'],
    ['table', 'Set the two records', 'Give each row', 'headings'],
    ['slip', 'Make a handover', 'Put “while the view', 'condition'],
    ['slip', 'Make a handover', 'Give the blocked beat', 'lines'],
  ])('revises the %s with %s and %s, and permits a subsequent format change', (format, print, edit, version) => {
    const d = start();
    const credit = { ...d.p.credit };
    d.walk('forest.gap.register.clear', ['Clip the ridge']);
    d.walk('forest.gap.register.blocked', ['Clip the report']);
    d.walk('forest.gap.format', [print]);
    expect(displayed(d, `reader-${format}`)).toBe(true);
    expect(displayed(d, `${format}-${version}`)).toBe(false);
    d.walk(`forest.gap.read.${format}`, [edit]);
    expect(displayed(d, `${format}-${version}`)).toBe(true);
    expect(d.p.moments['moment.forest.gap']).toBeTruthy();

    d.walk('forest.gap.format', [format === 'table' ? 'Make a handover' : 'Set the two records']);
    expect(displayed(d, `${format}-${version}`)).toBe(false);
    d.walk('forest.gap.format', [print]);
    expect(displayed(d, `${format}-${version}`)).toBe(true);
    expect(d.s.flags['forest.watch.ridge.return']).toBe(true);
    expect(d.s.flags['forest.watch.creek.return']).toBe(true);
    expect(d.s.journal.filter((id) => id === 'j.forest.gap')).toHaveLength(1);
    expect(d.p.credit).toEqual(credit);
  });
});
