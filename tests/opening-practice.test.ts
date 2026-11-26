import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const map = MAPS['nexus.archive'];
const objective = 'nexus.stroke.compared';
const layouts = ['nexus-stroke-ledger', 'nexus-stroke-carrier'];

function object(d: Driver, id: string) {
  const prop = map.interactables.find((candidate) => candidate.id === id);
  if (!prop || !check(prop.visibleIf, d.s)) throw new Error(`Cannot use ${id}`);
  return prop;
}

function scene(d: Driver, id: string, choice: string): void {
  const prop = object(d, id);
  if (prop.kind !== 'scene' || !prop.node) throw new Error(`${id} is not a scene`);
  d.walk(prop.node, [choice]);
}

function recruit(): Driver {
  const d = new Driver();
  d.run({ type: 'SetFlag', flag: 'read.oldlabel', value: true });
  d.talk('warden-ise', 'How can all three');
  return d;
}

function mark(d: Driver, pen: string, surface: string): number {
  const result = d.run({ type: 'RunSimulation', pen, surface });
  const strip = result.events.find((event) => event.kind === 'simulation');
  if (!strip) throw new Error('Missing strip');
  return strip.result.markQuality;
}

function visible(d: Driver, ids: string[]) {
  return map.interactables.filter((prop) => ids.includes(prop.id) && check(prop.visibleIf, d.s)).map((prop) => prop.id);
}

describe('The Same Stroke', () => {
  it('offers the side comparison with the first bench, without a new main step', () => {
    const newRecruit = new Driver();
    expect(() => object(newRecruit, 'nexus-stroke-brief')).toThrow('Cannot use');
    const d = recruit();
    const main = d.e.currentObjective(d.s)?.id;
    scene(d, 'nexus-stroke-brief', 'Leave the two scraps');
    expect(d.s.flags['nexus.stroke.requested']).toBeUndefined();
    expect(d.e.currentObjective(d.s)?.id).toBe(main);
    scene(d, 'nexus-stroke-brief', 'Set four clips');
    mark(d, 'loud-model', 'paper');
    mark(d, 'biro-type', 'paper');
    mark(d, 'biro-type', 'wood');
    expect(d.done('m01.o4.test')).toBe(true);
    expect(d.e.visibleOptions(object(d, 'nexus-stroke-layout').node!, d.s).map(({ option }) => option.text))
      .toEqual(['Leave the stand for now.']);
    expect(visible(d, layouts)).toEqual([]);
  });

  it.each([
    ['ledger', 'Set the paper pair', 'Lift the wood clips'],
    ['carrier', 'Put the wood pair first', 'Turn the card'],
  ] as const)('keeps both surface results in the %s display',
  (edition, publish, openOther) => {
    const d = recruit();
    scene(d, 'nexus-stroke-brief', 'Set four clips');
    const paperLoud = mark(d, 'loud-model', 'paper');
    const paperBiro = mark(d, 'biro-type', 'paper');
    const woodBiro = mark(d, 'biro-type', 'wood');
    const woodLoud = mark(d, 'loud-model', 'wood');
    expect(paperLoud).toBeLessThan(paperBiro);
    expect(woodLoud).toBeGreaterThan(woodBiro);

    const priorCredit = { ...d.p.credit };
    const priorConcepts = d.p.met.concepts;
    scene(d, 'nexus-stroke-layout', publish);
    expect(visible(d, layouts)).toEqual([`nexus-stroke-${edition}`]);
    expect(d.done(objective)).toBe(false);
    scene(d, `nexus-stroke-${edition}`, openOther);
    expect(d.done(objective)).toBe(true);
    expect(d.s.journal).toContain('j.nexus.stroke');
    expect(d.p.met.concepts.culture).toBe((priorConcepts.culture ?? 0) + 1);
    expect(d.p.met.concepts.explanation).toBe((priorConcepts.explanation ?? 0) + 1);
    expect(d.p.credit).toEqual(priorCredit);
    expect(d.done('m01.o6.label')).toBe(false);
    expect(d.s.flags['nexus.ferry.started']).toBeUndefined();
  });
});
