import { describe, expect, it } from 'vitest';
import { earlierViews } from '../src/content/earlierViewing';
import { check } from '../src/domain/rules';
import { SPECIMEN_BASE, specimenToolId } from '../src/domain/specimenGear';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

describe('Named collection returns', () => {
  it('keeps the one original object and a matching equipped-use station in the older room', () => {
    const d = new Driver();
    for (const record of earlierViews) {
      const exhibit = d.e.pack.exhibits.find(({ specimen }) => specimen?.key === record.key)!;
      const place = MAPS[record.map];
      const fixture = place.interactables.find(({ id }) => id === record.prop)!;
      expect(place.world).toBe(record.world);
      expect(exhibit.specimen?.revisit?.prop).toBe(fixture.id);
      for (const other of place.interactables.filter(({ id }) => id !== fixture.id)) {
        const footprintOverlap = fixture.x >= other.x && fixture.x < other.x + other.w
          && fixture.y >= other.y && fixture.y < other.y + other.h;
        expect(footprintOverlap, `${record.prop} overlaps ${other.id}`).toBe(false);
      }
      expect(check(fixture.visibleIf, d.s)).toBe(false);
      d.s.objectivesDone.push(exhibit.specimen!.objective);
      d.run({ type: 'InspectExhibit', exhibit: exhibit.id });
      d.run({ type: 'ClaimSpecimen', exhibit: exhibit.id });
      d.run({ type: 'EquipPerspective', keepsake: specimenToolId(record.key) });
      expect(check(fixture.visibleIf, d.s)).toBe(true);
      d.run({ type: 'SetFlag', flag: `${record.flag}.begun`, value: true });
      d.run({ type: 'SetFlag', flag: `${record.flag}.view.0`, value: true });
      expect(d.done(record.flag)).toBe(false);
      d.run({ type: 'SetFlag', flag: `${record.flag}.view.1`, value: true });
      expect(d.done(record.flag)).toBe(false);
      d.run({ type: 'SetFlag', flag: `${record.flag}.layout`, value: 'paired' });
      expect(d.done(record.flag)).toBe(true);
      expect(d.s.adventureDiary.entries.find(e => e.id === 'quest:' + record.flag)?.text).toBe(record.journal);
      if (record.id === 'memory-board') expect(d.p.skills['SK-MICRO-0939']).toContainEqual(expect.stringContaining(record.flag));
      d.s.mapId = SPECIMEN_BASE;
      d.run({ type: 'CarrySpecimen', key: record.key, carry: false });
      expect(check(fixture.visibleIf, d.s)).toBe(false);
    }
  });
});
