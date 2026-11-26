import { describe, expect, it } from 'vitest';
import { readMetalSample } from '../src/domain/metalSample';
import { Driver } from './driver';

describe('Metalworks balance', () => {
  it('returns separate fictional readings for the matched panels', () => {
    expect(readMetalSample('panel-a').mass).toBe(2);
    expect(readMetalSample('panel-b').mass).toBe(4);
    expect(() => readMetalSample('toString')).toThrow(/does not belong/);
  });

  it('requires the newly opened yard and records each sample independently', () => {
    const d = new Driver();
    d.s.mapId = 'metalworks.yard';
    expect(() => d.run({ type: 'CompareMetalSample', sample: 'panel-a' })).toThrow(/yard/);
    d.run({ type: 'SetFlag', flag: 'metal.arrived', value: true });
    d.run({ type: 'CompareMetalSample', sample: 'panel-a' });
    expect(d.s.flags['metal.test.panel-a']).toBe(true);
    expect(d.s.flags['metal.test.panel-b']).toBeUndefined();
    d.run({ type: 'CompareMetalSample', sample: 'panel-b' });
    expect(d.s.flags['metal.test.panel-b']).toBe(true);
    const after = d.s;
    d.run({ type: 'CompareMetalSample', sample: 'panel-a' });
    expect(d.s).toEqual(after);
  });
});
