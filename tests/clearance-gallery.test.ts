import { describe, expect, it } from 'vitest';
import { CLEARANCE_CASES, compareRail } from '../src/content/clearanceCases';
import { MAPS } from '../src/maps';
import { CLEARANCE_DOOR, CLEARANCE_GALLERY } from '../src/maps/clearanceGallery';
import { check } from '../src/domain/rules';
import { Driver } from './driver';

describe('The Gallery with Two Rails', () => {
  it('opens after the first Cold Store display and locates each exact specimen once', () => {
    const d = new Driver();
    expect(check(CLEARANCE_DOOR.visibleIf, d.s)).toBe(false);
    d.s.objectivesDone.push('preserved.publish');
    expect(check(CLEARANCE_DOOR.visibleIf, d.s)).toBe(true);
    expect(CLEARANCE_DOOR.to?.map).toBe(CLEARANCE_GALLERY.id);
    for (const entry of CLEARANCE_CASES) {
      const locations = Object.values(MAPS).flatMap((map) => map.interactables.filter((prop) => prop.exhibit === entry.exhibit).map(() => map.id));
      expect(locations, entry.accession).toEqual([CLEARANCE_GALLERY.id]);
      const record = d.e.pack.exhibits.find((item) => item.id === entry.exhibit);
      expect(record?.specimen).toMatchObject({ accession: entry.accession, objective: entry.objective });
      expect(record?.specimen?.pixelAsset).toBe(`specimens/cma-${entry.accession}.jpg`);
    }
  });

  it('holds the measurement of the documented edge and forbids enlarging it as original scale', () => {
    expect(compareRail(38.7, 'near')).toEqual({ aperture: 18, scale: 18 / 38.7 });
    expect(compareRail(38.7, 'wide')).toEqual({ aperture: 42, scale: 1 });
    expect(compareRail(2.4, 'near')).toEqual({ aperture: 18, scale: 1 });
  });

  it.each(['near', 'wide'] as const)('records the %s reader’s reply after both frame trials', (rail) => {
    const d = new Driver();
    const [entry, other] = CLEARANCE_CASES;
    const station = CLEARANCE_GALLERY.interactables.find(({ id }) => id === `fit-${entry.slug}`)!;
    d.s.objectivesDone.push('preserved.publish');
    expect(check(station.visibleIf, d.s)).toBe(false);
    d.run({ type: 'InspectExhibit', exhibit: entry.exhibit });
    expect(check(station.visibleIf, d.s)).toBe(true);
    d.run({ type: 'SetFlag', flag: `${entry.flag}.tested.near`, value: true });
    d.run({ type: 'SetFlag', flag: `${entry.flag}.route`, value: rail });
    d.run({ type: 'SetFlag', flag: `${entry.flag}.read`, value: rail === 'wide' ? 'near' : 'wide' });
    expect(d.done(entry.objective)).toBe(false);
    d.run({ type: 'SetFlag', flag: `${entry.flag}.tested.wide`, value: true });
    expect(d.done(entry.objective)).toBe(false);
    d.run({ type: 'SetFlag', flag: `${entry.flag}.read`, value: rail });
    expect(d.done(entry.objective)).toBe(false);
    d.run({ type: 'SetFlag', flag: `${entry.flag}.proof.${rail}`, value: 'edge' });
    expect(d.done(entry.objective)).toBe(true);
    expect(d.done(other.objective)).toBe(false);
    expect(d.s.journal).toContain(`j.${entry.flag}`);
  });
});
