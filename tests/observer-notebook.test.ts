import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const notebook = 'observer-notebook';

function object(d: Driver, id: string) {
  const prop = MAPS[d.s.mapId].interactables.find((entry) => entry.id === id);
  if (!prop) throw new Error(`${id} is missing from ${d.s.mapId}`);
  return prop;
}

function visible(d: Driver, id: string) {
  return check(object(d, id).visibleIf, d.s);
}

function visit(d: Driver, id: string) {
  const prop = object(d, id);
  if (!prop.to || !check(prop.visibleIf, d.s) || !check(prop.openIf, d.s)) throw new Error(`Cannot use ${id}`);
  if (prop.flag) d.run({ type: 'SetFlag', flag: prop.flag, value: true });
  d.s.mapId = prop.to.map;
  d.s.pos = { x: prop.to.x, y: prop.to.y };
}

function scene(d: Driver, id: string, ...choices: string[]) {
  const prop = object(d, id);
  if (!prop.node || !check(prop.visibleIf, d.s)) throw new Error(`Cannot use ${id}`);
  d.walk(prop.node, choices);
}

const forestRoutes = [
  {
    method: 'conditions', bind: 'limits of each view',
    first: 'forest-observer-creek-edge', clipFirst: 'Clip the reed edge',
    second: 'forest-observer-ridge-edge', clipSecond: 'Clip the clear opening',
    shortcut: 'forest-observer-bank-to-station', alternate: 'forest-observer-ridge-to-clearing',
    entry: 'forest.station', pos: { x: 6, y: 7 }, proof: 'forest-observer-station-proof',
  },
  {
    method: 'crew', bind: 'crew whose watch is missing',
    first: 'forest-observer-lamp-board', clipFirst: 'Clip the lamp crew',
    second: 'forest-observer-bridge-board', clipSecond: 'Clip the ridge keeper',
    shortcut: 'forest-observer-ridge-to-clearing', alternate: 'forest-observer-bank-to-station',
    entry: 'forest.community', pos: { x: 19, y: 12 }, proof: 'forest-observer-clearing-proof',
  },
] as const;

function earnNotebook(d: Driver, route: (typeof forestRoutes)[number]) {
  d.s.objectivesDone.push('coast.revise');
  visit(d, 'forest-door');
  const options = () => d.e.visibleOptions('forest.observer.bind', d.s).map(({ option }) => option.next);
  expect(options()).toEqual([undefined]);
  d.run({ type: 'InspectExhibit', exhibit: 'OBJ-FOREST-GOMBE' });
  d.run({ type: 'InspectExhibit', exhibit: 'OBJ-FOREST-GOMBE-CONTEXT' });
  expect(options()).toEqual([undefined]);
  d.talk('forest-naturalist', 'Gombe team');
  expect(d.done('forest.gombe-credit')).toBe(true);
  expect(options()).toEqual([undefined]);
  visit(d, 'forest-trail-path');
  for (const site of ['creek', 'ridge']) {
    for (const window of ['early', 'late'] as const) d.run({ type: 'ObserveForest', site, window });
  }
  visit(d, 'forest-trail-back');
  d.talk('forest-naturalist', 'under the same watch');
  expect(d.done('forest.compare')).toBe(true);
  scene(d, 'forest-observer-book', route.bind);
  expect(d.s.flags['forest.observer.method']).toBe(route.method);
  expect(d.s.flags['keepsake.observer-notebook']).toBe(true);
  expect(d.done('forest.observer.bound')).toBe(true);
  expect(d.s.flags['perspective.active']).toBeUndefined();
}

describe('Elian’s field notebook', () => {
  it.each(forestRoutes)('needs the two sources and observed watches, then opens the $method path only while active', (route) => {
    const d = new Driver();
    expect(() => d.run({ type: 'EquipPerspective', keepsake: notebook })).toThrow(/earned that field tool/i);
    earnNotebook(d, route);
    visit(d, 'forest-trail-path');
    expect(visible(d, route.first)).toBe(false);
    d.run({ type: 'EquipPerspective', keepsake: notebook });
    scene(d, route.first, route.clipFirst);
    expect(visible(d, route.shortcut)).toBe(false);
    scene(d, route.second, route.clipSecond);
    expect(d.done('forest.observer.notes')).toBe(true);
    expect(visible(d, route.alternate)).toBe(false);
    expect(visible(d, route.shortcut)).toBe(true);
    d.run({ type: 'EquipPerspective', keepsake: null });
    expect(visible(d, route.shortcut)).toBe(false);
    expect(visible(d, 'forest-clearing-path')).toBe(true);
    d.run({ type: 'EquipPerspective', keepsake: notebook });
    visit(d, route.shortcut);
    expect(d.s.mapId).toBe(route.entry);
    expect(d.s.pos).toEqual(route.pos);
    expect(d.done('forest.observer.finish')).toBe(true);
    expect(visible(d, route.proof)).toBe(true);
    expect(d.done('forest.finish')).toBe(false);
  });

  it.each([
    { route: forestRoutes[0], method: 'sight', source: 'water-observer-high-step', clip: 'Clip the noon reading',
      layout: 'local', choice: 'Leave each reader’s note', proofMap: 'water.lower-channel', proof: 'water-observer-lower-sight-copy', words: 'two intervals at noon' },
    { route: forestRoutes[1], method: 'handover', source: 'water-observer-crew-log', clip: 'Clip the handover',
      layout: 'paired', choice: 'Mount both dated records', proofMap: 'water.council', proof: 'water-observer-paired-handover', words: 'Its noon square stays blank.' },
  ])('transfers the notebook to Water using $method and publishes $layout notes', ({ route, method, source, clip, layout, choice, proofMap, proof, words }) => {
    const d = new Driver();
    earnNotebook(d, route);
    visit(d, 'forest-nexus-return');
    d.s.objectivesDone.push('market.finish');
    visit(d, 'water-door');
    expect(visible(d, 'water-observer-upper')).toBe(false);
    d.run({ type: 'EquipPerspective', keepsake: notebook });
    d.talk('water-keeper', 'Show Elian’s notebook');
    scene(d, 'water-observer-upper', 'Clip the upper peg');
    visit(d, 'water-lower-path');
    expect(visible(d, source)).toBe(false);
    scene(d, 'water-observer-blocked', 'Mark the covered noon view');
    scene(d, source, clip);
    expect(d.s.flags['water.observer.lower']).toBe(method);
    expect(d.done('water.observer.readings')).toBe(true);
    visit(d, 'water-lower-to-council');
    expect(visible(d, 'water-observer-council-track')).toBe(false);
    scene(d, 'water-observer-board', choice);
    expect(d.s.flags['water.observer.layout']).toBe(layout);
    visit(d, 'water-observer-council-track');
    expect(d.s.pos).toEqual({ x: 25, y: 14 });
    expect(d.done('water.observer.finish')).toBe(true);
    visit(d, 'water-observer-bank-track');
    expect(d.s.pos).toEqual({ x: 7, y: 8 });
    d.run({ type: 'EquipPerspective', keepsake: null });
    expect(visible(d, 'water-observer-council-track')).toBe(false);
    expect(visible(d, 'water-council-to-lower')).toBe(true);
    if (proofMap === 'water.lower-channel') visit(d, 'water-council-to-lower');
    expect(visible(d, proof)).toBe(true);
    expect(object(d, proof).text).toContain(words);
    expect(d.done('water.finish')).toBe(false);
  });
});
