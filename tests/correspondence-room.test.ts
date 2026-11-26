import { describe, expect, it } from 'vitest';
import { CORRESPONDENCE_CASES, CORRESPONDENCE_PLANS, CORRESPONDENCE_RETURN } from '../src/content/correspondenceRoom';
import { check } from '../src/domain/rules';
import { ownsSpecimen, SPECIMEN_BASE, specimenToolId } from '../src/domain/specimenGear';
import { MAPS } from '../src/maps';
import { CORRESPONDENCE_DOOR, CORRESPONDENCE_ROOM } from '../src/maps/correspondenceRoom';
import type { MapDef } from '../src/maps/types';
import { artKeys } from '../src/ui/illustrations';
import { Driver } from './driver';

function prop(map: MapDef, id: string) {
  const found = map.interactables.find((entry) => entry.id === id);
  expect(found, id).toBeDefined();
  return found!;
}

const room = CORRESPONDENCE_ROOM;
const nexus = MAPS['nexus.archive'];

describe('Which Part of the Letter Travels?', () => {
  it('gives 40 individually placed exact records, with separately verified photo and schematic scopes', () => {
    const d = new Driver();
    const archive = MAPS['copies.archive'];
    expect(archive.interactables).toContain(CORRESPONDENCE_DOOR);
    expect(check(CORRESPONDENCE_DOOR.visibleIf, d.s)).toBe(false);
    d.s.objectivesDone.push('copies.arrival');
    expect(check(CORRESPONDENCE_DOOR.visibleIf, d.s)).toBe(true);
    expect(prop(MAPS[room.id], 'correspondence-room-return').to).toMatchObject({ map: archive.id, x: 20, y: 14 });
    expect(CORRESPONDENCE_CASES).toHaveLength(40);
    expect(new Set(CORRESPONDENCE_CASES.map(({ key }) => key)).size).toBe(40);
    expect(new Set(CORRESPONDENCE_CASES.map(({ use }) => use)).size).toBe(40);
    expect(CORRESPONDENCE_CASES.filter(({ asset }) => !!asset)).toHaveLength(39);
    const art = new Set(artKeys());

    for (const record of CORRESPONDENCE_CASES) {
      const places = Object.values(MAPS).flatMap((map) => map.interactables.filter((item) => item.exhibit === record.exhibit).map(() => map.id));
      expect(places, record.accession).toEqual([room.id]);
      const exhibit = d.e.pack.exhibits.find(({ id }) => id === record.exhibit);
      expect(exhibit).toMatchObject({ historicalLabel: 'documented', dateText: record.date,
        specimen: { key: record.key, accession: record.accession, source: record.source, objective: record.objective, revisit: record.revisit },
      });
      expect(art.has(exhibit!.art)).toBe(true);
      expect(record.outside).not.toEqual(record.inside);
      expect(exhibit?.specimen?.people?.every(({ source }) => source === record.source) ?? true).toBe(true);
      expect(check(prop(nexus, record.revisit.prop).visibleIf, d.s)).toBe(false);
    }
    const crowther = d.e.pack.exhibits.find(({ id }) => id === 'OBJ-CORRESPONDENCE-CROWTHER-YORUBA');
    expect(crowther?.specimen?.pixelAsset).toBeUndefined();
    expect(crowther?.specimen?.people?.[0]?.name).toBe('Samuel Ajayi Crowther');
    expect(crowther?.art).toBe('correspondence.crowther-book');
  });

  it.each(CORRESPONDENCE_PLANS)('uses the %s carrier and actual signed reply for all exact working copies', (plan) => {
    const d = new Driver();
    const front = plan === 'front';
    d.s.objectivesDone.push('copies.arrival');
    for (const record of CORRESPONDENCE_CASES) {
      d.s.mapId = room.id;
      d.run({ type: 'InspectExhibit', exhibit: record.exhibit });
      expect(ownsSpecimen(d.s, record.key)).toBe(false);
      const take = prop(room, `${record.flag}-take`);
      expect(check(take.visibleIf, d.s)).toBe(true);
      d.walk(take.node!, ['Take the working slip']);
      const compose = prop(room, 'correspondence-compose');
      expect(check(compose.visibleIf, d.s)).toBe(true);
      d.walk(compose.node!, [front ? 'Clip a short direction' : 'Set the paired wording']);
      expect(d.e.node(`${record.flag}.dispatch-${plan}`).text).toContain(record.outside);
      expect(d.e.node(`${record.flag}.dispatch-${plan}`).text.includes(record.inside)).toBe(!front);
      const desk = prop(room, front ? 'correspondence-west-rail' : 'correspondence-east-desk');
      const unused = prop(room, front ? 'correspondence-east-desk' : 'correspondence-west-rail');
      const seal = prop(room, 'correspondence-seal');
      expect(check(desk.visibleIf, d.s)).toBe(true);
      expect(check(unused.visibleIf, d.s)).toBe(false);
      expect(check(seal.visibleIf, d.s)).toBe(false);
      d.walk(desk.node!, [record.check]);
      expect(d.done(record.objective)).toBe(false);
      expect(check(seal.visibleIf, d.s)).toBe(true);
      d.walk(seal.node!, ['Attach Ansel’s reply']);
      expect(d.done(record.objective)).toBe(true);
      expect(check(prop(room, `${record.flag}-${plan}-signed`).visibleIf, d.s)).toBe(true);
      expect(check(prop(room, front ? 'correspondence-west-done' : 'correspondence-east-done').visibleIf, d.s)).toBe(true);

      d.run({ type: 'ClaimSpecimen', exhibit: record.exhibit });
      expect(ownsSpecimen(d.s, record.key)).toBe(true);
      d.s.mapId = nexus.id;
      const before = prop(nexus, record.revisit.prop);
      expect(check(before.visibleIf, d.s)).toBe(false);
      d.run({ type: 'EquipPerspective', keepsake: specimenToolId(record.key) });
      expect(check(before.visibleIf, d.s)).toBe(true);
      d.walk(before.node!, [record.use]);
      expect(d.s.flags[CORRESPONDENCE_RETURN]).toBe(record.slug);
      expect(d.s.journal).toContain(`j.${record.flag}.nexus`);
      expect(check(before.visibleIf, d.s)).toBe(false);
      expect(check(prop(nexus, `${record.revisit.prop}-readback`).visibleIf, d.s)).toBe(true);
      d.s.mapId = SPECIMEN_BASE;
      d.run({ type: 'CarrySpecimen', key: record.key, carry: false });
    }
    expect(d.done('copies.publish')).toBe(false);
  }, 20000);

  it('lets a player put the first draft back without abandoning the next case', () => {
    const d = new Driver();
    d.s.mapId = room.id;
    d.s.objectivesDone.push('copies.arrival');
    const [first, next] = CORRESPONDENCE_CASES;
    for (const record of [first, next]) d.run({ type: 'InspectExhibit', exhibit: record.exhibit });
    d.walk(`${first.flag}.take`, ['Take the working slip']);
    d.walk('correspondence.compose', ['Set the paired wording']);
    expect(check(prop(room, `${next.flag}-take`).visibleIf, d.s)).toBe(false);
    d.walk(`${first.flag}.cancel`, ['Rehang the practice slip']);
    expect(check(prop(room, `${next.flag}-take`).visibleIf, d.s)).toBe(true);
    expect(check(prop(room, 'correspondence-east-desk').visibleIf, d.s)).toBe(false);
    d.walk(`${next.flag}.take`, ['Take the working slip']);
    expect(check(prop(room, 'correspondence-compose').visibleIf, d.s)).toBe(true);
    expect(d.done(first.objective)).toBe(false);
  });
});
