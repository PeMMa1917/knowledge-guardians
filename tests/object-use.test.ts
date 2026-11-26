import { describe, expect, it } from 'vitest';
import {
  DELIVERY_ROUTES, OBJECT_USE_CASES, OBJECT_USE_DETAILS, OBJECT_USE_ROOMS, objectUseDelivery, objectUseReady, specimenUseAsset,
} from '../src/content/objectUseCases';
import { calculateClearance, calculateTally, canTakeReading, pulseStart, seamOffset, seenPulses } from '../src/domain/objectUse';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import type { Interactable } from '../src/maps/types';
import { Driver } from './driver';

function prop(d: Driver, id: string): Interactable {
  const instance = MAPS[d.s.mapId].interactables.find((entry) => entry.id === id);
  expect(instance, id).toBeDefined();
  return instance!;
}

describe('Second-use workshop measurements', () => {
  it('measures two aperture axes after a quarter turn', () => {
    const bench = OBJECT_USE_CASES.find(({ key }) => key === 'sandal')!.bench;
    if (bench.kind !== 'clearance') throw new Error('Expected a packing model');
    expect(calculateClearance(bench, 0)).toEqual({ spans: [29, 10], margins: [2, 2] });
    expect(calculateClearance(bench, 1)).toEqual({ spans: [10, 29], margins: [21, -17] });
  });

  it('separates a tare without changing the practice contents', () => {
    const bench = OBJECT_USE_CASES.find(({ key }) => key === 'akan-scale')!.bench;
    if (bench.kind !== 'tally') throw new Error('Expected a tally');
    expect(calculateTally(bench, 0)).toEqual({ base: 6, added: 3, total: 9 });
    expect(calculateTally(bench, 1)).toEqual({ base: 6, added: 0, total: 6 });
  });

  it('moves an overlay between fixed backing positions', () => {
    const bench = OBJECT_USE_CASES.find(({ key }) => key === 'vessel-print')!.bench;
    if (bench.kind !== 'seam') throw new Error('Expected a seam overlay');
    expect(seamOffset(bench, 1, 3)).toBe(-6);
    expect(canTakeReading(bench, 1, 3)).toBe(false);
    expect(canTakeReading(bench, 0, 3)).toBe(true);
    expect(canTakeReading(bench, 1, 9)).toBe(true);
  });

  it('sees different pulse groups through the two practice windows', () => {
    const bench = OBJECT_USE_CASES.find(({ key }) => key === 'ring-joins')!.bench;
    if (bench.kind !== 'pulse') throw new Error('Expected a trace');
    expect(seenPulses(bench, 0, pulseStart(bench, 0))).toEqual([1, 2]);
    expect(seenPulses(bench, 1, pulseStart(bench, 1))).toEqual([6, 10]);
    expect(canTakeReading(bench, 1, 0)).toBe(false);
  });
});

describe('Second-use workshops', () => {
  it('registers 20 distinct dated catalogue records with local photo assets and independent objectives', () => {
    const { pack } = new Driver().e;
    expect(OBJECT_USE_CASES).toHaveLength(20);
    expect(new Set(OBJECT_USE_CASES.map(({ object }) => object.id)).size).toBe(20);
    for (const room of OBJECT_USE_ROOMS) {
      const plan = OBJECT_USE_DETAILS[room];
      const records = OBJECT_USE_CASES.filter((job) => job.room === room);
      const mission = pack.missions.find(({ id }) => id === plan.mission)!;
      expect(mission.caseVisits).toEqual(records.map(({ objective }) => [objective]));
      expect(mission.objectives).toHaveLength(5);
      for (const record of records) {
        const exhibit = pack.exhibits.find(({ id }) => id === record.exhibit)!;
        const objects = pack.exhibits.filter(({ specimen }) => specimen?.key === record.object.id);
        expect(objects, record.object.id).toHaveLength(1);
        expect(exhibit).toMatchObject({ dateText: record.object.date, altText: record.object.altText,
          specimen: { accession: record.object.accession, source: record.source, pixelAsset: specimenUseAsset(record) } });
        expect(pack.sources.find(({ id }) => id === record.source)?.url).toBe(record.object.catalogUrl);
        expect(pack.hints.filter(({ objective }) => objective === record.objective).map(({ depth }) => depth)).toEqual([1, 2, 3, 4]);
      }
    }
  });

  it.each(OBJECT_USE_CASES)('carries $title to each selected receiving stand with equal credit', (record) => {
    const plan = OBJECT_USE_DETAILS[record.room];
    const credits = [];
    for (const route of DELIVERY_ROUTES) {
      const other = route === 'near' ? 'wide' : 'near';
      const d = new Driver();
      d.s.mapId = plan.host === 'market' ? 'market.sample-shed' : 'stage.prop-room';
      const door = prop(d, `object-use-${record.room}-entrance`);
      expect(check(door.visibleIf, d.s)).toBe(false);
      d.s.objectivesDone.push(plan.chapter);
      expect(check(door.visibleIf, d.s)).toBe(true);
      d.s.mapId = door.to!.map;
      const bench = prop(d, `object-use-${record.key}-tool`);
      expect(check(bench.visibleIf, d.s)).toBe(false);
      d.run({ type: 'InspectExhibit', exhibit: prop(d, `object-use-${record.key}-exhibit`).exhibit! });
      expect(check(bench.visibleIf, d.s)).toBe(true);
      const first = route === 'near' ? 0 : 1;
      d.run({ type: 'SetFlag', flag: `${record.flag}.trial.${first}`, value: true });
      expect(check(objectUseReady(record), d.s)).toBe(false);
      d.run({ type: 'SetFlag', flag: `${record.flag}.trial.${1 - first}`, value: true });
      expect(check(objectUseReady(record), d.s)).toBe(true);
      expect(check(objectUseDelivery(record, route), d.s)).toBe(false);

      d.run({ type: 'SetFlag', flag: `${record.flag}.route`, value: route });
      expect(d.done(record.objective)).toBe(false);
      d.s.mapId = prop(d, `object-use-${record.room}-return`).to!.map;
      const receiver = prop(d, `object-use-${record.room}-${route}`);
      expect(check(receiver.visibleIf, d.s)).toBe(true);
      expect(check(prop(d, `object-use-${record.room}-${other}`).visibleIf, d.s)).toBe(false);
      expect(check(receiver.artOpen!.if, d.s)).toBe(false);
      d.run({ type: 'SetFlag', flag: record.objective, value: route });
      expect(check(receiver.artOpen!.if, d.s)).toBe(true);
      expect(d.s.journal).toContain(`j.${record.flag}`);
      expect(d.done(record.objective)).toBe(true);
      expect(OBJECT_USE_CASES.every((job) => job === record || !d.done(job.objective))).toBe(true);
      credits.push({ ...d.p.credit });
    }
    expect(credits[0]).toEqual(credits[1]);
  });
});
