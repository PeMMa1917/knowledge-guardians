import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import data from '../src/content/thinker-mozi.json';
import { Driver } from './driver';

const MAP = 'water.gatehouse';
const TESTS = ['mozi-test-past', 'mozi-test-people', 'mozi-test-use'];

function read(d: Driver, id: string): void {
  const prop = MAPS[MAP].interactables.find((p) => p.kind === 'sign' && p.id === id);
  if (!prop?.flag || !check(prop.visibleIf, d.s)) throw new Error(`Cannot read ${id} here`);
  d.run({ type: 'SetFlag', flag: prop.flag, value: true });
}

function start(): Driver {
  const d = new Driver();
  d.s.mapId = MAP;
  d.run({ type: 'SetFlag', flag: 'water.response', value: 'split' });
  return d;
}

describe('Mozi, the first thinker the player meets in the world (X-012, X-015)', () => {
  it('appears only after the gate choice, and the tests appear only after he asks', () => {
    const d = new Driver();
    const npc = MAPS[MAP].npcs.find((n) => n.id === 'mozi')!;
    expect(check(npc.visibleIf, d.s)).toBe(false);
    d.s.mapId = MAP;
    d.run({ type: 'SetFlag', flag: 'water.response', value: 'fields' });
    expect(check(npc.visibleIf, d.s)).toBe(true);
    expect(() => read(d, 'mozi-test-past')).toThrow();
  });

  it.each(['holds only when', 'saying is right', 'do not agree'])('accepts the judgement "%s" with its own reply', (pick) => {
    const d = start();
    d.talk('mozi', 'Listen', 'three tests');
    expect(d.s.flags['view.pragmatic.met']).toBe(true);
    expect(d.s.flags['view.consequences.met']).toBe(true);
    for (const id of TESTS) read(d, id);
    d.talk('mozi', pick);
    expect(d.s.flags['thinker.mozi.judged']).toBeTruthy();
    for (const o of data.missions[0].objectives) expect(d.done(o.id), o.id).toBe(true);
  });

  it('labels every Mozi line as a reconstruction and gives each objective four hints', () => {
    for (const n of data.dialogue.filter((x) => x.speaker === 'mozi')) expect(n.historicalLabel).toBe('reconstruction');
    for (const o of data.missions[0].objectives) {
      expect(data.hints.filter((h) => h.objective === o.id).map((h) => h.depth)).toEqual([1, 2, 3, 4]);
    }
  });
});
