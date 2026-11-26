import { describe, expect, it } from 'vitest';
import { opticalReading, OPTICS_TRIALS } from '../src/domain/opticsBench';
import { activePerspective, perspectiveTools, PERSPECTIVE_FLAG } from '../src/domain/perspectives';
import { specimenFromTool } from '../src/domain/specimenGear';
import { check } from '../src/domain/rules';
import { emptyPair, parsePair, serialisePair, writeSuspend } from '../src/domain/saves';
import type { Condition } from '../src/domain/types';
import { MAPS } from '../src/maps';
import type { MapDef } from '../src/maps/types';
import { Driver } from './driver';

function item(d: Driver, map: string, id: string) {
  return MAPS[map].interactables.find((prop) => prop.id === id && check(prop.visibleIf, d.s));
}

function requiresPerspective(condition: Condition | undefined, id: string): boolean {
  if (!condition) return false;
  if ('all' in condition) return condition.all.some((part) => requiresPerspective(part, id));
  if ('any' in condition) return condition.any.every((part) => requiresPerspective(part, id));
  return 'eq' in condition && condition.flag === PERSPECTIVE_FLAG && condition.eq === id;
}

function propsFor(map: MapDef, id: string) {
  return map.interactables.filter((prop) => requiresPerspective(prop.visibleIf, id) || requiresPerspective(prop.openIf, id));
}

describe('equipped keepsakes', () => {
  it('gives each crafted perspective tool exclusive uses in at least two worlds', () => {
    const d = new Driver();
    const tools = perspectiveTools(d.e.pack).filter((tool) => !specimenFromTool(tool.id));
    expect(tools.length).toBeGreaterThanOrEqual(3);
    for (const tool of tools) {
      const worlds = new Set(Object.values(MAPS).filter((map) => propsFor(map, tool.id).length).map((map) => map.world));
      expect(worlds.size, tool.name).toBeGreaterThanOrEqual(2);
    }
  });

  it('requires the real keepsake, saves the selection and can put it away', () => {
    const d = new Driver();
    expect(() => d.run({ type: 'EquipPerspective', keepsake: 'folding-light-screen' })).toThrow('not earned');
    expect(activePerspective(d.e.pack, d.s)).toBeUndefined();
    expect(() => d.run({ type: 'EquipPerspective', keepsake: 'paper-frame' })).toThrow('not earned');
    d.s.objectivesDone.push('coast.optics.plan');
    d.run({ type: 'Reach', zone: 'test-field-tool' });
    d.run({ type: 'EquipPerspective', keepsake: 'folding-light-screen' });
    expect(activePerspective(d.e.pack, d.s)?.id).toBe('folding-light-screen');
    const stored = parsePair(serialisePair(writeSuspend(emptyPair(), {
      kind: 'suspend', label: 'Headland', location: 'Headland Station', savedAt: '2026-11-26T06:00:00Z', state: d.s,
    })));
    expect(stored.ok).toBe(true);
    if (stored.ok && stored.pair.continue) {
      expect(activePerspective(d.e.pack, stored.pair.continue.state)?.id).toBe('folding-light-screen');
    } else throw new Error('Expected saved field tool');
    d.run({ type: 'EquipPerspective', keepsake: null });
    expect(activePerspective(d.e.pack, d.s)).toBeUndefined();
    expect(d.s.flags['keepsake.folding-light-screen']).toBe(true);
  });
});

describe('The Shadow on the Handover', () => {
  it('distinguishes a change in the light source and a change in the object', () => {
    const [left, right, turned] = OPTICS_TRIALS.map(opticalReading);
    expect(left.pointer).toBe(right.pointer);
    expect(left.shadow).not.toBe(right.shadow);
    expect(turned.pointer).not.toBe(right.pointer);
    expect(turned.shadow).not.toBe(right.shadow);
    expect([left.shadow, right.shadow, turned.shadow]).toEqual([67, 9, 23]);
  });

  it.each([
    ['Put both socket', 'council-optics-ramp', 'Put the fixed notch'],
    ['Send a dated slip', 'council-optics-rail', 'Give the rail pair'],
  ])('carries the screened check from the headland to the Council with %s', (coastChoice, receipt, councilChoice) => {
    const d = new Driver();
    const station = 'observatory.station';
    const archive = 'observatory.archive';
    const gallery = 'council.gallery';
    expect(item(d, station, 'coast-shadow-board')).toBeUndefined();
    d.s.objectivesDone.push('coast.revise');
    expect(item(d, station, 'coast-shadow-board')).toBeDefined();
    d.walk(item(d, archive, 'coast-optics-method')!.node!);
    for (const trial of ['left', 'right']) d.run({ type: 'SetFlag', flag: `coast.optics.trial.${trial}`, value: true });
    d.walk(item(d, station, 'coast-optics-handover')!.node!, [coastChoice]);
    expect(d.s.flags['keepsake.folding-light-screen']).toBe(true);
    expect(item(d, station, 'coast-optics-arch')).toBeUndefined();
    d.run({ type: 'EquipPerspective', keepsake: 'folding-light-screen' });
    expect(item(d, station, 'coast-optics-arch')?.to?.map).toBe(archive);
    expect(item(d, archive, 'coast-optics-arch-return')?.to?.map).toBe(station);
    expect(item(d, gallery, 'council-shadow-board')).toBeUndefined();
    d.s.objectivesDone.push('council.arrival');
    expect(item(d, gallery, 'council-shadow-board')).toBeDefined();
    for (const trial of ['left', 'right', 'turn']) d.run({ type: 'SetFlag', flag: `council.optics.trial.${trial}`, value: true });
    d.walk(item(d, gallery, 'council-optics-handover')!.node!, [councilChoice]);
    expect(d.done('council.optics.plan')).toBe(false);
    d.run({ type: 'SetFlag', flag: item(d, gallery, receipt)!.flag!, value: true });
    expect(d.done('council.optics.plan')).toBe(true);
    expect(d.p.credit).toEqual({});
    expect(d.s.flags['ending.council']).toBeUndefined();
  });
});
