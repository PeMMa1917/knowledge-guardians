import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import type { Interactable } from '../src/maps/types';
import { Driver } from './driver';

const inventoryId = 'item.folding-gauge';
const nexus = MAPS['nexus.archive'];
const coldStore = MAPS['preserved.archive'];
const tool = 'tool.provenance-thread';

function prop(d: Driver, id: string, map = nexus): Interactable {
  const result = map.interactables.find((item) => item.id === id);
  if (!result || !check(result.visibleIf, d.s)) throw new Error(`Cannot reach ${id}`);
  return result;
}

function use(d: Driver, id: string, pick: string, map = nexus) {
  const target = prop(d, id, map);
  if (target.kind !== 'scene' || !target.node) throw new Error(`${id} is not a scene`);
  d.walk(target.node, [pick]);
}

function follow(d: Driver, id: string, map = nexus) {
  const target = prop(d, id, map);
  if (target.kind !== 'thread' || !target.thread || !target.node) throw new Error(`${id} is not part of a thread`);
  d.run({ type: 'FollowThread', thread: target.thread, node: target.node });
}

function intake(): Driver {
  const d = new Driver();
  d.walk('cold.open');
  d.talk('nima-fenner');
  use(d, 'nexus-gauge-case', 'Turn the gauge');
  use(d, 'nexus-gauge-intake', 'File the tray entry');
  return d;
}

function giveThread(d: Driver) {
  d.s = { ...d.s, inventory: { ...d.s.inventory, [tool]: 1 } };
}

describe('The Fold in the Gauge', () => {
  it('lets a new recruit note a found object without advancing the original exhibits or opening a new way', () => {
    const d = new Driver();
    d.walk('cold.open');
    const inspectionCount = d.s.flags['count.inspected'];
    expect(d.e.visibleOptions('lost.gauge.intake', d.s)).toHaveLength(1);
    use(d, 'nexus-gauge-case', 'Turn the gauge');
    expect(d.s.flags['count.inspected']).toBe(inspectionCount);
    expect(d.s.flags['count.lens']).toBeUndefined();
    use(d, 'nexus-gauge-intake', 'File the tray entry');
    expect(d.done('lost.gauge.intake')).toBe(true);
    expect(d.s.inventory[inventoryId]).toBeUndefined();
    expect(prop(d, 'nexus-gauge-wait').art).toBe('lost-gauge.stub');
    expect(() => follow(d, 'nexus-gauge-thread')).toThrow();
    expect(() => d.run({ type: 'FollowThread', thread: 'lost-gauge', node: 'entry' })).toThrow('do not have the Provenance Thread');
    expect(d.e.talkEntry('warden-ise', d.s)).toBe('ise.look');
    expect(check(nexus.interactables.find((item) => item.id === 'preserved-door')?.visibleIf, d.s)).toBe(false);
  });

  it('can start late and gives Nima a different greeting if the player has never met her', () => {
    const d = new Driver();
    giveThread(d);
    d.run({ type: 'SetFlag', flag: 'preserved.arrived', value: true });
    expect(d.e.talkEntry('nima-fenner', d.s)).toBe('lost.gauge.nima.cold');
    expect(check(nexus.npcs.find((actor) => actor.id === 'nima-fenner')?.visibleIf, d.s)).toBe(false);
    use(d, 'nexus-gauge-case', 'Turn the gauge');
    use(d, 'nexus-gauge-intake', 'File the tray entry');
    expect(d.done('lost.gauge.intake')).toBe(true);
    expect(prop(d, 'nexus-gauge-thread').node).toBe('entry');
  });

  it.each([
    ['owner', 'Set the gauge in Nima', 'Hold the divider', 'Close the found entry beside', 'lost-gauge.divider', 'lost-gauge.closed'],
    ['loan', 'Set the gauge on the teaching bench', 'Fit the notch', 'Close the found entry and file', 'lost-gauge.hook', 'lost-gauge.loan-note'],
  ] as const)('keeps a checked custody trail for the %s outcome', (mode, release, work, close, benchArt, receiptArt) => {
    const d = intake();
    giveThread(d);
    const trial = prop(d, 'nexus-gauge-thread');
    expect([trial.x, trial.y]).toEqual([3, 6]);
    expect(() => use(d, 'nexus-gauge-carry', 'Sign for the pouch')).toThrow();
    follow(d, 'nexus-gauge-thread');
    expect(d.s.flags['thread.lost-gauge.gap']).toBe(true);
    use(d, 'nexus-gauge-carry', 'Sign for the pouch');
    expect(d.s.inventory[inventoryId]).toBe(1);
    expect(() => prop(d, 'nexus-gauge-case')).toThrow();
    d.run({ type: 'SetFlag', flag: 'preserved.arrived', value: true });
    expect(d.e.talkEntry('nima-fenner', d.s)).toBe('lost.gauge.nima.cold-returning');
    expect(() => follow(d, 'lost-gauge-gift', coldStore)).toThrow();
    follow(d, 'lost-gauge-jig', coldStore);
    expect(d.e.talkEntry('nima-fenner', d.s)).toBe('lost.gauge.nima.cold-returning');
    follow(d, 'lost-gauge-gift', coldStore);
    expect(d.done('lost.gauge.traced')).toBe(true);
    d.talk('nima-fenner', release);
    expect(d.s.flags['lost.gauge.resolved']).toBe(mode);
    expect(d.s.inventory[inventoryId] ?? 0).toBe(0);
    expect(prop(d, 'nexus-gauge-awaiting').node).toBe('lost.gauge.awaiting');
    expect(() => prop(d, 'nexus-gauge-carry')).toThrow();
    use(d, `preserved-gauge-${mode}`, work, coldStore);
    expect(prop(d, `preserved-gauge-used-${mode}`, coldStore).art).toBe(benchArt);
    expect(d.done('lost.gauge.returned')).toBe(true);
    expect(d.done('lost.gauge.acknowledged')).toBe(false);
    use(d, 'nexus-gauge-receipt', close);
    expect(d.done('lost.gauge.acknowledged')).toBe(true);
    expect(prop(d, `nexus-gauge-closed-${mode}`).art).toBe(receiptArt);
    expect(d.s.journal).toContain('j.lost.gauge');
  });
});
