import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

function arrangement(d: Driver) {
  return MAPS['nexus.archive'].interactables.find((prop) => prop.id.startsWith('hesper-checked-') && check(prop.visibleIf, d.s));
}

describe('Hesper’s invitation', () => {
  it('lets the player turn over the two square-marked tabs before committing a bench turn', () => {
    const d = new Driver();
    d.s.objectivesDone.push('m01.o7.portal', 'm02.o5.showdown');
    d.s.flags['sd.corvan.outcome'] = 'split';
    const entry = d.e.talkEntry('smith-hesper', d.s)!;
    expect(entry).toBe('hesper.offer');
    expect(d.e.node(entry).text).toMatch(/taken on a repair.*took in a parcel/);
    d.run({ type: 'EnterNode', node: entry });
    const inspect = d.e.visibleOptions(entry, d.s).find(({ option }) => option.text === 'Turn both tabs over.')!;
    const reverse = d.run({ type: 'ChooseDialogueOption', node: entry, index: inspect.index }).nextNode!;
    expect(d.e.node(reverse).text).toMatch(/initials.*arrival time/);
    expect(d.e.node(reverse).next).toBe(entry);
    expect(d.s.flags['hesper.visitArrangement']).toBeUndefined();
    expect(d.done('m02.o6.hesper')).toBe(false);
  });

  it.each([
    ['Yes. Come', 'Tie the repair tab to a bench slip', 'bench', 'bench', /signed to mend.*arrival time.*free the bench/],
    ["I'll ask Warden", 'Clip the repair tab to the drawer packet', 'confirm', 'drawer', /signed for the face.*reached the counter.*bench is free/],
  ])('gives a visitor a distinct follow-up when they choose %s', (choice, handling, plan, result, readback) => {
    const d = new Driver();
    d.s.objectivesDone.push('m01.o7.portal', 'm02.o5.showdown');
    const instruction = d.e.visibleOptions('hesper.offer', d.s).find(({ option }) => option.text.startsWith(choice));
    expect(instruction?.option.tag).toBe(handling);
    const before = { ...d.p.credit };
    d.walk('hesper.offer', [choice]);
    expect(d.done('m02.o6.hesper')).toBe(true);
    expect(d.s.flags['hesper.visitArrangement']).toBe(plan);
    expect(arrangement(d)).toBeUndefined();
    d.s.objectivesDone.push('m02.o8.ise');
    const prop = arrangement(d);
    expect(prop?.id).toBe(`hesper-checked-${result}`);
    expect(d.e.node(prop!.node!).text).toMatch(readback);
    d.walk(prop!.node!);
    expect(d.s.flags['hesper.visitChecked']).toBe(result);
    expect(d.s.journal).toContain(`j.hesper.checked-${result}`);
    expect(d.p.credit).toEqual(before);
  });

  it('keeps the signed return for a save made before invitation plans were recorded', () => {
    const d = new Driver();
    d.s.objectivesDone.push('m02.o6.hesper', 'm02.o8.ise');
    expect(arrangement(d)?.id).toBe('hesper-checked-drawer');
  });
});
