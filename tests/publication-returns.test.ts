import { describe, expect, it } from 'vitest';
import { BIRO_RETURN, GREEN_RETURN } from '../src/content/publicationReturns';
import { specimenItemId, specimenToolId } from '../src/domain/specimenGear';
import { emptyPair, parsePair, serialisePair, writeSuspend } from '../src/domain/saves';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { publicationReturnsAt } from '../src/maps/publicationReturns';
import { STAMPS } from '../src/scenes/art';
import { artKeys } from '../src/ui/illustrations';
import { Driver } from './driver';
import type { MapDef } from '../src/maps/types';

function enter(d: Driver, map: string) {
  d.s.mapId = map;
  d.run({ type: 'VisitPlace', name: MAPS[map].name });
}
function visible(d: Driver, id: string) {
  return MAPS[d.s.mapId].interactables.find((prop) => prop.id === id && check(prop.visibleIf, d.s));
}
function read(d: Driver, id: string, pick?: string) {
  const entry = visible(d, id);
  expect(entry?.node, id).toBeDefined();
  d.walk(entry!.node!, pick ? [pick] : []);
}
function inspect(d: Driver, id: string) {
  const entry = visible(d, id);
  expect(entry?.exhibit, id).toBeDefined();
  d.run({ type: 'InspectExhibit', exhibit: entry!.exhibit! });
  return entry!.exhibit!;
}
function saveAndResume(d: Driver) {
  const pair = writeSuspend(emptyPair(), { kind: 'suspend', label: 'A packet is ready', location: MAPS[d.s.mapId].name,
    savedAt: '2026-11-26T16:00:00Z', state: d.s });
  const stored = parsePair(serialisePair(pair));
  if (!stored.ok || !stored.pair.continue) throw new Error('Saved route could not be read');
  d.s = stored.pair.continue.state;
}
function acquirePen(d: Driver) {
  enter(d, BIRO_RETURN.map);
  expect(visible(d, BIRO_RETURN.prop)).toBeUndefined();
  read(d, 'hands-strap', 'Keep his example');
  read(d, 'hands-tray', 'Take that entry');
  expect(d.done('hands.o.compare')).toBe(true);
  enter(d, 'nexus.archive');
  const exhibit = inspect(d, 'ex-c');
  d.run({ type: 'ClaimSpecimen', exhibit });
  expect(d.s.inventory[specimenItemId(BIRO_RETURN.key)]).toBe(1);
}
function acquireGuide(d: Driver) {
  enter(d, 'nexus.archive');
  d.s.objectivesDone.push('m01.o6.label');
  inspect(d, 'nexus-fold-century');
  const exhibit = inspect(d, 'nexus-fold-green');
  expect(() => d.run({ type: 'ClaimSpecimen', exhibit })).toThrow(/Finish the object/);
  read(d, 'nexus-fold-porch');
  read(d, 'nexus-fold-receipt');
  expect(d.done('fold.access.compare')).toBe(true);
  d.run({ type: 'ClaimSpecimen', exhibit });
  expect(d.s.inventory[specimenItemId(GREEN_RETURN.key)]).toBe(1);
  expect(d.s.inventory['item.door-fold']).toBeUndefined();
}

const pointIn = (x: number, y: number, left: number, top: number, w: number, h: number) =>
  x >= left && x < left + w && y >= top && y < top + h;
const around = (x: number, y: number) => [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];

function reachedFromSpawn(map: MapDef): Set<string> {
  const reached = new Set<string>();
  const queue = [[map.spawn.x, map.spawn.y]];
  const blocks = [...map.blocks, ...map.stamps.flatMap((stamp) => {
    const area = STAMPS[stamp.stamp]?.collide;
    return area ? [[stamp.x + area[0], stamp.y + area[1], area[2], area[3]] as const] : [];
  }), ...map.interactables.filter(({ walkThrough }) => !walkThrough).map(({ x, y, w, h }) => [x, y, w, h] as const)];
  for (let index = 0; index < queue.length; index++) {
    const [x, y] = queue[index];
    const tag = `${x},${y}`;
    if (x < 0 || x >= map.width || y < 0 || y >= map.height || !map.floor(x, y) || reached.has(tag)
      || blocks.some(([left, top, w, h]) => pointIn(x, y, left, top, w, h))) continue;
    reached.add(tag);
    queue.push(...around(x, y));
  }
  return reached;
}

describe('Two source-bound object returns', () => {
  it('opens distinct earlier stations once each, on clear and reachable floor', () => {
    const d = new Driver();
    const art = new Set(artKeys());
    for (const station of [BIRO_RETURN, GREEN_RETURN]) {
      const exhibit = d.e.pack.exhibits.find(({ specimen }) => specimen?.key === station.key);
      expect(exhibit?.specimen?.revisit).toMatchObject({ map: station.map, prop: station.prop, method: station.method });
      expect(Object.values(MAPS).filter((m) => m.interactables.some(({ exhibit: id }) => id === exhibit?.id)).map(({ id }) => id))
        .toEqual(['nexus.archive']);
      const m = MAPS[station.map];
      const props = publicationReturnsAt(m.id);
      const reached = reachedFromSpawn(m);
      expect(props.some(({ id }) => id === station.prop)).toBe(true);
      for (const prop of props) {
        const { x, y } = prop;
        expect(art.has(prop.art!)).toBe(true);
        expect(m.interactables.filter(({ id }) => id === prop.id)).toHaveLength(1);
        expect(m.interactables.some((existing) => !props.some(({ id }) => id === existing.id)
          && pointIn(x, y, existing.x, existing.y, existing.w, existing.h))).toBe(false);
        expect(m.npcs.some((npc) => npc.x === x && npc.y === y)).toBe(false);
        expect(m.floor(x, y)).toBeTruthy();
        expect(m.blocks.some(([left, top, w, h]) => pointIn(x, y, left, top, w, h))).toBe(false);
        expect(m.stamps.some((stamp) => {
          const area = STAMPS[stamp.stamp]?.collide;
          return area && pointIn(x, y, stamp.x + area[0], stamp.y + area[1], area[2], area[3]);
        })).toBe(false);
        expect(around(x, y).some(([xx, yy]) => reached.has(`${xx},${yy}`)), prop.id).toBe(true);
      }
    }
  });

  it.each([['rail', 'Give the flat rest to Della', 'Fit the rest to Della', 'free for the next runner'],
    ['rounds', 'Send the flat rest to Idris', 'Seat the rest against the low wall', 'my next two stops']])
    ('puts the rest through the %s route only after two matched trials', (route, send, receive, result) => {
      const d = new Driver();
      acquirePen(d);
      expect(d.s.flags[`visited.map.${BIRO_RETURN.map}`]).toBe(true);
      enter(d, BIRO_RETURN.map);
      expect(visible(d, BIRO_RETURN.prop)).toBeUndefined();
      d.run({ type: 'EquipPerspective', keepsake: specimenToolId(BIRO_RETURN.key) });
      const bench = visible(d, BIRO_RETURN.prop)!;
      expect(bench.label).toContain('Hesper');
      const opts = () => d.e.visibleOptions(bench.node!, d.s).map(({ option }) => option.text);
      expect(opts()).not.toContainEqual(expect.stringContaining(send));
      read(d, bench.id, 'Lay the other strip');
      expect(d.s.flags[`${BIRO_RETURN.flag}.strap`]).toBe(4);
      expect(check(bench.artOpen?.if, d.s)).toBe(false);
      expect(opts()).not.toContainEqual(expect.stringContaining(send));
      read(d, bench.id, 'Pin one strip');
      expect(d.s.flags[`${BIRO_RETURN.flag}.fixed`]).toBe(6);
      expect(check(bench.artOpen?.if, d.s)).toBe(true);
      read(d, bench.id, send);
      expect(d.done(BIRO_RETURN.objective)).toBe(false);
      const receipt = `${BIRO_RETURN.flag}.${route}`;
      const other = `${BIRO_RETURN.flag}.${route === 'rail' ? 'rounds' : 'rail'}`;
      expect(visible(d, other)).toBeUndefined();
      saveAndResume(d);
      expect(visible(d, bench.id)).toBeUndefined();
      expect(visible(d, receipt)?.node).toBe(receipt);
      read(d, receipt, receive);
      expect(d.done(BIRO_RETURN.objective)).toBe(true);
      expect(d.e.node(visible(d, `${receipt}-result`)!.node!).text).toContain(result);
      expect(d.s.journal).toContain('j.publication.tally');
      expect(d.s.inventory[specimenItemId(BIRO_RETURN.key)]).toBe(1);
    });

  it.each([['public', 'Post the current room', 'Turn the current public notice', 'comes back at the second bell'],
    ['staffed', 'Send the current notice', 'Clip the update at Enna', 'waiting caller is inside']])
    ('uses the dated update for the %s handover only after checking the original listing and consent', (route, send, receive, result) => {
      const d = new Driver();
      enter(d, GREEN_RETURN.map);
      acquireGuide(d);
      enter(d, GREEN_RETURN.map);
      expect(d.s.flags[`visited.map.${GREEN_RETURN.map}`]).toBe(true);
      expect(visible(d, GREEN_RETURN.prop)).toBeUndefined();
      d.run({ type: 'EquipPerspective', keepsake: specimenToolId(GREEN_RETURN.key) });
      read(d, GREEN_RETURN.prop, 'Put a clip');
      const permission = visible(d, 'second-bell-permission')!;
      expect(d.e.visibleOptions(permission.node!, d.s)).toHaveLength(0);
      read(d, 'second-bell-listing', 'Clip the dated entry');
      expect(d.e.visibleOptions(permission.node!, d.s)).toHaveLength(1);
      expect(d.e.visibleOptions(visible(d, GREEN_RETURN.prop)!.node!, d.s).map(({ option }) => option.text))
        .not.toContainEqual(expect.stringContaining(send));
      read(d, permission.id, 'File the second-bell update');
      read(d, GREEN_RETURN.prop, send);
      const receipt = `${GREEN_RETURN.flag}.${route}`;
      const other = `${GREEN_RETURN.flag}.${route === 'public' ? 'staffed' : 'public'}`;
      expect(visible(d, other)).toBeUndefined();
      expect(d.done(GREEN_RETURN.objective)).toBe(false);
      d.run({ type: 'EquipPerspective', keepsake: null });
      saveAndResume(d);
      read(d, receipt, receive);
      expect(d.done(GREEN_RETURN.objective)).toBe(true);
      const readback = visible(d, `${receipt}-result`)!;
      expect(d.e.node(readback.node!).text).toContain(result);
      expect(d.s.journal).toContain('j.publication.shelter');
      expect(d.s.inventory['item.door-fold']).toBeUndefined();
    });
});
