import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import {
  CALL_LINES, hasDifferentProofs, layoutBit, readLayout, servesCalls, shiftCallLine, tryCallProof, tryCallReissue,
} from '../src/domain/twoCalls';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const minute = 'item.bench-debate-minute';
const prefix = 'copies.twocalls.';
const first = CALL_LINES;
const late = ['returns', 'trial', 'entry'] as const;

function visible(d: Driver, id: string) {
  const entry = MAPS[d.s.mapId].interactables.find((prop) => prop.id === id);
  return entry && check(entry.visibleIf, d.s) ? entry : undefined;
}

function use(d: Driver, id: string, action: string) {
  const prop = visible(d, id);
  expect(prop?.node, id).toBeDefined();
  d.walk(prop!.node!, [action]);
}

function cross(d: Driver, id: string) {
  const door = visible(d, id);
  expect(door?.to, id).toBeDefined();
  expect(check(door?.openIf, d.s)).toBe(true);
  d.s.mapId = door!.to!.map;
  if (door?.flag) d.run({ type: 'SetFlag', flag: door.flag, value: true });
}

function earnMinute(d: Driver) {
  d.s.objectivesDone.push('forest.finish', 'metal.finish');
  cross(d, 'metalworks-door');
  cross(d, 'metal-records-path');
  cross(d, 'bench-debate-entry');
  const tasks = [
    ['open', 'Set the two requests'], ['repair-record', 'Slide out the second line'],
    ['trial', 'Keep the same fitting'], ['trial', 'Clear the bench'], ['arrival', 'Line up the two return slips'],
    ['first', 'Put the two short turns'], ['other', 'Hold the model'], ['listeners', 'Give Bea the draft'],
    ['draft', 'Write ‘one fitting across two bells’'], ['sign-whole', 'Ask both speakers to sign'],
  ];
  for (const [name, action] of tasks) use(d, 'bench-debate-' + name, action);
  expect(d.s.inventory[minute]).toBe(1);
  cross(d, 'bench-debate-return');
  cross(d, 'metal-yard-return');
  cross(d, 'metal-nexus-return');
}

describe('Two Calls After Tuesday proof board', () => {
  it('records different layouts, separate receiver budgets and a first arrangement that fails after routes cross', () => {
    const other = shiftCallLine(first, 0, 1);
    const bits = layoutBit(first) | layoutBit(other);
    expect(hasDifferentProofs(layoutBit(first))).toBe(false);
    expect(hasDifferentProofs(bits)).toBe(true);
    expect(layoutBit([])).toBe(0);
    expect(readLayout(late.join(','))).toEqual(late);
    expect(tryCallProof(first, 'first')).toEqual({ newcomer: true, returner: true, researcher: true });
    expect(tryCallProof(other, 'first')).toEqual({ newcomer: false, returner: true, researcher: true });
    expect(tryCallProof(first, 'late')).toEqual({ newcomer: false, returner: false, researcher: true });
    expect(servesCalls(tryCallProof(late, 'late'))).toBe(true);
  });

  it('keeps the source trace in both repairs and reveals different costs in another approach', () => {
    const paired = tryCallReissue(late, 'paired');
    const staffed = tryCallReissue(late, 'staffed');
    expect(paired.sourceAt).toBe('archive');
    expect(staffed.sourceAt).toBe('door pocket');
    expect(servesCalls(paired.late)).toBe(true);
    expect(servesCalls(staffed.late)).toBe(true);
    expect(servesCalls(paired.otherApproach)).toBe(true);
    expect(servesCalls(staffed.otherApproach)).toBe(false);
    expect(paired.runner).toHaveLength(2);
    expect(staffed.runner).toHaveLength(1);
  });

  it('uses the earned minute and a changed City visit before either equally credited repair is filed', () => {
    const records = [
      ['paired', 'Hang the two directions', 'File the first proof, the change'],
      ['staffed', 'Fit the re-routed lines', 'File the first proof, the changed approach'],
    ] as const;
    const credit = records.map(([mode, install, file]) => {
      const d = new Driver();
      earnMinute(d);
      cross(d, 'copies-door');
      expect(visible(d, 'two-calls-log')).toBeUndefined();
      d.s.objectivesDone.push('copies.revise');
      use(d, 'two-calls-log', 'Clip the dated trial');
      cross(d, 'copies-press-path');
      use(d, 'two-calls-press', 'Check the door pocket');
      expect(visible(d, 'two-calls-proof-board')).toBeUndefined();
      cross(d, 'copies-press-to-landing');
      use(d, 'two-calls-needs', 'Take each request');
      expect(visible(d, 'two-calls-change')).toBeUndefined();
      cross(d, 'copies-landing-to-press');
      expect(visible(d, 'two-calls-proof-board')).toBeDefined();
      const stamp = (flag: string, value: boolean | string | number) => d.run({ type: 'SetFlag', flag: prefix + flag, value });
      stamp('tried', layoutBit(first) | layoutBit(shiftCallLine(first, 0, 1)));
      stamp('first', first.join(','));
      cross(d, 'copies-press-to-landing');
      use(d, 'two-calls-change', 'Take the new routes');
      cross(d, 'copies-landing-to-press');
      stamp('countered', true);
      stamp('paired', servesCalls(tryCallReissue(late, 'paired').late));
      stamp('staffed', late.join(','));
      stamp('plan', mode);
      expect(d.done(prefix + 'adapt')).toBe(true);
      cross(d, 'copies-press-to-landing');
      use(d, `two-calls-receive.${mode}`, install);
      expect(visible(d, `two-calls-landing-${mode}`)).toBeDefined();
      expect(d.done(prefix + 'reply')).toBe(false);
      cross(d, 'copies-landing-return');
      use(d, `two-calls-reply.${mode}`, file);
      expect(d.done(prefix + 'reply')).toBe(true);
      expect(d.s.journal).toContain('j.copies.twocalls.reply');
      expect(visible(d, `two-calls-archive-${mode}`)).toBeDefined();
      expect(d.s.inventory[minute]).toBe(1);
      return d.p.credit;
    });
    expect(credit[1]).toEqual(credit[0]);
  });

  it('does not offer the coda to a reader with no signed Metalworks minute', () => {
    const d = new Driver();
    d.s.mapId = 'copies.archive';
    d.s.objectivesDone.push('copies.revise');
    expect(visible(d, 'two-calls-log')).toBeUndefined();
  });
});
