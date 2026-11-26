import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { emptyPair, parsePair, serialisePair, writeSuspend } from '../src/domain/saves';
import { SCOUT_ROUTES, scoutDecision, scoutNextTrial, scoutReport, scoutTrials, type ScoutDecision, type ScoutProtocol } from '../src/domain/scoutRoutes';
import { EMBERFORD } from '../src/maps/emberford';
import { Driver } from './driver';

function visible(d: Driver, id: string) {
  const prop = EMBERFORD.interactables.find((item) => item.id === id);
  if (!prop) throw new Error(`Unknown prop ${id}`);
  return check(prop.visibleIf, d.s);
}

function runCart(d: Driver, protocol: ScoutProtocol, decision: ScoutDecision) {
  const played = Number(d.s.flags[`scout.rounds.${protocol}`] ?? 0);
  return d.run({ type: 'RunScoutRoute', protocol, first: 'orchard', trial: scoutNextTrial(played), decision });
}

describe('The Scout’s Second Road', () => {
  it.each(SCOUT_ROUTES)('counts different sets of reports with %s chalked', (first) => {
    const informed = scoutTrials(first, 'informed');
    const independent = scoutTrials(first, 'independent');
    for (const [index, trial] of independent.entries()) {
      const withNotes = informed[index];
      expect(trial).toMatchObject({ first, clear: withNotes.clear, slip: withNotes.slip, opened: trial.slip });
      expect(withNotes.opened).not.toBe(first);
      expect(withNotes.opened).not.toBe(withNotes.clear);
      if (trial.other) {
        expect(scoutDecision(trial, 'hold').fits).not.toBe(scoutDecision(trial, 'change').fits);
      } else {
        expect(scoutDecision(trial, 'revealed')).toEqual({ route: trial.opened, fits: true });
      }
    }
    expect(scoutReport(informed)).toEqual({ rounds: 6, revealed: 0, blocked: 6, hold: 2, change: 4 });
    expect(scoutReport(independent)).toEqual({ rounds: 6, revealed: 2, blocked: 4, hold: 2, change: 2 });
    expect(new Set(informed.map(({ clear, slip }) => `${clear}.${slip}`)).size).toBe(6);
  });

  it('validates the map, played example, round and available cart decision', () => {
    const d = new Driver();
    expect(() => runCart(d, 'informed', 'hold')).toThrow(/Emberford/);
    d.s.mapId = EMBERFORD.id;
    expect(visible(d, 'scout-turn-board')).toBe(true);
    expect(() => d.run({ type: 'ReviewScoutProtocol', protocol: 'informed' })).toThrow(/practice cart/);
    expect(() => d.run({ type: 'RunScoutRoute', protocol: 'informed', first: 'orchard', trial: 7, decision: 'hold' })).toThrow(/current round/);
    expect(() => runCart(d, 'informed', 'revealed')).toThrow(/chalk route/);
    expect(d.s.flags['scout.rounds.informed']).toBeUndefined();
    expect(visible(d, 'scout-brief')).toBe(false);
  });

  it.each([
    ['briefed', 'Put the turning notes', 'open'],
    ['open', 'Keep the gate slips', 'briefed'],
  ])('publishes the %s instruction after switching protocols, repeating, and resuming', (result, label, alternative) => {
    const d = new Driver();
    d.s.mapId = EMBERFORD.id;
    const credit = { ...d.p.credit };
    const mainQuest = d.s.objectivesDone.filter((id) => id.startsWith('m02.'));
    runCart(d, 'informed', 'hold');
    expect(d.s.flags['scout.result.informed']).toBe('hold.blocked');
    d.run({ type: 'ReviewScoutProtocol', protocol: 'informed' });
    expect(visible(d, 'scout-brief')).toBe(false);

    runCart(d, 'independent', 'change');
    expect(d.s.flags['scout.result.independent']).toBe('change.fits');
    d.run({ type: 'ReviewScoutProtocol', protocol: 'independent' });
    expect(d.done('scout.o.compare')).toBe(true);
    expect(visible(d, 'scout-brief')).toBe(true);

    const save = writeSuspend(emptyPair(), { kind: 'suspend', label: 'Practice cart', location: EMBERFORD.name,
      savedAt: '2026-11-26T00:00:00.000Z', state: d.s });
    const loaded = parsePair(serialisePair(save));
    if (!loaded.ok || !loaded.pair.continue) throw new Error('Could not resume the practice cart');
    d.s = loaded.pair.continue.state;
    expect(() => runCart(d, 'independent', 'change')).toThrow(/already shown/);
    runCart(d, 'independent', 'revealed');
    expect(d.s.flags['scout.result.independent']).toBe('revealed.fits');
    expect(d.s.flags['scout.rounds.independent']).toBe(2);
    runCart(d, 'informed', 'change');
    expect(d.s.flags['scout.result.informed']).toBe('change.fits');
    expect(d.s.flags['scout.rounds.informed']).toBe(2);

    d.walk('scout.review', [label]);
    expect(d.done('scout.o.notice')).toBe(true);
    expect(d.s.journal).toContain('j.scout.notice');
    expect(visible(d, 'scout-brief')).toBe(false);
    expect(visible(d, `scout-notice-${result}`)).toBe(true);
    expect(visible(d, `scout-notice-${alternative}`)).toBe(false);
    expect(d.s.objectivesDone.filter((id) => id.startsWith('m02.'))).toEqual(mainQuest);
    expect(d.p.credit).toEqual(credit);
  });
});
