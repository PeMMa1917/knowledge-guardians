import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const minute = 'item.bench-debate-minute';

function visible(d: Driver, id: string) {
  const prop = MAPS[d.s.mapId].interactables.find((item) => item.id === id);
  return prop && check(prop.visibleIf, d.s) ? prop : undefined;
}

function scene(d: Driver, id: string, action?: string) {
  const prop = visible(d, `bench-debate-${id}`);
  if (!prop?.node) throw new Error(`Cannot use ${id} in ${d.s.mapId}`);
  d.walk(prop.node, action ? [action] : []);
}

function cross(d: Driver, id: string) {
  const prop = visible(d, id);
  if (prop?.kind !== 'door' || !prop.to || !check(prop.openIf, d.s)) throw new Error(`Cannot cross ${id}`);
  d.s.mapId = prop.to.map;
  if (prop.flag) d.run({ type: 'SetFlag', flag: prop.flag, value: true });
}

function collect(d: Driver) {
  d.resumeAfter('forest.finish');
  cross(d, 'metalworks-door');
  cross(d, 'metal-records-path');
  expect(visible(d, 'bench-debate-entry')).toBeUndefined();
  d.resumeAfter('metal.finish');
  cross(d, 'bench-debate-entry');
  scene(d, 'open', 'Set the two requests');
  scene(d, 'repair-record', 'Slide out the second line');
  scene(d, 'trial', 'Keep the same fitting');
  scene(d, 'trial', 'Clear the bench');
  expect(visible(d, 'bench-debate-first')).toBeUndefined();
  scene(d, 'arrival', 'Line up the two return slips');
  expect(d.done('bench.debate.compare')).toBe(true);
}

function civic(d: Driver, choice: 'whole' | 'split') {
  cross(d, 'bench-debate-return');
  cross(d, 'metal-yard-return');
  cross(d, 'metal-nexus-return');
  d.resumeAfter('water.finish');
  cross(d, 'civic-door');
  cross(d, 'civic-steps-path');
  expect(visible(d, `bench-debate-civic-fit-${choice}`)).toBeUndefined();
  scene(d, 'civic-test', choice === 'whole' ? 'Lay the revised job line' : 'Lay the named bells');
  expect(d.s.flags['bench.debate.civic.wording']).toBe(choice === 'whole' ? 'jobs' : 'times');
  expect(d.done('bench.debate.civic.proof')).toBe(true);
  const prop = visible(d, `bench-debate-civic-fit-${choice}`);
  expect([prop?.x, prop?.y]).toEqual(choice === 'whole' ? [9, 10] : [23, 13]);
  expect(visible(d, `bench-debate-civic-fit-${choice === 'whole' ? 'split' : 'whole'}`)).toBeUndefined();
  scene(d, `civic-fit-${choice}`, choice === 'whole' ? 'Set one long reservation' : 'Put a visitor at each short mark');
  expect(d.done('bench.debate.civic.used')).toBe(false);
  scene(d, `civic-read-${choice}`, choice === 'whole' ? 'Turn the full reservation card' : 'Read back the two status-copy jobs');
  expect(d.done('bench.debate.civic.used')).toBe(true);
  expect(d.s.journal).toContain('j.bench.debate.civic');
  expect(d.done('civic.finish')).toBe(false);
  cross(d, 'civic-steps-return');
  cross(d, 'civic-steps-path');
  expect(visible(d, `bench-debate-civic-kept-${choice}`)?.art).toBe(`bench-debate.minute-${choice}`);
}

describe('The Second Turn', () => {
  it.each(['whole', 'split'] as const)('hears the opposing case and revises in response to a listener before carrying the %s minute', (choice) => {
    const d = new Driver();
    const credit = { ...d.p.credit };
    collect(d);
    expect(visible(d, 'bench-debate-other')).toBeUndefined();
    scene(d, 'first', choice === 'whole' ? 'Put the two short turns' : 'Put the continuous-job strip');
    expect(visible(d, 'bench-debate-draft')).toBeUndefined();
    expect(visible(d, 'bench-debate-listeners')).toBeUndefined();
    const second = d.e.visibleOptions('bench.debate.other', d.s).flatMap(({ option }) => option.next ?? []);
    expect(second).toEqual(choice === 'whole'
      ? ['bench.debate.other.whole.record', 'bench.debate.other.whole.model']
      : ['bench.debate.other.split.slips', 'bench.debate.other.split.voice']);
    scene(d, 'other', choice === 'whole' ? 'Hold the model' : 'Use Ressa’s approved words');
    expect(d.s.flags['bench.debate.opposition']).toBe(choice === 'whole' ? 'model' : 'voice');
    expect(d.done('bench.debate.exchange')).toBe(false);
    scene(d, 'listeners', choice === 'whole' ? 'Give Bea the draft' : 'Let Ressa say back');
    expect(d.done('bench.debate.exchange')).toBe(true);
    const drafting = d.e.visibleOptions('bench.debate.draft', d.s).flatMap(({ option }) => option.next ?? []);
    expect(drafting).toEqual(choice === 'whole'
      ? ['bench.debate.written.whole.jobs', 'bench.debate.written.split.jobs']
      : ['bench.debate.written.whole.times', 'bench.debate.written.split.times']);
    if (choice === 'split') {
      scene(d, 'draft', 'Write ‘the fitting has the first and second bells’');
      scene(d, 'sign-whole', 'Take the unsigned minute back');
      expect(d.s.inventory[minute]).toBeUndefined();
      expect(visible(d, 'bench-debate-draft')).toBeDefined();
      expect(d.s.flags['bench.debate.listener']).toBe('times');
    }
    scene(d, 'draft', choice === 'whole' ? 'Write ‘one fitting across two bells’' : 'Write ‘one short turn at the first bell');
    expect(d.s.inventory[minute]).toBeUndefined();
    scene(d, `sign-${choice}`, 'Ask both speakers to sign');
    expect(d.s.inventory[minute]).toBe(1);
    expect(d.done('bench.debate.minute')).toBe(true);
    scene(d, `kept-${choice}`);
    expect(d.s.inventory[minute]).toBe(1);
    civic(d, choice);
    expect(d.p.credit).toEqual(credit);
  });
});
