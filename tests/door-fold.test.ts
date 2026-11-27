import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const nexus = 'nexus.archive';
const emberford = 'aethelgard.emberford';

function use(d: Driver, map: string, id: string, choice?: string) {
  const prop = MAPS[map].interactables.find((item) => item.id === id && check(item.visibleIf, d.s));
  if (!prop) throw new Error(`Cannot use ${id}`);
  if (prop.exhibit) d.run({ type: 'InspectExhibit', exhibit: prop.exhibit });
  else d.walk(prop.node!, choice ? [choice] : []);
}

describe('At the Door Before the Bell', () => {
  it('keeps each book attached to a distinct source and its own limit', () => {
    const d = new Driver();
    const century = d.e.pack.exhibits.find(({ id }) => id === 'OBJ-DOOR-01')!;
    const travel = d.e.pack.exhibits.find(({ id }) => id === 'OBJ-DOOR-02')!;
    expect(century.sources).toEqual(['HIS-DOOR-01']);
    expect(travel.sources).toEqual(['HIS-DOOR-02', 'HIS-DOOR-03']);
    expect(century.summary).toContain('Elbridge S. Brooks');
    expect(century.summary).toContain('published by the Century Company');
    expect(century.specimen).toBeUndefined();
    expect(travel.specimen?.people).toMatchObject([
      { name: 'Victor Hugo Green', role: 'Publisher of this edition', source: 'HIS-DOOR-02' },
      { name: 'James A. Jackson', role: 'Named on this copy’s cover', source: 'HIS-DOOR-02' },
    ]);
    expect(d.e.pack.cards.find(({ id }) => id === century.grantsCard)?.limits).toContain('other people');
    expect(d.e.pack.cards.find(({ id }) => id === travel.grantsCard)?.limits).toContain('arrived');
  });

  it.each([
    ['front', 'Bring the landmark', 'front', 'Ask Iven to call'],
    ['side', 'Put the landmark', 'yard', 'Put Yara'],
  ])('checks the %s layout, then serves a different crew at %s', (nexusApproach, arrange, emberApproach, handover) => {
    const d = new Driver();
    expect(() => use(d, nexus, 'nexus-fold-porch')).toThrow();
    d.s.objectivesDone.push('m01.o6.label');
    use(d, nexus, 'nexus-fold-century');
    use(d, nexus, 'nexus-fold-green');
    use(d, nexus, 'nexus-fold-porch');
    expect(() => use(d, nexus, 'nexus-fold-move')).toThrow();
    use(d, nexus, 'nexus-fold-receipt');
    use(d, nexus, 'nexus-fold-move', arrange);
    expect(d.s.inventory['item.door-fold']).toBeUndefined();
    use(d, nexus, `nexus-fold-${nexusApproach}`);
    expect(d.s.inventory['item.door-fold']).toBe(1);
    expect(d.p.awards['award.door-fold']).toBeDefined();
    expect(d.p.stones['KQ-ROUTE-02']).toEqual(['WORLD-01|giving']);
    expect(() => use(d, emberford, 'ember-fold-station')).toThrow();
    d.s.objectivesDone.push('m02.o1.arrive');
    use(d, emberford, 'ember-fold-station', handover);
    expect(d.done('fold.ember.finish')).toBe(false);
    use(d, emberford, `ember-fold-${emberApproach}`);
    expect(d.done('fold.ember.finish')).toBe(true);
    expect(d.s.flags['fold.ember.checked']).toBe(emberApproach);
    expect(d.s.journal).toContain('j.fold.ember');
    expect(d.p.credit).toEqual({});
  });
});
