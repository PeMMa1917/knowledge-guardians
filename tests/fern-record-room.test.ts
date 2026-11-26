import { describe, expect, it } from 'vitest';
import { FERN_RECORDS, type FernRoute } from '../src/content/fernRecords';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { FERN_RECORD_DOOR, FERN_RECORD_ROOM } from '../src/maps/fernRecordRoom';
import type { MapDef } from '../src/maps/types';
import { Driver } from './driver';

const routeMap = (route: FernRoute) => route === 'field' ? 'forest.community' : FERN_RECORD_ROOM.id;
const visible = (map: MapDef, id: string, d: Driver) => {
  const prop = map.interactables.find((item) => item.id === id);
  expect(prop, id).toBeDefined();
  return check(prop!.visibleIf, d.s);
};

describe('A Room for Two Dates', () => {
  it('opens from Fern Station once the main arrival is complete and places each dated accession once', () => {
    const d = new Driver();
    expect(MAPS['forest.station'].interactables).toContain(FERN_RECORD_DOOR);
    expect(MAPS['forest.record-room']).toBe(FERN_RECORD_ROOM);
    expect(check(FERN_RECORD_DOOR.visibleIf, d.s)).toBe(false);
    d.s.objectivesDone.push('forest.arrival');
    expect(check(FERN_RECORD_DOOR.visibleIf, d.s)).toBe(true);
    expect(FERN_RECORDS).toHaveLength(9);
    expect(new Set(FERN_RECORDS.map((record) => record.key)).size).toBe(FERN_RECORDS.length);

    for (const entry of FERN_RECORDS) {
      const places = Object.values(MAPS).flatMap((map) => map.interactables
        .filter((prop) => prop.exhibit === entry.exhibit).map(() => map.id));
      expect(places, entry.accession).toEqual([FERN_RECORD_ROOM.id]);
      const exhibit = d.e.pack.exhibits.find(({ id }) => id === entry.exhibit);
      expect(exhibit).toMatchObject({
        historicalLabel: 'documented', dateText: entry.date,
        specimen: { key: entry.key, accession: entry.accession, source: entry.source, objective: entry.objective, pixelAsset: entry.pixelAsset },
      });
      expect(d.e.pack.sources.some(({ id, url }) => id === entry.source &&
        (url === entry.catalogueUrl || url === entry.exactSource))).toBe(true);
    }
  });

  it.each(['field', 'desk'] as const)('makes every object usable and recalls the %s route independently', (route) => {
    const opposite = route === 'field' ? 'desk' : 'field';
    const d = new Driver();
    d.s.objectivesDone.push('forest.arrival');
    for (const entry of FERN_RECORDS) {
      const id = `fern-${entry.slug}`;
      const room = FERN_RECORD_ROOM;
      const receiver = MAPS[routeMap(route)];
      const other = MAPS[routeMap(opposite)];
      d.s.mapId = room.id;
      expect(visible(room, `${id}-frame`, d)).toBe(false);
      d.run({ type: 'InspectExhibit', exhibit: entry.exhibit });
      expect(visible(room, `${id}-frame`, d)).toBe(true);
      d.walk(`${entry.flag}.frame`, [
        entry.tryAction,
        route === 'field' ? 'Lio at the Bridge Clearing' : 'Nemi at the records desk',
        'Keep it in hand',
      ]);
      expect(d.done(entry.objective)).toBe(false);
      expect(visible(receiver, `${id}-receive-${route}`, d)).toBe(true);
      expect(visible(other, `${id}-receive-${opposite}`, d)).toBe(false);
      expect(d.e.talkEntry(route === 'field' ? 'fern-record-lio' : 'fern-record-nemi', d.s))
        .toBe(`${entry.flag}.receive.${route}`);

      d.s.mapId = receiver.id;
      d.walk(`${entry.flag}.receive.${route}`, ['Keep carrying']);
      expect(d.done(entry.objective)).toBe(false);
      d.walk(`${entry.flag}.receive.${route}`, [route === 'field' ? entry.fieldAction : entry.deskAction]);
      expect(d.done(entry.objective)).toBe(true);
      expect(d.s.journal).toContain(`j.${entry.flag}.${route}`);
      expect(visible(receiver, `${id}-kept-${route}`, d)).toBe(true);
      expect(visible(room, `${id}-returned.${route}`, d)).toBe(true);
      expect(visible(room, `${id}-returned.${opposite}`, d)).toBe(false);
      d.s.mapId = room.id;
      d.walk(`${entry.flag}.returned.${route}`, ['Read the keeper’s reply']);
    }
    expect(d.done('forest.finish')).toBe(false);
  });

  it('holds just one copy and leaves a second frame prepared while it waits', () => {
    const d = new Driver();
    const [first, second] = FERN_RECORDS;
    d.s.objectivesDone.push('forest.arrival');
    d.s.mapId = FERN_RECORD_ROOM.id;
    d.run({ type: 'InspectExhibit', exhibit: first.exhibit });
    d.walk(`${first.flag}.frame`, [first.tryAction, 'Lio at the Bridge Clearing', 'Keep it in hand']);
    d.run({ type: 'InspectExhibit', exhibit: second.exhibit });
    d.walk(`${second.flag}.frame`, [second.tryAction, 'Leave the prepared']);
    expect(visible(FERN_RECORD_ROOM, `fern-${second.slug}-wait`, d)).toBe(true);
    expect(visible(FERN_RECORD_ROOM, `fern-${first.slug}-carry.field`, d)).toBe(true);
    d.walk(`${first.flag}.carry.field`, ['Put the copy back', 'Leave the prepared']);
    expect(visible(FERN_RECORD_ROOM, `fern-${second.slug}-send`, d)).toBe(true);
    d.walk(`${second.flag}.send`, ['Nemi at the records desk', 'Keep it in hand']);
    expect(visible(FERN_RECORD_ROOM, `fern-${second.slug}-receive-desk`, d)).toBe(true);
    expect(visible(MAPS['forest.community'], `fern-${first.slug}-receive-field`, d)).toBe(false);
  });
});
