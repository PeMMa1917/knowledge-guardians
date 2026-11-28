import { describe, expect, it } from 'vitest';
import { BRIDGE_PARTNER, carryLocation, carryMoves, currentCarryPhase, type CarrySite, type CarryStop } from '../src/domain/sharedCarry';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { artKeys } from '../src/ui/illustrations';
import { Driver } from './driver';

function visit(d: Driver, site: CarrySite) {
  d.resumeAfter(site === 'forest' ? 'coast.revise' : 'metal.finish');
  d.s.mapId = site === 'forest' ? 'forest.community' : 'copies.landing';
  d.run({ type: 'SetFlag', flag: `${site}.arrived`, value: true });
  expect(d.done(`${site}.arrival`)).toBe(true);
}

function visibleFrame(d: Driver) {
  return MAPS[d.s.mapId].interactables.filter((prop) => prop.game && carryLocation(prop.game) && check(prop.visibleIf, d.s));
}

function move(d: Driver, site: CarrySite, stop: CarryStop, action: string) {
  expect(visibleFrame(d).map(({ id }) => id)).toEqual([`shared-carry-${site}-${stop}`]);
  d.run({ type: 'SharedCarry', site, stop, action });
}

function moves(d: Driver, site: CarrySite): string[] {
  return carryMoves(site, d.s, d.p).map(({ id }) => id);
}

function lanesOpen(d: Driver) {
  return MAPS['copies.landing'].interactables.filter(({ id }) => id.startsWith('shared-carry-lane-'))
    .map(({ openIf }) => check(openIf, d.s));
}

function cartParked(d: Driver) {
  const cart = MAPS['copies.landing'].interactables.find(({ id }) => id === 'shared-carry-parked-cart')!;
  return check(cart.visibleIf, d.s);
}

describe('a frame carried in company', () => {
  it.each(['pass', 'rest'] as const)('awards Bridge Partner for either shared turn (%s)', (turn) => {
    const d = new Driver();
    expect(visibleFrame(d)).toHaveLength(0);
    expect(() => d.run({ type: 'SharedCarry', site: 'forest', stop: 'start', action: 'test-footing' })).toThrow('local landing');
    visit(d, 'forest');
    expect(moves(d, 'forest')).toEqual(['test-footing']);
    expect(() => d.run({ type: 'SharedCarry', site: 'forest', stop: 'start', action: 'lift' })).toThrow('unavailable');
    expect(() => d.run({ type: 'SharedCarry', site: 'forest', stop: 'start', action: 'read-footing' })).toThrow('unavailable');
    if (turn === 'rest') {
      d.run({ type: 'SetFlag', flag: 'keepsake.observer-notebook', value: true });
      d.run({ type: 'EquipPerspective', keepsake: 'observer-notebook' });
      expect(moves(d, 'forest')).toContain('read-footing');
      move(d, 'forest', 'start', 'read-footing');
    } else move(d, 'forest', 'start', 'test-footing');
    move(d, 'forest', 'start', 'lift');
    expect(() => d.run({ type: 'SharedCarry', site: 'forest', stop: 'shelf', action: 'shelve' })).toThrow('different stop');
    move(d, 'forest', 'turn', turn);
    expect(d.p.awards[BRIDGE_PARTNER]).toBeUndefined();
    move(d, 'forest', 'shelf', 'shelve');
    expect(d.done('forest.carry.partner')).toBe(true);
    expect(d.done('forest.finish')).toBe(false);
    expect(d.p.awards[BRIDGE_PARTNER]).toBeDefined();
    expect(d.s.journal).toContain('j.forest.carry');
    expect(currentCarryPhase('forest', d.s).art).toBe('shared-carry.upper');
    expect(moves(d, 'forest')).toEqual([]);
  });

  it('offers the shorter route from a permanent award and restores lane access when parked or seated', () => {
    const d = new Driver();
    d.p.awards[BRIDGE_PARTNER] = '2026-11-26T00:00:00.000Z';
    expect(d.s.flags['forest.carry.phase']).toBeUndefined();
    visit(d, 'copies');
    expect(moves(d, 'copies')).toEqual(['survey']);
    expect(lanesOpen(d)).toEqual([true, true]);
    move(d, 'copies', 'start', 'survey');
    expect(moves(d, 'copies')).toEqual(['cart', 'signal']);
    move(d, 'copies', 'start', 'signal');
    expect(lanesOpen(d)).toEqual([false, false]);
    move(d, 'copies', 'lift', 'park');
    expect(lanesOpen(d)).toEqual([true, true]);
    move(d, 'copies', 'start', 'signal');
    move(d, 'copies', 'lift', 'pair');
    expect(lanesOpen(d)).toEqual([false, false]);
    move(d, 'copies', 'upper', 'seat');
    expect(lanesOpen(d)).toEqual([true, true]);
    expect(d.done('copies.carry.seated')).toBe(true);
    expect(d.done('copies.carry.reader')).toBe(false);
    move(d, 'copies', 'upper', 'try-upper');
    expect(d.done('copies.carry.reader')).toBe(true);
    expect(cartParked(d)).toBe(false);
    expect(d.done('copies.finish')).toBe(false);
    expect(d.s.journal).toContain('j.copies.carry.reader');
    expect(d.s.flags['copies.carry.phase']).toBe('read-upper');
  });

  it('completes the same service for an older or skipping save without closing the lane', () => {
    const d = new Driver();
    visit(d, 'copies');
    move(d, 'copies', 'start', 'survey');
    expect(moves(d, 'copies')).toEqual(['cart']);
    expect(() => d.run({ type: 'SharedCarry', site: 'copies', stop: 'start', action: 'signal' })).toThrow('unavailable');
    move(d, 'copies', 'start', 'cart');
    expect(lanesOpen(d)).toEqual([true, true]);
    move(d, 'copies', 'cart', 'strap');
    move(d, 'copies', 'cart-turn', 'transfer');
    expect(d.done('copies.carry.seated')).toBe(false);
    move(d, 'copies', 'low', 'seat');
    move(d, 'copies', 'low', 'try-low');
    expect(d.done('copies.carry.seated')).toBe(true);
    expect(d.done('copies.carry.reader')).toBe(true);
    expect(lanesOpen(d)).toEqual([true, true]);
    expect(d.s.flags['copies.carry.phase']).toBe('read-low');
    expect(cartParked(d)).toBe(true);
    expect(d.p.awards[BRIDGE_PARTNER]).toBeUndefined();
    expect(d.p.credit).toEqual({});
  });

  it('registers the visible variants and preserves a handcart entrance when the short lane is closed', () => {
    const keys = new Set(artKeys());
    const map = MAPS['copies.landing'];
    for (const site of [map, MAPS['forest.community']]) {
      for (const prop of site.interactables.filter(({ id }) => id.startsWith('shared-carry-'))) {
        expect(keys.has(prop.art!), prop.id).toBe(true);
        for (const art of Object.values(prop.artBy?.keys ?? {})) expect(keys.has(art), prop.id).toBe(true);
        if (prop.artOpen) expect(keys.has(prop.artOpen.key), prop.id).toBe(true);
      }
    }
    expect(map.interactables.find(({ id }) => id === 'copies-landing-return')?.openIf).toBeUndefined();
    expect(map.interactables.find(({ id }) => id === 'copies-landing-to-press')?.openIf).toBeUndefined();
    expect(map.interactables.find(({ id }) => id === 'shared-carry-lane-near')?.to).toEqual({ map: map.id, x: 22, y: 11 });
    expect(map.interactables.find(({ id }) => id === 'shared-carry-lane-far')?.to).toEqual({ map: map.id, x: 14, y: 11 });
  });
});
