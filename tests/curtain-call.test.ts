import { describe, expect, it } from 'vitest';
import { CURTAIN_REWARD, curtainCallEntries } from '../src/content/curtainCall';
import { curtainCall, type CallStation } from '../src/domain/curtainCall';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

function prop(d: Driver, id: string) {
  return MAPS[d.s.mapId].interactables.find((entry) => entry.id === id && check(entry.visibleIf, d.s));
}

function knock(d: Driver, station: CallStation, index: number) {
  return d.run({ type: 'ChooseDialogueOption', node: `curtain.run.${station}`, index });
}

describe('The Call behind the Curtain', () => {
  it('holds the same three sends still while hearing changes or a visible channel is added', () => {
    for (const station of ['open', 'curtain', 'marks', 'felt'] as const) {
      expect(curtainCall(station, 3).map(({ knocked }) => knocked)).toEqual([true, true, true]);
    }
    expect(curtainCall('curtain', 3).map(({ heard }) => heard)).toEqual([true, false, true]);
    expect(curtainCall('marks', 3).map(({ heard }) => heard)).toEqual([true, false, true]);
    expect(curtainCall('marks', 3).map(({ marker }) => marker)).toEqual([true, true, true]);
    expect(curtainCall('felt', 3).map(({ heard }) => heard)).toEqual([true, true, true]);
  });

  it.each([['marks', 'Copy the stand number'], ['felt', 'Clip a blank page']] as const)(
    'brings the %s gift from an early Nexus opening to its own Nile response', (mode, opening) => {
      const d = new Driver();
      d.walk('cold.open', [opening]);
      const original = d.s.flags['nexus.arrival.note'];
      expect(d.s.objectivesDone.includes('m01.o1.look')).toBe(false);
      expect(prop(d, 'curtain-call-open')).toBeUndefined();
      d.talk('curtain-ethren', 'Mark the two places');
      expect(d.e.talkEntry('curtain-ethren', d.s)).not.toBe('curtain.plan');
      for (const station of ['open', 'curtain'] as const) {
        expect(curtainCallEntries(prop(d, `curtain-call-${station}`)!.game!)).toContain(`curtain.run.${station}`);
        for (const step of [0, 1, 2]) knock(d, station, step);
      }
      expect(d.done('curtain.compare')).toBe(true);
      knock(d, 'open', 3);
      knock(d, 'open', 0);
      expect(d.e.talkEntry('curtain-ethren', d.s)).toBe('curtain.plan');
      d.talk('curtain-ethren', mode === 'marks' ? 'Set three visible' : 'Slide a pad');
      d.walk(prop(d, 'curtain-end-' + mode)!.node!, ['Wait with Ethren']);
      d.walk(prop(d, 'curtain-gift-' + mode)!.node!, ['Take the spare']);
      expect(prop(d, 'curtain-gift-' + mode)).toBeUndefined();
      expect(d.s.flags['nexus.arrival.note']).toBe(original);
      expect(d.s.inventory[CURTAIN_REWARD[mode].id]).toBe(1);
      d.s.mapId = 'nile.workyard';
      expect(prop(d, 'curtain-call-' + (mode === 'marks' ? 'felt' : 'marks'))).toBeUndefined();
      expect(prop(d, 'curtain-call-' + mode)).toBeDefined();
      expect(() => knock(d, mode, 4)).toThrow(/not available/);
      for (const step of [0, 1, 2, 4]) knock(d, mode, step);
      expect(d.done('curtain.workmen')).toBe(true);
      expect(prop(d, 'curtain-workmen-' + mode)).toBeDefined();
      expect(d.p.awards['award.curtain.keeper']).toBeTruthy();
    },
  );
});
