import { describe, expect, it } from 'vitest';
import windowPack from '../src/content/window-shop.json';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const harbour = 'observatory.harbour';
const shop = 'observatory.window-shop';

function has(d: Driver, name: string) {
  const entry = MAPS[d.s.mapId].interactables.find(({ id }) => id === `window-${name}`);
  if (!entry) throw new Error(`Missing ${name} in ${d.s.mapId}`);
  return { entry, visible: check(entry.visibleIf, d.s) };
}

function use(d: Driver, name: string, pick?: string) {
  const { entry, visible } = has(d, name);
  if (!visible || !check(entry.openIf, d.s)) throw new Error(`Unavailable ${name}`);
  if (entry.exhibit) d.run({ type: 'InspectExhibit', exhibit: entry.exhibit });
  if (entry.node) d.walk(entry.node, pick ? [pick] : []);
  if (entry.flag) d.run({ type: 'SetFlag', flag: entry.flag, value: true });
  if (entry.to) d.s.mapId = entry.to.map;
  return entry.text;
}

function enter() {
  const d = new Driver();
  d.s.mapId = harbour;
  expect(has(d, 'shop-door').visible).toBe(false);
  d.run({ type: 'SetFlag', flag: 'coast.arrived', value: true });
  use(d, 'shop-door');
  expect(d.s.mapId).toBe(shop);
  return d;
}

describe('A Window in the Record', () => {
  it('gives the requested physical objects, the comparator and the later drawing separate identities and date kinds', () => {
    const d = enter();
    for (const { id, art, grantsCard } of windowPack.exhibits) {
      const name = grantsCard.split('.').at(-1);
      const source = has(d, `case-${name}`).entry;
      expect(source.exhibit).toBe(id);
      expect(source.art).toBe(art);
      use(d, `case-${name}`);
      expect(d.s.cards).toContain(grantsCard);
    }
    const find = (id: string) => d.e.pack.exhibits.find((record) => record.id === id);
    expect(find('OBJ-WINDOW-2427')).toMatchObject({ specimen: { accession: '2427' }, summary: expect.stringContaining('14×') });
    expect(find('OBJ-WINDOW-2428')).toMatchObject({ specimen: { accession: '2428' }, dateKind: expect.stringContaining('replacement eyepiece') });
    expect(find('OBJ-WINDOW-UM-1')).toMatchObject({ specimen: { accession: 'UM-1' }, dateText: 'Possibly around 1700' });
    expect(find('OBJ-WINDOW-TRIESTE')).toMatchObject({ dateText: '23 January 1960', specimen: { accession: 'Bathyscaphe Trieste' } });
    expect(find('OBJ-WINDOW-NH-95258')).toMatchObject({ specimen: { accession: 'NH 95258' }, dateKind: expect.stringContaining('about 1963') });
    expect(find('OBJ-WINDOW-A19700102000')).toMatchObject({ specimen: { accession: 'A19700102000' }, dateKind: expect.stringContaining('separate lunar module') });
  });

  it.each(['deck', 'glass'] as const)('tests the four changed views and the %s reader’s physical handover', (route) => {
    const d = enter();
    const other = route === 'deck' ? 'glass' : 'deck';
    expect(has(d, 'scope').visible).toBe(false);
    use(d, 'case-telescope');
    expect(has(d, 'scope').visible).toBe(false);
    use(d, 'case-other');
    use(d, 'scope', 'Open the wide frame');
    expect(d.done('window.far')).toBe(false);
    expect(use(d, 'scope-wide')).toContain('Left and right outer pins');
    use(d, 'scope', 'Slide the close face');
    expect(use(d, 'scope-close')).toContain('right outer pin is outside');
    expect(d.done('window.far')).toBe(true);

    expect(has(d, 'plate').visible).toBe(false);
    use(d, 'case-microscope');
    use(d, 'plate', 'front slot');
    expect(use(d, 'plate-front')).toContain('bright patch');
    use(d, 'plate', 'edge slot');
    expect(use(d, 'plate-edge')).toContain('Both etched marks');
    expect(d.done('window.near')).toBe(true);

    for (const record of ['trieste', 'columbia']) use(d, `case-${record}`);
    expect(has(d, 'trial').visible).toBe(false);
    use(d, 'case-profile');
    expect(has(d, 'publish').visible).toBe(false);
    use(d, 'trial', 'window sketch');
    expect(use(d, 'trial-image')).toContain('third bell');
    use(d, 'trial', 'independent position strip');
    expect(use(d, 'trial-track')).toContain('outer post');
    expect(d.done('window.compare')).toBe(true);
    use(d, 'publish', 'Keep the first print');
    expect(d.s.flags['window.post']).toBeUndefined();

    use(d, 'publish', route === 'deck' ? 'pilot’s rail' : 'low glass');
    expect(use(d, route === 'deck' ? 'desk-detail' : 'desk-track')).toContain(route === 'deck' ? 'third bell' : 'separate lookouts');
    expect(d.done('window.proof')).toBe(false);
    use(d, 'shop-return');
    expect(d.s.mapId).toBe(harbour);
    expect(has(d, `watch-${other}`).visible).toBe(false);
    use(d, `watch-${route}`, 'Leave the receipt');
    expect(d.done('window.proof')).toBe(false);
    use(d, `watch-${route}`, 'Mark the');
    expect(d.done('window.proof')).toBe(true);
    expect(use(d, `done-${route}`)).toContain(route === 'deck' ? 'two marked turns' : 'staffed desk');
    expect(d.s.flags['coast.updated']).toBeUndefined();
    expect(d.p.credit).toEqual({});
  });
});
