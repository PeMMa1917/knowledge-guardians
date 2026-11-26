import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { totalXP } from '../src/domain/permanent';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const folio = 'item.split-mount-folio';
const prop = (d: Driver, id: string) => MAPS[d.s.mapId].interactables.find((p) => p.id === id);

function visible(d: Driver, id: string): boolean {
  const found = prop(d, id);
  return !!found && check(found.visibleIf, d.s);
}

function door(d: Driver, id: string): void {
  const found = prop(d, id);
  if (found?.kind !== 'door' || !found.to || !visible(d, id) || !check(found.openIf, d.s)) {
    throw new Error(`Cannot use ${id}`);
  }
  if (found.flag) d.run({ type: 'SetFlag', flag: found.flag, value: true });
  d.s.mapId = found.to.map;
}

function read(d: Driver, id: string): void {
  const found = prop(d, id);
  if (found?.kind !== 'sign' || !found.flag || !visible(d, id)) throw new Error(`Cannot read ${id}`);
  d.run({ type: 'SetFlag', flag: found.flag, value: true });
}

function inspect(d: Driver, id: string): void {
  const found = prop(d, id);
  if (found?.kind !== 'exhibit' || !found.exhibit || !visible(d, id)) throw new Error(`Cannot inspect ${id}`);
  d.run({ type: 'InspectExhibit', exhibit: found.exhibit });
}

function scene(d: Driver, id: string, choice: string): void {
  const found = prop(d, id);
  if (found?.kind !== 'scene' || !found.node || !visible(d, id)) throw new Error(`Cannot use ${id}`);
  d.walk(found.node, [choice]);
}

const nileChoice = {
  delivery: 'Put the support plan first',
  reading: 'Put the two source tabs',
};
const metalChoice = {
  bench: 'Put the movable ring on the low bench',
  window: 'Put two checked views',
};

function makeFolio(d: Driver, layout: keyof typeof nileChoice) {
  expect(visible(d, 'nile-stone-case')).toBe(false);
  // Start from an ordinary Nile return, independent of the player's dispatch method.
  d.s.flags['nile.returned'] = true;
  d.s.flags['nile.dispatch'] = 'read';
  inspect(d, 'nile-stone-case');
  d.s.mapId = 'nile.hall';
  read(d, 'nile-exhibition-porter');
  door(d, 'nile-workers');
  read(d, 'nile-exhibition-reader');
  door(d, 'workyard-back');
  door(d, 'nile-maps');
  expect(d.e.visibleOptions('nile.exhibit.mount', d.s).map(({ option }) => option.text))
    .toEqual(['Leave both trays on the table.']);
  inspect(d, 'nile-case-mine');
  expect(d.done('nile.exhibit.scope')).toBe(true);
  scene(d, 'nile-exhibition-mount', nileChoice[layout]);
  expect(d.done('nile.exhibit.mounted')).toBe(true);
  expect(d.s.inventory[folio]).toBeUndefined();

  if (layout === 'reading') {
    scene(d, 'nile-exhibition-copy-rail', 'Stop the tracing frame');
    expect(visible(d, 'nile-exhibition-readback-rail')).toBe(true);
    door(d, 'route-back');
  } else {
    expect(visible(d, 'nile-exhibition-delivery')).toBe(true);
    door(d, 'route-back');
    door(d, 'nile-workers');
    scene(d, 'nile-exhibition-copy-class', 'Stop the tracing frame');
    expect(visible(d, 'nile-exhibition-readback-class')).toBe(true);
    door(d, 'workyard-back');
  }
  expect(d.done('nile.exhibit.used')).toBe(false);
  expect(d.s.inventory[folio]).toBeUndefined();
  scene(d, 'nile-exhibition-lift', 'Seat the teaching copy');
  expect(visible(d, 'nile-exhibition-loaded')).toBe(true);
  expect(d.done('nile.exhibit.used')).toBe(true);
  expect(d.s.inventory[folio]).toBe(1);
  expect(d.s.flags['nile.dispatch']).toBe('read');
  expect(d.s.flags['nile.handoff.mode']).toBeUndefined();
  door(d, 'nile-nexus');
}

function displayRing(d: Driver, layout: keyof typeof metalChoice, hasFolio: boolean) {
  door(d, 'metalworks-door');
  expect(visible(d, 'metal-exhibition-model')).toBe(false);
  door(d, 'metal-records-path');
  expect(visible(d, 'metal-exhibition-mount')).toBe(false);
  inspect(d, 'metal-exhibition-case');
  door(d, 'metal-yard-return');
  scene(d, 'metal-exhibition-model', 'Turn the practice ring');
  expect(d.done('metal.exhibit.scope')).toBe(false);
  read(d, 'metal-exhibition-index');
  expect(d.done('metal.exhibit.scope')).toBe(true);
  door(d, 'metal-records-path');
  scene(d, 'metal-exhibition-mount', metalChoice[layout]);
  expect(d.done('metal.exhibit.mounted')).toBe(true);

  scene(d, 'metal-exhibition-packet', hasFolio ? 'File the practice count with the Nile folio' : 'File the practice count and museum');
  expect(visible(d, 'metal-exhibition-packet-ready')).toBe(true);
  expect(d.s.flags['metal.exhibit.carrier']).toBe(hasFolio ? 'folio' : 'local');
  expect(d.done('metal.exhibit.used')).toBe(false);
  if (layout === 'bench') {
    expect(visible(d, 'metal-exhibition-bench-pointer')).toBe(true);
    door(d, 'metal-yard-return');
    scene(d, 'metal-exhibition-bench', hasFolio ? 'Clip the Nile folio' : 'Use a spare tab');
    expect(visible(d, 'metal-exhibition-bench-used')).toBe(true);
  } else {
    scene(d, 'metal-exhibition-window', hasFolio ? 'Slide the Nile folio' : 'Slide a spare tab');
    expect(visible(d, 'metal-exhibition-window-used')).toBe(true);
  }
  expect(d.s.flags['metal.exhibit.learner']).toBe(hasFolio ? 'folio' : 'local');
  expect(d.done('metal.exhibit.used')).toBe(true);
  expect(d.done('metal.finish')).toBe(false);
  expect(d.s.flags['metal.response']).toBeUndefined();
}

describe('Where the Copy Stops and Two Pockets for the Ring', () => {
  const routes = (['delivery', 'reading'] as const).flatMap((nile) =>
    (['bench', 'window'] as const).map((metal) => ({ nile, metal })));

  it.each(routes)('uses the $nile folio in a $metal exhibition and its separate packing docket', ({ nile, metal }) => {
    const d = new Driver();
    const credit = totalXP(d.p);
    makeFolio(d, nile);
    expect(() => door(d, 'metalworks-door')).toThrow(/Cannot use/);
    d.s.objectivesDone.push('forest.finish');
    displayRing(d, metal, true);
    expect(d.s.inventory[folio]).toBe(1);
    expect(totalXP(d.p)).toBe(credit);
  });

  it.each(['bench', 'window'] as const)('uses local source tabs at the %s with an older save', (layout) => {
    const d = new Driver();
    d.s.objectivesDone.push('forest.finish');
    displayRing(d, layout, false);
    expect(d.s.inventory[folio]).toBeUndefined();
    expect(d.done('nile.exhibit.used')).toBe(false);
  });

  it('keeps the museum accession separate from the fictional ring exercise', () => {
    const pack = buildPack();
    const object = pack.exhibits.find((exhibit) => exhibit.id === 'OBJ-MET-ASTROLABE');
    const source = pack.sources.find((record) => record.id === 'HIS-MET-EX-01');
    expect(object).toMatchObject({ historicalLabel: 'documented', dateText: '1480/1 CE', sources: [source?.id] });
    expect(source?.url).toBe('https://www.hsm.ox.ac.uk/spherical-astrolabe');
    expect(source?.locator).toContain('49687');
    expect(pack.dialogue.find((node) => node.id === 'metal.exhibit.turn')?.historicalLabel).toBe('fictional-world');
  });
});
