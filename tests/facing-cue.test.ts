import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { FACING_CUE_COMPARE, FACING_CUE_ITEM, FACING_CUE_RECEIVE, FACING_CUE_TRANSFER,
  facingCueBeatNode, facingCueHouseReadNode, facingCuePlanNode } from '../src/content/facingCue';
import { CUE_BEATS, CUE_PLANS, FACINGS, FACING_SITES, facingCard, facingCueFrame,
  type CuePlan, type Facing, type FacingSite } from '../src/domain/facingCue';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

function prop(d: Driver, id: string) {
  return MAPS[d.s.mapId].interactables.find((entry) => entry.id === id && check(entry.visibleIf, d.s));
}

function choose(d: Driver, node: string, index: number) {
  return d.run({ type: 'ChooseDialogueOption', node, index });
}

function runPhrase(d: Driver, site: FacingSite, facing: Facing, start = 0) {
  for (let step = start; step < CUE_BEATS.length; step++) choose(d, facingCueBeatNode(site, facing), step);
}

describe('The Step Across the Line', () => {
  it('keeps the phrase and its timing fixed while the performer-relative direction changes', () => {
    expect(CUE_BEATS).toEqual(['Set', 'Slide', 'Hold', 'Close']);
    for (const site of FACING_SITES) {
      for (const facing of FACINGS) {
        const trail = CUE_BEATS.map((_, index) => facingCueFrame(site, facing, index + 1));
        expect(trail[0].mark).toBe('centre mark');
        expect(trail.slice(1).map(({ offset }) => offset)).toEqual(Array(3).fill(facing === 'bell' ? -1 : 1));
        for (const plan of CUE_PLANS) expect(facingCueFrame(site, facing, 4, plan).mark).toBe('lamp mark');
      }
    }
    expect(facingCueFrame('nexus', 'bell', 2).mark).toBe('lamp mark');
    expect(facingCueFrame('house', 'bell', 2).mark).toBe('rail mark');
    for (const facing of FACINGS) expect(facingCard('nexus', facing)).not.toBe(facingCard('house', facing));
  });

  it.each([
    ['shared', 'paired', 'Copy the stand number'],
    ['paired', 'shared', 'Clip a blank page'],
  ] as const)('runs the %s Nexus readback and the %s House handover', (plan, adaptation, opening) => {
    const d = new Driver();
    d.walk('cold.open', [opening]);
    const original = d.s.flags['nexus.arrival.note'];
    expect(d.done('m01.o1.look')).toBe(false);
    expect(prop(d, 'facing-cue-nexus')).toBeUndefined();
    expect(d.e.visibleOptions(facingCueBeatNode('nexus', 'bell'), d.s)).toHaveLength(0);
    d.talk('facing-sella', 'Set the first runner');
    expect(prop(d, 'facing-cue-nexus')).toBeDefined();

    choose(d, facingCueBeatNode('nexus', 'bell'), 0);
    expect(d.e.visibleOptions(facingCueBeatNode('nexus', 'bell'), d.s).map(({ index }) => index)).toEqual([1]);
    runPhrase(d, 'nexus', 'bell', 1);
    choose(d, facingCueBeatNode('nexus', 'bell'), 4);
    expect(d.done(FACING_CUE_COMPARE)).toBe(false);
    expect(d.e.visibleOptions(facingCuePlanNode('nexus'), d.s)).toHaveLength(0);
    runPhrase(d, 'nexus', 'door');
    expect(d.done(FACING_CUE_COMPARE)).toBe(true);

    choose(d, facingCuePlanNode('nexus'), CUE_PLANS.indexOf(plan));
    const other: CuePlan = plan === 'shared' ? 'paired' : 'shared';
    expect(prop(d, 'facing-nexus-arrival-' + other)).toBeUndefined();
    expect(prop(d, 'facing-nexus-kept-' + plan)).toBeUndefined();
    expect(d.s.inventory[FACING_CUE_ITEM]).toBeUndefined();
    const arrival = prop(d, 'facing-nexus-arrival-' + plan)!;
    d.walk(arrival.node!, ['Take Sella’s cue slip']);
    expect(d.done(FACING_CUE_RECEIVE)).toBe(true);
    expect(d.s.inventory[FACING_CUE_ITEM]).toBe(1);
    expect(d.e.visibleOptions(arrival.node!, d.s)).toHaveLength(0);
    expect(prop(d, 'facing-nexus-arrival-' + plan)).toBeUndefined();
    expect(prop(d, 'facing-nexus-kept-' + plan)?.x).toBe(arrival.x);
    expect(prop(d, 'facing-nexus-kept-' + plan)?.text).toContain(plan === 'shared' ? 'enter together' : 'start alone');
    expect(d.s.flags['nexus.arrival.note']).toBe(original);
    expect(d.done('m01.o1.look')).toBe(false);

    d.s.mapId = 'stage.gallery';
    expect(prop(d, 'facing-cue-house')).toBeUndefined();
    d.s.objectivesDone.push('stage.arrival');
    expect(prop(d, 'facing-cue-house')).toBeDefined();
    expect(d.e.visibleOptions(facingCuePlanNode('house'), d.s)).toHaveLength(0);
    expect(d.e.visibleOptions(facingCueHouseReadNode, d.s)).toHaveLength(0);
    for (const facing of FACINGS) runPhrase(d, 'house', facing);
    choose(d, facingCuePlanNode('house'), CUE_PLANS.indexOf(adaptation));
    expect(d.e.visibleOptions(facingCueHouseReadNode, d.s).map(({ index }) => index)).toEqual([CUE_PLANS.indexOf(adaptation)]);
    choose(d, facingCueHouseReadNode, CUE_PLANS.indexOf(adaptation));
    expect(d.s.flags['facing.nexus.checked']).toBe(plan);
    expect(d.s.flags['facing.house.checked']).toBe(adaptation);
    expect(d.done(FACING_CUE_TRANSFER)).toBe(true);
    expect(d.e.visibleOptions(facingCueHouseReadNode, d.s)).toHaveLength(0);
  });

  it('gives the early and later dance actions their own learning evidence and progressive help', () => {
    const pack = buildPack();
    const home = pack.missions.find(({ id }) => id === 'KG-CH1-FACING-CUE')!;
    const house = pack.missions.find(({ id }) => id === 'KG-CH9-FACING-CUE')!;
    const earlyMinutes = home.objectives.reduce((total, { weave }) => total + (weave?.minutes ?? 0), 0);
    expect(home.world).toBe('WORLD-01');
    expect(earlyMinutes).toBe(5);
    expect(new Set(home.objectives.flatMap(({ weave }) => weave?.framework ?? []))).toEqual(
      new Set(['scope', 'perspectives', 'methods-and-tools', 'ethics']));
    expect(house.world).toBe('WORLD-10');
    for (const { id, essential, weave } of [...home.objectives, ...house.objectives]) {
      expect(essential).toBe(false);
      expect(weave?.subjects).toContain('dance');
      expect(weave?.aoks).toContain('ART');
      expect(pack.hints.filter(({ objective }) => objective === id).map(({ depth }) => depth)).toEqual([1, 2, 3, 4]);
    }
  });
});
