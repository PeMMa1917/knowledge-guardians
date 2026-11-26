import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { MAKER_CASES } from '../src/content/makerRoomCases';
import { benchFace, benchPacket, comparedAt, crossSection, parseBenchPacket, practiceFrequency, readFlag,
  receivedFlag, routeFlag } from '../src/domain/makerRoom';
import { check } from '../src/domain/rules';
import { canClaimSpecimen, hasSpecimen, specimenItemId } from '../src/domain/specimenGear';
import { MAPS } from '../src/maps';
import { NILE_MAKERS_ROOM } from '../src/maps/makerRoom';
import { BIG_ART } from '../src/ui/illustrations';
import { Driver } from './driver';

const pack = buildPack();

describe('A Turn at the Workbench', () => {
  it('places 33 independently usable objects and respects the record-specific cut location', () => {
    expect(MAKER_CASES).toHaveLength(33);
    for (const record of MAKER_CASES) {
      const exhibit = pack.exhibits.find(({ id }) => id === record.exhibit);
      expect(exhibit?.specimen).toMatchObject({ accession: record.accession, source: record.source, objective: record.done });
      expect(exhibit?.specimen?.pixelAsset).toBe(record.image);
      expect(pack.sources.find(({ id }) => id === record.source)?.url).toBe(record.catalogue);
      expect(Object.values(MAPS).flatMap((map) => map.interactables).filter(({ exhibit }) => exhibit === record.exhibit)).toHaveLength(1);
      expect(benchFace(record).indexOf('mark')).toBe(record.band);
      expect(crossSection(record, 'first', record.band)).not.toEqual(crossSection(record, 'second', record.band));
      expect(crossSection(record, 'first', 0)).toEqual(crossSection(record, 'second', 0));
    }
    for (const id of ['KG-CH2-R45', 'KG-CH13-R48']) {
      expect(pack.missions.find((mission) => mission.id === id)?.caseVisits).toHaveLength(33);
    }
  });

  it.each(['quay', 'walk'] as const)('verifies a matched cut and installs only the %s delivery', (route) => {
    const d = new Driver();
    const gate = MAPS['nile.route'].interactables.find(({ id }) => id === 'nile-makers-path');
    expect(check(gate?.visibleIf, d.s)).toBe(false);
    d.run({ type: 'SetFlag', flag: 'nile.returned', value: true });
    expect(check(gate?.visibleIf, d.s)).toBe(true);
    expect(gate?.to?.map).toBe(NILE_MAKERS_ROOM.id);
    const record = MAKER_CASES[0];
    const set = (flag: string, value: string | boolean) => d.run({ type: 'SetFlag', flag, value });
    const credit = { ...d.p.credit };
    d.run({ type: 'InspectExhibit', exhibit: record.exhibit });
    set(readFlag(record.stem, 'first', record.band), true);
    set(readFlag(record.stem, 'second', 0), true);
    expect(comparedAt(d.s, record.stem, record.band)).toBe(false);
    const packet = benchPacket(route, record.band);
    set(routeFlag(record.stem), packet);
    set(receivedFlag(record.stem), packet);
    expect(d.done(record.sent)).toBe(false);
    expect(d.done(record.done)).toBe(false);
    set(readFlag(record.stem, 'second', record.band), true);
    expect(comparedAt(d.s, record.stem, record.band)).toBe(true);
    expect(d.done(record.sent)).toBe(true);
    expect(d.done(record.done)).toBe(false);
    d.s.objectivesDone.push('voices.arrival');
    set(receivedFlag(record.stem), packet);
    expect(d.done(record.done)).toBe(true);
    expect(parseBenchPacket(packet)).toEqual({ route, cut: record.band });
    const props = ['quay', 'walk'].map((side) => MAPS[`voices.${side}`].interactables.find(({ id }) => id === `makers-receiver-${side}`));
    expect(props.map((prop) => check(prop?.visibleIf, d.s))).toEqual([route === 'quay', route === 'walk']);
    expect(parseBenchPacket('walk.-1')).toBeNull();
    expect(d.p.credit).toMatchObject(credit);
  });
});

describe('Exact makers and witnesses', () => {
  it.each([
    ['jiahu', '7052472642044956672', ['tone.0','tone.4']],
    ['disk', 'B16665', ['front','back']],
    ['laguna', 'Laguna Copperplate Inscription', ['recipient','debt','witness','date']],
  ] as const)('checks and mounts %s with its own record and required actions', (slug, accession, requirements) => {
    const d = new Driver();
    const exhibit = pack.exhibits.find((obj) => obj.specimen?.accession === accession);
    expect(exhibit?.id).toBe(`OBJ-MAKERS-EXACT-${slug.toUpperCase()}`);
    expect(exhibit?.specimen?.pixelAsset).toBeUndefined();
    expect(exhibit?.specimen?.people?.length).toBeGreaterThan(0);
    expect(BIG_ART[exhibit!.art]).toBe(exhibit?.art);
    const stem = `makers.exact.${slug}`;
    expect(exhibit?.specimen?.objective).toBe(`${stem}.mounted`);
    d.run({ type: 'SetFlag', flag: 'nile.returned', value: true });
    d.run({ type: 'InspectExhibit', exhibit: exhibit!.id });
    if (!exhibit || !hasSpecimen(exhibit)) throw new Error(`Missing exact specimen ${accession}`);
    expect(canClaimSpecimen(d.s, exhibit)).toBe(false);
    d.run({ type: 'SetFlag', flag: `${stem}.route`, value: 'walk' });
    d.run({ type: 'SetFlag', flag: `${stem}.display`, value: 'walk' });
    expect(d.done(`${stem}.mounted`)).toBe(false);
    for (const suffix of requirements) d.run({ type: 'SetFlag', flag: `${stem}.${suffix}`, value: true });
    expect(d.done(`${stem}.sent`)).toBe(true);
    expect(d.done(`${stem}.mounted`)).toBe(false);
    d.s.objectivesDone.push('voices.arrival');
    d.run({ type: 'SetFlag', flag: `${stem}.display`, value: 'walk' });
    expect(d.done(`${stem}.mounted`)).toBe(true);
    expect(canClaimSpecimen(d.s, exhibit)).toBe(true);
    d.run({ type: 'ClaimSpecimen', exhibit: exhibit.id });
    expect(d.s.inventory[specimenItemId(exhibit.specimen.key)]).toBe(1);
  });

  it('holds one invented tube constant and changes the sample when the stop moves', () => {
    expect(practiceFrequency(0)).toBe(166);
    expect(practiceFrequency(4)).toBe(252);
    expect(practiceFrequency(7)).toBe(379);
  });
});
