import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { emptyPair, parsePair, serialisePair, writeSuspend } from '../src/domain/saves';
import { CIVIC_CANAL, CIVIC_DISPATCH } from '../src/maps/civic';
import type { MapDef } from '../src/maps/types';
import { WATER_COUNCIL, WATER_LOWER_CHANNEL } from '../src/maps/water';
import { Driver } from './driver';

type Plan = 'guarantee' | 'express';
const ID = 'KG-CH12-R04';

function prop(map: MapDef, name: string) {
  const result = map.interactables.find((it) => it.id === 'parcel-' + name);
  if (!result) throw new Error(`Missing parcel prop ${name} in ${map.id}`);
  return result;
}

function visible(d: Driver, map: MapDef, name: string) {
  return check(prop(map, name).visibleIf, d.s);
}

function use(d: Driver, map: MapDef, name: string, option: string) {
  d.s.mapId = map.id;
  const spot = prop(map, name);
  expect(check(spot.visibleIf, d.s), name).toBe(true);
  if (!spot.node) throw new Error(`Missing parcel scene at ${name}`);
  d.walk(spot.node, [option]);
}

function restore(d: Driver, map: MapDef) {
  const pair = writeSuspend(emptyPair(), { kind: 'suspend', label: 'Parcel order', location: map.name,
    savedAt: '2026-11-26T06:00:00.000Z', state: d.s });
  const parsed = parsePair(serialisePair(pair));
  if (!parsed.ok || !parsed.pair.continue) throw new Error('Could not restore the parcel order');
  d.s = parsed.pair.continue.state;
}

function chooseOrder(d: Driver, plan: Plan) {
  d.s.objectivesDone.push('civic.finish', 'water.finish', 'market.finish');
  expect(d.e.activeMissions(d.s).some((m) => m.id === ID)).toBe(false);
  use(d, CIVIC_DISPATCH, 'open', 'Take the empty file');
  expect(d.e.activeMissions(d.s).some((m) => m.id === ID)).toBe(true);
  use(d, CIVIC_CANAL, 'path', 'Take Tarin’s sealed objection');
  expect(d.s.inventory['item.parcel.path']).toBe(1);
  expect(visible(d, CIVIC_DISPATCH, 'dispatch')).toBe(false);
  use(d, CIVIC_CANAL, 'rail', 'Take Velaine’s sealed objection');
  expect(d.s.inventory['item.parcel.rail']).toBe(1);
  expect(d.done('parcel.o.gather')).toBe(true);
  use(d, CIVIC_DISPATCH, 'dispatch', plan === 'guarantee' ? 'Stamp the right' : 'Send the cart');
  expect(d.s.flags['parcel.plan']).toBe(plan);
  expect(d.s.inventory).not.toHaveProperty('item.parcel.rail');
  expect(d.s.inventory).not.toHaveProperty('item.parcel.path');
  expect(d.s.inventory['item.parcel.docket']).toBe(1);
}

describe('The Second Delivery', () => {
  it.each([
    ['guarantee', 'express', WATER_COUNCIL, 'parcel-carrier', 'turn measurement', 'assign the attendant', 6, 'Two delivered to the seed carriers'],
    ['express', 'guarantee', WATER_LOWER_CHANNEL, 'parcel-bridge', 'second-bell handover', 'third-bell bank stop', 26, 'Two delivered to the bridge crew'],
  ] as const)('changes the %s route only after a locally supported appeal', (plan, other, firstMap, carrier, take, sign, x, text) => {
    const d = new Driver();
    d.s.flags['water.response'] = 'split';
    d.s.flags['civic.response'] = 'reserve';
    chooseOrder(d, plan);
    const gate = prop(WATER_COUNCIL, 'gate-' + plan);
    expect(check(gate.visibleIf, d.s)).toBe(true);
    expect(check(gate.openIf, d.s)).toBe(false);
    expect(visible(d, WATER_COUNCIL, 'gate-' + other)).toBe(false);
    expect(visible(d, WATER_LOWER_CHANNEL, 'second-' + plan)).toBe(false);
    expect(visible(d, WATER_COUNCIL, 'review-' + plan)).toBe(false);
    expect(visible(d, plan === 'guarantee' ? WATER_LOWER_CHANNEL : WATER_COUNCIL, 'first-' + other)).toBe(false);

    use(d, firstMap, 'first-' + plan, 'Record four served');
    expect(d.done('parcel.o.first')).toBe(true);
    d.s.mapId = WATER_LOWER_CHANNEL.id;
    const witness = WATER_LOWER_CHANNEL.npcs.find((npc) => npc.id === carrier);
    expect(witness).toBeDefined();
    expect(check(witness?.visibleIf, d.s)).toBe(true);
    d.talk(carrier, take);
    expect(d.s.inventory['item.parcel.appeal']).toBe(1);
    expect(check(gate.openIf, d.s)).toBe(false);
    restore(d, WATER_LOWER_CHANNEL);

    use(d, WATER_COUNCIL, 'review-' + plan, 'Keep the appeal open');
    expect(check(gate.openIf, d.s)).toBe(false);
    expect(d.s.inventory['item.parcel.appeal']).toBe(1);
    use(d, WATER_COUNCIL, 'review-' + plan, sign);
    expect(d.s.inventory).not.toHaveProperty('item.parcel.appeal');
    expect(d.s.inventory['item.parcel.permit']).toBe(1);
    expect(check(gate.openIf, d.s)).toBe(true);
    expect(check(prop(WATER_COUNCIL, 'gate-' + other).openIf, d.s)).toBe(false);
    expect(visible(d, WATER_LOWER_CHANNEL, 'second-' + plan)).toBe(false);
    expect(gate.to).toEqual({ map: WATER_LOWER_CHANNEL.id, x, y: 15 });
    expect(gate.flag).toBe('parcel.crossed.' + plan);

    // WorldScene sets the gate's flag when it moves the player through this open door.
    d.run({ type: 'SetFlag', flag: gate.flag!, value: true });
    use(d, WATER_LOWER_CHANNEL, 'second-' + plan, 'Hand over the two held parcels');
    expect(d.done('parcel.o.finish')).toBe(true);
    expect(d.s.inventory).not.toHaveProperty('item.parcel.docket');
    expect(d.s.inventory).not.toHaveProperty('item.parcel.permit');
    expect(d.s.inventory['item.parcel.receipt']).toBe(1);
    expect(visible(d, WATER_LOWER_CHANNEL, 'delivered-' + plan)).toBe(true);
    expect(prop(WATER_LOWER_CHANNEL, 'delivered-' + plan).text).toContain(text);
    expect(visible(d, WATER_LOWER_CHANNEL, 'delivered-' + other)).toBe(false);
    expect(check(gate.openIf, d.s)).toBe(true);

    use(d, CIVIC_DISPATCH, 'file-' + plan, 'File the delivery copy');
    expect(visible(d, CIVIC_DISPATCH, 'copy-' + plan)).toBe(true);
    expect(visible(d, CIVIC_DISPATCH, 'copy-' + other)).toBe(false);
    expect(prop(CIVIC_DISPATCH, 'copy-' + plan).text).toContain('under seal');
    expect(d.s.inventory).not.toHaveProperty('item.parcel.receipt');
    expect(d.s.flags['water.response']).toBe('split');
    expect(d.s.flags['civic.response']).toBe('reserve');
    expect(d.p.credit).toEqual({});
    expect(d.s.marks).toBe(0);
  });

  it('allows a player to leave the file closed, protecting both ordinary world routes', () => {
    const d = new Driver();
    expect(visible(d, CIVIC_DISPATCH, 'open')).toBe(false);
    expect(visible(d, WATER_COUNCIL, 'gate-guarantee')).toBe(false);
    d.s.objectivesDone.push('civic.finish');
    use(d, CIVIC_DISPATCH, 'open', 'Leave the parcel file');
    expect(visible(d, CIVIC_DISPATCH, 'open')).toBe(true);
    expect(visible(d, CIVIC_CANAL, 'rail')).toBe(false);
    expect(visible(d, CIVIC_CANAL, 'path')).toBe(false);
    expect(visible(d, WATER_COUNCIL, 'gate-express')).toBe(false);
    expect(CIVIC_DISPATCH.interactables.find((it) => it.id === 'civic-nexus-return')?.openIf).toBeUndefined();
    expect(WATER_COUNCIL.interactables.find((it) => it.id === 'water-council-to-lower')?.openIf).toBeUndefined();
  });
});
