import { expect, it } from 'vitest';
import visits from '../src/content/hall-visitors.json';
import { PASSAGES } from '../src/domain/corridor';
import { firstHallScene, hallShift } from '../src/domain/hallStories';
import { check } from '../src/domain/rules';
import { migrateCampaign } from '../src/domain/saves';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

it.each(visits)('lets $person travel, remember either parcel, come home and try the other arrangement', trip => {
  const d = new Driver();
  const home = PASSAGES[trip.home - 1].hall;
  const away = PASSAGES[trip.away - 1].hall;
  const key = 'journeyman.' + trip.person;
  const placed = (room: string) => MAPS[room].npcs.filter(p => p.id === trip.person && check(p.visibleIf, d.s)).length;
  for (const parcel of [0, 1]) {
    for (const answer of [0, 1]) {
      d.s.mapId = home;
      expect([placed(home), placed(away)]).toEqual([1, 0]);
      d.talk(trip.person, trip.packs[parcel]);
      expect([placed(home), placed(away)]).toEqual([0, 1]);
      d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
      d.s.mapId = away;
      const greeting = d.e.talkEntry(trip.person, d.s)!;
      expect(d.e.visibleOptions(greeting, d.s).map(a => a.option.next)).toEqual([key + '.trace' + parcel]);
      d.talk(trip.person, trip.packs[parcel], trip.answers[answer]);
      expect(d.s.adventureDiary.entries.some(e => e.text.includes(trip.traces[parcel]))).toBe(true);
      expect([placed(home), placed(away)]).toEqual([1, 0]);
      expect(d.s.flags[key + '.reported']).toBe(false);
      d.s.mapId = home;
      d.talk(trip.person, 'Hear what came home', 'Leave the keeper');
      expect(d.s.adventureDiary.entries.some(e => e.text.includes(trip.returns[answer]))).toBe(true);
      expect(d.s.flags[key + '.reported']).toBe(true);
    }
  }
});

it('preserves the first scene when entering by a crossing or a save, and lets the player revisit quietly', () => {
  for (const [i, p] of PASSAGES.entries()) {
    const d = new Driver();
    d.s.mapId = p.hall;
    const opening = hallShift(i + 1).opening;
    expect(firstHallScene(d.s)).toBe(i ? opening : undefined);
    d.run({ type: 'VisitPlace', name: p.name, via: i % 2 ? { from: 'nexus.archive', id: 'shelf', label: 'a case crossing' } : undefined });
    if (i) expect(d.s.adventureDiary.entries.filter(e => e.text.includes(opening))).toHaveLength(1);
    expect(firstHallScene(migrateCampaign(d.s).state)).toBeUndefined();
    d.run({ type: 'VisitPlace', name: p.name });
    expect(d.s.adventureDiary.entries.filter(e => e.text.includes(opening))).toHaveLength(i ? 1 : 0);
  }
});
