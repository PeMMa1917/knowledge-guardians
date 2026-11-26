import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { TIME_CASES } from '../src/content/timeRoomCases';
import { MAKER_RETURNS } from '../src/domain/makerReturns';
import { check } from '../src/domain/rules';
import { canClaimSpecimen, hasSpecimen, specimenToolId } from '../src/domain/specimenGear';
import { clockReading, shiftedTrial, timeChoice, TIME_PULSES, trialFlag, trialModel } from '../src/domain/timeRoom';
import { MAPS } from '../src/maps';
import { TIME_ROOM, TIME_ROOM_DOOR, TIME_STUDY_RETURNS } from '../src/maps/timeRoom';
import { Driver } from './driver';

const pack = buildPack();

describe('When the Two Clocks Agree', () => {
  it('gives 40 bounded accession records distinct model profiles and matching equipped returns', () => {
    expect(TIME_CASES).toHaveLength(40);
    const profiles = new Set<string>();
    for (const record of TIME_CASES) {
      const exhibit = pack.exhibits.find(({ id }) => id === record.exhibit);
      expect(exhibit?.specimen).toMatchObject({
        accession: record.accession, key: record.key, source: record.source, pixelAsset: record.pixelAsset, revisit: record.revisit,
      });
      expect(pack.sources.find(({ id }) => id === record.source)?.url).toBe(record.catalogue);
      expect(TIME_ROOM.interactables.filter((stand) => stand.exhibit === record.exhibit)).toHaveLength(1);
      expect(TIME_STUDY_RETURNS.find(({ id }) => id === record.revisit.prop)).toBeDefined();
      expect(profiles.has(`${record.offset}.${record.drift}`)).toBe(false);
      profiles.add(`${record.offset}.${record.drift}`);
    }
    expect(pack.missions.find(({ id }) => id === 'KG-CH1-R52')?.caseVisits).toHaveLength(40);
  });

  it('observes the difference between matching the first mark and matching the pace', () => {
    const model = { offset: 3, drift: -2 };
    const start = trialModel(model, 'start');
    const pace = trialModel(model, 'pace');
    expect(clockReading(0, start)).toEqual({ reference: 0, display: 0, difference: 0 });
    expect(clockReading(TIME_PULSES, start)).toEqual({ reference: 24, display: 18, difference: -6 });
    expect(clockReading(0, pace).difference).toBe(3);
    expect(clockReading(TIME_PULSES, pace).difference).toBe(3);
    expect(clockReading(TIME_PULSES, shiftedTrial(model), 10)).toEqual({ reference: 30, display: 41, difference: 11 });
  });

  it.each(['arrival', 'relay'] as const)('earns the specimen only after two timed tests and the %s notice', (choice) => {
    const d = new Driver();
    expect(check(TIME_ROOM_DOOR.visibleIf, d.s)).toBe(false);
    d.run({ type: 'SetFlag', flag: 'study.letter', value: true });
    expect(check(TIME_ROOM_DOOR.visibleIf, d.s)).toBe(true);
    const record = TIME_CASES[0];
    const exhibit = pack.exhibits.find(({ id }) => id === record.exhibit);
    if (!exhibit || !hasSpecimen(exhibit)) throw new Error('Time case has no exact exhibit');
    d.run({ type: 'InspectExhibit', exhibit: exhibit.id });
    d.run({ type: 'SetFlag', flag: trialFlag(record.stem, 'start'), value: true });
    d.run({ type: 'SetFlag', flag: timeChoice(record.stem), value: choice });
    expect(canClaimSpecimen(d.s, exhibit)).toBe(false);
    d.run({ type: 'SetFlag', flag: trialFlag(record.stem, 'pace'), value: true });
    expect(canClaimSpecimen(d.s, exhibit)).toBe(true);
    d.run({ type: 'ClaimSpecimen', exhibit: exhibit.id });
    expect(TIME_STUDY_RETURNS.some((prop) => check(prop.visibleIf, d.s))).toBe(false);
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(record.key) });
    expect(TIME_STUDY_RETURNS.filter((prop) => check(prop.visibleIf, d.s)).map(({ id }) => id)).toEqual([record.revisit.prop]);
  });
});

describe('Equipped returns in the Makers’ Room', () => {
  it.each(MAKER_RETURNS)('reopens only the $slug fixture for its exact carried object', ({ key, prop }) => {
    const d = new Driver();
    const entries = MAPS['nile.makers-room'].interactables.filter((it) => it.id.startsWith('makers-return-'));
    expect(entries).toHaveLength(3);
    expect(entries.some((it) => check(it.visibleIf, d.s))).toBe(false);
    const exhibit = pack.exhibits.find((item) => item.specimen?.key === key);
    if (!exhibit || !hasSpecimen(exhibit)) throw new Error(`Missing exact specimen ${key}`);
    expect(exhibit.specimen.revisit).toMatchObject({ map: 'nile.makers-room', prop });
    d.s.objectivesDone.push(exhibit.specimen.objective);
    d.run({ type: 'InspectExhibit', exhibit: exhibit.id });
    d.run({ type: 'ClaimSpecimen', exhibit: exhibit.id });
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(key) });
    expect(entries.filter((it) => check(it.visibleIf, d.s)).map(({ id }) => id)).toEqual([prop]);
  });
});
