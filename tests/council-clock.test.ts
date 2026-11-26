import { describe, expect, it } from 'vitest';
import { councilClock } from '../src/domain/councilClock';
import { Driver } from './driver';

describe('Council of Inquiry watch bench', () => {
  it('gives two initial matches and one mismatch, but only one watch advances', () => {
    expect(councilClock('working')).toEqual({ watch: '12:00', reference: '12:00', after: '12:01' });
    expect(councilClock('matched')).toEqual({ watch: '12:00', reference: '12:00', after: '12:00' });
    expect(councilClock('drift')).toEqual({ watch: '12:00', reference: '11:00', after: '12:00' });
  });

  it('only records a trial after arrival at the bench and keeps prior cases', () => {
    const d = new Driver();
    const compare = () => d.run({ type: 'RunCouncilClock', trial: 'matched' });
    d.s.mapId = 'council.hall';
    expect(compare).toThrow(/watch bench/);
    d.run({ type: 'SetFlag', flag: 'council.arrived', value: true });
    d.s.mapId = 'council.gallery';
    expect(compare).toThrow(/watch bench/);
    d.s.mapId = 'council.hall';
    d.run({ type: 'RunCouncilClock', trial: 'working' });
    compare();
    expect(d.s.flags['council.trial.working']).toBe(true);
    expect(d.s.flags['council.trial.matched']).toBe(true);
    expect(d.s.flags['council.trial.drift']).toBeUndefined();
    const completed = d.s;
    compare();
    expect(d.s).toEqual(completed);
  });
});
