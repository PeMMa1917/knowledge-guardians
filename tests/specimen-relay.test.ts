import { describe, expect, it } from 'vitest';
import { RELAY_CASES, RELAY_GROUP } from '../src/content/relayCases';
import { check } from '../src/domain/rules';
import { RELAY_CLIPS, relayMove, relayState, weaveLine } from '../src/domain/specimenRelay';
import { MAPS } from '../src/maps';
import { SEA_RELAY_CHART_RECEIVER, SEA_RELAY_ENTRANCE, SEA_RELAY_HARBOUR_RECEIVER, SEA_RELAY_ROOM } from '../src/maps/specimenRelay';
import { Driver } from './driver';

function move(d: Driver, record: (typeof RELAY_CASES)[number], action: Parameters<typeof relayMove>[2]) {
  expect(check({ card: record.card }, d.s)).toBe(true);
  const effect = relayMove(record.key, d.s.flags, action);
  expect(effect).toBeTruthy();
  if (effect) d.run({ type: 'SetFlag', flag: effect.setFlag, value: effect.value });
}

describe('One Clip Before the Bell', () => {
  it('reaches one stand for each documented specimen without opening another chapter gate', () => {
    const d = new Driver();
    expect(check(SEA_RELAY_ENTRANCE.visibleIf, d.s)).toBe(false);
    d.s.objectivesDone.push('sea.arrival');
    expect(check(SEA_RELAY_ENTRANCE.visibleIf, d.s)).toBe(true);
    expect(SEA_RELAY_ENTRANCE.to?.map).toBe(SEA_RELAY_ROOM.id);
    expect(MAPS['sea.chartroom'].interactables).toContain(SEA_RELAY_ENTRANCE);
    expect(MAPS[SEA_RELAY_ROOM.id]).toBe(SEA_RELAY_ROOM);
    expect(SEA_RELAY_ROOM.interactables.find((prop) => prop.to)?.to).toEqual({ map: 'sea.chartroom', x: 22, y: 7 });
    expect(MAPS['sea.harbour'].interactables).toContain(SEA_RELAY_HARBOUR_RECEIVER);
    expect(MAPS['sea.chartroom'].interactables).toContain(SEA_RELAY_CHART_RECEIVER);
    expect(new Set(RELAY_CASES.map((record) => record.exhibit)).size).toBe(8);
    for (const record of RELAY_CASES) {
      const exhibit = d.e.pack.exhibits.find((entry) => entry.id === record.exhibit);
      expect(exhibit?.specimen).toMatchObject({ accession: record.accession, objective: record.objective, pixelAsset: record.asset });
      expect(exhibit?.historicalLabel).toBe('documented');
      expect(exhibit?.dateText).toBe(record.date);
      expect(d.e.pack.sources.find(({ id }) => id === record.source)?.url).toBe(record.catalogUrl);
      const spots = Object.values(MAPS).flatMap((map) => map.interactables.filter((prop) => prop.exhibit === record.exhibit));
      expect(spots, record.accession).toHaveLength(1);
      expect(SEA_RELAY_ROOM.interactables).toContain(spots[0]);
      expect(SEA_RELAY_ROOM.interactables.some((prop) => prop.game === `${RELAY_GROUP}:${record.slug}`)).toBe(true);
    }
    for (const accession of ['1980.153.2', '1980.153.3']) {
      const cast = d.e.pack.exhibits.find((entry) => entry.specimen?.accession === accession);
      expect(cast?.dateKind).toContain('Making of this plaster cast');
      expect(cast?.summary).toContain('represented form');
    }
  });

  it.each(RELAY_CLIPS)('stops only the trailing clip when %s leads', (first) => {
    const second = RELAY_CLIPS.find((clip) => clip !== first);
    expect(weaveLine(first, 'still')).toEqual({ arrived: [first, second], held: [] });
    expect(weaveLine(first, 'gust')).toEqual({ arrived: [first], held: [second] });
  });

  it('requires matched conditions and callback before the early copy can be reunited', () => {
    const d = new Driver();
    d.s.objectivesDone.push('sea.arrival');
    const [record, other] = RELAY_CASES;
    d.run({ type: 'InspectExhibit', exhibit: record.exhibit });
    expect(relayMove(record.key, d.s.flags, { type: 'trial', weather: 'gust' })).toBeNull();
    move(d, record, { type: 'thread', first: 'record' });
    move(d, record, { type: 'trial', weather: 'still' });
    move(d, record, { type: 'thread', first: 'detail' });
    move(d, record, { type: 'trial', weather: 'gust' });
    expect(relayMove(record.key, d.s.flags, { type: 'send', channel: 'bell' })).toBeNull();
    move(d, record, { type: 'trial', weather: 'still' });
    move(d, record, { type: 'send', channel: 'bell' });
    expect(relayState(record.key, d.s.flags).delivery).toEqual({ channel: 'bell', first: 'detail' });
    expect(check(SEA_RELAY_HARBOUR_RECEIVER.artOpen?.if, d.s)).toBe(true);
    expect(check(SEA_RELAY_CHART_RECEIVER.artOpen?.if, d.s)).toBe(false);
    expect(relayMove(record.key, d.s.flags, { type: 'reunite', channel: 'trace' })).toBeNull();
    expect(relayMove(record.key, d.s.flags, { type: 'reunite', channel: 'bell' })).toBeNull();
    expect(relayMove(record.key, d.s.flags, { type: 'send', channel: 'trace' })).toBeNull();
    expect(d.done(record.objective)).toBe(false);
    move(d, record, { type: 'request-missing' });
    move(d, record, { type: 'reunite', channel: 'bell' });
    expect(d.done(record.objective)).toBe(true);
    expect(d.done(other.objective)).toBe(false);
    expect(d.s.journal).toContain(`j.${record.key}`);
  });

  it.each(RELAY_CASES)('lets $accession deliver both clips together after the bell', (record) => {
    const d = new Driver();
    d.s.objectivesDone.push('sea.arrival');
    d.run({ type: 'InspectExhibit', exhibit: record.exhibit });
    move(d, record, { type: 'thread', first: 'record' });
    move(d, record, { type: 'trial', weather: 'gust' });
    move(d, record, { type: 'trial', weather: 'still' });
    move(d, record, { type: 'send', channel: 'trace' });
    expect(relayMove(record.key, d.s.flags, { type: 'request-missing' })).toBeNull();
    expect(d.done(record.objective)).toBe(false);
    move(d, record, { type: 'reunite', channel: 'trace' });
    expect(d.done(record.objective)).toBe(true);
    expect(relayMove(record.key, d.s.flags, { type: 'reunite', channel: 'trace' })).toBeNull();
  });
});
