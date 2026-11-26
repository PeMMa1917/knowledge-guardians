import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

function arrangement(d: Driver) {
  return MAPS['nexus.archive'].interactables.find((prop) => prop.id.startsWith('hesper-checked-') && check(prop.visibleIf, d.s));
}

describe('Hesper’s invitation', () => {
  it.each([
    ['Yes. Come', 'bench'],
    ["I'll ask Warden", 'drawer'],
  ])('gives a visitor a distinct follow-up when they choose %s', (choice, result) => {
    const d = new Driver();
    d.s.objectivesDone.push('m01.o7.portal', 'm02.o5.showdown');
    d.walk('hesper.offer', [choice]);
    expect(d.done('m02.o6.hesper')).toBe(true);
    expect(arrangement(d)).toBeUndefined();
    d.s.objectivesDone.push('m02.o8.ise');
    const prop = arrangement(d);
    expect(prop?.id).toBe(`hesper-checked-${result}`);
    d.walk(prop!.node!);
    expect(d.s.flags['hesper.visitChecked']).toBe(result);
    expect(d.s.journal).toContain(`j.hesper.checked-${result}`);
  });

  it('keeps the signed return for a save made before invitation plans were recorded', () => {
    const d = new Driver();
    d.s.objectivesDone.push('m02.o6.hesper', 'm02.o8.ise');
    expect(arrangement(d)?.id).toBe('hesper-checked-drawer');
  });
});
