import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const trail = 'forest.trail';
const clearing = 'forest.community';
const objective = 'forest.guide.used';

function object(d: Driver, id: string) {
  const prop = MAPS[d.s.mapId].interactables.find((candidate) => candidate.id === id);
  if (!prop || !check(prop.visibleIf, d.s)) throw new Error(`Cannot use ${id} here`);
  return prop;
}

function walk(d: Driver, id: string) {
  const to = object(d, id).to;
  if (!to) throw new Error(`${id} is not a path`);
  d.s.mapId = to.map;
  d.s.pos = { x: to.x, y: to.y };
}

function scene(d: Driver, id: string, ...choices: string[]) {
  const prop = object(d, id);
  if (prop.kind !== 'scene' || !prop.node) throw new Error(`${id} is not a scene`);
  d.walk(prop.node, choices);
}

function prepare(): Driver {
  const d = new Driver();
  d.s.mapId = trail;
  scene(d, 'forest-guide-west-frame', 'Mark the post');
  scene(d, 'forest-guide-east-frame', 'Trace both posts');
  walk(d, 'forest-clearing-path');
  return d;
}

function visible(d: Driver, ...ids: string[]) {
  return MAPS[d.s.mapId].interactables
    .filter((prop) => ids.includes(prop.id) && check(prop.visibleIf, d.s))
    .map((prop) => prop.id);
}

describe('A Bridge in Two Views', () => {
  it('keeps the joiner’s layout open until both drawings have been made', () => {
    const d = new Driver();
    d.s.mapId = trail;
    scene(d, 'forest-guide-west-frame', 'Leave the frame');
    expect(d.s.flags['forest.guide.west-traced']).toBeUndefined();
    scene(d, 'forest-guide-west-frame', 'Mark the post');

    walk(d, 'forest-clearing-path');
    const opts = d.e.visibleOptions(object(d, 'forest-guide-bench').node!, d.s).map(({ option }) => option.text);
    expect(opts).toEqual(['Look for the frames first.']);
    expect(visible(d, 'forest-guide-hinges', 'forest-guide-bench-after')).toEqual([]);
    expect(d.s.flags['forest.response']).toBeUndefined();
  });

  it('lets visitors compare the hinged leaves at one workbench', () => {
    const d = prepare();
    scene(d, 'forest-guide-bench', 'Mount the two tracings');
    expect(visible(d, 'forest-guide-bench', 'forest-guide-hinges', 'forest-guide-bench-after'))
      .toEqual(['forest-guide-hinges']);
    scene(d, 'forest-guide-hinges', 'Turn the leaf marked RISE', 'Leave the guide standing');
    expect(d.done(objective)).toBe(false);
    scene(d, 'forest-guide-hinges', 'Turn the leaf marked LEVEL BANK', 'Leave the guide standing');
    expect(d.done(objective)).toBe(true);
    expect(d.s.journal).toContain('j.forest.guide');
    expect(d.p.credit).toEqual({});
    expect(d.done('forest.compare')).toBe(false);
  });

  it('hangs the other form at both viewing places, with neither route closed', () => {
    const d = prepare();
    scene(d, 'forest-guide-bench', 'Set each tracing');
    expect(visible(d, 'forest-guide-bench', 'forest-guide-hinges', 'forest-guide-bench-after'))
      .toEqual(['forest-guide-bench-after']);
    walk(d, 'forest-bridge-to-trail');
    expect(visible(d, 'forest-guide-west-panel', 'forest-guide-east-panel')).toEqual(['forest-guide-west-panel', 'forest-guide-east-panel']);
    scene(d, 'forest-guide-west-panel', 'Line up the deck');
    expect(d.done(objective)).toBe(false);
    scene(d, 'forest-guide-east-panel', 'Line up the deck');
    expect(d.done(objective)).toBe(true);
    expect(d.s.journal).toContain('j.forest.guide');
    expect(d.p.credit).toEqual({});
    expect(d.s.flags['forest.response']).toBeUndefined();
    expect(d.s.flags['forest.followup']).toBeUndefined();
    walk(d, 'forest-clearing-path');
    expect(d.s.mapId).toBe(clearing);
  });
});
