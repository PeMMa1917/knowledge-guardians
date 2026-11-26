import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import type { MapDef } from '../src/maps/types';
import { STAMPS } from '../src/scenes/art';
import { Driver } from './driver';

const strip = 'item.latch-reference-strip';
const rooms = {
  metal: { site: 'metalworks.yard', room: 'metalworks.latch-bay', main: 'metal.arrived', sign: 'OPEN' },
  water: { site: 'water.gatehouse', room: 'water.service-lane', main: 'water.arrived', sign: 'CLOSED' },
} as const;
type Site = keyof typeof rooms;
type Layout = 'direct' | 'round';

function prop(d: Driver, id: string) {
  const entry = MAPS[d.s.mapId].interactables.find((p) => p.id === id);
  if (!entry) throw new Error(`No prop ${id} in ${d.s.mapId}`);
  return { entry, visible: check(entry.visibleIf, d.s) };
}

function use(d: Driver, id: string, ...options: string[]) {
  const { entry, visible } = prop(d, id);
  if (!visible || !check(entry.openIf, d.s)) throw new Error(`Cannot use ${id}`);
  if (entry.flag) d.run({ type: 'SetFlag', flag: entry.flag, value: true });
  if (entry.node) d.walk(entry.node, options);
  if (entry.to) d.s.mapId = entry.to.map;
  return entry.text;
}

function arrive(d: Driver, site: Site) {
  const { site: parent, room, main } = rooms[site];
  d.s.mapId = parent;
  expect(prop(d, `${site}-latch-door`).visible).toBe(false);
  if (site === 'water') d.s.objectivesDone.push('market.finish');
  d.run({ type: 'SetFlag', flag: main, value: true });
  use(d, `${site}-latch-door`);
  expect(d.s.mapId).toBe(room);
}

function reachable(d: Driver, map: MapDef, from: { x: number; y: number }) {
  const blocked = new Set<string>();
  const block = (x: number, y: number, width: number, height: number) => {
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) blocked.add(`${x + dx},${y + dy}`);
    }
  };
  for (const area of map.blocks) block(...area);
  for (const stamp of map.stamps) {
    const c = STAMPS[stamp.stamp].collide;
    if (c) block(stamp.x + c[0], stamp.y + c[1], c[2], c[3]);
  }
  for (const { x, y, when } of map.conditionalBlocks ?? []) if (check(when, d.s)) block(x, y, 1, 1);
  for (const entry of map.interactables) if (!entry.walkThrough) block(entry.x, entry.y, entry.w, entry.h);
  const seen = new Set([`${from.x},${from.y}`]);
  const queue = [from];
  for (let i = 0; i < queue.length; i++) {
    const current = queue[i];
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const x = current.x + dx, y = current.y + dy, key = `${x},${y}`;
      if (!map.floor(x, y) || blocked.has(key) || seen.has(key)) continue;
      seen.add(key);
      queue.push({ x, y });
    }
  }
  return seen;
}

function checkRoom(d: Driver, site: Site, layout: Layout) {
  const prefix = `latch.${site}`;
  const base = `${site}-latch`;
  const opposite = layout === 'direct' ? 'round' : 'direct';
  const map = MAPS[d.s.mapId];
  const proof = prop(d, `${base}-${layout}-proof`).entry;
  const place = `${proof.x},${proof.y}`;
  expect(reachable(d, map, map.spawn).has(place)).toBe(false);
  expect(prop(d, `${base}-sill`).visible).toBe(false);
  expect(prop(d, `${base}-plan`).visible).toBe(false);

  const positions = site === 'metal' ? ['open', 'closed'] : ['closed', 'open'];
  for (const position of positions) {
    use(d, `${base}-reference`, `known ${position} stop`);
    expect(d.s.flags[`${prefix}.reference`]).toBe(position);
    expect(d.s.flags[`${prefix}.seen.${position}`]).toBeUndefined();
    expect(d.done(`${prefix}.references`)).toBe(false);
    expect(use(d, `${base}-view-${position}`)).toContain(rooms[site].sign);
  }
  expect(d.done(`${prefix}.references`)).toBe(true);
  expect(prop(d, `${base}-plan`).visible).toBe(false);
  use(d, `${base}-sill`, 'Check the latch');
  expect(use(d, `${base}-observed`)).toContain(site === 'metal' ? 'shutter was closed' : 'latch was open');
  expect(d.done(`${prefix}.observed`)).toBe(true);
  use(d, `${base}-plan`, 'Leave the rails held');
  expect(reachable(d, map, map.spawn).has(place)).toBe(false);
  use(d, `${base}-plan`, site === 'metal'
    ? (layout === 'direct' ? 'Set the short lane' : 'Mark the round lane')
    : (layout === 'direct' ? 'Send a spotter' : 'Put the small tray'));

  const opened = prop(d, `${base}-${layout}-rail`).entry;
  const held = prop(d, `${base}-${opposite}-rail`).entry;
  const accessible = reachable(d, map, map.spawn);
  expect(accessible.has(`${opened.x},${opened.y}`)).toBe(true);
  expect(accessible.has(`${held.x},${held.y}`)).toBe(false);
  expect(accessible.has(place)).toBe(true);
  expect(reachable(d, map, proof).has(`${map.spawn.x},${map.spawn.y}`)).toBe(true);
  expect(d.done(`${prefix}.finish`)).toBe(false);
  expect(prop(d, `${base}-${opposite}-proof`).visible).toBe(false);
  use(d, `${base}-${layout}-proof`, 'Leave the practice load');
  expect(d.done(`${prefix}.finish`)).toBe(false);
  use(d, `${base}-${layout}-proof`, site === 'metal'
    ? (layout === 'direct' ? 'Move the practice crate' : 'Put the small practice parcel')
    : (layout === 'direct' ? 'Bring the broad tool tray' : 'Set the small tool tray'));
  expect(d.done(`${prefix}.finish`)).toBe(true);
  expect(prop(d, `${base}-${layout}-proof`).visible).toBe(false);
  expect(use(d, `${base}-${layout}-result`)).toContain(layout === 'direct' ? 'crew' : 'wait');
  use(d, `${base}-return`);
  expect(d.s.mapId).toBe(rooms[site].site);
}

describe('The Lamp’s Second Mark and Room for the Next Cart', () => {
  it.each([['direct', 'round'], ['round', 'direct']] as const)('earns a reference from the %s lane and independently uses the %s Water procedure', (metal, water) => {
    const d = new Driver();
    arrive(d, 'metal');
    expect(prop(d, 'metal-latch-reference').visible).toBe(false);
    expect(use(d, 'metal-latch-draft')).toContain('from the request line');
    checkRoom(d, 'metal', metal);
    expect(d.s.inventory[strip]).toBe(1);
    expect(d.done('metal.finish')).toBe(false);

    arrive(d, 'water');
    d.run({ type: 'SetFlag', flag: 'water.trial.drought.fields', value: true });
    const main = Object.entries(d.s.flags).filter(([id]) => id.startsWith('water.'));
    use(d, 'water-latch-draft');
    expect(prop(d, 'water-latch-reference').visible).toBe(false);
    use(d, 'water-latch-start', 'Unfold Corra’s strip');
    expect(use(d, 'water-latch-carried')).toContain('stays with its place');
    expect(d.done('latch.water.references')).toBe(false);
    checkRoom(d, 'water', water);
    expect(Object.entries(d.s.flags).filter(([id]) => id.startsWith('water.'))).toEqual(main);
    expect(d.done('water.finish')).toBe(false);
    expect(d.p.credit).toEqual({});
  });

  it('can check the Water service independently with a fresh local record', () => {
    const d = new Driver();
    arrive(d, 'water');
    use(d, 'water-latch-draft');
    expect(d.e.visibleOptions('latch.water.start', d.s).map(({ option }) => option.text)).not.toContain(expect.stringContaining('Corra'));
    use(d, 'water-latch-start', 'Take a fresh');
    expect(use(d, 'water-latch-local')).toContain('its own line');
    checkRoom(d, 'water', 'round');
    expect(d.done('latch.metal.finish')).toBe(false);
  });
});
