import { describe, expect, it } from 'vitest';
import {
  SECOND_READING_ARCHIVE, SECOND_READING_CASES, SECOND_READING_ROOM,
} from '../src/content/secondReading';
import people from '../src/content/second-reading-people.json';
import { check } from '../src/domain/rules';
import { SPECIMEN_BASE, specimenItemId, specimenToolId } from '../src/domain/specimenGear';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

function prop(d: Driver, id: string) {
  const here = MAPS[d.s.mapId].interactables.find((entry) => entry.id === `second-reading-${id}`);
  if (!here) throw new Error(`Missing prop ${id} in ${d.s.mapId}`);
  return here;
}

function use(d: Driver, id: string, choice?: string) {
  const here = prop(d, id);
  expect(check(here.visibleIf, d.s), id).toBe(true);
  if (here.node) d.walk(here.node, choice ? [choice] : []);
  if (here.exhibit) d.run({ type: 'InspectExhibit', exhibit: here.exhibit });
  if (here.flag) d.run({ type: 'SetFlag', flag: here.flag, value: true });
  if (here.to) d.s.mapId = here.to.map;
  return here;
}

describe('The Second Reading Store', () => {
  it('places 36 unique dated items, original diagrams and sourced named roles with separate witness positions', () => {
    const d = new Driver();
    d.s.mapId = SECOND_READING_ROOM;
    expect(SECOND_READING_CASES).toHaveLength(36);
    const locations = new Set<string>();
    const institutions = new Set<string>();
    for (const entry of SECOND_READING_CASES) {
      const exhibit = d.e.pack.exhibits.find(({ id }) => id === entry.exhibit);
      const source = d.e.pack.sources.find(({ id }) => id === entry.source);
      expect(exhibit?.dateText, entry.title).toBe(entry.date);
      expect(exhibit?.historicalLabel).toBe('documented');
      expect(source?.url).toBe(entry.url);
      institutions.add(entry.institution);
      const position = prop(d, `${entry.slug}-case`);
      expect(locations.has(`${position.x},${position.y}`)).toBe(false);
      locations.add(`${position.x},${position.y}`);
      expect(prop(d, `${entry.slug}-bench`).y).not.toBe(prop(d, `${entry.slug}-first`).y);
      const names = (people as Record<string, { source: string }[]>)[entry.key];
      if (names) expect(exhibit?.specimen?.people).toMatchObject(names);
    }
    expect(institutions.size).toBe(4);
  });

  it.each(SECOND_READING_CASES)('loans $accession only after two checked positions and uses the equipped item at a separate archive site', (entry) => {
    const d = new Driver();
    d.s.mapId = 'council.hall';
    expect(check(prop(d, 'door').visibleIf, d.s)).toBe(false);
    d.run({ type: 'SetFlag', flag: 'council.arrived', value: true });
    use(d, 'door');
    expect(d.s.mapId).toBe(SECOND_READING_ROOM);
    const own = specimenItemId(entry.key);
    expect(check(prop(d, `${entry.slug}-bench`).visibleIf, d.s)).toBe(false);
    use(d, `${entry.slug}-case`);
    expect(() => d.run({ type: 'ClaimSpecimen', exhibit: entry.exhibit })).toThrow('Finish the object’s quest first');
    use(d, `${entry.slug}-bench`, entry.firstAction);
    expect(use(d, `${entry.slug}-first`).text).toBe(entry.firstReading);
    expect(d.done(entry.objective)).toBe(false);
    expect(check(prop(d, `${entry.slug}-second`).visibleIf, d.s)).toBe(false);
    use(d, `${entry.slug}-bench`, entry.secondAction);
    expect(check(prop(d, `${entry.slug}-first`).visibleIf, d.s)).toBe(false);
    expect(use(d, `${entry.slug}-second`).text).toBe(entry.secondReading);
    expect(d.done(entry.objective)).toBe(true);
    d.run({ type: 'ClaimSpecimen', exhibit: entry.exhibit });
    expect(d.s.inventory[own]).toBe(1);
    use(d, 'return');
    expect(d.s.mapId).toBe('council.hall');

    d.s.mapId = SECOND_READING_ARCHIVE;
    expect(check(prop(d, `${entry.slug}-return`).visibleIf, d.s)).toBe(false);
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(entry.key) });
    expect(check(prop(d, `${entry.slug}-rail`).visibleIf, d.s)).toBe(false);
    use(d, `${entry.slug}-return`, 'Hold the loan');
    expect(d.done(entry.returnObjective)).toBe(false);

    const [mode, other, action] = entry.shape === 'dial' || entry.shape === 'trace'
      ? ['rail', 'table', entry.hang] : ['table', 'rail', entry.desk];
    use(d, `${entry.slug}-return`, action);
    expect(check(prop(d, `${entry.slug}-${other}`).visibleIf, d.s)).toBe(false);
    expect(d.done(entry.returnObjective)).toBe(false);
    const mounted = use(d, `${entry.slug}-${mode}`);
    expect(mounted.text).toContain(entry.limit);
    expect(d.done(entry.returnObjective)).toBe(true);

    d.s.mapId = SPECIMEN_BASE;
    d.run({ type: 'CarrySpecimen', key: entry.key, carry: false });
    d.s.mapId = SECOND_READING_ARCHIVE;
    expect(check(prop(d, `${entry.slug}-return`).visibleIf, d.s)).toBe(false);
    expect(check(prop(d, `${entry.slug}-${mode}`).visibleIf, d.s)).toBe(true);
  });
});
