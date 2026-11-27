import { describe, expect, it } from 'vitest';
import { ALIGN_CASES } from '../src/content/mapAlignment';
import { readSheet, sheetMove, sheetRead, SHEET_SCALES, type SheetMove } from '../src/domain/mapAlignment';
import { check } from '../src/domain/rules';
import { specimenToolId } from '../src/domain/specimenGear';
import { MAPS } from '../src/maps';
import { ALIGN_DOOR, ALIGN_RETURN, ALIGN_ROOM } from '../src/maps/mapAlignment';
import { Driver } from './driver';

function move(d: Driver, record: (typeof ALIGN_CASES)[number], action: SheetMove) {
  const effect = sheetMove(record.model, record.slug, d.s.flags, action);
  expect(effect).toBeDefined();
  if (effect) d.run({ type: 'SetFlag', flag: effect.setFlag, value: effect.value });
}

describe('The Third Landmark', () => {
  it('keeps the exact historical source and its equipped return at separate rooms for all 40 cases', () => {
    const d = new Driver();
    expect(ALIGN_CASES).toHaveLength(40);
    expect(new Set(ALIGN_CASES.map(({ key }) => key)).size).toBe(40);
    expect(new Set(ALIGN_CASES.map(({ asset }) => asset)).size).toBe(40);
    expect(MAPS[ALIGN_ROOM.id]).toBe(ALIGN_ROOM);
    expect(MAPS['copies.archive'].interactables).toContain(ALIGN_DOOR);
    expect(check(ALIGN_DOOR.visibleIf, d.s)).toBe(false);
    d.s.objectivesDone.push('copies.arrival');
    expect(check(ALIGN_DOOR.visibleIf, d.s)).toBe(true);
    const pack = d.e.pack;
    expect(pack.missions.find(({ id }) => id === 'KG-CH7-R29-ALIGN')?.caseVisits).toHaveLength(80);
    for (const c of ALIGN_CASES) {
      const exhibit = pack.exhibits.find(({ id }) => id === c.exhibit)!;
      expect(exhibit.specimen).toMatchObject({ accession: c.accession, pixelAsset: c.asset,
        revisit: { map: 'nile.route', prop: c.prop }, source: c.source });
      expect(exhibit.specimen?.people?.length).toBeGreaterThan(0);
      expect(exhibit.dateKind).toBe(c.dateKind);
      expect(pack.sources.some(({ id, url }) => id === c.source && url === c.catalog)).toBe(true);
      expect(ALIGN_ROOM.interactables.filter(({ exhibit: id }) => id === c.exhibit)).toHaveLength(1);
      expect(MAPS['nile.route'].interactables.some(({ id }) => id === c.prop)).toBe(true);
    }
    expect(ALIGN_CASES.find(({ slug }) => slug === 'manila-bay')?.dateKind).toContain('1792');
    expect(ALIGN_CASES.find(({ slug }) => slug === 'tobago-sheet')?.dateKind).toContain('1775');
  });

  it('distinguishes turning, translation, scale change and an independent far turn', () => {
    const fixture = { turn: 1, offset: [4, 5], outer: [1, -1] } as const;
    expect(sheetRead(fixture, 0, false, 'span').map((row) => row.gap)).toEqual([1, 9, 7]);
    expect(sheetRead(fixture, 0, true, 'span').slice(0, 2).map((row) => row.gap)).toEqual([0, 8]);
    expect(sheetRead(fixture, 3, true, 'original').slice(0, 2).map((row) => row.gap)).toEqual([0, 2]);
    expect(sheetRead(fixture, 3, true, 'span').map((row) => row.gap)).toEqual([0, 0, 2]);
    expect(sheetRead(fixture, 3, true, 'span', true).map((row) => row.gap)).toEqual([0, 0, 1]);
  });

  it('leaves other Map Room fixtures and the shared alignment bench accessible', () => {
    const room = MAPS['nile.route'];
    const [bench] = ALIGN_RETURN;
    const otherFixtures = room.interactables.filter((prop) => !ALIGN_RETURN.includes(prop));
    expect(ALIGN_RETURN.every((prop) => prop.x === bench.x && prop.y === bench.y)).toBe(true);
    expect(room.floor(bench.x + 1, bench.y)).toBe('stone-c');
    expect(otherFixtures.filter(({ x, y, w, h }) =>
      x <= bench.x && bench.x < x + w && y - 1 < bench.y + 1 && bench.y - 1 < y + h,
    )).toEqual([]);
    expect(otherFixtures.filter(({ x, y, w, h }) =>
      x <= bench.x + 1 && bench.x + 1 < x + w && y <= bench.y && bench.y < y + h,
    )).toEqual([]);
  });

  it.each(ALIGN_CASES)('uses $accession on the alignment stand and an independent old-map return', (record) => {
    const d = new Driver();
    d.s.objectivesDone.push('copies.arrival');
    d.run({ type: 'InspectExhibit', exhibit: record.exhibit });
    const index = ALIGN_CASES.indexOf(record);
    const reader = index % 2 ? 'pair' : 'strip', other = reader === 'strip' ? 'pair' : 'strip';
    const action = index % 2 ? 'survey' : 'tentative';
    move(d, record, { type: 'pin' });
    expect(sheetMove(record.model, record.slug, d.s.flags, { type: 'check' })).toBeUndefined();
    for (let i = 0; i < 4 - record.model.turn; i++) move(d, record, { type: 'turn' });
    move(d, record, { type: 'check' });
    move(d, record, { type: 'trial', mode: 'original' });
    expect(sheetMove(record.model, record.slug, d.s.flags, { type: 'send', reader })).toBeUndefined();
    move(d, record, { type: 'trial', mode: 'span' });
    move(d, record, { type: 'send', reader });
    expect(sheetMove(record.model, record.slug, d.s.flags, { type: 'receive', reader: other })).toBeUndefined();
    expect(d.done(record.objective)).toBe(false);
    move(d, record, { type: 'receive', reader });
    expect(d.done(record.objective)).toBe(true);
    const received = d.s.adventureDiary.entries.find((entry) => entry.id === `quest:${record.objective}`);
    expect(received?.text).toContain(reader === 'strip' ? record.stripResult : record.pairResult);
    d.run({ type: 'ClaimSpecimen', exhibit: record.exhibit });
    const prop = ALIGN_RETURN.find(({ id }) => id === record.prop)!;
    expect(check(prop.visibleIf, d.s)).toBe(false);
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(record.key) });
    expect(check(prop.visibleIf, d.s)).toBe(true);
    expect(ALIGN_RETURN.filter((it) => check(it.visibleIf, d.s))).toHaveLength(1);
    for (const mode of SHEET_SCALES) move(d, record, { type: 'revisit', mode });
    expect(d.done(record.second)).toBe(false);
    move(d, record, { type: 'place', action });
    expect(readSheet(record.slug, d.s.flags).returned).toBe(action);
    expect(d.done(record.second)).toBe(true);
    const diary = d.s.adventureDiary.entries.find((entry) => entry.id === `quest:${record.second}`);
    expect(diary?.text).toContain(action === 'tentative' ? record.nearResult : record.surveyResult);
    expect(diary?.text).not.toContain(action === 'tentative' ? record.surveyResult : record.nearResult);
  });
});
