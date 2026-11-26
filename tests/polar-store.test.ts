import { describe, expect, it } from 'vitest';
import polar from '../src/content/polar-store.json';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import type { MapDef } from '../src/maps/types';
import { STAMPS } from '../src/scenes/art';
import { Driver } from './driver';

const archive = 'preserved.archive';
const records = 'preserved.polar-records';
const trial = 'preserved.polar-store';

function prop(d: Driver, id: string) {
  const entry = MAPS[d.s.mapId].interactables.find((p) => p.id === `polar-${id}`);
  if (!entry) throw new Error(`Missing Polar Store prop ${id} in ${d.s.mapId}`);
  return { entry, visible: check(entry.visibleIf, d.s) };
}

function use(d: Driver, id: string, ...options: string[]) {
  const { entry, visible } = prop(d, id);
  if (!visible || !check(entry.openIf, d.s)) throw new Error(`Unavailable prop ${id}`);
  if (entry.exhibit) d.run({ type: 'InspectExhibit', exhibit: entry.exhibit });
  if (entry.node) d.walk(entry.node, options);
  if (entry.flag) d.run({ type: 'SetFlag', flag: entry.flag, value: true });
  if (entry.to) d.s.mapId = entry.to.map;
  return entry.text;
}

function start() {
  const d = new Driver();
  d.s.mapId = archive;
  expect(prop(d, 'archive-door').visible).toBe(false);
  d.s.objectivesDone.push('preserved.publish');
  use(d, 'archive-door');
  expect(d.s.mapId).toBe(records);
  return d;
}

function visitGroup(d: Driver, name: string) {
  const exhibits = polar.exhibits.filter(({ specimen }) => specimen.objective === `polar.${name}`);
  for (const exhibit of exhibits) use(d, `${exhibit.grantsCard.split('.').at(-1)}-case`);
}

function reachable(d: Driver, map: MapDef, from: { x: number; y: number }) {
  const blocked = new Set<string>();
  const cover = (x: number, y: number, width = 1, height = 1) => {
    for (let row = y; row < y + height; row++) {
      for (let column = x; column < x + width; column++) blocked.add(`${column},${row}`);
    }
  };
  for (const area of map.blocks) cover(...area);
  for (const { stamp, x, y } of map.stamps) {
    const bounds = STAMPS[stamp].collide;
    if (bounds) cover(x + bounds[0], y + bounds[1], bounds[2], bounds[3]);
  }
  for (const { x, y } of map.npcs) cover(x, y);
  for (const { x, y, w, h, walkThrough, visibleIf } of map.interactables) {
    if (!walkThrough && check(visibleIf, d.s)) cover(x, y, w, h);
  }
  for (const { x, y, when } of map.conditionalBlocks ?? []) if (check(when, d.s)) cover(x, y);
  const visited = new Set([`${from.x},${from.y}`]);
  const frontier = [from];
  for (let i = 0; i < frontier.length; i++) {
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const x = frontier[i].x + dx, y = frontier[i].y + dy, key = `${x},${y}`;
      if (!map.floor(x, y) || blocked.has(key) || visited.has(key)) continue;
      visited.add(key);
      frontier.push({ x, y });
    }
  }
  return visited;
}

describe('What Reached the Far Bench', () => {
  it('places each verified accession at its own inspectable station and preserves source limits', () => {
    const d = start();
    const cases = MAPS[records].interactables.filter(({ kind }) => kind === 'exhibit');
    expect(cases).toHaveLength(18);
    expect(new Set(cases.map(({ x, y }) => `${x},${y}`)).size).toBe(cases.length);
    expect(new Set(cases.map(({ exhibit }) => exhibit)).size).toBe(cases.length);
    for (const record of polar.exhibits) {
      expect(cases.find(({ exhibit }) => exhibit === record.id)?.art).toBe(record.art);
      expect(d.e.pack.sources.find(({ id }) => id === record.specimen.source)?.url).toMatch(/^https:\/\//);
      expect(d.e.pack.cards.find(({ id }) => id === record.grantsCard)?.limits.length).toBeGreaterThan(20);
    }
    expect(d.e.pack.exhibits.find(({ id }) => id === 'OBJ-SPRI-Y-56-17')?.summary).toContain('probably');
    expect(d.e.pack.cards.find(({ id }) => id === 'card.polar.thermometer')?.limits).toContain('different endpoints');
    expect(d.e.pack.cards.find(({ id }) => id === 'card.polar.achelia')?.limits).toContain('no sampling method');
  });

  it.each(['low', 'high'] as const)('checks both exact outline records, walks the %s delivery and revises the notice', (route) => {
    const d = start();
    use(d, 'cargo-case');
    use(d, 'practice-door');
    expect(prop(d, 'fit').visible).toBe(false);
    expect(use(d, 'fit-missing')).toContain('two specific sledge dimensions');
    use(d, 'practice-return');
    use(d, 'dog-case');
    use(d, 'practice-door');
    expect(d.s.mapId).toBe(trial);
    const map = MAPS[trial];
    const other = route === 'low' ? 'high' : 'low';
    const goal = prop(d, `deliver-${route}`).entry;
    const at = `${goal.x},${goal.y}`;
    expect(reachable(d, map, map.spawn).has(at)).toBe(false);
    expect(prop(d, 'choice').visible).toBe(false);
    expect(use(d, 'old-card')).toContain('ALL DELIVERED');

    use(d, 'fit', `Set the ${other} outline`);
    expect(d.done('polar.frame')).toBe(false);
    expect(use(d, `fit-${other}`)).toContain(other === 'high' ? '7.5 cm higher' : '18.5 cm');
    use(d, 'fit', `Set the ${route} outline`);
    expect(use(d, `fit-${route}`)).toContain(route === 'high' ? '7.5 cm higher' : '18.5 cm');
    expect(d.done('polar.frame')).toBe(true);

    use(d, 'choice', 'Leave the next run');
    expect(reachable(d, map, map.spawn).has(at)).toBe(false);
    use(d, 'choice', route === 'low' ? 'flat source sleeve' : 'both parcels');
    const opened = prop(d, `${route}-hatch`).entry;
    const held = prop(d, `${other}-hatch`).entry;
    const path = reachable(d, map, map.spawn);
    expect(path.has(`${opened.x},${opened.y}`)).toBe(true);
    expect(path.has(`${held.x},${held.y}`)).toBe(false);
    expect(path.has(at)).toBe(true);
    expect(reachable(d, map, goal).has(`${map.spawn.x},${map.spawn.y}`)).toBe(true);
    expect(use(d, `${route}-loaded`)).toContain(route === 'low' ? 'clip is closed' : 'parcel marks');
    expect(prop(d, `deliver-${other}`).visible).toBe(false);
    expect(prop(d, `publish-${route}`).visible).toBe(false);

    use(d, `deliver-${route}`, 'Leave the receipt blank');
    expect(d.done('polar.arrival')).toBe(false);
    use(d, `deliver-${route}`, route === 'low' ? 'ask Orsa to check' : 'Lift the two');
    expect(d.done('polar.arrival')).toBe(true);
    expect(prop(d, `${route}-loaded`).visible).toBe(false);
    expect(use(d, `arrived-${route}`)).toContain(route === 'low' ? 'no parcels' : 'two practice parcels');
    expect(use(d, `missing-${route}`)).toContain(route === 'low' ? 'still empty' : 'still at the loading peg');
    use(d, `publish-${route}`, 'Leave the card');
    expect(d.done('polar.finish')).toBe(false);
    use(d, `publish-${route}`, 'Post the checked');
    expect(d.done('polar.finish')).toBe(true);
    expect(use(d, `published-${route}`)).toContain(route === 'low' ? '2 practice parcels await' : '1 source sleeve waits');
    use(d, 'practice-return');
    use(d, 'archive-return');
    expect(d.s.mapId).toBe(archive);
    expect(use(d, `archive-${route}`)).toContain(route === 'low' ? 'signed sleeve' : 'checked count');
    expect(d.s.objectivesDone.filter((id) => id.startsWith('preserved.'))).toEqual(['preserved.publish']);
    expect(d.p.credit).toEqual({});
  });

  it.each([false, true])('compares and places evidence in all five optional work areas (second mounting: %s)', (alternate) => {
    const d = start();
    for (const destination of ['surface', 'stores', 'screen', 'fix', 'sample']) expect(prop(d, destination).visible).toBe(false);

    visitGroup(d, 'surface');
    use(d, 'surface', 'soft teaching mat');
    expect(prop(d, 'surface-pin').visible).toBe(false);
    use(d, 'surface', 'hard teaching mat');
    use(d, 'surface-pin', alternate ? 'both impressions' : 'soft cast impression');
    expect(use(d, alternate ? 'surface-pair' : 'surface-soft')).toContain(alternate ? 'long streak' : 'three heel marks');

    visitGroup(d, 'stores');
    use(d, 'stores', alternate ? 'two recovery shelves' : 'packing rail');
    expect(use(d, alternate ? 'stores-custody' : 'stores-packing')).toContain(alternate ? 'Cape Royds' : 'tag is under review');

    visitGroup(d, 'screen');
    use(d, 'screen', 'pale grey filter');
    expect(prop(d, 'screen-pin').visible).toBe(false);
    expect(use(d, 'screen-view-pale')).toContain('small numbers');
    use(d, 'screen', 'dark grey filter');
    expect(use(d, 'screen-view-dark')).toContain('broad seam');
    use(d, 'screen-pin', alternate ? 'broad-seam checker' : 'small-label reader');
    expect(use(d, alternate ? 'screen-seam' : 'screen-label')).toContain(alternate ? 'brighter desk' : 'little label');

    visitGroup(d, 'fix');
    use(d, 'fix', alternate ? 'facing notebook slots' : 'Draw a wide band');
    expect(use(d, alternate ? 'fix-ledger' : 'fix-band')).toContain(alternate ? 'waits for a time' : 'empty time clip');

    visitGroup(d, 'sample');
    use(d, 'sample', alternate ? 'separate date and depth' : 'Bridge the shared date');
    expect(use(d, alternate ? 'sample-separate' : 'sample-bridge')).toContain('sampling method line is open');
    expect(d.done('polar.finish')).toBe(false);
    for (const work of ['surface', 'stores', 'screen', 'fix', 'sample']) expect(d.done(`polar.${work}`)).toBe(true);
  });
});
