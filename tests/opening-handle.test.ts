import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const props = MAPS['nexus.archive'].interactables.filter((prop) => prop.id.startsWith('nexus-handle-'));
const visible = (d: Driver) => props.filter((prop) => check(prop.visibleIf, d.s));
const objective = 'nexus.handle.checked';

function use(d: Driver, stage: string, pick?: string) {
  const prop = visible(d).find((item) => item.id === `nexus-handle-${stage}`);
  if (!prop?.node) throw new Error(`Cannot reach the ${stage} case`);
  d.walk(prop.node, pick ? [pick] : []);
}

function start(): Driver {
  const d = new Driver();
  d.walk('cold.open');
  return d;
}

describe('A Second Handle', () => {
  it('lets Kip set the case down, gives a different return, and leaves the original opening available', () => {
    const d = start();
    expect(visible(d).map((prop) => prop.id)).toEqual(['nexus-handle-case']);
    use(d, 'case', 'give him a little time');
    expect(d.s.flags['nexus.handle.method']).toBeUndefined();
    expect(visible(d).map((prop) => prop.id)).toEqual(['nexus-handle-resting']);
    expect(d.e.node('nexus.handle.wait').text).toContain("she'd hold my place");
    expect(d.done(objective)).toBe(false);
    expect(d.e.talkEntry('warden-ise', d.s)).toBe('ise.look');
    expect(d.e.talkEntry('kip-arden', d.s)).toBe('kip.start');
    use(d, 'resting', 'Brace the case');
    expect(visible(d).map((prop) => prop.id)).toEqual(['nexus-handle-mended-bench']);
  });

  it.each([
    ['paired', 'Tie two cord loops', 'Call the count', 'Can we show them?', 'just asked if they wanted a hand'],
    ['mended', 'Brace the case', 'Lift the loaded case', 'what weight you tried', 'when to tell'],
  ] as const)('keeps the %s case on the workshop mat and changes what Kip recalls in Emberford',
  (method, choose, checkLoad, outcome, recall) => {
    const d = start();
    const credit = { ...d.p.credit };
    const memories = d.e.pack.memories!.filter((line) => line.id.startsWith('kip.handle.'));
    use(d, 'case', choose);
    expect(visible(d).map((prop) => [prop.id, prop.x, prop.y])).toEqual([[`nexus-handle-${method}-bench`, 16, 16]]);
    expect(d.done(objective)).toBe(false);
    expect(memories.some((line) => check(line.if, d.s))).toBe(false);
    use(d, `${method}-bench`, checkLoad);
    expect(visible(d).map((prop) => prop.art)).toEqual([`nexus.handle-${method}-ready`]);
    expect(d.e.node(`nexus.handle.${method}-case`).text).toContain(outcome);
    expect(d.done(objective)).toBe(true);
    expect(d.s.journal).toContain('j.nexus.handle');
    expect(d.p.moments['mom.nexus.handle']).toBeTruthy();
    expect(d.e.talkEntry('warden-ise', d.s)).toBe('ise.look');
    expect(d.p.credit).toEqual(credit);
    expect(memories.some((line) => check(line.if, d.s))).toBe(false);
    use(d, `${method}-case`);
    const inEmberford = { ...d.s, objectivesDone: [...d.s.objectivesDone, 'm02.o1.arrive'] };
    const heard = memories.filter((line) => check(line.if, inEmberford));
    expect(heard.map((line) => line.id)).toEqual([`kip.handle.${method}`]);
    expect(heard[0].line).toContain(recall);
    expect(d.p.skills?.['SK-COL-05']).toHaveLength(1);
  });
});
