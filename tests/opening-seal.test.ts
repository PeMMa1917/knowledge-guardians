import { describe, expect, it } from 'vitest';
import { MAPS } from '../src/maps';
import { check } from '../src/domain/rules';
import { Driver } from './driver';

const curator = 'curator-dace';
const kit = 'nexus.handling-seal';
const model = 'OBJ-001-B';
const props = ['nexus-seal-case', 'nexus-seal-desk'];
const objective = 'nexus.seal.checked';

function open(d: Driver) {
  d.run({ type: 'SetFlag', flag: 'read.oldlabel', value: true });
  d.talk('warden-ise', 'How can all three');
  d.run({ type: 'InspectExhibit', exhibit: model });
}

function offer(d: Driver): boolean {
  const node = d.e.talkEntry(curator, d.s);
  return !!node && d.e.visibleOptions(node, d.s).some(({ option }) => option.next === 'dace.seal-docket');
}

function visible(d: Driver) {
  return MAPS['nexus.archive'].interactables.filter((p) => props.includes(p.id) && check(p.visibleIf, d.s));
}

describe('Seal at the Door', () => {
  it('uses the model’s own Lens view and still allows the usual curator line', () => {
    const d = new Driver();
    open(d);
    expect(offer(d)).toBe(false);
    d.run({ type: 'UseLens', exhibit: 'OBJ-001-A' });
    expect(offer(d)).toBe(false);
    d.run({ type: 'UseLens', exhibit: model });
    expect(offer(d)).toBe(true);
    d.talk(curator, 'Why do you favour');
    expect(d.e.talkEntry(curator, d.s)).toBe('dace.again');
    expect(offer(d)).toBe(true);
    expect(visible(d)).toEqual([]);
  });

  it.each([
    ['paired', 'build', 'nexus-seal-case', 'Trace the build date'],
    ['docket', 'drawing', 'nexus-seal-desk', 'Follow the docket number'],
  ] as const)('draws a limited claim from the two records with the %s layout',
  (criterion, limit, display, follow) => {
    const d = new Driver();
    open(d);
    d.run({ type: 'UseLens', exhibit: model });
    d.talk(curator, 'Turn over the seal', 'Leave the seal on');
    expect(d.s.cards).not.toContain('card.nexus.handling-docket');
    d.talk(curator, 'Turn over the seal', 'Lift the backing', 'Set a card beside the seal');
    expect(d.s.cards).toContain('card.nexus.handling-docket');
    expect(d.e.visibleOptions('dace.seal-found', d.s).find(({ option }) => option.open)?.option.open)
      .toBe(`label:${kit}`);

    const priorCredit = { ...d.p.credit };
    const result = d.run({ type: 'BuildLabel', kit, subject: 'model', criterion, limit });
    const label = result.events.find((event) => event.kind === 'label');
    expect(label?.result.holds).toBe(true);
    expect(label?.result.used).toContain('card.loud-model');
    expect(visible(d).map((prop) => prop.id)).toEqual([display]);
    expect(d.done(objective)).toBe(false);
    d.walk(visible(d)[0].node!, [follow]);
    expect(d.done(objective)).toBe(true);
    expect(d.s.journal).toContain('j.nexus.seal');
    expect(d.p.credit).toEqual(priorCredit);
    expect(d.done('m01.o5.practice')).toBe(false);
    expect(d.done('m01.o6.label')).toBe(false);
  });
});
