import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const naturalist = 'forest-naturalist';
const steward = 'forest-steward';
const station = 'forest.station';
const trail = 'forest.trail';
const community = 'forest.community';
const responses = ['forest-response-quiet', 'forest-response-brief'];

function begin() {
  const d = new Driver();
  expect(d.e.activeMissions(d.s).some((mission) => mission.id === 'KG-CH5-M01')).toBe(false);
  const crossing = MAPS['nexus.archive'].interactables.find((item) => item.to?.map === station)!;
  expect(check(crossing.visibleIf, d.s)).toBe(false);
  d.s.objectivesDone.push('coast.revise');
  expect(check(crossing.visibleIf, d.s)).toBe(true);
  d.s.mapId = crossing.to!.map;
  d.run({ type: 'SetFlag', flag: crossing.flag!, value: true });
  expect(d.done('forest.arrival')).toBe(true);
  return d;
}

function observe(d: Driver) {
  d.s.mapId = trail;
  for (const site of ['creek', 'ridge']) {
    for (const window of ['early', 'late'] as const) d.run({ type: 'ObserveForest', site, window });
  }
}

function readBook(d: Driver, phrasing: string) {
  d.s.mapId = community;
  const book = MAPS[community].interactables.find((item) => item.id === 'forest-pathbook')!;
  expect(check(book.visibleIf, d.s)).toBe(true);
  d.run({ type: 'SetFlag', flag: book.flag!, value: true });
  d.talk(steward, phrasing);
  expect(d.done('forest.account')).toBe(true);
}

function visible(d: Driver, ids: string[]) {
  return MAPS[d.s.mapId].interactables
    .filter((prop) => ids.includes(prop.id) && check(prop.visibleIf, d.s))
    .map((prop) => prop.id);
}

describe('Where the Wings Go', () => {
  it('needs both repeated lookout views, an actual comparison and the crews’ account', () => {
    const d = begin();
    readBook(d, 'Give heard and seen notes');
    expect(d.e.talkEntry(steward, d.s)).toBe('forest.steward.revisit');
    d.s.mapId = trail;
    d.run({ type: 'ObserveForest', site: 'creek', window: 'early' });
    d.run({ type: 'ObserveForest', site: 'creek', window: 'late' });
    d.run({ type: 'ObserveForest', site: 'ridge', window: 'early' });
    expect(d.e.talkEntry(naturalist, d.s)).toBe('forest.station.welcome');
    expect(() => d.run({ type: 'ObserveForest', site: 'creek', window: 'return' })).toThrow(/agree on the trail response/i);
    d.run({ type: 'ObserveForest', site: 'ridge', window: 'late' });
    expect(d.e.talkEntry(naturalist, d.s)).toBe('forest.station.compare');
    expect(d.e.talkEntry(steward, d.s)).toBe('forest.steward.revisit');
    d.s.mapId = station;
    d.talk(naturalist, 'under the same watch');
    expect(d.done('forest.compare')).toBe(true);
    expect(d.e.talkEntry(steward, d.s)).toBe('forest.steward.decide');
  });

  it.each([
    ['quiet', 'under the same watch', 'Keep the crews', 'Keep the creek stop', 'Add the return counts'],
    ['brief', 'early and late marks', 'Give heard and seen', 'Read both lookout notes', 'Brief the bridge readers'],
  ])('%s displays its own response and awards the same credit after a correction',
  (response, organise, phrasing, send, revise) => {
    const d = begin();
    observe(d);
    d.s.mapId = station;
    d.talk(naturalist, organise);
    readBook(d, phrasing);
    expect(visible(d, responses)).toEqual([]);
    d.talk(steward, send);
    expect(d.s.flags['forest.response']).toBe(response);
    expect(visible(d, responses)).toEqual([`forest-response-${response}`]);
    expect(d.e.talkEntry(steward, d.s)).toBe('forest.steward.wait');

    d.s.mapId = trail;
    d.run({ type: 'ObserveForest', site: 'creek', window: 'return' });
    expect(d.done('forest.recheck')).toBe(false);
    d.run({ type: 'ObserveForest', site: 'ridge', window: 'return' });
    expect(d.done('forest.recheck')).toBe(true);
    d.s.mapId = community;
    d.talk(steward, revise);
    expect(d.done('forest.finish')).toBe(true);
    expect(visible(d, ['forest-followup-note'])).toEqual(['forest-followup-note']);
    expect(d.p.credit['credit.forest.publish']).toBe(8);
    expect(d.p.credit['credit.forest.finish']).toBe(8);

    d.talk(steward, 'Bring both notes');
    expect(d.done('forest.access')).toBe(true);
    expect(d.p.moments['mom.forest.access']).toBeTruthy();
    expect(visible(d, ['forest-low-route'])).toEqual(['forest-low-route']);
    expect(d.p.credit['credit.forest.finish']).toBe(8);
  });

  it('keeps the source attribution task available alongside the invented woodland survey', () => {
    const d = begin();
    const offer = () => d.e.visibleOptions(d.e.talkEntry(naturalist, d.s)!, d.s)
      .some(({ option }) => option.next === 'forest.station.history');
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-FOREST-GOMBE' });
    expect(offer()).toBe(false);
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-FOREST-GOMBE-CONTEXT' });
    expect(offer()).toBe(true);
    d.talk(naturalist, 'Gombe team');
    expect(d.done('forest.gombe-credit')).toBe(true);
    expect(d.done('forest.compare')).toBe(false);
    expect(d.done('forest.publish')).toBe(false);
    expect(offer()).toBe(false);
  });
});
