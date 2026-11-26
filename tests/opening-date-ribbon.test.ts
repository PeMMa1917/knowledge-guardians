import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const props = MAPS['nexus.archive'].interactables.filter((prop) => prop.id.startsWith('nexus-ribbon-'));
const visible = (d: Driver) => props.filter((prop) => check(prop.visibleIf, d.s));

function inspect(d: Driver, id: string) {
  const item = MAPS['nexus.archive'].interactables.find((prop) => prop.id === id);
  if (item?.kind !== 'exhibit' || !item.exhibit) throw new Error(`Cannot inspect ${id}`);
  d.run({ type: 'InspectExhibit', exhibit: item.exhibit });
}

function useRibbon(d: Driver, stage: string, pick: string) {
  const prop = visible(d).find((item) => item.id === `nexus-ribbon-${stage}`);
  if (!prop?.node) throw new Error(`The ribbon is not ${stage}`);
  d.walk(prop.node, [pick]);
}

describe('Between the Marks', () => {
  it('waits for the grant and the object record and leaves the normal opening available', () => {
    const d = new Driver();
    d.walk('cold.open');
    useRibbon(d, 'setup', 'Leave the ribbon');
    inspect(d, 'ex-a');
    inspect(d, 'ex-b');
    expect(d.e.visibleOptions('nexus.ribbon.setup', d.s)).toHaveLength(1);
    inspect(d, 'ex-c');
    expect(d.e.visibleOptions('nexus.ribbon.setup', d.s)).toHaveLength(3);
    expect(d.s.flags['nexus.ribbon.layout']).toBeUndefined();
    expect(d.e.talkEntry('warden-ise', d.s)).toBe('ise.look');
    expect(d.s.inventory['tool.date-lens']).toBeUndefined();
  });

  it.each([
    ['single', 'Set the grant peg', 'Clip the tab', 'marked', 'These cases leave that open'],
    ['split', 'Open the lower rail', 'Hook the comparison bar', 'bridged', 'leaves the start of use blank'],
  ] as const)('keeps the same source dates and a different visitor response on the %s rail',
  (layout, setUp, repair, final, feedback) => {
    const d = new Driver();
    d.walk('cold.open');
    inspect(d, 'ex-c');
    inspect(d, 'ex-a');
    useRibbon(d, 'setup', setUp);
    expect(visible(d).map(({ id }) => id)).toEqual([`nexus-ribbon-${layout}`]);
    const placed = d.e.node(`nexus.ribbon.${layout}-placed`).text;
    expect(placed).toContain('30 October 1888');
    expect(placed).toContain('1945 to 1948');
    expect(d.s.flags['nexus.ribbon.read']).toBeUndefined();
    expect(d.done('nexus.ribbon.checked')).toBe(false);
    useRibbon(d, layout, repair);
    expect(visible(d).map(({ art }) => art)).toEqual([`nexus.ribbon-${final}`]);
    expect(d.e.node(`nexus.ribbon.${final}`).text).toContain(feedback);
    expect(d.done('nexus.ribbon.checked')).toBe(true);
    expect(d.s.flags['nexus.ribbon.read']).toBe(true);
    expect(d.s.journal).toContain('j.nexus.ribbon');
    expect(d.p.skills?.['SK-RSC-15']).toHaveLength(1);
    expect(d.p.moments['mom.nexus.ribbon']).toBeTruthy();
    expect(d.e.talkEntry('warden-ise', d.s)).toBe('ise.look');
  });
});
