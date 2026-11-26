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

describe('The Creek Keeps Its Own Time', () => {
  function prop(d: Driver, id: string) {
    const item = MAPS[d.s.mapId].interactables.find((i) => i.id === id);
    if (!item || !check(item.visibleIf, d.s)) throw new Error(`Missing ${id} in ${d.s.mapId}`);
    return item;
  }

  function visit(d: Driver, id: string): boolean {
    const item = prop(d, id);
    if (!item.to || !check(item.openIf, d.s)) return false;
    if (item.flag) d.run({ type: 'SetFlag', flag: item.flag, value: true });
    d.s.mapId = item.to.map;
    d.s.pos = { x: item.to.x, y: item.to.y };
    return true;
  }

  function use(d: Driver, id: string, ...choices: string[]) {
    const item = prop(d, id);
    if (!item.node) throw new Error(`${id} has no scene`);
    d.walk(item.node, choices);
  }

  it.each([
    { route: 'rail', alternate: 'bend', choice: 'Unfold the north rail', east: { x: 18, y: 4 }, west: { x: 12, y: 3 }, art: 'forest.guide-rail' },
    { route: 'bend', alternate: 'rail', choice: 'Fit the wind screen', east: { x: 19, y: 17 }, west: { x: 12, y: 17 }, art: 'forest.screen' },
  ])('opens only the $route shortcut from either bank and leaves the main connections usable',
    ({ route, alternate, choice, east, west, art }) => {
      const d = begin();
      expect(visit(d, 'forest-trail-path')).toBe(true);
      expect(visit(d, 'forest-spate-rail-west')).toBe(false);
      expect(visit(d, 'forest-spate-bend-east')).toBe(false);
      use(d, 'forest-spate-west-mark', 'Fit the two dates');
      expect(d.done('forest.spate.readings')).toBe(false);
      expect(visit(d, 'forest-clearing-path')).toBe(true);
      expect(d.e.visibleOptions('forest.spate.plan', d.s).some(({ option }) => option.text.includes(choice))).toBe(false);
      use(d, 'forest-spate-plan', 'Let the creek keep its own time');
      expect(prop(d, 'forest-spate-wait-notice').text).toContain('usual round');
      expect(visit(d, 'forest-bridge-to-trail')).toBe(true);
      use(d, 'forest-spate-east-mark', 'Lay the cart crew’s paper');
      expect(d.done('forest.spate.readings')).toBe(true);
      expect(visit(d, 'forest-clearing-path')).toBe(true);
      use(d, 'forest-spate-plan', choice);
      expect(d.done('forest.spate.plan')).toBe(true);
      expect(d.done('forest.spate.crossed')).toBe(false);
      expect(prop(d, `forest-spate-${route}-notice`)).toBeTruthy();
      expect(visit(d, 'forest-bridge-to-trail')).toBe(true);
      expect(visit(d, `forest-spate-${alternate}-west`)).toBe(false);
      const opened = prop(d, `forest-spate-${route}-west`).artOpen;
      expect(opened?.key).toBe(art);
      expect(check(opened?.if, d.s)).toBe(true);
      expect(visit(d, `forest-spate-${route}-west`)).toBe(true);
      expect(d.s.pos).toEqual(east);
      expect(d.done('forest.spate.crossed')).toBe(true);
      expect(visit(d, `forest-spate-${route}-east`)).toBe(true);
      expect(d.s.pos).toEqual(west);
      expect(visit(d, 'forest-trail-back')).toBe(true);
      expect(prop(d, 'forest-spate-return-slip').text).toContain('notes came back dry');
      expect(visit(d, 'forest-community-path')).toBe(true);
      expect(visit(d, 'forest-community-back')).toBe(true);
      expect(d.done('forest.finish')).toBe(false);
      expect(d.p.credit['credit.forest.finish']).toBeUndefined();
    });

  it('recalls a specific earlier gauge check when the Guardian has actually made it', () => {
    const d = begin();
    visit(d, 'forest-trail-path');
    use(d, 'forest-spate-west-mark', 'Fit the two dates');
    use(d, 'forest-spate-east-mark', 'Lay the cart crew’s paper');
    visit(d, 'forest-clearing-path');
    const recall = () => d.e.visibleOptions('forest.spate.plan', d.s)
      .some(({ option }) => option.next === 'forest.spate.coast');
    expect(recall()).toBe(false);
    d.run({ type: 'SetFlag', flag: 'coast.gauge.recheck', value: true });
    expect(recall()).toBe(true);
    use(d, 'forest-spate-plan', 'One gauge on the Observatory Coast', 'Unfold the north rail');
    expect(d.s.flags['forest.spate.route']).toBe('rail');
  });
});
