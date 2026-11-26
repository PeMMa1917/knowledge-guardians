import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { BIG_ART } from '../src/ui/illustrations';
import { Driver } from './driver';

const exhibit = 'OBJ-LOC-GUTENBERG-52002339';
const leaf = 'item.gutenberg-leaf-slip';

function visible(d: Driver, id: string) {
  const prop = MAPS[d.s.mapId].interactables.find((item) => item.id === id);
  return prop && check(prop.visibleIf, d.s) ? prop : undefined;
}

function scene(d: Driver, id: string, action?: string) {
  const prop = visible(d, `gutenberg-red-${id}`);
  if (!prop?.node) throw new Error(`Cannot use ${id} in ${d.s.mapId}`);
  d.walk(prop.node, action ? [action] : []);
}

function cross(d: Driver, id: string) {
  const prop = visible(d, id);
  if (prop?.kind !== 'door' || !prop.to || !check(prop.openIf, d.s)) throw new Error(`Cannot cross ${id}`);
  d.s.mapId = prop.to.map;
  if (prop.flag) d.run({ type: 'SetFlag', flag: prop.flag, value: true });
}

describe('The Same Red', () => {
  it('registers one exact documented specimen with one physical placement and a playable use', () => {
    const pack = buildPack();
    const claims = pack.exhibits.filter(({ specimen }) => specimen?.key === 'loc:52002339');
    expect(claims).toHaveLength(1);
    expect(claims[0]).toMatchObject({
      id: exhibit,
      historicalLabel: 'documented',
      dateText: 'Mainz, probably 1454–1455. By 1456.',
      sources: ['HIS-LOC-GUT-01', 'HIS-LOC-GUT-02'],
      specimen: {
        key: 'loc:52002339', institution: 'Library of Congress', accession: 'LCCN 52002339 · BS75 1454',
        source: 'HIS-LOC-GUT-01', objective: 'gutenberg.red.referred',
      },
    });
    expect(pack.sources.find(({ id }) => id === 'HIS-LOC-GUT-01')?.url).toBe('https://lccn.loc.gov/52002339/mods');
    expect(pack.sources.find(({ id }) => id === 'HIS-LOC-GUT-02')?.supports).toContain('whole print run');
    expect(pack.cards.find(({ id }) => id === claims[0].grantsCard)?.text).toContain('variants on leaf [192a]');
    expect(BIG_ART[claims[0].art]).toBe('big.same-red.exhibit');
    expect(Object.values(MAPS).flatMap((map) => map.interactables.filter((prop) => prop.exhibit === exhibit).map(() => map.id)))
      .toEqual(['nexus.archive']);
  });

  it.each([['leaf', 'hand'], ['methods', 'type']] as const)('uses the %s source slip and installs the %s proof for a different reader', (bookmark, route) => {
    const d = new Driver();
    const before = { ...d.p.credit };
    expect(visible(d, 'gutenberg-red-catalogue')).toBeUndefined();
    expect(visible(d, 'gutenberg-red-exhibit')?.exhibit).toBe(exhibit);
    d.run({ type: 'InspectExhibit', exhibit });
    scene(d, 'catalogue', bookmark === 'leaf' ? 'Clip leaf [129b]' : 'Put both ways of making a red heading');
    expect(d.s.inventory[leaf]).toBe(1);
    expect(d.done('gutenberg.red.referred')).toBe(true);
    scene(d, `filed-${bookmark}`);
    expect(d.s.inventory[leaf]).toBe(1);
    d.s.objectivesDone.push('metal.finish');
    cross(d, 'copies-door');
    cross(d, 'copies-press-path');
    expect(visible(d, 'gutenberg-red-plan')).toBeUndefined();
    if (bookmark === 'methods') scene(d, 'hand', 'Keep the untouched proof in view');
    scene(d, 'type', bookmark === 'leaf' ? 'Set your leaf [129b] slip' : 'Open the PRINTED fold');
    if (bookmark === 'leaf') {
      expect(visible(d, 'gutenberg-red-plan')).toBeUndefined();
      scene(d, 'hand', 'Keep the untouched proof in view');
    }
    expect(d.e.node(`gutenberg.red.type.checked.${bookmark}`)).toMatchObject({ claimKind: 'simulation', historicalLabel: 'fictional-world' });
    expect(d.done('gutenberg.red.compared')).toBe(true);
    scene(d, 'plan', route === 'type' ? 'Send both repeated impressions' : 'Send the hand-added hour');
    expect(d.s.flags['gutenberg.red.route']).toBe(route);
    cross(d, 'copies-press-to-landing');
    const prop = visible(d, `gutenberg-red-mount-${route}`);
    expect([prop?.x, prop?.y]).toEqual(route === 'type' ? [11, 8] : [7, 12]);
    expect(visible(d, `gutenberg-red-mount-${route === 'type' ? 'hand' : 'type'}`)).toBeUndefined();
    scene(d, `mount-${route}`, route === 'type' ? 'Clip the two matching class notices' : 'Hang the sheet with the hand-added hour');
    expect(d.done('gutenberg.red.used')).toBe(false);
    scene(d, `read-${route}`, route === 'type' ? 'Show her the black class line' : 'Lay the untouched proof alongside');
    expect(d.done('gutenberg.red.used')).toBe(true);
    expect(d.s.journal).toContain('j.gutenberg.red.used');
    expect(d.done('copies.revise')).toBe(false);
    expect(d.p.credit).toEqual(before);
    cross(d, 'copies-landing-to-press');
    cross(d, 'copies-press-to-landing');
    expect(visible(d, `gutenberg-red-kept-${route}`)?.art).toBe(`same-red.kept-${route}`);
  });

  it('leaves the regular press route available without the early exhibit', () => {
    const d = new Driver();
    d.s.objectivesDone.push('metal.finish');
    cross(d, 'copies-door');
    cross(d, 'copies-press-path');
    expect(visible(d, 'copies-compare-press')).toBeDefined();
    expect(visible(d, 'gutenberg-red-type')).toBeUndefined();
    expect(visible(d, 'gutenberg-red-hand')).toBeUndefined();
  });
});
