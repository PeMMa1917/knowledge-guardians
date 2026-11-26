import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { OLD_SHUTTERS, readShutterMirrors, traceShutters, turnShutterMirror } from '../src/domain/shutterBoard';
import { MAPS } from '../src/maps';
import { NEXUS_SHUTTERS, SHUTTER_VISITORS, TWO_SHUTTER_ROOM } from '../src/maps/shutterBoard';
import { Driver } from './driver';

const pin = 'item.nexus.shutter-pin';
const scope = 'nexus.shutter.';
const observe = ['quiet', 'low'] as const;

function prop(d: Driver, name: string) {
  const entry = MAPS[d.s.mapId].interactables.find(({ id }) => id === 'shutter-' + name);
  return entry && check(entry.visibleIf, d.s) ? entry : undefined;
}

function use(d: Driver, name: string, option: string) {
  const entry = prop(d, name);
  expect(entry?.node, name).toBeDefined();
  d.walk(entry!.node!, [option]);
}

function pass(d: Driver, name: string) {
  const entry = prop(d, name);
  expect(entry?.to, name).toBeDefined();
  expect(check(entry?.openIf, d.s)).toBe(true);
  d.s.mapId = entry!.to!.map;
}

function set(d: Driver, name: string, value: boolean | string) {
  d.run({ type: 'SetFlag', flag: scope + name, value });
}

function discover(d: Driver) {
  expect(prop(d, 'hatch')).toBeUndefined();
  expect(prop(d, 'draft')).toBeUndefined();
  use(d, 'recess', 'Follow the wear line');
  expect(prop(d, 'hatch')).toBeUndefined();
  use(d, 'draft', 'Lift the cover');
  expect(d.done(scope + 'discover')).toBe(true);
  pass(d, 'hatch');
}

function usePin(d: Driver, route: 'quiet' | 'low') {
  use(d, 'fit', route === 'low' ? 'Fit the pin to open the low' : 'Fit the pin to open the screened');
  const cargo = route === 'low' ? 'Keep Tavin’s receipt from the low' : 'Keep Tavin’s receipt from the ordinary';
  const reader = route === 'low' ? 'Keep Merra’s request' : 'Keep Merra’s receipt';
  d.talk('shutter-tavin', cargo);
  d.talk('shutter-merra', reader);
  expect(d.s.flags[scope + 'reader']).toBe(route);
  expect(d.s.flags[scope + 'cargo']).toBe(route);
}

describe('The Two Shutter Room', () => {
  it('finds the actual baffle in the old position, then traces the two independently corrected routes', () => {
    expect(traceShutters(OLD_SHUTTERS)).toEqual({
      end: 'stop', tiles: [[0, 2], [1, 2], [2, 2], [2, 1], [1, 1]],
    });
    const high = turnShutterMirror(OLD_SHUTTERS, 1);
    expect(traceShutters(high).end).toBe('quiet');
    expect(traceShutters(high).tiles.at(-1)).toEqual([4, 1]);
    const routedLow = turnShutterMirror(high, 0);
    expect(traceShutters(routedLow).end).toBe('stop');
    expect(traceShutters(routedLow).tiles.at(-1)).toEqual([3, 3]);
    const corrected = turnShutterMirror(routedLow, 2);
    expect(traceShutters(corrected).end).toBe('low');
    expect(traceShutters(corrected).tiles.at(-1)).toEqual([0, 3]);
    expect(readShutterMirrors(corrected.join(''))).toEqual(corrected);
    expect(readShutterMirrors('unreadable')).toEqual(OLD_SHUTTERS);
  });

  it('always lets players leave the optional hatch and preserves the chapter’s original access requirements', () => {
    const d = new Driver();
    discover(d);
    expect(d.s.mapId).toBe(TWO_SHUTTER_ROOM.id);
    expect(d.done(scope + 'verify')).toBe(false);
    pass(d, 'room-exit');
    expect(d.s.mapId).toBe('nexus.archive');
    const nile = MAPS[d.s.mapId].interactables.find(({ id }) => id === 'door-without-a-name')!;
    expect(check(nile.visibleIf, d.s)).toBe(false);
    expect(d.s.flags['study.letter']).toBeUndefined();
  });

  it('requires both physical checks, hears each civilian once for the chosen fitting and allows a reversible refit', () => {
    const d = new Driver();
    const credit = { ...d.p.credit };
    discover(d);
    const high = turnShutterMirror(OLD_SHUTTERS, 1);
    const low = turnShutterMirror(turnShutterMirror(high, 0), 2);
    set(d, 'old', true);
    set(d, 'active', traceShutters(OLD_SHUTTERS).end);
    expect(prop(d, 'quiet.check')).toBeUndefined();
    expect(prop(d, 'low.check')).toBeUndefined();
    for (const [i, branch] of observe.entries()) {
      set(d, 'active', traceShutters(i === 0 ? high : low).end);
      use(d, branch + '.check', i === 0 ? 'Keep the upper' : 'Keep the lower');
      if (i === 0) expect(d.s.inventory[pin]).toBeUndefined();
    }
    expect(d.done(scope + 'verify')).toBe(true);
    expect(d.s.inventory[pin]).toBe(1);
    set(d, 'active', 'idle');
    expect(d.done(scope + 'verify')).toBe(true);
    pass(d, 'room-exit');
    use(d, 'fit', 'Fit the pin to open the low');
    d.talk('shutter-tavin', 'Keep Tavin’s receipt');
    expect(d.done(scope + 'serve')).toBe(false);
    expect(d.e.visibleOptions(scope + 'fit', d.s).map(({ option }) => option.text)).toEqual(['Leave the pin in its present place.']);
    d.talk('shutter-merra', 'Keep Merra’s request');
    expect(d.done(scope + 'serve')).toBe(true);
    expect(prop(d, 'tray-rest')).toBeDefined();
    expect(prop(d, 'quiet-seat')).toBeUndefined();

    usePin(d, 'quiet');
    expect(prop(d, 'quiet-seat')).toBeDefined();
    expect(prop(d, 'tray-rest')).toBeUndefined();
    expect(d.s.journal.filter((id) => id === 'j.nexus.shutter.serve')).toHaveLength(1);
    expect(d.s.inventory[pin]).toBe(1);
    expect(d.p.credit).toEqual(credit);
  });

  it('gives each new Nexus target its own tile and the new room a return tile beside the hatch', () => {
    const archive = MAPS['nexus.archive'];
    for (const spot of [...NEXUS_SHUTTERS, ...SHUTTER_VISITORS]) {
      expect(archive.floor(spot.x, spot.y), spot.id).not.toBeNull();
      const overlapping = [...archive.interactables, ...archive.npcs].filter(
        ({ x, y, ...other }) => spot.x >= x && spot.x < x + ('w' in other ? other.w : 1)
          && spot.y >= y && spot.y < y + ('h' in other ? other.h : 1),
      );
      expect(overlapping.map(({ id }) => id), spot.id).toEqual([spot.id]);
    }
    const exit = TWO_SHUTTER_ROOM.interactables.find(({ id }) => id === 'shutter-room-exit')!;
    expect(exit.visibleIf).toBeUndefined();
    expect(exit.to).toEqual({ map: 'nexus.archive', x: 7, y: 17 });
    expect(archive.floor(7, 17)).not.toBeNull();
  });
});
