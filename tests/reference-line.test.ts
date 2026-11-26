import { describe, expect, it } from 'vitest';
import { REFERENCE_CASES, REFERENCE_LAYOUTS } from '../src/content/referenceLine';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { REFERENCE_FLOOR, REFERENCE_HALL_DOOR, REFERENCE_LANES, REFERENCE_YARD_DOOR } from '../src/maps/referenceLine';
import type { MapDef } from '../src/maps/types';
import { Driver } from './driver';

const isVisible = (map: MapDef, id: string, d: Driver) => {
  const prop = map.interactables.find((item) => item.id === id);
  expect(prop, id).toBeDefined();
  return check(prop!.visibleIf, d.s);
};

const gateShut = (y: number, d: Driver) => check(REFERENCE_LANES.conditionalBlocks!.find((gate) => gate.y === y)!.when, d.s);

describe('A Line That Travels', () => {
  it('places each dated object once and opens both entrances on arrival to the Metalworks', () => {
    const d = new Driver();
    expect(MAPS['metalworks.reference-floor']).toBe(REFERENCE_FLOOR);
    expect(MAPS['metalworks.reference-lanes']).toBe(REFERENCE_LANES);
    expect(MAPS['metalworks.records'].interactables).toContain(REFERENCE_HALL_DOOR);
    expect(MAPS['metalworks.yard'].interactables).toContain(REFERENCE_YARD_DOOR);
    for (const entrance of [REFERENCE_HALL_DOOR, REFERENCE_YARD_DOOR]) expect(check(entrance.visibleIf, d.s)).toBe(false);
    d.s.objectivesDone.push('metal.arrival');
    for (const entrance of [REFERENCE_HALL_DOOR, REFERENCE_YARD_DOOR]) expect(check(entrance.visibleIf, d.s)).toBe(true);
    expect(REFERENCE_CASES).toHaveLength(24);
    expect(new Set(REFERENCE_CASES.map((entry) => entry.key)).size).toBe(24);
    for (const entry of REFERENCE_CASES) {
      const placements = Object.values(MAPS).flatMap((map) => map.interactables
        .filter((spot) => spot.exhibit === entry.exhibit).map(() => map.id));
      expect(placements, entry.accession).toEqual([REFERENCE_FLOOR.id]);
      const exhibit = d.e.pack.exhibits.find(({ id }) => id === entry.exhibit);
      expect(exhibit).toMatchObject({
        dateText: entry.date, historicalLabel: 'documented',
        specimen: { key: entry.key, accession: entry.accession, source: entry.source, objective: entry.objective, pixelAsset: entry.asset },
      });
    }
  });

  it.each(REFERENCE_LAYOUTS)('gives the %s setup its own crossing and checked reply for every exhibit', (mode) => {
    const d = new Driver();
    d.s.objectivesDone.push('metal.arrival');
    const paired = mode === 'paired';
    expect(gateShut(7, d)).toBe(true);
    expect(gateShut(11, d)).toBe(true);

    for (const entry of REFERENCE_CASES) {
      const id = `line-${entry.slug}`;
      d.s.mapId = REFERENCE_FLOOR.id;
      expect(isVisible(REFERENCE_FLOOR, `${id}-order`, d)).toBe(false);
      d.run({ type: 'InspectExhibit', exhibit: entry.exhibit });
      expect(isVisible(REFERENCE_FLOOR, `${id}-order`, d)).toBe(true);
      d.walk(`${entry.flag}.order`, [paired ? 'Order two supports' : 'Order one fixed support']);
      expect(d.done(entry.objective)).toBe(false);
      d.s.mapId = REFERENCE_LANES.id;
      expect(isVisible(REFERENCE_LANES, `${id}-check-${mode}`, d)).toBe(false);
      d.walk(`${entry.flag}.install.${mode}`, [paired ? 'Set down both supports' : 'Set down the fixed stop']);
      expect(d.done(entry.objective)).toBe(false);
      expect(gateShut(7, d)).toBe(paired);
      expect(gateShut(11, d)).toBe(true);

      if (paired) {
        expect(isVisible(REFERENCE_LANES, `${id}-check-paired`, d)).toBe(false);
        d.walk(`${entry.flag}.match`, [entry.nearAction]);
        expect(gateShut(11, d)).toBe(false);
        expect(d.done(entry.objective)).toBe(false);
      }

      expect(isVisible(REFERENCE_LANES, `${id}-check-${mode}`, d)).toBe(true);
      d.walk(`${entry.flag}.check.${mode}`, [paired ? entry.farAction : entry.nearAction]);
      expect(d.done(entry.objective)).toBe(true);
      expect(isVisible(REFERENCE_LANES, `${id}-receipt-${mode}`, d)).toBe(true);
      expect(isVisible(REFERENCE_FLOOR, `${id}-reply-${mode}`, d)).toBe(true);
      expect(d.s.journal).toContain(`j.${entry.flag}.${mode}`);
    }
    expect(d.done('metal.finish')).toBe(false);
  });

  it('holds only one order until it is carried through or returned unmounted', () => {
    const d = new Driver();
    d.s.objectivesDone.push('metal.arrival');
    d.s.mapId = REFERENCE_FLOOR.id;
    const [first, second] = REFERENCE_CASES;
    for (const entry of [first, second]) d.run({ type: 'InspectExhibit', exhibit: entry.exhibit });
    d.walk(`${first.flag}.order`, ['Order one fixed support']);
    expect(isVisible(REFERENCE_FLOOR, `line-${second.slug}-order`, d)).toBe(false);
    expect(isVisible(REFERENCE_FLOOR, `line-${first.slug}-cancel`, d)).toBe(true);
    d.walk(`${first.flag}.cancel`, ['Put back the unmounted order']);
    expect(isVisible(REFERENCE_FLOOR, `line-${second.slug}-order`, d)).toBe(true);
    expect(isVisible(REFERENCE_LANES, `line-${first.slug}-install-compact`, d)).toBe(false);
  });
});
