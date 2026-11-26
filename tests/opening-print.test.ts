import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const props = MAPS['nexus.archive'].interactables.filter((prop) => prop.id.startsWith('nexus-print-'));
const visible = (d: Driver) => props.filter((prop) => check(prop.visibleIf, d.s));
const objective = 'nexus.print.checked';

function use(d: Driver, stage: string, pick?: string) {
  const prop = visible(d).find((item) => item.id === `nexus-print-${stage}`);
  if (!prop?.node) throw new Error(`The print is not ${stage}`);
  d.walk(prop.node, pick ? [pick] : []);
}

function start(): Driver {
  const d = new Driver();
  d.walk('cold.open');
  return d;
}

describe('The Slipped Print', () => {
  it('lets a new arrival put down the proofs without advancing the main story', () => {
    const d = start();
    use(d, 'setup', 'Leave the sheets');
    expect(visible(d).map((prop) => prop.id)).toEqual(['nexus-print-setup']);
    expect(d.s.flags['nexus.print.fit']).toBeUndefined();
    expect(d.e.talkEntry('warden-ise', d.s)).toBe('ise.look');
  });

  it('shows the offset trial and lets a player recover without losing anything', () => {
    const d = start();
    use(d, 'setup', 'Square the sheets');
    expect(visible(d).map((prop) => prop.art)).toEqual(['nexus.print-edge']);
    expect(d.e.node('nexus.print.edge').text).toContain('sits out in the river');
    expect(d.e.visibleOptions('nexus.print.pinned', d.s)).toHaveLength(1);
    expect(d.done(objective)).toBe(false);
    use(d, 'edge', 'Lift the overlay');
    expect(visible(d).map((prop) => prop.art)).toEqual(['nexus.print-pinned']);
    expect(d.s.flags['nexus.print.tried-edge']).toBe(true);
    expect(d.e.node('nexus.print.pinned').text).toContain('now meet the ends of the drawn jetties');
    use(d, 'pinned', 'Clip a joined proof');
    expect(d.p.moments['mom.nexus.print']).toBeTruthy();
    expect(d.done(objective)).toBe(true);
  });

  it.each([
    ['joined', 'Clip a joined proof', 'At a glance'],
    ['layers', 'Slide the sheets', 'fit both back onto the pins'],
  ] as const)('keeps the %s edition and credits the same skills when starting at the pins', (edition, publish, consequence) => {
    const d = start();
    const credit = { ...d.p.credit };
    use(d, 'setup', 'Lay both sheets');
    expect(d.s.flags['nexus.print.tried-edge']).toBeUndefined();
    expect(d.s.flags['nexus.print.fit']).toBe('pins');
    expect(d.done(objective)).toBe(false);
    use(d, 'pinned', publish);
    expect(d.s.flags['nexus.print.edition']).toBe(edition);
    expect(visible(d).map((prop) => prop.art)).toEqual([`nexus.print-${edition}`]);
    expect(d.e.node(`nexus.print.${edition}`).text).toContain(consequence);
    use(d, edition);
    expect(d.done(objective)).toBe(true);
    expect(d.s.journal).toContain('j.nexus.print');
    expect(d.p.skills?.['SK-THK-14']).toHaveLength(1);
    expect(d.p.credit).toEqual(credit);
    expect(d.e.talkEntry('warden-ise', d.s)).toBe('ise.look');
  });
});
