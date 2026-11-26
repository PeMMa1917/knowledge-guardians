import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

function isHere(d: Driver, name: string) {
  const prop = MAPS[d.s.mapId].interactables.find(({ id }) => id === `forest-hook-${name}`);
  return !!prop && check(prop.visibleIf, d.s);
}

function useScene(d: Driver, name: string, action: string) {
  expect(isHere(d, name)).toBe(true);
  d.walk(`forest.hook.${name}`, [action]);
}

function useDoor(d: Driver, id: string) {
  const door = MAPS[d.s.mapId].interactables.find((prop) => prop.id === id);
  expect(door?.to).toBeDefined();
  expect(check(door?.visibleIf, d.s)).toBe(true);
  d.s.mapId = door!.to!.map;
}

function collect(cabinet = false) {
  const d = new Driver();
  d.s.mapId = 'forest.station';
  expect(isHere(d, 'tirren')).toBe(false);
  d.s.objectivesDone.push('forest.arrival');
  if (cabinet) d.s.objectivesDone.push('stage.script.parrot-warning.placed');
  useScene(d, 'tirren', 'Clip Tirren');
  useDoor(d, 'forest-trail-path');
  expect(isHere(d, 'low')).toBe(false);
  useScene(d, 'high', 'Mark this view');
  useScene(d, 'low', 'Keep the slate');
  expect(d.done('forest.hook.compare')).toBe(false);
  useDoor(d, 'forest-clearing-path');
  expect(isHere(d, 'dispatch')).toBe(false);
  d.talk('forest-hook-sorell', 'Keep Sorell');
  expect(d.done('forest.hook.compare')).toBe(true);
  expect(isHere(d, 'dispatch')).toBe(true);
  return d;
}

describe('The Empty Hook', () => {
  it('opens both ordinary dispatch options with no Cabinet work', () => {
    const d = collect();
    const acts = d.e.visibleOptions('forest.hook.dispatch', d.s).map(({ option }) => option.text);
    expect(acts).toEqual([
      'Send the signed accounts to the station bench.',
      'Put a west-stones direction on the trail rail.',
      'Leave the two accounts on the bench for now.',
    ]);
  });

  it('keeps all three approaches equally credited and gives each its own destination and reply', () => {
    const actions = {
      voice: ['Send the signed', 'forest-community-back', 'Clip both', 'bench-signed'],
      route: ['Put a west-stones', 'forest-bridge-to-trail', 'Clip the checked', 'rail-direction'],
      fold: ['Use the Cabinet fold', 'forest-bridge-to-trail', 'Fit the outside', 'rail-fold'],
    } as const;
    const credits = Object.entries(actions).map(([route, [send, door, install, sign]]) => {
      const d = collect(route === 'fold');
      useScene(d, 'dispatch', send);
      expect(d.done('forest.hook.readback')).toBe(false);
      expect(isHere(d, 'dispatch')).toBe(false);
      useDoor(d, door);
      useScene(d, `receive.${route}`, install);
      expect(d.done('forest.hook.readback')).toBe(true);
      expect(d.s.flags['forest.hook.used']).toBe(route);
      expect(isHere(d, sign)).toBe(true);
      expect(isHere(d, `receive.${route}`)).toBe(false);
      expect(d.e.node(`forest.hook.reply.${route}`).text).toContain('Tirren');
      expect(d.s.journal).toContain('j.forest.hook.readback');
      expect(d.s.flags['forest.response']).toBeUndefined();
      if (route === 'fold') {
        useDoor(d, 'forest-trail-back');
        expect(isHere(d, 'bench-fold')).toBe(true);
        expect(isHere(d, 'bench-signed')).toBe(false);
      }
      return d.p.credit;
    });
    expect(credits[1]).toEqual(credits[0]);
    expect(credits[2]).toEqual(credits[0]);
  });
});
