import { describe, expect, it } from 'vitest';
import { MAPS } from '../src/maps';
import { check } from '../src/domain/rules';
import { Driver } from './driver';

const displays = MAPS['nexus.archive'].interactables.filter((prop) => prop.id.startsWith('nexus-arrival-'));
const visible = (d: Driver) => displays.filter((prop) => check(prop.visibleIf, d.s));

describe('A Page Left Open', () => {
  it('continues into the normal room when the recruit simply walks on', () => {
    const d = new Driver();
    d.walk('cold.open');
    expect(d.s.flags['node.cold.open3']).toBe(true);
    expect(visible(d)).toEqual([]);
    expect(d.e.talkEntry('warden-ise', d.s)).toBe('ise.look');
  });

  it.each([
    ['view', 'Clip a blank page', 'Open the page for a second view'],
    ['reference', 'Copy the stand number', 'Find the exact stand on the plan'],
  ] as const)('leaves the %s note in the room as soon as the scene ends', (branch, pick, use) => {
    const d = new Driver();
    d.walk('cold.open', [pick]);
    expect(d.s.flags['node.cold.open3']).toBe(true);
    expect(visible(d).map((prop) => prop.id)).toEqual([`nexus-arrival-${branch}`]);
    expect(d.done('nexus.arrival.checked')).toBe(false);
    d.walk(visible(d)[0].node!, [use]);
    expect(d.done('nexus.arrival.checked')).toBe(true);
    expect(d.s.journal).toContain('j.nexus.arrival');
    expect(d.s.flags['read.oldlabel']).toBeUndefined();
    expect(d.e.talkEntry('warden-ise', d.s)).toBe('ise.look');
    d.run({ type: 'SetFlag', flag: 'read.oldlabel', value: true });
    d.talk('warden-ise', 'How can all three');
    expect(d.done('m01.o1.look')).toBe(true);
  });
});
