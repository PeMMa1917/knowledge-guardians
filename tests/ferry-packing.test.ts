import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { FERRY_PACKING_CASES } from '../src/content/ferryPackingCases';
import { handoffText, intakeModel, PACKING_LATEST, postedTag, receiptTag, tagFlag, tagReading } from '../src/domain/ferryPacking';
import { check } from '../src/domain/rules';
import { canClaimSpecimen, hasSpecimen, specimenToolId } from '../src/domain/specimenGear';
import { MAPS } from '../src/maps';
import { FERRY_PACKING_DOOR, FERRY_PACKING_RETURNS, FERRY_PACKING_ROOM } from '../src/maps/ferryPacking';
import { Driver } from './driver';

const pack = buildPack();

describe('A Name on the Load', () => {
  it('places 36 independent catalogued objects exactly once with distinct models and equipped returns', () => {
    expect(FERRY_PACKING_CASES).toHaveLength(36);
    expect(new Set(FERRY_PACKING_CASES.map(({ spray, resistance, opening }) => `${spray}/${resistance}/${opening}`)).size).toBe(36);
    const rooms = Object.values(MAPS);
    for (const record of FERRY_PACKING_CASES) {
      const exhibit = pack.exhibits.find(({ id }) => id === record.exhibit);
      expect(exhibit?.specimen).toMatchObject({
        key: record.key, accession: record.accession, pixelAsset: record.pixelAsset, revisit: record.revisit,
      });
      expect(pack.sources.find(({ id }) => id === record.source)?.url).toBe(record.catalogue);
      expect(rooms.flatMap((room) => room.interactables).filter((stand) => stand.exhibit === record.exhibit)).toHaveLength(1);
      expect(MAPS['nexus.archive'].interactables.find(({ id }) => id === record.revisit.prop)).toBeDefined();
    }
    expect(pack.missions.find(({ id }) => id === 'KG-CH1-R58')?.caseVisits).toHaveLength(36);
  });

  it('shows less handling or less exposure, and changes the next decision when the approach gets wetter', () => {
    const jar = FERRY_PACKING_CASES[0];
    expect(tagReading(jar, 'outside', 1)).toMatchObject({ available: true, legible: true, rain: 0 });
    expect(tagReading(jar, 'inside', 1)).toMatchObject({ available: false, rain: 0 });
    expect(tagReading(jar, 'outside', 3)).toEqual({ available: true, legible: true, rain: 2, delay: 0 });
    expect(tagReading(jar, 'inside', 3)).toEqual({ available: true, legible: true, rain: 0, delay: 3 });
    expect(tagReading(intakeModel(jar), 'outside', 3)).toEqual({ available: true, legible: false, rain: 3, delay: 0 });
    expect(tagReading(intakeModel(jar), 'outside', 3, true)).toEqual({ available: true, legible: true, rain: 0, delay: 1 });
    const bag = FERRY_PACKING_CASES.find(({ slug }) => slug === 'lakota-bag')!;
    expect(handoffText(jar, 'outside')).toContain('collects the first slot');
    expect(handoffText(bag, 'outside')).toContain('holds the slot');
    expect(handoffText(bag, 'inside')).toContain('2 extra handling moves');
  });

  it.each(['outside', 'inside'] as const)('requires the two observations and the receipt for the %s handoff to earn a copy', (position) => {
    const d = new Driver();
    expect(check(FERRY_PACKING_DOOR.visibleIf, d.s)).toBe(false);
    d.run({ type: 'SetFlag', flag: 'clue.oldmap.folded-map', value: true });
    expect(check(FERRY_PACKING_DOOR.visibleIf, d.s)).toBe(true);
    const record = FERRY_PACKING_CASES[0];
    const exhibit = pack.exhibits.find(({ id }) => id === record.exhibit);
    if (!exhibit || !hasSpecimen(exhibit)) throw new Error('Packing case has no exact exhibit');
    const receipts = FERRY_PACKING_ROOM.interactables.filter(({ id }) => id.startsWith('ferry-packing-receipt-'));
    d.run({ type: 'InspectExhibit', exhibit: exhibit.id });
    d.run({ type: 'SetFlag', flag: tagFlag(record.stem, position), value: 'clear' });
    expect(canClaimSpecimen(d.s, exhibit)).toBe(false);
    d.run({ type: 'SetFlag', flag: tagFlag(record.stem, position === 'outside' ? 'inside' : 'outside'), value: 'clear' });
    d.run({ type: 'SetFlag', flag: postedTag(record.stem), value: position });
    d.run({ type: 'SetFlag', flag: PACKING_LATEST, value: record.slug });
    expect(canClaimSpecimen(d.s, exhibit)).toBe(false);
    expect(receipts.filter((receipt) => check(receipt.visibleIf, d.s)).map(({ x, y }) => [x, y]))
      .toEqual([[position === 'outside' ? 5 : 25, 21]]);
    d.run({ type: 'SetFlag', flag: receiptTag(record.stem), value: true });
    expect(canClaimSpecimen(d.s, exhibit)).toBe(true);
    d.run({ type: 'ClaimSpecimen', exhibit: exhibit.id });
    expect(FERRY_PACKING_RETURNS.some((prop) => check(prop.visibleIf, d.s))).toBe(false);
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(record.key) });
    expect(FERRY_PACKING_RETURNS.filter((prop) => check(prop.visibleIf, d.s)).map(({ id }) => id)).toEqual([record.revisit.prop]);
  });
});
