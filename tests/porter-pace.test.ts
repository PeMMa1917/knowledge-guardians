import { describe, expect, it } from 'vitest';
import { movePorterTrial, PORTER_EARLY, PORTER_EARLY_CHECKED, PORTER_LATER, PORTER_LATER_CHECKED,
  PORTER_SLIP, porterCrewTrace, porterPaceTrace, porterStep, runPorterTrial, startPorterTrial } from '../src/domain/porterPace';
import { check } from '../src/domain/rules';
import { emptyPair, parsePair, serialisePair, writeSuspend } from '../src/domain/saves';
import { EMBERFORD } from '../src/maps/emberford';
import { PORTER_COUNCIL, PORTER_EMBERFORD } from '../src/maps/porterPace';
import { WATER_COUNCIL, WATER_GATEHOUSE } from '../src/maps/water';
import { Driver } from './driver';

describe('The Pace of a Load and The Middle Handover', () => {
  it('measures arrival, peak and two recovery observations separately for the same route', () => {
    const lead = runPorterTrial('emberford', 'front', 'solo');
    const even = runPorterTrial('emberford', 'even', 'solo');
    expect(lead).toMatchObject({ leg: 4, arrival: 6, elapsed: 8, peak: 28, burden: [20, 0], recovery: 2 });
    expect(even).toMatchObject({ leg: 4, arrival: 8, elapsed: 10, peak: 22, burden: [14, 0], recovery: 2 });
  });

  it.each([['front', 6, 32, 19], ['even', 8, 26, 13]] as const)(
    'preserves the %s pace under both staffing plans and spends a turn at the midway exchange', (pace, arrival, soloPeak, relayPeak) => {
      const config = ['water', pace, 'relay'] as const;
      let trial = startPorterTrial();
      trial = movePorterTrial(trial, ...config);
      trial = movePorterTrial(trial, ...config);
      expect(porterStep(trial, ...config)).toMatchObject({ kind: 'pass', turns: 1 });
      const passed = movePorterTrial(trial, ...config);
      expect(passed).toMatchObject({ leg: 2, elapsed: trial.elapsed + 1, handed: true, burden: [trial.burden[0] - 4, 0] });
      const relay = runPorterTrial(...config);
      const solo = runPorterTrial('water', pace, 'solo');
      expect(solo).toMatchObject({ leg: 4, arrival, peak: soloPeak, recovery: 2 });
      expect(relay).toMatchObject({ leg: 4, arrival: arrival + 1, peak: relayPeak, burden: [0, 5], recovery: 2 });
    },
  );

  it.each([['front', 'relay'], ['even', 'solo']] as const)('carries the %s slip to a checked %s roster', (pace, crew) => {
    const d = new Driver();
    const earlyBoard = PORTER_EMBERFORD[0];
    const waterBoard = PORTER_COUNCIL[0];
    expect(EMBERFORD.interactables).toContain(earlyBoard);
    expect(WATER_COUNCIL.interactables).toContain(waterBoard);
    expect(check(earlyBoard.visibleIf, d.s)).toBe(false);
    d.run({ type: 'SetFlag', flag: 'reached.emberford', value: true });
    expect(check(earlyBoard.visibleIf, d.s)).toBe(true);
    d.run({ type: 'SetFlag', flag: porterPaceTrace('front'), value: true });
    expect(d.done(PORTER_EARLY_CHECKED)).toBe(false);
    d.run({ type: 'SetFlag', flag: porterPaceTrace('even'), value: true });
    expect(d.done(PORTER_EARLY_CHECKED)).toBe(true);
    d.run({ type: 'SetFlag', flag: PORTER_EARLY, value: pace });
    const earlyReceipts = PORTER_EMBERFORD.slice(1).filter(({ visibleIf }) => check(visibleIf, d.s));
    expect(earlyReceipts.map(({ id }) => id)).toEqual([`porter-pace-${pace}`]);
    d.resumeAfter('market.finish');
    d.run({ type: 'SetFlag', flag: 'water.arrived', value: true });
    expect(check(waterBoard.visibleIf, d.s)).toBe(false);
    d.run({ type: 'SetFlag', flag: earlyReceipts[0].flag!, value: true });
    expect(d.s.inventory[PORTER_SLIP]).toBe(1);
    expect(check(waterBoard.visibleIf, d.s)).toBe(true);
    const pair = writeSuspend(emptyPair(), { kind: 'suspend', label: 'Porter’s strip', location: EMBERFORD.name,
      savedAt: '2026-11-26T11:30:00Z', state: d.s });
    const loaded = parsePair(serialisePair(pair));
    if (!loaded.ok || !loaded.pair.continue) throw new Error('The carry record did not reopen');
    d.s = loaded.pair.continue.state;
    expect(d.s.flags[PORTER_EARLY]).toBe(pace);
    expect(check(waterBoard.visibleIf, d.s)).toBe(true);

    d.run({ type: 'SetFlag', flag: porterCrewTrace('solo'), value: true });
    expect(d.done(PORTER_LATER_CHECKED)).toBe(false);
    d.run({ type: 'SetFlag', flag: porterCrewTrace('relay'), value: true });
    expect(d.done(PORTER_LATER_CHECKED)).toBe(true);
    d.run({ type: 'SetFlag', flag: PORTER_LATER, value: crew });
    const laterReceipts = PORTER_COUNCIL.slice(1).filter(({ visibleIf }) => check(visibleIf, d.s));
    expect(laterReceipts.map(({ id }) => id)).toEqual([`porter-crew-${crew}-${pace}`]);
    expect(d.done('porter.crew.filed')).toBe(false);
    d.run({ type: 'SetFlag', flag: laterReceipts[0].flag!, value: true });
    expect(d.done('porter.crew.filed')).toBe(true);
    expect(d.p.credit).toEqual({});
  });

  it('keeps the upper bridge crossing and both receipt positions on traversable map tiles', () => {
    const blocked = (x: number, y: number) => WATER_GATEHOUSE.blocks.some(([left, top, w, h]) =>
      x >= left && x < left + w && y >= top && y < top + h);
    expect(blocked(18, 8)).toBe(true);
    expect(blocked(18, 9)).toBe(false);
    expect(WATER_GATEHOUSE.floor(18, 9)).toBe('water-bridge');
    PORTER_COUNCIL.forEach(({ x, y }) => expect(WATER_COUNCIL.floor(x, y)).not.toBeNull());
  });
});
