import { describe, expect, it } from 'vitest';
import { civicLaneRouting, reliefRouting, RELIEF_PULSES, ROUTE_SOCKETS, type RouteLayout } from '../src/domain/routeTiles';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const layouts: RouteLayout[] = ['plain', ...ROUTE_SOCKETS];

describe('relief routing board', () => {
  it('counts every bucket at exactly one outlet, in the basin, or across the bank', () => {
    for (const pulse of RELIEF_PULSES) {
      for (const layout of layouts) {
        const { rows, channel, basin, spill } = reliefRouting(pulse, layout);
        expect(rows + channel + basin + spill).toBe(pulse);
        expect(basin).toBeLessThanOrEqual(2);
      }
    }
    expect(reliefRouting(6, 'plain')).toEqual({ rows: 2, channel: 3, basin: 1, spill: 0 });
    expect(reliefRouting(8, 'plain')).toEqual({ rows: 2, channel: 3, basin: 2, spill: 1 });
    expect(reliefRouting(8, 'first')).toEqual({ rows: 4, channel: 3, basin: 1, spill: 0 });
    expect(reliefRouting(8, 'second')).toEqual({ rows: 2, channel: 5, basin: 1, spill: 0 });
  });
});

describe('Civic lane board', () => {
  it('counts residents who wait at a stop with unused places', () => {
    const stair = { served: 2, empty: 1, waitingStepFree: 2, waitingFlexible: 0 };
    const ramp = { served: 3, empty: 0, waitingStepFree: 0, waitingFlexible: 1 };
    expect(civicLaneRouting('plain')).toEqual({ steps: stair, canal: stair });
    expect(civicLaneRouting('first')).toEqual({ steps: ramp, canal: stair });
    expect(civicLaneRouting('second')).toEqual({ steps: stair, canal: ramp });
  });
});

function object(map: string, id: string) {
  const item = MAPS[map].interactables.find((entry) => entry.id === id);
  if (!item) throw new Error(`Missing ${id} at ${map}`);
  return item;
}

function write(d: Driver, flag: string, value: string | boolean = true) {
  d.run({ type: 'SetFlag', flag, value });
}

function read(d: Driver, map: string, id: string) {
  const item = object(map, id);
  if (!item.flag || !check(item.visibleIf, d.s)) throw new Error(`Cannot read ${id}`);
  d.s.mapId = map;
  write(d, item.flag);
}

describe('routing results on the banks and stops', () => {
  it.each([
    { layout: 'first', water: 'rows', alternateWater: 'channel', stop: 'steps', alternateStop: 'canal' },
    { layout: 'second', water: 'channel', alternateWater: 'rows', stop: 'canal', alternateStop: 'steps' },
  ])('keeps the unmet request with the $water relief and $stop ramp layouts', ({ layout, water, alternateWater, stop, alternateStop }) => {
    const d = new Driver();
    const reliefBench = object('water.gatehouse', 'water-relief-bench');
    const laneBoard = object('civic.dispatch', 'civic-route-tiles');
    const callback = object('civic.dispatch', `civic-routing-water-${water}`);
    expect(check(reliefBench.visibleIf, d.s)).toBe(false);
    expect(check(laneBoard.visibleIf, d.s)).toBe(false);
    d.s.objectivesDone.push('water.finish');
    expect(check(reliefBench.visibleIf, d.s)).toBe(true);
    read(d, 'water.lower-channel', 'water-relief-seed-slip');
    write(d, 'water.routing.trial.8.first');
    write(d, 'water.routing.trial.8.second');
    expect(d.done('water.routing.compare')).toBe(false);
    read(d, 'water.lower-channel', 'water-relief-channel-slip');
    expect(d.done('water.routing.compare')).toBe(true);
    write(d, 'water.routing.layout', layout);
    expect(d.done('water.routing.finish')).toBe(false);
    expect(check(callback.visibleIf, d.s)).toBe(false);
    read(d, 'water.lower-channel', `water-relief-installed-${water}`);
    expect(d.done('water.routing.finish')).toBe(true);
    expect(check(callback.visibleIf, d.s)).toBe(true);
    expect(check(object('civic.dispatch', `civic-routing-water-${alternateWater}`).visibleIf, d.s)).toBe(false);
    expect(check(object('water.lower-channel', `water-relief-installed-${alternateWater}`).visibleIf, d.s)).toBe(false);
    expect(d.s.flags['water.revision']).toBeUndefined();

    d.s.objectivesDone.push('civic.finish');
    expect(check(laneBoard.visibleIf, d.s)).toBe(true);
    read(d, 'civic.steps', 'civic-routing-steps-slip');
    read(d, 'civic.canal', 'civic-routing-canal-slip');
    write(d, 'civic.routing.trial.first');
    expect(d.done('civic.routing.compare')).toBe(false);
    write(d, 'civic.routing.trial.second');
    expect(d.done('civic.routing.compare')).toBe(true);
    write(d, 'civic.routing.layout', layout);
    expect(d.done('civic.routing.finish')).toBe(false);
    read(d, `civic.${stop}`, `civic-routing-${stop}-ramp`);
    expect(d.done('civic.routing.finish')).toBe(true);
    expect(check(object(`civic.${alternateStop}`, `civic-routing-${alternateStop}-ramp`).visibleIf, d.s)).toBe(false);
    expect(d.s.flags['civic.response']).toBeUndefined();
  });

  it('offers a lane board even when the player skipped the relief model', () => {
    const d = new Driver();
    d.s.objectivesDone.push('water.finish', 'civic.finish');
    expect(check(object('civic.dispatch', 'civic-route-tiles').visibleIf, d.s)).toBe(true);
    expect(check(object('civic.dispatch', 'civic-routing-water-rows').visibleIf, d.s)).toBe(false);
    expect(check(object('civic.dispatch', 'civic-routing-water-channel').visibleIf, d.s)).toBe(false);
  });
});
