import { describe, expect, it } from 'vitest';
import { crossingOf, wayOpen } from '../src/domain/crossings';
import { vignettesFor } from '../src/domain/epilogue';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const crossing = crossingOf('last-lamp')!;
const resultProps = ['voices-vow-bench-card', 'voices-vow-room-arrow', 'voices-vow-room-seat', 'voices-vow-next-card'];

function object(d: Driver, id: string) {
  const entry = MAPS[d.s.mapId].interactables.find((candidate) => candidate.id === id);
  if (!entry || !check(entry.visibleIf, d.s)) throw new Error(`Cannot use ${id} here`);
  return entry;
}

function travel(d: Driver, id: string) {
  const to = object(d, id).to;
  if (!to) throw new Error(`${id} is not a passage`);
  d.s.mapId = to.map;
}

function read(d: Driver, id: string) {
  const sign = object(d, id);
  if (sign.flag) d.run({ type: 'SetFlag', flag: sign.flag, value: true });
  return sign.text;
}

function scene(d: Driver, id: string, ...picks: string[]) {
  const node = object(d, id).node;
  if (!node) throw new Error(`${id} does not open a scene`);
  d.walk(node, picks);
}

function setup() {
  const d = new Driver();
  d.s.mapId = crossing.map;
  d.s.objectivesDone.push('voices.finish');
  d.s.flags['voices.revision'] = 'routes';
  return d;
}

function available(d: Driver) {
  object(d, `cross-${crossing.id}`);
  return crossing.ways.filter((way) => wayOpen(way, d.s)).map((way) => way.id);
}

function decide(d: Driver, way: string) {
  expect(available(d)).toContain(way);
  d.run({ type: 'SetFlag', flag: `cross.${crossing.id}`, value: way });
  expect(d.s.flags['voices.revision']).toBe('routes');
  expect(d.p.credit).toEqual({});
  expect(vignettesFor(d.s).filter(({ who }) => who === 'The Lamp Quay')).toHaveLength(1);
}

function assertSigns(d: Driver, expected: string[]) {
  const actual = Object.values(MAPS).flatMap((map) => map.interactables.filter((sign) =>
    resultProps.includes(sign.id) && check(sign.visibleIf, d.s)).map(({ id }) => id));
  expect(actual).toEqual(expected);
}

function records(d: Driver) {
  expect(read(d, 'voices-vow-dedication')).toContain('sacred promise');
  travel(d, 'voices-quay-to-walk');
  expect(read(d, 'voices-vow-roll')).toContain('issued passes');
  travel(d, 'voices-walk-to-quay');
}

describe('The Lamp We Owe', () => {
  it('opens the quay plan only after both records and both views, then replaces the trial lamp', () => {
    const fresh = new Driver();
    fresh.s.mapId = crossing.map;
    expect(() => object(fresh, 'cross-last-lamp')).toThrow();
    expect(() => object(fresh, 'voices-vow-trial')).toThrow();

    const d = setup();
    expect(available(d)).toEqual(['defer']);
    records(d);
    scene(d, 'voices-vow-trial', 'Hang the small lamp', 'Step away');
    expect(read(d, 'voices-vow-test-rail')).toContain('lines up');
    expect(available(d)).toEqual(['defer']);
    scene(d, 'voices-vow-trial', 'Hang the same lamp', 'Step away');
    expect(read(d, 'voices-vow-test-bench')).toContain('closing words');
    expect(() => object(d, 'voices-vow-test-rail')).toThrow();
    expect(available(d)).toEqual(['quay', 'defer']);

    decide(d, 'quay');
    expect(() => object(d, 'voices-vow-trial')).toThrow();
    expect(() => object(d, 'voices-vow-test-bench')).toThrow();
    expect(read(d, 'voices-vow-bench-card')).toContain('Wren waiting');
    assertSigns(d, ['voices-vow-bench-card']);
  });

  it('checks the indoor threshold separately and leaves a return path through the original passage', () => {
    const d = setup();
    records(d);
    travel(d, 'voices-quay-return');
    scene(d, 'voices-vow-room-door', 'Pin a trial arrow');
    travel(d, 'voices-quay-path');
    expect(available(d)).toEqual(['room', 'defer']);

    decide(d, 'room');
    expect(read(d, 'voices-vow-room-arrow')).toContain('Listening Room');
    travel(d, 'voices-quay-return');
    expect(read(d, 'voices-vow-room-seat')).toContain('extra walk');
    assertSigns(d, ['voices-vow-room-seat', 'voices-vow-room-arrow']);
  });

  it('defers the welcome without a hidden prerequisite and marks the next turn at Glass Walk', () => {
    const d = setup();
    decide(d, 'defer');
    travel(d, 'voices-quay-to-walk');
    expect(read(d, 'voices-vow-next-card')).toContain('come back in the morning');
    assertSigns(d, ['voices-vow-next-card']);
  });

  it('remembers specific earlier acts instead of assuming every player made them', () => {
    const d = setup();
    const replies = () => d.e.visibleOptions('voices.vow.trial', d.s).map(({ option }) => option.next);
    expect(replies()).not.toContain('voices.vow.market');
    expect(replies()).not.toContain('voices.vow.sefa');
    d.run({ type: 'SetFlag', flag: 'cross.patron', value: 'keeper' });
    d.run({ type: 'SetFlag', flag: 'loyalty.sefa', value: 'both' });
    expect(replies()).toContain('voices.vow.market');
    expect(replies()).toContain('voices.vow.sefa');
    expect(replies()).not.toContain('voices.vow.market-test');
    scene(d, 'voices-vow-trial', 'Tell Wren what you kept', 'Go back to', 'Leave the lamp');
    expect(available(d)).toEqual(['defer']);
  });
});
