import { describe, expect, it } from 'vitest';
import { PRICE_CASES, PRICE_RETURN, PRICE_ROOM } from '../src/content/priceDrawers';
import { check } from '../src/domain/rules';
import { SPECIMEN_BASE, specimenItemId, specimenToolId } from '../src/domain/specimenGear';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

function prop(d: Driver, id: string) {
  const found = MAPS[d.s.mapId].interactables.find((p) => p.id === `price-drawers-${id}`);
  if (!found) throw new Error(`Missing ${id} in ${d.s.mapId}`);
  return found;
}

function allowed(d: Driver, id: string) {
  return check(prop(d, id).visibleIf, d.s);
}

function use(d: Driver, id: string, choice?: string) {
  const here = prop(d, id);
  expect(allowed(d, id), id).toBe(true);
  if (here.node) d.walk(here.node, choice ? [choice] : []);
  if (here.exhibit) d.run({ type: 'InspectExhibit', exhibit: here.exhibit });
  if (here.flag) d.run({ type: 'SetFlag', flag: here.flag, value: true });
  if (here.to) d.s.mapId = here.to.map;
  return here;
}

describe('The Price That Travels', () => {
  it('gives 36 dated records a physical case and four primary institutional catalogues', () => {
    const d = new Driver();
    d.s.mapId = 'market.square';
    expect(allowed(d, 'door')).toBe(false);
    d.run({ type: 'SetFlag', flag: 'market.arrived', value: true });
    use(d, 'door');
    expect(d.s.mapId).toBe(PRICE_ROOM);
    expect(PRICE_CASES).toHaveLength(36);
    expect(new Set(PRICE_CASES.map(({ institution }) => institution)).size).toBe(4);
    const positions = new Set<string>();
    for (const entry of PRICE_CASES) {
      const exhibit = d.e.pack.exhibits.find(({ id }) => id === entry.exhibit);
      expect(exhibit?.dateText).toBe(entry.date);
      expect(exhibit?.specimen?.accession).toBe(entry.accession);
      expect(d.e.pack.sources.find(({ id }) => id === entry.source)?.url).toBe(entry.url);
      const { x, y } = prop(d, `${entry.slug}-case`);
      expect(positions.has(`${x},${y}`)).toBe(false);
      positions.add(`${x},${y}`);
    }
    use(d, 'exit');
    expect(d.s.mapId).toBe('market.square');
    expect(d.done('market.finish')).toBe(false);
  });

  it.each(PRICE_CASES)('checks where $accession works and sends an equipped comparison to a new buyer', (entry) => {
    const d = new Driver();
    d.run({ type: 'SetFlag', flag: 'market.arrived', value: true });
    d.s.mapId = PRICE_ROOM;
    const id = (suffix: string) => `${entry.slug}-${suffix}`;
    expect(allowed(d, id('trial'))).toBe(false);
    use(d, id('case'));
    expect(() => d.run({ type: 'ClaimSpecimen', exhibit: entry.exhibit })).toThrow('Finish the object’s quest first');
    const first = entry.family === 'token' ? 'offer' : 'check';
    const other = first === 'offer' ? 'check' : 'offer';
    use(d, id('trial'), 'Leave room');
    expect(allowed(d, id(first))).toBe(false);
    use(d, id('trial'), entry[first]);
    expect(allowed(d, id(other))).toBe(false);
    expect(d.done(entry.checked)).toBe(false);
    expect(use(d, id(first)).text).toContain(entry.limit);
    expect(d.done(entry.checked)).toBe(true);
    d.run({ type: 'ClaimSpecimen', exhibit: entry.exhibit });
    expect(d.s.inventory[specimenItemId(entry.key)]).toBe(1);

    d.s.mapId = PRICE_RETURN;
    expect(allowed(d, id('return'))).toBe(false);
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(entry.key) });
    use(d, id('return'), first === 'offer' ? 'Fit the limited comparison' : 'Fit a separate check');
    expect(d.done(entry.returned)).toBe(false);
    expect(allowed(d, id(`ember-${other}`))).toBe(false);
    expect(use(d, id(`ember-${first}`)).text).toContain(entry.limit);
    expect(d.done(entry.returned)).toBe(true);
    d.s.mapId = SPECIMEN_BASE;
    d.run({ type: 'CarrySpecimen', key: entry.key, carry: false });
    d.s.mapId = PRICE_RETURN;
    expect(allowed(d, id('return'))).toBe(false);
    expect(allowed(d, id(`ember-${first}`))).toBe(true);
  });
});
