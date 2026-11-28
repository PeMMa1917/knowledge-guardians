import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const frame = 'two-face-frame';

function prop(d: Driver, id: string) {
  const result = MAPS[d.s.mapId].interactables.find((item) => item.id === id);
  expect(result, id).toBeDefined();
  return result!;
}

function available(d: Driver, id: string) {
  return check(prop(d, id).visibleIf, d.s);
}

function enter(d: Driver, id: string) {
  const item = prop(d, id);
  expect(available(d, id), id).toBe(true);
  expect(item.to, id).toBeDefined();
  d.s.mapId = item.to!.map;
  if (item.flag) d.run({ type: 'SetFlag', flag: item.flag, value: true });
}

function inspect(d: Driver, id: string) {
  const item = prop(d, id);
  expect(available(d, id), id).toBe(true);
  d.run({ type: 'InspectExhibit', exhibit: item.exhibit! });
}

function scene(d: Driver, id: string, ...choices: string[]) {
  const item = prop(d, id);
  expect(available(d, id), id).toBe(true);
  d.walk(item.node!, choices);
}

function start() {
  const d = new Driver();
  d.resumeAfter('forest.finish');
  d.s.flags['metal.response'] = 'ledger';
  d.s.flags['council.revision'] = 'mark';
  enter(d, 'metalworks-door');
  enter(d, 'metal-records-path');
  return d;
}

describe('Two-Face Frame field investigation', () => {
  it('cites the signed date and Foumban custody separately from the individual Bété board and its series', () => {
    const pack = buildPack();
    const bamum = pack.cards.find(({ id }) => id === 'card.plate.bamum')!;
    const bete = pack.cards.find(({ id }) => id === 'card.plate.bete')!;
    expect(bamum).toMatchObject({ historicalLabel: 'documented', sources: ['HIS-PLATE-01', 'HIS-PLATE-02'] });
    expect(bamum.text).toContain('18 May 1922');
    expect(bamum.text).toContain('palace archives in Foumban keep the original');
    expect(bamum.limits).toContain('circumstances of the agreement');
    expect(bete).toMatchObject({ historicalLabel: 'documented', sources: ['HIS-PLATE-03', 'HIS-PLATE-04', 'HIS-PLATE-05'] });
    expect(bete.text).toContain('104.2019.10');
    expect(bete.text).toContain('449 drawings');
    expect(bete.limits).toContain('all Bété speakers');
  });

  it('can turn the hinged fixture in either direction without recording a check until its tab is clipped', () => {
    const d = start();
    expect(available(d, 'metal-plate-foumban')).toBe(false);
    d.resumeAfter('metal.finish');
    inspect(d, 'metal-plate-foumban');
    expect(d.s.flags[`keepsake.${frame}`]).toBe(true);
    enter(d, 'metal-yard-return');
    expect(available(d, 'metal-plate-turn')).toBe(false);
    d.run({ type: 'EquipPerspective', keepsake: frame });

    scene(d, 'metal-plate-turn', 'Swing the plate', 'Let the back tab rest');
    expect(d.s.flags['plate.metal.face']).toBe('back');
    expect(d.s.flags['plate.metal.back']).toBeUndefined();
    scene(d, 'metal-plate-turn', 'Set the short slot', 'Clip the front tab');
    expect(d.s.flags['plate.metal.face']).toBe('front');
    expect(d.s.flags['plate.metal.front']).toBe(true);
    scene(d, 'metal-plate-print', 'Leave the print');
    expect(d.done('plate.metal.compare')).toBe(false);
    scene(d, 'metal-plate-turn', 'Swing the plate', 'Clip the back tab');
    expect(d.s.flags['plate.metal.face']).toBe('back');
    expect(d.s.flags['plate.metal.back']).toBe(true);
    expect(d.done('plate.metal.compare')).toBe(false);
    scene(d, 'metal-plate-print', 'Set the two tabs');
    expect(d.done('plate.metal.compare')).toBe(true);
  });

  it.each([
    { ship: 'loan', place: 'rail' },
    { ship: 'loan', place: 'bench' },
    { ship: 'pair', place: 'rail' },
    { ship: 'pair', place: 'bench' },
  ])('checks a $ship delivery at the Council and follows the $place choice', ({ ship, place }) => {
    const d = start();
    const loan = ship === 'loan';
    const rail = place === 'rail';
    const initialCredit = { ...d.p.credit };
    d.resumeAfter('metal.finish');
    inspect(d, 'metal-plate-foumban');
    enter(d, 'metal-yard-return');
    d.run({ type: 'EquipPerspective', keepsake: frame });
    scene(d, 'metal-plate-turn', 'Set the short slot', 'Clip the front tab');
    scene(d, 'metal-plate-turn', 'Swing the plate', 'Clip the back tab');
    scene(d, 'metal-plate-print', 'Set the two tabs');
    enter(d, 'metal-records-path');
    scene(d, 'metal-plate-pack', loan ? 'Lend Plate Eleven' : 'Clip two full-size');
    expect(d.s.flags['plate.metal.route']).toBe(ship);
    expect(d.done('plate.metal.checked')).toBe(false);
    expect(available(d, `metal-plate-${loan ? 'pair' : 'loan'}-receipt`)).toBe(false);
    scene(d, `metal-plate-${ship}-receipt`, loan ? 'Record the loan' : 'Record which impressions');
    expect(d.done('plate.metal.checked')).toBe(true);
    expect(d.s.journal).toContain('j.plate.metal');
    enter(d, 'metal-yard-return');
    expect(available(d, 'metal-plate-flat')).toBe(loan);
    expect(available(d, 'metal-plate-turn')).toBe(!loan);
    enter(d, 'metal-nexus-return');
    d.resumeAfter('island.finish');
    enter(d, 'council-door');
    d.s.objectivesDone.push('council.arrival');
    enter(d, 'council-gallery-path');

    expect(available(d, 'council-plate-cradle')).toBe(false);
    expect(available(d, 'council-plate-prints')).toBe(false);
    inspect(d, 'council-plate-bete');
    d.run({ type: 'EquipPerspective', keepsake: null });
    expect(available(d, loan ? 'council-plate-cradle' : 'council-plate-prints')).toBe(false);
    d.run({ type: 'EquipPerspective', keepsake: frame });
    scene(d, loan ? 'council-plate-cradle' : 'council-plate-prints', loan ? 'Put the long slot' : 'Seat both sheets');
    expect(d.s.flags['plate.council.test']).toBe(loan ? 'relief' : 'faces');
    expect(d.done('plate.council.compare')).toBe(true);
    scene(d, 'council-plate-place', rail ? 'Hang the two marked' : 'Set aside a checked');
    expect(d.s.flags['plate.council.place']).toBe(place);
    expect(d.done('plate.council.checked')).toBe(false);
    if (rail) scene(d, 'council-plate-rail', 'Watch them follow');
    else if (loan) scene(d, 'council-plate-loan-bench', 'Sign the fitting');
    else scene(d, 'council-plate-pair-bench', 'Clip the booking');
    expect(d.done('plate.council.checked')).toBe(true);
    expect(d.s.flags['plate.council.used']).toBe(place);
    expect(d.s.flags['plate.council.returned'] ?? false).toBe(loan);
    expect(d.s.journal).toContain('j.plate.council');
    expect(d.p.credit).toEqual(initialCredit);
    expect(d.s.flags['metal.response']).toBe('ledger');
    expect(d.s.flags['council.revision']).toBe('mark');

    enter(d, 'council-gallery-return');
    enter(d, 'council-nexus-return');
    enter(d, 'metalworks-door');
    expect(available(d, 'metal-plate-returned')).toBe(loan);
    expect(available(d, 'metal-plate-flat')).toBe(false);
    expect(available(d, 'metal-plate-turn')).toBe(true);
  });
});
