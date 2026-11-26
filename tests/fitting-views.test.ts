import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { BIG_ART } from '../src/ui/illustrations';
import { Driver } from './driver';

const exhibit = 'OBJ-MET-RONTGEN-A606881';
const packet = 'item.fitting-view-packet';

function visible(d: Driver, id: string) {
  const prop = MAPS[d.s.mapId].interactables.find((item) => item.id === id);
  return prop && check(prop.visibleIf, d.s) ? prop : undefined;
}

function scene(d: Driver, id: string, action?: string) {
  const prop = visible(d, `fitting-${id}`);
  if (!prop?.node) throw new Error(`Cannot use ${id} in ${d.s.mapId}`);
  d.walk(prop.node, action ? [action] : []);
}

function cross(d: Driver, id: string) {
  const prop = visible(d, id);
  if (prop?.kind !== 'door' || !prop.to || !check(prop.openIf, d.s)) throw new Error(`Cannot cross ${id}`);
  d.s.mapId = prop.to.map;
  if (prop.flag) d.run({ type: 'SetFlag', flag: prop.flag, value: true });
}

function study(d: Driver, reading: 'surface' | 'pair') {
  d.s.objectivesDone.push('forest.finish');
  cross(d, 'metalworks-door');
  expect(visible(d, 'fitting-lamp')).toBeUndefined();
  cross(d, 'metal-records-path');
  expect(visible(d, 'fitting-record')?.exhibit).toBe(exhibit);
  d.run({ type: 'InspectExhibit', exhibit });
  expect(d.s.cards).toContain('card.fitting.rontgen-copy');
  cross(d, 'metal-yard-return');
  expect(visible(d, 'fitting-plate')).toBeUndefined();
  if (reading === 'pair') scene(d, 'reference', 'Fit both reference blocks');
  scene(d, 'lamp', 'Trace the outer edge');
  expect(visible(d, 'fitting-lamp')).toBeUndefined();
  expect(visible(d, 'fitting-lamp-record')?.art).toBe('fitting-views.surface');
  expect(visible(d, 'fitting-plate')?.art).toBe('fitting-views.plate');
  if (reading === 'surface') {
    const options = d.e.visibleOptions('fitting.views.plate', d.s);
    expect(options.map(({ option }) => option.text)).toEqual(['Leave the window blank. Start with the two known blocks on the nearby tray.']);
    scene(d, 'plate', 'Leave the window blank');
    expect(d.s.flags['fitting.views.reading']).toBeUndefined();
    scene(d, 'reference', 'Fit both reference blocks');
  }
  scene(d, 'plate', 'Trace the fitting flat');
  expect(visible(d, 'fitting-turn')?.art).toBe('fitting-views.plate-face');
  expect(visible(d, 'fitting-dispatch')).toBeUndefined();
  scene(d, 'turn', 'Turn the carrier to the side stop');
  expect(visible(d, 'fitting-side-record')?.art).toBe('fitting-views.plate-side');
  expect(visible(d, 'fitting-turn')).toBeUndefined();
  expect(d.done('fitting.views.compared')).toBe(true);
  expect(d.done('metal.finish')).toBe(false);
  scene(d, 'dispatch', reading === 'surface' ? 'Roll the surface outline' : 'Clip both traces');
  expect(d.s.inventory[packet]).toBe(1);
  expect(d.done('fitting.views.sent')).toBe(true);
  scene(d, `kept-${reading}`);
  expect(d.s.inventory[packet]).toBe(1);
}

describe('The Mark Beneath the Lip', () => {
  it.each(['surface', 'pair'] as const)('tests the fitting and sends the %s work order to its teaching bench', (reading) => {
    const d = new Driver();
    const credit = { ...d.p.credit };
    study(d, reading);
    cross(d, 'metal-nexus-return');
    d.s.objectivesDone.push('market.finish');
    cross(d, 'water-door');
    expect(d.done('water.arrival')).toBe(true);
    if (reading === 'pair') {
      expect(visible(d, 'fitting-water-fit-pair')).toBeUndefined();
      scene(d, 'water-repeat', 'Seat the reference');
      expect(d.s.flags['fitting.views.repeated']).toBe(true);
    } else {
      expect(visible(d, 'fitting-water-repeat')).toBeUndefined();
    }
    expect(visible(d, `fitting-water-fit-${reading === 'surface' ? 'pair' : 'surface'}`)).toBeUndefined();
    const prop = visible(d, `fitting-water-fit-${reading}`);
    expect([prop?.x, prop?.y]).toEqual(reading === 'surface' ? [10, 13] : [23, 13]);
    scene(d, `water-fit-${reading}`, reading === 'surface' ? 'Hook the arrow' : 'Follow the new side mark');
    expect(visible(d, `fitting-water-use-${reading}`)?.art).toBe(`fitting-views.used-${reading}`);
    expect(d.done('fitting.views.checked')).toBe(false);
    scene(d, `water-use-${reading}`, reading === 'surface' ? 'Clip her checked surface trace' : 'Leave the local height');
    expect(d.done('fitting.views.checked')).toBe(true);
    expect(d.s.journal).toContain('j.fitting.views.checked');
    expect(d.done('water.finish')).toBe(false);
    expect(d.p.credit).toEqual(credit);
    cross(d, 'water-nexus-return');
    cross(d, 'water-door');
    expect(visible(d, `fitting-water-checked-${reading}`)?.art).toBe(`fitting-views.checked-${reading}`);
  });

  it('separates the documented exposure from the catalogue copy and invented practice', () => {
    const d = new Driver();
    const record = buildPack().exhibits.find((item) => item.id === exhibit);
    expect(record).toMatchObject({ historicalLabel: 'documented', dateText: '22 December 1895 (original exposure)', dateKind: expect.stringContaining('catalogue year of 1895') });
    expect(record?.summary).toContain('Deutsches Museum');
    expect(BIG_ART[record!.art]).toBe('big.fitting-views.case');
    expect(d.e.node('fitting.views.side-record')).toMatchObject({ claimKind: 'simulation', historicalLabel: 'fictional-world' });
  });
});
