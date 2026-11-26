import { expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { playPath } from '../src/domain/learningPaths';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { EMBERFORD_LAST_TURN, STUDY_LAST_TURN } from '../src/maps/lastTurn';
import { Driver } from './driver';

const market = 'aethelgard.emberford';
const study = 'aethelgard.study';
const prefix = 'last-turn.';

const prop = (d: Driver, name: string) => MAPS[d.s.mapId].interactables.find((item) => item.id === prefix + name)!;
const visible = (d: Driver, name: string) => check(prop(d, name).visibleIf, d.s);

function use(d: Driver, name: string, pick?: string) {
  const item = prop(d, name);
  expect(visible(d, name), name).toBe(true);
  if (item.node) d.walk(item.node, pick ? [pick] : []);
  if (item.flag) d.run({ type: 'SetFlag', flag: item.flag, value: true });
  return item.text;
}

function enterMarket() {
  const d = new Driver();
  d.s.objectivesDone.push('m01.o6.label', 'm02.o3.thread', 'm02.o4.forge');
  d.run({ type: 'Reach', zone: 'portal' });
  d.s.mapId = market;
  d.run({ type: 'Reach', zone: 'emberford' });
  return d;
}

it('holds the two separate customs until the player turns the same slate and checks both witnesses', () => {
  const d = enterMarket();
  expect(visible(d, 'slate')).toBe(false);
  d.run({ type: 'SetFlag', flag: 'sd.corvan.outcome', value: 'lost-ground' });
  use(d, 'slate', 'Leave the slate');
  expect(visible(d, 'forge')).toBe(false);
  use(d, 'slate', 'Lift Derva’s slate');
  expect(d.s.flags[prefix + 'turned']).toBe('lifted');
  expect(use(d, 'forge')).toContain('face down to hold a turn');
  expect(visible(d, 'post')).toBe(false);
  expect(use(d, 'desk')).toContain('face down when its entry is closed');
  expect(d.done(prefix + 'compare')).toBe(true);
  use(d, 'post', 'Leave the slate and');
  expect(visible(d, 'post')).toBe(true);
  expect(visible(d, 'floor')).toBe(false);
  expect(visible(d, 'file')).toBe(false);
  expect(d.s.inventory['item.last-turn.docket']).toBeUndefined();
});

it.each([
  ['floor', 'Hold the queue', 'The speakers’ words never reached us there'],
  ['file', 'Release the queue', 'They have only this stub'],
])('preserves a %s account that reaches the Study through the existing cellar', (plan, pick, receipt) => {
  const d = enterMarket();
  d.run({ type: 'SetFlag', flag: 'sd.corvan.outcome', value: 'split' });
  use(d, 'slate', 'Lift Derva’s slate');
  use(d, 'desk');
  use(d, 'forge');
  use(d, 'post', pick);
  expect(d.s.inventory['item.last-turn.docket']).toBe(1);
  expect(d.s.flags['sd.corvan.outcome']).toBe('split');
  expect(d.done('m02.o6.hesper')).toBe(false);
  expect(d.done(prefix + 'publish')).toBe(false);
  expect(use(d, plan)).toContain(receipt);
  expect(d.done(prefix + 'publish')).toBe(true);
  expect(visible(d, plan === 'floor' ? 'file' : 'floor')).toBe(false);

  const door = MAPS[market].interactables.find((item) => item.id === 'cellar-door')!;
  expect(check(door.openIf, d.s)).toBe(false);
  for (const puzzle of ['weigh-house', 'tipped-cart', 'map-table', 'brass-sorter', 'echo-bridge']) {
    d.run({ type: 'SetFlag', flag: `puzzle.${puzzle}.done`, value: true });
  }
  expect(d.s.flags['lamps.lit']).toBe(6);
  expect(check(door.openIf, d.s)).toBe(true);
  d.run({ type: 'SetFlag', flag: door.flag!, value: true });
  d.s.mapId = door.to!.map;
  expect(d.s.mapId).toBe(study);
  expect(d.done(prefix + 'follow')).toBe(false);
  if (plan === 'file') {
    expect(visible(d, 'study-floor')).toBe(false);
    expect(visible(d, 'study-file')).toBe(false);
    use(d, 'study-intake', 'Leave the sleeve');
    expect(d.done(prefix + 'follow')).toBe(false);
    use(d, 'study-intake', 'Open her intake sleeve');
    expect(use(d, 'study-file')).toContain('first hearing stopped');
  } else {
    expect(visible(d, 'study-intake')).toBe(false);
    expect(use(d, 'study-floor')).toContain('her place in the back row');
  }
  expect(d.done(prefix + 'follow')).toBe(true);
  expect(d.s.flags['study.letter']).toBeUndefined();
});

it('keeps the interaction tiles separate from the existing market and Study routes', () => {
  for (const [map, stations] of [[MAPS[market], EMBERFORD_LAST_TURN], [MAPS[study], STUDY_LAST_TURN]] as const) {
    for (const station of stations) {
      expect(map.floor(station.x, station.y)).toBeTruthy();
      expect(map.interactables.filter(({ id, x, y, w, h }) =>
        !id.startsWith(prefix) && station.x >= x && station.y >= y && station.x < x + w && station.y < y + h,
      ).map(({ id }) => id), station.id).toEqual([]);
    }
  }
});

it('models the optional scene at its two visits and keeps it out of the main itinerary', () => {
  const pack = buildPack();
  for (const style of ['story', 'puzzler', 'cozy'] as const) {
    expect(playPath(pack, style).some(({ id }) => id.startsWith(prefix)), style).toBe(false);
  }
  for (const style of ['social', 'explorer'] as const) {
    const steps = playPath(pack, style).map(({ id }) => id);
    const showdown = steps.indexOf('m02.o5.showdown');
    const cellar = steps.indexOf('lamp.o3.cellar');
    expect(steps.slice(showdown + 1, showdown + 3)).toEqual([prefix + 'compare', prefix + 'publish']);
    expect(steps[cellar + 1]).toBe(prefix + 'follow');
  }
});
