import { describe, expect, it } from 'vitest';
import { SERVICE_BOUNDARIES, servicePlan, WATER_REQUESTS } from '../src/domain/boundaryBoard';
import { guideObjectives } from '../src/domain/guidance';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

function prop(d: Driver, id: string) {
  return MAPS[d.s.mapId].interactables.find((item) => item.id === id && check(item.visibleIf, d.s));
}

function move(d: Driver, id: string) {
  const passage = prop(d, id);
  if (!passage?.to || !check(passage.openIf, d.s)) throw new Error('No passage: ' + id);
  if (passage.flag) d.run({ type: 'SetFlag', flag: passage.flag, value: true });
  d.s.mapId = passage.to.map;
}

function scene(d: Driver, id: string, option: string) {
  const station = prop(d, id);
  if (!station?.node) throw new Error('No scene: ' + id);
  d.walk(station.node, [option]);
}

describe('The Line on the Night Map', () => {
  it('moves only the division and changes the group totals and mean-wait priority', () => {
    const ditch = servicePlan('ditch');
    const bridge = servicePlan('bridge');
    expect([ditch.upper.requests.length, ditch.lower.requests.length]).toEqual([3, 6]);
    expect([bridge.upper.requests.length, bridge.lower.requests.length]).toEqual([6, 3]);
    expect([ditch.upper.average, ditch.lower.average, ditch.first]).toEqual([4, 7.5, 'lower']);
    expect([bridge.upper.average, bridge.lower.average, bridge.first]).toEqual([7, 5, 'upper']);

    for (const plan of [ditch, bridge]) {
      expect([...plan.upper.requests, ...plan.lower.requests]).toEqual(WATER_REQUESTS);
      expect(plan.delivered).toHaveLength(4);
      expect(new Set([...plan.delivered, ...plan.remaining])).toEqual(new Set(WATER_REQUESTS));
      expect(plan.remaining).toHaveLength(5);
    }
    expect(ditch.delivered.at(-1)?.label).toBe('Mooring rail');
    expect(bridge.delivered.at(-1)?.label).toBe('Upper stair');
  });

  it('does not count the same view twice or allow testing from outside the table', () => {
    const d = new Driver();
    expect(() => d.run({ type: 'SetServiceBoundary', seam: 'ditch' })).toThrow(/North Steps/);
    d.resumeAfter('water.finish');
    move(d, 'civic-door');
    move(d, 'civic-steps-path');
    expect(prop(d, 'boundary-civic-start')).toBeUndefined();
    d.resumeAfter('civic.finish');
    scene(d, 'boundary-civic-start', 'Peg the slips');
    expect(prop(d, 'boundary-civic-board')?.game).toBe('service-boundary');
    d.run({ type: 'SetServiceBoundary', seam: 'ditch' });
    d.run({ type: 'SetServiceBoundary', seam: 'ditch' });
    expect(d.done('boundary.civic.compare')).toBe(false);
    expect(prop(d, 'boundary-civic-post')).toBeUndefined();
    d.run({ type: 'SetServiceBoundary', seam: 'bridge' });
    expect(d.done('boundary.civic.compare')).toBe(true);
  });

  it.each(SERVICE_BOUNDARIES)('sends a different first delivery while retaining the other five (%s)', (seam) => {
    const d = new Driver();
    d.resumeAfter('market.finish', 'water.finish', 'civic.finish');
    move(d, 'civic-door');
    move(d, 'civic-steps-path');
    scene(d, 'boundary-civic-start', 'Peg the slips');
    d.run({ type: 'SetServiceBoundary', seam: 'ditch' });
    d.run({ type: 'SetServiceBoundary', seam: 'bridge' });
    scene(d, 'boundary-civic-post', seam === 'ditch' ? 'Keep the dated ditch line' : 'Use the footbridge');
    expect(d.done('boundary.civic.post')).toBe(true);
    expect(d.s.inventory['item.boundary.plan']).toBe(1);
    const objective = 'boundary.water.deliver';
    const goals = () => d.e.visibleObjectives(d.s);
    expect(guideObjectives(goals(), 'WORLD-13').map(({ id }) => id)).not.toContain(objective);
    const plan = servicePlan(seam);
    expect(prop(d, 'boundary-civic-signed-' + seam)?.text).toContain(plan.delivered.at(-1)?.label);

    move(d, 'civic-steps-return');
    move(d, 'civic-nexus-return');
    move(d, 'water-door');
    expect(prop(d, 'boundary-water-cart-' + plan.first)).toBeUndefined();
    move(d, 'water-council-path');
    expect(goals().find(({ id }) => id === objective)?.mission.world).toBe('WORLD-12');
    expect(guideObjectives(goals(), 'WORLD-12').map(({ id }) => id)).toContain(objective);
    expect(d.run({ type: 'RequestHint', objective }).events).toContainEqual(expect.objectContaining({
      kind: 'hint', hint: expect.objectContaining({ objective, depth: 1, text: expect.stringContaining('Sena') }),
    }));
    scene(d, 'boundary-water-receive', 'Keep the remaining slips');
    const pending = prop(d, 'boundary-water-pending-' + seam)?.text;
    for (const { label, x, y, wait } of plan.remaining) expect(pending).toContain(label + ' (square ' + x + ', ' + y + ', waited ' + wait + ' min)');
    for (const { label } of plan.delivered) expect(pending).not.toContain(label);
    expect(d.done('boundary.water.deliver')).toBe(false);

    const upper = plan.first === 'upper';
    const unavailable = 'boundary-water-cart-' + (upper ? 'lower' : 'upper');
    move(d, upper ? 'water-council-to-lower' : 'water-council-return');
    expect(prop(d, unavailable)).toBeUndefined();
    move(d, upper ? 'water-lower-to-council' : 'water-council-path');
    move(d, upper ? 'water-council-return' : 'water-council-to-lower');
    scene(d, 'boundary-water-cart-' + plan.first, 'Hand the four slips');
    const receipt = prop(d, 'boundary-water-receipt-' + plan.first)?.text;
    for (const { label } of plan.delivered) expect(receipt).toContain(label);
    expect(d.done('boundary.water.deliver')).toBe(true);
    expect(MAPS[d.s.mapId].world).toBe('WORLD-12');
    expect(d.p.skills['SK-MICRO-0630']).toEqual([
      'WORLD-13|game-13|boundary.civic.compare|HUM,MAT',
      'WORLD-12|game-263|boundary.water.deliver|HUM',
    ]);
    expect(guideObjectives(goals(), 'WORLD-12', objective).map(({ id }) => id)).not.toContain(objective);
    expect(d.s.journal).toContain('j.boundary.delivery');
    expect(d.s.inventory['item.boundary.plan']).toBe(1);
  });
});
