import { describe, expect, it } from 'vitest';
import people from '../src/content/work-schedule-people.json';
import {
  SCHEDULE_CASES, SCHEDULE_DETAILS, SCHEDULE_HUB, SCHEDULE_REVISIT, SCHEDULE_ROOMS, SCHEDULE_ROUTES,
  scheduleCarry, scheduleDelivery, scheduleReady,
} from '../src/content/workScheduleCases';
import { check } from '../src/domain/rules';
import { carriesSpecimen, specimenToolId } from '../src/domain/specimenGear';
import { modelSchedule, moveScheduleTile, SCHEDULE_TILES } from '../src/domain/workSchedule';
import { MAPS } from '../src/maps';
import type { Interactable } from '../src/maps/types';
import { Driver } from './driver';

function item(d: Driver, id: string): Interactable {
  const found = MAPS[d.s.mapId]?.interactables.find((prop) => prop.id === id);
  expect(found, id).toBeDefined();
  return found!;
}

describe('Working Cupboards trial clocks', () => {
  it('moves a selected tile by one place and stops it at either end of the rail', () => {
    expect(moveScheduleTile(SCHEDULE_TILES, 0, -1)).toEqual(SCHEDULE_TILES);
    expect(moveScheduleTile(SCHEDULE_TILES, 2, 1)).toEqual(SCHEDULE_TILES);
    expect(moveScheduleTile(SCHEDULE_TILES, 2, -1)).toEqual(['source', 'public', 'practice']);
    expect(moveScheduleTile(SCHEDULE_TILES, 0, 1)).toEqual(['practice', 'source', 'public']);
  });

  it.each(SCHEDULE_CASES)('supports two first-bell plans and a later full opening for $title', ({ fixture }) => {
    const source = modelSchedule(fixture, ['source', 'public', 'practice']);
    const practice = modelSchedule(fixture, ['practice', 'public', 'source']);
    expect(source.visible).toBe(true);
    expect(practice.visible).toBe(true);
    expect(source.priority).toBe('source');
    expect(practice.priority).toBe('practice');
    expect(source.elapsed).toBe(practice.elapsed);
    expect(source.elapsed).toBeGreaterThan(fixture.bell);
    expect(modelSchedule(fixture, SCHEDULE_TILES)).toMatchObject({ visible: false, priority: undefined });
    expect(modelSchedule(fixture, ['public', 'source', 'practice'])).toMatchObject({ visible: true, priority: undefined });
  });
});

describe('Working Cupboards collection and later proof', () => {
  it('keeps a distinct exact image, public role and follow-up for every dated object', () => {
    const { pack } = new Driver().e;
    const roles: Record<string, { source: string }[]> = people;
    expect(SCHEDULE_CASES).toHaveLength(38);
    expect(new Set(SCHEDULE_CASES.map(({ object }) => object.institution)).size).toBe(4);
    expect(new Set(SCHEDULE_CASES.map(({ object }) => object.pixelAsset)).size).toBe(38);
    expect(new Set(SCHEDULE_CASES.map(({ revisit }) => revisit[0])).size).toBe(38);
    for (const record of SCHEDULE_CASES) {
      const found = pack.exhibits.filter(({ specimen }) => specimen?.key === record.object.key);
      expect(found, record.object.key).toHaveLength(1);
      expect(found[0]).toMatchObject({ dateText: record.object.date, altText: record.object.altText,
        specimen: { accession: record.object.accession, source: record.source, pixelAsset: record.object.pixelAsset,
          people: roles[record.object.key], revisit: { ...SCHEDULE_REVISIT, method: record.revisit[0] } } });
      const exact = pack.sources.find(({ id }) => id === record.source);
      expect(exact?.url).toBe(record.object.catalogue);
      expect(pack.hints.filter(({ objective }) => objective === record.objective).map(({ depth }) => depth)).toEqual([1,2,3,4]);
    }
    for (const room of SCHEDULE_ROOMS) {
      const cases = SCHEDULE_CASES.filter((record) => record.room === room);
      expect(pack.missions.find(({ id }) => id === SCHEDULE_DETAILS[room].mission)?.caseVisits).toEqual(cases.map(({ objective }) => [objective]));
    }
  });

  it.each(SCHEDULE_CASES)('finishes both physical deliveries and records the matching equipped proof for $title', (record) => {
    const credits = [];
    for (const route of SCHEDULE_ROUTES) {
      const d = new Driver();
      d.s.mapId = 'forest.community';
      const entrance = item(d, 'work-schedule-entrance');
      expect(check(entrance.visibleIf, d.s)).toBe(false);
      d.s.objectivesDone.push('forest.arrival');
      expect(check(entrance.visibleIf, d.s)).toBe(true);
      d.s.mapId = entrance.to!.map;
      expect(d.s.mapId).toBe(SCHEDULE_HUB);
      d.s.mapId = item(d, `work-schedule-open-${record.room}`).to!.map;
      const board = item(d, `work-schedule-${record.slug}-board`);
      expect(check(board.visibleIf, d.s)).toBe(false);
      d.run({ type: 'InspectExhibit', exhibit: item(d, `work-schedule-${record.slug}-record`).exhibit! });
      expect(check(board.visibleIf, d.s)).toBe(true);
      expect(() => d.run({ type: 'ClaimSpecimen', exhibit: record.exhibit })).toThrow('Finish the object’s quest first');
      d.run({ type: 'SetFlag', flag: `${record.flag}.tested.source`, value: true });
      expect(check(scheduleReady(record), d.s)).toBe(false);
      d.run({ type: 'SetFlag', flag: `${record.flag}.tested.practice`, value: true });
      expect(check(scheduleReady(record), d.s)).toBe(true);
      d.run({ type: 'SetFlag', flag: `${record.flag}.sent`, value: route });
      const other = route === 'source' ? 'practice' : 'source';
      expect(check(scheduleDelivery(record, other), d.s)).toBe(false);
      expect(d.done(record.objective)).toBe(false);

      d.s.mapId = item(d, `work-schedule-close-${record.room}`).to!.map;
      d.s.mapId = item(d, 'work-schedule-leave').to!.map;
      d.s.mapId = item(d, route === 'source' ? 'forest-community-back' : 'forest-bridge-to-trail').to!.map;
      const receiver = item(d, `work-schedule-receive-${route}`);
      expect(check(receiver.visibleIf, d.s)).toBe(true);
      d.run({ type: 'SetFlag', flag: record.objective, value: route });
      expect(d.done(record.objective)).toBe(true);
      expect(check(receiver.artOpen?.if, d.s)).toBe(true);
      d.run({ type: 'ClaimSpecimen', exhibit: record.exhibit });
      expect(carriesSpecimen(d.s, record.object.key)).toBe(true);

      d.s.mapId = SCHEDULE_REVISIT.map;
      const shelf = item(d, SCHEDULE_REVISIT.prop);
      expect(check(shelf.visibleIf, d.s)).toBe(false);
      d.run({ type: 'EquipPerspective', keepsake: specimenToolId(record.object.key) });
      expect(check(shelf.visibleIf, d.s)).toBe(true);
      expect(SCHEDULE_CASES.filter((candidate) => check(scheduleCarry(candidate), d.s))).toEqual([record]);
      d.run({ type: 'SetSpecimenReading', exhibit: record.exhibit, reading: 'use' });
      d.run({ type: 'EquipPerspective', keepsake: null });
      expect(check(shelf.visibleIf, d.s)).toBe(true);
      expect(check(shelf.artOpen?.if, d.s)).toBe(true);
      expect(d.s.flags[record.reprise]).toBe('use');
      credits.push({ ...d.p.credit });
    }
    expect(credits[0]).toEqual(credits[1]);
  });
});
