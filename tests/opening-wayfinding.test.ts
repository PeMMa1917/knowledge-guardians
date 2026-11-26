import { describe, expect, it } from 'vitest';
import { MAPS } from '../src/maps';
import { check } from '../src/domain/rules';
import { Driver } from './driver';

const signProps = MAPS['nexus.archive'].interactables.filter((prop) => prop.id.startsWith('nexus-guide-'));
const visible = (d: Driver) => signProps.filter((prop) => check(prop.visibleIf, d.s));
const objective = 'nexus.guide.helped';

function scene(d: Driver, id: string, pick: string) {
  const prop = visible(d).find((item) => item.id === id);
  if (!prop?.node) throw new Error(`Cannot reach ${id}`);
  d.walk(prop.node, [pick]);
}

function start(): Driver {
  const d = new Driver();
  d.walk('cold.open');
  scene(d, 'nexus-guide-start', 'Take the arrow');
  return d;
}

describe('The Arrow at the Turn', () => {
  it('is available before recruitment and asks both readers to try the same wording', () => {
    const d = new Driver();
    scene(d, 'nexus-guide-start', 'Leave the arrow');
    expect(d.s.flags['nexus.guide.started']).toBeUndefined();
    expect(d.e.talkEntry('warden-ise', d.s)).toBe('ise.look');
    scene(d, 'nexus-guide-start', 'Take the arrow');
    scene(d, 'nexus-guide-case-trial', 'Hold the same arrow');
    expect(d.s.flags['nexus.guide.door-view']).toBeUndefined();
    expect(d.e.visibleOptions('nexus.guide.mount', d.s).map(({ option }) => option.text))
      .toEqual(['Leave the stand open for now.']);
    scene(d, 'nexus-guide-door-trial', 'Hold the arrow');
    expect(d.e.visibleOptions('nexus.guide.mount', d.s)).toHaveLength(3);
    expect(d.done('m01.o1.look')).toBe(false);
  });

  it.each([
    ['landmark', 'Mount a sketch', 'nexus-guide-landmark', 'Watch both readers',
      ['nexus-guide-landmark']],
    ['sides', 'Set one board', 'nexus-guide-door-board', 'Hold this board facing the doorway',
      ['nexus-guide-door-board', 'nexus-guide-case-board']],
    ['sides', 'Set one board', 'nexus-guide-case-board', 'Hold this board facing the desk',
      ['nexus-guide-door-board', 'nexus-guide-case-board']],
  ] as const)('keeps the %s arrangement available after its readback',
  (layout, chooseLayout, display, readBack, expected) => {
    const d = start();
    scene(d, 'nexus-guide-door-trial', 'Hold the arrow');
    scene(d, 'nexus-guide-case-trial', 'Hold the same arrow');
    const socialBefore = d.p.met.atl.social ?? 0;
    const priorCredit = { ...d.p.credit };
    scene(d, 'nexus-guide-mount', chooseLayout);
    expect(d.s.flags['nexus.guide.layout']).toBe(layout);
    expect(visible(d).map((prop) => prop.id)).toEqual(expected);
    expect(d.done(objective)).toBe(false);
    scene(d, display, readBack);
    expect(d.done(objective)).toBe(true);
    expect(d.s.journal).toContain('j.nexus.guide');
    expect(d.p.met.atl.social).toBe(socialBefore + 1);
    expect(d.p.skills?.['SK-COL-05']).toBeTruthy();
    expect(d.p.credit).toEqual(priorCredit);
    expect(visible(d).map((prop) => prop.id)).toEqual(expected);
    expect(d.e.talkEntry('warden-ise', d.s)).toBe('ise.look');
  });
});
