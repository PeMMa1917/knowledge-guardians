import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const sites = [
  ['creek-away', 5], ['bridge-edge', 1], ['ridge-edge', 2], ['ridge-away', 4],
] as const;

function prop(d: Driver, id: string) {
  const entry = MAPS[d.s.mapId].interactables.find((candidate) => candidate.id === id);
  if (!entry || !check(entry.visibleIf, d.s)) throw new Error(`Cannot use ${id} here`);
  return entry;
}

function travel(d: Driver, id: string) {
  const to = prop(d, id).to;
  if (!to) throw new Error(`${id} is not a path`);
  d.s.mapId = to.map;
  d.s.pos = { x: to.x, y: to.y };
}

function scene(d: Driver, id: string, ...picks: string[]) {
  const entry = prop(d, `forest-moss-${id}`);
  if (!entry.node) throw new Error(`${entry.id} is not a scene`);
  d.walk(entry.node, picks);
}

function frame(d: Driver, site: string) {
  const peg = prop(d, `forest-moss-${site}`);
  expect(MAPS[d.s.mapId].floor(peg.x, peg.y)).toBeTruthy();
  scene(d, site, 'Place the notched frame');
}

function tallyVisible(d: Driver) {
  return d.e.visibleOptions('forest.moss.table', d.s)
    .some(({ option }) => option.next === 'forest.moss.compare');
}

describe('The Green Squares', () => {
  it('requires four different frame placements and the independent crew tally', () => {
    const d = new Driver();
    d.s.mapId = 'forest.station';
    expect(() => prop(d, 'forest-moss-frame')).toThrow();
    d.run({ type: 'SetFlag', flag: 'forest.arrived', value: true });
    travel(d, 'forest-trail-path');
    expect(() => prop(d, 'forest-moss-creek-away')).toThrow();
    travel(d, 'forest-trail-back');
    scene(d, 'frame', 'Slip the frame');

    travel(d, 'forest-trail-path');
    frame(d, 'creek-away');
    frame(d, 'ridge-edge');
    scene(d, 'creek-away', 'Read the marks');
    expect(d.s.flags['forest.moss.creek-away']).toBe(5);
    expect(d.s.flags['forest.moss.bridge-edge']).toBeUndefined();

    travel(d, 'forest-clearing-path');
    scene(d, 'boot-log', 'Copy the crew’s tally');
    expect(d.done('forest.moss.survey')).toBe(false);
    expect(tallyVisible(d)).toBe(false);
    expect(d.e.visibleOptions('forest.moss.table', d.s).map(({ option }) => option.next))
      .toEqual(['forest.moss.missing', undefined]);

    travel(d, 'forest-bridge-to-trail');
    frame(d, 'bridge-edge');
    frame(d, 'ridge-away');
    expect(d.done('forest.moss.survey')).toBe(true);
    expect(sites.map(([site]) => d.s.flags[`forest.moss.${site}`])).toEqual(sites.map(([, count]) => count));
  });

  it.each([
    ['Mark the two frame', 'mark', 'low-sheet', ['mark-bridge', 'mark-ridge']],
    ['Tie a keep-to-the-stones', 'ribbon', 'revised-notice', ['ribbon-west', 'ribbon-east']],
  ] as const)('compares both light pairs and publishes only the %s route', (publish, result, clearingNotice, trailSigns) => {
    const d = new Driver();
    d.s.mapId = 'forest.station';
    d.run({ type: 'SetFlag', flag: 'forest.arrived', value: true });
    scene(d, 'frame', 'Slip the frame');
    travel(d, 'forest-trail-path');
    for (const [site] of [...sites].reverse()) frame(d, site);
    travel(d, 'forest-clearing-path');

    scene(d, 'table', 'Line up the two open', 'Step away');
    expect(d.s.flags['forest.moss.top']).toBe('open');
    scene(d, 'table', 'Line up the two shaded', 'Leave the shaded cards', 'Leave the cards');
    expect(d.s.flags['forest.moss.top']).toBe('shade');
    expect(tallyVisible(d)).toBe(false);
    expect(d.done('forest.moss.survey')).toBe(false);
    expect(d.e.visibleOptions('forest.moss.compare', d.s).map(({ option }) => option.next)).toEqual([undefined]);

    scene(d, 'boot-log', 'Copy the crew’s tally');
    expect(d.done('forest.moss.survey')).toBe(true);
    expect(tallyVisible(d)).toBe(true);
    scene(d, 'table', 'Slide the boot tally', publish);
    expect(d.done('forest.moss.place')).toBe(true);
    expect(d.s.flags['forest.moss.result']).toBe(result);
    expect(d.s.journal).toContain('j.forest.moss');
    expect(() => prop(d, 'forest-moss-table')).toThrow();
    expect(prop(d, `forest-moss-${clearingNotice}`).text).toContain(result === 'mark' ? 'one round' : 'On this trail');

    travel(d, 'forest-bridge-to-trail');
    const placed = MAPS[d.s.mapId].interactables.filter((entry) =>
      /^forest-moss-(mark|ribbon)-/.test(entry.id) && check(entry.visibleIf, d.s));
    expect(placed.map(({ id }) => id)).toEqual(trailSigns.map((id) => `forest-moss-${id}`));
    travel(d, 'forest-trail-back');
    if (result === 'ribbon') expect(prop(d, 'forest-moss-station-sheet').text).toContain('one round');
    else expect(() => prop(d, 'forest-moss-station-sheet')).toThrow();
    expect(d.done('forest.compare')).toBe(false);
    expect(d.s.flags['forest.response']).toBeUndefined();
    expect(d.p.credit).toEqual({});
  });
});
