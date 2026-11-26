import { describe, expect, it } from 'vitest';
import { totalXP } from '../src/domain/permanent';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const strip = 'item.witness-strip';

function interactable(d: Driver, id: string) {
  return MAPS[d.s.mapId].interactables.find((p) => p.id === id);
}

function visible(d: Driver, id: string): boolean {
  const prop = interactable(d, id);
  return !!prop && check(prop.visibleIf, d.s);
}

function door(d: Driver, id: string) {
  const prop = interactable(d, id);
  if (prop?.kind !== 'door' || !prop.to || !visible(d, id) || !check(prop.openIf, d.s)) throw new Error(`Cannot use ${id}`);
  if (prop.flag) d.run({ type: 'SetFlag', flag: prop.flag, value: true });
  d.s.mapId = prop.to.map;
}

function read(d: Driver, id: string) {
  const prop = interactable(d, id);
  if (prop?.kind !== 'sign' || !prop.flag || !visible(d, id)) throw new Error(`Cannot read ${id}`);
  d.run({ type: 'SetFlag', flag: prop.flag, value: true });
}

function scene(d: Driver, id: string, choice: string) {
  const prop = interactable(d, id);
  if (prop?.kind !== 'scene' || !prop.node || !visible(d, id)) throw new Error(`Cannot use ${id}`);
  d.walk(prop.node, [choice]);
}

const nileChoices = {
  weight: 'Fit two spare clips',
  shelter: 'Move the guide to the sheltered shelf',
};
const metalChoices = {
  local: 'Keep four clean sleeves at the yard',
  shared: 'Send the six together',
};

function archiveTrial(d: Driver, layout: keyof typeof nileChoices) {
  d.s.mapId = 'nile.hall';
  d.s.flags['nile.arrived'] = true;
  door(d, 'nile-workers');
  expect(visible(d, 'nile-witness-rack')).toBe(false);
  d.run({ type: 'InspectExhibit', exhibit: 'OBJ-NILE-STRIKE' });
  expect(visible(d, 'nile-witness-sill')).toBe(false);
  scene(d, 'nile-witness-rack', 'Pin a folded strip');
  expect(visible(d, 'nile-witness-set')).toBe(true);
  scene(d, 'nile-witness-sill', 'Watch for three beats');
  const watchChoices = () => d.e.visibleOptions('nile.witness.watch', d.s).map(({ option }) => option.text);
  expect(watchChoices()).toEqual(['Step away from the sill for now.']);
  read(d, 'nile-witness-closed');
  expect(watchChoices()[0]).toContain('with one door opening');
  scene(d, 'nile-witness-sill', 'Watch the same rack');
  expect(visible(d, 'nile-witness-closed')).toBe(false);
  expect(visible(d, 'nile-witness-mount')).toBe(false);
  read(d, 'nile-witness-open');
  expect(d.done('nile.witness.compare')).toBe(true);
  scene(d, 'nile-witness-mount', 'Leave both observations');
  expect(d.s.inventory[strip]).toBeUndefined();
  scene(d, 'nile-witness-mount', nileChoices[layout]);
  expect(d.done('nile.witness.publish')).toBe(false);
  expect(visible(d, 'nile-witness-pointers')).toBe(layout === 'shelter');
  read(d, `nile-witness-${layout}`);
  expect(d.done('nile.witness.publish')).toBe(true);
  expect(d.s.inventory[strip]).toBe(1);
  expect(d.s.flags['nile.handoff.mode']).toBeUndefined();
  expect(d.done('nile.workers')).toBe(false);
  door(d, 'workyard-back');
  door(d, 'nile-nexus');
}

function workshopTrial(d: Driver, layout: keyof typeof metalChoices, source: 'archive' | 'loan') {
  door(d, 'metalworks-door');
  const stripChoices = d.e.visibleOptions('metal.witness.bind', d.s).map(({ option }) => option.text);
  expect(stripChoices[0]).toContain(source === 'archive' ? 'Leila’s folded witness strip' : 'yard’s spare strip');
  expect(stripChoices).toHaveLength(2);
  scene(d, 'metal-witness-bind', stripChoices[0]);
  expect(d.s.flags['metal.witness.use']).toBe(source);
  read(d, 'metal-witness-yard-count');
  expect(d.done('metal.witness.compare')).toBe(false);
  door(d, 'metal-records-path');
  expect(visible(d, 'metal-witness-choose')).toBe(false);
  read(d, 'metal-witness-hall-count');
  expect(d.done('metal.witness.compare')).toBe(true);
  scene(d, 'metal-witness-choose', 'Leave the two counts');
  expect(d.s.flags['metal.witness.layout']).toBeUndefined();
  scene(d, 'metal-witness-choose', metalChoices[layout]);
  expect(visible(d, 'metal-witness-hall-count')).toBe(false);
  if (layout === 'local') {
    read(d, 'metal-witness-local-hall');
    expect(d.done('metal.witness.publish')).toBe(false);
    door(d, 'metal-yard-return');
    read(d, 'metal-witness-local-yard');
  } else {
    read(d, 'metal-witness-shared');
    door(d, 'metal-yard-return');
    expect(visible(d, 'metal-witness-local-yard')).toBe(false);
  }
  expect(d.done('metal.witness.publish')).toBe(true);
  expect(d.done('metal.finish')).toBe(false);
  expect(d.s.flags['metal.response']).toBeUndefined();
}

describe('A witness strip from the Nile Archive to the Metalworks', () => {
  const routes = (['weight', 'shelter'] as const).flatMap((nile) =>
    (['local', 'shared'] as const).map((metal) => ({ nile, metal })));

  it.each(routes)('uses the $nile guide’s witness strip for a $metal return', ({ nile, metal }) => {
    const d = new Driver();
    archiveTrial(d, nile);
    expect(() => door(d, 'metalworks-door')).toThrow(/Cannot use/);
    d.s.objectivesDone.push('forest.finish');
    const credit = totalXP(d.p);
    workshopTrial(d, metal, 'archive');
    expect(d.s.inventory[strip]).toBe(1);
    expect(totalXP(d.p)).toBe(credit);
  });

  it('lends a strip to a player who skipped the archive practice', () => {
    const d = new Driver();
    d.s.objectivesDone.push('forest.finish');
    workshopTrial(d, 'shared', 'loan');
    expect(d.s.inventory[strip]).toBeUndefined();
    expect(d.done('nile.witness.compare')).toBe(false);
  });
});
