import { describe, expect, it } from 'vitest';
import { LOAD_CASES, LOAD_CHECK_MAP, LOAD_GROUP } from '../src/content/loadingBay';
import { cartLean, changeLoad, fitLoad, LOAD_FIXES, LOAD_NOTCHES, loadMove, readLoad, type LoadMove } from '../src/domain/loadingBay';
import { check } from '../src/domain/rules';
import { specimenToolId } from '../src/domain/specimenGear';
import { MAPS } from '../src/maps';
import { COUNCIL_LOAD_CHECK, COUNCIL_LOADING_BAY, LOADING_BAY_DOOR } from '../src/maps/loadingBay';
import { Driver } from './driver';

function act(d: Driver, record: string, action: LoadMove) {
  const effect = loadMove(record, d.s.flags, action);
  expect(effect).toBeDefined();
  if (effect) d.run({ type: 'SetFlag', flag: effect.setFlag, value: effect.value });
}

function hallDriver() {
  const d = new Driver();
  d.s.objectivesDone.push('council.arrival');
  return d;
}

describe('The Cart Finds Its Centre', () => {
  it('keeps each exact record and its equipped return at one reachable mapped prop', () => {
    const d = hallDriver();
    expect(LOAD_CASES).toHaveLength(36);
    expect(new Set(LOAD_CASES.map(({ key }) => key)).size).toBe(36);
    expect(new Set(LOAD_CASES.map(({ asset }) => asset)).size).toBe(36);
    expect(MAPS[COUNCIL_LOADING_BAY.id]).toBe(COUNCIL_LOADING_BAY);
    expect(MAPS[LOAD_CHECK_MAP]).toBe(COUNCIL_LOAD_CHECK);
    expect(MAPS['council.gallery'].interactables).toContain(LOADING_BAY_DOOR);
    expect(check(LOADING_BAY_DOOR.visibleIf, new Driver().s)).toBe(false);
    expect(check(LOADING_BAY_DOOR.visibleIf, d.s)).toBe(true);
    const mission = d.e.pack.missions.find(({ id }) => id === 'KG-CH15-R26');
    expect(mission?.caseVisits).toHaveLength(72);
    for (const record of LOAD_CASES) {
      const entry = d.e.pack.exhibits.find(({ id }) => id === record.exhibit);
      expect(entry).toMatchObject({ dateText: record.date, dateKind: record.dateKind, specimen: {
        key: record.key, accession: record.accession, objective: record.objective, pixelAsset: record.asset,
        revisit: { map: LOAD_CHECK_MAP, prop: record.returnProp },
      } });
      expect(entry?.specimen?.people?.length).toBeGreaterThan(0);
      for (const { source } of entry?.specimen?.people ?? []) expect(d.e.pack.sources.some(({ id }) => id === source)).toBe(true);
      expect(Object.values(MAPS).flatMap((map) => map.interactables.filter(({ exhibit }) => exhibit === record.exhibit).map(() => map.id))).toEqual([COUNCIL_LOADING_BAY.id]);
      expect(COUNCIL_LOADING_BAY.interactables.find(({ game }) => game === `${LOAD_GROUP}:trial:${record.slug}`)).toBeDefined();
      expect(COUNCIL_LOAD_CHECK.interactables.find(({ id }) => id === record.returnProp)?.game).toBe(`${LOAD_GROUP}:return:${record.slug}`);
    }
  });

  it('computes signed moment and distinguishes an axle movement from a strap movement', () => {
    const load = [3, 4, -3, 3] as const;
    expect(cartLean(load, -1)).toBe(10);
    expect(cartLean(load, 1)).toBe(-4);
    const wet = changeLoad(load, 6, 3);
    expect(cartLean(wet, -1)).toBe(18);
    expect(fitLoad(wet, -1, 'axle')).toEqual({ load: wet, axle: 1, lean: 0 });
    expect(fitLoad(wet, -1, 'tie')).toEqual({ load: [3, 6, -3, 2], axle: -1, lean: 12 });
    const inward = changeLoad(load, 4, 2);
    expect(cartLean(inward, -1)).toBe(6);
    expect(cartLean(load, -1)).toBe(10);
  });

  it('keeps the initial test matched, makes the chosen handover necessary, and requires both return fixes', () => {
    const d = hallDriver();
    const { slug } = LOAD_CASES[0];
    act(d, slug, { type: 'measure', notch: -1 });
    expect(loadMove(slug, d.s.flags, { type: 'mark', notch: -1 })).toBeUndefined();
    expect(loadMove(slug, d.s.flags, { type: 'send', route: 'bench' })).toBeUndefined();
    act(d, slug, { type: 'measure', notch: 1 });
    act(d, slug, { type: 'mark', notch: -1 });
    act(d, slug, { type: 'send', route: 'bench' });
    expect(loadMove(slug, d.s.flags, { type: 'receive', route: 'call' })).toBeUndefined();
    expect(loadMove(slug, d.s.flags, { type: 'recheck' })).toBeUndefined();
    act(d, slug, { type: 'receive', route: 'bench' });
    expect(loadMove(slug, d.s.flags, { type: 'test', fix: 'axle' })).toBeUndefined();
    act(d, slug, { type: 'recheck' });
    act(d, slug, { type: 'test', fix: 'axle' });
    expect(loadMove(slug, d.s.flags, { type: 'fit', fix: 'axle' })).toBeUndefined();
  });

  it.each(LOAD_CASES)('earns and equips $accession for a changed-load retest and a fitted outcome', (record) => {
    const d = hallDriver();
    const index = LOAD_CASES.indexOf(record);
    const route = index % 2 ? 'call' : 'bench';
    const fix = index % 2 ? 'tie' : 'axle';
    const notch = index % 2 ? 1 : -1;
    const changed = changeLoad(record.load, record.changedRight, record.changedSlot);
    expect(cartLean(changed, notch)).not.toBe(cartLean(record.load, notch));
    const hook = COUNCIL_LOAD_CHECK.interactables.find(({ id }) => id === record.returnProp)!;
    const secondHook = COUNCIL_LOAD_CHECK.interactables.find(({ id }) => id === LOAD_CASES[(index + 1) % LOAD_CASES.length].returnProp)!;
    const receiver = MAPS[route === 'bench' ? 'council.hall' : 'council.gallery'].interactables.find(({ id }) => id === `loading-receiver-${route}`)!;
    d.run({ type: 'InspectExhibit', exhibit: record.exhibit });
    for (const at of LOAD_NOTCHES) act(d, record.slug, { type: 'measure', notch: at });
    act(d, record.slug, { type: 'mark', notch });
    act(d, record.slug, { type: 'send', route });
    expect(check(receiver.visibleIf, d.s)).toBe(true);
    expect(check(receiver.artOpen?.if, d.s)).toBe(false);
    expect(d.done(record.objective)).toBe(false);
    act(d, record.slug, { type: 'receive', route });
    expect(check(receiver.artOpen?.if, d.s)).toBe(true);
    expect(d.done(record.objective)).toBe(true);
    d.run({ type: 'ClaimSpecimen', exhibit: record.exhibit });
    expect(check(hook.visibleIf, d.s)).toBe(false);
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(record.key) });
    expect(check(hook.visibleIf, d.s)).toBe(true);
    expect(check(secondHook.visibleIf, d.s)).toBe(false);
    act(d, record.slug, { type: 'recheck' });
    for (const method of LOAD_FIXES) act(d, record.slug, { type: 'test', fix: method });
    expect(d.done(record.returnObjective)).toBe(false);
    act(d, record.slug, { type: 'fit', fix });
    expect(d.done(record.returnObjective)).toBe(true);
    expect(readLoad(record.slug, d.s.flags).fix).toBe(fix);
    expect(check(hook.artOpen?.if, d.s)).toBe(true);
    d.run({ type: 'EquipPerspective', keepsake: null });
    expect(check(hook.visibleIf, d.s)).toBe(false);
    expect(d.done(record.returnObjective)).toBe(true);
  });
});
