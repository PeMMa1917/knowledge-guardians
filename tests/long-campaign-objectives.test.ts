import { describe, expect, it } from 'vitest';
import { Driver } from './driver';
import { Engine } from '../src/domain/engine';
import { check } from '../src/domain/rules';
import { threadKey } from '../src/domain/trailThread';
import type { Condition } from '../src/domain/types';

describe('Objective lookups on a travelled campaign', () => {
  it('keeps the guide’s pin, main-story and earliest-visible order on a fresh save, a late save and a rewind', () => {
    const d = new Driver();
    const goals = d.e.pack.missions.flatMap((m) => m.objectives.map((o) => o.id));
    for (const count of [0, 1000, 3000, 6, goals.length]) {
      const s = { ...d.s, objectivesDone: goals.slice(0, count), flags: { ...d.s.flags } };
      const available = d.e.pack.missions
        .filter((m) => check(m.available, s))
        .flatMap((m) =>
          m.objectives
            .filter((o) => !s.objectivesDone.includes(o.id) && check(o.visible, s))
            .map((o) => ({ ...o, mission: m, complete: false })),
        );
      const main = available.filter((o) => /-M\d+$/.test(o.mission.id));
      for (const pin of [false, 'a hidden or completed step', available.at(-1)?.id ?? false]) {
        s.flags[threadKey] = pin;
        expect(d.e.currentObjective(s)).toEqual(
          available.find((o) => o.id === pin) ??
            main.find((o) => o.essential) ??
            main[0] ??
            available[0] ??
            null,
        );
      }
    }
  });
  it('unlocks a mission in the next pass after two earlier completions and leaves the input snapshot alone', () => {
    const d = new Driver(),
      trigger = 'followup.open';
    const has = (objective: string): Condition => ({ objective });
    const seed = { ...d.s, objectivesDone: Array.from({ length: 2000 }, (_, i) => 'older.' + i) };
    const base = d.e.pack.missions[0];
    const goal = (id: string, done: Condition) => ({ id, title: id, essential: false, done });
    const e = new Engine({
      ...d.e.pack,
      missions: [
        {
          ...base,
          id: 'latest',
          available: { all: [has('second'), { not: has('third') }] },
          objectives: [goal('third', has('second'))],
        },
        {
          ...base,
          id: 'early',
          available: undefined,
          objectives: [
            goal('first', { flag: trigger, eq: true }),
            goal('second', { any: [has('missing'), has('first')] }),
          ],
        },
      ],
    });
    seed.flags = { ...seed.flags, [trigger]: true };
    const out = e.dispatch({ type: 'InspectExhibit', exhibit: 'OBJ-001-A' }, seed, d.p);
    expect(out.state.objectivesDone.slice(-3)).toEqual(['first', 'second', 'third']);
    expect(out.events.filter((it) => it.kind === 'objective').map((it) => it.id)).toEqual([
      'first',
      'second',
      'third',
    ]);
    expect(seed.objectivesDone).toHaveLength(2000);
    const second = e.dispatch({ type: 'InspectExhibit', exhibit: 'OBJ-001-A' }, out.state, out.permanent);
    expect(second.events.some((it) => it.kind === 'objective')).toBe(false);
  });
});
