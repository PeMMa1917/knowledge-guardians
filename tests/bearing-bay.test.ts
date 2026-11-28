import { describe, expect, it } from 'vitest';
import { BEARING_CASES, BEARING_RETURN_MAP } from '../src/content/bearingBay';
import { bearingMove, BEARING_FIXES, BEARING_POSTS, firstSight, lineContains, matchingCells, readBearing, repeatSights, type BearingMove } from '../src/domain/bearingBay';
import { check } from '../src/domain/rules';
import { specimenToolId } from '../src/domain/specimenGear';
import { MAPS } from '../src/maps';
import { BEARING_DOOR, BEARING_RETURN_ROOM, BEARING_ROOM } from '../src/maps/bearingBay';
import { Driver } from './driver';

function move(d: Driver, slug: string, action: BearingMove) {
  const effect = bearingMove(slug, d.s.flags, action);
  expect(effect).toBeDefined();
  if (effect) d.run({ type: 'SetFlag', flag: effect.setFlag, value: effect.value });
}

describe('Where the Two Sights Meet', () => {
  it('distinguishes ray direction, source coordinates and the actual intersection', () => {
    const target = [3, 2] as const;
    const west = firstSight('west', target);
    expect(lineContains(west, [-3, -2])).toBe(false);
    expect(lineContains(west, [3, 2])).toBe(true);
    expect(lineContains(west, [4, 2])).toBe(false);
    expect(matchingCells([west])).toEqual([[3, 2], [6, 4]]);
    expect(matchingCells([west, firstSight('east', target)])).toEqual([[3, 2]]);
    expect(repeatSights(target, 'post', 'wait')[1][0]).toEqual([8, 1]);
    expect(repeatSights(target, 'fog', 'side')[1][0]).toEqual([0, 8]);
  });

  it('registers exact image and historic credits, with 41 different equipped positions and 82 independent case visits', () => {
    const d = new Driver();
    expect(BEARING_CASES).toHaveLength(41);
    expect(new Set(BEARING_CASES.map((record) => record.key)).size).toBe(41);
    expect(new Set(BEARING_CASES.map((record) => record.asset)).size).toBe(41);
    expect(check(BEARING_DOOR.visibleIf, d.s)).toBe(false);
    d.s.objectivesDone.push('coast.arrival');
    expect(check(BEARING_DOOR.visibleIf, d.s)).toBe(true);
    expect(MAPS[BEARING_ROOM.id]).toBe(BEARING_ROOM);
    expect(MAPS[BEARING_RETURN_MAP]).toBe(BEARING_RETURN_ROOM);
    expect(MAPS['observatory.station'].interactables).toContain(BEARING_DOOR);
    expect(d.e.pack.missions.find(({ id }) => id === 'KG-CH4-R26')?.caseVisits).toHaveLength(82);
    const returnTiles = new Set<string>();
    for (const record of BEARING_CASES) {
      const entry = d.e.pack.exhibits.find(({ id }) => id === record.exhibit);
      expect(entry?.specimen).toMatchObject({ key: record.key, accession: record.accession, institution: 'National Gallery of Art', pixelAsset: record.asset,
        revisit: { map: BEARING_RETURN_MAP, prop: record.returnProp, method: expect.stringContaining(record.name) } });
      expect(entry?.specimen?.people?.length).toBeGreaterThan(0);
      expect(entry?.dateText).toBe(record.date);
      for (const { source } of entry?.specimen?.people ?? []) expect(d.e.pack.sources.some(({ id }) => id === source)).toBe(true);
      const tile = BEARING_RETURN_ROOM.interactables.find(({ id }) => id === record.returnProp)!;
      returnTiles.add(`${tile.x}:${tile.y}`);
      expect(Object.values(MAPS).flatMap((m) => m.interactables.filter(({ exhibit }) => exhibit === record.exhibit).map(() => m.id))).toEqual([BEARING_ROOM.id]);
    }
    expect(returnTiles.size).toBe(41);
  });

  it.each(BEARING_CASES)('stages and retests $accession only on the matching working-copy rack', (record) => {
    const index = BEARING_CASES.indexOf(record);
    const route = index % 2 ? 'fold' : 'quay';
    const other = route === 'fold' ? 'quay' : 'fold';
    const fix = index % 2 ? 'side' : 'wait';
    expect(matchingCells([firstSight('west', record.start)]).length).toBeGreaterThan(1);
    expect(matchingCells(BEARING_POSTS.map((post) => firstSight(post, record.start)))).toEqual([record.start]);
    expect(matchingCells(repeatSights(record.changed, record.kind))).not.toEqual([record.changed]);
    for (const method of BEARING_FIXES) expect(matchingCells(repeatSights(record.changed, record.kind, method))).toEqual([record.changed]);
    const d = new Driver();
    d.s.objectivesDone.push('coast.arrival');
    d.run({ type: 'InspectExhibit', exhibit: record.exhibit });
    move(d, record.slug, { kind: 'read', post: 'west' });
    expect(bearingMove(record.slug, d.s.flags, { kind: 'send', route })).toBeUndefined();
    move(d, record.slug, { kind: 'read', post: 'east' });
    move(d, record.slug, { kind: 'send', route });
    expect(bearingMove(record.slug, d.s.flags, { kind: 'receive', route: other })).toBeUndefined();
    const receiver = MAPS[route === 'fold' ? 'observatory.inland' : 'observatory.harbour'].interactables.find(({ id }) => id === `bearing-receiver-${route}`)!;
    expect(check(receiver.visibleIf, d.s)).toBe(true);
    expect(check(receiver.artOpen?.if, d.s)).toBe(false);
    expect(d.done(record.objective)).toBe(false);
    move(d, record.slug, { kind: 'receive', route });
    expect(check(receiver.artOpen?.if, d.s)).toBe(true);
    expect(d.done(record.objective)).toBe(true);
    const received = d.s.adventureDiary.entries.find((entry) => entry.id === `quest:${record.objective}`);
    expect(received?.text).toContain(route === 'quay' ? 'at the west dock' : 'to Marl Fold');
    const revisit = BEARING_RETURN_ROOM.interactables.find(({ id }) => id === record.returnProp)!;
    d.run({ type: 'ClaimSpecimen', exhibit: record.exhibit });
    expect(check(revisit.visibleIf, d.s)).toBe(false);
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(record.key) });
    expect(check(revisit.visibleIf, d.s)).toBe(true);
    const otherRack = BEARING_RETURN_ROOM.interactables.find(({ id }) => id === BEARING_CASES[(index + 1) % BEARING_CASES.length].returnProp)!;
    expect(check(otherRack.visibleIf, d.s)).toBe(false);
    move(d, record.slug, { kind: 'old' });
    move(d, record.slug, { kind: 'repeat', fix: 'side' });
    expect(bearingMove(record.slug, d.s.flags, { kind: 'fit', fix })).toBeUndefined();
    move(d, record.slug, { kind: 'repeat', fix: 'wait' });
    move(d, record.slug, { kind: 'fit', fix });
    expect(d.done(record.returnObjective)).toBe(true);
    expect(readBearing(record.slug, d.s.flags).fitted).toBe(fix);
    const diary = d.s.adventureDiary.entries.find((entry) => entry.id === `quest:${record.returnObjective}`);
    expect(diary?.text).toContain(fix === 'wait' ? record.waitResult : record.sideResult);
    expect(diary?.text).not.toContain(fix === 'wait' ? record.sideResult : record.waitResult);
    expect(revisit.artBy?.keys[fix]).toBe(fix === 'side' ? 'bearing.side' : 'bearing.pair');
    d.run({ type: 'EquipPerspective', keepsake: null });
    expect(check(revisit.visibleIf, d.s)).toBe(false);
    expect(d.done(record.returnObjective)).toBe(true);
  });
});
