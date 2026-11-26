import { describe, expect, it } from 'vitest';
import {
  LOOP_DISPLAYS, LOOP_GAUGES, LOOP_MAP, LOOP_RETURNS, LOOP_SITES, LOOP_STRIP,
  loopKey, loopStarting, runWaterLoop, waterLoopServices, type LoopSetup, type LoopSite,
} from '../src/domain/waterLoop';
import { check } from '../src/domain/rules';
import { emptyPair, parsePair, serialisePair, writeSuspend } from '../src/domain/saves';
import { ISLAND_MARGIN, ISLAND_WORKSHOP } from '../src/maps/island';
import { OBSERVATORY_ARCHIVE } from '../src/maps/observatory';
import { Driver } from './driver';

const CURTAIN_LIFT: LoopSetup = { display: 'curtain', return: 'lift' };
const CURTAIN_NEAR: LoopSetup = { display: 'curtain', return: 'near' };
const SHOWER_LIFT: LoopSetup = { display: 'shower', return: 'lift' };

function trial(d: Driver, site: LoopSite, setup: LoopSetup) {
  d.s.mapId = LOOP_MAP[site];
  d.run({ type: 'RunWaterLoop', site, setup });
  for (const gauge of LOOP_GAUGES) d.run({ type: 'ReadWaterLoop', site, gauge });
}

function island(d: Driver) {
  d.s.mapId = ISLAND_WORKSHOP.id;
  d.s.objectivesDone.push('island.finish');
}

describe('The Water That Comes Back', () => {
  it('conserves water in every trial and accounts for water passing through again', () => {
    for (const site of LOOP_SITES) for (const display of LOOP_DISPLAYS) for (const route of LOOP_RETURNS) {
      const result = runWaterLoop(site, { display, return: route });
      expect(result.basin + result.spill).toBe(result.inflow + result.start);
      expect(result.pulses.every((pulse) => pulse.spare >= 0)).toBe(true);
    }
    const second = runWaterLoop('island', CURTAIN_LIFT);
    expect(second).toMatchObject({ start: 2, inflow: 6, basin: 5, reuse: 5, spill: 3, spare: 2 });
    expect(second.pulses[0].display + second.pulses[1].display).toBeGreaterThan(second.inflow);
    expect(waterLoopServices('archive', CURTAIN_LIFT).plate).toBe(true);
    expect(waterLoopServices('island', CURTAIN_LIFT).plate).toBe(false);
    expect(waterLoopServices('island', SHOWER_LIFT)).toEqual({ garden: true, plate: false });
    expect(waterLoopServices('island', CURTAIN_NEAR)).toEqual({ garden: false, plate: true });
  });

  it('clips each trial’s own readings and hands the checked Archive settings to the Island', () => {
    const d = new Driver();
    d.s.mapId = OBSERVATORY_ARCHIVE.id;
    expect(() => d.run({ type: 'RunWaterLoop', site: 'archive', setup: CURTAIN_NEAR })).toThrow(/after the main plan/);
    d.s.objectivesDone.push('coast.revise');
    trial(d, 'archive', CURTAIN_NEAR);
    expect(() => d.run({ type: 'SetWaterLoopService', site: 'archive', service: 'plate' })).toThrow(/three gauges/);
    trial(d, 'archive', CURTAIN_NEAR);
    expect(d.done('waterLoop.archive.compare')).toBe(false);
    trial(d, 'archive', CURTAIN_LIFT);
    expect(d.done('waterLoop.archive.compare')).toBe(true);
    d.run({ type: 'SetWaterLoopService', site: 'archive', service: 'plate' });
    expect(d.s.inventory[LOOP_STRIP]).toBe(1);
    const pair = writeSuspend(emptyPair(), { kind: 'suspend', label: 'Circulation strip', location: OBSERVATORY_ARCHIVE.name,
      savedAt: '2026-11-26T06:00:00Z', state: d.s });
    const saved = parsePair(serialisePair(pair));
    if (!saved.ok || !saved.pair.continue) throw new Error('Could not reload the checked strip');
    d.s = saved.pair.continue.state;
    island(d);
    d.run({ type: 'FitWaterLoopCard', source: 'carried' });
    expect(loopStarting(d.s.flags, 'island')).toEqual(CURTAIN_LIFT);
    trial(d, 'island', CURTAIN_LIFT);
    expect(() => d.run({ type: 'SetWaterLoopService', site: 'island', service: 'plate' })).toThrow(/this run can support/);
    d.run({ type: 'RunWaterLoop', site: 'island', setup: CURTAIN_NEAR });
    d.run({ type: 'ReadWaterLoop', site: 'island', gauge: 'basin' });
    expect(d.s.flags[loopKey('island', 'read.reuse')]).toBe(false);
    expect(() => d.run({ type: 'SetWaterLoopService', site: 'island', service: 'plate' })).toThrow(/three gauges/);
  });

  it('lets the local fallback operate either real side gate and leaves the normal path available', () => {
    const d = new Driver();
    island(d);
    expect(() => d.run({ type: 'FitWaterLoopCard', source: 'carried' })).toThrow(/own card/);
    d.run({ type: 'FitWaterLoopCard', source: 'local' });
    const normal = ISLAND_WORKSHOP.interactables.find((prop) => prop.id === 'island-margin-path')!;
    expect(normal.openIf).toBeUndefined();
    expect(normal.visibleIf).toBeUndefined();
    for (const [service, setup, next, x, y] of [
      ['garden', SHOWER_LIFT, 'plate', 7, 8], ['plate', CURTAIN_NEAR, 'garden', 23, 12],
    ] as const) {
      trial(d, 'island', setup);
      d.run({ type: 'SetWaterLoopService', site: 'island', service });
      const gate = ISLAND_WORKSHOP.interactables.find((prop) => prop.id === `water-loop-${service}-gate`)!;
      const other = ISLAND_WORKSHOP.interactables.find((prop) => prop.id === `water-loop-${next}-gate`)!;
      expect(check(gate.openIf, d.s)).toBe(true);
      expect(check(other.openIf, d.s)).toBe(false);
      const display = ISLAND_MARGIN.interactables.find((prop) => prop.id === `water-loop-${service}-opened`)!;
      expect(check(display.visibleIf, d.s)).toBe(false);
      expect(gate.to).toEqual({ map: ISLAND_MARGIN.id, x, y });
      d.run({ type: 'SetFlag', flag: gate.flag!, value: true });
      d.s.mapId = ISLAND_MARGIN.id;
      expect(check(display.visibleIf, d.s)).toBe(true);
      d.run({ type: 'SetFlag', flag: display.flag!, value: true });
      expect(d.done('waterLoop.island.finish')).toBe(true);
    }
    expect(d.s.inventory[LOOP_STRIP]).toBeUndefined();
    expect(d.p.credit).toEqual({});
    expect(d.s.marks).toBe(0);
  });
});
