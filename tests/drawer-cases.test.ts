import { describe, expect, it } from 'vitest';
import { ALL_DRAWER_FACES, drawerReadings, flipDrawer } from '../src/domain/drawerCases';
import { Driver } from './driver';

describe('Three Cases at the Bell', () => {
  it('counts openings and their possible box locations separately', () => {
    const checked = [0, 1, 4].reduce(flipDrawer, 0);
    expect(drawerReadings(checked, 'round')).toEqual({ boxes: 2, checked: 3, sameElsewhere: 2 });
    expect(drawerReadings(ALL_DRAWER_FACES, 'square')).toEqual({ boxes: 2, checked: 3, sameElsewhere: 2 });
    expect(flipDrawer(checked, 1)).toBe(checked);
    expect(() => flipDrawer(checked, 6)).toThrow();
  });

  it.each([
    ['Use all six', 'drawer.fold.all', 'all'],
    ['Send the three', 'drawer.fold.readings', 'readings'],
  ])('takes the checked stencil to a second setting and records the %s handover', (plan, response, edition) => {
    const d = new Driver();
    d.s.mapId = 'aethelgard.emberford';
    d.s.objectivesDone.push('m02.o1.arrive');
    for (const face of [0, 1, 2, 3, 4, 0]) d.run({ type: 'OpenDrawerCase', face });
    expect(d.s.inventory['item.drawer-stencil']).toBeUndefined();
    d.run({ type: 'OpenDrawerCase', face: 5 });
    expect(d.s.inventory['item.drawer-stencil']).toBe(1);
    d.s.mapId = 'observatory.inland';
    d.s.objectivesDone.push('coast.readings');
    d.walk('drawer.fold.plan', [plan]);
    expect(d.done('drawer.fold.finish')).toBe(false);
    d.walk(response);
    expect(d.s.flags['drawer.fold.checked']).toBe(edition);
    expect(d.s.journal).toContain('j.drawer.fold');
    expect(d.p.credit).toEqual({});
  });
});
