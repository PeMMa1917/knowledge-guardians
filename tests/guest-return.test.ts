import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { guestInstrument, type Piece } from '../src/domain/lanternInstruments';
import {
  keptTracing,
  lanternEffects,
  lanternRead,
  lanternRef,
  lanternReturnPractice,
  LANTERN_PEOPLE,
  LANTERN_SITES,
  tracingBasis,
  type LanternCommand,
} from '../src/domain/lamplight';
import { apply, emptyOutputs } from '../src/domain/rules';
import { migrateCampaign } from '../src/domain/saves';
import { microSkillId } from '../src/domain/skills';
import { Driver } from './driver';

describe('returning historical work', () => {
  it('can retrieve every guest’s home tracing in each of the fourteen other locations', () => {
    const d = new Driver();
    for (const guest of LANTERN_PEOPLE) {
      const kit = guestInstrument(guest.id)!,
        home = LANTERN_SITES.find((s) => s.id === kit.home)!;
      const ref = lanternRef(home.id, guest.id);
      // One installed copy in an older save. The home state has no new-format receipt yet.
      const earlier = {
        ...d.s,
        mapId: home.map,
        flags: { [ref + '.met']: true, [ref + '.pieces']: '20', [ref + '.trace']: 1, [ref + '.use']: 0 },
      };
      for (const to of LANTERN_SITES.filter((s) => s !== home)) {
        const cmd = { type: 'WorkWithLantern' as const, site: to.id, person: guest.id };
        const base = { ...earlier, mapId: to.map };
        const play = (state: typeof d.s, action: LanternCommand) =>
          apply(lanternEffects(action, state), state, emptyOutputs());
        let state = play(base, { ...cmd, stage: 'meet' });
        state = play(state, { ...cmd, stage: 'recall', from: home.id });
        expect(lanternRead(state, to, guest).pieces).toEqual([2, 0]);
        expect(lanternReturnPractice(state, { ...cmd, stage: 'use', option: 0 })).toBeUndefined();
        state = play(state, { ...cmd, stage: 'pin', piece: 1 });
        state = play(state, { ...cmd, stage: 'trace', option: 0 });
        const hand = { ...cmd, stage: 'use' as const, option: 0 as const };
        state = play(state, hand);
        expect(lanternReturnPractice(state, hand)).toEqual({
          id: microSkillId(kit.practice),
          sig: expect.stringContaining(to.world + '|'),
        });
        expect(keptTracing(state, home, guest)?.value).toBe('1020');
      }
    }
  });
  it.each([true, false])(
    'credits checking the omitted piece whether the original pairing is restored or revised (%s)',
    (restore) => {
      const d = new Driver(),
        [home, away] = LANTERN_SITES,
        guest = LANTERN_PEOPLE[0],
        kit = guestInstrument(guest.id)!;
      const start = { type: 'WorkWithLantern' as const, site: home.id, person: guest.id };
      const next = { ...start, site: away.id },
        id = microSkillId(kit.practice);
      d.run({ ...start, stage: 'meet' });
      for (const from of [away.id, home.id, 'missing'])
        expect(() => d.run({ ...start, stage: 'recall', from })).toThrow();
      for (const piece of [1, 0] as Piece[]) d.run({ ...start, stage: 'pin', piece });
      d.run({ ...start, stage: 'trace', option: 0 });
      d.run({ ...start, stage: 'use', option: 1 });
      const receipt = keptTracing(d.s, home, guest)!;
      d.s.mapId = away.map;
      d.run({ ...next, stage: 'meet' });
      d.run({ ...next, stage: 'recall', from: home.id });
      d.run({ ...next, stage: 'trace', option: 1 });
      d.run({ ...next, stage: 'use', option: 0 });
      const count = (d.p.skills[id] ?? []).length;
      d.run({ ...next, stage: 'pin', piece: 2 });
      if (restore) for (const piece of [1, 0] as Piece[]) d.run({ ...next, stage: 'pin', piece });
      d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
      expect(tracingBasis(d.s, lanternRef(away.id, guest.id))?.value).toBe(receipt.value);
      d.run({ ...next, stage: 'trace', option: 1 });
      d.run({ ...next, stage: 'use', option: 1 });
      d.run({ ...next, stage: 'use', option: 0 });
      expect(d.p.skills[id]).toHaveLength(count + 1);
      expect(d.s.adventureDiary.entries.find((e) => e.event?.key.includes(':recall:'))?.text).toContain(
        home.place,
      );
      expect(keptTracing(d.s, home, guest)?.value).toBe(receipt.value);
      expect(buildPack().skills.some((s) => s.id === id)).toBe(true);
    },
  );
  it('retains a legacy worktable edition before it is revised and a displaced legacy wall copy before its place is used', () => {
    const d = new Driver(),
      site = LANTERN_SITES[0],
      [a, b] = LANTERN_PEOPLE;
    d.s.mapId = site.map;
    const first = lanternRef(site.id, a.id),
      second = lanternRef(site.id, b.id);
    Object.assign(d.s.flags, {
      [first + '.met']: true,
      [first + '.pieces']: '10',
      [first + '.trace']: 0,
      [first + '.use']: 1,
      [second + '.met']: true,
      [second + '.pieces']: '02',
      [second + '.trace']: 1,
      [second + '.use']: 0,
      ['lamplight.' + site.id + '.shown']: b.id + '.1.0.02',
    });
    d.run({ type: 'WorkWithLantern', site: site.id, person: a.id, stage: 'pin', piece: 2 });
    expect(d.s.flags[first + '.receipt']).toBe('0110');
    d.run({ type: 'WorkWithLantern', site: site.id, person: a.id, stage: 'trace', option: 0 });
    d.run({ type: 'WorkWithLantern', site: site.id, person: a.id, stage: 'use', option: 0 });
    expect(d.s.flags[second + '.receipt']).toBe('1002');
  });
});
