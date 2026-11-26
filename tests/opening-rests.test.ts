import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const props = MAPS['nexus.archive'].interactables.filter((prop) => prop.id.startsWith('nexus-rest-'));
const visible = (d: Driver) => props.filter((prop) => check(prop.visibleIf, d.s));
const objective = 'nexus.rest.checked';

function use(d: Driver, id: string, pick: string) {
  const prop = visible(d).find((item) => item.id === `nexus-rest-${id}`);
  if (!prop?.node) throw new Error(`Cannot reach ${id}`);
  d.walk(prop.node, [pick]);
}

function start(): Driver {
  const d = new Driver();
  d.walk('cold.open');
  return d;
}

function expectReadback(d: Driver) {
  expect(d.s.flags['nexus.rest.used']).toBe(true);
  expect(d.done(objective)).toBe(true);
  expect(d.s.journal).toContain('j.nexus.rest');
  expect(d.p.skills?.['SK-ETR-01']).toBeTruthy();
  expect(d.p.skills?.['SK-NUM-14']).toBeTruthy();
  expect(d.p.moments['mom.nexus.rest']).toBeTruthy();
  expect(d.s.flags['read.oldlabel']).toBeUndefined();
  expect(d.e.talkEntry('warden-ise', d.s)).toBe('ise.look');
}

describe('The Uncounted Reader', () => {
  it('lets a new arrival compare the loan record and the waiting requests in either order', () => {
    const d = start();
    expect(visible(d).map((prop) => prop.id)).toEqual(['nexus-rest-counter', 'nexus-rest-request']);
    use(d, 'request', 'Clip the two requests');
    expect(d.s.flags['nexus.rest.waiting']).toBe(true);
    expect(visible(d).some((prop) => prop.id === 'nexus-rest-bench')).toBe(false);
    use(d, 'counter', 'Slide the used counters');
    expect(visible(d).some((prop) => prop.id === 'nexus-rest-bench')).toBe(true);
    use(d, 'bench', 'Set the rests back down');
    expect(d.s.flags['nexus.rest.layout']).toBeUndefined();
    expect(d.done(objective)).toBe(false);
    expect(d.e.talkEntry('warden-ise', d.s)).toBe('ise.look');
  });

  it('helps the pair at the low table and keeps the borrower’s unmet request', () => {
    const d = start();
    use(d, 'counter', 'Slide the used counters');
    expect(visible(d).some((prop) => prop.id === 'nexus-rest-bench')).toBe(false);
    use(d, 'request', 'Clip the two requests');
    use(d, 'bench', 'Carry both rests');
    expect(d.s.flags['nexus.rest.layout']).toBe('together');
    expect(visible(d).map((prop) => prop.id)).toEqual([
      'nexus-rest-counter', 'nexus-rest-request', 'nexus-rest-pair-slot',
    ]);
    use(d, 'pair-slot', 'Set both rests');
    expect(d.s.flags['nexus.rest.used']).toBeUndefined();
    expect(visible(d).find((prop) => prop.id === 'nexus-rest-pair-ready')?.art).toBe('nexus.reading-rests');
    use(d, 'pair-ready', 'Clip the request beside the loan total');
    expectReadback(d);
    expect(d.e.visibleOptions('nexus.rest.pair-ready', d.s)).toHaveLength(1);
  });

  it.each([
    [['mobile-slot', 'Hang the portable rest'], ['fixed-slot', 'Set the fixed rest']],
    [['fixed-slot', 'Set the fixed rest'], ['mobile-slot', 'Hang the portable rest']],
  ] as const)('puts the fixed and portable rests in use in either order (%s first)', (first, second) => {
    const d = start();
    use(d, 'counter', 'Slide the used counters');
    use(d, 'request', 'Clip the two requests');
    use(d, 'bench', 'Carry one to the low table');
    expect(d.s.flags['nexus.rest.layout']).toBe('circulate');
    use(d, first[0], first[1]);
    expect(d.e.visibleOptions('nexus.rest.mobile-ready', d.s)).toHaveLength(1);
    expect(d.s.flags['nexus.rest.used']).toBeUndefined();
    use(d, second[0], second[1]);
    expect(visible(d).filter((prop) => prop.art === 'nexus.reading-rest').map((prop) => [prop.x, prop.y]))
      .toEqual([[24, 11], [19, 10]]);
    expect(d.s.flags['nexus.rest.used']).toBeUndefined();
    use(d, 'mobile-ready', 'Clip the table’s remaining request');
    expectReadback(d);
    expect(d.e.visibleOptions('nexus.rest.mobile-ready', d.s)).toHaveLength(1);
  });
});
