import { describe, expect, it } from 'vitest';
import { seaChart } from '../src/domain/seaCharts';
import { Driver } from './driver';

describe('Cartographers’ Sea chart stands', () => {
  it('gives each record its own named places and unmapped area', () => {
    const harbour = seaChart('harbour');
    const shoal = seaChart('shoal');
    expect(harbour.marks.map((mark) => mark.name)).toEqual(['Seagrass Steps', 'Lantern House', 'Market Rail']);
    expect(harbour.limit).toContain('was not walked');
    expect(shoal.marks.map((mark) => mark.name)).toEqual(['Lantern House sight point', 'Shoal Shelf']);
    expect(shoal.limit).toContain('was not surveyed');
    expect(() => seaChart('source')).toThrow(/does not belong/);
  });

  it('checks the matching stand after entry and retains each reading separately', () => {
    const d = new Driver();
    d.s.mapId = 'sea.harbour';
    expect(() => d.run({ type: 'ReadSeaChart', chart: 'harbour' })).toThrow(/matching survey stand/);
    d.run({ type: 'SetFlag', flag: 'sea.arrived', value: true });
    expect(() => d.run({ type: 'ReadSeaChart', chart: 'shoal' })).toThrow(/matching survey stand/);
    d.run({ type: 'ReadSeaChart', chart: 'harbour' });
    expect(d.s.flags['sea.read.harbour']).toBe(true);
    expect(d.s.flags['sea.read.shoal']).toBeUndefined();
    d.s.mapId = 'sea.shoal';
    d.run({ type: 'ReadSeaChart', chart: 'shoal' });
    expect(d.s.flags['sea.read.shoal']).toBe(true);
    const after = d.s;
    d.run({ type: 'ReadSeaChart', chart: 'shoal' });
    expect(d.s).toEqual(after);
  });
});
