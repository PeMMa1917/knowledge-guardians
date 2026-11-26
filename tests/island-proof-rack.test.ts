import { describe, expect, it } from 'vitest';
import { ISLAND_PROOF_CASES, ISLAND_PROOF_KEYS, ISLAND_PROOF_ROUTES, ISLAND_PROOF_TRIALS, islandProofFlag,
  islandProofProp, islandProofReceipt, proofManifest, proofScalePrint, type IslandProofCase, type IslandProofRoute } from '../src/domain/islandProofRack';
import { activePerspective } from '../src/domain/perspectives';
import { check } from '../src/domain/rules';
import { emptyPair, parsePair, serialisePair, writeSuspend } from '../src/domain/saves';
import { carriedSpecimenCount, carriesSpecimen, hasSpecimen, ownsSpecimen, SPECIMEN_BASE, SPECIMEN_CAPACITY,
  specimenItemId, specimenToolId } from '../src/domain/specimenGear';
import { ISLAND_DOCK, ISLAND_MARGIN, ISLAND_WORKSHOP } from '../src/maps/island';
import { ISLAND_SPECIMEN_DOCK, ISLAND_SPECIMEN_MARGIN, ISLAND_SPECIMEN_RACKS } from '../src/maps/islandProofRack';
import { STAMPS } from '../src/scenes/art';
import { Driver } from './driver';

function carried(d: Driver, key: string) {
  const record = d.e.pack.exhibits.filter(hasSpecimen).find(({ specimen }) => specimen.key === key)!;
  d.s.objectivesDone.push(record.specimen.objective);
  d.run({ type: 'InspectExhibit', exhibit: record.id });
  d.run({ type: 'ClaimSpecimen', exhibit: record.id });
  return record;
}

const equipment = (d: Driver, id: IslandProofCase | null) => d.run({ type: 'EquipPerspective',
  keepsake: id ? specimenToolId(ISLAND_PROOF_KEYS[id]) : null });

function proofFlags(d: Driver, id: IslandProofCase, route: IslandProofRoute) {
  for (const trial of ISLAND_PROOF_TRIALS[id]) d.run({ type: 'SetFlag', flag: islandProofFlag(id, `try.${trial}`), value: true });
  expect(d.done(islandProofFlag(id, 'checked'))).toBe(true);
  d.run({ type: 'SetFlag', flag: islandProofFlag(id, 'plan'), value: route });
}

const cases = ISLAND_PROOF_CASES.flatMap((id) => ISLAND_PROOF_ROUTES.map((route) => [id, route] as const));

describe('Island specimen proof racks', () => {
  it('counts a paired view as one job and gives both fictional prints the same fit', () => {
    expect(proofManifest(false)).toEqual(['Part', 'Counterpart', 'Ferry tool roll']);
    expect(proofManifest(true)).toEqual(['two-face packet', 'tool roll']);
    expect(proofScalePrint('small')).toEqual({ outline: 18, bar: 6, modelDistance: 600, fits: true });
    expect(proofScalePrint('large')).toEqual({ outline: 36, bar: 12, modelDistance: 600, fits: true });
  });

  it('keeps the prospect and receiving targets apart from other authored targets', () => {
    for (const [map, props] of [[ISLAND_WORKSHOP, ISLAND_SPECIMEN_RACKS], [ISLAND_DOCK, ISLAND_SPECIMEN_DOCK],
      [ISLAND_MARGIN, ISLAND_SPECIMEN_MARGIN]] as const) {
      for (const prop of props) {
        expect(map.interactables).toContain(prop);
        expect(map.floor(prop.x, prop.y)).toBeTruthy();
        expect(map.interactables.filter((entry) => entry.x === prop.x && Math.abs(entry.y - prop.y) < 2)).toEqual([prop]);
        expect(map.stamps.some(({ stamp, x, y }) => {
          const clip = STAMPS[stamp].collide;
          return clip && x + clip[0] <= prop.x && y + clip[1] <= prop.y && prop.x < x + clip[0] + clip[2] && prop.y < y + clip[1] + clip[3];
        })).toBe(false);
      }
    }
  });

  it('recognizes old collection copies and respects the three-slot swap', () => {
    const old = new Driver();
    const fillers = old.e.pack.exhibits.filter(hasSpecimen).slice(0, 3).map((record) => record.specimen.key);
    for (const key of fillers) carried(old, key);
    for (const key of Object.values(ISLAND_PROOF_KEYS)) {
      carried(old, key);
      expect(ownsSpecimen(old.s, key)).toBe(true);
      expect(carriesSpecimen(old.s, key)).toBe(false);
    }
    // Schema 4 had the same collection slots and no Adventure Diary or these revisit flags.
    const { adventureDiary: _diary, ...previous } = old.s;
    const oldSave = serialisePair(writeSuspend(emptyPair(), { kind: 'suspend', label: 'Old collection', location: 'Nexus',
      savedAt: '2026-11-26T06:00:00Z', state: { ...previous, schema: 4 } as typeof old.s }));
    const load = parsePair(oldSave);
    if (!load.ok || !load.pair.continue) throw Error('Could not reopen the previous collection');
    expect(load.migrated).toBe(true);
    const d = new Driver();
    d.s = load.pair.continue.state;
    expect(carriedSpecimenCount(d.s)).toBe(SPECIMEN_CAPACITY);
    d.s.mapId = ISLAND_WORKSHOP.id;
    expect(() => equipment(d, 'paired-views')).toThrow(/not earned/);
    expect(() => d.run({ type: 'CarrySpecimen', key: fillers[0], carry: false })).toThrow(/at the Nexus/);
    expect(ISLAND_SPECIMEN_RACKS.some((prop) => check(prop.visibleIf, d.s))).toBe(false);

    d.s.mapId = SPECIMEN_BASE;
    expect(() => d.run({ type: 'CarrySpecimen', key: ISLAND_PROOF_KEYS['paired-views'], carry: true })).toThrow(/slots are full/);
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(fillers[0]) });
    d.run({ type: 'CarrySpecimen', key: fillers[0], carry: false });
    expect(activePerspective(d.e.pack, d.s)).toBeUndefined();
    for (const id of ISLAND_PROOF_CASES) {
      const key = ISLAND_PROOF_KEYS[id];
      d.run({ type: 'CarrySpecimen', key, carry: true });
      equipment(d, id);
      const held = activePerspective(d.e.pack, d.s);
      expect(held?.id).toBe(specimenToolId(key));
      expect(carriedSpecimenCount(d.s)).toBe(SPECIMEN_CAPACITY);
      expect(ISLAND_SPECIMEN_RACKS.filter((prop) => check(prop.visibleIf, d.s)).map((prop) => prop.id)).toEqual([islandProofProp(id)]);
      d.run({ type: 'CarrySpecimen', key, carry: false });
      expect(ownsSpecimen(d.s, key)).toBe(true);
      expect(activePerspective(d.e.pack, d.s)).toBeUndefined();
    }
  });

  it.each(cases)('puts the %s copy to work at the %s and keeps one receipt after stowing', (id, route) => {
    const d = new Driver();
    const key = ISLAND_PROOF_KEYS[id];
    const record = carried(d, key);
    const rack = ISLAND_SPECIMEN_RACKS.find((prop) => prop.id === islandProofProp(id))!;
    expect(record.specimen.revisit).toMatchObject({ map: ISLAND_WORKSHOP.id, prop: rack.id });
    expect(record.specimen.objective).toBe(id === 'paired-views' ? 'reference-line.antioquia-pair.used' : 'reference-line.chimbote-valve.used');
    expect(record.specimen.source).toBe(id === 'paired-views' ? 'HIS-REFERENCE-LINE-ANTIOQUIA-PAIR' : 'HIS-REFERENCE-LINE-CHIMBOTE-VALVE');
    expect(check(rack.visibleIf, d.s)).toBe(false);
    equipment(d, id);
    expect(check(rack.visibleIf, d.s)).toBe(true);
    const receiver = [...ISLAND_SPECIMEN_DOCK, ...ISLAND_SPECIMEN_MARGIN]
      .find((prop) => prop.id === `${rack.id}-${route}`)!;
    d.s.mapId = route === 'dock' ? ISLAND_DOCK.id : ISLAND_MARGIN.id;
    expect(check(receiver.visibleIf, d.s)).toBe(false);
    proofFlags(d, id, route);
    expect(d.done(islandProofFlag(id, 'used'))).toBe(false);
    expect(check(receiver.visibleIf, d.s)).toBe(true);
    equipment(d, null);
    expect(check(receiver.visibleIf, d.s)).toBe(false);
    expect(d.e.visibleOptions(receiver.node!, d.s).map(({ option }) => option.text)).toEqual(['Leave the receiver at its stand.']);
    equipment(d, id);
    d.walk(receiver.node!);
    expect(d.done(islandProofFlag(id, 'used'))).toBe(true);
    expect(d.s.inventory[islandProofReceipt(id)]).toBe(1);
    expect(d.s.inventory[specimenItemId(key)]).toBe(1);
    expect(check(receiver.artOpen?.if, d.s)).toBe(true);
    d.s.mapId = SPECIMEN_BASE;
    d.run({ type: 'CarrySpecimen', key, carry: false });
    d.s.mapId = route === 'dock' ? ISLAND_DOCK.id : ISLAND_MARGIN.id;
    expect(check(receiver.visibleIf, d.s)).toBe(true);
    d.walk(receiver.node!, ['Read the kept reply']);
    d.run({ type: 'ClaimSpecimen', exhibit: record.id });
    expect(d.s.inventory[islandProofReceipt(id)]).toBe(1);
    expect(d.s.inventory[specimenItemId(key)]).toBe(1);
    expect(d.s.journal.filter((line) => line === `j.${islandProofFlag(id, 'used')}`)).toHaveLength(1);
  });
});
