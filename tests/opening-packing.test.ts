import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const props = MAPS['nexus.archive'].interactables.filter((prop) => prop.id.startsWith('nexus-pack-'));
const visible = (d: Driver) => props.filter((prop) => check(prop.visibleIf, d.s));
const objective = 'nexus.pack.checked';
const trial = 'Pass one wallet through the gate';

function use(d: Driver, stage: string, pick?: string) {
  const prop = visible(d).find((item) => item.id === `nexus-pack-${stage}`);
  if (!prop?.node) throw new Error(`Cannot reach the ${stage} packing prop`);
  d.walk(prop.node, pick ? [pick] : []);
}

function start(): Driver {
  const d = new Driver();
  d.walk('cold.open');
  return d;
}

describe('The Packing Table', () => {
  it('keeps all eight sheets when a recruit reopens and tries another packing order', () => {
    const d = start();
    use(d, 'prep', 'Leave the packing table');
    expect(d.s.flags['nexus.pack.layout']).toBeUndefined();
    expect(d.e.talkEntry('warden-ise', d.s)).toBe('ise.look');
    use(d, 'prep', 'Put three sketches');
    expect(visible(d).map((prop) => prop.id)).toEqual(['nexus-pack-kits']);
    expect(d.e.visibleOptions('nexus.pack.ready', d.s)).toHaveLength(1);
    use(d, 'kits', trial);
    expect(d.e.node('nexus.pack.kits-tested').text).toContain('Three sketches and a slip come out together');
    use(d, 'ready-kits', 'Open the wallets');
    expect(d.e.node('nexus.pack.reopened').text).toContain('Six sketches and two red slips');
    expect(visible(d).map((prop) => prop.id)).toEqual(['nexus-pack-prep']);
    use(d, 'prep', 'Seal two wallets');
    expect(visible(d).map((prop) => prop.id)).toEqual(['nexus-pack-outer']);
    expect(d.s.flags['nexus.pack.tried']).toBe(false);
    use(d, 'outer', trial);
    expect(d.e.node('nexus.pack.outer-tested').text).toContain('Both red slips are still at the rack');
    expect(d.done(objective)).toBe(false);
  });

  it.each([
    ['kits', 'route', 'Put three sketches', 'Stamp the groups', '2 × (3 + 1)', 'straight to the shelter'],
    ['outer', 'route', 'Seal two wallets', 'Stamp the groups', '(2 × 3) + 2', 'collects a red slip'],
    ['kits', 'tally', 'Put three sketches', 'Tally the sketches', 'Watch what she can check', 'leaves the inner slip check'],
    ['outer', 'tally', 'Seal two wallets', 'Tally the sketches', 'Watch what she can check', 'touches each red slip'],
  ] as const)('tests %s packed for the %s reader', (layout, tag, pack, write, read, feedback) => {
    const d = start();
    const credit = { ...d.p.credit };
    use(d, 'prep', pack);
    expect(visible(d).map((prop) => prop.art)).toEqual([`nexus.pack-${layout}`]);
    use(d, layout, trial);
    expect(visible(d).map((prop) => prop.art)).toEqual([`nexus.pack-tested-${layout}`]);
    use(d, `ready-${layout}`, write);
    expect(visible(d).map((prop) => prop.id)).toEqual([`nexus-pack-dock-${tag}`]);
    expect(d.s.flags['nexus.pack.sent']).toBeUndefined();
    expect(d.done(objective)).toBe(false);
    use(d, `dock-${tag}`, read);
    expect(d.s.flags['nexus.pack.sent']).toBe(`${layout}-${tag}`);
    expect(visible(d).map((prop) => prop.id)).toEqual([`nexus-pack-${layout}-${tag}`]);
    expect(d.e.node(`nexus.pack.${layout}-${tag}`).text).toContain(feedback);
    expect(d.s.journal).toContain('j.nexus.pack');
    expect(d.p.moments['mom.nexus.pack']).toBeTruthy();
    expect(d.done(objective)).toBe(true);
    expect(d.e.talkEntry('warden-ise', d.s)).toBe('ise.look');
    use(d, `${layout}-${tag}`);
    expect(d.p.skills?.['SK-THK-05']).toHaveLength(1);
    expect(d.p.credit).toEqual(credit);
  });
});
