import { describe, expect, it } from 'vitest';
import people from '../src/content/material-store-people.json';
import {
  MATERIAL_CASES, MATERIAL_HUB, MATERIAL_REVISIT, MATERIAL_ROOMS, STORE_ROUTES, storeCarry, storeReady,
} from '../src/content/materialStores';
import { STORE_FAMILIES, STORE_SIDES, checkRoute, checkTension, checkTilt, litFeature, targetSetting } from '../src/domain/materialStores';
import { check } from '../src/domain/rules';
import { carriesSpecimen, specimenToolId } from '../src/domain/specimenGear';
import { MAPS } from '../src/maps';
import type { Interactable } from '../src/maps/types';
import { Driver } from './driver';

function mapped(driver: Driver, id: string): Interactable {
  const prop = MAPS[driver.s.mapId]?.interactables.find((object) => object.id === id);
  expect(prop, id).toBeDefined();
  return prop!;
}

describe('Material Stores fixtures', () => {
  it('derives matched measurements from each control family', () => {
    const fixtures = ['merina-float', 'nupe-water-jar', 'damascus-weight', 'cairo-luster'].map((id) =>
      MATERIAL_CASES.find(({ slug }) => slug === id)!.fixture);
    const [fibre, form, travel, surface] = fixtures;
    if (fibre.kind !== 'fibres' || form.kind !== 'forms' || travel.kind !== 'travel' || surface.kind !== 'surfaces') {
      throw new Error('Missing fixture families');
    }
    expect(STORE_SIDES.map((side) => checkTension(fibre, side, targetSetting(fibre, side)))).toEqual([17.6, 20]);
    expect(STORE_SIDES.map((side) => checkTilt(form, side, targetSetting(form, side)))).toEqual([-1, 2]);
    expect(STORE_SIDES.map((side) => checkRoute(travel, side, targetSetting(travel, side)))).toEqual([4, 6]);
    expect(STORE_SIDES.map((side) => litFeature(surface, side, targetSetting(surface, side)))).toEqual([8, 12]);
  });

  it('gives each physical record one dated identity, public role, and an exact equipped follow-up', () => {
    const { pack } = new Driver().e;
    expect(MATERIAL_CASES).toHaveLength(36);
    expect(new Set(MATERIAL_CASES.map(({ object }) => object.institution)).size).toBe(4);
    expect(new Set(MATERIAL_CASES.map(({ object }) => object.asset)).size).toBe(36);
    expect(new Set(MATERIAL_CASES.map(({ returnAction }) => returnAction)).size).toBe(36);
    const roles: Record<string, { source: string }[]> = people;
    for (const record of MATERIAL_CASES) {
      const matches = pack.exhibits.filter(({ specimen }) => specimen?.key === record.object.key);
      expect(matches, record.object.key).toHaveLength(1);
      const exhibit = matches[0];
      expect(exhibit).toMatchObject({ dateText: record.object.date, historicalLabel: 'documented',
        specimen: { accession: record.object.accession, source: record.source, objective: record.objective,
          pixelAsset: record.object.asset, people: roles[record.object.key],
          revisit: { ...MATERIAL_REVISIT, method: record.returnAction } },
      });
      expect(pack.sources.find(({ id }) => id === record.source)?.url).toBe(record.object.url);
      const hints = pack.hints.filter(({ objective }) => objective === record.objective);
      expect(hints.map(({ depth }) => depth)).toEqual([1, 2, 3, 4]);
    }
    for (const family of STORE_FAMILIES) {
      const room = MATERIAL_ROOMS[family];
      const cases = MATERIAL_CASES.filter(({ fixture }) => fixture.kind === family);
      expect(cases).toHaveLength(9);
      expect(pack.missions.find(({ id }) => id === room.mission)?.caseVisits).toEqual(cases.map(({ objective }) => [objective]));
    }
  });

  it.each(MATERIAL_CASES)('uses both receipt routes and equips only the finished exact object for $title', (record) => {
    const room = MATERIAL_ROOMS[record.fixture.kind];
    const credit = [];
    for (const route of STORE_ROUTES) {
      const other = route === 'yard' ? 'channel' : 'yard';
      const d = new Driver();
      d.s.mapId = 'water.council';
      const entrance = mapped(d, 'material-stores-entrance');
      expect(check(entrance.visibleIf, d.s)).toBe(false);
      d.s.objectivesDone.push('water.arrival');
      expect(check(entrance.visibleIf, d.s)).toBe(true);
      d.s.mapId = entrance.to!.map;
      expect(d.s.mapId).toBe(MATERIAL_HUB);
      d.s.mapId = mapped(d, `material-stores-open-${record.fixture.kind}`).to!.map;
      expect(d.s.mapId).toBe(room.id);
      const fixture = mapped(d, `material-stores-${record.slug}-fixture`);
      expect(check(fixture.visibleIf, d.s)).toBe(false);
      d.run({ type: 'InspectExhibit', exhibit: mapped(d, `material-stores-${record.slug}-record`).exhibit! });
      expect(check(fixture.visibleIf, d.s)).toBe(true);
      expect(() => d.run({ type: 'ClaimSpecimen', exhibit: record.exhibit })).toThrow('Finish the object’s quest first');
      d.run({ type: 'SetFlag', flag: `${record.flag}.reading.0`, value: true });
      expect(check(storeReady(record), d.s)).toBe(false);
      d.run({ type: 'SetFlag', flag: `${record.flag}.reading.1`, value: true });
      expect(check(storeReady(record), d.s)).toBe(true);
      d.run({ type: 'SetFlag', flag: `${record.flag}.route`, value: route });
      expect(d.done(record.objective)).toBe(false);
      d.s.mapId = mapped(d, `material-stores-close-${record.fixture.kind}`).to!.map;
      d.s.mapId = mapped(d, 'material-stores-back-to-yard').to!.map;
      if (route === 'channel') d.s.mapId = mapped(d, 'water-council-to-lower').to!.map;
      const receiver = mapped(d, `material-stores-${route}-receiver`);
      expect(check(receiver.visibleIf, d.s)).toBe(true);
      const unusedReceiver = MAPS[route === 'channel' ? 'water.council' : 'water.lower-channel'].interactables
        .find(({ id }) => id === `material-stores-${other}-receiver`)!;
      expect(check(unusedReceiver.visibleIf, d.s)).toBe(false);
      expect(check(receiver.artOpen?.if, d.s)).toBe(false);
      d.run({ type: 'SetFlag', flag: record.objective, value: route });
      expect(d.done(record.objective)).toBe(true);
      expect(check(receiver.artOpen?.if, d.s)).toBe(true);
      expect(d.s.journal).toContain(`j.${record.flag}`);
      d.run({ type: 'ClaimSpecimen', exhibit: record.exhibit });
      expect(carriesSpecimen(d.s, record.object.key)).toBe(true);
      d.s.mapId = MATERIAL_REVISIT.map;
      const shelf = mapped(d, MATERIAL_REVISIT.prop);
      expect(check(shelf.visibleIf, d.s)).toBe(false);
      d.run({ type: 'EquipPerspective', keepsake: specimenToolId(record.object.key) });
      expect(check(storeCarry(record), d.s)).toBe(true);
      for (const alternate of MATERIAL_CASES.filter(({ exhibit }) => exhibit !== record.exhibit)) {
        expect(check(storeCarry(alternate), d.s)).toBe(false);
      }
      expect(check(shelf.visibleIf, d.s)).toBe(true);
      d.run({ type: 'SetSpecimenReading', exhibit: record.exhibit, reading: 'use' });
      expect(d.s.flags[record.reprise]).toBe('use');
      d.run({ type: 'EquipPerspective', keepsake: null });
      expect(check(storeCarry(record), d.s)).toBe(false);
      expect(check(shelf.visibleIf, d.s)).toBe(true);
      expect(check(shelf.artOpen?.if, d.s)).toBe(true);
      credit.push({ ...d.p.credit });
    }
    expect(credit[0]).toEqual(credit[1]);
  });
});
