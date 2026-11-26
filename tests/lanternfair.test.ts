import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { emptyPair, parsePair, serialisePair, writeSuspend } from '../src/domain/saves';
import { EMBERFORD } from '../src/maps/emberford';
import { ISLAND_DOCK } from '../src/maps/island';
import type { MapDef } from '../src/maps/types';
import { Driver } from './driver';

type Layout = 'ring' | 'trail';
type Role = 'runner' | 'host';
const prefix = 'lanternfair.';

function prop(map: MapDef, area: string, id: string) {
  const found = map.interactables.find((o) => o.id === `lanternfair-${area}-${id}`);
  if (!found) throw new Error(`Unknown fair prop ${area}-${id}`);
  return found;
}

function interacts(d: Driver, map: MapDef, area: string, id: string, ...choices: string[]) {
  const entry = prop(map, area, id);
  expect(d.s.mapId).toBe(map.id);
  expect(check(entry.visibleIf, d.s)).toBe(true);
  if (!entry.node) throw new Error(`No scene at ${area}-${id}`);
  d.walk(entry.node, choices);
}

const canEmber = (d: Driver, id: string) => check(prop(EMBERFORD, 'emberford', id).visibleIf, d.s);
const actEmber = (d: Driver, id: string, ...choices: string[]) => interacts(d, EMBERFORD, 'emberford', id, ...choices);
const canIsland = (d: Driver, id: string) => check(prop(ISLAND_DOCK, 'island', id).visibleIf, d.s);
const actIsland = (d: Driver, id: string, ...choices: string[]) => interacts(d, ISLAND_DOCK, 'island', id, ...choices);

function rehearse(d: Driver, role: Role, layout: Layout) {
  d.s.mapId = EMBERFORD.id;
  d.run({ type: 'Reach', zone: 'emberford' });
  const ring = layout === 'ring';
  actEmber(d, 'role', role === 'runner' ? 'runner’s peg' : 'host’s cup', ring ? 'Hang all three' : 'Share the lanterns');
  const road = ring ? 'road' : 'road-trail';
  const bench = ring ? 'bench' : 'bench-trail';
  expect(canEmber(d, road)).toBe(role === 'runner');
  expect(canEmber(d, bench)).toBe(role === 'host');
  expect(canEmber(d, 'send')).toBe(false);
  for (const id of role === 'runner' ? [road, bench] : [bench, road]) actEmber(d, id);
  expect(canEmber(d, 'send')).toBe(true);
}

function reachIslandAfterHandoff(d: Driver) {
  d.s.mapId = ISLAND_DOCK.id;
  expect(canIsland(d, 'slip')).toBe(false);
  d.s.objectivesDone.push('island.log');
  expect(canIsland(d, 'slip')).toBe(true);
}

function openOnIsland(d: Driver, layout: Layout) {
  expect(canIsland(d, 'board')).toBe(false);
  actIsland(d, 'ramp', 'Walk the turn');
  expect(canIsland(d, 'board')).toBe(false);
  actIsland(d, 'listening', 'Carry the first line');
  expect(d.done(prefix + 'island.o.check')).toBe(true);
  actIsland(d, 'board', layout === 'ring' ? 'Set the ring' : 'Light the landward trail');
  const other = layout === 'ring' ? 'trail' : 'ring';
  expect(canIsland(d, `open-${other}`)).toBe(false);
  expect(canIsland(d, `toast-${layout}`)).toBe(false);
  actIsland(d, `open-${layout}`);
  expect(canIsland(d, `open-${layout}`)).toBe(false);
  expect(canIsland(d, `toast-${layout}`)).toBe(true);
  expect(canIsland(d, `toast-${other}`)).toBe(false);
  expect(prop(ISLAND_DOCK, 'island', `toast-${layout}`).sfx).toBe(layout === 'ring' ? 'sfx.complete' : 'sfx.metal');
  actIsland(d, `toast-${layout}`);
  expect(d.done(prefix + 'island.o.open')).toBe(true);
}

describe('The two Lantern Fairs', () => {
  it('rehearses both jobs, keeps the previous dispatch while moving the lamps, and only replaces it after both checks', () => {
    const d = new Driver();
    expect(canEmber(d, 'role')).toBe(false);
    rehearse(d, 'runner', 'ring');
    expect(d.done(prefix + 'emberford.o.watch')).toBe(true);
    actEmber(d, 'send', 'Send the ring');
    expect(canEmber(d, 'toast-ring')).toBe(true);
    expect(canEmber(d, 'toast-trail')).toBe(false);

    rehearse(d, 'host', 'trail');
    expect(d.s.flags[prefix + 'emberford.plan']).toBe('ring');
    actEmber(d, 'send', 'Send the trail');
    expect(d.s.flags[prefix + 'emberford.plan']).toBe('trail');
    expect(canEmber(d, 'toast-ring')).toBe(false);
    expect(canEmber(d, 'toast-trail')).toBe(true);
    expect(d.s.journal.filter((j) => j === 'j.lanternfair.emberford')).toHaveLength(1);
    expect(d.s.marks).toBe(0);
    expect(d.p.credit).toEqual({});
  });

  it.each([
    ['ring', 'ring'], ['ring', 'trail'], ['trail', 'ring'], ['trail', 'trail'],
  ] as const)('can bring the Emberford %s and choose %s after respecting the Island movement and song checks', (imported, placed) => {
    const d = new Driver();
    rehearse(d, 'runner', imported);
    actEmber(d, 'send', `Send the ${imported}`);
    reachIslandAfterHandoff(d);
    actIsland(d, 'slip', `Put Hana’s ${imported}`);
    expect(canIsland(d, `binder-${imported}`)).toBe(true);
    expect(canIsland(d, 'binder-local')).toBe(false);
    const main = d.s.objectivesDone.filter((id) => id.startsWith('island.'));
    openOnIsland(d, placed);
    expect(d.s.flags[prefix + 'island.source']).toBe(imported);
    expect(d.s.flags[prefix + 'island.plan']).toBe(placed);
    expect(d.s.flags[prefix + 'island.open']).toBe(true);
    expect(d.s.objectivesDone.filter((id) => id.startsWith('island.'))).toEqual(main);
    expect(d.s.marks).toBe(0);
    expect(d.p.credit).toEqual({});
  });

  it('can use a local sketch, survive a save between placements, and keep the chosen source if Emberford sends a later copy', () => {
    const d = new Driver();
    reachIslandAfterHandoff(d);
    actIsland(d, 'slip', 'Unfold the Island crew’s chalk sketch');
    expect(canIsland(d, 'binder-local')).toBe(true);
    actIsland(d, 'ramp');
    actIsland(d, 'listening');
    actIsland(d, 'board', 'Set the ring');
    actIsland(d, 'board', 'Light the landward trail');
    expect(canIsland(d, 'open-ring')).toBe(false);

    const save = writeSuspend(emptyPair(), { kind: 'suspend', label: 'Fair plan', location: ISLAND_DOCK.name,
      savedAt: '2026-11-26T00:00:00.000Z', state: d.s });
    const loaded = parsePair(serialisePair(save));
    if (!loaded.ok || !loaded.pair.continue) throw new Error('Fair plan did not load');
    d.s = loaded.pair.continue.state;
    actIsland(d, 'open-trail');
    expect(canIsland(d, 'toast-trail')).toBe(true);

    rehearse(d, 'host', 'ring');
    actEmber(d, 'send', 'Send the ring');
    expect(canIsland(d, 'binder-local')).toBe(true);
    expect(canIsland(d, 'binder-ring')).toBe(false);
    expect(d.s.flags[prefix + 'island.plan']).toBe('trail');
  });
});
