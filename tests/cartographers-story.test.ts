import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const harbour = 'sea.harbour';
const room = 'sea.chartroom';
const shoal = 'sea.shoal';
const cartographer = 'sea-cartographer';
const keeper = 'sea-harbourkeeper';
const responses = ['sea-response-shore', 'sea-response-water'];

function enter() {
  const d = new Driver();
  const crossing = MAPS['nexus.archive'].interactables.find((item) => item.to?.map === harbour)!;
  expect(check(crossing.visibleIf, d.s)).toBe(false);
  expect(d.e.activeMissions(d.s).some((mission) => mission.id === 'KG-CH8-M01')).toBe(false);
  d.s.objectivesDone.push('copies.revise');
  expect(check(crossing.visibleIf, d.s)).toBe(true);
  d.s.mapId = crossing.to!.map;
  d.run({ type: 'SetFlag', flag: crossing.flag!, value: true });
  expect(d.done('sea.arrival')).toBe(true);
  return d;
}

function sign(d: Driver, id: string) {
  const prop = MAPS[d.s.mapId].interactables.find((item) => item.id === id);
  if (!prop?.flag || !check(prop.visibleIf, d.s)) throw new Error(`Unable to read ${id} here`);
  d.run({ type: 'SetFlag', flag: prop.flag, value: true });
}

function visible(d: Driver, ids: string[]) {
  return MAPS[d.s.mapId].interactables
    .filter((prop) => ids.includes(prop.id) && check(prop.visibleIf, d.s))
    .map((prop) => prop.id);
}

describe('Where the Ink Stops', () => {
  it('combines the mapped observations with a separate record of local names and purposes', () => {
    const d = enter();
    d.run({ type: 'ReadSeaChart', chart: 'harbour' });
    expect(() => d.run({ type: 'ReadSeaChart', chart: 'shoal' })).toThrow(/matching survey stand/);
    expect(d.e.talkEntry(cartographer, d.s)).toBe('sea.chart.welcome');
    d.s.mapId = room;
    sign(d, 'sea-routebook');
    d.s.mapId = harbour;
    expect(visible(d, ['sea-reader-note'])).toEqual([]);
    d.talk(keeper, 'Mark the carriers');
    expect(d.done('sea.names')).toBe(true);
    expect(d.e.talkEntry(keeper, d.s)).toBe('sea.harbour.names.wait');
    d.s.mapId = shoal;
    d.run({ type: 'ReadSeaChart', chart: 'shoal' });
    expect(d.done('sea.compare')).toBe(false);
    d.s.mapId = room;
    d.talk(cartographer, 'Set the survey edges');
    expect(d.done('sea.compare')).toBe(true);
    expect(d.e.talkEntry(keeper, d.s)).toBe('sea.harbour.decide');
  });

  it.each([
    ['shore', 'Pin both sheets', 'Mark the carriers', 'Hang the shore plan', 'Mark the rail'],
    ['water', 'Set the survey edges', 'Put the crew’s names', 'Give the shoal chart', 'Mark both survey edges'],
  ])('%s keeps the other audience’s chart and uses reader feedback for an equally credited correction',
  (response, compare, names, publish, revise) => {
    const d = enter();
    d.run({ type: 'ReadSeaChart', chart: 'harbour' });
    d.s.mapId = shoal;
    d.run({ type: 'ReadSeaChart', chart: 'shoal' });
    d.s.mapId = room;
    d.talk(cartographer, compare);
    sign(d, 'sea-routebook');
    d.s.mapId = harbour;
    d.talk(keeper, names);
    expect(visible(d, responses)).toEqual([]);
    d.talk(keeper, publish);
    expect(d.s.flags['sea.response']).toBe(response);
    expect(visible(d, responses)).toEqual([`sea-response-${response}`]);
    expect(d.e.talkEntry(keeper, d.s)).toBe('sea.harbour.wait');

    sign(d, 'sea-reader-note');
    d.talk(keeper, revise);
    expect(d.done('sea.finish')).toBe(true);
    expect(visible(d, ['sea-followup-notice'])).toEqual(['sea-followup-notice']);
    expect(d.p.credit['credit.sea.publish']).toBe(8);
    expect(d.p.credit['credit.sea.finish']).toBe(8);

    d.talk(keeper, 'Leave a wider key');
    expect(d.done('sea.access')).toBe(true);
    expect(visible(d, ['sea-wide-key'])).toEqual(['sea-wide-key']);
    expect(d.p.credit['credit.sea.finish']).toBe(8);
  });
});
