import { describe, expect, it } from 'vitest';
import { vignettesFor } from '../src/domain/epilogue';
import { check } from '../src/domain/rules';
import { NEXT_BENCH } from '../src/maps/afterCouncil';
import { NEXUS } from '../src/maps/nexus';
import type { MapDef } from '../src/maps/types';
import { Driver } from './driver';

const object = (d: Driver, map: MapDef, id: string) => map.interactables.find((prop) => prop.id === id && check(prop.visibleIf, d.s));

describe('The Next Keeper', () => {
  it('keeps the last bench and door hidden until the Council and respects leaving the pen for later', () => {
    const d = new Driver();
    expect(object(d, NEXUS, 'nexus-last-bench')).toBeUndefined();
    d.run({ type: 'SetFlag', flag: 'ending.council', value: 'both' });
    d.walk(object(d, NEXUS, 'nexus-last-bench')!.node!, ['come back']);
    expect(object(d, NEXUS, 'nexus-next-bench')).toBeUndefined();
    expect(d.s.inventory['item.next-keeper-pen']).toBeUndefined();
  });

  it.each([
    ['public', 'Set both records'],
    ['loan', 'Lend Lia the pen'],
  ])('leaves the %s route for Lia and confirms her first handover at the original bench', (edition, option) => {
    const d = new Driver();
    d.run({ type: 'SetFlag', flag: 'ending.council', value: 'correct' });
    d.walk(object(d, NEXUS, 'nexus-last-bench')!.node!, ['Take the pen']);
    expect(d.s.inventory['item.next-keeper-pen']).toBe(1);
    expect(object(d, NEXUS, 'nexus-next-bench')?.to?.map).toBe(NEXT_BENCH.id);
    expect(object(d, NEXUS, 'nexus-last-bench')).toBeUndefined();
    d.talk('lia-vann');
    expect(object(d, NEXT_BENCH, 'next-bench-place')).toBeUndefined();
    d.walk(object(d, NEXT_BENCH, 'next-bench-copy')!.node!);
    expect(d.done('postgame.retrace')).toBe(true);
    d.walk(object(d, NEXT_BENCH, 'next-bench-place')!.node!, [option]);
    expect(d.s.inventory['item.next-keeper-pen']).toBeUndefined();
    expect(object(d, NEXUS, `nexus-next-bench-${edition}`)).toBeUndefined();
    expect(d.p.awards['award.next-keeper']).toBeUndefined();
    d.walk(object(d, NEXT_BENCH, `next-bench-${edition}`)!.node!);
    expect(vignettesFor(d.s).some((v) => v.who === 'Lia Vann')).toBe(false);
    d.walk(object(d, NEXUS, `nexus-next-bench-${edition}`)!.node!);
    expect(d.done('postgame.complete')).toBe(true);
    expect(d.s.journal).toContain('j.postgame.closed');
    expect(d.p.awards['award.next-keeper']).toBeDefined();
    expect(d.p.credit).toEqual({});
    expect(vignettesFor(d.s).filter((v) => v.who === 'Lia Vann')).toHaveLength(1);
    expect(d.s.flags['ending.council']).toBe('correct');
  });

  it.each([
    ['folding-light-screen', 'light'],
    ['observer-notebook', 'watch'],
    ['record-edge-folio', 'edge'],
  ])('reuses the %s at a different bench without gating the handover', (tool, prop) => {
    const d = new Driver();
    expect(object(d, NEXT_BENCH, `next-bench-${prop}`)).toBeUndefined();
    d.run({ type: 'SetFlag', flag: `keepsake.${tool}`, value: true });
    d.run({ type: 'EquipPerspective', keepsake: tool });
    d.walk(object(d, NEXT_BENCH, `next-bench-${prop}`)!.node!);
    expect(d.s.flags[`postgame.checked.${prop}`]).toBe(true);
    expect(d.done('postgame.retrace')).toBe(false);
  });
});
