import { describe, expect, it } from 'vitest';
import { CLEARANCE_CASES } from '../src/content/clearanceCases';
import {
  BEATER_CARRY, BEATER_KEY, BEATER_PLACEMENT, BEATER_PRESS_MAP, BEATER_RECORD, BEATER_SOURCE, BEATER_USED,
  carriedProof, hasMatchedPair, hasPress, pressTrace, recordPress,
} from '../src/domain/beaterProof';
import { check } from '../src/domain/rules';
import { SPECIMEN_BASE, specimenToolId } from '../src/domain/specimenGear';
import { MAPS } from '../src/maps';
import { BEATER_COLD_STORE, BEATER_WORKROOM_PRESS } from '../src/maps/beaterProof';
import { Driver } from './driver';

const objective = 'beater.proof.placed';

function claimBeater(d: Driver) {
  const record = CLEARANCE_CASES.find(({ source }) => source === BEATER_SOURCE)!;
  const exhibit = d.e.pack.exhibits.find(({ id }) => id === record.exhibit)!;
  d.s.objectivesDone.push('preserved.publish');
  d.run({ type: 'InspectExhibit', exhibit: exhibit.id });
  for (const rail of ['near', 'wide']) d.run({ type: 'SetFlag', flag: `${record.flag}.tested.${rail}`, value: true });
  d.run({ type: 'SetFlag', flag: `${record.flag}.route`, value: 'near' });
  d.run({ type: 'SetFlag', flag: `${record.flag}.proof.near`, value: 'edge' });
  d.run({ type: 'SetFlag', flag: `${record.flag}.read`, value: 'near' });
  expect(d.done(record.objective)).toBe(true);
  d.run({ type: 'ClaimSpecimen', exhibit: exhibit.id });
  return exhibit;
}

describe('Both Faces at the Same Stop', () => {
  it('produces position traces tied to the face and stop and only accepts matched settings', () => {
    expect(pressTrace('wide', 'light')).toEqual([2, 6]);
    expect(pressTrace('close', 'light')).toEqual([3, 5]);
    expect(pressTrace('wide', 'firm')).toEqual([2, 6]);
    expect(pressTrace('close', 'firm')).toEqual([3, 4, 5]);

    const lightWide = recordPress(undefined, 'wide', 'light');
    expect(recordPress(lightWide, 'wide', 'light')).toBe(lightWide);
    const mixed = recordPress(lightWide, 'close', 'firm');
    expect(hasPress(mixed, 'wide', 'light')).toBe(true);
    expect(hasPress(mixed, 'close', 'firm')).toBe(true);
    expect(hasMatchedPair(mixed, 'light')).toBe(false);
    expect(carriedProof(mixed, 'firm')).toBeUndefined();
    const light = recordPress(mixed, 'close', 'light');
    expect(carriedProof(light, 'light')).toBe('light');
    expect(carriedProof(light, 'firm')).toBeUndefined();
    expect(carriedProof(recordPress(light, 'wide', 'firm'), 'firm')).toBe('firm');
  });

  it('retains the original specimen and opens only its equipped fixture', () => {
    const d = new Driver();
    const exhibit = claimBeater(d);
    expect(exhibit.specimen).toMatchObject({ key: BEATER_KEY, accession: '1971.152', source: BEATER_SOURCE,
      objective: 'clearance.hawaiian-tapa-beater.heard', pixelAsset: 'specimens/cma-1971.152.jpg',
      revisit: { map: BEATER_PRESS_MAP, prop: BEATER_WORKROOM_PRESS.id } });
    expect(MAPS[BEATER_PRESS_MAP].interactables).toContain(BEATER_WORKROOM_PRESS);
    expect(check(BEATER_WORKROOM_PRESS.visibleIf, d.s)).toBe(false);
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(BEATER_KEY) });
    expect(check(BEATER_WORKROOM_PRESS.visibleIf, d.s)).toBe(true);
    d.s.mapId = SPECIMEN_BASE;
    d.run({ type: 'CarrySpecimen', key: BEATER_KEY, carry: false });
    expect(check(BEATER_WORKROOM_PRESS.visibleIf, d.s)).toBe(false);
  });

  it.each([['light', 'rail'], ['firm', 'bench']] as const)('shows the %s proof at its %s after installation', (stop, destination) => {
    const d = new Driver();
    claimBeater(d);
    const visible = () => BEATER_COLD_STORE.filter((prop) => check(prop.visibleIf, d.s)).map(({ id }) => id);
    expect(visible()).toEqual([]);
    const matched = recordPress(recordPress(undefined, 'wide', stop), 'close', stop);
    d.run({ type: 'SetFlag', flag: BEATER_RECORD, value: matched });
    d.run({ type: 'SetFlag', flag: BEATER_CARRY, value: carriedProof(matched, stop)! });
    expect(visible()).toEqual(['beater-proof-fitting']);
    d.run({ type: 'SetFlag', flag: BEATER_PLACEMENT, value: destination });
    expect(visible()).toEqual([`beater-proof-${destination}`]);
    expect(d.done(objective)).toBe(false);
    d.run({ type: 'SetFlag', flag: BEATER_USED, value: true });
    expect(d.done(objective)).toBe(true);
    expect(d.s.journal).toContain(`j.${objective}`);
  });
});
