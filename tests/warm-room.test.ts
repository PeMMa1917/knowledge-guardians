import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { WARM_CASES } from '../src/content/warmRoomCases';
import { check } from '../src/domain/rules';
import { canClaimSpecimen, hasSpecimen, specimenToolId } from '../src/domain/specimenGear';
import { WARM_FIXTURES, WARM_LATEST, warmHandoff, warmNotice, warmReading, warmTrace } from '../src/domain/warmRoom';
import { MAPS } from '../src/maps';
import { WARM_FERRY_RETURNS, WARM_ROOM, WARM_ROOM_DOOR } from '../src/maps/warmRoom';
import { Driver } from './driver';

const pack = buildPack();

describe('The Warm Side', () => {
  it('places 38 exact dated collection records once, with their own supports and equipped return', () => {
    expect(WARM_CASES).toHaveLength(38);
    const models = WARM_CASES.map(({ capacity, loss, grip }) => `${capacity}/${loss}/${grip}`);
    expect(new Set(models).size).toBe(38);
    const props = Object.values(MAPS).flatMap((map) => map.interactables);
    for (const record of WARM_CASES) {
      expect(props.filter(({ exhibit }) => exhibit === record.exhibit)).toHaveLength(1);
      expect(pack.sources.find(({ id }) => id === record.source)?.url).toBe(record.catalogue);
      expect(pack.exhibits.find(({ id }) => id === record.exhibit)?.specimen).toMatchObject({
        key: record.key, accession: record.accession, source: record.source, pixelAsset: record.pixelAsset, revisit: record.revisit,
      });
      expect(MAPS['aethelgard.ferry'].interactables.some(({ id }) => id === record.revisit.prop)).toBe(true);
    }
    const mission = pack.missions.find(({ id }) => id === 'KG-CH6-R78');
    expect(mission?.caseVisits).toHaveLength(38);
    expect(mission?.objectives.map(({ weave }) => weave?.subjects)).toEqual(
      WARM_CASES.map(() => ['physics', 'design-tech']),
    );
  });

  it('separates contact from body warmth and changes the comparison under a colder wait', () => {
    const record = WARM_CASES[0];
    expect(record.slug).toBe('chartier-coffee');
    expect(warmReading(record, 'bench', 0)).toEqual({ body: 24, contact: 4 });
    expect(warmReading(record, 'carrier', 0)).toEqual({ body: 24, contact: 2 });
    expect(warmReading(record, 'bench', 3)).toEqual({ body: 12, contact: 0 });
    expect(warmReading(record, 'carrier', 3)).toEqual({ body: 14, contact: 1 });
    expect(warmReading(record, 'carrier', 1, true)).toEqual({ body: 12, contact: 1 });
    expect(warmReading(record, 'carrier', 4, true)).toEqual({ body: 6, contact: 0 });
    expect(warmNotice(record, 'bench')).toContain('first readers');
    expect(warmNotice(record, 'carrier')).toContain('after an extra interval');
  });

  it.each(WARM_FIXTURES)('requires both trials and sends the %s handoff to an actual receiver before awarding the copy', (fixture) => {
    const d = new Driver();
    expect(check(WARM_ROOM_DOOR.visibleIf, d.s)).toBe(false);
    d.run({ type: 'SetFlag', flag: 'metal.arrived', value: true });
    expect(check(WARM_ROOM_DOOR.visibleIf, d.s)).toBe(true);
    const record = WARM_CASES[0];
    const exhibit = pack.exhibits.find(({ id }) => id === record.exhibit);
    if (!exhibit || !hasSpecimen(exhibit)) throw new Error('No exact Warm Room exhibit');
    d.run({ type: 'InspectExhibit', exhibit: exhibit.id });
    d.run({ type: 'SetFlag', flag: warmTrace(record.stem, 'bench'), value: true });
    expect(canClaimSpecimen(d.s, exhibit)).toBe(false);
    d.run({ type: 'SetFlag', flag: warmTrace(record.stem, 'carrier'), value: true });
    d.run({ type: 'SetFlag', flag: warmHandoff(record.stem), value: fixture });
    d.run({ type: 'SetFlag', flag: WARM_LATEST, value: record.slug });
    expect(canClaimSpecimen(d.s, exhibit)).toBe(false);
    const receipts = WARM_ROOM.interactables
      .filter((prop) => prop.id.startsWith('warm-receipt-') && check(prop.visibleIf, d.s));
    expect(receipts).toHaveLength(1);
    const [receipt] = receipts;
    expect(receipt.x).toBe(fixture === 'bench' ? 8 : 26);
    d.run({ type: 'SetFlag', flag: receipt.flag!, value: true });
    expect(canClaimSpecimen(d.s, exhibit)).toBe(true);
    d.run({ type: 'ClaimSpecimen', exhibit: exhibit.id });
    expect(WARM_FERRY_RETURNS.some((prop) => check(prop.visibleIf, d.s))).toBe(false);
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(record.key) });
    expect(WARM_FERRY_RETURNS.filter((prop) => check(prop.visibleIf, d.s)).map(({ id }) => id)).toEqual([record.revisit.prop]);
  });
});
