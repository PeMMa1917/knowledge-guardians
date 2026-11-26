import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const archive = 'copies.archive';
const press = 'copies.press';
const landing = 'copies.landing';
const printer = 'copies-presskeeper';
const keeper = 'copies-lendingkeeper';
const responseProps = ['copies-response-reprint', 'copies-response-strip'];

function enter() {
  const d = new Driver();
  const crossing = MAPS['nexus.archive'].interactables.find((item) => item.to?.map === archive)!;
  expect(check(crossing.visibleIf, d.s)).toBe(false);
  expect(d.e.activeMissions(d.s).some((mission) => mission.id === 'KG-CH7-M01')).toBe(false);
  d.s.objectivesDone.push('metal.finish');
  expect(check(crossing.visibleIf, d.s)).toBe(true);
  d.s.mapId = crossing.to!.map;
  d.run({ type: 'SetFlag', flag: crossing.flag!, value: true });
  expect(d.done('copies.arrival')).toBe(true);
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

describe('The Missing Tuesday', () => {
  it('requires both edition comparisons and an independently traced delivery route', () => {
    const d = enter();
    sign(d, 'copies-route-book');
    d.s.mapId = press;
    d.run({ type: 'CompareCopy', edition: 'press' });
    expect(d.e.talkEntry(printer, d.s)).toBe('copies.press.welcome');
    d.s.mapId = landing;
    expect(visible(d, ['copies-reader-note'])).toEqual([]);
    d.talk(keeper, 'Mark where the runners');
    expect(d.done('copies.trace')).toBe(true);
    expect(d.e.talkEntry(keeper, d.s)).toBe('copies.lending.trace.wait');
    d.run({ type: 'CompareCopy', edition: 'landing' });
    expect(d.done('copies.compare')).toBe(false);
    expect(d.e.talkEntry(printer, d.s)).toBe('copies.press.compare');
    d.s.mapId = press;
    d.talk(printer, 'Pin the missing time');
    expect(d.done('copies.compare')).toBe(true);
    expect(d.e.talkEntry(keeper, d.s)).toBe('copies.lending.decide');
  });

  it.each([
    ['reprint', 'Keep the three sheets', 'Mark on the route book', 'Hang a full reprint', 'Give the entry rule'],
    ['strip', 'Pin the missing time', 'Mark where the runners', 'Send correction strips', 'Ask the runners to put a separate entry line'],
  ])('%s reaches its own audience and has the same later revision credit',
  (response, align, trace, send, revise) => {
    const d = enter();
    sign(d, 'copies-route-book');
    d.s.mapId = landing;
    d.run({ type: 'CompareCopy', edition: 'landing' });
    d.s.mapId = press;
    d.run({ type: 'CompareCopy', edition: 'press' });
    d.talk(printer, align);
    d.s.mapId = landing;
    d.talk(keeper, trace);
    expect(visible(d, responseProps)).toEqual([]);
    d.talk(keeper, send);
    expect(d.s.flags['copies.response']).toBe(response);
    expect(visible(d, responseProps)).toEqual([`copies-response-${response}`]);
    expect(d.e.talkEntry(keeper, d.s)).toBe('copies.lending.wait');
    expect(visible(d, ['copies-followup-notice'])).toEqual([]);

    sign(d, 'copies-reader-note');
    d.talk(keeper, revise);
    expect(d.done('copies.revise')).toBe(true);
    expect(visible(d, ['copies-followup-notice'])).toEqual(['copies-followup-notice']);
    expect(d.p.credit['credit.copies.publish']).toBe(8);
    expect(d.p.credit['credit.copies.revise']).toBe(8);
    expect(d.p.moments['mom.copies.revise']).toBeTruthy();

    d.talk(keeper, 'Put a larger copy');
    expect(d.done('copies.access')).toBe(true);
    expect(visible(d, ['copies-readable'])).toEqual(['copies-readable']);
    expect(d.p.credit['credit.copies.revise']).toBe(8);
  });
});
