import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { GLASS_RACK_CASES } from '../src/content/glassRack';
import { check } from '../src/domain/rules';
import {
  SPECIMEN_BASE, SPECIMEN_CAPACITY, SPECIMEN_CASES, SPECIMEN_PAGE, SPECIMEN_TARGET, PERSPECTIVE_FLAG, canClaimSpecimen, carriesSpecimen,
  carriedSpecimenCount, hasSpecimen, specimenDisplay, specimenEquipped, specimenItemId, specimenReadingFlag, specimenToolId,
  type SpecimenExhibit,
} from '../src/domain/specimenGear';
import { specimenReferences } from '../src/domain/specimenReferences';
import { emptyPair, parsePair, restoreRecovery, serialisePair, writeCheckpoint, writeSuspend, type SaveEntry } from '../src/domain/saves';
import { MAPS } from '../src/maps';
import type { Interactable, MapDef } from '../src/maps/types';
import { Driver } from './driver';

const pack = buildPack();
const specimens = pack.exhibits.filter(hasSpecimen);
const sources = new Map(pack.sources.map((source) => [source.id, source]));
const objectives = new Set(pack.missions.flatMap(({ objectives }) => objectives.map(({ id }) => id)));

type Position = { map: MapDef; prop: Interactable };
const placements = new Map<string, Position[]>();
for (const map of Object.values(MAPS)) {
  for (const prop of map.interactables) {
    if (prop.kind !== 'exhibit' || !prop.exhibit) continue;
    const recorded = placements.get(prop.exhibit) ?? [];
    recorded.push({ map, prop });
    placements.set(prop.exhibit, recorded);
  }
}

const representative = new Map<string, SpecimenExhibit>();
for (const record of specimens) {
  const location = placements.get(record.id)?.[0];
  if (location && !representative.has(location.map.id)) representative.set(location.map.id, record);
}

function floor(map: MapDef, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < map.width && y < map.height && !!map.floor(x, y)
    && !map.blocks.some(([left, top, width, height]) => x >= left && y >= top && x < left + width && y < top + height);
}

function approach({ map, prop }: Position): boolean {
  for (let x = prop.x; x < prop.x + prop.w; x++) {
    if (floor(map, x, prop.y - 1) || floor(map, x, prop.y + prop.h)) return true;
  }
  for (let y = prop.y; y < prop.y + prop.h; y++) {
    if (floor(map, prop.x - 1, y) || floor(map, prop.x + prop.w, y)) return true;
  }
  return false;
}

function visit(d: Driver, record: SpecimenExhibit) {
  d.s.mapId = placements.get(record.id)![0].map.id;
  d.run({ type: 'InspectExhibit', exhibit: record.id });
}

function earn(d: Driver, record: SpecimenExhibit) {
  visit(d, record);
  if (!d.done(record.specimen.objective)) d.s.objectivesDone.push(record.specimen.objective);
  d.run({ type: 'ClaimSpecimen', exhibit: record.id });
}

function snapshot(d: Driver, label: string): SaveEntry {
  return { kind: 'checkpoint', label, location: d.s.mapId, savedAt: '2026-11-26T11:08:00.000Z', state: structuredClone(d.s) };
}

describe('Collection system across the registered campaign', () => {
  it('keeps each exact object attached to its physical exhibit, earned deed, exact source and distinct gear', () => {
    const d = new Driver();
    const keys = new Set<string>();
    const items = new Set(pack.items.map(({ id }) => id));
    const equipment = new Map(pack.keepsakes?.map((keepsake) => [keepsake.id, keepsake]));
    expect(specimens.length).toBeGreaterThanOrEqual(SPECIMEN_TARGET);
    const problems: string[] = [];
    for (const record of specimens) {
      const { key, objective, source, revisit } = record.specimen;
      const locations = placements.get(record.id) ?? [];
      const unique = new Set(locations.map(({ map, prop }) => `${map.id}/${prop.x}/${prop.y}`));
      const entry = sources.get(source);
      if (keys.has(key)) problems.push(`${key}: duplicated identity`);
      keys.add(key);
      if (unique.size !== 1 || !locations.some(approach)) problems.push(`${key}: missing unique physical approach`);
      if (!objectives.has(objective)) problems.push(`${key}: missing earned deed`);
      if (!record.sources.includes(source) || !entry || !/^https?:\/\//.test(entry.url)) problems.push(`${key}: unlinked exact source`);
      const tool = equipment.get(specimenToolId(key));
      if (!items.has(specimenItemId(key)) || !tool?.equip || !tool.if || check(tool.if, d.s)) problems.push(`${key}: unearned gear or missing tool`);
      if (revisit) {
        const room = MAPS[revisit.map];
        const prop = room?.interactables.find(({ id }) => id === revisit.prop);
        if (!prop || !approach({ map: room, prop }) || check(prop.visibleIf, d.s)) {
          problems.push(`${key}: unapproachable or initially open return station`);
        }
      }
    }
    expect(problems).toEqual([]);
  });

  it.each([...representative.entries()])('runs lock, take, replay and equip through the normal engine for %s', (map, record) => {
    const d = new Driver();
    const { key, objective } = record.specimen;
    d.s.mapId = map;
    expect(() => d.run({ type: 'EquipPerspective', keepsake: specimenToolId(key) })).toThrow();
    expect(() => d.run({ type: 'ClaimSpecimen', exhibit: record.id })).toThrow();
    visit(d, record);
    expect(canClaimSpecimen(d.s, record)).toBe(false);
    expect(() => d.run({ type: 'ClaimSpecimen', exhibit: record.id })).toThrow(/Finish/);
    d.s.objectivesDone.push(objective);
    const inspectionCount = d.s.flags['count.inspected'];
    visit(d, record);
    expect(d.s.flags['count.inspected']).toBe(inspectionCount);
    expect(canClaimSpecimen(d.s, record)).toBe(true);
    d.run({ type: 'ClaimSpecimen', exhibit: record.id });
    d.run({ type: 'ClaimSpecimen', exhibit: record.id });
    expect(d.s.inventory[specimenItemId(key)]).toBe(1);
    expect(canClaimSpecimen(d.s, record)).toBe(false);
    expect(check(specimenEquipped(key), d.s)).toBe(false);
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(key) });
    expect(check(specimenEquipped(key), d.s)).toBe(true);
    d.run({ type: 'SetSpecimenReading', exhibit: record.id, reading: 'source' });
    expect(d.s.flags[specimenReadingFlag(key)]).toBe('source');
    expect(specimenReferences(pack, d.s).map(({ key: id, url }) => [id, url]))
      .toEqual([[key, sources.get(record.specimen.source)!.url]]);
  });

  it('pages shelved holdings, honours the satchel limit and keeps one branch through a saved reload', () => {
    const d = new Driver();
    const chosen = [...representative.values()].slice(0, SPECIMEN_CAPACITY + SPECIMEN_CASES + 1);
    const saved = writeCheckpoint(emptyPair(), snapshot(d, 'Before the collection'));
    for (const record of chosen) earn(d, record);
    expect(carriedSpecimenCount(d.s)).toBe(SPECIMEN_CAPACITY);
    expect(specimenDisplay(pack, d.s)).toMatchObject({ page: 0, pages: 2 });
    const first = chosen[0], stored = chosen.at(-1)!;
    const firstKey = first.specimen.key, storedKey = stored.specimen.key;
    expect(carriesSpecimen(d.s, storedKey)).toBe(false);
    expect(() => d.run({ type: 'EquipPerspective', keepsake: specimenToolId(storedKey) })).toThrow();
    expect(() => d.run({ type: 'CarrySpecimen', key: storedKey, carry: true })).toThrow(/Nexus/);
    d.s.mapId = SPECIMEN_BASE;
    expect(() => d.run({ type: 'CarrySpecimen', key: storedKey, carry: true })).toThrow(/full/);
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(firstKey) });
    d.run({ type: 'CarrySpecimen', key: firstKey, carry: false });
    expect(d.s.flags[PERSPECTIVE_FLAG]).toBe(false);
    d.run({ type: 'CarrySpecimen', key: storedKey, carry: true });
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(storedKey) });
    d.run({ type: 'SetSpecimenReading', exhibit: stored.id, reading: 'use' });
    d.run({ type: 'SetFlag', flag: SPECIMEN_PAGE, value: 1 });
    const loaded = parsePair(serialisePair(writeSuspend(saved, snapshot(d, 'Case wall'))));
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    const restored = loaded.pair.continue!.state;
    expect(specimenDisplay(pack, restored)).toMatchObject({ page: 1, pages: 2 });
    expect(check(specimenEquipped(storedKey), restored)).toBe(true);
    expect(restored.flags[specimenReadingFlag(storedKey)]).toBe('use');
    expect(specimenReferences(pack, restored)).toHaveLength(chosen.length);
    expect(specimenReferences(pack, restoreRecovery(loaded.pair).continue!.state)).toEqual([]);
  });

  it.each([['rail', 3, 2], ['pocket', 4, 3]] as const)(
    'retains the named Glass Rack %s branch at the reading desk and as a returned notice after reopen', (mount, layout, outcome) => {
      const d = new Driver();
      const glass = GLASS_RACK_CASES[0];
      d.s.objectivesDone.push('preserved.publish');
      const record = specimens.find(({ id }) => id === glass.exhibit)!;
      visit(d, record);
      const choose = (node: string, index: number) => d.run({ type: 'ChooseDialogueOption', node, index });
      expect(() => choose(glass.nodes.work, layout)).toThrow();
      for (const index of [0, 1, 2, layout]) choose(glass.nodes.work, index);
      expect(() => choose(glass.nodes[mount === 'rail' ? 'pocket' : 'rail'], 0)).toThrow();
      if (mount === 'pocket') { expect(() => choose(glass.nodes.pocket, 1)).toThrow(); choose(glass.nodes.pocket, 0); }
      choose(glass.nodes[mount], mount === 'rail' ? 0 : 1);
      expect(() => choose(glass.nodes[mount], mount === 'rail' ? 0 : 1)).toThrow();
      expect(d.done(glass.earned)).toBe(true);
      d.run({ type: 'ClaimSpecimen', exhibit: record.id });
      d.run({ type: 'EquipPerspective', keepsake: specimenToolId(record.specimen.key) });
      d.s.mapId = glass.revisit.map;
      for (const index of [0, 1, outcome]) choose(glass.nodes.revisit, index);
      const pair = parsePair(serialisePair(writeCheckpoint(emptyPair(), snapshot(d, 'Checked views'))));
      expect(pair.ok).toBe(true);
      if (!pair.ok) return;
      d.s = pair.pair.continue!.state;
      expect(d.s.flags[`${glass.flag}.heard`]).toBe(mount);
      expect(d.s.flags[`${glass.flag}.nile`]).toBe(outcome === 2 ? 'board' : 'desk');
      expect(d.done(glass.returned)).toBe(true);
      expect(() => choose(glass.nodes.revisit, outcome)).toThrow();
    },
  );
});
