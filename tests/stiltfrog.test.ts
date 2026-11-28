import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { artKeys } from '../src/ui/illustrations';
import { Driver } from './driver';

function visit(d: Driver, site: 'sea' | 'forest') {
  d.resumeAfter(site === 'sea' ? 'copies.revise' : 'coast.revise');
  d.run({ type: 'SetFlag', flag: `${site}.arrived`, value: true });
  d.s.mapId = site === 'sea' ? 'sea.shoal' : 'forest.trail';
  expect(d.done(`${site}.arrival`)).toBe(true);
}

function spot(d: Driver, id: string) {
  const prop = MAPS[d.s.mapId].interactables.find((item) => item.id === id);
  if (!prop || !check(prop.visibleIf, d.s)) throw new Error(`Cannot use ${id} here`);
  return prop;
}

function scene(d: Driver, id: string, ...picks: string[]) {
  const prop = spot(d, id);
  expect(prop.kind).toBe('scene');
  d.walk(prop.node!, picks);
}

function bond(d: Driver) {
  visit(d, 'forest');
  expect(() => spot(d, 'stiltfrog-wait')).toThrow();
  for (const window of ['low', 'high']) {
    expect(spot(d, `stiltfrog-watch-${window}`).game).toBe(`stiltfrog-watch-${window}`);
    d.run({ type: 'LorelingWatch', loreling: 'stiltfrog', sighting: window });
  }
  expect(spot(d, 'stiltfrog-wait').game).toBe('stiltfrog-wait');
  d.run({ type: 'LorelingOffer', loreling: 'stiltfrog', place: 'beside' });
  expect(d.done('forest.frog.bond')).toBe(true);
}

describe('Stiltfrog at the freshwater seep', () => {
  it('does not offer a bond until both independent Forest positions are watched', () => {
    const d = new Driver();
    visit(d, 'forest');
    const frog = d.e.pack.lorelings.find(({ id }) => id === 'stiltfrog')!;
    expect(frog.questions).toEqual([]);
    expect(frog.offer.options).toHaveLength(1);
    d.run({ type: 'LorelingWatch', loreling: 'stiltfrog', sighting: 'low' });
    d.run({ type: 'LorelingWatch', loreling: 'stiltfrog', sighting: 'low' });
    expect(d.done('forest.frog.watches')).toBe(false);
    expect(() => d.run({ type: 'LorelingOffer', loreling: 'stiltfrog', place: 'beside' })).toThrow('Watch it in more places');
    d.run({ type: 'LorelingWatch', loreling: 'stiltfrog', sighting: 'high' });
    expect(d.done('forest.frog.watches')).toBe(true);
    d.run({ type: 'LorelingOffer', loreling: 'stiltfrog', place: 'beside' });
    expect(d.s.flags['lor.out']).toBe('stiltfrog');
    expect(d.s.journal).toContain('j.forest.frog.bond');
    expect(d.done('forest.finish')).toBe(false);
  });

  it('needs an active companion to locate the route and a human check to use it', () => {
    const d = new Driver();
    bond(d);
    visit(d, 'sea');
    const option = 'Give the frog room';
    const offers = () => d.e.visibleOptions(spot(d, 'sea-frog-rim-check').node!, d.s).map(({ option }) => option.text);
    expect(offers().some((text) => text.includes(option))).toBe(true);
    d.run({ type: 'LorelingField', loreling: 'stiltfrog', out: false });
    expect(offers().some((text) => text.includes(option))).toBe(false);
    expect(() => spot(d, 'sea-frog-rim-cross')).toThrow();
    d.run({ type: 'LorelingField', loreling: 'stiltfrog', out: true });
    scene(d, 'sea-frog-rim-check', option, 'Leave the rim unchecked');
    expect(check(spot(d, 'sea-frog-rim-cross').openIf, d.s)).toBe(false);
    scene(d, 'sea-frog-rim-check', option, 'Set the foot-length rod');
    const route = spot(d, 'sea-frog-rim-cross');
    expect(check(route.openIf, d.s)).toBe(true);
    expect(route.to).toEqual({ map: 'sea.shoal', x: 14, y: 5 });
    d.run({ type: 'SetFlag', flag: route.flag!, value: true });
    d.run({ type: 'LorelingField', loreling: 'stiltfrog', out: false });
    expect(spot(d, 'sea-frog-rim-back').to?.x).toBe(8);
    scene(d, 'sea-frog-upper', 'Set the angled sight frame');
    expect(check(spot(d, 'sea-frog-upper').artOpen?.if, d.s)).toBe(true);
    expect(d.done('sea.frog.shelf')).toBe(true);
    expect(d.s.journal).toContain('j.sea.frog.shelf');
    expect(d.s.flags['sea.frog.read.lower']).toBeUndefined();
    expect(d.done('sea.finish')).toBe(false);
  });

  it('offers a checked low frame without a frog and keeps the documented view separate', () => {
    const d = new Driver();
    visit(d, 'sea');
    const zone = MAPS['sea.shoal'].zones.find(({ id }) => id === 'sea-frog-low-planks')!;
    const options = () => d.e.visibleOptions(spot(d, 'sea-frog-lower').node!, d.s).map(({ option }) => option.text);
    expect(check(zone.if, d.s)).toBe(false);
    expect(options()).toEqual(['Leave the stand and check the fixed staff by the south planks.']);
    scene(d, 'sea-frog-staff', 'Line the blue mark up');
    expect(check(zone.if, d.s)).toBe(true);
    expect(options()).toHaveLength(1);
    d.run({ type: 'Reach', zone: zone.id });
    scene(d, 'sea-frog-lower', 'Brace the low watcher’s stand');
    expect(check(spot(d, 'sea-frog-lower').artOpen?.if, d.s)).toBe(true);
    expect(d.done('sea.frog.shelf')).toBe(true);
    expect(d.s.flags['sea.frog.read.upper']).toBeUndefined();
    expect(() => spot(d, 'sea-frog-rim-cross')).toThrow();
  });

  it('registers the frog, viewing, water and gate art', () => {
    const keys = new Set(artKeys());
    const guide = new Driver().e.pack.lorelings.find(({ id }) => id === 'stiltfrog')?.fieldGuide;
    expect(keys.has(guide!.sprite)).toBe(true);
    expect(keys.has(guide!.portrait)).toBe(true);
    for (const map of [MAPS['forest.trail'], MAPS['sea.shoal']]) {
      for (const prop of map.interactables.filter(({ id }) => id.startsWith('stiltfrog-') || id.startsWith('sea-frog-'))) {
        expect(keys.has(prop.art!), prop.id).toBe(true);
        if (prop.artOpen) expect(keys.has(prop.artOpen.key), prop.id).toBe(true);
      }
    }
  });
});
