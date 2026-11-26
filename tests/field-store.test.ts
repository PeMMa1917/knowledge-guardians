import { describe, expect, it } from 'vitest';
import {
  FIELD_ROUTES, FIELD_STORE_CASES, FIELD_STORE_LAST,
} from '../src/content/fieldStore';
import people from '../src/content/field-store-people.json';
import { check } from '../src/domain/rules';
import { ownsSpecimen, SPECIMEN_BASE, specimenToolId } from '../src/domain/specimenGear';
import { MAPS } from '../src/maps';
import { FIELD_STORE, FIELD_STORE_DOOR } from '../src/maps/fieldStore';
import type { MapDef } from '../src/maps/types';
import { Driver } from './driver';

function prop(map: MapDef, id: string) {
  const found = map.interactables.find((item) => item.id === id);
  expect(found, id).toBeDefined();
  return found!;
}

describe('The Place and the Bell', () => {
  it('places every dated accession once with a different earlier-map use and exact role references', () => {
    const d = new Driver();
    expect(check(FIELD_STORE_DOOR.visibleIf, d.s)).toBe(false);
    d.s.objectivesDone.push('water.arrival');
    expect(check(FIELD_STORE_DOOR.visibleIf, d.s)).toBe(true);
    expect(MAPS['water.council'].interactables).toContain(FIELD_STORE_DOOR);
    expect(prop(MAPS['water.field-store'], 'field-store-return').to).toEqual(prop(FIELD_STORE, 'field-store-return').to);
    expect(FIELD_STORE_CASES).toHaveLength(36);
    expect(new Set(FIELD_STORE_CASES.map((entry) => entry.key)).size).toBe(36);
    expect(new Set(FIELD_STORE_CASES.map((entry) => entry.revisitAction)).size).toBe(36);

    for (const entry of FIELD_STORE_CASES) {
      const places = Object.values(MAPS).flatMap((map) => map.interactables
        .filter((item) => item.exhibit === entry.exhibit).map(() => map.id));
      expect(places, entry.accession).toEqual([FIELD_STORE.id]);
      expect(d.e.pack.exhibits.find(({ id }) => id === entry.exhibit)).toMatchObject({
        dateText: entry.date, historicalLabel: 'documented',
        specimen: { key: entry.key, accession: entry.accession, source: entry.source,
          objective: entry.objective, pixelAsset: entry.asset, revisit: entry.revisit },
      });
      const revisit = prop(MAPS['observatory.inland'], entry.revisit.prop);
      expect(check(revisit.visibleIf, d.s)).toBe(false);
    }
    for (const [key, credited] of Object.entries(people)) {
      const entry = FIELD_STORE_CASES.find((record) => record.key === key);
      expect(entry).toBeDefined();
      expect(credited.every(({ source }) => source === entry?.source)).toBe(true);
    }
  });

  it('puts the later time at the original notch, and the later place at a separate post', () => {
    const timeStart = prop(FIELD_STORE, 'field-store-time-start');
    const timeNext = prop(FIELD_STORE, 'field-store-time-next');
    expect([timeStart.x, timeStart.y]).toEqual([timeNext.x, timeNext.y]);
    expect(timeStart.art).not.toBe(timeNext.art);
    const near = prop(FIELD_STORE, 'field-store-place-start');
    const far = prop(FIELD_STORE, 'field-store-place-next');
    expect([near.x, near.y]).not.toEqual([far.x, far.y]);
  });

  it.each(FIELD_ROUTES)('tests the %s, earns the exact copy and uses it again at Marl Fold', (route) => {
    const d = new Driver();
    const timed = route === 'time';
    const fold = MAPS['observatory.inland'];
    d.s.objectivesDone.push('water.arrival');
    for (const entry of FIELD_STORE_CASES) {
      d.s.mapId = FIELD_STORE.id;
      const choose = prop(FIELD_STORE, `field-store-${entry.slug}-plan`);
      const first = prop(FIELD_STORE, `field-store-${route}-start`);
      const next = prop(FIELD_STORE, `field-store-${route}-next`);
      d.run({ type: 'InspectExhibit', exhibit: entry.exhibit });
      expect(check(choose.visibleIf, d.s)).toBe(true);
      d.walk(choose.node!, [timed ? 'Hold the place' : 'Hold the bell']);
      expect(d.done(entry.objective)).toBe(false);
      expect(check(first.visibleIf, d.s)).toBe(true);
      expect(check(next.visibleIf, d.s)).toBe(false);
      d.walk(first.node!, [entry.anchor]);
      expect(check(first.visibleIf, d.s)).toBe(false);
      expect(check(next.visibleIf, d.s)).toBe(true);
      d.walk(next.node!, [entry.anchor]);
      expect(d.done(entry.objective)).toBe(true);
      expect(d.s.journal).toContain(`j.${entry.flag}.${route}`);
      expect(check(prop(FIELD_STORE, `field-store-${entry.slug}-reply-${route}`).visibleIf, d.s)).toBe(true);

      d.run({ type: 'ClaimSpecimen', exhibit: entry.exhibit });
      expect(ownsSpecimen(d.s, entry.key)).toBe(true);
      d.s.mapId = fold.id;
      const revisit = prop(fold, entry.revisit.prop);
      expect(check(revisit.visibleIf, d.s)).toBe(false);
      d.run({ type: 'EquipPerspective', keepsake: specimenToolId(entry.key) });
      expect(check(revisit.visibleIf, d.s)).toBe(true);
      d.walk(revisit.node!, [entry.revisitAction]);
      expect(d.s.flags[FIELD_STORE_LAST]).toBe(entry.slug);
      expect(d.s.journal).toContain(`j.${entry.flag}.fold`);
      expect(check(revisit.visibleIf, d.s)).toBe(false);
      expect(check(prop(fold, `field-store-fold-reply-${entry.slug}`).visibleIf, d.s)).toBe(true);
      d.s.mapId = SPECIMEN_BASE;
      d.run({ type: 'CarrySpecimen', key: entry.key, carry: false });
    }
    expect(d.done('water.publish')).toBe(false);
  });

  it('lets another reference take a turn after the first is put back', () => {
    const d = new Driver();
    const [first, second] = FIELD_STORE_CASES;
    d.s.objectivesDone.push('water.arrival');
    d.s.mapId = FIELD_STORE.id;
    for (const entry of [first, second]) d.run({ type: 'InspectExhibit', exhibit: entry.exhibit });
    d.walk(`${first.flag}.choose`, ['Hold the place']);
    d.walk('field-store.bench.time.first', [first.anchor]);
    expect(check(prop(FIELD_STORE, `field-store-${second.slug}-plan`).visibleIf, d.s)).toBe(false);
    d.walk(`${first.flag}.cancel`, ['Return the reference']);
    expect(check(prop(FIELD_STORE, `field-store-${second.slug}-plan`).visibleIf, d.s)).toBe(true);
    expect(check(prop(FIELD_STORE, 'field-store-time-next').visibleIf, d.s)).toBe(false);
    d.walk(`${first.flag}.choose`, ['Hold the place']);
    expect(check(prop(FIELD_STORE, 'field-store-time-start').visibleIf, d.s)).toBe(true);
  });
});
