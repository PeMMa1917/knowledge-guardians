import { describe, expect, it } from 'vitest';
import { diaryQuestions } from '../src/domain/diaryReflection';
import { check } from '../src/domain/rules';
import { migrateCampaign } from '../src/domain/saves';
import { EMBERFORD } from '../src/maps/emberford';
import { Driver } from './driver';

const board = 'emberford.repair-notice';
const quest = 'bridge.message';
const cases = [
  { medium: 'sketch', post: 'Hang a sketch', check: 'Unfold', action: 'Reverse the fold', outcome: 'hinge', visible: 'under her thumb' },
  { medium: 'sketch', post: 'Hang a sketch', check: 'Unfold', action: 'wide drawing', outcome: 'runner', visible: 'black dot' },
  { medium: 'direction', post: 'Hang the direction', check: 'Walk the direction back', action: 'Call from the cart', outcome: 'reply', visible: 'hand raised' },
  { medium: 'direction', post: 'Hang the direction', check: 'Walk the direction back', action: 'Walk a driver', outcome: 'pair', visible: 'porter’s coat' },
];

function useBoard(d: Driver, ...choices: string[]) {
  const props = EMBERFORD.interactables.filter(p => p.id.startsWith(board) && check(p.visibleIf, d.s));
  expect(props).toHaveLength(1);
  d.walk(props[0].node!, choices);
}

function resume(d: Driver) {
  d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
}

describe('The Cart That Came Back', () => {
  it.each(cases)('carries the $medium through the $outcome arrangement to another crew', run => {
    const d = new Driver();
    d.s.mapId = EMBERFORD.id;
    useBoard(d, 'Leave it for now');
    expect(d.done(quest + '.posted')).toBe(false);
    useBoard(d, run.post);
    expect(d.done(quest + '.posted')).toBe(true);
    expect(d.done(quest + '.checked')).toBe(false);
    useBoard(d, run.check);
    expect(d.p.skills['SK-MICRO-0921']).toEqual([expect.stringContaining(quest + '.checked')]);
    expect(d.s.flags[quest + '.arrangement']).toBeUndefined();
    resume(d);
    useBoard(d, run.check, run.action);
    expect(d.s.flags[quest + '.arrangement']).toBe(run.outcome);
    expect(d.done(quest + '.returned')).toBe(false);
    useBoard(d, 'See what the next crew', 'Let them pass');
    expect(d.done(quest + '.returned')).toBe(false);
    resume(d);
    useBoard(d, 'See what the next crew', 'Stay for the crossing');
    expect(d.s.flags[quest + '.received']).toBe(run.outcome);
    expect(d.done(quest + '.returned')).toBe(true);
    expect(d.e.node(quest + '.seen.' + run.outcome).text).toContain(run.visible);
    expect(d.s.adventureDiary?.entries.some(entry => entry.event?.key === 'quest:' + quest + '.returned')).toBe(true);
    const memory = d.s.adventureDiary.entries.find(entry => entry.id === 'record:j.bridge.message.' + run.outcome);
    expect(memory?.text).toMatch(/^I /);
    expect(Object.keys(diaryQuestions(memory!))).toEqual(['crew-' + run.outcome]);
  });

  it('can reopen a legacy notice, change media and keep the first observed crossing', () => {
    const d = new Driver();
    d.s.mapId = EMBERFORD.id;
    d.s.flags[board] = 'direction';
    resume(d);
    useBoard(d, 'Walk the direction back', 'Call from the cart');
    useBoard(d, 'See what the next crew', 'Stay for the crossing');
    const credit = { ...d.p.credit };
    useBoard(d, 'Try sending a folded sketch');
    expect(d.s.flags[board]).toBe('sketch');
    expect(d.s.flags[quest + '.arrangement']).toBe(false);
    expect(d.e.visibleOptions(board + '.sketch', d.s).map(o => o.option.text)).not.toContain('See what the next crew actually does.');
    resume(d);
    useBoard(d, 'Unfold', 'wide drawing');
    useBoard(d, 'See what the next crew', 'Stay for the crossing');
    expect(d.s.flags[quest + '.received']).toBe('runner');
    expect(d.p.credit).toEqual(credit);
    expect(d.events.filter(e => e.kind === 'objective' && e.id === quest + '.returned')).toHaveLength(1);
  });
});
