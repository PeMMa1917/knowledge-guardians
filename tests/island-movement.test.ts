import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

function visible(d: Driver, id: string) {
  const prop = MAPS[d.s.mapId].interactables.find((entry) => entry.id === 'island-movement-' + id);
  return prop && check(prop.visibleIf, d.s) ? prop : undefined;
}

function useScene(d: Driver, id: string, choice: string) {
  const prop = visible(d, id);
  if (!prop?.node) throw new Error('No reachable scene at ' + id);
  d.walk(prop.node, [choice]);
}

function cross(d: Driver, id: string) {
  const door = MAPS[d.s.mapId].interactables.find((entry) => entry.id === id && entry.kind === 'door');
  if (!door?.to || !check(door.openIf, d.s) || !check(door.visibleIf, d.s)) throw new Error('No reachable door ' + id);
  if (door.flag) d.run({ type: 'SetFlag', flag: door.flag, value: true });
  d.s.mapId = door.to.map;
}

function openIsland(d: Driver) {
  d.resumeAfter('voices.finish');
  cross(d, 'island-door');
  cross(d, 'island-dock-path');
}

const flow = 'Call the next two steps';
const hold = 'Hold the shape for a count';
const portable = 'item.island.movement.sheet';

describe('The Held Count', () => {
  it('lets arrivals defer the rehearsal and inspect no cue that they have not reached', () => {
    const d = new Driver();
    openIsland(d);
    expect(visible(d, 'flow')).toBeUndefined();
    expect(visible(d, 'hold')).toBeUndefined();
    expect(visible(d, 'back')).toBeUndefined();
    d.talk('island-caller', 'I’ll come back');
    expect(d.e.activeMissions(d.s).some((mission) => mission.id === 'KG-CH14-R04')).toBe(false);

    d.talk('island-caller', 'Set out the empty rehearsal box');
    useScene(d, 'flow', 'Put the cue down');
    expect(d.s.flags['island.movement.flow']).toBeUndefined();
    useScene(d, 'flow', flow);
    expect(visible(d, 'back')).toBeUndefined();
    cross(d, 'island-dock-return');
    expect(visible(d, 'rail')).toBeUndefined();
    d.run({ type: 'RunIslandPlan', landing: 'high', route: 'ferry' });
    expect(d.s.flags['island.plan.high.ferry']).toBe(true);
    expect(d.done('island.movement.compare')).toBe(false);
  });

  it.each([
    { layout: 'shared', first: 'flow', firstChoice: flow, second: 'hold', secondChoice: hold,
      place: 'Stage one shared phrase', deliver: 'Clip the shared raised-palm pattern' },
    { layout: 'split', first: 'hold', firstChoice: hold, second: 'flow', secondChoice: flow,
      place: 'Keep the sweep in the show', deliver: 'Hang the practice rest cue' },
  ])('carries the $layout plan from different sightlines to the next room', (route) => {
    const d = new Driver();
    openIsland(d);
    const credit = { ...d.p.credit };
    d.talk('island-caller', 'Set out the empty rehearsal box');
    useScene(d, route.first, route.firstChoice);
    useScene(d, route.second, route.secondChoice);
    expect(d.done('island.movement.compare')).toBe(false);
    useScene(d, 'back', 'Watch from your seat');
    expect(d.done('island.movement.compare')).toBe(true);

    d.talk('island-caller', route.place);
    expect(d.s.inventory[portable]).toBe(1);
    expect(visible(d, route.layout)).toBeDefined();
    expect(visible(d, route.layout === 'split' ? 'shared' : 'split')).toBeUndefined();
    expect(d.done('island.movement.deliver')).toBe(false);
    expect(d.done('island.publish')).toBe(false);

    cross(d, 'island-dock-return');
    useScene(d, 'rail', route.deliver);
    expect(d.s.flags['island.movement.workshop']).toBe(route.layout);
    expect(d.done('island.movement.deliver')).toBe(true);
    expect(d.s.inventory[portable]).toBe(1);
    expect(visible(d, 'rail')).toBeUndefined();
    expect(visible(d, 'rail-' + route.layout)).toBeDefined();
    expect(d.s.flags['island.response']).toBeUndefined();
    expect(d.p.credit).toEqual(credit);
    expect(d.p.moments['mom.island.movement.test']).toBeTruthy();
  });
});
