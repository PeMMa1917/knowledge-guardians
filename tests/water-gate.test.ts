import { describe, expect, it } from 'vitest';
import { WATER_SETTINGS, waterTrial } from '../src/domain/waterGate';
import { Driver } from './driver';

describe('Water Commons trial gate', () => {
  it.each([
    ['fields', 7, 3, 5],
    ['split', 5, 5, 7],
    ['channel', 3, 7, 9],
  ])('keeps the intake and the field allocation fixed for the %s setting', (setting, farm, before, after) => {
    expect(waterTrial('drought', setting)).toEqual({ incoming: 12, leak: 2, farm, river: before });
    expect(waterTrial('repaired', setting)).toEqual({ incoming: 12, leak: 0, farm, river: after });
  });

  it('directs each command to the current gate condition and keeps the recorded drought runs', () => {
    const d = new Driver();
    const run = () => d.run({ type: 'RunWaterTrial', setting: 'fields' });
    expect(run).toThrow(/trial gate/);
    d.run({ type: 'SetFlag', flag: 'water.arrived', value: true });
    expect(run).toThrow(/trial gate/);
    d.s.mapId = 'water.gatehouse';
    for (const setting of WATER_SETTINGS) d.run({ type: 'RunWaterTrial', setting });
    expect(d.s.flags['water.trial.drought.fields']).toBe(true);
    expect(d.s.flags['water.trial.repaired.fields']).toBeUndefined();
    d.run({ type: 'SetFlag', flag: 'water.repaired', value: true });
    run();
    expect(d.s.flags['water.trial.drought.fields']).toBe(true);
    expect(d.s.flags['water.trial.repaired.fields']).toBe(true);
    expect(d.s.flags['water.trial.repaired.split']).toBeUndefined();
    const completed = d.s;
    run();
    expect(d.s).toEqual(completed);
    expect(() => waterTrial('drought', 'other')).toThrow(/setting/);
  });
});
