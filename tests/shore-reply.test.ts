import { describe, expect, it } from 'vitest';
import { SHORE_REPLY_CASES, SHORE_REPLY_PIER, SHORE_REPLY_ROOM } from '../src/content/shoreReply';
import people from '../src/content/shore-reply-people.json';
import { check } from '../src/domain/rules';
import { SPECIMEN_BASE, specimenItemId, specimenToolId } from '../src/domain/specimenGear';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

function prop(d: Driver, id: string) {
  const here = MAPS[d.s.mapId].interactables.find((entry) => entry.id === `shore-reply-${id}`);
  if (!here) throw new Error(`Missing ${id} in ${d.s.mapId}`);
  return here;
}

function interact(d: Driver, id: string, choice?: string) {
  const here = prop(d, id);
  expect(check(here.visibleIf, d.s), id).toBe(true);
  if (here.exhibit) d.run({ type: 'InspectExhibit', exhibit: here.exhibit });
  if (here.node) d.walk(here.node, choice ? [choice] : []);
  if (here.flag) d.run({ type: 'SetFlag', flag: here.flag, value: true });
  if (here.to) d.s.mapId = here.to.map;
  return here;
}

describe('The Reply from Shore', () => {
  it('opens an optional, reversible path and preserves four custodians’ dated identities and people', () => {
    const d = new Driver();
    d.s.mapId = 'sea.shoal';
    expect(check(prop(d, 'door').visibleIf, d.s)).toBe(false);
    d.s.objectivesDone.push('sea.arrival');
    interact(d, 'door');
    expect(d.s.mapId).toBe(SHORE_REPLY_ROOM);
    expect(SHORE_REPLY_CASES).toHaveLength(36);
    expect(new Set(SHORE_REPLY_CASES.map(({ institution }) => institution)).size).toBe(4);
    const positions = new Set<string>();
    for (const entry of SHORE_REPLY_CASES) {
      const exhibit = d.e.pack.exhibits.find(({ id }) => id === entry.exhibit);
      expect(exhibit?.name).toBe(entry.title);
      expect(exhibit?.dateText).toBe(entry.date);
      expect(exhibit?.historicalLabel).toBe('documented');
      expect(d.e.pack.sources.find(({ id }) => id === entry.source)?.url).toBe(entry.url);
      const associated = (people as Record<string, { name: string }[]>)[entry.key];
      if (associated) expect(exhibit?.specimen?.people).toMatchObject(associated);
      const { x, y } = prop(d, `${entry.slug}-case`);
      expect(positions.has(`${x},${y}`)).toBe(false);
      positions.add(`${x},${y}`);
    }
    interact(d, 'exit');
    expect(d.s.mapId).toBe('sea.shoal');
    expect(d.done('sea.finish')).toBe(false);
  });

  it.each(SHORE_REPLY_CASES)('accepts its own two-end check and an equipped reply for $accession', (entry) => {
    const d = new Driver();
    d.s.mapId = SHORE_REPLY_ROOM;
    d.s.objectivesDone.push('sea.arrival');
    const id = (step: string) => `${entry.slug}-${step}`;
    expect(check(prop(d, id('first')).visibleIf, d.s)).toBe(false);
    interact(d, id('case'));
    expect(() => d.run({ type: 'ClaimSpecimen', exhibit: entry.exhibit })).toThrow('Finish the object’s quest first');
    expect(check(prop(d, id('second')).visibleIf, d.s)).toBe(false);
    interact(d, id('first'), entry.firstAction);
    expect(check(prop(d, id('second')).visibleIf, d.s)).toBe(false);
    expect(interact(d, id('first-view')).text).toBe(entry.firstView);
    interact(d, id('second'), entry.secondAction);
    expect(d.done(entry.check)).toBe(false);
    expect(interact(d, id('second-view')).text).toBe(entry.secondView);
    d.run({ type: 'ClaimSpecimen', exhibit: entry.exhibit });
    expect(d.s.inventory[specimenItemId(entry.key)]).toBe(1);

    d.s.mapId = SHORE_REPLY_PIER;
    expect(check(prop(d, id('return')).visibleIf, d.s)).toBe(false);
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(entry.key) });
    interact(d, id('return'), 'Keep the outgoing slip');
    expect(check(prop(d, id('high')).visibleIf, d.s)).toBe(false);
    expect(check(prop(d, id('low')).visibleIf, d.s)).toBe(false);

    const firstDestination = entry.family === 'signal' ? 'low' : 'high';
    const other = firstDestination === 'low' ? 'high' : 'low';
    interact(d, id('return'), entry[firstDestination]);
    expect(check(prop(d, id(other)).visibleIf, d.s)).toBe(false);
    expect(d.done(entry.received)).toBe(false);
    expect(interact(d, id(firstDestination)).text).toContain(entry.limit);
    expect(d.done(entry.received)).toBe(true);

    interact(d, id('return'), entry[other]);
    expect(check(prop(d, id(firstDestination)).visibleIf, d.s)).toBe(false);
    expect(interact(d, id(other)).text).toContain(entry[other]);
    d.s.mapId = SPECIMEN_BASE;
    d.run({ type: 'CarrySpecimen', key: entry.key, carry: false });
    d.s.mapId = SHORE_REPLY_PIER;
    expect(check(prop(d, id('return')).visibleIf, d.s)).toBe(false);
    expect(check(prop(d, id(other)).visibleIf, d.s)).toBe(true);
  });
});
