import { describe, expect, it } from 'vitest';
import people from '../src/content/script-rail-people.json';
import {
  SCRIPT_CASES, SCRIPT_CABINET, SCRIPT_DESTINATIONS, SCRIPT_DETAILS, SCRIPT_RAIL_RETURN, SCRIPT_ROOMS,
  scriptCarry, scriptDelivery, scriptReady,
} from '../src/content/scriptRail';
import { check } from '../src/domain/rules';
import { SCRIPT_LAYOUTS, scriptRailView } from '../src/domain/scriptRail';
import { carriesSpecimen, specimenToolId } from '../src/domain/specimenGear';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

function prop(d: Driver, id: string) {
  const match = MAPS[d.s.mapId]?.interactables.find((entry) => entry.id === id);
  expect(match, id).toBeDefined();
  return match!;
}

describe('Script Cabinet folded reading paths', () => {
  it.each(SCRIPT_LAYOUTS)('begins from the actual outer strip when the fold leads with %s', (layout) => {
    const other = layout === 'cue' ? 'catalogue' : 'cue';
    expect(scriptRailView(layout, 'rail')).toEqual([layout]);
    expect(scriptRailView(layout, 'open')).toEqual([layout, other]);
  });

  it('registers every exact accession with its own record, literary roles and City correction', () => {
    const { pack } = new Driver().e;
    const roles: Record<string, { source: string }[]> = people;
    expect(SCRIPT_CASES).toHaveLength(38);
    expect(new Set(SCRIPT_CASES.map(({ object }) => object.institution)).size).toBe(2);
    expect(new Set(SCRIPT_CASES.map(({ object }) => object.pixelAsset)).size).toBe(38);
    expect(new Set(SCRIPT_CASES.map(({ revisit }) => revisit[1])).size).toBe(38);
    for (const record of SCRIPT_CASES) {
      const matched = pack.exhibits.filter(({ specimen }) => specimen?.key === record.object.key);
      expect(matched, record.object.key).toHaveLength(1);
      expect(matched[0]).toMatchObject({ dateText: record.object.date, altText: record.object.altText,
        specimen: { accession: record.object.accession, source: record.source, pixelAsset: record.object.pixelAsset,
          people: roles[record.object.key], revisit: { ...SCRIPT_RAIL_RETURN, method: record.revisit[0] } } });
      expect(pack.sources.find(({ id }) => id === record.source)?.url).toBe(record.object.catalogue);
      expect(pack.hints.filter(({ objective }) => objective === record.objective).map(({ depth }) => depth)).toEqual([1, 2, 3, 4]);
    }
    for (const room of SCRIPT_ROOMS) {
      const entries = SCRIPT_CASES.filter((record) => record.room === room);
      expect(pack.missions.find(({ id }) => id === SCRIPT_DETAILS[room].mission)?.caseVisits).toEqual(entries.map(({ objective }) => [objective]));
    }
  });

  it.each(SCRIPT_CASES)('accepts either separate receiver and the matching equipped return for $title', (record) => {
    const credits = [];
    for (const layout of SCRIPT_LAYOUTS) {
      const d = new Driver();
      d.s.mapId = 'stage.foyer';
      const entrance = prop(d, 'script-rail-entrance');
      expect(check(entrance.visibleIf, d.s)).toBe(false);
      d.s.objectivesDone.push('stage.finish');
      expect(check(entrance.visibleIf, d.s)).toBe(true);

      d.s.mapId = entrance.to!.map;
      expect(d.s.mapId).toBe(SCRIPT_CABINET);
      d.s.mapId = prop(d, `script-rail-open-${record.room}`).to!.map;
      const fold = prop(d, `script-rail-${record.slug}-fold`);
      expect(check(fold.visibleIf, d.s)).toBe(false);
      d.run({ type: 'InspectExhibit', exhibit: prop(d, `script-rail-${record.slug}-record`).exhibit! });
      expect(check(fold.visibleIf, d.s)).toBe(true);
      expect(() => d.run({ type: 'ClaimSpecimen', exhibit: record.exhibit })).toThrow('Finish the object’s quest first');
      d.run({ type: 'SetFlag', flag: `${record.flag}.preview.cue`, value: true });
      expect(check(scriptReady(record), d.s)).toBe(false);
      d.run({ type: 'SetFlag', flag: `${record.flag}.preview.catalogue`, value: true });
      expect(check(scriptReady(record), d.s)).toBe(true);
      d.run({ type: 'SetFlag', flag: `${record.flag}.sent`, value: layout });
      expect(d.done(record.objective)).toBe(false);
      const other = layout === 'cue' ? 'catalogue' : 'cue';
      expect(check(scriptDelivery(record, other), d.s)).toBe(false);

      d.s.mapId = prop(d, `script-rail-close-${record.room}`).to!.map;
      d.s.mapId = prop(d, 'script-rail-leave').to!.map;
      d.s.mapId = prop(d, 'stage-gallery-path').to!.map;
      const receiver = prop(d, SCRIPT_DESTINATIONS[layout].prop);
      expect(check(receiver.visibleIf, d.s)).toBe(true);
      expect(check(prop(d, SCRIPT_DESTINATIONS[other].prop).visibleIf, d.s)).toBe(false);
      d.run({ type: 'SetFlag', flag: record.objective, value: layout });
      expect(d.done(record.objective)).toBe(true);
      expect(check(receiver.artOpen?.if, d.s)).toBe(true);

      d.s.mapId = SCRIPT_DETAILS[record.room].map;
      d.run({ type: 'ClaimSpecimen', exhibit: record.exhibit });
      expect(carriesSpecimen(d.s, record.object.key)).toBe(true);
      d.s.mapId = SCRIPT_RAIL_RETURN.map;
      const index = prop(d, SCRIPT_RAIL_RETURN.prop);
      expect(check(index.visibleIf, d.s)).toBe(false);
      expect(() => d.run({ type: 'SetSpecimenReading', exhibit: record.exhibit, reading: 'use' })).toThrow('Bring the object to its stand');
      d.run({ type: 'EquipPerspective', keepsake: specimenToolId(record.object.key) });
      expect(check(index.visibleIf, d.s)).toBe(true);
      expect(SCRIPT_CASES.filter((entry) => check(scriptCarry(entry), d.s))).toEqual([record]);
      d.run({ type: 'SetSpecimenReading', exhibit: record.exhibit, reading: 'use' });
      d.run({ type: 'EquipPerspective', keepsake: null });
      expect(check(index.visibleIf, d.s)).toBe(true);
      expect(check(index.artOpen?.if, d.s)).toBe(true);
      expect(d.s.flags[record.reprise]).toBe('use');
      credits.push(d.p.credit);
    }
    expect(credits[0]).toEqual(credits[1]);
  });
});
