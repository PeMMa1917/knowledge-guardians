import { describe, expect, it } from 'vitest';
import {
  hasSkiffComparison, newSkiff, skiffAdvance, skiffBerth, skiffCurrent, skiffDelivery, skiffPractice, skiffRun,
  SKIFF_BERTHS, SKIFF_CREW, SKIFF_LAST_MARK, SKIFF_LOADS, SKIFF_STROKES, SKIFF_WEATHER,
  type SkiffBerth, type SkiffSetup, type SkiffStroke,
} from '../src/domain/islandSkiff';
import { check } from '../src/domain/rules';
import { emptyPair, parsePair, serialisePair, writeSuspend } from '../src/domain/saves';
import { ISLAND_DOCK, ISLAND_MARGIN } from '../src/maps/island';
import { SKIFF_LANDINGS } from '../src/maps/islandSkiff';
import { Driver } from './driver';

const BASIC: SkiffSetup = { mode: 'practice', weather: 'early', load: 'bundles', crew: 'lookout' };

function crossing(setup: SkiffSetup, berth?: SkiffBerth): SkiffStroke[] {
  const prospects = [{ run: newSkiff(setup), strokes: [] as SkiffStroke[] }];
  const visited = new Set<string>();
  for (let i = 0; i < prospects.length; i++) {
    const { run, strokes } = prospects[i];
    if (run.mark === SKIFF_LAST_MARK && (!berth || skiffBerth(run) === berth)) return strokes;
    const phase = setup.weather === 'early' ? 8 : 6;
    const key = [run.mark, run.lane, run.beat % phase].join(':');
    if (visited.has(key)) continue;
    visited.add(key);
    for (const stroke of SKIFF_STROKES) prospects.push({ run: skiffAdvance(run, stroke), strokes: [...strokes, stroke] });
  }
  throw new Error(`No crossing found for ${JSON.stringify(setup)} to ${berth || 'practice mooring'}`);
}

function start(d: Driver, setup: SkiffSetup) {
  d.run({ type: 'SkiffStart', setup });
}

function play(d: Driver, movements: SkiffStroke[]) {
  for (const stroke of movements) d.run({ type: 'SkiffStroke', stroke });
}

function arrive(d: Driver) {
  d.s.objectivesDone.push('island.finish');
  d.s.mapId = ISLAND_DOCK.id;
}

describe('Joss’s Skiff', () => {
  it('has a reachable practice mooring and both delivery berths with every crew, load and weather combination', () => {
    for (const weather of SKIFF_WEATHER) {
      for (const crew of SKIFF_CREW) {
        for (const load of SKIFF_LOADS) {
          expect(crossing({ mode: 'practice', weather, crew, load }).length).toBeGreaterThanOrEqual(SKIFF_LAST_MARK);
          for (const berth of SKIFF_BERTHS) {
            const setup = { mode: 'delivery', weather, crew, load } as const;
            const run = crossing(setup, berth).reduce(skiffAdvance, newSkiff(setup));
            expect(skiffBerth(run)).toBe(berth);
            expect(run.beat - run.holds).toBe(SKIFF_LAST_MARK);
          }
        }
      }
    }
  });

  it('lets waiting change the current, shoals change clearance, and a second rower resist drift', () => {
    const initial = newSkiff({ ...BASIC, weather: 'fresh' });
    const changed = skiffAdvance(skiffAdvance(initial, 'hold'), 'hold');
    expect(changed.mark).toBe(0);
    expect(changed.holds).toBe(2);
    expect(skiffCurrent(changed)).toBe(0);
    expect(skiffAdvance(initial, 'ahead').lane).toBe(3);
    expect(skiffAdvance({ ...initial, crew: 'rower' }, 'ahead').lane).toBe(2);
    const bundles = { ...newSkiff(BASIC), lane: 1 };
    expect(skiffAdvance(bundles, 'north')).toMatchObject({ mark: 1, lane: 0 });
    expect(skiffAdvance({ ...bundles, load: 'crates' }, 'north')).toMatchObject({ mark: 0, lane: 1, last: 'blocked' });
  });

  it('requires two completed practice trips under one matched setup and keeps unrelated comparisons distinct', () => {
    const d = new Driver();
    expect(() => start(d, BASIC)).toThrow(/use the skiff/i);
    arrive(d);
    expect(() => start(d, { ...BASIC, mode: 'delivery' })).toThrow(/both bell conditions/i);
    start(d, BASIC);
    play(d, crossing(BASIC));
    expect(skiffPractice(d.s.flags, BASIC)?.drifts).toBeGreaterThan(0);
    const unmatched = { ...BASIC, weather: 'fresh', crew: 'rower' } as const;
    start(d, unmatched);
    play(d, crossing(unmatched));
    expect(d.done('island.skiff.compare')).toBe(false);
    const matched = { ...BASIC, weather: 'fresh' } as const;
    start(d, matched);
    play(d, crossing(matched));
    expect(d.done('island.skiff.compare')).toBe(true);
    expect(hasSkiffComparison(d.s.flags, matched)).toBe(true);
    expect(hasSkiffComparison(d.s.flags, unmatched)).toBe(false);

    const previousReading = skiffPractice(d.s.flags, matched);
    start(d, matched);
    play(d, ['hold']);
    d.run({ type: 'SkiffMoor' });
    expect(skiffRun(d.s.flags)).toBeNull();
    expect(skiffPractice(d.s.flags, matched)).toEqual(previousReading);
  });

  it('resumes an actual run and leaves different signed receipts at reachable locations', () => {
    const d = new Driver();
    arrive(d);
    for (const weather of SKIFF_WEATHER) {
      const setup = { ...BASIC, weather };
      start(d, setup);
      play(d, crossing(setup));
    }
    for (const berth of SKIFF_BERTHS) {
      const setup = berth === 'stair' ? { ...BASIC, mode: 'delivery' } as const
        : { mode: 'delivery', weather: 'fresh', crew: 'rower', load: 'crates' } as const;
      const moves = crossing(setup, berth);
      start(d, setup);
      expect(() => d.run({ type: 'SkiffLand' })).toThrow(/alongside/i);
      play(d, moves.slice(0, 4));
      const middle = skiffRun(d.s.flags);
      expect(middle?.mark).toBeGreaterThan(0);
      const pair = writeSuspend(emptyPair(), { kind: 'suspend', label: 'Skiff run', location: ISLAND_DOCK.name,
        savedAt: '2026-11-26T06:00:00Z', state: d.s });
      const saved = parsePair(serialisePair(pair));
      if (!saved.ok || !saved.pair.continue) throw new Error('Could not resume at the dock');
      d.s = saved.pair.continue.state;
      expect(skiffRun(d.s.flags)).toEqual(middle);
      play(d, moves.slice(4));
      expect(skiffBerth(skiffRun(d.s.flags)!)).toBe(berth);
      const log = ISLAND_MARGIN.interactables.find((spot) => spot.id === `island-skiff-landing-${berth}-${setup.load}`)!;
      expect(check(log.visibleIf, d.s)).toBe(false);

      d.run({ type: 'SkiffLand' });
      expect(skiffRun(d.s.flags)).toBeNull();
      expect(skiffDelivery(d.s.flags, berth)).toMatchObject(setup);
      expect(d.s.flags['island.skiff.landed']).toBe(berth);
      expect(check(log.visibleIf, d.s)).toBe(true);
      const landing = SKIFF_LANDINGS[berth];
      expect(ISLAND_MARGIN.floor(landing.x, landing.y)).toBeTruthy();
      d.s.mapId = landing.map;
      d.run({ type: 'SetFlag', flag: log.flag!, value: true });
      expect(d.done('island.skiff.receipt')).toBe(true);
      expect(log.text).toContain(berth === 'stair' ? 'stair' : 'last');
      d.s.mapId = ISLAND_DOCK.id;
    }
    expect(d.p.credit).toEqual({});
    expect(d.s.marks).toBe(0);
    expect(d.s.journal).toContain('j.island.skiff.delivery');
    expect(skiffDelivery(d.s.flags, 'stair')?.load).toBe('bundles');
    expect(skiffDelivery(d.s.flags, 'ramp')?.load).toBe('crates');
  });
});
