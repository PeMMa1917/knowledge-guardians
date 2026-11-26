import { describe, expect, it } from 'vitest';
import { civicAllocation } from '../src/domain/civicConsole';
import { Driver } from './driver';

describe('Civic Machine route console', () => {
  it.each([
    ['desk', 'rank', 12, 5, 4, 0],
    ['desk', 'reserve', 12, 5, 3, 1],
    ['desk', 'even', 12, 5, 2, 2],
    ['combined', 'rank', 15, 16, 0, 4],
    ['combined', 'reserve', 15, 16, 1, 3],
    ['combined', 'even', 15, 16, 2, 2],
  ])('assigns four windows from the %s register using %s', (sample, rule, steps, canal, stepsWindows, canalWindows) => {
    expect(civicAllocation(sample, rule)).toEqual({
      counts: { steps, canal }, windows: { steps: stepsWindows, canal: canalWindows },
    });
  });

  it('requires the console and the second register before recording a combined run', () => {
    const d = new Driver();
    const run = () => d.run({ type: 'RunCivicTrial', sample: 'combined', rule: 'reserve' });
    expect(run).toThrow(/route console/);
    d.s.mapId = 'civic.dispatch';
    expect(run).toThrow(/route console/);
    d.run({ type: 'SetFlag', flag: 'civic.arrived', value: true });
    expect(run).toThrow(/walking register/);
    d.run({ type: 'RunCivicTrial', sample: 'desk', rule: 'reserve' });
    expect(d.s.flags['civic.trial.desk.reserve']).toBe(true);
    expect(d.s.flags['civic.trial.combined.reserve']).toBeUndefined();
    d.run({ type: 'SetFlag', flag: 'civic.walk.read', value: true });
    run();
    expect(d.s.flags['civic.trial.combined.reserve']).toBe(true);
    const completed = d.s;
    run();
    expect(d.s).toEqual(completed);
  });
});
