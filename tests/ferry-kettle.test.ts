import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const busy = 'Hang the card for the early boat';
const steady = 'Hang the card for six people';
const whole = 'Use one heat';
const split = 'Tend both pots';
const card = 'item.kettle.service-card';

function get(d: Driver, id: string) {
  return MAPS[d.s.mapId].interactables.find((prop) => prop.id === id && check(prop.visibleIf, d.s));
}

function cross(d: Driver, id: string) {
  const door = get(d, id);
  if (!door?.to || !check(door.openIf, d.s)) throw new Error('No reachable door ' + id);
  if (door.flag) d.run({ type: 'SetFlag', flag: door.flag, value: true });
  d.s.mapId = door.to.map;
}

function act(d: Driver, id: string, ...actions: string[]) {
  const prop = get(d, id);
  if (!prop?.node) throw new Error('No reachable scene ' + id);
  d.walk(prop.node, actions);
}

function read(d: Driver, id: string) {
  const notice = get(d, id);
  if (notice?.kind !== 'sign') throw new Error('No reachable notice ' + id);
  if (notice.flag) d.run({ type: 'SetFlag', flag: notice.flag, value: true });
  return notice.text;
}

function ferry(d: Driver) {
  d.s.mapId = 'aethelgard.emberford';
  d.run({ type: 'SetFlag', flag: 'clue.oldmap.folded-map', value: true });
  cross(d, 'ferry-road');
}

function trial(d: Driver, shift: string, chosen: string) {
  d.talk('ferry-cook', 'Take the practice ladle', shift);
  const test = (choice: string) => act(d, 'ferry-kettle-trial', choice);
  test('Leave the kettle');
  expect(d.s.flags['kettle.whole']).toBe(false);
  act(d, 'ferry-kettle-trial', 'Put six measures', 'Lift the full pot');
  expect(d.e.visibleOptions('ferry.kettle.trial', d.s).some(({ option }) =>
    option.next === 'ferry.kettle.choose')).toBe(false);
  act(d, 'ferry-kettle-trial', 'Set two measures', 'Set down two cups', 'Ladle the other four');
  expect(d.done('ferry.kettle.compare')).toBe(true);
  act(d, 'ferry-kettle-trial', 'Arrange the real serving bench', chosen);
}

describe('A Cup before the Bell', () => {
  it.each([
    ['busy-whole', busy, whole, 'Two servings remain'],
    ['busy-split', busy, split, 'two cups went to the boat'],
    ['steady-whole', steady, whole, 'One heat filled the six'],
    ['steady-split', steady, split, 'cups on the rail had been cooling'],
  ])('serves the selected %s shift and grants one portable card after the readback', (result, shift, plan, observation) => {
    const d = new Driver();
    ferry(d);
    const before = { ...d.p.credit };
    expect(get(d, 'ferry-kettle-trial')).toBeUndefined();
    d.talk('ferry-cook', 'Walk on for now');
    expect(get(d, 'ferry-kettle-trial')).toBeUndefined();
    trial(d, shift, plan);
    expect(d.s.flags['kettle.served']).toBe(result);
    expect(d.done('ferry.kettle.served')).toBe(false);
    expect(d.s.inventory[card]).toBeUndefined();
    expect(read(d, 'ferry-kettle-' + result)).toContain(observation);
    expect(d.done('ferry.kettle.served')).toBe(true);
    expect(d.s.inventory[card]).toBe(1);
    expect(d.p.credit).toEqual(before);
  });

  it('replays under a changed arrival condition and keeps the previous posted shift until service', () => {
    const d = new Driver();
    ferry(d);
    trial(d, busy, split);
    read(d, 'ferry-kettle-busy-split');
    d.talk('ferry-cook', 'Ask Enna for a fresh shift', steady);
    expect(get(d, 'ferry-kettle-busy-split')).toBeDefined();
    expect(d.e.visibleOptions('ferry.kettle.trial', d.s).some(({ option }) =>
      option.next === 'ferry.kettle.choose')).toBe(false);
    act(d, 'ferry-kettle-trial', 'Set two measures', 'Set down two cups', 'Ladle the other four');
    act(d, 'ferry-kettle-trial', 'Put six measures', 'Lift the full pot');
    act(d, 'ferry-kettle-trial', 'Arrange the real serving bench', whole);
    expect(get(d, 'ferry-kettle-busy-split')).toBeUndefined();
    read(d, 'ferry-kettle-steady-whole');
    expect(d.s.inventory[card]).toBe(1);
  });

  it.each([
    ['fold', 'Give the carrier a folded card', 'Ready: six. Received: four.'],
    ['table', 'Leave the two pending spaces', 'The two still here have their own marks'],
  ])('uses the ferry card at the Market and shows the %s tradeoff after four are carried', (result, choice, evidence) => {
    const d = new Driver();
    ferry(d);
    trial(d, busy, split);
    read(d, 'ferry-kettle-busy-split');
    d.s.mapId = 'nexus.archive';
    d.s.objectivesDone.push('stage.finish');
    cross(d, 'market-door');

    act(d, 'market-kettle-card', 'Clip the ferry’s two counts');
    expect(d.done('market.kettle.compare')).toBe(true);
    act(d, 'market-kettle-plan', choice);
    expect(d.done('market.kettle.readback')).toBe(false);
    expect(read(d, 'market-kettle-' + result)).toContain(evidence);
    expect(d.done('market.kettle.readback')).toBe(true);
    expect(d.done('market.publish')).toBe(false);
    expect(d.s.inventory[card]).toBe(1);
  });
});
