import { describe, expect, it } from 'vitest';
import { compareCopy } from '../src/domain/copyComparison';
import { Driver } from './driver';

describe('City of Copies comparison tables', () => {
  it('loses the time restriction at the press and the retained source at the landing', () => {
    const press = compareCopy('press');
    const landing = compareCopy('landing');
    expect(press.lost).toEqual(['During Tuesday’s trial']);
    expect(landing.lost).toEqual(['Lending Clerk, trial log']);
    expect(landing.before).toEqual(press.after);
    expect(press.before.claim).toBe(landing.after.claim);
    expect(() => compareCopy('source')).toThrow(/does not belong/);
  });

  it('records the matching table independently after City entry', () => {
    const d = new Driver();
    d.s.mapId = 'copies.press';
    expect(() => d.run({ type: 'CompareCopy', edition: 'press' })).toThrow(/matching comparison table/);
    d.run({ type: 'SetFlag', flag: 'copies.arrived', value: true });
    expect(() => d.run({ type: 'CompareCopy', edition: 'landing' })).toThrow(/matching comparison table/);
    d.run({ type: 'CompareCopy', edition: 'press' });
    expect(d.s.flags['copies.checked.press']).toBe(true);
    expect(d.s.flags['copies.checked.landing']).toBeUndefined();
    d.s.mapId = 'copies.landing';
    d.run({ type: 'CompareCopy', edition: 'landing' });
    expect(d.s.flags['copies.checked.landing']).toBe(true);
    const after = d.s;
    d.run({ type: 'CompareCopy', edition: 'landing' });
    expect(d.s).toEqual(after);
  });

  it('shows both restored lines only after the landing notice revision', () => {
    const d = new Driver();
    d.s.mapId = 'copies.landing';
    d.s.flags['copies.arrived'] = true;
    expect(() => d.run({ type: 'CompareCopy', edition: 'proof' })).toThrow(/revise the notice/);
    d.s.flags['copies.followup'] = true;
    d.run({ type: 'CompareCopy', edition: 'proof' });
    const proof = compareCopy('proof');
    expect(proof.restored).toEqual(['During Tuesday’s trial', 'Lending Clerk, trial log']);
    expect(proof.after.claim).toBe(proof.before.claim);
    expect(d.s.flags['copies.checked.proof']).toBe(true);
  });
});
