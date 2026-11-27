import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { THINKERS } from '../src/domain/thinkers';
import { MAPS } from '../src/maps';
import mozi from '../src/content/thinker-mozi.json';
import haytham from '../src/content/thinker-haytham.json';
import { Driver } from './driver';

/** Thinkers the player meets in the world, each with a three-test quest (X-012, X-015). */
const QUESTS = [
  { key: 'mozi', who: 'mozi', map: 'water.gatehouse', unlock: ['water.response', 'split'], data: mozi, accept: 'three tests',
    picks: ['holds only when', 'saying is right', 'do not agree'] },
  { key: 'haytham', who: 'ibn-al-haytham', map: 'observatory.station', unlock: ['coast.notice', 'signal'], data: haytham, accept: 'Test the manual',
    picks: ['same notch', 'tides', 'finer test'] },
] as const;

function read(d: Driver, map: string, id: string): void {
  const prop = MAPS[map].interactables.find((p) => p.kind === 'sign' && p.id === id);
  if (!prop?.flag || !check(prop.visibleIf, d.s)) throw new Error(`Cannot read ${id} here`);
  d.run({ type: 'SetFlag', flag: prop.flag, value: true });
}

describe.each(QUESTS)('the $who quest', (q) => {
  const tests = MAPS[q.map].interactables.filter((p) => p.kind === 'sign' && p.flag?.startsWith(`thinker.${q.key}.test.`));

  it('appears only after the chapter choice, and the tests appear only after the thinker asks', () => {
    const d = new Driver();
    const npc = MAPS[q.map].npcs.find((n) => n.id === q.who)!;
    expect(check(npc.visibleIf, d.s)).toBe(false);
    d.run({ type: 'SetFlag', flag: q.unlock[0], value: q.unlock[1] });
    expect(check(npc.visibleIf, d.s)).toBe(true);
    expect(tests).toHaveLength(3);
    for (const t of tests) expect(check(t.visibleIf, d.s)).toBe(false);
  });

  it.each(q.picks)('accepts the judgement "%s" with its own reply and completes every step', (pick) => {
    const d = new Driver();
    d.s.mapId = q.map;
    d.run({ type: 'SetFlag', flag: q.unlock[0], value: q.unlock[1] });
    d.talk(q.who, 'Listen', q.accept);
    const thinker = THINKERS.find((t) => t.id === q.who)!;
    expect(d.s.flags[`thinker.${q.who}.met`]).toBe(true);
    for (const v of thinker.views) expect(d.s.flags[`view.${v}.met`], v).toBe(true);
    for (const t of tests) read(d, q.map, t.id);
    d.talk(q.who, pick);
    expect(d.s.flags[`thinker.${q.key}.judged`]).toBeTruthy();
    for (const o of q.data.missions[0].objectives) expect(d.done(o.id), o.id).toBe(true);
  });

  it('labels every line as a reconstruction and gives each step four hints', () => {
    for (const n of q.data.dialogue.filter((x) => x.speaker === q.who)) expect(n.historicalLabel).toBe('reconstruction');
    for (const o of q.data.missions[0].objectives) {
      expect(q.data.hints.filter((h) => h.objective === o.id).map((h) => h.depth)).toEqual([1, 2, 3, 4]);
    }
  });
});
