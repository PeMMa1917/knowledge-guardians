import { describe, expect, it } from 'vitest';
import { activePerspective } from '../src/domain/perspectives';
import { canClaimSpecimen, carriedSpecimenCount, carriesSpecimen, hasSpecimen, ownsSpecimen,
  SPECIMEN_BASE, SPECIMEN_CAPACITY, specimenItemId, specimenReadingFlag, specimenToolId } from '../src/domain/specimenGear';
import { check } from '../src/domain/rules';
import { NUMBER_LEAF_RETURNS } from '../src/maps/numberLeaves';
import { SPECIMEN_VAULT_DOOR } from '../src/maps/specimenVault';
import { Driver } from './driver';

describe('The collection and field gear', () => {
  it('requires a real case contribution before awarding its one object', () => {
    const d = new Driver();
    const record = d.e.pack.exhibits.find(hasSpecimen)!;
    const key = record.specimen.key;
    d.run({ type: 'InspectExhibit', exhibit: record.id });
    expect(canClaimSpecimen(d.s, record)).toBe(false);
    expect(() => d.run({ type: 'ClaimSpecimen', exhibit: record.id })).toThrow('Finish the object’s quest first');
    expect(check(SPECIMEN_VAULT_DOOR.visibleIf, d.s)).toBe(false);
    d.s.objectivesDone.push(record.specimen.objective);
    d.run({ type: 'ClaimSpecimen', exhibit: record.id });
    d.run({ type: 'ClaimSpecimen', exhibit: record.id });
    expect(d.s.inventory[specimenItemId(key)]).toBe(1);
    expect(carriesSpecimen(d.s, key)).toBe(true);
    expect(check(SPECIMEN_VAULT_DOOR.visibleIf, d.s)).toBe(true);
  });

  it('stores excess objects at the Nexus and keeps swaps exclusive to the base', () => {
    const d = new Driver();
    const samples = d.e.pack.exhibits.filter(hasSpecimen).slice(0, SPECIMEN_CAPACITY + 1);
    for (const record of samples) {
      d.s.objectivesDone.push(record.specimen.objective);
      d.run({ type: 'InspectExhibit', exhibit: record.id });
      d.run({ type: 'ClaimSpecimen', exhibit: record.id });
    }
    const first = samples[0].specimen.key, fourth = samples[SPECIMEN_CAPACITY].specimen.key;
    expect(carriedSpecimenCount(d.s)).toBe(SPECIMEN_CAPACITY);
    expect(ownsSpecimen(d.s, fourth)).toBe(true);
    expect(carriesSpecimen(d.s, fourth)).toBe(false);
    expect(() => d.run({ type: 'EquipPerspective', keepsake: specimenToolId(fourth) })).toThrow('You have not earned that field tool');
    expect(() => d.run({ type: 'CarrySpecimen', key: first, carry: false })).toThrow('Swap collection objects at the Nexus');
    d.s.mapId = SPECIMEN_BASE;
    expect(() => d.run({ type: 'CarrySpecimen', key: fourth, carry: true })).toThrow('slots are full');
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(first) });
    expect(activePerspective(d.e.pack, d.s)?.id).toBe(specimenToolId(first));
    d.run({ type: 'CarrySpecimen', key: first, carry: false });
    expect(activePerspective(d.e.pack, d.s)).toBeUndefined();
    d.run({ type: 'CarrySpecimen', key: fourth, carry: true });
    expect(ownsSpecimen(d.s, first)).toBe(true);
    expect(carriesSpecimen(d.s, fourth)).toBe(true);
    expect(carriedSpecimenCount(d.s)).toBe(SPECIMEN_CAPACITY);
  });

  it('reveals only the matching earlier room interaction when its exact object is in use', () => {
    const d = new Driver();
    const record = d.e.pack.exhibits.filter(hasSpecimen).find(({ specimen }) => specimen.key === 'rbins:ishango-bone-1950')!;
    d.s.objectivesDone.push(record.specimen.objective);
    d.run({ type: 'InspectExhibit', exhibit: record.id });
    d.run({ type: 'ClaimSpecimen', exhibit: record.id });
    expect(NUMBER_LEAF_RETURNS.filter((prop) => check(prop.visibleIf, d.s))).toEqual([]);
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(record.specimen.key) });
    expect(NUMBER_LEAF_RETURNS.filter((prop) => check(prop.visibleIf, d.s)).map(({ id }) => id)).toEqual(['number-leaf-return-ishango']);
    d.run({ type: 'SetSpecimenReading', exhibit: record.id, reading: 'source' });
    expect(d.s.flags[specimenReadingFlag(record.specimen.key)]).toBe('source');
    d.run({ type: 'EquipPerspective', keepsake: null });
    expect(NUMBER_LEAF_RETURNS.filter((prop) => check(prop.visibleIf, d.s))).toEqual([]);
    expect(() => d.run({ type: 'SetSpecimenReading', exhibit: record.id, reading: 'use' })).toThrow('Bring the object to its stand');
    expect(d.s.flags[specimenReadingFlag(record.specimen.key)]).toBe('source');
  });
});
